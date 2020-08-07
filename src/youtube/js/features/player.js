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
    if (!node) {
        node = document.querySelector('.html5-video-player');
    }

    if (node && ImprovedTube.storage.player_forced_volume === true) {
        var volume = Number(ImprovedTube.storage.player_volume);

        if (!ImprovedTube.isset(volume) || !volume) {
            volume = 1;
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

        try {  if (window.location.href.indexOf("music") < 0){    //quickfix to keep running on music.youtube.com
           	 node.setPlaybackRate(playback_speed);
		}
        } catch (err) {}
    }
};


/*-----------------------------------------------------------------------------
4.0 Autoplay
-----------------------------------------------------------------------------*/

ImprovedTube.autoplay = function() {
    if (
        (/\/watch\?/.test(location.href) && !/list=/.test(location.href) && this.storage.player_autoplay === false) ||
        (/\/watch\?/.test(location.href) && /list=/.test(location.href) /*&& /index=/.test(location.href)*/ && this.storage.playlist_autoplay === false) ||
        (/\/(channel|user)\//.test(location.href) && this.storage.channel_trailer_autoplay === false)
    ) {
        return false;
    }

    return true;
};


/*-----------------------------------------------------------------------------
5.0 Allow 60fps
-----------------------------------------------------------------------------*/

ImprovedTube.player_60fps = function() {
    if (this.storage.player_60fps === false) {
        var canPlayType = HTMLMediaElement.prototype.canPlayType;

        function overwrite(self, callback, mime) {
            var match = /framerate=(\d+)/.exec(mime);

            if (match && match[1] > 30) {
                return '';
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

ImprovedTube.mini_player__mode = false;
ImprovedTube.mini_player__move = false;
ImprovedTube.mini_player__cursor = '""';
ImprovedTube.mini_player__x = 0;
ImprovedTube.mini_player__y = 0;
ImprovedTube.mini_player__max_x = 0;
ImprovedTube.mini_player__max_y = 0;
ImprovedTube.mini_player__original_width = 0;
ImprovedTube.mini_player__original_height = 0;
ImprovedTube.mini_player__width = 200;
ImprovedTube.mini_player__height = 160;
ImprovedTube.mini_player__mousedown_x = 0;
ImprovedTube.mini_player__mousedown_y = 0;
ImprovedTube.mini_player__player_offset_x = 0;
ImprovedTube.mini_player__player_offset_y = 0;
ImprovedTube.mini_player__resize_offset = 16;


ImprovedTube.mini_player__setPosition = function(x, y) {
    ImprovedTube.mini_player__element.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
};

ImprovedTube.mini_player__setSize = function(width, height) {
    ImprovedTube.mini_player__element.style.width = width + 'px';
    ImprovedTube.mini_player__element.style.height = height + 'px';
};

ImprovedTube.mini_player__scroll = function () {
    if (window.scrollY >= 256 && ImprovedTube.mini_player__mode === false) {
        ImprovedTube.mini_player__mode = true;
        
        ImprovedTube.mini_player__original_width = ImprovedTube.mini_player__element.offsetWidth;
        ImprovedTube.mini_player__original_height = ImprovedTube.mini_player__element.offsetHeight;
        
        ImprovedTube.mini_player__element.classList.add('it-mini-player');
        
        ImprovedTube.mini_player__x = Math.max(0, Math.min(ImprovedTube.mini_player__x, document.body.offsetWidth - ImprovedTube.mini_player__width));
        ImprovedTube.mini_player__y = Math.max(0, Math.min(ImprovedTube.mini_player__y, window.innerHeight - ImprovedTube.mini_player__height));
        
        ImprovedTube.mini_player__cursor = '';
        document.documentElement.removeAttribute('it-mini-player-cursor');
        
        ImprovedTube.mini_player__setPosition(ImprovedTube.mini_player__x, ImprovedTube.mini_player__y);
        
        ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__width, ImprovedTube.mini_player__height);
        
        window.addEventListener('mousedown', ImprovedTube.mini_player__mousedown);
        window.addEventListener('mousemove', ImprovedTube.mini_player__cursorUpdate);
        
        window.dispatchEvent(new Event('resize'));
    } else if (window.scrollY < 256 && ImprovedTube.mini_player__mode === true) {
        ImprovedTube.mini_player__mode = false;
        ImprovedTube.mini_player__element.classList.remove('it-mini-player');
        ImprovedTube.mini_player__move = false;
        ImprovedTube.mini_player__setPosition(0, 0);
        ImprovedTube.mini_player__element.style.width = '';
        ImprovedTube.mini_player__element.style.height = '';
        
        ImprovedTube.mini_player__cursor = '';
        document.documentElement.removeAttribute('it-mini-player-cursor');

        window.removeEventListener('mousedown', ImprovedTube.mini_player__mousedown);
        window.removeEventListener('mousemove', ImprovedTube.mini_player__cursorUpdate);

        window.dispatchEvent(new Event('resize'));
    }
};

ImprovedTube.mini_player__mousedown = function (event) {
    if (event.button !== 0) {
        return false;
    }
    
    if (ImprovedTube.mini_player__resize() === true) {
        return false;
    }
    
    var is_player = false;
        
    for (var i = 0, l = event.path.length; i < l; i++) {
        if ((event.path[i].classList && event.path[i].classList.contains('it-mini-player')) === true) {
            is_player = true;
        }
    }
    
    if (is_player === false) {
        return false;
    }
    
    event.preventDefault();
    
    var bcr = ImprovedTube.mini_player__element.getBoundingClientRect();
    
    ImprovedTube.mini_player__mousedown_x = event.clientX;
    ImprovedTube.mini_player__mousedown_y = event.clientY;
    ImprovedTube.mini_player__width = bcr.width;
    ImprovedTube.mini_player__height = bcr.height;
    
    ImprovedTube.mini_player__player_offset_x = event.clientX - bcr.x;
    ImprovedTube.mini_player__player_offset_y = event.clientY - bcr.y;
    
    ImprovedTube.mini_player__max_x = document.body.offsetWidth - ImprovedTube.mini_player__width;
    ImprovedTube.mini_player__max_y = window.innerHeight - ImprovedTube.mini_player__height;
    
    window.addEventListener('mouseup', ImprovedTube.mini_player__mouseup);
    window.addEventListener('mousemove', ImprovedTube.mini_player__mousemove);
};

ImprovedTube.mini_player__mouseup = function () {
    var strg = JSON.parse(localStorage.getItem('improedtube-mini-player')) || {};
    
    strg.x = ImprovedTube.mini_player__x;
    strg.y = ImprovedTube.mini_player__y;
    
    localStorage.setItem('improedtube-mini-player', JSON.stringify(strg));
    
    window.removeEventListener('mouseup', ImprovedTube.mini_player__mouseup);
    window.removeEventListener('mousemove', ImprovedTube.mini_player__mousemove);
    
    ImprovedTube.mini_player__move = false;
    
    setTimeout(function(){
        window.removeEventListener('click', ImprovedTube.mini_player__click, true);
    });
};

ImprovedTube.mini_player__click = function (event) {
    event.stopPropagation();
    event.preventDefault();
};

ImprovedTube.mini_player__mousemove = function (event) {
    if (
        event.clientX < ImprovedTube.mini_player__mousedown_x - 5 ||
        event.clientY < ImprovedTube.mini_player__mousedown_y - 5 ||
        event.clientX > ImprovedTube.mini_player__mousedown_x + 5 ||
        event.clientY > ImprovedTube.mini_player__mousedown_y + 5
    ) {
        var x = event.clientX - ImprovedTube.mini_player__player_offset_x,
            y = event.clientY - ImprovedTube.mini_player__player_offset_y;
        
        if (ImprovedTube.mini_player__move === false) {
            ImprovedTube.mini_player__move = true;
            
            window.addEventListener('click', ImprovedTube.mini_player__click, true);
        }
        
        if (x < 0) {
            x = 0;
        }
        
        if (y < 0) {
            y = 0;
        }
        
        if (x > ImprovedTube.mini_player__max_x) {
            x = ImprovedTube.mini_player__max_x;
        }
        
        if (y > ImprovedTube.mini_player__max_y) {
            y = ImprovedTube.mini_player__max_y;
        }
        
        ImprovedTube.mini_player__x = x;
        ImprovedTube.mini_player__y = y;
        
        ImprovedTube.mini_player__setPosition(x, y);
    }
};

ImprovedTube.mini_player__cursorUpdate = function (event) {
    var x = event.clientX,
        y = event.clientY,
        c = ImprovedTube.mini_player__cursor;
        
    if (
        x >= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - ImprovedTube.mini_player__resize_offset &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
        y >= ImprovedTube.mini_player__y &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__resize_offset
    ) {
        c = 'ne-resize';
    } else if (
        x >= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - ImprovedTube.mini_player__resize_offset &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
        y >= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - ImprovedTube.mini_player__resize_offset &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
    ) {
        c = 'se-resize';
    } else if (
        x >= ImprovedTube.mini_player__x &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__resize_offset &&
        y >= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - ImprovedTube.mini_player__resize_offset &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
    ) {
        c = 'sw-resize';
    } else if (
        x >= ImprovedTube.mini_player__x &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__resize_offset &&
        y >= ImprovedTube.mini_player__y &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__resize_offset
    ) {
        c = 'nw-resize';
    } else if (
        y >= ImprovedTube.mini_player__y &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__resize_offset
    ) {
        c = 'n-resize';
    } else if (
        x >= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - ImprovedTube.mini_player__resize_offset &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width
    ) {
        c = 'e-resize';
    } else if (
        y >= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - ImprovedTube.mini_player__resize_offset &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
    ) {
        c = 's-resize';
    } else if (
        x >= ImprovedTube.mini_player__x &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__resize_offset
    ) {
        c = 'w-resize';
    } else {
        c = '';
    }
    
    if (ImprovedTube.mini_player__cursor !== c) {
        ImprovedTube.mini_player__cursor = c;
        
        document.documentElement.setAttribute('it-mini-player-cursor', ImprovedTube.mini_player__cursor);
    }
};

ImprovedTube.mini_player__resize = function (event) {
    if (ImprovedTube.mini_player__cursor !== '') {
        window.removeEventListener('mousemove', ImprovedTube.mini_player__cursorUpdate);
        window.addEventListener('mouseup', ImprovedTube.mini_player__resize_mouseUp);
        window.addEventListener('mousemove', ImprovedTube.mini_player__resize_mouseMove);
        
        return true;
    }
};

ImprovedTube.mini_player__resize_mouseMove = function(event) {
    if (ImprovedTube.mini_player__cursor === 'n-resize') {
        ImprovedTube.mini_player__setPosition(ImprovedTube.mini_player__x, event.clientY);
        ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__width, ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - event.clientY);
    } else if (ImprovedTube.mini_player__cursor === 'e-resize') {
        ImprovedTube.mini_player__setSize(event.clientX - ImprovedTube.mini_player__x, ImprovedTube.mini_player__height);
    } else if (ImprovedTube.mini_player__cursor === 's-resize') {
        ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__width, event.clientY - ImprovedTube.mini_player__y);
    } else if (ImprovedTube.mini_player__cursor === 'w-resize') {
        ImprovedTube.mini_player__setPosition(event.clientX, ImprovedTube.mini_player__y);
        ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - event.clientX, ImprovedTube.mini_player__height);
    } else if (ImprovedTube.mini_player__cursor === 'ne-resize') {
        ImprovedTube.mini_player__setPosition(ImprovedTube.mini_player__x, event.clientY);
        ImprovedTube.mini_player__setSize(event.clientX - ImprovedTube.mini_player__x, ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - event.clientY);
    } else if (ImprovedTube.mini_player__cursor === 'se-resize') {
        ImprovedTube.mini_player__setSize(event.clientX - ImprovedTube.mini_player__x, event.clientY - ImprovedTube.mini_player__y);
    } else if (ImprovedTube.mini_player__cursor === 'sw-resize') {
        ImprovedTube.mini_player__setPosition(event.clientX, ImprovedTube.mini_player__y);
        ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - event.clientX, event.clientY - ImprovedTube.mini_player__y);
    } else if (ImprovedTube.mini_player__cursor === 'nw-resize') {
        ImprovedTube.mini_player__setPosition(event.clientX, event.clientY);
        ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - event.clientX, ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - event.clientY);
    }
};

