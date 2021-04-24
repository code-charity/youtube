
/*--------------------------------------------------------------
>>> SATUS
----------------------------------------------------------------
# Core
    # Events
    # Render
    # Camelize
    # Animation duration
# Modules
    # Browser storage
    # Localization
    # Render
    # Clone node styles
    # Search
    # Storage keys
    # User
# Components
    # Button
    # Colop picker
    # Dialog
    # Folder
    # Header
    # List
    # Main
    # Scroll bar
    # Section
    # Select
    # Shortcut
    # Slider
    # Switch
    # Text
    # Text field
--------------------------------------------------------------*/

var satus = {};


/*--------------------------------------------------------------
# EVENTS
--------------------------------------------------------------*/

satus.events = {};

satus.on = function(event, handler) {
    if (!this.isset(this.events[event])) {
        this.events[event] = [];
    }

    this.events[event].push(handler);
};


/*--------------------------------------------------------------
# COMPONENTS
--------------------------------------------------------------*/

satus.components = {};


/*--------------------------------------------------------------
# MODULES
--------------------------------------------------------------*/

satus.modules = {};


/*--------------------------------------------------------------
# ISSET
--------------------------------------------------------------*/

satus.isset = function(variable) {
    if (typeof variable === 'undefined' || variable === null) {
        return false;
    }

    return true;
};


/*--------------------------------------------------------------
# CAMELIZE
--------------------------------------------------------------*/

satus.camelize = function(string) {
    return string.replace(/-[a-z]/g, function(match) {
        return match[1].toUpperCase();
    });
};


/*--------------------------------------------------------------
# ANIMATION DURATION
--------------------------------------------------------------*/

satus.getAnimationDuration = function(element) {
    return Number(window.getComputedStyle(element).getPropertyValue('animation-duration').replace(/[^0-9.]/g, '')) * 1000;
};


/*--------------------------------------------------------------
# MODULES
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# BROWSER STORAGE
--------------------------------------------------------------*/

satus.storage = {};

satus.storage.get = function(name) {
    var target = satus.storage;

    name = name.split('/').filter(function(value) {
        return value != '';
    });

    for (var i = 0, l = name.length; i < l; i++) {
        if (satus.isset(target[name[i]])) {
            target = target[name[i]];
        } else {
            return undefined;
        }
    }

    return target;
};

satus.storage.set = function(name, value) {
    var items = {},
        target = satus.storage;
        
    if (!satus.isset(name)) {
        return false;
    }

    name = name.split('/').filter(function(value) {
        return value != '';
    });

    for (var i = 0, l = name.length; i < l; i++) {
        var item = name[i];

        if (i < l - 1) {

            if (target[item]) {
                target = target[item];
            } else {
                target[item] = {};

                target = target[item];
            }
        } else {
            target[item] = value;
        }
    }

    for (var key in satus.storage) {
        if (typeof satus.storage[key] !== 'function') {
            items[key] = satus.storage[key];
        }
    }

    chrome.storage.local.set(items);
};

satus.storage.import = function(callback) {
    chrome.storage.local.get(function(items) {
        for (var key in items) {
            satus.storage[key] = items[key];
        }

        if (callback) {
            callback(items);
        }
    });
};

satus.storage.clear = function() {
    chrome.storage.local.clear();

    for (var key in satus.storage) {
        if (typeof satus.storage[key] !== 'function') {
            delete satus.storage[key];
        }
    }
};


/*---------------------------------------------------------------
# LOCALIZATION
---------------------------------------------------------------*/

satus.locale = {
    messages: {}
};

satus.locale.getMessage = function(string) {
    return this.messages[string] || string;
};

satus.locale.get = satus.locale.getMessage;

satus.locale.import = function(language, callback) {
    var xhr = new XMLHttpRequest();

    if (typeof language === 'function') {
        var callback = language;
    }

    if (typeof language !== 'string') {
        var language = chrome.i18n.getUILanguage();
    }

    xhr.onload = function() {
        try {
            var object = JSON.parse(this.responseText);

            for (var key in object) {
                satus.locale.messages[key] = object[key].message;
            }

            callback(language);
        } catch (err) {
            function listener(request) {
                if (request !== null && typeof request === 'object') {
                    if (request.name === 'translation_response') {
                        var object = JSON.parse(request.value);

                        chrome.runtime.onMessage.removeListener(listener);

                        for (var key in object) {
                            satus.locale.messages[key] = object[key].message;
                        }

                        callback(language);
                    }
                }
            }

            chrome.runtime.onMessage.addListener(listener);

            console.log('_locales/' + language + '/messages.json');
            chrome.runtime.sendMessage({
                name: 'translation_request',
                path: '_locales/' + language + '/messages.json'
            });
        }
    };

    xhr.onerror = function() {
        if (language === 'en') {
            callback();
        } else {
            satus.locale.import('en', callback);
        }
    };

    xhr.open('GET', '_locales/' + language + '/messages.json', true);
    xhr.send();
};


/*--------------------------------------------------------------
# RENDER
--------------------------------------------------------------*/

satus.render = function(element, container, callback) {
    function convert(object) {
        if (object && object.type) {
            var type = satus.camelize(object.type),
                component = satus.components[type](object),
                excluded_properties = ['type', 'label', 'class', 'title', 'storage'];

            function applyProperties(object, target) {
                for (var key in object) {
                    if (satus.isset(object[key]) && typeof object[key] === 'object' && !object[key].type) {
                        if (typeof target[key] !== 'object') {
                            target[key] = {};
                        }

                        applyProperties(object[key], target[key]);
                    } else if (excluded_properties.indexOf(key) === -1) {
                        target[key] = object[key];
                    }
                }
            }

            applyProperties(object, component);

            component.classList.add('satus-' + object.type);

            if (object.class) {
                var class_list = object.class.split(' ');

                for (var i = 0, l = class_list.length; i < l; i++) {
                    component.classList.add(class_list[i]);
                }
            }

            if (object.before) {
                var component_before = document.createElement('span');

                component_before.innerHTML = object.before;

                for (var i = component_before.children.length - 1; i > -1; i--) {
                    component.insertBefore(component_before.children[i], component.firstChild);
                }
            }

            if (object.after) {
                var component_after = document.createElement('span');

                component_after.innerHTML = object.after;

                for (var i = component_after.children.length - 1; i > -1; i--) {
                    component.appendChild(component_after.children[i]);
                }
            }

            (container || document.body).appendChild(component);

            if (typeof component.onClickRender === 'object') {
                component.addEventListener('click', function() {
                    satus.render(component.onClickRender);
                });
            }

            if (satus.isset(satus.events.render)) {
                for (var i = 0, l = satus.events.render.length; i < l; i++) {
                    satus.events.render[i](component, object);
                }
            }

            if (typeof component.onrender === 'function') {
                component.onrender(object);
            }

            if (callback) {
                callback();
            }
        }
    }

    if (element.type) {
        convert(element);
    } else {
        for (var key in element) {
            convert(element[key]);
        }
    }
};


/*--------------------------------------------------------------
# CLONE NODE STYLES
--------------------------------------------------------------*/

satus.cloneNodeStyles = function(origin, target) {
    target.style.cssText = window.getComputedStyle(origin, '').cssText;

    for (var i = 0, l = origin.children.length; i < l; i++) {
        satus.cloneNodeStyles(origin.children[i], target.children[i]);
    }
};


/*--------------------------------------------------------------
# SEARCH
--------------------------------------------------------------*/

satus.search = function(query, object, callback, categories) {
    var threads = 0,
        folder = '',
        results = {};

    function parse(items) {
        threads++;

        for (var key in items) {
            var item = items[key];
            
            if (categories === true && item.type === 'folder' && folder !== item.label) {
                folder = item.label;
            }

            if (['switch', 'select', 'slider'].indexOf(item.type) !== -1 && key.indexOf(query) !== -1) {
                if (categories === true) {
                    if (!results[folder]) {
                        results[folder] = {};
                    }
                    
                    results[folder][key] = item;
                } else {
                    results[key] = item;
                }
            }

            if (typeof item === 'object') {
                parse(item);
            }
        }

        threads--;

        if (threads === 0) {
            callback(results);
        }
    }

    parse(object);
};


/*--------------------------------------------------------------
# STORAGE KEYS
--------------------------------------------------------------*/

satus.modules.updateStorageKeys = function(object, callback) {
    var threads = 0;

    function parse(items) {
        threads++;

        for (var key in items) {
            var item = items[key];


            if (item.type) {
                item.storage_key = key;
            }

            if (typeof item === 'object') {
                parse(item);
            }
        }

        threads--;

        if (threads === 0) {
            callback();
        }
    }

    parse(object);
};


/*--------------------------------------------------------------
# USER
--------------------------------------------------------------*/

satus.modules.user = function() {
    /*--------------------------------------------------------------
    1.0 VARIABLES
    --------------------------------------------------------------*/

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


    /*--------------------------------------------------------------
    2.0 SOFTWARE
    --------------------------------------------------------------*/

    /*--------------------------------------------------------------
    2.1.0 OS
    --------------------------------------------------------------*/

    /*--------------------------------------------------------------
    2.1.1 NAME
    --------------------------------------------------------------*/

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

    /*--------------------------------------------------------------
    2.1.2 TYPE
    --------------------------------------------------------------*/

    if (navigator.appVersion.match(/(Win64|x64|x86_64|WOW64)/)) {
        data.os.type = '64-bit';
    } else {
        data.os.type = '32-bit';
    }


    /*--------------------------------------------------------------
    2.2.0 BROWSER
    --------------------------------------------------------------*/

    /*--------------------------------------------------------------
    2.2.1 NAME
    --------------------------------------------------------------*/

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


    /*--------------------------------------------------------------
    2.2.2 VERSION
    --------------------------------------------------------------*/

    var browser_version = user_agent.match(new RegExp(data.browser.name + '/([0-9.]+)'));

    if (browser_version[1]) {
        data.browser.version = browser_version[1];
    }


    /*--------------------------------------------------------------
    2.2.3 PLATFORM
    --------------------------------------------------------------*/

    data.browser.platform = navigator.platform || null;


    /*--------------------------------------------------------------
    2.2.4 LANGUAGES
    --------------------------------------------------------------*/

    data.browser.languages = navigator.languages || null;


    /*--------------------------------------------------------------
    2.2.5 COOKIES
    --------------------------------------------------------------*/

    if (document.cookie) {
        document.cookie = random_cookie;

        if (document.cookie.indexOf(random_cookie) !== -1) {
            data.browser.cookies = true;
        }
    }


    /*--------------------------------------------------------------
    2.2.6 FLASH
    --------------------------------------------------------------*/

    try {
        if (new ActiveXObject('ShockwaveFlash.ShockwaveFlash')) {
            data.browser.flash = true;
        }
    } catch (e) {
        if (navigator.mimeTypes['application/x-shockwave-flash']) {
            data.browser.flash = true;
        }
    }


    /*--------------------------------------------------------------
    2.2.7 JAVA
    --------------------------------------------------------------*/

    if (typeof navigator.javaEnabled === 'function' && navigator.javaEnabled()) {
        data.browser.java = true;
    }


    /*--------------------------------------------------------------
    2.2.8 VIDEO FORMATS
    --------------------------------------------------------------*/

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


    /*--------------------------------------------------------------
    2.2.9 AUDIO FORMATS
    --------------------------------------------------------------*/

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


    /*--------------------------------------------------------------
    2.2.10 WEBGL
    --------------------------------------------------------------*/

    if (ctx && ctx instanceof WebGLRenderingContext) {
        data.browser.webgl = true;
    }


    /*--------------------------------------------------------------
    3.0 HARDWARE
    --------------------------------------------------------------*/

    /*--------------------------------------------------------------
    3.1 SCREEN
    --------------------------------------------------------------*/

    if (screen) {
        data.device.screen = screen.width + 'x' + screen.height;
    }


    /*--------------------------------------------------------------
    3.2 RAM
    --------------------------------------------------------------*/

    if ('deviceMemory' in navigator) {
        data.device.ram = navigator.deviceMemory + ' GB';
    }


    /*--------------------------------------------------------------
    3.3 GPU
    --------------------------------------------------------------*/

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


    /*--------------------------------------------------------------
    3.4 CORES
    --------------------------------------------------------------*/

    if (navigator.hardwareConcurrency) {
        data.device.cores = navigator.hardwareConcurrency;
    }


    /*--------------------------------------------------------------
    3.5 TOUCH
    --------------------------------------------------------------*/

    if (
        window.hasOwnProperty('ontouchstart') ||
        window.DocumentTouch && document instanceof window.DocumentTouch ||
        navigator.maxTouchPoints > 0 ||
        window.navigator.msMaxTouchPoints > 0
    ) {
        data.device.touch = true;
        data.device.max_touch_points = navigator.maxTouchPoints;
    }


    /*--------------------------------------------------------------
    3.6 CONNECTION
    --------------------------------------------------------------*/

    if (typeof navigator.connection === 'object') {
        data.device.connection.type = navigator.connection.effectiveType || null;

        if (navigator.connection.downlink) {
            data.device.connection.speed = navigator.connection.downlink + ' Mbps';
        }
    }


    /*--------------------------------------------------------------
    4.0 CLEARING
    --------------------------------------------------------------*/

    video.remove();
    audio.remove();
    cvs.remove();


    return data;
};
satus.on('render', function(component, data) {
    if (data.perspective === true) {
        component.style.willChange = 'transform';
        component.style.transformStyle = 'preserve-3d';
        component.style.transition = '.4s';

        component.addEventListener('mousemove', function(event) {
            var bounding = component.getBoundingClientRect(),
                dx = event.clientX - bounding.left - bounding.width / 2,
                dy = event.clientY - bounding.top - bounding.height / 2;

            this.style.transform = 'perspective(440px) rotateX(' + dy * -1 + 'deg) rotateY(' + dx + 'deg) translateZ(0)';
        });

        component.addEventListener('mouseout', function(event) {
            this.style.transform = 'perspective(440px) rotateX(0deg) rotateY(0deg) translateZ(0)';
        });
    }
});


/*--------------------------------------------------------------
# COMPONENTS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# BUTTON
--------------------------------------------------------------*/

satus.components.button = function(element) {
    var component = document.createElement('button');

    if (satus.isset(element.icon)) {
        var component_icon = document.createElement('span');

        component_icon.className = 'satus-button__icon';
        component_icon.innerHTML = element.icon;

        component.appendChild(component_icon);
    }

    if (satus.isset(element.label)) {
        var component_label = document.createElement('span');

        component_label.className = 'satus-button__label';
        component_label.innerText = satus.locale.getMessage(element.label);

        component.appendChild(component_label);
    }

    return component;
};


/*--------------------------------------------------------------
# COLOR PICKER
--------------------------------------------------------------*/

