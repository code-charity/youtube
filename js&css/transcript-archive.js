/*--------------------------------------------------------------
>>> TRANSCRIPT ARCHIVE
----------------------------------------------------------------
	Shared, DOM-free helpers for the transcript archive.

	The content script archives the captions of videos that are
	watched, and this file contains the data handling and the search
	index that both the content script and the extension menu use:

	# Data
	# Eviction
	# Matching
	# Ranking
	# Search
	# Nearby videos
	# Watching diary

	Storage layout (chrome.storage.local):

	transcript_archive = {
		<video id>: {
			id, title, channel, channel_id, duration, language,
			updated, views, source,
			watched: [[start, end], ...],
			pauses: [[time, count], ...],
			heatmap: [{start, duration, score}, ...],
			metrics: {views, likes},
			segments: [{t, text}, ...]
		}
	}

		`source` is `watched`, `related` or `subscription`, so the menu can
		tell videos the user watched apart from videos that were only
		archived from a recommendation.

	viewing_log = [{
		v: <video id>, t: title, c: channel,
		at: <started timestamp>, end: <last timestamp>,
		from: <first watched second>, to: <last watched second>,
		sec: <seconds actually watched>, pauses: <pause count>
	}, ...]

	watching_diary = {
		<video id>: {id, title, channel, duration, at, frames, from, to}
	}

	watching_diary_<video id> = {
		id, frames: [{t, at, data}, ...]
	}

		`data` is a downscaled JPEG data URL of the player frame, captured
		with the same canvas code as the existing screenshot feature.

	There is no fixed cap by default (UNLIMITED = 0). When the user sets a
	limit, whole videos are dropped newest-first. A byte budget drops the
	least relevant videos first, so watched, rewatched and long-watched
	entries survive the longest.
--------------------------------------------------------------*/

