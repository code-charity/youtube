/*-----------------------------------------------------------------------------
>>> SHORTCUTS
-------------------------------------------------------------------------------
1.0 Keyboard
2.0 Mouse
-----------------------------------------------------------------------------*/

ImprovedTube.shortcuts = function() {
    var self = this,
        keys = {},
        wheel = 0,
        hover = false,
        status_timer;

    function showStatus(player, volume) {
        if (!player.querySelector('#it-status')) {
            var element = document.createElement('div');

            element.id = 'it-status';
            element.innerHTML = volume;

            document.querySelector('.html5-video-container').appendChild(element);
        } else {
            player.querySelector('#it-status').innerHTML = volume;
        }

        if (status_timer) {
            clearTimeout(status_timer);
        }

        status_timer = setTimeout(function() {
            if (player.querySelector('#it-status')) {
                player.querySelector('#it-status').remove();
            }
        }, 500);
    }

    function start(type = 'keys') {
        if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 || event.target.isContentEditable) {
            return false;
        }

        var features = {
            shortcut_240p: function() {
                var player = document.querySelector('#movie_player');

                if (player) {
                    player.setPlaybackQualityRange('small');
                    player.setPlaybackQuality('small');
                }
            },
            shortcut_360p: function() {
                var player = document.querySelector('#movie_player');

                if (player) {
                    player.setPlaybackQualityRange('medium');
                    player.setPlaybackQuality('medium');
                }
            },
            shortcut_480p: function() {
                var player = document.querySelector('#movie_player');

                if (player) {
                    player.setPlaybackQualityRange('large');
                    player.setPlaybackQuality('large');
                }
            },
            shortcut_720p: function() {
                var player = document.querySelector('#movie_player');

                if (player) {
                    player.setPlaybackQualityRange('hd720');
                    player.setPlaybackQuality('hd720');
                }
            },
            shortcut_1080p: function() {
                var player = document.querySelector('#movie_player');

                if (player) {
                    player.setPlaybackQualityRange('hd1080');
                    player.setPlaybackQuality('hd1080');
                }
            },
            shortcut_1440p: function() {
                var player = document.querySelector('#movie_player');

                if (player) {
                    player.setPlaybackQualityRange('hd1440');
                    player.setPlaybackQuality('hd1440');
                }
            },
            shortcut_2160p: function() {
                var player = document.querySelector('#movie_player');

                if (player) {
                    player.setPlaybackQualityRange('hd2160');
                    player.setPlaybackQuality('hd2160');
                }
            },
            shortcut_2880p: function() {
                var player = document.querySelector('#movie_player');

                if (player) {
                    player.setPlaybackQualityRange('hd2880');
                    player.setPlaybackQuality('hd2880');
                }
            },
            shortcut_4320p: function() {
                var player = document.querySelector('#movie_player');

                if (player) {
                    player.setPlaybackQualityRange('highres');
                    player.setPlaybackQuality('highres');
                }
            },
            shortcut_picture_in_picture_shortcut: function() {
                var video = document.querySelector('#movie_player video');

                if (video) {
                    video.requestPictureInPicture();
                }
            },
            shortcut_play_pause: function() {
                var video = document.querySelector('#movie_player video');

                if (video) {
                    if (video.paused) {
                        video.play();
                    } else {
                        video.pause();
                    }
                }
            },
            shortcut_stop: function() {
                var player = document.querySelector('#movie_player');

                if (player) {
                    player.stopVideo();
                }
            },
            shortcut_next_video: function() {
                var player = document.querySelector('#movie_player');

                if (player && player.nextVideo) {
                    player.nextVideo();
                }
            },
            shortcut_prev_video: function() {
                var player = document.querySelector('#movie_player');

                if (player && player.previousVideo) {
                    player.previousVideo();
                }
            },
            shortcut_seek_backward: function() {
                var player = document.querySelector('#movie_player');

                if (player && player.seekBy) {
                    player.seekBy(-10);
                }
            },
            shortcut_seek_forward: function() {
                var player = document.querySelector('#movie_player');

                if (player && player.seekBy) {
                    player.seekBy(10);
                }
            },
            shortcut_increase_volume: function() {
                var player = document.querySelector('.html5-video-player');

                if (player && player.setVolume && player.getVolume) {
                    player.setVolume(player.getVolume() + 5);
                }

                showStatus(player, player.getVolume());
            },
            shortcut_decrease_volume: function() {
                var player = document.querySelector('.html5-video-player');

                if (player && player.setVolume && player.getVolume) {
                    player.setVolume(player.getVolume() - 5);
                }

                showStatus(player, player.getVolume());
            },
            shortcut_increase_playback_speed: function() {
                var player = document.querySelector('#movie_player');

                if (player && player.setPlaybackRate && player.getPlaybackRate) {
                    player.setPlaybackRate(player.getPlaybackRate() + .05);
                }

                showStatus(player, player.getPlaybackRate());
            },
            shortcut_decrease_playback_speed: function() {
                var player = document.querySelector('#movie_player');

                if (player && player.setPlaybackRate && player.getPlaybackRate) {
                    player.setPlaybackRate(player.getPlaybackRate() - .05);
                }

                showStatus(player, player.getPlaybackRate());
            },
            shortcut_go_to_search_box: function() {
                var search = document.querySelector('#search');

                if (search && search.focus) {
                    search.focus();
                }
            },
            shortcut_activate_fullscreen: function() {
                var player = document.querySelector('#movie_player');

                if (player && player.toggleFullscreen) {
                    player.toggleFullscreen();
                }
            },
            shortcut_activate_captions: function() {
                var player = document.querySelector('#movie_player');

                if (player && player.querySelector('.ytp-subtitles-button')) {
                    player.querySelector('.ytp-subtitles-button').click();
                }
            },
            shortcut_like_shortcut: function() {
                var like = (document.querySelectorAll('.like-button-renderer-like-button')[0] || document.querySelectorAll('#menu #top-level-buttons ytd-toggle-button-renderer')[0]);

                if (like) {
                    like.click();
                }
            },
            shortcut_dislike_shortcut: function() {
                var like = (document.querySelectorAll('.like-button-renderer-dislike-button')[0] || document.querySelectorAll('#menu #top-level-buttons ytd-toggle-button-renderer')[1]);

                if (like) {
                    like.click();
                }
            }
        };

        for (var i in features) {
            if (self.isset(self.storage[i])) {
                var data = JSON.parse(self.storage[i]) || {};

                if (
                    (data.key === keys.key || !self.isset(data.key)) &&
                    (data.shiftKey === keys.shiftKey || !self.isset(data.shiftKey)) &&
                    (data.ctrlKey === keys.ctrlKey || !self.isset(data.ctrlKey)) &&
                    (data.altKey === keys.altKey || !self.isset(data.altKey)) &&
                    ((data.wheel > 0) === (wheel > 0) || !self.isset(data.wheel)) &&
                    ((hover === true && (data.wheel > 0) === (wheel > 0) && Object.keys(keys).length === 0 && keys.constructor === Object) || (self.isset(data.key) || self.isset(data.altKey) || self.isset(data.ctrlKey)))
                ) {
                    if (type === 'wheel' && self.isset(data.wheel) || type === 'keys') {
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    features[i]();

                    if (type === 'wheel' && self.isset(data.wheel) || type === 'keys') {
                        return false;
                    }
                }
            }
        }
    }


    /*-------------------------------------------------------------------------
    1.0 Keyboard
    -------------------------------------------------------------------------*/

    window.addEventListener('keydown', function(event) {
        keys = {
            key: event.key,
            keyCode: event.keyCode,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey
        };

        start();
    }, true);

    window.addEventListener('keyup', function(event) {
        keys = {};
    }, true);


    /*-------------------------------------------------------------------------
    2.0 Mouse
    -------------------------------------------------------------------------*/

    window.addEventListener('mousemove', function(event) {
        hover = false;

        for (var i = 0, l = event.path.length; i < l; i++) {
            if (event.path[i].classList && event.path[i].classList.contains('html5-video-player')) {
                hover = true;
            }
        }
    }, {
        passive: false,
        capture: true
    });

    window.addEventListener('wheel', function(event) {
        wheel = event.deltaY;

        start('wheel');
    }, {
        passive: false,
        capture: true
    });
};