satus.components.colorPicker = function(element) {
    var component = document.createElement('div'),
        component_value = document.createElement('div');

    element.class = 'satus-button';
    component_value.className = 'satus-color-picker__value';
    component_value.style.backgroundColor = satus.storage.get(element.storage_key) || element.value || '';

    if (satus.isset(element.label)) {
        var component_label = document.createElement('span');

        component_label.className = 'satus-button__label';
        component_label.innerText = satus.locale.getMessage(element.label);

        component.appendChild(component_label);
    }

    component.addEventListener('click', function() {
        var component = document.createElement('div'),
            component_canvas = document.createElement('canvas'),
            close = document.createElement('button'),
            ctx = component_canvas.getContext('2d'),
            image = new Image(),
            dialog = satus.components.dialog({});

        close.className = 'satus-button';
        close.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';
        close.onclick = function() {
            dialog.querySelector('.satus-dialog__scrim').click();
        };

        dialog.className = 'satus-dialog satus-dialog--color-picker';

        component_canvas.width = 200;
        component_canvas.height = 200;

        function select(event) {
            var coordinates = component_canvas.getBoundingClientRect(),
                x = event.clientX - coordinates.left,
                y = event.clientY - coordinates.top,
                color = ctx.getImageData(x, y, 1, 1).data;

            component_value.style.backgroundColor = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';

            satus.storage.set(element.storage_key, component_value.style.backgroundColor);
        }

        function mouseup(event) {
            component_canvas.removeEventListener('mousemove', select);
            window.removeEventListener('mouseup', mouseup);
        }

        component_canvas.addEventListener('mousedown', function() {
            select(event);
            this.addEventListener('mousemove', select);
            window.addEventListener('mouseup', mouseup);
        });

        image.onload = function() {
            ctx.drawImage(image, 0, 0);

            image.remove();
        };

        image.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNzAgMjcwIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImEiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZmYiIHN0b3Atb3BhY2l0eT0iMCIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxnIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMTMzIiBjbGFzcz0iSXJvV2hlZWxIdWUiPjxwYXRoIHN0cm9rZT0iaHNsKDI0MCwgMTAwJSwgNTAlKSIgZD0iTTIwMS40NzcgMTM2Ljc0YTY2LjUgNjYuNSAwIDAwLjAyMy0xLjc0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjQxLCAxMDAlLCA1MCUpIiBkPSJNMjAxLjQzNyAxMzcuOWE2Ni41IDY2LjUgMCAwMC4wNTMtMS43NCIvPjxwYXRoIHN0cm9rZT0iaHNsKDI0MiwgMTAwJSwgNTAlKSIgZD0iTTIwMS4zNzYgMTM5LjA2YTY2LjUgNjYuNSAwIDAwLjA4My0xLjc0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjQzLCAxMDAlLCA1MCUpIiBkPSJNMjAxLjI5NSAxNDAuMjE4YTY2LjUgNjYuNSAwIDAwLjExNC0xLjczOCIvPjxwYXRoIHN0cm9rZT0iaHNsKDI0NCwgMTAwJSwgNTAlKSIgZD0iTTIwMS4xOTQgMTQxLjM3NGE2Ni41IDY2LjUgMCAwMC4xNDQtMS43MzUiLz48cGF0aCBzdHJva2U9ImhzbCgyNDUsIDEwMCUsIDUwJSkiIGQ9Ik0yMDEuMDczIDE0Mi41MjhhNjYuNSA2Ni41IDAgMDAuMTc0LTEuNzMyIi8+PHBhdGggc3Ryb2tlPSJoc2woMjQ2LCAxMDAlLCA1MCUpIiBkPSJNMjAwLjkzMSAxNDMuNjhhNjYuNSA2Ni41IDAgMDAuMjA1LTEuNzI5Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjQ3LCAxMDAlLCA1MCUpIiBkPSJNMjAwLjc3IDE0NC44M2E2Ni41IDY2LjUgMCAwMC4yMzQtMS43MjYiLz48cGF0aCBzdHJva2U9ImhzbCgyNDgsIDEwMCUsIDUwJSkiIGQ9Ik0yMDAuNTg4IDE0NS45NzZhNjYuNSA2Ni41IDAgMDAuMjY1LTEuNzIxIi8+PHBhdGggc3Ryb2tlPSJoc2woMjQ5LCAxMDAlLCA1MCUpIiBkPSJNMjAwLjM4NiAxNDcuMTE5YTY2LjUgNjYuNSAwIDAwLjI5NS0xLjcxNiIvPjxwYXRoIHN0cm9rZT0iaHNsKDI1MCwgMTAwJSwgNTAlKSIgZD0iTTIwMC4xNjUgMTQ4LjI1OGE2Ni41IDY2LjUgMCAwMC4zMjUtMS43MSIvPjxwYXRoIHN0cm9rZT0iaHNsKDI1MSwgMTAwJSwgNTAlKSIgZD0iTTE5OS45MjQgMTQ5LjM5M2E2Ni41IDY2LjUgMCAwMC4zNTQtMS43MDQiLz48cGF0aCBzdHJva2U9ImhzbCgyNTIsIDEwMCUsIDUwJSkiIGQ9Ik0xOTkuNjYzIDE1MC41MjRhNjYuNSA2Ni41IDAgMDAuMzg0LTEuNjk4Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjUzLCAxMDAlLCA1MCUpIiBkPSJNMTk5LjM4MiAxNTEuNjVhNjYuNSA2Ni41IDAgMDAuNDE0LTEuNjkiLz48cGF0aCBzdHJva2U9ImhzbCgyNTQsIDEwMCUsIDUwJSkiIGQ9Ik0xOTkuMDgxIDE1Mi43NzFhNjYuNSA2Ni41IDAgMDAuNDQ0LTEuNjgzIi8+PHBhdGggc3Ryb2tlPSJoc2woMjU1LCAxMDAlLCA1MCUpIiBkPSJNMTk4Ljc2MiAxNTMuODg3YTY2LjUgNjYuNSAwIDAwLjQ3Mi0xLjY3NiIvPjxwYXRoIHN0cm9rZT0iaHNsKDI1NiwgMTAwJSwgNTAlKSIgZD0iTTE5OC40MjIgMTU0Ljk5N2E2Ni41IDY2LjUgMCAwMC41MDItMS42NjciLz48cGF0aCBzdHJva2U9ImhzbCgyNTcsIDEwMCUsIDUwJSkiIGQ9Ik0xOTguMDY0IDE1Ni4xYTY2LjUgNjYuNSAwIDAwLjUzLTEuNjU3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjU4LCAxMDAlLCA1MCUpIiBkPSJNMTk3LjY4NiAxNTcuMTk4YTY2LjUgNjYuNSAwIDAwLjU2LTEuNjQ4Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjU5LCAxMDAlLCA1MCUpIiBkPSJNMTk3LjI4OSAxNTguMjg5YTY2LjUgNjYuNSAwIDAwLjU4OC0xLjYzOSIvPjxwYXRoIHN0cm9rZT0iaHNsKDI2MCwgMTAwJSwgNTAlKSIgZD0iTTE5Ni44NzMgMTU5LjM3MmE2Ni41IDY2LjUgMCAwMC42MTctMS42MjgiLz48cGF0aCBzdHJva2U9ImhzbCgyNjEsIDEwMCUsIDUwJSkiIGQ9Ik0xOTYuNDM4IDE2MC40NDhhNjYuNSA2Ni41IDAgMDAuNjQ1LTEuNjE3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjYyLCAxMDAlLCA1MCUpIiBkPSJNMTk1Ljk4NCAxNjEuNTE3YTY2LjUgNjYuNSAwIDAwLjY3NC0xLjYwNiIvPjxwYXRoIHN0cm9rZT0iaHNsKDI2MywgMTAwJSwgNTAlKSIgZD0iTTE5NS41MTIgMTYyLjU3N2E2Ni41IDY2LjUgMCAwMC43MDItMS41OTMiLz48cGF0aCBzdHJva2U9ImhzbCgyNjQsIDEwMCUsIDUwJSkiIGQ9Ik0xOTUuMDIyIDE2My42MjlhNjYuNSA2Ni41IDAgMDAuNzI5LTEuNTgxIi8+PHBhdGggc3Ryb2tlPSJoc2woMjY1LCAxMDAlLCA1MCUpIiBkPSJNMTk0LjUxMyAxNjQuNjcyYTY2LjUgNjYuNSAwIDAwLjc1Ni0xLjU2OCIvPjxwYXRoIHN0cm9rZT0iaHNsKDI2NiwgMTAwJSwgNTAlKSIgZD0iTTE5My45ODYgMTY1LjcwNmE2Ni41IDY2LjUgMCAwMC43ODQtMS41NTQiLz48cGF0aCBzdHJva2U9ImhzbCgyNjcsIDEwMCUsIDUwJSkiIGQ9Ik0xOTMuNDQxIDE2Ni43MzFhNjYuNSA2Ni41IDAgMDAuODEtMS41NCIvPjxwYXRoIHN0cm9rZT0iaHNsKDI2OCwgMTAwJSwgNTAlKSIgZD0iTTE5Mi44NzkgMTY3Ljc0NmE2Ni41IDY2LjUgMCAwMC44MzctMS41MjYiLz48cGF0aCBzdHJva2U9ImhzbCgyNjksIDEwMCUsIDUwJSkiIGQ9Ik0xOTIuMjk4IDE2OC43NTFhNjYuNSA2Ni41IDAgMDAuODY0LTEuNTExIi8+PHBhdGggc3Ryb2tlPSJoc2woMjcwLCAxMDAlLCA1MCUpIiBkPSJNMTkxLjcgMTY5Ljc0NmE2Ni41IDY2LjUgMCAwMC44OS0xLjQ5NiIvPjxwYXRoIHN0cm9rZT0iaHNsKDI3MSwgMTAwJSwgNTAlKSIgZD0iTTE5MS4wODYgMTcwLjczYTY2LjUgNjYuNSAwIDAwLjkxNi0xLjQ4Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjcyLCAxMDAlLCA1MCUpIiBkPSJNMTkwLjQ1MyAxNzEuNzA0YTY2LjUgNjYuNSAwIDAwLjk0Mi0xLjQ2NCIvPjxwYXRoIHN0cm9rZT0iaHNsKDI3MywgMTAwJSwgNTAlKSIgZD0iTTE4OS44MDQgMTcyLjY2NmE2Ni41IDY2LjUgMCAwMC45NjgtMS40NDgiLz48cGF0aCBzdHJva2U9ImhzbCgyNzQsIDEwMCUsIDUwJSkiIGQ9Ik0xODkuMTM5IDE3My42MTdhNjYuNSA2Ni41IDAgMDAuOTkyLTEuNDMiLz48cGF0aCBzdHJva2U9ImhzbCgyNzUsIDEwMCUsIDUwJSkiIGQ9Ik0xODguNDU2IDE3NC41NTZhNjYuNSA2Ni41IDAgMDAxLjAxOC0xLjQxMyIvPjxwYXRoIHN0cm9rZT0iaHNsKDI3NiwgMTAwJSwgNTAlKSIgZD0iTTE4Ny43NTggMTc1LjQ4M2E2Ni41IDY2LjUgMCAwMDEuMDQyLTEuMzk1Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjc3LCAxMDAlLCA1MCUpIiBkPSJNMTg3LjA0MyAxNzYuMzk3YTY2LjUgNjYuNSAwIDAwMS4wNjYtMS4zNzYiLz48cGF0aCBzdHJva2U9ImhzbCgyNzgsIDEwMCUsIDUwJSkiIGQ9Ik0xODYuMzEzIDE3Ny4zYTY2LjUgNjYuNSAwIDAwMS4wOS0xLjM1OSIvPjxwYXRoIHN0cm9rZT0iaHNsKDI3OSwgMTAwJSwgNTAlKSIgZD0iTTE4NS41NjcgMTc4LjE4OGE2Ni41IDY2LjUgMCAwMDEuMTEzLTEuMzM4Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjgwLCAxMDAlLCA1MCUpIiBkPSJNMTg0LjgwNiAxNzkuMDY0YTY2LjUgNjYuNSAwIDAwMS4xMzYtMS4zMTkiLz48cGF0aCBzdHJva2U9ImhzbCgyODEsIDEwMCUsIDUwJSkiIGQ9Ik0xODQuMDI5IDE3OS45MjdhNjYuNSA2Ni41IDAgMDAxLjE2LTEuMyIvPjxwYXRoIHN0cm9rZT0iaHNsKDI4MiwgMTAwJSwgNTAlKSIgZD0iTTE4My4yMzcgMTgwLjc3NmE2Ni41IDY2LjUgMCAwMDEuMTgyLTEuMjc5Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjgzLCAxMDAlLCA1MCUpIiBkPSJNMTgyLjQzMSAxODEuNjFhNjYuNSA2Ni41IDAgMDAxLjIwNC0xLjI1NyIvPjxwYXRoIHN0cm9rZT0iaHNsKDI4NCwgMTAwJSwgNTAlKSIgZD0iTTE4MS42MSAxODIuNDMxYTY2LjUgNjYuNSAwIDAwMS4yMjYtMS4yMzYiLz48cGF0aCBzdHJva2U9ImhzbCgyODUsIDEwMCUsIDUwJSkiIGQ9Ik0xODAuNzc2IDE4My4yMzdhNjYuNSA2Ni41IDAgMDAxLjI0Ny0xLjIxNCIvPjxwYXRoIHN0cm9rZT0iaHNsKDI4NiwgMTAwJSwgNTAlKSIgZD0iTTE3OS45MjcgMTg0LjAyOWE2Ni41IDY2LjUgMCAwMDEuMjY4LTEuMTkzIi8+PHBhdGggc3Ryb2tlPSJoc2woMjg3LCAxMDAlLCA1MCUpIiBkPSJNMTc5LjA2NCAxODQuODA2YTY2LjUgNjYuNSAwIDAwMS4yODktMS4xNzEiLz48cGF0aCBzdHJva2U9ImhzbCgyODgsIDEwMCUsIDUwJSkiIGQ9Ik0xNzguMTg4IDE4NS41NjdhNjYuNSA2Ni41IDAgMDAxLjMxLTEuMTQ4Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjg5LCAxMDAlLCA1MCUpIiBkPSJNMTc3LjMgMTg2LjMxM2E2Ni41IDY2LjUgMCAwMDEuMzI4LTEuMTI1Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjkwLCAxMDAlLCA1MCUpIiBkPSJNMTc2LjM5NyAxODcuMDQzYTY2LjUgNjYuNSAwIDAwMS4zNDgtMS4xMDEiLz48cGF0aCBzdHJva2U9ImhzbCgyOTEsIDEwMCUsIDUwJSkiIGQ9Ik0xNzUuNDgzIDE4Ny43NThhNjYuNSA2Ni41IDAgMDAxLjM2Ny0xLjA3OCIvPjxwYXRoIHN0cm9rZT0iaHNsKDI5MiwgMTAwJSwgNTAlKSIgZD0iTTE3NC41NTYgMTg4LjQ1NmE2Ni41IDY2LjUgMCAwMDEuMzg1LTEuMDUzIi8+PHBhdGggc3Ryb2tlPSJoc2woMjkzLCAxMDAlLCA1MCUpIiBkPSJNMTczLjYxNyAxODkuMTM5YTY2LjUgNjYuNSAwIDAwMS40MDQtMS4wMyIvPjxwYXRoIHN0cm9rZT0iaHNsKDI5NCwgMTAwJSwgNTAlKSIgZD0iTTE3Mi42NjYgMTg5LjgwNGE2Ni41IDY2LjUgMCAwMDEuNDIyLTEuMDA0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjk1LCAxMDAlLCA1MCUpIiBkPSJNMTcxLjcwNCAxOTAuNDUzYTY2LjUgNjYuNSAwIDAwMS40MzktLjk4Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjk2LCAxMDAlLCA1MCUpIiBkPSJNMTcwLjczIDE5MS4wODZhNjYuNSA2Ni41IDAgMDAxLjQ1Ni0uOTU1Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjk3LCAxMDAlLCA1MCUpIiBkPSJNMTY5Ljc0NiAxOTEuN2E2Ni41IDY2LjUgMCAwMDEuNDcyLS45MjgiLz48cGF0aCBzdHJva2U9ImhzbCgyOTgsIDEwMCUsIDUwJSkiIGQ9Ik0xNjguNzUxIDE5Mi4yOThhNjYuNSA2Ni41IDAgMDAxLjQ4OS0uOTAzIi8+PHBhdGggc3Ryb2tlPSJoc2woMjk5LCAxMDAlLCA1MCUpIiBkPSJNMTY3Ljc0NiAxOTIuODc5YTY2LjUgNjYuNSAwIDAwMS41MDQtLjg3NyIvPjxwYXRoIHN0cm9rZT0iaHNsKDMwMCwgMTAwJSwgNTAlKSIgZD0iTTE2Ni43MzEgMTkzLjQ0MWE2Ni41IDY2LjUgMCAwMDEuNTE5LS44NSIvPjxwYXRoIHN0cm9rZT0iaHNsKDMwMSwgMTAwJSwgNTAlKSIgZD0iTTE2NS43MDYgMTkzLjk4NmE2Ni41IDY2LjUgMCAwMDEuNTM0LS44MjQiLz48cGF0aCBzdHJva2U9ImhzbCgzMDIsIDEwMCUsIDUwJSkiIGQ9Ik0xNjQuNjcyIDE5NC41MTNhNjYuNSA2Ni41IDAgMDAxLjU0OC0uNzk3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzAzLCAxMDAlLCA1MCUpIiBkPSJNMTYzLjYyOSAxOTUuMDIyYTY2LjUgNjYuNSAwIDAwMS41NjEtLjc3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzA0LCAxMDAlLCA1MCUpIiBkPSJNMTYyLjU3NyAxOTUuNTEyYTY2LjUgNjYuNSAwIDAwMS41NzUtLjc0MiIvPjxwYXRoIHN0cm9rZT0iaHNsKDMwNSwgMTAwJSwgNTAlKSIgZD0iTTE2MS41MTcgMTk1Ljk4NGE2Ni41IDY2LjUgMCAwMDEuNTg3LS43MTUiLz48cGF0aCBzdHJva2U9ImhzbCgzMDYsIDEwMCUsIDUwJSkiIGQ9Ik0xNjAuNDQ4IDE5Ni40MzhhNjYuNSA2Ni41IDAgMDAxLjYtLjY4NyIvPjxwYXRoIHN0cm9rZT0iaHNsKDMwNywgMTAwJSwgNTAlKSIgZD0iTTE1OS4zNzIgMTk2Ljg3M2E2Ni41IDY2LjUgMCAwMDEuNjEyLS42NiIvPjxwYXRoIHN0cm9rZT0iaHNsKDMwOCwgMTAwJSwgNTAlKSIgZD0iTTE1OC4yODkgMTk3LjI4OWE2Ni41IDY2LjUgMCAwMDEuNjIyLS42MzEiLz48cGF0aCBzdHJva2U9ImhzbCgzMDksIDEwMCUsIDUwJSkiIGQ9Ik0xNTcuMTk4IDE5Ny42ODZhNjYuNSA2Ni41IDAgMDAxLjYzMy0uNjAzIi8+PHBhdGggc3Ryb2tlPSJoc2woMzEwLCAxMDAlLCA1MCUpIiBkPSJNMTU2LjEgMTk4LjA2NGE2Ni41IDY2LjUgMCAwMDEuNjQ0LS41NzQiLz48cGF0aCBzdHJva2U9ImhzbCgzMTEsIDEwMCUsIDUwJSkiIGQ9Ik0xNTQuOTk3IDE5OC40MjJhNjYuNSA2Ni41IDAgMDAxLjY1My0uNTQ1Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzEyLCAxMDAlLCA1MCUpIiBkPSJNMTUzLjg4NyAxOTguNzYyYTY2LjUgNjYuNSAwIDAwMS42NjMtLjUxNyIvPjxwYXRoIHN0cm9rZT0iaHNsKDMxMywgMTAwJSwgNTAlKSIgZD0iTTE1Mi43NzEgMTk5LjA4MWE2Ni41IDY2LjUgMCAwMDEuNjcyLS40ODciLz48cGF0aCBzdHJva2U9ImhzbCgzMTQsIDEwMCUsIDUwJSkiIGQ9Ik0xNTEuNjUgMTk5LjM4MmE2Ni41IDY2LjUgMCAwMDEuNjgtLjQ1OCIvPjxwYXRoIHN0cm9rZT0iaHNsKDMxNSwgMTAwJSwgNTAlKSIgZD0iTTE1MC41MjQgMTk5LjY2M2E2Ni41IDY2LjUgMCAwMDEuNjg3LS40MjkiLz48cGF0aCBzdHJva2U9ImhzbCgzMTYsIDEwMCUsIDUwJSkiIGQ9Ik0xNDkuMzkzIDE5OS45MjRhNjYuNSA2Ni41IDAgMDAxLjY5NS0uNCIvPjxwYXRoIHN0cm9rZT0iaHNsKDMxNywgMTAwJSwgNTAlKSIgZD0iTTE0OC4yNTggMjAwLjE2NWE2Ni41IDY2LjUgMCAwMDEuNzAxLS4zNyIvPjxwYXRoIHN0cm9rZT0iaHNsKDMxOCwgMTAwJSwgNTAlKSIgZD0iTTE0Ny4xMTkgMjAwLjM4NmE2Ni41IDY2LjUgMCAwMDEuNzA3LS4zNCIvPjxwYXRoIHN0cm9rZT0iaHNsKDMxOSwgMTAwJSwgNTAlKSIgZD0iTTE0NS45NzYgMjAwLjU4OGE2Ni41IDY2LjUgMCAwMDEuNzEzLS4zMSIvPjxwYXRoIHN0cm9rZT0iaHNsKDMyMCwgMTAwJSwgNTAlKSIgZD0iTTE0NC44MyAyMDAuNzdhNjYuNSA2Ni41IDAgMDAxLjcxOC0uMjgiLz48cGF0aCBzdHJva2U9ImhzbCgzMjEsIDEwMCUsIDUwJSkiIGQ9Ik0xNDMuNjggMjAwLjkzMWE2Ni41IDY2LjUgMCAwMDEuNzIzLS4yNSIvPjxwYXRoIHN0cm9rZT0iaHNsKDMyMiwgMTAwJSwgNTAlKSIgZD0iTTE0Mi41MjggMjAxLjA3M2E2Ni41IDY2LjUgMCAwMDEuNzI3LS4yMiIvPjxwYXRoIHN0cm9rZT0iaHNsKDMyMywgMTAwJSwgNTAlKSIgZD0iTTE0MS4zNzQgMjAxLjE5NGE2Ni41IDY2LjUgMCAwMDEuNzMtLjE5Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzI0LCAxMDAlLCA1MCUpIiBkPSJNMTQwLjIxOCAyMDEuMjk1YTY2LjUgNjYuNSAwIDAwMS43MzMtLjE2Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzI1LCAxMDAlLCA1MCUpIiBkPSJNMTM5LjA2IDIwMS4zNzZhNjYuNSA2Ni41IDAgMDAxLjczNi0uMTMiLz48cGF0aCBzdHJva2U9ImhzbCgzMjYsIDEwMCUsIDUwJSkiIGQ9Ik0xMzcuOSAyMDEuNDM3YTY2LjUgNjYuNSAwIDAwMS43MzktLjA5OSIvPjxwYXRoIHN0cm9rZT0iaHNsKDMyNywgMTAwJSwgNTAlKSIgZD0iTTEzNi43NCAyMDEuNDc3YTY2LjUgNjYuNSAwIDAwMS43NC0uMDY4Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzI4LCAxMDAlLCA1MCUpIiBkPSJNMTM1LjU4IDIwMS40OTdhNjYuNSA2Ni41IDAgMDAxLjc0LS4wMzgiLz48cGF0aCBzdHJva2U9ImhzbCgzMjksIDEwMCUsIDUwJSkiIGQ9Ik0xMzQuNDIgMjAxLjQ5N2E2Ni41IDY2LjUgMCAwMDEuNzQtLjAwNyIvPjxwYXRoIHN0cm9rZT0iaHNsKDMzMCwgMTAwJSwgNTAlKSIgZD0iTTEzMy4yNiAyMDEuNDc3YTY2LjUgNjYuNSAwIDAwMS43NC4wMjMiLz48cGF0aCBzdHJva2U9ImhzbCgzMzEsIDEwMCUsIDUwJSkiIGQ9Ik0xMzIuMSAyMDEuNDM3YTY2LjUgNjYuNSAwIDAwMS43NC4wNTMiLz48cGF0aCBzdHJva2U9ImhzbCgzMzIsIDEwMCUsIDUwJSkiIGQ9Ik0xMzAuOTQgMjAxLjM3NmE2Ni41IDY2LjUgMCAwMDEuNzQuMDgzIi8+PHBhdGggc3Ryb2tlPSJoc2woMzMzLCAxMDAlLCA1MCUpIiBkPSJNMTI5Ljc4MiAyMDEuMjk1YTY2LjUgNjYuNSAwIDAwMS43MzguMTE0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzM0LCAxMDAlLCA1MCUpIiBkPSJNMTI4LjYyNiAyMDEuMTk0YTY2LjUgNjYuNSAwIDAwMS43MzUuMTQ0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzM1LCAxMDAlLCA1MCUpIiBkPSJNMTI3LjQ3MiAyMDEuMDczYTY2LjUgNjYuNSAwIDAwMS43MzIuMTc0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzM2LCAxMDAlLCA1MCUpIiBkPSJNMTI2LjMyIDIwMC45MzFhNjYuNSA2Ni41IDAgMDAxLjcyOS4yMDUiLz48cGF0aCBzdHJva2U9ImhzbCgzMzcsIDEwMCUsIDUwJSkiIGQ9Ik0xMjUuMTcgMjAwLjc3YTY2LjUgNjYuNSAwIDAwMS43MjYuMjM0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzM4LCAxMDAlLCA1MCUpIiBkPSJNMTI0LjAyNCAyMDAuNTg4YTY2LjUgNjYuNSAwIDAwMS43MjEuMjY1Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzM5LCAxMDAlLCA1MCUpIiBkPSJNMTIyLjg4MSAyMDAuMzg2YTY2LjUgNjYuNSAwIDAwMS43MTYuMjk1Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzQwLCAxMDAlLCA1MCUpIiBkPSJNMTIxLjc0MiAyMDAuMTY1YTY2LjUgNjYuNSAwIDAwMS43MS4zMjUiLz48cGF0aCBzdHJva2U9ImhzbCgzNDEsIDEwMCUsIDUwJSkiIGQ9Ik0xMjAuNjA3IDE5OS45MjRhNjYuNSA2Ni41IDAgMDAxLjcwNC4zNTQiLz48cGF0aCBzdHJva2U9ImhzbCgzNDIsIDEwMCUsIDUwJSkiIGQ9Ik0xMTkuNDc2IDE5OS42NjNhNjYuNSA2Ni41IDAgMDAxLjY5OC4zODQiLz48cGF0aCBzdHJva2U9ImhzbCgzNDMsIDEwMCUsIDUwJSkiIGQ9Ik0xMTguMzUgMTk5LjM4MmE2Ni41IDY2LjUgMCAwMDEuNjkuNDE0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzQ0LCAxMDAlLCA1MCUpIiBkPSJNMTE3LjIyOSAxOTkuMDgxYTY2LjUgNjYuNSAwIDAwMS42ODMuNDQ0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzQ1LCAxMDAlLCA1MCUpIiBkPSJNMTE2LjExMyAxOTguNzYyYTY2LjUgNjYuNSAwIDAwMS42NzYuNDcyIi8+PHBhdGggc3Ryb2tlPSJoc2woMzQ2LCAxMDAlLCA1MCUpIiBkPSJNMTE1LjAwMyAxOTguNDIyYTY2LjUgNjYuNSAwIDAwMS42NjcuNTAyIi8+PHBhdGggc3Ryb2tlPSJoc2woMzQ3LCAxMDAlLCA1MCUpIiBkPSJNMTEzLjkgMTk4LjA2NGE2Ni41IDY2LjUgMCAwMDEuNjU3LjUzIi8+PHBhdGggc3Ryb2tlPSJoc2woMzQ4LCAxMDAlLCA1MCUpIiBkPSJNMTEyLjgwMiAxOTcuNjg2YTY2LjUgNjYuNSAwIDAwMS42NDguNTYiLz48cGF0aCBzdHJva2U9ImhzbCgzNDksIDEwMCUsIDUwJSkiIGQ9Ik0xMTEuNzExIDE5Ny4yODlhNjYuNSA2Ni41IDAgMDAxLjYzOS41ODgiLz48cGF0aCBzdHJva2U9ImhzbCgzNTAsIDEwMCUsIDUwJSkiIGQ9Ik0xMTAuNjI4IDE5Ni44NzNhNjYuNSA2Ni41IDAgMDAxLjYyOC42MTciLz48cGF0aCBzdHJva2U9ImhzbCgzNTEsIDEwMCUsIDUwJSkiIGQ9Ik0xMDkuNTUyIDE5Ni40MzhhNjYuNSA2Ni41IDAgMDAxLjYxNy42NDUiLz48cGF0aCBzdHJva2U9ImhzbCgzNTIsIDEwMCUsIDUwJSkiIGQ9Ik0xMDguNDgzIDE5NS45ODRhNjYuNSA2Ni41IDAgMDAxLjYwNi42NzQiLz48cGF0aCBzdHJva2U9ImhzbCgzNTMsIDEwMCUsIDUwJSkiIGQ9Ik0xMDcuNDIzIDE5NS41MTJhNjYuNSA2Ni41IDAgMDAxLjU5My43MDIiLz48cGF0aCBzdHJva2U9ImhzbCgzNTQsIDEwMCUsIDUwJSkiIGQ9Ik0xMDYuMzcxIDE5NS4wMjJhNjYuNSA2Ni41IDAgMDAxLjU4MS43MjkiLz48cGF0aCBzdHJva2U9ImhzbCgzNTUsIDEwMCUsIDUwJSkiIGQ9Ik0xMDUuMzI4IDE5NC41MTNhNjYuNSA2Ni41IDAgMDAxLjU2OC43NTYiLz48cGF0aCBzdHJva2U9ImhzbCgzNTYsIDEwMCUsIDUwJSkiIGQ9Ik0xMDQuMjk0IDE5My45ODZhNjYuNSA2Ni41IDAgMDAxLjU1NC43ODQiLz48cGF0aCBzdHJva2U9ImhzbCgzNTcsIDEwMCUsIDUwJSkiIGQ9Ik0xMDMuMjY5IDE5My40NDFhNjYuNSA2Ni41IDAgMDAxLjU0LjgxIi8+PHBhdGggc3Ryb2tlPSJoc2woMzU4LCAxMDAlLCA1MCUpIiBkPSJNMTAyLjI1NCAxOTIuODc5YTY2LjUgNjYuNSAwIDAwMS41MjYuODM3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzU5LCAxMDAlLCA1MCUpIiBkPSJNMTAxLjI0OSAxOTIuMjk4YTY2LjUgNjYuNSAwIDAwMS41MTEuODY0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMCwgMTAwJSwgNTAlKSIgZD0iTTEwMC4yNTQgMTkxLjdhNjYuNSA2Ni41IDAgMDAxLjQ5Ni44OSIvPjxwYXRoIHN0cm9rZT0iaHNsKDEsIDEwMCUsIDUwJSkiIGQ9Ik05OS4yNyAxOTEuMDg2YTY2LjUgNjYuNSAwIDAwMS40OC45MTYiLz48cGF0aCBzdHJva2U9ImhzbCgyLCAxMDAlLCA1MCUpIiBkPSJNOTguMjk2IDE5MC40NTNhNjYuNSA2Ni41IDAgMDAxLjQ2NC45NDIiLz48cGF0aCBzdHJva2U9ImhzbCgzLCAxMDAlLCA1MCUpIiBkPSJNOTcuMzM0IDE4OS44MDRhNjYuNSA2Ni41IDAgMDAxLjQ0OC45NjgiLz48cGF0aCBzdHJva2U9ImhzbCg0LCAxMDAlLCA1MCUpIiBkPSJNOTYuMzgzIDE4OS4xMzlhNjYuNSA2Ni41IDAgMDAxLjQzLjk5MiIvPjxwYXRoIHN0cm9rZT0iaHNsKDUsIDEwMCUsIDUwJSkiIGQ9Ik05NS40NDQgMTg4LjQ1NmE2Ni41IDY2LjUgMCAwMDEuNDEzIDEuMDE4Ii8+PHBhdGggc3Ryb2tlPSJoc2woNiwgMTAwJSwgNTAlKSIgZD0iTTk0LjUxNyAxODcuNzU4YTY2LjUgNjYuNSAwIDAwMS4zOTUgMS4wNDIiLz48cGF0aCBzdHJva2U9ImhzbCg3LCAxMDAlLCA1MCUpIiBkPSJNOTMuNjAzIDE4Ny4wNDNhNjYuNSA2Ni41IDAgMDAxLjM3NiAxLjA2NiIvPjxwYXRoIHN0cm9rZT0iaHNsKDgsIDEwMCUsIDUwJSkiIGQ9Ik05Mi43IDE4Ni4zMTNhNjYuNSA2Ni41IDAgMDAxLjM1OSAxLjA5Ii8+PHBhdGggc3Ryb2tlPSJoc2woOSwgMTAwJSwgNTAlKSIgZD0iTTkxLjgxMiAxODUuNTY3YTY2LjUgNjYuNSAwIDAwMS4zMzggMS4xMTMiLz48cGF0aCBzdHJva2U9ImhzbCgxMCwgMTAwJSwgNTAlKSIgZD0iTTkwLjkzNiAxODQuODA2YTY2LjUgNjYuNSAwIDAwMS4zMTkgMS4xMzYiLz48cGF0aCBzdHJva2U9ImhzbCgxMSwgMTAwJSwgNTAlKSIgZD0iTTkwLjA3MyAxODQuMDI5YTY2LjUgNjYuNSAwIDAwMS4zIDEuMTYiLz48cGF0aCBzdHJva2U9ImhzbCgxMiwgMTAwJSwgNTAlKSIgZD0iTTg5LjIyNCAxODMuMjM3YTY2LjUgNjYuNSAwIDAwMS4yNzkgMS4xODIiLz48cGF0aCBzdHJva2U9ImhzbCgxMywgMTAwJSwgNTAlKSIgZD0iTTg4LjM5IDE4Mi40MzFhNjYuNSA2Ni41IDAgMDAxLjI1NyAxLjIwNCIvPjxwYXRoIHN0cm9rZT0iaHNsKDE0LCAxMDAlLCA1MCUpIiBkPSJNODcuNTY5IDE4MS42MWE2Ni41IDY2LjUgMCAwMDEuMjM2IDEuMjI2Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTUsIDEwMCUsIDUwJSkiIGQ9Ik04Ni43NjMgMTgwLjc3NmE2Ni41IDY2LjUgMCAwMDEuMjE0IDEuMjQ3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTYsIDEwMCUsIDUwJSkiIGQ9Ik04NS45NzEgMTc5LjkyN2E2Ni41IDY2LjUgMCAwMDEuMTkzIDEuMjY4Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTcsIDEwMCUsIDUwJSkiIGQ9Ik04NS4xOTQgMTc5LjA2NGE2Ni41IDY2LjUgMCAwMDEuMTcxIDEuMjg5Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTgsIDEwMCUsIDUwJSkiIGQ9Ik04NC40MzMgMTc4LjE4OGE2Ni41IDY2LjUgMCAwMDEuMTQ4IDEuMzEiLz48cGF0aCBzdHJva2U9ImhzbCgxOSwgMTAwJSwgNTAlKSIgZD0iTTgzLjY4NyAxNzcuM2E2Ni41IDY2LjUgMCAwMDEuMTI1IDEuMzI4Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjAsIDEwMCUsIDUwJSkiIGQ9Ik04Mi45NTcgMTc2LjM5N2E2Ni41IDY2LjUgMCAwMDEuMTAxIDEuMzQ4Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjEsIDEwMCUsIDUwJSkiIGQ9Ik04Mi4yNDIgMTc1LjQ4M2E2Ni41IDY2LjUgMCAwMDEuMDc4IDEuMzY3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjIsIDEwMCUsIDUwJSkiIGQ9Ik04MS41NDQgMTc0LjU1NmE2Ni41IDY2LjUgMCAwMDEuMDUzIDEuMzg1Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjMsIDEwMCUsIDUwJSkiIGQ9Ik04MC44NjEgMTczLjYxN2E2Ni41IDY2LjUgMCAwMDEuMDMgMS40MDQiLz48cGF0aCBzdHJva2U9ImhzbCgyNCwgMTAwJSwgNTAlKSIgZD0iTTgwLjE5NiAxNzIuNjY2YTY2LjUgNjYuNSAwIDAwMS4wMDQgMS40MjIiLz48cGF0aCBzdHJva2U9ImhzbCgyNSwgMTAwJSwgNTAlKSIgZD0iTTc5LjU0NyAxNzEuNzA0YTY2LjUgNjYuNSAwIDAwLjk4IDEuNDM5Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjYsIDEwMCUsIDUwJSkiIGQ9Ik03OC45MTQgMTcwLjczYTY2LjUgNjYuNSAwIDAwLjk1NSAxLjQ1NiIvPjxwYXRoIHN0cm9rZT0iaHNsKDI3LCAxMDAlLCA1MCUpIiBkPSJNNzguMyAxNjkuNzQ2YTY2LjUgNjYuNSAwIDAwLjkyOCAxLjQ3MiIvPjxwYXRoIHN0cm9rZT0iaHNsKDI4LCAxMDAlLCA1MCUpIiBkPSJNNzcuNzAyIDE2OC43NTFhNjYuNSA2Ni41IDAgMDAuOTAzIDEuNDg5Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjksIDEwMCUsIDUwJSkiIGQ9Ik03Ny4xMjEgMTY3Ljc0NmE2Ni41IDY2LjUgMCAwMC44NzcgMS41MDQiLz48cGF0aCBzdHJva2U9ImhzbCgzMCwgMTAwJSwgNTAlKSIgZD0iTTc2LjU1OSAxNjYuNzMxYTY2LjUgNjYuNSAwIDAwLjg1IDEuNTE5Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzEsIDEwMCUsIDUwJSkiIGQ9Ik03Ni4wMTQgMTY1LjcwNmE2Ni41IDY2LjUgMCAwMC44MjQgMS41MzQiLz48cGF0aCBzdHJva2U9ImhzbCgzMiwgMTAwJSwgNTAlKSIgZD0iTTc1LjQ4NyAxNjQuNjcyYTY2LjUgNjYuNSAwIDAwLjc5NyAxLjU0OCIvPjxwYXRoIHN0cm9rZT0iaHNsKDMzLCAxMDAlLCA1MCUpIiBkPSJNNzQuOTc4IDE2My42MjlhNjYuNSA2Ni41IDAgMDAuNzcgMS41NjEiLz48cGF0aCBzdHJva2U9ImhzbCgzNCwgMTAwJSwgNTAlKSIgZD0iTTc0LjQ4OCAxNjIuNTc3YTY2LjUgNjYuNSAwIDAwLjc0MiAxLjU3NSIvPjxwYXRoIHN0cm9rZT0iaHNsKDM1LCAxMDAlLCA1MCUpIiBkPSJNNzQuMDE2IDE2MS41MTdhNjYuNSA2Ni41IDAgMDAuNzE1IDEuNTg3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzYsIDEwMCUsIDUwJSkiIGQ9Ik03My41NjIgMTYwLjQ0OGE2Ni41IDY2LjUgMCAwMC42ODcgMS42Ii8+PHBhdGggc3Ryb2tlPSJoc2woMzcsIDEwMCUsIDUwJSkiIGQ9Ik03My4xMjcgMTU5LjM3MmE2Ni41IDY2LjUgMCAwMC42NiAxLjYxMiIvPjxwYXRoIHN0cm9rZT0iaHNsKDM4LCAxMDAlLCA1MCUpIiBkPSJNNzIuNzExIDE1OC4yODlhNjYuNSA2Ni41IDAgMDAuNjMxIDEuNjIyIi8+PHBhdGggc3Ryb2tlPSJoc2woMzksIDEwMCUsIDUwJSkiIGQ9Ik03Mi4zMTQgMTU3LjE5OGE2Ni41IDY2LjUgMCAwMC42MDMgMS42MzMiLz48cGF0aCBzdHJva2U9ImhzbCg0MCwgMTAwJSwgNTAlKSIgZD0iTTcxLjkzNiAxNTYuMWE2Ni41IDY2LjUgMCAwMC41NzQgMS42NDQiLz48cGF0aCBzdHJva2U9ImhzbCg0MSwgMTAwJSwgNTAlKSIgZD0iTTcxLjU3OCAxNTQuOTk3YTY2LjUgNjYuNSAwIDAwLjU0NSAxLjY1MyIvPjxwYXRoIHN0cm9rZT0iaHNsKDQyLCAxMDAlLCA1MCUpIiBkPSJNNzEuMjM4IDE1My44ODdhNjYuNSA2Ni41IDAgMDAuNTE3IDEuNjYzIi8+PHBhdGggc3Ryb2tlPSJoc2woNDMsIDEwMCUsIDUwJSkiIGQ9Ik03MC45MTkgMTUyLjc3MWE2Ni41IDY2LjUgMCAwMC40ODcgMS42NzIiLz48cGF0aCBzdHJva2U9ImhzbCg0NCwgMTAwJSwgNTAlKSIgZD0iTTcwLjYxOCAxNTEuNjVhNjYuNSA2Ni41IDAgMDAuNDU4IDEuNjgiLz48cGF0aCBzdHJva2U9ImhzbCg0NSwgMTAwJSwgNTAlKSIgZD0iTTcwLjMzNyAxNTAuNTI0YTY2LjUgNjYuNSAwIDAwLjQyOSAxLjY4NyIvPjxwYXRoIHN0cm9rZT0iaHNsKDQ2LCAxMDAlLCA1MCUpIiBkPSJNNzAuMDc2IDE0OS4zOTNhNjYuNSA2Ni41IDAgMDAuNCAxLjY5NSIvPjxwYXRoIHN0cm9rZT0iaHNsKDQ3LCAxMDAlLCA1MCUpIiBkPSJNNjkuODM1IDE0OC4yNThhNjYuNSA2Ni41IDAgMDAuMzcgMS43MDEiLz48cGF0aCBzdHJva2U9ImhzbCg0OCwgMTAwJSwgNTAlKSIgZD0iTTY5LjYxNCAxNDcuMTE5YTY2LjUgNjYuNSAwIDAwLjM0IDEuNzA3Ii8+PHBhdGggc3Ryb2tlPSJoc2woNDksIDEwMCUsIDUwJSkiIGQ9Ik02OS40MTIgMTQ1Ljk3NmE2Ni41IDY2LjUgMCAwMC4zMSAxLjcxMyIvPjxwYXRoIHN0cm9rZT0iaHNsKDUwLCAxMDAlLCA1MCUpIiBkPSJNNjkuMjMgMTQ0LjgzYTY2LjUgNjYuNSAwIDAwLjI4IDEuNzE4Ii8+PHBhdGggc3Ryb2tlPSJoc2woNTEsIDEwMCUsIDUwJSkiIGQ9Ik02OS4wNjkgMTQzLjY4YTY2LjUgNjYuNSAwIDAwLjI1IDEuNzIzIi8+PHBhdGggc3Ryb2tlPSJoc2woNTIsIDEwMCUsIDUwJSkiIGQ9Ik02OC45MjcgMTQyLjUyOGE2Ni41IDY2LjUgMCAwMC4yMiAxLjcyNyIvPjxwYXRoIHN0cm9rZT0iaHNsKDUzLCAxMDAlLCA1MCUpIiBkPSJNNjguODA2IDE0MS4zNzRhNjYuNSA2Ni41IDAgMDAuMTkgMS43MyIvPjxwYXRoIHN0cm9rZT0iaHNsKDU0LCAxMDAlLCA1MCUpIiBkPSJNNjguNzA1IDE0MC4yMThhNjYuNSA2Ni41IDAgMDAuMTYgMS43MzMiLz48cGF0aCBzdHJva2U9ImhzbCg1NSwgMTAwJSwgNTAlKSIgZD0iTTY4LjYyNCAxMzkuMDZhNjYuNSA2Ni41IDAgMDAuMTMgMS43MzYiLz48cGF0aCBzdHJva2U9ImhzbCg1NiwgMTAwJSwgNTAlKSIgZD0iTTY4LjU2MyAxMzcuOWE2Ni41IDY2LjUgMCAwMC4wOTkgMS43MzkiLz48cGF0aCBzdHJva2U9ImhzbCg1NywgMTAwJSwgNTAlKSIgZD0iTTY4LjUyMyAxMzYuNzRhNjYuNSA2Ni41IDAgMDAuMDY4IDEuNzQiLz48cGF0aCBzdHJva2U9ImhzbCg1OCwgMTAwJSwgNTAlKSIgZD0iTTY4LjUwMyAxMzUuNThhNjYuNSA2Ni41IDAgMDAuMDM4IDEuNzQiLz48cGF0aCBzdHJva2U9ImhzbCg1OSwgMTAwJSwgNTAlKSIgZD0iTTY4LjUwMyAxMzQuNDJhNjYuNSA2Ni41IDAgMDAuMDA3IDEuNzQiLz48cGF0aCBzdHJva2U9ImhzbCg2MCwgMTAwJSwgNTAlKSIgZD0iTTY4LjUyMyAxMzMuMjZBNjYuNSA2Ni41IDAgMDA2OC41IDEzNSIvPjxwYXRoIHN0cm9rZT0iaHNsKDYxLCAxMDAlLCA1MCUpIiBkPSJNNjguNTYzIDEzMi4xYTY2LjUgNjYuNSAwIDAwLS4wNTMgMS43NCIvPjxwYXRoIHN0cm9rZT0iaHNsKDYyLCAxMDAlLCA1MCUpIiBkPSJNNjguNjI0IDEzMC45NGE2Ni41IDY2LjUgMCAwMC0uMDgzIDEuNzQiLz48cGF0aCBzdHJva2U9ImhzbCg2MywgMTAwJSwgNTAlKSIgZD0iTTY4LjcwNSAxMjkuNzgyYTY2LjUgNjYuNSAwIDAwLS4xMTQgMS43MzgiLz48cGF0aCBzdHJva2U9ImhzbCg2NCwgMTAwJSwgNTAlKSIgZD0iTTY4LjgwNiAxMjguNjI2YTY2LjUgNjYuNSAwIDAwLS4xNDQgMS43MzUiLz48cGF0aCBzdHJva2U9ImhzbCg2NSwgMTAwJSwgNTAlKSIgZD0iTTY4LjkyNyAxMjcuNDcyYTY2LjUgNjYuNSAwIDAwLS4xNzQgMS43MzIiLz48cGF0aCBzdHJva2U9ImhzbCg2NiwgMTAwJSwgNTAlKSIgZD0iTTY5LjA2OSAxMjYuMzJhNjYuNSA2Ni41IDAgMDAtLjIwNSAxLjcyOSIvPjxwYXRoIHN0cm9rZT0iaHNsKDY3LCAxMDAlLCA1MCUpIiBkPSJNNjkuMjMgMTI1LjE3YTY2LjUgNjYuNSAwIDAwLS4yMzQgMS43MjYiLz48cGF0aCBzdHJva2U9ImhzbCg2OCwgMTAwJSwgNTAlKSIgZD0iTTY5LjQxMiAxMjQuMDI0YTY2LjUgNjYuNSAwIDAwLS4yNjUgMS43MjEiLz48cGF0aCBzdHJva2U9ImhzbCg2OSwgMTAwJSwgNTAlKSIgZD0iTTY5LjYxNCAxMjIuODgxYTY2LjUgNjYuNSAwIDAwLS4yOTUgMS43MTYiLz48cGF0aCBzdHJva2U9ImhzbCg3MCwgMTAwJSwgNTAlKSIgZD0iTTY5LjgzNSAxMjEuNzQyYTY2LjUgNjYuNSAwIDAwLS4zMjUgMS43MSIvPjxwYXRoIHN0cm9rZT0iaHNsKDcxLCAxMDAlLCA1MCUpIiBkPSJNNzAuMDc2IDEyMC42MDdhNjYuNSA2Ni41IDAgMDAtLjM1NCAxLjcwNCIvPjxwYXRoIHN0cm9rZT0iaHNsKDcyLCAxMDAlLCA1MCUpIiBkPSJNNzAuMzM3IDExOS40NzZhNjYuNSA2Ni41IDAgMDAtLjM4NCAxLjY5OCIvPjxwYXRoIHN0cm9rZT0iaHNsKDczLCAxMDAlLCA1MCUpIiBkPSJNNzAuNjE4IDExOC4zNWE2Ni41IDY2LjUgMCAwMC0uNDE0IDEuNjkiLz48cGF0aCBzdHJva2U9ImhzbCg3NCwgMTAwJSwgNTAlKSIgZD0iTTcwLjkxOSAxMTcuMjI5YTY2LjUgNjYuNSAwIDAwLS40NDQgMS42ODMiLz48cGF0aCBzdHJva2U9ImhzbCg3NSwgMTAwJSwgNTAlKSIgZD0iTTcxLjIzOCAxMTYuMTEzYTY2LjUgNjYuNSAwIDAwLS40NzIgMS42NzYiLz48cGF0aCBzdHJva2U9ImhzbCg3NiwgMTAwJSwgNTAlKSIgZD0iTTcxLjU3OCAxMTUuMDAzYTY2LjUgNjYuNSAwIDAwLS41MDIgMS42NjciLz48cGF0aCBzdHJva2U9ImhzbCg3NywgMTAwJSwgNTAlKSIgZD0iTTcxLjkzNiAxMTMuOWE2Ni41IDY2LjUgMCAwMC0uNTMgMS42NTciLz48cGF0aCBzdHJva2U9ImhzbCg3OCwgMTAwJSwgNTAlKSIgZD0iTTcyLjMxNCAxMTIuODAyYTY2LjUgNjYuNSAwIDAwLS41NiAxLjY0OCIvPjxwYXRoIHN0cm9rZT0iaHNsKDc5LCAxMDAlLCA1MCUpIiBkPSJNNzIuNzExIDExMS43MTFhNjYuNSA2Ni41IDAgMDAtLjU4OCAxLjYzOSIvPjxwYXRoIHN0cm9rZT0iaHNsKDgwLCAxMDAlLCA1MCUpIiBkPSJNNzMuMTI3IDExMC42MjhhNjYuNSA2Ni41IDAgMDAtLjYxNyAxLjYyOCIvPjxwYXRoIHN0cm9rZT0iaHNsKDgxLCAxMDAlLCA1MCUpIiBkPSJNNzMuNTYyIDEwOS41NTJhNjYuNSA2Ni41IDAgMDAtLjY0NSAxLjYxNyIvPjxwYXRoIHN0cm9rZT0iaHNsKDgyLCAxMDAlLCA1MCUpIiBkPSJNNzQuMDE2IDEwOC40ODNhNjYuNSA2Ni41IDAgMDAtLjY3NCAxLjYwNiIvPjxwYXRoIHN0cm9rZT0iaHNsKDgzLCAxMDAlLCA1MCUpIiBkPSJNNzQuNDg4IDEwNy40MjNhNjYuNSA2Ni41IDAgMDAtLjcwMiAxLjU5MyIvPjxwYXRoIHN0cm9rZT0iaHNsKDg0LCAxMDAlLCA1MCUpIiBkPSJNNzQuOTc4IDEwNi4zNzFhNjYuNSA2Ni41IDAgMDAtLjcyOSAxLjU4MSIvPjxwYXRoIHN0cm9rZT0iaHNsKDg1LCAxMDAlLCA1MCUpIiBkPSJNNzUuNDg3IDEwNS4zMjhhNjYuNSA2Ni41IDAgMDAtLjc1NiAxLjU2OCIvPjxwYXRoIHN0cm9rZT0iaHNsKDg2LCAxMDAlLCA1MCUpIiBkPSJNNzYuMDE0IDEwNC4yOTRhNjYuNSA2Ni41IDAgMDAtLjc4NCAxLjU1NCIvPjxwYXRoIHN0cm9rZT0iaHNsKDg3LCAxMDAlLCA1MCUpIiBkPSJNNzYuNTU5IDEwMy4yNjlhNjYuNSA2Ni41IDAgMDAtLjgxIDEuNTQiLz48cGF0aCBzdHJva2U9ImhzbCg4OCwgMTAwJSwgNTAlKSIgZD0iTTc3LjEyMSAxMDIuMjU0YTY2LjUgNjYuNSAwIDAwLS44MzcgMS41MjYiLz48cGF0aCBzdHJva2U9ImhzbCg4OSwgMTAwJSwgNTAlKSIgZD0iTTc3LjcwMiAxMDEuMjQ5YTY2LjUgNjYuNSAwIDAwLS44NjQgMS41MTEiLz48cGF0aCBzdHJva2U9ImhzbCg5MCwgMTAwJSwgNTAlKSIgZD0iTTc4LjMgMTAwLjI1NGE2Ni41IDY2LjUgMCAwMC0uODkgMS40OTYiLz48cGF0aCBzdHJva2U9ImhzbCg5MSwgMTAwJSwgNTAlKSIgZD0iTTc4LjkxNCA5OS4yN2E2Ni41IDY2LjUgMCAwMC0uOTE2IDEuNDgiLz48cGF0aCBzdHJva2U9ImhzbCg5MiwgMTAwJSwgNTAlKSIgZD0iTTc5LjU0NyA5OC4yOTZhNjYuNSA2Ni41IDAgMDAtLjk0MiAxLjQ2NCIvPjxwYXRoIHN0cm9rZT0iaHNsKDkzLCAxMDAlLCA1MCUpIiBkPSJNODAuMTk2IDk3LjMzNGE2Ni41IDY2LjUgMCAwMC0uOTY4IDEuNDQ4Ii8+PHBhdGggc3Ryb2tlPSJoc2woOTQsIDEwMCUsIDUwJSkiIGQ9Ik04MC44NjEgOTYuMzgzYTY2LjUgNjYuNSAwIDAwLS45OTIgMS40MyIvPjxwYXRoIHN0cm9rZT0iaHNsKDk1LCAxMDAlLCA1MCUpIiBkPSJNODEuNTQ0IDk1LjQ0NGE2Ni41IDY2LjUgMCAwMC0xLjAxOCAxLjQxMyIvPjxwYXRoIHN0cm9rZT0iaHNsKDk2LCAxMDAlLCA1MCUpIiBkPSJNODIuMjQyIDk0LjUxN2E2Ni41IDY2LjUgMCAwMC0xLjA0MiAxLjM5NSIvPjxwYXRoIHN0cm9rZT0iaHNsKDk3LCAxMDAlLCA1MCUpIiBkPSJNODIuOTU3IDkzLjYwM2E2Ni41IDY2LjUgMCAwMC0xLjA2NiAxLjM3NiIvPjxwYXRoIHN0cm9rZT0iaHNsKDk4LCAxMDAlLCA1MCUpIiBkPSJNODMuNjg3IDkyLjdhNjYuNSA2Ni41IDAgMDAtMS4wOSAxLjM1OSIvPjxwYXRoIHN0cm9rZT0iaHNsKDk5LCAxMDAlLCA1MCUpIiBkPSJNODQuNDMzIDkxLjgxMmE2Ni41IDY2LjUgMCAwMC0xLjExMyAxLjMzOCIvPjxwYXRoIHN0cm9rZT0iaHNsKDEwMCwgMTAwJSwgNTAlKSIgZD0iTTg1LjE5NCA5MC45MzZhNjYuNSA2Ni41IDAgMDAtMS4xMzYgMS4zMTkiLz48cGF0aCBzdHJva2U9ImhzbCgxMDEsIDEwMCUsIDUwJSkiIGQ9Ik04NS45NzEgOTAuMDczYTY2LjUgNjYuNSAwIDAwLTEuMTYgMS4zIi8+PHBhdGggc3Ryb2tlPSJoc2woMTAyLCAxMDAlLCA1MCUpIiBkPSJNODYuNzYzIDg5LjIyNGE2Ni41IDY2LjUgMCAwMC0xLjE4MiAxLjI3OSIvPjxwYXRoIHN0cm9rZT0iaHNsKDEwMywgMTAwJSwgNTAlKSIgZD0iTTg3LjU2OSA4OC4zOWE2Ni41IDY2LjUgMCAwMC0xLjIwNCAxLjI1NyIvPjxwYXRoIHN0cm9rZT0iaHNsKDEwNCwgMTAwJSwgNTAlKSIgZD0iTTg4LjM5IDg3LjU2OWE2Ni41IDY2LjUgMCAwMC0xLjIyNiAxLjIzNiIvPjxwYXRoIHN0cm9rZT0iaHNsKDEwNSwgMTAwJSwgNTAlKSIgZD0iTTg5LjIyNCA4Ni43NjNhNjYuNSA2Ni41IDAgMDAtMS4yNDcgMS4yMTQiLz48cGF0aCBzdHJva2U9ImhzbCgxMDYsIDEwMCUsIDUwJSkiIGQ9Ik05MC4wNzMgODUuOTcxYTY2LjUgNjYuNSAwIDAwLTEuMjY4IDEuMTkzIi8+PHBhdGggc3Ryb2tlPSJoc2woMTA3LCAxMDAlLCA1MCUpIiBkPSJNOTAuOTM2IDg1LjE5NGE2Ni41IDY2LjUgMCAwMC0xLjI4OSAxLjE3MSIvPjxwYXRoIHN0cm9rZT0iaHNsKDEwOCwgMTAwJSwgNTAlKSIgZD0iTTkxLjgxMiA4NC40MzNhNjYuNSA2Ni41IDAgMDAtMS4zMSAxLjE0OCIvPjxwYXRoIHN0cm9rZT0iaHNsKDEwOSwgMTAwJSwgNTAlKSIgZD0iTTkyLjcgODMuNjg3YTY2LjUgNjYuNSAwIDAwLTEuMzI4IDEuMTI1Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTEwLCAxMDAlLCA1MCUpIiBkPSJNOTMuNjAzIDgyLjk1N2E2Ni41IDY2LjUgMCAwMC0xLjM0OCAxLjEwMSIvPjxwYXRoIHN0cm9rZT0iaHNsKDExMSwgMTAwJSwgNTAlKSIgZD0iTTk0LjUxNyA4Mi4yNDJhNjYuNSA2Ni41IDAgMDAtMS4zNjcgMS4wNzgiLz48cGF0aCBzdHJva2U9ImhzbCgxMTIsIDEwMCUsIDUwJSkiIGQ9Ik05NS40NDQgODEuNTQ0YTY2LjUgNjYuNSAwIDAwLTEuMzg1IDEuMDUzIi8+PHBhdGggc3Ryb2tlPSJoc2woMTEzLCAxMDAlLCA1MCUpIiBkPSJNOTYuMzgzIDgwLjg2MWE2Ni41IDY2LjUgMCAwMC0xLjQwNCAxLjAzIi8+PHBhdGggc3Ryb2tlPSJoc2woMTE0LCAxMDAlLCA1MCUpIiBkPSJNOTcuMzM0IDgwLjE5NmE2Ni41IDY2LjUgMCAwMC0xLjQyMiAxLjAwNCIvPjxwYXRoIHN0cm9rZT0iaHNsKDExNSwgMTAwJSwgNTAlKSIgZD0iTTk4LjI5NiA3OS41NDdhNjYuNSA2Ni41IDAgMDAtMS40MzkuOTgiLz48cGF0aCBzdHJva2U9ImhzbCgxMTYsIDEwMCUsIDUwJSkiIGQ9Ik05OS4yNyA3OC45MTRhNjYuNSA2Ni41IDAgMDAtMS40NTYuOTU1Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTE3LCAxMDAlLCA1MCUpIiBkPSJNMTAwLjI1NCA3OC4zYTY2LjUgNjYuNSAwIDAwLTEuNDcyLjkyOCIvPjxwYXRoIHN0cm9rZT0iaHNsKDExOCwgMTAwJSwgNTAlKSIgZD0iTTEwMS4yNDkgNzcuNzAyYTY2LjUgNjYuNSAwIDAwLTEuNDg5LjkwMyIvPjxwYXRoIHN0cm9rZT0iaHNsKDExOSwgMTAwJSwgNTAlKSIgZD0iTTEwMi4yNTQgNzcuMTIxYTY2LjUgNjYuNSAwIDAwLTEuNTA0Ljg3NyIvPjxwYXRoIHN0cm9rZT0iaHNsKDEyMCwgMTAwJSwgNTAlKSIgZD0iTTEwMy4yNjkgNzYuNTU5YTY2LjUgNjYuNSAwIDAwLTEuNTE5Ljg1Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTIxLCAxMDAlLCA1MCUpIiBkPSJNMTA0LjI5NCA3Ni4wMTRhNjYuNSA2Ni41IDAgMDAtMS41MzQuODI0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTIyLCAxMDAlLCA1MCUpIiBkPSJNMTA1LjMyOCA3NS40ODdhNjYuNSA2Ni41IDAgMDAtMS41NDguNzk3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTIzLCAxMDAlLCA1MCUpIiBkPSJNMTA2LjM3MSA3NC45NzhhNjYuNSA2Ni41IDAgMDAtMS41NjEuNzciLz48cGF0aCBzdHJva2U9ImhzbCgxMjQsIDEwMCUsIDUwJSkiIGQ9Ik0xMDcuNDIzIDc0LjQ4OGE2Ni41IDY2LjUgMCAwMC0xLjU3NS43NDIiLz48cGF0aCBzdHJva2U9ImhzbCgxMjUsIDEwMCUsIDUwJSkiIGQ9Ik0xMDguNDgzIDc0LjAxNmE2Ni41IDY2LjUgMCAwMC0xLjU4Ny43MTUiLz48cGF0aCBzdHJva2U9ImhzbCgxMjYsIDEwMCUsIDUwJSkiIGQ9Ik0xMDkuNTUyIDczLjU2MmE2Ni41IDY2LjUgMCAwMC0xLjYuNjg3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTI3LCAxMDAlLCA1MCUpIiBkPSJNMTEwLjYyOCA3My4xMjdhNjYuNSA2Ni41IDAgMDAtMS42MTIuNjYiLz48cGF0aCBzdHJva2U9ImhzbCgxMjgsIDEwMCUsIDUwJSkiIGQ9Ik0xMTEuNzExIDcyLjcxMWE2Ni41IDY2LjUgMCAwMC0xLjYyMi42MzEiLz48cGF0aCBzdHJva2U9ImhzbCgxMjksIDEwMCUsIDUwJSkiIGQ9Ik0xMTIuODAyIDcyLjMxNGE2Ni41IDY2LjUgMCAwMC0xLjYzMy42MDMiLz48cGF0aCBzdHJva2U9ImhzbCgxMzAsIDEwMCUsIDUwJSkiIGQ9Ik0xMTMuOSA3MS45MzZhNjYuNSA2Ni41IDAgMDAtMS42NDQuNTc0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTMxLCAxMDAlLCA1MCUpIiBkPSJNMTE1LjAwMyA3MS41NzhhNjYuNSA2Ni41IDAgMDAtMS42NTMuNTQ1Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTMyLCAxMDAlLCA1MCUpIiBkPSJNMTE2LjExMyA3MS4yMzhhNjYuNSA2Ni41IDAgMDAtMS42NjMuNTE3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTMzLCAxMDAlLCA1MCUpIiBkPSJNMTE3LjIyOSA3MC45MTlhNjYuNSA2Ni41IDAgMDAtMS42NzIuNDg3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTM0LCAxMDAlLCA1MCUpIiBkPSJNMTE4LjM1IDcwLjYxOGE2Ni41IDY2LjUgMCAwMC0xLjY4LjQ1OCIvPjxwYXRoIHN0cm9rZT0iaHNsKDEzNSwgMTAwJSwgNTAlKSIgZD0iTTExOS40NzYgNzAuMzM3YTY2LjUgNjYuNSAwIDAwLTEuNjg3LjQyOSIvPjxwYXRoIHN0cm9rZT0iaHNsKDEzNiwgMTAwJSwgNTAlKSIgZD0iTTEyMC42MDcgNzAuMDc2YTY2LjUgNjYuNSAwIDAwLTEuNjk1LjQiLz48cGF0aCBzdHJva2U9ImhzbCgxMzcsIDEwMCUsIDUwJSkiIGQ9Ik0xMjEuNzQyIDY5LjgzNWE2Ni41IDY2LjUgMCAwMC0xLjcwMS4zNyIvPjxwYXRoIHN0cm9rZT0iaHNsKDEzOCwgMTAwJSwgNTAlKSIgZD0iTTEyMi44ODEgNjkuNjE0YTY2LjUgNjYuNSAwIDAwLTEuNzA3LjM0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTM5LCAxMDAlLCA1MCUpIiBkPSJNMTI0LjAyNCA2OS40MTJhNjYuNSA2Ni41IDAgMDAtMS43MTMuMzEiLz48cGF0aCBzdHJva2U9ImhzbCgxNDAsIDEwMCUsIDUwJSkiIGQ9Ik0xMjUuMTcgNjkuMjNhNjYuNSA2Ni41IDAgMDAtMS43MTguMjgiLz48cGF0aCBzdHJva2U9ImhzbCgxNDEsIDEwMCUsIDUwJSkiIGQ9Ik0xMjYuMzIgNjkuMDY5YTY2LjUgNjYuNSAwIDAwLTEuNzIzLjI1Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTQyLCAxMDAlLCA1MCUpIiBkPSJNMTI3LjQ3MiA2OC45MjdhNjYuNSA2Ni41IDAgMDAtMS43MjcuMjIiLz48cGF0aCBzdHJva2U9ImhzbCgxNDMsIDEwMCUsIDUwJSkiIGQ9Ik0xMjguNjI2IDY4LjgwNmE2Ni41IDY2LjUgMCAwMC0xLjczLjE5Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTQ0LCAxMDAlLCA1MCUpIiBkPSJNMTI5Ljc4MiA2OC43MDVhNjYuNSA2Ni41IDAgMDAtMS43MzMuMTYiLz48cGF0aCBzdHJva2U9ImhzbCgxNDUsIDEwMCUsIDUwJSkiIGQ9Ik0xMzAuOTQgNjguNjI0YTY2LjUgNjYuNSAwIDAwLTEuNzM2LjEzIi8+PHBhdGggc3Ryb2tlPSJoc2woMTQ2LCAxMDAlLCA1MCUpIiBkPSJNMTMyLjEgNjguNTYzYTY2LjUgNjYuNSAwIDAwLTEuNzM5LjA5OSIvPjxwYXRoIHN0cm9rZT0iaHNsKDE0NywgMTAwJSwgNTAlKSIgZD0iTTEzMy4yNiA2OC41MjNhNjYuNSA2Ni41IDAgMDAtMS43NC4wNjgiLz48cGF0aCBzdHJva2U9ImhzbCgxNDgsIDEwMCUsIDUwJSkiIGQ9Ik0xMzQuNDIgNjguNTAzYTY2LjUgNjYuNSAwIDAwLTEuNzQuMDM4Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTQ5LCAxMDAlLCA1MCUpIiBkPSJNMTM1LjU4IDY4LjUwM2E2Ni41IDY2LjUgMCAwMC0xLjc0LjAwNyIvPjxwYXRoIHN0cm9rZT0iaHNsKDE1MCwgMTAwJSwgNTAlKSIgZD0iTTEzNi43NCA2OC41MjNBNjYuNSA2Ni41IDAgMDAxMzUgNjguNSIvPjxwYXRoIHN0cm9rZT0iaHNsKDE1MSwgMTAwJSwgNTAlKSIgZD0iTTEzNy45IDY4LjU2M2E2Ni41IDY2LjUgMCAwMC0xLjc0LS4wNTMiLz48cGF0aCBzdHJva2U9ImhzbCgxNTIsIDEwMCUsIDUwJSkiIGQ9Ik0xMzkuMDYgNjguNjI0YTY2LjUgNjYuNSAwIDAwLTEuNzQtLjA4MyIvPjxwYXRoIHN0cm9rZT0iaHNsKDE1MywgMTAwJSwgNTAlKSIgZD0iTTE0MC4yMTggNjguNzA1YTY2LjUgNjYuNSAwIDAwLTEuNzM4LS4xMTQiLz48cGF0aCBzdHJva2U9ImhzbCgxNTQsIDEwMCUsIDUwJSkiIGQ9Ik0xNDEuMzc0IDY4LjgwNmE2Ni41IDY2LjUgMCAwMC0xLjczNS0uMTQ0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTU1LCAxMDAlLCA1MCUpIiBkPSJNMTQyLjUyOCA2OC45MjdhNjYuNSA2Ni41IDAgMDAtMS43MzItLjE3NCIvPjxwYXRoIHN0cm9rZT0iaHNsKDE1NiwgMTAwJSwgNTAlKSIgZD0iTTE0My42OCA2OS4wNjlhNjYuNSA2Ni41IDAgMDAtMS43MjktLjIwNSIvPjxwYXRoIHN0cm9rZT0iaHNsKDE1NywgMTAwJSwgNTAlKSIgZD0iTTE0NC44MyA2OS4yM2E2Ni41IDY2LjUgMCAwMC0xLjcyNi0uMjM0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTU4LCAxMDAlLCA1MCUpIiBkPSJNMTQ1Ljk3NiA2OS40MTJhNjYuNSA2Ni41IDAgMDAtMS43MjEtLjI2NSIvPjxwYXRoIHN0cm9rZT0iaHNsKDE1OSwgMTAwJSwgNTAlKSIgZD0iTTE0Ny4xMTkgNjkuNjE0YTY2LjUgNjYuNSAwIDAwLTEuNzE2LS4yOTUiLz48cGF0aCBzdHJva2U9ImhzbCgxNjAsIDEwMCUsIDUwJSkiIGQ9Ik0xNDguMjU4IDY5LjgzNWE2Ni41IDY2LjUgMCAwMC0xLjcxLS4zMjUiLz48cGF0aCBzdHJva2U9ImhzbCgxNjEsIDEwMCUsIDUwJSkiIGQ9Ik0xNDkuMzkzIDcwLjA3NmE2Ni41IDY2LjUgMCAwMC0xLjcwNC0uMzU0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTYyLCAxMDAlLCA1MCUpIiBkPSJNMTUwLjUyNCA3MC4zMzdhNjYuNSA2Ni41IDAgMDAtMS42OTgtLjM4NCIvPjxwYXRoIHN0cm9rZT0iaHNsKDE2MywgMTAwJSwgNTAlKSIgZD0iTTE1MS42NSA3MC42MThhNjYuNSA2Ni41IDAgMDAtMS42OS0uNDE0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTY0LCAxMDAlLCA1MCUpIiBkPSJNMTUyLjc3MSA3MC45MTlhNjYuNSA2Ni41IDAgMDAtMS42ODMtLjQ0NCIvPjxwYXRoIHN0cm9rZT0iaHNsKDE2NSwgMTAwJSwgNTAlKSIgZD0iTTE1My44ODcgNzEuMjM4YTY2LjUgNjYuNSAwIDAwLTEuNjc2LS40NzIiLz48cGF0aCBzdHJva2U9ImhzbCgxNjYsIDEwMCUsIDUwJSkiIGQ9Ik0xNTQuOTk3IDcxLjU3OGE2Ni41IDY2LjUgMCAwMC0xLjY2Ny0uNTAyIi8+PHBhdGggc3Ryb2tlPSJoc2woMTY3LCAxMDAlLCA1MCUpIiBkPSJNMTU2LjEgNzEuOTM2YTY2LjUgNjYuNSAwIDAwLTEuNjU3LS41MyIvPjxwYXRoIHN0cm9rZT0iaHNsKDE2OCwgMTAwJSwgNTAlKSIgZD0iTTE1Ny4xOTggNzIuMzE0YTY2LjUgNjYuNSAwIDAwLTEuNjQ4LS41NiIvPjxwYXRoIHN0cm9rZT0iaHNsKDE2OSwgMTAwJSwgNTAlKSIgZD0iTTE1OC4yODkgNzIuNzExYTY2LjUgNjYuNSAwIDAwLTEuNjM5LS41ODgiLz48cGF0aCBzdHJva2U9ImhzbCgxNzAsIDEwMCUsIDUwJSkiIGQ9Ik0xNTkuMzcyIDczLjEyN2E2Ni41IDY2LjUgMCAwMC0xLjYyOC0uNjE3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTcxLCAxMDAlLCA1MCUpIiBkPSJNMTYwLjQ0OCA3My41NjJhNjYuNSA2Ni41IDAgMDAtMS42MTctLjY0NSIvPjxwYXRoIHN0cm9rZT0iaHNsKDE3MiwgMTAwJSwgNTAlKSIgZD0iTTE2MS41MTcgNzQuMDE2YTY2LjUgNjYuNSAwIDAwLTEuNjA2LS42NzQiLz48cGF0aCBzdHJva2U9ImhzbCgxNzMsIDEwMCUsIDUwJSkiIGQ9Ik0xNjIuNTc3IDc0LjQ4OGE2Ni41IDY2LjUgMCAwMC0xLjU5My0uNzAyIi8+PHBhdGggc3Ryb2tlPSJoc2woMTc0LCAxMDAlLCA1MCUpIiBkPSJNMTYzLjYyOSA3NC45NzhhNjYuNSA2Ni41IDAgMDAtMS41ODEtLjcyOSIvPjxwYXRoIHN0cm9rZT0iaHNsKDE3NSwgMTAwJSwgNTAlKSIgZD0iTTE2NC42NzIgNzUuNDg3YTY2LjUgNjYuNSAwIDAwLTEuNTY4LS43NTYiLz48cGF0aCBzdHJva2U9ImhzbCgxNzYsIDEwMCUsIDUwJSkiIGQ9Ik0xNjUuNzA2IDc2LjAxNGE2Ni41IDY2LjUgMCAwMC0xLjU1NC0uNzg0Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTc3LCAxMDAlLCA1MCUpIiBkPSJNMTY2LjczMSA3Ni41NTlhNjYuNSA2Ni41IDAgMDAtMS41NC0uODEiLz48cGF0aCBzdHJva2U9ImhzbCgxNzgsIDEwMCUsIDUwJSkiIGQ9Ik0xNjcuNzQ2IDc3LjEyMWE2Ni41IDY2LjUgMCAwMC0xLjUyNi0uODM3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTc5LCAxMDAlLCA1MCUpIiBkPSJNMTY4Ljc1MSA3Ny43MDJhNjYuNSA2Ni41IDAgMDAtMS41MTEtLjg2NCIvPjxwYXRoIHN0cm9rZT0iaHNsKDE4MCwgMTAwJSwgNTAlKSIgZD0iTTE2OS43NDYgNzguM2E2Ni41IDY2LjUgMCAwMC0xLjQ5Ni0uODkiLz48cGF0aCBzdHJva2U9ImhzbCgxODEsIDEwMCUsIDUwJSkiIGQ9Ik0xNzAuNzMgNzguOTE0YTY2LjUgNjYuNSAwIDAwLTEuNDgtLjkxNiIvPjxwYXRoIHN0cm9rZT0iaHNsKDE4MiwgMTAwJSwgNTAlKSIgZD0iTTE3MS43MDQgNzkuNTQ3YTY2LjUgNjYuNSAwIDAwLTEuNDY0LS45NDIiLz48cGF0aCBzdHJva2U9ImhzbCgxODMsIDEwMCUsIDUwJSkiIGQ9Ik0xNzIuNjY2IDgwLjE5NmE2Ni41IDY2LjUgMCAwMC0xLjQ0OC0uOTY4Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTg0LCAxMDAlLCA1MCUpIiBkPSJNMTczLjYxNyA4MC44NjFhNjYuNSA2Ni41IDAgMDAtMS40My0uOTkyIi8+PHBhdGggc3Ryb2tlPSJoc2woMTg1LCAxMDAlLCA1MCUpIiBkPSJNMTc0LjU1NiA4MS41NDRhNjYuNSA2Ni41IDAgMDAtMS40MTMtMS4wMTgiLz48cGF0aCBzdHJva2U9ImhzbCgxODYsIDEwMCUsIDUwJSkiIGQ9Ik0xNzUuNDgzIDgyLjI0MmE2Ni41IDY2LjUgMCAwMC0xLjM5NS0xLjA0MiIvPjxwYXRoIHN0cm9rZT0iaHNsKDE4NywgMTAwJSwgNTAlKSIgZD0iTTE3Ni4zOTcgODIuOTU3YTY2LjUgNjYuNSAwIDAwLTEuMzc2LTEuMDY2Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTg4LCAxMDAlLCA1MCUpIiBkPSJNMTc3LjMgODMuNjg3YTY2LjUgNjYuNSAwIDAwLTEuMzU5LTEuMDkiLz48cGF0aCBzdHJva2U9ImhzbCgxODksIDEwMCUsIDUwJSkiIGQ9Ik0xNzguMTg4IDg0LjQzM2E2Ni41IDY2LjUgMCAwMC0xLjMzOC0xLjExMyIvPjxwYXRoIHN0cm9rZT0iaHNsKDE5MCwgMTAwJSwgNTAlKSIgZD0iTTE3OS4wNjQgODUuMTk0YTY2LjUgNjYuNSAwIDAwLTEuMzE5LTEuMTM2Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTkxLCAxMDAlLCA1MCUpIiBkPSJNMTc5LjkyNyA4NS45NzFhNjYuNSA2Ni41IDAgMDAtMS4zLTEuMTYiLz48cGF0aCBzdHJva2U9ImhzbCgxOTIsIDEwMCUsIDUwJSkiIGQ9Ik0xODAuNzc2IDg2Ljc2M2E2Ni41IDY2LjUgMCAwMC0xLjI3OS0xLjE4MiIvPjxwYXRoIHN0cm9rZT0iaHNsKDE5MywgMTAwJSwgNTAlKSIgZD0iTTE4MS42MSA4Ny41NjlhNjYuNSA2Ni41IDAgMDAtMS4yNTctMS4yMDQiLz48cGF0aCBzdHJva2U9ImhzbCgxOTQsIDEwMCUsIDUwJSkiIGQ9Ik0xODIuNDMxIDg4LjM5YTY2LjUgNjYuNSAwIDAwLTEuMjM2LTEuMjI2Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTk1LCAxMDAlLCA1MCUpIiBkPSJNMTgzLjIzNyA4OS4yMjRhNjYuNSA2Ni41IDAgMDAtMS4yMTQtMS4yNDciLz48cGF0aCBzdHJva2U9ImhzbCgxOTYsIDEwMCUsIDUwJSkiIGQ9Ik0xODQuMDI5IDkwLjA3M2E2Ni41IDY2LjUgMCAwMC0xLjE5My0xLjI2OCIvPjxwYXRoIHN0cm9rZT0iaHNsKDE5NywgMTAwJSwgNTAlKSIgZD0iTTE4NC44MDYgOTAuOTM2YTY2LjUgNjYuNSAwIDAwLTEuMTcxLTEuMjg5Ii8+PHBhdGggc3Ryb2tlPSJoc2woMTk4LCAxMDAlLCA1MCUpIiBkPSJNMTg1LjU2NyA5MS44MTJhNjYuNSA2Ni41IDAgMDAtMS4xNDgtMS4zMSIvPjxwYXRoIHN0cm9rZT0iaHNsKDE5OSwgMTAwJSwgNTAlKSIgZD0iTTE4Ni4zMTMgOTIuN2E2Ni41IDY2LjUgMCAwMC0xLjEyNS0xLjMyOCIvPjxwYXRoIHN0cm9rZT0iaHNsKDIwMCwgMTAwJSwgNTAlKSIgZD0iTTE4Ny4wNDMgOTMuNjAzYTY2LjUgNjYuNSAwIDAwLTEuMTAxLTEuMzQ4Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjAxLCAxMDAlLCA1MCUpIiBkPSJNMTg3Ljc1OCA5NC41MTdhNjYuNSA2Ni41IDAgMDAtMS4wNzgtMS4zNjciLz48cGF0aCBzdHJva2U9ImhzbCgyMDIsIDEwMCUsIDUwJSkiIGQ9Ik0xODguNDU2IDk1LjQ0NGE2Ni41IDY2LjUgMCAwMC0xLjA1My0xLjM4NSIvPjxwYXRoIHN0cm9rZT0iaHNsKDIwMywgMTAwJSwgNTAlKSIgZD0iTTE4OS4xMzkgOTYuMzgzYTY2LjUgNjYuNSAwIDAwLTEuMDMtMS40MDQiLz48cGF0aCBzdHJva2U9ImhzbCgyMDQsIDEwMCUsIDUwJSkiIGQ9Ik0xODkuODA0IDk3LjMzNGE2Ni41IDY2LjUgMCAwMC0xLjAwNC0xLjQyMiIvPjxwYXRoIHN0cm9rZT0iaHNsKDIwNSwgMTAwJSwgNTAlKSIgZD0iTTE5MC40NTMgOTguMjk2YTY2LjUgNjYuNSAwIDAwLS45OC0xLjQzOSIvPjxwYXRoIHN0cm9rZT0iaHNsKDIwNiwgMTAwJSwgNTAlKSIgZD0iTTE5MS4wODYgOTkuMjdhNjYuNSA2Ni41IDAgMDAtLjk1NS0xLjQ1NiIvPjxwYXRoIHN0cm9rZT0iaHNsKDIwNywgMTAwJSwgNTAlKSIgZD0iTTE5MS43IDEwMC4yNTRhNjYuNSA2Ni41IDAgMDAtLjkyOC0xLjQ3MiIvPjxwYXRoIHN0cm9rZT0iaHNsKDIwOCwgMTAwJSwgNTAlKSIgZD0iTTE5Mi4yOTggMTAxLjI0OWE2Ni41IDY2LjUgMCAwMC0uOTAzLTEuNDg5Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjA5LCAxMDAlLCA1MCUpIiBkPSJNMTkyLjg3OSAxMDIuMjU0YTY2LjUgNjYuNSAwIDAwLS44NzctMS41MDQiLz48cGF0aCBzdHJva2U9ImhzbCgyMTAsIDEwMCUsIDUwJSkiIGQ9Ik0xOTMuNDQxIDEwMy4yNjlhNjYuNSA2Ni41IDAgMDAtLjg1LTEuNTE5Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjExLCAxMDAlLCA1MCUpIiBkPSJNMTkzLjk4NiAxMDQuMjk0YTY2LjUgNjYuNSAwIDAwLS44MjQtMS41MzQiLz48cGF0aCBzdHJva2U9ImhzbCgyMTIsIDEwMCUsIDUwJSkiIGQ9Ik0xOTQuNTEzIDEwNS4zMjhhNjYuNSA2Ni41IDAgMDAtLjc5Ny0xLjU0OCIvPjxwYXRoIHN0cm9rZT0iaHNsKDIxMywgMTAwJSwgNTAlKSIgZD0iTTE5NS4wMjIgMTA2LjM3MWE2Ni41IDY2LjUgMCAwMC0uNzctMS41NjEiLz48cGF0aCBzdHJva2U9ImhzbCgyMTQsIDEwMCUsIDUwJSkiIGQ9Ik0xOTUuNTEyIDEwNy40MjNhNjYuNSA2Ni41IDAgMDAtLjc0Mi0xLjU3NSIvPjxwYXRoIHN0cm9rZT0iaHNsKDIxNSwgMTAwJSwgNTAlKSIgZD0iTTE5NS45ODQgMTA4LjQ4M2E2Ni41IDY2LjUgMCAwMC0uNzE1LTEuNTg3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjE2LCAxMDAlLCA1MCUpIiBkPSJNMTk2LjQzOCAxMDkuNTUyYTY2LjUgNjYuNSAwIDAwLS42ODctMS42Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjE3LCAxMDAlLCA1MCUpIiBkPSJNMTk2Ljg3MyAxMTAuNjI4YTY2LjUgNjYuNSAwIDAwLS42Ni0xLjYxMiIvPjxwYXRoIHN0cm9rZT0iaHNsKDIxOCwgMTAwJSwgNTAlKSIgZD0iTTE5Ny4yODkgMTExLjcxMWE2Ni41IDY2LjUgMCAwMC0uNjMxLTEuNjIyIi8+PHBhdGggc3Ryb2tlPSJoc2woMjE5LCAxMDAlLCA1MCUpIiBkPSJNMTk3LjY4NiAxMTIuODAyYTY2LjUgNjYuNSAwIDAwLS42MDMtMS42MzMiLz48cGF0aCBzdHJva2U9ImhzbCgyMjAsIDEwMCUsIDUwJSkiIGQ9Ik0xOTguMDY0IDExMy45YTY2LjUgNjYuNSAwIDAwLS41NzQtMS42NDQiLz48cGF0aCBzdHJva2U9ImhzbCgyMjEsIDEwMCUsIDUwJSkiIGQ9Ik0xOTguNDIyIDExNS4wMDNhNjYuNSA2Ni41IDAgMDAtLjU0NS0xLjY1MyIvPjxwYXRoIHN0cm9rZT0iaHNsKDIyMiwgMTAwJSwgNTAlKSIgZD0iTTE5OC43NjIgMTE2LjExM2E2Ni41IDY2LjUgMCAwMC0uNTE3LTEuNjYzIi8+PHBhdGggc3Ryb2tlPSJoc2woMjIzLCAxMDAlLCA1MCUpIiBkPSJNMTk5LjA4MSAxMTcuMjI5YTY2LjUgNjYuNSAwIDAwLS40ODctMS42NzIiLz48cGF0aCBzdHJva2U9ImhzbCgyMjQsIDEwMCUsIDUwJSkiIGQ9Ik0xOTkuMzgyIDExOC4zNWE2Ni41IDY2LjUgMCAwMC0uNDU4LTEuNjgiLz48cGF0aCBzdHJva2U9ImhzbCgyMjUsIDEwMCUsIDUwJSkiIGQ9Ik0xOTkuNjYzIDExOS40NzZhNjYuNSA2Ni41IDAgMDAtLjQyOS0xLjY4NyIvPjxwYXRoIHN0cm9rZT0iaHNsKDIyNiwgMTAwJSwgNTAlKSIgZD0iTTE5OS45MjQgMTIwLjYwN2E2Ni41IDY2LjUgMCAwMC0uNC0xLjY5NSIvPjxwYXRoIHN0cm9rZT0iaHNsKDIyNywgMTAwJSwgNTAlKSIgZD0iTTIwMC4xNjUgMTIxLjc0MmE2Ni41IDY2LjUgMCAwMC0uMzctMS43MDEiLz48cGF0aCBzdHJva2U9ImhzbCgyMjgsIDEwMCUsIDUwJSkiIGQ9Ik0yMDAuMzg2IDEyMi44ODFhNjYuNSA2Ni41IDAgMDAtLjM0LTEuNzA3Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjI5LCAxMDAlLCA1MCUpIiBkPSJNMjAwLjU4OCAxMjQuMDI0YTY2LjUgNjYuNSAwIDAwLS4zMS0xLjcxMyIvPjxwYXRoIHN0cm9rZT0iaHNsKDIzMCwgMTAwJSwgNTAlKSIgZD0iTTIwMC43NyAxMjUuMTdhNjYuNSA2Ni41IDAgMDAtLjI4LTEuNzE4Ii8+PHBhdGggc3Ryb2tlPSJoc2woMjMxLCAxMDAlLCA1MCUpIiBkPSJNMjAwLjkzMSAxMjYuMzJhNjYuNSA2Ni41IDAgMDAtLjI1LTEuNzIzIi8+PHBhdGggc3Ryb2tlPSJoc2woMjMyLCAxMDAlLCA1MCUpIiBkPSJNMjAxLjA3MyAxMjcuNDcyYTY2LjUgNjYuNSAwIDAwLS4yMi0xLjcyNyIvPjxwYXRoIHN0cm9rZT0iaHNsKDIzMywgMTAwJSwgNTAlKSIgZD0iTTIwMS4xOTQgMTI4LjYyNmE2Ni41IDY2LjUgMCAwMC0uMTktMS43MyIvPjxwYXRoIHN0cm9rZT0iaHNsKDIzNCwgMTAwJSwgNTAlKSIgZD0iTTIwMS4yOTUgMTI5Ljc4MmE2Ni41IDY2LjUgMCAwMC0uMTYtMS43MzMiLz48cGF0aCBzdHJva2U9ImhzbCgyMzUsIDEwMCUsIDUwJSkiIGQ9Ik0yMDEuMzc2IDEzMC45NGE2Ni41IDY2LjUgMCAwMC0uMTMtMS43MzYiLz48cGF0aCBzdHJva2U9ImhzbCgyMzYsIDEwMCUsIDUwJSkiIGQ9Ik0yMDEuNDM3IDEzMi4xYTY2LjUgNjYuNSAwIDAwLS4wOTktMS43MzkiLz48cGF0aCBzdHJva2U9ImhzbCgyMzcsIDEwMCUsIDUwJSkiIGQ9Ik0yMDEuNDc3IDEzMy4yNmE2Ni41IDY2LjUgMCAwMC0uMDY4LTEuNzQiLz48cGF0aCBzdHJva2U9ImhzbCgyMzgsIDEwMCUsIDUwJSkiIGQ9Ik0yMDEuNDk3IDEzNC40MmE2Ni41IDY2LjUgMCAwMC0uMDM4LTEuNzQiLz48cGF0aCBzdHJva2U9ImhzbCgyMzksIDEwMCUsIDUwJSkiIGQ9Ik0yMDEuNDk3IDEzNS41OGE2Ni41IDY2LjUgMCAwMC0uMDA3LTEuNzQiLz48L2c+PGNpcmNsZSBjeD0iMTM1IiBjeT0iMTM1IiByPSIxMzMiIGZpbGw9InVybCgjYSkiIGNsYXNzPSJJcm9XaGVlbFNhdHVyYXRpb24iLz48Y2lyY2xlIGN4PSIxMzUiIGN5PSIxMzUiIHI9IjEzMyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIGNsYXNzPSJJcm9XaGVlbEJvcmRlciIvPjwvc3ZnPg==';

        dialog.querySelector('.satus-scrollbar__content').appendChild(close);
        dialog.querySelector('.satus-scrollbar__content').appendChild(component_canvas);

        document.body.appendChild(dialog);
    });

    component.appendChild(component_value);

    return component;
};


