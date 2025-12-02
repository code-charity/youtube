// Function to handle autoplaying media in a new tab
function autoplayMedia() {
  // Create a new tab with the desired URL
  chrome.tabs.create({
    url: 'https://example.com'
  }, (newTab) => {
    if (!newTab || !newTab.id) {
      console.error('Failed to create a new tab');
      return;
    }

    // Function to handle autoplaying media in the new tab
    function handleAutoplay(mediaElement) {
      mediaElement.autoplay = true;
      mediaElement.play().catch((error) => {
        console.error('Failed to autoplay media:', error);
      });
    }

    // Wait for the DOM to load in the new tab
    chrome.scripting.executeScript({
      target: {tabId: newTab.id},
      func: () => {
        const videoElements = document.querySelectorAll('video');
        const audioElements = document.querySelectorAll('audio');
        const mediaElements = [...videoElements, ...audioElements];

        mediaElements.forEach(handleAutoplay);
      }
    });
  });
}

// Event listener for when a new tab is created
chrome.tabs.onCreated.addListener((newTab) => {
  if (newTab.id) {
    autoplayMedia();
  }
});