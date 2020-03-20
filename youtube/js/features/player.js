/*-----------------------------------------------------------------------------
>>> PLAYER
-------------------------------------------------------------------------------
1.0 Quality
2.0 Volume
3.0 Playback speed
4.0 Autoplay
5.0 Allow 60fps
6.0 Codec h.264
7.0 Subtitles
8.0 Loudness normalization
9.0 Up next autoplay
10.0 Mini player
11.0 Ads
12.0 Autopause
13.0 Auto-fullscreen
14.0 Custom plyaer buttons
	14.1 Repeat
	14.2 Screenshot
	14.3 Rotate
	14.4 Popup player
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Quality
-----------------------------------------------------------------------------*/

ImprovedTube.player_quality = function(node) {
    var quality = ImprovedTube.storage.player_quality;

    if (!node) {
        node = document.querySelector('.html5-video-player');
    }

    if (node.getAvailableQualityLevels) {
        var available_quality_levels = node.getAvailableQualityLevels();

        if (quality && quality !== 'auto') {
            if (available_quality_levels.indexOf(quality) === -1) {
                quality = available_quality_levels[0];
            }

            node.setPlaybackQualityRange(quality);
            node.setPlaybackQuality(quality);
        }
    }
};


/*-----------------------------------------------------------------------------
2.0 Volume
-----------------------------------------------------------------------------*/

ImprovedTube.player_volume = function(node) {
    var volume = Number(ImprovedTube.storage.player_volume);

    if (!node) {
        node = document.querySelector('.html5-video-player');
    }

    if (ImprovedTube.isset(volume) && ImprovedTube.storage.player_forced_volume === true) {
        if (volume >= 0) {
            node.unMute();
        }

        node.setVolume(volume);
    }
};


/*-----------------------------------------------------------------------------
3.0 Playback speed
-----------------------------------------------------------------------------*/

ImprovedTube.player_playback_speed = function(node) {
    var playback_speed = Number(ImprovedTube.storage.player_playback_speed);

    if (!node) {
        node = document.querySelector('.html5-video-player');
    }

    if (ImprovedTube.isset(ImprovedTube.storage.player_playback_speed) && ImprovedTube.storage.player_forced_playback_speed === true) {
        node.querySelector('video').playbackRate = playback_speed;
    }
};


/*-----------------------------------------------------------------------------
4.0 Autoplay
-----------------------------------------------------------------------------*/