/*--------------------------------------------------------------
# DIALOG
--------------------------------------------------------------*/

satus.components.dialog = function(element) {
    var component = document.createElement('div'),
        component_scrim = document.createElement('div'),
        component_surface = document.createElement('div'),
        component_scrollbar = satus.components.scrollbar(component_surface),
        options = element.options || {};

    component_scrim.className = 'satus-dialog__scrim';
    component_surface.className = 'satus-dialog__surface';

    for (var key in element) {
        satus.render(element[key], component_scrollbar);
    }

    function close() {
        window.removeEventListener('keydown', keydown);

        component.classList.add('satus-dialog--closing');

        if (typeof element.onclose === 'function') {
            element.onclose();
        }

        setTimeout(function() {
            component.remove();
        }, satus.getAnimationDuration(component_surface));
    }

    function keydown(event) {
        if (event.keyCode === 27) {
            event.preventDefault();
            close();
        }

        if (event.keyCode === 9) {
            var elements = component_surface.querySelectorAll('button, input'),
                focused = false;

            event.preventDefault();

            for (var i = 0, l = elements.length; i < l; i++) {
                if (elements[i] === document.activeElement && elements[i + 1]) {
                    elements[i + 1].focus();

                    focused = true;

                    i = l;
                }
            }

            if (focused === false) {
                elements[0].focus();
            }
        }
    }

    component_scrim.addEventListener('click', close);
    window.addEventListener('keydown', keydown);

    component.appendChild(component_scrim);
    component.appendChild(component_surface);

    // OPTIONS

    if (options.left) {
        component_surface.style.left = options.left + 'px';
    }

    if (options.top) {
        component_surface.style.top = options.top + 'px';
    }

    if (options.width) {
        component_surface.style.width = options.width + 'px';
    }

    if (options.height) {
        component_surface.style.height = options.height + 'px';
    }

    // END OPTIONS

    return component;
};