ImprovedTube.mini_player__resize_mouseUp = function(event) {
    var bcr = ImprovedTube.mini_player__element.getBoundingClientRect();
    
    ImprovedTube.mini_player__x = bcr.left;
    ImprovedTube.mini_player__y = bcr.top;
    ImprovedTube.mini_player__width = bcr.width;
    ImprovedTube.mini_player__height = bcr.height;
    
    var strg = JSON.parse(localStorage.getItem('improedtube-mini-player')) || {};
    
    strg.width = ImprovedTube.mini_player__width;
    strg.height = ImprovedTube.mini_player__height;
    
    localStorage.setItem('improedtube-mini-player', JSON.stringify(strg));
    
    window.addEventListener('mousemove', ImprovedTube.mini_player__cursorUpdate);
    window.removeEventListener('mouseup', ImprovedTube.mini_player__resize_mouseUp);
    window.removeEventListener('mousemove', ImprovedTube.mini_player__resize_mouseMove);
};

ImprovedTube.mini_player = function() {
    ImprovedTube.mini_player__element = document.querySelector('.html5-video-player');
    
    if (ImprovedTube.storage.mini_player === true) {
        var strg = JSON.parse(localStorage.getItem('improedtube-mini-player')) || {};
        
        ImprovedTube.mini_player__x = ImprovedTube.isset(strg.x) ? strg.x : 16;
        ImprovedTube.mini_player__y = ImprovedTube.isset(strg.y) ? strg.y : 16;
        ImprovedTube.mini_player__width = strg.width || 200;
        ImprovedTube.mini_player__height = strg.height || 150;
        
        window.addEventListener('scroll', ImprovedTube.mini_player__scroll);
    } else {
        ImprovedTube.mini_player__mode = false;
        
        ImprovedTube.mini_player__element.classList.remove('it-mini-player');
        
        window.dispatchEvent(new Event('resize'));
        
        window.removeEventListener('mousedown', ImprovedTube.mini_player__mousedown);
        window.removeEventListener('mousemove', ImprovedTube.mini_player__mousemove);
        window.removeEventListener('mouseup', ImprovedTube.mini_player__mouseup);
        window.removeEventListener('click', ImprovedTube.mini_player__click);
        window.removeEventListener('scroll', ImprovedTube.mini_player__scroll);
    }
};


