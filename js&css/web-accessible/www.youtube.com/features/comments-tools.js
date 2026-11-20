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
		hidden = new Map(),
		timer = null,
		sortTimer = null,
		expandTimer = null,
		observer = null,
		sortTried = false,
		sortMenu = null,
		expanded = new WeakSet(),
		generation = 0,
		navigating = false,
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
		var match = location.search.match(/[?&]v=([\w-]{11})(?:&|$)/);

		return match ? match[1] : location.pathname;
	}

	function match(text, query) {
		return String(text || '').toLowerCase().indexOf(String(query || '').trim().toLowerCase()) !== -1;
	}

	function threads() {
		return Array.prototype.slice.call(document.querySelectorAll('ytd-comment-thread-renderer'));
	}

	function restore() {
		hidden.forEach(function (previous, thread) {
			if (thread.style.display === 'none') thread.style.setProperty('display', previous.value, previous.priority);
		});
		hidden.clear();
	}

	function setCount(text) {
		if (count && count.textContent !== text) count.textContent = text;
	}

	function run(query) {
		restore();

		var all = threads(),
			shown = 0;

		if (!query.trim()) {
			setCount(all.length + ' loaded');
			return;
		}

		all.forEach(function (thread) {
			if (match(thread.textContent, query)) {
				shown++;
			} else {
				hidden.set(thread, { value: thread.style.getPropertyValue('display'), priority: thread.style.getPropertyPriority('display') });
				thread.style.setProperty('display', 'none', 'important');
			}
		});

		setCount(shown + ' / ' + all.length);
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
		var menu = document.querySelector('ytd-comments-header-renderer #sort-menu'),
			token = generation,
			attempts = 0;
		if (!menu || (sortTried && sortMenu === menu)) return;
		clearTimeout(sortTimer);
		sortMenu = menu;
		sortTried = true;
		var trigger = menu.querySelector('button, tp-yt-paper-dropdown-menu') || menu;
		trigger.click();
		function select() {
			sortTimer = null;
			if (token !== generation || !enabledSort() || navigating || !onWatchPage() || !menu.isConnected) return;
			var items = Array.from(menu.querySelectorAll('tp-yt-paper-item, ytd-menu-navigation-item-renderer, ytd-menu-service-item-renderer'))
					.filter(function (item) { return item.offsetParent !== null; }),
				index = newestIndex(items.map(function (item) { return item.textContent.trim(); }));
			if (index !== -1) items[index].click();
			else if (!items.length && ++attempts < 8) sortTimer = setTimeout(select, 150);
		}
		sortTimer = setTimeout(select, 150);
	}

	function expandAll() {
		if (expandTimer !== null || !enabledExpand()) return;
		var token = generation;
		function next() {
			expandTimer = null;
			if (token !== generation || !enabledExpand() || navigating || !onWatchPage()) return;
			var button = Array.from(document.querySelectorAll('ytd-comment-thread-renderer #more-replies button, ytd-comment-thread-renderer #more-replies-sub-thread button'))
				.find(function (item) { return !expanded.has(item) && item.offsetParent !== null && !item.disabled && item.getAttribute('aria-expanded') !== 'true'; });
			if (!button) return;
			expanded.add(button);
			button.click();
			expandTimer = setTimeout(next, 250);
		}
		expandTimer = setTimeout(next, 250);
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
		input.addEventListener('input', schedule);
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
		clearTimeout(timer);
		timer = null;
		var key = videoKey();
		if (key !== lastVideo) {
			cleanup();
			lastVideo = key;
		}
		if (navigating || !onWatchPage() || (!enabledSearch() && !enabledSort() && !enabledExpand())) { cleanup(); return; }
		if (!document.body) return;
		if (!observer) {
			observer = new MutationObserver(function (mutations) {
				if (mutations.some(function (mutation) {
					var target = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
					if (!target || target.closest('#it-comments-search-bar')) return false;
					return target.closest('ytd-comments, #comments, ytd-comment-thread-renderer, ytd-comments-header-renderer') ||
						Array.from(mutation.addedNodes).some(function (node) {
							return node.nodeType === 1 && (node.matches('ytd-comments, #comments, ytd-comment-thread-renderer, ytd-comments-header-renderer') || node.querySelector('ytd-comments, #comments, ytd-comment-thread-renderer, ytd-comments-header-renderer'));
						});
				})) schedule();
			});
			observer.observe(document.body, { childList: true, subtree: true, characterData: true });
		}
		if (!enabledSort()) { clearTimeout(sortTimer); sortTimer = null; sortTried = false; }
		if (!enabledExpand()) { clearTimeout(expandTimer); expandTimer = null; expanded = new WeakSet(); }

		var header = document.querySelector('ytd-comments-header-renderer');

		if (enabledSearch() && header) {
			if (!bar || !document.contains(bar)) {
				clearBar();
				bar = makeBar();
				header.insertBefore(bar, header.firstChild);
				run('');
			} else if (input) {
				run(input.value);
			}
		} else {
			clearBar();
		}

		if (enabledSort()) sortNewest();
		if (enabledExpand()) expandAll();
	}

	function cleanup() {
		generation++;
		clearTimeout(timer);
		clearTimeout(sortTimer);
		clearTimeout(expandTimer);
		timer = sortTimer = expandTimer = null;
		if (observer) observer.disconnect();
		observer = null;
		sortTried = false;
		sortMenu = null;
		expanded = new WeakSet();
		clearBar();
	}

	function schedule() {
		if (timer === null) timer = setTimeout(apply, 120);
	}

	document.addEventListener('init_completed', apply);
	document.addEventListener('DOMContentLoaded', apply);
	document.addEventListener('yt-navigate-start', function () { navigating = true; cleanup(); });
	document.addEventListener('yt-navigate-finish', function () { navigating = false; schedule(); });
	ImprovedTube.commentsSearch = apply;
	ImprovedTube.commentsSortNewest = apply;
	ImprovedTube.commentsExpandAll = apply;

	ImprovedTube.commentsToolsMatch = match;
	ImprovedTube.commentsToolsNewestIndex = newestIndex;
})();