/*--------------------------------------------------------------
# FOLDER
--------------------------------------------------------------*/

satus.components.folder = function(object) {
    var component = document.createElement('button');

    component.object = object;

    component.classList.add('satus-button');

    component.addEventListener('click', function() {
        var parent = document.querySelector(component.object.parent) || document.querySelector('.satus-main');

        if (!component.object.parent || !parent.classList.contains('satus-main')) {
            while (!parent.classList.contains('satus-main')) {
                parent = parent.parentNode;
            }
        }

        parent.open(this.object, object.onopen);
    });

    if (satus.isset(object.label)) {
        var component_label = document.createElement('span');

        component_label.className = 'satus-folder__label';
        component_label.innerText = satus.locale.getMessage(object.label);

        component.appendChild(component_label);
    }

    return component;
};


/*--------------------------------------------------------------
# HEADER
--------------------------------------------------------------*/

satus.components.header = function(object) {
    var component = document.createElement('header');

	for (var key in object) {
		satus.render(object[key], component);
	}

    return component;
};


/*--------------------------------------------------------------
# LIST
--------------------------------------------------------------*/

satus.components.list = function(object) {
    var ul = document.createElement('ul');

    if (object.compact === true) {
        ul.classList.add('satus-list');
        ul.classList.add('satus-list--compact');
    }

    for (var key in object) {
        if (satus.isset(object[key].type)) {
            var li = document.createElement('li');

            if (object.sortable === true) {
                function mousedown(event) {
                    if (event.button === 0) {
                        var self = this,
                            dragging = false,
                            clone = false,
                            current_index = Array.from(self.parentNode.children).indexOf(self),
                            bounding = this.getBoundingClientRect(),
                            first_x = event.clientX,
                            first_y = event.clientY,
                            offset_x = event.clientX - bounding.left,
                            offset_y = event.clientY - bounding.top;

                        function mousemove(event) {
                            if (Math.abs(first_y - event.clientY) <= 5) {
                                return false;
                            }
                            
                            if (dragging === false) {
                                clone = self.cloneNode(true);

                                satus.cloneNodeStyles(self, clone);
                                clone.style.position = 'fixed';
                                clone.style.pointerEvents = 'none';
                                clone.style.backgroundColor = '#fff';
                                self.style.visibility = 'hidden';

                                document.body.appendChild(clone);

                                dragging = true;
                            }

                            var x = bounding.left, //event.clientX - offset_x
                                y = event.clientY - offset_y,
                                index = Math.floor(y / self.offsetHeight) - 1;

                            clone.style.left = x + 'px';
                            clone.style.top = y + 'px';
                            
                            //return false;

                            if (index !== current_index && self.parentNode.children[index]) {
                                var new_clone = self.cloneNode(true);

                                if (index > 0) {
                                    self.parentNode.insertBefore(new_clone, self.parentNode.children[index].nextSibling);
                                } else {
                                    self.parentNode.insertBefore(new_clone, self.parentNode.children[index]);
                                }

                                self.remove();

                                self = new_clone;

                                self.addEventListener('mousedown', mousedown);

                                if (typeof object.onchange === 'function') {
                                    object.onchange(current_index, index);
                                }

                                current_index = index;
                            }
                        }

                        function mouseup(event) {
                            if (clone) {
                                clone.remove();
                                self.style.visibility = '';
                            }

                            window.removeEventListener('mousemove', mousemove);
                            window.removeEventListener('mouseup', mouseup);
                        }

                        window.addEventListener('mousemove', mousemove);
                        window.addEventListener('mouseup', mouseup);
                    }
                }

                li.addEventListener('mousedown', mousedown);
            }

            satus.render(object[key], li);

            ul.appendChild(li);
        }
    }

    return ul;
};


