
/*-----------------------------------------------------------------------------
>>> CORE
-------------------------------------------------------------------------------
1.0 Page update
2.0 Player update
3.0 Init
-----------------------------------------------------------------------------*/

var ImprovedTube = {
    allow_autoplay: false,
    videoUrl: '"null"',
    playingTime: 0
};


/*-----------------------------------------------------------------------------
1.0 Page update
-----------------------------------------------------------------------------*/

ImprovedTube.pageUpdate = function() {
    var not_connected_players = document.querySelectorAll('.html5-video-player:not([it-player-connected])');
    
    if (ImprovedTube.videoUrl !== location.href) {
        ImprovedTube.allow_autoplay = false;
    }

    if (not_connected_players.length > 0) {
        for (var i = 0, l = not_connected_players.length; i < l; i++) {
            var player = not_connected_players[i];

            if (
                player.querySelector('video').src &&
                player.querySelector('video').src !== ''
            ) {
                player.setAttribute('it-player-connected', '');

                ImprovedTube.playerUpdate(player);

                player.querySelector('video').addEventListener('canplay', function() {
                    ImprovedTube.videoUrl = location.href;
                });
                player.querySelector('video').addEventListener('timeupdate', function() {
                    ImprovedTube.playingTime++;

                    var time = Math.floor(ImprovedTube.playingTime * 250 / 1000) / 60;

                    if (time >= 1) {
                        ImprovedTube.playingTime = 0;

                        document.dispatchEvent(new CustomEvent('ImprovedTubeAnalyzer'));
                    }
                });
            }
        }
    }

    ImprovedTube.pageType();
    ImprovedTube.youtube_home_page();
    ImprovedTube.hd_thumbnails();
    ImprovedTube.channel_default_tab();
    ImprovedTube.comments();
    ImprovedTube.livechat();
    ImprovedTube.livechat_type();
    ImprovedTube.related_videos();
    ImprovedTube.improvedtube_youtube_icon();
    ImprovedTube.blacklist();
    ImprovedTube.player_hd_thumbnail();
    ImprovedTube.how_long_ago_the_video_was_uploaded();
    ImprovedTube.channel_videos_count();
    ImprovedTube.collapse_of_subscription_sections();
    ImprovedTube.mark_watched_videos();
};


/*-----------------------------------------------------------------------------
2.0 Player update
-----------------------------------------------------------------------------*/

ImprovedTube.playerUpdate = function(node, hard) {
    var player;

    if (node && node.type !== 'canplay') {
        player = node;
    } else if (this.hasOwnProperty('target')) {
        player = this.target.parentNode.parentNode;
    } else if (this.hasOwnProperty('parentNode')) {
        player = this.parentNode.parentNode;
    } else {
        player = document.querySelector('.html5-video-player');
    }

    if (this.videoUrl !== location.href) {
        this.videoUrl = location.href;
        this.playingTime = 0;
        this.allow_autoplay = false;

        document.dispatchEvent(new CustomEvent('ImprovedTubePlayVideo'));

        this.fitToWindow();
        this.always_show_progress_bar();
        this.playlist_reverse();
        this.player_hd_thumbnail();
        this.player_quality(player);
        this.player_volume(player);
        this.player_playback_speed(player);
        this.up_next_autoplay();
        this.player_autofullscreen();
        this.player_repeat_button();
        this.player_screenshot_button();
        this.player_rotate_button();
        this.player_popup_button();
        this.playlist_up_next_autoplay(player);
		this.mini_player();

        this.playlist_repeat();
        this.playlist_shuffle();

        this.dim();

        var video_id = this.getParam(new URL(location.href).search.substr(1), 'v');

        if (video_id) {
            document.dispatchEvent(new CustomEvent('ImprovedTubeWatched', {
                detail: {
                    action: 'set',
                    id: video_id,
                    title: document.title
                }
            }));
        }
    } else if (hard) {
        this.videoUrl = location.href;
        this.allow_autoplay = true;

        this.fitToWindow();
        this.playlist_reverse();
        this.player_hd_thumbnail();
        this.player_quality(player);
        this.player_volume(player);
        this.player_playback_speed(player);
        this.up_next_autoplay();
        this.player_autofullscreen();
        this.player_repeat_button();
        this.player_screenshot_button();
        this.player_rotate_button();
        this.player_popup_button();
		this.mini_player();

        this.playlist_repeat();
        this.playlist_shuffle();

        this.dim();
    }
};


/*-----------------------------------------------------------------------------
3.0 Init
-----------------------------------------------------------------------------*/

ImprovedTube.init = function() {
    this.player_h264();
    this.player_60fps();
    this.confirmation_before_closing();
    this.shortcuts();
    this.themeEditor();
    this.theme();
    this.font();
    this.bluelight();
    this.dim();
    this.pageType();
    this.improvedtube_youtube_icon();
    this.add_scroll_to_top();
    this.player_autopause_when_switching_tabs();
    this.forced_theater_mode();
    this.comments();
    this.livechat();
    this.related_videos();
    this.mutations();
    this.events();
    
    if (window.self === window.top) {
        window.addEventListener('load', function(){
            ImprovedTube.player_volume();
        });
    }
};

function withoutInjection(object) {
    youtubeHomePage__documentStart(object.youtube_home_page);
}

/*-----------------------------------------------------------------------------
>>> EVENTS
-------------------------------------------------------------------------------
1.0 DOMContentLoaded
2.0 Load
3.0 YouTube page data updated
4.0 YouTube visibility refresh
5.0 SPF done
6.0 Keydown
7.0 Mousedown
-----------------------------------------------------------------------------*/

chrome.storage.local.get(function(items) {
    window.addEventListener('load', function() {
        if (!document.querySelector('.it-rate-notify') && Object.keys(items).length > 10 && items.rate_notify !== 5) {
            var popup = document.createElement('div');

            popup.className = 'it-rate-notify';

            popup.innerHTML = '<svg class=it-rate-notify__heart viewBox="0 0 24 24"><defs><linearGradient id="itHeartGradient"><stop offset="5%" stop-color="#ffb199 "/><stop offset="95%" stop-color="#ff0844"/></linearGradient></defs><path d="M13.35 20.13c-.76.69-1.93.69-2.69-.01l-.11-.1C5.3 15.27 1.87 12.16 2 8.28c.06-1.7.93-3.33 2.34-4.29 2.64-1.8 5.9-.96 7.66 1.1 1.76-2.06 5.02-2.91 7.66-1.1 1.41.96 2.28 2.59 2.34 4.29.14 3.88-3.3 6.99-8.55 11.76l-.1.09z"></svg>' +
                '<div class=it-rate-notify__title>Do you enjoy ImprovedTube?</div>' +
                '<div class=it-rate-notify__footer>' +
                '<button onclick="window.open(\'https://chrome.google.com/webstore/detail/improve-youtube-open-sour/bnomihfieiccainjcjblhegjgglakjdd/reviews\');document.querySelector(\'.it-rate-notify\').remove();">Yes</button>' +
                '<button onclick="document.querySelector(\'.it-rate-notify\').remove();">No</button>' +
                '</div>';

            document.body.appendChild(popup);

            setTimeout(function() {
                popup.classList.add('it-rate-notify--show');
            }, 1000);

            chrome.storage.local.set({
                rate_notify: 5
            });
        }
    });
});

ImprovedTube.events = function() {

    /*-------------------------------------------------------------------------
    1.0 DOMContentLoaded
    -------------------------------------------------------------------------*/

    window.addEventListener('DOMContentLoaded', ImprovedTube.pageUpdate);


    /*-------------------------------------------------------------------------
    2.0 Load
    -------------------------------------------------------------------------*/

    document.documentElement.addEventListener('load', function() {
        if (
            window.yt &&
            window.yt.player &&
            window.yt.player.Application &&
            window.yt.player.Application.create
        ) {
            window.yt.player.Application.create = ImprovedTube.ytPlayerApplicationCreateMod(window.yt.player.Application.create);
        }

        var search = document.querySelector('#search') || document.querySelector('#masthead-search-term');

        if (search) {
            search.addEventListener('focus', function() {
                document.documentElement.setAttribute('it-search-focus', 'true');
            });

            search.addEventListener('blur', function() {
                document.documentElement.setAttribute('it-search-focus', 'false');
            });
        }
    }, true);

    window.addEventListener('resize', function() {
        ImprovedTube.fitToWindow();
        ImprovedTube.improvedtube_youtube_icon_resize();
    });

    window.addEventListener('scroll', function() {
        ImprovedTube.improvedtube_youtube_icon_resize();
    });


    /*-------------------------------------------------------------------------
    3.0 YouTube page data updated
    -------------------------------------------------------------------------*/

    window.addEventListener('yt-page-data-updated', ImprovedTube.pageUpdate);


    /*-------------------------------------------------------------------------
    4.0 YouTube visibility refresh
    -------------------------------------------------------------------------*/

    window.addEventListener('yt-visibility-refresh', ImprovedTube.pageUpdate);


    /*-------------------------------------------------------------------------
    5.0 SPF done
    -------------------------------------------------------------------------*/

    window.addEventListener('spfrequest', function() {
        ImprovedTube.allow_autoplay = false;
        ImprovedTube.pageUpdate();
    });

    window.addEventListener('spfdone', function() {
        ImprovedTube.pageUpdate();
    });


    /*-------------------------------------------------------------------------
    6.0 Keydown
    -------------------------------------------------------------------------*/

    window.addEventListener('keydown', function() {
        ImprovedTube.videoUrl = location.href;
        
        if (
            document.querySelector('.html5-video-player') &&
            document.querySelector('.html5-video-player').classList.contains('ad-showing') === false
        ) {
            ImprovedTube.allow_autoplay = true;
        }
    }, true);


    /*-------------------------------------------------------------------------
    7.0 Mousedown
    -------------------------------------------------------------------------*/

    window.addEventListener('mousedown', function() {
        ImprovedTube.videoUrl = location.href;
        
        if (
            document.querySelector('.html5-video-player') &&
            document.querySelector('.html5-video-player').classList.contains('ad-showing') === false
        ) {
            ImprovedTube.allow_autoplay = true;
        }
    }, true);
};

chrome.storage.local.get(function(items) {
    document.addEventListener('ImprovedTubeAnalyzer', function() {
        if (items.analyzer_activation !== false) {
            if (document.querySelector('ytd-channel-name a') && chrome && chrome.runtime) {
                chrome.runtime.sendMessage({
                    name: 'improvedtube-analyzer',
                    value: document.querySelector('ytd-channel-name a').innerText
                });
            }
        }
    });
});

/*-----------------------------------------------------------------------------
>>> APPEARANCE
-------------------------------------------------------------------------------
1.0 Player
	1.1 Forced theater mode
    1.2 HD thumbnail
2.0 Details
3.0 Comments
4.0 Sidebar
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Player
-----------------------------------------------------------------------------*/

ImprovedTube.fitToWindow = function() {
    if (ImprovedTube.storage.player_size === 'fit_to_window' && !document.documentElement.hasAttribute('embed') && window.self !== window.top) {
        var video = document.querySelector('#movie_player video'),
            header = document.documentElement.getAttribute('it-header-position'),
            header_height = header == 'hidden' || header == 'hidden_on_video_page' || header == 'hover' || header == 'hover_on_video_page' ? 0 : 50,
            videoW = video.videoWidth / 100,
            videoH = video.videoHeight / 100,
            windowW = window.innerWidth / 100,
            windowH = window.innerHeight / 100,
            videoWdif = ((video.videoWidth - window.innerWidth) / video.videoWidth * -100) + 100,
            videoHdif = ((video.videoHeight - window.innerHeight + header_height) / video.videoHeight * -100) + 100,
            style = document.querySelector('#it-fit-to-window') || document.createElement('style');

        style.id = 'it-fit-to-window';

        if (videoW && videoH && videoHdif && videoH * videoWdif > window.innerHeight - header_height) {
            style.innerText = 'html[it-player-size="fit_to_window"] div#page.watch-wide .html5-video-player:not(.ytp-fullscreen) video{max-width:' + videoW * videoHdif + 'px !important;max-height' + videoH * videoHdif + 'px !important}';
        } else if (videoW && videoH && videoWdif) {
            style.innerText = 'html[it-player-size="fit_to_window"] div#page.watch-wide .html5-video-player:not(.ytp-fullscreen) video{max-width:' + videoW * videoWdif + 'px !important;max-height' + videoH * videoWdif + 'px !important}';
        }

        if (!document.querySelector('#it-fit-to-window')) {
            document.documentElement.appendChild(style);
        }
    }
};

