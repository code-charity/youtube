/*--------------------------------------------------------------
>>> FUNCTIONS:
----------------------------------------------------------------
1.0 Inject a script
2.0 Get YouTube page type
3.0 YouTube video page features
4.0 YouTube page features
--------------------------------------------------------------*/

/*--------------------------------------------------------------
1.0 Inject a script
--------------------------------------------------------------*/

function injectScript(data, id = 'improvedtube-message') {
  let elem = document.createElement('script');

  if (document.getElementById(id))
    document.getElementById(id).remove();

  elem.id = id;

  elem.textContent = data.join('');

  document.documentElement.appendChild(elem);
}


/*--------------------------------------------------------------
2.0 Get YouTube page type
--------------------------------------------------------------*/

function getPageType(url_str = location.href) {
  let page_type,
    url_obj = new URL(url_str);

  document.documentElement.removeAttribute('playlist', '');
  document.documentElement.removeAttribute('embed', '');

  if (url_str.match(/\/watch/g) && getParam(url_str.slice(url_str.indexOf('?') + 1), 'v') || url_str.match(/\/embed\//g)) {
    page_type = 'video';

    if (getParam(url_str.slice(url_str.indexOf('?') + 1), 'list'))
      document.documentElement.setAttribute('playlist', '');

    if (url_str.match(/\/embed\//g))
      document.documentElement.setAttribute('embed', '');

  } else if (/\/(channel\/|user\/)[a-zA-Z0-9\_\-]{1,}/.test(url_str)) {
    page_type = 'channel';
  } else {
    page_type = '';
  }

  document.documentElement.setAttribute('page', page_type);

  return page_type;
}


/*--------------------------------------------------------------
3.0 YouTube video page features
--------------------------------------------------------------*/

function videoPage() {
  var wait_player = setInterval(function() {
    let player = document.querySelector('#movie_player'),
      video = document.querySelector('#movie_player video');

    if (player && document.querySelector('.ytp-left-controls') && video && player.setPlaybackQuality) {

      clearInterval(wait_player);

      if (video && (video.src != improvedtube_old_video || improvedtube_old_video == '')) {
        improvedtube_old_video = video.src;
        globalAutoplayByUser=false;

        document.documentElement.removeAttribute('mini-player');

        video.style.transform = '';
        video.removeAttribute('it-rotate');

        video_quality();
        video_volume();
        video_playback_speed();
        video_repeat_button();
        popup_player_button();
        video_rotate_button();
        screenshot_button();

        playlist_reverse();

        channel_videos_count();
        how_long_ago_the_video_was_uploaded();

        description_expanded();
        livechat_collapsed();
        related_videos_collapsed();
        comments_collapsed();

        forced_theater_mode();
        fit_window();
        dim();

        video.addEventListener('canplay', function() {
          fit_window();
        });

        window.addEventListener('resize', function() {
          fit_window(true);
        });


        window.dispatchEvent(new Event('resize'));
      }
    }
  });
}


/*--------------------------------------------------------------
4.0 YouTube page features
--------------------------------------------------------------*/

function pageLoaded() {
  const page_type = getPageType();

  if (getUrlParams().hasOwnProperty('list')) {
    playlist_repeat();
    playlist_shuffle();
  }



  up_next_autoplay();

  if (page_type == 'video')
    videoPage();

  window.addEventListener(
    document.documentElement.getAttribute('youtube-version') == 'new' ? 'yt-navigate-finish' : 'spfdone',
    function(event) {
      const url = document.documentElement.getAttribute('youtube-version') == 'new' ? location.href : event.detail.url,
        page_type = getPageType(url);

      if (page_type == 'video')
        videoPage();
      else {
        if (!document.documentElement.hasAttribute('embed')) {
          video_encode();
        }
      }
    }
  );

  window.addEventListener('yt-page-data-updated', function() {
    if (getUrlParams().hasOwnProperty('list')) {
      playlist_reverse();
    }

    if (getUrlParams().hasOwnProperty('v'))
      videoPage();
  });



  let search_input = document.documentElement.getAttribute('youtube-version') == 'new' ? 'input#search' : 'input#masthead-search-term';

  if (document.querySelector(search_input)) {
    document.querySelector(search_input).addEventListener('focus', function() {
      document.documentElement.setAttribute('search-focus', '');
    });

    document.querySelector(search_input).addEventListener('blur', function() {
      document.documentElement.removeAttribute('search-focus');
    });
  }
}
