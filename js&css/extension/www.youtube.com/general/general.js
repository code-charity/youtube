/*--------------------------------------------------------------
>>> GENERAL:
----------------------------------------------------------------
# YouTube home page
# Fold subscriptions' sections (collapsed accordion)
# Don't let a second video auto-start at once
# Add "Scroll to top"
# Confirmation before closing
# Default content country
# Add "Popup window" buttons
# Add "Watch Later" buttons
# Font
# Mark watched videos
# Track watched videos
# Thumbnails quality
# Prevent touch navigation gestures
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# YOUTUBE HOME PAGE
--------------------------------------------------------------*/

extension.features.youtubeHomePage = function (anything) {
	if (anything instanceof Event) {
		var event = anything;

		if (event.target) {
			var target = event.target;

			while (target.parentNode) {
				if (target.nodeName === 'A' && target.id === 'logo') {
					var option = extension.storage.get('youtube_home_page');

					if (option !== 'search') {
						event.preventDefault();
						event.stopPropagation();

						window.open(option, '_self');

						return false;
					}
				} else {
					target = target.parentNode;
				}
			}
		}
	} else if (anything === 'init') {
		extension.events.on('init', function (resolve) {
			if (/(www|m)\.youtube\.com\/?(\?|\#|$)/.test(location.href)) {
				chrome.storage.local.get('youtube_home_page', function (items) {
					var option = items.youtube_home_page;

					if (option && option !== 'default') {
						document.addEventListener('click', extension.features.youtubeHomePage);
					}

					resolve();
				});
			} else {
				resolve();
			}
		});
	}
};

/*--------------------------------------------------------------
# PREVENT TOUCH NAVIGATION GESTURES
--------------------------------------------------------------*/

extension.features.preventTouchNavigationGestures = function (anything) {
	if (anything === 'init') {
		extension.events.on('init', function (resolve) {
			if (/(www|m)\.youtube\.com/.test(location.href)) {
				var option = extension.storage.get('prevent_touch_navigation_gestures');

				if (option === true || option === 'true' || option === undefined || option === null) {
					extension.features.preventTouchNavigationGestures('setup');
				}

				resolve();
			} else {
				resolve();
			}
		});
	} else if (anything === 'setup') {
		var touchStartX = 0;
		var touchStartY = 0;
		var touchStartScrollY = 0;

		/*--------------------------------------------------------------
		# SWIPE DOWN ON VIDEO PAGE TO PREVENT HOMEPAGE NAVIGATION
		--------------------------------------------------------------*/

		function isWatchPage() {
			return /[?&]v=/.test(location.href) || /\/watch/.test(location.pathname);
		}

		function isFullscreen() {
			return !!(
				document.fullscreenElement ||
				document.webkitFullscreenElement ||
				document.mozFullScreenElement
			);
		}

		function isChannelPage() {
			return /\/(channel\/|c\/|user\/|@)/.test(location.pathname) ||
				(/youtube\.com\/[^/]+$/.test(location.href) && !/watch|results|feed|playlist|shorts/.test(location.pathname));
		}

		document.addEventListener('touchstart', function (e) {
			if (e.touches.length === 1) {
				touchStartX = e.touches[0].clientX;
				touchStartY = e.touches[0].clientY;
				touchStartScrollY = window.scrollY || window.pageYOffset || 0;
			}
		}, { passive: true });

		document.addEventListener('touchmove', function (e) {
			if (e.touches.length === 1) {
				var currentY = e.touches[0].clientY;
				var currentX = e.touches[0].clientX;
				var deltaY = currentY - touchStartY;
				var deltaX = currentX - touchStartX;

				/*--------------------------------------------------------------
				# BLOCK SWIPE DOWN TO HOMEPAGE ON VIDEO PAGE
				Prevent the pull-down gesture that triggers YouTube's
				picture-in-picture / homepage navigation when already at top.
				Only blocks when:
				- On a watch page
				- Not in fullscreen (fullscreen has its own swipe-to-exit)
				- Page is scrolled to the top
				- Gesture is primarily downward
				--------------------------------------------------------------*/
				if (
					isWatchPage() &&
					!isFullscreen() &&
					(touchStartScrollY === 0 || (window.scrollY || window.pageYOffset || 0) === 0) &&
					deltaY > 10 &&
					Math.abs(deltaY) > Math.abs(deltaX)
				) {
					e.preventDefault();
					return;
				}

				/*--------------------------------------------------------------
				# BLOCK HORIZONTAL SWIPE ON CHANNEL PAGE TABS
				Prevent horizontal swipe from switching channel page tabs
				(Home / Videos / Posts). Allow pinch-to-zoom (multi-touch).
				--------------------------------------------------------------*/
				if (
					isChannelPage() &&
					e.touches.length === 1 &&
					Math.abs(deltaX) > 10 &&
					Math.abs(deltaX) > Math.abs(deltaY)
				) {
					// Check if the target is inside the tab/section area
					var target = e.target;
					var inTabContent = false;

					while (target && target !== document.body) {
						var nodeName = target.nodeName ? target.nodeName.toLowerCase() : '';
						var id = target.id || '';
						var className = (typeof target.className === 'string') ? target.className : '';

						if (
							nodeName === 'ytd-browse' ||
							nodeName === 'ytd-two-column-browse-results-renderer' ||
							nodeName === 'tp-yt-paper-tabs' ||
							nodeName === 'ytd-feed-filter-chip-bar-renderer' ||
							id === 'header' ||
							id === 'tabs' ||
							className.indexOf('tab') !== -1
						) {
							inTabContent = true;
							break;
						}

						target = target.parentNode;
					}

					if (inTabContent) {
						e.preventDefault();
						return;
					}
				}
			}
		}, { passive: false });
	}
};
