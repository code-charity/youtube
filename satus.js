
/*--------------------------------------------------------------
>>> TABLE OF CONTENTS:
----------------------------------------------------------------
# Events
# Render
# Camelize
# Animation duration
--------------------------------------------------------------*/

var Satus = {},
    satus = Satus;


/*--------------------------------------------------------------
# EVENTS
--------------------------------------------------------------*/

Satus.events = {};

Satus.on = function(event, handler) {
    if (!this.isset(this.events[event])) {
        this.events[event] = [];
    }

    this.events[event].push(handler);
};


/*--------------------------------------------------------------
# COMPONENTS
--------------------------------------------------------------*/

Satus.components = {};


/*--------------------------------------------------------------
# MODULES
--------------------------------------------------------------*/

Satus.modules = {};


/*--------------------------------------------------------------
# ISSET
--------------------------------------------------------------*/

Satus.isset = function(variable) {
    if (typeof variable === 'undefined' || variable === null) {
        return false;
    }

    return true;
};


/*--------------------------------------------------------------
# CAMELIZE
--------------------------------------------------------------*/

Satus.camelize = function(string) {
    return string.replace(/-[a-z]/g, function(match) {
        return match[1].toUpperCase();
    });
};


/*--------------------------------------------------------------
# ANIMATION DURATION
--------------------------------------------------------------*/

Satus.getAnimationDuration = function(element) {
    return Number(window.getComputedStyle(element).getPropertyValue('animation-duration').replace(/[^0-9.]/g, '')) * 1000;
};

/*--------------------------------------------------------------
# LOCALE
--------------------------------------------------------------*/

satus.locale = {
    messages: {}
};


/*--------------------------------------------------------------
# GET MESSAGE
--------------------------------------------------------------*/

satus.locale.getMessage = function(string) {
    return this.messages[string] || string;
};

/*--------------------------------------------------------------
# IMPORT LOCALE
--------------------------------------------------------------*/

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
# CLONE NODE STYLES
--------------------------------------------------------------*/

Satus.cloneNodeStyles = function(origin, target) {
    target.style.cssText = window.getComputedStyle(origin, '').cssText;

    for (var i = 0, l = origin.children.length; i < l; i++) {
        Satus.cloneNodeStyles(origin.children[i], target.children[i]);
    }
};
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

