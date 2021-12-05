/*------------------------------------------------------------------------------
>>> TABLE OF CONTENTS:
--------------------------------------------------------------------------------
1.0 Global variable
2.0 Initialization
3.0 
4.0 Features
    4.1.0 General
      4.1.1 YouTube home page
      4.1.2 Collapse of subscription sections
      4.1.3 Add "Scroll to top"
      4.1.4 Confirmation before closing
      4.1.5 Mark watched videos
      4.1.6 Only one player instance playing
      4.1.7 HD thumbnails
    4.2.0 Appearance
      4.2.1 Player
        4.2.1.1 Player size
        4.2.1.2 Forced theater mode
        4.2.1.3 HD thumbnail
        4.2.1.4 Always show progress bar
        4.2.1.5 Video remaining duration
      4.2.2 Sidebar
        4.2.2.1 Livechat
        4.2.2.2 Related videos
      4.2.3 Details
        4.2.3.1 How long ago the video was uploaded
        4.2.3.2 Show channel videos count
      4.2.5 Comments
    4.3.0 Themes
      4.3.1 My colors
      4.3.2 Bluelight
      4.3.3 Dim
      4.3.4 Font
      4.3.5 Themes
      4.3.6 Schedule
    4.4.0 Player
      4.4.1 Autoplay
      4.4.2 Autopause when switching tabs
      4.4.3 Forced playback speed
      4.4.4 Subtitles
      4.4.5 Up next autoplay
      4.4.6 Ads
      4.4.7 Custom mini-player
      4.4.8 Auto fullscreen
      4.4.9 Quality
      4.4.10 Codec h.264
      4.4.11 Allow 60fps
      4.4.12 Forced volume
      4.4.13 Loudness normalization
      4.4.14 Screenshot
      4.4.15 Repeat
      4.4.16 Rotate
      4.4.17 Popup player
      4.4.18 Force SDR
      4.4.19 Hide controls
    4.5.0 Playlist
      4.5.1 Up next autoplay
      4.5.2 Reverse
      4.5.3 Repeat
      4.5.4 Shuffle
    4.6.0 Channel
      4.6.1 Default channel tab
    4.7.0 Shortcuts
        4.7.1 Quality
        4.7.2 Picture in Picture
        4.7.3 Toggle control
        4.7.4 Play / pause
        4.7.5 Stop
        4.7.6 Toggle autoplay
        4.7.7 Next videos
        4.7.8 Previous video
        4.7.9 Seek backward
        4.7.10 Seek forward
        4.7.11 Seek next chapter
        4.7.12 Seek previous chapter
        4.7.13 Increase volume
        4.7.14 Decrease volume
        4.7.15 Screenshot
        4.7.16 Increase playback speed
        4.7.17 Decrease playback speed
        4.7.18 Go to search box
        4.7.19 Activate fullscreen
        4.7.20 Activate captions
        4.7.21 Like
        4.7.22 Dislike
        4.7.23 Subscribe
        4.7.24 Dark theme
        4.7.25 Custom mini player
        4.7.26 Stats for nerds
        4.7.27 Toggle cards
        4.7.28 Popup player
    4.8.0 Blacklist
    4.9.0 Analyzer
    4.10.0 Settings
       4.10.1 ImprovedTube icon
       4.10.2 ImprovedTube player buttons
       4.10.3 Delete YouTube cookies
       4.10.4 YouTube language
       4.10.5 Default content country
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
1.0 GLOBAL VARIABLE
--------------------------------------------------------------------------------
The variable "ImprovedTube" is used on the YouTube side.
------------------------------------------------------------------------------*/

var ImprovedTube = {
    elements: `{
        buttons: {},
        masthead: {},
        playlist: {},
        livechat: {},
        related: {},
        comments: {},
        collapse_of_subscription_sections: [],
        mark_watched_videos: [],
        blacklist_buttons: []
    }`,
    regex: `{
        channel: new RegExp('\/(user|channel|c)\/'),
        channel_home_page: new RegExp('\/(user|channel|c)\/.+(\/featured)?\/?$'),
        channel_home_page_postfix: new RegExp('\/(featured)?\/?$'),
        thumbnail_quality: new RegExp('(default\.jpg|mqdefault\.jpg|hqdefault\.jpg|hq720\.jpg|sddefault\.jpg|maxresdefault\.jpg)+'),
        video_id: new RegExp('[?&]v=([^&]+)'),
        channel_link: new RegExp('https:\/\/www.youtube.com\/(channel|user|c)\/')
    }`,
    video_src: false,
    initialVideoUpdateDone: false,
    latestVideoDuration: 0,
    video_url: false,
    focus: false,
    played_before_blur: false,
    played_time: 0,
    allow_autoplay: false,
    mini_player__mode: false,
    mini_player__move: false,
    mini_player__cursor: '""',
    mini_player__x: 0,
    mini_player__y: 0,
    mini_player__max_x: 0,
    mini_player__max_y: 0,
    mini_player__original_width: 0,
    mini_player__original_height: 0,
    mini_player__width: 200,
    mini_player__height: 160,
    miniPlayer_mouseDown_x: 0,
    miniPlayer_mouseDown_y: 0,
    mini_player__player_offset_x: 0,
    mini_player__player_offset_y: 0,
    miniPlayer_resize_offset: 16,
    playlistReversed: false,
    status_timer: false
};


/*------------------------------------------------------------------------------
2.0 INITIALIZATION
--------------------------------------------------------------------------------
The first function called on the YouTube side.
------------------------------------------------------------------------------*/

ImprovedTube.init = function () {
    window.addEventListener('DOMContentLoaded', function () {
        ImprovedTube.addScrollToTop();
        ImprovedTube.confirmationBeforeClosing();
        ImprovedTube.dim();
        ImprovedTube.font();
        ImprovedTube.themes();
        //ImprovedTube.improvedtubeYoutubeSidebarButton();
        //ImprovedTube.improvedtubeYoutubePlayerButtons();
    });

    window.addEventListener('yt-page-data-updated', function () {
        ImprovedTube.pageType();
        ImprovedTube.videoPageUpdate();
        //ImprovedTube.improvedtubeYoutubeSidebarButton();
        //ImprovedTube.improvedtubeYoutubePlayerButtons();
    });

    /*window.addEventListener('resize', function() {
        setTimeout(function() {
            ImprovedTube.playerSize();
        }, 100);
    });*/

    this.bluelight();
    this.playerH264();
    this.player60fps();
    this.playerSDR();
    this.shortcuts();
    this.playerOnPlay();
    this.onkeydown();
    this.onmousedown();
    this.defaultContentCountry(false);
    this.youtubeLanguage(false);

    if (document.body) {
        this.childHandler(document.body);
    }

    this.observer = new MutationObserver(function (mutationList) {
        for (var i = 0, l = mutationList.length; i < l; i++) {
            var mutation = mutationList[i];

            if (mutation.type === 'childList') {
                for (var j = 0, k = mutation.addedNodes.length; j < k; j++) {
                    ImprovedTube.childHandler(mutation.addedNodes[j]);
                }
            }
        }
    });

    this.observer.observe(document, {
        attributes: false,
        childList: true,
        subtree: true
    });
};


/*------------------------------------------------------------------------------
3.0
--------------------------------------------------------------------------------

------------------------------------------------------------------------------*/

ImprovedTube.childHandler = function (node) {
    var children = node.children;

    this.ytElementsHandler(node);

    if (children) {
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i];

            ImprovedTube.childHandler(child);
        }
    }
};

ImprovedTube.ytElementsHandler = function (node) {
    var name = node.nodeName,
        id = node.id;

    if (name === 'YTD-WATCH-FLEXY') {
        ImprovedTube.elements.ytd_watch = node;
        ImprovedTube.elements.ytd_player = node.querySelector('ytd-player');

        if (ImprovedTube.elements.ytd_watch && ImprovedTube.elements.ytd_player) {
            ImprovedTube.initPlayer();
        }

        if (
            ImprovedTube.isset(ImprovedTube.storage.player_size) &&
            ImprovedTube.storage.player_size !== 'do_not_change'
        ) {
            node.calculateCurrentPlayerSize_ = function () {
                if (!this.theater && ImprovedTube.elements.player) {
                    if (this.updateStyles) {
                        this.updateStyles({
                            '--ytd-watch-flexy-width-ratio': 1,
                            '--ytd-watch-flexy-height-ratio': 0.5625
                        });

                        this.updateStyles({
                            '--ytd-watch-width-ratio': 1,
                            '--ytd-watch-height-ratio': 0.5625
                        });
                    }

                    return {
                        width: ImprovedTube.elements.player.offsetWidth,
                        height: Math.round(ImprovedTube.elements.player.offsetWidth / (16 / 9))
                    };
                }

                return {
                    width: NaN,
                    height: NaN
                };
            };

            node.calculateNormalPlayerSize_ = node.calculateCurrentPlayerSize_;
        }

        new MutationObserver(function (mutationList) {
            for (var i = 0, l = mutationList.length; i < l; i++) {
                var mutation = mutationList[i];

                if (mutation.type === 'attributes') {
                    if (mutation.attributeName === 'theater') {
                        setTimeout(function () {
                            ImprovedTube.playerSize();
                        }, 100);
                    }
                }
            }
        }).observe(node, {
            attributes: true,
            attributeFilter: ['theater'],
            childList: false,
            subtree: false
        });
    } else if (name === 'YTD-MASTHEAD') {
        ImprovedTube.elements.masthead = {
            start: node.querySelector('#start'),
            end: node.querySelector('#end'),
            logo: node.querySelector('a#logo')
        };

        ImprovedTube.improvedtubeYoutubeIcon();
        ImprovedTube.youtubeHomePage();
    } else if (name === 'YTD-GUIDE-SECTION-RENDERER') {
        if (ImprovedTube.elements.hasOwnProperty('sidebar_section') === false) {
            ImprovedTube.elements.sidebar_section = node;

            ImprovedTube.improvedtubeYoutubeIcon();
        }
    } else if (name === 'YTD-ITEM-SECTION-RENDERER') {
        ImprovedTube.collapseOfSubscriptionSections(node);
    } else if (id === 'movie_player') {
        ImprovedTube.elements.ytd_player = document.querySelector('ytd-player');
        ImprovedTube.elements.player = node;
        ImprovedTube.elements.video = node.querySelector('video');
        ImprovedTube.elements.player_left_controls = node.querySelector('.ytp-left-controls');
        ImprovedTube.elements.player_thumbnail = node.querySelector('.ytp-cued-thumbnail-overlay-image');
        ImprovedTube.elements.player_subtitles_button = node.querySelector('.ytp-subtitles-button');

        if (ImprovedTube.elements.ytd_watch && ImprovedTube.elements.ytd_player) {
            ImprovedTube.initPlayer();
        }

        ImprovedTube.playerSize();

        new MutationObserver(function (mutationList) {
            for (var i = 0, l = mutationList.length; i < l; i++) {
                var mutation = mutationList[i];

                if (mutation.type === 'attributes') {
                    if (mutation.attributeName === 'style') {
                        ImprovedTube.playerHdThumbnail();
                    }
                }
            }
        }).observe(ImprovedTube.elements.player_thumbnail, {
            attributes: true,
            attributeFilter: ['style'],
            childList: false,
            subtree: false
        });

        document.dispatchEvent(new CustomEvent('improvedtube-player-loaded'));
    } else if (name === 'DIV' && node.className.indexOf('ytp-ad-player-overlay') !== -1) {
        ImprovedTube.playerAds(node);
    } else if (name === 'YTD-TOGGLE-BUTTON-RENDERER') {
        if (
            node.parentComponent &&
            node.parentComponent.nodeName === 'YTD-MENU-RENDERER' &&
            node.parentComponent.parentComponent &&
            node.parentComponent.parentComponent.nodeName === 'YTD-PLAYLIST-PANEL-RENDERER'
        ) {
            var index = Array.prototype.indexOf.call(node.parentNode.children, node);

            if (index === 0) {
                ImprovedTube.elements.playlist.repeat_button = node;

                ImprovedTube.playlistRepeat();

                ImprovedTube.elements.playlist.actions = node.parentNode.parentNode.parentNode.parentNode;

                ImprovedTube.playlistReverse();
            } else if (index === 1) {
                ImprovedTube.elements.playlist.shuffle_button = node;

                ImprovedTube.playlistShuffle();

                ImprovedTube.elements.playlist.actions = node.parentNode.parentNode.parentNode.parentNode;

                ImprovedTube.playlistReverse();
            }
        }
    } else if (id === 'chat') {
        ImprovedTube.elements.livechat.button = node.querySelector('ytd-toggle-button-renderer');

        ImprovedTube.livechat();
    } else if (id === 'related' && node.className.indexOf('ytd-watch-flexy') !== -1) {
        ImprovedTube.elements.related.container = node;

        ImprovedTube.relatedVideos();
    } else if (name === 'YTD-VIDEO-PRIMARY-INFO-RENDERER') {
        ImprovedTube.elements.video_title = node.querySelector('.title.ytd-video-primary-info-renderer');

        ImprovedTube.improvedtubeYoutubeIcon();
    } else if (name === 'YTD-VIDEO-SECONDARY-INFO-RENDERER') {
        ImprovedTube.elements.yt_channel_name = node.querySelector('ytd-channel-name');
        ImprovedTube.elements.yt_channel_link = node.querySelector('ytd-channel-name a');
        ImprovedTube.howLongAgoTheVideoWasUploaded();
        ImprovedTube.channelVideosCount();
    } else if (name === 'YTD-SUBSCRIBE-BUTTON-RENDERER') {
        if (node.className.indexOf('ytd-c4-tabbed-header-renderer') !== -1) {
            ImprovedTube.blacklist('channel', node);
        }

        ImprovedTube.elements.subscribe_button = node;
    } else if (name === 'YTD-COMMENTS-HEADER-RENDERER') {
        ImprovedTube.elements.comments.container = node;

        ImprovedTube.comments();
    } else if (name === 'META') {
        if (node.getAttribute('itemprop') === 'genre') {
            ImprovedTube.genre = node.content;
        }
    } else if (name === 'A' && node.href) {
        if (id === 'logo') {
            //ImprovedTube.youtubeHomePage();
        }

        ImprovedTube.channelDefaultTab(node);
        ImprovedTube.markWatchedVideos(node);

        if (node.className.indexOf('ytd-thumbnail') !== -1) {
            ImprovedTube.blacklist('video', node);
        }

        if (node.href.match(ImprovedTube.regex.channel)) {
            ImprovedTube.blacklist('channel', node);
        }
    } else if (name === 'IMG') {
        if (node.src) {
            ImprovedTube.thumbnailsQuality(node);
        } else {
            var observer = new MutationObserver(function (mutationList) {
                for (var i = 0, l = mutationList.length; i < l; i++) {
                    var mutation = mutationList[i];

                    if (mutation.type === 'attributes') {
                        if (mutation.attributeName === 'src') {
                            ImprovedTube.thumbnailsQuality(mutation.target);
                        }
                    }
                }

                observer.disconnect();
            });

            observer.observe(node, {
                attributes: true,
                attributeFilter: ['src'],
                childList: false,
                subtree: false
            });
        }
    }
};

