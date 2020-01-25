/*-----------------------------------------------------------------------------
>>> «USER» MODULE
-------------------------------------------------------------------------------
1.0 Variables
2.0 Software
    2.1 OS
        2.2.1  Name
        2.2.2  Type
    2.2 Browser
        2.2.1  Name
        2.2.2  Version
        2.2.3  Platform
        2.2.4  Languages
        2.2.5  Cookies
        2.2.6  Flash
        2.2.8  Video formats
        2.2.9  Audio formats
        2.2.10 WebGL
3.0 Hardware
    3.1 Screen
    3.2 RAM
    3.3 GPU
    3.4 Cores
    3.5 Touch
    3.6 Connection
4.0 Clearing
-----------------------------------------------------------------------------*/

Satus.user = function() {
/*-----------------------------------------------------------------------------
1.0 VARIABLES
-----------------------------------------------------------------------------*/

var user_agent = navigator.userAgent,
    random_cookie = 'ta{t`nX6cMXK,Wsc',
    video = document.createElement('video'),
    video_formats = {
        ogg: 'video/ogg; codecs="theora"',
        h264: 'video/mp4; codecs="avc1.42E01E"',
        webm: 'video/webm; codecs="vp8, vorbis"',
        vp9: 'video/webm; codecs="vp9"',
        hls: 'application/x-mpegURL; codecs="avc1.42E01E"'
    },
    audio = document.createElement('audio'),
    audio_formats = {
        mp3: 'audio/mpeg',
        mp4: 'audio/mp4',
        aif: 'audio/x-aiff'
    },
    cvs = document.createElement('canvas'),
    ctx = cvs.getContext('webgl'),
    data = {
        browser: {
            audio: null,
            cookies: null,
            flash: null,
            java: null,
            languages: null,
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


/*-----------------------------------------------------------------------------
2.0 SOFTWARE
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
2.1.0 OS
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
2.1.1 NAME
-----------------------------------------------------------------------------*/

if (navigator.appVersion.indexOf('Win') !== -1) {
    if (navigator.appVersion.match(/(Windows 10.0|Windows NT 10.0)/)) {
        data.os.name = 'Windows 10';
    } else if (navigator.appVersion.match(/(Windows 8.1|Windows NT 6.3)/)) {
        data.os.name = 'Windows 8.1';
    } else if (navigator.appVersion.match(/(Windows 8|Windows NT 6.2)/)) {
        data.os.name = 'Windows 8';
    } else if (navigator.appVersion.match(/(Windows 7|Windows NT 6.1)/)) {
        data.os.name = 'Windows 7';
    } else if (navigator.appVersion.match(/(Windows NT 6.0)/)) {
        data.os.name = 'Windows Vista';
    } else if (navigator.appVersion.match(/(Windows NT 5.1|Windows XP)/)) {
        data.os.name = 'Windows XP';
    } else {
        data.os.name = 'Windows';
    }
} else if (navigator.appVersion.indexOf('(iPhone|iPad|iPod)') !== -1) {
    data.os.name = 'iOS';
} else if (navigator.appVersion.indexOf('Mac') !== -1) {
    data.os.name = 'macOS';
} else if (navigator.appVersion.indexOf('Android') !== -1) {
    data.os.name = 'Android';
} else if (navigator.appVersion.indexOf('OpenBSD') !== -1) {
    data.os.name = 'OpenBSD';
} else if (navigator.appVersion.indexOf('SunOS') !== -1) {
    data.os.name = 'SunOS';
} else if (navigator.appVersion.indexOf('Linux') !== -1) {
    data.os.name = 'Linux';
} else if (navigator.appVersion.indexOf('X11') !== -1) {
    data.os.name = 'UNIX';
}

/*-----------------------------------------------------------------------------
2.1.2 TYPE
-----------------------------------------------------------------------------*/

if (navigator.appVersion.match(/(Win64|x64|x86_64|WOW64)/)) {
    data.os.type = '64-bit';
} else {
    data.os.type = '32-bit';
}


/*-----------------------------------------------------------------------------
2.2.0 BROWSER
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
2.2.1 NAME
-----------------------------------------------------------------------------*/

if (user_agent.indexOf('Opera') !== -1) {
    data.browser.name = 'Opera';
} else if (user_agent.indexOf('Vivaldi') !== -1) {
    data.browser.name = 'Vivaldi';
} else if (user_agent.indexOf('Edge') !== -1) {
    data.browser.name = 'Edge';
} else if (user_agent.indexOf('Chrome') !== -1) {
    data.browser.name = 'Chrome';
} else if (user_agent.indexOf('Safari') !== -1) {
    data.browser.name = 'Safari';
} else if (user_agent.indexOf('Firefox') !== -1) {
    data.browser.name = 'Firefox';
} else if (user_agent.indexOf('MSIE') !== -1) {
    data.browser.name = 'IE';
}


/*-----------------------------------------------------------------------------
2.2.2 VERSION
-----------------------------------------------------------------------------*/

var browser_version = user_agent.match(new RegExp(data.browser.name + '/([0-9.]+)'));

if (browser_version[1]) {
    data.browser.version = browser_version[1];
}


/*-----------------------------------------------------------------------------
2.2.3 PLATFORM
-----------------------------------------------------------------------------*/

data.browser.platform = navigator.platform || null;


/*-----------------------------------------------------------------------------
2.2.4 LANGUAGES
-----------------------------------------------------------------------------*/

data.browser.languages = navigator.languages || null;


/*-----------------------------------------------------------------------------
2.2.5 COOKIES
-----------------------------------------------------------------------------*/

if (document.cookie) {
    document.cookie = random_cookie;

    if (document.cookie.indexOf(random_cookie) !== -1) {
        data.browser.cookies = true;
    }
}


/*-----------------------------------------------------------------------------
2.2.6 FLASH
-----------------------------------------------------------------------------*/

try {
    if (new ActiveXObject('ShockwaveFlash.ShockwaveFlash')) {
        data.browser.flash = true;
    }
} catch (e) {
    if (navigator.mimeTypes['application/x-shockwave-flash']) {
        data.browser.flash = true;
    }
}


/*-----------------------------------------------------------------------------
2.2.7 JAVA
-----------------------------------------------------------------------------*/

if (typeof navigator.javaEnabled === 'function' && navigator.javaEnabled()) {
    data.browser.java = true;
}


/*-----------------------------------------------------------------------------
2.2.8 VIDEO FORMATS
-----------------------------------------------------------------------------*/

if (typeof video.canPlayType === 'function') {
    data.browser.video = {};

    for (var i in video_formats) {
        var can_play_type = video.canPlayType(video_formats[i]);

        if (can_play_type === '') {
            data.browser.video[i] = false;
        } else {
            data.browser.video[i] = can_play_type;
        }
    }
}


/*-----------------------------------------------------------------------------
2.2.9 AUDIO FORMATS
-----------------------------------------------------------------------------*/

if (typeof audio.canPlayType === 'function') {
    data.browser.audio = {};

    for (var i in audio_formats) {
        var can_play_type = audio.canPlayType(audio_formats[i]);

        if (can_play_type == '') {
            data.browser.audio[i] = false;
        } else {
            data.browser.audio[i] = can_play_type;
        }
    }
}


/*-----------------------------------------------------------------------------
2.2.10 WEBGL
-----------------------------------------------------------------------------*/

if (ctx && ctx instanceof WebGLRenderingContext) {
    data.browser.webgl = true;
}


/*-----------------------------------------------------------------------------
3.0 HARDWARE
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
3.1 SCREEN
-----------------------------------------------------------------------------*/

if (screen) {
    data.device.screen = screen.width + 'x' + screen.height;
}


/*-----------------------------------------------------------------------------
3.2 RAM
-----------------------------------------------------------------------------*/

if ('deviceMemory' in navigator) {
    data.device.ram = navigator.deviceMemory + ' GB';
}


/*-----------------------------------------------------------------------------
3.3 GPU
-----------------------------------------------------------------------------*/

if (
    ctx &&
    ctx instanceof WebGLRenderingContext &&
    'getParameter' in ctx &&
    'getExtension' in ctx
) {
    var info = ctx.getExtension('WEBGL_debug_renderer_info');

    if (info) {
        data.device.gpu = ctx.getParameter(info.UNMASKED_RENDERER_WEBGL);
    }
}


/*-----------------------------------------------------------------------------
3.4 CORES
-----------------------------------------------------------------------------*/

if (navigator.hardwareConcurrency) {
    data.device.cores = navigator.hardwareConcurrency;
}


/*-----------------------------------------------------------------------------
3.5 TOUCH
-----------------------------------------------------------------------------*/

if (
    window.hasOwnProperty('ontouchstart') ||
    window.DocumentTouch && document instanceof window.DocumentTouch ||
    navigator.maxTouchPoints > 0 ||
    window.navigator.msMaxTouchPoints > 0
) {
    data.device.touch = true;
    data.device.max_touch_points = navigator.maxTouchPoints;
}


/*-----------------------------------------------------------------------------
3.6 CONNECTION
-----------------------------------------------------------------------------*/

if (typeof navigator.connection === 'object') {
    data.device.connection.type = navigator.connection.effectiveType || null;

    if (navigator.connection.downlink) {
        data.device.connection.speed = navigator.connection.downlink + ' Mbps';
    }
}


/*-----------------------------------------------------------------------------
4.0 CLEARING
-----------------------------------------------------------------------------*/

video.remove();
audio.remove();
cvs.remove();


return data;
};