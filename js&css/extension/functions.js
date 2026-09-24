/*--------------------------------------------------------------
>>> FUNCTIONS:
/*--------------------------------------------------------------
# GET URL PARAMETER
--------------------------------------------------------------*/
extension.functions.getUrlParameter = function (url, parameter) {
	var match = url.match(new RegExp('(\\?|\\&)' + parameter + '=[^&]+'));
	if (match) {return match[0].substr(3);}
};

/*--------------------------------------------------------------
# PLAYER NAVIGATION HANDLER
--------------------------------------------------------------*/
// This function addresses the bug where video playback freezes after navigating
// to a new video in a playlist without a full page reload.
// The extension's player control logic likely becomes stale or unbound
// to the new video player instance.
extension.functions.handlePlayerNavigation = function () {
    // If the ImprovedTube player module exists and has a re-initialization function, call it.
    // This is crucial to ensure that any custom play/pause handlers,
    // player state observers, or settings (like autoplay OFF) are re-applied
    // to the newly loaded video player.
    if (typeof extension.player !== 'undefined' && typeof extension.player.reinitializePlayerControls === 'function') {
        extension.player.reinitializePlayerControls();
    } else {
        // Fallback logging for debugging if the core player re-initialization is missing.
        // In a properly structured extension, `extension.player` and its methods would be defined.
        console.warn('ImprovedTube: `extension.player.reinitializePlayerControls` not found. Player controls might not re-initialize after navigation. This indicates a missing core player script.');
    }
};

// Sets up observers to detect when YouTube navigates to a new video.
extension.functions.initPlayerWatchers = function () {
    // YouTube dispatches a custom event `yt-navigate-finish` when it loads a new page
    // or video without a full browser reload (e.g., clicking a video in a playlist).
    document.addEventListener('yt-navigate-finish', extension.functions.handlePlayerNavigation);

    // As a robust fallback, also observe URL changes using a MutationObserver.
    // This catches cases where `yt-navigate-finish` might not fire or if the URL changes
    // due to other browser mechanisms.
    let lastKnownUrl = location.href;
    const urlObserver = new MutationObserver(() => {
        if (location.href !== lastKnownUrl) {
            lastKnownUrl = location.href;
            // Only trigger re-initialization if the new URL is a YouTube watch page.
            if (lastKnownUrl.includes('/watch?v=')) {
                extension.functions.handlePlayerNavigation();
            }
        }
    });

    // Observe the document body for changes, which can indicate URL changes in SPAs.
    // The `subtree: true` and `childList: true` are necessary for observing general DOM changes
    // that might accompany a URL change in an SPA.
    urlObserver.observe(document.body, { subtree: true, childList: true });
};

// Initialize the watchers as soon as this script is loaded.
// In an ideal scenario, this call would be placed in a dedicated content script
// that orchestrates the extension's behavior. However, given `functions.js` is
// the only functional JS file provided, we place it here assuming early execution.
extension.functions.initPlayerWatchers();