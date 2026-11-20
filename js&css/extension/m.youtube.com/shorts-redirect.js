/*--------------------------------------------------------------
>>> SHORTS → WATCH REDIRECT ON THE MOBILE SITE (m.youtube.com)
The main content scripts only match www.youtube.com, so on the
mobile site /shorts/ID is never redirected. This script runs on
m.youtube.com and sends /shorts/ID to the standard watch page on
www.youtube.com, when the option is enabled. It also checks again
after in-app navigation (the mobile site is a single-page app).
--------------------------------------------------------------*/

/**
 * Returns the www.youtube.com watch URL for an m.youtube.com Shorts URL,
 * or null when the URL is not a Shorts URL with a video id.
 * @param {string} href
 * @returns {string | null}
 */
function mobileShortsWatchUrl(href) {
	var url = new URL(href);
	var match = url.pathname.match(/^\/shorts\/([^/?#]+)/);

	if (!match) {
		return null;
	}

	var target = new URL('https://www.youtube.com/watch');
	target.searchParams.set('v', match[1]);
	url.searchParams.forEach(function (value, key) {
		if (key !== 'v') {
			target.searchParams.append(key, value);
		}
	});

	return target.href;
}

function redirectShortsToWatch() {
	chrome.storage.local.get('redirect_shorts_to_watch', function (items) {
		if (items.redirect_shorts_to_watch !== true) {
			return;
		}

		var target = mobileShortsWatchUrl(location.href);

		if (target) {
			location.replace(target);
		}
	});
}

if (typeof chrome !== 'undefined' && chrome.storage && typeof location !== 'undefined') {
	redirectShortsToWatch();

	// In-app navigation (e.g. tapping a Short on the home page) does not reload the page.
	window.addEventListener('yt-navigate-finish', redirectShortsToWatch);
	window.addEventListener('popstate', redirectShortsToWatch);
}
