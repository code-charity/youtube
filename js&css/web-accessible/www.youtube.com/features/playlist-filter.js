/*--------------------------------------------------------------
>>> PLAYLIST ROW FILTER
----------------------------------------------------------------
A live text filter for playlist rows. Hides rows whose title and
channel do not match; Escape clears. Works on /playlist and in the
playlist panel beside a video.
--------------------------------------------------------------*/
(function () {
	'use strict';

	var bar = null,
		input = null,
		count = null,
		hidden = [],
		timer = null,
		observer = null;

	function enabled() {
		return ImprovedTube.storage.playlist_filter === true;
	}

	function match(text, query) {
		return String(text || '').toLowerCase().indexOf(String(query || '').trim().toLowerCase()) !== -1;
	}

	function videoId(href) {
		var match = String(href || '').match(/[?&]v=([^&]{11})/);

		return match ? match[1] : null;
	}

	function rows() {
		var list = [],
			selector = 'ytd-playlist-video-renderer, ytd-playlist-panel-video-renderer';

		if (location.pathname === '/playlist') {
			selector += ', #contents yt-lockup-view-model';
		} else {
			selector += ', ytd-playlist-panel-renderer yt-lockup-view-model';
		}

		document.querySelectorAll(selector).forEach(function (row) {
			if (row.closest('#it-playlist-filter-bar')) {
				return;
			}

			var link = row.querySelector('a[href*="/watch?v="]');

			if (link && videoId(link.getAttribute('href'))) {
				list.push(row);
			}
		});

		return list;
	}

	function textOf(row) {
		var title = row.querySelector('#video-title, h3'),
			channel = row.querySelector('ytd-channel-name a, a[href*="/@"], a[href*="/channel/"]');

		return {
			title: title ? title.textContent : row.textContent,
			channel: channel ? channel.textContent : ''
		};
	}

	function restore() {
		hidden.forEach(function (row) {
			if (row.style.display === 'none') {
				row.style.display = '';
			}
		});
		hidden = [];
	}

	function run(query) {
		restore();

		var all = rows(),
			shown = 0;

		if (!query.trim()) {
			if (count) {
				count.textContent = all.length + ' rows';
			}
			return;
		}

		all.forEach(function (row) {
			var text = textOf(row);

			if (match(text.title, query) || match(text.channel, query)) {
				shown++;
			} else {
				row.style.display = 'none';
				hidden.push(row);
			}
		});

		if (count) {
			count.textContent = shown + ' / ' + all.length;
		}
	}

	function theme() {
		var dark = document.documentElement.hasAttribute('dark');

		return {
			fg: dark ? '#f1f1f1' : '#0f0f0f',
			chip: dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.04)',
			border: dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)'
		};
	}

	function makeBar() {
		var el = document.createElement('div'),
			label = document.createElement('span'),
			clear = document.createElement('button');

		el.id = 'it-playlist-filter-bar';
		el.style.cssText = 'display:flex;align-items:center;gap:8px;margin:8px 0;padding:6px 8px;border-radius:8px;border:1px solid ' +
			theme().border + ';background:' + theme().chip + ';color:' + theme().fg + ';font:13px/1.4 Roboto,Arial,sans-serif';

		label.textContent = 'Filter';
		label.style.cssText = 'flex:0 0 auto;opacity:.8';

		input = document.createElement('input');
		input.type = 'search';
		input.placeholder = 'Title or channel';
		input.setAttribute('aria-label', 'Filter playlist rows');
		input.style.cssText = 'flex:1 1 auto;min-width:80px;padding:4px 6px;border:1px solid ' + theme().border +
			';border-radius:6px;background:transparent;color:inherit;font:inherit';
		input.addEventListener('input', function () {
			clearTimeout(timer);
			timer = setTimeout(function () { run(input.value); }, 100);
		});
		input.addEventListener('keydown', function (event) {
			if (event.key === 'Escape') {
				input.value = '';
				run('');
			}
		});

		count = document.createElement('span');
		count.textContent = rows().length + ' rows';
		count.style.cssText = 'flex:0 0 auto;opacity:.7;font-size:12px';

		clear.textContent = '×';
		clear.type = 'button';
		clear.title = 'Clear filter';
		clear.setAttribute('aria-label', 'Clear filter');
		clear.style.cssText = 'flex:0 0 auto;border:0;background:transparent;color:inherit;font-size:18px;line-height:1;cursor:pointer;opacity:.7';
		clear.addEventListener('click', function () {
			input.value = '';
			run('');
			input.focus();
		});

		el.appendChild(label);
		el.appendChild(input);
		el.appendChild(count);
		el.appendChild(clear);

		return el;
	}

	function anchor() {
		if (location.pathname === '/playlist') {
			// The rows live in the right column; the header renderer is the left card,
			// so anchoring to the item section keeps the bar at the list's full width.
			var section = document.querySelector('yt-item-section-renderer');

			if (section) {
				return { el: section, where: 'beforebegin' };
			}

			var header = document.querySelector('ytd-playlist-header-renderer');

			if (header) {
				return { el: header, where: 'afterend' };
			}
		}

		var panel = document.querySelector('ytd-playlist-panel-renderer #items, ytd-playlist-panel-renderer');

		return panel ? { el: panel, where: 'beforebegin' } : null;
	}

	function clearBar() {
		restore();

		if (bar) {
			bar.remove();
			bar = null;
			input = null;
			count = null;
		}
	}

	function apply() {
		if (!enabled()) {
			clearBar();
			return;
		}

		if (bar && document.contains(bar)) {
			run(input ? input.value : '');
			return;
		}

		bar = null;
		var spot = anchor();

		if (!spot) {
			return;
		}

		bar = makeBar();

		if (spot.where === 'afterend') {
			spot.el.insertAdjacentElement('afterend', bar);
		} else {
			spot.el.insertAdjacentElement('beforebegin', bar);
		}

		if (input) {
			run('');
		}
	}

	function observe() {
		if (observer || !document.body) {
			return;
		}

		observer = new MutationObserver(function () {
			if (!enabled() || !input || !input.value) {
				return;
			}

			clearTimeout(timer);
			timer = setTimeout(function () { run(input.value); }, 250);
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}

	document.addEventListener('init_completed', function () { observe(); apply(); });
	document.addEventListener('yt-navigate-finish', function () { setTimeout(apply, 150); });
	document.addEventListener('it-message-from-extension', function () { setTimeout(apply, 0); });

	ImprovedTube.playlistFilterMatch = match;
	ImprovedTube.playlistFilterVideoId = videoId;
})();
