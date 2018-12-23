/*--------------------------------------------------------------
>>> PLAYER:
----------------------------------------------------------------
1.0 Video quality
2.0 Video volume
3.0 Video playback speed
4.0 Video encode
5.0 Video autoplay
6.0 Up next autoplay
7.0 Video autopause
8.0 Video repeat
  8.1 Repeat button
9.0 Popup player button
10.0 Mini player
--------------------------------------------------------------*/


/*--------------------------------------------------------------
1.0 Video quality
--------------------------------------------------------------*/

function video_quality(num) {
  let data = settings.video_quality,
    player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');

  if (data && data != 'auto' && player) {
    if (typeof player.getAvailableQualityLevels === 'function' && player.getAvailableQualityLevels()[0] && player.getAvailableQualityLevels().indexOf(data) == -1) {
      data = player.getAvailableQualityLevels()[0];
    }

    player.setPlaybackQuality(data);

    if (player.setPlaybackQualityRange)
      player.setPlaybackQualityRange(data);
  }
}


/*--------------------------------------------------------------
2.0 Video volume
--------------------------------------------------------------*/

function video_volume() {
  const data = settings.video_volume,
    player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');

  if (data && data != 'do_not_change') {
    player.unMute();
    player.setVolume(Number(data));
  }
}


/*--------------------------------------------------------------
3.0 Video playback speed
--------------------------------------------------------------*/

function video_playback_speed() {
  const data = settings.video_playback_speed,
    player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');

  if (data && data != 'do_not_change') {
    player.setPlaybackRate(Number(data));
  }
}


/*--------------------------------------------------------------
4.0 Video encode
--------------------------------------------------------------*/

function video_encode() {
  const data = settings.video_encode;

  if (data == 'h264') {
    let canPlayType = globalCanPlayType,
      isTypeSupported;

    if (window.MediaSource) {
      isTypeSupported = window.MediaSource.isTypeSupported;

      window.MediaSource.isTypeSupported = function(mime) {
        return overwrite(this, isTypeSupported, mime);
      };
    }

    HTMLMediaElement.prototype.canPlayType = function(mime) {
      let status = overwrite(this, canPlayType, mime);

      if (status === false)
        return '';
      else
        return status;
    };

    function overwrite(self, callback, mime) {
      if (!mime || mime.indexOf('webm') != -1 || mime.indexOf('vp8') != -1 || mime.indexOf('vp9') != -1)
        return false;
      else
        return callback.call(self, mime);
    }
  } else {
    if (window.MediaSource)
      window.MediaSource.isTypeSupported = globalIsTypeSupported;

    HTMLMediaElement.prototype.canPlayType = globalCanPlayType;
  }
}


/*--------------------------------------------------------------
5.0 Video autoplay
--------------------------------------------------------------*/

function video_autoplay(string, query) {
  let data = '',
    player = query || '#movie_player';

  if (location.href.match(/\/watch/g)) {
    if (document.documentElement.hasAttribute('playlist'))
      data = settings.playlist_autoplay;
    else
      data = settings.video_autoplay;
  } else if (document.documentElement.getAttribute('page') == 'channel') {
    data = settings.channel_autoplay;
  }

  return data == 'false' && !document.querySelector('.ad-showing,.ad-interrupting') ? false : true;
}


/*--------------------------------------------------------------
6.0 Up next autoplay
--------------------------------------------------------------*/

