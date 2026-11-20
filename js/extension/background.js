// This script manages the "Only one player instance playing" feature across tabs.
// It listens for messages from content scripts indicating video playback has started.
browser.runtime.onMessage.addListener(async (message, sender) => {
    if (message.action === 'videoStartedPlaying' && sender.tab) {
        // In a complete extension, you would typically retrieve the user's setting
        // for "Only one player instance playing" from storage here and only proceed
        // if the feature is enabled.
        // Example:
        // const settings = await browser.storage.local.get('onlyOnePlayerInstanceEnabled');
        // if (!settings.onlyOnePlayerInstanceEnabled) {
        //     return;
        // }

        const playingTabId = sender.tab.id;

        // Query all currently open tabs that are YouTube pages
        const youtubeTabs = await browser.tabs.query({ url: '*://www.youtube.com/*' });

        for (const tab of youtubeTabs) {
            // If it's a YouTube tab and it's not the tab where playback just started
            if (tab.id !== playingTabId) {
                // Send a message to its content script to pause any playing video
                try {
                    await browser.tabs.sendMessage(tab.id, { action: 'pauseVideo' });
                } catch (e) {
                    // Log errors, e.g., if the content script hasn't been injected into the tab yet,
                    // or if the tab has been closed.
                    console.warn(`ImprovedTube: Failed to send pause message to tab ${tab.id}: ${e.message}`);
                }
            }
        }
    }
});
