// Function to restore the CC indicator on channels' videos page
function restoreCCIndicator() {
  // Select all video elements on the page
  const videos = document.querySelectorAll('.video-item');

  // Iterate through each video element
  videos.forEach(video => {
    // Check if the video has a subtitle option available
    const subtitlesAvailable = video.querySelector('.subtitle-option') !== null;

    // If subtitles are available, add the CC indicator to the video item
    if (subtitlesAvailable) {
      const ccIndicator = document.createElement('span');
      ccIndicator.textContent = 'CC';
      ccIndicator.className = 'cc-indicator';
      video.appendChild(ccIndicator);
    }
  });
}

// Add an event listener to the window to trigger the function when the page loads
window.addEventListener('load', restoreCCIndicator);
