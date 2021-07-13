/*------------------------------------------------------------------------------
>>> TABLE OF CONTENTS:
--------------------------------------------------------------------------------
0.0 Global variable
1.0 General
  1.1 YouTube home page
  1.2 Collapse of subscription sections
  1.3 Add "Scroll to top"
  1.4 Confirmation before closing
  1.5 Mark watched videos
  1.6 Only one player instance playing
  1.7 HD thumbnails
  1.8 Hide thumbnail overlay
2.0 Appearance
  2.1 Player
    2.1.1 Forced theater mode
    2.1.2 HD thumbnail
    2.1.3 Always show progress bar
  2.2 Sidebar
    2.2.1 Livechat
    2.2.2 Relative videos
  2.3 Details
    2.3.1 How long ago the video was uploaded
    2.3.2 Show channel videos count
  2.5 Comments
3.0 Themes
  3.1 My colors
  3.2 Bluelight
  3.3 Dim
  3.4 Font
  3.5 Themes
4.0 Player
  4.1 Autoplay
  4.2 Autopause when switching tabs
  4.3 Forced playback speed
  4.4 Subtitles
  4.5 Up next autoplay
  4.6 Ads
  4.7 Custom mini-player
  4.8 Auto fullscreen
  4.9 Quality
  4.10 Codec h.264
  4.11 Allow 60fps
  4.12 Forced volume
  4.13 Loudness normalization
  4.14 Screenshot
  4.15 Repeat
  4.16 Rotate
  4.17 Popup player
  4.18 Force SDR
  4.19 Hide controls
5.0 Playlist
  5.1 Up next autoplay
  5.2 Reverse
  5.3 Repeat
  5.4 Shuffle
6.0 Channel
  6.1 Default channel tab
7.0 Shortcuts
8.0 Blacklist
9.0 Analyzer
10.0 Settings
   10.1 ImprovedTube icon
   10.2 ImprovedTube button (sidebar)
   10.3 ImprovedTube player buttons
   10.4 Delete YouTube cookies
   10.5 YouTube language

0.0 Page update listener
0.0 Onfocus
0.0 Onplay
0.0 Initialization
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
0.0 GLOBAL VARIABLE
--------------------------------------------------------------------------------
The variable "ImprovedTube" is used on the YouTube side.
------------------------------------------------------------------------------*/

var ImprovedTube = {};


/*------------------------------------------------------------------------------
1.0 GENERAL
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
1.1 YOUTUBE HOME PAGE
------------------------------------------------------------------------------*/

ImprovedTube.youtubeHomePage = function() {
    var option = this.storage.youtube_home_page;

    if (
        option === '/feed/trending' ||
        option === '/feed/subscriptions' ||
        option === '/feed/history' ||
        option === '/playlist?list=WL' ||
        option === '/playlist?list=LL' ||
        option === '/feed/library'
    ) {
        var node_list = document.querySelectorAll(`
                a[href="/"]:not([role=tablist]),
                a[href="https://www.youtube.com/"]:not([role=tablist]),
                a[it-origin="/"]:not([role=tablist])
            `);

        for (var i = 0, l = node_list.length; i < l; i++) {
            var node = node_list[i];

            if (node.hasAttribute('it-origin') === false) {
                node.setAttribute('it-origin', '/');
            }

            node.href = option;
            node.addEventListener('click', function() {
                if (
                    this.data &&
                    this.data.commandMetadata &&
                    this.data.commandMetadata.webCommandMetadata &&
                    this.data.commandMetadata.webCommandMetadata.url
                ) {
                    this.data.commandMetadata.webCommandMetadata.url = option;
                }
            }, true);
        }
    } else {
        var node_list = document.querySelectorAll('a[it-origin="/"]:not([role=tablist])');

        for (var i = 0, l = node_list.length; i < l; i++) {
            node_list[i].href = '/';
        }
    }
};


/*------------------------------------------------------------------------------
1.2 COLLAPSE OF SUBSCRIPTION SECTION
------------------------------------------------------------------------------*/

