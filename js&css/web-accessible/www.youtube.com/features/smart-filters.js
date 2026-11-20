/*--------------------------------------------------------------
>>> SMART FILTERS
----------------------------------------------------------------
Hides browse rows whose title contains one of the keywords or
whose duration falls within the chosen band. Detection only:
nothing is blocklisted, reported or stored per video.
--------------------------------------------------------------*/
(function () {
	'use strict';

	var SELECTOR = 'ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-playlist-video-renderer, yt-lockup-view-model',
		BROWSE = /^\/($|results|feed|channel|playlist|@|c\/|user\/)/,
		timer = null,
		pill = null,
		showHidden = false,
		hiddenCount = 0,
		hiddenRows = new Set(),
		observer = null,
		navigating = false;

	function enabled() {
		return ImprovedTube.storage.smart_filters === true;
	}

	function keywords() {
		return String(ImprovedTube.storage.smart_filter_keywords || '')
			.split(',')
			.map(function (part) { return part.trim().toLowerCase(); })
			.filter(Boolean);
	}

	function matchesKeywords(title, list) {
		var text = String(title || '').toLowerCase();

		return list.some(function (word) {
			return text.indexOf(word) !== -1;
		});
	}

	function durationSeconds(text) {
		var match = String(text || '').trim().match(/^(\d+:)?(\d+):(\d{2})$/),
			parts;

		if (!match) {
			return null;
		}

		parts = String(text).trim().split(':').map(Number);
		if (parts.slice(1).some(function (part) { return part > 59; })) return null;

		if (parts.length === 2) {
			var minutes = parts[0] * 60 + parts[1];
			return Number.isSafeInteger(minutes) ? minutes : null;
		}

		var hours = parts[0] * 3600 + parts[1] * 60 + parts[2];
		return Number.isSafeInteger(hours) ? hours : null;
	}

	/** @returns {boolean} true when the row should be hidden. */
	function shouldHide(title, duration, mode, list) {
		var seconds = durationSeconds(duration);

		if (list.length && matchesKeywords(title, list)) {
			return true;
		}

		if (!seconds || mode === 'any' || !mode) {
			return false;
		}

		if (mode === 'short') {
			return seconds < 240;
		}

		if (mode === 'medium') {
			return seconds >= 240 && seconds <= 1200;
		}

		if (mode === 'long') {
			return seconds > 1200;
		}

		return false;
	}

	function titleOf(row) {
		var el = row.querySelector('#video-title, a#video-title-link, h3 a, yt-formatted-string#video-title, .yt-lockup-metadata-view-model-wiz__title, a[title]');

		return el ? (el.getAttribute('title') || el.textContent).trim() : '';
	}

	function durationOf(row) {
		var el = row.querySelector('ytd-thumbnail-overlay-time-status-renderer #text, .badge-shape-wiz__text, badge-shape, [class*="Badge"]'),
			text = el ? el.textContent.trim() : '',
			i;

		if (durationSeconds(text)) {
			return text;
		}

		// Some lockups render the time as bare text; scan only short leaf nodes.
		var nodes = row.querySelectorAll('span, div');

		for (i = 0; i < nodes.length && i < 80; i++) {
			if (nodes[i].children.length === 0) {
				text = nodes[i].textContent.trim();
				if (text.length <= 8 && durationSeconds(text)) {
					return text;
				}
			}
		}

		return '';
	}

	function rows() {
		return Array.prototype.slice.call(document.querySelectorAll(SELECTOR)).filter(function (row) {
			return !row.closest('ytd-watch-flexy') && !row.parentElement?.closest(SELECTOR);
		});
	}

	function paint() {
		var list = keywords(),
			mode = ImprovedTube.storage.smart_filter_duration || 'any',
			hiddenCount = 0,
			total = 0,
			nextHidden = new Set();

		rows().forEach(function (row) {
			var hide = shouldHide(titleOf(row), durationOf(row), mode, list);

			total++;

			if (hide) {
				hiddenCount++;
				nextHidden.add(row);
				row.classList.add('it-smart-hidden');
			} else {
				row.classList.remove('it-smart-hidden');
			}
		});
		hiddenRows.forEach(function (row) { if (!nextHidden.has(row)) row.classList.remove('it-smart-hidden'); });
		hiddenRows = nextHidden;

		return { hidden: hiddenCount, total: total };
	}

	function makePill() {
		var el = document.createElement('button');

		el.id = 'it-smart-filter-pill';
		el.type = 'button';
		el.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483000;padding:7px 10px;border-radius:16px;border:1px solid rgba(128,128,128,.4);background:rgba(32,32,32,.9);color:#fff;font:12px/1 Roboto,Arial,sans-serif;cursor:pointer;display:none';
		el.addEventListener('click', function () {
			if (!enabled() || navigating) return;
			showHidden = !showHidden;
			document.body.classList.toggle('it-smart-show', showHidden);
			paintPill(hiddenCount);
		});

		document.body.appendChild(el);
		pill = el;
	}

	function paintPill(count) {
		if (!pill) {
			return;
		}

		if (!count) {
			pill.style.display = 'none';
			return;
		}

		pill.style.display = 'block';
		var text = showHidden ? 'Hide filtered videos again (' + count + ')' : count + ' hidden by filters';
		if (pill.textContent !== text) pill.textContent = text;
		pill.setAttribute('aria-pressed', showHidden ? 'true' : 'false');
	}

	function apply() {
		clearTimeout(timer);
		timer = null;
		if (!enabled() || navigating || !BROWSE.test(location.pathname)) {
			cleanup();
			return;
		}
		if (!document.body) return;

		if (!pill || !pill.isConnected) {
			makePill();
		}

		hiddenCount = paint().hidden;
		paintPill(hiddenCount);
		if (!observer) {
			observer = new MutationObserver(function (mutations) {
				if (!pill?.isConnected || mutations.some(function (mutation) {
					var target = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
					if (!target || target.closest('#it-smart-filter-pill')) return false;
					return target.closest(SELECTOR) || Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes)).some(function (node) {
						return node.nodeType === 1 && (node.matches(SELECTOR) || node.querySelector(SELECTOR));
					});
				})) schedule();
			});
			observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['href', 'title'] });
		}
	}

	function schedule() {
		if (timer === null) timer = setTimeout(apply, 200);
	}

	function cleanup() {
		clearTimeout(timer);
		timer = null;
		if (observer) observer.disconnect();
		observer = null;
		hiddenRows.forEach(function (row) { row.classList.remove('it-smart-hidden'); });
		hiddenRows.clear();
		if (pill) pill.remove();
		pill = null;
		showHidden = false;
		hiddenCount = 0;
		document.body?.classList.remove('it-smart-show');
	}

	function configure() {
		showHidden = false;
		document.body?.classList.remove('it-smart-show');
		apply();
	}

	document.addEventListener('init_completed', apply);
	document.addEventListener('DOMContentLoaded', apply);
	document.addEventListener('yt-navigate-start', function () { navigating = true; cleanup(); });
	document.addEventListener('yt-navigate-finish', function () { navigating = false; schedule(); });
	ImprovedTube.smartFilters = configure;
	ImprovedTube.smartFilterKeywords = configure;
	ImprovedTube.smartFilterDuration = configure;

	ImprovedTube.smartFiltersMatchKeywords = matchesKeywords;
	ImprovedTube.smartFiltersDurationSeconds = durationSeconds;
	ImprovedTube.smartFiltersShouldHide = shouldHide;
})();
