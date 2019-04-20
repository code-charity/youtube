/*------------------------------------------------------------------------------
>>> PLAYER:
--------------------------------------------------------------------------------
1.0  Video quality
2.0  Video volume
3.0  Video playback speed
4.0  Video codec (h.264)
5.0  Video autoplay
6.0  Up next autoplay
7.0  Video autopause
8.0  Custom buttons
    8.1 Repeat
    8.2 Popup
    8.3 Rotate
    8.4 Screenshot
9.0  Mini player
10.0 Auto-fullscreen
11.0 Picture-in-Picture

TODO:
[ ] Improve "Up next autoplay"
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
1.0 Video quality
------------------------------------------------------------------------------*/

function video_quality() {
    var data = settings.video_quality,
        player = document.querySelector('.html5-video-player');

    if (player && data && data != 'auto') {
        var quality_levels = player.getAvailableQualityLevels();

        if (quality_levels.indexOf(data) == -1)
            data = quality_levels[0];

        player.setPlaybackQualityRange(data);
        player.setPlaybackQuality(data);
    }
}


/*------------------------------------------------------------------------------
2.0 Video volume
------------------------------------------------------------------------------*/

function video_volume() {
    var data = Number(settings.video_volume),
        player = document.querySelector('.html5-video-player');

    if (data && settings.forced_video_volume == 'true') {
        player.unMute();
        player.setVolume(data);
    }
}


/*------------------------------------------------------------------------------
3.0 Video playback speed
------------------------------------------------------------------------------*/

function video_playback_speed() {
    var data = Number(settings.video_playback_speed),
        player = document.querySelector('.html5-video-player');

    if (data)
        player.querySelector('video').playbackRate = data;
}


/*------------------------------------------------------------------------------
4.0 Video codec (h.264)
------------------------------------------------------------------------------*/

function video_encode() {
    var data = settings.video_encode;

    if (data == 'h264') {
        var canPlayType = HTMLMediaElement.prototype.canPlayType;

        function overwrite(self, callback, mime) {
            if (/webm|vp8|vp9/.test(mime))
                return false;
            else
                return callback.call(self, mime);
        }

        if (window.MediaSource) {
            var isTypeSupported = window.MediaSource.isTypeSupported;

            window.MediaSource.isTypeSupported = function(mime) {
                return overwrite(this, isTypeSupported, mime);
            };
        }

        HTMLMediaElement.prototype.canPlayType = function(mime) {
            var status = overwrite(this, canPlayType, mime);

            if (!status)
                return '';
            else
                return status;
        };
    }
}


/*------------------------------------------------------------------------------
5.0 Video autoplay
------------------------------------------------------------------------------*/

function video_autoplay() {
    var page_href = location.href,
        is_ad = document.querySelector('.ad-showing,.ad-interrupting') ? true : false,
        is_autoplay;

    if (/\/watch/.test(page_href)) {
        if (/list=/.test(page_href) && /index=/.test(page_href))
            is_autoplay = settings.playlist_autoplay;
        else
            is_autoplay = settings.video_autoplay;
    } else if (/\/(user|channel)\//.test(page_href)) {
        is_autoplay = settings.channel_autoplay;
    }

    return is_ad || !(is_autoplay == 'false');
}


/*------------------------------------------------------------------------------
6.0 Up next autoplay
------------------------------------------------------------------------------*/

function up_next_autoplay() {
    var data = settings.up_next_autoplay,
        new_youtube_toggle = document.querySelector('#related #head.ytd-compact-autoplay-renderer #improved-toggle'),
        old_youtube_toggle = document.querySelector('#autoplay-checkbox');

    if (data) {
        if (new_youtube_toggle && (data == 'true' && !new_youtube_toggle.hasAttribute('checked') || data == 'false' && new_youtube_toggle.hasAttribute('checked'))) {
            new_youtube_toggle.click();
        } else if (old_youtube_toggle && (data == 'true' && !old_youtube_toggle.hasAttribute('checked') || data == 'false' && old_youtube_toggle.hasAttribute('checked'))) {
            old_youtube_toggle.click();
        }
    }
}


/*------------------------------------------------------------------------------
7.0 Video autopause
------------------------------------------------------------------------------*/

function video_autopause(type) {
    var data = settings.video_autopause,
        player = document.querySelector('.html5-video-player');

    if (data == 'true' && /\/watch/.test(location.href)) {
        setTimeout(function() {
            if (type == 'pause')
                document.querySelector('video').pause();
            else
                document.querySelector('video').play();
        });
    }
}


/*------------------------------------------------------------------------------
8.0 Custom buttons
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
8.1 Repeat
------------------------------------------------------------------------------*/

function video_repeat_button() {
    var data = settings.video_repeat_button,
        player = document.querySelector('.html5-video-player'),
        player_video = player.querySelector('video'),
        button = document.getElementById('improvedtube-repeat-button');

    if (button)
        button.remove();

    if (data == 'true') {
        button = document.createElement('button');

        button.id = 'improvedtube-repeat-button';
        button.className = 'ytp-button';
        button.innerHTML = '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>';
        button.style.opacity = '.5';

        button.onclick = function() {
            if (player_video.hasAttribute('loop')) {
                player_video.removeAttribute('loop');
                button.style.opacity = '.5';
            } else if (!/ad-showing/.test(player.className)) {
                player_video.setAttribute('loop', '');
                button.style.opacity = '1';
            }
        };

        player.querySelector('.ytp-left-controls').insertBefore(button, player.querySelector('.ytp-left-controls').childNodes[3]);
    }
}