function up_next_autoplay() {
  globalUpNextAutoplayWait = setInterval(function() {
    if (
      document.querySelector('#related #head.ytd-compact-autoplay-renderer #improved-toggle') ||
      document.querySelector('#autoplay-checkbox')
    ) {
      clearInterval(globalUpNextAutoplayWait);
      const data = settings.up_next_autoplay;

      if (data && data != 'true') {
        let new_youtube_toggle = document.querySelector('#related #head.ytd-compact-autoplay-renderer #improved-toggle'),
          old_youtube_toggle = document.querySelector('#autoplay-checkbox');

        if (new_youtube_toggle && (data == 'enabled' && !new_youtube_toggle.hasAttribute('checked') || data == 'disabled' && new_youtube_toggle.hasAttribute('checked')))
          new_youtube_toggle.click();
        else if (old_youtube_toggle && (data == 'enabled' && !old_youtube_toggle.hasAttribute('checked') || data == 'disabled' && old_youtube_toggle.hasAttribute('checked')))
          old_youtube_toggle.click();
      }
    }
  });
}


/*--------------------------------------------------------------
7.0 Video autopause
--------------------------------------------------------------*/

function video_autopause(type) {
  const data = settings ? settings.video_autopause : 'false',
    player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');

  if (data == 'true' && document.documentElement.getAttribute('page') == 'video') {
    if (type == 'pause')
      document.querySelector('video').pause();
  }
}


/*--------------------------------------------------------------
8.0 Video repeat
--------------------------------------------------------------*/

function video_repeat(repeat) {
  let data = String(repeat || settings.video_repeat) || 'false',
    video = document.querySelector('#movie_player video'),
    button = document.getElementById('improvedtube-repeat-button');

  if (video && data == 'true' && document.getElementById('movie_player').className.search('ad-showing') == -1)
    video.setAttribute('loop', '');
  else
    video.removeAttribute('loop');

  if (button)
    if (video.hasAttribute('loop') && document.getElementById('movie_player').className.search('ad-showing') == -1)
      button.style.opacity = 1;
    else
      button.style.opacity = .5;
}


/*--------------------------------------------------------------
8.1 Repeat button
--------------------------------------------------------------*/

function video_repeat_button() {
  const data = settings.video_repeat_button,
    player = document.getElementById('movie_player');

  if (document.getElementById('improvedtube-repeat-button'))
    document.getElementById('improvedtube-repeat-button').remove();

  if (data == 'true') {
    let button = document.createElement('button');

    button.id = 'improvedtube-repeat-button';
    button.className = 'ytp-button';

    button.innerHTML = '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>';

    if (!document.querySelector('#movie_player video').hasAttribute('loop'))
      button.style.opacity = .5;

    button.onclick = function() {
      if (document.querySelector('#movie_player video').hasAttribute('loop')) {
        video_repeat('false');
        this.style.opacity = .5;
      } else {
        video_repeat('true');
        this.style.opacity = 1;
      }
    };

    document.querySelector('#movie_player .ytp-left-controls').insertBefore(button, document.querySelector('#movie_player .ytp-left-controls').childNodes[3]);
  }
}


/*--------------------------------------------------------------
9.0 Popup player button
--------------------------------------------------------------*/

function popup_player_button() {
  let data = settings.popup_player_button;

  if (document.getElementById('improvedtube-popup-player-button'))
    document.getElementById('improvedtube-popup-player-button').remove();

  if (data == 'true') {
    let button = document.createElement('button');

    button.id = 'improvedtube-popup-player-button';
    button.className = 'ytp-button';

    button.innerHTML = '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z"></svg>';

    button.onclick = function() {
      let player = document.getElementById('movie_player');

      player.pauseVideo();
      window.open('https://www.youtube.com/embed/' + location.href.match(/watch\?v=([A-Za-z0-9\-\_]+)/g)[0].slice(8) + '?start=' + parseInt(player.getCurrentTime()) + '&autoplay=' + (settings.video_autoplay == 'false' ? '0' : '1'), '_blank', 'location=0,menubar=0,status=0,titlebar=0,width=' + player.offsetWidth + ',height=' + player.offsetHeight);
    };

    document.querySelector('#movie_player .ytp-right-controls').insertBefore(button, document.querySelector('#movie_player .ytp-right-controls').childNodes[0]);

  }
}