ImprovedTube.autoplay = function() {
    if (
        (/\/watch\?/.test(location.href) && !/list=/.test(location.href) && this.storage.player_autoplay === false) ||
        (/\/watch\?/.test(location.href) && /list=/.test(location.href) && /index=/.test(location.href) && this.storage.playlist_autoplay === false) ||
        (/\/(channel|user)\//.test(location.href) && this.storage.channel_trailer_autoplay === false)
    ) {
        return false;
    }

    return true;
};


/*-----------------------------------------------------------------------------
6.0 Video codec
-----------------------------------------------------------------------------*/

ImprovedTube.player_h264 = function() {
    if (this.storage.player_h264 === true) {
        var canPlayType = HTMLMediaElement.prototype.canPlayType;

        function overwrite(self, callback, mime) {
            if (/webm|vp8|vp9/.test(mime)) {
                return false;
            } else {
                return callback.call(self, mime);
            }
        }

        if (window.MediaSource) {
            var isTypeSupported = window.MediaSource.isTypeSupported;

            window.MediaSource.isTypeSupported = function(mime) {
                return overwrite(this, isTypeSupported, mime);
            };
        }

        HTMLMediaElement.prototype.canPlayType = function(mime) {
            var status = overwrite(this, canPlayType, mime);

            if (!status) {
                return '';
            } else {
                return status;
            }
        };
    }
};


/*-----------------------------------------------------------------------------
9.0 Up next autoplay
-----------------------------------------------------------------------------*/

ImprovedTube.up_next_autoplay = function() {
    if (this.isset(this.storage.up_next_autoplay)) {
        var wait = setInterval(function() {
            if (
                document.querySelector('#related #head.ytd-compact-autoplay-renderer #toggle') ||
                document.querySelector('#autoplay-checkbox')
            ) {
                clearInterval(wait);

                var option = ImprovedTube.storage.up_next_autoplay,
                    new_youtube_toggle = document.querySelector('#related #head.ytd-compact-autoplay-renderer #toggle'),
                    old_youtube_toggle = document.querySelector('#autoplay-checkbox');

                if (new_youtube_toggle && (option === true && !new_youtube_toggle.hasAttribute('checked') || option === false && new_youtube_toggle.hasAttribute('checked'))) {
                    new_youtube_toggle.click();
                } else if (old_youtube_toggle && (option === true && !old_youtube_toggle.hasAttribute('checked') || option === false && old_youtube_toggle.hasAttribute('checked'))) {
                    old_youtube_toggle.click();
                }
            }
        }, 250);
    }
};


/*-----------------------------------------------------------------------------
10.0 Mini player (todo)
-----------------------------------------------------------------------------*/

ImprovedTube.mini_player = function() {
    new function() {
        var OPTIONS = {
            off_screen: false,
            width: 400,
            height: 260,
            theater: false,
            border: 10
        };

        ImprovedTube.mouse = {
            down: {
                x: 0,
                y: 0
            }
        };

        try {
            ImprovedTube.mini_player_data = JSON.parse(localStorage.getItem('IT_MINI_PLAYER'));
        } catch (err) {}

        if (!ImprovedTube.isset(ImprovedTube.mini_player_data)) {
            ImprovedTube.mini_player_data = {};
        }

        if (!ImprovedTube.mini_player_data.width) {
            ImprovedTube.mini_player_data.width = OPTIONS.width;
        }

        if (!ImprovedTube.mini_player_data.height) {
            ImprovedTube.mini_player_data.height = OPTIONS.height;
        }

        if (!ImprovedTube.mini_player_data.x) {
            ImprovedTube.mini_player_data.x = window.innerWidth - ImprovedTube.mini_player_data.width - 8;
        }

        if (!ImprovedTube.mini_player_data.y) {
            ImprovedTube.mini_player_data.y = window.innerHeight - ImprovedTube.mini_player_data.height - 8;
        }

        function scroll() {
            if (window.scrollY > window.innerHeight) {
                if (document.querySelector('.html5-video-player') && !document.querySelector('.html5-video-player').classList.contains('improvedtube-mini-player') && document.querySelector('.html5-video-player video').src) {
                    document.querySelector('.html5-video-player').style.visibility = 'hidden';
                    document.querySelector('.html5-video-player').classList.add('improvedtube-mini-player');

                    if (!document.querySelector('#page.watch-wide') && !document.querySelector('ytd-watch-flexy[theater]') && document.querySelector('.html5-video-player .ytp-size-button')) {
                        OPTIONS.theater = true;
                        document.querySelector('.html5-video-player .ytp-size-button').click();
                    }

                    setTimeout(function() {
                        window.dispatchEvent(new Event('resize'));

                        setTimeout(function() {
                            let x = ImprovedTube.mini_player_data.x,
                                y = ImprovedTube.mini_player_data.y;

                            document.querySelector('.improvedtube-mini-player').style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
                            document.querySelector('.improvedtube-mini-player').style.width = ImprovedTube.mini_player_data.width + 'px';
                            document.querySelector('.improvedtube-mini-player').style.height = ImprovedTube.mini_player_data.height + 'px';
                            document.querySelector('.html5-video-player').style.visibility = '';
                        }, 100);
                    }, 100);
                }
            } else if (/\/watch\?/.test(location.href)) {
                if (document.querySelector('.improvedtube-mini-player')) {
                    document.querySelector('.improvedtube-mini-player').style.transform = '';
                    document.querySelector('.improvedtube-mini-player').style.width = '';
                    document.querySelector('.improvedtube-mini-player').style.height = '';
                    document.querySelector('.improvedtube-mini-player').classList.remove('improvedtube-mini-player');

                    setTimeout(function() {
                        window.dispatchEvent(new Event('resize'));

                        if (OPTIONS.theater === true && document.querySelector('.html5-video-player .ytp-size-button')) {
                            OPTIONS.theater = false;
                            document.querySelector('.html5-video-player .ytp-size-button').click();
                        }
                    }, 100);
                }
            }
        }

        function mousemove(event) {
            if (document.querySelector('.improvedtube-mini-player')) {
                let x = event.clientX,
                    y = event.clientY,
                    width = document.querySelector('.improvedtube-mini-player').getBoundingClientRect().width,
                    height = document.querySelector('.improvedtube-mini-player').getBoundingClientRect().height;

                document.documentElement.dataset.cursor = '';

                if (ImprovedTube.mini_player_dragging === true) {
                    x -= ImprovedTube.mouse.down.x;
                    y -= ImprovedTube.mouse.down.y;

                    if (OPTIONS.off_screen === false) {
                        if (x < 8) {
                            x = 8;
                        }

                        if (x > document.body.offsetWidth - document.querySelector('.improvedtube-mini-player').offsetWidth - 8) {
                            x = document.body.offsetWidth - document.querySelector('.improvedtube-mini-player').offsetWidth - 8;
                        }

                        if (y < 8) {
                            y = 8;
                        }

                        if (y > window.innerHeight - document.querySelector('.improvedtube-mini-player').offsetHeight - 8) {
                            y = window.innerHeight - document.querySelector('.improvedtube-mini-player').offsetHeight - 8;
                        }
                    }

                    ImprovedTube.mini_player_data.x = x;
                    ImprovedTube.mini_player_data.y = y;

                    document.querySelector('.improvedtube-mini-player').classList.add('dragging');
                    document.querySelector('.improvedtube-mini-player').style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
                }

                x = event.clientX - document.querySelector('.improvedtube-mini-player').getBoundingClientRect().left;
                y = event.clientY - document.querySelector('.improvedtube-mini-player').getBoundingClientRect().top;

                if (OPTIONS.w_resize === true) {
                    wwidth = ImprovedTube.mini_player_data.x + ImprovedTube.mini_player_data.width;

                    ImprovedTube.mini_player_data.x = event.clientX;
                    ImprovedTube.mini_player_data.width = wwidth - event.clientX;

                    document.querySelector('.improvedtube-mini-player').style.transform = 'translate3d(' + ImprovedTube.mini_player_data.x + 'px, ' + ImprovedTube.mini_player_data.y + 'px, 0)';
                    document.querySelector('.improvedtube-mini-player').style.width = ImprovedTube.mini_player_data.width + 'px';
                }

                if (OPTIONS.e_resize === true) {
                    ImprovedTube.mini_player_data.width = x;
                    document.querySelector('.improvedtube-mini-player').style.width = x + 'px';
                }

                if (OPTIONS.n_resize === true) {
                    hheight = ImprovedTube.mini_player_data.y + ImprovedTube.mini_player_data.height;

                    ImprovedTube.mini_player_data.y = event.clientY;
                    ImprovedTube.mini_player_data.height = hheight - event.clientY;

                    document.querySelector('.improvedtube-mini-player').style.transform = 'translate3d(' + ImprovedTube.mini_player_data.x + 'px, ' + ImprovedTube.mini_player_data.y + 'px, 0)';
                    document.querySelector('.improvedtube-mini-player').style.height = ImprovedTube.mini_player_data.height + 'px';
                }

                if (OPTIONS.s_resize === true) {
                    ImprovedTube.mini_player_data.height = y;
                    document.querySelector('.improvedtube-mini-player').style.height = y + 'px';
                }

                /* CURSOR */
                if (x >= 0 && x <= OPTIONS.border) {
                    document.documentElement.dataset.cursor = 'w-resize';
                }

                if (x >= width - OPTIONS.border && x < width) {
                    document.documentElement.dataset.cursor = 'e-resize';
                }

                if (y >= 0 && y <= OPTIONS.border) {
                    document.documentElement.dataset.cursor = 'n-resize';
                }

                if (y >= height - OPTIONS.border && y < height) {
                    document.documentElement.dataset.cursor = 's-resize';
                }

                if (x >= 0 && x <= OPTIONS.border && y >= 0 && y <= OPTIONS.border) {
                    document.documentElement.dataset.cursor = 'nw-resize';
                }

                if (x >= width - OPTIONS.border && x < width && y >= 0 && y <= OPTIONS.border) {
                    document.documentElement.dataset.cursor = 'ne-resize';
                }

                if (x >= width - OPTIONS.border && x < width && y >= height - OPTIONS.border && y < height) {
                    document.documentElement.dataset.cursor = 'se-resize';
                }

                if (x >= 0 && x <= OPTIONS.border && y >= height - OPTIONS.border && y < height) {
                    document.documentElement.dataset.cursor = 'sw-resize';
                }
                /* END CURSOR */

                if (ImprovedTube.mini_player_dragging === true && ImprovedTube.mini_player_resizing === true) {
                    ImprovedTube.mini_player_prevent = true;
                }
            }
        }

        function mousedown(event) {
            let is_player = false;

            for (let i = 0, l = event.path.length; i < l; i++) {
                if (event.path[i] === document.querySelector('.improvedtube-mini-player')) {
                    is_player = true;
                }
            }

            if (is_player === true && document.querySelector('.improvedtube-mini-player') && event.button === 0) {
                let x = event.clientX - document.querySelector('.improvedtube-mini-player').getBoundingClientRect().left,
                    y = event.clientY - document.querySelector('.improvedtube-mini-player').getBoundingClientRect().top,
                    width = document.querySelector('.improvedtube-mini-player').getBoundingClientRect().width,
                    height = document.querySelector('.improvedtube-mini-player').getBoundingClientRect().height;

                if (x >= 0 && x <= OPTIONS.border) {
                    OPTIONS.w_resize = true;
                }

                if (x >= width - OPTIONS.border && x < width) {
                    OPTIONS.e_resize = true;
                }

                if (y >= 0 && y <= OPTIONS.border) {
                    OPTIONS.n_resize = true;
                }

                if (y >= height - OPTIONS.border && y < height) {
                    OPTIONS.s_resize = true;
                }

                if (
                    x >= 0 && x <= OPTIONS.border ||
                    x >= width - OPTIONS.border && x < width ||
                    y >= 0 && y <= OPTIONS.border ||
                    y >= height - OPTIONS.border && y < height
                ) {
                    return false;
                }

                ImprovedTube.mouse.down.x = x;
                ImprovedTube.mouse.down.y = y;
                ImprovedTube.mini_player_dragging = true;
            }
        }

        function mouseup(event) {
            document.documentElement.style.cursor = '';

            if (document.querySelector('.improvedtube-mini-player')) {
                ImprovedTube.mouse.down.x = NaN;
                ImprovedTube.mouse.down.y = NaN;
                ImprovedTube.mini_player_dragging = false;
                OPTIONS.w_resize = false;
                OPTIONS.e_resize = false;
                OPTIONS.n_resize = false;
                OPTIONS.s_resize = false;
                document.querySelector('.improvedtube-mini-player').classList.remove('dragging');
                localStorage.setItem('IT_MINI_PLAYER', JSON.stringify(ImprovedTube.mini_player_data));

                window.dispatchEvent(new Event('resize'));

                if (ImprovedTube.mini_player_prevent === true) {
                    event.preventDefault();
                    event.stopPropagation();

                    ImprovedTube.mini_player_prevent = false;

                    return false;
                }
            }
        }

        function update() {
            if (document.querySelector('.html5-video-player') && !/\/watch\?/.test(location.href)) {
                if (document.querySelector('.improvedtube-mini-player')) {
                    document.querySelector('.improvedtube-mini-player').style.transform = '';
                    document.querySelector('.improvedtube-mini-player').classList.remove('improvedtube-mini-player');

                    return false;
                }

                if (document.querySelector('.html5-video-player video').src) {
                    document.querySelector('.html5-video-player').classList.add('improvedtube-mini-player');
                    document.querySelector('.html5-video-player').style.transform = 'translate3d(' + ImprovedTube.mini_player_data.x + 'px, ' + ImprovedTube.mini_player_data.y + 'px, 0)';
                    document.querySelector('.html5-video-player').style.width = ImprovedTube.mini_player_data.width + 'px';
                    document.querySelector('.html5-video-player').style.height = ImprovedTube.mini_player_data.height + 'px';
                }
            }
        }

        if (ImprovedTube.storage.mini_player === true) {
            window.addEventListener('scroll', scroll, true);
            window.addEventListener('mousemove', mousemove, true);
            window.addEventListener('mousedown', mousedown, false);
            window.addEventListener('mouseup', mouseup, true);

            window.addEventListener('yt-navigate-start', update, false);
            window.addEventListener('yt-navigate-end', update, false);
            window.addEventListener('spfrequest', update, true);
            window.addEventListener('spfdone', update, true);
        } else {
            window.removeEventListener('scroll', scroll, true);
            window.removeEventListener('mousemove', mousemove, true);
            window.removeEventListener('mousedown', mousedown, false);
            window.removeEventListener('mouseup', mouseup, true);
        }
    }
};


/*-----------------------------------------------------------------------------
12.0 Autopause
-----------------------------------------------------------------------------*/

ImprovedTube.player_autopause_when_switching_tabs = function() {
    window.addEventListener('blur', function() {
        if (
            ImprovedTube.storage.player_autopause_when_switching_tabs === true &&
            /\/watch/.test(location.href) &&
            document.querySelector('.html5-video-player video')
        ) {
            document.querySelector('.html5-video-player video').pause();
        }
    });

    window.addEventListener('focus', function() {
        if (
            ImprovedTube.storage.player_autopause_when_switching_tabs === true &&
            /\/watch/.test(location.href) &&
            document.querySelector('.html5-video-player video')
        ) {
            document.querySelector('.html5-video-player video').play();
        }
    });
};


/*-----------------------------------------------------------------------------
13.0 Auto-fullscreen
-----------------------------------------------------------------------------*/

ImprovedTube.player_autofullscreen = function(node) {
    if (!node) {
        node = document.querySelector('.html5-video-player');
    }

    if (
        this.storage.player_autofullscreen === true &&
        !document.fullscreenElement &&
        document.documentElement.getAttribute('it-page-type') === 'video' &&
        node.toggleFullscreen
    ) {
        node.toggleFullscreen();
    }
};


/*-----------------------------------------------------------------------------
14.0 Custom buttons
-----------------------------------------------------------------------------*/

ImprovedTube.createPlayerButton = function(node, options) {
    var button = document.createElement('button');

    var wait = setInterval(function() {
        if (!node) {
            var node = document.querySelector('.html5-video-player');
        }

        if (node && node.querySelector('.ytp-left-controls')) {
            clearInterval(wait);

            button.className = 'ytp-button';

            if (options.id) {
                if (node.querySelector('#' + options.id)) {
                    node.querySelector('#' + options.id).remove();
                }

                button.id = options.id;
            }

            if (options.html) {
                button.innerHTML = options.html;
            }

            button.style.opacity = options.opacity || '.5';

            if (options.onclick) {
                button.onclick = options.onclick;
            }

            node.querySelector('.ytp-left-controls').insertBefore(button, node.querySelector('.ytp-left-controls').childNodes[3]);
        }
    });
};


/*-----------------------------------------------------------------------------
14.1 Repeat
-----------------------------------------------------------------------------*/

ImprovedTube.player_repeat_button = function(node) {
    if (this.storage.player_repeat_button === true) {
        if (!node) {
            var node = document.querySelector('.html5-video-player');
        }

        this.createPlayerButton(node, {
            id: 'it-repeat-button',
            html: '<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"></svg>',
            onclick: function() {
                if (node.querySelector('video').hasAttribute('loop')) {
                    node.querySelector('video').removeAttribute('loop');
                    this.style.opacity = '.5';
                } else if (!/ad-showing/.test(player.className)) {
                    node.querySelector('video').setAttribute('loop', '');
                    this.style.opacity = '1';
                }
            }
        });
    } else if (document.querySelector('.it-repeat-button')) {
        document.querySelector('.it-repeat-button').remove();
    }
};


/*-----------------------------------------------------------------------------
14.2 Screenshot
-----------------------------------------------------------------------------*/

ImprovedTube.player_screenshot_button = function() {
    if (this.storage.player_screenshot_button === true) {
        if (!node) {
            var node = document.querySelector('.html5-video-player');
        }

        this.createPlayerButton(node, {
            id: 'it-screenshot-button',
            html: '<svg viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></svg>',
            opacity: 1,
            onclick: function() {
                document.body.style.opacity = '0';

                var video = document.querySelector('.html5-video-player video'),
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
            }
        });
    } else if (document.querySelector('.it-screenshot-button')) {
        document.querySelector('.it-screenshot-button').remove();
    }
};


/*-----------------------------------------------------------------------------
14.3 Rotate
-----------------------------------------------------------------------------*/

ImprovedTube.player_rotate_button = function() {
    if (this.storage.player_rotate_button === true) {
        if (!node) {
            var node = document.querySelector('.html5-video-player');
        }

        this.createPlayerButton(node, {
            id: 'it-rotate-button',
            html: '<svg viewBox="0 0 24 24"><path d="M15.55 5.55L11 1v3.07a8 8 0 0 0 0 15.86v-2.02a6 6 0 0 1 0-11.82V10l4.55-4.45zM19.93 11a7.9 7.9 0 0 0-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02a7.92 7.92 0 0 0 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41A7.9 7.9 0 0 0 19.93 13h-2.02a5.9 5.9 0 0 1-1.02 2.48z"/></svg>',
            opacity: 1,
            onclick: function() {
                var video = document.querySelector('.html5-video-player video'),
                    transform = '',
                    rotate = (video.style.transform.match(/rotate\([0-9.]+deg\)/g) || [''])[0];

                rotate = Number((rotate.match(/[0-9.]+/g) || [])[0]) || 0;

                if (rotate < 270 && rotate % 90 == 0) {
                    rotate = rotate + 90;
                } else {
                    rotate = 0;
                }

                transform += 'rotate(' + rotate + 'deg)';

                if (rotate == 90 || rotate == 270) {
                    transform += ' scale(' + video.offsetHeight / video.offsetWidth + ')';
                }

                video.style.transform = transform;
            }
        });
    } else if (document.querySelector('.it-rotate-button')) {
        document.querySelector('.it-rotate-button').remove();
    }
};


/*-----------------------------------------------------------------------------
14.4 Popup
-----------------------------------------------------------------------------*/

ImprovedTube.player_popup_button = function() {
    if (this.storage.player_popup_button === true) {
        if (!node) {
            var node = document.querySelector('.html5-video-player');
        }

        this.createPlayerButton(node, {
            id: 'it-popup-player-button',
            html: '<svg viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z"></svg>',
            opacity: 1,
            onclick: function() {
                node.pauseVideo();

                window.open('//www.youtube.com/embed/' + location.href.match(/watch\?v=([A-Za-z0-9\-\_]+)/g)[0].slice(8) + '?start=' + parseInt(node.getCurrentTime()) + '&autoplay=' + (ImprovedTube.storage.player_autoplay == false ? '0' : '1'), '_blank', 'location=0,menubar=0,status=0,titlebar=0,width=' + node.offsetWidth + ',height=' + node.offsetHeight);
            }
        });
    } else if (document.querySelector('.it-popup-player-button')) {
        document.querySelector('.it-popup-player-button').remove();
    }
};