ImprovedTube.pageType = function () {
    if (location.pathname === '/') {
        document.documentElement.dataset.pageType = 'home';
    } else if (/\/subscriptions\?/.test(location.href)) {
        document.documentElement.dataset.pageType = 'subscriptions';
    } else if (/\/watch\?/.test(location.href)) {
        document.documentElement.dataset.pageType = 'video';
    } else if (/\/channel|user|c\//.test(location.href)) {
        document.documentElement.dataset.pageType = 'channel';
    } else {
        document.documentElement.dataset.pageType = 'other';
    }
};

ImprovedTube.pageOnFocus = function () {
    this.onlyOnePlayerInstancePlaying();
    this.playerAutopauseWhenSwitchingTabs();
};

ImprovedTube.videoPageUpdate = function () {
    if (document.documentElement.dataset.pageType === 'video') {
        var video_id = this.getParam(new URL(location.href).search.substr(1), 'v');

        if (this.storage.track_watched_videos === true) {
            if (video_id) {
                document.dispatchEvent(new CustomEvent('ImprovedTubeWatched', {
                    detail: {
                        action: 'set',
                        id: video_id,
                        title: document.title
                    }
                }));
            }
        }

        this.initialVideoUpdateDone = true;

        this.howLongAgoTheVideoWasUploaded();
        this.channelVideosCount();

        this.upNextAutoplay();
        this.playerAutofullscreen();
        this.playerScreenshotButton();
        this.playerRepeatButton();
        this.playerRotateButton();
        this.playerPopupButton();
        this.playerControls();

        if (/[?&]list=([^&]+).*$/.test(location.href)) {
            this.playlistRepeat();
            this.playlistShuffle();
            this.playlistReverse();
        }
    }
};

ImprovedTube.playerOnPlay = function () {
    HTMLMediaElement.prototype.play = (function (original) {
        return function () {
            this.removeEventListener('loadedmetadata', ImprovedTube.playerOnLoadedMetadata);
            this.addEventListener('loadedmetadata', ImprovedTube.playerOnLoadedMetadata);

            this.removeEventListener('timeupdate', ImprovedTube.playerOnTimeUpdate);
            this.addEventListener('timeupdate', ImprovedTube.playerOnTimeUpdate);

            this.removeEventListener('pause', ImprovedTube.playerOnPause, true);
            this.addEventListener('pause', ImprovedTube.playerOnPause, true);

            this.removeEventListener('ended', ImprovedTube.playerOnEnded, true);
            this.addEventListener('ended', ImprovedTube.playerOnEnded, true);

            ImprovedTube.autoplay(this);
            ImprovedTube.playerLoudnessNormalization();

            ImprovedTube.initPlayer();

            return original.apply(this, arguments);
        }
    })(HTMLMediaElement.prototype.play);
};

ImprovedTube.initPlayer = function () {
    if (ImprovedTube.elements.player && ImprovedTube.video_url !== location.href) {
        ImprovedTube.video_url = location.href;
        ImprovedTube.played_before_blur = false;

        delete ImprovedTube.elements.player.dataset.defaultQuality;

        ImprovedTube.forcedPlayVideoFromTheBeginning();
        ImprovedTube.forcedTheaterMode();
        ImprovedTube.playerPlaybackSpeed(false);
        ImprovedTube.subtitles();
        ImprovedTube.subtitlesLanguage();
        ImprovedTube.subtitlesFontFamily();
        ImprovedTube.subtitlesFontColor();
        ImprovedTube.subtitlesFontSize();
        ImprovedTube.subtitlesBackgroundColor();
        ImprovedTube.subtitlesWindowColor();
        ImprovedTube.subtitlesWindowOpacity();
        ImprovedTube.subtitlesCharacterEdgeStyle();
        ImprovedTube.subtitlesFontOpacity();
        ImprovedTube.subtitlesBackgroundOpacity();
        ImprovedTube.playerQuality();
        ImprovedTube.playerVolume();

        if (location.href.indexOf('/embed/') === -1) {
            ImprovedTube.miniPlayer();
        }
    }
};

ImprovedTube.playerOnLoadedMetadata = function () {
    setTimeout(function () {
        ImprovedTube.playerSize();
    }, 100);
};

ImprovedTube.playerOnTimeUpdate = function () {
    if (ImprovedTube.video_src !== this.src) {
        ImprovedTube.video_src = this.src;

        if (ImprovedTube.initialVideoUpdateDone !== true) {
            ImprovedTube.playerQuality();
        }
    } else if (ImprovedTube.latestVideoDuration !== this.duration) {
        ImprovedTube.latestVideoDuration = this.duration;

        ImprovedTube.playerQuality();
    }

    ImprovedTube.alwaysShowProgressBar();
    ImprovedTube.playerRemainingDuration();

    ImprovedTube.played_time += .25;
};

ImprovedTube.playerOnPause = function (event) {
    ImprovedTube.playlistUpNextAutoplay(event);

    if (ImprovedTube.elements.yt_channel_name) {
        document.dispatchEvent(new CustomEvent('analyzer', {
            detail: {
                name: ImprovedTube.elements.yt_channel_name.__data.tooltipText,
                time: ImprovedTube.played_time
            }
        }));
    }

    ImprovedTube.played_time = 0;
};

ImprovedTube.playerOnEnded = function (event) {
    ImprovedTube.playlistUpNextAutoplay(event);

    document.dispatchEvent(new CustomEvent('analyzer', {
        detail: {
            name: ImprovedTube.elements.yt_channel_name.__data.tooltipText,
            time: ImprovedTube.played_time
        }
    }));

    ImprovedTube.played_time = 0;
};

ImprovedTube.onkeydown = function () {
    window.addEventListener('keydown', function () {
        if (
            ImprovedTube.elements.player &&
            ImprovedTube.elements.player.className.indexOf('ad-showing') === -1
        ) {
            ImprovedTube.allow_autoplay = true;
        }
    }, true);
};

ImprovedTube.onmousedown = function (event) {
    window.addEventListener('mousedown', function (event) {
        if (ImprovedTube.elements.player && ImprovedTube.elements.player.className.indexOf('ad-showing') === -1) {
            var path = event.composedPath();

            for (var i = 0, l = path.length; i < l; i++) {
                if (
                    path[i].className &&
                    path[i].className.indexOf &&
                    (
                        path[i].className.indexOf('html5-main-video') !== -1 ||
                        path[i].className.indexOf('ytp-play-button') !== -1
                    )
                ) {
                    ImprovedTube.allow_autoplay = true;
                }
            }
        }
    }, true);
};

ImprovedTube.getCookieValueByName = function (name) {
    var match = document.cookie.match(new RegExp('([; ]' + name + '|^' + name + ')([^\\s;]*)', 'g'));

    if (match) {
        var cookie = match[0];

        return cookie.replace(name + '=', '').replace(' ', '');
    } else
        return '';
};

ImprovedTube.getParam = function (query, name) {
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

ImprovedTube.getParams = function (query) {
    var params = query.split('&'),
        result = {};

    for (var i = 0, l = params.length; i < l; i++) {
        params[i] = params[i].split('=');

        result[params[i][0]] = params[i][1];
    }

    return result;
};

ImprovedTube.setCookie = function (name, value) {
    var date = new Date();

    date.setTime(date.getTime() + 3.154e+10);

    document.cookie = name + '=' + value + '; path=/; domain=.youtube.com; expires=' + date.toGMTString();
};

ImprovedTube.createPlayerButton = function (options) {
    var controls = this.elements.player_left_controls;

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
            if (this.elements.buttons[options.id]) {
                this.elements.buttons[options.id].remove();
            }

            button.id = options.id;

            this.elements.buttons[options.id] = button;
        }

        if (options.child) {
            button.appendChild(options.child);
        }

        button.style.opacity = options.opacity || '.5';

        if (options.onclick) {
            button.onclick = options.onclick;
        }

        controls.insertBefore(button, controls.childNodes[3]);
    }
};

ImprovedTube.empty = function (element) {
    for (var i = element.childNodes.length - 1; i > -1; i--) {
        element.childNodes[i].remove();
    }
};

ImprovedTube.isset = function (variable) {
    return !(typeof variable === 'undefined' || variable === null || variable === 'null');
};

ImprovedTube.stopPropagation = function (event) {
    event.stopPropagation();
};

ImprovedTube.showStatus = function (value) {
    if (!this.elements.status) {
        this.elements.status = document.createElement('div');

        this.elements.status.id = 'it-status';
    }

    if (typeof value === 'number') {
        value = value.toFixed(2);
    }

    this.elements.status.textContent = value;

    if (ImprovedTube.status_timer) {
        clearTimeout(ImprovedTube.status_timer);
    }

    ImprovedTube.status_timer = setTimeout(function () {
        ImprovedTube.elements.status.remove();
    }, 500);

    this.elements.player.appendChild(this.elements.status);
};


/*------------------------------------------------------------------------------
4.0 FEATURES
--------------------------------------------------------------------------------

------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.1.0 GENERAL
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.1.1 YOUTUBE HOME PAGE
------------------------------------------------------------------------------*/

ImprovedTube.youtubeHomePage = function () {
    var element = this.elements.masthead.logo,
        option = this.storage.youtube_home_page;

    if (element) {
        if (this.isset(option)) {
            element.href = option;

            element.addEventListener('click', this.stopPropagation, true);
        } else {
            element.href = '/';

            element.removeEventListener('click', this.stopPropagation);
        }
    }
};


/*------------------------------------------------------------------------------
4.1.2 COLLAPSE OF SUBSCRIPTION SECTION
------------------------------------------------------------------------------*/

ImprovedTube.collapseOfSubscriptionSections = function (node) {
    if (this.isset(node) === false) {
        var sections = document.querySelectorAll('ytd-item-section-renderer');

        for (var i = 0, l = sections.length; i < l; i++) {
            this.collapseOfSubscriptionSections(sections[i]);
        }

        return;
    }

    if (this.storage.collapse_of_subscription_sections === true) {
        if (location.href.indexOf('feed/subscriptions') !== -1) {
            var h2 = node.querySelector('h2');

            if (!node.querySelector('.it-section-collapse') && h2) {
                var button = document.createElement('button'),
                    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
                    path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

                button.className = 'it-button-section-collapse';
                button.section = node;
                button.content = node.querySelector('.grid-subheader + #contents');

                button.addEventListener('click', function () {
                    var section = this.section;

                    if (section.className.indexOf('it-section-collapsed') === -1) {
                        this.content.style.height = this.content.offsetHeight + 'px';
                        this.content.style.transition = 'height 150ms';
                    }

                    setTimeout(function () {
                        section.classList.toggle('it-section-collapsed');
                    });
                });

                svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
                path.setAttributeNS(null, 'd', 'M7.4 15.4l4.6-4.6 4.6 4.6L18 14l-6-6-6 6z');

                svg.appendChild(path);

                button.appendChild(svg);

                h2.parentNode.insertBefore(button, h2.nextSibling);

                this.elements.collapse_of_subscription_sections.push(button);
            }
        }
    } else {
        var elements = this.elements.collapse_of_subscription_sections;

        for (var i = 0, l = elements.length; i < l; i++) {
            var element = elements[i];

            if (element.section) {
                element.section.classList.remove('it-section-collapsed');
            }

            if (element.content) {
                element.content.style.height = '';
                element.content.style.transition = '';
            }

            element.remove();
        }
    }
};


/*------------------------------------------------------------------------------
4.1.3 ADD "SCROLL TO TOP"
------------------------------------------------------------------------------*/

ImprovedTube.addScrollToTop = function () {
    if (this.storage.add_scroll_to_top === true) {
        var button = document.createElement('div'),
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        button.id = 'it-scroll-to-top';

        button.addEventListener('click', function () {
            window.scrollTo(0, 0);
        });

        button.scroll = function () {
            if (window.scrollY > window.innerHeight / 2) {
                document.documentElement.setAttribute('it-show-scroll-to-top', true);
            } else {
                document.documentElement.setAttribute('it-show-scroll-to-top', false);
            }
        };

        svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
        path.setAttributeNS(null, 'd', 'M13 19V7.8l4.9 5c.4.3 1 .3 1.4 0 .4-.5.4-1.1 0-1.5l-6.6-6.6a1 1 0 0 0-1.4 0l-6.6 6.6a1 1 0 1 0 1.4 1.4L11 7.8V19c0 .6.5 1 1 1s1-.5 1-1z');

        svg.appendChild(path);
        button.appendChild(svg);
        document.body.appendChild(button);

        window.addEventListener('scroll', button.scroll);

        this.elements.scroll_to_top = button;
    } else if (this.elements.scroll_to_top) {
        window.removeEventListener('scroll', this.elements.scroll_to_top.scroll);

        this.elements.scroll_to_top.remove();
    }
};


/*------------------------------------------------------------------------------
4.1.4 CONFIRMATION BEFORE CLOSING
------------------------------------------------------------------------------*/

ImprovedTube.confirmationBeforeClosing = function () {
    window.onbeforeunload = function () {
        if (ImprovedTube.storage.confirmation_before_closing === true) {
            return 'You have attempted to leave this page. Are you sure?';
        }
    };
};


/*------------------------------------------------------------------------------
4.1.5 MARK WATCHED VIDEOS
------------------------------------------------------------------------------*/

