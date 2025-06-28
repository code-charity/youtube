/*--------------------------------------------------------------
>>> FUNCTIONS:
/*--------------------------------------------------------------
# GET URL PARAMETER
--------------------------------------------------------------*/
extension.functions.getUrlParameter = function (url, parameter) {
  var match = url.match(new RegExp("(\\?|\\&)" + parameter + "=[^&]+"));
  if (match) {
    return match[0].substr(3);
  }
};

document.addEventListener("visibilitychange", () => {
  const videos = document.getElementsByTagName("video");
  if (document.hidden && videos.length > 0) {
    const video = videos[0];
    if (!video.paused) {
      video.pause();
      console.log("[YT+]: Video paused (getElementsByTagName fallback)");
    }
  }
});
