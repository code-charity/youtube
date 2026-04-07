// This script is injected into YouTube pages to detect video playback and respond to pause commands.

// Function to attach 'play' event listeners to all video elements currently in the DOM
// and to any new video elements that appear.
function setupVideoPlayListeners() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        // Prevent attaching multiple listeners to the same video element
        if (!video.__improvedTubePlayListenerAttached) {
            video.addEventListener('play', () => {
                // When a video starts playing in this tab, inform the background script.
                // The background script will then handle pausing videos in other tabs.
                browser.runtime.sendMessage({ action: 'videoStartedPlaying' });
            });
            // Mark the video element to indicate a listener has been attached
            video.__improvedTubePlayListenerAttached = true;
        }
    });
}

// Use a MutationObserver to efficiently detect when new video elements are added to the DOM.
// This is crucial for YouTube's Single Page Application (SPA) architecture where content
// changes without full page reloads.
const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        // Look for changes where nodes are added to the DOM
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Iterate over added nodes to see if they are videos or contain videos
            mutation.addedNodes.forEach(node => {
                // Check if the added node itself is a video or if it contains one
                if (node.nodeType === Node.ELEMENT_NODE && (node.matches('video') || node.querySelector('video'))) {
                    setupVideoPlayListeners(); // Re-run setup to attach listeners to new videos
                    // If we found a video, we can potentially stop processing this mutation
                    // or return early if confident that `setupVideoPlayListeners` handles all new cases.
                }
            });
        }
    }
});

// Start observing the entire document body for changes in its child list and subtree.
// This ensures that dynamically loaded video players (e.g., from navigating to a new video
// without a full page refresh, or from a playlist) are caught.
observer.observe(document.body, { childList: true, subtree: true });

// Initial setup call for any video elements that are already present when the script first loads.
setupVideoPlayListeners();

// Listen for messages from the background script.
// This content script will receive messages to pause its video(s) when another tab
// starts playing a video and the "Only one player instance playing" feature is active.
browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'pauseVideo') {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause(); // Pause the video if it's currently playing
                console.log('ImprovedTube: Video paused by "Only one player instance playing" feature.');
            }
        });
    }
});