ImprovedTube.markWatchedVideos = function (node) {
    if (this.isset(node) === false) {
        var thumbnails = document.querySelectorAll('#thumbnail.ytd-thumbnail,.thumb-link');

        for (var i = 0, l = thumbnails.length; i < l; i++) {
            this.markWatchedVideos(thumbnails[i]);
        }

        return;
    }

    if (this.storage.mark_watched_videos === true) {
        if (
            node.id === 'thumbnail' && node.className.indexOf('ytd-thumbnail') !== -1 ||
            node.className.indexOf('thumb-link') !== -1
        ) {
            var button = document.createElement('button'),
                svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
                path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            button.className = 'it-mark-watched' + (this.storage.watched && this.storage.watched[this.getParam(new URL(node.href || 'https://www.youtube.com/').search.substr(1), 'v')] ? ' watched' : '');

            button.addEventListener('click', function (event) {
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

                    if (!ImprovedTube.storage.watched) {
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
                } catch (err) {}
            });

            svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
            path.setAttributeNS(null, 'd', 'M12 4.5C7 4.5 2.7 7.6 1 12a11.8 11.8 0 0022 0c-1.7-4.4-6-7.5-11-7.5zM12 17a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z');

            svg.appendChild(path);
            button.appendChild(svg);

            node.appendChild(button);

            this.elements.mark_watched_videos.push(button);
        }
    } else {
        var buttons = this.elements.mark_watched_videos;

        for (var i = 0, l = buttons.length; i < l; i++) {
            buttons[i].remove();
        }
    }
};

document.addEventListener('ImprovedTubeWatched', function (event) {
    if (chrome && chrome.runtime) {
        var action = event.detail.action,
            id = event.detail.id;

        if (!ImprovedTube.storage.watched || typeof ImprovedTube.storage.watched !== 'object') {
            ImprovedTube.storage.watched = {};
        }

        if (action === 'set') {
            ImprovedTube.storage.watched[id] = {
                title: event.detail.title
            };
        }

        if (action === 'remove') {
            delete ImprovedTube.storage.watched[id];
        }

        chrome.storage.local.set({
            watched: ImprovedTube.storage.watched
        });
    }
});


/*------------------------------------------------------------------------------
4.1.6 ONLY ONE PLAYER INSTANCE PLAYING
------------------------------------------------------------------------------*/

ImprovedTube.onlyOnePlayerInstancePlaying = function () {
    var player = ImprovedTube.elements.player;

    if (this.storage.only_one_player_instance_playing === true && this.focus === true && player) {
        if (ImprovedTube.played_before_blur === true) {
            player.playVideo();
        }

        document.dispatchEvent(new CustomEvent('ImprovedTubeOnlyOnePlayer'));
    }
};

document.addEventListener('ImprovedTubeOnlyOnePlayer', function (event) {
    if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage({
            name: 'only-one-player'
        });
    }
});


/*------------------------------------------------------------------------------
4.1.7 HD THUMBNAILS
------------------------------------------------------------------------------*/