Satus.modules.user = function() {
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
/*---------------------------------------------------------------
>>> MATH
-----------------------------------------------------------------
1.0 Converts degrees to radians
---------------------------------------------------------------*/

satus.math = {};


/*---------------------------------------------------------------
1.0 CONVERTS DEGREES TO RADIANS
---------------------------------------------------------------*/

satus.math.degToRad = function(degrees) {
    return degrees * (Math.PI / 180);
};

/*---------------------------------------------------------------
>>> CHROMIUM STORAGE
-----------------------------------------------------------------
1.0 Get
2.0 Set
3.0 Import
4.0 Clear
---------------------------------------------------------------*/

satus.storage = {
    data: {}
};

/*---------------------------------------------------------------
1.0 GET
---------------------------------------------------------------*/

satus.storage.get = function(name) {
    if (satus.isset(name)) {
        var target = satus.storage.data;

        name = name.split('/').filter(function(value) {
            return value != '';
        });

        for (var i = 0, l = name.length; i < l; i++) {
            if (Satus.isset(target[name[i]])) {
                target = target[name[i]];
            } else {
                return undefined;
            }
        }

        return target;
    }
};


/*---------------------------------------------------------------
2.0 SET
---------------------------------------------------------------*/

satus.storage.set = function(name, value) {
    var items = {},
        target = Satus.storage.data;
        
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

    for (var key in satus.storage.data) {
        items[key] = satus.storage.data[key];
    }

    chrome.storage.local.set(items);
};


/*---------------------------------------------------------------
3.0 IMPORT
---------------------------------------------------------------*/

satus.storage.import = function(callback) {
    chrome.storage.local.get(function(items) {
        satus.storage.data = items;

        if (callback) {
            callback();
        }
    });
};


/*---------------------------------------------------------------
4.0 CLEAR
---------------------------------------------------------------*/

satus.storage.clear = function() {
    chrome.storage.local.clear();

    delete satus.storage.data;
};

/*-----------------------------------------------------------------------------
>>> «SEARCH» MODULE
-----------------------------------------------------------------------------*/

Satus.search = function(query, object, callback, categories) {
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
>>> RENDER
--------------------------------------------------------------*/

Satus.render = function(element, container, callback) {
    function convert(object) {
        if (object && object.type) {
            var type = Satus.camelize(object.type),
                component = Satus.components[type](object),
                excluded_properties = ['type', 'label', 'class', 'title', 'storage', 'onclick'];

            function applyProperties(object, target) {
                for (var key in object) {
                    if (Satus.isset(object[key]) && typeof object[key] === 'object' && !object[key].type) {
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
            
            component.skelet = object;

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

            if (typeof object.onclick === 'object') {
                component.addEventListener('click', function() {
                    Satus.render(this.skelet.onclick);
                });
            } else if (typeof object.onclick === 'function') {
                component.onclick = object.onclick;
            }

            if (Satus.isset(Satus.events.render)) {
                for (var i = 0, l = Satus.events.render.length; i < l; i++) {
                    Satus.events.render[i](component, object);
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
>>> STORAGE KEYS
--------------------------------------------------------------*/

Satus.modules.updateStorageKeys = function(object, callback) {
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
Satus.components.table = function(item) {
    var component = document.createElement('div'),
        component_head = document.createElement('div'),
        component_body = document.createElement('div'),
        component_scrollbar = Satus.components.scrollbar(component_body, item.scrollbar),
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
                        
                        if (item.columns[j].onrender) {
                            td.onrender = item.columns[j].onrender;
                            
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
        if (array[0]) {
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
    component.pagingIndex = 1;

    component.update = function(data, index, mode) {
        if (Satus.isset(data)) {
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
    function pagingButton(i, c) {
        var button = document.createElement('button');
        
        if (i === component.pagingIndex) {
            button.className = 'active';
        }

        button.innerText = i;
        button.parentComponent = component;
        button.addEventListener('click', function() {
            this.parentComponent.pagingIndex = Number(this.innerText);
            this.parentComponent.update(this.parentComponent.data);
            this.parentComponent.pagingUpdate();
        });

        c.appendChild(button);
    }

    function pagingUpdate() {
        if (typeof this.paging === 'number') {
            var pages = Math.ceil(this.data.length / this.paging),
                c = this.querySelector('.satus-table__paging');

            c.innerHTML = '';
            
            pagingButton(1, c);
            
            if (component.pagingIndex - 2 > 2) {
                var span = document.createElement('span');
                
                span.innerText = '...';
                
                c.appendChild(span);
            }

            for (var i = component.pagingIndex - 2 < 2 ? 2 : component.pagingIndex - 2, l = component.pagingIndex + 2 > pages - 1 ? pages - 1 : component.pagingIndex + 2; i <= l; i++) {
                pagingButton(i, c);
            }
            
            if (component.pagingIndex + 2 < pages - 1) {
                var span = document.createElement('span');
                
                span.innerText = '...';
                
                c.appendChild(span);
            }
            
            pagingButton(pages, c);
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
>>> HEADER
--------------------------------------------------------------*/

Satus.components.header = function(object) {
    var component = document.createElement('header');

	for (var key in object) {
		Satus.render(object[key], component);
	}

    return component;
};
/*--------------------------------------------------------------
>>> SELECT
--------------------------------------------------------------*/

Satus.components.select = function(element) {
    var component = document.createElement('button'),
        component_label = document.createElement('span'),
        component_value = document.createElement('span'),
        label = Satus.locale.getMessage(element.label);

    component.classList.add('satus-button');

    component_label.className = 'satus-select__label';
    component_label.innerText = label;

    component_value.className = 'satus-select__value';

    if (element.storage_key) {
        var value = Satus.storage.get(element.storage_key);

        component.dataset.storageKey = element.storage_key;

        for (var i = 0, l = element.options.length; i < l; i++) {
            if (value === element.options[i].value) {
                value = element.options[i].label;
            }
        }

        component_value.innerText = Satus.locale.getMessage(value || element.options[0].label);
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
                component_value.innerText = Satus.locale.getMessage(this.dataset.key);

                Satus.storage.set(component.dataset.storageKey, this.dataset.value);

                var parent = this.parentNode;

                while (!parent.classList.contains('satus-dialog')) {
                    parent = parent.parentNode;
                }

                parent.querySelector('.satus-dialog__scrim').click();
            };
        }

        Satus.render(dialog);
    };

    component.appendChild(component_label);
    component.appendChild(component_value);

    return component;
};
/*--------------------------------------------------------------
>>> SWITCH
--------------------------------------------------------------*/

Satus.components.switch = function(element) {
    var component = document.createElement('div'),
        value;

    // LABEL
    if (Satus.isset(element.label)) {
        var component_label = document.createElement('span');

        component_label.className = 'satus-switch__label';
        component_label.innerText = Satus.locale.getMessage(element.label);

        component.appendChild(component_label);
    }


    // INPUT
    var component_input = document.createElement('input');

    component_input.type = 'checkbox';
    component_input.className = 'satus-switch__input';

    if (element.storage_key) {
        value = Satus.storage.get(element.storage_key);

        component_input.dataset.storageKey = element.storage_key;
    }

    if (!Satus.isset(value)) {
        value = element.value;
    }

    if (value) {
        component_input.checked = value;
    }

    component_input.addEventListener('change', function() {
        Satus.storage.set(this.dataset.storageKey, this.checked);
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
/*--------------------------------------------------------------
>>> TABS
--------------------------------------------------------------*/

Satus.components.tabs = function(object) {
    var component = document.createElement('div'),
        tabbar = document.createElement('div'),
        tabbar_select = document.createElement('div'),
        main = document.createElement('div'),
        i = 0;

    tabbar.className = 'satus-tabs__bar';
    main.className = 'satus-tabs__main';
    tabbar_select.className = 'satus-tabs__bar--select';
        
    tabbar.appendChild(tabbar_select);
    
    function update() {
        var index = Number(this.dataset.key);
        
        tabbar_select.style.left = this.offsetLeft + 'px';
        
        if (this.parentNode.querySelector('.active')) {
            var prev_index = Number(this.parentNode.querySelector('.active').dataset.key);
            
            this.parentNode.querySelector('.active').classList.remove('active');
        }
        
        this.classList.add('active');
        
        var container = document.createElement('div');
        
        container.className = 'satus-tabs__tab';
        
        satus.render(this.menu, container);
        
        if (main.children.length >= 1) {
            container.classList.add(index > prev_index ? 'satus-animation--fade-in-right' : 'satus-animation--fade-in-left');
            
            main.children[0].classList.add('old');
            main.children[0].classList.add(index > prev_index ? 'satus-animation--fade-out-left' : 'satus-animation--fade-out-right');
        
            main.appendChild(container);
            
            setTimeout(function() {
                main.children[0].remove();

                container.classList.remove(index > prev_index ? 'satus-animation--fade-in-right' : 'satus-animation--fade-in-left');
            }, 250);
        } else {
            main.appendChild(container);
        }
    }
    
	for (var key in object) {
        if (object[key].type === 'tab') {
            var tab = document.createElement('div');

            tab.innerText = satus.locale.getMessage(object[key].label);
            tab.dataset.key = i;
            tab.onclick = update;
            tab.menu = Object.assign({}, object[key]);
            
            delete tab.menu.type;
            
            tabbar.appendChild(tab);
            
            i++;
        }
    }
    
    tabbar.children[1].click();

    component.appendChild(tabbar);
    component.appendChild(main);

    return component;
};

/*---------------------------------------------------------------
>>> FOLDER
---------------------------------------------------------------*/

Satus.components.folder = function(element) {
    var component = document.createElement('button');

    component.classList.add('satus-button');
    
    if (satus.isset(element.label)) {
        var label = document.createElement('span');

        label.className = 'satus-button__label';
        label.innerText = satus.locale.getMessage(element.label);

        component.appendChild(label);
    }

    component.addEventListener('click', function() {
        var parent = document.querySelector(component.skelet.parent) || document.querySelector('.satus-main');

        if (!component.skelet.parent || !parent.classList.contains('satus-main')) {
            while (!parent.classList.contains('satus-main')) {
                parent = parent.parentNode;
            }
        }

        parent.open(this.skelet, this.skelet.onopen);
    });

    return component;
};

/*---------------------------------------------------------------
>>> TEXT FIELD
---------------------------------------------------------------*/

Satus.components.textField = function(element) {
    if (element.rows > 1) {
        var component = document.createElement('textarea');
    } else {
        var component = document.createElement('input');
        
        component.type = 'text';
    }

    return component;
};

/*--------------------------------------------------------------
>>> MAIN
--------------------------------------------------------------*/

Satus.components.main = function(object) {
    var component = document.createElement('main');

    component.history = [object];
    
    function create(self, animation, callback) {
        var container = self.querySelector('.satus-main__container'),
            component_container = document.createElement('div'),
            component_scrollbar = Satus.components.scrollbar(component_container),
            object = self.history[self.history.length - 1];
        
        component_container.className = 'satus-main__container';
        
        if (animation === 2) {
            container.classList.add('satus-animation--fade-out-left');
            component_container.className = 'satus-main__container satus-animation--fade-in-right';
        } else if (animation === 1) {
            self.history.pop();
            
            object = self.history[self.history.length - 1];
            
            container.classList.add('satus-animation--fade-out-right');
            component_container.className = 'satus-main__container satus-animation--fade-in-left';
        }
        
        document.body.dataset.appearance = object.appearanceKey;
        component_container.dataset.appearance = object.appearanceKey;

        for (var key in object) {
            Satus.render(object[key], component_scrollbar);
        }

        self.appendChild(component_container);
        
        if (self.historyListener) {
            self.historyListener(component_container);
        }

        if (object.onopen || callback) {
            component_scrollbar.onopen = object.onopen || callback;

            component_scrollbar.onopen();
        }
        
        if (container) {
            setTimeout(function() {
                container.remove();
            }, Satus.getAnimationDuration(container));
        }
    }

    create(component, 0);
    
    component.back = function() {
        create(this, 1);
    };
    
    component.open = function(element, callback) {
        this.history.push(element);
        
        create(this, 2, callback);
    };
    
    if (object.on && object.on.change || object.onchange) {
        component.historyListener = object.on && object.on.change || object.onchange;
        
        component.historyListener(component.querySelector('.satus-main__container'));
    }

    return component;
};

/*--------------------------------------------------------------
>>> SLIDER
--------------------------------------------------------------*/

Satus.components.slider = function(element) {
    var component = document.createElement('div');

    // LABEL
    if (Satus.isset(element.label)) {
        var component_label = document.createElement('span');

        component_label.className = 'satus-slider__label';
        component_label.innerText = Satus.locale.getMessage(element.label);

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

        Satus.storage.set(this.dataset.storageKey, Number(this.value));

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
        var value = Satus.storage.get(element.storage_key) || element.value;

        component_range.dataset.storageKey = element.storage_key;

        if (value) {
            component_range.value = value;

            if (!Satus.isset(value)) {
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
/*-----------------------------------------------------------------------------
>>> SCROLL BAR
-----------------------------------------------------------------------------*/

Satus.components.scrollbar = function(parent, enabled) {
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
>>> DIV
--------------------------------------------------------------*/

Satus.components.div = function(object) {
    var component = document.createElement('div');

	for (var key in object) {
		Satus.render(object[key], component);
	}

    return component;
};

/*--------------------------------------------------------------
>>> LIST
--------------------------------------------------------------*/

Satus.components.list = function(object) {
    var ul = document.createElement('ul');

    if (object.compact === true) {
        ul.classList.add('satus-list');
        ul.classList.add('satus-list--compact');
    }

    for (var key in object) {
        if (Satus.isset(object[key].type)) {
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

                                Satus.cloneNodeStyles(self, clone);
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

            Satus.render(object[key], li);

            ul.appendChild(li);
        }
    }

    return ul;
};

/*---------------------------------------------------------------
>>> DIALOG
---------------------------------------------------------------*/

Satus.components.dialog = function(element) {
    var component = document.createElement('div'),
        component_scrim = document.createElement('div'),
        component_surface = document.createElement('div'),
        component_scrollbar = Satus.components.scrollbar(component_surface),
        options = element.options || {};

    component_scrim.className = 'satus-dialog__scrim';
    component_surface.className = 'satus-dialog__surface';

    for (var key in element) {
        Satus.render(element[key], component_scrollbar);
    }

    function close() {
        window.removeEventListener('keydown', keydown);

        component.classList.add('satus-dialog--closing');

        if (typeof element.onclose === 'function') {
            element.onclose();
        }

        setTimeout(function() {
            component.remove();
        }, Satus.getAnimationDuration(component_surface));
    }

    function keydown(event) {
        if (event.keyCode === 27) {
            event.preventDefault();
            
            close();
        } else if (event.keyCode === 9) {
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

/*---------------------------------------------------------------
>>> BUTTON
---------------------------------------------------------------*/

satus.components.button = function(element) {
    var component = document.createElement('button');

    if (satus.isset(element.label)) {
        var label = document.createElement('span');

        label.className = 'satus-button__label';
        label.innerText = satus.locale.getMessage(element.label);

        component.appendChild(label);
    }

    return component;
};

/*--------------------------------------------------------------
>>> TEXT
--------------------------------------------------------------*/

Satus.components.text = function(element) {
    var component = document.createElement('span');

    if (Satus.isset(element.label)) {
        var component_label = document.createElement('span');

        component_label.className = 'satus-text__label';
        component_label.innerText = Satus.locale.getMessage(element.label);

        component.appendChild(component_label);
    }

    if (Satus.isset(element.value)) {
        var component_value = document.createElement('span');

        component_value.className = 'satus-text__value';
        component_value.innerText = Satus.locale.getMessage(element.value);

        component.appendChild(component_value);
    }

    return component;
};
/*--------------------------------------------------------------
>>> SECTION
--------------------------------------------------------------*/

Satus.components.section = function(element) {
    var component = document.createElement('section');

	for (var key in element) {
		Satus.render(element[key], component);
	}

    return component;
};

/*---------------------------------------------------------------
>>> COLOR PICKER
---------------------------------------------------------------*/

Satus.components.colorPicker = function(element) {
    var component = document.createElement('div'),
        container = document.createElement('div'),
        cursor = document.createElement('div'),
        cvs = document.createElement('canvas'),
        ctx = cvs.getContext('2d'),
        value = satus.storage.set(element.storage_key) || {
            color: [255, 255, 255, 255],
            x: 128,
            y: 128
        },
        pivot_pointer = 0,
        rgb = [255, 0, 0];

    cvs.width = 256;
    cvs.height = 256;

    container.className = 'satus-color-picker__container';
    cursor.className = 'satus-color-picker__cursor';

    for (var i = 0; i < 360; i++) {
        var b = (pivot_pointer + 3 - 1) % 3;

        if (rgb[pivot_pointer] < 255) {
            rgb[pivot_pointer] = Math.min(rgb[pivot_pointer] + 4.322, 255);
        } else if (rgb[b] > 0) {
            rgb[b] = rgb[b] > 4.322 ? rgb[b] - 4.322 : 0;
        } else if (rgb[pivot_pointer] >= 255) {
            rgb[pivot_pointer] = 255;

            pivot_pointer = (pivot_pointer + 1) % 3;
        }

        var radial_gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);

        radial_gradient.addColorStop(0, '#fff');
        radial_gradient.addColorStop(1, 'rgb(' + rgb.map(function(rgb) {
            return Math.floor(rgb);
        }).join(',') + ')');

        ctx.fillStyle = radial_gradient;
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.moveTo(128, 128);
        ctx.arc(128, 128, 128, satus.math.degToRad(i), satus.math.degToRad(360));
        ctx.closePath();
        ctx.fill();
    }

    function select(event) {
        var coordinates = cvs.getBoundingClientRect(),
            x = event.clientX - coordinates.left,
            y = event.clientY - coordinates.top,
            color = ctx.getImageData(x, y, 1, 1).data,
            rgb = '';

        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';

        value.x = x;
        value.y = y;
        value.color = color;

        component.querySelector('.satus-color-picker__value').style.background = 'rgba(' + value.color[0] + ', ' + value.color[1] + ', ' + value.color[2] + ', ' + value.color[3] / 255 + ')';
    }

    function mouseup(event) {
        cvs.removeEventListener('mousemove', select);
        window.removeEventListener('mouseup', mouseup);
    }

    cvs.addEventListener('mousedown', function(event) {
        select(event);

        this.addEventListener('mousemove', select);
        window.addEventListener('mouseup', mouseup);
    });

    component.appendChild(container);
    container.appendChild(cvs);
    container.appendChild(cursor);

    satus.render({
        type: 'section',
        style: {
            margin: '16px 0 8px'
        },

        value: {
            type: 'div',
            class: 'satus-color-picker__value',
            style: {
                background: 'rgba(' + value.color[0] + ', ' + value.color[1] + ', ' + value.color[2] + ', ' + value.color[3] / 255 + ')'
            }
        },
        cancel: {
            type: 'button',
            label: 'cancel',
            onclick: function() {
                document.querySelector('.satus-dialog__scrim').click();
            }
        },
        save: {
            type: 'button',
            label: 'save',
            onclick: function() {
                satus.storage.set(element.storage_key, {
                    color: value.color,
                    x: value.x,
                    y: value.y
                });

                document.querySelector('.satus-dialog__scrim').click();
            }
        }
    }, component);

    return component;
};

/*---------------------------------------------------------------
>>> SHORTCUT
---------------------------------------------------------------*/

satus.components.shortcut = function(object) {
    var component = document.createElement('div'),
        value,
        options = object.options || {},
        mousewheel_timeout = false,
        mousewheel_only = false;
        
    try {
        value = JSON.parse(Satus.storage.get(object.storage_key));
    } catch (err) {
        value = object.value || {};
    }

    function renderValue() {
        var keys_value = [];

        if (value.altKey === true) {
            keys_value.push('<div class=satus-shortcut__key>Alt</div>');
        }

        if (value.ctrlKey === true) {
            keys_value.push('<div class=satus-shortcut__key>Ctrl</div>');
        }

        if (value.shiftKey === true) {
            keys_value.push('<div class=satus-shortcut__key>Shift</div>');
        }

        if (value.key === ' ') {
            keys_value.push('<div class=satus-shortcut__key>Space bar</div>');

        } else if (typeof value.key === 'string' && ['Shift', 'Control', 'Alt'].indexOf(value.key) === -1) {
            if (value.key === 'ArrowUp') {
                keys_value.push('<div class=satus-shortcut__key>↑</div>');
            } else if (value.key === 'ArrowRight') {
                keys_value.push('<div class=satus-shortcut__key>→</div>');
            } else if (value.key === 'ArrowDown') {
                keys_value.push('<div class=satus-shortcut__key>↓</div>');
            } else if (value.key === 'ArrowLeft') {
                keys_value.push('<div class=satus-shortcut__key>←</div>');
            } else {
                keys_value.push('<div class=satus-shortcut__key>' + value.key.toUpperCase() + '</div>');
            }
        }

        if (value.wheel) {
            keys_value.push('<div class="satus-shortcut__mouse ' + (value.wheel > 0) + '"><div></div></div>');
        }

        if (value.click) {
            keys_value.push('<div class="satus-shortcut__mouse click"><div></div></div>');
        }

        if (value.context) {
            keys_value.push('<div class="satus-shortcut__mouse context"><div></div></div>');
        }
        
        return keys_value.join('<div class=satus-shortcut__plus></div>');
    }

    if (satus.isset(object.label)) {
        var label = document.createElement('div');
        
        label.className = 'satus-shortcut__label';
        
        label.innerText = satus.locale.getMessage(object.label);
        
        component.appendChild(label);
    }

    if (options.hide_value !== true) {
        var component_value = document.createElement('div');
        
        component_value.className = 'satus-shortcut__value';
        
        component_value.innerHTML = renderValue();
        
        component.appendChild(component_value);
    }
    
    component.addEventListener('click', function() {
        var component_dialog = document.createElement('div'),
            component_scrim = document.createElement('div'),
            component_surface = document.createElement('div'),
            component_canvas = document.createElement('div'),
            component_section = document.createElement('section'),
            component_button_reset = document.createElement('div'),
            component_button_cancel = document.createElement('div'),
            component_button_save = document.createElement('div');

        component_dialog.className = 'satus-dialog satus-dialog_open';
        component_scrim.className = 'satus-dialog__scrim';
        component_surface.className = 'satus-dialog__surface satus-dialog__surface_shortcut';
        component_canvas.className = 'satus-shortcut__canvas';
        component_section.className = 'satus-section satus-section--align-end satus-section_shortcut';
        component_button_reset.className = 'satus-button satus-button_shortcut';
        component_button_cancel.className = 'satus-button satus-button_shortcut';
        component_button_save.className = 'satus-button satus-button_shortcut';

        component_button_reset.innerText = Satus.locale.getMessage('reset');
        component_button_cancel.innerText = Satus.locale.getMessage('cancel');
        component_button_save.innerText = Satus.locale.getMessage('save');

        component_canvas.innerHTML = renderValue();

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
                altKey: event.altKey,
                click: false,
                context: false,
                wheel: false
            };

            component_canvas.innerHTML = renderValue();

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
            
            value.click = false;
            value.context = false;

            clearTimeout(mousewheel_timeout);

            mousewheel_timeout = setTimeout(function() {
                mousewheel_only = true;
            }, 300);

            value.wheel = event.deltaY;

            component_canvas.innerHTML = renderValue();

            return false;
        }
        
        component_canvas.addEventListener('click', function(event) {
            event.stopPropagation();

            if (mousewheel_only === true) {
                delete value.shiftKey;
                delete value.altKey;
                delete value.ctrlKey;
                delete value.keyCode;
                delete value.key;
            }
            
            value.wheel = false;
            value.context = false;

            clearTimeout(mousewheel_timeout);

            mousewheel_timeout = setTimeout(function() {
                mousewheel_only = true;
            }, 300);

            value.click = true;

            component_canvas.innerHTML = renderValue();

            return false;
        });
        
        component_canvas.addEventListener('contextmenu', function(event) {
            event.stopPropagation();
            event.preventDefault();

            if (mousewheel_only === true) {
                delete value.shiftKey;
                delete value.altKey;
                delete value.ctrlKey;
                delete value.keyCode;
                delete value.key;
            }
            
            value.wheel = false;
            value.click = false;

            clearTimeout(mousewheel_timeout);

            mousewheel_timeout = setTimeout(function() {
                mousewheel_only = true;
            }, 300);

            value.context = true;

            component_canvas.innerHTML = renderValue();

            return false;
        });

        window.addEventListener('keydown', keydown);
        window.addEventListener('mousewheel', mousewheel);

        function close() {
            window.removeEventListener('keydown', keydown);
            window.removeEventListener('mousewheel', mousewheel);

            component_dialog.classList.remove('satus-dialog_open');
            
            mousewheel_timeout = false;
            mousewheel_only = false;

            setTimeout(function() {
                component_dialog.remove();
            }, Number(document.defaultView.getComputedStyle(component_dialog, '').getPropertyValue('animation-duration').replace(/[^0-9.]/g, '') * 1000));
        }

        component_scrim.addEventListener('click', close);
        
        component_button_reset.addEventListener('click', function() {
            Satus.storage.set(object.storage_key, null);
            value = (Satus.storage.get(object.storage_key) ? JSON.parse(Satus.storage.get(object.storage_key)) : false) || object.value || {};
            component_value.innerHTML = renderValue();
            close();
        });
        
        component_button_cancel.addEventListener('click', function() {
            value = (Satus.storage.get(object.storage_key) ? JSON.parse(Satus.storage.get(object.storage_key)) : false) || object.value || {};
            close();
        });
        
        component_button_save.addEventListener('click', function() {
            Satus.storage.set(object.storage_key, JSON.stringify(value));
            
            if (typeof object.onchange === 'function') {
                object.onchange(object, value);
            }
            
            close();
        });

        component_section.appendChild(component_button_reset);
        component_section.appendChild(component_button_cancel);
        component_section.appendChild(component_button_save);

        component_surface.appendChild(component_canvas);
        component_surface.appendChild(component_section);

        component_dialog.appendChild(component_scrim);
        component_dialog.appendChild(component_surface);

        document.body.appendChild(component_dialog);
    });
    
    return component;
};