/*-----------------------------------------------------------------------------
12.0 Autopause
-----------------------------------------------------------------------------*/

ImprovedTube.player_autopause_when_switching_tabs = function() {
    window.addEventListener('blur', function() {
        ImprovedTube.focused = false;

        if (
            ImprovedTube.storage.player_autopause_when_switching_tabs === true &&
            /\/watch/.test(location.href) &&
            document.querySelector('.html5-video-player video')
        ) {
            document.querySelector('.html5-video-player video').pause();
        }
    });

    window.addEventListener('focus', function() {
        ImprovedTube.focused = true;

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

            button.className = 'ytp-button it-player-button';

            button.dataset.title = options.title;

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
            },
            title: 'Repeat'
        });

        if (this.storage.player_always_repeat === true) {
            setTimeout(function() {
                node.querySelector('video').setAttribute('loop', '');
                node.querySelector('#it-repeat-button').style.opacity = '1';
            }, 100);
        }
    } else if (document.querySelector('.it-repeat-button')) {
        document.querySelector('.it-repeat-button').remove();
    }
};


/*-----------------------------------------------------------------------------
14.2 Screenshot
-----------------------------------------------------------------------------*/

ImprovedTube.screenshot = function() {
    document.body.style.opacity = '0';

    var video = document.querySelector('.html5-video-player video'),
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
            if (ImprovedTube.storage.player_screenshot_save_as !== 'clipboard') {
                var a = document.createElement('a');

                a.href = URL.createObjectURL(blob);

                a.download = location.href.match(/(\?|\&)v=[^&]+/)[0].substr(3) + '-' + new Date(document.querySelector('video').getCurrentTime() * 1000).toISOString().substr(11, 8).replace(/:/g, '-') + '.png';

                a.click();
            } else {
                try {
                    navigator.clipboard.write([
                        new ClipboardItem({
                            'image/png': blob
                        })
                    ]);
                } catch (error) {
                    console.error(error);
                }
            }

            setTimeout(function() {
                video.style.width = old_w + 'px';
                video.style.height = old_h + 'px';

                document.body.style.opacity = '1';
            }, 100);
        });
    }, 100);
};

