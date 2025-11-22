/*--------------------------------------------------------------
>>> HIDE YOUTUBE ELEMENTS
----------------------------------------------------------------
*/
console.log("ImprovedTube: hide-elements content script loaded");
/*--------------------------------------------------------------
>>> HIDE YOUTUBE ELEMENTS
----------------------------------------------------------------
# Hide More from YouTube and Explore
# Hide Shorts button
--------------------------------------------------------------*/

extension.features.hideMoreExplore = function () {
  // Mark sections first
  console.log(
    "ImprovedTube: hideMoreExplore running, storage value=",
    extension.storage.get("hide_more_explore")
  );
  document.querySelectorAll("ytd-guide-section-renderer").forEach((section) => {
    const titleEl = section.querySelector("#guide-content-title");
    if (titleEl) {
      const title = titleEl.textContent.trim();
      if (title === "More from YouTube") {
        section.setAttribute("it-section", "more-from-youtube");
      } else if (title === "Explore") {
        section.setAttribute("it-section", "explore");
      }
    }
  });

  // Then apply the visibility
  if (extension.storage.get("hide_more_explore") === true) {
    document.documentElement.setAttribute("it-hide-more-explore", "true");
  } else {
    document.documentElement.removeAttribute("it-hide-more-explore");
  }
};

extension.features.hideShortsButton = function () {
  console.log(
    "ImprovedTube: hideShortsButton running, storage value=",
    extension.storage.get("hide_shorts_button")
  );
  if (extension.storage.get("hide_shorts_button") === true) {
    document.documentElement.setAttribute("it-hide-shorts", "true");
  } else {
    document.documentElement.removeAttribute("it-hide-shorts");
  }
};

// Initialize observers when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Run initial check
  extension.features.hideMoreExplore();
  extension.features.hideShortsButton();

  // Set up observer for future changes
  const observer = new MutationObserver(() => {
    extension.features.hideMoreExplore();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
});