ImprovedTube.thumbnailsQuality = function (node) {
    var option = this.storage.thumbnails_quality;

    if (this.isset(node) === false) {
        var thumbnails = document.querySelectorAll('img');

        for (var i = 0, l = thumbnails.length; i < l; i++) {
            this.thumbnailsQuality(thumbnails[i]);
        }

        return;
    }

    if (['default', 'mqdefault', 'hqdefault', 'sddefault', 'maxresdefault'].includes(option) === true) {
        if (!node.dataset.defaultSrc && this.regex.thumbnail_quality.test(node.src)) {
            node.dataset.defaultSrc = node.src;
            node.onload = function () {
                if (this.naturalHeight <= 90) {
                    this.src = this.dataset.defaultSrc;
                }
            };
            node.src = node.src.replace(this.regex.thumbnail_quality, option + '.jpg');
            node.onerror = function () {
                this.error = "";
                this.src = node.dataset.defaultSrc;
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.2.0 APPEARANCE
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.2.1 PLAYER
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.2.1.1 PLAYER SIZE
------------------------------------------------------------------------------*/

ImprovedTube.playerSize = function () {
    if (window.self === window.top) {
        if (this.storage.forced_theater_mode === true && this.storage.player_size === 'fit_to_window') {
            var button = document.querySelector('button.ytp-size-button'),
                container = document.getElementById('player-theater-container');

            if (button && (container && !container.firstChild)) {
                button.click();
            }
        }

        if (this.storage.player_size === 'fit_to_window' && this.elements.ytd_watch && this.elements.ytd_player) {
            var video = this.elements.video,
                aspect_ratio = video.videoWidth / video.videoHeight,
                width,
                height,
                max_height = window.innerHeight,
                style = this.elements.player_size_style || document.createElement('style');

            if (this.elements.ytd_watch.theater === true) {
                width = this.elements.ytd_player.offsetWidth;

                style.textContent = '[data-page-type="video"][it-player-size="fit_to_window"] ytd-app:not([player-fullscreen_]) ytd-watch-flexy[theater]:not([fullscreen]) video {';
            } else {
                width = this.elements.ytd_watch.offsetWidth;

                style.textContent = '[data-page-type="video"][it-player-size="fit_to_window"] ytd-app:not([player-fullscreen_]) ytd-watch-flexy:not([theater]):not([fullscreen]) video {';
            }

            height = width / aspect_ratio;

            if (height > max_height) {
                width -= (height - max_height) * aspect_ratio;
                height = max_height;
            }

            style.textContent += 'width:' + width + 'px !important;';
            style.textContent += 'height:' + height + 'px !important;';

            style.textContent += '}';

            this.elements.player_size_style = style;

            document.body.appendChild(style);

            setTimeout(function () {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        }
    }
};


/*------------------------------------------------------------------------------
4.2.1.2 FORCED THEATER MODE
------------------------------------------------------------------------------*/

ImprovedTube.forcedTheaterMode = function () {
    if (
        window.self === window.top &&
        this.storage.forced_theater_mode === true &&
        this.elements.ytd_watch &&
        this.elements.player
    ) {
        var button = this.elements.player.querySelector('button.ytp-size-button');

        if (button && this.elements.ytd_watch.theater === false) {
            document.cookie = 'wide=1;domain=.youtube.com';

            setTimeout(function () {
                button.click();
            }, 200);
        }
    }
};


/*------------------------------------------------------------------------------
4.2.1.3 HD THUMBNAIL
------------------------------------------------------------------------------*/

ImprovedTube.playerHdThumbnail = function () {
    if (this.storage.player_hd_thumbnail === true) {
        var thumbnail = ImprovedTube.elements.player_thumbnail;

        if (thumbnail.style.backgroundImage.indexOf('/hqdefault.jpg') !== -1) {
            thumbnail.style.backgroundImage = thumbnail.style.backgroundImage.replace('/hqdefault.jpg', '/maxresdefault.jpg');
        }
    }
};


/*------------------------------------------------------------------------------
4.2.1.4 ALWAYS SHOW PROGRESS BAR
------------------------------------------------------------------------------*/

ImprovedTube.alwaysShowProgressBar = function () {
    if (this.storage.always_show_progress_bar === true) {
        var player = ImprovedTube.elements.player;

        if (player && player.className.indexOf('ytp-autohide') !== -1) {
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
    }
};


/*------------------------------------------------------------------------------
4.2.1.5 VIDEO REMAINING DURATION
------------------------------------------------------------------------------*/

ImprovedTube.formatSecond = function (rTime) {
    var time = new Date(null);
    time.setSeconds(rTime);
    if (rTime / 3600 < 1) {
        return time.toISOString().substr(14, 5);
    } else {
        return time.toISOString().substr(11, 8);
    }
}

ImprovedTube.playerRemainingDuration = function () {
    var element = document.querySelector('.ytp-time-remaining-duration');
    if (this.storage.player_remaining_duration === true) {
        var player = ImprovedTube.elements.player;
        var rTime = ImprovedTube.formatSecond((player.getDuration() - player.getCurrentTime()).toFixed(0));
        if (!element) {
            var label = document.createElement('span');
            label.textContent = ' (-' + rTime + ')';
            label.className = 'ytp-time-remaining-duration';
            document.querySelector('.ytp-time-display').appendChild(label);
        } else {
            element.textContent = ' (-' + rTime + ')';
        }
    } else if (element) {
        element.remove();
    }
};


/*------------------------------------------------------------------------------
4.2.2 SIDEBAR
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.2.2.1 LIVECHAT
------------------------------------------------------------------------------*/

ImprovedTube.livechat = function () {
    if (this.storage.livechat === 'collapsed') {
        ImprovedTube.elements.livechat.button.click();
    }
};


/*------------------------------------------------------------------------------
4.2.2.2 RELATED VIDEOS
------------------------------------------------------------------------------*/

ImprovedTube.relatedVideos = function () {
    if (this.storage.related_videos === 'collapsed' && !this.elements.related.button) {
        var button = document.createElement('button'),
            content = document.createElement('span'),
            show_more = document.createElement('span'),
            show_less = document.createElement('span'),
            parent = this.elements.related.container;

        button.id = 'improvedtube-collapsed-related-videos';
        button.className = 'yt-uix-button yt-uix-button-size-default yt-uix-button-default comment-section-renderer-paginator yt-uix-sessionlink';
        button.onclick = function () {
            document.documentElement.classList.toggle('related-videos-collapsed');
        };

        content.className = 'yt-uix-button-content';

        show_more.className = 'show-more-text';
        show_more.textContent = 'Show more';

        show_less.className = 'show-less-text';
        show_less.textContent = 'Show less';

        content.appendChild(show_more);
        content.appendChild(show_less);
        button.appendChild(content);

        this.elements.related.button = button;

        parent.insertBefore(button, parent.children[0]);

        document.documentElement.classList.add('related-videos-collapsed');
    }
};


/*------------------------------------------------------------------------------
4.2.3 DETAILS
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.2.3.1 HOW LONG AGO THE VIDEO WAS UPLOADED
------------------------------------------------------------------------------*/

ImprovedTube.howLongAgoTheVideoWasUploaded = function () {
    if (this.storage.how_long_ago_the_video_was_uploaded === true && this.elements.yt_channel_name) {
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

        var api_key = this.storage.google_api_key,
            xhr = new XMLHttpRequest();

        if (typeof api_key !== 'string' || api_key === 0) {
            api_key = 'AIzaSyCXRRCFwKAXOiF1JkUBmibzxJF1cPuKNwA';
        }

        xhr.addEventListener('load', function () {
            var response = JSON.parse(this.responseText),
                element = ImprovedTube.elements.how_long_ago_the_video_was_uploaded || document.createElement('div');

            ImprovedTube.empty(element);

            if (response.error) {
                element.appendChild(document.createTextNode('• Error: ' + response.error.code));
            } else {
                element.appendChild(document.createTextNode('• ' + timeSince(response.items[0].snippet.publishedAt)));
            }

            element.className = 'it-how-long-ago-the-video-was-uploaded';

            ImprovedTube.elements.how_long_ago_the_video_was_uploaded = element;

            document.querySelector('#info #info-text').appendChild(element);
        });

        xhr.open('GET', 'https://www.googleapis.com/youtube/v3/videos?id=' + this.getParam(location.href.slice(location.href.indexOf('?') + 1), 'v') + '&key=' + api_key + '&part=snippet', true);
        xhr.send();
    }
};


/*------------------------------------------------------------------------------
4.2.3.2 SHOW CHANNEL VIDEOS COUNT
------------------------------------------------------------------------------*/

ImprovedTube.channelVideosCount = function () {
    if (this.storage.channel_videos_count === true && this.elements.yt_channel_link) {
        var xhr = new XMLHttpRequest();

        xhr.addEventListener('load', function () {
            var response = JSON.parse(this.responseText),
                parent = document.querySelector('#meta ytd-channel-name + yt-formatted-string'),
                element = ImprovedTube.elements.channel_videos_count || document.createElement('div');

            ImprovedTube.empty(element);

            if (response.error) {
                element.appendChild(document.createTextNode('Error: ' + response.error.code + ' •'));
            } else {
                element.appendChild(document.createTextNode(response.items[0].statistics.videoCount + ' •'));
            }

            element.className = 'it-channel-videos-count';

            ImprovedTube.elements.channel_videos_count = element;

            parent.appendChild(element);

            ImprovedTube.elements.channel_videos_count = element;
        });

        xhr.open('GET', 'https://www.googleapis.com/youtube/v3/channels?id=' + this.elements.yt_channel_link.href.replace('/channel/', '') + '&key=AIzaSyCXRRCFwKAXOiF1JkUBmibzxJF1cPuKNwA&part=statistics', true);
        xhr.send();
    }
};


/*------------------------------------------------------------------------------
4.2.4 COMMENTS
------------------------------------------------------------------------------*/

ImprovedTube.comments = function () {
    if (this.storage.comments === 'collapsed') {
        if (!this.elements.comments.button) {
            var button = document.createElement('button'),
                content = document.createElement('span'),
                show_more = document.createElement('span'),
                show_less = document.createElement('span');

            button.id = 'improvedtube-collapsed-comments';
            button.className = 'yt-uix-button yt-uix-button-size-default yt-uix-button-default comment-section-renderer-paginator yt-uix-sessionlink';
            button.onclick = function () {
                document.documentElement.classList.toggle('comments-collapsed');
            };

            content.className = 'yt-uix-button-content';

            show_more.className = 'show-more-text';
            show_more.textContent = 'Show more';

            show_less.className = 'show-less-text';
            show_less.textContent = 'Show less';

            content.appendChild(show_more);
            content.appendChild(show_less);
            button.appendChild(content);

            document.documentElement.classList.add('comments-collapsed');

            this.elements.comments.container.appendChild(button);

            this.elements.comments.button = button;
        }
    } else if (this.elements.comments.button) {
        this.elements.comments.button.remove();

        delete this.elements.comments.button;

        document.documentElement.classList.remove('comments-collapsed');
    }
};


/*------------------------------------------------------------------------------
4.3.0 THEMES
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.3.1 MY COLORS
------------------------------------------------------------------------------*/

ImprovedTube.myColors = function () {
    if (
        this.storage.theme === 'my-colors' &&
        Array.isArray(this.storage.theme_primary_color) &&
        Array.isArray(this.storage.theme_text_color)
    ) {
        var style = this.elements.my_colors || document.createElement('style'),
            primary_color = this.storage.theme_primary_color,
            text_color = this.storage.theme_text_color;

        if (primary_color) {
            primary_color = 'rgb(' + primary_color.join(',') + ')';
        } else {
            primary_color = 'rgb(200, 200, 200)';
        }

        if (text_color) {
            text_color = 'rgb(' + text_color.join(',') + ')';
        } else {
            text_color = 'rgb(25, 25, 25)';
        }

        style.className = 'it-theme-editor';
        style.textContent = 'html{' +
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
            '--yt-swatch-primary:' + primary_color + '!important;' +
            '--yt-swatch-primary-darker:' + primary_color + '!important;' +
            '--yt-spec-brand-background-solid:' + primary_color + '!important;' +
            '--yt-spec-general-background-a:' + primary_color + '!important;' +
            '--yt-spec-general-background-b:' + primary_color + '!important;' +
            '--yt-spec-general-background-c:' + primary_color + '!important;' +
            '--yt-spec-touch-response:' + primary_color + '!important;' +
            '--yt-swatch-text: ' + text_color + '!important;' +
            '--yt-swatch-important-text: ' + text_color + '!important;' +
            '--yt-swatch-input-text: ' + text_color + '!important;' +
            '--yt-swatch-logo-override: ' + text_color + '!important;' +
            '--yt-spec-text-primary:' + text_color + ' !important;' +
            '--yt-spec-text-primary-inverse:' + text_color + ' !important;' +
            '--yt-spec-text-secondary:' + text_color + ' !important;' +
            '--yt-spec-text-disabled:' + text_color + ' !important;' +
            '--yt-spec-icon-active-other:' + text_color + ' !important;' +
            '--yt-spec-icon-inactive:' + text_color + ' !important;' +
            '--yt-spec-icon-disabled:' + text_color + ' !important;' +
            '--yt-spec-filled-button-text:' + text_color + ' !important;' +
            '--yt-spec-call-to-action-inverse:' + text_color + ' !important;' +
            '--yt-spec-brand-icon-active:' + text_color + ' !important;' +
            '--yt-spec-brand-icon-inactive:' + text_color + ' !important;' +
            '--yt-spec-brand-link-text:' + text_color + '!important;' +
            '--yt-spec-brand-subscribe-button-background:' + text_color + ' !important;' +
            '--yt-spec-wordmark-text:' + text_color + ' !important;' +
            '--yt-spec-selected-nav-text:' + text_color + ' !important;' +
            '}';

        this.elements.my_colors = style;

        document.documentElement.appendChild(style);
    } else if (this.elements.my_colors) {
        this.elements.my_colors.remove();
    }
};


/*------------------------------------------------------------------------------
4.3.2 BLUELIGHT
------------------------------------------------------------------------------*/

ImprovedTube.bluelight = function () {
    var value = this.storage.bluelight;

    if (this.schedule() === false) {
        return false;
    }

    if (this.isset(value) === false) {
        value = 0;
    }

    if (typeof value !== 'number') {
        value = Number(value);
    }

    if (value !== 0) {
        if (!this.elements.bluelight || !this.elements.feColorMatrix) {
            var div = this.elements.bluelight || document.createElement('div'),
                svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
                filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter'),
                feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix'),
                matrix = feColorMatrix.values.baseVal;

            div.id = 'it-bluelight';

            svg.setAttributeNS(null, 'viewBox', '0 0 1 1');
            svg.setAttributeNS(null, 'version', '1.1');
            filter.setAttributeNS(null, 'id', 'it-bluelight-filter');
            feColorMatrix.setAttributeNS(null, 'type', 'matrix');

            for (var i = 0; i < 20; i++) {
                var number = svg.createSVGNumber();

                number.value = 0;

                matrix.appendItem(number);
            }

            matrix[0].value = 1;
            matrix[6].value = 1;
            matrix[12].value = 1 - parseFloat(value) / 100;
            matrix[18].value = 1;

            filter.appendChild(feColorMatrix);
            svg.appendChild(filter);
            div.appendChild(svg);
            document.documentElement.appendChild(div);

            this.elements.feColorMatrix = feColorMatrix;
            this.elements.bluelight = div;
        } else {
            this.elements.feColorMatrix.values.baseVal[12].value = 1 - parseFloat(value) / 100;
        }
    } else if (this.elements.bluelight) {
        this.elements.bluelight.remove();

        delete this.elements.bluelight;
        delete this.elements.feColorMatrix;
    }
};


/*------------------------------------------------------------------------------
4.3.3 DIM
------------------------------------------------------------------------------*/

ImprovedTube.dim = function () {
    var value = this.storage.dim;

    if (this.schedule() === false) {
        return false;
    }

    if (this.isset(value) === false) {
        value = 0;
    }

    if (typeof value !== 'number') {
        value = Number(value);
    }

    if (value !== 0) {
        if (!this.elements.dim) {
            var div = document.createElement('div');

            div.id = 'it-dim';
            div.style.opacity = parseInt(Number(value)) / 100 || 0;

            document.documentElement.appendChild(div);

            this.elements.dim = div;
        } else {
            this.elements.dim.style.opacity = parseInt(Number(value)) / 100 || 0;
        }
    } else if (this.elements.dim) {
        this.elements.dim.remove();

        delete this.elements.dim;
    }
};


/*------------------------------------------------------------------------------
4.3.4 FONT
------------------------------------------------------------------------------*/

ImprovedTube.font = function () {
    var option = this.storage.font;

    if (option && option !== 'Default') {
        var link = this.elements.myFont || document.createElement('link'),
            style = document.createElement('style');

        link.rel = 'stylesheet';
        link.href = '//fonts.googleapis.com/css2?family=' + option;

        style.textContent = '*{font-family:"' + option.replace(/\+/g, ' ') + '" !important}';

        this.elements.myFont = link;
        this.elements.myFontStyle = style;

        document.documentElement.style.fontFamily = option.replace(/\+/g, ' ');

        document.documentElement.appendChild(link);
        document.documentElement.appendChild(style);
    } else if (this.elements.myFont) {
        document.documentElement.style.fontFamily = '';

        this.elements.myFont.remove();
        this.elements.myFontStyle.remove();
    }
};


/*------------------------------------------------------------------------------
4.3.5 THEMES
------------------------------------------------------------------------------*/

ImprovedTube.themes = function () {
    this.myColors();

    if (this.schedule() === true && this.isset(this.storage.theme)) {
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

        document.documentElement.setAttribute('it-theme', this.storage.theme);
    } else {
        document.documentElement.removeAttribute('it-theme');
    }
};


/*------------------------------------------------------------------------------
4.3.6 SCHEDULE
------------------------------------------------------------------------------*/

ImprovedTube.schedule = function () {
    var current = new Date().getHours(),
        from = Number((this.storage.schedule_time_from || '00:00').substr(0, 2)),
        to = Number((this.storage.schedule_time_to || '00:00').substr(0, 2));

    if (to < from && current > from && current < 24) {
        times.to += 24;
    } else if (to < from && current < to) {
        from = 0;
    }

    if (this.storage.schedule !== 'sunset_to_sunrise' || current >= from && current < to) {
        return true;
    }

    return false;
};


/*------------------------------------------------------------------------------
4.4.0 PLAYER
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.4.1 AUTOPLAY
------------------------------------------------------------------------------*/

ImprovedTube.autoplay = function (video) {
    if (ImprovedTube.video_url !== location.href) {
        ImprovedTube.allow_autoplay = false;
    }

    if (
        (
            (location.href.indexOf('/watch?') !== -1 && location.href.indexOf('list=') === -1 && ImprovedTube.storage.player_autoplay === false) ||
            (location.href.indexOf('/watch?') !== -1 && location.href.indexOf('list=') !== -1 && ImprovedTube.storage.playlist_autoplay === false) ||
            (ImprovedTube.regex.channel.test(location.href) && ImprovedTube.storage.channel_trailer_autoplay === false)
        ) === true &&
        ImprovedTube.allow_autoplay === false &&
        video.parentNode.parentNode.classList.contains('ad-showing') === false
    ) {
        setTimeout(function () {
            video.parentNode.parentNode.pauseVideo();
        });
    }
};


/*------------------------------------------------------------------------------
4.4.2 FORCED PLAY VIDEO FROM THE BEGINNING
------------------------------------------------------------------------------*/

ImprovedTube.forcedPlayVideoFromTheBeginning = function () {
    if (this.storage.forced_play_video_from_the_beginning === true) {
        this.elements.player.seekTo(0);
    }
};


/*------------------------------------------------------------------------------
4.4.2 AUTOPAUSE WHEN SWITCHING TABS
------------------------------------------------------------------------------*/

ImprovedTube.playerAutopauseWhenSwitchingTabs = function () {
    var player = ImprovedTube.elements.player;

    if (this.storage.player_autopause_when_switching_tabs === true && player) {
        if (this.focus === false) {
            this.played_before_blur = player.getPlayerState() === 1;

            player.pauseVideo();
        } else if (this.focus === true && this.played_before_blur === true) {
            player.playVideo();
        }
    }
};


/*------------------------------------------------------------------------------
4.4.3 FORCED PLAYBACK SPEED
------------------------------------------------------------------------------*/

ImprovedTube.playerPlaybackSpeed = function (change) {
    var player = this.elements.player,
        video = player.querySelector('video'),
        option = this.storage.player_playback_speed;

    if (this.isset(option) === false) {
        option = 1;
    }

    if (this.storage.player_forced_playback_speed === true) {
        if (location.href.indexOf('music') === -1 && player.getVideoData().isLive === false) {
            player.setPlaybackRate(Number(option));
            video.playbackRate = Number(option);
        } else {
            player.setPlaybackRate(1);
        }
    }
};


/*------------------------------------------------------------------------------
4.4.4 SUBTITLES
------------------------------------------------------------------------------*/

ImprovedTube.subtitles = function () {
    if (this.storage.player_subtitles === true) {
        var player = this.elements.player;

        if (player && player.toggleSubtitlesOn) {
            player.toggleSubtitlesOn();
        }
    }
};


/*------------------------------------------------------------------------------
4.4.4.1 SUBTITLES LANGUAGE
------------------------------------------------------------------------------*/

ImprovedTube.subtitlesLanguage = function () {
    var option = this.storage.subtitles_language;

    if (this.isset(option) && option !== 'default') {
        var player = this.elements.player,
            button = this.elements.player_subtitles_button;

        if (player && player.getOption && button && button.getAttribute('aria-pressed') === 'true') {
            var tracklist = this.elements.player.getOption('captions', 'tracklist', {
                includeAsr: true
            });

            if (tracklist && tracklist[0]) {
                tracklist = tracklist[0];

                tracklist.translationLanguage = {
                    languageCode: option,
                    languageName: option
                };

                this.elements.player.setOption('captions', 'track', tracklist);
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.4.4.1 SUBTITLES FONT FAMILY
------------------------------------------------------------------------------*/

ImprovedTube.subtitlesFontFamily = function () {
    var option = this.storage.subtitles_font_family;

    if (this.isset(option)) {
        var player = this.elements.player,
            button = this.elements.player_subtitles_button;

        if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
            var settings = player.getSubtitlesUserSettings();

            if (settings) {
                settings.fontFamily = Number(option);

                player.updateSubtitlesUserSettings(settings);
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.4.4.2 SUBTITLES FONT COLOR
------------------------------------------------------------------------------*/

ImprovedTube.subtitlesFontColor = function () {
    var option = this.storage.subtitles_font_color;

    if (this.isset(option)) {
        var player = this.elements.player,
            button = this.elements.player_subtitles_button;

        if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
            var settings = player.getSubtitlesUserSettings();

            if (settings) {
                settings.color = option;

                player.updateSubtitlesUserSettings(settings);
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.4.4.3 SUBTITLES FONT SIZE
------------------------------------------------------------------------------*/

ImprovedTube.subtitlesFontSize = function () {
    var option = this.storage.subtitles_font_size;

    if (this.isset(option)) {
        var player = this.elements.player,
            button = this.elements.player_subtitles_button;

        if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
            var settings = player.getSubtitlesUserSettings();

            if (settings) {
                settings.fontSizeIncrement = Number(option);

                player.updateSubtitlesUserSettings(settings);
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.4.4.4 SUBTITLES BACKGROUND COLOR
------------------------------------------------------------------------------*/

ImprovedTube.subtitlesBackgroundColor = function () {
    var option = this.storage.subtitles_background_color;

    if (this.isset(option)) {
        var player = this.elements.player,
            button = this.elements.player_subtitles_button;

        if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
            var settings = player.getSubtitlesUserSettings();

            if (settings) {
                settings.background = option;

                player.updateSubtitlesUserSettings(settings);
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.4.4.5 SUBTITLES BACKGROUND OPACITY
------------------------------------------------------------------------------*/

ImprovedTube.subtitlesBackgroundOpacity = function () {
    var option = this.storage.subtitles_background_opacity;

    if (this.isset(option)) {
        var player = this.elements.player,
            button = this.elements.player_subtitles_button;

        if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
            var settings = player.getSubtitlesUserSettings();

            if (settings) {
                settings.backgroundOpacity = option / 100;

                player.updateSubtitlesUserSettings(settings);
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.4.4.6 SUBTITLES WINDOW COLOR
------------------------------------------------------------------------------*/

ImprovedTube.subtitlesWindowColor = function () {
    var option = this.storage.subtitles_window_color;

    if (this.isset(option)) {
        var player = this.elements.player,
            button = this.elements.player_subtitles_button;

        if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
            var settings = player.getSubtitlesUserSettings();

            if (settings) {
                settings.windowColor = option;

                player.updateSubtitlesUserSettings(settings);
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.4.4.7 SUBTITLES WINDOW OPACITY
------------------------------------------------------------------------------*/

ImprovedTube.subtitlesWindowOpacity = function () {
    var option = this.storage.subtitles_window_opacity;

    if (this.isset(option)) {
        var player = this.elements.player,
            button = this.elements.player_subtitles_button;

        if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
            var settings = player.getSubtitlesUserSettings();

            if (settings) {
                settings.windowOpacity = Number(option) / 100;

                player.updateSubtitlesUserSettings(settings);
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.4.4.8 SUBTITLES CHARACTER EDGE STYLE
------------------------------------------------------------------------------*/

ImprovedTube.subtitlesCharacterEdgeStyle = function () {
    var option = this.storage.subtitles_character_edge_style;

    if (this.isset(option)) {
        var player = this.elements.player,
            button = this.elements.player_subtitles_button;

        if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
            var settings = player.getSubtitlesUserSettings();

            if (settings) {
                settings.charEdgeStyle = Number(option);

                player.updateSubtitlesUserSettings(settings);
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.4.4.9 SUBTITLES FONT OPACITY
------------------------------------------------------------------------------*/

ImprovedTube.subtitlesFontOpacity = function () {
    var option = this.storage.subtitles_font_opacity;

    if (this.isset(option)) {
        var player = this.elements.player,
            button = this.elements.player_subtitles_button;

        if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
            var settings = player.getSubtitlesUserSettings();

            if (settings) {
                settings.textOpacity = option / 100;

                player.updateSubtitlesUserSettings(settings);
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.4.5 UP NEXT AUTOPLAY
------------------------------------------------------------------------------*/

ImprovedTube.upNextAutoplay = function () {
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
4.4.6 ADS
------------------------------------------------------------------------------*/

ImprovedTube.playerAds = function (parent) {
    var button = parent.querySelector('.ytp-ad-skip-button.ytp-button');
    if (button) {
        if (this.storage.player_ads === 'block_all') {
            button.click();
        } else if (this.storage.player_ads === 'subscribed_channels') {
            if (!parent.querySelector('#meta paper-button[subscribed]')) {
                button.click();
            }
        } else if (this.storage.player_ads === 'block_music') {
            if (ImprovedTube.elements.genre === 'music') {
                button.click();
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.4.7 CUSTOM MINI-PLAYER
------------------------------------------------------------------------------*/

ImprovedTube.mini_player__setSize = function (width, height) {
    ImprovedTube.elements.player.style.width = width + 'px';
    ImprovedTube.elements.player.style.height = height + 'px';
};

ImprovedTube.miniPlayer_scroll = function () {
    if (window.scrollY >= 256 && ImprovedTube.mini_player__mode === false && ImprovedTube.elements.player.classList.contains('ytp-player-minimized') === false) {
        ImprovedTube.mini_player__mode = true;

        ImprovedTube.mini_player__original_width = ImprovedTube.elements.player.offsetWidth;
        ImprovedTube.mini_player__original_height = ImprovedTube.elements.player.offsetHeight;

        ImprovedTube.elements.player.classList.add('it-mini-player');

        ImprovedTube.mini_player__x = Math.max(0, Math.min(ImprovedTube.mini_player__x, document.body.offsetWidth - ImprovedTube.mini_player__width));
        ImprovedTube.mini_player__y = Math.max(0, Math.min(ImprovedTube.mini_player__y, window.innerHeight - ImprovedTube.mini_player__height));

        ImprovedTube.mini_player__cursor = '';
        document.documentElement.removeAttribute('it-mini-player-cursor');

        ImprovedTube.elements.player.style.transform = 'translate(' + ImprovedTube.mini_player__x + 'px, ' + ImprovedTube.mini_player__y + 'px)';

        ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__width, ImprovedTube.mini_player__height);

        window.addEventListener('mousedown', ImprovedTube.miniPlayer_mouseDown);
        window.addEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);

        window.dispatchEvent(new Event('resize'));
    } else if (window.scrollY < 256 && ImprovedTube.mini_player__mode === true || ImprovedTube.elements.player.classList.contains('ytp-player-minimized') === true) {
        ImprovedTube.mini_player__mode = false;
        ImprovedTube.elements.player.classList.remove('it-mini-player');
        ImprovedTube.mini_player__move = false;
        ImprovedTube.elements.player.style.transform = 'translate(' + 0 + 'px, ' + 0 + 'px)';
        ImprovedTube.elements.player.style.width = '';
        ImprovedTube.elements.player.style.height = '';

        ImprovedTube.mini_player__cursor = '';
        document.documentElement.removeAttribute('it-mini-player-cursor');

        window.removeEventListener('mousedown', ImprovedTube.miniPlayer_mouseDown);
        window.removeEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);

        window.dispatchEvent(new Event('resize'));
    }
};

ImprovedTube.miniPlayer_mouseDown = function (event) {
    if (event.button !== 0) {
        return false;
    }

    if (ImprovedTube.miniPlayer_resize() === true) {
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

    var bcr = ImprovedTube.elements.player.getBoundingClientRect();

    ImprovedTube.miniPlayer_mouseDown_x = event.clientX;
    ImprovedTube.miniPlayer_mouseDown_y = event.clientY;
    ImprovedTube.mini_player__width = bcr.width;
    ImprovedTube.mini_player__height = bcr.height;

    ImprovedTube.mini_player__player_offset_x = event.clientX - bcr.x;
    ImprovedTube.mini_player__player_offset_y = event.clientY - bcr.y;

    ImprovedTube.mini_player__max_x = document.body.offsetWidth - ImprovedTube.mini_player__width;
    ImprovedTube.mini_player__max_y = window.innerHeight - ImprovedTube.mini_player__height;

    window.addEventListener('mouseup', ImprovedTube.miniPlayer_mouseUp);
    window.addEventListener('mousemove', ImprovedTube.miniPlayer_mouseMove);
};

ImprovedTube.miniPlayer_mouseUp = function () {
    var strg = JSON.parse(localStorage.getItem('improedtube-mini-player')) || {};

    strg.x = ImprovedTube.mini_player__x;
    strg.y = ImprovedTube.mini_player__y;

    localStorage.setItem('improedtube-mini-player', JSON.stringify(strg));

    window.removeEventListener('mouseup', ImprovedTube.miniPlayer_mouseUp);
    window.removeEventListener('mousemove', ImprovedTube.miniPlayer_mouseMove);

    ImprovedTube.mini_player__move = false;

    setTimeout(function () {
        window.removeEventListener('click', ImprovedTube.miniPlayer_click, true);
    });
};

ImprovedTube.miniPlayer_click = function (event) {
    event.stopPropagation();
    event.preventDefault();
};

ImprovedTube.miniPlayer_mouseMove = function (event) {
    if (
        event.clientX < ImprovedTube.miniPlayer_mouseDown_x - 5 ||
        event.clientY < ImprovedTube.miniPlayer_mouseDown_y - 5 ||
        event.clientX > ImprovedTube.miniPlayer_mouseDown_x + 5 ||
        event.clientY > ImprovedTube.miniPlayer_mouseDown_y + 5
    ) {
        var x = event.clientX - ImprovedTube.mini_player__player_offset_x,
            y = event.clientY - ImprovedTube.mini_player__player_offset_y;

        if (ImprovedTube.mini_player__move === false) {
            ImprovedTube.mini_player__move = true;

            window.addEventListener('click', ImprovedTube.miniPlayer_click, true);
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

        ImprovedTube.elements.player.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    }
};

ImprovedTube.miniPlayer_cursorUpdate = function (event) {
    var x = event.clientX,
        y = event.clientY,
        c = ImprovedTube.mini_player__cursor;

    if (
        x >= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - ImprovedTube.miniPlayer_resize_offset &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
        y >= ImprovedTube.mini_player__y &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.miniPlayer_resize_offset
    ) {
        c = 'ne-resize';
    } else if (
        x >= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - ImprovedTube.miniPlayer_resize_offset &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
        y >= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - ImprovedTube.miniPlayer_resize_offset &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
    ) {
        c = 'se-resize';
    } else if (
        x >= ImprovedTube.mini_player__x &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.miniPlayer_resize_offset &&
        y >= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - ImprovedTube.miniPlayer_resize_offset &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
    ) {
        c = 'sw-resize';
    } else if (
        x >= ImprovedTube.mini_player__x &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.miniPlayer_resize_offset &&
        y >= ImprovedTube.mini_player__y &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.miniPlayer_resize_offset
    ) {
        c = 'nw-resize';
    } else if (
        x >= ImprovedTube.mini_player__x &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
        y >= ImprovedTube.mini_player__y &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.miniPlayer_resize_offset
    ) {
        c = 'n-resize';
    } else if (
        x >= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - ImprovedTube.miniPlayer_resize_offset &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
        y >= ImprovedTube.mini_player__y &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
    ) {
        c = 'e-resize';
    } else if (
        x >= ImprovedTube.mini_player__x &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
        y >= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - ImprovedTube.miniPlayer_resize_offset &&
        y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
    ) {
        c = 's-resize';
    } else if (
        x >= ImprovedTube.mini_player__x &&
        x <= ImprovedTube.mini_player__x + ImprovedTube.miniPlayer_resize_offset &&
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

ImprovedTube.miniPlayer_resize = function (event) {
    if (ImprovedTube.mini_player__cursor !== '') {
        window.removeEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);
        window.addEventListener('mouseup', ImprovedTube.miniPlayer_resizeMouseUp);
        window.addEventListener('mousemove', ImprovedTube.miniPlayer_resizeMouseMove);

        return true;
    }
};

ImprovedTube.miniPlayer_resizeMouseMove = function (event) {
    if (ImprovedTube.mini_player__cursor === 'n-resize') {
        ImprovedTube.elements.player.style.transform = 'translate(' + ImprovedTube.mini_player__x + 'px, ' + event.clientY + 'px)';
        ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__width, ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - event.clientY);
    } else if (ImprovedTube.mini_player__cursor === 'e-resize') {
        ImprovedTube.mini_player__setSize(event.clientX - ImprovedTube.mini_player__x, ImprovedTube.mini_player__height);
    } else if (ImprovedTube.mini_player__cursor === 's-resize') {
        ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__width, event.clientY - ImprovedTube.mini_player__y);
    } else if (ImprovedTube.mini_player__cursor === 'w-resize') {
        ImprovedTube.elements.player.style.transform = 'translate(' + event.clientX + 'px, ' + ImprovedTube.mini_player__y + 'px)';
        ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - event.clientX, ImprovedTube.mini_player__height);
    } else if (ImprovedTube.mini_player__cursor === 'ne-resize') {
        ImprovedTube.elements.player.style.transform = 'translate(' + ImprovedTube.mini_player__x + 'px, ' + event.clientY + 'px)';
        ImprovedTube.mini_player__setSize(event.clientX - ImprovedTube.mini_player__x, ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - event.clientY);
    } else if (ImprovedTube.mini_player__cursor === 'se-resize') {
        ImprovedTube.mini_player__setSize(event.clientX - ImprovedTube.mini_player__x, event.clientY - ImprovedTube.mini_player__y);
    } else if (ImprovedTube.mini_player__cursor === 'sw-resize') {
        ImprovedTube.elements.player.style.transform = 'translate(' + event.clientX + 'px, ' + ImprovedTube.mini_player__y + 'px)';
        ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - event.clientX, event.clientY - ImprovedTube.mini_player__y);
    } else if (ImprovedTube.mini_player__cursor === 'nw-resize') {
        ImprovedTube.elements.player.style.transform = 'translate(' + event.clientX + 'px, ' + event.clientY + 'px)';
        ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - event.clientX, ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - event.clientY);
    }
};

ImprovedTube.miniPlayer_resizeMouseUp = function (event) {
    var bcr = ImprovedTube.elements.player.getBoundingClientRect();

    ImprovedTube.mini_player__x = bcr.left;
    ImprovedTube.mini_player__y = bcr.top;
    ImprovedTube.mini_player__width = bcr.width;
    ImprovedTube.mini_player__height = bcr.height;

    window.dispatchEvent(new Event('resize'));

    var strg = JSON.parse(localStorage.getItem('improedtube-mini-player')) || {};

    strg.width = ImprovedTube.mini_player__width;
    strg.height = ImprovedTube.mini_player__height;

    localStorage.setItem('improedtube-mini-player', JSON.stringify(strg));

    window.addEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);
    window.removeEventListener('mouseup', ImprovedTube.miniPlayer_resizeMouseUp);
    window.removeEventListener('mousemove', ImprovedTube.miniPlayer_resizeMouseMove);
};

ImprovedTube.miniPlayer = function () {
    if (this.storage.mini_player === true) {
        var data = localStorage.getItem('improedtube-mini-player');

        try {
            if (this.isset(data)) {
                data = JSON.parse(data);
            } else {
                data = {};
            }
        } catch (error) {
            data = {};
        }

        data.x = data.x || 16;
        data.y = data.y || 16;
        data.width = data.width || 200;
        data.height = data.height || 150;

        this.mini_player__x = data.x;
        this.mini_player__y = data.y;
        this.mini_player__width = data.width;
        this.mini_player__height = data.height;

        window.removeEventListener('scroll', this.miniPlayer_scroll);
        window.addEventListener('scroll', this.miniPlayer_scroll);
    } else {
        this.mini_player__mode = false;
        this.elements.player.classList.remove('it-mini-player');
        this.mini_player__move = false;

        this.elements.player.style.width = '';
        this.elements.player.style.height = '';
        this.elements.player.style.transform = 'translate(' + 0 + 'px, ' + 0 + 'px)';

        this.elements.player.classList.remove('it-mini-player');

        this.mini_player__cursor = '';
        document.documentElement.removeAttribute('it-mini-player-cursor');

        window.dispatchEvent(new Event('resize'));

        window.removeEventListener('mousedown', this.miniPlayer_mouseDown);
        window.removeEventListener('mousemove', this.miniPlayer_mouseMove);
        window.removeEventListener('mouseup', this.miniPlayer_mouseUp);
        window.removeEventListener('click', this.miniPlayer_click);
        window.removeEventListener('scroll', this.miniPlayer_scroll);
        window.removeEventListener('mousemove', this.miniPlayer_cursorUpdate);
    }
};


/*------------------------------------------------------------------------------
4.4.8 AUTO FULLSCREEN
------------------------------------------------------------------------------*/

ImprovedTube.playerAutofullscreen = function () {
    if (
        this.storage.player_autofullscreen === true &&
        document.documentElement.dataset.pageType === 'video' &&
        !document.fullscreenElement
    ) {
        this.elements.player.toggleFullscreen();
    }
};


/*------------------------------------------------------------------------------
4.4.9 QUALITY
------------------------------------------------------------------------------*/

ImprovedTube.playerQuality = function () {
    var player = this.elements.player,
        quality = this.storage.player_quality;

    if (player && player.getAvailableQualityLevels && !player.dataset.defaultQuality) {
        var available_quality_levels = player.getAvailableQualityLevels();

        if (quality && quality !== 'auto') {
            if (available_quality_levels.includes(quality) === false) {
                quality = available_quality_levels[0];
            }

            player.setPlaybackQualityRange(quality);
            player.setPlaybackQuality(quality);
            player.dataset.defaultQuality = quality;
        }
    }
};


/*------------------------------------------------------------------------------
4.4.10 CODEC H.264
------------------------------------------------------------------------------*/

ImprovedTube.playerH264 = function () {
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

            window.MediaSource.isTypeSupported = function (mime) {
                return overwrite(this, isTypeSupported, mime);
            };
        }

        HTMLMediaElement.prototype.canPlayType = function (mime) {
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
4.4.11 ALLOW 60FPS
------------------------------------------------------------------------------*/

ImprovedTube.player60fps = function () {
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

            window.MediaSource.isTypeSupported = function (mime) {
                return overwrite(this, isTypeSupported, mime);
            };
        }

        HTMLMediaElement.prototype.canPlayType = function (mime) {
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
4.4.12 FORCED VOLUME
------------------------------------------------------------------------------*/

ImprovedTube.playerVolume = function () {
    if (this.storage.player_forced_volume === true) {
        var volume = this.storage.player_volume;

        if (!this.isset(volume)) {
            volume = 100;
        } else {
            volume = Number(volume);
        }

        this.elements.player.setVolume(volume);
    }
};


/*------------------------------------------------------------------------------
4.4.13 LOUDNESS NORMALIZATION
------------------------------------------------------------------------------*/

ImprovedTube.onvolumechange = function (event) {
    if (document.querySelector('.ytp-volume-panel') && ImprovedTube.storage.player_loudness_normalization === false) {
        var volume = Number(document.querySelector('.ytp-volume-panel').getAttribute('aria-valuenow'));

        this.volume = volume / 100;
    }
};

ImprovedTube.playerLoudnessNormalization = function () {
    var video = this.elements.video;

    if (video) {
        video.removeEventListener('volumechange', this.onvolumechange);
        video.addEventListener('volumechange', this.onvolumechange);
    }

    if (this.storage.player_loudness_normalization === false) {
        try {
            var local_storage = localStorage['yt-player-volume'];

            if (this.isset(Number(this.storage.player_volume)) && this.storage.player_forced_volume === true) {

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
4.4.14 SCREENSHOT
------------------------------------------------------------------------------*/

ImprovedTube.screenshot = function () {
    var video = ImprovedTube.elements.video,
        style = document.createElement('style'),
        cvs = document.createElement('canvas'),
        ctx = cvs.getContext('2d');

    style.textContent = 'video{width:' + video.videoWidth + 'px !important;height:' + video.videoHeight + 'px !important}';

    cvs.width = video.videoWidth;
    cvs.height = video.videoHeight;

    document.body.appendChild(style);

    setTimeout(function () {
        ctx.drawImage(video, 0, 0, cvs.width, cvs.height);

        cvs.toBlob(function (blob) {
            if (ImprovedTube.storage.player_screenshot_save_as !== 'clipboard') {
                var a = document.createElement('a');

                a.href = URL.createObjectURL(blob);

                a.download = location.href.match(/(\?|\&)v=[^&]+/)[0].substr(3) + '-' + new Date(ImprovedTube.elements.player.getCurrentTime() * 1000).toISOString().substr(11, 8).replace(/:/g, '-') + '.png';

                a.click();
            } else {
                navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]);
            }
        });

        style.remove();
    });
};

ImprovedTube.playerScreenshotButton = function () {
    if (this.storage.player_screenshot_button === true) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
        path.setAttributeNS(null, 'd', 'M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z');

        svg.appendChild(path);

        this.createPlayerButton({
            id: 'it-screenshot-button',
            child: svg,
            opacity: 1,
            onclick: this.screenshot,
            title: 'Screenshot'
        });
    } else if (this.elements.buttons['it-screenshot-styles']) {
        this.elements.buttons['it-screenshot-styles'].remove();
    }
};


/*------------------------------------------------------------------------------
4.4.15 REPEAT
------------------------------------------------------------------------------*/

ImprovedTube.playerRepeatButton = function (node) {
    if (this.storage.player_repeat_button === true) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
        path.setAttributeNS(null, 'd', 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z');

        svg.appendChild(path);

        this.createPlayerButton({
            id: 'it-repeat-button',
            child: svg,
            onclick: function () {
                var video = ImprovedTube.elements.video;

                if (video.hasAttribute('loop')) {
                    video.removeAttribute('loop');

                    this.style.opacity = '.5';
                } else if (!/ad-showing/.test(ImprovedTube.elements.player.className)) {
                    video.setAttribute('loop', '');

                    this.style.opacity = '1';
                }
            },
            title: 'Repeat'
        });

        if (this.storage.player_always_repeat === true) {
            setTimeout(function () {
                ImprovedTube.elements.video.setAttribute('loop', '');

                ImprovedTube.elements.buttons['it-repeat-styles'].style.opacity = '1';
            }, 100);
        }
    } else if (this.elements.buttons['it-repeat-styles']) {
        this.elements.buttons['it-repeat-styles'].remove();
    }
};


/*------------------------------------------------------------------------------
4.4.16 ROTATE
------------------------------------------------------------------------------*/

ImprovedTube.playerRotateButton = function () {
    if (this.storage.player_rotate_button === true) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
        path.setAttributeNS(null, 'd', 'M15.55 5.55L11 1v3.07a8 8 0 0 0 0 15.86v-2.02a6 6 0 0 1 0-11.82V10l4.55-4.45zM19.93 11a7.9 7.9 0 0 0-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02a7.92 7.92 0 0 0 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41A7.9 7.9 0 0 0 19.93 13h-2.02a5.9 5.9 0 0 1-1.02 2.48z');

        svg.appendChild(path);

        this.createPlayerButton({
            id: 'it-rotate-button',
            child: svg,
            opacity: 1,
            onclick: function () {
                var player = ImprovedTube.elements.player,
                    video = ImprovedTube.elements.video,
                    rotate = Number(document.body.dataset.itRotate) || 0,
                    transform = '';

                rotate += 90;

                if (rotate === 360) {
                    rotate = 0;
                }

                document.body.dataset.itRotate = rotate;

                transform += 'rotate(' + rotate + 'deg)';

                if (rotate == 90 || rotate == 270) {
                    var is_vertical_video = video.videoHeight > video.videoWidth;

                    transform += ' scale(' + (is_vertical_video ? player.clientWidth : player.clientHeight) / (is_vertical_video ? player.clientHeight : player.clientWidth) + ')';
                }

                if (!ImprovedTube.elements.buttons['it-rotate-styles']) {
                    var style = document.createElement('style');

                    ImprovedTube.elements.buttons['it-rotate-styles'] = style;

                    document.body.appendChild(style);
                }

                ImprovedTube.elements.buttons['it-rotate-styles'].textContent = 'video{transform:' + transform + '}';
            },
            title: 'Rotate'
        });
    } else if (this.elements.buttons['it-rotate-button']) {
        this.elements.buttons['it-rotate-button'].remove();
        this.elements.buttons['it-rotate-styles'].remove();
    }
};


/*------------------------------------------------------------------------------
4.4.17 POPUP PLAYER
------------------------------------------------------------------------------*/

ImprovedTube.playerPopupButton = function () {
    if (this.storage.player_popup_button === true) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
        path.setAttributeNS(null, 'd', 'M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z');

        svg.appendChild(path);

        this.createPlayerButton({
            id: 'it-popup-player-button',
            child: svg,
            opacity: 1,
            onclick: function () {
                var player = ImprovedTube.elements.player;

                player.pauseVideo();

                window.open('//www.youtube.com/embed/' + location.href.match(/watch\?v=([A-Za-z0-9\-\_]+)/g)[0].slice(8) + '?start=' + parseInt(player.getCurrentTime()) + '&autoplay=' + (ImprovedTube.storage.player_autoplay == false ? '0' : '1'), '_blank', 'directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=' + player.offsetWidth + ',height=' + player.offsetHeight);
            },
            title: 'Popup'
        });
    } else if (this.elements.buttons['it-popup-player-button']) {
        this.elements.buttons['it-popup-player-button'].remove();
    }
};


/*------------------------------------------------------------------------------
4.4.18 Force SDR
------------------------------------------------------------------------------*/

ImprovedTube.playerSDR = function () {
    if (this.storage.player_SDR === true) {
        Object.defineProperty(window.screen, 'pixelDepth', {
            enumerable: true,
            configurable: true,
            value: 24
        });
    }
};


/*------------------------------------------------------------------------------
4.4.19 Hide controls
------------------------------------------------------------------------------*/

ImprovedTube.playerControls = function () {
    if (this.elements.player) {
        if (this.storage.player_hide_controls === true) {
            this.elements.player.hideControls();
        } else {
            this.elements.player.showControls();
        }
    }
};


/*------------------------------------------------------------------------------
4.5.0 PLAYLIST
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.5.1 UP NEXT AUTOPLAY
------------------------------------------------------------------------------*/

ImprovedTube.playlistUpNextAutoplay = function (event) {
    if (
        ImprovedTube.getParam(location.href, 'list') &&
        ImprovedTube.storage.playlist_up_next_autoplay === false
    ) {
        event.preventDefault();
        event.stopPropagation();
    }
};


/*------------------------------------------------------------------------------
4.5.2 REVERSE
------------------------------------------------------------------------------*/

ImprovedTube.playlistReverse = function () {
    if (this.storage.playlist_reverse === true) {
        function update() {
            var results = ImprovedTube.elements.ytd_watch.data.contents.twoColumnWatchNextResults,
                playlist = results.playlist.playlist,
                autoplay = results.autoplay.autoplay;

            playlist.contents.reverse();

            playlist.currentIndex = playlist.totalVideos - playlist.currentIndex - 1;
            playlist.localCurrentIndex = playlist.contents.length - playlist.localCurrentIndex - 1;

            for (var i = 0, l = autoplay.sets.length; i < l; i++) {
                var item = autoplay.sets[i];

                item.autoplayVideo = item.previousButtonVideo;
                item.previousButtonVideo = item.nextButtonVideo;
                item.nextButtonVideo = item.autoplayVideo;
            }

            ImprovedTube.elements.ytd_watch.updatePageData_(JSON.parse(JSON.stringify(ImprovedTube.elements.ytd_watch.data)));

            setTimeout(function () {
                ImprovedTube.elements.ytd_player.updatePlayerComponents(null, autoplay, null, playlist);
                document.querySelector('yt-playlist-manager').autoplayData = autoplay;
                document.querySelector('yt-playlist-manager').setPlaylistData(playlist);
                ImprovedTube.elements.ytd_player.updatePlayerPlaylist_(playlist);
            });
        }

        if (!document.querySelector('#it-reverse-playlist') && ImprovedTube.elements.playlist.actions) {
            var button = document.createElement('button'),
                svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
                path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            button.id = 'it-reverse-playlist';
            button.className = 'style-scope yt-icon-button';
            button.addEventListener('click', function (event) {
                var playlist_manager = document.querySelector('yt-playlist-manager');

                event.preventDefault();
                event.stopPropagation();

                this.classList.toggle('active');

                ImprovedTube.playlistReversed = !ImprovedTube.playlistReversed;

                update();

                return false;
            }, true);

            svg.setAttributeNS(null, 'width', '24');
            svg.setAttributeNS(null, 'height', '24');
            svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
            path.setAttributeNS(null, 'd', 'M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z');

            svg.appendChild(path);

            button.appendChild(svg);

            ImprovedTube.elements.playlist.actions.appendChild(button);
        }

        if (this.playlistReversed === true) {
            update();
        }
    }
};


/*------------------------------------------------------------------------------
4.5.3 REPEAT
------------------------------------------------------------------------------*/

ImprovedTube.playlistRepeat = function () {
    var button = ImprovedTube.elements.playlist.repeat_button,
        option = ImprovedTube.storage.playlist_repeat;

    if (button && (option === true && button.className.search('style-default-active') === -1 || option === 'disabled' && button.className.indexOf('style-default-active') !== -1)) {
        button.click();
    }
};


/*------------------------------------------------------------------------------
4.5.4 SHUFFLE
------------------------------------------------------------------------------*/

ImprovedTube.playlistShuffle = function () {
    var button = ImprovedTube.elements.playlist.shuffle_button,
        option = ImprovedTube.storage.playlist_shuffle;

    if (button && (option === true && button.className.search('style-default-active') === -1 || option === 'disabled' && button.className.indexOf('style-default-active') !== -1)) {
        button.click();
    }
};


/*------------------------------------------------------------------------------
4.6.0 CHANNEL
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.6.1 DEFAULT CHANNEL TAB
------------------------------------------------------------------------------*/

ImprovedTube.channelDefaultTab = function (a) {
    var option = this.storage.channel_default_tab;

    if (option && option !== '/' && a.parentNode.id !== 'contenteditable-root') {
        if (this.regex.channel_home_page.test(a.href)) {
            if (!a.dataset.itOrigin) {
                a.dataset.itOrigin = a.href.replace(this.regex.channel_home_page_postfix, '');
            }

            a.href = a.dataset.itOrigin + option;

            a.addEventListener('click', function (event) {
                event.stopPropagation();
            }, true);
        }
    }
};


/*------------------------------------------------------------------------------
4.7.0 SHORTCUTS
------------------------------------------------------------------------------*/

ImprovedTube.shortcuts = function () {
    var keyboard = {
            alt: false,
            ctrl: false,
            shift: false,
            keys: {}
        },
        mouse = {
            player: false,
            wheel: 0
        },
        storage = {};

    function handler() {
        var prevent = false;

        for (var key in storage) {
            var shortcut = storage[key],
                same_keys = true;

            if (
                typeof shortcut === 'object' &&
                (keyboard.alt === shortcut.alt || !ImprovedTube.isset(shortcut.alt)) &&
                (keyboard.ctrl === shortcut.ctrl || !ImprovedTube.isset(shortcut.ctrl)) &&
                (keyboard.shift === shortcut.shift || !ImprovedTube.isset(shortcut.shift)) &&
                (mouse.wheel === shortcut.wheel || !ImprovedTube.isset(shortcut.wheel))
            ) {
                if (keyboard.keys && shortcut.keys) {
                    for (var code in keyboard.keys) {
                        if (!shortcut.keys[code]) {
                            same_keys = false;
                        }
                    }
                    for (var code in shortcut.keys) {
                        if (!keyboard.keys[code]) {
                            same_keys = false;
                        }
                    }
                }

                if (!ImprovedTube.isset(mouse.wheel) || mouse.wheel === 0 || mouse.player === true) {
                    if (same_keys === true) {
                        if ([
                                'shortcutAuto',
                                'shortcut144p',
                                'shortcut240p',
                                'shortcut360p',
                                'shortcut480p',
                                'shortcut720p',
                                'shortcut1080p',
                                'shortcut1440p',
                                'shortcut2160p',
                                'shortcut2880p',
                                'shortcut4320p'
                            ].includes(key) === true) {
                            ImprovedTube['shortcutQuality'](key);
                        } else if (typeof ImprovedTube[key] === 'function') {
                            ImprovedTube[key]();
                        }

                        prevent = true;
                    }
                }
            }
        }

        return prevent;
    }

    window.addEventListener('keydown', function (event) {
        if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].includes(document.activeElement.tagName) === true || event.target.isContentEditable) {
            return false;
        }

        if (event.code === 'AltLeft' || event.code === 'AltRight') {
            keyboard.alt = true;
        } else if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
            keyboard.ctrl = true;
        } else if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            keyboard.shift = true;
        } else {
            keyboard.keys[event.keyCode] = true;
        }

        mouse.wheel = 0;

        if (handler() === true) {
            event.preventDefault();
            event.stopPropagation();

            return false;
        }
    }, true);

    window.addEventListener('keyup', function (event) {
        if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].includes(document.activeElement.tagName) === true || event.target.isContentEditable) {
            return false;
        }

        if (event.code === 'AltLeft' || event.code === 'AltRight') {
            keyboard.alt = false;
        } else if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
            keyboard.ctrl = false;
        } else if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            keyboard.shift = false;
        } else {
            delete keyboard.keys[event.keyCode];
        }

        mouse.wheel = 0;
    }, true);

    window.addEventListener('wheel', function (event) {
        if (event.deltaY > 0) {
            mouse.wheel = 1;
        } else {
            mouse.wheel = -1;
        }

        if (handler() === true) {
            event.preventDefault();
            event.stopPropagation();

            return false;
        }
    }, {
        passive: false,
        capture: true
    });

    document.addEventListener('improvedtube-player-loaded', function () {
        ImprovedTube.elements.player.parentNode.addEventListener('mouseover', function () {
            mouse.player = true;
            mouse.wheel = 0;
        }, true);

        ImprovedTube.elements.player.parentNode.addEventListener('mouseout', function () {
            mouse.player = false;
            mouse.wheel = 0;
        }, true);
    });

    document.addEventListener('improvedtube-blur', function () {
        keyboard.alt = false;
        keyboard.ctrl = false;
        keyboard.shift = false;

        for (var key in keyboard.keys) {
            delete keyboard.keys[key];
        }

        mouse.player = false;
        mouse.wheel = 0;
    });

    for (var name in this.storage) {
        if (name.indexOf('shortcut_') === 0) {
            if (this.isset(this.storage[name]) && this.storage[name] !== false) {
                try {
                    var key = 'shortcut' + (name.replace(/_?shortcut_?/g, '').replace(/\_/g, '-')).split('-').map(function (element, index) {
                        return element[0].toUpperCase() + element.slice(1);
                    }).join('');

                    storage[key] = this.storage[name];
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.7.1 QUALITY
------------------------------------------------------------------------------*/

ImprovedTube.shortcutQuality = function (key) {
    if (this.elements.player) {
        var value = key.replace('shortcut', '').toLowerCase();

        if (value === '144p') {
            value = 'tiny';
        }

        if (value === '240p') {
            value = 'small';
        }

        if (value === '360p') {
            value = 'medium';
        }

        if (value === '480p') {
            value = 'large';
        }

        if (value === '720p') {
            value = 'hd720';
        }

        if (value === '1080p') {
            value = 'hd1080';
        }

        if (value === '1440p') {
            value = 'hd1440';
        }

        if (value === '2160p') {
            value = 'hd2160';
        }

        if (value === '2880p') {
            value = 'hd2880';
        }

        if (value === '4320p') {
            value = 'highres';
        }

        this.elements.player.setPlaybackQualityRange(value);
        this.elements.player.setPlaybackQuality(value);
    }
};


/*------------------------------------------------------------------------------
4.7.2 PICTURE IN PICTURE
------------------------------------------------------------------------------*/

ImprovedTube.shortcutPictureInPicture = function () {
    if (this.elements.video) {
        this.elements.video.requestPictureInPicture();
    }
};


/*------------------------------------------------------------------------------
4.7.3 TOGGLE CONTROLS
------------------------------------------------------------------------------*/

ImprovedTube.shortcutToggleControls = function () {
    if (this.elements.player) {
        this.storage.player_hide_controls = !this.storage.player_hide_controls;

        if (this.storage.player_hide_controls) {
            this.elements.player.hideControls();
        } else {
            this.elements.player.showControls();
        }
    }
};


/*------------------------------------------------------------------------------
4.7.4 PLAY / PAUSE
------------------------------------------------------------------------------*/

ImprovedTube.shortcutPlayPause = function () {
    if (this.elements.player) {
        if (this.elements.video.paused) {
            this.elements.player.playVideo();
        } else {
            this.elements.player.pauseVideo();
        }
    }
};


/*------------------------------------------------------------------------------
4.7.5 STOP
------------------------------------------------------------------------------*/

ImprovedTube.shortcutStop = function () {
    if (this.elements.player) {
        this.elements.player.stopVideo();
    }
};


/*------------------------------------------------------------------------------
4.7.6 TOGGLE AUTOPLAY
------------------------------------------------------------------------------*/

ImprovedTube.shortcutToggleAutoplay = function () {
    var toggle = document.querySelector('.ytp-autonav-toggle-button'),
        attribute = toggle.getAttribute('aria-checked') === 'true';

    if (toggle) {
        toggle.click();
    }
};


/*------------------------------------------------------------------------------
4.7.7 NEXT VIDEO
------------------------------------------------------------------------------*/

ImprovedTube.shortcutNextVideo = function () {
    if (this.elements.player) {
        var playlist_loop_button = document.querySelector('[aria-label="Loop playlist"]');

        if (playlist_loop_button) {
            if (playlist_loop_button.ariaPressed === 'true') {
                this.elements.player.setLoop(true);
            } else {
                this.elements.player.setLoop(false)
            }
        }

        this.elements.player.nextVideo();
    }
};


/*------------------------------------------------------------------------------
4.7.8 PREVIOUS VIDEO
------------------------------------------------------------------------------*/

ImprovedTube.shortcutPrevVideo = function () {
    if (this.elements.player) {
        var playlist_loop_button = document.querySelector('[aria-label="Loop playlist"]');

        if (playlist_loop_button) {
            if (playlist_loop_button.ariaPressed === 'true') {
                this.elements.player.setLoop(true);
            } else {
                this.elements.player.setLoop(false)
            }
        }

        this.elements.player.previousVideo();
    }
};


/*------------------------------------------------------------------------------
4.7.9 SEEK BACKWARD
------------------------------------------------------------------------------*/

ImprovedTube.shortcutSeekBackward = function () {
    if (this.elements.player) {
        this.elements.player.seekBy(-10);
    }
};


/*------------------------------------------------------------------------------
4.7.10 SEEK FORWARD
------------------------------------------------------------------------------*/

ImprovedTube.shortcutSeekForward = function () {
    if (this.elements.player) {
        this.elements.player.seekBy(10);
    }
};


/*------------------------------------------------------------------------------
4.7.11 SEEK NEXT CHAPTER
------------------------------------------------------------------------------*/

ImprovedTube.shortcutSeekNextChapter = function () {
    if (this.elements.player) {
        var player = this.elements.player,
            chapters_container = player.querySelector('.ytp-chapters-container'),
            progress_bar = player.querySelector('.ytp-progress-bar');

        if (chapters_container && chapters_container.children && progress_bar) {
            var chapters = chapters_container.children,
                duration = player.getDuration(),
                current_width = player.getCurrentTime() / (duration / 100) * (progress_bar.offsetWidth / 100);

            for (var i = 0, l = chapters.length; i < l; i++) {
                var left = chapters[i].offsetLeft;

                if (current_width < left) {
                    player.seekTo(left / (progress_bar.offsetWidth / 100) * (duration / 100));

                    return false;
                }
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.7.12 SEEK PREVIOUS CHAPTER
------------------------------------------------------------------------------*/

ImprovedTube.shortcutSeekPreviousChapter = function () {
    if (this.elements.player) {
        var player = this.elements.player,
            chapters_container = player.querySelector('.ytp-chapters-container'),
            progress_bar = player.querySelector('.ytp-progress-bar');

        if (chapters_container && chapters_container.children && progress_bar) {
            var chapters = chapters_container.children,
                duration = player.getDuration(),
                current_width = player.getCurrentTime() / (duration / 100) * (progress_bar.offsetWidth / 100);

            for (var i = chapters.length - 1; i > 0; i--) {
                if (current_width > chapters[i].offsetLeft) {
                    var left = 0;

                    if (i > 0) {
                        left = chapters[i - 1].offsetLeft;
                    }

                    player.seekTo(left / (progress_bar.offsetWidth / 100) * (duration / 100));

                    return false;
                }
            }
        }
    }
};


/*------------------------------------------------------------------------------
4.7.13 INCREASE VOLUME
------------------------------------------------------------------------------*/

ImprovedTube.shortcutIncreaseVolume = function () {
    var player = this.elements.player,
        value = Number(this.storage.shortcut_volume_step) || 5;

    if (player) {
        player.setVolume(player.getVolume() + value);
        localStorage['yt-player-volume'] = JSON.stringify({
            data: JSON.stringify({
                volume: player.getVolume(),
                muted: player.isMuted(),
                expiration: Date.now(),
                creation: Date.now()
            })
        })
        sessionStorage['yt-player-volume'] = localStorage['yt-player-volume']

        this.showStatus(player.getVolume());
    }
};


/*------------------------------------------------------------------------------
4.7.14 DECREASE VOLUME
------------------------------------------------------------------------------*/

ImprovedTube.shortcutDecreaseVolume = function () {
    var player = this.elements.player,
        value = Number(this.storage.shortcut_volume_step) || 5;

    if (player) {
        player.setVolume(player.getVolume() - value);
        localStorage['yt-player-volume'] = JSON.stringify({
            data: JSON.stringify({
                volume: player.getVolume(),
                muted: player.isMuted(),
                expiration: Date.now(),
                creation: Date.now()
            })
        })
        sessionStorage['yt-player-volume'] = localStorage['yt-player-volume']

        this.showStatus(player.getVolume());
    }
};


/*------------------------------------------------------------------------------
4.7.15 SCREENSHOT
------------------------------------------------------------------------------*/

ImprovedTube.shortcutScreenshot = function () {
    this.screenshot();
};


/*------------------------------------------------------------------------------
4.7.16 INCREASE PLAYBACK SPEED
------------------------------------------------------------------------------*/

ImprovedTube.shortcutIncreasePlaybackSpeed = function () {
    var video = this.elements.video,
        value = Number(ImprovedTube.storage.shortcut_playback_speed_step) || .05;

    if (video) {
        video.playbackRate = video.playbackRate + value;

        ImprovedTube.showStatus(video.playbackRate);
    }
};


/*------------------------------------------------------------------------------
4.7.17 DECREASE PLAYBACK SPEED
------------------------------------------------------------------------------*/

ImprovedTube.shortcutDecreasePlaybackSpeed = function () {
    var video = this.elements.video,
        value = Number(ImprovedTube.storage.shortcut_playback_speed_step) || .05;

    if (video) {
        video.playbackRate = Math.max(video.playbackRate - value, .05);

        ImprovedTube.showStatus(video.playbackRate);
    }
};


/*------------------------------------------------------------------------------
4.7.18 RESET PLAYBACK SPEED
------------------------------------------------------------------------------*/

ImprovedTube.shortcutResetPlaybackSpeed = function () {
    var video = this.elements.video;

    if (video) {
        video.playbackRate = 1;

        ImprovedTube.showStatus(video.playbackRate);
    }
};


/*------------------------------------------------------------------------------
4.7.19 GO TO SEARCH BOX
------------------------------------------------------------------------------*/

ImprovedTube.shortcutGoToSearchBox = function () {
    var search = document.querySelector('#search');

    if (search) {
        search.focus();
    }
};


/*------------------------------------------------------------------------------
4.7.20 ACTIVATE FULLSCREEN
------------------------------------------------------------------------------*/

ImprovedTube.shortcutActivateFullscreen = function () {
    if (this.elements.player) {
        this.elements.player.toggleFullscreen();
    }
};


/*------------------------------------------------------------------------------
4.7.21 ACTIVATE CAPTIONS
------------------------------------------------------------------------------*/

ImprovedTube.shortcutActivateCaptions = function () {
    var player = this.elements.player;

    if (player && player.toggleSubtitlesOn) {
        player.toggleSubtitlesOn();
    }
};


/*------------------------------------------------------------------------------
4.7.22 LIKE
------------------------------------------------------------------------------*/

ImprovedTube.shortcutLike = function () {
    var like = (document.querySelectorAll('#menu #top-level-buttons-computed ytd-toggle-button-renderer')[0]);

    if (like) {
        like.click();
    }
};


/*------------------------------------------------------------------------------
4.7.23 DISLIKE
------------------------------------------------------------------------------*/

ImprovedTube.shortcutDislike = function () {
    var like = (document.querySelectorAll('#menu #top-level-buttons-computed ytd-toggle-button-renderer')[1]);

    if (like) {
        like.click();
    }
};


/*------------------------------------------------------------------------------
4.7.24 SUBSCRIBE
------------------------------------------------------------------------------*/

ImprovedTube.shortcutSubscribe = function () {
    if (this.elements.subscribe_button) {
        this.elements.subscribe_button.click();
    }
};


/*------------------------------------------------------------------------------
4.7.25 DARK THEME
------------------------------------------------------------------------------*/

ImprovedTube.shortcutDarkTheme = function () {
    if (document.documentElement.hasAttribute('dark')) {
        document.documentElement.removeAttribute('dark');
        document.documentElement.removeAttribute('it-theme');
    } else {
        document.documentElement.setAttribute('dark', '');
        document.documentElement.setAttribute('it-theme', 'true');
    }
};


/*------------------------------------------------------------------------------
4.7.26 CUSTOM MINI PLAYER
------------------------------------------------------------------------------*/

ImprovedTube.shortcutCustomMiniPlayer = function () {
    this.storage.mini_player = !this.storage.mini_player;

    this.miniPlayer();
};


/*------------------------------------------------------------------------------
4.7.27 STATS FOR NERDS
------------------------------------------------------------------------------*/

ImprovedTube.shortcutStatsForNerds = function () {
    var player = this.elements.player;

    if (player.isVideoInfoVisible()) {
        player.hideVideoInfo();
    } else {
        player.showVideoInfo();
    }
};


/*------------------------------------------------------------------------------
4.7.28 TOGGLE CARDS
------------------------------------------------------------------------------*/

ImprovedTube.shortcutToggleCards = function () {
    document.documentElement.toggleAttribute('it-player-hide-cards');
};


/*------------------------------------------------------------------------------
4.7.29 POPUP PLAYER
------------------------------------------------------------------------------*/

ImprovedTube.shortcutPopupPlayer = function () {
    var player = this.elements.player;

    if (document.documentElement.dataset.pageType === 'video' && player) {
        player.pauseVideo();

        window.open('//www.youtube.com/embed/' + location.href.match(/watch\?v=([A-Za-z0-9\-\_]+)/g)[0].slice(8) + '?start=' + parseInt(player.getCurrentTime()) + '&autoplay=' + (ImprovedTube.storage.player_autoplay == false ? '0' : '1'), '_blank', 'directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=' + player.offsetWidth + ',height=' + player.offsetHeight);
    }
};


/*------------------------------------------------------------------------------
4.8.0 BLACKLIST
------------------------------------------------------------------------------*/

document.addEventListener('ImprovedTubeBlacklist', function (event) {
    if (chrome && chrome.runtime) {
        var type = event.detail.type,
            id = event.detail.id,
            title = event.detail.title;

        if (!ImprovedTube.storage.blacklist || typeof ImprovedTube.storage.blacklist !== 'object') {
            ImprovedTube.storage.blacklist = {};
        }

        if (type === 'channel') {
            if (!ImprovedTube.storage.blacklist.channels) {
                ImprovedTube.storage.blacklist.channels = {};
            }

            ImprovedTube.storage.blacklist.channels[id] = {
                title: title,
                preview: event.detail.preview
            };
        }

        if (type === 'video') {
            if (!ImprovedTube.storage.blacklist.videos) {
                ImprovedTube.storage.blacklist.videos = {};
            }

            ImprovedTube.storage.blacklist.videos[id] = {
                title: title
            };
        }

        chrome.storage.local.set({
            blacklist: ImprovedTube.storage.blacklist
        });
    }
});

ImprovedTube.blacklist = function (type, node) {
    if (this.storage.blacklist_activate !== true) {
        for (var i = 0, l = this.elements.blacklist_buttons.length; i < l; i++) {
            this.elements.blacklist_buttons[i].remove();
        }

        return;
    } else if (this.isset(node) === false) {
        var a = document.querySelectorAll('a.ytd-thumbnail'),
            a2 = document.querySelectorAll('a[href*="/channel/"],a[href*="/user/"],a[href*="/c/"]'),
            subscribe_buttons = document.querySelectorAll('ytd-subscribe-button-renderer.ytd-c4-tabbed-header-renderer');

        for (var i = 0, l = a.length; i < l; i++) {
            this.blacklist('video', a[i]);
        }

        for (var i = 0, l = subscribe_buttons.length; i < l; i++) {
            this.blacklist('channel', subscribe_buttons[i]);
        }

        for (var i = 0, l = a2.length; i < l; i++) {
            this.blacklist('channel', a2[i]);
        }
    }

    if (!this.storage.blacklist || typeof this.storage.blacklist !== 'object') {
        this.storage.blacklist = {
            channels: {},
            videos: {}
        };
    }

    if (!this.storage.blacklist.channels || typeof this.storage.blacklist.channels !== 'object') {
        this.storage.blacklist.channels = {};
    }

    if (!this.storage.blacklist.videos || typeof this.storage.blacklist.videos !== 'object') {
        this.storage.blacklist.videos = {};
    }

    if (type === 'video') {
        var button = document.createElement('button'),
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path'),
            id = node.href.match(ImprovedTube.regex.video_id);

        button.className = 'it-add-to-blacklist';
        button.addEventListener('click', function (event) {
            if (this.parentNode.href) {
                var data = this.parentNode.parentNode.__data,
                    id = this.parentNode.href.match(ImprovedTube.regex.video_id),
                    title = '';

                if (
                    data &&
                    data.data &&
                    data.data.title &&
                    data.data.title.runs &&
                    data.data.title.runs[0]
                ) {
                    title = data.data.title.runs[0].text;
                } else if (
                    data &&
                    data &&
                    data.data &&
                    data.data.title.simpleText
                ) {
                    title = data.data.title.simpleText;
                }

                if (id && id[1]) {
                    document.dispatchEvent(new CustomEvent('ImprovedTubeBlacklist', {
                        detail: {
                            type: 'video',
                            id: id[1],
                            title: title
                        }
                    }));

                    ImprovedTube.storage.blacklist.videos[id[1]] = {
                        title: title
                    };

                    this.parentNode.parentNode.__dataHost.className += ' it-blacklisted-video';

                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        }, true);

        svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
        path.setAttributeNS(null, 'd', 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18A8 8 0 015.69 7.1L16.9 18.31A7.9 7.9 0 0112 20zm6.31-3.1L7.1 5.69A8 8 0 0118.31 16.9z');

        svg.appendChild(path);
        button.appendChild(svg);

        node.appendChild(button);

        this.elements.blacklist_buttons.push(button);

        if (id && id[1] && ImprovedTube.storage.blacklist.videos[id[1]]) {
            node.parentNode.__dataHost.className += ' it-blacklisted-video';
        }
    } else if (type === 'channel') {
        if (node.nodeName === 'A') {
            try {
                var id = node.href.replace(this.regex.channel_link, '');

                if (this.storage.blacklist.channels[id]) {
                    node.parentNode.__dataHost.__dataHost.className += ' it-blacklisted-video';
                }
            } catch (err) {}
        } else {
            var button = document.createElement('button'),
                id = location.href.replace(this.regex.channel_link, '');

            button.className = 'it-add-channel-to-blacklist';

            if (this.storage.blacklist.channels[id]) {
                button.innerText = 'Remove from blacklist';
                button.added = true;
            } else {
                button.innerText = 'Add to blacklist';
                button.added = false;
            }

            button.addEventListener('click', function (event) {
                var data = this.parentNode.__dataHost.__data.data,
                    id = location.href.replace(ImprovedTube.regex.channel_link, '');

                this.added = !this.added;

                document.dispatchEvent(new CustomEvent('ImprovedTubeBlacklist', {
                    detail: {
                        type: 'channel',
                        id: id,
                        title: data.title,
                        prevent: data.avatar.thumbnails[0].url
                    }
                }));

                ImprovedTube.storage.blacklist.channels[id] = {
                    title: data.title,
                    prevent: data.avatar.thumbnails[0].url
                };

                if (this.added) {
                    button.innerText = 'Remove from blacklist';
                } else {
                    button.innerText = 'Add to blacklist';
                }

                event.preventDefault();
                event.stopPropagation();
            }, true);

            this.elements.blacklist_buttons.push(button);

            node.parentNode.parentNode.appendChild(button);
        }
    }
};


/*------------------------------------------------------------------------------
4.9.0 ANALYZER
------------------------------------------------------------------------------*/

document.addEventListener('analyzer', function (event) {
    if (ImprovedTube.storage.analyzer_activation === true) {
        var data = event.detail.name,
            date = new Date().toDateString(),
            hours = new Date().getHours() + ':00';

        if (!ImprovedTube.storage.analyzer) {
            ImprovedTube.storage.analyzer = {};
        }

        if (!ImprovedTube.storage.analyzer[date]) {
            ImprovedTube.storage.analyzer[date] = {};
        }

        if (!ImprovedTube.storage.analyzer[date][hours]) {
            ImprovedTube.storage.analyzer[date][hours] = {};
        }

        if (!ImprovedTube.storage.analyzer[date][hours][data]) {
            ImprovedTube.storage.analyzer[date][hours][data] = 0;
        }

        ImprovedTube.storage.analyzer[date][hours][data]++;

        chrome.storage.local.set({
            analyzer: ImprovedTube.storage.analyzer
        });
    }
});


/*------------------------------------------------------------------------------
4.10.0 SETTINGS
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.10.1 IMPROVEDTUBE ICON
------------------------------------------------------------------------------*/

ImprovedTube.improvedtubeYoutubeIcon = function () {
    var data = localStorage.getItem('improvedtube-button-position'),
        x = 0,
        y = 0,
        option = this.storage.improvedtube_youtube_icon,
        button = this.elements.improvedtube_button;

    if (data) {
        data = JSON.parse(data);

        x = Math.min(Math.max(data.x, 0), document.body.offsetWidth - 48);
        y = Math.min(Math.max(data.y, 0), window.innerHeight - 48);
    }

    if (!button) {
        var label = document.createElement('span');

        button = document.createElement('button');

        button.className = 'it-button';

        button.addEventListener('mousedown', function (event) {
            if (ImprovedTube.storage.improvedtube_youtube_icon === 'draggable') {
                var x2 = event.layerX,
                    y2 = event.layerY;

                function mousemove(event) {
                    if (button.className.indexOf('dragging') === -1) {
                        button.classList.add('it-button--dragging');
                    }

                    x = Math.min(Math.max(event.clientX - x2, 0), document.body.offsetWidth - 48);
                    y = Math.min(Math.max(event.clientY - y2, 0), window.innerHeight - 48);

                    button.style.left = x + 'px';
                    button.style.top = y + 'px';
                }

                function mouseup() {
                    localStorage.setItem('improvedtube-button-position', JSON.stringify({
                        x,
                        y
                    }));

                    window.removeEventListener('mousemove', mousemove);
                    window.removeEventListener('mouseup', mouseup);
                }

                function click() {
                    button.classList.remove('it-button--dragging');

                    window.removeEventListener('click', click);
                }

                window.addEventListener('mousemove', mousemove);
                window.addEventListener('mouseup', mouseup);
                window.addEventListener('click', click);

                event.preventDefault();
            }
        });

        button.addEventListener('click', function () {
            if (this.classList.contains('it-button--dragging') === false) {
                var rect = this.getBoundingClientRect(),
                    left = rect.x,
                    top = rect.y,
                    scrim = document.createElement('div'),
                    iframe = document.createElement('iframe');

                scrim.className = 'it-button__scrim';
                scrim.addEventListener('click', function () {
                    scrim.remove();
                    iframe.remove();
                });

                iframe.className = 'it-button__iframe';
                iframe.src = '//www.youtube.com/improvedtube';

                if (document.body.offsetWidth - left < 308) {
                    left = document.body.offsetWidth - 308;
                }

                if (window.innerHeight - top < Math.min(500, window.innerHeight) + 8) {
                    top = window.innerHeight - Math.min(500, window.innerHeight) - 8;
                }

                iframe.style.left = left + 'px';
                iframe.style.top = top + 'px';

                document.body.appendChild(scrim);
                document.body.appendChild(iframe);
            }
        });

        label.textContent = 'ImprovedTube';

        button.appendChild(label);

        this.elements.improvedtube_button = button;
    }

    button.className = 'it-button';
    button.style.left = '';
    button.style.top = '';

    if (option === 'header_left') {
        if (this.elements.masthead.start) {
            this.elements.masthead.start.insertBefore(button, this.elements.masthead.start.children[0]);
        }
    } else if (option === 'header_right') {
        if (this.elements.masthead.end) {
            this.elements.masthead.end.appendChild(button);
        }
    } else if (option === 'below_player') {
        if (this.elements.video_title) {
            this.elements.video_title.appendChild(button);
        }
    } else if (option === 'sidebar') {
        if (this.elements.sidebar_section) {
            this.elements.sidebar_section.appendChild(button);
        }
    } else if (option === 'draggable') {
        if (document.body) {
            button.style.left = x + 'px';
            button.style.top = y + 'px';

            button.classList.add('it-button--draggable');

            document.body.appendChild(button);
        }
    } else if (button) {
        button.remove();
    }
};


/*-----------------------------------------------------------------------------
4.10.3 DELETE YOUTUBE COOKIES
-----------------------------------------------------------------------------*/

ImprovedTube.deleteYoutubeCookies = function () {
    var cookies = document.cookie.split(';');

    for (var i = 0, l = cookies.length; i < l; i++) {
        var cookie = cookies[i],
            eqPos = cookie.indexOf('='),
            name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

        document.cookie = name + '=; domain=.youtube.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    setTimeout(function () {
        location.reload();
    }, 100);
};


/*-----------------------------------------------------------------------------
4.10.4 YOUTUBE LANGUAGE
-----------------------------------------------------------------------------*/

ImprovedTube.youtubeLanguage = function (reload) {
    var value = this.storage.youtube_language;

    if (this.isset(value)) {
        var pref = this.getCookieValueByName('PREF');

        if (value !== 'default') {
            var hl = this.getParam(pref, 'hl');

            if (hl) {
                this.setCookie('PREF', pref.replace('hl=' + hl, 'hl=' + value));
            } else {
                this.setCookie('PREF', pref + '&hl=' + value);
            }
        } else if (reload !== false) {
            this.setCookie('PREF', pref.replace(/hl\=[^&]+/, ''));
        }

        if (reload !== false) {
            setTimeout(function () {
                location.reload();
            }, 100);
        }
    }
};


/*-----------------------------------------------------------------------------
4.10.5 DEFAULT CONTENT COUNTRY
-----------------------------------------------------------------------------*/

ImprovedTube.defaultContentCountry = function (reload) {
    var value = this.storage.default_content_country;

    if (this.isset(value)) {
        if (value !== 'default') {
            this.setCookie('s_gl', value);
        } else if (reload !== false) {
            document.cookie = 's_gl=; domain=.youtube.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }

        if (reload !== false) {
            setTimeout(function () {
                location.reload();
            }, 100);
        }
    }
};