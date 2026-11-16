/*--------------------------------------------------------------
>>> COMMENTS TOOLS
----------------------------------------------------------------
Search loaded comments, expand replies, and ask YouTube for the
newest-first order. Styling and data stay YouTube's; this only
drives the existing controls and hides non-matching threads.
--------------------------------------------------------------*/
(function () {
	'use strict';

	var bar = null,
		input = null,
		count = null,
		hidden = [],
		timer = null,
		didSort = {},
		didExpand = {},
		lastVideo = null;

	function enabledSearch() {
		return ImprovedTube.storage.comments_search === true;
	}

	function enabledSort() {
		return ImprovedTube.storage.comments_sort_newest === true;
	}

	function enabledExpand() {
		return ImprovedTube.storage.comments_expand_all === true;
	}

	function onWatchPage() {
		return location.pathname === '/watch';
	}

	function videoKey() {
		var match = location.search.match(/[?&]v=([^&]{11})/);

		return match ? match[1] : location.pathname;
	}

	function match(text, query) {
		return String(text || '').toLowerCase().indexOf(String(query || '').trim().toLowerCase()) !== -1;
	}

	function threads() {
		return Array.prototype.slice.call(document.querySelectorAll('ytd-comment-thread-renderer'));
	}

	function restore() {
		hidden.forEach(function (thread) {
			if (thread.style.display === 'none') {
				thread.style.display = '';
			}
		});
		hidden = [];
	}

	function run(query) {
		restore();

		var all = threads(),
			shown = 0;

		if (!query.trim()) {
			if (count) {
				count.textContent = all.length + ' loaded';
			}
			return;
		}

		all.forEach(function (thread) {
			if (match(thread.textContent, query)) {
				shown++;
			} else {
				thread.style.display = 'none';
				hidden.push(thread);
			}
		});

		if (count) {
			count.textContent = shown + ' / ' + all.length;
		}
	}

	/** Index of the "newest first" item in a list of menu labels, or -1. */
	function newestIndex(labels) {
		var pattern = /newest|最新|nuevos|récent|recent|neueste|新しい|최신/i;

		for (var i = 0; i < labels.length; i++) {
			if (pattern.test(labels[i])) {
				return i;
			}
		}

		return -1;
	}

	function sortNewest() {
		var menu = document.querySelector('#sort-menu button, #sort-menu tp-yt-paper-dropdown-menu, #sort-menu');

		if (!menu) {
			return false;
		}

		menu.click();

		setTimeout(function () {
			var items = Array.prototype.slice.call(document.querySelectorAll(
					'tp-yt-paper-item, ytd-menu-navigation-item-renderer, ytd-menu-service-item-renderer'
				)).filter(function (item) {
					return item.offsetParent !== null;
				}),
				index = newestIndex(items.map(function (item) { return item.textContent.trim(); }));

			if (index !== -1) {
				items[index].click();
			}
		}, 150);

		return true;
	}

	function expandAll(round) {
		var buttons = Array.prototype.slice.call(document.querySelectorAll(
			'#more-replies button, ytd-comment-replies-renderer #more-replies button, #more-replies-sub-thread button'
		)).filter(function (button) {
			return button.offsetParent !== null;
		});

		buttons.slice(0, 40).forEach(function (button) {
			button.click();
		});

		// Replies render in waves; two more passes pick up the buttons created by the first.
		if (buttons.length && (round || 0) < 2) {
			setTimeout(function () { expandAll((round || 0) + 1); }, 900);
		}
	}

	function theme() {
		var dark = document.documentElement.hasAttribute('dark');

		return {
			fg: dark ? '#f1f1f1' : '#0f0f0f',
			border: dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)',
			chip: dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.04)'
		};
	}

	function makeBar() {
		var el = document.createElement('div'),
			label = document.createElement('span'),
			clear = document.createElement('button');

		el.id = 'it-comments-search-bar';
		el.style.cssText = 'display:flex;align-items:center;gap:8px;margin:8px 0;padding:6px 8px;border-radius:8px;border:1px solid ' +
			theme().border + ';background:' + theme().chip + ';color:' + theme().fg + ';font:13px/1.4 Roboto,Arial,sans-serif';

		label.textContent = 'Search';
		label.style.cssText = 'flex:0 0 auto;opacity:.8';

		input = document.createElement('input');
		input.type = 'search';
		input.placeholder = 'Filter loaded comments';
		input.setAttribute('aria-label', 'Search loaded comments');
		input.style.cssText = 'flex:1 1 auto;min-width:80px;padding:4px 6px;border:1px solid ' + theme().border +
			';border-radius:6px;background:transparent;color:inherit;font:inherit';
		input.addEventListener('input', function () {
			clearTimeout(timer);
			timer = setTimeout(function () { run(input.value); }, 120);
		});
		input.addEventListener('keydown', function (event) {
			if (event.key === 'Escape') {
				input.value = '';
				run('');
			}
		});

		count = document.createElement('span');
		count.textContent = threads().length + ' loaded';
		count.style.cssText = 'flex:0 0 auto;opacity:.7;font-size:12px';

		clear.textContent = '×';
		clear.type = 'button';
		clear.title = 'Clear search';
		clear.setAttribute('aria-label', 'Clear comment search');
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
		if (!onWatchPage()) {
			clearBar();
			return;
		}

		var key = videoKey();

		if (key !== lastVideo) {
			lastVideo = key;
			didSort = {};
			didExpand = {};
		}

		var header = document.querySelector('ytd-comments-header-renderer');

		if (enabledSearch() && header) {
			if (!bar || !document.contains(bar)) {
				bar = makeBar();
				header.insertBefore(bar, header.firstChild);
				run('');
			} else if (input) {
				run(input.value);
			}
		} else {
			clearBar();
		}

		if (enabledSort() && !didSort[key] && document.querySelector('#sort-menu')) {
			didSort[key] = true;
			sortNewest();
		}

		if (enabledExpand() && !didExpand[key] && document.querySelector('ytd-comment-thread-renderer')) {
			didExpand[key] = true;
			expandAll(0);
		}
	}

	document.addEventListener('init_completed', apply);
	document.addEventListener('yt-navigate-finish', function () { setTimeout(apply, 600); });
	document.addEventListener('it-message-from-extension', function () { setTimeout(apply, 0); });

	ImprovedTube.commentsToolsMatch = match;
	ImprovedTube.commentsToolsNewestIndex = newestIndex;
})();
