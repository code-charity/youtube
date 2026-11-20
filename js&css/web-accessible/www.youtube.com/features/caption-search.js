/* Search the native transcript already loaded by YouTube (#4045). */
(function () {
	'use strict';

	const PANEL = 'ytd-engagement-panel-section-list-renderer[target-id*="transcript"]';
	const SEGMENT = 'ytd-transcript-segment-renderer, transcript-segment-view-model';
	const LIMIT = 100;
	let observer = null;
	let timer = null;
	let view = null;
	let query = '';
	let navigating = false;
	let route = null;
	let previousPanels = new WeakMap();
	let navigationPanels = new WeakMap();
	let previousVideo = null;

	function videoId() {
		if (location.pathname !== '/watch') return null;
		const match = location.search.match(/[?&]v=([\w-]{11})(?:&|$)/);
		return match ? match[1] : null;
	}

	function enabled() {
		return ImprovedTube.storage.caption_search === true && window.self === window.top && !!videoId();
	}

	function timestamp(text) {
		const value = String(text || '').replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '').trim();
		if (!/^\d+:[0-5]\d(?::[0-5]\d)?$/.test(value)) return null;
		const seconds = value.split(':').reduce(function (total, part) { return total * 60 + Number(part); }, 0);
		return Number.isSafeInteger(seconds) ? seconds : null;
	}

	function lines(panel) {
		return typeof ImprovedTube.readTranscriptSegments === 'function' ? ImprovedTube.readTranscriptSegments(panel) : [];
	}

	function expanded(panel) {
		return panel.isConnected && !panel.closest('[hidden]') && panel.getAttribute('visibility') === 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED';
	}

	function activePanel() {
		return Array.from(document.querySelectorAll(PANEL)).find(expanded) || null;
	}

	function setText(element, text) {
		if (element.textContent !== text) element.textContent = text;
	}

	function removeView() {
		if (view) view.root.remove();
		view = null;
	}

	function stop() {
		clearTimeout(timer);
		timer = null;
		if (observer) observer.disconnect();
		observer = null;
		removeView();
	}

	function fresh(panel, entries) {
		const previous = previousPanels.get(panel);
		if (!previous) return true;
		if (!entries.length) return false;
		// SPA navigation can keep the old expanded panel until the new transcript arrives.
		if (previous.first === panel.querySelector(SEGMENT) && previous.signature === JSON.stringify(entries)) return false;
		previousPanels.delete(panel);
		return true;
	}

	function jump(currentView, entry, index, id) {
		if (!enabled() || navigating || view !== currentView || !currentView.root.isConnected || videoId() !== id || !expanded(currentView.panel)) return;
		const needle = query.trim().toLowerCase();
		if (!needle || !entry.text.toLowerCase().includes(needle)) return;
		const current = lines(currentView.panel);
		if (!fresh(currentView.panel, current) || current[index]?.time !== entry.time || current[index]?.text !== entry.text) {
			render();
			return;
		}
		const seconds = timestamp(entry.time);
		const video = document.querySelector('#movie_player video');
		if (seconds === null || !video || !video.isConnected) return;
		let seekable = Number.isFinite(video.duration) && video.duration > 0 && seconds <= video.duration;
		if (!Number.isFinite(video.duration)) {
			for (let i = 0; i < video.seekable.length; i++) {
				if (seconds >= video.seekable.start(i) && seconds <= video.seekable.end(i)) seekable = true;
			}
		}
		if (!seekable) {
			setText(currentView.status, 'That timestamp is not available in the current video.');
			return;
		}
		try {
			video.currentTime = seconds;
		} catch {
			setText(currentView.status, 'The video is not ready to seek.');
		}
	}

	function render() {
		if (!view || !enabled() || navigating || !expanded(view.panel)) return;
		const entries = lines(view.panel);
		const ready = fresh(view.panel, entries);
		const needle = query.trim().toLowerCase();
		const signature = JSON.stringify([ready, needle, entries]);
		if (view.signature === signature) return;
		view.signature = signature;
		view.results.textContent = '';
		if (!ready) {
			setText(view.status, 'Waiting for this video’s transcript to replace the previous one.');
			return;
		}
		if (!entries.length) {
			setText(view.status, 'No transcript lines are loaded. Open a transcript using YouTube’s controls.');
			return;
		}
		if (!needle) {
			setText(view.status, entries.length + ' loaded lines. Enter text to search.');
			return;
		}
		let matches = 0;
		const currentView = view;
		const id = videoId();
		entries.forEach(function (entry, index) {
			if (!entry.text.toLowerCase().includes(needle)) return;
			matches++;
			if (matches > LIMIT) return;
			const item = document.createElement('li');
			const button = document.createElement('button');
			button.type = 'button';
			button.textContent = (entry.time || 'No timestamp') + ' — ' + entry.text;
			button.disabled = timestamp(entry.time) === null;
			if (button.disabled) button.title = 'This loaded line has no valid timestamp.';
			button.addEventListener('click', function () { if (button.isConnected) jump(currentView, entry, index, id); });
			item.appendChild(button);
			currentView.results.appendChild(item);
		});
		setText(view.status, matches + ' matches in ' + entries.length + ' loaded lines.' + (matches > LIMIT ? ' Showing the first ' + LIMIT + '.' : ''));
	}

	function createView(panel) {
		const root = document.createElement('section');
		const label = document.createElement('label');
		const row = document.createElement('div');
		const input = document.createElement('input');
		const clear = document.createElement('button');
		const hint = document.createElement('p');
		const status = document.createElement('p');
		const results = document.createElement('ul');
		root.id = 'it-caption-search';
		root.setAttribute('aria-label', 'Search loaded transcript');
		label.htmlFor = 'it-caption-search-input';
		label.textContent = 'Search loaded transcript';
		input.id = label.htmlFor;
		input.type = 'search';
		input.maxLength = 300;
		input.value = query;
		input.autocomplete = 'off';
		input.setAttribute('aria-describedby', 'it-caption-search-hint');
		input.addEventListener('input', function () { query = input.value; schedule(); });
		input.addEventListener('keydown', function (event) {
			if (event.isComposing || event.defaultPrevented) return;
			if (event.key === 'Escape') {
				event.preventDefault();
				event.stopPropagation();
				clear.click();
			} else if (event.key === 'Enter') {
				event.preventDefault();
				render();
				results.querySelector('button:not(:disabled)')?.click();
			} else if (event.key === 'ArrowDown') {
				const first = results.querySelector('button:not(:disabled)');
				if (first) { event.preventDefault(); first.focus(); }
			}
		});
		clear.type = 'button';
		clear.textContent = 'Clear';
		clear.setAttribute('aria-label', 'Clear caption search');
		clear.addEventListener('click', function () {
			query = input.value = '';
			render();
			input.focus();
		});
		hint.id = 'it-caption-search-hint';
		hint.textContent = 'Searches only the lines YouTube has loaded in this transcript. Select a result to seek.';
		status.setAttribute('role', 'status');
		status.setAttribute('aria-live', 'polite');
		results.setAttribute('aria-label', 'Matching loaded captions');
		row.append(input, clear);
		root.append(label, row, hint, status, results);
		panel.insertBefore(root, panel.firstChild);
		view = { root, panel, input, status, results, signature: '' };
	}

	function relevant(mutation) {
		const target = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
		if (!target || target.closest('#it-caption-search')) return false;
		if (target.matches(PANEL) || target.closest(PANEL)) return true;
		if (mutation.type === 'attributes' && target.querySelector(PANEL)) return true;
		return Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes)).some(function (node) {
			return node.nodeType === 1 && (node.matches(PANEL) || node.querySelector(PANEL));
		});
	}

	function apply() {
		clearTimeout(timer);
		timer = null;
		if (!enabled() || navigating || !document.body) { stop(); return; }
		if (route !== videoId()) {
			query = '';
			removeView();
			route = videoId();
		}
		if (!observer) {
			observer = new MutationObserver(function (mutations) {
				if (mutations.some(relevant)) schedule();
			});
			observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['visibility', 'hidden'] });
		}
		const panel = activePanel();
		if (!panel) { removeView(); return; }
		if (view && (view.panel !== panel || !view.root.isConnected)) removeView();
		if (!view) createView(panel);
		render();
	}

	function schedule() {
		if (timer === null) timer = setTimeout(apply, 100);
	}

	document.addEventListener('init_completed', apply);
	document.addEventListener('DOMContentLoaded', apply);
	document.addEventListener('yt-navigate-start', function () {
		navigationPanels = new WeakMap();
		previousVideo = route || videoId();
		if (enabled()) document.querySelectorAll(PANEL).forEach(function (panel) {
			navigationPanels.set(panel, { first: panel.querySelector(SEGMENT), signature: JSON.stringify(lines(panel)) });
		});
		navigating = true;
		query = '';
		stop();
	});
	document.addEventListener('yt-navigate-finish', function () {
		if (previousVideo !== videoId()) previousPanels = navigationPanels;
		navigationPanels = new WeakMap();
		navigating = false;
		apply();
	});
	ImprovedTube.captionSearch = function () {
		if (ImprovedTube.storage.caption_search !== true) query = '';
		apply();
	};
})();