/*------------------------------------------------------------------------------
8.2 Popup
------------------------------------------------------------------------------*/

function popup_player_button() {
    var data = settings.popup_player_button,
        player_controls = document.querySelector('.html5-video-player .ytp-right-controls'),
        button = document.getElementById('improvedtube-popup-player-button');

    if (button)
        button.remove();

    if (data == 'true') {
        button = document.createElement('button');

        button.id = 'improvedtube-popup-player-button';
        button.className = 'ytp-button';
        button.innerHTML = '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z"></svg>';

        button.onclick = function() {
            var player = document.querySelector('.html5-video-player');

            player.pauseVideo();

            window.open('https://www.youtube.com/embed/' + location.href.match(/watch\?v=([A-Za-z0-9\-\_]+)/g)[0].slice(8) + '?start=' + parseInt(player.getCurrentTime()) + '&autoplay=' + (settings.video_autoplay == 'false' ? '0' : '1'), '_blank', 'location=0,menubar=0,status=0,titlebar=0,width=' + player.offsetWidth + ',height=' + player.offsetHeight);
        };

        player_controls.insertBefore(button, player_controls.childNodes[0]);
    }
}


/*------------------------------------------------------------------------------
8.3 Rotate
------------------------------------------------------------------------------*/

function video_rotate_button() {
    var data = settings.video_rotate_button,
        player_controls = document.querySelector('.html5-video-player .ytp-right-controls'),
        button = document.getElementById('improvedtube-rotate-video-button');

    if (button)
        button.remove();

    if (data == 'true') {
        button = document.createElement('button');

        button.id = 'improvedtube-rotate-video-button';
        button.className = 'ytp-button';
        button.innerHTML = '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24"><path d="M15.55 5.55L11 1v3.07a8 8 0 0 0 0 15.86v-2.02a6 6 0 0 1 0-11.82V10l4.55-4.45zM19.93 11a7.9 7.9 0 0 0-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02a7.92 7.92 0 0 0 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41A7.9 7.9 0 0 0 19.93 13h-2.02a5.9 5.9 0 0 1-1.02 2.48z"/></svg>';

        button.onclick = function() {
            let video = document.querySelector('.html5-video-player video'),
                transform = '',
                rotate = (video.style.transform.match(/rotate\([0-9.]+deg\)/g) || [''])[0];

            rotate = Number((rotate.match(/[0-9.]+/g) || [])[0]) || 0;

            if (rotate < 270 && rotate % 90 == 0)
                rotate = rotate + 90;
            else
                rotate = 0;

            transform += 'rotate(' + rotate + 'deg)';

            if (rotate == 90 || rotate == 270)
                transform += ' scale(' + video.offsetHeight / video.offsetWidth + ')';

            video.style.transform = transform;
        };

        player_controls.insertBefore(button, player_controls.childNodes[0]);

    }
}


/*------------------------------------------------------------------------------
8.3 Screenshot
------------------------------------------------------------------------------*/

function screenshot_button() {
    var data = settings.screenshot_button,
        player_controls = document.querySelector('.html5-video-player .ytp-right-controls'),
        button = document.getElementById('improvedtube-screenshot-button');

    if (button)
        button.remove();

    if (data == 'true') {
        button = document.createElement('button');

        button.id = 'improvedtube-screenshot-button';
        button.className = 'ytp-button';
        button.innerHTML = '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';

        button.onclick = function() {
            document.body.style.opacity = '0';

            let video = document.querySelector('.html5-video-player video'),
                a = document.createElement('a'),
                cvs = document.createElement('canvas'),
                ctx = cvs.getContext('2d'),
                old_w = video.offsetWidth,
                old_h = video.offsetHeight;

            video.style.width = video.videoWidth + 'px';
            video.style.height = video.videoHeight + 'px';

            setTimeout(function() {
                cvs.width = video.videoWidth;
                cvs.height = video.videoHeight;

                ctx.drawImage(video, 0, 0, cvs.width, cvs.height);

                cvs.toBlob(function(blob) {
                    a.href = URL.createObjectURL(blob);

                    a.download = 'screenshot.png';

                    a.click();

                    setTimeout(function() {
                        video.style.width = old_w + 'px';
                        video.style.height = old_h + 'px';

                        document.body.style.opacity = '1';
                    }, 50);
                });
            }, 50);
        };

        player_controls.insertBefore(button, player_controls.childNodes[0]);
    }
}


/*------------------------------------------------------------------------------
9.0 Mini player
------------------------------------------------------------------------------*/

function mini_player() {
    var html = document.documentElement;

    if (window.scrollY > 500 && settings.mini_player_b == 'true') {
        if (!html.hasAttribute('mini-player'))
            html.setAttribute('mini-player', '');
    } else if (html.hasAttribute('mini-player')) {
        html.removeAttribute('mini-player');

        setTimeout(function() {
            window.dispatchEvent(new Event('resize'));
        });
    }
};


/*------------------------------------------------------------------------------
10.0 Auto-fullscreen
------------------------------------------------------------------------------*/

function video_autofullscreen() {
    if (settings.video_autofullscreen != 'true')
        return false;

    var player = document.querySelector('.html5-video-player'),
        wait = setInterval(function() {
            if (player) {
                player.toggleFullscreen();

                player.querySelector('video').onended = function(event) {
                    player.toggleFullscreen();
                };

                clearInterval(wait);
            }
        });
}


/*------------------------------------------------------------------------------
11.0 Picture-in-Picture
------------------------------------------------------------------------------*/

function picture_in_picture() {
    var player_video = document.querySelector('.html5-video-player video');

    if (video)
        player_video.requestPictureInPicture();
};