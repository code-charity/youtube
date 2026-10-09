/* Accessibility repair for ImprovedTube controls injected into YouTube. */
(function (root, factory) {
	'use strict';
	const api = factory(root);
	if (typeof module !== 'undefined' && module.exports) module.exports = api;
	if (root) root.ImprovedTubePageAccessibility = api;
	if (root && root.document && typeof module === 'undefined') api.install();
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
	'use strict';

	const classNames = {
		'it-add-to-blocklist': 'Add or remove video from blocklist',
		'it-add-channel-to-blocklist': 'Add or remove channel from blocklist',
		'it-playlist-copy-video-id': 'Copy video ID',
		'it-popup-window': 'Open video in popup window',
		'it-scroll-to-top': 'Scroll to top'
	};

	function textName (element) {
		if (!element) return '';
		const aria = element.getAttribute && element.getAttribute('aria-label');
		if (aria && aria.trim()) return aria.trim();
		const text = typeof element.textContent === 'string' ? element.textContent.trim() : '';
		if (text) return text;
		const title = element.getAttribute && element.getAttribute('title');
		if (title && title.trim()) return title.trim();
		if (element.dataset) {
			if (element.dataset.tooltip && element.dataset.tooltip.trim()) return element.dataset.tooltip.trim();
			if (element.dataset.title && element.dataset.title.trim()) return element.dataset.title.trim();
		}
		if (element.classList) {
			for (const [className, label] of Object.entries(classNames)) if (element.classList.contains(className)) return label;
		}
		return '';
	}

	function decorateSvg (element) {
		if (!element || typeof element.querySelector !== 'function') return;
		const svg = element.querySelector('svg');
		if (svg) {
			svg.setAttribute('aria-hidden', 'true');
			svg.setAttribute('focusable', 'false');
		}
	}

	function enhanceControl (element) {
		if (!element) return element;
		const name = textName(element);
		if (name && element.setAttribute) element.setAttribute('aria-label', name);
		decorateSvg(element);
		return element;
	}

	function ensureStatusRegion () {
		if (!root.document) return null;
		let status = root.document.getElementById('it-a11y-status');
		if (!status) {
			status = root.document.createElement('div');
			status.id = 'it-a11y-status';
			status.setAttribute('role', 'status');
			status.setAttribute('aria-live', 'polite');
			status.setAttribute('aria-atomic', 'true');
			status.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
			(root.document.body || root.document.documentElement).appendChild(status);
		}
		return status;
	}

	function announceIfFeedback (element) {
		if (!element || !element.dataset) return;
		const value = element.dataset.tooltip || element.dataset.title || '';
		if (!/copied|error|failed|saved|done|complete/i.test(value)) return;
		const status = ensureStatusRegion();
		if (status) status.textContent = value;
	}

	function enhanceFrame (frame) {
		if (!frame || !frame.setAttribute) return;
		if (!frame.getAttribute('title')) frame.setAttribute('title', 'ImprovedTube settings');
	}

	function enhanceRoot (container) {
		if (!container || typeof container.querySelectorAll !== 'function') return;
		const selector = 'button[class*="it-"],a[class*="it-"],button[id^="it-"],a[id^="it-"],.it-player-button,.it-button';
		if (container.matches && container.matches(selector)) enhanceControl(container);
		for (const element of container.querySelectorAll(selector)) enhanceControl(element);
		if (container.matches && container.matches('iframe.it-button__iframe')) enhanceFrame(container);
		for (const frame of container.querySelectorAll('iframe.it-button__iframe')) enhanceFrame(frame);
	}

	function pageStyleText () {
		return 'button[class*="it-"]:focus-visible,a[class*="it-"]:focus-visible,button[id^="it-"]:focus-visible,a[id^="it-"]:focus-visible,.it-player-button:focus-visible,.it-button:focus-visible{outline:2px solid Highlight!important;outline-offset:2px!important}';
	}

	function installFocusStyle () {
		if (!root.document || root.document.getElementById('it-page-a11y-style')) return;
		const style = root.document.createElement('style');
		style.id = 'it-page-a11y-style';
		style.textContent = pageStyleText();
		(root.document.head || root.document.documentElement).appendChild(style);
	}

	function install () {
		if (!root.document || root.__itA11yPageInstalled) return;
		root.__itA11yPageInstalled = true;
		installFocusStyle();
		ensureStatusRegion();
		enhanceRoot(root.document);
		if (typeof MutationObserver !== 'undefined') {
			const observer = new MutationObserver(function (mutations) {
				for (const mutation of mutations) {
					if (mutation.type === 'attributes') {
						enhanceControl(mutation.target);
						announceIfFeedback(mutation.target);
					}
					for (const node of mutation.addedNodes || []) if (node && node.nodeType === 1) enhanceRoot(node);
				}
			});
			observer.observe(root.document.documentElement, {subtree: true, childList: true, attributes: true, attributeFilter: ['data-title', 'data-tooltip', 'title']});
		}
	}

	return {textName, decorateSvg, enhanceControl, enhanceFrame, enhanceRoot, ensureStatusRegion, announceIfFeedback, pageStyleText, install};
});