ImprovedTube.collapseOfSubscriptionSections = function() {
    if (/\/feed\/subscriptions/.test(location.href)) {
        if (this.storage.collapse_of_subscription_sections === true) {
            var sections = document.querySelectorAll('ytd-page-manager ytd-section-list-renderer ytd-item-section-renderer');

            for (var i = 0, l = sections.length; i < l; i++) {
                if (!sections[i].querySelector('.it-section-collapse')) {
                    var section_title = sections[i].querySelector('h2'),
                        button = document.createElement('div');

                    button.className = 'it-section-collapse';
                    button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7.4 15.4l4.6-4.6 4.6 4.6L18 14l-6-6-6 6z"/></svg>';
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

                    section_title.parentNode.insertBefore(button, section_title.nextSibling);
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


/*------------------------------------------------------------------------------
1.3 ADD "SCROLL TO TOP"
------------------------------------------------------------------------------*/

ImprovedTube.addScrollToTop = function(is_update) {
    if (this.storage.add_scroll_to_top === true) {
        var button = document.createElement('div');

        button.id = 'it-scroll-to-top';
        button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M13 19V7.8l4.9 5c.4.3 1 .3 1.4 0 .4-.5.4-1.1 0-1.5l-6.6-6.6a1 1 0 0 0-1.4 0l-6.6 6.6a1 1 0 1 0 1.4 1.4L11 7.8V19c0 .6.5 1 1 1s1-.5 1-1z"></svg>';

        button.addEventListener('click', function() {
            window.scrollTo(0, 0);
        });

        document.documentElement.appendChild(button);

        window.addEventListener('scroll', this.scroll);
    } else {
        var button = document.querySelector('#it-scroll-to-top');

        if (button) {
            button.remove();
        }

        window.removeEventListener('scroll', this.scroll);
    }
};

ImprovedTube.scroll = function() {
    if (window.scrollY > window.innerHeight / 2) {
        document.documentElement.setAttribute('it-show-scroll-to-top', true);
    } else {
        document.documentElement.setAttribute('it-show-scroll-to-top', false);
    }
};


/*------------------------------------------------------------------------------
1.4 CONFIRMATION BEFORE CLOSING
------------------------------------------------------------------------------*/

ImprovedTube.confirmationBeforeClosing = function() {
    window.onbeforeunload = function() {
        if (ImprovedTube.storage.confirmation_before_closing === true) {
            return 'You have attempted to leave this page. Are you sure?';
        }
    };
};


/*------------------------------------------------------------------------------
1.5 MARK WATCHED VIDEOS
--------------------------------------------------------------------------------
TODO: OPTIMIZE
------------------------------------------------------------------------------*/

ImprovedTube.markWatchedVideos = function() {
    if (ImprovedTube.storage.mark_watched_videos === true) {
        var video_items = document.querySelectorAll('a#thumbnail.ytd-thumbnail, div.yt-lockup-thumbnail a, a.thumb-link');

        for (var i = 0, l = video_items.length; i < l; i++) {
            if (!video_items[i].querySelector('.it-mark-watched')) {
                var button = document.createElement('div');

                button.className = 'it-mark-watched' + (this.storage.watched && this.storage.watched[this.getParam(new URL(video_items[i].href || 'https://www.youtube.com/').search.substr(1), 'v')] ? ' watched' : '');
                button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.7 7.6 1 12a11.8 11.8 0 0022 0c-1.7-4.4-6-7.5-11-7.5zM12 17a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>';

                button.addEventListener('click', function(event) {
                    var watched = !this.classList.contains('watched');

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
                                title: item.querySelector('#video-title').innerText
                            };

                            document.dispatchEvent(new CustomEvent('ImprovedTubeWatched', {
                                detail: {
                                    action: 'set',
                                    id: video_id,
                                    title: item.querySelector('#video-title').innerText
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
                    } catch (err) {
                        console.log(err);
                    }
                });

                video_items[i].appendChild(button);
            }
        }
    }
};

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


/*------------------------------------------------------------------------------
1.6 ONLY ONE PLAYER INSTANCE PLAYING
--------------------------------------------------------------------------------
TODO: FIX
------------------------------------------------------------------------------*/

ImprovedTube.onlyOnePlayerInstancePlaying = function() {
    var video = document.querySelector('.html5-video-player video');

    if (this.storage.only_one_player_instance_playing === true && video) {
        if (this.focus === true) {
            document.dispatchEvent(new CustomEvent('ImprovedTubeOnlyOnePlayer'));

            video.play();
        }
    }
};

document.addEventListener('ImprovedTubeOnlyOnePlayer', function(event) {
    if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage({
            name: 'improvedtube-only-one-player'
        });
    }
});


/*------------------------------------------------------------------------------
1.7 HD THUMBNAILS
------------------------------------------------------------------------------*/

ImprovedTube.hdThumbnails = function() {
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

/*------------------------------------------------------------------------------
1.8 HIDE THUMBNAIL OVERLAY
------------------------------------------------------------------------------*/

ImprovedTube.hideThumbnailOverlay = function() {
    if (this.storage.hide_thumbnail_overlay === true) {
        var overlays = document.querySelectorAll('#hover-overlays');

        for (var i = 0, l = overlays.length; i < l; i++) {
            overlays[i].style.display = "none";
        }
    }
};


/*------------------------------------------------------------------------------
2.0 APPEARANCE
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
2.1 PLAYER
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
2.1.1 FORCED THEATER MODE
------------------------------------------------------------------------------*/

ImprovedTube.forcedTheaterMode = function() {
    if (window.self === window.top && (ImprovedTube.storage.forced_theater_mode === true || ImprovedTube.storage.player_size === 'fit_to_window')) {
        var button = document.querySelector('button.ytp-size-button');

        if (button && ImprovedTube.isset(document.getElementById('player-theater-container').firstChild) === false) {
            button.click();
        }
    }
};


/*------------------------------------------------------------------------------
2.1.2 HD THUMBNAIL
--------------------------------------------------------------------------------
TODO: OPTIMIZED
------------------------------------------------------------------------------*/

ImprovedTube.playerHdThumbnail = function() {
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


/*------------------------------------------------------------------------------
2.1.3 ALWAYS SHOW PROGRESS BAR
------------------------------------------------------------------------------*/

ImprovedTube.alwaysShowProgressBar = function() {
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


/*------------------------------------------------------------------------------
2.2 SIDEBAR
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
2.2.1 LIVECHAT
--------------------------------------------------------------------------------
TODO: TEST
------------------------------------------------------------------------------*/

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
        }, 250);
    }
};


/*------------------------------------------------------------------------------
2.2.2 RELATIVE VIDEOS
--------------------------------------------------------------------------------
TODO: TEST
------------------------------------------------------------------------------*/

ImprovedTube.related_videos_wait = false;

ImprovedTube.relatedVideos = function() {
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
            var button = document.getElementById('improvedtube-collapsed-related-videos');

            if (button) {
                button.remove();
            }
        }, 260);
    }
};


/*------------------------------------------------------------------------------
2.3 DETAILS
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
2.3.1 HOW LONG AGO THE VIDEO WAS UPLOADED
------------------------------------------------------------------------------*/

ImprovedTube.howLongAgoTheVideoWasUploaded = function() {
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
            var youtube_version = document.documentElement.getAttribute('it-youtube-version') === 'new',
                api_key = typeof ImprovedTube.storage.google_api_key === 'string' && ImprovedTube.storage.google_api_key.length > 0 ? ImprovedTube.storage.google_api_key : 'AIzaSyCXRRCFwKAXOiF1JkUBmibzxJF1cPuKNwA';

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

                xhr.open('GET', 'https://www.googleapis.com/youtube/v3/videos?id=' + ImprovedTube.getParam(location.href.slice(location.href.indexOf('?') + 1), 'v') + '&key=' + api_key + '&part=snippet', true);
                xhr.send();
            }
        }, 500);
    }
};


/*------------------------------------------------------------------------------
2.3.2 SHOW CHANNEL VIDEOS COUNT
--------------------------------------------------------------------------------
TODO: TEST
------------------------------------------------------------------------------*/

