/*------------------------------------------------------------------------------
LAST WATCHED OVERLAY ON THUMBNAILS (ROBUSTE VERSION)
------------------------------------------------------------------------------*/
(function () {
	'use strict';

	var state = null;

	// The page-world initializer and YouTube events call lastWatchedOverlay()
	// many times. Without a teardown path every call added another observer,
	// interval and event listener, which kept scanning thumbnails forever.
	function detach () {
		if (!state) return;
		if (state.flush) {
			try { state.flush(); } catch (e) { console.warn('[LWO] final save failed', e); }
			state.flush = null;
		}
		if (state.observer) {
			state.observer.disconnect();
			state.observer = null;
		}
		if (state.interval !== null) {
			clearInterval(state.interval);
			state.interval = null;
		}
		state.timeouts.forEach(function (id) { clearTimeout(id); });
		state.timeouts.length = 0;
		Object.keys(state.listeners).forEach(function (type) {
			state.listeners[type].forEach(function (fn) {
				document.removeEventListener(type, fn);
			});
		});
		state.listeners = {};
		if (document.querySelectorAll) {
			Array.prototype.forEach.call(document.querySelectorAll('.it-last-watched-overlay'), function (el) {
				if (el.remove) el.remove();
				else if (el.parentNode) el.parentNode.removeChild(el);
			});
			Array.prototype.forEach.call(document.querySelectorAll('.it-lwo-container'), function (el) {
				if (el.classList && el.classList.remove) el.classList.remove('it-lwo-container');
			});
		}
		var style = document.getElementById && document.getElementById('it-last-watched-overlay-style');
		if (style && style.remove) style.remove();
		ImprovedTube.lastWatchedOverlayProcess = null;
		state = null;
	}

	ImprovedTube.lastWatchedOverlay = function () {
		if (ImprovedTube.storage.show_last_watched_overlay !== true) {
			detach();
			return false;
		}
		if (state) {
			return true;
		}

		state = { observer: null, interval: null, timeouts: [], listeners: {}, flush: null };
		var current = state;

		function cancel (id) {
			var index = current.timeouts.indexOf(id);
			if (index >= 0) current.timeouts.splice(index, 1);
			clearTimeout(id);
		}

		function later (fn, ms) {
			var id = setTimeout(function () {
				var index = current.timeouts.indexOf(id);
				if (index >= 0) current.timeouts.splice(index, 1);
				if (current === state) fn();
			}, ms);
			current.timeouts.push(id);
			return id;
		}

		function listen (type, fn) {
			document.addEventListener(type, fn);
			(current.listeners[type] = current.listeners[type] || []).push(fn);
		}

		(function addStyles () {
			if (document.getElementById('it-last-watched-overlay-style')) return;

			var style = document.createElement('style');
			style.id = 'it-last-watched-overlay-style';
			style.textContent = `
        .it-last-watched-overlay {
            position: absolute;
            background: rgba(0, 0, 0, 0.75);
            color: white;
            padding: 2px 5px;
            font-size: 11px;
            border-radius: 3px;
            z-index: 2147483647;
            pointer-events: none;
            opacity: 1 !important;
            transition: none;
            white-space: nowrap;
        }
        .it-lwo-container { position: relative !important; }
    `;
			var host = document.head || document.documentElement;
			if (host) host.appendChild(style);
		})();

		var overlayMap = new WeakMap();

		if (!ImprovedTube.storage.watch_history) {
			ImprovedTube.storage.watch_history = {};
		}

		var watchHistoryLoaded = false;
		var PERSIST_KEY = 'it_watch_history';

		function mergeHistory (obj) {
			if (!obj || typeof obj !== 'object') return;
			var target = ImprovedTube.storage.watch_history;
			Object.keys(obj).forEach(function (k) {
				var v = obj[k];
				if (!target[k] || (typeof v === 'number' && v > target[k])) {
					target[k] = v;
				}
			});
		}

		function loadPersistedHistory () {
			if (watchHistoryLoaded) return;
			try {
				if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local && chrome.storage.local.get) {
					chrome.storage.local.get(PERSIST_KEY, function (res) {
						if (current !== state) return;
						try {
							if (res && res[PERSIST_KEY]) mergeHistory(res[PERSIST_KEY]);
							else {
								var ls = localStorage.getItem(PERSIST_KEY);
								if (ls) mergeHistory(JSON.parse(ls));
							}
						} catch (e) { console.warn('[LWO] merge error', e); }
						watchHistoryLoaded = true;
						processPage();
					});
				} else {
					var ls = localStorage.getItem(PERSIST_KEY);
					if (ls) {
						try { mergeHistory(JSON.parse(ls)); } catch (e) { console.warn('[LWO] localStorage parse failed', e); }
					}
					watchHistoryLoaded = true;
					processPage();
				}
			} catch (e) {
				console.warn('[LWO] loadPersistedHistory error', e);
				watchHistoryLoaded = true;
				processPage();
			}
		}

		function saveHistory () {
			try {
				var h = ImprovedTube.storage.watch_history;
				var ids = Object.keys(h);
				var MAX = 1000;
				if (ids.length > MAX) {
					ids.sort(function (a, b) { return h[a] - h[b]; });
					for (var i = 0; i < ids.length - MAX; i++) delete h[ids[i]];
				}
				if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local && chrome.storage.local.set) {
					chrome.storage.local.set((function () {
						var value = {};
						value[PERSIST_KEY] = h;
						return value;
					})());
				} else {
					localStorage.setItem(PERSIST_KEY, JSON.stringify(h));
				}
			} catch (e) {
				console.warn('[LWO] saveHistory error', e);
			}
		}

		current.flush = saveHistory;
		var saveTimeout = null;

		function scheduleSaveHistory () {
			cancel(saveTimeout);
			saveTimeout = later(saveHistory, 600);
		}

		function formatTimestamp (ts) {
			var mode = ImprovedTube.storage.last_watched_format || 'relative';
			if (mode === 'exact') {
				var d = new Date(ts);
				var pad = function (n) { return String(n).padStart(2, '0'); };
				return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate() + ' / ' +
                    pad(d.getHours()) + ':' + pad(d.getMinutes());
			}
			var diff = Math.floor((Date.now() - ts) / 1000);
			if (diff < 60) return diff + 's ago';
			if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
			if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
			return Math.floor(diff / 86400) + 'd ago';
		}

		function getVideoId (href) {
			if (!href) return null;
			try {
				var fullUrl = href.charAt(0) === '/' ? 'https://www.youtube.com' + href : href;
				var url = new URL(fullUrl);
				if (url.pathname === '/watch') return url.searchParams.get('v');
				if (url.pathname.indexOf('/shorts/') === 0) return url.pathname.split('/shorts/')[1];
				return null;
			} catch (e) {
				console.error('[LWO] URL parsing error:', e);
				return null;
			}
		}

		function addOrUpdateOverlay (thumbnail) {
			if (!thumbnail || !thumbnail.isConnected) return;
			var anchor = thumbnail;
			if (thumbnail.tagName !== 'A') {
				anchor = thumbnail.querySelector('a#thumbnail, a.ytd-thumbnail');
			}
			if (!anchor || !anchor.href) return;
			var videoId = getVideoId(anchor.href);
			if (!videoId) return;
			var ts = ImprovedTube.storage.watch_history[videoId];
			if (!ts) return;

			var container = thumbnail.closest ? thumbnail.closest('ytd-thumbnail') || thumbnail : thumbnail;
			container.classList.add('it-lwo-container');
			var overlay = container.querySelector(':scope > .it-last-watched-overlay');
			var label = formatTimestamp(ts);
			var position = ImprovedTube.storage.last_watched_overlay_position || 'bottom-right';
			if (!overlay) {
				overlay = document.createElement('div');
				overlay.className = 'it-last-watched-overlay';
				overlay.dataset.videoId = videoId;
				container.appendChild(overlay);
			}
			overlay.style.top = overlay.style.bottom = overlay.style.left = overlay.style.right = '';
			if (position.indexOf('bottom') >= 0) overlay.style.bottom = '5px'; else overlay.style.top = '5px';
			if (position.indexOf('right') >= 0) overlay.style.right = '5px'; else overlay.style.left = '5px';
			overlay.textContent = 'Watched (' + label + ')';
			overlayMap.set(container, videoId);
		}

		function collectThumbnailElements () {
			var set = new Set();
			document.querySelectorAll('ytd-thumbnail, a#thumbnail').forEach(function (el) { set.add(el); });
			return Array.from(set);
		}

		function processPage () {
			if (!watchHistoryLoaded) return;
			if (current !== state) return;
			try {
				collectThumbnailElements().forEach(addOrUpdateOverlay);
			} catch (e) { console.error('[LWO] processPage error', e); }
		}

		function trackWatch () {
			if (location.pathname !== '/watch') return;
			var videoId = new URLSearchParams(location.search).get('v');
			if (!videoId) return;

			var history = ImprovedTube.storage.watch_history || {};
			history[videoId] = Date.now();
			var ids = Object.keys(history);
			if (ids.length > 1000) {
				var oldestId = ids.sort(function (a, b) { return history[a] - history[b]; })[0];
				delete history[oldestId];
			}
			ImprovedTube.storage.watch_history = history;
			scheduleSaveHistory();
			if (watchHistoryLoaded) {
				addOrUpdateOverlay(document.querySelector('ytd-watch-flexy ytd-thumbnail') || null);
				processPage();
			}
		}

		loadPersistedHistory();
		later(trackWatch, 1200);

		var processingTimeout = null;
		var observer = new MutationObserver(function (mutations) {
			var relevant = false;
			for (var i = 0; i < mutations.length && !relevant; i++) {
				var m = mutations[i];
				if (m.type !== 'childList') continue;
				for (var j = 0; j < m.addedNodes.length; j++) {
					var n = m.addedNodes[j];
					if (n.nodeType === 1 &&
                        (n.matches && n.matches('ytd-thumbnail, a#thumbnail') ||
                         n.querySelector && n.querySelector('ytd-thumbnail, a#thumbnail'))) {
						relevant = true;
						break;
					}
				}
			}
			if (!relevant) return;
			cancel(processingTimeout);
			processingTimeout = later(processPage, 150);
		});
		current.observer = observer;

		// Page-world code can run before <body> exists. Defer observation instead
		// of throwing on a null target; the generation guard keeps it one-shot.
		var bodyObservePending = false;

		function observeBody () {
			if (current !== state) return;
			if (!document.body) {
				if (bodyObservePending) return;
				bodyObservePending = true;
				listen('DOMContentLoaded', observeBody);
				return;
			}
			bodyObservePending = false;
			observer.observe(document.body, { childList: true, subtree: true });
		}
		observeBody();

		var navTimeout = null;

		listen('yt-navigate-finish', function () {
			trackWatch();
			cancel(navTimeout);
			navTimeout = later(processPage, 400);
		});

		current.interval = setInterval(processPage, 5000);

		// Re-process after YouTube updates the page; never call the initializer
		// from here, that used to register another listener on every update.
		var dataTimeout = null;

		listen('yt-page-data-updated', function () {
			cancel(dataTimeout);
			dataTimeout = later(processPage, 800);
		});

		ImprovedTube.lastWatchedOverlayProcess = processPage;
		return true;
	};

	// core.js dispatches storage changes through ImprovedTube[camelizedKey]().
	// show_last_watched_overlay camelizes to showLastWatchedOverlay, so the
	// setting cannot reach the teardown path without this alias.
	ImprovedTube.showLastWatchedOverlay = ImprovedTube.lastWatchedOverlay;
	ImprovedTube.lastWatchedOverlayTracked = function () {
		return state ? state.timeouts.length : 0;
	};

	ImprovedTube.lastWatchedOverlay();
})();
