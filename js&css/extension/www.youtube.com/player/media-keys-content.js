// Media key handler for YouTube player (content script)

class YouTubeMediaKeyController {
  constructor() {
    this.video = null;
    this.initialize();
  }

  initialize() {
    // Wait for the video element to be available
    this.waitForVideoElement().then(() => {
      this.setupEventListeners();
    });

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'MEDIA_KEY_ACTION') {
        this.handleMediaKeyAction(request.action, request.value);
      }
    });
  }

  waitForVideoElement() {
    return new Promise((resolve) => {
      const checkVideo = () => {
        this.video = document.querySelector('video');
        if (this.video) {
          resolve();
        } else {
          setTimeout(checkVideo, 500);
        }
      };
      checkVideo();
    });
  }

  setupEventListeners() {
    // Re-initialize if video element changes (e.g., when navigating between videos)
    const observer = new MutationObserver((mutations) => {
      if (!document.body.contains(this.video)) {
        this.video = document.querySelector('video');
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  handleMediaKeyAction(action, value) {
    if (!this.video) {
      this.video = document.querySelector('video');
      if (!this.video) return;
    }

    try {
      switch (action) {
        case 'skip':
          this.video.currentTime += value;
          this.showSkipFeedback(value > 0 ? 'forward' : 'backward', Math.abs(value));
          break;
        case 'playPause':
          if (this.video.paused) {
            this.video.play();
          } else {
            this.video.pause();
          }
          break;
      }
    } catch (error) {
      console.error('Error handling media key action:', error);
    }
  }

  showSkipFeedback(direction, seconds) {
    // Create or update feedback element
    let feedback = document.getElementById('improvedtube-skip-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.id = 'improvedtube-skip-feedback';
      feedback.style.position = 'fixed';
      feedback.style.top = '50%';
      feedback.style.left = '50%';
      feedback.style.transform = 'translate(-50%, -50%)';
      feedback.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      feedback.style.color = 'white';
      feedback.style.padding = '10px 20px';
      feedback.style.borderRadius = '20px';
      feedback.style.fontSize = '24px';
      feedback.style.zIndex = '9999';
      feedback.style.display = 'flex';
      feedback.style.alignItems = 'center';
      feedback.style.justifyContent = 'center';
      document.body.appendChild(feedback);

      // Auto-remove after animation
      setTimeout(() => {
        if (feedback) {
          feedback.style.opacity = '0';
          feedback.style.transition = 'opacity 0.5s';
          setTimeout(() => {
            if (feedback && feedback.parentNode) {
              feedback.parentNode.removeChild(feedback);
            }
          }, 500);
        }
      }, 1000);
    }

    // Update feedback content
    const icon = direction === 'forward' ? '⏩' : '⏪';
    feedback.textContent = `${icon} ${seconds}s`;
    feedback.style.opacity = '1';
    feedback.style.transition = 'none';
  }
}

// Initialize when page is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new YouTubeMediaKeyController();
  });
} else {
  new YouTubeMediaKeyController();
}
