/**
 * This content script runs on YouTube watch pages to enforce autoplay settings.
 * It aims to prevent videos from starting automatically if autoplay is disabled
 * in the extension's settings, ensuring a "stopped" state with a thumbnail
 * and play button from the start.
 */

(function() {
    let playerAutoplaySetting = true; // Default to true, updated by background script
    let playlistAutoplaySetting = true; // Default to true, updated by background script
    let settingsLoaded = false;

    // Listen for settings from the background script
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'updateAutoplaySettings') {
            playerAutoplaySetting = message.playerAutoplay;
            playlistAutoplaySetting = message.playlistAutoplay;
            settingsLoaded = true;
            // Re-apply settings if a player is already present or navigating
            handlePlayer();
        }
    });

    // Request settings from background script immediately upon script load
    if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'requestAutoplaySettings' });
    }

    /**
     * Determines if the current video is part of a YouTube playlist.
     * @returns {boolean} True if a playlist ID is found in the URL.
     */
    function isCurrentlyInPlaylist() {
        return window.location.search.includes('list=') || window.location.hash.includes('list=');
    }

    /**
     * Finds the YouTube video player element and applies autoplay settings.
     * This function should be called when settings are updated or a new video loads.
     */
    function handlePlayer() {
        if (!settingsLoaded) {
            console.debug('Autoplay controller: Settings not loaded yet, deferring player handling.');
            return;
        }

        // Determine if autoplay should be forced OFF based on combined settings
        // If player autoplay is off, or if playlist autoplay is off AND we are in a playlist.
        const forceAutoplayOff = (!playerAutoplaySetting || (!playlistAutoplaySetting && isCurrentlyInPlaylist()));
        
        console.debug(`Autoplay controller: Player Autoplay: ${playerAutoplaySetting}, Playlist Autoplay: ${playlistAutoplaySetting}, In Playlist: ${isCurrentlyInPlaylist()}, Force Autoplay Off: ${forceAutoplayOff}`);

        const playerElement = document.querySelector('#movie_player .html5-main-video') || 
                              document.querySelector('ytd-watch-flexy video');
        const playerIframe = document.querySelector('iframe[src*="youtube.com/embed"]');

        if (playerElement) {
            // Handles native YouTube player on watch pages
            if (forceAutoplayOff) {
                // Ensure the video element's autoplay attribute is false and pause immediately
                playerElement.removeAttribute('autoplay');
                playerElement.autoplay = false;
                if (!playerElement.paused) {
                    playerElement.pause();
                    console.debug('Autoplay controller: Paused native player.');
                }
                // Add an event listener to re-pause if YouTube attempts to play it later
                playerElement.removeEventListener('play', enforcePauseNativePlayer); // Remove previous to avoid duplicates
                playerElement.addEventListener('play', enforcePauseNativePlayer);
            } else {
                // If autoplay is allowed, ensure it can play
                playerElement.autoplay = true; // Explicitly allow
                playerElement.removeEventListener('play', enforcePauseNativePlayer);
                // No need to call play() here, let YouTube handle it if settings allow.
            }
        } else if (playerIframe) {
            // Handles embedded YouTube players in iframes
            let src = playerIframe.src;
            let newSrc = src;

            // Remove existing autoplay parameter to ensure a clean slate
            newSrc = newSrc.replace(/([?&])autoplay=[^&]*/g, '$1');

            if (forceAutoplayOff) {
                // Add autoplay=0 if it's not already there or to override it
                if (!newSrc.includes('autoplay=')) {
                    newSrc += (newSrc.includes('?') ? '&' : '?') + 'autoplay=0';
                }
                console.debug('Autoplay controller: Set iframe autoplay=0.');
            } else {
                // Add autoplay=1 if autoplay is allowed
                if (!newSrc.includes('autoplay=')) {
                    newSrc += (newSrc.includes('?') ? '&' : '?') + 'autoplay=1';
                }
                console.debug('Autoplay controller: Set iframe autoplay=1.');
            }

            // Ensure enablejsapi=1 for potential future control via YouTube Player API
            if (!newSrc.includes('enablejsapi=')) {
                newSrc += (newSrc.includes('?') ? '&' : '?') + 'enablejsapi=1';
            }
            
            // Cleanup any potential double '?' or '&' at the start if it happened
            newSrc = newSrc.replace(/(\?|&)&/g, '$1');

            if (src !== newSrc) {
                // Only reload iframe if the src actually changed
                playerIframe.src = newSrc;
                console.debug('Autoplay controller: Reloaded iframe with new src.');
            } else {
                console.debug('Autoplay controller: Iframe src already correct.');
            }
        } else {
            console.debug('Autoplay controller: No player element found.');
        }
    }

    /**
     * Re-pauses the native YouTube player if autoplay is supposed to be off,
     * in case YouTube's internal logic tries to start it.
     */
    function enforcePauseNativePlayer() {
        const playerElement = this; // 'this' refers to the video element
        const forceAutoplayOff = (!playerAutoplaySetting || (!playlistAutoplaySetting && isCurrentlyInPlaylist()));
        
        if (forceAutoplayOff && !playerElement.paused) {
            playerElement.pause();
            console.debug('Autoplay controller: Re-paused native player due to unexpected play event.');
        }
    }

    // Monitor for navigation changes within YouTube (SPA behavior)
    // 'yt-navigate-finish' is a custom event fired by YouTube.
    window.addEventListener('yt-navigate-finish', () => {
        console.debug('Autoplay controller: yt-navigate-finish event detected. Re-checking player.');
        handlePlayer();
    });

    // Initial check when the script loads
    console.debug('Autoplay controller: Initial script load. Checking player.');
    handlePlayer();

    // Use MutationObserver to detect when the player element itself is added/removed
    // This is crucial for dynamically loaded players or if 'yt-navigate-finish'
    // isn't sufficient for all scenarios (e.g., embedded players).
    const observer = new MutationObserver(mutations => {
        let playerFound = false;
        for (let mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === 1 && (node.matches('#movie_player') || node.matches('ytd-watch-flexy') || node.matches('iframe[src*="youtube.com/embed"]'))) {
                        playerFound = true;
                        break;
                    }
                }
            }
            if (playerFound) break;
        }

        if (playerFound) {
            console.debug('Autoplay controller: MutationObserver detected player element. Re-checking player.');
            // A short delay helps ensure the player is fully initialized by YouTube
            setTimeout(handlePlayer, 100); 
        }
    });

    // Observe the body for changes, including subtree for deep changes, to catch player insertion
    observer.observe(document.body, { childList: true, subtree: true });

})();
