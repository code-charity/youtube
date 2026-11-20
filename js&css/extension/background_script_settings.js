/**
 * This background script component manages extension settings for autoplay
 * and communicates them to content scripts running on YouTube tabs.
 * It assumes an existing `chrome.storage.sync` setup for persisting settings.
 */
(function() {
    let playerAutoplay = true; // Default value, will be loaded from storage
    let playlistAutoplay = true; // Default value, will be loaded from storage

    /**
     * Loads autoplay settings from chrome.storage.sync.
     * After loading, it broadcasts the settings to all relevant content scripts.
     */
    function loadSettings() {
        chrome.storage.sync.get(['playerAutoplay', 'playlistAutoplay'], (items) => {
            playerAutoplay = (typeof items.playerAutoplay === 'boolean') ? items.playerAutoplay : true;
            playlistAutoplay = (typeof items.playlistAutoplay === 'boolean') ? items.playlistAutoplay : true;
            console.log(`Background: Settings loaded - Player Autoplay: ${playerAutoplay}, Playlist Autoplay: ${playlistAutoplay}`);
            // Broadcast initial or updated settings to all active content scripts
            broadcastSettingsToTabs();
        });
    }

    /**
     * Broadcasts the current autoplay settings to content scripts in all YouTube tabs.
     */
    function broadcastSettingsToTabs() {
        chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.id) { // Ensure tab.id is valid
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'updateAutoplaySettings',
                        playerAutoplay: playerAutoplay,
                        playlistAutoplay: playlistAutoplay
                    }).catch(e => {
                        // Catch errors if content script is not injected yet or tab closed
                        console.warn(`Background: Could not send message to tab ${tab.id}:`, e.message);
                    });
                }
            });
        });
    }

    /**
     * Listens for messages from content scripts or other extension parts.
     * - 'requestAutoplaySettings': Content scripts ask for current settings.
     * - (Future: 'saveSetting'): Options page requests to save a setting.
     */
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'requestAutoplaySettings' && sender.tab && sender.url.includes('youtube.com')) {
            console.debug(`Background: Content script in tab ${sender.tab.id} requested settings.`);
            sendResponse({
                type: 'updateAutoplaySettings', // Send back in the same format
                playerAutoplay: playerAutoplay,
                playlistAutoplay: playlistAutoplay
            });
            return true; // Indicate that sendResponse will be called asynchronously
        }
    });

    /**
     * Listens for changes in chrome.storage.sync (e.g., from an options page).
     * If autoplay settings change, it reloads and broadcasts them.
     */
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && (changes.playerAutoplay || changes.playlistAutoplay)) {
            console.log('Background: Storage change detected for autoplay settings, reloading.');
            loadSettings(); // Reload and broadcast updated settings
        }
    });

    // Initialize settings when the background script starts
    loadSettings();

})();
