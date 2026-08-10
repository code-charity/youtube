(function() {
    'use strict';

    /**
     * Checks if the current page is a YouTube channel's /videos page.
     * @returns {boolean}
     */
    function isChannelVideosPage() {
        const url = window.location.href;
        // Check for /channel/ or /user/ or /c/ followed by /videos.
        // YouTube URLs can be complex, this is a basic check.
        return (url.includes('/channel/') || url.includes('/user/') || url.includes('/c/')) && url.includes('/videos');
    }

    /**
     * Determines if a given video element has captions based on DOM heuristics.
     * This is a speculative heuristic as YouTube removed the explicit indicator.
     * It assumes that some underlying information might still be present in the DOM,
     * such as specific aria-labels, text content in badge-like elements, or data attributes,
     * even if not visually rendered by YouTube itself.
     * In a real-world scenario, this detection might require precise inspection of YouTube's
     * live DOM structure, or potentially more advanced methods like intercepting network requests
     * for video data if the information is truly removed from the client-side DOM.
     *
     * @param {HTMLElement} videoElement The ytd-grid-video-renderer or similar video container.
     * @returns {boolean} True if captions are detected, false otherwise.
     */
    function hasCaptions(videoElement) {
        // Look for common patterns YouTube uses for badges or accessibility labels
        // that might indicate captions, even if hidden.

        // 1. Check for text 'CC' or 'Captions' in badge-like elements (e.g., ytd-badge-supported-renderer)
        const badgeIndicators = videoElement.querySelectorAll('ytd-badge-supported-renderer span');
        for (const indicator of badgeIndicators) {
            if (indicator.textContent && indicator.textContent.trim().toUpperCase() === 'CC') {
                return true;
            }
            if (indicator.ariaLabel && indicator.ariaLabel.includes('Captions')) {
                return true;
            }
        }

        // 2. Check for accessibility labels within thumbnail overlays (e.g., time status)
        // Sometimes these overlays carry ARIA labels that hint at video features.
        const timeOverlayAccessibility = videoElement.querySelector('ytd-thumbnail-overlay-time-status-renderer yt-formatted-string');
        if (timeOverlayAccessibility && timeOverlayAccessibility.ariaLabel && timeOverlayAccessibility.ariaLabel.includes('Captions')) {
            return true;
        }

        // 3. Fallback heuristic: Check for a data attribute on the video element itself.
        // This is highly speculative and would require a corresponding mechanism to set this data attribute.
        // For example, an extension might process ytInitialData to add this attribute.
        if (videoElement.dataset.hasCaptions === 'true') {
            return true;
        }

        // If no indicator is found by the heuristics, assume no captions are explicitly indicated.
        return false;
    }

    /**
     * Adds a CC indicator to a video element if it has captions and doesn't already have the indicator.
     * @param {HTMLElement} videoElement The video container element (e.g., ytd-grid-video-renderer).
     */
    function addCcIndicator(videoElement) {
        // Ensure the indicator is not added multiple times to the same video.
        if (videoElement.dataset.satusCcIndicatorAdded === 'true') {
            return;
        }

        const titleLinkElement = videoElement.querySelector('h3#video-title a');
        if (!titleLinkElement) {
            return;
        }

        if (hasCaptions(videoElement)) {
            const ccSpan = document.createElement('span');
            ccSpan.classList.add('satus-cc-indicator');
            ccSpan.textContent = 'CC';
            ccSpan.title = 'Captions available';

            // Insert the CC indicator directly after the title link element.
            titleLinkElement.parentNode.insertBefore(ccSpan, titleLinkElement.nextSibling);

            // Mark the video element to prevent re-adding the indicator.
            videoElement.dataset.satusCcIndicatorAdded = 'true';
        }
    }

    /**
     * Processes a node to find and apply CC indicators to video elements.
     * @param {Node} node The DOM node to process.
     */
    function processNode(node) {
        if (node.nodeType === 1) { // Element node
            // Check if the node itself is a video renderer or contains them
            if (node.matches('ytd-grid-video-renderer')) {
                addCcIndicator(node);
            }
            // Also query for video renderers within the added node (for larger chunks of DOM)
            const videoElements = node.querySelectorAll('ytd-grid-video-renderer');
            videoElements.forEach(addCcIndicator);
        }
    }

    // Use a MutationObserver to detect dynamically loaded video content.
    const observer = new MutationObserver((mutations) => {
        if (!isChannelVideosPage()) {
            return; // Only apply logic on channel /videos page
        }

        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(processNode);
            }
        });
    });

    // Start observing the main content area for YouTube.
    // The 'ytd-page-manager' is a high-level container that often holds the main content changes.
    // Observe for childList changes within its subtree to catch dynamically loaded videos.
    const config = { childList: true, subtree: true };
    const pageManager = document.querySelector('ytd-page-manager');
    if (pageManager) {
        observer.observe(pageManager, config);
    } else {
        // If pageManager is not immediately available, try observing the body or a more general container.
        // This can happen if the script runs too early.
        console.warn('Satus CC Indicator: ytd-page-manager not found on initial load. Observing document body.');
        observer.observe(document.body, config);
    }

    // Initial scan for videos already present on page load.
    if (isChannelVideosPage()) {
        document.querySelectorAll('ytd-grid-video-renderer').forEach(addCcIndicator);
    }

    // Re-scan when navigating between channel tabs without full page reload (SPA behavior)
    window.addEventListener('yt-navigate-finish', () => {
        if (isChannelVideosPage()) {
            // Give YouTube a moment to render its initial content
            setTimeout(() => {
                document.querySelectorAll('ytd-grid-video-renderer').forEach(addCcIndicator);
            }, 500); // Small delay to ensure elements are fully rendered
        }
    });

})();
