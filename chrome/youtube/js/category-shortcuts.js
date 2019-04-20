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
    let player = document.querySelector('.html5-video-player'),
        target = event.target || event.srcElement,
        nodeName = target.nodeName,
        keycode = event.keyCode,
        picture_in_picture_shortcut = settings.hasOwnProperty('picture_in_picture_shortcut') ? JSON.parse(settings.picture_in_picture_shortcut) : null,
        play_pause = settings.hasOwnProperty('play_pause') ? JSON.parse(settings.play_pause) : null,
        stop = settings.hasOwnProperty('stop') ? JSON.parse(settings.stop) : null,
        next_video = settings.hasOwnProperty('next_video') ? JSON.parse(settings.next_video) : null,
        prev_video = settings.hasOwnProperty('prev_video') ? JSON.parse(settings.prev_video) : null,
        seek_backward = settings.hasOwnProperty('seek_backward') ? JSON.parse(settings.seek_backward) : null,
        seek_forward = settings.hasOwnProperty('seek_forward') ? JSON.parse(settings.seek_forward) : null,
        increase_volume = settings.hasOwnProperty('increase_volume') ? JSON.parse(settings.increase_volume) : null,
        decrease_volume = settings.hasOwnProperty('decrease_volume') ? JSON.parse(settings.decrease_volume) : null,
        increase_playback_speed = settings.hasOwnProperty('increase_playback_speed') ? JSON.parse(settings.increase_playback_speed) : null,
        decrease_playback_speed = settings.hasOwnProperty('decrease_playback_speed') ? JSON.parse(settings.decrease_playback_speed) : null,
        go_to_search_box = settings.hasOwnProperty('go_to_search_box') ? JSON.parse(settings.go_to_search_box) : null,
        activate_fullscreen = settings.hasOwnProperty('activate_fullscreen') ? JSON.parse(settings.activate_fullscreen) : null,
        like_shortcut = settings.hasOwnProperty('like_shortcut') ? JSON.parse(settings.like_shortcut) : null,
        dislike_shortcut = settings.hasOwnProperty('dislike_shortcut') ? JSON.parse(settings.dislike_shortcut) : null,
        shortcut_240p = settings.hasOwnProperty('shortcut_240p') ? JSON.parse(settings.shortcut_240p) : null,
        shortcut_360p = settings.hasOwnProperty('shortcut_360p') ? JSON.parse(settings.shortcut_360p) : null,
        shortcut_480p = settings.hasOwnProperty('shortcut_480p') ? JSON.parse(settings.shortcut_480p) : null,
        shortcut_720p = settings.hasOwnProperty('shortcut_720p') ? JSON.parse(settings.shortcut_720p) : null,
        shortcut_1080p = settings.hasOwnProperty('shortcut_1080p') ? JSON.parse(settings.shortcut_1080p) : null,
        activate_captions = settings.hasOwnProperty('activate_captions') ? JSON.parse(settings.activate_captions) : null;

    if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 || event.target.isContentEditable)
        return;

    improvedtubeKeys = event;

    if (
        player &&
        picture_in_picture_shortcut &&
        picture_in_picture_shortcut.altKey == event.altKey &&
        picture_in_picture_shortcut.ctrlKey == event.ctrlKey &&
        picture_in_picture_shortcut.shiftKey == event.shiftKey &&
        (picture_in_picture_shortcut.key == event.key || !picture_in_picture_shortcut.key) &&
        !picture_in_picture_shortcut.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        picture_in_picture();

        return false;
    }

    if (
        player &&
        play_pause &&
        play_pause.altKey == event.altKey &&
        play_pause.ctrlKey == event.ctrlKey &&
        play_pause.shiftKey == event.shiftKey &&
        (play_pause.key == event.key || !play_pause.key) &&
        !play_pause.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (player.querySelector('video').paused)
            player.querySelector('video').play();
        else
            player.querySelector('video').pause();

        return false;
    }

    if (
        player &&
        stop &&
        stop.altKey == event.altKey &&
        stop.ctrlKey == event.ctrlKey &&
        stop.shiftKey == event.shiftKey &&
        (stop.key == event.key || !stop.key) &&
        !stop.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.stopVideo();

        return false;
    }

    if (
        player &&
        next_video &&
        next_video.altKey == event.altKey &&
        next_video.ctrlKey == event.ctrlKey &&
        next_video.shiftKey == event.shiftKey &&
        (next_video.key == event.key || !next_video.key) &&
        !next_video.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.nextVideo();

        return false;
    }

    if (
        player &&
        prev_video &&
        prev_video.altKey == event.altKey &&
        prev_video.ctrlKey == event.ctrlKey &&
        prev_video.shiftKey == event.shiftKey &&
        (prev_video.key == event.key || !prev_video.key) &&
        !prev_video.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.previousVideo();

        return false;
    }

    if (
        player &&
        seek_backward &&
        seek_backward.altKey == event.altKey &&
        seek_backward.ctrlKey == event.ctrlKey &&
        seek_backward.shiftKey == event.shiftKey &&
        (seek_backward.key == event.key || !seek_backward.key) &&
        !seek_backward.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.seekBy(-10);

        return false;
    }

    if (
        player &&
        increase_volume &&
        increase_volume.altKey == event.altKey &&
        increase_volume.ctrlKey == event.ctrlKey &&
        increase_volume.shiftKey == event.shiftKey &&
        (increase_volume.key == event.key || !increase_volume.key) &&
        !increase_volume.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.setVolume(player.getVolume() + 5);

        if (!document.querySelector('.html5-video-container #speed-status')) {
            var status_e = document.createElement('div');

            status_e.id = 'speed-status';

            document.querySelector('.html5-video-container').appendChild(status_e);
        }

        document.querySelector('.html5-video-container #speed-status').innerHTML = player.getVolume();

        if (globalSpeedTimeout)
            clearTimeout(globalVolumeTimeout);

        globalSpeedTimeout = setTimeout(function() {
            if (document.querySelector('.html5-video-container #speed-status')) {
                document.querySelector('.html5-video-container #speed-status').remove();
            }
        }, 500);

        return false;
    }

    if (
        player &&
        decrease_volume &&
        decrease_volume.altKey == event.altKey &&
        decrease_volume.ctrlKey == event.ctrlKey &&
        decrease_volume.shiftKey == event.shiftKey &&
        (decrease_volume.key == event.key || !decrease_volume.key) &&
        !decrease_volume.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.setVolume(player.getVolume() - 5);

        if (!document.querySelector('.html5-video-container #speed-status')) {
            var status_e = document.createElement('div');

            status_e.id = 'speed-status';

            document.querySelector('.html5-video-container').appendChild(status_e);
        }

        document.querySelector('.html5-video-container #speed-status').innerHTML = player.getVolume();

        if (globalSpeedTimeout)
            clearTimeout(globalVolumeTimeout);

        globalSpeedTimeout = setTimeout(function() {
            if (document.querySelector('.html5-video-container #speed-status')) {
                document.querySelector('.html5-video-container #speed-status').remove();
            }
        }, 500);

        return false;
    }

    if (
        player &&
        increase_playback_speed &&
        increase_playback_speed.altKey == event.altKey &&
        increase_playback_speed.ctrlKey == event.ctrlKey &&
        increase_playback_speed.shiftKey == event.shiftKey &&
        (increase_playback_speed.key == event.key || !increase_playback_speed.key) &&
        !increase_playback_speed.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.setPlaybackRate(player.getPlaybackRate() + .25);

        if (!document.querySelector('.html5-video-container #speed-status')) {
            var status_e = document.createElement('div');

            status_e.id = 'speed-status';

            document.querySelector('.html5-video-container').appendChild(status_e);
        }

        document.querySelector('.html5-video-container #speed-status').innerHTML = player.getPlaybackRate();

        if (globalSpeedTimeout)
            clearTimeout(globalVolumeTimeout);

        globalSpeedTimeout = setTimeout(function() {
            if (document.querySelector('.html5-video-container #speed-status')) {
                document.querySelector('.html5-video-container #speed-status').remove();
            }
        }, 500);

        return false;
    }

    if (
        player &&
        decrease_playback_speed &&
        decrease_playback_speed.altKey == event.altKey &&
        decrease_playback_speed.ctrlKey == event.ctrlKey &&
        decrease_playback_speed.shiftKey == event.shiftKey &&
        (decrease_playback_speed.key == event.key || !decrease_playback_speed.key) &&
        !decrease_playback_speed.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.setPlaybackRate(player.getPlaybackRate() - .25);

        if (!document.querySelector('.html5-video-container #speed-status')) {
            var status_e = document.createElement('div');

            status_e.id = 'speed-status';

            document.querySelector('.html5-video-container').appendChild(status_e);
        }

        document.querySelector('.html5-video-container #speed-status').innerHTML = player.getPlaybackRate();

        if (globalSpeedTimeout)
            clearTimeout(globalVolumeTimeout);

        globalSpeedTimeout = setTimeout(function() {
            if (document.querySelector('.html5-video-container #speed-status')) {
                document.querySelector('.html5-video-container #speed-status').remove();
            }
        }, 500);

        return false;
    }

    if (
        player &&
        go_to_search_box &&
        go_to_search_box.altKey == event.altKey &&
        go_to_search_box.ctrlKey == event.ctrlKey &&
        go_to_search_box.shiftKey == event.shiftKey &&
        (go_to_search_box.key == event.key || !go_to_search_box.key) &&
        !go_to_search_box.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (document.getElementById('masthead-search-term'))
            document.getElementById('masthead-search-term').focus();

        return false;
    }

    if (
        player &&
        activate_fullscreen &&
        activate_fullscreen.altKey == event.altKey &&
        activate_fullscreen.ctrlKey == event.ctrlKey &&
        activate_fullscreen.shiftKey == event.shiftKey &&
        (activate_fullscreen.key == event.key || !activate_fullscreen.key) &&
        !activate_fullscreen.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.toggleFullscreen();

        return false;
    }

    if (
        player &&
        activate_captions &&
        activate_captions.altKey == event.altKey &&
        activate_captions.ctrlKey == event.ctrlKey &&
        activate_captions.shiftKey == event.shiftKey &&
        (activate_captions.key == event.key || !activate_captions.key) &&
        !activate_captions.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (player.querySelector('.ytp-subtitles-button'))
            player.querySelector('.ytp-subtitles-button').click();

        return false;
    }

    if (
        player &&
        like_shortcut &&
        like_shortcut.altKey == event.altKey &&
        like_shortcut.ctrlKey == event.ctrlKey &&
        like_shortcut.shiftKey == event.shiftKey &&
        (like_shortcut.key == event.key || !like_shortcut.key) &&
        !like_shortcut.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (document.documentElement.getAttribute('youtube-version') == 'old') {
            if (document.querySelectorAll('.like-button-renderer-like-button')[0] && !document.querySelectorAll('.like-button-renderer-like-button')[0].classList.contains('hid'))
                document.querySelectorAll('.like-button-renderer-like-button')[0].click();
            else if (document.querySelectorAll('.like-button-renderer-like-button')[1])
                document.querySelectorAll('.like-button-renderer-like-button')[1].click();
        } else if (document.querySelectorAll('#menu #top-level-buttons ytd-toggle-button-renderer')[0])
            document.querySelectorAll('#menu #top-level-buttons ytd-toggle-button-renderer')[0].click();

        return false;
    }

    if (
        player &&
        dislike_shortcut &&
        dislike_shortcut.altKey == event.altKey &&
        dislike_shortcut.ctrlKey == event.ctrlKey &&
        dislike_shortcut.shiftKey == event.shiftKey &&
        (dislike_shortcut.key == event.key || !dislike_shortcut.key) &&
        !dislike_shortcut.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (document.documentElement.getAttribute('youtube-version') == 'old') {
            if (document.querySelectorAll('.like-button-renderer-dislike-button')[0] && !document.querySelectorAll('.like-button-renderer-dislike-button')[0].classList.contains('hid'))
                document.querySelectorAll('.like-button-renderer-dislike-button')[0].click();
            else if (document.querySelectorAll('.like-button-renderer-dislike-button')[1])
                document.querySelectorAll('.like-button-renderer-dislike-button')[1].click();
        } else if (document.querySelectorAll('#menu #top-level-buttons ytd-toggle-button-renderer')[1])
            document.querySelectorAll('#menu #top-level-buttons ytd-toggle-button-renderer')[1].click();

        return false;
    }

    if (
        player &&
        shortcut_240p &&
        shortcut_240p.altKey == event.altKey &&
        shortcut_240p.ctrlKey == event.ctrlKey &&
        shortcut_240p.shiftKey == event.shiftKey &&
        (shortcut_240p.key == event.key || !shortcut_240p.key) &&
        !shortcut_240p.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        var quality_levels = player.getAvailableQualityLevels(),
            data = 'small';

        if (quality_levels.indexOf(data) == -1)
            data = quality_levels[0];

        player.setPlaybackQualityRange(data);
        player.setPlaybackQuality(data);

        return false;
    }

    if (
        player &&
        shortcut_360p &&
        shortcut_360p.altKey == event.altKey &&
        shortcut_360p.ctrlKey == event.ctrlKey &&
        shortcut_360p.shiftKey == event.shiftKey &&
        (shortcut_360p.key == event.key || !shortcut_360p.key) &&
        !shortcut_360p.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        var quality_levels = player.getAvailableQualityLevels(),
            data = 'medium';

        if (quality_levels.indexOf(data) == -1)
            data = quality_levels[0];

        player.setPlaybackQualityRange(data);
        player.setPlaybackQuality(data);

        return false;
    }

    if (
        player &&
        shortcut_480p &&
        shortcut_480p.altKey == event.altKey &&
        shortcut_480p.ctrlKey == event.ctrlKey &&
        shortcut_480p.shiftKey == event.shiftKey &&
        (shortcut_480p.key == event.key || !shortcut_480p.key) &&
        !shortcut_480p.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        var quality_levels = player.getAvailableQualityLevels(),
            data = 'large';

        if (quality_levels.indexOf(data) == -1)
            data = quality_levels[0];

        player.setPlaybackQualityRange(data);
        player.setPlaybackQuality(data);

        return false;
    }

    if (
        player &&
        shortcut_720p &&
        shortcut_720p.altKey == event.altKey &&
        shortcut_720p.ctrlKey == event.ctrlKey &&
        shortcut_720p.shiftKey == event.shiftKey &&
        (shortcut_720p.key == event.key || !shortcut_720p.key) &&
        !shortcut_720p.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        var quality_levels = player.getAvailableQualityLevels(),
            data = 'hd720';

        if (quality_levels.indexOf(data) == -1)
            data = quality_levels[0];

        player.setPlaybackQualityRange(data);
        player.setPlaybackQuality(data);

        return false;
    }

    if (
        player &&
        shortcut_1080p &&
        shortcut_1080p.altKey == event.altKey &&
        shortcut_1080p.ctrlKey == event.ctrlKey &&
        shortcut_1080p.shiftKey == event.shiftKey &&
        (shortcut_1080p.key == event.key || !shortcut_1080p.key) &&
        !shortcut_1080p.hasOwnProperty('scroll')
    ) {
        event.preventDefault();
        event.stopPropagation();

        var quality_levels = player.getAvailableQualityLevels(),
            data = 'hd1080';

        if (quality_levels.indexOf(data) == -1)
            data = quality_levels[0];

        player.setPlaybackQualityRange(data);
        player.setPlaybackQuality(data);

        return false;
    }
}


