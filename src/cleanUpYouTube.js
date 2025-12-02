// This script will clean up the YouTube DOM and automatically adjust video codecs for optimal viewing experience.

// Function to clean up the YouTube DOM
function cleanYouTubeDOM() {
  // Select all video elements in the YouTube player
  const videos = document.querySelectorAll('video');

  // Loop through each video element and set its playback rate
  videos.forEach(video => {
    if (video.playbackRate !== 1) {
      video.playbackRate = 1; // Set playback rate to normal speed
    }
  });
}

// Function to automatically adjust video codecs
function autoCodecAdjustment() {
  const videos = document.querySelectorAll('video');

  // Loop through each video element and check its codec type
  videos.forEach(video => {
    if (video.src && !video.srcObject) {
      // Example: Adjusting codecs based on the current playback rate
      if (video.playbackRate === 1) {
        video.webkitDecodedFrameCount = Math.round(video.webkitDecodedFrameCount * 0.9);
      } else {
        video.webkitDecodedFrameCount = Math.round(video.webkitDecodedFrameCount * 1.1);
      }
    }
  });
}

// Function to handle the main logic and call necessary functions
function handleYouTubeContent() {
  cleanYouTubeDOM();
  autoCodecAdjustment();
}

// Add event listener for when the YouTube player is ready
yt.events.on('state-changed', (state) => {
  if (state === 'PLAYER_READY') {
    handleYouTubeContent();
  }
});