ImprovedTube.channelVideosCount = function() {
    if (this.storage.channel_videos_count === true) {
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


/*------------------------------------------------------------------------------
2.4 COMMENTS
--------------------------------------------------------------------------------
TODO TEST
------------------------------------------------------------------------------*/

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


/*------------------------------------------------------------------------------
3.0 THEMES
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
3.1 MY COLORS
------------------------------------------------------------------------------*/

ImprovedTube.myColors = function() {
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
};


/*------------------------------------------------------------------------------
3.2 BLUELIGHT
------------------------------------------------------------------------------*/

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


/*------------------------------------------------------------------------------
3.3 DIM
------------------------------------------------------------------------------*/

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


/*------------------------------------------------------------------------------
3.4 FONT
------------------------------------------------------------------------------*/

ImprovedTube.font = function() {
    if (this.storage.font) {
        if (this.storage.font !== 'Default') {
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
    }
};


/*------------------------------------------------------------------------------
3.5 THEMES
------------------------------------------------------------------------------*/

ImprovedTube.themes = function() {
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
            this.isset(ImprovedTube.storage.default_dark_theme) && ImprovedTube.storage.default_dark_theme !== false ||
            this.isset(ImprovedTube.storage.night_theme) && ImprovedTube.storage.night_theme !== false ||
            this.isset(ImprovedTube.storage.dawn_theme) && ImprovedTube.storage.dawn_theme !== false ||
            this.isset(ImprovedTube.storage.sunset_theme) && ImprovedTube.storage.sunset_theme !== false ||
            this.isset(ImprovedTube.storage.desert_theme) && ImprovedTube.storage.desert_theme !== false ||
            this.isset(ImprovedTube.storage.plain_theme) && ImprovedTube.storage.plain_theme !== false ||
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


/*------------------------------------------------------------------------------
4.0 PLAYER
--------------------------------------------------------------------------------
TODO: CONNECT & TEST
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.1 AUTOPLAY
------------------------------------------------------------------------------*/

ImprovedTube.allow_autoplay = false;

ImprovedTube.autoplay = function(video) {
    if (ImprovedTube.video_url !== location.href) {
        ImprovedTube.allow_autoplay = false;
    }

    if (
        (
            (/\/watch\?/.test(location.href) && !/list=/.test(location.href) && ImprovedTube.storage.player_autoplay === false) ||
            (/\/watch\?/.test(location.href) && /list=/.test(location.href) && ImprovedTube.storage.playlist_autoplay === false) ||
            (/\/(channel|user|c)\//.test(location.href) && ImprovedTube.storage.channel_trailer_autoplay === false)
        ) === true &&
        ImprovedTube.allow_autoplay === false &&
        video.parentNode.parentNode.classList.contains('ad-showing') === false
    ) {
        setTimeout(function() {
            video.parentNode.parentNode.pauseVideo();
        });
    }
};


/*------------------------------------------------------------------------------
4.2 AUTOPAUSE WHEN SWITCHING TABS
------------------------------------------------------------------------------*/

ImprovedTube.playerAutopauseWhenSwitchingTabs = function() {
    var video = document.querySelector('.html5-video-player video');

    if (this.storage.player_autopause_when_switching_tabs === true && video) {

        if (this.focus === false && video.paused === false) {
            video.pause();

            this.played_before_blur = true;
        } else if (this.focus === true && this.played_before_blur === true) {
            video.play();
        }
    }
};


/*------------------------------------------------------------------------------
4.3 FORCED PLAYBACK SPEED
------------------------------------------------------------------------------*/

ImprovedTube.playerPlaybackSpeed = function(node) {
    var option = Number(ImprovedTube.storage.player_playback_speed),
        player = document.querySelector('.html5-video-player'),
        is_live = false;

    if (player && player.getVideoData && player.getVideoData().isLive) {
        is_live = true;
    }

    if (ImprovedTube.isset(ImprovedTube.storage.player_playback_speed) && ImprovedTube.storage.player_forced_playback_speed === true) {
        try {
            if (window.location.href.indexOf('music') === -1 && !is_live) {
                document.querySelector('.html5-video-player video').playbackRate = option;
            } else {
                document.querySelector('.html5-video-player video').playbackRate = 1;
            }
        } catch (err) {}
    }
};


/*------------------------------------------------------------------------------
4.4 SUBTITLES
------------------------------------------------------------------------------*/

ImprovedTube.subtitles = function() {

};


/*------------------------------------------------------------------------------
4.5 UP NEXT AUTOPLAY
------------------------------------------------------------------------------*/

ImprovedTube.upNextAutoplay = function() {
    var option = this.storage.up_next_autoplay;

    if (this.isset(option)) {
        var toggle = document.querySelector('.ytp-autonav-toggle-button'),
            attribute = toggle.getAttribute('aria-checked') === 'true';

        if (toggle) {
            if (option !== attribute) {
                toggle.click();
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.6 ADS
------------------------------------------------------------------------------*/

ImprovedTube.adInterval = false;
ImprovedTube.AdSkipButton = false;

ImprovedTube.playerAds = function() {
    if (ImprovedTube.adInterval) {
        clearInterval(ImprovedTube.adInterval);
    }

    if (ImprovedTube.storage.player_ads === 'block_all') {
        ImprovedTube.adInterval = setInterval(function() {
            var button = document.querySelector('.ytp-ad-skip-button.ytp-button');

            if (button) {
                button.click();

                clearInterval(ImprovedTube.adInterval);
            }
        }, 50);
    } else if (ImprovedTube.storage.player_ads === 'subscribed_channels') {
        ImprovedTube.adInterval = setInterval(function() {
            var button = document.querySelector('.ytp-ad-skip-button.ytp-button');

            if (button && !document.querySelector('#meta paper-button[subscribed]')) {
                button.click();

                clearInterval(ImprovedTube.adInterval);
            }
        }, 50);
    }
};

/*------------------------------------------------------------------------------
4.7 CUSTOM MINI-PLAYER
------------------------------------------------------------------------------*/

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

ImprovedTube.mini_player__scroll = function() {
    if (window.scrollY >= 256 && ImprovedTube.mini_player__mode === false && ImprovedTube.mini_player__element.classList.contains('ytp-player-minimized') === false) {
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
    } else if (window.scrollY < 256 && ImprovedTube.mini_player__mode === true || ImprovedTube.mini_player__element.classList.contains('ytp-player-minimized') === true) {
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

ImprovedTube.mini_player__mousedown = function(event) {
    if (event.button !== 0) {
        return false;
    }

    if (ImprovedTube.mini_player__resize() === true) {
        return false;
    }

    var is_player = false,
        path = event.composedPath();

    for (var i = 0, l = path.length; i < l; i++) {
        if ((path[i].classList && path[i].classList.contains('it-mini-player')) === true) {
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

ImprovedTube.mini_player__mouseup = function() {
    var strg = JSON.parse(localStorage.getItem('improedtube-mini-player')) || {};

    strg.x = ImprovedTube.mini_player__x;
    strg.y = ImprovedTube.mini_player__y;

    localStorage.setItem('improedtube-mini-player', JSON.stringify(strg));

    window.removeEventListener('mouseup', ImprovedTube.mini_player__mouseup);
    window.removeEventListener('mousemove', ImprovedTube.mini_player__mousemove);

    ImprovedTube.mini_player__move = false;

    setTimeout(function() {
        window.removeEventListener('click', ImprovedTube.mini_player__click, true);
    });
};

ImprovedTube.mini_player__click = function(event) {
    event.stopPropagation();
    event.preventDefault();
};

ImprovedTube.mini_player__mousemove = function(event) {
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

ImprovedTube.mini_player__cursorUpdate = function(event) {
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
        x >= ImprovedTube.mini_player__x &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
        y >= ImprovedTube.mini_player__y &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__resize_offset
    ) {
        c = 'n-resize';
    } else if (
        x >= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - ImprovedTube.mini_player__resize_offset &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
        y >= ImprovedTube.mini_player__y &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
    ) {
        c = 'e-resize';
    } else if (
        x >= ImprovedTube.mini_player__x &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
        y >= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - ImprovedTube.mini_player__resize_offset &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
    ) {
        c = 's-resize';
    } else if (
        x >= ImprovedTube.mini_player__x &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__resize_offset &&
        y >= ImprovedTube.mini_player__y &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
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

ImprovedTube.mini_player__resize = function(event) {
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

    window.dispatchEvent(new Event('resize'));

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
        ImprovedTube.mini_player__move = false;
        ImprovedTube.mini_player__setPosition(0, 0);
        ImprovedTube.mini_player__element.style.width = '';
        ImprovedTube.mini_player__element.style.height = '';

        ImprovedTube.mini_player__element.classList.remove('it-mini-player');

        ImprovedTube.mini_player__cursor = '';
        document.documentElement.removeAttribute('it-mini-player-cursor');

        window.dispatchEvent(new Event('resize'));

        window.removeEventListener('mousedown', ImprovedTube.mini_player__mousedown);
        window.removeEventListener('mousemove', ImprovedTube.mini_player__mousemove);
        window.removeEventListener('mouseup', ImprovedTube.mini_player__mouseup);
        window.removeEventListener('click', ImprovedTube.mini_player__click);
        window.removeEventListener('scroll', ImprovedTube.mini_player__scroll);
        window.removeEventListener('mousemove', ImprovedTube.mini_player__cursorUpdate);
    }
};


/*------------------------------------------------------------------------------
4.8 AUTO FULLSCREEN
------------------------------------------------------------------------------*/

ImprovedTube.playerAutofullscreen = function(node) {
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


/*------------------------------------------------------------------------------
4.9 QUALITY
------------------------------------------------------------------------------*/

ImprovedTube.playerQuality = function(node) {
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


/*------------------------------------------------------------------------------
4.10 CODEC H.264
------------------------------------------------------------------------------*/

ImprovedTube.playerH264 = function() {
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


/*------------------------------------------------------------------------------
4.11 ALLOW 60FPS
------------------------------------------------------------------------------*/

ImprovedTube.player60fps = function() {
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


/*------------------------------------------------------------------------------
4.12 FORCED VOLUME
------------------------------------------------------------------------------*/

ImprovedTube.playerVolume = function(node) {
    if (!node) {
        node = document.querySelector('.html5-video-player');
    }

    if (node && ImprovedTube.storage.player_forced_volume === true && ImprovedTube.initialVideoUpdateDone == false ) {
        var volume = Number(ImprovedTube.storage.player_volume);

        if (!ImprovedTube.isset(volume)) {
            volume = 1;
        }

        node.setVolume(volume);
    }
};


/*------------------------------------------------------------------------------
4.13 LOUDNESS NORMALIZATION
------------------------------------------------------------------------------*/

ImprovedTube.onvolumechange = function(event) {
    if (document.querySelector('.ytp-volume-panel') && ImprovedTube.storage.player_loudness_normalization === false) {
        var volume = Number(document.querySelector('.ytp-volume-panel').getAttribute('aria-valuenow'));

        this.volume = volume / 100;
    }
};

ImprovedTube.playerLoudnessNormalization = function() {
    var video = document.querySelector('video');

    if (video) {
        video.removeEventListener('volumechange', ImprovedTube.onvolumechange);
        video.addEventListener('volumechange', ImprovedTube.onvolumechange);
    }

    if (ImprovedTube.storage.player_loudness_normalization === false) {
        try {
            var local_storage = localStorage['yt-player-volume'];

            if (ImprovedTube.isset(Number(ImprovedTube.storage.player_volume)) && ImprovedTube.storage.player_forced_volume === true) {

            } else if (local_storage) {
                local_storage = JSON.parse(JSON.parse(local_storage).data);
                local_storage = Number(local_storage.volume);

                video.volume = local_storage / 100;
            } else {
                video.volume = 100;
            }
        } catch (err) {}
    }
};


/*------------------------------------------------------------------------------
4.14 SCREENSHOT
------------------------------------------------------------------------------*/

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

                a.download = location.href.match(/(\?|\&)v=[^&]+/)[0].substr(3) + '-' + new Date(document.querySelector('.html5-video-player').getCurrentTime() * 1000).toISOString().substr(11, 8).replace(/:/g, '-') + '.png';

                a.click();
            } else {
                try {
                    navigator.clipboard.write([
                        new ClipboardItem({
                            'image/png': blob
                        })
                    ]);
                } catch (error) {}
            }

            setTimeout(function() {
                video.style.width = old_w + 'px';
                video.style.height = old_h + 'px';

                document.body.style.opacity = '1';
            }, 100);
        });
    }, 100);
};

ImprovedTube.playerScreenshotButton = function() {
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


/*------------------------------------------------------------------------------
4.15 REPEAT
------------------------------------------------------------------------------*/

ImprovedTube.playerRepeatButton = function(node) {
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


/*------------------------------------------------------------------------------
4.16 ROTATE
------------------------------------------------------------------------------*/

ImprovedTube.playerRotateButton = function() {
    if (this.storage.player_rotate_button === true) {
        if (!node) {
            var node = document.querySelector('.html5-video-player');
        }

        this.createPlayerButton(node, {
            id: 'it-rotate-button',
            html: '<svg viewBox="0 0 24 24"><path d="M15.55 5.55L11 1v3.07a8 8 0 0 0 0 15.86v-2.02a6 6 0 0 1 0-11.82V10l4.55-4.45zM19.93 11a7.9 7.9 0 0 0-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02a7.92 7.92 0 0 0 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41A7.9 7.9 0 0 0 19.93 13h-2.02a5.9 5.9 0 0 1-1.02 2.48z"/></svg>',
            opacity: 1,
            onclick: function() {
                var video = node.querySelector('video'),
                    player = node,
                    transform = '',
                    rotate = (document.querySelector('.it-rotate-styles') && document.querySelector('.it-rotate-styles').textContent.match(/rotate\([0-9.]+deg\)/g) || [''])[0];
                rotate = Number((rotate.match(/[0-9.]+/g) || [])[0]) || 0;

                var nextRotate = (rotate < 270 && rotate % 90 == 0) ? rotate + 90 : 0;

                transform += 'rotate(' + nextRotate + 'deg)';

                if (nextRotate == 90 || nextRotate == 270) {
                    var isVerticalVideo = video.videoHeight > video.videoWidth;

                    var playerLongSide = isVerticalVideo ? player.clientWidth : player.clientHeight;
                    var playerShortSide = isVerticalVideo ? player.clientHeight : player.clientWidth;

                    var videoScaleForPlayerSize = playerLongSide / playerShortSide;

                    transform += ' scale(' + videoScaleForPlayerSize + ')';
                }
                //video.style.transform = transform;
                if (!document.querySelector('.it-rotate-styles')) {
                    var styles = document.createElement('style');

                    styles.className = 'it-rotate-styles';

                    document.body.appendChild(styles);
                }

                document.querySelector('.it-rotate-styles').textContent = '.html5-video-player:not(it-mini-player) video {transform:' + transform + '}';
            },
            title: 'Rotate'
        });
    } else if (document.querySelector('.it-rotate-button')) {
        document.querySelector('.it-rotate-button').remove();
        document.querySelector('.it-rotate-styles').remove();
    }
};


/*------------------------------------------------------------------------------
4.17 POPUP PLAYER
------------------------------------------------------------------------------*/

ImprovedTube.playerPopupButton = function() {
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

                window.open('//www.youtube.com/embed/' + location.href.match(/watch\?v=([A-Za-z0-9\-\_]+)/g)[0].slice(8) + '?start=' + parseInt(node.getCurrentTime()) + '&autoplay=' + (ImprovedTube.storage.player_autoplay == false ? '0' : '1'), '_blank', 'directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=' + node.offsetWidth + ',height=' + node.offsetHeight);
            },
            title: 'Popup'
        });
    } else if (document.querySelector('.it-popup-player-button')) {
        document.querySelector('.it-popup-player-button').remove();
    }
};

/*------------------------------------------------------------------------------
4.18 Force SDR
------------------------------------------------------------------------------*/

ImprovedTube.playerSDR = function() {
    if (this.storage.player_SDR === true) {
        Object.defineProperty(window.screen, 'pixelDepth', {
            enumerable: true,
            configurable: true,
            value: 24
        });
    }
};

/*------------------------------------------------------------------------------
4.19 Hide controls
------------------------------------------------------------------------------*/

ImprovedTube.playerControls = function() {
    if (!node) {
        var node = document.querySelector('.html5-video-player');
    }

    if (this.storage.player_hide_controls === true) {
        node.hideControls();
    } else {
        node.showControls();
    }
};

/*------------------------------------------------------------------------------
5.0 PLAYLIST
--------------------------------------------------------------------------------
TODO: CONNECT & TEST
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
5.1 UP NEXT AUTOPLAY
------------------------------------------------------------------------------*/

ImprovedTube.playlist_up_next_autoplay_f = function(event) {
    if (
        ImprovedTube.getParam(location.href, 'list') &&
        ImprovedTube.storage.playlist_up_next_autoplay === false &&
        this.currentTime >= this.duration - 2
    ) {
        this.pause();
    }
};

ImprovedTube.playlistUpNextAutoplay = function() {
    var video = document.querySelector('video');

    video.removeEventListener('timeupdate', ImprovedTube.playlist_up_next_autoplay_f, true);
    video.addEventListener('timeupdate', ImprovedTube.playlist_up_next_autoplay_f, true);
};


/*------------------------------------------------------------------------------
5.2 REVERSE
------------------------------------------------------------------------------*/

ImprovedTube.playlistReversed = false;

ImprovedTube.playlistReverse = function() {
    if (this.storage.playlist_reverse === true) {
        if (!document.querySelector('#it-reverse-playlist') && document.querySelector('ytd-watch-flexy ytd-playlist-panel-renderer #start-actions')) {
            var button = document.createElement('button');

            button.id = 'it-reverse-playlist';
            button.className = 'style-scope yt-icon-button';
            button.innerHTML = '<svg width=24 height=24 viewBox="0 0 24 24"><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"></svg>';

            button.addEventListener('click', function(event) {
                var playlist_manager = document.querySelector('yt-playlist-manager');

                event.preventDefault();
                event.stopPropagation();

                this.classList.toggle('active');

                ImprovedTube.playlistReversed = !ImprovedTube.playlistReversed;

                setTimeout(updateNextButton, 500);

                if (playlist_manager && playlist_manager.autoplayData) {
                    ImprovedTube.playlistAutoplayData = Object.assign({}, playlist_manager.autoplayData);
                }

                ImprovedTube.reverse(document.querySelector('ytd-playlist-panel-renderer .playlist-items'));

                return false;
            }, true);

            document.querySelector('ytd-watch-flexy ytd-playlist-panel-renderer #start-actions').appendChild(button);
        }

        function updateNextButton() {
            var next_button = document.querySelector('.ytp-next-button'),
                prev_button = document.querySelector('.ytp-prev-button'),
                playlist_manager = document.querySelector('yt-playlist-manager');

            if (playlist_manager) {
                var prev_item = document.querySelector('#playlist [selected]').previousElementSibling || document.querySelector('#playlist ytd-playlist-panel-video-renderer:last-child'),
                    next_item = document.querySelector('#playlist [selected] + *') || document.querySelector('#playlist ytd-playlist-panel-video-renderer'),
                    prev_href = prev_item.querySelector('a').href,
                    next_href = next_item.querySelector('a').href;
                
                if (prev_button) {
                    prev_button.href = prev_href;
                    prev_button.dataset.preview = prev_item.querySelector('img').src;
                    prev_button.dataset.tooltipText = prev_item.querySelector('#video-title').innerText;

                    if (playlist_manager.autoplayData.sets[0].previousButtonVideo) {
                        playlist_manager.autoplayData.sets[0].previousButtonVideo.commandMetadata.webCommandMetadata.url = prev_href.replace(location.origin, '');
                        playlist_manager.autoplayData.sets[0].previousButtonVideo.watchEndpoint.videoId = prev_href.match(/(\?|\&)v=[^&]+/)[0].substr(3);
                    }

                    if (playlist_manager.autoplayData.sets[1].previousButtonVideo) {
                        playlist_manager.autoplayData.sets[1].previousButtonVideo.commandMetadata.webCommandMetadata.url = next_href.replace(location.origin, '');
                        playlist_manager.autoplayData.sets[1].previousButtonVideo.watchEndpoint.videoId = next_href.match(/(\?|\&)v=[^&]+/)[0].substr(3);
                    }
                }

                if (next_button) {
                    next_button.href = next_href;
                    next_button.dataset.preview = next_item.querySelector('img').src;
                    next_button.dataset.tooltipText = next_item.querySelector('#video-title').innerText;
                
                    if (playlist_manager.autoplayData.sets[0].nextButtonVideo) {
                        playlist_manager.autoplayData.sets[0].nextButtonVideo.commandMetadata.webCommandMetadata.url = next_href.replace(location.origin, '');
                        playlist_manager.autoplayData.sets[0].nextButtonVideo.watchEndpoint.videoId = next_href.match(/(\?|\&)v=[^&]+/)[0].substr(3);
                    }

                    if (playlist_manager.autoplayData.sets[1].nextButtonVideo) {
                        playlist_manager.autoplayData.sets[1].nextButtonVideo.commandMetadata.webCommandMetadata.url = prev_href.replace(location.origin, '');
                        playlist_manager.autoplayData.sets[1].nextButtonVideo.watchEndpoint.videoId = prev_href.match(/(\?|\&)v=[^&]+/)[0].substr(3);
                    }
                }

                playlist_manager.autoplayData.sets[0].autoplayVideo.commandMetadata.webCommandMetadata.url = next_href.replace(location.origin, '');
                playlist_manager.autoplayData.sets[0].autoplayVideo.watchEndpoint.videoId = next_href.match(/(\?|\&)v=[^&]+/)[0].substr(3);
                playlist_manager.autoplayData.sets[1].autoplayVideo.commandMetadata.webCommandMetadata.url = next_href.replace(location.origin, '');
                playlist_manager.autoplayData.sets[1].autoplayVideo.watchEndpoint.videoId = next_href.match(/(\?|\&)v=[^&]+/)[0].substr(3);
            }
        }

        if (ImprovedTube.playlistReversed === true) {
            setTimeout(function() {
                ImprovedTube.reverse(document.querySelector('ytd-playlist-panel-renderer .playlist-items'));

                setTimeout(updateNextButton, 1000);
            }, 500);
        }
    }
};


/*------------------------------------------------------------------------------
5.3 REPEAT
------------------------------------------------------------------------------*/

ImprovedTube.playlist_repeat_wait = false;

ImprovedTube.playlistRepeat = function() {
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


/*------------------------------------------------------------------------------
5.4 SHUFFLE
------------------------------------------------------------------------------*/

ImprovedTube.playlist_shuffle_wait = false;

ImprovedTube.playlistShuffle = function() {
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


/*------------------------------------------------------------------------------
6.0 CHANNEL
--------------------------------------------------------------------------------
TODO: CONNECT & TEST
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
6.1 DEFAULT CHANNEL TAB
------------------------------------------------------------------------------*/

ImprovedTube.channelDefaultTab = function() {
    if (this.storage.channel_default_tab && this.storage.channel_default_tab !== '/') {
        var value = this.storage.channel_default_tab,
            node_list = document.querySelectorAll(
                '*:not(#contenteditable-root) > a[href*="user"], ' +
                '*:not(#contenteditable-root) > a[href*="channel"], ' +
                '*:not(#contenteditable-root) > a[href*="/c/"]'
            );

        for (var i = 0, l = node_list.length; i < l; i++) {
            var node = node_list[i];

            if (!node.getAttribute('it-origin') ||
                node.hasAttribute('it-origin') &&
                node.getAttribute('it-origin').replace(/\/(home|videos|playlists)+$/g, '') != node.href.replace(/\/(home|videos|playlists)+$/g, '')
            ) {
                node.setAttribute('it-origin', node.href);
            }

            node.href = node.getAttribute('it-origin') + value;

            function click(event) {
                event.stopPropagation();
            }

            node.addEventListener('click', click, true);
        }
    } else if (this.storage.channel_default_tab) {
        var node_list = document.querySelectorAll('a[href*="user"], a[href*="channel"], a[href*="/c/"]');

        for (var i = 0, l = node_list.length; i < l; i++) {
            node_list[i].href = node_list[i].getAttribute('it-origin');
        }
    }
};


/*------------------------------------------------------------------------------
7.0 SHORTCUTS
--------------------------------------------------------------------------------
TODO: CONNECT & TEST
TODO: Use keyboard library
------------------------------------------------------------------------------*/

ImprovedTube.shortcuts = function() {
    const printError = (section, message) => {
        console.error(`%c[Improve YouTube!] ${section}%c – ${message}`, "font-weight: bold; color: red;", "font-weight: unset; color: unset;");
    }
    
    var self = this,
        /** @type {Partial<Pick<KeyboardEvent, "keyCode" | "altKey" | "shiftKey" | "ctrlKey" | "metaKey">>} */
        pressedKey = {},
        wheel = 0,
        /** Is cursor under the video element */
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

    /**
     * @param {KeyboardEvent | WheelEvent} event 
     */
    function trigger(event) {
        if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 || event.target.isContentEditable) {
            return;
        }

        const buttonsSelectors = {
            like: "#menu #top-level-buttons-computed ytd-toggle-button-renderer:nth-child(1) a",
            dislike: "#menu #top-level-buttons-computed ytd-toggle-button-renderer:nth-child(2) a",
            subscribe: "#subscribe-button a"
        };
        const pressButton = (
            /** @type {keyof typeof buttonsSelectors} */
            button
        ) => {
            const elems = document.querySelectorAll(buttonsSelectors[button]);
            const visibleButton = [].find.call(elems, elem => elem.offsetParent !== null);
            // TODO throw natural error with `cause`
            if (!visibleButton) {
                const player = document.querySelector('#movie_player');
                // if there is no player the most likely we are not in watch page?
                if (!player) return;
                printError("Shortcuts", `Can't find ${button} button in visible DOM`);
                return;
            }
            visibleButton.click();
        };

        var features = {
            shortcut_auto: function() {
                var player = document.querySelector('#movie_player');

                if (player) {
                    player.setPlaybackQualityRange('auto');
                    player.setPlaybackQuality('auto');
                }
            },
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
            shortcut_toggle_controls: function() {
                var player = document.querySelector('.html5-video-player');

                if (player && player.hideControls && player.showControls) {
                    ImprovedTube.storage.player_hide_controls = !ImprovedTube.storage.player_hide_controls;

                    if (ImprovedTube.storage.player_hide_controls === true) {
                        player.hideControls();
                    } else {
                        player.showControls();
                    }
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
            shortcut_toggle_autoplay: function() {
                var toggle = document.querySelector('.ytp-autonav-toggle-button'),
                    attribute = toggle.getAttribute('aria-checked') === 'true';

                if (toggle) {
                    toggle.click();
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
            shortcut_seek_next_chapter: function() {
                const player = document.querySelector("#movie_player");
                const chapterDiv = document.querySelector(".ytp-chapters-container");
                const progressBarWidth = parseInt(document.querySelector(".ytp-chrome-bottom").style.width);

                if (!player || !player.seekBy || !progressBarWidth ||
                     !chapterDiv || !chapterDiv.children) {
                    return;
                }

                let curWidth = 0;

                for(let child of chapterDiv.children) {
                    if((curWidth - 2) / progressBarWidth <= player.getCurrentTime() / player.getDuration() &&
                         (curWidth - 2 + parseInt(child.style.width)) / progressBarWidth >= player.getCurrentTime() / player.getDuration() ) { //if child is current chapter
                        player.seekTo(((parseInt(child.style.width) + curWidth) / progressBarWidth) * player.getDuration());
                        return;
                    }

                    curWidth += parseInt(child.style.width) + 2;
                }
            },
            shortcut_seek_previous_chapter: function() {
                const player = document.querySelector("#movie_player");
                const chapterDiv = document.querySelector(".ytp-chapters-container");
                const progressBarWidth = parseInt(document.querySelector(".ytp-chrome-bottom").style.width);

                if (!player || !player.seekBy || !progressBarWidth ||
                     !chapterDiv || !chapterDiv.children) {
                    return;
                }

                let curWidth = 0;

                for(let i in chapterDiv.children) {
                    if(i === 0) {
                        player.seekTo(0);
                        return;
                    }

                    let child = chapterDiv.children[i];
                    if((curWidth + 2) / progressBarWidth <= player.getCurrentTime() / player.getDuration() &&
                        (curWidth + 2 + parseInt(child.style.width)) / progressBarWidth >= player.getCurrentTime() / player.getDuration() ) { //if child is current chapter
                        player.seekTo(((curWidth - 2) / progressBarWidth) * player.getDuration());
                        return;
                    }

                    curWidth += parseInt(child.style.width) + 2;
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
            shortcut_increase_playback_speed: function () {
                var video = document.querySelector('#movie_player video');

                if (video && video.playbackRate) {
                    if (video.playbackRate < 1 && video.playbackRate > 1 - ImprovedTube.storage.shortcut_playback_speed_step) {
                        video.playbackRate = 1
                    } else { // aligning at 1.0 independent of minimum

                        video.playbackRate = Math.max(Number((video.playbackRate + Number(ImprovedTube.storage.shortcut_playback_speed_step || .05)).toFixed(2)), .1);
                    }
                    showStatus(document.querySelector('#movie_player'), video.playbackRate);
                }
            },
            shortcut_decrease_playback_speed: function () {
                var video = document.querySelector('#movie_player video');

                if (video && video.playbackRate) {
                    if (video.playbackRate < 0.15 + ImprovedTube.storage.shortcut_playback_speed_step) {
                        video.playbackRate = (video.playbackRate * 0.7).toFixed(3)
                    } else { // slow down near minimum

                        video.playbackRate = Math.max(Number((video.playbackRate - Number(ImprovedTube.storage.shortcut_playback_speed_step || .05)).toFixed(2)), .1);
                    }
                    showStatus(document.querySelector('#movie_player'), video.playbackRate);
                }
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
                pressButton("like")
            },
            shortcut_dislike_shortcut: function() {
                pressButton("dislike")
            },
            shortcut_subscribe: function() {
                pressButton("subscribe")

            },
            shortcut_dark_theme: function() {
                if (document.documentElement.hasAttribute('dark')) {
                    document.documentElement.removeAttribute('dark');
                    document.documentElement.removeAttribute('it-theme');
                } else {
                    document.documentElement.setAttribute('dark', '');
                    document.documentElement.setAttribute('it-theme', 'true');
                }
            },
            shortcut_custom_mini_player: function() {
                ImprovedTube.storage.mini_player = !ImprovedTube.storage.mini_player;

                ImprovedTube.mini_player();

                if (ImprovedTube.storage.mini_player === true) {
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
                }
            },
            shortcut_stats_for_nerds: function() {
                var player = document.querySelector('.html5-video-player');

                if (player.isVideoInfoVisible()) {
                    player.hideVideoInfo();
                } else {
                    player.showVideoInfo();
                }
            },
            shortcut_toggle_cards: function() {
                if(document.documentElement.getAttribute('it-player-hide-cards')) {
                    document.documentElement.removeAttribute('it-player-hide-cards');
                    return;
                }

                document.documentElement.setAttribute("it-player-hide-cards", true);
            },
            shortcut_popup_player: function() {
                ImprovedTube.createPopUpWindow();
            }
        };

        for (var featureName in features) {
            if (self.isset(self.storage[featureName])) {
                var data = JSON.parse(self.storage[featureName]) || {};

                if (
                    (data.keyCode === pressedKey.keyCode || !self.isset(data.keyCode)) &&
                    (data.shiftKey === pressedKey.shiftKey || !self.isset(data.shiftKey)) &&
                    (data.ctrlKey === pressedKey.ctrlKey || !self.isset(data.ctrlKey)) &&
                    (data.altKey === pressedKey.altKey || !self.isset(data.altKey)) &&
                    ((data.wheel > 0) === (wheel > 0) || !self.isset(data.wheel)) &&
                    ((hover === true && (data.wheel > 0) === (wheel > 0) && Object.keys(pressedKey).length === 0) || (self.isset(data.key) || self.isset(data.altKey) || self.isset(data.ctrlKey)))
                ) {
                    if (event.type === 'wheel' && self.isset(data.wheel) || event.type === 'keydown') {
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    features[featureName]();
                    
                    if (event.type === 'wheel' && self.isset(data.wheel) || event.type === 'keydown') {
                        return;
                    }
                }
            }
        }
    }


    /*-------------------------------------------------------------------------
    1.0 Keyboard
    -------------------------------------------------------------------------*/

    window.addEventListener('keydown', function(event) {
        // shortcut will be fired again and again until the key is released. To get rid of that: if (event.repeat) return;
        pressedKey = event;

        trigger(event);
    }, true);

    window.addEventListener('keyup', function(event) {
        pressedKey = {};
    }, true);


    /*-------------------------------------------------------------------------
    2.0 Mouse
    -------------------------------------------------------------------------*/

    window.addEventListener('mousemove', function(event) {
        var path = event.composedPath();

        hover = false;

        // TODO: refactor with elem.target.closest(".html5-video-player")
        for (let elem of path) {
            if (elem.classList && elem.classList.contains('html5-video-player')) {
                hover = true;
            }
        }
    }, {
        passive: false,
        capture: true
    });

    window.addEventListener('wheel', function(event) {
        wheel = event.deltaY;

        trigger(event);
    }, {
        passive: false,
        capture: true
    });
};


/*------------------------------------------------------------------------------
8.0 BLACKLIST
--------------------------------------------------------------------------------
TODO: CONNECT & TEST
------------------------------------------------------------------------------*/

document.addEventListener('ImprovedTubeBlacklist', function(event) {
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
    if (!ImprovedTube.isset(ImprovedTube.storage.blacklist.channels) ||
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
                        video_id = location.href.replace(/https:\/\/www.youtube.com\/(channel|user|c)\//g, '').replace(/\/(.)+/g, '');

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
                    if (item.style && channel_href.indexOf(key) !== -1) {
                        item.style.opacity = '.1';
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

                item.style.opacity = '.1';
            }
        }
    }
};


/*------------------------------------------------------------------------------
9.0 ANALYZER
--------------------------------------------------------------------------------
TODO: CONNECT & TEST
------------------------------------------------------------------------------*/

document.addEventListener('ImprovedTubeAnalyzer', function() {
    if (items.analyzer_activation === true) {
        if (document.querySelector('ytd-channel-name a') && chrome && chrome.runtime) {
            chrome.runtime.sendMessage({
                name: 'improvedtube-analyzer',
                value: document.querySelector('ytd-channel-name a').innerText
            });
        }
    }
});


/*------------------------------------------------------------------------------
10.0 SETTINGS
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
10.1 IMPROVEDTUBE ICON
------------------------------------------------------------------------------*/

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

ImprovedTube.improvedtubeYoutubeIcon = function() {
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

                    button.classList.remove('it-btn--dragging');

                    window.removeEventListener('mousemove', move);

                    localStorage.setItem('IT_ICON', JSON.stringify({
                        x: button.offsetLeft,
                        y: button.offsetTop
                    }));

                    setTimeout(function() {
                        button.style.pointerEvents = '';
                    });

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
                            if (event.clientY - Number(button.dataset.y) >= 12) {
                                button.style.top = event.clientY - Number(button.dataset.y) + 'px';
                            } else {
                                button.style.top = '12px';
                            }
                        } else {
                            if (event.clientY + 44 - Number(button.dataset.y) <= window.innerHeight) {
                                button.style.top = event.clientY - Number(button.dataset.y) + 'px';
                            } else {
                                button.style.top = 'calc(100vh - 44px)';
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

/*------------------------------------------------------------------------------
10.2 IMPROVEDTUBE BUTTON (SIDEBAR)
------------------------------------------------------------------------------*/
/*
ImprovedTube.improvedtube_youtube_sidebar_button_wait = false;

ImprovedTube.improvedtubeYoutubeSidebarButton = function() {
    if (window.self !== window.top) {
        return false;
    }

    if (
        ImprovedTube.storage.improvedtube_youtube_sidebar_button_wait === false &&
        document.querySelector('.improvedtube-sidebar-a')
    ) {
        document.querySelector('.improvedtube-sidebar-a').remove();
    }

    if (this.improvedtube_youtube_sidebar_button_wait === false) {
        this.improvedtube_youtube_sidebar_button_wait = setInterval(function() {
            var second_section = document.querySelector('#guide ytd-guide-collapsible-section-entry-renderer');

            if (second_section && !document.querySelector('.improvedtube-sidebar-a')) {
                var a = document.createElement('a');

                a.className = 'improvedtube-sidebar-a';
                a.href = 'https://www.youtube.com/improvedtube';
                a.innerText = 'ImprovedTube';

                second_section.parentNode.insertBefore(a, second_section);
            }
        }, 250);
    }
};

/*------------------------------------------------------------------------------
10.3 IMPROVEDTUBE PLAYER BUTTONS
------------------------------------------------------------------------------*/
/*
ImprovedTube.improvedtube_youtube_player_buttons_wait = false;

ImprovedTube.improvedtubeYoutubePlayerButtons = function() {
    if (window.self !== window.top) {
        return false;
    }

    if (this.improvedtube_youtube_player_buttons_wait === false) {
        this.improvedtube_youtube_player_buttons_wait = setInterval(function() {
            var second_section = document.querySelector('#info #menu-container.ytd-video-primary-info-renderer');

            if (second_section && !document.querySelector('.improvedtube-player-button')) {
                var screenshot_button = document.createElement('button'),
                    pip_button = document.createElement('button');

                screenshot_button.className = 'improvedtube-player-button';
                screenshot_button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></svg>';
                screenshot_button.dataset.tooltip = 'Screenshot';
                screenshot_button.onclick = ImprovedTube.screenshot;

                pip_button.className = 'improvedtube-player-button';
                pip_button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z"></svg>';
                pip_button.dataset.tooltip = 'Picture in picture';
                pip_button.onclick = function() {
                    var video = document.querySelector('#movie_player video');

                    if (video) {
                        video.requestPictureInPicture();
                    }
                };

                second_section.parentNode.insertBefore(screenshot_button, second_section);
                second_section.parentNode.insertBefore(pip_button, second_section);
            }
        }, 250);
    }
};


/*-----------------------------------------------------------------------------
10.4 DELETE YOUTUBE COOKIES
-----------------------------------------------------------------------------*/

ImprovedTube.deleteYoutubeCookies = function() {
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
10.5 YOUTUBE LANGUAGE
-----------------------------------------------------------------------------*/

ImprovedTube.youtubeLanguage = function() {
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





/*------------------------------------------------------------------------------
0.0 PAGE UPDATE LISTENER
------------------------------------------------------------------------------*/

ImprovedTube.pageUpdateListener = function() {
    console.log('pageUpdateListener');

    window.addEventListener('yt-page-data-updated', function() {
        console.log('yt-page-data-updated');

        ImprovedTube.played_before_blur = false;

        ImprovedTube.pageType();
        ImprovedTube.youtubeHomePage();
        ImprovedTube.collapseOfSubscriptionSections();
        ImprovedTube.markWatchedVideos();
        ImprovedTube.hdThumbnails();
        ImprovedTube.hideThumbnailOverlay();

        ImprovedTube.channelDefaultTab();

        ImprovedTube.videoPageUpdate();

        ImprovedTube.blacklist();

        ImprovedTube.improvedtubeYoutubeIcon();
        //ImprovedTube.improvedtubeYoutubeSidebarButton();
        //ImprovedTube.improvedtubeYoutubePlayerButtons();
    });
};

ImprovedTube.videoPageUpdate = function() {
    if (this.page_type === 'video') {
        console.log('videoPageUpdate');

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

        ImprovedTube.initialVideoUpdateDone = true;

        this.forcedTheaterMode();
        this.playerHdThumbnail();
        this.alwaysShowProgressBar();
        this.livechat();
        this.relatedVideos();
        this.howLongAgoTheVideoWasUploaded();
        this.channelVideosCount();
        this.comments();

        this.upNextAutoplay();
        this.playerAutofullscreen();
        this.playerScreenshotButton();
        this.playerRepeatButton();
        this.playerRotateButton();
        this.playerPopupButton();
        this.playerControls();

        if (/[?&]list=([^&]+).*$/.test(location.href)) {
            this.playlistUpNextAutoplay();
            this.playlistRepeat();
            this.playlistShuffle();
            this.playlistReverse();
        }
    }
};


/*------------------------------------------------------------------------------
0.0 PLAYER UPDATE
------------------------------------------------------------------------------*/

ImprovedTube.video_src = false;
ImprovedTube.initialVideoUpdateDone = false;

ImprovedTube.videoUpdated = function() {
    this.playerAds();

    if (ImprovedTube.initialVideoUpdateDone !== true) {
        this.playerQuality();
        this.playerPlaybackSpeed();
        this.playerVolume();
        this.playlistUpNextAutoplay();
    }
};

ImprovedTube.timeupdate = function() {
    if (ImprovedTube.video_src !== this.src) {
        ImprovedTube.video_src = this.src;

        ImprovedTube.videoUpdated();
    } else if (ImprovedTube.latestVideoDuration !== this.duration) {
        ImprovedTube.latestVideoDuration = this.duration;

        ImprovedTube.playerQuality();
        ImprovedTube.playerPlaybackSpeed();
        ImprovedTube.playerVolume();
        ImprovedTube.playlistUpNextAutoplay();
    }
};

ImprovedTube.ended = function() {};

ImprovedTube.latestVideoDuration = 0;

ImprovedTube.playerUpdate = function() {
    console.log('playerUpdate');

    this.playerPlaybackSpeed();
    this.subtitles();
    this.playerQuality();
    this.playerVolume();
    this.playlistUpNextAutoplay();

    if (location.href.indexOf('/embed/') === -1) {
        this.mini_player();
    }
};


/*------------------------------------------------------------------------------
0.0 DOM CONTENT LOADED
------------------------------------------------------------------------------*/

ImprovedTube.DOMContentLoaded = function() {
    window.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded');

        ImprovedTube.youtubeHomePage();
        ImprovedTube.collapseOfSubscriptionSections();
        ImprovedTube.addScrollToTop();
        ImprovedTube.confirmationBeforeClosing();
        ImprovedTube.markWatchedVideos();
        ImprovedTube.hdThumbnails();
        ImprovedTube.hideThumbnailOverlay();

        ImprovedTube.channelDefaultTab();

        ImprovedTube.myColors();
        ImprovedTube.bluelight();
        ImprovedTube.dim();
        ImprovedTube.font();
        ImprovedTube.themes();

        ImprovedTube.videoPageUpdate();

        ImprovedTube.blacklist();

        ImprovedTube.improvedtubeYoutubeIcon();
        //ImprovedTube.improvedtubeYoutubeSidebarButton();
        //ImprovedTube.improvedtubeYoutubePlayerButtons();

        ImprovedTube.pageUpdateListener();
    });
};


/*------------------------------------------------------------------------------
0.0 PAGE TYPE
------------------------------------------------------------------------------*/

ImprovedTube.video_url = false;
ImprovedTube.page_type = false;

ImprovedTube.pageType = function() {
    var href = location.href,
        type = '';

    if (location.pathname === '/') {
        type = 'home';
    } else if (/\/watch\?/.test(href)) {
        type = 'video';
    } else if (/\/channel|user|c\//.test(href)) {
        type = 'channel';
    }

    this.page_type = type;

    document.documentElement.setAttribute('it-page-type', type);
};


/*------------------------------------------------------------------------------
0.0 ONFOCUS
------------------------------------------------------------------------------*/

ImprovedTube.focus = false;
ImprovedTube.played_before_blur = false;

ImprovedTube.onfocus = function() {
    this.onlyOnePlayerInstancePlaying();
    this.playerAutopauseWhenSwitchingTabs();
};


/*------------------------------------------------------------------------------
0.0 ONPLAY
------------------------------------------------------------------------------*/

ImprovedTube.onplay = function() {
    HTMLMediaElement.prototype.play = (function(original) {
        return function() {
            this.removeEventListener('timeupdate', ImprovedTube.timeupdate);
            this.addEventListener('timeupdate', ImprovedTube.timeupdate);

            this.removeEventListener('ended', ImprovedTube.ended, true);
            this.addEventListener('ended', ImprovedTube.ended, true);

            ImprovedTube.autoplay(this);
            ImprovedTube.playerLoudnessNormalization();

            if (ImprovedTube.video_url !== location.href) {
                ImprovedTube.video_url = location.href;

                ImprovedTube.playerUpdate();
            }

            return original.apply(this, arguments);
        }
    })(HTMLMediaElement.prototype.play);
};


/*------------------------------------------------------------------------------
0.0 ONKEYDOWN
------------------------------------------------------------------------------*/

ImprovedTube.onkeydown = function() {
    window.addEventListener('keydown', function() {
        if (
            document.querySelector('.html5-video-player') &&
            document.querySelector('.html5-video-player').classList.contains('ad-showing') === false
        ) {
            ImprovedTube.allow_autoplay = true;
        }
    }, true);
};


/*------------------------------------------------------------------------------
0.0 ONMOUSEDOWN
------------------------------------------------------------------------------*/

ImprovedTube.onmousedown = function(event) {
    window.addEventListener('mousedown', function(event) {
        var path = event.composedPath();

        for (var i = 0, l = path.length; i < l; i++) {
            if (
                document.querySelector('.html5-video-player') &&
                document.querySelector('.html5-video-player').classList.contains('ad-showing') === false &&
                path[i].classList &&
                (
                    path[i].classList.contains('html5-main-video') ||
                    path[i].classList.contains('ytp-play-button')
                )
            ) {
                ImprovedTube.allow_autoplay = true;
            }
        }
    }, true);
};

ImprovedTube.location = function() {
    var value = this.storage.default_content_country;

    if (this.isset(value) && value !== 'default') {
        this.setCookie('s_gl', value);
    }
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

ImprovedTube.createPlayerButton = function (node, options) {
    var controls = document.querySelector('.html5-video-player .ytp-left-controls');

    if (controls) {
        var button = document.createElement('button');

        button.className = 'ytp-button it-player-button';

        button.dataset.title = options.title;

        button.addEventListener('mouseover', function () {
            var tooltip = document.createElement('div'),
                rect = this.getBoundingClientRect();

            tooltip.className = 'it-player-button--tooltip';

            tooltip.style.left = rect.left + rect.width / 2 + 'px';
            tooltip.style.top = rect.top - 8 + 'px';

            tooltip.textContent = this.dataset.title;

            function mouseleave() {
                tooltip.remove();

                this.removeEventListener('mouseleave', mouseleave);
            }

            this.addEventListener('mouseleave', mouseleave);

            document.body.appendChild(tooltip);
        });

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

        controls.insertBefore(button, controls.childNodes[3]);
    }
};

ImprovedTube.reverse = function(parent) {
    for (var i = 1, l = parent.childNodes.length; i < l; i++) {
        parent.insertBefore(parent.childNodes[i], parent.firstChild);
    }
};


/*------------------------------------------------------------------------------
0.0 INITIALIZATION
------------------------------------------------------------------------------*/

ImprovedTube.init = function() {
    console.log('init');

    this.location();
    this.playerH264();
    this.player60fps();
    this.playerSDR();
    this.pageType();
    this.shortcuts();
    this.DOMContentLoaded();
    this.onplay();
    this.onkeydown();
    this.onmousedown();

    window.addEventListener('load', function() {
        console.log('load');

        ImprovedTube.hdThumbnails();
        ImprovedTube.hideThumbnailOverlay();
        ImprovedTube.channelDefaultTab();
    });
};