function video_rotate_button() {
  let data = settings.video_rotate_button;

  if (document.getElementById('improvedtube-rotate-video-button'))
    document.getElementById('improvedtube-rotate-video-button').remove();

  if (data == 'true') {
    let button = document.createElement('button');

    button.id = 'improvedtube-rotate-video-button';
    button.className = 'ytp-button';

    button.innerHTML = '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24"><path d="M15.55 5.55L11 1v3.07a8 8 0 0 0 0 15.86v-2.02a6 6 0 0 1 0-11.82V10l4.55-4.45zM19.93 11a7.9 7.9 0 0 0-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02a7.92 7.92 0 0 0 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41A7.9 7.9 0 0 0 19.93 13h-2.02a5.9 5.9 0 0 1-1.02 2.48z"/></svg>';

    button.onclick = function() {
      let video = document.querySelector('#movie_player video'),
          deg = Number(video.getAttribute('it-rotate'));

      if (typeof deg == 'number') {
        if (deg >= 360)
          deg = 0;
        else
          deg += 90;
      } else {
        deg = 180;
      }

      video.setAttribute('it-rotate', deg);
      video.style.transform = 'rotate('+deg+'deg)';
    };

    document.querySelector('#movie_player .ytp-right-controls').insertBefore(button, document.querySelector('#movie_player .ytp-right-controls').childNodes[0]);

  }
}


/*--------------------------------------------------------------
10.0 Mini player
--------------------------------------------------------------*/

