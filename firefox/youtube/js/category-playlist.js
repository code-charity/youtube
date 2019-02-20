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
  const data = /*settings.playlist_reverse*/ globalReversePlaylist;

  if (!getUrlParams().hasOwnProperty('list'))
    return false;

  var wait2 = setInterval(function() {
    if (!document.getElementById('improvedtube-playlist-reverse') && (document.querySelector('ytd-watch-flexy ytd-playlist-panel-renderer #header-contents #playlist-actions ytd-menu-renderer #top-level-buttons') || document.querySelector('.playlist-nav-controls'))) {
      let button = document.createElement('div');

      button.id = 'improvedtube-playlist-reverse';
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/><path d="M0 0h24v24H0z" fill="none"/></svg>';
      button.onclick = function() {
        globalReversePlaylist = true;

        playlist_reverse();
      };

      (document.querySelector('ytd-watch-flexy ytd-playlist-panel-renderer #header-contents #playlist-actions ytd-menu-renderer #top-level-buttons') || document.querySelector('.playlist-nav-controls')).appendChild(button);

      clearInterval(wait2);
    }
  }, 20);

  if (data == true && document.documentElement.getAttribute('youtube-version') == 'old') {
    let prev_href_0 = document.querySelector('div.playlist-behavior-controls a.prev-playlist-list-item') ? document.querySelector('div.playlist-behavior-controls a.prev-playlist-list-item').getAttribute('href') : null,
      next_href_0 = document.querySelector('div.playlist-behavior-controls a.next-playlist-list-item') ? document.querySelector('div.playlist-behavior-controls a.next-playlist-list-item').getAttribute('href') : null,
      prev_href = document.querySelector('.currently-playing').previousElementSibling ? document.querySelector('.currently-playing').previousElementSibling.querySelector('a').href : document.querySelector('#player-playlist ol > li:last-child a').href,
      prev_title = document.querySelector('.currently-playing').previousElementSibling ? document.querySelector('.currently-playing').previousElementSibling.querySelector('h4').innerText : document.querySelector('#player-playlist ol > li:last-child h4').innerText,
      prev_preview = document.querySelector('.currently-playing').previousElementSibling ? document.querySelector('.currently-playing').previousElementSibling.querySelector('img').src : document.querySelector('#player-playlist ol > li:last-child img').src,
      next_href = document.querySelector('.ytp-left-controls > a:not(:first-child)').getAttribute('href'),
      next_title = document.querySelector('.ytp-left-controls > a:not(:first-child)').getAttribute('data-tooltip-text'),
      next_preview = document.querySelector('.ytp-left-controls > a:not(:first-child)').getAttribute('data-preview');

    document.querySelector('.ytp-left-controls > a:first-child').setAttribute('href', next_href);
    document.querySelector('.ytp-left-controls > a:first-child').setAttribute('data-tooltip-text', next_title);
    document.querySelector('.ytp-left-controls > a:first-child').setAttribute('data-preview', next_preview);
    document.querySelector('.ytp-left-controls > a:not(:first-child)').setAttribute('href', prev_href);
    document.querySelector('.ytp-left-controls > a:not(:first-child)').setAttribute('data-tooltip-text', prev_title);
    document.querySelector('.ytp-left-controls > a:not(:first-child)').setAttribute('data-preview', prev_preview);


    if (document.documentElement.getAttribute('youtube-version') == 'old') {
      document.querySelector('div.playlist-behavior-controls a.prev-playlist-list-item').setAttribute('href', next_href_0);
      document.querySelector('div.playlist-behavior-controls a.next-playlist-list-item').setAttribute('href', prev_href_0);

      let playlist = document.querySelectorAll('.playlist-videos-container > ol > li'),
        clone = document.querySelector('.playlist-videos-container > ol').cloneNode(true);

      document.querySelector('.playlist-videos-container > ol').innerHTML = '';

      for (let i = playlist.length - 1; i >= 0; i--) {
        document.querySelector('.playlist-videos-container > ol').appendChild(clone.querySelectorAll('li')[i]);
      }
    }
  }

  if (data == true && document.documentElement.getAttribute('youtube-version') == 'new') {
    var wait = setInterval(function() {
      if (document.querySelector('ytd-app') && document.querySelector('ytd-app').data) {
        clearInterval(wait);
        let autoplay,
          playlist,
          ytd_watch,
          yt_navigation_manager,
          twoColumnWatchNextResults;

        function getSingleObjectByKey(obj, keys, match) {
          let hasKey,
            result;

          for (let property in obj) {
            if (obj.hasOwnProperty(property) && obj[property] !== null) {
              hasKey = keys.constructor.name === 'String' ? keys === property : keys.indexOf(property) > -1;

              if (hasKey && (!match || obj[property].constructor.name !== 'Object' && match(obj[property], obj)))
                return obj[property];
              else if (obj[property].constructor.name === 'Object') {
                if (result = getSingleObjectByKey(obj[property], keys, match))
                  return result;
              } else if (obj[property].constructor.name === 'Array') {
                for (let i = 0, l = obj[property].length; i < l; i++)
                  if (result = getSingleObjectByKey(obj[property][i], keys, match))
                    return result;
              }
            }
          }
        }

        if (document.querySelector('ytd-watch, ytd-watch-flexy') && document.querySelector('ytd-watch, ytd-watch-flexy').data) {
          ytd_watch = document.querySelector('ytd-watch, ytd-watch-flexy');
          if (twoColumnWatchNextResults = getSingleObjectByKey(ytd_watch.data, ['twoColumnWatchNextResults'])) {
            if ('playlist' in twoColumnWatchNextResults && 'playlist' in (playlist = twoColumnWatchNextResults['playlist'])) {
              if ('contents' in (playlist = playlist['playlist'])) {

                playlist['contents'].reverse();

                if ('currentIndex' in playlist)
                  playlist['currentIndex'] = playlist['totalVideos'] - playlist['currentIndex'] - 1;

                if ('localCurrentIndex' in playlist)
                  playlist['localCurrentIndex'] = playlist['contents'].length - playlist['localCurrentIndex'] - 1;

                if ('autoplay' in twoColumnWatchNextResults && 'autoplay' in (autoplay = twoColumnWatchNextResults['autoplay'])) {
                  if ('sets' in (autoplay = autoplay['autoplay'])) {
                    for (let i = 0; i < autoplay['sets'].length; i++) {
                      if (autoplay['sets'][i]['previousButtonVideo'] && autoplay['sets'][i]['nextButtonVideo']) {

                        autoplay['sets'][i]['autoplayVideo'] = autoplay['sets'][i]['previousButtonVideo'];
                        autoplay['sets'][i]['previousButtonVideo'] = autoplay['sets'][i]['nextButtonVideo'];
                        autoplay['sets'][i]['nextButtonVideo'] = autoplay['sets'][i]['autoplayVideo'];

                      }
                    }
                  }
                }

                if ('updatePageData_' in ytd_watch)
                  ytd_watch['updatePageData_'](JSON.parse(JSON.stringify(ytd_watch.data)));

                setTimeout(function() {
                  if (yt_navigation_manager = document.querySelector('yt-navigation-manager'))
                    if ('updatePlayerComponents_' in yt_navigation_manager)
                      yt_navigation_manager['updatePlayerComponents_'](null, autoplay, null, playlist);
                }, 500);

              }
            }
          }
        }
      }
    }, 100);
  }
}


/*--------------------------------------------------------------
2.0 Repeat
--------------------------------------------------------------*/

function playlist_repeat() {
  setInterval(function() {
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
  setInterval(function() {
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
