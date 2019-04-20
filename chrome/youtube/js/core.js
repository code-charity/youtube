/*--------------------------------------------------------------
>>> CORE:
----------------------------------------------------------------
5.0 Show page action
1.0 Identify YouTube version
2.0 Identify YouTube page type
3.0 ImprovedTube
  3.1 ImprovedTube icon
4.0 Message listener
--------------------------------------------------------------*/

/*--------------------------------------------------------------
5.0 Show page action
--------------------------------------------------------------*/

chrome.runtime.sendMessage({
    enabled: true
});


/*--------------------------------------------------------------
1.0 Identify YouTube version
--------------------------------------------------------------*/

(function() {
    var pref = getCookieValueByName('PREF'),
        f6 = getParam(pref, 'f6') || '0004',
        last = f6.slice(-1),
        disable_polymer = Boolean(getParam(location.search.substr(1), 'disable_polymer')),
        version = (last == '8' || last == '9') || disable_polymer ? 'old' : 'new';

    if (navigator && navigator.userAgent && navigator.userAgent.match(/Chrom(e|ium)+\/[0-9.]+/g)[0] && Number(navigator.userAgent.match(/Chrom(e|ium)+\/[0-9.]+/g)[0].match(/[0-9.]+/g)[0].match(/[0-9]+/g)[0]) <= 49)
        version = 'old';

    document.documentElement.setAttribute('youtube-version', version);

    chrome.storage.local.get(function(data) {
        data.youtube_version = document.documentElement.getAttribute('youtube-version');
        chrome.storage.local.set(data);
    });
})();


/*--------------------------------------------------------------
2.0 Identify YouTube embed
--------------------------------------------------------------*/

