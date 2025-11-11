// Media key handler for YouTube player

class MediaKeyHandler {
  constructor() {
    this.skipSeconds = 10; // Default skip duration in seconds
    this.initialize();
  }

  initialize() {
    // Load saved skip duration from storage
    chrome.storage.local.get(['mediaKeySkipSeconds'], (result) => {
      if (result.mediaKeySkipSeconds) {
        this.skipSeconds = parseInt(result.mediaKeySkipSeconds, 10);
      }
    });

    // Listen for media key commands
    chrome.commands.onCommand.addListener((command) => {
      if (command === 'mediaNextTrack') {
        this.forward();
      } else if (command === 'mediaPrevTrack') {
        this.rewind();
      }
    });
  }

  // Send message to content script to control video
  sendMessage(action, value) {
    chrome.tabs.query({url: '*://*.youtube.com/*'}, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'MEDIA_KEY_ACTION',
          action: action,
          value: value
        });
      }
    });
  }

  forward() {
    this.sendMessage('skip', this.skipSeconds);
  }

  rewind() {
    this.sendMessage('skip', -this.skipSeconds);
  }
}

// Initialize media key handler when the script loads
const mediaKeyHandler = new MediaKeyHandler();