/*--------------------------------------------------------------
# MAIN
--------------------------------------------------------------*/

satus.components.main = function(object) {
    var component = document.createElement('main'),
        component_container = document.createElement('div'),
        component_scrollbar = satus.components.scrollbar(component_container, object.scrollbar);

    component.history = [object];

    component.back = function() {
        var container = this.querySelector('.satus-main__container'),
            component_container = document.createElement('div'),
            component_scrollbar = satus.components.scrollbar(component_container);

        container.classList.add('satus-main__container--fade-out-right');
        component_container.className = 'satus-main__container satus-main__container--fade-in-left';

        this.history.pop();

        for (var key in this.history[this.history.length - 1]) {
            satus.render(this.history[this.history.length - 1][key], component_scrollbar);
        }

        this.appendChild(component_container);

        if (this.historyListener) {
            this.historyListener(component_container);
        }

        if (this.history[this.history.length - 1].onopen) {
            component_scrollbar.onopen = this.history[this.history.length - 1].onopen;

            component_scrollbar.onopen();
        }

        setTimeout(function() {
            container.remove();
        }, satus.getAnimationDuration(container));
    };

    component.open = function(element, callback, animated) {
        var container = this.querySelector('.satus-main__container'),
            component_container = document.createElement('div'),
            component_scrollbar = satus.components.scrollbar(component_container);

        if (animated !== false) {
            container.classList.add('satus-main__container--fade-out-left');
            component_container.className = 'satus-main__container satus-main__container--fade-in-right';
        } else {
            component_container.className = 'satus-main__container';
        }

        this.history.push(element);

        for (var key in this.history[this.history.length - 1]) {
            satus.render(this.history[this.history.length - 1][key], component_scrollbar);
        }

        this.appendChild(component_container);

        if (this.historyListener) {
            this.historyListener(component_container);
        }

        if (callback) {
            component_scrollbar.onopen = callback;

            component_scrollbar.onopen();
        }

        setTimeout(function() {
            container.remove();
        }, satus.getAnimationDuration(container));
    };

    component_container.className = 'satus-main__container';

    if (object.on && object.on.change) {
        component.historyListener = object.on.change;
    }

    if (component.historyListener) {
        component.historyListener(component_container);
    }

    for (var key in object) {
        satus.render(object[key], component_scrollbar);
    }

    component.appendChild(component_container);

    return component;
};


