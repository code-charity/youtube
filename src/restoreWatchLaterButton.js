function restoreWatchLaterButton() {
  const thumbnailContainers = document.querySelectorAll('.ytd-rich-item-renderer, .ytd-video-renderer');
  thumbnailContainers.forEach(thumbnail => {
    if (!thumbnail.querySelector('button[aria-label="Add to Watch Later"]')) {
      const watchLaterButton = document.createElement('button');
      watchLaterButton.setAttribute('aria-label', 'Add to Watch Later');
      watchLaterButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-addto-queue yt-icon-addto-queue"><path d="M12 5v7m0 0l-3-3m3 3l3-3M12 12h7m-7 0H5"></path></svg>';
      watchLaterButton.classList.add('ytp-button', 'ytp-watch-later-button');
      thumbnail.appendChild(watchLaterButton);
    }
  });
}

try {
  restoreWatchLaterButton();
} catch (error) {
  console.error('Error restoring Watch Later button:', error);
}