ImprovedTube.player_screenshot_button = function() {
    if (this.storage.player_screenshot_button === true) {
        if (!node) {
            var node = document.querySelector('.html5-video-player');
        }

        this.createPlayerButton(node, {
            id: 'it-screenshot-button',
            html: '<svg viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></svg>',
            opacity: 1,
            onclick: ImprovedTube.screenshot,
            title: 'Screenshot'
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
            },
            title: 'Rotate'
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
            },
            title: 'Popup'
        });
    } else if (document.querySelector('.it-popup-player-button')) {
        document.querySelector('.it-popup-player-button').remove();
    }
};


/*-----------------------------------------------------------------------------
# LOUDNESS NORMALIZATION
-----------------------------------------------------------------------------*/

ImprovedTube.player_loudness_normalization = function() {
    if (document.querySelector('video')) {
        document.querySelector('video').onvolumechange = function(event) {
            if (document.querySelector('.ytp-volume-panel') && ImprovedTube.storage.player_loudness_normalization === false) {
                var volume = Number(document.querySelector('.ytp-volume-panel').getAttribute('aria-valuenow'));

                document.querySelector('video').volume = volume / 100;
            }
        };
    }

    if (ImprovedTube.storage.player_loudness_normalization === false) {
        try {
            var local_storage = localStorage['yt-player-volume'];

            if (ImprovedTube.isset(Number(ImprovedTube.storage.player_volume)) && ImprovedTube.storage.player_forced_volume === true) {

            } else if (local_storage) {
                local_storage = JSON.parse(JSON.parse(local_storage).data);
                local_storage = Number(local_storage.volume);

                document.querySelector('video').volume = local_storage / 100;
            } else {
                document.querySelector('video').volume = 100;
            }
        } catch (err) {
            console.log(err);
        }
    }
};