/*--------------------------------------------------------------
# SCROLL BAR
--------------------------------------------------------------*/

satus.components.scrollbar = function(parent, enabled) {
    if (enabled === false) {
        return parent;
    }

    var component = document.createElement('div'),
        component_wrapper = document.createElement('div'),
        component_content = document.createElement('div'),
        component_thumb = document.createElement('div');

    component.className = 'satus-scrollbar';
    component_wrapper.className = 'satus-scrollbar__wrapper';
    component_content.className = 'satus-scrollbar__content';
    component_thumb.className = 'satus-scrollbar__thumb';


    // RESIZE

    function resize() {
        component_content.style.width = component.offsetWidth + 'px';
        component_wrapper.style.height = component.offsetHeight + 'px';

        if (component_wrapper.scrollHeight > component_wrapper.offsetHeight) {
            component_thumb.style.height = component_wrapper.offsetHeight / component_wrapper.scrollHeight * component_wrapper.offsetHeight + 'px';
        }
    }

    window.addEventListener('resize', resize);

    new MutationObserver(resize).observe(component_content, {
        subtree: true,
        childList: true
    });


    // HOVER

    component.timeout = false;

    function active() {
        if (component.timeout) {
            clearTimeout(component.timeout);

            component.timeout = false;
        }

        component.classList.add('active');

        component.timeout = setTimeout(function() {
            component.classList.remove('active');

            component.timeout = false;
        }, 1000);
    }

    component.addEventListener('mousemove', active);


    // SCROLL

    component_wrapper.addEventListener('scroll', function(event) {
        active();

        component_thumb.style.top = Math.floor(component_wrapper.scrollTop * (component_wrapper.offsetHeight - component_thumb.offsetHeight) / (component_wrapper.scrollHeight - component_wrapper.offsetHeight)) + 'px';
    });

    component_thumb.addEventListener('mousedown', function(event) {
        var offsetY = event.layerY;

        if (event.button !== 0) {
            return false;
        }

        function mousemove(event) {
            var offset = 100 / ((component.offsetHeight - component_thumb.offsetHeight) / (event.clientY - offsetY - component.getBoundingClientRect().top)),
                scroll = component_wrapper.scrollHeight - component.offsetHeight;

            component_wrapper.scrollTop = scroll / 100 * offset;

            event.preventDefault();

            return false;
        }

        function mouseup() {
            window.removeEventListener('mouseup', mouseup);
            window.removeEventListener('mousemove', mousemove);
        }

        window.addEventListener('mouseup', mouseup);
        window.addEventListener('mousemove', mousemove);
    });

    component_wrapper.appendChild(component_content);
    component.appendChild(component_wrapper);
    component.appendChild(component_thumb);

    parent.appendChild(component);

    return component_content;
};


