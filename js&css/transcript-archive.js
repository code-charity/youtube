/*--------------------------------------------------------------
>>> TRANSCRIPT ARCHIVE
----------------------------------------------------------------
	Shared, DOM-free helpers for the transcript archive.

	The content script archives the captions of videos that are
	watched, and this file contains the data handling and the search
	index that both the content script and the extension menu use:

	# Data
	# Matching
	# Ranking
	# Search

	Storage layout (chrome.storage.local):

	transcript_archive = {
		<video id>: {
			id, title, channel, channel_id, duration, language,
			updated, views,
			watched: [[start, end], ...],
			pauses: [[time, count], ...],
			heatmap: [{start, duration, score}, ...],
			metrics: {views, likes},
			segments: [{t, text}, ...]
		}
	}

	viewing_log = [{
		v: <video id>, t: title, c: channel,
		at: <started timestamp>, end: <last timestamp>,
		from: <first watched second>, to: <last watched second>,
		sec: <seconds actually watched>, pauses: <pause count>
	}, ...]
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
	var MAX_VIDEOS = 100;
	var MAX_LOG_ENTRIES = 500;
	var MAX_SEGMENTS = 20000;
	var PAUSE_WINDOW = 10;

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

	function prune(store, max) {
		var limit = Math.max(1, number(max, MAX_VIDEOS)),
			ids = Object.keys(store);

		if (ids.length <= limit) {
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

		prune(store, input.maxVideos || MAX_VIDEOS);

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

		return entries.slice(0, Math.max(1, number(max, MAX_LOG_ENTRIES)));
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
		MAX_VIDEOS: MAX_VIDEOS,
		MAX_LOG_ENTRIES: MAX_LOG_ENTRIES,
		MAX_SEGMENTS: MAX_SEGMENTS,
		PAUSE_WINDOW: PAUSE_WINDOW,

		normalize: normalize,
		tokenize: tokenize,
		parseTime: parseTime,
		formatTime: formatTime,
		sanitizeSegments: sanitizeSegments,
		sanitizeWatched: sanitizeWatched,
		sanitizePauses: sanitizePauses,
		sanitizeHeatmap: sanitizeHeatmap,
		sanitizeEntry: sanitizeEntry,
		sanitizeStore: sanitizeStore,
		sanitizeLogEntry: sanitizeLogEntry,
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