/*-----------------------------------------------------------------------------
1.1 Forced theater mode
-----------------------------------------------------------------------------*/

ImprovedTube.forced_theater_mode = function() {
    if (window.self === window.top && (this.storage.forced_theater_mode === true || ImprovedTube.storage.player_size === 'fit_to_window')) {
        var is_applied = false;

        if (/wide\=1/.test(document.cookie)) {
            is_applied = true;
        }

        this.setCookie('wide', '1');

        setTimeout(function() {
            if (is_applied === false) {
                location.reload();
            }
        });
    }
};

/*-----------------------------------------------------------------------------
1.2 HD thumbnail
-----------------------------------------------------------------------------*/

ImprovedTube.player_hd_thumbnail_wait = false;

ImprovedTube.player_hd_thumbnail = function() {
    if (this.storage.player_hd_thumbnail === true) {
        if (this.player_hd_thumbnail_wait !== false) {
            clearInterval(ImprovedTube.player_hd_thumbnail_wait);

            ImprovedTube.player_hd_thumbnail_wait = false;
        }

        this.player_hd_thumbnail_wait = setInterval(function() {
            var thumbnail = document.querySelector('.ytp-cued-thumbnail-overlay-image');

            if (thumbnail && thumbnail.style.backgroundImage) {
                var style = document.getElementById('it-hd-thumbnail') || document.createElement('style');

                style.textContent = '.ytp-cued-thumbnail-overlay-image{background-image:' + thumbnail.style.backgroundImage.replace('/hqdefault.jpg', '/maxresdefault.jpg') + ' !important}';

                if (!document.getElementById('it-hd-thumbnail')) {
                    style.id = 'it-hd-thumbnail';
                    thumbnail.parentNode.insertBefore(style, thumbnail);
                }
            }
        }, 250);
    }
};

/*-----------------------------------------------------------------------------
1.3 Always show progress bar
-----------------------------------------------------------------------------*/

// TODO: FIX NIGHTLY UGLY ALGO

ImprovedTube.always_show_progress_bar = function() {
    if (ImprovedTube.always_show_progress_bar_interval) {
        clearInterval(ImprovedTube.always_show_progress_bar_interval);
    }

    if (this.storage.always_show_progress_bar === true) {
        ImprovedTube.always_show_progress_bar_interval = setInterval(function() {
            var player = document.querySelector('.html5-video-player');

            if (player && player.classList.contains('ytp-autohide')) {
                var played = player.getCurrentTime() * 100 / player.getDuration(),
                    loaded = player.getVideoBytesLoaded() * 100,
                    play_bars = player.querySelectorAll('.ytp-play-progress'),
                    load_bars = player.querySelectorAll('.ytp-load-progress'),
                    width = 0,
                    progress_play = 0,
                    progress_load = 0;

                for (var i = 0, l = play_bars.length; i < l; i++) {
                    width += play_bars[i].offsetWidth;
                }
                
                var width_percent = width / 100;
                
                for (var i = 0, l = play_bars.length; i < l; i++) {
                    var a = play_bars[i].offsetWidth / width_percent,
                        b = 0,
                        c = 0;
                    
                    if (played - progress_play >= a) {
                        b = 100;
                    } else if (played > progress_play && played < a + progress_play) {
                        b = 100 * ((played - progress_play) * width_percent) / play_bars[i].offsetWidth;
                    }
                    
                    play_bars[i].style.transform = 'scaleX(' + b / 100 + ')';
                    
                    if (loaded - progress_load >= a) {
                        c = 100;
                    } else if (loaded > progress_load && loaded < a + progress_load) {
                        c = 100 * ((loaded - progress_load) * width_percent) / play_bars[i].offsetWidth;
                    }
                    
                    load_bars[i].style.transform = 'scaleX(' + c / 100 + ')';
                    
                    progress_play += a;
                    progress_load += a;
                }
            }
        }, 100);
    }
};


/*-----------------------------------------------------------------------------
2.0 Details
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
2.1 How long ago the video was uploaded
-----------------------------------------------------------------------------*/

ImprovedTube.how_long_ago_the_video_was_uploaded = function() {
    if (ImprovedTube.storage.how_long_ago_the_video_was_uploaded === true) {
        function timeSince(date) {
            var seconds = Math.floor((new Date() - new Date(date)) / 1000),
                interval = Math.floor(seconds / 31536000);

            if (interval > 1) {
                return interval + ' years ago';
            }
            interval = Math.floor(seconds / 2592000);
            if (interval > 1) {
                return interval + ' months ago';
            }
            interval = Math.floor(seconds / 86400);
            if (interval > 1) {
                return interval + ' days ago';
            }
            interval = Math.floor(seconds / 3600);
            if (interval > 1) {
                return interval + ' hours ago';
            }
            interval = Math.floor(seconds / 60);
            if (interval > 1) {
                return interval + ' minutes ago';
            }

            return Math.floor(seconds) + ' seconds ago';
        }

        var waiting_channel_link = setInterval(function() {
            var youtube_version = document.documentElement.getAttribute('it-youtube-version') === 'new';

            if (document.querySelector(youtube_version ? '#meta-contents ytd-channel-name' : '.yt-user-info a')) {
                clearInterval(waiting_channel_link);

                var xhr = new XMLHttpRequest();

                xhr.addEventListener('load', function() {
                    var response = JSON.parse(this.responseText),
                        element = document.querySelector('.itx-channel-video-uploaded') || document.createElement(youtube_version ? 'yt-formatted-string' : 'a');

                    if (ImprovedTube.isset(response.items) && ImprovedTube.isset(response.items[0])) {
                        element.innerHTML = (youtube_version ? '<a href="' + (document.querySelector('ytd-video-secondary-info-renderer ytd-channel-name a').href.indexOf('/videos') === -1 ? document.querySelector('ytd-video-secondary-info-renderer ytd-channel-name a').href + '/videos' : document.querySelector('ytd-video-secondary-info-renderer ytd-channel-name a').href) + '" class="yt-simple-endpoint style-scope yt-formatted-string"> · ' + timeSince(response.items[0].snippet.publishedAt) + ' </a>' : timeSince(response.items[0].snippet.publishedAt) + '');

                        var date = new Date(response.items[0].snippet.publishedAt);

                        element.title = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
                    }

                    if (!youtube_version) {
                        element.href = document.querySelector('#watch7-user-header a').href.indexOf('/videos') === -1 ? document.querySelector('#watch7-user-header a').href + '/videos' : document.querySelector('#watch7-user-header a').href;
                    }

                    if (!document.querySelector('.itx-channel-video-uploaded') && document.querySelector(youtube_version ? '#meta-contents ytd-channel-name' : '.yt-user-info')) {
                        element.style.marginLeft = '8px';
                        element.className = (youtube_version ? 'style-scope ytd-video-owner-renderer itx-channel-video-uploaded' : 'yt-uix-sessionlink spf-link itx-channel-video-uploaded');

                        document.querySelector(youtube_version ? '#info #info-text #date' : '.yt-user-info').appendChild(element);
                    }
                });

                xhr.open('GET', 'https://www.googleapis.com/youtube/v3/videos?id=' + ImprovedTube.getParam(location.href.slice(location.href.indexOf('?') + 1), 'v') + '&key=AIzaSyCXRRCFwKAXOiF1JkUBmibzxJF1cPuKNwA&part=snippet', true);
                xhr.send();
            }
        }, 500);
    }
};


/*-----------------------------------------------------------------------------
2.2 Show channel videos count
-----------------------------------------------------------------------------*/

ImprovedTube.channel_videos_count = function() {
    if (ImprovedTube.storage.channel_videos_count === true) {
        var waiting_channel_link = setInterval(function() {
            var youtube_version = document.documentElement.getAttribute('it-youtube-version') === 'new';

            if (document.querySelector(youtube_version ? '#meta-contents ytd-channel-name a' : '.yt-user-info a')) {
                clearInterval(waiting_channel_link);

                var xhr = new XMLHttpRequest();

                xhr.addEventListener('load', function() {
                    var response = JSON.parse(this.responseText),
                        element = document.querySelector('.itx-channel-videos-count') || document.createElement(youtube_version ? 'yt-formatted-string' : 'a');

                    if (ImprovedTube.isset(response.items) && ImprovedTube.isset(response.items[0])) {
                        element.innerHTML = (youtube_version ? '<a href="' + (document.querySelector('ytd-video-secondary-info-renderer ytd-channel-name a').href.indexOf('/videos') === -1 ? document.querySelector('ytd-video-secondary-info-renderer ytd-channel-name a').href + '/videos' : document.querySelector('ytd-video-secondary-info-renderer ytd-channel-name a').href) + '" class="yt-simple-endpoint style-scope yt-formatted-string">' + response.items[0].statistics.videoCount + ' videos</a>' : response.items[0].statistics.videoCount + ' videos');
                    }

                    if (!youtube_version) {
                        element.href = document.querySelector('#watch7-user-header a').href.indexOf('/videos') === -1 ? document.querySelector('#watch7-user-header a').href + '/videos' : document.querySelector('#watch7-user-header a').href;
                    }

                    if (!document.querySelector('.itx-channel-videos-count') && document.querySelector(youtube_version ? '#meta-contents ytd-channel-name' : '.yt-user-info')) {
                        element.style.marginLeft = '8px';
                        element.className = (youtube_version ? 'style-scope ytd-video-owner-renderer itx-channel-videos-count' : 'yt-uix-sessionlink spf-link itx-channel-videos-count');

                        document.querySelector(youtube_version ? '#meta-contents ytd-channel-name' : '.yt-user-info').appendChild(element);
                    }
                });

                xhr.open('GET', 'https://www.googleapis.com/youtube/v3/channels?id=' + (document.querySelector(youtube_version ? '#meta-contents ytd-channel-name a' : '.yt-user-info a').getAttribute('it-origin') || document.querySelector(youtube_version ? '#meta-contents ytd-channel-name a' : '.yt-user-info a').href).replace('https://www.youtube.com/channel/', '') + '&key=AIzaSyCXRRCFwKAXOiF1JkUBmibzxJF1cPuKNwA&part=statistics', true);
                xhr.send();
            }
        }, 500);
    }
};


/*-----------------------------------------------------------------------------
3.0 Comments
-----------------------------------------------------------------------------*/

ImprovedTube.comments_wait = false;

ImprovedTube.comments = function() {
    if (this.storage.comments === 'collapsed') {
        if (this.comments_wait === false) {
            this.comments_wait = setInterval(function() {
                if (
                    document.getElementById('comment-section-renderer-items') ||
                    document.querySelector('#comments #sections #contents')
                ) {
                    clearInterval(this.comments_wait);

                    this.comments_wait = false;

                    if (!document.getElementById('improvedtube-collapsed-comments')) {
                        var button = document.createElement('button'),
                            parent = document.getElementById('comment-section-renderer') || document.querySelector('#comments #sections'),
                            reference = document.getElementById('comment-section-renderer-items') || document.querySelector('#comments #sections #contents');

                        button.id = 'improvedtube-collapsed-comments';
                        button.className = 'yt-uix-button yt-uix-button-size-default yt-uix-button-default comment-section-renderer-paginator yt-uix-sessionlink';
                        button.innerHTML = '<span class=yt-uix-button-content><span class=show-more-text>Show more</span><span class=show-less-text>Show less</span></span>';

                        button.onclick = function() {
                            document.documentElement.classList.toggle('comments-collapsed');
                        };

                        document.documentElement.classList.toggle('comments-collapsed');
                        parent.insertBefore(button, reference);
                    }
                }
            }, 250);
        }
    } else {
        clearInterval(this.comments_wait);

        this.comments_wait = false;

        setTimeout(function() {
            if (document.getElementById('improvedtube-collapsed-comments')) {
                document.getElementById('improvedtube-collapsed-comments').remove();
            }
        }, 260);
    }
};


/*-----------------------------------------------------------------------------
4.0 Sidebar
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
4.1 Live chat
-----------------------------------------------------------------------------*/

ImprovedTube.livechat_wait = false;
ImprovedTube.livechat_url = false;