function mini_player() {
  var mini_player_data = {
    x: localStorage.getItem('improvedtube-miniplayer-x') || window.innerWidth - 350 - 16,
    y: localStorage.getItem('improvedtube-miniplayer-y') || window.innerHeight - 200 - 16
  };

  var wait = setInterval(function() {
    if (document.documentElement.getAttribute('page') == 'video' && (document.querySelector('#player-container') || document.querySelector('#player-api')) && document.querySelector('#movie_player video')) {

      clearInterval(wait);
      var mini_player = {
        move: false,
        x: mini_player_data.x,
        y: mini_player_data.y,
        width: 350,
        height: 200,
        width_old: document.querySelector('#movie_player video').offsetWidth,
        height_old: document.querySelector('#movie_player video').offsetHeight,
        left_old: document.querySelector('#movie_player video').offsetLeft,
        top_old: document.querySelector('#movie_player video').offsetTop,
        offset: {
          x: 0,
          y: 0
        }
      };

      window.addEventListener('scroll', function() {
        if (settings.mini_player_b == 'true' && document.documentElement.getAttribute('page') == 'video') {
          if (window.scrollY > 500 && !document.documentElement.hasAttribute('mini-player')) {

            mini_player.width_old = document.querySelector('#movie_player video').offsetWidth;
            mini_player.height_old = document.querySelector('#movie_player video').offsetHeight;
            mini_player.left_old = document.querySelector('#movie_player video').offsetLeft;
            mini_player.top_old = document.querySelector('#movie_player video').offsetTop;

            document.documentElement.setAttribute('mini-player', '');

            if (document.querySelector('#movie_player video').offsetLeft > window.innerWidth - 350 - 16) {
              mini_player.x = window.innerWidth - 350 - 16;
            }

            if (document.querySelector('#movie_player video').offsetTop > window.innerHeight - 200 - 16) {
              mini_player.y = window.innerHeight - 200 - 16;
            }

            (document.querySelector('#player-container') || document.querySelector('#player-api')).setAttribute('style', 'height: ' + mini_player.height_old + 'px !important;');

            if (document.querySelector('.watch-stage-mode #placeholder-player'))
              document.querySelector('.watch-stage-mode #placeholder-player').setAttribute('style', 'height: ' + mini_player.height_old + 'px !important;');

            document.querySelector('#movie_player video').setAttribute('style',
              'left:' + mini_player.x + 'px !important;' +
              'top:' + mini_player.y + 'px !important;' +
              'max-width:' + mini_player.width + 'px !important;' +
              'max-height:' + mini_player.height + 'px !important;'
            );

            document.querySelector('#movie_player video').addEventListener('mousedown', function(event) {
              mini_player.move = true;
              mini_player.offset.x = event.clientX - document.querySelector('#movie_player video').offsetLeft;
              mini_player.offset.y = event.clientY - document.querySelector('#movie_player video').offsetTop;
            });

            window.addEventListener('mouseup', function(event) {
              mini_player.move = false;
              document.documentElement.removeAttribute('move-player');

              mini_player_data.x = mini_player.x;
              mini_player_data.y = mini_player.y;

              localStorage.setItem('improvedtube-miniplayer-x', mini_player.x);
              localStorage.setItem('improvedtube-miniplayer-y', mini_player.y);
            });

            window.addEventListener('mousemove', function(event) {
              if (mini_player.move) {
                document.documentElement.setAttribute('move-player', '');

                mini_player.x = (event.clientX - mini_player.offset.x);
                mini_player.y = (event.clientY - mini_player.offset.y);

                if (event.clientX - mini_player.offset.x <= 16) {
                  mini_player.x = 16;
                } else if (event.clientX + (document.querySelector('#movie_player video').offsetWidth - mini_player.offset.x) >= window.innerWidth - 16) {
                  mini_player.x = window.innerWidth - 16 - document.querySelector('#movie_player video').offsetWidth;
                }

                if (event.clientY - mini_player.offset.y <= 16) {
                  mini_player.y = 16;
                } else if (event.clientY + (document.querySelector('#movie_player video').offsetHeight - mini_player.offset.y) >= window.innerHeight - 16) {
                  mini_player.y = window.innerHeight - 16 - document.querySelector('#movie_player video').offsetHeight;
                }

                document.querySelector('#movie_player video').setAttribute('style',
                  'left:' + mini_player.x + 'px !important;' +
                  'top:' + mini_player.y + 'px !important;' +
                  'max-width:' + mini_player.width + 'px !important;' +
                  'max-height:' + mini_player.height + 'px !important;'
                );
              }
            });


          } else if (window.scrollY < 500 && document.documentElement.hasAttribute('mini-player')) {
            document.documentElement.removeAttribute('mini-player');

            if (document.querySelector('.watch-stage-mode #placeholder-player'))
              document.querySelector('.watch-stage-mode #placeholder-player').removeAttribute('style', '');

            (document.querySelector('#player-container') || document.querySelector('#player-api')).removeAttribute('style', '');
            document.querySelector('#movie_player video').setAttribute('style',
              'left:' + mini_player.left_old + 'px;' +
              'top:' + mini_player.top_old + 'px;' +
              'width:' + mini_player.width_old + 'px;' +
              'height:' + mini_player.height_old + 'px;'
            );

            setTimeout(function () {
              fit_window();
            });

          }
        }
      });
    }
  });


};

function screenshot_button() {
  let data = settings.screenshot_button;

  if (document.getElementById('improvedtube-screenshot-button'))
    document.getElementById('improvedtube-screenshot-button').remove();

  if (data == 'true') {
    let button = document.createElement('button');

    button.id = 'improvedtube-screenshot-button';
    button.className = 'ytp-button';

    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/><path fill="none" d="M0 0h24v24H0z"/></svg>';

    button.onclick = function() {
      let video = document.querySelector('#movie_player video'),
          a = document.createElement('a'),
          cvs = document.createElement('canvas'),
          ctx = cvs.getContext('2d');

      cvs.width = video.offsetWidth;
      cvs.height = video.offsetHeight;

      ctx.drawImage(video, 0, 0, cvs.width, cvs.height);

      a.href = cvs.toDataURL('image/png');
      a.download = 'screenshot.png';

      a.click();
    };

    document.querySelector('#movie_player .ytp-right-controls').insertBefore(button, document.querySelector('#movie_player .ytp-right-controls').childNodes[0]);

  }
}