(function (root, factory) {
	var library = factory();

	if (typeof module === 'object' && module.exports) {
		module.exports = library;
	}

	if (root) {
		root.ImprovedTubeTranscriptArchive = library;
	}
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
	'use strict';

	var STORAGE_KEY = 'transcript_archive';
	var LOG_KEY = 'viewing_log';
	var DIARY_KEY = 'watching_diary';
	var DIARY_KEY_PREFIX = 'watching_diary_';
	var UNLIMITED = 0;
	var MAX_VIDEOS = UNLIMITED;
	var MAX_LOG_ENTRIES = UNLIMITED;
	var MAX_SEGMENTS = 20000;
	var PAUSE_WINDOW = 10;
	var DIARY_MIN_GAP = 5;
	var MEGABYTE = 1024 * 1024;

	/*--------------------------------------------------------------
	# HELPERS
	--------------------------------------------------------------*/

	function isObject(value) {
		return !!value && typeof value === 'object' && !Array.isArray(value);
	}

	function number(value, fallback) {
		var parsed = Number(value);

		return isFinite(parsed) ? parsed : fallback;
	}

	function clamp(value, min, max) {
		return Math.min(max, Math.max(min, value));
	}

	function normalize(text) {
		var value = String(text === null || text === undefined ? '' : text);

		if (value.normalize) {
			value = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
		}

		return value.toLowerCase().replace(/\s+/g, ' ').trim();
	}

	function tokenize(query) {
		var seen = {},
			tokens = [];

		normalize(query).split(/[^\p{L}\p{N}]+/u).forEach(function (token) {
			if (token && !seen[token]) {
				seen[token] = true;
				tokens.push(token);
			}
		});

		return tokens;
	}

	function parseTime(value) {
		if (typeof value === 'number') {
			return isFinite(value) && value >= 0 ? value : null;
		}

		if (typeof value !== 'string') {
			return null;
		}

		var parts = value.trim().split(':').map(function (part) {
			return parseInt(part, 10);
		});

		if (parts.some(function (part) { return isNaN(part); })) {
			return null;
		}

		if (parts.length === 2) {
			return parts[0] * 60 + parts[1];
		}

		if (parts.length === 3) {
			return parts[0] * 3600 + parts[1] * 60 + parts[2];
		}

		if (parts.length === 1) {
			return parts[0];
		}

		return null;
	}

	// chrome.storage stores JSON, so the UTF-8 length of the serialized
	// value is a good estimate of how much room an entry takes.
	function byteLength(value) {
		var text = String(value === null || value === undefined ? '' : value),
			bytes = 0;

		for (var i = 0, l = text.length; i < l; i++) {
			var code = text.charCodeAt(i);

			if (code < 0x80) {
				bytes += 1;
			} else if (code < 0x800) {
				bytes += 2;
			} else if (code >= 0xd800 && code <= 0xdbff && i + 1 < l) {
				bytes += 4;
				i++;
			} else {
				bytes += 3;
			}
		}

		return bytes;
	}

	function entrySize(entry) {
		return byteLength(JSON.stringify(entry));
	}

	function storeSize(store) {
		var total = 0;

		Object.keys(isObject(store) ? store : {}).forEach(function (id) {
			total += byteLength(id) + entrySize(store[id]);
		});

		return total;
	}

	function formatTime(value) {
		var seconds = Math.max(0, Math.round(number(value, 0))),
			hours = Math.floor(seconds / 3600),
			minutes = Math.floor(seconds / 60) % 60,
			rest = seconds % 60;

		if (hours > 0) {
			return hours + ':' + (minutes < 10 ? '0' : '') + minutes + ':' + (rest < 10 ? '0' : '') + rest;
		}

		return minutes + ':' + (rest < 10 ? '0' : '') + rest;
	}

	function textOf(segment) {
		if (Array.isArray(segment)) {
			return segment[1];
		}

		if (isObject(segment)) {
			return segment.text !== undefined ? segment.text : segment.value;
		}

		return segment;
	}

	function timeOf(segment) {
		if (Array.isArray(segment)) {
			return segment[0];
		}

		if (isObject(segment)) {
			if (segment.t !== undefined) {
				return segment.t;
			}

			if (segment.time !== undefined) {
				return segment.time;
			}

			if (segment.start !== undefined) {
				return segment.start;
			}
		}

		return null;
	}

	/*--------------------------------------------------------------
	# DATA
	--------------------------------------------------------------*/

	function sanitizeSegments(segments) {
		var result = [],
			seen = {};

		if (!Array.isArray(segments)) {
			return result;
		}

		for (var i = 0, l = segments.length; i < l; i++) {
			var segment = segments[i],
				text = String(textOf(segment) === undefined ? '' : textOf(segment)).replace(/\s+/g, ' ').trim(),
				time = parseTime(timeOf(segment));

			if (!text || time === null) {
				continue;
			}

			var key = time + '\n' + text;

			if (seen[key]) {
				continue;
			}

			seen[key] = true;
			result.push({ t: Math.round(time * 10) / 10, text: text });
		}

		result.sort(function (a, b) { return a.t - b.t; });

		return result.slice(0, MAX_SEGMENTS);
	}

	function addWatched(segments, start, end, gap) {
		var from = Math.max(0, Math.round(number(start, -1) * 10) / 10),
			to = Math.round(number(end, -1) * 10) / 10,
			merge_gap = number(gap, 1),
			first = 0,
			last = 0;

		if (from < 0 || to <= from) {
			return segments;
		}

		while (first < segments.length && segments[first][1] + merge_gap < from) {
			first++;
		}

		last = first;

		while (last < segments.length && segments[last][0] - merge_gap <= to) {
			from = Math.min(from, segments[last][0]);
			to = Math.max(to, segments[last][1]);
			last++;
		}

		segments.splice(first, last - first, [from, to]);

		return segments;
	}

	function sanitizeWatched(watched) {
		var result = [];

		if (!Array.isArray(watched)) {
			return result;
		}

		watched.forEach(function (range) {
			if (!Array.isArray(range) || range.length < 2) {
				return;
			}

			var from = number(range[0], -1),
				to = number(range[1], -1);

			if (from < 0 || to <= from) {
				return;
			}

			addWatched(result, from, to, 0);
		});

		return result;
	}

	function sanitizePauses(pauses) {
		var counts = {},
			result = [];

		if (!Array.isArray(pauses)) {
			return result;
		}

		pauses.forEach(function (pause) {
			var time, count;

			if (Array.isArray(pause)) {
				time = number(pause[0], -1);
				count = number(pause[1], 1);
			} else if (isObject(pause)) {
				time = number(pause.t !== undefined ? pause.t : pause.time, -1);
				count = number(pause.n !== undefined ? pause.n : pause.count, 1);
			} else {
				time = number(pause, -1);
				count = 1;
			}

			if (time < 0) {
				return;
			}

			time = Math.round(time);
			counts[time] = (counts[time] || 0) + Math.max(1, Math.round(count));
		});

		Object.keys(counts).forEach(function (time) {
			result.push([Number(time), counts[time]]);
		});

		result.sort(function (a, b) { return a[0] - b[0]; });

		return result;
	}

	function sanitizeHeatmap(heatmap) {
		var result = [];

		if (!Array.isArray(heatmap)) {
			return result;
		}

		heatmap.forEach(function (marker) {
			var start, duration, score;

			if (Array.isArray(marker)) {
				start = number(marker[0], -1);
				duration = number(marker[1], 0);
				score = number(marker[2], 0);
			} else if (isObject(marker)) {
				start = number(marker.start !== undefined ? marker.start : marker.s, -1);
				duration = number(marker.duration !== undefined ? marker.duration : marker.d, 0);
				score = number(marker.score !== undefined ? marker.score : marker.intensity, 0);
			} else {
				return;
			}

			if (start < 0 || duration <= 0) {
				return;
			}

			result.push({
				start: Math.round(start * 10) / 10,
				duration: Math.round(duration * 10) / 10,
				score: clamp(score, 0, 1)
			});
		});

		result.sort(function (a, b) { return a.start - b.start; });

		return result;
	}

	function sanitizeMetrics(metrics) {
		if (!isObject(metrics)) {
			return { views: 0, likes: 0 };
		}

		return {
			views: Math.max(0, number(metrics.views, 0)),
			likes: Math.max(0, number(metrics.likes, 0))
		};
	}

	function sanitizeEntry(raw, id) {
		var entry = isObject(raw) ? raw : {};

		return {
			id: String(id || entry.id || '').trim(),
			title: String(entry.title || '').trim(),
			channel: String(entry.channel || '').trim(),
			channel_id: String(entry.channel_id || '').trim(),
			duration: Math.max(0, number(entry.duration, 0)),
			language: String(entry.language || '').trim(),
			updated: Math.max(0, number(entry.updated, 0)),
			views: Math.max(0, Math.round(number(entry.views, 0))),
			source: ['watched', 'related', 'subscription'].indexOf(entry.source) === -1 ? 'watched' : entry.source,
			watched: sanitizeWatched(entry.watched),
			pauses: sanitizePauses(entry.pauses),
			heatmap: sanitizeHeatmap(entry.heatmap),
			metrics: sanitizeMetrics(entry.metrics),
			segments: sanitizeSegments(entry.segments)
		};
	}

	function sanitizeStore(store) {
		var result = {};

		if (!isObject(store)) {
			return result;
		}

		Object.keys(store).forEach(function (id) {
			if (!id) {
				return;
			}

			result[id] = sanitizeEntry(store[id], id);
		});

		return result;
	}

	/*--------------------------------------------------------------
	# EVICTION

	User-setting limits (`max`) are a count. Zero/negative/Infinity means
	unlimited, which is the default. The byte budget is a second, optional
	safety net: it drops the least relevant videos instead of the oldest
	ones, so a large transcript archive can still fill the disk without
	losing the parts that were actually watched.
	--------------------------------------------------------------*/

	function relevance(entry) {
		if (!isObject(entry)) {
			return 0;
		}

		return Math.log1p(Math.max(0, number(entry.views, 0))) * 3
			+ watchedRatio(entry) * 2
			+ (entry.segments && entry.segments.length ? 1 : 0)
			+ (entry.source === 'watched' ? 1 : 0);
	}

	function prune(store, max) {
		var limit = number(max, UNLIMITED),
			ids = Object.keys(store);

		if (!(limit > 0) || !isFinite(limit) || ids.length <= limit) {
			return store;
		}

		ids.sort(function (a, b) {
			return number(store[a] && store[a].updated, 0) - number(store[b] && store[b].updated, 0);
		});

		for (var i = 0, l = ids.length - limit; i < l; i++) {
			delete store[ids[i]];
		}

		return store;
	}

	function pruneToBudget(store, maxBytes) {
		var budget = number(maxBytes, 0);

		if (!(budget > 0) || !isFinite(budget) || !isObject(store)) {
			return store;
		}

		var ids = Object.keys(store),
			total = storeSize(store);

		if (total <= budget) {
			return store;
		}

		ids.sort(function (a, b) {
			return (relevance(store[a]) - relevance(store[b]))
				|| (number(store[a] && store[a].updated, 0) - number(store[b] && store[b].updated, 0));
		});

		// At least one entry always survives, even when it alone is larger
		// than the budget.

		for (var i = 0, l = ids.length; i < l; i++) {
			if (total <= budget || Object.keys(store).length <= 1) {
				break;
			}

			total -= byteLength(ids[i]) + entrySize(store[ids[i]]);
			delete store[ids[i]];
		}

		return store;
	}

	function mergeWatchedList(target, extra) {
		sanitizeWatched(extra).forEach(function (range) {
			addWatched(target, range[0], range[1], 0);
		});

		return target;
	}

	function mergePauseList(target, extra) {
		var counts = {};

		sanitizePauses(target).concat(sanitizePauses(extra)).forEach(function (pause) {
			counts[pause[0]] = (counts[pause[0]] || 0) + pause[1];
		});

		return Object.keys(counts).map(function (time) {
			return [Number(time), counts[time]];
		}).sort(function (a, b) { return a[0] - b[0]; });
	}

	/*--------------------------------------------------------------
	# RECORDING
	--------------------------------------------------------------*/

	function recordView(store, input, now) {
		if (!isObject(store) || !isObject(input)) {
			return null;
		}

		var id = String(input.videoId || input.id || '').trim();

		if (!id) {
			return null;
		}

		var existing = isObject(store[id]) ? sanitizeEntry(store[id], id) : sanitizeEntry({}, id),
			entry = existing,
			timestamp = number(now, Date.now());

		entry.id = id;
		entry.title = String(input.title || entry.title || '').trim();
		entry.channel = String(input.channel || entry.channel || '').trim();
		entry.channel_id = String(input.channel_id || entry.channel_id || '').trim();
		entry.language = String(input.language || entry.language || '').trim();
		entry.duration = Math.max(entry.duration, number(input.duration, 0));

		if (input.source && ['watched', 'related', 'subscription'].indexOf(input.source) !== -1) {
			// Never downgrade a video the user actually watched to a
			// recommendation-only entry.
			if (entry.source !== 'watched' || input.source === 'watched') {
				entry.source = input.source;
			}
		}

		if (input.increment_views !== false) {
			entry.views = Math.max(1, entry.views + 1);
		}

		if (Array.isArray(input.watched)) {
			entry.watched = mergeWatchedList(entry.watched, input.watched);
		}

		if (Array.isArray(input.pauses)) {
			entry.pauses = mergePauseList(entry.pauses, input.pauses);
		}

		if (Array.isArray(input.segments) && input.segments.length) {
			entry.segments = sanitizeSegments(input.segments);
		}

		if (Array.isArray(input.heatmap) && input.heatmap.length) {
			entry.heatmap = sanitizeHeatmap(input.heatmap);
		}

		if (isObject(input.metrics)) {
			entry.metrics = sanitizeMetrics(input.metrics);
		}

		entry.updated = timestamp;

		store[id] = entry;

		prune(store, input.maxVideos !== undefined ? input.maxVideos : MAX_VIDEOS);
		pruneToBudget(store, input.maxBytes !== undefined ? input.maxBytes : 0);

		return entry;
	}

	function appendLog(log, event, max) {
		var entries = Array.isArray(log) ? log.slice(0) : [],
			normalized = sanitizeLogEntry(event);

		if (!normalized) {
			return entries;
		}

		// Keep the newest entry first so the menu can simply slice the list.
		entries.unshift(normalized);

		var limit = number(max, MAX_LOG_ENTRIES);

		return !(limit > 0) || !isFinite(limit) ? entries : entries.slice(0, limit);
	}

	function sanitizeLogEntry(raw) {
		if (!isObject(raw)) {
			return null;
		}

		var id = String(raw.v || raw.videoId || raw.id || '').trim();

		if (!id) {
			return null;
		}

		return {
			v: id,
			t: String(raw.t || raw.title || '').trim(),
			c: String(raw.c || raw.channel || '').trim(),
			at: Math.max(0, number(raw.at || raw.started, 0)) || Date.now(),
			end: Math.max(0, number(raw.end, 0)) || Date.now(),
			from: Math.max(0, number(raw.from, 0)),
			to: Math.max(0, number(raw.to, 0)),
			sec: Math.max(0, number(raw.sec || raw.seconds, 0)),
			pauses: Math.max(0, Math.round(number(raw.pauses, 0)))
		};
	}

	/*--------------------------------------------------------------
	# NEARBY VIDEOS / CAPTIONS

	Related videos and the subscription feed are archived by fetching
	their watch page and reading the same `ytInitialPlayerResponse` that
	the watch page itself uses. The helpers below stay DOM-free so the
	menu and the tests can use them too.
	--------------------------------------------------------------*/

	function collectVideoIds(source, options) {
		options = isObject(options) ? options : {};

		var exclude = String(options.exclude || ''),
			limit = Math.max(1, Math.round(number(options.limit, 50))),
			ids = [],
			seen = {};

		function add(value) {
			var id = String(value || '').trim();

			if (ids.length >= limit || !/^[A-Za-z0-9_-]{11}$/.test(id) || id === exclude || seen[id]) {
				return;
			}

			seen[id] = true;
			ids.push(id);
		}

		function walk(object, depth) {
			if (!object || typeof object !== 'object' || depth > 30 || ids.length >= limit) {
				return;
			}

			if (Array.isArray(object)) {
				for (var i = 0, l = object.length; i < l && ids.length < limit; i++) {
					walk(object[i], depth + 1);
				}

				return;
			}

			if (typeof object.videoId === 'string') {
				add(object.videoId);
			}

			// lockupViewModel uses contentId for videos, channels and playlists.
			if (typeof object.contentId === 'string' && /VIDEO/.test(String(object.contentType || ''))) {
				add(object.contentId);
			}

			for (var key in object) {
				if (Object.prototype.hasOwnProperty.call(object, key) && ids.length < limit) {
					walk(object[key], depth + 1);
				}
			}
		}

		walk(source, 0);

		return ids;
	}

	function videoIdsFromLinks(links, options) {
		options = isObject(options) ? options : {};

		var exclude = String(options.exclude || ''),
			limit = Math.max(1, Math.round(number(options.limit, 50))),
			ids = [],
			seen = {};

		for (var i = 0, l = links ? links.length : 0; i < l && ids.length < limit; i++) {
			var link = links[i],
				href = String(link && (link.href || link.url) || ''),
				match = href.match(/[?&]v=([A-Za-z0-9_-]{11})/);

			if (!match || match[1] === exclude || seen[match[1]]) {
				continue;
			}

			seen[match[1]] = true;
			ids.push(match[1]);
		}

		return ids;
	}

	// Reads the first balanced JSON object after a marker, ignoring braces
	// inside strings. Avoids a regex that breaks on nested player data.
	function parseJsonAfter(text, marker) {
		var value = String(text || ''),
			index = value.indexOf(String(marker || ''));

		if (index === -1) {
			return null;
		}

		var start = value.indexOf('{', index);

		if (start === -1) {
			return null;
		}

		var depth = 0,
			in_string = false,
			escaped = false;

		for (var i = start, l = value.length; i < l; i++) {
			var character = value.charAt(i);

			if (in_string) {
				if (escaped) {
					escaped = false;
				} else if (character === '\\') {
					escaped = true;
				} else if (character === '"') {
					in_string = false;
				}
			} else if (character === '"') {
				in_string = true;
			} else if (character === '{') {
				depth++;
			} else if (character === '}') {
				depth--;

				if (depth === 0) {
					try {
						return JSON.parse(value.slice(start, i + 1));
					} catch (error) {
						return null;
					}
				}
			}
		}

		return null;
	}

	function parseWatchPage(html) {
		return parseJsonAfter(html, 'ytInitialPlayerResponse');
	}

	function captionTrack(response) {
		var tracks = response
			&& response.captions
			&& response.captions.playerCaptionsTracklistRenderer
			&& response.captions.playerCaptionsTracklistRenderer.captionTracks;

		if (!Array.isArray(tracks) || tracks.length === 0) {
			return null;
		}

		return tracks.find(function (track) { return track.languageCode === 'en' && track.kind !== 'asr'; })
			|| tracks.find(function (track) { return track.languageCode === 'en'; })
			|| tracks.find(function (track) { return track.isTranslatable; })
			|| tracks[0]
			|| null;
	}

	function captionUrl(track, origin, format) {
		if (isObject(track)) {
			track = track.baseUrl;
		}

		var url = String(track || '');

		if (!url) {
			return '';
		}

		if (url.indexOf('//') === 0) {
			url = (origin || location.protocol) + url;
		} else if (url.charAt(0) === '/') {
			url = (origin || location.origin) + url;
		}

		// `null` means "leave the track's own format alone". YouTube
		// sometimes answers an empty body for JSON3, but still serves the
		// original format, so the caller can retry with that.
		if (format === null) {
			return url.replace(/([?&])fmt=[^&]*/g, '$1')
				.replace(/\?&/, '?')
				.replace(/&&/g, '&')
				.replace(/[?&]$/, '');
		}

		format = format || 'json3';

		if (/[?&]fmt=/.test(url)) {
			return url.replace(/([?&])fmt=[^&]*/, '$1fmt=' + format);
		}

		return url + (url.indexOf('?') === -1 ? '?' : '&') + 'fmt=' + format;
	}

	function parseJson3(text) {
		var segments = [];

		try {
			var data = JSON.parse(String(text || ''));

			(data.events || []).forEach(function (event) {
				if (!event.segs) {
					return;
				}

				var value = event.segs.map(function (part) {
					return part.utf8 || '';
				}).join('').replace(/\s+/g, ' ').trim();

				if (value) {
					segments.push({
						t: Number(event.tStartMs || 0) / 1000,
						text: value
					});
				}
			});
		} catch (error) {
			return [];
		}

		return sanitizeSegments(segments);
	}

	function videoDetails(response) {
		var details = response && response.videoDetails || {},
			microformat = response && response.microformat && response.microformat.playerMicroformatRenderer || {};

		return {
			id: String(details.videoId || ''),
			title: String(details.title || '').replace(/\s*-\s*YouTube$/, '').trim(),
			channel: String(details.author || microformat.ownerChannelName || '').trim(),
			channel_id: String(details.channelId || microformat.externalChannelId || '').trim(),
			duration: Math.max(0, number(details.lengthSeconds, 0)),
			views: Math.max(0, number(details.viewCount || microformat.viewCount, 0)),
			language: String(captionTrack(response) && captionTrack(response).languageCode || '')
		};
	}

	/*--------------------------------------------------------------
	# WATCHING DIARY

	One entry per video holds the captured frames. The index keeps the
	menu fast without loading every data URL.
	--------------------------------------------------------------*/

	function sanitizeFrame(raw) {
		if (!isObject(raw)) {
			return null;
		}

		var time = number(raw.t !== undefined ? raw.t : raw.time, -1),
			at = Math.max(0, number(raw.at, 0)) || Date.now(),
			data = String(raw.data || raw.src || '');

		if (time < 0 || !/^data:image\/(png|jpe?g|webp);base64,/i.test(data)) {
			return null;
		}

		return {
			t: Math.round(time * 10) / 10,
			at: at,
			data: data
		};
	}

	function sanitizeDiary(raw) {
		var frames = [];

		if (Array.isArray(raw)) {
			raw = { frames: raw };
		}

		if (!isObject(raw) || !Array.isArray(raw.frames)) {
			return { frames: frames };
		}

		raw.frames.forEach(function (item) {
			var frame = sanitizeFrame(item);

			if (frame) {
				frames.push(frame);
			}
		});

		frames.sort(function (a, b) { return a.t - b.t; });

		return { frames: frames };
	}

	function appendDiaryFrame(diary, raw, min_gap) {
		var frame = sanitizeFrame(raw),
			gap = Math.max(0, number(min_gap, DIARY_MIN_GAP)),
			result = sanitizeDiary(diary);

		if (!frame) {
			return result;
		}

		var index = -1;

		for (var i = 0, l = result.frames.length; i < l; i++) {
			if (Math.abs(result.frames[i].t - frame.t) <= gap) {
				index = i;
				break;
			}
		}

		if (index === -1) {
			result.frames.push(frame);
		} else {
			result.frames[index] = frame;
		}

		result.frames.sort(function (a, b) { return a.t - b.t; });

		return result;
	}

	function sanitizeDiaryIndex(index) {
		var result = {};

		if (!isObject(index)) {
			return result;
		}

		Object.keys(index).forEach(function (id) {
			var entry = index[id];

			if (!isObject(entry)) {
				return;
			}

			result[id] = {
				id: id,
				title: String(entry.title || '').trim(),
				channel: String(entry.channel || '').trim(),
				duration: Math.max(0, number(entry.duration, 0)),
				at: Math.max(0, number(entry.at, 0)),
				frames: Math.max(0, Math.round(number(entry.frames, 0))),
				from: Math.max(0, number(entry.from, 0)),
				to: Math.max(0, number(entry.to, 0)),
				thumb: /^data:image\/(png|jpe?g|webp);base64,/i.test(entry.thumb || '') ? entry.thumb : ''
			};
		});

		return result;
	}

	function updateDiaryIndex(index, info) {
		var result = sanitizeDiaryIndex(index),
			id = String(isObject(info) && (info.id || info.videoId) || '').trim();

		if (!id) {
			return result;
		}

		result[id] = {
			id: id,
			title: String(info.title || (result[id] && result[id].title) || '').trim(),
			channel: String(info.channel || (result[id] && result[id].channel) || '').trim(),
			duration: Math.max(number(info.duration, 0), result[id] ? result[id].duration : 0),
			at: Math.max(0, number(info.at, 0)) || Date.now(),
			frames: Math.max(0, Math.round(number(info.frames, result[id] ? result[id].frames : 0))),
			from: Math.max(0, number(info.from, 0)),
			to: Math.max(0, number(info.to, 0)),
			thumb: /^data:image\/(png|jpe?g|webp);base64,/i.test(info.thumb || '') ? info.thumb : (result[id] ? result[id].thumb : '')
		};

		return result;
	}

	function pruneDiaryIndex(index, max) {
		var result = sanitizeDiaryIndex(index),
			limit = number(max, UNLIMITED),
			ids = Object.keys(result);

		if (!(limit > 0) || !isFinite(limit) || ids.length <= limit) {
			return result;
		}

		ids.sort(function (a, b) {
			return number(result[a].at, 0) - number(result[b].at, 0);
		});

		for (var i = 0, l = ids.length - limit; i < l; i++) {
			delete result[ids[i]];
		}

		return result;
	}

	/*--------------------------------------------------------------
	# MATCHING
	--------------------------------------------------------------*/

	function isWatched(entry, time) {
		var ranges = entry.watched || [];

		for (var i = 0, l = ranges.length; i < l; i++) {
			if (time >= ranges[i][0] && time <= ranges[i][1]) {
				return true;
			}
		}

		return false;
	}

	function watchedRatio(entry) {
		if (!entry.duration) {
			return 0;
		}

		var watched = 0;

		(entry.watched || []).forEach(function (range) {
			watched += range[1] - range[0];
		});

		return clamp(watched / entry.duration, 0, 1);
	}

	function pausedAt(entry, time, window_size) {
		var window = number(window_size, PAUSE_WINDOW),
			count = 0;

		(entry.pauses || []).forEach(function (pause) {
			if (Math.abs(pause[0] - time) <= window) {
				count += pause[1];
			}
		});

		return count;
	}

	function heatmapScore(entry, time) {
		var markers = entry.heatmap || [];

		for (var i = 0, l = markers.length; i < l; i++) {
			var marker = markers[i];

			if (time >= marker.start && time <= marker.start + marker.duration) {
				return clamp(marker.score, 0, 1);
			}
		}

		return 0;
	}

	function occurrences(haystack, needle) {
		var count = 0,
			index = haystack.indexOf(needle);

		while (index !== -1 && count < 10) {
			count++;
			index = haystack.indexOf(needle, index + needle.length);
		}

		return count;
	}

	function matchScore(haystack, tokens, phrase) {
		var score = 0;

		for (var i = 0, l = tokens.length; i < l; i++) {
			var count = occurrences(haystack, tokens[i]);

			if (count === 0) {
				return -1;
			}

			score += 1 + Math.min(count - 1, 3) * 0.1;
		}

		if (phrase && haystack.indexOf(phrase) !== -1) {
			score += 1;
		}

		return score;
	}

	function personalScore(entry, time, match) {
		return match
			+ Math.log1p(entry.views || 0) * 0.35
			+ (isWatched(entry, time) ? 1.5 : 0)
			+ Math.min(pausedAt(entry, time), 4) * 0.4
			+ watchedRatio(entry) * 0.5;
	}

	function globalScore(entry, time, match) {
		var views = entry.metrics && entry.metrics.views || 0,
			popularity = 1 + Math.log10(1 + views) / 10;

		return match * popularity * (0.5 + heatmapScore(entry, time) * 3);
	}

	/*--------------------------------------------------------------
	# RANKING / SEARCH
	--------------------------------------------------------------*/

	function videoResult(entry) {
		var first = entry.segments && entry.segments[0];

		return {
			videoId: entry.id,
			title: entry.title,
			channel: entry.channel,
			source: entry.source,
			time: first ? first.t : 0,
			timeText: first ? formatTime(first.t) : '',
			text: first ? first.text : '',
			updated: entry.updated,
			views: entry.views,
			watched: false,
			paused: 0,
			heat: 0,
			personal: entry.views || 0,
			global: 0,
			score: entry.views || 0
		};
	}

	function search(source, query, options) {
		options = isObject(options) ? options : {};

		var store = options.sanitized === true
				? (isObject(source) ? source : {})
				: sanitizeStore(source),
			tokens = tokenize(query),
			phrase = normalize(query),
			mode = options.mode === 'global' ? 'global' : 'personal',
			limit = clamp(Math.round(number(options.limit, 50)), 1, 500),
			results = [];

		Object.keys(store).forEach(function (id) {
			var entry = store[id],
				segments = entry.segments || [],
				meta = normalize([entry.title, entry.channel].join(' '));

			if (!tokens.length) {
				results.push(videoResult(entry));
				return;
			}

			if (!segments.length) {
				var meta_match = matchScore(meta, tokens, phrase);

				if (meta_match >= 0) {
					var video = videoResult(entry);

					video.personal = personalScore(entry, 0, meta_match);
					video.global = globalScore(entry, 0, meta_match);
					video.score = mode === 'global' ? video.global : video.personal;
					results.push(video);
				}

				return;
			}

			segments.forEach(function (segment) {
				var text = normalize(segment.text),
					haystack = meta + ' ' + text,
					match = matchScore(haystack, tokens, phrase);

				if (match < 0) {
					return;
				}

				var personal = personalScore(entry, segment.t, match),
					global = globalScore(entry, segment.t, match),
					pauses = pausedAt(entry, segment.t);

				results.push({
					videoId: entry.id,
					title: entry.title,
					channel: entry.channel,
					source: entry.source,
					time: segment.t,
					timeText: formatTime(segment.t),
					text: segment.text,
					updated: entry.updated,
					views: entry.views,
					watched: isWatched(entry, segment.t),
					paused: pauses,
					heat: heatmapScore(entry, segment.t),
					personal: personal,
					global: global,
					score: mode === 'global' ? global : personal
				});
			});
		});

		if (!tokens.length) {
			results.sort(function (a, b) { return b.updated - a.updated; });
		} else {
			results.sort(function (a, b) {
				return (b.score - a.score) || (b.updated - a.updated) || (a.time - b.time);
			});
		}

		return results.slice(0, limit);
	}

	function topVideos(source, mode, limit) {
		var store = sanitizeStore(source),
			mode = mode === 'global' ? 'global' : 'personal',
			results = [];

		Object.keys(store).forEach(function (id) {
			var entry = store[id],
				personal = personalScore(entry, 0, 1),
				global = globalScore(entry, 0, 1);

			results.push({
				videoId: id,
				title: entry.title,
				channel: entry.channel,
				updated: entry.updated,
				views: entry.views,
				personal: personal,
				global: global,
				score: mode === 'global' ? global : personal
			});
		});

		results.sort(function (a, b) {
			return (b.score - a.score) || (b.updated - a.updated);
		});

		return results.slice(0, clamp(Math.round(number(limit, 50)), 1, 500));
	}

	return {
		STORAGE_KEY: STORAGE_KEY,
		LOG_KEY: LOG_KEY,
		DIARY_KEY: DIARY_KEY,
		DIARY_KEY_PREFIX: DIARY_KEY_PREFIX,
		UNLIMITED: UNLIMITED,
		MAX_VIDEOS: MAX_VIDEOS,
		MAX_LOG_ENTRIES: MAX_LOG_ENTRIES,
		MAX_SEGMENTS: MAX_SEGMENTS,
		PAUSE_WINDOW: PAUSE_WINDOW,
		MEGABYTE: MEGABYTE,

		normalize: normalize,
		tokenize: tokenize,
		parseTime: parseTime,
		formatTime: formatTime,
		byteLength: byteLength,
		entrySize: entrySize,
		storeSize: storeSize,
		relevance: relevance,
		prune: prune,
		pruneToBudget: pruneToBudget,
		sanitizeSegments: sanitizeSegments,
		sanitizeWatched: sanitizeWatched,
		sanitizePauses: sanitizePauses,
		sanitizeHeatmap: sanitizeHeatmap,
		sanitizeEntry: sanitizeEntry,
		sanitizeStore: sanitizeStore,
		sanitizeLogEntry: sanitizeLogEntry,
		collectVideoIds: collectVideoIds,
		videoIdsFromLinks: videoIdsFromLinks,
		parseJsonAfter: parseJsonAfter,
		parseWatchPage: parseWatchPage,
		captionTrack: captionTrack,
		captionUrl: captionUrl,
		parseJson3: parseJson3,
		videoDetails: videoDetails,
		sanitizeFrame: sanitizeFrame,
		sanitizeDiary: sanitizeDiary,
		appendDiaryFrame: appendDiaryFrame,
		sanitizeDiaryIndex: sanitizeDiaryIndex,
		updateDiaryIndex: updateDiaryIndex,
		pruneDiaryIndex: pruneDiaryIndex,
		addWatched: addWatched,
		recordView: recordView,
		appendLog: appendLog,
		isWatched: isWatched,
		watchedRatio: watchedRatio,
		pausedAt: pausedAt,
		heatmapScore: heatmapScore,
		personalScore: personalScore,
		globalScore: globalScore,
		search: search,
		topVideos: topVideos
	};
});
