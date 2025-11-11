(function () {
  console.log("Channel blocker (allowed channels) loaded");

  const allowedChannels = ["/@pantelisstavroulakis5456"];

  function getChannelHref(video) {
    // Look in multiple possible locations for the channel link
    const possible = [
      'ytd-channel-name a',
      '#channel-name a',
      'a[href^="/@"]'
    ];
    for (const sel of possible) {
      const el = video.querySelector(sel);
      if (el) return el.getAttribute("href");
    }
    return null;
  }

  function filterVideos(videos) {
    videos.forEach(video => {
      const href = getChannelHref(video);
      if (!href || !allowedChannels.includes(href)) {
        video.style.display = "none"; // hide not allowed
      } else {
        video.style.display = ""; // show allowed
      }
    });
  }

  function scanFeed() {
    // Most feed videos
    const videos = document.querySelectorAll(
      "ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer"
    );
    filterVideos(videos);
  }

  function startObserver() {
    const root = document.querySelector("ytd-app") || document.body;
    if (!root) {
      console.log("Waiting for YouTube root...");
      setTimeout(startObserver, 1000);
      return;
    }

    console.log("Main feed detected — filtering active.");
    scanFeed(); // initial scan

    // Watch for newly added videos
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (
            node.nodeType === 1 && 
            (node.tagName === "YTD-RICH-ITEM-RENDERER" || 
             node.tagName === "YTD-VIDEO-RENDERER" || 
             node.tagName === "YTD-GRID-VIDEO-RENDERER")
          ) {
            filterVideos([node]);
          }
        });
      });
    });

    observer.observe(root, { childList: true, subtree: true });
  }

  startObserver();
})();
