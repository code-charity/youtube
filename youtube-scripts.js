/*------------------------------------------------------------------------------
>>> TABLE OF CONTENTS:
--------------------------------------------------------------------------------
1.0 Global variable

1.0 General
  1.1 YouTube home page
  1.2 Collapse of subscription sections
  1.3 Add "Scroll to top"
  1.4 Confirmation before closing
  1.5 Mark watched videos
  1.6 Only one player instance playing
  1.7 HD thumbnails
2.0 Appearance
  2.1 Player
    2.1.1 Player size
    2.1.2 Forced theater mode
    2.1.3 HD thumbnail
    2.1.4 Always show progress bar
  2.2 Sidebar
    2.2.1 Livechat
    2.2.2 Related videos
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
    # Quality
    # Picture in Picture
    # Toggle control
    # Play / pause
    # Stop
    # Toggle autoplay
    # Next videos
    # Previous video
    # Seek backward
    # Seek forward
    # Seek next chapter
    # Seek previous chapter
    # Increase volume
    # Decrease volume
    # Screenshot
    # Increase playback speed
    # Decrease playback speed
    # Go to search box
    # Activate fullscreen
    # Activate captions
    # Like
    # Dislike
    # Subscribe
    # Dark theme
    # Custom mini player
    # Stats for nerds
    # Toggle cards
    # Popup player
8.0 Blacklist
9.0 Analyzer
10.0 Settings
   10.1 ImprovedTube icon
   10.2 ImprovedTube button (sidebar)
   10.3 ImprovedTube player buttons
   10.4 Delete YouTube cookies
   10.5 YouTube language
   10.6 Default content country
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
        comments: {}
    }`,
    regex: `{
        channel: new RegExp('\/(user|channel|c)\/'),
        channel_home_page: new RegExp('\/(user|channel|c)\/.+(\/featured)?\/?$'),
        channel_home_page_postfix: new RegExp('\/(featured)?\/?$'),
        thumbnail_quality: new RegExp('(hqdefault\.jpg|hq720.jpg)+')
    }`,
    video_src: false,
    initialVideoUpdateDone: false,
    latestVideoDuration: 0,
    video_url: false,
    focus: false,
    played_before_blur: false,
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
    mini_player__mousedown_x: 0,
    mini_player__mousedown_y: 0,
    mini_player__player_offset_x: 0,
    mini_player__player_offset_y: 0,
    mini_player__resize_offset: 16,
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
        ImprovedTube.myColors();
        ImprovedTube.dim();
        ImprovedTube.font();
        ImprovedTube.themes();
        ImprovedTube.blacklist();
        //ImprovedTube.improvedtubeYoutubeSidebarButton();
        //ImprovedTube.improvedtubeYoutubePlayerButtons();
    });

    window.addEventListener('yt-page-data-updated', function () {
        ImprovedTube.pageType();
        ImprovedTube.videoPageUpdate();
        ImprovedTube.blacklist();
        //ImprovedTube.improvedtubeYoutubeSidebarButton();
        //ImprovedTube.improvedtubeYoutubePlayerButtons();
    });

    /*window.addEventListener('resize', function() {
        setTimeout(function() {
            ImprovedTube.playerSize();
        }, 100);
    });*/

    this.bluelight();
    this.defaultContentCountry();
    this.playerH264();
    this.player60fps();
    this.playerSDR();
    this.shortcuts();
    this.playerOnPlay();
    this.onkeydown();
    this.onmousedown();

    this.observer = new MutationObserver(function(mutationList) {
        for (var i = 0, l = mutationList.length; i < l; i++) {
            var mutation = mutationList[i];

            if (mutation.type === 'childList') {
                for (var j = 0, k = mutation.addedNodes.length; j < k; j++) {
                    var node = mutation.addedNodes[j];

                    if (node.nodeName === 'YTD-WATCH-FLEXY') {
                        ImprovedTube.elements.ytd_watch = node;

                        ImprovedTube.elements.ytd_player = node.querySelector('ytd-player');

                        if (
                            ImprovedTube.storage.player_size &&
                            ImprovedTube.storage.player_size !== 'do_not_change'
                        ) {
                            node.calculateCurrentPlayerSize_ = function() {
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

                        new MutationObserver(function(mutationList) {
                            for (var i = 0, l = mutationList.length; i < l; i++) {
                                var mutation = mutationList[i];

                                if (mutation.type === 'attributes') {
                                    if (mutation.attributeName === 'theater') {
                                        setTimeout(function() {
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
                    } else if (node.nodeName === 'YTD-TOGGLE-BUTTON-RENDERER') {
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
                    } if (node.nodeName === 'YTD-PLAYER') {
                        ImprovedTube.elements.ytd_player = node;

                        ImprovedTube.playerSize();
                    } else if (node.id === 'movie_player') {
                        ImprovedTube.elements.player = node;

                        ImprovedTube.dim();

                        ImprovedTube.elements.player_left_controls = node.querySelector('.ytp-left-controls');

                        ImprovedTube.elements.player_thumbnail = node.querySelector('.ytp-cued-thumbnail-overlay-image');

                        new MutationObserver(function(mutationList) {
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
                    } else if (node.nodeName === 'VIDEO') {
                        ImprovedTube.elements.video = node;
                    } else if (node.id === 'chat') {
                        ImprovedTube.elements.livechat.button = node.querySelector('ytd-toggle-button-renderer');
                        
                        ImprovedTube.livechat();
                    } else if (node.id === 'related' && node.className.indexOf('ytd-watch-flexy') !== -1) {
                        ImprovedTube.elements.related.container = node;

                        ImprovedTube.relatedVideos();
                    } else if (node.nodeName === 'YTD-COMMENTS-HEADER-RENDERER') {
                        ImprovedTube.elements.comments.container = node;

                        ImprovedTube.comments();
                    } else if (node.nodeName === 'DIV' && node.className.indexOf('ytp-ad-player-overlay') !== -1) {
                        ImprovedTube.playerAds(node);
                    } else if (node.nodeName === 'YTD-MASTHEAD') {
                        var logo = node.querySelector('a#logo');

                        ImprovedTube.elements.masthead = {
                            start: node.querySelector('#start'),
                            end: node.querySelector('#end')
                        };

                        ImprovedTube.improvedtubeYoutubeIcon();

                        if (logo) {
                            new MutationObserver(function(mutationList) {
                                for (var i = 0, l = mutationList.length; i < l; i++) {
                                    var mutation = mutationList[i];

                                    if (mutation.type === 'attributes') {
                                        if (mutation.attributeName === 'href') {
                                            ImprovedTube.youtubeHomePage(logo);
                                        }
                                    }
                                }
                            }).observe(logo, {
                                attributes: true,
                                attributeFilter: ['href'],
                                childList: false,
                                subtree: false
                            });
                        }
                    } else if (node.nodeName === 'YTD-VIDEO-PRIMARY-INFO-RENDERER') {
                        ImprovedTube.elements.video_title = node.querySelector('.title.ytd-video-primary-info-renderer');

                        ImprovedTube.improvedtubeYoutubeIcon();
                    } else if (node.nodeName === 'YTD-ITEM-SECTION-RENDERER') {
                        ImprovedTube.collapseOfSubscriptionSections(node);
                    } else if (node.nodeName === 'A' && node.href) {
                        ImprovedTube.youtubeHomePage(node);
                        ImprovedTube.channelDefaultTab(node);
                        ImprovedTube.markWatchedVideos(node);
                    } else if (node.nodeName === 'IMG') {
                        if (node.src) {
                            ImprovedTube.hdThumbnails(node);
                        } else {
                            var observer = new MutationObserver(function(mutationList) {
                                for (var i = 0, l = mutationList.length; i < l; i++) {
                                    var mutation = mutationList[i];

                                    if (mutation.type === 'attributes') {
                                        if (mutation.attributeName === 'src') {
                                            ImprovedTube.hdThumbnails(mutation.target);
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
                    } else if (node.nodeName === 'YTD-VIDEO-SECONDARY-INFO-RENDERER') {
                        ImprovedTube.elements.yt_channel_name = node.querySelector('ytd-channel-name');
                        ImprovedTube.elements.yt_channel_link = node.querySelector('ytd-channel-name a');
                        ImprovedTube.howLongAgoTheVideoWasUploaded();
                        ImprovedTube.channelVideosCount();
                    }
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
0.0 PAGE
------------------------------------------------------------------------------*/

ImprovedTube.pageType = function () {
    if (location.pathname === '/') {
        document.documentElement.dataset.pageType = 'home';
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


/*------------------------------------------------------------------------------
0.0 PLAYER
------------------------------------------------------------------------------*/

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

            if (ImprovedTube.elements.player && ImprovedTube.video_url !== location.href) {
                ImprovedTube.video_url = location.href;
                ImprovedTube.played_before_blur = false;

                ImprovedTube.forcedTheaterMode();
                ImprovedTube.playerPlaybackSpeed();
                ImprovedTube.subtitles();
                ImprovedTube.playerQuality();
                ImprovedTube.playerVolume();

                if (location.href.indexOf('/embed/') === -1) {
                    ImprovedTube.mini_player();
                }
            }

            return original.apply(this, arguments);
        }
    })(HTMLMediaElement.prototype.play);
};

ImprovedTube.playerOnLoadedMetadata = function() {
    setTimeout(function() {
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
};

ImprovedTube.playerOnPause = function (event) {
    ImprovedTube.playlistUpNextAutoplay(event);
};

ImprovedTube.playerOnEnded = function (event) {
    ImprovedTube.playlistUpNextAutoplay(event);
};


/*------------------------------------------------------------------------------
0.0 ONKEYDOWN
------------------------------------------------------------------------------*/

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


/*------------------------------------------------------------------------------
0.0 ONMOUSEDOWN
------------------------------------------------------------------------------*/

ImprovedTube.onmousedown = function (event) {
    window.addEventListener('mousedown', function (event) {
        if (ImprovedTube.elements.player && ImprovedTube.elements.player.className.indexOf('ad-showing') === -1) {
            var path = event.composedPath();

            for (var i = 0, l = path.length; i < l; i++) {
                if (
                    path[i].className &&
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

ImprovedTube.reverse = function (parent) {
    for (var i = 1, l = parent.childNodes.length; i < l; i++) {
        parent.insertBefore(parent.childNodes[i], parent.firstChild);
    }
};


/*------------------------------------------------------------------------------
1.0 GENERAL
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
1.1 YOUTUBE HOME PAGE
------------------------------------------------------------------------------*/

ImprovedTube.youtubeHomePage = function (node) {
    var option = this.storage.youtube_home_page;

    if (
        option === '/feed/trending' ||
        option === '/feed/subscriptions' ||
        option === '/feed/history' ||
        option === '/playlist?list=WL' ||
        option === '/playlist?list=LL' ||
        option === '/feed/library'
    ) {
        if (
            (
                node.href === '/' ||
                node.href === 'https://www.youtube.com/'
            ) &&
            node.getAttribute('role') !== 'tablist'
        ) {
            node.href = option;

            node.addEventListener('click', function () {
                if (
                    this.data &&
                    this.data.commandMetadata &&
                    this.data.commandMetadata.webCommandMetadata &&
                    this.data.commandMetadata.webCommandMetadata.url
                ) {
                    this.data.commandMetadata.webCommandMetadata.url = ImprovedTube.storage.youtube_home_page;
                }
            }, true);
        }
    }
};


/*------------------------------------------------------------------------------
1.2 COLLAPSE OF SUBSCRIPTION SECTION
------------------------------------------------------------------------------*/

ImprovedTube.collapseOfSubscriptionSections = function (node) {
    if (this.storage.collapse_of_subscription_sections === true) {
        if (location.href.indexOf('/feed/subscriptions') !== -1) {
            var section_title = node.querySelector('h2');

            if (!node.querySelector('.it-section-collapse') && section_title) {
                var button = document.createElement('div'),
                    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
                    path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

                button.className = 'it-section-collapse';
                button.section = node;
                
                button.addEventListener('click', function () {
                    var section = this.section,
                        content = section.querySelector('.grid-subheader + #contents, .shelf-title-table + .multirow-shelf');

                    if (section.classList.contains('it-section-collapsed') === false) {
                        content.style.height = content.offsetHeight + 'px';
                        content.style.transition = 'height 150ms';
                    }

                    setTimeout(function () {
                        section.classList.toggle('it-section-collapsed');
                    });
                });

                svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
                path.setAttributeNS(null, 'd', 'M7.4 15.4l4.6-4.6 4.6 4.6L18 14l-6-6-6 6z');

                svg.appendChild(path);

                button.appendChild(svg);

                section_title.parentNode.insertBefore(button, section_title.nextSibling);
            }
        }
    }
};


/*------------------------------------------------------------------------------
1.3 ADD "SCROLL TO TOP"
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

        svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
        path.setAttributeNS(null, 'd', 'M13 19V7.8l4.9 5c.4.3 1 .3 1.4 0 .4-.5.4-1.1 0-1.5l-6.6-6.6a1 1 0 0 0-1.4 0l-6.6 6.6a1 1 0 1 0 1.4 1.4L11 7.8V19c0 .6.5 1 1 1s1-.5 1-1z');

        svg.appendChild(path);
        button.appendChild(svg);
        document.body.appendChild(button);

        window.addEventListener('scroll', function () {
            if (window.scrollY > window.innerHeight / 2) {
                document.documentElement.setAttribute('it-show-scroll-to-top', true);
            } else {
                document.documentElement.setAttribute('it-show-scroll-to-top', false);
            }
        });
    }
};


/*------------------------------------------------------------------------------
1.4 CONFIRMATION BEFORE CLOSING
------------------------------------------------------------------------------*/

ImprovedTube.confirmationBeforeClosing = function () {
    window.onbeforeunload = function () {
        if (ImprovedTube.storage.confirmation_before_closing === true) {
            return 'You have attempted to leave this page. Are you sure?';
        }
    };
};


/*------------------------------------------------------------------------------
1.5 MARK WATCHED VIDEOS
------------------------------------------------------------------------------*/

ImprovedTube.markWatchedVideos = function (node) {
    if (this.storage.mark_watched_videos === true) {
        if (
            node.id === 'thumbnail' && node.className.indexOf('ytd-thumbnail') !== -1 ||
            node.className.indexOf('thumb-link') !== -1
        ) {
            var button = document.createElement('div'),
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
        }
    }
};

document.addEventListener('ImprovedTubeWatched', function (event) {
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
            name: 'improvedtube-only-one-player'
        });
    }
});


/*------------------------------------------------------------------------------
1.7 HD THUMBNAILS
------------------------------------------------------------------------------*/

ImprovedTube.hdThumbnails = function (node) {
    if (this.storage.hd_thumbnails === true) {
        if (this.regex.thumbnail_quality.test(node.src)) {
            node.dataset.defaultSrc = node.src;

            node.onload = function () {
                if (this.naturalHeight <= 90) {
                    this.src = this.dataset.defaultSrc;
                }
            };

            node.src = node.src.replace(this.regex.thumbnail_quality, 'maxresdefault.jpg');
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
2.1.1 PLAYER SIZE
------------------------------------------------------------------------------*/

ImprovedTube.playerSize = function () {
    if (window.self === window.top && this.storage.player_size === 'fit_to_window' && this.elements.ytd_watch && this.elements.ytd_player) {
        var video = ImprovedTube.elements.video,
            aspect_ratio = video.videoWidth / video.videoHeight,
            width,
            height,
            max_height = window.innerHeight - 56,
            style = this.elements.player_size_style || document.createElement('style');
        
        if (this.elements.ytd_watch.theater === true) {
            width = this.elements.ytd_player.offsetWidth;

            style.textContent = '[data-page-type="video"][it-player-size="fit_to_window"] ytd-app:not([player-fullscreen_]) ytd-watch-flexy[theater]:not([fullscreen]) video {';
        } else {
            width = ImprovedTube.elements.ytd_watch.offsetWidth;
            
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

        setTimeout(function() {
            window.dispatchEvent(new Event('resize'));
        }, 50);
    }
};

/*------------------------------------------------------------------------------
2.1.2 FORCED THEATER MODE
------------------------------------------------------------------------------*/

ImprovedTube.forcedTheaterMode = function () {
    if (window.self === window.top && this.storage.forced_theater_mode === true) {
        var button = this.elements.player.querySelector('button.ytp-size-button');

        if (button && this.elements.ytd_watch.theater === false) {
            setTimeout(function() {
                button.click();
            }, 200);
        }
    }
};


/*------------------------------------------------------------------------------
2.1.3 HD THUMBNAIL
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
2.1.4 ALWAYS SHOW PROGRESS BAR
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
2.2 SIDEBAR
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
2.2.1 LIVECHAT
------------------------------------------------------------------------------*/

ImprovedTube.livechat = function () {
    if (this.storage.livechat === 'collapsed') {
        ImprovedTube.elements.livechat.button.click();
    }
};


/*------------------------------------------------------------------------------
2.2.2 RELATED VIDEOS
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
2.3 DETAILS
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
2.3.1 HOW LONG AGO THE VIDEO WAS UPLOADED
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
2.3.2 SHOW CHANNEL VIDEOS COUNT
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
2.4 COMMENTS
------------------------------------------------------------------------------*/

ImprovedTube.comments = function () {
    if (this.storage.comments === 'collapsed' || this.elements.comments.button) {
        var button = document.createElement('button'),
            content = document.createElement('span'),
            show_more = document.createElement('span'),
            show_less = document.createElement('span'),
            parent = this.elements.comments.container;

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

        parent.appendChild(button);

        this.elements.comments.button = button;
    }
};


/*------------------------------------------------------------------------------
3.0 THEMES
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
3.1 MY COLORS
------------------------------------------------------------------------------*/

ImprovedTube.myColors = function () {
    if (this.storage.theme_my_colors === true) {
        var style = this.elements.my_colors || document.createElement('style');

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

        this.elements.my_colors = style;

        document.documentElement.appendChild(style);
    } else if (this.elements.my_colors) {
        this.elements.my_colors.remove();
    }
};


/*------------------------------------------------------------------------------
3.2 BLUELIGHT
------------------------------------------------------------------------------*/

ImprovedTube.bluelight = function () {
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

    if (this.storage.schedule === 'sunset_to_sunrise' || current_time < times.from && current_time >= times.to) {
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
3.3 DIM
------------------------------------------------------------------------------*/

ImprovedTube.dim = function () {
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
    }

    if (this.storage.schedule === 'sunset_to_sunrise' || current_time < times.from && current_time >= times.to) {
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
3.4 FONT
------------------------------------------------------------------------------*/

ImprovedTube.font = function () {
    if (this.storage.font === true && this.storage.font !== 'Default') {
        var link = this.elements.myFont || document.createElement('link');

        link.rel = 'stylesheet';
        link.href = '//fonts.googleapis.com/css2?family=' + this.storage.font;

        this.elements.myFont = link;

        document.documentElement.style.fontFamily = this.storage.font.replace(/\+/g, ' ');
        
        document.documentElement.appendChild(link);
    } else if (this.elements.myFont) {
        this.elements.myFont.remove();

        document.documentElement.style.fontFamily = '';
    }
};


/*------------------------------------------------------------------------------
3.5 THEMES
------------------------------------------------------------------------------*/

ImprovedTube.themes = function () {
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
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.1 AUTOPLAY
------------------------------------------------------------------------------*/

ImprovedTube.autoplay = function (video) {
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
        setTimeout(function () {
            video.parentNode.parentNode.pauseVideo();
        });
    }
};


/*------------------------------------------------------------------------------
4.2 AUTOPAUSE WHEN SWITCHING TABS
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
4.3 FORCED PLAYBACK SPEED
------------------------------------------------------------------------------*/

ImprovedTube.playerPlaybackSpeed = function (node) {
    if (
        ImprovedTube.storage.player_forced_playback_speed === true &&
        ImprovedTube.isset(ImprovedTube.storage.player_playback_speed)
    ) {
        var player = ImprovedTube.elements.player,
            video_data = player.getVideoData();

        if (window.location.href.indexOf('music') === -1 && !video_data.isLive) {
            player.setPlaybackRate(Number(ImprovedTube.storage.player_playback_speed));
        } else {
            player.setPlaybackRate(1);
        }
    }
};


/*------------------------------------------------------------------------------
4.4 SUBTITLES
------------------------------------------------------------------------------*/

ImprovedTube.subtitles = function () {

};


/*------------------------------------------------------------------------------
4.5 UP NEXT AUTOPLAY
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
4.6 ADS
------------------------------------------------------------------------------*/

ImprovedTube.playerAds = function (parent) {
    if (this.storage.player_ads === 'block_all') {
        var button = parent.querySelector('.ytp-ad-skip-button.ytp-button');

        if (button) {
            button.click();
        }
    } else if (this.storage.player_ads === 'subscribed_channels') {
        var button = parent.querySelector('.ytp-ad-skip-button.ytp-button');

        if (button && !parent.querySelector('#meta paper-button[subscribed]')) {
            button.click();
        }
    }
};


/*------------------------------------------------------------------------------
4.7 CUSTOM MINI-PLAYER
------------------------------------------------------------------------------*/

ImprovedTube.mini_player__setPosition = function (x, y) {
    ImprovedTube.elements.player.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
};

ImprovedTube.mini_player__setSize = function (width, height) {
    ImprovedTube.elements.player.style.width = width + 'px';
    ImprovedTube.elements.player.style.height = height + 'px';
};

ImprovedTube.mini_player__scroll = function () {
    if (window.scrollY >= 256 && ImprovedTube.mini_player__mode === false && ImprovedTube.elements.player.classList.contains('ytp-player-minimized') === false) {
        ImprovedTube.mini_player__mode = true;

        ImprovedTube.mini_player__original_width = ImprovedTube.elements.player.offsetWidth;
        ImprovedTube.mini_player__original_height = ImprovedTube.elements.player.offsetHeight;

        ImprovedTube.elements.player.classList.add('it-mini-player');

        ImprovedTube.mini_player__x = Math.max(0, Math.min(ImprovedTube.mini_player__x, document.body.offsetWidth - ImprovedTube.mini_player__width));
        ImprovedTube.mini_player__y = Math.max(0, Math.min(ImprovedTube.mini_player__y, window.innerHeight - ImprovedTube.mini_player__height));

        ImprovedTube.mini_player__cursor = '';
        document.documentElement.removeAttribute('it-mini-player-cursor');

        ImprovedTube.mini_player__setPosition(ImprovedTube.mini_player__x, ImprovedTube.mini_player__y);

        ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__width, ImprovedTube.mini_player__height);

        window.addEventListener('mousedown', ImprovedTube.mini_player__mousedown);
        window.addEventListener('mousemove', ImprovedTube.mini_player__cursorUpdate);

        window.dispatchEvent(new Event('resize'));
    } else if (window.scrollY < 256 && ImprovedTube.mini_player__mode === true || ImprovedTube.elements.player.classList.contains('ytp-player-minimized') === true) {
        ImprovedTube.mini_player__mode = false;
        ImprovedTube.elements.player.classList.remove('it-mini-player');
        ImprovedTube.mini_player__move = false;
        ImprovedTube.mini_player__setPosition(0, 0);
        ImprovedTube.elements.player.style.width = '';
        ImprovedTube.elements.player.style.height = '';

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

    setTimeout(function () {
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

ImprovedTube.mini_player__resize = function (event) {
    if (ImprovedTube.mini_player__cursor !== '') {
        window.removeEventListener('mousemove', ImprovedTube.mini_player__cursorUpdate);
        window.addEventListener('mouseup', ImprovedTube.mini_player__resize_mouseUp);
        window.addEventListener('mousemove', ImprovedTube.mini_player__resize_mouseMove);

        return true;
    }
};

ImprovedTube.mini_player__resize_mouseMove = function (event) {
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

ImprovedTube.mini_player__resize_mouseUp = function (event) {
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

    window.addEventListener('mousemove', ImprovedTube.mini_player__cursorUpdate);
    window.removeEventListener('mouseup', ImprovedTube.mini_player__resize_mouseUp);
    window.removeEventListener('mousemove', ImprovedTube.mini_player__resize_mouseMove);
};

ImprovedTube.mini_player = function () {
    if (ImprovedTube.storage.mini_player === true) {
        var strg = JSON.parse(localStorage.getItem('improedtube-mini-player')) || {};

        ImprovedTube.mini_player__x = ImprovedTube.isset(strg.x) ? strg.x : 16;
        ImprovedTube.mini_player__y = ImprovedTube.isset(strg.y) ? strg.y : 16;
        ImprovedTube.mini_player__width = strg.width || 200;
        ImprovedTube.mini_player__height = strg.height || 150;

        window.addEventListener('scroll', ImprovedTube.mini_player__scroll);
    } else {
        ImprovedTube.mini_player__mode = false;
        ImprovedTube.elements.player.classList.remove('it-mini-player');
        ImprovedTube.mini_player__move = false;
        ImprovedTube.mini_player__setPosition(0, 0);
        ImprovedTube.elements.player.style.width = '';
        ImprovedTube.elements.player.style.height = '';

        ImprovedTube.elements.player.classList.remove('it-mini-player');

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
4.9 QUALITY
------------------------------------------------------------------------------*/

ImprovedTube.playerQuality = function () {
    var quality = this.storage.player_quality;

    if (this.elements.player.getAvailableQualityLevels) {
        var available_quality_levels = this.elements.player.getAvailableQualityLevels();

        if (quality && quality !== 'auto') {
            if (available_quality_levels.indexOf(quality) === -1) {
                quality = available_quality_levels[0];
            }

            this.elements.player.setPlaybackQualityRange(quality);
            this.elements.player.setPlaybackQuality(quality);
        }
    }
};


/*------------------------------------------------------------------------------
4.10 CODEC H.264
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
4.11 ALLOW 60FPS
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
4.12 FORCED VOLUME
------------------------------------------------------------------------------*/

ImprovedTube.playerVolume = function () {
    if (ImprovedTube.storage.player_forced_volume === true) {
        var volume = ImprovedTube.storage.player_volume;

        if (!ImprovedTube.isset(volume)) {
            volume = 100;
        } else {
            volume = Number(volume);
        }

        ImprovedTube.elements.player.setVolume(volume);
    }
};


/*------------------------------------------------------------------------------
4.13 LOUDNESS NORMALIZATION
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
4.14 SCREENSHOT
------------------------------------------------------------------------------*/

ImprovedTube.screenshot = function () {
    document.body.style.opacity = '0';

    var video = this.elements.video,
        cvs = document.createElement('canvas'),
        ctx = cvs.getContext('2d'),
        old_w = video.offsetWidth,
        old_h = video.offsetHeight;

    video.style.width = video.videoWidth + 'px';
    video.style.height = video.videoHeight + 'px';

    setTimeout(function () {
        cvs.width = video.videoWidth;
        cvs.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, cvs.width, cvs.height);

        cvs.toBlob(function (blob) {
            if (ImprovedTube.storage.player_screenshot_save_as !== 'clipboard') {
                var a = document.createElement('a');

                a.href = URL.createObjectURL(blob);

                a.download = location.href.match(/(\?|\&)v=[^&]+/)[0].substr(3) + '-' + new Date(ImprovedTube.elements.player.getCurrentTime() * 1000).toISOString().substr(11, 8).replace(/:/g, '-') + '.png';

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

            setTimeout(function () {
                video.style.width = old_w + 'px';
                video.style.height = old_h + 'px';

                document.body.style.opacity = '1';
            }, 100);
        });
    }, 100);
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
4.15 REPEAT
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
4.16 ROTATE
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

                    transform += ' scale(' + (is_vertical_video ? player.clientWidth : player.clientHeight) / (is_vertical_video ? player.clientHeight : player.clientWidth); + ')';
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
4.17 POPUP PLAYER
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
4.18 Force SDR
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
4.19 Hide controls
------------------------------------------------------------------------------*/

ImprovedTube.playerControls = function () {
    if (this.storage.player_hide_controls === true) {
        this.elements.player.hideControls();
    } else {
        this.elements.player.showControls();
    }
};


/*------------------------------------------------------------------------------
5.0 PLAYLIST
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
5.1 UP NEXT AUTOPLAY
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
5.2 REVERSE
------------------------------------------------------------------------------*/

ImprovedTube.playlistReverse = function () {
    if (this.storage.playlist_reverse === true) {
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

                setTimeout(updateNextButton, 500);

                if (playlist_manager && playlist_manager.autoplayData) {
                    ImprovedTube.playlistAutoplayData = Object.assign({}, playlist_manager.autoplayData);
                }

                ImprovedTube.reverse(document.querySelector('ytd-playlist-panel-renderer .playlist-items'));

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

        if (ImprovedTube.playlistReversed === true) {
            setTimeout(function () {
                ImprovedTube.reverse(document.querySelector('ytd-playlist-panel-renderer .playlist-items'));

                setTimeout(updateNextButton, 1000);
            }, 500);
        }
    }
};


/*------------------------------------------------------------------------------
5.3 REPEAT
------------------------------------------------------------------------------*/

ImprovedTube.playlistRepeat = function () {
    var button = ImprovedTube.elements.playlist.repeat_button,
        option = ImprovedTube.storage.playlist_repeat;

    if (button && (option === true && button.className.search('style-default-active') === -1 || option === 'disabled' && button.className.indexOf('style-default-active') !== -1)) {
        button.click();
    }
};


/*------------------------------------------------------------------------------
5.4 SHUFFLE
------------------------------------------------------------------------------*/

ImprovedTube.playlistShuffle = function () {
    var button = ImprovedTube.elements.playlist.shuffle_button,
        option = ImprovedTube.storage.playlist_shuffle;

    if (button && (option === true && button.className.search('style-default-active') === -1 || option === 'disabled' && button.className.indexOf('style-default-active') !== -1)) {
        button.click();
    }
};


/*------------------------------------------------------------------------------
6.0 CHANNEL
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
6.1 DEFAULT CHANNEL TAB
------------------------------------------------------------------------------*/

ImprovedTube.channelDefaultTab = function (a) {
    var option = this.storage.channel_default_tab;

    if (option && option !== '/') {
        if (this.regex.channel_home_page.test(a.href)) {
            if (!a.dataset.itOrigin) {
                a.dataset.itOrigin = a.href.replace(this.regex.channel_home_page_postfix, '');
            }

            a.href = a.dataset.itOrigin + option;

            /*if (
                a.data &&
                a.data.browseEndpoint &&
                a.data.browseEndpoint.canonicalBaseUrl
            ) {
                a.data.browseEndpoint.canonicalBaseUrl = a.href.replace('https://www.youtube.com', '');
            }

            if (
                a.data &&
                a.data.commandMetadata &&
                a.data.commandMetadata.webCommandMetadata &&
                a.data.commandMetadata.webCommandMetadata.url
            ) {
                a.data.commandMetadata.webCommandMetadata.url = a.href.replace('https://www.youtube.com', '');
            }*/

            a.addEventListener('click', function(event) {
                event.stopPropagation();
            }, true);
        }
    }
};


/*------------------------------------------------------------------------------
7.0 SHORTCUTS
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
# QUALITY
------------------------------------------------------------------------------*/

ImprovedTube.shortcutQuality = function (key) {
    if (this.elements.player) {
        var value = key.replace('shortcut', '').toLowerCase();

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
# PICTURE IN PICTURE
------------------------------------------------------------------------------*/

ImprovedTube.shortcutPictureInPicture = function () {
    if (this.elements.video) {
        this.elements.video.requestPictureInPicture();
    }
};


/*------------------------------------------------------------------------------
# TOGGLE CONTROLS
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
# PLAY / PAUSE
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
# STOP
------------------------------------------------------------------------------*/

ImprovedTube.shortcutStop = function () {
    if (this.elements.player) {
        this.elements.player.stopVideo();
    }
};


/*------------------------------------------------------------------------------
# TOGGLE AUTOPLAY
------------------------------------------------------------------------------*/

ImprovedTube.shortcutToggleAutoplay = function () {
    var toggle = document.querySelector('.ytp-autonav-toggle-button'),
        attribute = toggle.getAttribute('aria-checked') === 'true';

    if (toggle) {
        toggle.click();
    }
};


/*------------------------------------------------------------------------------
# NEXT VIDEO
------------------------------------------------------------------------------*/

ImprovedTube.shortcutNextVideo = function () {
    if (this.elements.player) {
        this.elements.player.nextVideo();
    }
};


/*------------------------------------------------------------------------------
# PREVIOUS VIDEO
------------------------------------------------------------------------------*/

ImprovedTube.shortcutPrevVideo = function () {
    if (this.elements.player) {
        this.elements.player.previousVideo();
    }
};


/*------------------------------------------------------------------------------
# SEEK BACKWARD
------------------------------------------------------------------------------*/

ImprovedTube.shortcutSeekBackward = function () {
    if (this.elements.player) {
        this.elements.player.seekBy(-10);
    }
};


/*------------------------------------------------------------------------------
# SEEK FORWARD
------------------------------------------------------------------------------*/

ImprovedTube.shortcutSeekForward = function () {
    if (this.elements.player) {
        this.elements.player.seekBy(10);
    }
};


/*------------------------------------------------------------------------------
# SEEK NEXT CHAPTER
------------------------------------------------------------------------------*/

ImprovedTube.shortcutSeekNextChapter = function () {
    var player = this.elements.player;
    
    if (player) {
        var duration = player.getDuration(),
            current_time = player.getCurrentTime(),
            chapters_container = player.querySelector('.ytp-chapters-container'),
            progress_bar_width = player.querySelector('.ytp-chrome-bottom').offsetWidth,
            current_width = 0;

        if (!player || !player.seekBy || !progress_bar_width || !chapters_container || !chapters_container.children) {
            return;
        }

        var chapters = chapters_container.children;

        for (var i = 0, l = chapters.length; i < l; i++) {
            var width = chapters[i].offsetWidth;

            if (
                (current_width - 2) / progress_bar_width <= current_time / duration &&
                (current_width - 2 + width) / progress_bar_width >= current_time / duration
            ) {
                player.seekTo(((width + current_width) / progress_bar_width) * duration);

                return;
            }

            current_width += width + 2;
        }
    }
};


/*------------------------------------------------------------------------------
# SEEK PREVIOUS CHAPTER
------------------------------------------------------------------------------*/

ImprovedTube.shortcutSeekPreviousChapter = function () {
    var player = this.elements.player;
    
    if (player) {
        var duration = player.getDuration(),
            current_time = player.getCurrentTime(),
            chapters_container = player.querySelector('.ytp-chapters-container'),
            progress_bar_width = player.querySelector('.ytp-chrome-bottom').offsetWidth,
            current_width = 0;

        if (!player || !player.seekBy || !progress_bar_width || !chapters_container || !chapters_container.children) {
            return;
        }

        var chapters = chapters_container.children;

        for (var i = 0, l = chapters.length; i < l; i++) {
            var width = chapters[i].offsetWidth;

            if (
                (current_width + 2) / progress_bar_width <= current_time / duration &&
                (current_width + 2 + width) / progress_bar_width >= current_time / duration
            ) {
                player.seekTo(((current_width - 2) / progress_bar_width) * duration);

                return;
            }

            current_width += width + 2;
        }
    }
};


/*------------------------------------------------------------------------------
# INCREASE VOLUME
------------------------------------------------------------------------------*/

ImprovedTube.shortcutIncreaseVolume = function () {
    var player = this.elements.player;

    if (player) {
        player.setVolume(player.getVolume() + (Number(ImprovedTube.storage.shortcut_volume_step) || 5));

        ImprovedTube.showStatus(player.getVolume());
    }
};


/*------------------------------------------------------------------------------
# DECREASE VOLUME
------------------------------------------------------------------------------*/

ImprovedTube.shortcutDecreaseVolume = function () {
    var player = this.elements.player;
    
    if (player) {
        player.setVolume(player.getVolume() - (Number(ImprovedTube.storage.shortcut_volume_step) || 5));

        ImprovedTube.showStatus(player.getVolume());
    }
};


/*------------------------------------------------------------------------------
# SCREENSHOT
------------------------------------------------------------------------------*/

ImprovedTube.shortcutScreenshot = function () {
    this.screenshot();
};


/*------------------------------------------------------------------------------
# INCREASE PLAYBACK SPEED
------------------------------------------------------------------------------*/

ImprovedTube.shortcutIncreasePlaybackSpeed = function () {
    var video = this.elements.video,
        value = Number(ImprovedTube.storage.shortcut_playback_speed_step) || .05;

    if (video) {
        if (video.playbackRate < 1 && video.playbackRate > 1 - value) {
            video.playbackRate = 1
        } else {
            video.playbackRate = Math.max(video.playbackRate + value, .1);
        }

        ImprovedTube.showStatus(video.playbackRate);
    }
};


/*------------------------------------------------------------------------------
# DECREASE PLAYBACK SPEED
------------------------------------------------------------------------------*/

ImprovedTube.shortcutDecreasePlaybackSpeed = function () {
    var video = this.elements.video,
        value = Number(ImprovedTube.storage.shortcut_playback_speed_step) || .05;

    if (video) {
        if (video.playbackRate < .15 + value) {
            video.playbackRate = 1
        } else {
            video.playbackRate = Math.max(video.playbackRate - value, .1);
        }

        ImprovedTube.showStatus(video.playbackRate);
    }
};


/*------------------------------------------------------------------------------
# GO TO SEARCH BOX
------------------------------------------------------------------------------*/

ImprovedTube.shortcutGoToSearchBox = function () {
    var search = document.querySelector('#search');

    if (search) {
        search.focus();
    }
};


/*------------------------------------------------------------------------------
# ACTIVATE FULLSCREEN
------------------------------------------------------------------------------*/

ImprovedTube.shortcutActivateFullscreen = function () {
    if (this.elements.player) {
        this.elements.player.toggleFullscreen();
    }
};


/*------------------------------------------------------------------------------
# ACTIVATE CAPTIONS
------------------------------------------------------------------------------*/

ImprovedTube.shortcutActivateCaptions = function () {
    var player = this.elements.player;

    if (player && player.querySelector('.ytp-subtitles-button')) {
        player.querySelector('.ytp-subtitles-button').click();
    }
};


/*------------------------------------------------------------------------------
# LIKE
------------------------------------------------------------------------------*/

ImprovedTube.shortcutLike = function () {
    var like = (document.querySelectorAll('#menu #top-level-buttons-computed ytd-toggle-button-renderer')[0]);

    if (like) {
        like.click();
    }
};


/*------------------------------------------------------------------------------
# DISLIKE
------------------------------------------------------------------------------*/

ImprovedTube.shortcutDislike = function () {
    var like = (document.querySelectorAll('#menu #top-level-buttons-computed ytd-toggle-button-renderer')[1]);

    if (like) {
        like.click();
    }
};


/*------------------------------------------------------------------------------
# SUBSCRIBE
------------------------------------------------------------------------------*/

ImprovedTube.shortcutSubscribe = function () {
    var button = document.querySelector('#subscribe-button .ytd-subscribe-button-renderer');

    if (button) {
        button.click();
    }
};


/*------------------------------------------------------------------------------
# DARK THEME
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
# CUSTOM MINI PLAYER
------------------------------------------------------------------------------*/

ImprovedTube.shortcutCustomMiniPlayer = function () {
    ImprovedTube.storage.mini_player = !ImprovedTube.storage.mini_player;

    ImprovedTube.mini_player();

    if (ImprovedTube.storage.mini_player === true) {
        ImprovedTube.mini_player__mode = true;

        ImprovedTube.mini_player__original_width = ImprovedTube.elements.player.offsetWidth;
        ImprovedTube.mini_player__original_height = ImprovedTube.elements.player.offsetHeight;

        ImprovedTube.elements.player.classList.add('it-mini-player');

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
};


/*------------------------------------------------------------------------------
# STATS FOR NERDS
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
# TOGGLE CARDS
------------------------------------------------------------------------------*/

ImprovedTube.shortcutToggleCards = function () {
    if (document.documentElement.getAttribute('it-player-hide-cards')) {
        document.documentElement.removeAttribute('it-player-hide-cards');
        return;
    }

    document.documentElement.setAttribute('it-player-hide-cards', true);
};


/*------------------------------------------------------------------------------
# POPUP PLAYER
------------------------------------------------------------------------------*/

ImprovedTube.shortcutPopupPlayer = function () {
    this.createPopUpWindow();
};


/*------------------------------------------------------------------------------
# SHORTCUTS
------------------------------------------------------------------------------*/

ImprovedTube.showStatus = function (value) {
    if (!this.elements.status) {
        this.elements.status = document.createElement('div');

        this.elements.status.id = 'it-status';
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

ImprovedTube.shortcuts = function() {
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
                keyboard.alt === shortcut.alt &&
                keyboard.ctrl === shortcut.ctrl &&
                keyboard.shift === shortcut.shift &&
                mouse.wheel === shortcut.wheel
            ) {
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

                if (mouse.wheel === 0 || mouse.player === true) {
                    if (same_keys === true) {
                        if ([
                            'shortcutAuto',
                            'shortcut240p',
                            'shortcut360p',
                            'shortcut480p',
                            'shortcut720p',
                            'shortcut1080p',
                            'shortcut1440p',
                            'shortcut2160p',
                            'shortcut2880p',
                            'shortcut4320p'
                            ].indexOf(key) !== -1) {
                            ImprovedTube['shortcutQuality'](key);
                        } else {
                            ImprovedTube[key]();
                        }

                        prevent = true;
                    }
                }
            }
        }

        return prevent;
    }

    window.addEventListener('keydown', function(event) {
        if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 || event.target.isContentEditable) {
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
        }
    }, true);

    window.addEventListener('keyup', function(event) {
        if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 || event.target.isContentEditable) {
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

    window.addEventListener('wheel', function(event) {
        if (event.deltaY > 0) {
            mouse.wheel = 1;
        } else {
            mouse.wheel = -1;
        }

        if (handler() === true) {
            event.preventDefault();
        }
    }, {
        passive: false,
        capture: true
    });

    document.addEventListener('improvedtube-player-loaded', function () {
        ImprovedTube.elements.player.parentNode.addEventListener('mouseover', function() {
            mouse.player = true;
            mouse.wheel = 0;
        }, true);

        ImprovedTube.elements.player.parentNode.addEventListener('mouseout', function() {
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
            if (this.isset(this.storage[name])) {
                try {
                    var key = 'shortcut' + (name.replace(/_?shortcut_?/g, '').replace(/\_/g, '-')).split('-').map(function (element, index) {
                        return element[0].toUpperCase() + element.slice(1);
                    }).join(''),
                        old_value = JSON.parse(this.storage[name]),
                        new_value = {
                            keys: {}
                        };

                    if (old_value.altKey) {
                        new_value.alt = true;
                    } else {
                        new_value.alt = false;
                    }

                    if (old_value.ctrlKey) {
                        new_value.ctrl = true;
                    } else {
                        new_value.ctrl = false;
                    }

                    if (old_value.shiftKey) {
                        new_value.shift = true;
                    } else {
                        new_value.shift = false;
                    }

                    if (old_value.key && ['Alt', 'Control', 'Shift'].indexOf(old_value.key) === -1) {
                        new_value.keys[old_value.keyCode] = true;
                    }

                    if (old_value.wheel > 0) {
                        new_value.wheel = 1;
                    } else if (old_value.wheel < 0) {
                        new_value.wheel = -1;
                    } else {
                        new_value.wheel = 0;
                    }

                    storage[key] = new_value;
                } catch (err) {}
            }
        }
    }

    console.log(storage);
};


/*------------------------------------------------------------------------------
8.0 BLACKLIST
------------------------------------------------------------------------------*/

document.addEventListener('ImprovedTubeBlacklist', function (event) {
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

ImprovedTube.blacklist = function () {
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

                button.addEventListener('click', function (event) {
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

            button.addEventListener('click', function (event) {
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
------------------------------------------------------------------------------*/

document.addEventListener('ImprovedTubeAnalyzer', function () {
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

ImprovedTube.improvedtube_youtube_icon_resize = function () {
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

ImprovedTube.improvedtubeYoutubeIcon = function () {
    if (window.self !== window.top || ImprovedTube.elements.improvedtube_button) {
        return false;
    }

    var option = ImprovedTube.storage.improvedtube_youtube_icon;

    if (
        ImprovedTube.isset(option) && option !== 'disabled' &&
        (
            option === 'header_left' && ImprovedTube.elements.masthead.start ||
            option === 'header_right' && ImprovedTube.elements.masthead.end ||
            option === 'below_player' && ImprovedTube.elements.video_title ||
            option === 'draggable' && document.body
        )
    ) {
        var button = document.createElement('div'),
            scrim = document.createElement('div'),
            icon = document.createElement('div'),
            iframe = document.createElement('iframe');

        button.className = 'it-btn';
        button.addEventListener('click', function () {
            event.preventDefault();
            event.stopPropagation();

            button.classList.remove('it-btn--dragging');

            window.removeEventListener('mousemove', move);

            localStorage.setItem('IT_ICON', JSON.stringify({
                x: button.offsetLeft,
                y: button.offsetTop
            }));

            setTimeout(function () {
                button.style.pointerEvents = '';
            });

            this.classList.toggle('it-btn--active');
            ImprovedTube.improvedtube_youtube_icon_resize();

            return false;
        }, true);

        scrim.className = 'it-btn__scrim';
        icon.className = 'it-btn__icon';
        iframe.className = 'it-btn__iframe';

        iframe.src = '//www.youtube.com/improvedtube';

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
                    if (event.clientX + (48 + window.innerWidth - document.body.offsetWidth) - Number(button.dataset.x) <= window.innerWidth) {
                        button.style.left = event.clientX - Number(button.dataset.x) + 'px';
                    } else {
                        button.style.left = 'calc(100vw - ' + (48 + window.innerWidth - document.body.offsetWidth) + 'px)';
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

            button.addEventListener('mousedown', function (event) {
                this.dataset.x = event.layerX;
                this.dataset.y = event.layerY;

                window.addEventListener('mousemove', move);
            });

            window.addEventListener('mouseup', function () {
                button.classList.remove('it-btn--dragging');

                window.removeEventListener('mousemove', move);

                localStorage.setItem('IT_ICON', JSON.stringify({
                    x: button.offsetLeft,
                    y: button.offsetTop
                }));

                setTimeout(function () {
                    button.style.pointerEvents = '';
                });
            });
        }

        if (option === 'header_left') {
            ImprovedTube.elements.masthead.start.insertBefore(button, ImprovedTube.elements.masthead.start.children[0]);
        } else if (option === 'header_right') {
            ImprovedTube.elements.masthead.end.appendChild(button);
        } else if (option === 'below_player') {
            ImprovedTube.elements.video_title.appendChild(button);
        } else if (option === 'draggable') {
            document.body.appendChild(button);
        }

        ImprovedTube.elements.improvedtube_button = button;

        ImprovedTube.improvedtube_youtube_icon_resize();
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
10.5 YOUTUBE LANGUAGE
-----------------------------------------------------------------------------*/

ImprovedTube.youtubeLanguage = function () {
    var pref = ImprovedTube.getCookieValueByName('PREF'),
        hl = ImprovedTube.getParam(pref, 'hl');

    if (hl) {
        ImprovedTube.setCookie('PREF', pref.replace('hl=' + hl, 'hl=' + ImprovedTube.storage.youtube_language));
    } else {
        ImprovedTube.setCookie('PREF', pref + '&hl=' + ImprovedTube.storage.youtube_language);
    }

    setTimeout(function () {
        location.reload();
    }, 100);
};


/*-----------------------------------------------------------------------------
10.6 DEFAULT CONTENT COUNTRY
-----------------------------------------------------------------------------*/

ImprovedTube.defaultContentCountry = function () {
    var value = this.storage.default_content_country;

    if (this.isset(value) && value !== 'default') {
        this.setCookie('s_gl', value);
    }
};