ImprovedTube.livechat = function() {
    if (
        document.documentElement.getAttribute('it-page-type') === 'video' &&
        this.storage.livechat === 'collapsed' &&
        this.livechat_wait === false
    ) {
        this.livechat_wait = setInterval(function() {
            var button = document.querySelector('#chat:not([collapsed]) #show-hide-button paper-button'),
                expander = document.querySelector('#watch-sidebar-live-chat .yt-uix-expander');

            if (document.documentElement.getAttribute('it-page-type') !== 'video' || button || expander) {
                clearInterval(ImprovedTube.livechat_wait);

                ImprovedTube.livechat_wait = false;
            }

            if (button) {
                function click() {
                    ImprovedTube.livechat_url = location.href;
                }

                button.addEventListener('mousedown', click);
                button.addEventListener('touchdown', click);

                setTimeout(function() {
                    if (ImprovedTube.livechat_url !== location.href) {
                        button.click();
                    }
                }, 500);
            } else if (expander) {
                expander.classList.add('yt-uix-expander-collapsed');
            }
        }, 100);
    }
};

/*-----------------------------------------------------------------------------
# Live chat type
-----------------------------------------------------------------------------*/

ImprovedTube.livechat_type_wait = false;

ImprovedTube.livechat_type = function() {
    return false;
    
    if (
        document.documentElement.getAttribute('it-page-type') === 'video' &&
        ImprovedTube.storage.livechat_type === 'live' &&
        ImprovedTube.livechat_type_wait === false
    ) {
        this.livechat_type_wait = setInterval(function() {
            if (document.querySelectorAll('#chat-messages #dropdown a')[1]) {
                clearInterval(ImprovedTube.livechat_type_wait);

                ImprovedTube.livechat_type_wait = false;

                document.querySelectorAll('#chat-messages #dropdown a')[1].click();
            }
        }, 250);
    } else if (this.livechat_type_wait !== false) {
        clearInterval(this.livechat_type_wait);

        ImprovedTube.livechat_type_wait = false;
    }
};


/*-----------------------------------------------------------------------------
4.2 Related videos
-----------------------------------------------------------------------------*/

ImprovedTube.related_videos_wait = false;

ImprovedTube.related_videos = function() {
    if (this.storage.related_videos === 'collapsed') {
        if (!this.related_videos_wait) {
            this.related_videos_wait = setInterval(function() {
                if (
                    document.querySelector('#related.ytd-watch-flexy') ||
                    document.querySelector('#watch7-sidebar-contents')
                ) {
                    clearInterval(this.related_videos_wait);

                    this.related_videos_wait = false;

                    if (!document.getElementById('improvedtube-collapsed-related-videos')) {
                        var button = document.createElement('button'),
                            parent = document.querySelector('#related.ytd-watch-flexy') || document.querySelector('#watch7-sidebar-contents'),
                            reference = document.querySelector('#related > *') || document.querySelector('#watch7-sidebar-contents > *');

                        button.id = 'improvedtube-collapsed-related-videos';
                        button.className = 'yt-uix-button yt-uix-button-size-default yt-uix-button-default comment-section-renderer-paginator yt-uix-sessionlink';
                        button.innerHTML = '<span class=yt-uix-button-content><span class=show-more-text>Show more</span><span class=show-less-text>Show less</span></span>';

                        button.onclick = function() {
                            document.documentElement.classList.toggle('related-videos-collapsed');
                        };

                        document.documentElement.classList.toggle('related-videos-collapsed');
                        parent.insertBefore(button, reference);
                    }
                }
            }, 250);
        }
    } else {
        clearInterval(this.related_videos_wait);

        this.related_videos_wait = false;

        setTimeout(function() {
            if (document.getElementById('improvedtube-collapsed-related-videos')) {
                document.getElementById('improvedtube-collapsed-related-videos').remove();
            }
        }, 260);
    }
};

// TODO: HIGH CPU USAGE

document.addEventListener('ImprovedTubeBlacklist', function(event) {
    console.log('Blacklist event');
    
    if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage({
            name: 'improvedtube-blacklist',
            data: {
                type: event.detail.type,
                id: event.detail.id,
                title: event.detail.title,
                preview: event.detail.preview
            }
        });
    }
});

