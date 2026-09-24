/**
 * @fileoverview Applies forced volume settings to YouTube video players,
 * especially crucial for embedded iframes where the main extension
 * might not usually run.
 *
 * It uses a MutationObserver to detect when the video element is added to the DOM
 * and sets up event listeners to re-apply volume settings if they change
 * due to user interaction or player resets.
 */

// Ensure extension.features exists
if (!extension.features) {
    extension.features = {};
}

/**
 * Initializes the forced volume feature.
 * This function will set up listeners and observers to ensure the forced volume
 * is applied and maintained for YouTube video players.
 */
extension.features.forcedVolume = function () {
    let volumeControlActive = false; // Flag to prevent multiple initializations of listeners
    let volumeChangeTimeout = null; // Used for debouncing volumechange events

    /**
     * Retrieves the forced volume and mute settings from extension storage.
     * @returns {{forcedVolume: number|null, isMuted: boolean|null}} Object containing settings.
     */
    const getForcedVolumeSettings = () => {
        // Assume 'forced_volume' stores a number (0-100) and 'volume_muted' stores a boolean.
        const forcedVolume = extension.storage.get('forced_volume');
        const isMuted = extension.storage.get('volume_muted');
        return { forcedVolume, isMuted };
    };

    /**
     * Applies the forced volume and mute state to a given video element.
     * @param {HTMLVideoElement} videoElement The video element to control.
     */
    const applyForcedVolume = (videoElement) => {
        if (!videoElement) {
            return;
        }

        const { forcedVolume, isMuted } = getForcedVolumeSettings();

        // Apply forced volume if it's a valid number (0-100) and different from current.
        if (typeof forcedVolume === 'number' && forcedVolume >= 0 && forcedVolume <= 100) {
            const targetVolume = forcedVolume / 100;
            if (videoElement.volume !== targetVolume) {
                videoElement.volume = targetVolume;
            }
            // Apply forced mute state
            if (videoElement.muted !== isMuted) {
                videoElement.muted = isMuted;
            }
        } else if (typeof isMuted === 'boolean' && videoElement.muted !== isMuted) {
            // If only mute is forced (no specific volume number), apply mute state.
            videoElement.muted = isMuted;
        }
    };

    /**
     * Sets up event listeners on the video element to maintain forced volume.
     * This includes handling user interaction and player resets.
     * @param {HTMLVideoElement} videoElement The video element to attach listeners to.
     */
    const setupVolumeListeners = (videoElement) => {
        if (volumeControlActive) {
            return; // Already active, prevent duplicate listeners
        }
        volumeControlActive = true;

        // Listen for volume changes (e.g., user interaction, script changes by YouTube)
        videoElement.addEventListener('volumechange', () => {
            // Clear any pending re-application to prevent rapid re-application loops
            if (volumeChangeTimeout) {
                clearTimeout(volumeChangeTimeout);
            }
            // Re-apply forced volume after a short delay.
            // This allows the browser/player to process the volume change event fully first.
            volumeChangeTimeout = setTimeout(() => {
                applyForcedVolume(videoElement);
            }, 100); // Small delay to re-apply
        });

        // Listen for `loadedmetadata` in case the video source changes or player resets
        videoElement.addEventListener('loadedmetadata', () => {
            applyForcedVolume(videoElement);
        });

        // Listen for `play` event, as some players might reset volume on play
        videoElement.addEventListener('play', () => {
            applyForcedVolume(videoElement);
        });

        // Ensure volume is applied immediately after setting up listeners
        applyForcedVolume(videoElement);
    };

    /**
     * Attempts to find the YouTube video element and initialize volume control.
     * @returns {boolean} True if the video element was found and control initialized, false otherwise.
     */
    const initializeVolumeControl = () => {
        const video = document.querySelector('video');
        if (video) {
            setupVolumeListeners(video);
            return true; // Video found and initialized
        }
        return false; // Video not found
    };

    // --- Initialization Logic ---
    // Attempt to initialize immediately if the document is already interactive or complete.
    if (document.readyState !== 'loading') {
        initializeVolumeControl();
    } else {
        // If not, wait for the DOM to be fully loaded.
        document.addEventListener('DOMContentLoaded', initializeVolumeControl);
    }

    // Use a MutationObserver to catch when the video element is added to the DOM dynamically.
    // This handles asynchronously loaded players common in YouTube iframes.
    const observer = new MutationObserver((mutationsList, obs) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                if (initializeVolumeControl()) {
                    obs.disconnect(); // Disconnect once the player is found and configured
                    return;
                }
            }
        }
    });

    // Observe the entire document for subtree changes (needed if video is added deep in DOM)
    // Using document.documentElement ensures we catch additions anywhere in the DOM.
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Fallback: A final delayed check in case the observer misses something
    // or for very slow loading scenarios where the player might be initialized very late.
    setTimeout(() => {
        if (!volumeControlActive) { // Only attempt if control hasn't been activated yet
            initializeVolumeControl();
        }
    }, 3000); // Check after 3 seconds
};

// Call the feature's initialization function when this script is loaded.
// This ensures that the forced volume logic starts immediately when the content script runs.
extension.features.forcedVolume();