/*--------------------------------------------------------------
# SECTION
--------------------------------------------------------------*/

satus.components.section = function(element) {
    var component = document.createElement('section');

	for (var key in element) {
		satus.render(element[key], component);
	}

    return component;
};


/*--------------------------------------------------------------
# SELECT
--------------------------------------------------------------*/

satus.components.select = function(element) {
    var component = document.createElement('button'),
        component_label = document.createElement('span'),
        component_value = document.createElement('span'),
        label = satus.locale.getMessage(element.label);

    component.classList.add('satus-button');

    component_label.className = 'satus-select__label';
    component_label.innerText = label;

    component_value.className = 'satus-select__value';

    if (element.storage_key) {
        var value = satus.storage.get(element.storage_key);

        component.dataset.storageKey = element.storage_key;

        for (var i = 0, l = element.options.length; i < l; i++) {
            if (value === element.options[i].value) {
                value = element.options[i].label;
            }
        }

        component_value.innerText = satus.locale.getMessage(value || element.options[0].label);
    }

    component.onclick = function() {
        var position = this.getBoundingClientRect(),
            dialog = {
                type: 'dialog',
                class: 'satus-dialog--select-component'
            };

        for (var key in element.options) {
            dialog[key] = element.options[key];

            dialog[key].type = 'button';
            dialog[key].dataset = {};
            dialog[key].dataset.key = element.options[key].label;
            dialog[key].dataset.value = element.options[key].value;
            dialog[key].onclick = function() {
                component_value.innerText = satus.locale.getMessage(this.dataset.key);

                satus.storage.set(component.dataset.storageKey, this.dataset.value);

                var parent = this.parentNode;

                while (!parent.classList.contains('satus-dialog')) {
                    parent = parent.parentNode;
                }

                parent.querySelector('.satus-dialog__scrim').click();
            };
        }

        satus.render(dialog);
    };

    component.appendChild(component_label);
    component.appendChild(component_value);

    return component;
};


/*---------------------------------------------------------------
# SHORTCUT
---------------------------------------------------------------*/

