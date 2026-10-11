// Add this code to the webRequest handling section
let autoplayDisabled = false;

// Cache autoplay setting for webRequest usage
chrome.storage.local.get('player_autoplay_disable', (result) => {
  autoplayDisabled = result.player_autoplay_disable || false;
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.player_autoplay_disable) {
    autoplayDisabled = changes.player_autoplay_disable.newValue;
  }
});

// Intercept YouTube watch page requests to disable autoplay
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!autoplayDisabled) return;
    
    try {
      const url = new URL(details.url);
      if (url.hostname === 'www.youtube.com' && url.pathname === '/watch') {
        const params = new URLSearchParams(url.search);
        if (params.get('autoplay') !== '0') {
          params.set('autoplay', '0');
          return {
            redirectUrl: `${url.origin}${url.pathname}?${params.toString()}${url.hash}`
          };
        }
      }
    } catch (e) {}
  },
  {
    urls: ["*://www.youtube.com/watch*"]
  },
  ["blocking"]
);