ImprovedTube.blacklist = function() {
    if (ImprovedTube.storage.blacklist_activate !== true) {
        return false;
    }

    if (typeof ImprovedTube.storage.blacklist === 'boolean' || !ImprovedTube.storage.blacklist) {
        ImprovedTube.storage.blacklist = {};
    }

    // channel button
    if (
        !ImprovedTube.isset(ImprovedTube.storage.blacklist.channels) ||
        (ImprovedTube.storage.blacklist.channels &&
        Object.keys(ImprovedTube.storage.blacklist.channels).indexOf(location.href.replace(/https:\/\/www.youtube.com\/(channel|user|c)\//g, '').replace(/\/(.)+/g, '')) === -1)
    ) {
        let channel_items = document.querySelectorAll('#inner-header-container #subscribe-button, .primary-header-upper-section .yt-uix-subscription-button');

        for (let i = 0, l = channel_items.length; i < l; i++) {
            if (!channel_items[i].parentNode.querySelector('.improvedtube-add-to-blacklist')) {
                let button = document.createElement('div');

                button.addEventListener('click', function(event) {
                    let video_id;

                    event.preventDefault();
                    event.stopPropagation();

                    try {
                        video_id = location.href.replace(/https:\/\/www.youtube.com\/(channel|user)\//g, '').replace(/\/(.)+/g, '');

                        document.dispatchEvent(new CustomEvent('ImprovedTubeBlacklist', {
                            detail: {
                                type: 'channel',
                                id: video_id,
                                title: document.querySelector('#channel-container yt-formatted-string.ytd-channel-name, a.branded-page-header-title-link').innerText,
                                preview: document.querySelector('#channel-container #avatar #img, .channel-header-profile-image').src
                            }
                        }));

                        if (!ImprovedTube.storage.blacklist || typeof ImprovedTube.storage.blacklist !== 'object') {
                            ImprovedTube.storage.blacklist = {};
                        }

                        if (!ImprovedTube.storage.blacklist.channels) {
                            ImprovedTube.storage.blacklist.channels = {};
                        }

                        ImprovedTube.storage.blacklist.channels[video_id] = {
                            title: document.querySelector('yt-formatted-string.ytd-channel-name, a.branded-page-header-title-link').innerText,
                            preview: document.querySelector('#channel-container #avatar #img, .channel-header-profile-image').src
                        };

                        ImprovedTube.blacklist();

                        location.reload();
                    } catch (err) {}
                }, true);

                button.className = 'improvedtube-add-to-blacklist';
                button.innerText = 'Add to blacklist';
                button.style.position = 'static';
                button.style.transform = 'unset';
                button.style.opacity = '1';
                button.style.visibility = 'visible';
                button.style.pointerEvents = 'all';
                button.style.width = 'auto';
                button.style.fontSize = '16px';
                button.style.lineHeight = '28px';
                button.style.height = 'auto';
                button.style.padding = '6px 12px';
                button.style.borderRadius = '2px';
                button.style.boxSizing = 'border-box';
                button.style.background = '#bb1a1a';

                channel_items[i].parentNode.insertBefore(button, channel_items[i]);
            }
        }
    }

    // video button
    let video_items = document.querySelectorAll('a#thumbnail.ytd-thumbnail, div.yt-lockup-thumbnail a, a.thumb-link');

    for (let i = 0, l = video_items.length; i < l; i++) {
        if (!video_items[i].querySelector('.improvedtube-add-to-blacklist')) {
            let button = document.createElement('div');

            button.addEventListener('click', function(event) {
                let video_id;

                event.preventDefault();
                event.stopPropagation();

                try {
                    video_id = ImprovedTube.getParam(new URL(this.parentNode.href).search.substr(1), 'v');

                    let item = this.parentNode;

                    while (
                        item.nodeName &&
                        item.nodeName !== 'YTD-RICH-ITEM-RENDERER' &&
                        item.nodeName !== 'YTD-COMPACT-VIDEO-RENDERER' &&
                        item.nodeName !== 'YTD-GRID-VIDEO-RENDERER' &&
                        item.classList &&
                        !item.classList.contains('yt-shelf-grid-item') &&
                        !item.classList.contains('video-list-item')
                    ) {
                        item = item.parentNode;
                    }

                    document.dispatchEvent(new CustomEvent('ImprovedTubeBlacklist', {
                        detail: {
                            type: 'video',
                            id: video_id,
                            title: item.querySelector('#video-title').innerText
                        }
                    }));

                    if (!ImprovedTube.storage.blacklist || typeof ImprovedTube.storage.blacklist !== 'object') {
                        ImprovedTube.storage.blacklist = {};
                    }

                    if (!ImprovedTube.storage.blacklist.videos) {
                        ImprovedTube.storage.blacklist.videos = {};
                    }

                    ImprovedTube.storage.blacklist.videos[video_id] = {
                        title: item.querySelector('#video-title').innerText
                    };

                    ImprovedTube.blacklist();
                } catch (err) {}
            }, true);
            button.className = 'improvedtube-add-to-blacklist';
            button.innerText = 'x';

            video_items[i].appendChild(button);
        }
    }

    // remove channels
    if (ImprovedTube.storage.blacklist && ImprovedTube.storage.blacklist.channels) {
        let videos = document.querySelectorAll('a#thumbnail, div.yt-lockup-thumbnail a, a.thumb-link');

        for (let i = 0, l = videos.length; i < l; i++) {
            let item = videos[i];

            while (
                item.nodeName &&
                item.nodeName !== 'YTD-VIDEO-RENDERER' &&
                item.nodeName !== 'YTD-RICH-ITEM-RENDERER' &&
                item.nodeName !== 'YTD-COMPACT-VIDEO-RENDERER' &&
                item.nodeName !== 'YTD-GRID-VIDEO-RENDERER' &&
                item.classList &&
                !item.classList.contains('yt-shelf-grid-item') &&
                !item.classList.contains('video-list-item')
            ) {
                item = item.parentNode;
            }

            if (item.querySelector('.ytd-channel-name a, a.spf-link[href*="/user/"], a.spf-link[href*="/channel/"]')) {
                let channel_href = item.querySelector('.ytd-channel-name a, a.spf-link[href*="/user/"], a.spf-link[href*="/channel/"]').href;

                for (var key in ImprovedTube.storage.blacklist.channels) {
                    if (channel_href.indexOf(key) !== -1) {
                        item.style.display = 'none';
                    }
                }
            }
        }
    }

    // remove videos
    if (ImprovedTube.storage.blacklist && ImprovedTube.storage.blacklist.videos) {
        let videos = document.querySelectorAll('a#thumbnail, div.yt-lockup-thumbnail a, a.thumb-link');

        for (let i = 0, l = videos.length; i < l; i++) {
            if (videos[i].href && videos[i].href != '' && ImprovedTube.getParam(new URL(videos[i].href).search.substr(1), 'v') in ImprovedTube.storage.blacklist.videos) {
                let item = videos[i];

                while (
                    item.nodeName &&
                    item.nodeName !== 'YTD-VIDEO-RENDERER' &&
                    item.nodeName !== 'YTD-RICH-ITEM-RENDERER' &&
                    item.nodeName !== 'YTD-COMPACT-VIDEO-RENDERER' &&
                    item.nodeName !== 'YTD-GRID-VIDEO-RENDERER' &&
                    item.classList &&
                    !item.classList.contains('yt-shelf-grid-item') &&
                    !item.classList.contains('video-list-item')
                ) {
                    item = item.parentNode;
                }

                item.style.display = 'none';
            }
        }
    }
};

/*-----------------------------------------------------------------------------
>>> CHANNEL
-------------------------------------------------------------------------------
1.0 Channel tab
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Channel tab
-----------------------------------------------------------------------------*/

ImprovedTube.channel_default_tab = function() {
    if (this.storage.channel_default_tab && this.storage.channel_default_tab !== '/') {
        var value = this.storage.channel_default_tab,
            node_list = document.querySelectorAll('*:not(#contenteditable-root) > a[href*="user"], ' +
                                                  '*:not(#contenteditable-root) > a[href*="channel"], ' +
                                                  '*:not(#contenteditable-root) > a[href*="/c/"]');

        for (var i = 0, l = node_list.length; i < l; i++) {
            var node = node_list[i];

            if (!node.getAttribute('it-origin') ||
                node.hasAttribute('it-origin') &&
                node.getAttribute('it-origin').replace(/\/(home|videos|playlists)+$/g, '') != node.href.replace(/\/(home|videos|playlists)+$/g, '')
            ) {
                node.setAttribute('it-origin', node.href);
            }

            var pathname = new URL(node.getAttribute('it-origin')).pathname;

            node.href = node.getAttribute('it-origin') + value;

            function click() {
                if (
                    this.data &&
                    this.data.commandMetadata &&
                    this.data.commandMetadata.webCommandMetadata &&
                    this.data.commandMetadata.webCommandMetadata.url
                ) {
                    this.data.commandMetadata.webCommandMetadata.url = (this.querySelector('a') || this).href.replace('https://www.youtube.com', '');
                }
            }

            node.addEventListener('click', click, true);
            node.parentNode.addEventListener('click', click, true);
            node.parentNode.parentNode.addEventListener('click', click, true);
        }
    } else if (this.storage.channel_default_tab) {
        var node_list = document.querySelectorAll('a[href*="user"], a[href*="channel"], a[href*="/c/"]');

        for (var i = 0, l = node_list.length; i < l; i++) {
            node_list[i].href = node_list[i].getAttribute('it-origin');
        }
    }
};

/*-----------------------------------------------------------------------------
>>> GENERAL
-------------------------------------------------------------------------------
1.0 YouTube Home Page
2.0 Add «Scroll to top»
3.0 HD thumbnails
4.0 Confirmation before closing
5.0 Collapse of subscription sections
6.0 Mark watched videos
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 YouTube Home Page
-----------------------------------------------------------------------------*/

ImprovedTube.youtube_home_page = function() {
    if (
        this.storage.youtube_home_page &&
        this.storage.youtube_home_page !== '/' &&
        this.storage.youtube_home_page !== 'search'
    ) {
        var value = this.storage.youtube_home_page,
            node_list = document.querySelectorAll('a[href="/"]:not([role="tablist"]), a[href="//www.youtube.com"]:not([role="tablist"]), a[href="//www.youtube.com/"]:not([role="tablist"]), a[href="https://www.youtube.com"]:not([role="tablist"]), a[href="https://www.youtube.com/"]:not([role="tablist"]), a[it-origin="/"]:not([role="tablist"]), a[it-origin="//www.youtube.com"]:not([role="tablist"]), a[it-origin="//www.youtube.com/"]:not([role="tablist"]), a[it-origin="https://www.youtube.com"]:not([role="tablist"]), a[it-origin="https://www.youtube.com/"]:not([role="tablist"])');

        for (var i = 0, l = node_list.length; i < l; i++) {
            var node = node_list[i],
                pathname = new URL((node.getAttribute('it-origin') || node.href)).pathname;

            if (pathname === '/') {
                if (!node.getAttribute('it-origin')) {
                    node.setAttribute('it-origin', node.href);
                }
            }

            node.href = value;

            node.addEventListener('click', function() {
                if (
                    this.data &&
                    this.data.commandMetadata &&
                    this.data.commandMetadata.webCommandMetadata &&
                    this.data.commandMetadata.webCommandMetadata.url
                ) {
                    this.data.commandMetadata.webCommandMetadata.url = value;
                }
            }, true);
        }
    } else if (this.storage.youtube_home_page) {
        var node_list = document.querySelectorAll('a[href="/"], a[href="//www.youtube.com"], a[href="//www.youtube.com/"], a[href="https://www.youtube.com"], a[href="https://www.youtube.com/"], a[it-origin="/"], a[it-origin="//www.youtube.com"], a[it-origin="//www.youtube.com/"], a[it-origin="https://www.youtube.com"], a[it-origin="https://www.youtube.com/"]');

        for (var i = 0, l = node_list.length; i < l; i++) {
            node_list[i].href = node_list[i].getAttribute('it-origin') || '/';
        }
    }
};

function youtubeHomePage__documentStart(option) {
    if (option && option !== '/' && option !== 'search' && location.hostname === 'www.youtube.com' && location.pathname === '/') {
        location.replace(option);
    }
};


/*-----------------------------------------------------------------------------
2.0 Add «Scroll to top»
-----------------------------------------------------------------------------*/

ImprovedTube.scroll = function() {
    if (window.scrollY > window.innerHeight / 2) {
        document.documentElement.setAttribute('it-show-scroll-to-top', true);
    } else {
        document.documentElement.setAttribute('it-show-scroll-to-top', false);
    }
};

ImprovedTube.add_scroll_to_top = function(is_update) {
    if (this.storage.add_scroll_to_top === true) {
        var button = document.createElement('div');

        button.id = 'it-scroll-to-top';
        button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M13 19V7.8l4.9 5c.4.3 1 .3 1.4 0 .4-.5.4-1.1 0-1.5l-6.6-6.6a1 1 0 0 0-1.4 0l-6.6 6.6a1 1 0 1 0 1.4 1.4L11 7.8V19c0 .6.5 1 1 1s1-.5 1-1z"></svg>';

        button.addEventListener('click', function() {
            window.scrollTo(0, 0);
        });

        document.documentElement.appendChild(button);

        window.addEventListener('scroll', ImprovedTube.scroll);
    } else {
        window.removeEventListener('scroll', ImprovedTube.scroll);

        if (document.querySelector('#it-scroll-to-top')) {
            document.querySelector('#it-scroll-to-top').remove();
        }
    }
};


/*-----------------------------------------------------------------------------
3.0 HD thumbnails
-----------------------------------------------------------------------------*/

ImprovedTube.hd_thumbnails = function() {
    if (this.storage.hd_thumbnails === true) {
        var images = document.querySelectorAll('img');

        for (var i = 0, l = images.length; i < l; i++) {
            if (/(hqdefault\.jpg|hq720.jpg)+/.test(images[i].src) && !images[i].dataset.defaultSrc) {
                images[i].dataset.defaultSrc = images[i].src;

                images[i].onload = function() {
                    if (this.naturalHeight <= 90) {
                        this.src = this.dataset.defaultSrc;
                    }
                };

                images[i].src = images[i].src.replace(/(hqdefault\.jpg|hq720.jpg)+/, 'maxresdefault.jpg');
            }
        }
    } else {
        var images = document.querySelectorAll('img');

        for (var i = 0, l = images.length; i < l; i++) {
            if (images[i].dataset.defaultSrc) {
                images[i].src = images[i].dataset.defaultSrc;
            }
        }
    }
};


/*-----------------------------------------------------------------------------
4.0 Confirmation before closing
-----------------------------------------------------------------------------*/

ImprovedTube.confirmation_before_closing = function() {
    window.onbeforeunload = function() {
        if (ImprovedTube.storage.confirmation_before_closing === true) {
            return 'You have attempted to leave this page. Are you sure?';
        }
    };
};


/*-----------------------------------------------------------------------------
5.0 Collapse of subscription sections
-----------------------------------------------------------------------------*/

ImprovedTube.collapse_of_subscription_sections = function() {
    if (/\/feed\/subscriptions/.test(location.href)) {
        if (ImprovedTube.storage.collapse_of_subscription_sections === true) {
            var sections = document.querySelectorAll('ytd-page-manager ytd-section-list-renderer ytd-item-section-renderer, #browse-items-primary .section-list > li');

            for (var i = 0, l = sections.length; i < l; i++) {
                if (!sections[i].querySelector('.it-section-collapse')) {
                    var section_title = sections[i].querySelector('h2'),
                        button = document.createElement('div');

                    button.className = 'it-section-collapse';
                    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7.4 15.4l4.6-4.6 4.6 4.6L18 14l-6-6-6 6z"/></svg>';
                    button.section = sections[i];
                    button.addEventListener('click', function() {
                        var section = this.section,
                            content = section.querySelector('.grid-subheader + #contents, .shelf-title-table + .multirow-shelf');

                        if (section.classList.contains('it-section-collapsed') === false) {
                            content.style.height = content.offsetHeight + 'px';
                            content.style.transition = 'height 150ms';
                        }

                        setTimeout(function() {
                            section.classList.toggle('it-section-collapsed');
                        });
                    });

                    if (!sections[i].querySelector('.shelf-title-cell')) {
                        section_title.parentNode.insertBefore(button, section_title.nextSibling);
                    } else {
                        section_title.appendChild(button);
                    }
                }
            }
        } else {
            var sections = document.querySelectorAll('ytd-page-manager ytd-section-list-renderer ytd-item-section-renderer'),
                buttons = document.querySelectorAll('.it-section-collapse');

            for (var i = 0, l = sections.length; i < l; i++) {
                sections[i].classList.remove('it-section-collapsed');
                sections[i].style.height = '';
                sections[i].style.transition = '';
            }

            for (var i = 0, l = buttons.length; i < l; i++) {
                buttons[i].remove();
            }
        }
    }
};


/*-----------------------------------------------------------------------------
6.0 Mark watched videos
-----------------------------------------------------------------------------*/

document.addEventListener('ImprovedTubeWatched', function(event) {
    if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage({
            name: 'improvedtube-watched',
            data: {
                action: event.detail.action,
                id: event.detail.id,
                title: event.detail.title
            }
        });
    }
});

ImprovedTube.mark_watched_videos = function() {
    if (ImprovedTube.storage.mark_watched_videos === true) {
        var video_items = document.querySelectorAll('a#thumbnail.ytd-thumbnail, div.yt-lockup-thumbnail a, a.thumb-link');

        for (let i = 0, l = video_items.length; i < l; i++) {
            if (!video_items[i].querySelector('.it-mark-watched')) {
                var button = document.createElement('div');

                button.className = 'it-mark-watched' + (ImprovedTube.storage.watched && ImprovedTube.storage.watched[ImprovedTube.getParam(new URL(video_items[i].href || 'https://www.youtube.com/').search.substr(1), 'v')] ? ' watched' : '');
                button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.7 7.6 1 12a11.8 11.8 0 0022 0c-1.7-4.4-6-7.5-11-7.5zM12 17a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>';
                button.addEventListener('click', function(event) {
                    var watched = this.classList.contains('watched') ? false : true;

                    event.preventDefault();
                    event.stopPropagation();

                    this.classList.toggle('watched');

                    try {
                        var video_id = ImprovedTube.getParam(new URL(this.parentNode.href).search.substr(1), 'v'),
                            item = this.parentNode;

                        while (
                            item.nodeName &&
                            item.nodeName !== 'YTD-RICH-ITEM-RENDERER' &&
                            item.nodeName !== 'YTD-COMPACT-VIDEO-RENDERER' &&
                            item.nodeName !== 'YTD-GRID-VIDEO-RENDERER' &&
                            item.classList &&
                            !item.classList.contains('yt-shelf-grid-item') &&
                            !item.classList.contains('video-list-item')
                        ) {
                            item = item.parentNode;
                        }

                        if (!ImprovedTube.storage.watched || typeof ImprovedTube.storage.watched !== 'object') {
                            ImprovedTube.storage.watched = {};
                        }

                        if (watched === true) {
                            ImprovedTube.storage.watched[video_id] = {
                                title: item.querySelector('a#video-title, .title, .yt-lockup-title > a').innerText
                            };

                            document.dispatchEvent(new CustomEvent('ImprovedTubeWatched', {
                                detail: {
                                    action: 'set',
                                    id: video_id,
                                    title: item.querySelector('a#video-title, .title, .yt-lockup-title > a').innerText
                                }
                            }));
                        } else if (ImprovedTube.storage.watched[video_id]) {
                            delete ImprovedTube.storage.watched[video_id];

                            document.dispatchEvent(new CustomEvent('ImprovedTubeWatched', {
                                detail: {
                                    action: 'remove',
                                    id: video_id
                                }
                            }));
                        }
                    } catch (err) {}
                });

                video_items[i].appendChild(button);
            }
        }
    }
};

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
    event.preventDefault();
    
    if (event.button !== 0) {
        return false;
    }
    
    if (ImprovedTube.mini_player__resize() === true) {
        return false;
    }
        
    for (var i = 0, l = event.path.length; i < l; i++) {
        if ((event.path[i].classList && event.path[i].classList.contains('it-mini-player')) === false && i === l - 1) {
            return false;
        }
    }
    
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

/*-----------------------------------------------------------------------------
>>> PLAYLIST
-------------------------------------------------------------------------------
1.0 Reverse
2.0 Repeat
3.0 Shuffle
-----------------------------------------------------------------------------*/


/*-----------------------------------------------------------------------------
1.0 Reverse (todo)
-----------------------------------------------------------------------------*/

ImprovedTube.playlist_reverse_wait = false;

ImprovedTube.playlist_reverse_activated = false;

ImprovedTube.playlist_reverse = function() {
    if (this.storage.playlist_reverse === true) {
        ImprovedTube.playlist_reverse_wait = setInterval(function() {
            if (
                (
                    document.querySelector('.playlist-nav-controls') ||
                    document.querySelector('ytd-watch-flexy ytd-playlist-panel-renderer #header-contents #playlist-actions ytd-menu-renderer #top-level-buttons')
                ) &&
                (document.querySelector('.playlist-nav-controls .toggle-loop') || document.querySelectorAll('#playlist-actions #top-level-buttons ytd-toggle-button-renderer')[0]) &&
                !document.querySelector('#it-playlist-reverse')
            ) {
                clearInterval(ImprovedTube.playlist_reverse_wait);

                ImprovedTube.playlist_reverse_wait = false;

                var button = document.createElement('div');

                button.id = 'it-playlist-reverse';
                button.innerHTML = '<svg width=24 height=24 viewBox="0 0 24 24"><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"></svg>';
                button.onclick = function() {
                    if (this.classList.contains('yt-uix-button-toggled')) {
                        ImprovedTube.playlist_reverse_activated = false;

                        this.classList.remove('yt-uix-button-toggled');
                    } else {
                        ImprovedTube.playlist_reverse_activated = true;

                        this.classList.add('yt-uix-button-toggled');
                    }

                    ImprovedTube.newPlaylistReverse();
                };

                (document.querySelector('ytd-watch-flexy ytd-playlist-panel-renderer #header-contents #playlist-actions ytd-menu-renderer #top-level-buttons') || document.querySelector('.playlist-nav-controls')).appendChild(button);

                if ((ImprovedTube.playlist_reverse_activated === true || location.href.indexOf('it-playlist-reverse=true') !== -1) && document.querySelector('#it-playlist-reverse')) {
                    ImprovedTube.playlist_reverse_activated = true;

                    document.querySelector('#it-playlist-reverse').classList.add('yt-uix-button-toggled');

                    ImprovedTube.newPlaylistReverse();
                }
            }
        }, 250);
    }
};

ImprovedTube.newPlaylistReverse = function() {
    var list = document.querySelector('#items.playlist-items'),
        videos = document.querySelectorAll('#items.playlist-items > *'),
        clones = [],
        titles = [],
        channels = [],
        hrefs = [];

    if (videos) {
        for (var i = videos.length - 1; i >= 0; i--) {
            titles.push(videos[i].querySelector('#video-title').innerText);
            channels.push(videos[i].querySelector('#byline').innerText);
            hrefs.push(videos[i].querySelector('a').href + '&it-playlist-reverse=true');
            clones.push(videos[i].cloneNode(true));
        }

        list.innerHTML = '';

        for (var i = 0, l = clones.length; i < l; i++) {
            var clone = clones[i].cloneNode(true);

            list.appendChild(clone);
        }

        function next(event) {
            if (
                ImprovedTube.playlist_reverse_activated === true &&
                (
                    (document.querySelector('#items.playlist-items > [selected]').nextElementSibling ? document.querySelector('#items.playlist-items > [selected]').nextElementSibling.querySelector('a') : null) ||
                    document.querySelector('#items.playlist-items > * a')
                )
            ) {
                for (var i = 0, l = event.path.length; i < l; i++) {
                    if (event.path[i] === document.querySelector('.html5-video-player .ytp-next-button')) {
                        event.preventDefault();
                        event.stopPropagation();

                        location.replace(((document.querySelector('#items.playlist-items > [selected]').nextElementSibling ? document.querySelector('#items.playlist-items > [selected]').nextElementSibling.querySelector('a') : null) || document.querySelector('#items.playlist-items > * a')).href);

                        return false;
                    }
                }
            }
        }

        window.removeEventListener('click', next);
        window.addEventListener('click', next);

        function prev(event) {
            if (
                ImprovedTube.playlist_reverse_activated === true &&
                (
                    (document.querySelector('#items.playlist-items > [selected]').previousElementSibling ? document.querySelector('#items.playlist-items > [selected]').nextElementSibling.querySelector('a') : null) ||
                    document.querySelector('#items.playlist-items > *:last-child a')
                )
            ) {
                for (var i = 0, l = event.path.length; i < l; i++) {
                    if (event.path[i] === document.querySelector('.html5-video-player .ytp-prev-button')) {
                        event.preventDefault();
                        event.stopPropagation();

                        location.replace(((document.querySelector('#items.playlist-items > [selected]').previousElementSibling ? document.querySelector('#items.playlist-items > [selected]').nextElementSibling.querySelector('a') : null) || document.querySelector('#items.playlist-items > *:last-child a')).href);

                        return false;
                    }
                }
            }
        }

        window.removeEventListener('click', prev);
        window.addEventListener('click', prev);

        setTimeout(function() {
            var items = document.querySelectorAll('#items.playlist-items > *');
            
            for (var i = 0, l = clones.length; i < l; i++) {
                var item = items[i];
                
                item.querySelector('a').href = hrefs[i];
                // index
                item.querySelector('#index').innerHTML = clones[i].querySelector('#index').innerHTML;
                // thumbnail
                item.querySelector('#thumbnail-container').style.background = 'url(https://i.ytimg.com/vi/' + hrefs[i].match(/v=[^&]*/g)[0].substr(2) + '/hqdefault.jpg) no-repeat center';
                item.querySelector('#thumbnail-container').style.backgroundSize = 'cover';
                item.querySelector('yt-img-shadow').classList.remove('empty');
                // title
                item.querySelector('#video-title').innerText = titles[i];
                // channel
                item.querySelector('#byline').innerText = channels[i];
            }

            //document.querySelector('.html5-video-player .ytp-next-button').parentNode.replaceChild(document.querySelector('.html5-video-player .ytp-next-button').cloneNode.true, document.querySelector('.html5-video-player .ytp-next-button'));
            
            document.querySelector('#playlist .playlist-items').scrollTo(0, document.querySelector('ytd-playlist-panel-video-renderer[selected]').offsetTop - document.querySelector('ytd-playlist-panel-video-renderer[selected]').parentNode.offsetTop);
        }, 500);
    }
};


/*-----------------------------------------------------------------------------
2.0 Repeat
-----------------------------------------------------------------------------*/

ImprovedTube.playlist_repeat_wait = false;

ImprovedTube.playlist_repeat = function() {
    if (this.isset(this.storage.playlist_repeat) && /\/watch\?/.test(location.href) && /list=/.test(location.href)) {
        ImprovedTube.playlist_repeat_wait = setInterval(function() {
            if (
                document.querySelectorAll('#playlist-actions #top-level-buttons ytd-toggle-button-renderer')[0] ||
                document.querySelector('.playlist-nav-controls .toggle-loop')
            ) {
                clearInterval(ImprovedTube.playlist_repeat_wait);

                ImprovedTube.playlist_repeat_wait = false;

                var option = ImprovedTube.storage.playlist_repeat,
                    new_youtube_toggle = document.querySelectorAll('#playlist-actions #top-level-buttons ytd-toggle-button-renderer'),
                    old_youtube_toggle = document.querySelector('.playlist-nav-controls .toggle-loop');

                if (new_youtube_toggle[0] && (option === true && new_youtube_toggle[0].className.search('style-default-active') === -1 || option === 'disabled' && new_youtube_toggle[0].className.search('style-default-active') !== -1)) {
                    new_youtube_toggle[0].click();
                } else if (old_youtube_toggle && (option === true && old_youtube_toggle.className.search('yt-uix-button-toggled') === -1 || option === 'disabled' && old_youtube_toggle.className.search('yt-uix-button-toggled') !== -1)) {
                    old_youtube_toggle.click();
                }
            }
        }, 250);
    }
};


/*-----------------------------------------------------------------------------
3.0 Shuffle
-----------------------------------------------------------------------------*/

ImprovedTube.playlist_shuffle_wait = false;

ImprovedTube.playlist_shuffle = function() {
    if (this.isset(this.storage.playlist_shuffle) && /\/watch\?/.test(location.href) && /list=/.test(location.href)) {
        ImprovedTube.playlist_shuffle_wait = setInterval(function() {
            if (
                document.querySelectorAll('#playlist-actions #top-level-buttons ytd-toggle-button-renderer')[1] ||
                document.querySelector('.playlist-nav-controls .shuffle-playlist')
            ) {
                clearInterval(ImprovedTube.playlist_shuffle_wait);

                ImprovedTube.playlist_shuffle_wait = false;

                var option = ImprovedTube.storage.playlist_shuffle,
                    new_youtube_toggle = document.querySelectorAll('#playlist-actions #top-level-buttons ytd-toggle-button-renderer'),
                    old_youtube_toggle = document.querySelector('.playlist-nav-controls .shuffle-playlist');

                if (new_youtube_toggle[1] && (option === true && new_youtube_toggle[1].className.search('style-default-active') === -1 || option === 'disabled' && new_youtube_toggle[1].className.search('style-default-active') !== -1)) {
                    new_youtube_toggle[1].click();
                } else if (old_youtube_toggle && (option === true && old_youtube_toggle.className.search('yt-uix-button-toggled') === -1 || option === 'disabled' && old_youtube_toggle.className.search('yt-uix-button-toggled') !== -1)) {
                    old_youtube_toggle.click();
                }
            }
        }, 250);
    }
};


/*-----------------------------------------------------------------------------
4.0 Up next autoplay
-----------------------------------------------------------------------------*/

ImprovedTube.playlist_up_next_autoplay_f = function(event) {
    if (
        ImprovedTube.getParam(location.href, 'list') &&
        ImprovedTube.storage.playlist_up_next_autoplay === false &&
        this.currentTime >= this.duration - 1
    ) {
        this.pause();
    }
};

ImprovedTube.playlist_up_next_autoplay = function(player) {
    player.querySelector('video').removeEventListener('timeupdate', ImprovedTube.playlist_up_next_autoplay_f, true);
    player.querySelector('video').addEventListener('timeupdate', ImprovedTube.playlist_up_next_autoplay_f, true);
};

/*-----------------------------------------------------------------------------
>>> SETTINGS
-------------------------------------------------------------------------------
1.0 ImprovedTube icon on YouTube
2.0 Delete YouTube cookies
3.0 YouTube Language
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 ImprovedTube icon on YouTube
-----------------------------------------------------------------------------*/

ImprovedTube.improvedtube_youtube_icon_wait = false;

ImprovedTube.improvedtube_youtube_icon_resize = function() {
    var iframe = document.querySelector('.it-btn__iframe'),
        icon = document.querySelector('.it-btn__icon');

    if (iframe && icon) {
        var x = icon.getBoundingClientRect().x,
            y = icon.getBoundingClientRect().y;

        if (x < window.innerWidth / 2) {
            iframe.style.right = 'auto';
            iframe.style.left = '0px';
        } else {
            iframe.style.right = '0px';
            iframe.style.left = 'auto';
        }

        if (y < window.innerHeight / 2) {
            iframe.style.top = '50px';
            iframe.style.bottom = 'auto';

            iframe.style.height = Math.min(500, window.innerHeight - Math.max(0, iframe.getBoundingClientRect().top) - 16) + 'px';
        } else {
            iframe.style.top = 'auto';
            iframe.style.bottom = '50px';

            iframe.style.height = Math.min(500, window.innerHeight - Math.max(0, window.innerHeight - iframe.getBoundingClientRect().y - iframe.getBoundingClientRect().height) - 16) + 'px';
        }
    }
};

ImprovedTube.improvedtube_youtube_icon = function() {
    if (window.self !== window.top) {
        return false;
    }

    if (
        ImprovedTube.storage.improvedtube_youtube_icon === 'disabled' &&
        document.querySelector('.it-btn')
    ) {
        document.querySelector('.it-btn').remove();
    }

    if (this.improvedtube_youtube_icon_wait === false) {
        this.improvedtube_youtube_icon_wait = setInterval(function() {
            var option = ImprovedTube.storage.improvedtube_youtube_icon,
                parentNode,
                referenceNode;

            if (option === 'header_left') {
                parentNode = document.querySelector('ytd-masthead #start');
                referenceNode = document.querySelector('ytd-masthead #start #guide-button');
            } else if (option === 'header_right') {
                parentNode = (
                    document.querySelector('#end #buttons') ||
                    document.querySelector('#yt-masthead-user')
                );
            } else if (option === 'draggable') {
                parentNode = document.body || document.querySelector('body');
            } else if (option === 'below_player') {
                parentNode = (
                    document.querySelector('.title.ytd-video-primary-info-renderer') ||
                    document.querySelector('#watch-headline-title')
                );
            }

            if (document.querySelector('.it-btn')) {
                if (!parentNode.querySelector(':scope > .it-btn')) {
                    document.querySelector('.it-btn').remove();
                } else {
                    clearInterval(ImprovedTube.improvedtube_youtube_icon_wait);

                    ImprovedTube.improvedtube_youtube_icon_wait = false;

                    return false;
                }
            }

            if (
                ImprovedTube.isset(option) &&
                option !== 'disabled' &&
                parentNode && (option === 'header_left' ? referenceNode : true)
            ) {
                clearInterval(ImprovedTube.improvedtube_youtube_icon_wait);

                ImprovedTube.improvedtube_youtube_icon_wait = false;

                var button = document.createElement('div');

                button.className = 'it-btn';
                button.innerHTML = '<div class=it-btn__scrim></div><div class=it-btn__icon><iframe class=it-btn__iframe src=//www.youtube.com/improvedtube></iframe></div>';
                button.addEventListener('click', function() {
                    event.preventDefault();
                    event.stopPropagation();

                    this.classList.toggle('it-btn--active');
                    ImprovedTube.improvedtube_youtube_icon_resize();

                    return false;
                }, true);

                if (option === 'draggable') {
                    var position = localStorage.getItem('IT_ICON');

                    if (ImprovedTube.isset(position)) {
                        position = JSON.parse(position);

                        button.style.left = position.x + 'px';
                        button.style.top = position.y + 'px';
                    }

                    function move(event) {
                        button.classList.add('it-btn--dragging');

                        if (event.clientX < window.innerWidth / 2) {
                            if (event.clientX - Number(button.dataset.x) >= 16) {
                                button.style.left = event.clientX - Number(button.dataset.x) + 'px';
                            } else {
                                button.style.left = '16px';
                            }
                        } else {
                            if (event.clientX + (48 + window.innerWidth - document.querySelector('body').offsetWidth) - Number(button.dataset.x) <= window.innerWidth) {
                                button.style.left = event.clientX - Number(button.dataset.x) + 'px';
                            } else {
                                button.style.left = 'calc(100vw - ' + (48 + window.innerWidth - document.querySelector('body').offsetWidth) + 'px)';
                            }
                        }

                        if (event.clientY < window.innerHeight / 2) {
                            if (event.clientY - Number(button.dataset.y) >= 16) {
                                button.style.top = event.clientY - Number(button.dataset.y) + 'px';
                            } else {
                                button.style.top = '16px';
                            }
                        } else {
                            if (event.clientY + 48 - Number(button.dataset.y) <= window.innerHeight) {
                                button.style.top = event.clientY - Number(button.dataset.y) + 'px';
                            } else {
                                button.style.top = 'calc(100vh - 48px)';
                            }
                        }

                        ImprovedTube.improvedtube_youtube_icon_resize();
                    }

                    button.addEventListener('mousedown', function(event) {
                        this.dataset.x = event.layerX;
                        this.dataset.y = event.layerY;

                        window.addEventListener('mousemove', move);
                    });

                    window.addEventListener('mouseup', function() {
                        button.classList.remove('it-btn--dragging');

                        window.removeEventListener('mousemove', move);

                        localStorage.setItem('IT_ICON', JSON.stringify({
                            x: button.offsetLeft,
                            y: button.offsetTop
                        }));

                        setTimeout(function() {
                            button.style.pointerEvents = '';
                        });
                    });
                }

                if (option === 'header_left') {
                    parentNode.insertBefore(button, referenceNode);
                } else {
                    parentNode.appendChild(button);
                }

                ImprovedTube.improvedtube_youtube_icon_resize();
            }
        }, 250);
    }
};


/*-----------------------------------------------------------------------------
2.0 Delete YouTube cookies
-----------------------------------------------------------------------------*/

ImprovedTube.delete_youtube_cookies = function() {
    var cookies = document.cookie.split(';');

    for (var i = 0, l = cookies.length; i < l; i++) {
        var cookie = cookies[i],
            eqPos = cookie.indexOf('='),
            name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

        document.cookie = name + '=; domain=.youtube.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    setTimeout(function() {
        location.reload();
    }, 100);
};


/*-----------------------------------------------------------------------------
3.0 YouTube Language
-----------------------------------------------------------------------------*/

ImprovedTube.youtube_language = function() {
    var pref = ImprovedTube.getCookieValueByName('PREF'),
        hl = ImprovedTube.getParam(pref, 'hl');

    if (hl) {
        ImprovedTube.setCookie('PREF', pref.replace('hl=' + hl, 'hl=' + ImprovedTube.storage.youtube_language));
    } else {
        ImprovedTube.setCookie('PREF', pref + '&hl=' + ImprovedTube.storage.youtube_language);
    }

    setTimeout(function() {
        location.reload();
    }, 100);
};

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
            shortcut_picture_in_picture: function() {
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
                    player.setVolume(player.getVolume() + (Number(ImprovedTube.storage.shortcut_volume_step) || 5));
                }

                showStatus(player, player.getVolume());
            },
            shortcut_decrease_volume: function() {
                var player = document.querySelector('.html5-video-player');

                if (player && player.setVolume && player.getVolume) {
                    player.setVolume(player.getVolume() - (Number(ImprovedTube.storage.shortcut_volume_step) || 5));
                }

                showStatus(player, player.getVolume());
            },
            shortcut_screenshot: function() {
                var player = document.querySelector('.html5-video-player');

                if (player && player.setVolume && player.getVolume) {
                    ImprovedTube.screenshot();
                }
            },
            shortcut_increase_playback_speed: function() {
                var player = document.querySelector('#movie_player');

                if (player && player.setPlaybackRate && player.getPlaybackRate) {
                    player.setPlaybackRate(player.getPlaybackRate() + (Number(ImprovedTube.storage.shortcut_playback_speed_step) || .05));
                }

                showStatus(player, player.getPlaybackRate());
            },
            shortcut_decrease_playback_speed: function() {
                var player = document.querySelector('#movie_player');

                if (player && player.setPlaybackRate && player.getPlaybackRate) {
                    player.setPlaybackRate(player.getPlaybackRate() - (Number(ImprovedTube.storage.shortcut_playback_speed_step) || .05));
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
            },
            shortcut_dark_theme: function() {
                if (document.documentElement.hasAttribute('dark')) {
                    document.documentElement.removeAttribute('dark');
                    document.documentElement.removeAttribute('it-theme');
                } else {
                    document.documentElement.setAttribute('dark', '');
                    document.documentElement.setAttribute('it-theme', 'true');
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

/*-----------------------------------------------------------------------------
>>> THEMES
-------------------------------------------------------------------------------
1.0 Bluelight
2.0 Dim
3.0 Themes
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Bluelight
-----------------------------------------------------------------------------*/

ImprovedTube.bluelight = function() {
    var value = this.storage.bluelight,
        times = {
            from: Number((this.storage.schedule_time_from || '00:00').substr(0, 2)),
            to: Number((this.storage.schedule_time_to || '00:00').substr(0, 2))
        },
        current_time = new Date().getHours();

    if (times.to < times.from && current_time > times.from && current_time < 24) {
        times.to += 24;
    } else if (times.to < times.from && current_time < times.to) {
        times.from = 0;
    }

    if (
        this.isset(value) && value !== 0 && value !== '0' &&
        (this.storage.schedule !== 'sunset_to_sunrise' || current_time >= times.from && current_time < times.to)
    ) {
        if (!document.querySelector('#it-bluelight')) {
            var container = document.createElement('div');

            container.id = 'it-bluelight';
            container.innerHTML = '<svg version=1.1 viewBox="0 0 1 1"><filter id=it-bluelight-filter><feColorMatrix type=matrix values="1 0 0 0 0 0 1 0 0 0 0 0 ' + (1 - parseFloat(value) / 100) + ' 0 0 0 0 0 1 0"></feColorMatrix></filter></svg>';

            document.documentElement.appendChild(container);
        } else {
            document.querySelector('#it-bluelight-filter feColorMatrix').setAttribute('values', '1 0 0 0 0 0 1 0 0 0 0 0 ' + (1 - parseFloat(value) / 100) + ' 0 0 0 0 0 1 0');
        }
    } else if (document.querySelector('#it-bluelight')) {
        document.querySelector('#it-bluelight').remove();
    }
};


/*-----------------------------------------------------------------------------
2.0 Dim
-----------------------------------------------------------------------------*/

ImprovedTube.dim = function() {
    var value = this.storage.dim,
        times = {
            from: Number((this.storage.schedule_time_from || '00:00').substr(0, 2)),
            to: Number((this.storage.schedule_time_to || '00:00').substr(0, 2))
        },
        current_time = new Date().getHours();

    if (times.to < times.from && current_time > times.from && current_time < 24) {
        times.to += 24;
    } else if (times.to < times.from && current_time < times.to) {
        times.from = 0;
    };

    if (
        this.isset(value) && value !== 0 && value !== '0' &&
        (this.storage.schedule !== 'sunset_to_sunrise' || current_time >= times.from && current_time < times.to)
    ) {
        if (!document.querySelector('#it-dim')) {
            var container = document.createElement('div');

            container.id = 'it-dim';
            container.style.opacity = parseInt(Number(value)) / 100 || 0;

            document.documentElement.appendChild(container);
        } else {
            document.querySelector('#it-dim').style.opacity = parseInt(Number(value)) / 100 || 0;
        }

        if (!document.querySelector('#it-dim-player')) {
            var container = document.createElement('div');

            container.id = 'it-dim-player';
            container.style.opacity = parseInt(Number(value)) / 100 || 0;

            if (document.querySelector('.html5-video-player')) {
                document.querySelector('.html5-video-player').appendChild(container);
            }
        } else {
            document.querySelector('#it-dim-player').style.opacity = parseInt(Number(value)) / 100 || 0;
        }
    } else {
        if (document.querySelector('#it-dim')) {
            document.querySelector('#it-dim').remove();
        }

        if (document.querySelector('#it-dim-player')) {
            document.querySelector('#it-dim-player').remove();
        }
    }
};


ImprovedTube.font = function() {
    if (this.storage.font) {
        if (!document.querySelector('.it-font-family')) {
            var link = document.createElement('link');

            link.rel = 'stylesheet';

            document.documentElement.appendChild(link);
        } else {
            var link = document.querySelector('.it-font-family');
        }

        link.href = '//fonts.googleapis.com/css2?family=' + this.storage.font;

        document.documentElement.style.fontFamily = this.storage.font.replace(/\+/g, ' ');
    }
};


/*-----------------------------------------------------------------------------
3.0 Themes
-----------------------------------------------------------------------------*/

ImprovedTube.theme = function() {
    var times = {
            from: Number((this.storage.schedule_time_from || '00:00').substr(0, 2)),
            to: Number((this.storage.schedule_time_to || '00:00').substr(0, 2))
        },
        current_time = new Date().getHours();

    if (times.to < times.from && current_time > times.from && current_time < 24) {
        times.to += 24;
    } else if (times.to < times.from && current_time < times.to) {
        times.from = 0;
    }

    if (
        (this.storage.schedule !== 'sunset_to_sunrise' || current_time >= times.from && current_time < times.to) &&
        (
            this.isset(ImprovedTube.storage.default_dark_theme) && ImprovedTube.storage.default_dark_theme !== false
            ||
            this.isset(ImprovedTube.storage.night_theme) && ImprovedTube.storage.night_theme !== false
            ||
            this.isset(ImprovedTube.storage.dawn_theme) && ImprovedTube.storage.dawn_theme !== false
            ||
            this.isset(ImprovedTube.storage.sunset_theme) && ImprovedTube.storage.sunset_theme !== false
            ||
            this.isset(ImprovedTube.storage.desert_theme) && ImprovedTube.storage.desert_theme !== false
            ||
            this.isset(ImprovedTube.storage.plain_theme) && ImprovedTube.storage.plain_theme !== false
            ||
            this.isset(ImprovedTube.storage.black_theme) && ImprovedTube.storage.black_theme !== false
        )
    ) {
        var PREF_OLD = this.getParams(this.getCookieValueByName('PREF')),
            PREF = this.getParams(this.getCookieValueByName('PREF')),
            result = '';

        if (!this.isset(PREF.f6) || this.isset(PREF.f6) && PREF.f6.length !== 3) {
            PREF.f6 = '400';
        } else if (PREF.f6.length === 3) {
            PREF.f6 = '4' + PREF.f6.substr(1);
        }

        for (var i in PREF) {
            result += i + '=' + PREF[i] + '&';
        }

        this.setCookie('PREF', result.slice(0, -1));

        document.documentElement.setAttribute('it-theme', 'true');
    } else {
        document.documentElement.removeAttribute('it-theme');
    }
};


ImprovedTube.themeEditor = function() {
    if (this.storage.theme_my_colors !== true) {
        if (document.querySelector('.it-theme-editor')) {
            document.querySelector('.it-theme-editor').remove();
        }

        return false;
    }

    var style = document.querySelector('.it-theme-editor') || document.createElement('style');

    style.className = 'it-theme-editor';
    style.innerText = 'html{' +
        '--yt-swatch-textbox-bg:rgba(19,19,19,1)!important;' +
        '--yt-swatch-icon-color:rgba(136,136,136,1)!important;' +
        '--yt-spec-brand-background-primary:rgba(0,0,0, 0.1) !important;' +
        '--yt-spec-brand-background-secondary:rgba(0,0,0, 0.1) !important;' +
        '--yt-spec-badge-chip-background:rgba(0, 0, 0, 0.05) !important;' +
        '--yt-spec-verified-badge-background:rgba(0, 0, 0, 0.15) !important;' +
        '--yt-spec-button-chip-background-hover:rgba(0, 0, 0, 0.10) !important;' +
        '--yt-spec-brand-button-background:rgba(136,136,136,1) !important;' +
        '--yt-spec-filled-button-focus-outline:rgba(0, 0, 0, 0.60) !important;' +
        '--yt-spec-call-to-action-button-focus-outline:rgba(0,0,0, 0.30) !important;' +
        '--yt-spec-brand-text-button-focus-outline:rgba(204, 0, 0, 0.30) !important;' +
        '--yt-spec-10-percent-layer:rgba(136,136,136,1) !important;' +
        '--yt-swatch-primary:' + (this.storage.theme_primary_color || '') + '!important;' +
        '--yt-swatch-primary-darker:' + (this.storage.theme_primary_color || '') + '!important;' +
        '--yt-spec-brand-background-solid:' + (this.storage.theme_primary_color || '') + '!important;' +
        '--yt-spec-general-background-a:' + (this.storage.theme_primary_color || '') + '!important;' +
        '--yt-spec-general-background-b:' + (this.storage.theme_primary_color || '') + '!important;' +
        '--yt-spec-general-background-c:' + (this.storage.theme_primary_color || '') + '!important;' +
        '--yt-spec-touch-response:' + (this.storage.theme_primary_color || '') + '!important;' +
        '--yt-swatch-text: ' + (this.storage.theme_text_color || '') + '!important;' +
        '--yt-swatch-important-text: ' + (this.storage.theme_text_color || '') + '!important;' +
        '--yt-swatch-input-text: ' + (this.storage.theme_text_color || '') + '!important;' +
        '--yt-swatch-logo-override: ' + (this.storage.theme_text_color || '') + '!important;' +
        '--yt-spec-text-primary:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-text-primary-inverse:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-text-secondary:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-text-disabled:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-icon-active-other:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-icon-inactive:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-icon-disabled:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-filled-button-text:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-call-to-action-inverse:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-brand-icon-active:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-brand-icon-inactive:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-brand-link-text:' + (this.storage.theme_text_color || '') + '!important;' +
        '--yt-spec-brand-subscribe-button-background:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-wordmark-text:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-selected-nav-text:' + (this.storage.theme_text_color || '') + ' !important;' +
        '}';

    document.documentElement.appendChild(style);
}

/*-----------------------------------------------------------------------------
>>> VOLUME MIXER
-------------------------------------------------------------------------------
1.0 Inject
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Inject
-----------------------------------------------------------------------------*/

ImprovedTube.volumeMixer = function() {};
/*-----------------------------------------------------------------------------
>>> FUNCTIONS
-------------------------------------------------------------------------------
1.0 
-----------------------------------------------------------------------------*/

function injectScript(string) {
    var script = document.createElement('script');

    script.textContent = string;

    document.documentElement.appendChild(script);

    script.remove();
}

function injectStyle(string, id) {
    var style = document.getElementById(id) || document.createElement('style');

    style.textContent = string;

    document.documentElement.appendChild(style);
}

ImprovedTube.isset = function(variable) {
    if (typeof variable === 'undefined' || variable === null) {
        return false;
    }

    return true;
};

ImprovedTube.getCookieValueByName = function(name) {
    var match = document.cookie.match(new RegExp('([; ]' + name + '|^' + name + ')([^\\s;]*)', 'g'));

    if (match) {
        var cookie = match[0];

        return cookie.replace(name + '=', '').replace(' ', '');
    } else
        return '';
};

ImprovedTube.getParam = function(query, name) {
    var params = query.split('&'),
        param = false;

    for (var i = 0; i < params.length; i++) {
        params[i] = params[i].split('=');

        if (params[i][0] == name) {
            param = params[i][1];
        }
    }

    if (param) {
        return param;
    } else {
        return false;
    }
};

ImprovedTube.getParams = function(query) {
    var params = query.split('&'),
        result = {};

    for (var i = 0, l = params.length; i < l; i++) {
        params[i] = params[i].split('=');

        result[params[i][0]] = params[i][1];
    }

    return result;
};

ImprovedTube.setCookie = function(name, value) {
    var date = new Date();

    date.setTime(date.getTime() + 3.154e+10);

    document.cookie = name + '=' + value + '; path=/; domain=.youtube.com; expires=' + date.toGMTString();
};

ImprovedTube.pageType = function() {
    var href = location.href,
        type = '';

    if (location.pathname == '/') {
        type = 'home';
    } else if (/\/watch\?/.test(href)) {
        type = 'video';
    } else if (/\/channel|user\//.test(href)) {
        type = 'channel';
    }

    document.documentElement.setAttribute('it-page-type', type);
};


chrome.runtime.sendMessage({
    enabled: true
});
/*-----------------------------------------------------------------------------
>>> INJECTION
-------------------------------------------------------------------------------
1.0 Initialization
2.0 Storage listener
3.0 Message listener
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Initialization
-----------------------------------------------------------------------------*/

chrome.storage.local.get(function(items) {
    var content = 'var ImprovedTube={';

    if (typeof items.player_volume === 'string') {
        items.player_volume = Number(items.player_volume);
    }

    if (!items.hasOwnProperty('header_position')) {
        items.header_position = 'normal';
    }

    if (!items.hasOwnProperty('player_size')) {
        items.player_size = 'do_not_change';
    }

    if (items.bluelight === '0') {
        items.bluelight = 0;
    }

    if (items.dim === '0') {
        items.dim = 0;
    }

    if (items.custom_js && items.custom_js.length > 0) {
        injectScript('try{' + items.custom_js + '} catch (err) { console.error(err); }');
    }

    if (items.custom_css && items.custom_css.length > 0) {
        injectStyle(items.custom_css, 'it-custom-css');
    }

    withoutInjection(items);

    content += 'storage:' + JSON.stringify(items);

    for (var key in items) {
        document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), items[key]);
    }

    for (var key in ImprovedTube) {
        content += ',' + key + ':' + ImprovedTube[key];
    }

    content += '};ImprovedTube.init();';

    injectScript(content);
});


/*-----------------------------------------------------------------------------
2.0 Storage listener
-----------------------------------------------------------------------------*/

chrome.storage.onChanged.addListener(function(changes) {
    for (var key in changes) {
        var value = changes[key].newValue;

        if (['watched'].indexOf(key) === -1) {
            document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), value);

            injectScript('ImprovedTube.storage[\'' + key + '\']=' + (typeof value === 'boolean' ? value : '\'' + value + '\'') + ';');

            if (typeof ImprovedTube[key] === 'function') {
                injectScript('ImprovedTube.' + key + '();');
            }

            if (key === 'schedule' || key === 'schedule_time_from' || key === 'schedule_time_to') {
                injectScript('ImprovedTube.bluelight();');
                injectScript('ImprovedTube.dim();');
                injectScript('ImprovedTube.theme();');
            }
            
            if (key.indexOf('theme') !== -1){
                injectScript('ImprovedTube.theme();');
            }

            if (key === 'theme_primary_color' || key === 'theme_text_color') {
                injectScript('ImprovedTube.themeEditor();');
            }

            if (['custom_css'].indexOf(key) !== -1 && value.length > 0) {
                injectStyle(value, 'it-custom-css');
            } else if (document.querySelector('#it-custom-css')) {
                document.querySelector('#it-custom-css').remove();
            }
        }
    }
});