satus.components.shortcut = function(element) {
    var self = this,
        value = (satus.storage.get(element.storage_key) ? JSON.parse(satus.storage.get(element.storage_key)) : false) || element.value || {},
        component = document.createElement('div'),
        component_label = document.createElement('span'),
        component_value = document.createElement('span'),
        mousewheel_timeout = false,
        mousewheel_only = false;

    component_label.className = 'satus-shortcut__label';
    component_value.className = 'satus-shortcut__value';

    function update(canvas) {
        let text_value = [],
            keys_value = [];

        if (value.altKey === true) {
            text_value.push('Alt');
            keys_value.push('<div class=satus-shortcut__key>Alt</div>');
        }

        if (value.ctrlKey === true) {
            text_value.push('Ctrl');
            keys_value.push('<div class=satus-shortcut__key>Ctrl</div>');
        }

        if (value.shiftKey === true) {
            text_value.push('Shift');
            keys_value.push('<div class=satus-shortcut__key>Shift</div>');
        }

        if (value.key === ' ') {
            text_value.push('Space bar');
            keys_value.push('<div class=satus-shortcut__key>Space bar</div>');

        } else if (typeof value.key === 'string' && ['Shift', 'Control', 'Alt'].indexOf(value.key) === -1) {
            if (value.key === 'ArrowUp') {
                text_value.push('↑');
                keys_value.push('<div class=satus-shortcut__key>↑</div>');
            } else if (value.key === 'ArrowRight') {
                text_value.push('→');
                keys_value.push('<div class=satus-shortcut__key>→</div>');
            } else if (value.key === 'ArrowDown') {
                text_value.push('↓');
                keys_value.push('<div class=satus-shortcut__key>↓</div>');
            } else if (value.key === 'ArrowLeft') {
                text_value.push('←');
                keys_value.push('<div class=satus-shortcut__key>←</div>');
            } else {
                let key = value.key.toUpperCase();

                text_value.push(key);
                keys_value.push('<div class=satus-shortcut__key>' + key + '</div>');
            }
        }

        if (value.wheel) {
            keys_value.push('<div class="satus-shortcut__mouse ' + (value.wheel > 0) + '"><div></div></div>');
        }

        component_value.innerText = text_value.join('+');

        if (canvas) {
            if (keys_value.length > 0) {
                canvas.innerHTML = keys_value.join('<div class=satus-shortcut__plus></div>');
            } else {
                canvas.innerText = satus.locale.getMessage('pressAnyKeyOrUseMouseWheel');
            }
        }
    }

    update();

    component_value.dataset.value = component_value.innerText;

    component_label.innerText = satus.locale.getMessage(element.label);

    component.addEventListener('click', function() {
        let component_dialog = document.createElement('div'),
            component_dialog_label = document.createElement('span'),
            component_scrim = document.createElement('div'),
            component_surface = document.createElement('div'),
            component_canvas = document.createElement('div'),
            component_section = document.createElement('section'),
            component_button_reset = document.createElement('div'),
            component_button_cancel = document.createElement('div'),
            component_button_save = document.createElement('div');

        component_dialog.className = 'satus-dialog satus-dialog_open';
        component_dialog_label.className = 'satus-shortcut-dialog-label';
        component_scrim.className = 'satus-dialog__scrim';
        component_surface.className = 'satus-dialog__surface satus-dialog__surface_shortcut';
        component_canvas.className = 'satus-shortcut__canvas';
        component_section.className = 'satus-section satus-section--align-end satus-section_shortcut';
        component_button_reset.className = 'satus-button satus-button_shortcut';
        component_button_cancel.className = 'satus-button satus-button_shortcut';
        component_button_save.className = 'satus-button satus-button_shortcut';

        component_dialog_label.innerText = component_label.innerText;
        component_button_reset.innerText = satus.locale.getMessage('reset');
        component_button_cancel.innerText = satus.locale.getMessage('cancel');
        component_button_save.innerText = satus.locale.getMessage('save');

        update(component_canvas);

        function keydown(event) {
            event.preventDefault();
            event.stopPropagation();

            mousewheel_only = false;
            clearTimeout(mousewheel_timeout);

            value = {
                key: event.key,
                keyCode: event.keyCode,
                shiftKey: event.shiftKey,
                ctrlKey: event.ctrlKey,
                altKey: event.altKey
            };

            update(component_canvas);

            return false;
        }

        function mousewheel(event) {
            event.stopPropagation();

            if (mousewheel_only === true) {
                delete value.shiftKey;
                delete value.altKey;
                delete value.ctrlKey;
                delete value.keyCode;
                delete value.key;
            }

            clearTimeout(mousewheel_timeout);

            mousewheel_timeout = setTimeout(function() {
                mousewheel_only = true;
            }, 300);

            value.wheel = event.deltaY;

            update(component_canvas);

            return false;
        }

        window.addEventListener('keydown', keydown);
        window.addEventListener('mousewheel', mousewheel);

        function close(clear = true) {
            window.removeEventListener('keydown', keydown);
            window.removeEventListener('mousewheel', mousewheel);

            if (clear === true) {
                component_value.innerText = component_value.dataset.value;
            }

            component_dialog.classList.remove('satus-dialog_open');

            setTimeout(function() {
                component_dialog.remove();
            }, Number(document.defaultView.getComputedStyle(component_dialog, '').getPropertyValue('animation-duration').replace(/[^0-9.]/g, '') * 1000));
        }

        component_scrim.addEventListener('click', close);
        component_button_reset.addEventListener('click', function() {
            satus.storage.set(element.storage_key, null);
            close();
            value = (satus.storage.get(element.storage_key) ? JSON.parse(satus.storage.get(element.storage_key)) : false) || element.value || {};
            update();
        });
        component_button_cancel.addEventListener('click', close);
        component_button_save.addEventListener('click', function() {
            satus.storage.set(element.storage_key, JSON.stringify(value));
            close(false);
        });

        component_section.appendChild(component_button_reset);
        component_section.appendChild(component_button_cancel);
        component_section.appendChild(component_button_save);

        component_surface.appendChild(component_dialog_label);
        component_surface.appendChild(component_canvas);
        component_surface.appendChild(component_section);

        component_dialog.appendChild(component_scrim);
        component_dialog.appendChild(component_surface);

        document.body.appendChild(component_dialog);
    });

    component.appendChild(component_label);
    component.appendChild(component_value);

    return component;
};


/*--------------------------------------------------------------
# SLIDER
--------------------------------------------------------------*/

satus.components.slider = function(element) {
    var component = document.createElement('div');

    // LABEL
    if (satus.isset(element.label)) {
        var component_label = document.createElement('span');

        component_label.className = 'satus-slider__label';
        component_label.innerText = satus.locale.getMessage(element.label);

        component.appendChild(component_label);
    }


    // RANGE
    var component_range = document.createElement('input');

    component_range.type = 'range';
    component_range.className = 'satus-slider__range';
    component_range.min = element.min || 0;
    component_range.max = element.max || 10;
    component_range.step = element.step || 1;

    component_range.oninput = function() {
        var track = this.parentNode.querySelector('.satus-slider__track'),
            thumb = this.parentNode.querySelector('.satus-slider__thumb'),
            min = Number(this.min) || 0,
            max = Number(this.max) || 1,
            step = Number(this.step) || 1,
            value = Number(this.value) || 0,
            offset = (value - min) / (max - min) * 100;

        track.style.width = 'calc(' + offset + '% - ' + Math.floor(offset * 12 / 100) + 'px)';

        satus.storage.set(this.dataset.storageKey, Number(this.value));

        component_thumb.dataset.value = this.value;

        if (component.onchange) {
            component.onchange(Number(this.value));
        }
    };

    component.change = function(value) {
        component_range.value = value;

        component_thumb.dataset.value = value;

        component_range.oninput();
    };

    component.addEventListener('mousedown', function() {
        function mousemove() {
            component.classList.add('satus-slider--dragging');
        }

        function mouseup() {
            component.classList.remove('satus-slider--dragging');
            
            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
        }

        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);
    });

    if (element.onchange) {
        component.onchange = element.onchange;
    }

    component.appendChild(component_range);


    // CONTAINER
    var component_container = document.createElement('div');

    component_container.className = 'satus-slider__container';

    component.appendChild(component_container);


    // TRACK
    var component_track_container = document.createElement('div'),
        component_track = document.createElement('div');

    component_track_container.className = 'satus-slider__track-container';
    component_track.className = 'satus-slider__track';

    component_track_container.appendChild(component_track);
    component_container.appendChild(component_track_container);


    // FOCUS RING
    var component_ring = document.createElement('div');

    component_ring.className = 'satus-slider__ring';

    component_track.appendChild(component_ring);


    // THUMB
    var component_thumb = document.createElement('div');

    component_thumb.className = 'satus-slider__thumb';

    component_track.appendChild(component_thumb);

    if (element.storage_key) {
        var value = satus.storage.get(element.storage_key) || element.value;

        component_range.dataset.storageKey = element.storage_key;

        if (value) {
            component_range.value = value;

            if (!satus.isset(value)) {
                value = element.value;
            }

            var offset = (Number(component_range.value) - Number(component_range.min)) / (Number(component_range.max) - Number(component_range.min)) * 100;

            component_track.style.width = 'calc(' + offset + '% - ' + Math.floor(offset * 12 / 100) + 'px)';
            component_thumb.dataset.value = value;
        } else {
            component_range.value = 0;
            component_thumb.dataset.value = 0;
        }
    }


    return component;
};


/*--------------------------------------------------------------
# SWITCH
--------------------------------------------------------------*/

satus.components.switch = function(element) {
    var component = document.createElement('div'),
        value;

    // LABEL
    if (satus.isset(element.label)) {
        var component_label = document.createElement('span');

        component_label.className = 'satus-switch__label';
        component_label.innerText = satus.locale.getMessage(element.label);

        component.appendChild(component_label);
    }


    // INPUT
    var component_input = document.createElement('input');

    component_input.type = 'checkbox';
    component_input.className = 'satus-switch__input';

    if (element.storage_key) {
        value = satus.storage.get(element.storage_key);

        component_input.dataset.storageKey = element.storage_key;
    }

    if (!satus.isset(value)) {
        value = element.value;
    }

    if (value) {
        component_input.checked = value;
    }

    component_input.addEventListener('change', function() {
        satus.storage.set(this.dataset.storageKey, this.checked);
    });

    component.appendChild(component_input);


    // TRACK
    var component_track = document.createElement('div');

    component_track.className = 'satus-switch__track';

    component.appendChild(component_track);


    // MOUSE MOVE
    component_track.addEventListener('mousedown', function(event) {
        var prevent = false,
            difference = 0;

        function click(event) {
            event.preventDefault();
            event.stopPropagation();

            component.removeEventListener('click', click);

            return false;
        }

        function mousemove(event) {
            var checkbox = component.querySelector('input'),
                movement = event.movementX;

            if (movement * difference < 0) {
                difference = 0;
            } else {
                difference += movement;

                if (prevent === false) {
                    prevent = true;
                    component.addEventListener('click', click);
                }
            }

            if (difference < -5) {
                checkbox.checked = false;
            } else if (difference > 5) {
                checkbox.checked = true;
            }
        }

        function mouseup(event) {
            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
        }

        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);
    });


    // TOUCH MOVE
    component_track.addEventListener('touchstart', function(event) {
        var previous_x = 0,
            difference = 0;

        function mousemove(event) {
            var checkbox = component.querySelector('input'),
                movement = event.touches[0].clientX - previous_x;

            previous_x = event.touches[0].clientX;

            if (movement * difference < 0) {
                difference = 0;
            } else {
                difference += movement;
            }

            if (difference < -5) {
                checkbox.checked = false;
            } else if (difference > 5) {
                checkbox.checked = true;
            }
        }

        function mouseup(event) {
            window.removeEventListener('touchmove', mousemove);
            window.removeEventListener('touchend', mouseup);
        }

        window.addEventListener('touchmove', mousemove);
        window.addEventListener('touchend', mouseup);
    });


    return component;
};
satus.components.table = function(item) {
    var component = document.createElement('div'),
        component_head = document.createElement('div'),
        component_body = document.createElement('div'),
        component_scrollbar = satus.components.scrollbar(component_body, item.scrollbar),
        table = document.createElement('div');
        
    table.className = 'satus-table__container';
    component_head.className = 'satus-table__head';
    component_body.className = 'satus-table__body';

    function update(data) {
        var pages = Math.ceil(component.data.length / component.paging),
            start = Math.max((component.pagingIndex - 1) * component.paging, 0),
            end = component.pagingIndex * component.paging;

        if (end > data.length) {
            end = data.length;
        } else if (end === 0) {
            end = component.paging;
        }

        table.innerHTML = '';

        if (data) {
            for (var i = start, l = end; i < l; i++) {
                if (data[i]) {
                    var tr = document.createElement('div');
                    
                    tr.className = 'satus-table__row';

                    for (var j = 0, k = data[i].length; j < k; j++) {
                        var td = document.createElement('div');

                    
                        td.className = 'satus-table__cell';
                        
                        if (data[i][j].html) {
                            td.innerHTML = data[i][j].html;
                        } else if (data[i][j].text) {
                            td.innerText = data[i][j].text;
                        }
                        
                        if (data[i][j].onrender) {
                            td.onrender = data[i][j].onrender;
                            
                            td.onrender();
                        }

                        tr.appendChild(td);
                    }

                    table.appendChild(tr);
                }
            }
        }

        component.pagingUpdate();
    }

    function sortArray(array, index, mode) {
        if (mode === 'asc') {
            if (typeof array[0][index].text === 'number') {
                sorted = array.sort(function(a, b) {
                    return a[index].text - b[index].text;
                });
            } else {
                sorted = array.sort(function(a, b) {
                    return a[index].text.localeCompare(b[index].text);
                });
            }
        } else {
            if (typeof array[0][index].text === 'number') {
                sorted = array.sort(function(a, b) {
                    return b[index].text - a[index].text;
                });
            } else {
                sorted = array.sort(function(a, b) {
                    return b[index].text.localeCompare(a[index].text);
                });
            }
        }

        return array;
    }

    function sort() {
        var mode = this.dataset.sorting,
            index = Array.prototype.indexOf.call(this.parentElement.children, this),
            sorted;
                
        if (component.data[0][index] && component.data[0][index].hasOwnProperty('text')) {
            if (mode === 'none') {
                mode = 'asc';
            } else if (mode === 'asc') {
                mode = 'desc';
            } else if (mode === 'desc') {
                mode = 'asc';
            }

            if (this.parentNode.querySelector('div[data-sorting=asc], div[data-sorting=desc]')) {
                this.parentNode.querySelector('div[data-sorting=asc], div[data-sorting=desc]').dataset.sorting = 'none';
            }

            this.dataset.sorting = mode;

            sorted = sortArray(component.data, index, mode);

            update(sorted);
        } else {
            this.dataset.sorting = false;
        }
    }

    function resize() {}

    for (var i = 0, l = item.columns.length; i < l; i++) {
        var column = document.createElement('div');

        column.dataset.sorting = 'none';
        column.addEventListener('click', sort);
        column.innerHTML = '<span>' + item.columns[i].title + '</span>';

        component_head.appendChild(column);
    }

    component_scrollbar.appendChild(table);

    component.appendChild(component_head);
    component.appendChild(component_body);

    component.data = item.data;
    component.paging = item.paging;
    component.pagingIndex = 0;

    component.update = function(data, index, mode) {
        if (satus.isset(data)) {
            this.data = data;
        }
        
        if (this.querySelector('div[data-sorting=asc], div[data-sorting=desc]')) {
            var mode = this.querySelector('div[data-sorting=asc], div[data-sorting=desc]').dataset.sorting,
                index = Array.prototype.indexOf.call(this.querySelector('div[data-sorting=asc], div[data-sorting=desc]').parentElement.children, this.querySelector('div[data-sorting=asc], div[data-sorting=desc]'));
            
            update(sortArray(this.data, index, mode));
        } else {
            for (var i = 0, l = item.columns.length; i < l; i++) {
                if (item.columns[i].hasOwnProperty('sorting')) {
                    if (this.data[0][i].hasOwnProperty('text')) {
                        this.querySelectorAll('.satus-table__head > div')[i].dataset.sorting = item.columns[i].sorting;
                    } else {
                        this.querySelectorAll('.satus-table__head > div')[i].dataset.sorting = false;
                    }
                    
                    update(sortArray(this.data, i, item.columns[i].sorting));

                    i = l;
                }
            }
        }
    };


    // PAGING

    function pagingUpdate() {
        if (typeof this.paging === 'number') {
            var pages = Math.ceil(this.data.length / this.paging);

            this.querySelector('.satus-table__paging').innerHTML = '';

            for (var i = 1; i <= pages; i++) {
                var button = document.createElement('button');

                if (i === (this.pagingIndex || 1)) {
                    button.className = 'active';
                }

                button.innerText = i;
                button.parentComponent = this;
                button.addEventListener('click', function() {
                    if (this.parentNode.querySelector('button.active')) {
                        this.parentNode.querySelector('button.active').classList.remove('active');
                    }

                    this.classList.add('active');

                    this.parentComponent.pagingIndex = Number(this.innerText);
                    this.parentComponent.update(this.parentComponent.data);
                });

                this.querySelector('.satus-table__paging').appendChild(button);
            }
        }
        
        resize();
    }

    component.pagingUpdate = pagingUpdate;

    component_paging = document.createElement('div');

    component_paging.className = 'satus-table__paging';

    component_scrollbar.appendChild(component_paging);

    // END PAGING
    
    if (item.data) {
        component.update(item.data);
    }
    
    return component;
};


/*--------------------------------------------------------------
# TEXT
--------------------------------------------------------------*/

satus.components.text = function(element) {
    var component = document.createElement('span');

    if (satus.isset(element.label)) {
        var component_label = document.createElement('span');

        component_label.className = 'satus-text__label';
        component_label.innerText = satus.locale.getMessage(element.label);

        component.appendChild(component_label);
    }

    if (satus.isset(element.value)) {
        var component_value = document.createElement('span');

        component_value.className = 'satus-text__value';
        component_value.innerText = satus.locale.getMessage(element.value);

        component.appendChild(component_value);
    }

    return component;
};


/*--------------------------------------------------------------
# TEXT FIELD
--------------------------------------------------------------*/

satus.components.textField = function(element) {
    var component = element.rows > 1 ? document.createElement('textarea') : document.createElement('input');

    component.type = 'text';

    return component;
};