/*--------------------------------------------------------------
2.0 "Wheel" event
--------------------------------------------------------------*/

function wheel(event) {
    let player = document.querySelector('.html5-video-player'),
        target = event.target || event.srcElement,
        nodeName = target.nodeName,
        keycode = event.keyCode,
        picture_in_picture_shortcut = settings.hasOwnProperty('picture_in_picture_shortcut') ? JSON.parse(settings.picture_in_picture_shortcut) : null,
        play_pause = settings.hasOwnProperty('play_pause') ? JSON.parse(settings.play_pause) : null,
        stop = settings.hasOwnProperty('stop') ? JSON.parse(settings.stop) : null,
        next_video = settings.hasOwnProperty('next_video') ? JSON.parse(settings.next_video) : null,
        prev_video = settings.hasOwnProperty('prev_video') ? JSON.parse(settings.prev_video) : null,
        seek_backward = settings.hasOwnProperty('seek_backward') ? JSON.parse(settings.seek_backward) : null,
        seek_forward = settings.hasOwnProperty('seek_forward') ? JSON.parse(settings.seek_forward) : null,
        increase_volume = settings.hasOwnProperty('increase_volume') ? JSON.parse(settings.increase_volume) : null,
        decrease_volume = settings.hasOwnProperty('decrease_volume') ? JSON.parse(settings.decrease_volume) : null,
        increase_playback_speed = settings.hasOwnProperty('increase_playback_speed') ? JSON.parse(settings.increase_playback_speed) : null,
        decrease_playback_speed = settings.hasOwnProperty('decrease_playback_speed') ? JSON.parse(settings.decrease_playback_speed) : null,
        go_to_search_box = settings.hasOwnProperty('go_to_search_box') ? JSON.parse(settings.go_to_search_box) : null,
        activate_fullscreen = settings.hasOwnProperty('activate_fullscreen') ? JSON.parse(settings.activate_fullscreen) : null,
        like_shortcut = settings.hasOwnProperty('like_shortcut') ? JSON.parse(settings.like_shortcut) : null,
        dislike_shortcut = settings.hasOwnProperty('dislike_shortcut') ? JSON.parse(settings.dislike_shortcut) : null,
        shortcut_240p = settings.hasOwnProperty('shortcut_240p') ? JSON.parse(settings.shortcut_240p) : null,
        shortcut_360p = settings.hasOwnProperty('shortcut_360p') ? JSON.parse(settings.shortcut_360p) : null,
        shortcut_480p = settings.hasOwnProperty('shortcut_480p') ? JSON.parse(settings.shortcut_480p) : null,
        shortcut_720p = settings.hasOwnProperty('shortcut_720p') ? JSON.parse(settings.shortcut_720p) : null,
        shortcut_1080p = settings.hasOwnProperty('shortcut_1080p') ? JSON.parse(settings.shortcut_1080p) : null,
        activate_captions = settings.hasOwnProperty('activate_captions') ? JSON.parse(settings.activate_captions) : null,
        player_hovered = false;

    if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 || event.target.isContentEditable)
        return;

    for (let i = 0, l = event.path.length; i < l; i++)
        if (event.path[i].classList && event.path[i].classList.contains('html5-video-player'))
            player_hovered = true;

    if (
        player &&
        play_pause &&
        play_pause.altKey == improvedtubeKeys.altKey &&
        play_pause.ctrlKey == improvedtubeKeys.ctrlKey &&
        play_pause.shiftKey == improvedtubeKeys.shiftKey &&
        (play_pause.key == improvedtubeKeys.key || !play_pause.key) &&
        (play_pause.scroll > 0 && event.deltaY > 0 || play_pause.scroll < 0 && event.deltaY < 0) &&
        (play_pause.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (player.querySelector('video').paused)
            player.querySelector('video').play();
        else
            player.querySelector('video').pause();

        return false;
    }

    if (
        player &&
        stop &&
        stop.altKey == improvedtubeKeys.altKey &&
        stop.ctrlKey == improvedtubeKeys.ctrlKey &&
        stop.shiftKey == improvedtubeKeys.shiftKey &&
        (stop.key == improvedtubeKeys.key || !stop.key) &&
        (stop.scroll > 0 && event.deltaY > 0 || stop.scroll < 0 && event.deltaY < 0) &&
        (stop.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.stopVideo();

        return false;
    }

    if (
        player &&
        next_video &&
        next_video.altKey == improvedtubeKeys.altKey &&
        next_video.ctrlKey == improvedtubeKeys.ctrlKey &&
        next_video.shiftKey == improvedtubeKeys.shiftKey &&
        (next_video.key == improvedtubeKeys.key || !next_video.key) &&
        (next_video.scroll > 0 && event.deltaY > 0 || next_video.scroll < 0 && event.deltaY < 0) &&
        (next_video.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.nextVideo();

        return false;
    }

    if (
        player &&
        prev_video &&
        prev_video.altKey == improvedtubeKeys.altKey &&
        prev_video.ctrlKey == improvedtubeKeys.ctrlKey &&
        prev_video.shiftKey == improvedtubeKeys.shiftKey &&
        (prev_video.key == improvedtubeKeys.key || !prev_video.key) &&
        (prev_video.scroll > 0 && event.deltaY > 0 || prev_video.scroll < 0 && event.deltaY < 0) &&
        (prev_video.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.previousVideo();

        return false;
    }

    if (
        player &&
        seek_backward &&
        seek_backward.altKey == improvedtubeKeys.altKey &&
        seek_backward.ctrlKey == improvedtubeKeys.ctrlKey &&
        seek_backward.shiftKey == improvedtubeKeys.shiftKey &&
        (seek_backward.key == improvedtubeKeys.key || !seek_backward.key) &&
        (seek_backward.scroll > 0 && event.deltaY > 0 || seek_backward.scroll < 0 && event.deltaY < 0) &&
        (seek_backward.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.seekBy(-10);

        return false;
    }

    if (
        player &&
        seek_forward &&
        seek_forward.altKey == improvedtubeKeys.altKey &&
        seek_forward.ctrlKey == improvedtubeKeys.ctrlKey &&
        seek_forward.shiftKey == improvedtubeKeys.shiftKey &&
        (seek_forward.key == improvedtubeKeys.key || !seek_forward.key) &&
        (seek_forward.scroll > 0 && event.deltaY > 0 || seek_forward.scroll < 0 && event.deltaY < 0) &&
        (seek_forward.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.seekBy(10);

        return false;
    }

    if (
        player &&
        increase_volume &&
        increase_volume.altKey == improvedtubeKeys.altKey &&
        increase_volume.ctrlKey == improvedtubeKeys.ctrlKey &&
        increase_volume.shiftKey == improvedtubeKeys.shiftKey &&
        (increase_volume.key == improvedtubeKeys.key || !increase_volume.key) &&
        (increase_volume.scroll > 0 && event.deltaY > 0 || increase_volume.scroll < 0 && event.deltaY < 0) &&
        (increase_volume.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.setVolume(player.getVolume() + 5);

        if (!document.querySelector('.html5-video-container #speed-status')) {
            var status_e = document.createElement('div');

            status_e.id = 'speed-status';

            document.querySelector('.html5-video-container').appendChild(status_e);
        }

        document.querySelector('.html5-video-container #speed-status').innerHTML = player.getVolume();

        if (globalSpeedTimeout)
            clearTimeout(globalVolumeTimeout);

        globalSpeedTimeout = setTimeout(function() {
            if (document.querySelector('.html5-video-container #speed-status')) {
                document.querySelector('.html5-video-container #speed-status').remove();
            }
        }, 500);

        return false;
    }

    if (
        player &&
        decrease_volume &&
        decrease_volume.altKey == improvedtubeKeys.altKey &&
        decrease_volume.ctrlKey == improvedtubeKeys.ctrlKey &&
        decrease_volume.shiftKey == improvedtubeKeys.shiftKey &&
        (decrease_volume.key == improvedtubeKeys.key || !decrease_volume.key) &&
        (decrease_volume.scroll > 0 && event.deltaY > 0 || decrease_volume.scroll < 0 && event.deltaY < 0) &&
        (decrease_volume.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.setVolume(player.getVolume() - 5);

        if (!document.querySelector('.html5-video-container #speed-status')) {
            var status_e = document.createElement('div');

            status_e.id = 'speed-status';

            document.querySelector('.html5-video-container').appendChild(status_e);
        }

        document.querySelector('.html5-video-container #speed-status').innerHTML = player.getVolume();

        if (globalSpeedTimeout)
            clearTimeout(globalVolumeTimeout);

        globalSpeedTimeout = setTimeout(function() {
            if (document.querySelector('.html5-video-container #speed-status')) {
                document.querySelector('.html5-video-container #speed-status').remove();
            }
        }, 500);

        return false;
    }

    if (
        player &&
        increase_playback_speed &&
        increase_playback_speed.altKey == improvedtubeKeys.altKey &&
        increase_playback_speed.ctrlKey == improvedtubeKeys.ctrlKey &&
        increase_playback_speed.shiftKey == improvedtubeKeys.shiftKey &&
        (increase_playback_speed.key == improvedtubeKeys.key || !increase_playback_speed.key) &&
        (increase_playback_speed.scroll > 0 && event.deltaY > 0 || increase_playback_speed.scroll < 0 && event.deltaY < 0) &&
        (increase_playback_speed.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.setPlaybackRate(player.getPlaybackRate() + .05);

        if (!document.querySelector('.html5-video-container #speed-status')) {
            var status_e = document.createElement('div');

            status_e.id = 'speed-status';

            document.querySelector('.html5-video-container').appendChild(status_e);
        }

        document.querySelector('.html5-video-container #speed-status').innerHTML = player.getPlaybackRate();

        if (globalSpeedTimeout)
            clearTimeout(globalVolumeTimeout);

        globalSpeedTimeout = setTimeout(function() {
            if (document.querySelector('.html5-video-container #speed-status')) {
                document.querySelector('.html5-video-container #speed-status').remove();
            }
        }, 500);

        return false;
    }

    if (
        player &&
        decrease_playback_speed &&
        decrease_playback_speed.altKey == improvedtubeKeys.altKey &&
        decrease_playback_speed.ctrlKey == improvedtubeKeys.ctrlKey &&
        decrease_playback_speed.shiftKey == improvedtubeKeys.shiftKey &&
        (decrease_playback_speed.key == improvedtubeKeys.key || !decrease_playback_speed.key) &&
        (decrease_playback_speed.scroll > 0 && event.deltaY > 0 || decrease_playback_speed.scroll < 0 && event.deltaY < 0) &&
        (decrease_playback_speed.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.setPlaybackRate(player.getPlaybackRate() - .05);

        if (!document.querySelector('.html5-video-container #speed-status')) {
            var status_e = document.createElement('div');

            status_e.id = 'speed-status';

            document.querySelector('.html5-video-container').appendChild(status_e);
        }

        document.querySelector('.html5-video-container #speed-status').innerHTML = player.getPlaybackRate();

        if (globalSpeedTimeout)
            clearTimeout(globalVolumeTimeout);

        globalSpeedTimeout = setTimeout(function() {
            if (document.querySelector('.html5-video-container #speed-status')) {
                document.querySelector('.html5-video-container #speed-status').remove();
            }
        }, 500);

        return false;
    }

    if (
        player &&
        go_to_search_box &&
        go_to_search_box.altKey == improvedtubeKeys.altKey &&
        go_to_search_box.ctrlKey == improvedtubeKeys.ctrlKey &&
        go_to_search_box.shiftKey == improvedtubeKeys.shiftKey &&
        (go_to_search_box.key == improvedtubeKeys.key || !go_to_search_box.key) &&
        (go_to_search_box.scroll > 0 && event.deltaY > 0 || go_to_search_box.scroll < 0 && event.deltaY < 0) &&
        (go_to_search_box.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (document.getElementById('masthead-search-term'))
            document.getElementById('masthead-search-term').focus();

        return false;
    }

    if (
        player &&
        activate_fullscreen &&
        activate_fullscreen.altKey == improvedtubeKeys.altKey &&
        activate_fullscreen.ctrlKey == improvedtubeKeys.ctrlKey &&
        activate_fullscreen.shiftKey == improvedtubeKeys.shiftKey &&
        (activate_fullscreen.key == improvedtubeKeys.key || !activate_fullscreen.key) &&
        (activate_fullscreen.scroll > 0 && event.deltaY > 0 || activate_fullscreen.scroll < 0 && event.deltaY < 0) &&
        (activate_fullscreen.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        player.toggleFullscreen();

        return false;
    }

    if (
        player &&
        activate_captions &&
        activate_captions.altKey == improvedtubeKeys.altKey &&
        activate_captions.ctrlKey == improvedtubeKeys.ctrlKey &&
        activate_captions.shiftKey == improvedtubeKeys.shiftKey &&
        (activate_captions.key == improvedtubeKeys.key || !activate_captions.key) &&
        (activate_captions.scroll > 0 && event.deltaY > 0 || activate_captions.scroll < 0 && event.deltaY < 0) &&
        (activate_captions.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (player.querySelector('.ytp-subtitles-button'))
            player.querySelector('.ytp-subtitles-button').click();

        return false;
    }

    if (
        player &&
        like_shortcut &&
        like_shortcut.altKey == event.altKey &&
        like_shortcut.ctrlKey == event.ctrlKey &&
        like_shortcut.shiftKey == event.shiftKey &&
        (like_shortcut.key == event.key || !like_shortcut.key) &&
        (activate_captions.scroll > 0 && event.deltaY > 0 || activate_captions.scroll < 0 && event.deltaY < 0) &&
        (activate_captions.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (document.documentElement.getAttribute('youtube-version') == 'old') {
            if (document.querySelectorAll('.like-button-renderer-like-button')[0] && !document.querySelectorAll('.like-button-renderer-like-button')[0].classList.contains('hid'))
                document.querySelectorAll('.like-button-renderer-like-button')[0].click();
            else if (document.querySelectorAll('.like-button-renderer-like-button')[1])
                document.querySelectorAll('.like-button-renderer-like-button')[1].click();
        } else if (document.querySelectorAll('#menu #top-level-buttons ytd-toggle-button-renderer')[0])
            document.querySelectorAll('#menu #top-level-buttons ytd-toggle-button-renderer')[0].click();

        return false;
    }

    if (
        player &&
        dislike_shortcut &&
        dislike_shortcut.altKey == event.altKey &&
        dislike_shortcut.ctrlKey == event.ctrlKey &&
        dislike_shortcut.shiftKey == event.shiftKey &&
        (dislike_shortcut.key == event.key || !dislike_shortcut.key) &&
        (activate_captions.scroll > 0 && event.deltaY > 0 || activate_captions.scroll < 0 && event.deltaY < 0) &&
        (activate_captions.hover == true ? player_hovered : true)
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (document.documentElement.getAttribute('youtube-version') == 'old') {
            if (document.querySelectorAll('.like-button-renderer-dislike-button')[0] && !document.querySelectorAll('.like-button-renderer-dislike-button')[0].classList.contains('hid'))
                document.querySelectorAll('.like-button-renderer-dislike-button')[0].click();
            else if (document.querySelectorAll('.like-button-renderer-dislike-button')[1])
                document.querySelectorAll('.like-button-renderer-dislike-button')[1].click();
        } else if (document.querySelectorAll('#menu #top-level-buttons ytd-toggle-button-renderer')[1])
            document.querySelectorAll('#menu #top-level-buttons ytd-toggle-button-renderer')[1].click();

        return false;
    }
}
