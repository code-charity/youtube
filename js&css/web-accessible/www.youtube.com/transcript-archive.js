/*------------------------------------------------------------------------------
TRANSCRIPT ARCHIVE (WATCH PAGE)
--------------------------------------------------------------------------------
	Archives the captions of videos that are watched so they can be searched
	later, and keeps a viewing log of the videos that were played.

	When enabled, it also archives the captions of related videos and of the
	subscription feed, and it can store downscaled player frames as a watching
	diary (using the same frame capture as the existing screenshot feature).

	The data handling and the search index live in js&css/transcript-archive.js
	so the extension menu can use them without the content-script bridge.
------------------------------------------------------------------------------*/
(function () {
	var library = typeof ImprovedTubeTranscriptArchive !== 'undefined' ? ImprovedTubeTranscriptArchive : null;

	if (!library || typeof ImprovedTube === 'undefined') {
		return;
	}

	var SAVE_DELAY = 15000;
	var TICK_DELAY = 1000;
	var FETCH_COOLDOWN = 10 * 60 * 1000;
	var MIN_LOG_SECONDS = 2;

	// Watching diary frames: one every minute of playback, downscaled.
	var FRAME_INTERVAL = 60000;
	var FRAME_MIN_GAP = 5;
	var FRAME_MAX_WIDTH = 480;
	var FRAME_QUALITY = 0.6;

	ImprovedTube.transcriptArchive = {
		library: library,

		SAVE_DELAY: SAVE_DELAY,
		TICK_DELAY: TICK_DELAY,
		FETCH_COOLDOWN: FETCH_COOLDOWN,
		FRAME_INTERVAL: FRAME_INTERVAL,
		FRAME_MIN_GAP: FRAME_MIN_GAP,
		FRAME_MAX_WIDTH: FRAME_MAX_WIDTH,

		attached_video: null,
		captionInterceptorInstalled: false,
		counted: false,
		diary: null,
		diary_id: '',
		dirty: false,
		entry: null,
		fetch_attempts: {},
		handlers: null,
		last_frame_at: 0,
		last_frame_time: -1,
		last_time: null,
		meta: null,
		pauses: [],
		pending_heatmap: null,
		pending_metrics: null,
		pending_segments: null,
		pending_views: 0,
		save_timer: null,
		session: null,
		store: null,
		tick_timer: null,
		video_id: '',
		watched: [],

		enabled: function () {
			return ImprovedTube.storage.archive_transcripts === true;
		},

		logEnabled: function () {
			return ImprovedTube.storage.record_viewing_log === true;
		},



		diaryEnabled: function () {
			return ImprovedTube.storage.auto_screenshot === true;
		},

		active: function () {
			return this.enabled() || this.logEnabled() || this.diaryEnabled();
		},

		// Zero means unlimited, which is the default.
		limit: function () {
			var value = Number(ImprovedTube.storage.archive_storage_limit);

			return isFinite(value) && value > 0 ? Math.round(value) : 0;
		},

		// Zero means no byte budget, which is the default.
		budget: function () {
			var value = Number(ImprovedTube.storage.archive_storage_budget);

			return isFinite(value) && value > 0 ? value * library.MEGABYTE : 0;
		},

		pageType: function () {
			return document.documentElement.dataset.pageType || '';
		},


		video: function () {
			return ImprovedTube.elements.video || document.querySelector('#movie_player video');
		},

		duration: function () {
			var video = this.video(),
				duration = video && video.duration;

			return typeof duration === 'number' && isFinite(duration) && duration > 0 ? duration : 0;
		},

		currentVideoId: function () {
			var match = ImprovedTube.regex.video_id.exec(location.href);

			return match ? match[1] : '';
		},

		adShowing: function () {
			var player = ImprovedTube.elements.player;

			return !!player && /ad-showing|ad-interrupting/.test(player.className);
		},

		/*--------------------------------------------------------------
		# START / STOP
		--------------------------------------------------------------*/

		init: function () {
			if (!this.active()) {
				this.disable();

				return;
			}

			if (!this.store && this.enabled()) {
				this.store = this.readStore();
			}

			this.installCaptionInterceptor();

			clearInterval(this.tick_timer);

			var self = this;

			this.tick_timer = setInterval(function () { self.tick(); }, this.TICK_DELAY);

			this.tick();
		},

		disable: function () {
			clearInterval(this.tick_timer);

			this.tick_timer = null;

			this.save();
			this.flushSession();
			this.detach();

			this.entry = null;
			this.store = null;
			this.diary = null;
			this.diary_id = '';
			this.video_id = '';
			this.last_time = null;
			this.counted = false;
			this.dirty = false;
		},

		tick: function () {
			if (!this.active()) {
				this.disable();

				return;
			}

			// The subscription feed has no player, so it gets its own scan.
			if (this.pageType() !== 'video' && this.pageType() !== 'embed') {
				return;
			}

			var video_id = this.currentVideoId();

			if (!video_id) {
				this.save();
				this.flushSession();

				// Returning to the same video later must start a fresh load.
				this.video_id = '';
				this.entry = null;
				this.last_time = null;
				this.counted = false;
				this.dirty = false;

				return;
			}

			if (video_id !== this.video_id) {
				this.load(video_id);
			}

			var video = this.video();

			if (!video) {
				return;
			}

			this.attach(video);

			if (this.logEnabled() && !this.session) {
				this.startSession();
			}

			this.track();
			this.capture(video_id);
			this.captureDiary(video);
		},

		load: function (video_id) {
			// Flush the previous video before its id is replaced.
			this.save();
			this.flushSession();

			this.video_id = video_id;
			this.last_time = null;
			this.last_frame_at = 0;
			this.last_frame_time = -1;
			this.counted = false;
			this.dirty = false;
			this.watched = [];
			this.pauses = [];
			this.pending_segments = null;
			this.pending_heatmap = null;
			this.pending_metrics = null;
			this.pending_views = 0;
			this.meta = null;

			if (this.enabled()) {
				var store = this.readStore(),
					entry = store[video_id];

				this.store = store;
				this.entry = entry || library.sanitizeEntry({}, video_id);
			} else {
				this.store = null;
				this.entry = null;
			}

			this.loadDiary();

			this.startSession();
			this.updateMetadata(null, this.video());
		},

		startSession: function () {
			if (!this.logEnabled()) {
				this.session = null;

				return;
			}

			var video = this.video(),
				time = video && isFinite(video.currentTime) ? Math.max(0, video.currentTime) : 0;

			this.session = {
				at: Date.now(),
				from: time,
				to: time,
				sec: 0,
				pauses: 0,
				video_id: this.video_id
			};
		},

		flushSession: function () {
			var session = this.session;

			this.session = null;

			if (!session || !this.logEnabled() || session.video_id !== this.video_id) {
				return;
			}

			if (session.sec < MIN_LOG_SECONDS) {
				return;
			}

			var log = this.readLog();

			log = library.appendLog(log, {
				v: session.video_id,
				t: this.meta && this.meta.title || '',
				c: this.meta && this.meta.channel || '',
				at: session.at,
				end: Date.now(),
				from: session.from,
				to: session.to,
				sec: session.sec,
				pauses: session.pauses
			}, this.limit());

			ImprovedTube.storage[library.LOG_KEY] = log;

			this.send(library.LOG_KEY, log);
		},

		/*--------------------------------------------------------------
		# CONNECTION TO THE VIDEO
		--------------------------------------------------------------*/

		attach: function (video) {
			if (this.attached_video === video) {
				return;
			}

			var self = this;

			if (!this.handlers) {
				this.handlers = {
					play: function () { self.countView(); },
					pause: function () {
						self.last_time = null;
						self.recordPause();
						self.save();
					},
					seeking: function () { self.last_time = null; },
					ended: function () {
						self.last_time = null;
						self.flushSession();
						self.save();
					},
					timeupdate: function () { self.track(); }
				};

				window.addEventListener('pagehide', function () {
					self.flushSession();
					self.save();
				});

				document.addEventListener('visibilitychange', function () {
					if (document.visibilityState === 'hidden') {
						self.flushSession();
						self.save();
					}
				});
			}

			this.detach();

			for (var type in this.handlers) {
				video.addEventListener(type, this.handlers[type]);
			}

			this.attached_video = video;
		},

		detach: function () {
			if (!this.attached_video || !this.handlers) {
				return;
			}

			for (var type in this.handlers) {
				this.attached_video.removeEventListener(type, this.handlers[type]);
			}

			this.attached_video = null;
		},

		/*--------------------------------------------------------------
		# PLAYBACK TRACKING
		--------------------------------------------------------------*/

		countView: function () {
			if (!this.enabled() || this.counted || !this.video_id) {
				return;
			}

			this.counted = true;
			this.pending_views = 1;
			this.dirty = true;

			this.saveSoon();
		},

		track: function () {
			var video = this.attached_video;

			if (!video || !this.duration() || this.adShowing()) {
				this.last_time = null;

				return;
			}

			var previous = this.last_time,
				time = video.currentTime;

			this.last_time = time;

			if (previous === null || video.paused || video.seeking) {
				return;
			}

			var step = time - previous,
				limit = 5 * Math.max(1, video.playbackRate || 1);

			if (step <= 0 || step > limit) {
				return;
			}

			if (!this.counted) {
				this.countView();
			}

			// The viewing log is independent from the transcript archive.
			if (this.session) {
				this.session.to = time;
				this.session.sec += step;
			}

			if (!this.enabled()) {
				return;
			}

			library.addWatched(this.watched, previous, time, 1);
			this.dirty = true;

			this.saveSoon();
		},

		recordPause: function () {
			if (!this.video_id || this.adShowing()) {
				return;
			}

			var video = this.attached_video,
				time = video && isFinite(video.currentTime) ? video.currentTime : 0;

			if (this.session) {
				this.session.pauses++;
			}

			if (!this.enabled()) {
				return;
			}

			this.pauses.push([Math.max(0, Math.round(time)), 1]);
			this.dirty = true;
		},

		/*--------------------------------------------------------------
		# METADATA / TRANSCRIPT
		--------------------------------------------------------------*/

		updateMetadata: function (response, video) {
			var details = response && response.videoDetails || {},
				video_id = this.video_id,
				title = details.title || (ImprovedTube.videoTitle && ImprovedTube.videoTitle()) || document.title || '',
				channel_element = document.querySelector('.ytd-channel-name a') || document.querySelector('#upload-info .ytd-channel-name'),
				channel = details.author || (channel_element ? channel_element.textContent.trim() : ''),
				duration = Number(details.lengthSeconds) || (video && video.duration) || 0,
				previous = this.meta;

			title = String(title).replace(/\s*-\s*YouTube$/, '').trim();

			this.meta = {
				title: title,
				channel: channel,
				channel_id: details.channelId || '',
				duration: isFinite(duration) && duration > 0 ? duration : 0,
				language: previous && previous.language || ''
			};

			if (details.viewCount !== undefined) {
				this.pending_metrics = {
					views: Math.max(0, Number(details.viewCount) || 0),
					likes: 0
				};

				this.dirty = true;
			}

			var heatmap = this.findHeatmap(response);

			if (heatmap && heatmap.length) {
				this.pending_heatmap = heatmap;
				this.dirty = true;
			}

			if (!video_id) {
				this.dirty = false;
			}
		},

		findHeatmap: function (response) {
			var markers = null;

			function walk(object, depth) {
				if (markers || !object || typeof object !== 'object' || depth > 15) {
					return;
				}

				if (object.markerType === 'MARKER_TYPE_HEATMAP' && Array.isArray(object.markers)) {
					markers = object.markers;

					return;
				}

				if (object.key === 'MARKER_TYPE_HEATMAP' && object.value && Array.isArray(object.value.markers)) {
					markers = object.value.markers;

					return;
				}

				for (var key in object) {
					if (Object.prototype.hasOwnProperty.call(object, key)) {
						walk(object[key], depth + 1);

						if (markers) {
							return;
						}
					}
				}
			}

			walk(response, 0);

			if (!markers) {
				return null;
			}

			return library.sanitizeHeatmap(markers.map(function (marker) {
				return {
					start: Number(marker.startMillis || 0) / 1000,
					duration: Number(marker.durationMillis || 0) / 1000,
					score: Number(marker.intensityScoreNormalized || 0)
				};
			}));
		},

		getPlayerResponse: function (video_id) {
			var player = document.getElementById('movie_player') || ImprovedTube.elements.player,
				response = null;

			try {
				response = player && typeof player.getPlayerResponse === 'function' ? player.getPlayerResponse() : null;
			} catch (error) {
				response = null;
			}

			if (!this.belongsToVideo(response, video_id)) {
				response = null;
			}

			if (!response && this.belongsToVideo(window.ytInitialPlayerResponse, video_id)) {
				response = window.ytInitialPlayerResponse;
			}

			return response;
		},

		belongsToVideo: function (response, video_id) {
			if (!response || typeof response !== 'object') {
				return false;
			}

			var id = response.videoDetails && response.videoDetails.videoId
				|| response.currentVideoEndpoint && response.currentVideoEndpoint.watchEndpoint && response.currentVideoEndpoint.watchEndpoint.videoId
				|| response.endpoint && response.endpoint.watchEndpoint && response.endpoint.watchEndpoint.videoId;

			return !id || id === video_id;
		},

		capture: function (video_id) {
			if (!this.enabled() || !this.counted || !video_id) {
				return;
			}

			var last_attempt = this.fetch_attempts[video_id] || 0;

			if (Date.now() - last_attempt < this.FETCH_COOLDOWN) {
				return;
			}

			var response = this.getPlayerResponse(video_id);

			if (!response) {
				return;
			}

			this.fetch_attempts[video_id] = Date.now();
			this.updateMetadata(response, this.video());

			var entry = this.entry,
				has_segments = this.pending_segments && this.pending_segments.length || entry && entry.segments && entry.segments.length;

			if (has_segments) {
				return;
			}

			var panel_segments = this.readPanel();

			if (panel_segments.length) {
				this.storeTranscript(panel_segments, '');

				return;
			}

			var track = library.captionTrack(response),
				url = library.captionUrl(track, location.origin);

			if (!track || !url) {
				return;
			}

			var self = this;

			this.fetchTrack(track, function (segments) {
				self.storeTranscript(segments, track.languageCode || '');
			});
		},

		// JSON3 is the compact format, but YouTube sometimes returns an empty
		// body for it and still serves the track's original format. Try that
		// once before giving up, so captions are not lost.
		// The player fetches caption tracks with its own proof-of-origin token,
		// so intercepting those responses is the reliable way to get cues.
		installCaptionInterceptor: function () {
			if (this.captionInterceptorInstalled) {
				return;
			}

			this.captionInterceptorInstalled = true;

			var self = this;

			function handle(url, text) {
				if (!self.enabled() || !self.video_id || !text || !/timedtext/i.test(url)) {
					return;
				}

				var segments = self.parseTimedText(text);

				if (!segments.length) {
					return;
				}

				var language = '';

				try {
					language = new URL(url, location.href).searchParams.get('lang') || '';
				} catch (error) {
					language = '';
				}

				self.storeTranscript(segments, language);
			}

			if (typeof window.fetch === 'function') {
				var originalFetch = window.fetch;

				window.fetch = function () {
					var request = arguments[0],
						url = typeof request === 'string' ? request : (request && request.url) || '';

					return originalFetch.apply(this, arguments).then(function (response) {
						if (/timedtext/i.test(url) && response && typeof response.clone === 'function') {
							response.clone().text().then(function (text) {
								handle(url, text);
							}).catch(function () {});
						}

						return response;
					});
				};
			}

			var XHR = window.XMLHttpRequest;

			if (XHR && XHR.prototype) {
				var originalOpen = XHR.prototype.open,
					originalSend = XHR.prototype.send;

				XHR.prototype.open = function (method, url) {
					this._it_timedtext_url = url;

					return originalOpen.apply(this, arguments);
				};

				XHR.prototype.send = function () {
					var xhr = this;

					xhr.addEventListener('load', function () {
						if (xhr._it_timedtext_url && /timedtext/i.test(xhr._it_timedtext_url)) {
							handle(xhr._it_timedtext_url, xhr.responseText);
						}
					});

					return originalSend.apply(this, arguments);
				};
			}
		},

		fetchTrack: function (track, callback) {
			var self = this,
				json_url = library.captionUrl(track, location.origin),
				raw_url = library.captionUrl(track, location.origin, null);

			function attempt(url) {
				if (!url) {
					return Promise.resolve([]);
				}

				return fetch(url).then(function (response) {
					return response.ok ? response.text() : '';
				}).then(function (text) {
					return text ? self.parseTimedText(text) : [];
				}).catch(function () {
					return [];
				});
			}

			attempt(json_url).then(function (segments) {
				if (segments.length || raw_url === json_url) {
					return segments;
				}

				return attempt(raw_url);
			}).then(function (segments) {
				if (segments.length) {
					callback(segments);
				}
			});
		},

		readPanel: function () {
			if (typeof ImprovedTube.readTranscriptSegments !== 'function') {
				return [];
			}

			try {
				return library.sanitizeSegments(ImprovedTube.readTranscriptSegments());
			} catch (error) {
				return [];
			}
		},

		parseTimedText: function (text) {
			var value = String(text || '').trim();

			if (!value) {
				return [];
			}

			if (value.charAt(0) === '{' || value.charAt(0) === '[') {
				return library.parseJson3(value);
			}

			var segments = [];

			try {
				var nodes = new DOMParser().parseFromString(value, 'text/xml').querySelectorAll('text');

				nodes.forEach(function (node) {
					var text = node.textContent.replace(/\s+/g, ' ').trim(),
						start = parseFloat(node.getAttribute('start') || '0');

					if (text && isFinite(start)) {
						segments.push({ t: start, text: text });
					}
				});
			} catch (error) {
				segments = [];
			}

			return library.sanitizeSegments(segments);
		},

		storeTranscript: function (segments, language) {
			var sanitized = library.sanitizeSegments(segments);

			if (!sanitized.length) {
				return;
			}

			this.pending_segments = sanitized;

			if (language && this.meta) {
				this.meta.language = language;
			}

			this.dirty = true;

			this.save();
		},

		/*--------------------------------------------------------------
		# WATCHING DIARY
		--------------------------------------------------------------*/

		loadDiary: function () {
			if (!this.diaryEnabled() || !this.video_id) {
				this.diary = null;
				this.diary_id = '';

				return;
			}

			this.diary_id = this.video_id;
			this.diary = library.sanitizeDiary(ImprovedTube.storage[library.DIARY_KEY_PREFIX + this.video_id]);
		},

		captureDiary: function (video) {
			if (!this.diaryEnabled() || !this.video_id || this.adShowing()) {
				return;
			}

			if (!video || video.paused || video.readyState < 2 || !video.videoWidth) {
				return;
			}

			var now = Date.now(),
				time = video.currentTime;

			if (now - this.last_frame_at < FRAME_INTERVAL) {
				return;
			}

			if (this.last_frame_time >= 0 && Math.abs(time - this.last_frame_time) < FRAME_MIN_GAP) {
				return;
			}

			if (typeof ImprovedTube.captureFrame !== 'function') {
				return;
			}

			var canvas = ImprovedTube.captureFrame({ maxWidth: FRAME_MAX_WIDTH });

			if (!canvas) {
				return;
			}

			this.last_frame_at = now;
			this.last_frame_time = time;

			var data;

			try {
				data = canvas.toDataURL('image/jpeg', FRAME_QUALITY);
			} catch (error) {
				return;
			}

			if (this.diary_id !== this.video_id || !this.diary) {
				this.loadDiary();
			}

			this.diary = library.appendDiaryFrame(this.diary, {
				t: time,
				at: now,
				data: data
			}, FRAME_MIN_GAP);

			var key = library.DIARY_KEY_PREFIX + this.video_id;

			ImprovedTube.storage[key] = this.diary;
			this.send(key, this.diary);

			this.saveDiaryIndex(now);
		},

		saveDiaryIndex: function (now) {
			var meta = this.meta || {},
				frames = this.diary && this.diary.frames || [],
				index = library.sanitizeDiaryIndex(ImprovedTube.storage[library.DIARY_KEY]),
				before = Object.keys(index);

			if (!frames.length) {
				return;
			}

			index = library.updateDiaryIndex(index, {
				id: this.video_id,
				title: meta.title || '',
				channel: meta.channel || '',
				duration: meta.duration || 0,
				at: now,
				frames: frames.length,
				from: frames[0].t,
				to: frames[frames.length - 1].t,
				thumb: frames[0].data
			});

			index = library.pruneDiaryIndex(index, this.limit());

			before.forEach(function (id) {
				if (!index[id]) {
					ImprovedTube.transcriptArchive.send(library.DIARY_KEY_PREFIX + id, null);
				}
			});

			ImprovedTube.storage[library.DIARY_KEY] = index;
			this.send(library.DIARY_KEY, index);
		},

		/*--------------------------------------------------------------
		# STORAGE
		--------------------------------------------------------------*/

		onStorageChanged: function (key, value) {
			if (key === library.STORAGE_KEY) {
				// The menu can delete the archive while this tab keeps a local
				// copy for pending writes. A removal/empty value wins.
				if (!value || typeof value !== 'object' || Object.keys(value).length === 0) {
					this.store = {};

					if (this.video_id) {
						this.entry = library.sanitizeEntry({}, this.video_id);
					}
				}

				return;
			}

			if (key === library.DIARY_KEY && this.diary_id) {
				if (!value || typeof value !== 'object' || !value[this.diary_id]) {
					this.diary = null;
				}

				return;
			}

			if (key === library.DIARY_KEY_PREFIX + this.diary_id) {
				this.diary = library.sanitizeDiary(value);
			}
		},

		readStore: function () {
			var raw = ImprovedTube.storage[library.STORAGE_KEY],
				local = this.store;

			// Reuse the already sanitized local copy and only sanitize entries
			// that arrived from storage (another tab or the menu).
			if (local && typeof local === 'object' && Object.keys(local).length) {
				if (raw && typeof raw === 'object') {
					Object.keys(raw).forEach(function (id) {
						var current = local[id];

						if (!current || (raw[id] && raw[id].updated > current.updated)) {
							local[id] = library.sanitizeEntry(raw[id], id);
						}
					});
				}

				return local;
			}

			return library.sanitizeStore(raw);
		},

		readLog: function () {
			var log = ImprovedTube.storage[library.LOG_KEY];

			return Array.isArray(log) ? log : [];
		},

		send: function (key, value) {
			ImprovedTube.messages.send({
				action: 'set',
				key: key,
				value: value
			});
		},

		scheduleSave: function () {
			if (this.save_timer) {
				return;
			}

			var self = this;

			this.save_timer = setTimeout(function () { self.save(); }, this.SAVE_DELAY);
		},

		saveSoon: function () {
			if (!this.save_timer) {
				this.scheduleSave();
			}
		},

		save: function () {
			clearTimeout(this.save_timer);

			this.save_timer = null;

			if (!this.video_id) {
				return;
			}

			var has_data = this.dirty
				|| this.pending_views > 0
				|| this.pending_segments
				|| this.pending_heatmap
				|| this.pending_metrics
				|| this.watched.length
				|| this.pauses.length;

			if (!has_data) {
				return;
			}

			var meta = this.meta || {},
				store = this.readStore(),
				entry = library.recordView(store, {
					videoId: this.video_id,
					title: meta.title,
					channel: meta.channel,
					channel_id: meta.channel_id,
					duration: meta.duration,
					language: meta.language,
					increment_views: this.pending_views > 0,
					source: 'watched',
					watched: this.watched,
					pauses: this.pauses,
					segments: this.pending_segments,
					heatmap: this.pending_heatmap,
					metrics: this.pending_metrics,
					maxVideos: this.limit(),
					maxBytes: this.budget()
				});

			if (!entry) {
				return;
			}

			this.store = store;
			this.entry = entry;
			this.pending_views = 0;
			this.pending_segments = null;
			this.pending_heatmap = null;
			this.pending_metrics = null;
			this.watched = [];
			this.pauses = [];
			this.dirty = false;

			ImprovedTube.storage[library.STORAGE_KEY] = store;

			this.send(library.STORAGE_KEY, store);
		}
	};
})();