/*-----------------------------------------------------------------------------
3.0 Message listener
-----------------------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var name = request.name || '',
        value = request.value;

    if (name === 'improvedtube-play') {
        if (request.id && request.id !== new URL(location.href).searchParams.get('v')) {
            injectScript(['if (document.querySelector(".html5-video-player") && !ImprovedTube.focused && ImprovedTube.storage.only_one_player_instance_playing) { document.querySelector(".html5-video-player").pauseVideo();}']);
        }
    } else if (name == 'request_volume' && document.querySelector('video')) {
        sendResponse({
            value: document.querySelector('video').volume * 100
        });
    } else if (name == 'change_volume') {
        injectScript(['if(document.querySelector(".html5-video-player")){document.querySelector(".html5-video-player").setVolume(' + request.volume + ');}'], 'improvedtube-mixer-data');
    } else if (name == 'request_playback_speed' && document.querySelector('video')) {
        sendResponse({
            value: document.querySelector('video').playbackRate
        });
    } else if (name == 'change_playback_speed') {
        injectScript(['if(document.querySelector(".html5-video-player video")){document.querySelector(".html5-video-player video").playbackRate = ' + request.playback_speed + ';}'], 'improvedtube-mixer-data');
    } else if (name === 'delete_youtube_cookies') {
        var cookies = document.cookie.split(';');

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i],
                eqPos = cookie.indexOf('='),
                name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

            document.cookie = name + '=; domain=.youtube.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }

        setTimeout(function() {
            location.reload();
        }, 250);
    }
});

/*-----------------------------------------------------------------------------
>>> MIGRATION
-------------------------------------------------------------------------------
1.0 General
	1.1 Legacy YouTube
	1.2 YouTube Home Page
	1.3 Add «Scroll to top»
	1.4 Hide animated thumbnails
	1.5 Confirmation before closing
2.0 Appearance
	2.1 Header
		2.1.1 Header style
		2.1.2 Improve logo
	2.2 Player
		2.2.1 Annotations
		2.2.2 Cards
		2.2.3 Player size
    2.3 Footer
        2.3.5 Hide footer
3.0 Themes
4.0 Player
	4.1 Quality
	4.2 Volume
	4.3 Playback speed
	4.4 Autoplay
	4.5 Allow 60fps
	4.6 Codec h.264
	4.7 Subtitles
	4.8 Loudness normalization
	4.9 Mini player
	4.10 Ads
	4.11 Autopause
	4.12 Auto-fullscreen
	4.13 Repeat button
	4.14 Screenshot button
	4.15 Rotate button
	4.16 Popup button
5.0 Playlist
	5.1 Repeat
	5.2 Shuffle
6.0 Channel
	6.1 Default tab
	6.2 Trailer autoplay
    6.3 Hide featured content
-----------------------------------------------------------------------------*/

