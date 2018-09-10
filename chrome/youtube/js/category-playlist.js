/*--------------------------------------------------------------
>>> PLAYLIST:
----------------------------------------------------------------
1.0 Reverse
2.0 Repeat
3.0 Shuffle
--------------------------------------------------------------*/

/*--------------------------------------------------------------
1.0 Reverse
--------------------------------------------------------------*/

function playlist_reverse() {
  const data = settings.playlist_reverse;

  if (data == 'true') {
    if (document.querySelector('ytd-app')) {
      var wait = setInterval(function () {
        if (document.querySelector('ytd-app').data) {
          clearInterval(wait);
          let ytd_app_data = document.querySelector('ytd-app').data;

          if (ytd_app_data.response && ytd_app_data.response.contents && ytd_app_data.response.contents.twoColumnWatchNextResults) {
            let twoColumnWatchNextResults = ytd_app_data.response.contents.twoColumnWatchNextResults;

            if (twoColumnWatchNextResults.playlist && twoColumnWatchNextResults.playlist.playlist && twoColumnWatchNextResults.playlist.playlist.contents) {
              let playlist_element = twoColumnWatchNextResults.playlist.playlist;

              playlist_element.contents.reverse();

              playlist_element.currentIndex = playlist_element.contents.length - playlist_element.currentIndex - 1;

              playlist_element.localCurrentIndex = playlist_element.contents.length - playlist_element.localCurrentIndex - 1;

              for (let i = 0; i < twoColumnWatchNextResults.autoplay.autoplay.sets.length; i++) {
                let set = twoColumnWatchNextResults.autoplay.autoplay.sets[i];

                set.autoplayVideo = set.previousButtonVideo;
                set.previousButtonVideo = set.nextButtonVideo;
                set.nextButtonVideo = set.autoplayVideo;
              }

              if (document.querySelector('ytd-app').updatePageData_)
                document.querySelector('ytd-app').updatePageData_(JSON.parse(JSON.stringify(ytd_app_data)));

              document.querySelector("yt-navigation-manager").updatePlayerComponents_(null, twoColumnWatchNextResults.autoplay.autoplay, null, twoColumnWatchNextResults.playlist.playlist);
            }
          }
        }
      }, 15);
    }

  }
}


/*--------------------------------------------------------------
2.0 Repeat
--------------------------------------------------------------*/

function playlist_repeat() {
  setInterval(function () {
    if (
      document.querySelectorAll('#playlist-actions #top-level-buttons ytd-toggle-button-renderer')[0] ||
      document.querySelector('.playlist-nav-controls .toggle-loop')
    ) {
      const data = settings.playlist_repeat;

      if (data) {
        let new_youtube_toggle = document.querySelectorAll('#playlist-actions #top-level-buttons ytd-toggle-button-renderer'),
            old_youtube_toggle = document.querySelector('.playlist-nav-controls .toggle-loop');

        if (new_youtube_toggle[0] && (data == 'enabled' && new_youtube_toggle[0].className.search('style-default-active') == -1 || data == 'disabled' && new_youtube_toggle[0].className.search('style-default-active') != -1))
          new_youtube_toggle[0].click();
        else if (old_youtube_toggle && (data == 'enabled' && old_youtube_toggle.className.search('yt-uix-button-toggled') == -1 || data == 'disabled' && old_youtube_toggle.className.search('yt-uix-button-toggled') != -1)) {
          old_youtube_toggle.click();
        }
      }
    }
  }, 500);
}


/*--------------------------------------------------------------
3.0 Shuffle
--------------------------------------------------------------*/

function playlist_shuffle() {
  setInterval(function () {
    if (
      document.querySelectorAll('#playlist-actions #top-level-buttons ytd-toggle-button-renderer')[1] ||
      document.querySelector('.playlist-nav-controls .shuffle-playlist')
    ) {
      const data = settings.playlist_shuffle;

      if (data && data != 'true') {
        let new_youtube_toggle = document.querySelectorAll('#playlist-actions #top-level-buttons ytd-toggle-button-renderer'),
            old_youtube_toggle = document.querySelector('.playlist-nav-controls .shuffle-playlist');

        if (new_youtube_toggle[1] && (data == 'enabled' && new_youtube_toggle[1].className.search('style-default-active') == -1 || data == 'disabled' && new_youtube_toggle[1].className.search('style-default-active') != -1))
          new_youtube_toggle[1].click();
        else if (old_youtube_toggle && (data == 'enabled' && old_youtube_toggle.className.search('yt-uix-button-toggled') == -1 || data == 'disabled' && old_youtube_toggle.className.search('yt-uix-button-toggled') != -1)) {
          old_youtube_toggle.click();
        }
      }
    }
  }, 500);
}
