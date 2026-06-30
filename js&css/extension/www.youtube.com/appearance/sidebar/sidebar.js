/*--------------------------------------------------------------
>>> SIDEBAR
----------------------------------------------------------------
# Related videos
# Sticky navigation
# Side panels (accordions) - issue #4020
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# SIDE PANELS ACCORDION - issue #4020
--------------------------------------------------------------*/

extension.features.sidePanels = function (anything) {
	if (anything instanceof Event) {
		return;
	}

	if (extension.storage.get('side_panels') !== 'collapsed') {
		// Detach our interceptor so we don't fight YouTube when the feature is off.
		window.removeEventListener('click', extension.features.sidePanels.handleClick, true);
		window.removeEventListener('click', extension.features.sidePanels.handleHeaderClick, true);

		document.documentElement.removeAttribute('it-side-panels');

		var collapsed = document.querySelectorAll('#secondary #panels > [it-panel-collapsed], #playlist[it-panel-collapsed]');
		for (var i = 0, l = collapsed.length; i < l; i++) {
			collapsed[i].removeAttribute('it-panel-collapsed');
		}
		return;
	}

	document.documentElement.setAttribute('it-side-panels', 'collapsed');

	window.addEventListener('click', extension.features.sidePanels.handleClick, true);
	window.addEventListener('click', extension.features.sidePanels.handleHeaderClick, true);
};

extension.features.sidePanels.handleClick = function (event) {
	if (extension.storage.get('side_panels') !== 'collapsed') {
		return;
	}

	var target = event.target;
	if (!target || !target.closest) return;

	// Find the close (X) button inside a side panel header. YouTube renders it as
	// a <button> with aria-label "Close" or as the SVG path with that role.
	var closeButton = target.closest('#secondary #panels > * button[aria-label="Close"], #playlist button[aria-label="Close"]');
	if (!closeButton) return;

	var panel = closeButton.closest('#secondary #panels > *');
	if (!panel && closeButton.closest('#playlist')) {
		panel = closeButton.closest('#playlist');
	}
	if (!panel) return;

	// Stop YouTube's own dismiss handler so the panel stays in the DOM.
	event.preventDefault();
	event.stopPropagation();
	if (typeof event.stopImmediatePropagation === 'function') {
		event.stopImmediatePropagation();
	}

	panel.setAttribute('it-panel-collapsed', '');

	if (extension.storage.get('side_panels_only_one_expanded') === true) {
		var siblings = document.querySelectorAll('#secondary #panels > *, #playlist');
		for (var i = 0, l = siblings.length; i < l; i++) {
			var sibling = siblings[i];
			if (sibling !== panel && !sibling.hasAttribute('it-panel-collapsed')) {
				sibling.setAttribute('it-panel-collapsed', '');
			}
		}
	}
};

extension.features.sidePanels.handleHeaderClick = function (event) {
	if (extension.storage.get('side_panels') !== 'collapsed') {
		return;
	}

	var target = event.target;
	if (!target || !target.closest) return;

	// Header is the clickable title bar of an engagement panel; the close button
	// inside the header is handled above, so skip that path.
	var header = target.closest('#secondary #panels > * #header, #secondary #panels > * #header-container, #secondary #panels > * #title, #playlist #header-container, #playlist #title');
	if (!header) return;

	if (target.closest('button[aria-label="Close"]')) return;

	var panel = header.closest('#secondary #panels > *');
	if (!panel && header.closest('#playlist')) {
		panel = header.closest('#playlist');
	}
	if (!panel || !panel.hasAttribute('it-panel-collapsed')) return;

	// Avoid hijacking legitimate header button clicks (overflow menu, options, etc.).
	if (target.closest('button:not([aria-label="Close"])')) return;
	if (target.closest('a')) return;

	event.preventDefault();
	event.stopPropagation();
	if (typeof event.stopImmediatePropagation === 'function') {
		event.stopImmediatePropagation();
	}

	panel.removeAttribute('it-panel-collapsed');

