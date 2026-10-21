/* ImprovedTube accessibility compatibility layer.
 * Additive: preserves existing Satus behavior and visual layout.
 */
(function (root, factory) {
	'use strict';
	const api = factory(root);
	if (typeof module !== 'undefined' && module.exports) module.exports = api;
	if (root) root.ImprovedTubeMenuAccessibility = api;
	if (root && root.document && typeof module === 'undefined') api.install();
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
	'use strict';

	let idCounter = 0;

	function safeLocale (key, fallback, localizer) {
		if (!key) return fallback || '';
		try {
			if (localizer) {
				const translated = localizer(key);
				if (translated && translated !== key) return String(translated);
				if (translated && !fallback) return String(translated);
			}
			if (typeof satus !== 'undefined' && satus.locale && typeof satus.locale.get === 'function') {
				const translated = satus.locale.get(key);
				if (translated && translated !== key) return String(translated);
				if (translated && !fallback) return String(translated);
			}
		} catch (_) {}
		return fallback || String(key);
	}

	function skeletonName (element, localizer) {
		const skeleton = element && element.skeleton;
		if (skeleton) {
			for (const candidate of [skeleton.text, skeleton.label && skeleton.label.text, skeleton.title]) {
				if (typeof candidate === 'string' && candidate.trim()) {
					return safeLocale(candidate, candidate, localizer).trim();
				}
			}
		}
		const text = element && typeof element.textContent === 'string' ? element.textContent.trim() : '';
		return text;
	}

	function accessibleName (element, includeText) {
		if (!element) return '';
		const aria = element.getAttribute && element.getAttribute('aria-label');
		if (aria && aria.trim()) return aria.trim();
		const labelled = element.getAttribute && element.getAttribute('aria-labelledby');
		if (labelled && labelled.trim()) return labelled.trim();
		const title = element.getAttribute && element.getAttribute('title');
		if (title && title.trim()) return title.trim();
		if (includeText !== false) {
			const text = typeof element.textContent === 'string' ? element.textContent.trim() : '';
			if (text) return text;
		}
		return '';
	}

	function setLabel (element, label, includeText) {
		if (!element || !label || accessibleName(element, includeText)) return;
		if (element.setAttribute) element.setAttribute('aria-label', label);
	}

	function addKeyboardClick (element) {
		if (!element || element.__itA11yKeyboard) return;
		element.__itA11yKeyboard = true;
		element.addEventListener('keydown', function (event) {
			if (event.key === ' ' || event.key === 'Enter') {
				event.preventDefault();
				if (typeof this.click === 'function') this.click();
			}
		});
	}

	function enhanceSwitch (element, localizer) {
		if (!element) return element;
		element.setAttribute('role', 'switch');
		if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '0');
		element.setAttribute('aria-checked', element.dataset && String(element.dataset.value) === 'true' ? 'true' : 'false');
		setLabel(element, skeletonName(element, localizer));
		addKeyboardClick(element);
		return element;
	}

	function controlName (wrapper, localizer) {
		let name = skeletonName(wrapper, localizer);
		if (name) return name;

		const skeleton = wrapper && wrapper.skeleton;
		const parentSkeleton = skeleton && skeleton.parentSkeleton;
		if (parentSkeleton) {
			for (const candidate of [parentSkeleton.text, parentSkeleton.label && parentSkeleton.label.text, parentSkeleton.title]) {
				if (typeof candidate === 'string' && candidate.trim()) return safeLocale(candidate, candidate, localizer).trim();
			}
		}

		const parent = wrapper && (wrapper.parentElement || wrapper.parentNode);
		if (parent && parent !== wrapper) name = skeletonName(parent, localizer);
		return name || '';
	}

	function enhanceNativeControl (wrapper, selector, localizer) {
		if (!wrapper || typeof wrapper.querySelector !== 'function') return null;
		const control = wrapper.querySelector(selector);
		if (!control) return null;
		setLabel(control, controlName(wrapper, localizer), false);
		return control;
	}

	function enhanceCustomButton (element, localizer) {
		if (!element) return element;
		element.setAttribute('role', 'button');
		if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '0');
		setLabel(element, skeletonName(element, localizer));
		addKeyboardClick(element);
		return element;
	}

	function knownIconName (button) {
		try {
			if (typeof extension !== 'undefined' && extension.skeleton) {
				const h = extension.skeleton.header;
				if (h && h.sectionStart && h.sectionStart.back && h.sectionStart.back.rendered === button) return safeLocale('back', 'Back');
				if (h && h.sectionEnd) {
					if (h.sectionEnd.darkLightSwitch && h.sectionEnd.darkLightSwitch.rendered === button) return safeLocale('theme', 'Theme');
					if (h.sectionEnd.search && h.sectionEnd.search.rendered === button) return safeLocale('search', 'Search');
					if (h.sectionEnd.menu && h.sectionEnd.menu.rendered === button) return safeLocale('menu', 'Menu');
					if (h.sectionEnd.search && h.sectionEnd.search.on && h.sectionEnd.search.on.click && h.sectionEnd.search.on.click.close && h.sectionEnd.search.on.click.close.rendered === button) return safeLocale('close', 'Close');
				}
			}
		} catch (_) {}
		return '';
	}

	function enhanceButton (button) {
		if (!button) return;
		const name = skeletonName(button) || knownIconName(button);
		setLabel(button, name);
		const svg = typeof button.querySelector === 'function' ? button.querySelector('svg') : null;
		if (svg) {
			svg.setAttribute('aria-hidden', 'true');
			svg.setAttribute('focusable', 'false');
		}
	}

	function visuallyHiddenStyle () {
		if (!root.document || root.document.getElementById('it-a11y-style')) return;
		const style = root.document.createElement('style');
		style.id = 'it-a11y-style';
		style.textContent = [
			'.it-a11y-heading,.it-a11y-status{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}',
			'.satus-button:focus-visible,.satus-switch:focus-visible,.satus-shortcut:focus-visible,.satus-color-picker:focus-visible,.satus-select select:focus-visible,.satus-checkbox input:focus-visible,.satus-slider input:focus-visible{outline:2px solid Highlight!important;outline-offset:2px!important}'
		].join('\n');
		(root.document.head || root.document.documentElement).appendChild(style);
	}

	function ensureId (element, prefix) {
		if (element.id) return element.id;
		idCounter += 1;
		element.id = `${prefix || 'it-a11y'}-${idCounter}`;
		return element.id;
	}

	function enhanceSection (section) {
		if (!section || !section.dataset || !section.dataset.title || section.__itA11yHeading) return;
		if (!root.document || typeof root.document.createElement !== 'function') return;
		section.__itA11yHeading = true;
		const heading = root.document.createElement('h2');
		heading.className = 'it-a11y-heading';
		heading.textContent = section.dataset.title;
		heading.setAttribute('tabindex', '-1');
		ensureId(heading, 'it-a11y-heading');
		if (typeof section.insertBefore === 'function') section.insertBefore(heading, section.firstChild || null);
		else if (typeof section.appendChild === 'function') section.appendChild(heading);
		section.setAttribute('role', 'region');
		section.setAttribute('aria-labelledby', heading.id);
	}

	function isInteractiveElement (element) {
		if (!element || typeof element.focus !== 'function') return false;
		const tagName = String(element.tagName || '').toLowerCase();
		if (['button', 'input', 'select', 'textarea'].includes(tagName)) return true;
		if (tagName === 'a' && element.getAttribute && element.getAttribute('href')) return true;
		const role = element.getAttribute && element.getAttribute('role');
		if (role === 'button' || role === 'switch' || role === 'checkbox' || role === 'radio' || role === 'combobox' || role === 'link') return true;
		const tabindex = element.getAttribute && element.getAttribute('tabindex');
		return tabindex !== null && tabindex !== undefined && Number(tabindex) >= 0;
	}

	function firstFocusable (container) {
		if (!container || typeof container.querySelector !== 'function') return null;
		return container.querySelector('button:not([disabled]),[role="button"][tabindex="0"],[role="switch"][tabindex="0"],select:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex="0"]');
	}

	function isLayerComponent (element) {
		if (!element || !element.classList) return false;
		const tagName = String(element.tagName || '').toLowerCase();
		if (tagName === 'button' || tagName === 'input' || tagName === 'select' || tagName === 'textarea') return true;
		if (element.classList.contains('satus-switch') ||
			element.classList.contains('satus-select') ||
			element.classList.contains('satus-checkbox') ||
			element.classList.contains('satus-radio') ||
			element.classList.contains('satus-slider') ||
			element.classList.contains('satus-text-field') ||
			element.classList.contains('satus-time') ||
			element.classList.contains('satus-shortcut') ||
			element.classList.contains('satus-color-picker')) return true;
		return !!(element.classList.contains('satus-section') && element.dataset && element.dataset.title);
	}

	function componentLandingTarget (component) {
		if (!component) return null;
		if (component.classList && component.classList.contains('satus-section') && component.dataset && component.dataset.title) {
			const heading = component.querySelector && component.querySelector('.it-a11y-heading');
			return heading || component;
		}

		// For compound form components, focus the visible wrapper rather than the
		// native input/select inside it. This positions a screen reader at the first
		// logical item without forcing it straight into focus/forms mode.
		if (component.classList && (
			component.classList.contains('satus-select') ||
			component.classList.contains('satus-checkbox') ||
			component.classList.contains('satus-radio') ||
			component.classList.contains('satus-slider') ||
			component.classList.contains('satus-text-field') ||
			component.classList.contains('satus-time')
		)) {
			if (!component.hasAttribute || !component.hasAttribute('tabindex')) component.setAttribute('tabindex', '-1');
			return component;
		}

		return component;
	}

	function layerLandingTarget (layer) {
		if (!layer) return null;
		function walk (parent) {
			const children = parent && parent.children ? Array.from(parent.children) : [];
			for (const child of children) {
				if (isLayerComponent(child)) return componentLandingTarget(child);
				const nested = walk(child);
				if (nested) return nested;
			}
			return null;
		}
		return walk(layer);
	}

	function modalName (modal) {
		if (!modal || !modal.classList) return safeLocale('dialog', 'Dialog');
		if (modal.classList.contains('search-results')) return safeLocale('search', 'Search results');
		if (modal.classList.contains('satus-modal--vertical-menu')) return safeLocale('menu', 'Menu');
		if (modal.classList.contains('satus-modal--shortcut')) return safeLocale('shortcut', 'Keyboard shortcut');
		if (modal.classList.contains('satus-modal--color-picker')) return safeLocale('color', 'Color picker');
		return safeLocale('dialog', 'Dialog');
	}

	function ensureModalCloseButton (modal, surface) {
		if (!modal || !surface || !modal.classList || !modal.classList.contains('satus-modal--vertical-menu')) return null;
		const children = surface.children ? Array.from(surface.children) : [];
		for (const child of children) {
			if (child.getAttribute && child.getAttribute('data-it-a11y-close') === 'true') return child;
		}
		if (!root.document || typeof root.document.createElement !== 'function') return null;
		const button = root.document.createElement('button');
		button.type = 'button';
		button.className = 'satus-button it-a11y-modal-close';
		button.setAttribute('data-it-a11y-close', 'true');
		const label = safeLocale('close', 'Close');
		button.textContent = label;
		button.setAttribute('aria-label', label);
		button.addEventListener('click', function (event) {
			if (event && typeof event.preventDefault === 'function') event.preventDefault();
			if (typeof modal.close === 'function') modal.close();
		});
		if (typeof surface.appendChild === 'function') surface.appendChild(button);
		return button;
	}

	function enhanceModal (modal) {
		if (!modal || modal.__itA11yModal) return;
		modal.__itA11yModal = true;
		const surface = typeof modal.querySelector === 'function' ? (modal.querySelector('.satus-modal__surface') || modal) : modal;
		const isSearchResults = !!(modal.classList && modal.classList.contains('search-results'));

		if (isSearchResults) {
			// Search results are controlled by a search field outside this container.
			// Treating them as aria-modal would incorrectly imply that focus is trapped here.
			surface.setAttribute('role', 'region');
			surface.removeAttribute('aria-modal');
			setLabel(surface, modalName(modal), false);
			return;
		}

		surface.setAttribute('role', 'dialog');
		surface.setAttribute('aria-modal', 'true');
		setLabel(surface, modalName(modal), false);
		ensureModalCloseButton(modal, surface);
		setTimeout(function () {
			const target = firstFocusable(surface);
			if (target && typeof target.focus === 'function') target.focus();
		}, 0);
		// Escape and post-close focus intentionally remain under the original
		// ImprovedTube/Chrome popup behavior. Intercepting Escape here cannot
		// prevent Chrome from dismissing the extension popup and may conflict
		// with the browser's own focus restoration.
	}

	function enhanceIframe (frame) {
		if (!frame || frame.getAttribute('title')) return;
		frame.setAttribute('title', safeLocale('improvedTube', 'ImprovedTube content'));
	}

	function enhanceRoot (container) {
		if (!container || typeof container.querySelectorAll !== 'function') return;
		const includeSelf = function (selector, callback) {
			try { if (container.matches && container.matches(selector)) callback(container); } catch (_) {}
			for (const element of container.querySelectorAll(selector)) callback(element);
		};

		includeSelf('.satus-switch', function (el) { enhanceSwitch(el); });
		includeSelf('.satus-select', function (el) { enhanceNativeControl(el, 'select'); });
		includeSelf('.satus-checkbox', function (el) { enhanceNativeControl(el, 'input[type="checkbox"]'); });
		includeSelf('.satus-radio', function (el) { enhanceNativeControl(el, 'input[type="radio"]'); });
		includeSelf('.satus-slider', function (el) { enhanceNativeControl(el, 'input[type="range"]'); });
		includeSelf('.satus-text-field', function (el) { enhanceNativeControl(el, 'input,textarea'); });
		includeSelf('.satus-time', function (el) { enhanceNativeControl(el, 'select'); });
		includeSelf('.satus-shortcut,.satus-color-picker', function (el) { enhanceCustomButton(el); });
		includeSelf('button.satus-button', enhanceButton);
		includeSelf('.satus-section[data-title]', enhanceSection);
		includeSelf('.satus-modal', enhanceModal);
		includeSelf('iframe', enhanceIframe);

		const title = root.document && root.document.querySelector ? root.document.querySelector('.satus-span--title') : null;
		if (title) {
			title.setAttribute('role', 'heading');
			title.setAttribute('aria-level', '1');
		}
	}

	function focusNewestLayer (layers) {
		if (!layers || !root.document) return;
		const all = layers.querySelectorAll ? layers.querySelectorAll('.satus-layers__layer') : [];
		const layer = all && all.length ? all[all.length - 1] : null;
		if (!layer) return;
		setTimeout(function () {
			if (!layer.isConnected) return;
			const target = layerLandingTarget(layer) || firstFocusable(layer);
			if (target && typeof target.focus === 'function') target.focus();
		}, 0);
	}

	function install () {
		if (!root.document || root.__itA11yMenuInstalled) return;
		root.__itA11yMenuInstalled = true;
		visuallyHiddenStyle();

		const start = function () {
			enhanceRoot(root.document);
			if (typeof MutationObserver !== 'undefined') {
				const observer = new MutationObserver(function (mutations) {
					for (const mutation of mutations) {
						if (mutation.type === 'attributes' && mutation.target && mutation.target.classList && mutation.target.classList.contains('satus-switch')) {
							enhanceSwitch(mutation.target);
						}
							for (const node of mutation.addedNodes || []) {
							if (node && node.nodeType === 1) {
								enhanceRoot(node);
								if (node.matches?.('.satus-layers__layer')) {
									setTimeout(function () {
										const target = layerLandingTarget(node) || firstFocusable(node);
										if (target && typeof target.focus === 'function') target.focus();
									}, 0);
								}
							}
						}
					}
				});
				observer.observe(root.document.documentElement, {subtree: true, childList: true, attributes: true, attributeFilter: ['data-value', 'data-title']});
			}

			root.document.addEventListener('open', function (event) {
				const layers = event.target && event.target.classList && event.target.classList.contains('satus-layers') ? event.target : event.target?.closest?.('.satus-layers');
				if (layers) {
					enhanceRoot(layers);
					focusNewestLayer(layers);
				}
			}, true);
		};

		if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start, {once: true});
		else start();
	}

	return {
		safeLocale,
		skeletonName,
		controlName,
		accessibleName,
		enhanceSwitch,
		enhanceNativeControl,
		enhanceCustomButton,
		enhanceButton,
		enhanceSection,
		layerLandingTarget,
		ensureModalCloseButton,
		enhanceModal,
		enhanceIframe,
		enhanceRoot,
		install
	};
});
