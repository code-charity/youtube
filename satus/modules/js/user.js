'use strict';

/*------------------------------------------------------------------------------
>>> "TELEMETRY" MODULE:
--------------------------------------------------------------------------------
 1.0 Get the browser name.
 2.0 Get the browser version.
 3.0 Get the browser major version.
 4.0 Get the platform of the browser.
 5.0 Get the browser languages.
 6.0 Check if cookies are enabled.
 7.0 Check if adobe flash is enabled.
 8.0 Check if java is enabled.
 9.0 Detect supported video formats.
10.0 Detect supported audio formats.
11.0 Check if WebGL is supported.
12.0 Get the operating system name.
13.0 Get the operating system type.
14.0 Get the screen size.
15.0 Get the RAM size.
16.0 Get the GPU info.
17.0 Get the number of logical processors available to run threads on
     the user's computer.
18.0 Check if touch is supported.
19.0 Get the connection type & speed.
------------------------------------------------------------------------------*/

Satus.prototype.modules.user = {
  name: 'User',
  version: '1.0',

  init: function(callback = function() {}) {
    callback();
  },

  get: function() {
    let data = {
      browser: {
        audio: null,
        cookies: null,
        flash: null,
        java: null,
        languages: null,
        major_version: null,
        name: null,
        platform: null,
        version: null,
        video: null,
        webgl: null
      },
      os: {
        name: null,
        type: null
      },
      device: {
        connection: {
          type: null,
          speed: null
        },
        cores: null,
        gpu: null,
        max_touch_points: null,
        ram: null,
        screen: null,
        touch: null
      }
    };


    /*----------------------------------------------------------------------------
    1.0 Get the browser name.
    ----------------------------------------------------------------------------*/

    if (navigator.userAgent.indexOf('Opera') != -1)
      data.browser.name = 'Opera';
    else if (navigator.userAgent.indexOf('Vivaldi') != -1)
      data.browser.name = 'Vivaldi';
    else if (navigator.userAgent.indexOf('Edge') != -1)
      data.browser.name = 'Edge';
    else if (navigator.userAgent.indexOf('Chrome') != -1)
      data.browser.name = 'Chrome';
    else if (navigator.userAgent.indexOf('Safari') != -1)
      data.browser.name = 'Safari';
    else if (navigator.userAgent.indexOf('Firefox') != -1)
      data.browser.name = 'Firefox';
    else if (navigator.userAgent.indexOf('MSIE') != -1)
      data.browser.name = 'IE';


    /*----------------------------------------------------------------------------
    2.0 Get the browser version.
    ----------------------------------------------------------------------------*/

    let version = navigator.userAgent.match(new RegExp(data.browser.name + '/([0-9.]+)'));

    if (version[1])
      data.browser.version = version[1];


    /*----------------------------------------------------------------------------
    3.0 Get the browser major version.
    ----------------------------------------------------------------------------*/

    if (version[1])
      data.browser.major_version = version[1].match(/[0-9]+/)[0] || null;


    /*----------------------------------------------------------------------------
    4.0 Get the platform of the browser.
    ----------------------------------------------------------------------------*/

    data.browser.platform = navigator.platform || null;


    /*----------------------------------------------------------------------------
    5.0 Get the browser languages.
    ----------------------------------------------------------------------------*/

    data.browser.languages = navigator.languages || null;


    /*----------------------------------------------------------------------------
    6.0 Check if cookies are enabled.
    ----------------------------------------------------------------------------*/

    if (document.cookie) {
      let random_cookie = randomString(64);

      document.cookie = random_cookie;

      data.browser.cookies = document.cookie.indexOf(random_cookie) != -1 ? true : null;
    }


    /*----------------------------------------------------------------------------
    7.0 Check if adobe flash is enabled.
    ----------------------------------------------------------------------------*/

    try {
      if (new ActiveXObject('ShockwaveFlash.ShockwaveFlash'))
        data.browser.flash = true;
    } catch (e) {
      if (navigator.mimeTypes['application/x-shockwave-flash'])
        data.browser.flash = true;
    }


    /*----------------------------------------------------------------------------
    8.0 Check if java is enabled.
    ----------------------------------------------------------------------------*/

    if (typeof navigator.javaEnabled == 'function' && navigator.javaEnabled())
      data.browser.java = true;


    /*----------------------------------------------------------------------------
    9.0 Detect supported video formats.
    ----------------------------------------------------------------------------*/

    const video = document.createElement('video'),
      video_formats = {
        ogg: 'video/ogg; codecs="theora"',
        h264: 'video/mp4; codecs="avc1.42E01E"',
        webm: 'video/webm; codecs="vp8, vorbis"',
        vp9: 'video/webm; codecs="vp9"',
        hls: 'application/x-mpegURL; codecs="avc1.42E01E"'
      };

    if (typeof video.canPlayType == 'function') {
      data.browser.video = {};

      for (let i in video_formats) {
        let can_play_type = video.canPlayType(video_formats[i]);

        if (can_play_type == '')
          data.browser.video[i] = false;
        else
          data.browser.video[i] = can_play_type;
      }
    }


    /*----------------------------------------------------------------------------
    10.0 Detect supported audio formats.
    ----------------------------------------------------------------------------*/

    const audio = document.createElement('audio'),
      audio_formats = {
        mp3: 'audio/mpeg',
        mp4: 'audio/mp4',
        aif: 'audio/x-aiff'
      };

    if (typeof audio.canPlayType == 'function') {
      data.browser.audio = {};

      for (let i in audio_formats) {
        let can_play_type = audio.canPlayType(audio_formats[i]);

        if (can_play_type == '')
          data.browser.audio[i] = false;
        else
          data.browser.audio[i] = can_play_type;
      }
    }


    /*----------------------------------------------------------------------------
    11.0 Check if WebGL is supported.
    ----------------------------------------------------------------------------*/

    let cvs = document.createElement('canvas'),
      ctx = cvs.getContext('webgl');

    if (ctx && ctx instanceof WebGLRenderingContext)
      data.browser.webgl = true;


    /*----------------------------------------------------------------------------
    12.0 Get the operating system name.
    ----------------------------------------------------------------------------*/

    if (navigator.appVersion.indexOf('Win') != -1) {
      if (navigator.appVersion.match(/(Windows 10.0|Windows NT 10.0)/))
        data.os.name = 'Windows 10';
      else if (navigator.appVersion.match(/(Windows 8.1|Windows NT 6.3)/))
        data.os.name = 'Windows 8.1';
      else if (navigator.appVersion.match(/(Windows 8|Windows NT 6.2)/))
        data.os.name = 'Windows 8';
      else if (navigator.appVersion.match(/(Windows 7|Windows NT 6.1)/))
        data.os.name = 'Windows 7';
      else if (navigator.appVersion.match(/(Windows NT 6.0)/))
        data.os.name = 'Windows Vista';
      else if (navigator.appVersion.match(/(Windows NT 5.1|Windows XP)/))
        data.os.name = 'Windows XP';
      else
        data.os.name = 'Windows';
    } else if (navigator.appVersion.indexOf('(iPhone|iPad|iPod)') != -1)
      data.os.name = 'iOS';
    else if (navigator.appVersion.indexOf('Mac') != -1)
      data.os.name = 'macOS';
    else if (navigator.appVersion.indexOf('Android') != -1)
      data.os.name = 'Android';
    else if (navigator.appVersion.indexOf('OpenBSD') != -1)
      data.os.name = 'OpenBSD';
    else if (navigator.appVersion.indexOf('SunOS') != -1)
      data.os.name = 'SunOS';
    else if (navigator.appVersion.indexOf('X11') != -1)
      data.os.name = 'UNIX';
    else if (navigator.appVersion.indexOf('Linux') != -1)
      data.os.name = 'Linux';


    /*----------------------------------------------------------------------------
    13.0 Get the operating system type.
    ----------------------------------------------------------------------------*/

    if (navigator.appVersion.match(/(Win64|x64|x86_64|WOW64)/))
      data.os.type = '64-bit';
    else
      data.os.type = '32-bit';


    /*----------------------------------------------------------------------------
    14.0 Get the screen size.
    ----------------------------------------------------------------------------*/

    if (screen)
      data.device.screen = screen.width + 'x' + screen.height;


    /*----------------------------------------------------------------------------
    15.0 Get the RAM size.
    ----------------------------------------------------------------------------*/

    if ('deviceMemory' in navigator)
      data.device.ram = navigator.deviceMemory + ' GB';


    /*----------------------------------------------------------------------------
    16.0 Get the GPU info.
    ----------------------------------------------------------------------------*/

    if (ctx && ctx instanceof WebGLRenderingContext && 'getParameter' in ctx && 'getExtension' in ctx) {
      let info = ctx.getExtension('WEBGL_debug_renderer_info');

      if (info)
        data.device.gpu = ctx.getParameter(info.UNMASKED_RENDERER_WEBGL);
    }


    /*----------------------------------------------------------------------------
    17.0 Get the number of logical processors available to run threads on
         the user's computer.
    ----------------------------------------------------------------------------*/

    if (navigator.hardwareConcurrency)
      data.device.cores = navigator.hardwareConcurrency;


    /*----------------------------------------------------------------------------
    18.0 Check if touch is supported.
    ----------------------------------------------------------------------------*/

    if (window.hasOwnProperty('ontouchstart') ||
      window.DocumentTouch && document instanceof window.DocumentTouch ||
      navigator.maxTouchPoints > 0 ||
      window.navigator.msMaxTouchPoints > 0) {
      data.device.touch = true;
      data.device.max_touch_points = navigator.maxTouchPoints;
    }


    /*----------------------------------------------------------------------------
    19.0 Get the connection type & speed.
    ----------------------------------------------------------------------------*/

    if (typeof navigator.connection == 'object') {
      data.device.connection.type = navigator.connection.effectiveType || null;

      if (navigator.connection.downlink)
        data.device.connection.speed = navigator.connection.downlink + ' Mbps';
    }


    return data;
  }
};