	if (extension.storage.get('side_panels_only_one_expanded') === true) {
		var siblings = document.querySelectorAll('#secondary #panels > *, #playlist');
		for (var i = 0, l = siblings.length; i < l; i++) {
			var sibling = siblings[i];
			if (sibling !== panel && !sibling.hasAttribute('it-panel-collapsed')) {
				sibling.setAttribute('it-panel-collapsed', '');
			}
		}
	}
};

/*--------------------------------------------------------------
# RELATED VIDEOS
--------------------------------------------------------------*/

extension.features.relatedVideos = function (anything) {
	if (anything instanceof Event) {
		var event = anything;

		if (event.type === 'click') {
			var target = event.target;

			if (target.id === 'items' && target.parentNode.nodeName === 'YTD-WATCH-NEXT-SECONDARY-RESULTS-RENDERER') {
				var rect = target.getBoundingClientRect();

				if (
					event.clientX - rect.left >= 0 &&
					event.clientX - rect.left < rect.width &&
					event.clientY - rect.top >= 0 &&
					event.clientY - rect.top < 48
				) {
					target.toggleAttribute('it-activated');
				}
			}
		}
	} else {
		if (extension.storage.get('related_videos') === 'collapsed') {
			window.addEventListener('click', this.relatedVideos, true);
		} else {
			window.removeEventListener('click', this.relatedVideos, true);
		}
	}
};

/*--------------------------------------------------------------
# LIVECHAT
--------------------------------------------------------------*/

extension.features.liveChat = function () {
	if (extension.storage.get('livechat') === 'collapsed') {
		window.addEventListener('click', function(event) {
			if (extension.storage.get('livechat') !== 'collapsed') return;

			var chat = event.target.closest('#chat-container');
			if (!chat) return;

			var rect = chat.getBoundingClientRect();
			if (
				event.clientX - rect.left >= 0 &&
				event.clientX - rect.left < rect.width &&
				event.clientY - rect.top >= 0 &&
				event.clientY - rect.top < 48
			) {
				chat.toggleAttribute('it-activated');
			}
		}, true);
	}
};

/*--------------------------------------------------------------
# STICKY NAVIGATION
--------------------------------------------------------------*/

extension.features.stickyNavigation = function () {
	if (extension.storage.get('sticky_navigation') === true) {
		// Function to ensure navigation stays visible
		function ensureNavigationVisible() {
			const miniGuide = document.querySelector('ytd-mini-guide-renderer');
			const guide = document.querySelector('ytd-guide-renderer');
			
			if (miniGuide) {
				miniGuide.style.transform = 'translateX(0)';
				miniGuide.style.transition = 'none';
				miniGuide.removeAttribute('hidden');
				miniGuide.setAttribute('aria-hidden', 'false');
			}
			
			if (guide) {
				guide.style.transform = 'translateX(0)';
				guide.style.transition = 'none';
				guide.removeAttribute('hidden');
				guide.setAttribute('aria-hidden', 'false');
			}
		}

		// Apply immediately
		ensureNavigationVisible();

		// Set up observer to watch for navigation changes
		const observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.type === 'attributes' && 
					(mutation.attributeName === 'hidden' || mutation.attributeName === 'aria-hidden')) {
					ensureNavigationVisible();
				}
			});
		});

		// Observe navigation elements
		const miniGuide = document.querySelector('ytd-mini-guide-renderer');
		const guide = document.querySelector('ytd-guide-renderer');
		
		if (miniGuide) {
			observer.observe(miniGuide, {
				attributes: true,
				attributeFilter: ['hidden', 'aria-hidden']
			});
		}
		
		if (guide) {
			observer.observe(guide, {
				attributes: true,
				attributeFilter: ['hidden', 'aria-hidden']
			});
		}

		// Store observer for cleanup
		extension.features.stickyNavigationObserver = observer;
	} else {
		// Clean up observer if setting is disabled
		if (extension.features.stickyNavigationObserver) {
			extension.features.stickyNavigationObserver.disconnect();
			extension.features.stickyNavigationObserver = null;
		}
	}
};