chrome.storage.local.get(function(object) {
    if (object.migrated !== true) {
        for (var key in object) {
            var value = object[key];

            if (value === 'true') {
                object[key] = true;
            } else if (value === 'false') {
                object[key] = false;
            }

            /*---------------------------------------------------------------------
    		1.0 General
    		---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
    		1.1 Legacy YouTube
    		---------------------------------------------------------------------*/

            if (key === 'youtube_version') {
                if (value === 'old') {
                    object.legacy_youtube = true;
                } else {
                    object.legacy_youtube = false;
                }

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		1.2 YouTube Home Page
    		---------------------------------------------------------------------*/
            else if (key === 'youtube_home_page') {
                if (value === 'normal') {
                    object[key] = '/';
                } else if (value === 'trending') {
                    object[key] = '/feed/trending';
                } else if (value === 'subscriptions') {
                    object[key] = '/feed/subscriptions';
                } else if (value === 'history') {
                    object[key] = '/feed/history';
                } else if (value === 'watch_later') {
                    object[key] = '/playlist?list=WL';
                }
            }


            /*---------------------------------------------------------------------
            1.3 Add «Scroll to top»
            ---------------------------------------------------------------------*/
            else if (key === 'scroll_to_top') {
                if (value === 'true') {
                    object.add_scroll_to_top = true;
                } else {
                    object.add_scroll_to_top = false;
                }

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		1.4 Hide animated thumbnails
    		---------------------------------------------------------------------*/
            else if (key === 'play_videos_by_hovering_the_thumbnails') {
                if (value === 'false') {
                    object.hide_animated_thumbnails = true;
                } else {
                    object.hide_animated_thumbnails = false;
                }

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		1.5 Confirmation before closing
    		---------------------------------------------------------------------*/
            else if (key === 'youtube_prevent_closure') {
                if (value === 'true') {
                    object.confirmation_before_closing = true;
                }

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		2.0 Appearance
    		---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
    		2.1 Header
    		---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
    		2.1.1 Header style
    		---------------------------------------------------------------------*/
            else if (key === 'header') {
                if (value === 'top_of_page') {
                    object.header_position = 'static';
                } else {
                    object.header_position = value;
                }

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		2.1.2 Improve logo
    		---------------------------------------------------------------------*/
            else if (key === 'improve_youtube_logo') {
                object.header_improve_logo = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		2.2 Player
    		---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
    		2.2.1 Annotations
    		---------------------------------------------------------------------*/
            else if (key === 'annotations') {
                object.player_hide_annotations = value;

                delete object[key];
            }

            /*---------------------------------------------------------------------
    		2.2.2 Cards
    		---------------------------------------------------------------------*/
            else if (key === 'cards') {
                object.player_hide_cards = value;

                delete object[key];
            }

            /*---------------------------------------------------------------------
    		2.2.3 Transparent background
    		---------------------------------------------------------------------*/
            else if (key === 'transparent_background') {
                object.player_transparent_background = value;

                delete object[key];
            }

            /*---------------------------------------------------------------------
            2.2.4 Endscreen
            ---------------------------------------------------------------------*/
            else if (key === 'endscreen') {
                object.player_hide_endscreen = value;

                delete object[key];
            }

            /*---------------------------------------------------------------------
            2.3 Footer
            ---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
            2.3.5 Hide footer
            ---------------------------------------------------------------------*/
            else if (key === 'footer') {
                object.hide_footer = value === 'hidden' ? true : false;

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		3.0 Themes
    		---------------------------------------------------------------------*/
            else if (key === 'it_theme') {
                object.theme = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		4.0 Player
    		---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
            4.1 Quality
            ---------------------------------------------------------------------*/
            else if (key === 'video_quality') {
                object.player_quality = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.2 Volume
            ---------------------------------------------------------------------*/
            else if (key === 'video_volume') {
                object.player_volume = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.3 Playback speed
            ---------------------------------------------------------------------*/
            else if (key === 'video_playback_speed') {
                object.player_playback_speed = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.4 Autoplay
            ---------------------------------------------------------------------*/
            else if (key === 'video_autoplay') {
                object.player_autoplay = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.5 Allow 60fps
            ---------------------------------------------------------------------*/
            else if (key === 'allow_60fps') {
                object.player_60fps = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.6 Video codec h.264
            ---------------------------------------------------------------------*/
            else if (key === 'video_encode') {
                object.player_h264 = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.7 Allow subtitles
            ---------------------------------------------------------------------*/
            else if (key === 'allow_subtitles') {
                object.player_subtitles = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.8 Loudness normalization
            ---------------------------------------------------------------------*/
            else if (key === 'allow_loudness') {
                object.player_loudness_normalization = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.8 Mini player
            ---------------------------------------------------------------------*/
            else if (key === 'mini_player_b') {
                object.mini_player = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.9 Ads
            ---------------------------------------------------------------------*/
            else if (key === 'allow_video_ads') {
                object.player_ads = 'all_videos';

                delete object[key];
            } else if (key === 'subscribed_channel_player_ads' && value === true) {
                object.player_ads = 'subscribed_channels';

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.10 Autopause
            ---------------------------------------------------------------------*/
            else if (key === 'video_autopause') {
                object.player_autopause = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.11 Auto-fullscreen
            ---------------------------------------------------------------------*/
            else if (key === 'video_autofullscreen') {
                object.player_autofullscreen = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.12 Repeat button
            ---------------------------------------------------------------------*/
            else if (key === 'video_repeat_button') {
                object.player_repeat_button = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.13 Screenshot button
            ---------------------------------------------------------------------*/
            else if (key === 'screenshot_button') {
                object.player_screenshot_button = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.14 Rotate button
            ---------------------------------------------------------------------*/
            else if (key === 'video_rotate_button') {
                object.player_rotate_button = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.15 Popup button
            ---------------------------------------------------------------------*/
            else if (key === 'popup_player_button') {
                object.player_popup_button = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            5.0 Playlist
            ---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
            5.1 Repeat
            ---------------------------------------------------------------------*/
            else if (key === 'playlist_repeat') {
                if (value === 'enabled') {
                    object.playlist_repeat = true;
                } else if (value === 'disabled') {
                    object.playlist_repeat = false;
                }
            }

            /*---------------------------------------------------------------------
            5.2 Shuffle
            ---------------------------------------------------------------------*/
            else if (key === 'playlist_shuffle') {
                if (value === 'enabled') {
                    object.playlist_repeat = true;
                } else if (value === 'disabled') {
                    object.playlist_repeat = false;
                }
            }


            /*---------------------------------------------------------------------
            6.0 Channel
            ---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
            6.1 Default tab
            ---------------------------------------------------------------------*/
            else if (key === 'channel_default_page') {
                if (value === 'normal') {
                    object.channel_default_tab = '/';
                } else {
                    object.channel_default_tab = '/' + value;
                }
            }

            /*---------------------------------------------------------------------
            6.2 Trailer autoplay
            ---------------------------------------------------------------------*/
            else if (key === 'channel_autoplay') {
                object.channel_trailer_autoplay = value;

                delete object[key];
            }

            /*---------------------------------------------------------------------
            6.3 Hide featured content
            ---------------------------------------------------------------------*/
            else if (key === 'channel_featured_content') {
                object.channel_hide_featured_content = value;

                delete object[key];
            }
        }

        object.migrated = true;

        chrome.storage.local.clear();
        chrome.storage.local.set(object);
    }

    if (object.bluelight_removed !== true && (object.bluelight || object.bluelight === 0)) {
        object.bluelight_removed = true;

        delete object.bluelight;

        chrome.storage.local.clear();
        chrome.storage.local.set(object);

        location.reload();
    }

    if (object.player_size_migrated !== true && object.player_size) {
        object.player_size_migrated = true;

        if (
            [
                'do_not_change',
                'full_window',
                'fit_to_window',
                '240p',
                '360p',
                '480p',
                '576p',
                '720p',
                '1080p',
                '1440p',
                '2160p'
            ].indexOf(object.player_size) === -1
        ) {
            if (object.player_size === 'fit_window') {
                object.player_size = 'fit_to_window';
            } else {
                object.player_size = 'do_not_change';
            }
        }

        chrome.storage.local.clear();
        chrome.storage.local.set(object);

        location.reload();
    }

    if (object.hasOwnProperty('legacy_youtube') && object.legacy_youtube_migration !== true) {
        object.legacy_youtube_migration = true;

        if (object.legacy_youtube === true) {
            object.legacy_youtube = 'enabled';
        } else if (object.legacy_youtube === false) {
            object.legacy_youtube = 'disabled';
        }

        chrome.storage.local.clear();
        chrome.storage.local.set(object);

        location.reload();
    }

    if (object.hasOwnProperty('legacy_youtube') && object.legacy_youtube_migration2 !== true) {
        object.legacy_youtube_migration2 = true;

        if (object.legacy_youtube === 'enabled' || object.legacy_youtube === 'enabledForced') {
            object.legacy_youtube = true;
        } else if (object.legacy_youtube === 'disabled') {
            object.legacy_youtube = false;
        }

        chrome.storage.local.clear();
        chrome.storage.local.set(object);

        location.reload();
    }
});
/*-----------------------------------------------------------------------------
>>> MUTATIONS
-------------------------------------------------------------------------------
1.0 Mutations
    1.1 JSON.parse
    1.2 HTMLMediaElement.play
3.0 Player vars
4.0 ytPlayerApplicationCreateMod
-----------------------------------------------------------------------------*/

document.addEventListener('ImprovedTubePlayVideo', function(event) {
    if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage({
            name: 'improvedtube-play',
            id: new URL(location.href).searchParams.get('v')
        });
    }
});

/*-----------------------------------------------------------------------------
1.0 Mutations
-----------------------------------------------------------------------------*/

ImprovedTube.mutations = function() {
    /*-------------------------------------------------------------------------
    1.1 JSON.parse
    -------------------------------------------------------------------------*/
    JSON.parse = (function(original) {
        return function(text, reviver, bypass) {
            var temp = original.apply(this, arguments);

            if (!bypass && temp && temp.player && temp.player.args) {
                temp.player.args = ImprovedTube.changeArgs(temp.player.args);
            }

            return temp;
        };
    }(JSON.parse));

    /*-------------------------------------------------------------------------
    1.2 HTMLMediaElement.play
    -------------------------------------------------------------------------*/
    HTMLMediaElement.prototype.play = (function(original) {
        return function() {
            var self = this;

            if (
                ImprovedTube.autoplay() === false &&
                ImprovedTube.allow_autoplay === false &&
                this.parentNode.parentNode.classList.contains('ad-showing') === false
            ) {
                setTimeout(function() {
                    //console.log('PAUSE');
                    self.parentNode.parentNode.pauseVideo();
                });

                return;
            } else if (self.paused === true && ImprovedTube.videoUrl !== location.href) {
                ImprovedTube.playerUpdate(self.parentNode.parentNode, true);
            }

            ImprovedTube.player_loudness_normalization();

            return original.apply(this, arguments);
        }
    })(HTMLMediaElement.prototype.play);
};


/*-----------------------------------------------------------------------------
1.0 Change args
-----------------------------------------------------------------------------*/

ImprovedTube.changeArgs = function(args) {
    if (ImprovedTube.isset(args)) {
        // Ads
        if (
            ImprovedTube.storage.player_ads === 'block_all' ||
            ImprovedTube.storage.player_ads === 'subscribed_channels' && (args.player_response || '').indexOf('subscribed=1') === -1
        ) {
            delete args.ad3_module;

            if (args.player_response) {
                var player_response = JSON.parse(args.player_response);

                if (player_response && player_response.adPlacements) {
                    delete player_response.adPlacements;
                    delete player_response.playerAds;
                    
                    args.player_response = JSON.stringify(player_response);
                }
            }
        }

        // 60 fps
        if (ImprovedTube.storage.player_60fps === false && args.adaptive_fmts) {
            var key_type = args.adaptive_fmts.indexOf(',') > -1 ? ',' : '%2C',
                list = args.adaptive_fmts.split(key_type);

            for (var i = 0; i < list.length; i++) {
                var fps = list[i].split(/fps(?:=|%3D)([0-9]{2})/);

                fps = fps && fps[1];

                if (fps > 30)
                    list.splice(i--, 1);
            }

            args.adaptive_fmts = list.join(key_type);
        }

        // SUBTITLES
        if (ImprovedTube.storage.player_subtitles === false && args.caption_audio_tracks) {
            args.caption_audio_tracks = args.caption_audio_tracks.split(/&d=[0-9]|d=[0-9]&/).join('');
        }
    }

    return args;
};


/*-----------------------------------------------------------------------------
3.0 Player vars
-----------------------------------------------------------------------------*/

ImprovedTube.playerVars = function(original) {
    var context = this;

    return function(args) {
        var temp;

        args = ImprovedTube.changeArgs(args);

        temp = original.apply(this, arguments);

        return temp;
    };
};


/*-----------------------------------------------------------------------------
4.0 ytPlayerApplicationCreateMod
-----------------------------------------------------------------------------*/

ImprovedTube.ytPlayerApplicationCreateMod = function(original) {
    return function(api_name, config) {
        config.args = ImprovedTube.changeArgs(config.args);

        return original.apply(this, arguments);
    };
};
