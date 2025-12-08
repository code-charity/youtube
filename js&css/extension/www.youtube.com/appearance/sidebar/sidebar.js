/*--------------------------------------------------------------
>>> SIDEBAR
----------------------------------------------------------------
# Related videos
# Sticky navigation
--------------------------------------------------------------*/

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
