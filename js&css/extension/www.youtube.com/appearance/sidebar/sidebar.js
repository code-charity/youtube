/*--------------------------------------------------------------
>>> SIDEBAR
----------------------------------------------------------------
# Related videos
# Sticky navigation
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# RELATED VIDEOS
--------------------------------------------------------------*/

extension.features.relatedVideos = function (anything) {
  if (anything instanceof Event) {
    var event = anything;

    if (event.type === "click") {
      var target = event.target;

      if (
        target.id === "items" &&
        target.parentNode.nodeName ===
          "YTD-WATCH-NEXT-SECONDARY-RESULTS-RENDERER"
      ) {
        var rect = target.getBoundingClientRect();

        if (
          event.clientX - rect.left >= 0 &&
          event.clientX - rect.left < rect.width &&
          event.clientY - rect.top >= 0 &&
          event.clientY - rect.top < 48
        ) {
          target.toggleAttribute("it-activated");
        }
      }
    }
  } else {
    if (extension.storage.get("related_videos") === "collapsed") {
      window.addEventListener("click", this.relatedVideos, true);
    } else {
      window.removeEventListener("click", this.relatedVideos, true);
    }
  }
};

/*--------------------------------------------------------------
# LIVECHAT
--------------------------------------------------------------*/
if (extension.storage.get("livechat") === "collapsed") {
  window.addEventListener(
    "click",
    function (event) {
      if (extension.storage.get("livechat") !== "collapsed") return;

      var chat = event.target.closest("#chat-container");
      if (!chat) return;

      var rect = chat.getBoundingClientRect();
      if (
        event.clientX - rect.left >= 0 &&
        event.clientX - rect.left < rect.width &&
        event.clientY - rect.top >= 0 &&
        event.clientY - rect.top < 48
      ) {
        chat.toggleAttribute("it-activated");
      }
    },
    true
  );
}

/*--------------------------------------------------------------
# STICKY NAVIGATION
--------------------------------------------------------------*/

extension.features.stickyNavigation = function () {
  if (extension.storage.get("sticky_navigation") === true) {
    // Function to ensure navigation stays visible
    function ensureNavigationVisible() {
      const miniGuide = document.querySelector("ytd-mini-guide-renderer");
      const guide = document.querySelector("ytd-guide-renderer");

      if (miniGuide) {
        miniGuide.style.transform = "translateX(0)";
        miniGuide.style.transition = "none";
        miniGuide.removeAttribute("hidden");
        miniGuide.setAttribute("aria-hidden", "false");
      }

      if (guide) {
        guide.style.transform = "translateX(0)";
        guide.style.transition = "none";
        guide.removeAttribute("hidden");
        guide.setAttribute("aria-hidden", "false");
      }
    }

    // Apply immediately
    ensureNavigationVisible();

    // Set up observer to watch for navigation changes
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "hidden" ||
            mutation.attributeName === "aria-hidden")
        ) {
          ensureNavigationVisible();
        }
      });
    });

    // Observe navigation elements
    const miniGuide = document.querySelector("ytd-mini-guide-renderer");
    const guide = document.querySelector("ytd-guide-renderer");

    if (miniGuide) {
      observer.observe(miniGuide, {
        attributes: true,
        attributeFilter: ["hidden", "aria-hidden"],
      });
    }

    if (guide) {
      observer.observe(guide, {
        attributes: true,
        attributeFilter: ["hidden", "aria-hidden"],
      });
    }

    // Store observer for cleanup
    extension.features.stickyNavigationObserver = observer;
  } else {
    // Clean up observer if setting is disabled
    if (extension.features.stickyNavigationObserver) {
      extension.features.stickyNavigationObserver.disconnect();
      extension.features.stickyNavigationObserver = null;
    }
  }
};

/*--------------------------------------------------------------
# SUBSCRIPTIONS IN SIDEBAR
--------------------------------------------------------------*/
extension.features.subscriptionsSidebar = async function () {
  try {
    // Only run if user enabled the feature in storage (default: disabled)
    if (
      extension.storage.get &&
      extension.storage.get("show_subscriptions_in_sidebar") !== true
    )
      return;

    const containerId = "it-subscriptions-sidebar";

    // Avoid duplicate inserts
    if (document.getElementById(containerId)) return;

    const miniGuide =
      document.querySelector("ytd-mini-guide-renderer") ||
      document.querySelector("#guide");
    if (!miniGuide) return;

    // Fetch subscriptions feed page (same-origin) and parse a few recent videos
    const response = await fetch("/feed/subscriptions");
    const text = await response.text();
    const doc = new DOMParser().parseFromString(text, "text/html");

    // Find video links in the subscriptions feed. This selector targets the usual thumbnails/links.
    const videoAnchors = doc.querySelectorAll(
      'a#thumbnail[href^="/watch"], a#video-title[href^="/watch"]'
    );

    if (!videoAnchors || videoAnchors.length === 0) return;

    const wrapper = document.createElement("div");
    wrapper.id = containerId;
    wrapper.style.padding = "8px 12px";
    wrapper.style.maxHeight = "360px";
    wrapper.style.overflowY = "auto";
    wrapper.style.background = "transparent";

    const title = document.createElement("div");
    title.textContent = "Subscriptions";
    title.style.fontWeight = "600";
    title.style.marginBottom = "6px";
    title.style.color = "var(--ytd-text-primary, #111)";
    wrapper.appendChild(title);

    // Add first 6 unique videos
    const added = new Set();
    let count = 0;
    for (let i = 0; i < videoAnchors.length && count < 6; i++) {
      const a = videoAnchors[i];
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/watch")) continue;
      if (added.has(href)) continue;

      added.add(href);

      // Try to get a title from nearby selectors in the parsed doc
      let titleText = "";
      const titleNode =
        a.closest("ytd-rich-item-renderer")?.querySelector("#video-title") ||
        doc.querySelectorAll("#video-title")[i];
      if (titleNode) titleText = titleNode.textContent.trim();
      if (!titleText)
        titleText = a.getAttribute("title") || "Subscription video";

      const item = document.createElement("a");
      item.href = href;
      item.textContent = titleText;
      item.style.display = "block";
      item.style.padding = "6px 0";
      item.style.color = "var(--ytd-text-primary, #111)";
      item.style.textDecoration = "none";
      item.target = "_blank";

      wrapper.appendChild(item);
      count++;
    }

    // Insert wrapper into the mini guide (after the main entries)
    try {
      // Prefer appending to the mini guide content area
      const section = miniGuide.querySelector("#endpoint") || miniGuide;
      section.appendChild(wrapper);
    } catch (e) {
      miniGuide.appendChild(wrapper);
    }

    // Re-run when navigation happens (YouTube SPA updates)
    const observer = new MutationObserver(function () {
      if (!document.getElementById(containerId)) {
        // if removed for some reason, try to reattach next navigation
        extension.features.subscriptionsSidebar();
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  } catch (error) {
    console.log("subscriptionsSidebar error", error);
  }
};
