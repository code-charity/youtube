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

ImprovedTube.always_show_progress_bar = function() {
    if (ImprovedTube.always_show_progress_bar_interval) {
        clearInterval(ImprovedTube.always_show_progress_bar_interval);
    }

    if (this.storage.always_show_progress_bar === true) {
        ImprovedTube.always_show_progress_bar_interval = setInterval(function() {
            var player = document.querySelector('.html5-video-player');

            if (player && player.classList.contains('ytp-autohide')) {
                var played = player.getCurrentTime() * 100 / player.getDuration();

                player.querySelector('.ytp-play-progress').style.transform = 'scaleX(' + played / 100 + ')';
                player.querySelector('.ytp-load-progress').style.transform = 'scaleX(' + player.getVideoBytesLoaded() + ')';
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
    if (ImprovedTube.storage.livechat_type === 'live') {
        this.livechat_type_wait = setInterval(function() {
            if (document.querySelectorAll('#chat-messages #dropdown a')[1]) {
                clearInterval(ImprovedTube.livechat_type_wait);

                ImprovedTube.livechat_type_wait = false;

                document.querySelectorAll('#chat-messages #dropdown a')[1].click();
            }
        });
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
