/*--------------------------------------------------------------
>>> SHORTCUTS:
----------------------------------------------------------------
1.0 "Keydown" event
2.0 "Wheel" event
--------------------------------------------------------------*/

/*--------------------------------------------------------------
1.0 "Keydown" event
--------------------------------------------------------------*/

function keydown(event) {
  let player = document.getElementById('movie_player'),
      target = event.target || event.srcElement,
      nodeName = target.nodeName,
      keycode = event.keyCode;

  if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 || event.target.isContentEditable)
    return;

  if ((event.which > 47 && event.which < 58 || event.which > 95 && event.which < 106 || [27, 32, 35, 36, 37, 38, 39, 40, 66, 67, 79, 87, 187, 189].indexOf(event.which) > -1) && settings.player_shurtcuts == 'false')
    event.preventDefault();

  if (document.querySelector('.html5-video-player video') && keycode == 75) {
    event.preventDefault();
    document.querySelector('.html5-video-player video').click();
    return;
  }

  if (settings.scroll_adjusts_playback_speed == 'ctrl_plus_minus' && player && (event.code == 'Equal' || event.code == 'Minus')) {
    event.preventDefault();

    let speed_step = 0,
        speed = 0;

    if (event.code == 'Minus')
      speed_step = -.25;
    else if (event.code == 'Equal')
      speed_step = .25;

    speed = player.getPlaybackRate() + speed_step;
    speed = (speed > 2 ? 2 : speed < 0.25 ? 0.25 : speed);

    player.setPlaybackRate(speed);

    if (!document.querySelector('.html5-video-container #speed-status')) {
      var status_e = document.createElement('div');

      status_e.id = 'speed-status';

      document.querySelector('.html5-video-container').appendChild(status_e);
    }

    document.querySelector('.html5-video-container #speed-status').innerHTML = speed;

    if (globalSpeedTimeout)
      clearTimeout(globalVolumeTimeout);

    globalSpeedTimeout = setTimeout(function () {
      if (document.querySelector('.html5-video-container #speed-status')) {
        document.querySelector('.html5-video-container #speed-status').remove();
      }
    }, 300);

    return;
  }

  if (settings.play_next_video == 'right' && player && event.code == 'ArrowRight' && event.ctrlKey) {
    event.preventDefault();
    player.nextVideo();
  }

  if (settings.play_prev_video == 'left' && player && event.code == 'ArrowLeft' && event.ctrlKey) {
    event.preventDefault();
    player.previousVideo();
  }

  if (player && keycode == 32)
    if (settings.play_pause_video == 'disabled') {
      event.preventDefault();
    }
    else {
      event.preventDefault();
      let video = document.querySelector('.html5-video-player video');

      if (video)
        if (video.paused) {
          document.querySelector('.html5-video-player video').play();
        } else {
          document.querySelector('.html5-video-player video').pause();
        }
    }
}


/*--------------------------------------------------------------
2.0 "Wheel" event
--------------------------------------------------------------*/

function wheel(event) {
  let player = document.getElementById('movie_player'),
      target = event.target || event.srcElement,
      nodeName = target.nodeName,
      volume_step = 0,
      volume = 0,
      speed_step = 0,
      speed = 0,
      is_player_focused = false;

  if (nodeName == 'INPUT' || nodeName == 'TEXTAREA' || target.isContentEditable)
    return;

  for (let i = 0, l = event.path.length; i < l; i++) {
    if (typeof event.path[i].className == 'string' && event.path[i].className.search('html5-video-player') != -1)
      is_player_focused = true;
  }

  if (
    (settings.scroll_adjusts_volume == 'shift' && event.shiftKey || settings.scroll_adjusts_volume == 'alt' && event.altKey || settings.scroll_adjusts_volume == 'hover_player' && is_player_focused) &&
    player
   ) {
    event.preventDefault();

    if (event.deltaY > 0 || event.deltaX > 0)
      volume_step = -5;
    else if (event.deltaY < 0 || event.deltaX < 0)
      volume_step = 5;

    volume = parseInt(player.getVolume()) + volume_step;
    volume = (volume > 100 ? 100 : volume < 0 ? 0 : volume);

    player.setVolume(volume);

    if (!document.querySelector('.html5-video-container #volume-status')) {
      var status_e = document.createElement('div');

      status_e.id = 'volume-status';

      document.querySelector('.html5-video-container').appendChild(status_e);
    }

    document.querySelector('.html5-video-container #volume-status').innerHTML = volume + '%';

    if (globalVolumeTimeout)
      clearTimeout(globalVolumeTimeout);

    globalVolumeTimeout = setTimeout(function () {
      if (document.querySelector('.html5-video-container #volume-status')) {
        document.querySelector('.html5-video-container #volume-status').remove();
      }
    }, 300);
  }

  if (
    (settings.scroll_adjusts_playback_speed == 'shift' && event.shiftKey || settings.scroll_adjusts_playback_speed == 'alt' && event.altKey || settings.scroll_adjusts_playback_speed == 'hover_player' && is_player_focused) &&
    player
   ) {
    event.preventDefault();

    if (event.deltaY > 0 || event.deltaX > 0) {
      speed = player.getPlaybackRate() - 0.25;
    } else if (event.deltaY < 0 || event.deltaX < 0) {
      speed = player.getPlaybackRate() + 0.25;
    }

    speed = (speed > 2 ? 2 : speed < 0.25 ? 0.25 : speed);

    player.setPlaybackRate(speed);

    if (!document.querySelector('.html5-video-container #speed-status')) {
      var status_e = document.createElement('div');

      status_e.id = 'speed-status';

      document.querySelector('.html5-video-container').appendChild(status_e);
    }

    document.querySelector('.html5-video-container #speed-status').innerHTML = speed;

    if (globalSpeedTimeout)
      clearTimeout(globalVolumeTimeout);

    globalSpeedTimeout = setTimeout(function () {
      if (document.querySelector('.html5-video-container #speed-status')) {
        document.querySelector('.html5-video-container #speed-status').remove();
      }
    }, 300);
  }
}
