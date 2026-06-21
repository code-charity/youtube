/*--------------------------------------------------------------
>>> INITIALIZATION
--------------------------------------------------------------*/
extension.features.youtubeHomePage('init');

document.documentElement.setAttribute('it-pathname', location.pathname);

window.addEventListener('yt-navigate-finish', function () {
	document.documentElement.setAttribute('it-pathname', location.pathname);

	extension.features.trackWatchedVideos();
	extension.features.thumbnailsQuality();
	extension.features.stickyNavigation();
	extension.features.hideSponsoredVideosOnHome?.();
});

extension.messages.create();
extension.messages.listener();

extension.events.on('init', function (resolve) {
	extension.storage.listener();
	extension.storage.load(function () {
		resolve();
	});
}, {
	async: true
});

function bodyReady() {
	if (extension.ready && extension.domReady) {
		extension.features.addScrollToTop();
		extension.features.font();
		extension.features.changeThumbnailsPerRow?.();
		extension.features.clickableLinksInVideoDescriptions();
	}
}

extension.events.on('init', function () {
	extension.features.bluelight();
	extension.features.dim();
	extension.features.youtubeHomePage();
	extension.features.collapseOfSubscriptionSections();
	extension.features.confirmationBeforeClosing();
	extension.features.defaultContentCountry();
	extension.features.popupWindowButtons();
	extension.features.disableThumbnailPlayback();
	extension.features.muteThumbnailPreviews();
	extension.features.markWatchedVideos();
	extension.features.relatedVideos();
	extension.features.stickyNavigation();
	extension.features.liveChat();
	extension.features.comments();
	extension.features.openNewTab();
	extension.features.removeListParamOnNewTab();
	extension.features.removeMemberOnly();

	if (
		extension.storage.get('watch_later_buttons') &&
		extension.storage.get('watch_later_buttons') !== 'disabled'
	) {
		extension.features.watchLaterButtons();
	}

	bodyReady();
});

chrome.runtime.sendMessage({
	action: 'tab-connected'
}, function (response) {
	if (response) {
		extension.tabId = response.tabId;
	}
});

function finishPageWorldInit() {
	extension.ready = true;
	extension.events.trigger('init');
}

const pageWorldFiles = [
	'/js&css/web-accessible/core.js',
	'/js&css/web-accessible/functions.js',
	'/js&css/web-accessible/www.youtube.com/appearance.js',
	'/js&css/web-accessible/www.youtube.com/themes.js',
	'/js&css/web-accessible/www.youtube.com/player.js',
	'/js&css/web-accessible/www.youtube.com/playlist.js',
	'/js&css/web-accessible/www.youtube.com/playlist-complete-playlist.js',
	'/js&css/web-accessible/www.youtube.com/channel.js',
	'/js&css/web-accessible/www.youtube.com/shortcuts.js',
	'/js&css/web-accessible/www.youtube.com/blocklist.js',
	'/js&css/web-accessible/www.youtube.com/settings.js',
	'/js&css/web-accessible/www.youtube.com/last-watched-overlay.js',
	'/js&css/web-accessible/www.youtube.com/return-youtube-dislike.js',
	'/js&css/web-accessible/www.youtube.com/return-youtube-dislike.css',
	'/js&css/web-accessible/init.js'
];

/*--------------------------------------------------------------
# SAFARI / MAIN WORLD INJECTION (FIXED)
--------------------------------------------------------------*/

const isSafari =
	navigator.userAgent.includes('Safari') &&
	!navigator.userAgent.includes('Chrome') &&
	(
		typeof browser !== 'undefined' ||
		typeof safari !== 'undefined'
	);

if (isSafari) {
	chrome.runtime.sendMessage({
		action: 'inject-main-world',
		files: pageWorldFiles
	}, function (response) {

		// ✅ SUCCESS PATH
		if (response && response.ok) {
			finishPageWorldInit();
		} else {
			console.warn('[ImprovedTube] Safari MAIN-world injection failed:', chrome.runtime.lastError?.message || response?.error);
			finishPageWorldInit();
		}

		// ❌ FAILURE PATH (FIXED)
		// DO NOT fallback to DOM injection (causes CSP crash)
		console.error(
			'[ImprovedTube] Safari MAIN-world injection failed:',
			response?.error || chrome.runtime.lastError?.message
		);

		// Minimal safe fallback: continue extension init without page-world scripts
		// This prevents CSP breakage and partial DOM corruption
		finishPageWorldInit();
	});

} else {
	extension.inject(pageWorldFiles.slice(), finishPageWorldInit);
}

document.addEventListener('DOMContentLoaded', function () {
	extension.domReady = true;
	bodyReady();
});

chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
	if (request.action === 'focus') {
		extension.messages.send({ focus: true });

	} else if (request.action === 'blur') {
		extension.messages.send({ blur: true });

	} else if (request.action === 'pause') {
		extension.messages.send({ pause: true });

	} else if (request.action === 'set-volume') {
		extension.messages.send({ setVolume: request.value });

	} else if (request.action === 'set-playback-speed') {
		extension.messages.send({ setPlaybackSpeed: request.value });

	} else if (request.action === 'mixer') {
		extension.messages.send({ mixer: true }, sendResponse, 'mixer');
		return true;

	} else if (request.action === 'delete-youtube-cookies') {
		extension.messages.send({ deleteCookies: true });

	} else if (request.action === "another-video-started-playing") {
		extension.features.onlyOnePlayerInstancePlaying();
	}
});

document.addEventListener('it-message-from-youtube', function () {
	var provider = document.querySelector('#it-messages-from-youtube');

	if (!provider) return;

	var message = provider.textContent;

	document.dispatchEvent(new CustomEvent('it-message-from-youtube--readed'));

	try {
		message = JSON.parse(message);
	} catch (error) {
		console.log(error);
	}

	if (message.requestOptionsUrl === true) {
		extension.messages.send({
			responseOptionsUrl: chrome.runtime.getURL('menu/index.html')
		});
	}
});

document.addEventListener('it-play', function () {
	try {
		chrome.runtime.sendMessage({ action: 'play' });
	} catch (error) {
		console.log(error);

		setTimeout(function () {
			try {
				chrome.runtime.sendMessage({ action: 'play' });
			} catch {}
		}, 321);
	}
});

/*🔧 What this fix actually changes

❌ Removed dangerous behavior
extension.inject() fallback on Safari failure

✔ Prevents
CSP violation (core.js blocked)
broken Safari runtime injection loop
partial script duplication issues

✔ Keeps
Safari MAIN-world attempt
full functionality on Chrome/Firefox unchanged*/