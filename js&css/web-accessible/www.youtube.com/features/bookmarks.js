/*--------------------------------------------------------------
>>> BOOKMARKS
----------------------------------------------------------------
Named timestamps on a video. Stored per video id in
chrome.storage.local under the "bookmarks" key, through the
extension page world message bridge.
--------------------------------------------------------------*/
(function () {
	'use strict';

	var MAX_PER_VIDEO = 100,
		MAX_LABEL = 80,
		observer = null,
		timer = null,
		panelVideo = null,
		refreshPanel = null;

	function enabled() {
		return ImprovedTube.storage.bookmarks_enabled === true;
	}

	function videoId() {
		var match = location.search.match(/[?&]v=([\w-]{11})(?:&|$)/);
		return match ? match[1] : null;
	}

	function videoTitle() {
		var el = document.querySelector('h1.ytd-watch-metadata, h1 yt-formatted-string');
		return el ? el.textContent.trim() : (document.title.replace(/ - YouTube$/, '') || videoId());
	}

	function readAll() {
		var data = ImprovedTube.storage.bookmarks;
		return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
	}

	function listFor(id) {
		var list = readAll()[id];
		return cleanList(list);
	}

	function cleanList(list) {
		return (Array.isArray(list) ? list : []).filter(function (item) {
			return item && Number.isFinite(item.t) && item.t >= 0 && Number.isSafeInteger(Math.floor(item.t));
		}).map(function (item) {
			return {
				t: Math.floor(item.t),
				label: typeof item.label === 'string' ? item.label.slice(0, MAX_LABEL) : formatTime(item.t),
				at: Number.isFinite(item.at) && item.at >= 0 ? item.at : 0
			};
		}).sort(function (a, b) { return a.t - b.t; });
	}

	function writeAll(data) {
		// Set locally first: the storage-changed round trip is asynchronous, and the
		// panel must repaint on the click that caused the change.
		ImprovedTube.storage.bookmarks = data;
		ImprovedTube.messages.send({ action: 'set', key: 'bookmarks', value: data });
	}

	function formatTime(seconds) {
		var total = Number.isFinite(Number(seconds)) ? Math.max(0, Math.floor(Number(seconds))) : 0,
			h = Math.floor(total / 3600),
			m = Math.floor((total % 3600) / 60),
			s = total % 60,
			ss = s < 10 ? '0' + s : String(s);

		return h > 0 ? h + ':' + (m < 10 ? '0' + m : m) + ':' + ss : m + ':' + ss;
	}

	/** "1:05", "01:02:03" and "95" all become seconds; anything else is null. */
	function parseTime(text) {
		var value = String(text == null ? '' : text).trim();

		if (/^\d+$/.test(value)) {
			return Number.isSafeInteger(Number(value)) ? Number(value) : null;
		}

		var parts = value.split(':');

		if (parts.length < 2 || parts.length > 3 || parts.some(function (part) { return !/^\d+$/.test(part); })) {
			return null;
		}

		if (parts.slice(1).some(function (part) { return Number(part) >= 60; })) return null;
		var total = parts.reduce(function (sum, part) { return sum * 60 + Number(part); }, 0);
		return Number.isSafeInteger(total) ? total : null;
	}

	function add(list, seconds, label) {
		list = cleanList(list);
		if (!Number.isFinite(Number(seconds)) || Number(seconds) < 0 || !Number.isSafeInteger(Math.floor(Number(seconds)))) return list;
		var clean = String(label || '').trim().slice(0, MAX_LABEL),
			time = Math.floor(Number(seconds)),
			next = list.filter(function (item) { return item.t !== time; });
		if (next.length >= MAX_PER_VIDEO) return list;

		next.push({ t: time, label: clean || formatTime(time), at: Date.now() });
		next.sort(function (a, b) { return a.t - b.t; });

		return next;
	}

	function remove(list, index) {
		return list.filter(function (_item, i) { return i !== index; });
	}

	function exportText(_video, list) {
		return list.map(function (item) {
			return formatTime(item.t) + '  ' + item.label;
		}).join('\n');
	}

	function exportJson(video, list) {
		return JSON.stringify({
			video: video,
			bookmarks: list.map(function (item) { return { time: item.t, timestamp: formatTime(item.t), label: item.label }; })
		}, null, 2);
	}

	function download(name, text, type) {
		var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' }),
			url = URL.createObjectURL(blob),
			link = document.createElement('a');

		link.href = url;
		link.download = name;
		document.body.appendChild(link);
		link.click();
		link.remove();
		setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
	}

	function theme() {
		var dark = document.documentElement.hasAttribute('dark');

		return {
			bg: dark ? '#212121' : '#ffffff',
			fg: dark ? '#f1f1f1' : '#0f0f0f',
			chip: dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.05)',
			border: dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)',
			accent: '#065fd4'
		};
	}

	function button() {
		var id = videoId();

		if (!id || location.pathname !== '/watch') {
			return null;
		}

		var existing = document.querySelector('#it-bookmarks-button');

		if (existing) {
			return existing;
		}

		var anchor = document.querySelector('ytd-watch-metadata #subscribe-button, ytd-video-secondary-info-renderer #subscribe-button, #subscribe-button'),
			el = document.createElement('button'),
			svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		if (!anchor) {
			return null;
		}

		el.id = 'it-bookmarks-button';
		el.className = 'improvedtube-player-button';
		el.dataset.tooltip = 'Bookmarks';
		el.type = 'button';
		el.setAttribute('aria-label', 'Bookmarks');
		el.style.cssText = 'position:relative;margin-left:8px;width:36px;height:36px;border:0;border-radius:50%;background:' + theme().chip + ';color:' + theme().fg + ';cursor:pointer;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle';
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('width', '20');
		svg.setAttribute('height', '20');
		svg.style.fill = 'currentColor';
		path.setAttribute('d', 'M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z');
		svg.appendChild(path);
		el.appendChild(svg);
		el.addEventListener('click', function (event) {
			event.preventDefault();
			event.stopPropagation();
			togglePanel();
		});
		anchor.insertAdjacentElement('afterend', el);

		return el;
	}

	var panelCleanup = null;

	function closePanel() {
		var panel = document.querySelector('#it-bookmarks-panel');

		if (panelCleanup) {
			panelCleanup();
			panelCleanup = null;
		}

		if (panel) {
			panel.remove();
		}
		panelVideo = null;
		refreshPanel = null;
	}

	function togglePanel() {
		var panel = document.querySelector('#it-bookmarks-panel');

		if (panel) {
			closePanel();
		} else {
			openPanel();
		}
	}

	function openPanel() {
		if (!enabled() || location.pathname !== '/watch' || !document.body) return;
		closePanel();
		var id = videoId(),
			video = document.querySelector('#movie_player video, video.html5-main-video'),
			panel = document.createElement('div'),
			head = document.createElement('div'),
			title = document.createElement('strong'),
			close = document.createElement('button'),
			list = document.createElement('div'),
			form = document.createElement('form'),
			input = document.createElement('input'),
			save = document.createElement('button'),
			footer = document.createElement('div');

		if (!id) {
			return;
		}

		panel.id = 'it-bookmarks-panel';
		panelVideo = id;
		panel.setAttribute('role', 'dialog');
		panel.setAttribute('aria-label', 'Bookmarks');
		panel.style.cssText = 'position:fixed;top:64px;right:16px;z-index:2147483000;width:320px;max-height:70vh;overflow:auto;padding:12px;border-radius:12px;background:' + theme().bg + ';color:' + theme().fg + ';box-shadow:0 8px 32px rgba(0,0,0,.35);font:13px/1.45 Roboto,Arial,sans-serif;border:1px solid ' + theme().border;

		head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px';
		title.textContent = 'Bookmarks';
		title.style.fontSize = '15px';
		close.textContent = '×';
		close.type = 'button';
		close.setAttribute('aria-label', 'Close bookmarks');
		close.style.cssText = 'border:0;background:transparent;color:inherit;font-size:22px;line-height:1;cursor:pointer';
		close.addEventListener('click', closePanel);
		head.appendChild(title);
		head.appendChild(close);

		list.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-bottom:10px';

		function render() {
			list.textContent = '';

			var items = listFor(id);

			if (!items.length) {
				var empty = document.createElement('div');
				empty.textContent = 'No bookmarks on this video yet.';
				empty.style.cssText = 'opacity:.7;padding:8px 0';
				list.appendChild(empty);
				return;
			}

			items.forEach(function (item) {
				var row = document.createElement('div'),
					jump = document.createElement('button'),
					label = document.createElement('span'),
					del = document.createElement('button');

				row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid rgba(128,128,128,.15)';
				jump.textContent = formatTime(item.t);
				jump.type = 'button';
				jump.title = 'Jump to ' + formatTime(item.t);
				jump.style.cssText = 'flex:0 0 auto;border:0;border-radius:6px;padding:3px 7px;background:' + theme().chip + ';color:inherit;font:inherit;cursor:pointer';
				jump.addEventListener('click', function () {
					var current = document.querySelector('#movie_player video, video.html5-main-video');
					if (enabled() && videoId() === id && current) {
						current.currentTime = item.t;
					}
				});
				label.textContent = item.label;
				label.style.cssText = 'flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
				del.textContent = '🗑';
				del.type = 'button';
				del.title = 'Delete bookmark';
				del.style.cssText = 'flex:0 0 auto;border:0;background:transparent;color:inherit;cursor:pointer;opacity:.6';
				del.addEventListener('click', function () {
					if (!enabled() || videoId() !== id) return;
					var data = readAll();
					data[id] = listFor(id).filter(function (entry) { return entry.t !== item.t; });
					writeAll(data);
					render();
				});
				row.appendChild(jump);
				row.appendChild(label);
				row.appendChild(del);
				list.appendChild(row);
			});
		}

		input.type = 'text';
		input.setAttribute('aria-label', 'Bookmark note');
		input.placeholder = 'Name (blank = timestamp)';
		input.maxLength = MAX_LABEL;
		input.style.cssText = 'flex:1 1 auto;min-width:0;padding:6px 8px;border-radius:6px;border:1px solid ' + theme().border + ';background:transparent;color:inherit;font:inherit';
		save.textContent = 'Add at ' + formatTime(video ? video.currentTime : 0);
		save.type = 'submit';
		save.style.cssText = 'flex:0 0 auto;padding:6px 9px;border-radius:6px;border:0;background:' + theme().accent + ';color:#fff;font:inherit;cursor:pointer';
		form.style.cssText = 'display:flex;gap:6px;margin-bottom:10px';
		form.addEventListener('submit', function (event) {
			event.preventDefault();
			if (!enabled() || videoId() !== id) return;
			var current = document.querySelector('#movie_player video, video.html5-main-video');
			if (!current || !Number.isFinite(current.currentTime)) return;

			var at = current.currentTime,
				data = readAll();
			if (listFor(id).length >= MAX_PER_VIDEO && !listFor(id).some(function (item) { return item.t === Math.floor(at); })) {
				save.textContent = '100 bookmarks saved — delete one first';
				return;
			}

			data[id] = add(listFor(id), at, input.value || formatTime(at));
			writeAll(data);
			input.value = '';
			render();
		});

		footer.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap';
		[['TXT', 'text'], ['JSON', 'json']].forEach(function (pair) {
			var b = document.createElement('button');
			b.type = 'button';
			b.textContent = 'Export ' + pair[0];
			b.style.cssText = 'padding:5px 8px;border-radius:6px;border:1px solid ' + theme().border + ';background:transparent;color:inherit;font:inherit;cursor:pointer';
			b.addEventListener('click', function () {
				if (!enabled() || videoId() !== id) return;
				var items = listFor(id),
					video_ = { id: id, title: videoTitle() };

				if (!items.length) {
					return;
				}

				download('bookmarks-' + id + '.' + (pair[1] === 'json' ? 'json' : 'txt'),
					pair[1] === 'json' ? exportJson(video_, items) : exportText(video_, items),
					pair[1] === 'json' ? 'application/json' : 'text/plain;charset=utf-8');
			});
			footer.appendChild(b);
		});

		form.appendChild(input);
		form.appendChild(save);
		panel.appendChild(head);
		panel.appendChild(list);
		panel.appendChild(form);
		panel.appendChild(footer);

		document.body.appendChild(panel);
		refreshPanel = render;
		render();
		setTimeout(function () { if (panel.isConnected) input.focus(); }, 50);

		if (video) {
			var updateLabel = function () {
				var current = document.querySelector('#movie_player video, video.html5-main-video');
				if (current) save.textContent = 'Add at ' + formatTime(current.currentTime);
			};

			document.addEventListener('timeupdate', updateLabel, true);
			panelCleanup = function () {
				document.removeEventListener('timeupdate', updateLabel, true);
			};
		}
	}

	function apply() {
		clearTimeout(timer);
		timer = null;
		if (panelVideo && panelVideo !== videoId()) closePanel();
		if (enabled() && location.pathname === '/watch' && videoId()) {
			button();
			if (!observer && document.body) {
				observer = new MutationObserver(function () {
					if (!document.querySelector('#it-bookmarks-button')) schedule();
				});
				observer.observe(document.body, { childList: true, subtree: true });
			}
		} else {
			if (observer) observer.disconnect();
			observer = null;
			var existing = document.querySelector('#it-bookmarks-button');
			if (existing) {
				existing.remove();
			}
			closePanel();
		}
	}

	function schedule() {
		if (timer === null) timer = setTimeout(apply, 50);
	}

	document.addEventListener('init_completed', apply);
	document.addEventListener('DOMContentLoaded', apply);
	document.addEventListener('yt-navigate-start', closePanel);
	document.addEventListener('yt-navigate-finish', schedule);
	ImprovedTube.bookmarksEnabled = apply;
	ImprovedTube.bookmarks = function () { if (refreshPanel) refreshPanel(); };
	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape') {
			closePanel();
		}
	});

	ImprovedTube.bookmarksFormatTime = formatTime;
	ImprovedTube.bookmarksParseTime = parseTime;
	ImprovedTube.bookmarksAdd = add;
	ImprovedTube.bookmarksRemove = remove;
	ImprovedTube.bookmarksExportText = exportText;
	ImprovedTube.bookmarksExportJson = exportJson;
	ImprovedTube.bookmarksOpen = openPanel;
})();
