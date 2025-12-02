// Function to hide overlay suggestions on YouTube embedded player
function hideOverlaySuggestions() {
  const videoContainer = document.querySelector('ytd-rich-item-renderer');
  if (videoContainer) {
    const overlay = videoContainer.querySelector('#overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }
}

// Event listener for the YouTube player state change
ytplayer.onStateChange = function(state) {
  if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.ENDED) {
    hideOverlaySuggestions();
  }
};