if (location.pathname.match(/\/embed\//g))
    document.documentElement.setAttribute('embed', '');


/*--------------------------------------------------------------
2.0 Identify YouTube page type
--------------------------------------------------------------*/

getPageType();


/*--------------------------------------------------------------
3.0 ImprovedTube
--------------------------------------------------------------*/

chrome.storage.local.get(function(data) {
    settings = data;

    if (settings.player_size == 'large') {
        settings.player_size = '480p';
    } else if (settings.player_size == 'medium') {
        settings.player_size = '360p';
    } else if (settings.player_size == 'small') {
        settings.player_size = '240p';
    }

    if (['normal', 'undefined', 'fit_window', 'full_window', '240p', '360p', '480p', '576p', '720p', '1080p', '1440p', '2160p'].indexOf(settings.player_size) == -1) {
        settings.player_size = 'normal';
    }


    /*--------------------------------------------------------------
    3.1 ImprovedTube icon
    --------------------------------------------------------------*/

    improvedtubeIconOnYouTube();


    /*--------------------------------------------------------------
    3.2 Inject ImprovedTube settings
    --------------------------------------------------------------*/

    injectScript([
        'var settings = ' + JSON.stringify(data) + ';'
    ], 'improvedtube-settings');


    /*--------------------------------------------------------------
    3.3 Inject ImprovedTube functions
    --------------------------------------------------------------*/

    injectScript([
        toBlob,
        getUrlParams,
        // general
        youtube_version,
        youtube_home_page,
        scroll_to_top,

        // themes
        it_theme,
        dim,

        // video page
        video_quality,
        video_volume,
        video_playback_speed,
        video_encode,
        video_autoplay,
        video_autopause,
        description_expanded,
        livechat_collapsed,
        comments_collapsed,
        related_videos_collapsed,
        up_next_autoplay,
        video_repeat_button,
        popup_player_button,
        video_rotate_button,
        screenshot_button,
        forced_theater_mode,
        mini_player,
        'window.addEventListener("scroll", mini_player);',
        picture_in_picture,
        fit_window,
        video_autofullscreen,

        // playlist
        playlist_repeat,
        playlist_shuffle,
        playlist_reverse,

        // channel
        channel_default_page,
        channel_videos_count,
        how_long_ago_the_video_was_uploaded,

        youtube_language,

        // other
        getPageType,
        getCookieValueByName,
        setCookie,
        getParam,
        pageLoaded,
        videoPage,
        'var improvedtubeKeys = {};',
        keydown,
        wheel,
        'if (window.MediaSource) var globalIsTypeSupported = window.MediaSource.isTypeSupported;',
        'var globalVolumeTimeout;',
        'var globalSpeedTimeout;',

        HDThumbnail,

        changeArgs,
        JSONparse,
        'JSON.parse = JSONparse(JSON.parse);',

        ytPlayerApplicationCreateMod,
        'document.documentElement.addEventListener("load", function () {if(window.yt && window.yt.player && window.yt.player.Application && window.yt.player.Application.create)window.yt.player.Application.create = ytPlayerApplicationCreateMod(window.yt.player.Application.create);}, true);',

        parseFromStringMod,
        'DOMParser.prototype.parseFromString = parseFromStringMod(DOMParser.prototype.parseFromString);',

        playerVars,
        objectDefineProperties,
        'objectDefineProperties();',
        'function modRemoveAttribute(original) { return function () { if (arguments[0] == "dark" && settings.hasOwnProperty("it_theme") && settings.it_theme != "false") { return false; } return original.apply(this, arguments); } } document.documentElement.removeAttribute = modRemoveAttribute(document.documentElement.removeAttribute);',
        'var globalDescriptionWait;',
        'var globalLivechatWait;',
        'var globalRelatedVideosWait;',
        'var globalCommentsWait;',
        'var globalChannelVideoWait;',
        'var globalPlayerMouseMove;',
        'var globalLastPlaylist;',
        'var globalReversePlaylist = false;',
        'window.addEventListener("keydown", keydown, true);',
        'window.addEventListener("keyup", function(){improvedtubeKeys={};}, true);',
        'window.addEventListener("wheel", wheel, {passive: false,capture:true});',
        'window.addEventListener("scroll", function(event){if (window.scrollY > 500)document.documentElement.setAttribute("scroll-to-top", ""); else document.documentElement.removeAttribute("scroll-to-top");}, true);',
        'window.addEventListener("blur", function () {if(settings.picture_in_picture=="tabs"){picture_in_picture();}video_autopause("pause");});',
        'window.addEventListener("focus", function () {video_autopause("play");});',
        'var globalAutoplayByUser = false;',
        'window.addEventListener("keydown", function(){globalAutoplayByUser=true;}, true);',
        'window.addEventListener("mousedown", function(){globalAutoplayByUser=true;}, true);',
        'function modPlay(original) {' +
        'return function () {' +
        'var self = this;if(!video_autoplay()&&globalAutoplayByUser!=true)setTimeout(function(){self.pause();},10);' +
        'return original.apply(this, arguments);' +
        '};' +
        '}' +
        'window.addEventListener("click", function(event){ for (let i = 0, l = event.path.length; i < l; i++) {if(event.path[i].nodeName == "A" && event.path[i].href && (event.path[i].href.indexOf("?v=") != -1 || event.path[i].href.indexOf("&v=") != -1)){video_autofullscreen();} } });' +
        'HTMLMediaElement.prototype.play = modPlay(HTMLMediaElement.prototype.play);',
        "setInterval(function(){document.documentElement.removeAttribute('live', '');if (document.getElementById('live-chat-iframe') || document.querySelector('ytd-live-chat-frame'))document.documentElement.setAttribute('live', '');},500);",

        'forced_theater_mode();'
    ], 'improvedtube-functions');


    /*--------------------------------------------------------------
    3.4 Redirects
    --------------------------------------------------------------*/

    youtube_home_page();
    channel_default_page();

    document.documentElement.addEventListener('yt-navigate-start',
        function(event) {
            globalReversePlaylist = false;

            const current_url = event && event.detail && event.detail.url ? event.detail.url : undefined;

            document.documentElement.removeAttribute('improvedtube-home');
            channel_default_page(current_url);
        }
    );

    window.addEventListener('spfdone',
        function(event) {
            globalReversePlaylist = false;

            const current_url = event && event.detail && event.detail.url ? event.detail.url.replace('https://www.youtube.com', '') : undefined;

            document.documentElement.removeAttribute('improvedtube-home');
            channel_default_page(current_url);
        }
    );


    /*--------------------------------------------------------------
    3.5 Other
    --------------------------------------------------------------*/

    youtube_prevent_closure();

    injectScript([
        'var improvedtube_old_video = "";',
        'if (!document.documentElement.hasAttribute("embed")) { video_encode(); }'
    ]);


    /*--------------------------------------------------------------
    3.6 Custom appearance
    --------------------------------------------------------------*/

    it_theme();
    header();
    annotations();
    cards();
    player_size();
    player_color();
    transparent_background();
    endscreen();
    description();
    comments();
    hide_up_next_autoplay();
    livechat();
    playlist();
    related_videos();
    footer();
    bluelight();
    dim();
    channel_featured_content();
    hide_details();
    views_count();
    likes();
    squared_user_images();
    improve_youtube_logo();
    play_videos_by_hovering_the_thumbnails();
    scroll_for_details();


    /*--------------------------------------------------------------
    3.7 DOMContentLoaded
    --------------------------------------------------------------*/
    function autoplayImp() {

    }
    document.addEventListener('DOMContentLoaded', function() {
        scroll_to_top();
    });


    /*--------------------------------------------------------------
    3.8 Load
    --------------------------------------------------------------*/

    window.addEventListener('load', function() {
        injectScript([
            'pageLoaded();'
        ]);
    });

});


/*--------------------------------------------------------------
4.0 Message listener
--------------------------------------------------------------*/

window.addEventListener('message', function(event) {
    let request = event.data;

    if (request.id == 'btgrh8fejnorhfunsfdh') {
        let blob = new Blob([JSON.stringify(request.data)], {
                type: 'image/png'
            }),
            date = new Date();

        chrome.downloads.download({
            url: URL.createObjectURL(blob),
            filename: 'improvedtube-screenshot_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getFullYear() + '.png',
            saveAs: true
        });

        return false;
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request == 'requestVolume' && document.querySelector('video')) {
        sendResponse(document.querySelector('video').volume);

        return false;
    } else if (typeof request == 'object' && request.name == 'changeVolume') {
        injectScript(['if(document.querySelector(".html5-video-player")){document.querySelector(".html5-video-player").setVolume(' + request.volume + ');}'], 'improvedtube-mixer-data');

        return false;
    }

    if (request.reload_youtube) {
        location.reload();

        return false;
    }

    chrome.storage.local.get(function(data) {
        settings = data;

        injectScript([
            'var settings = ' + JSON.stringify(settings) + ';'
        ], 'improvedtube-settings');

        // ignore requests
        if (
            request == 'video_autoplay' ||
            request == 'youtube_home_page' ||
            request == 'playlist_repeat' ||
            request == 'playlist_shuffle' ||
            request == 'channel_default_page'
        )
            return;

        if (request == 'up_next_autoplay') {
            injectScript([
                'up_next_autoplay();'
            ]);

            return;
        }

        if (request == 'description') {
            injectScript([
                'description_expanded();'
            ]);

            return;
        }

        if (request == 'related_videos') {
            injectScript([
                'related_videos_collapsed();'
            ]);

            return;
        }

        if (request == 'comments') {
            injectScript([
                'comments_collapsed();'
            ]);

            return;
        }

        if (request == 'improvedtube_youtube_icon' && document.getElementById('improvedtube_settings_button'))
            document.getElementById('improvedtube_settings_button').remove();

        // run functions on the extension side
        if (
            request == 'bluelight' ||
            request == 'dim' ||
            request == 'youtube_prevent_closure' ||
            request == 'header' ||
            request == 'annotations' ||
            request == 'cards' ||
            request == 'player_size' ||
            request == 'forced_theater_mode' ||
            request == 'player_color' ||
            request == 'endscreen' ||
            request == 'hide_details' ||
            request == 'views_count' ||
            request == 'likes' ||
            request == 'description' ||
            request == 'comments' ||
            request == 'hide_up_next_autoplay' ||
            request == 'livechat' ||
            request == 'playlist' ||
            request == 'related_videos' ||
            request == 'footer' ||
            request == 'channel_featured_content' ||
            request == 'delete_youtube_cookies' ||
            request == 'transparent_background' ||
            request == 'squared_user_images' ||
            request == 'improve_youtube_logo' ||
            request == 'play_videos_by_hovering_the_thumbnails' ||
            request == 'scroll_for_details'
        ) {
            window[request]();

            if (request == 'player_size') {
                injectScript(['forced_theater_mode();window.dispatchEvent(new Event("resize"));']);
            }

            if (request == 'forced_theater_mode') {
                injectScript(['location.reload();']);
            }

            return;
        }

        // run functions on the youtube side
        if (window[request])
            injectScript([
                request + '();'
            ]);
    });
});