// Function to handle popup player button click
function showPlayer(videoId) {
  const playerContainer = document.createElement('div');
  playerContainer.id = 'player-container';
  playerContainer.innerHTML = `\n      <iframe id='popup-player' width='560' height='315' frameborder='0' allowfullscreen></iframe>\n    `;
  document.body.appendChild(playerContainer);
  const popupPlayer = document.getElementById('popup-player');
  popupPlayer.src = `https://www.youtube.com/embed/${videoId}`;
}

// Add event listener to all video preview buttons in the feed
document.querySelectorAll('.feed-video-preview button').forEach(button => {
  button.addEventListener('click', () => {
    const videoId = button.getAttribute('data-video-id');
    if (videoId) {
      showPlayer(videoId);
    }
  });
});