/*--------------------------------------------------------------
>>> PLAYLIST HEALTH
----------------------------------------------------------------
Finds broken and repeated rows, and ranks the rows least likely
to ever be watched. Detection only: nothing is deleted.
--------------------------------------------------------------*/
(function () {
	'use strict';

	var button = null,
		panel = null,
		timer = null,
		observer = null,
		navigating = false,
		lastReport = '';

	var UNAVAILABLE = /\[(?:deleted|private|unavailable)(?: video)?\]|video unavailable|this video is private|this video is unavailable|deleted video/i;

	function enabled() {
		return ImprovedTube.storage.playlist_health === true;
	}

	function videoId(href) {
		var match = String(href || '').match(/[?&]v=([\w-]{11})(?:[&#]|$)/);

		return match ? match[1] : null;
	}

	function parseDuration(text) {
		var match = String(text || '').trim().match(/^(\d+):(\d{2})(?::(\d{2}))?$/);

		if (!match || Number(match[2]) > 59 || (match[3] && Number(match[3]) > 59)) {
			return null;
		}

		var seconds = match[3]
			? Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])
			: Number(match[1]) * 60 + Number(match[2]);
		return Number.isSafeInteger(seconds) ? seconds : null;
	}

	/**
	 * Weighted the same way as the userscript: depth dominates, length is the second
	 * signal, playlist size is context, and an existing progress bar subtracts.
	 */
	function decayScore(options) {
		function finite(value, fallback) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
		var total = Math.max(1, finite(options.total, 1)),
			index = Math.min(total - 1, Math.max(0, finite(options.index, 0))),
			duration = Math.max(0, finite(options.duration, 0)),
			watched = options.watched === true,
			depth = total > 1 ? (index / (total - 1)) : 0,
			lengthSignal = Math.min(1, duration / (90 * 60)),
			sizeSignal = Math.min(1, total / 400),
			score = 10 + depth * 45 + lengthSignal * 30 + sizeSignal * 15 - (watched ? 40 : 0);

		return Math.max(0, Math.min(100, Math.round(score)));
	}

	function collect() {
		var root = listRoot(), list = [];
		if (!root) return list;
		root.querySelectorAll('ytd-playlist-video-renderer, ytd-playlist-panel-video-renderer, yt-lockup-view-model').forEach(function (row) {
			if (row.parentElement?.closest('ytd-playlist-video-renderer, ytd-playlist-panel-video-renderer')) return;
			var link = row.querySelector('a[href*="/watch?"]'),
				id = link ? videoId(link.getAttribute('href')) : null;

			var title = row.querySelector('#video-title, h3'),
				durationNode = row.querySelector('#time-status, ytd-thumbnail-overlay-time-status-renderer, [class*="ThumbnailOverlayBottomPanel"]'),
				progress = row.querySelector('ytw-thumbnail-overlay-resume-playback-renderer [class*="ThumbnailOverlayResumePlaybackProgress"], ytd-thumbnail-overlay-resume-playback-renderer #progress, [class*="WatchedProgress"]'),
				text = row.textContent || '';
			if (!id && !UNAVAILABLE.test(text)) return;

			list.push({
				id: id,
				title: title ? title.textContent.trim() : text.trim(),
				duration: parseDuration(durationNode ? durationNode.textContent : ''),
				watched: !!row.querySelector('ytw-thumbnail-overlay-watched-status-renderer, ytd-thumbnail-overlay-watched-status-renderer') || !!(progress && parseFloat(progress.style.width) > 0),
				unavailable: UNAVAILABLE.test(text)
			});
		});

		return list;
	}

	function report(list) {
		var seen = Object.create(null),
			duplicates = [],
			unavailable = [],
			ranked = [];

		list.forEach(function (item, index) {
			if (item.id && seen[item.id]) {
				duplicates.push({ title: item.title, id: item.id, first: seen[item.id].title });
			} else if (item.id) {
				seen[item.id] = item;
			}

			if (item.unavailable) {
				unavailable.push(item);
			}

			ranked.push(Object.assign({}, item, {
				score: decayScore({
					index: index,
					total: list.length,
					duration: item.duration || 0,
					watched: item.watched
				})
			}));
		});

		ranked.sort(function (a, b) { return b.score - a.score; });

		return {
			scanned: list.length,
			duplicates: duplicates,
			unavailable: unavailable,
			ranked: ranked.slice(0, 8)
		};
	}

	function theme() {
		var dark = document.documentElement.hasAttribute('dark');

		return {
			bg: dark ? '#212121' : '#ffffff',
			fg: dark ? '#f1f1f1' : '#0f0f0f',
			border: dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)'
		};
	}

	function line(text, options) {
		var el = document.createElement('div');
		el.textContent = text;
		el.style.cssText = 'padding:3px 0;opacity:' + (options && options.muted ? '.65' : '1') +
			';font-weight:' + (options && options.strong ? '600' : '400');
		return el;
	}

	function render() {
		if (!panel || !panel.isConnected || !enabled() || navigating) {
			return;
		}

		var body = panel.querySelector('#it-playlist-health-body'),
			data;

		data = report(collect());
		var signature = JSON.stringify(data);
		if (signature === lastReport) return;
		lastReport = signature;
		body.textContent = '';

		body.appendChild(line(data.scanned + ' rows scanned', { muted: true }));

		body.appendChild(line('Unavailable (' + data.unavailable.length + ')', { strong: true }));
		if (data.unavailable.length) {
			data.unavailable.slice(0, 6).forEach(function (item) {
				body.appendChild(line('· ' + item.title));
			});
		} else {
			body.appendChild(line('none', { muted: true }));
		}

		body.appendChild(line('Duplicates (' + data.duplicates.length + ')', { strong: true }));
		if (data.duplicates.length) {
			data.duplicates.slice(0, 6).forEach(function (item) {
				body.appendChild(line('· ' + item.title + ' — repeats "' + item.first + '"'));
			});
		} else {
			body.appendChild(line('none', { muted: true }));
		}

		body.appendChild(line('Candidates to drop', { strong: true }));
		data.ranked.forEach(function (item) {
			body.appendChild(line(item.score + '  ' + item.title + (item.watched ? '  (started)' : '')));
		});

		if (!data.ranked.length) {
			body.appendChild(line('no loaded playlist rows', { muted: true }));
		}
	}

	function close() {
		lastReport = '';
		if (panel) {
			panel.remove();
			panel = null;
		}
	}

	function open() {
		if (!enabled() || navigating || !isPlaylistPage() || !document.body) return;
		if (panel) {
			close();
			return;
		}

		var el = document.createElement('div'),
			head = document.createElement('div'),
			title = document.createElement('strong'),
			closeButton = document.createElement('button'),
			body = document.createElement('div'),
			refresh = document.createElement('button');

		el.id = 'it-playlist-health-panel';
		el.setAttribute('role', 'dialog');
		el.setAttribute('aria-label', 'Playlist health');
		el.style.cssText = 'position:fixed;left:16px;bottom:112px;z-index:2147483000;width:340px;max-height:60vh;overflow:auto;padding:12px;border-radius:12px;background:' +
			theme().bg + ';color:' + theme().fg + ';border:1px solid ' + theme().border +
			';box-shadow:0 8px 32px rgba(0,0,0,.35);font:13px/1.45 Roboto,Arial,sans-serif';

		head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px';
		title.textContent = 'Playlist health';
		closeButton.textContent = '×';
		closeButton.type = 'button';
		closeButton.setAttribute('aria-label', 'Close playlist health');
		closeButton.style.cssText = 'border:0;background:transparent;color:inherit;font-size:22px;line-height:1;cursor:pointer';
		closeButton.addEventListener('click', close);

		body.id = 'it-playlist-health-body';
		refresh.textContent = 'Rescan';
		refresh.type = 'button';
		refresh.style.cssText = 'margin-top:8px;padding:4px 8px;border-radius:6px;border:1px solid ' + theme().border +
			';background:transparent;color:inherit;font:inherit;cursor:pointer';
		refresh.addEventListener('click', render);

		head.appendChild(title);
		head.appendChild(closeButton);
		el.appendChild(head);
		el.appendChild(body);
		el.appendChild(refresh);
		document.body.appendChild(el);
		panel = el;
		render();
	}

	function makeButton() {
		var el = document.createElement('button');

		el.id = 'it-playlist-health-button';
		el.type = 'button';
		el.textContent = 'Health';
		el.title = 'Find unavailable rows, duplicates and never-watched candidates';
		el.style.cssText = 'position:fixed;left:16px;bottom:64px;z-index:2147483000;padding:8px 12px;border:1px solid ' +
			theme().border + ';border-radius:999px;background:' + theme().bg + ';color:' + theme().fg +
			';font:600 12px/1 Roboto,Arial,sans-serif;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.25)';
		el.addEventListener('click', open);

		return el;
	}

	function isPlaylistPage() {
		return (location.pathname === '/playlist' || location.pathname === '/watch') && /[?&]list=[^&]+/.test(location.search);
	}

	function listRoot() {
		return location.pathname === '/playlist'
			? document.querySelector('ytd-playlist-video-list-renderer, yt-item-section-renderer, ytd-item-section-renderer')
			: document.querySelector('ytd-watch-flexy ytd-playlist-panel-renderer, ytd-playlist-panel-renderer');
	}

	function apply() {
		clearTimeout(timer);
		timer = null;
		if (!enabled() || navigating || !isPlaylistPage() || !document.body) {
			if (observer) observer.disconnect();
			observer = null;
			if (button) {
				button.remove();
				button = null;
			}
			close();
			return;
		}
		observe();
		if (!button || !document.contains(button)) {
			button = makeButton();
			document.body.appendChild(button);
		}
		render();
	}

	function observe() {
		if (observer || !document.body) {
			return;
		}

		observer = new MutationObserver(function (mutations) {
			if (mutations.some(function (mutation) {
				var target = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
				return target && !target.closest('#it-playlist-health-panel, #it-playlist-health-button') &&
					(!button?.isConnected || target.closest('ytd-playlist-video-list-renderer, yt-item-section-renderer, ytd-item-section-renderer, ytd-playlist-panel-renderer') ||
						Array.from(mutation.addedNodes || []).some(function (node) {
							return node.nodeType === 1 && (node.matches('ytd-playlist-video-list-renderer, yt-item-section-renderer, ytd-item-section-renderer, ytd-playlist-panel-renderer') ||
								node.querySelector('ytd-playlist-video-renderer, ytd-playlist-panel-video-renderer, yt-lockup-view-model'));
						}));
			})) schedule();
		});
		observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['href', 'title', 'style'] });
	}

	function schedule() {
		if (timer === null) timer = setTimeout(apply, 150);
	}
	document.addEventListener('init_completed', apply);
	document.addEventListener('DOMContentLoaded', apply);
	document.addEventListener('yt-navigate-start', function () { navigating = true; apply(); });
	document.addEventListener('yt-navigate-finish', function () { navigating = false; schedule(); });
	document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
	ImprovedTube.playlistHealth = apply;

	ImprovedTube.playlistHealthParseDuration = parseDuration;
	ImprovedTube.playlistHealthDecayScore = decayScore;
	ImprovedTube.playlistHealthReport = report;
})();
