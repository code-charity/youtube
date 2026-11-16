/*--------------------------------------------------------------
>>> SMART FILTERS
----------------------------------------------------------------
Hides browse rows whose title contains one of the keywords or
whose duration falls outside the chosen band. Detection only:
nothing is blocklisted, reported or stored per video.
--------------------------------------------------------------*/
(function () {
	'use strict';

	var SELECTOR = 'ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-playlist-video-renderer, yt-lockup-view-model',
		BROWSE = /^\/($|results|feed|channel|playlist|@|c\/|user\/)/,
		timer = null,
		pill = null,
		showHidden = false;

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
		var match = String(text || '').trim().match(/^(\d{1,2}:)?(\d{1,2}):(\d{2})$/),
			parts;

		if (!match) {
			return null;
		}

		parts = String(text).trim().split(':').map(Number);

		if (parts.length === 2) {
			return parts[0] * 60 + parts[1];
		}

		return parts[0] * 3600 + parts[1] * 60 + parts[2];
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
			return !row.closest('ytd-watch-flexy');
		});
	}

	function paint() {
		var list = keywords(),
			mode = ImprovedTube.storage.smart_filter_duration || 'any',
			hiddenCount = 0,
			total = 0;

		rows().forEach(function (row) {
			var hide = shouldHide(titleOf(row), durationOf(row), mode, list);

			total++;

			if (hide) {
				hiddenCount++;
				row.classList.add('it-smart-hidden');
			} else {
				row.classList.remove('it-smart-hidden');
			}
		});

		return { hidden: hiddenCount, total: total };
	}

	function makePill() {
		var el = document.createElement('button');

		el.id = 'it-smart-filter-pill';
		el.type = 'button';
		el.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483000;padding:7px 10px;border-radius:16px;border:1px solid rgba(128,128,128,.4);background:rgba(32,32,32,.9);color:#fff;font:12px/1 Roboto,Arial,sans-serif;cursor:pointer;display:none';
		el.addEventListener('click', function () {
			showHidden = !showHidden;
			document.body.classList.toggle('it-smart-show', showHidden);
			paintPill();
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
		pill.textContent = showHidden ? 'Unfilter (' + count + ' hidden)' : count + ' hidden by filters';
		pill.setAttribute('aria-pressed', showHidden ? 'true' : 'false');
	}

	function apply() {
		if (!enabled() || !BROWSE.test(location.pathname)) {
			document.querySelectorAll('.it-smart-hidden').forEach(function (row) {
				row.classList.remove('it-smart-hidden');
			});
			if (pill) {
				pill.style.display = 'none';
			}
			return;
		}

		if (!pill) {
			makePill();
		}

		paintPill(paint().hidden);
	}

	function schedule() {
		clearTimeout(timer);
		timer = setTimeout(apply, 200);
	}

	document.addEventListener('init_completed', apply);
	document.addEventListener('yt-navigate-finish', schedule);
	document.addEventListener('it-message-from-extension', schedule);

	new MutationObserver(function (mutations) {
		for (var i = 0; i < mutations.length; i++) {
			if (mutations[i].addedNodes.length) {
				schedule();
				return;
			}
		}
	}).observe(document.documentElement, { childList: true, subtree: true });

	ImprovedTube.smartFiltersMatchKeywords = matchesKeywords;
	ImprovedTube.smartFiltersDurationSeconds = durationSeconds;
	ImprovedTube.smartFiltersShouldHide = shouldHide;
})();
