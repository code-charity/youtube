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

(function () {
  var pref            = getCookieValueByName('PREF'),
        f6              = getParam(pref, 'f6') || '0004',
        last            = f6.slice(-1),
        disable_polymer = Boolean( getParam(location.search.substr(1), 'disable_polymer') ),
        version         = (last == '8' || last == '9') || disable_polymer ? 'old' : 'new';

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
  }
  else if (settings.player_size == 'medium') {
    settings.player_size = '360p';
  }
  else if (settings.player_size == 'small') {
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
    getUrlParams,
    // general
    youtube_version,
    youtube_home_page,
    scroll_to_top,

    // themes
    default_dark_theme,

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
    video_repeat,
    video_repeat_button,
    popup_player_button,
    video_rotate_button,
    forced_theater_mode,
    mini_player,
    'mini_player();',
    fit_window,

    // playlist
    playlist_repeat,
    playlist_shuffle,
    playlist_reverse,

    // channel
    channel_default_page,
    channel_videos_count,
    how_long_ago_the_video_was_uploaded,

    // other
    getPageType,
    getCookieValueByName,
    setCookie,
    getParam,
    pageLoaded,
    videoPage,
    keydown,
    wheel,
    'var globalCanPlayType = HTMLMediaElement.prototype.canPlayType;',
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

    'var globalDescriptionWait;',
    'var globalLivechatWait;',
    'var globalRelatedVideosWait;',
    'var globalCommentsWait;',
    'var globalChannelVideoWait;',
    'var globalPlayerMouseMove;',
    'var globalLastPlaylist;',
    'window.addEventListener("keydown", keydown, true);',
    'window.addEventListener("wheel", wheel, true);',
    'window.addEventListener("scroll", function(event){if (window.scrollY > 500)document.documentElement.setAttribute("scroll-to-top", ""); else document.documentElement.removeAttribute("scroll-to-top");}, true);',
    'window.addEventListener("blur", function () {video_autopause("pause");});',
    'window.addEventListener("focus", function () {video_autopause("play");});'
  ], 'improvedtube-functions');


  /*--------------------------------------------------------------
  3.4 Redirects
  --------------------------------------------------------------*/

  youtube_home_page();
  channel_default_page();

  document.documentElement.addEventListener('yt-navigate-start',
    function(event) {
      const current_url = event && event.detail && event.detail.url ? event.detail.url : undefined;

      youtube_home_page(current_url);
      channel_default_page(current_url);
    }
  );

  window.addEventListener('spfdone',
    function(event) {
      const current_url = event && event.detail && event.detail.url ? event.detail.url.replace('https://www.youtube.com', '') : undefined;

      youtube_home_page(current_url);
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

  default_dark_theme();
  header();
  annotations();
  cards();
  player_size();
  player_color();
  transparent_background();
  endscreen();
  description();
  comments();
  livechat();
  playlist();
  related_videos();
  footer();
  bluelight();
  dim();
  channel_featured_content();
  views_count();
  likes();
  squared_user_images();
  improve_youtube_logo();
  play_videos_by_hovering_the_thumbnails();


  /*--------------------------------------------------------------
  3.7 DOMContentLoaded
  --------------------------------------------------------------*/
function autoplayImp() {

}
  document.addEventListener('DOMContentLoaded', function () {
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

chrome.runtime.onMessage.addListener(function(request) {
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
      request == 'up_next_autoplay' ||
      request == 'channel_default_page'
    )
      return;

    if (request == 'description') {
      injectScript([
        'description_expanded();'
      ]);
    }

    if (request == 'related_videos') {
      injectScript([
        'related_videos_collapsed();'
      ]);
    }

    if (request == 'comments') {
      injectScript([
        'comments_collapsed();'
      ]);
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
      request == 'player_color' ||
      request == 'endscreen' ||
      request == 'views_count' ||
      request == 'likes' ||
      request == 'description' ||
      request == 'comments' ||
      request == 'livechat' ||
      request == 'playlist' ||
      request == 'related_videos' ||
      request == 'footer' ||
      request == 'channel_featured_content' ||
      request == 'delete_youtube_cookies' ||
      request == 'transparent_background' ||
      request == 'squared_user_images' ||
      request == 'improve_youtube_logo' ||
      request == 'play_videos_by_hovering_the_thumbnails'
    ) {
      window[request]();

      if (request == 'player_size') {
        injectScript(['forced_theater_mode();window.dispatchEvent(new Event("resize"));']);
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
