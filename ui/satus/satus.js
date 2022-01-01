
/*--------------------------------------------------------------
>>> CORE:
----------------------------------------------------------------
# Global variable
# Functions
# Render
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

var satus = {
    components: {},
    events: {},
    locale: {
        strings: {}
    },
    storage: {
        attributes: {},
        data: {}
    }
};


/*--------------------------------------------------------------
# FUNCTIONS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# APPEND
--------------------------------------------------------------*/

satus.append = function (element, container) {
    (container || document.body).appendChild(element);
};


/*--------------------------------------------------------------
# ANIMATION DURATION
--------------------------------------------------------------*/

satus.getAnimationDuration = function (element) {
    return Number(window.getComputedStyle(element).getPropertyValue('animation-duration').replace(/[^0-9.]/g, '')) * 1000;
};


/*--------------------------------------------------------------
# APPEND
--------------------------------------------------------------*/

satus.attr = function (element, attributes) {
    if (attributes) {
        for (var key in attributes) {
            if (element.is_svg) {
                element.setAttributeNS(null, key, attributes[key]);
            } else {
                var value = attributes[key];

                if (['placeholder', 'title'].indexOf(key) !== -1) {
                    value = satus.locale.get(value);
                }

                element.setAttribute(key, value);
            }
        }
    }
};

satus.elementIndex = function (element) {
    return Array.prototype.slice.call(element.parentNode.children).indexOf(element);
};


/*--------------------------------------------------------------
# DATA
--------------------------------------------------------------*/

satus.data = function (element, data) {
    if (data) {
        for (var key in data) {
            element.dataset[key] = data[key];
        }
    }
};


/*--------------------------------------------------------------
# PROPERTIES
--------------------------------------------------------------*/

satus.properties = function (element, properties) {
    if (properties) {
        for (var key in properties) {
            element[key] = properties[key];
        }
    }
};


/*--------------------------------------------------------------
# CAMELIZE
--------------------------------------------------------------*/

satus.camelize = function (string) {
    var result = '';

    for (var i = 0, l = string.length; i < l; i++) {
        var character = string[i];

        if (character === '-') {
            i++;

            result += string[i].toUpperCase();
        } else {
            result += character;
        }
    }

    return result;
};


/*--------------------------------------------------------------
# SNAKELIZE
--------------------------------------------------------------*/

satus.snakelize = function (string) {
    return string.replace(/([A-Z])/g, '-$1').toLowerCase();
};


/*--------------------------------------------------------------
# CLASS
--------------------------------------------------------------*/

satus.class = function (element, string) {
    if (string) {
        element.className += ' ' + string;
    }
};


/*--------------------------------------------------------------
# EMPTY
--------------------------------------------------------------*/

satus.empty = function (element, exclude = []) {
    for (var i = element.childNodes.length - 1; i > -1; i--) {
        var child = element.childNodes[i];

        if (exclude.indexOf(child) === -1) {
            child.remove();
        }
    }
};


/*--------------------------------------------------------------
# EVENTS
--------------------------------------------------------------*/

Object.defineProperty(satus.events, 'add', {
    value: function (type, listener) {
        if (this.hasOwnProperty(type) === false) {
            this[type] = [];
        }

        this[type].push(listener);
    }
});


/*--------------------------------------------------------------
# ISSET
--------------------------------------------------------------*/

satus.isset = function (variable) {
    if (variable === null || variable === undefined) {
        return false;
    }

    return true;
};


/*--------------------------------------------------------------
# FETCH
--------------------------------------------------------------*/

satus.fetch = function (url, success, error) {
    fetch(url).then(function (response) {
        if (response.ok) {
            response.json().then(success);
        } else {
            error();
        }
    }).catch(function () {
        error(success);
    });
};


/*--------------------------------------------------------------
# AJAX
--------------------------------------------------------------*/

satus.ajax = function (url, success, error) {
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        success(this.response);
    };
    xhr.onerror = function () {
        error(success);
    };

    xhr.open('GET', url, true);
    xhr.send();
};


/*--------------------------------------------------------------
# STORAGE
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

satus.storage.get = function (name) {
    var target = satus.storage.data;

    if (typeof name !== 'string') {
        return;
    }

    name = name.split('/').filter(function (value) {
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


/*--------------------------------------------------------------
# SET
--------------------------------------------------------------*/

satus.storage.set = function (name, value, callback) {
    var items = {},
        target = satus.storage.data;

    if (typeof name !== 'string') {
        return;
    }

    name = name.split('/').filter(function (value) {
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

    for (var key in this.data) {
        if (typeof this.data[key] !== 'function') {
            items[key] = this.data[key];
        }
    }

    if (satus.storage.attributes[name]) {
        document.body.setAttribute('data-' + name, value);
    }

    chrome.storage.local.set(items, callback);
};


/*--------------------------------------------------------------
# REMOVE
--------------------------------------------------------------*/

satus.storage.remove = function (name) {
    delete this.data[name];

    chrome.storage.local.remove(name);
};


/*--------------------------------------------------------------
# IMPORT
--------------------------------------------------------------*/

satus.storage.import = function (keys, callback) {
    if (typeof keys === 'function') {
        callback = keys;

        keys = undefined;
    }

    chrome.storage.local.get(keys, function (items) {
        for (var key in items) {
            if (satus.storage.attributes[key]) {
                document.body.setAttribute('data-' + key, items[key]);
            }

            satus.storage.data[key] = items[key];
        }

        if (callback) {
            callback(items);
        }
    });
};


/*--------------------------------------------------------------
# CLEAR
--------------------------------------------------------------*/

satus.storage.clear = function (callback) {
    this.data = {};

    chrome.storage.local.clear(callback);
};


/*--------------------------------------------------------------
# LOCALIZATION
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

satus.locale.get = function (string) {
    return this.strings[string] || string;
};


/*--------------------------------------------------------------
# IMPORT
--------------------------------------------------------------*/

satus.locale.import = function (code, path, callback) {
    var language = code || window.navigator.language;

    if (language.indexOf('en') === 0) {
        language = 'en';
    }

    if (!path) {
        path = '_locales/';
    }

    satus.fetch(chrome.runtime.getURL(path + language + '/messages.json'), function (response) {
        for (var key in response) {
            satus.locale.strings[key] = response[key].message;
        }

        callback();
    }, function (success) {
        satus.fetch(chrome.runtime.getURL(path + 'en/messages.json'), success);
    });
};


/*--------------------------------------------------------------
# ON
--------------------------------------------------------------*/

satus.on = function (element, events) {
    if (this.isset(events) && typeof events === 'object') {
        for (var selector in events) {
            var type = typeof events[selector];

            if (selector === 'selectionchange') {
                element = document;
            }

            if (type === 'function') {
                element.addEventListener(selector, events[selector]);
            } else if (type === 'object') {
                element.addEventListener(selector, function (event) {
                    this.skeleton.on[event.type].parent = this.skeleton;

                    if (this.skeleton.on[event.type].component !== 'modal' && this.base && this.base.layers) {
                        this.base.layers.open(this.skeleton.on[event.type]);
                    } else {
                        satus.render(this.skeleton.on[event.type], this.base);
                    }
                });
            } else if (type === 'string') {
                element.addEventListener(selector, function () {
                    var match = this.skeleton.on[event.type].match(/(["'`].+["'`]|[^.()]+)/g),
                        target = this.base;

                    for (var i = 0, l = match.length; i < l; i++) {
                        var key = match[i];

                        if (target.skeleton[key]) {
                            target = target.skeleton[key];
                        } else {
                            if (typeof target[key] === 'function') {
                                target[key]();
                            } else {
                                target = target[key];
                            }
                        }

                        if (target.rendered) {
                            target = target.rendered;
                        }
                    }
                });
            }
        }
    }
};


/*--------------------------------------------------------------
# STYLE
--------------------------------------------------------------*/

satus.style = function (component, object) {
    for (var key in object) {
        component.style[key] = object[key];
    }
};


/*--------------------------------------------------------------
# SEARCH
--------------------------------------------------------------*/

satus.search = function (query, object, callback) {
    var elements = ['switch', 'select', 'slider', 'shortcut', 'radio', 'color-picker'],
        threads = 0,
        results = {};

    query = query.toLowerCase();

    function parse(items, parent) {
        threads++;

        for (var key in items) {
            if (key !== 'rendered' && key !== 'base' && key !== 'parent') {
                var item = items[key];

                if (elements.indexOf(item.component) !== -1 && key.indexOf(query) !== -1) {
                    results[key] = Object.assign({}, item);
                }

                if (typeof item === 'object') {
                    parse(item, items);
                }
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
# PARENTS
--------------------------------------------------------------*/

satus.parents = function (object, components_only) {
    function parse(items, parent) {
        for (var key in items) {
            if (key !== 'rendered' && key !== 'base' && key !== 'parent') {
                var item = items[key];

                if (components_only !== true || item.component) {
                    item.parent = items;
                }

                if (typeof item === 'object' && item.component !== 'shortcut') {
                    parse(item, items);
                }
            }
        }
    }

    parse(object);
};


/*--------------------------------------------------------------
# TEXT
--------------------------------------------------------------*/

satus.text = function (component, value) {
    if (typeof value === 'function') {
        value = value();
    }

    if (value) {
        component.appendChild(document.createTextNode(this.locale.get(value)));
    }
};


/*--------------------------------------------------------------
# DECRYPTION
--------------------------------------------------------------*/

satus.decrypt = async function (text, password) {
    var iv = text.slice(0, 24).match(/.{2}/g).map(byte => parseInt(byte, 16)),
        algorithm = {
            name: 'AES-GCM',
            iv: new Uint8Array(iv)
        };

    try {
        var data = new TextDecoder().decode(await crypto.subtle.decrypt(
            algorithm,
            await crypto.subtle.importKey(
                'raw',
                await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)),
                algorithm,
                false, ['decrypt']
            ),
            new Uint8Array(atob(text.slice(24)).match(/[\s\S]/g).map(ch => ch.charCodeAt(0)))
        ));
    } catch (err) {
        return false;
    }

    return data;
};


/*--------------------------------------------------------------
# ENCRYPTION
--------------------------------------------------------------*/

satus.encrypt = async function (text, password) {
    var iv = crypto.getRandomValues(new Uint8Array(12)),
        algorithm = {
            name: 'AES-GCM',
            iv: iv
        };

    return Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('') + btoa(Array.from(new Uint8Array(await crypto.subtle.encrypt(
        algorithm,
        await crypto.subtle.importKey('raw', await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)), algorithm, false, ['encrypt']),
        new TextEncoder().encode(text)
    ))).map(byte => String.fromCharCode(byte)).join(''));
};


/*--------------------------------------------------------------
# IS
--------------------------------------------------------------*/

satus.isArray = function (array) {
    if (Array.isArray(array)) {
        return true;
    } else {
        return false;
    }
};

satus.isNumber = function (number) {
    if (typeof number === 'number' && isNaN(number) === false) {
        return true;
    } else {
        return false;
    }
};


/*--------------------------------------------------------------
# INDEX OF
--------------------------------------------------------------*/

satus.indexOf = function (child, parent) {
    var index = 0;

    if (satus.isArray(parent)) {
        index = parent.indexOf(child);
    } else {
        while ((child = child.previousElementSibling)) {
            index++;
        }
    }

    return index;
};


/*--------------------------------------------------------------
# TO INDEX
--------------------------------------------------------------*/

satus.toIndex = function (index, child, parent) {
    if (satus.isArray(parent)) {
        parent.splice(index, 0, parent.splice(satus.indexOf(child, parent), 1)[0])
    }
};


/*--------------------------------------------------------------
# CLONE
--------------------------------------------------------------*/

satus.clone = function (item) {
    var clone = item.cloneNode(true),
        parent_css = window.getComputedStyle(item.parentNode),
        css = window.getComputedStyle(item),
        style = '';

    for (var i = 0, l = css.length; i < l; i++) {
        var property = css[i],
            value = css.getPropertyValue(property);

        if (property === 'background-color') {
            value = parent_css.getPropertyValue('background-color');
        }

        if (['box-shadow', 'left', 'top', 'bottom', 'right', 'opacity'].indexOf(property) === -1) {
            style += property + ':' + value + ';';
        }
    }


    clone.setAttribute('style', style);

    return clone;
};


/*--------------------------------------------------------------
# REMOVE
--------------------------------------------------------------*/

satus.remove = function (child, parent) {
    if (satus.isArray(parent)) {
        parent.splice(satus.indexOf(child, parent), 1);
    }
};


/*--------------------------------------------------------------
# RENDER
--------------------------------------------------------------*/

satus.render = function (skeleton, container, skip, property) {
    var component;

    if (skeleton.hasOwnProperty('component') && skip !== true) {
        var name = skeleton.component,
            camelized_name = this.camelize(name);

        if (skeleton.on && skeleton.on.beforerender) {
            skeleton.on.beforerender(skeleton);
        }

        if (this.components[camelized_name]) {
            component = this.components[camelized_name](skeleton);

            if (this.isset(component.inner) === false) {
                component.inner = component;
            }
        } else if (name === 'svg' || container && container.is_svg) {
            component = document.createElementNS('http://www.w3.org/2000/svg', name);

            component.is_svg = true;

            component.inner = component;
        } else {
            component = document.createElement(skeleton.component);

            component.inner = component;
        }

        if (component.inner.hasOwnProperty('base') === false && container) {
            component.inner.base = container.base;
        }

        if (component.inner.base && name === 'layers') {
            component.inner.base.layers = component;
        }

        skeleton.rendered = component;
        component.skeleton = skeleton;

        component.className = (component.className + ' satus-' + skeleton.component).trim();

        if (skeleton.variant) {
            component.className += ' satus-' + skeleton.component + '--' + skeleton.variant;
        }

        this.append(component, container);

        container = component.inner || component;

        this.class(component, skeleton.class);
        this.style(component, skeleton.style);
        this.attr(component, skeleton.attr);
        this.data(component, skeleton.data);
        this.properties(component, skeleton.properties);
        this.on(component, skeleton.on);
        this.text(container, skeleton.text);

        if (component.hasOwnProperty('storage') === false && skeleton.storage !== false) {
            component.storage = skeleton.storage || property || false;
        }

        if (component.hasOwnProperty('storageValue') === false) {
            if (component.storage !== false) {
                component.storageValue = satus.storage.get(component.storage);
            }

            if (skeleton.hasOwnProperty('value') && component.storageValue === undefined) {
                component.storageValue = skeleton.value;
            }
        }

        component.storageChange = function () {
            if (this.storage) {
                var key = this.storage;

                if (typeof key === 'function') {
                    key = key();
                }

                satus.storage.set(key, this.storageValue);
            }

            this.dispatchEvent(new CustomEvent('change'));
        };

        component.dispatchEvent(new CustomEvent('render'));

        if (skeleton.autofocus === true) {
            component.focus();
        }

        if (this.events.hasOwnProperty('render')) {
            for (var i = 0, l = this.events['render'].length; i < l; i++) {
                this.events['render'][i](component, skeleton);
            }
        }
    }

    if (!component || component.render_children !== false) {
        for (var key in skeleton) {
            if (key !== 'parent' && skeleton[key] && skeleton[key].hasOwnProperty('component')) {
                skeleton[key].parent = skeleton;

                this.render(skeleton[key], container, false, key);
            }
        }
    }

    return component;
};
/*--------------------------------------------------------------
>>> COLOR:
----------------------------------------------------------------
# RGB to HSL
# HUE to RGB
# HSL to RGB
--------------------------------------------------------------*/

satus.color = {};


/*--------------------------------------------------------------
# RGB TO HSL
--------------------------------------------------------------*/

satus.color.rgbToHsl = function (array) {
	var r = array[0] / 255,
		g = array[1] / 255,
		b = array[2] / 255,
		min = Math.min(r, g, b),
		max = Math.max(r, g, b),
		h = 0,
		s = 0,
		l = (min + max) / 2;

	if (min === max) {
		h = 0;
		s = 0;
	} else {
		var delta = max - min;

		s = l <= 0.5 ? delta / (max + min) : delta / (2 - max - min);

		if (max === r) {
			h = (g - b) / delta + (g < b ? 6 : 0);
		} else if (max === g) {
			h = (b - r) / delta + 2;
		} else if (max === b) {
			h = (r - g) / delta + 4;
		}

		h /= 6;
	}

	h *= 360;
	s *= 100;
	l *= 100;

	if (array.length === 3) {
		return [h, s, l];
	} else {
		return [h, s, l, array[3]];
	}
};


/*--------------------------------------------------------------
# HUE TO RGB
--------------------------------------------------------------*/

satus.color.hueToRgb = function (array) {
	var t1 = array[0],
		t2 = array[1],
		hue = array[2];

	if (hue < 0) {
		hue += 6;
	}

	if (hue >= 6) {
		hue -= 6;
	}

	if (hue < 1) {
		return (t2 - t1) * hue + t1;
	} else if (hue < 3) {
		return t2;
	} else if (hue < 4) {
		return (t2 - t1) * (4 - hue) + t1;
	} else {
		return t1;
	}
};


/*--------------------------------------------------------------
# HSL TO RGB
--------------------------------------------------------------*/

satus.color.hslToRgb = function (array) {
	var h = array[0] / 360,
		s = array[1] / 100,
		l = array[2] / 100,
		r, g, b;

	if (s == 0) {
		r = g = b = l;
	} else {
		var hue2rgb = function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		}

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};
/*--------------------------------------------------------------
>>> PLUVIAM
--------------------------------------------------------------*/

satus.events.add('render', function (component, skeleton) {
	if (skeleton.pluviam === true) {
		function createPluviam(event) {
			var pluviam = document.createElement('span'),
				rect = this.getBoundingClientRect(),
				x = event.clientX - rect.left,
				y = event.clientY - rect.top,
				diameter = Math.sqrt(Math.pow(rect.width * 2, 2) + Math.pow(rect.height * 2, 2));

			pluviam.className = 'satus-pluviam';

			pluviam.style.left = x - diameter / 2 + 'px';
			pluviam.style.top = y - diameter / 2 + 'px';
			pluviam.style.width = diameter + 'px';
			pluviam.style.height = diameter + 'px';

			this.appendChild(pluviam);

			setTimeout(function () {
				pluviam.remove();
			}, 1000);
		}

		component.addEventListener('mousedown', createPluviam);
		component.addEventListener('mouseover', createPluviam);
	}
});
/*--------------------------------------------------------------
>>> EXTENSION STORAGE
--------------------------------------------------------------*/
/*--------------------------------------------------------------
>>> SORTABLE
--------------------------------------------------------------*/

satus.events.add('render', function (component, skeleton) {
    if (skeleton.sortable === true) {
        component.addEventListener('mousedown', function (event) {
            if (event.button !== 0) {
                return false;
            }

            var component = this,
                rect = this.getBoundingClientRect(),
                x = event.clientX,
                y = event.clientY,
                offset_x = event.clientX - rect.left,
                offset_y = event.clientY - rect.top,
                ghost = satus.clone(this),
                children = this.parentNode.children,
                appended = false;

            ghost.classList.add('satus-sortable__ghost');

            function mousemove(event) {
                if (appended === false && (Math.abs(event.clientX - x) > 4 || Math.abs(event.clientY - y) > 4)) {
                    appended = true;

                    component.classList.add('satus-sortable__chosen');

                    component.parentNode.appendChild(ghost);
                }

                ghost.style.transform = 'translate(' + (event.clientX - offset_x) + 'px, ' + (event.clientY - offset_y) + 'px)';
            }

            function mouseup(event) {
                component.classList.remove('satus-sortable__chosen');
                ghost.remove();

                window.removeEventListener('mousemove', mousemove, true);
                window.removeEventListener('mouseup', mouseup, true);

                for (var i = 0, l = children.length; i < l; i++) {
                    var child = children[i];

                    if (child !== component) {
                        child.removeEventListener('mouseover', siblingMouseOver);
                    }
                }

                component.dispatchEvent(new CustomEvent('sort'));

                event.stopPropagation();

                return false;
            }

            window.addEventListener('mousemove', mousemove, {
                passive: true,
                capture: true
            });

            window.addEventListener('mouseup', mouseup, {
                passive: true,
                capture: true
            });

            function siblingMouseOver(event) {
                var target = event.target,
                    parent = target.parentNode,
                    y = event.layerY / (target.offsetHeight / 100);

                if (y < 50 && target.previousSibling !== component || y >= 50 && target.nextSibling === component) {
                    parent.insertBefore(component, target);
                } else {
                    parent.insertBefore(component, target.nextSibling);
                }
            }

            for (var i = 0, l = children.length; i < l; i++) {
                var child = children[i];

                if (child !== component) {
                    child.addEventListener('mouseover', siblingMouseOver);
                }
            }

            event.stopPropagation();
            event.preventDefault();

            return false;
        });
    }
});
/*--------------------------------------------------------------
>>> USER
--------------------------------------------------------------*/

satus.user = function () {
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
/*--------------------------------------------------------------
>>> UUID
--------------------------------------------------------------*/

satus.uuid = function () {
	return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (match) {
		return (match ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> match / 4).toString(16)
	});
};
/*--------------------------------------------------------------
>>> CONTEXT MENU
--------------------------------------------------------------*/

satus.events.add('render', function (component, skeleton) {
    if (skeleton.contextMenu) {
    	component.addEventListener('contextmenu', function (event) {
    		var x = event.clientX,
    			y = event.clientY,
    			modal = satus.render({
    				component: 'modal',
    				variant: 'contextmenu',
    				parent: skeleton
    			});

    		if (window.innerWidth - x < 200) {
    			x = window.innerWidth - 200;
    		}

    		modal.inner.style.left = x + 'px';
    		modal.inner.style.top = y + 'px';

    		satus.render(skeleton.contextMenu, modal.inner);

    		event.preventDefault();
    		event.stopPropagation();

    		return false;
    	});
    }
});
/*--------------------------------------------------------------
>>> BASE
--------------------------------------------------------------*/

satus.components.base = function (skeleton) {
    var component = document.createElement('div');

    component.base = component;

    return component;
};
/*--------------------------------------------------------------
>>> RADIO
--------------------------------------------------------------*/

satus.components.radio = function (skeleton) {
	var component = document.createElement('label'),
		content = document.createElement('span'),
		radio = document.createElement('input');

	component.inner = content;

	radio.type = 'radio';

	if (skeleton.group) {
		component.storage = skeleton.group;
		radio.name = skeleton.group;
	}

	if (skeleton.value) {
		radio.value = skeleton.value;
	}

	component.addEventListener('render', function () {
		this.storageValue = satus.storage.get(this.storage);

		if (satus.isset(this.storageValue)) {
			radio.checked = this.storageValue === skeleton.value;
		} else if (skeleton.checked) {
			radio.checked = true;
		}
	});

	radio.addEventListener('change', function () {
		component.storageValue = this.value;
		component.storageChange();
	});

	component.appendChild(content);
	component.appendChild(radio);

	return component;
};
/*--------------------------------------------------------------
>>> CHECKBOX
--------------------------------------------------------------*/

satus.components.checkbox = function (skeleton) {
	var component = document.createElement('button'),
		content = document.createElement('span');

	component.inner = content;

	content.className = 'satus-checkbox__content';

	component.appendChild(content);

	component.addEventListener('click', function () {
		if (this.dataset.value === 'true') {
			this.storageValue = false;
			this.dataset.value = 'false';
		} else {
			this.storageValue = true;
			this.dataset.value = 'true';
		}

		this.storageChange();
	});

	component.addEventListener('render', function () {
		this.dataset.value = this.storageValue;
	});

	return component;
};
/*--------------------------------------------------------------
>>> SELECT
--------------------------------------------------------------*/

satus.components.select = function (skeleton) {
	var component = document.createElement('div'),
		component_content = document.createElement('span'),
		component_value = document.createElement('span'),
		select = document.createElement('select');

	component_content.className = 'satus-select__content';
	component_value.className = 'satus-select__value';

	for (var i = 0, l = skeleton.options.length; i < l; i++) {
		var option = document.createElement('option');

		option.value = skeleton.options[i].value;

		satus.text(option, skeleton.options[i].text);

		select.appendChild(option);
	}

	component.selectElement = select;
	select.valueElement = component_value;

	select.addEventListener('change', function () {
		satus.empty(this.valueElement);

		satus.text(this.valueElement, this.options[this.selectedIndex].text);

		this.parentNode.storageValue = this.value;

		this.parentNode.storageChange();
	});

	component.appendChild(component_content);
	component.appendChild(component_value);
	component.appendChild(select);

	component.addEventListener('render', function () {
		select.value = this.storageValue || this.skeleton.options[0].value;

		satus.text(select.valueElement, select.options[select.selectedIndex].text);
	});

	component.inner = component_content;

	return component;
};
/*--------------------------------------------------------------
>>> SHORTCUT
--------------------------------------------------------------*/

satus.components.shortcut = function (skeleton) {
    var component = document.createElement('button'),
        content = document.createElement('span'),
        value = document.createElement('div');

    component.inner = content;

    component.className = 'satus-button';
    value.className = 'satus-shortcut__value';

    component.render = function (parent) {
        var self = this,
            parent = parent || self.primary,
            children = parent.children;

        satus.empty(parent);

        function createElement(name) {
            var element = document.createElement('div');

            element.className = 'satus-shortcut__' + name;

            parent.appendChild(element);

            return element;
        }

        if (this.data.alt) {
            createElement('key').textContent = 'Alt';
        }

        if (this.data.ctrl) {
            if (children.length && children[children.length - 1].className.indexOf('key') !== -1) {
                createElement('plus');
            }

            createElement('key').textContent = 'Ctrl';
        }

        if (this.data.shift) {
            if (children.length && children[children.length - 1].className.indexOf('key') !== -1) {
                createElement('plus');
            }

            createElement('key').textContent = 'Shift';
        }

        for (var code in this.data.keys) {
            var key = this.data.keys[code].key,
                arrows = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'],
                index = arrows.indexOf(key);

            if (children.length && children[children.length - 1].className.indexOf('key') !== -1) {
                createElement('plus');
            }

            if (index !== -1) {
                createElement('key').textContent = ['↑', '→', '↓', '←'][index];
            } else if (key === ' ') {
                createElement('key').textContent = '␣';
            } else if (key) {
                createElement('key').textContent = key.toUpperCase();
            }
        }

        if (this.data.wheel) {
            if (children.length && children[children.length - 1].className.indexOf('key') !== -1) {
                createElement('plus');
            }

            var mouse = createElement('mouse'),
                div = document.createElement('div');

            mouse.appendChild(div);

            mouse.className += ' ' + (this.data.wheel > 0);
        }

        if (this.data.click) {
            if (children.length && children[children.length - 1].className.indexOf('key') !== -1) {
                createElement('plus');
            }

            var mouse = createElement('mouse'),
                div = document.createElement('div');

            mouse.appendChild(div);

            mouse.className += ' click';
        }

        if (this.data.context) {
            if (children.length && children[children.length - 1].className.indexOf('key') !== -1) {
                createElement('plus');
            }

            var mouse = createElement('mouse'),
                div = document.createElement('div');

            mouse.appendChild(div);

            mouse.className += ' context';
        }
    };

    component.valueElement = value;

    component.appendChild(content);
    component.appendChild(value);

    component.keydown = function (event) {
        event.preventDefault();
        event.stopPropagation();

        component.data = {
            alt: event.altKey,
            ctrl: event.ctrlKey,
            shift: event.shiftKey,
            keys: {}
        };

        if (['control', 'alt', 'altgraph', 'shift'].indexOf(event.key.toLowerCase()) === -1) {
            component.data.keys[event.keyCode] = {
                code: event.code,
                key: event.key
            };
        }

        component.data.wheel = 0;

        component.render();

        return false;
    };

    component.mousewheel = function (event) {
        event.stopPropagation();

        if (
            (
                component.data.wheel === 0 &&
                (
                    Object.keys(component.data.keys).length === 0 &&
                    component.data.alt === false &&
                    component.data.ctrl === false &&
                    component.data.shift === false
                )
            ) ||
            component.data.wheel < 0 && event.deltaY > 0 ||
            component.data.wheel > 0 && event.deltaY < 0) {
            component.data = {
                alt: false,
                ctrl: false,
                shift: false,
                keys: {}
            };
        }

        component.data.wheel = event.deltaY < 0 ? -1 : 1;

        component.render();

        return false;
    };

    component.addEventListener('render', function () {
        this.data = this.storageValue || {
            alt: false,
            ctrl: false,
            shift: false,
            keys: {},
            wheel: 0
        };

        this.render(this.valueElement);
    });

    component.addEventListener('click', function () {
        satus.render({
            component: 'modal',
            on: {
                close: function () {
                    window.removeEventListener('keydown', component.keydown);
                    window.removeEventListener('wheel', component.mousewheel);
                }
            },

            primary: {
                component: 'div',
                class: 'satus-shortcut__primary',
                on: {
                    render: function () {
                        component.primary = this;

                        if (component.skeleton.mouseButtons === true) {
                            this.addEventListener('click', function () {
                                component.data.context = false;
                                component.data.click = true;

                                component.render();
                            });

                            this.addEventListener('contextmenu', function (event) {
                                event.preventDefault();
                                event.stopPropagation();

                                component.data.context = true;
                                component.data.click = false;

                                component.render();

                                return false;
                            });
                        }

                        component.render();
                    }
                }
            },
            actions: {
                component: 'section',
                variant: 'actions',

                reset: {
                    component: 'button',
                    text: 'reset',
                    on: {
                        click: function () {
                            component.data = component.skeleton.value || {};

                            component.render(component.valueElement);

                            satus.storage.set(skeleton.storage, false);

                            this.parentNode.parentNode.parentNode.close();

                            window.removeEventListener('keydown', component.keydown);
                            window.removeEventListener('wheel', component.mousewheel);
                        }
                    }
                },
                cancel: {
                    component: 'button',
                    text: 'cancel',
                    on: {
                        click: function () {
                            component.data = satus.storage.get(component.storage) || component.skeleton.value || {};

                            component.render(component.valueElement);

                            this.parentNode.parentNode.parentNode.close();

                            window.removeEventListener('keydown', component.keydown);
                            window.removeEventListener('wheel', component.mousewheel);
                        }
                    }
                },
                save: {
                    component: 'button',
                    text: 'save',
                    on: {
                        click: function () {
                            component.storageValue = component.data;

                            component.storageChange();

                            component.render(component.valueElement);

                            this.parentNode.parentNode.parentNode.close();

                            window.removeEventListener('keydown', component.keydown);
                            window.removeEventListener('wheel', component.mousewheel);
                        }
                    }
                }
            }
        });

        window.addEventListener('keydown', this.keydown);
        window.addEventListener('wheel', this.mousewheel);
    });

    return component;
};
/*--------------------------------------------------------------
>>> SWITCH
--------------------------------------------------------------*/

satus.components.switch = function (skeleton) {
	var component = document.createElement('button'),
		component_content = document.createElement('span'),
		component_thumb = document.createElement('i');

	component.inner = component_content;

	component_content.className = 'satus-switch__content';

	component.addEventListener('click', function () {
		if (this.dataset.value === 'true') {
			this.storageValue = false;
			this.dataset.value = 'false';
		} else {
			this.storageValue = true;
			this.dataset.value = 'true';
		}

		this.storageChange();
	});

	component.addEventListener('render', function () {
		this.dataset.value = this.storageValue;
	});

	component.appendChild(component_content);
	component.appendChild(component_thumb);

	return component;
};
/*--------------------------------------------------------------
>>> LAYERS
--------------------------------------------------------------*/

satus.components.layers = function (skeleton) {
	var component = document.createElement('div');

	component.path = [skeleton];

	component.back = function () {
		if (this.path.length > 1) {
			this.path.pop();

			this.open();
		}
	};

	component.open = function (skeleton) {
		var layer = document.createElement('div');

		if (skeleton) {
			this.path.push(skeleton);
		} else {
			skeleton = this.path[this.path.length - 1];
		}

		layer.className = 'satus-layer';

		layer.skeleton = skeleton;
		layer.base = this.base;

		satus.render(skeleton, layer, skeleton.component === 'layers');

		satus.empty(this);

		this.appendChild(layer);

		this.dispatchEvent(new Event('open'));
	};

	component.update = function () {
		var layer = this.querySelector('.satus-layer');

		satus.empty(layer);

		satus.render(layer.skeleton, layer);
	};

	component.render_children = false;

	component.addEventListener('render', function () {
		this.open();
	});

	return component;
};
/*--------------------------------------------------------------
>>> INPUT
--------------------------------------------------------------*/

satus.components.input = function (skeleton) {
	var component = document.createElement('input');

	if (skeleton.attr) {
		var key = skeleton.attr.name || skeleton.storage,
			value;

		if (satus.isset(satus.storage.get(key))) {
			value = satus.storage.get(key);
		} else {
			value = skeleton.value;
		}

		if (skeleton.attr.type === 'radio') {
			component.checked = value === skeleton.attr.value || skeleton.value;
		} else if (satus.isset(value)) {
			component.value = value;
		}

		component.addEventListener('change', function () {
			var key = this.skeleton.attr.name || this.skeleton.storage;

			satus.storage.set(key, this.value);
		});
	} else {
		var key = skeleton.name || skeleton.storage,
			value;

		component.type = skeleton.type;

		if (satus.isset(satus.storage.get(key))) {
			value = satus.storage.get(key);
		} else {
			value = skeleton.value;
		}

		if (skeleton.type === 'radio') {
			component.checked = value === skeleton.value || skeleton.value;
		} else if (satus.isset(value)) {
			component.value = value;
		}

		component.addEventListener('change', function () {
			var key = this.skeleton.name || this.skeleton.storage;

			satus.storage.set(key, this.value);
		});
	}

	return component;
};
/*--------------------------------------------------------------
>>> MENUBAR
--------------------------------------------------------------*/

satus.components.menubar = function (skeleton) {
	function createList(items) {
		var ul = document.createElement('ul');

		for (var key in items) {
			var item = items[key],
				li = document.createElement('li');

			satus.render(item, li);

			if (item.items) {
				li.appendChild(createList(item.items));
			}

			ul.appendChild(li);
		}

		return ul;
	}

	return createList(skeleton.items);
};
/*--------------------------------------------------------------
>>> TEXTAREA
--------------------------------------------------------------*/

satus.components.textarea = function (skeleton) {
	var component = document.createElement('div'),
		line_number = document.createElement('div'),
		textarea = document.createElement('textarea');

	line_number.className = 'satus-textarea__line-number';

	component.line_number = line_number;
	component.textarea = textarea;

	line_number.update = function (count) {
		if (count !== this.children.length) {
			satus.empty(this);

			for (var i = 1; i <= count; i++) {
				var span = document.createElement('span');

				span.textContent = i;

				this.appendChild(span);
			}
		}
	};

	textarea.addEventListener('input', function () {
		this.parentNode.line_number.update(this.value.split('\n').length);
	});

	textarea.addEventListener('selectionchange', function () {
		this.parentNode.line_number.update(this.value.split('\n').length);
	});

	textarea.addEventListener('scroll', function () {
		this.parentNode.line_number.style.transform = 'translateY(-' + this.scrollTop + 'px)';

		this.parentNode.line_number.update(this.value.split('\n').length);
	});

	component.appendChild(line_number);
	component.appendChild(textarea);

	line_number.update(1);

	return component;
};
/*--------------------------------------------------------------
>>> DIVIDER
--------------------------------------------------------------*/

satus.components.divider = function () {
	var component = document.createElement('div');

	return component;
};
/*--------------------------------------------------------------
>>> TEXT FIELD
--------------------------------------------------------------*/

satus.components.textField = function (skeleton) {
	var component = document.createElement('div'),
		pre = document.createElement('pre'),
		input = document.createElement('textarea'),
		hidden_text = document.createElement('span'),
		text = document.createElement('span'),
		selection = document.createElement('div'),
		cursor = document.createElement('div');

	input.className = 'satus-text-field__input';
	pre.className = 'satus-text-field__pre';
	hidden_text.className = 'satus-text-field__hidden-text';
	text.className = 'satus-text-field__text';
	selection.className = 'satus-text-field__selection';
	cursor.className = 'satus-text-field__cursor';

	component.inputElement = input;
	component.textElement = text;
	component.languages = {
		regex: function (component) {
		    var regex_token = /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g,
		        char_class_token = /[^\\-]+|-|\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)/g,
		        char_class_parts = /^(\[\^?)(]?(?:[^\\\]]+|\\[\S\s]?)*)(]?)$/,
		        quantifier = /^(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??$/,
		        matches = component.inputElement.value.match(regex_token);

		    function create(type, string) {
		        var span = document.createElement('span');

		        span.className = type;
		        span.textContent = string;

		        component.textElement.appendChild(span);
		    }

		    for (var i = 0, l = matches.length; i < l; i++) {
		        var match = matches[i];

		        if (match[0] === '[') {
		            create('character-class', match);
		        } else if (match[0] === '(') {
		            create('group', match);
		        } else if (match[0] === ')') {
		            create('group', match);
		        } else if (match[0] === '\\' || match === '^') {
		            create('anchor', match);
		        } else if (quantifier.test(match)) {
		            create('quantifier', match);
		        } else if (match === '|' || match === '.') {
		            create('metasequence', match);
		        } else {
		            create('text', match);
		        }
		    }
		}
	};
	component._syntax = skeleton.syntax;

	Object.defineProperty(component, 'value', {
		get: function () {
			return this.inputElement.value;
		},
		set: function (value) {
			var input = this.inputElement;

			input.value = value;

			input.updateValue();
			input.updateCursor();
		}
	});

	Object.defineProperty(component, 'syntax', {
		get: function () {
			return this._syntax;
		},
		set: function (value) {
			var input = this.inputElement;

			this._syntax = value;

			input.updateValue();
			input.updateCursor();
		}
	});

	input.rows = skeleton.rows || 1;
	input.autocapitalize = 'none';
	input.autocomplete = 'off';
	input.autocorrect = 'off';
	input.spellcheck = false;
	input.autofocus = true;
	input.textElement = text;
	input.hiddenTextElement = hidden_text;
	input.selectionElement = selection;
	input.cursorElement = cursor;

	input.updateValue = function () {
		var component = this.parentNode.parentNode;

		for (var i = this.textElement.childNodes.length - 1; i > -1; i--) {
	        this.textElement.childNodes[i].remove();
	    }

	    if (this.value.length > 0) {
	    	if (component.languages[component._syntax]) {
		    	component.languages[component._syntax](component);
		    } else {
		    	this.textElement.textContent = this.value;
		    }
	    }
	};

	input.updateCursor = function () {
		var cursor = this.cursorElement,
			selection = this.selectionElement,
			hidden_text = this.hiddenTextElement,
			start = this.selectionStart,
			end = this.selectionEnd;

		cursor.style.animation = 'none';

		if (start === end) {
			selection.setAttribute('disabled', '');
		} else {
			selection.removeAttribute('disabled');

			hidden_text.textContent = this.value.substring(0, start);

			selection.style.left = hidden_text.offsetWidth - this.scrollLeft + 'px';

			hidden_text.textContent = this.value.substring(start, end);

			selection.style.width = hidden_text.offsetWidth + 'px';
		}

		if (this.selectionDirection === 'forward') {
			hidden_text.textContent = this.value.substring(0, end);
		} else {
			hidden_text.textContent = this.value.substring(0, start);
		}

		cursor.style.left = hidden_text.offsetWidth - this.scrollLeft + 'px';

		cursor.style.animation = '';

		hidden_text.textContent = '';
	};

	input.addEventListener('keydown', function () {
		var self = this;

		setTimeout(function () {
			var component = self.parentNode.parentNode;

		    component.storageValue = self.value;
		    component.storageChange();

			self.updateValue();
			self.updateCursor();
		});
	});

	input.addEventListener('scroll', function (event) {
		this.textElement.style.left = -this.scrollLeft + 'px';
	});

	document.addEventListener('selectionchange', function () {
		input.updateCursor();
	});

	selection.setAttribute('disabled', '');

	pre.appendChild(input);
	pre.appendChild(hidden_text);
	pre.appendChild(text);
	pre.appendChild(selection);
	pre.appendChild(cursor);
	component.appendChild(pre);

	component.addEventListener('render', function () {
		input.value = this.storageValue;

		this.inputElement.updateValue();
		this.inputElement.updateCursor();
	});

	return component;
};
/*--------------------------------------------------------------
>>> TABS
--------------------------------------------------------------*/

satus.components.tabs = function (skeleton) {
	var component = document.createElement('div'),
		content = document.createElement('div'),
		selection = document.createElement('div');

	content.className = 'satus-tabs__content';
	selection.className = 'satus-tabs__selection';
	selection.style.width = 100 / skeleton.items.length + '%';

	content.appendChild(selection);

	component.selection = selection;

	for (var i = 0, l = skeleton.items.length; i < l; i++) {
		var item = skeleton.items[i],
			button = document.createElement('button');

		button.className = 'satus-tabs__button';
		button.value = item;
		button.style.width = 100 / l + '%';

		satus.text(button, item);

		button.addEventListener('click', function () {
			var component = this.parentNode.parentNode;

			component.selection.style.left = 100 / (this.parentNode.children.length - 1) * (satus.indexOf(this) - 1) + '%';

			component.storageValue = this.value;
			component.storageChange();
		});

		if (skeleton.value === item) {
			selection.style.left = i * 50 + '%';
		}

		content.appendChild(button);
	}
	
	component.appendChild(content);

	component.addEventListener('render', function () {
		var index = satus.indexOf(this.storageValue, this.skeleton.items);

		if (index === -1) {
			index = 0;
		}

		this.selection.style.left = 100 / this.skeleton.items.length * index + '%';
	});

	return component;
};
/*--------------------------------------------------------------
>>> ALERT
--------------------------------------------------------------*/

satus.components.alert = function (skeleton) {
	var component = document.createElement('div');

	return component;
};
/*--------------------------------------------------------------
>>> SLIDER
--------------------------------------------------------------*/

satus.components.slider = function (skeleton) {
	var component = document.createElement('div'),
		content = document.createElement('div'),
		container = document.createElement('div'),
		track = document.createElement('div'),
		track_fill = document.createElement('div');

	container.className = 'satus-slider__container';
	track.className = 'satus-slider__track';
	track_fill.className = 'satus-slider__track-fill';

	component.min = skeleton.min || 0;
	component.max = skeleton.max || 1;
	component.step = (skeleton.step || 1);
	component.percent = 100 / ((component.max - component.min) / component.step);
	component.precision = String(component.step).replace(/[0-9]./, '').length;

	component.container = container;
	component.track = track_fill;
	component.handles = [];
	component.inner = content;

	component.toPercent = function (number) {
		return number / this.step * this.percent + '%';
	};

	component.createHandle = function (index) {
		var handle = document.createElement('div');

		handle.className = 'satus-slider__handle';
		handle.handleIndex = index;
		handle.tabIndex = 0;

		this.handles.push(handle);

		this.container.appendChild(handle);
	};

	component.update = function () {
		if (this.values.length > 1) {
			var min = Math.min.apply(null, this.values) - this.min,
				max = Math.max.apply(null, this.values) - this.min;

			this.track.style.left = this.toPercent(min);
			this.track.style.width = this.toPercent(max - min);

			for (var i = 0, l = this.handles.length; i < l; i++) {
				var handle = this.handles[i],
					value = this.values[i];

				handle.style.left = this.toPercent(value - this.min);
				handle.dataset.value = value;
			}
		} else {
			var value = this.values[0];

			this.track.style.width = this.toPercent(value - this.min);
			this.handles[0].style.left = this.toPercent(value - this.min);
			this.handles[0].dataset.value = value;
		}
	};

	component.appendChild(content);
	track.appendChild(track_fill);
	container.appendChild(track);
	component.appendChild(container);

	component.addEventListener('keydown', function (event) {
		var code = event.keyCode;

		console.log(code);
	});

	component.addEventListener('render', function () {
		var value = this.storageValue;

		if (satus.isArray(value)) {
			this.values = value;
		} else if (satus.isNumber(value)) {
			this.values = [value];
		} else {
			this.values = this.skeleton.values || [satus.isset(this.skeleton.value) ? this.skeleton.value : 1];
		}

		for (var i = 0, l = this.values.length; i < l; i++) {
			this.createHandle(i);
		}

		this.update();
	});

	container.addEventListener('mousedown', function (event) {
		if (event.button === 0) {
			var component = this.parentNode,
				rect = this.getBoundingClientRect(),
				cursor_x = event.clientX - rect.left,
				percent = cursor_x / rect.width * 100,
				steps = percent / component.percent * component.step + component.min,
				closest_value = component.values.indexOf(component.values.reduce(function(previous, current, index) {
					return Math.abs(current - steps) < Math.abs(previous - steps) ? current : previous;
				})),
				handle_index = component.handles[closest_value].handleIndex;

			setTimeout(function () {
				component.handles[closest_value].focus();
			});

			function update(event) {
				var cursor_x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width),
					percent = cursor_x / rect.width * 100,
					value = percent / component.percent * component.step + component.min;

				value = (Math.round(value / component.step) * component.step);

				value = Number(value.toFixed(component.precision));

				if (component.values[handle_index] !== value) {
					component.values[handle_index] = value;

					component.storageValue = component.values.length === 1 ? component.values[0] : component.values;
					component.value = component.storageValue;

					component.storageChange();
				}

				component.update();
			}

			function mousemove(event) {
				update(event);
			}

			function mouseup(event) {
				window.removeEventListener('mousemove', mousemove);
				window.removeEventListener('mouseup', mouseup);
			};

			window.addEventListener('mousemove', mousemove);
			window.addEventListener('mouseup', mouseup);

			update(event);

			return true;
		}
	});

	return component;
};
/*--------------------------------------------------------------
>>> COLOR PICKER
--------------------------------------------------------------*/

satus.components.colorPicker = function (skeleton) {
    var component = document.createElement('button'),
        component_label = document.createElement('span'),
        component_value = document.createElement('span');

    component.inner = component_label;
    component.valueElement = component_value;

    component.className = 'satus-button';
    component_value.className = 'satus-color-picker__value';

    component.appendChild(component_label);
    component.appendChild(component_value);

    component.addEventListener('click', function () {
        var rgb = this.rgb,
            hsl = satus.color.rgbToHsl(rgb),
            s = hsl[1] / 100,
            l = hsl[2] / 100;

        s *= l < .5 ? l : 1 - l;

        var v = l + s;

        s = 2 * s / (l + s);

        satus.render({
            component: 'modal',
            variant: 'color-picker',
            value: hsl,
            parent: this,

            palette: {
                component: 'div',
                class: 'satus-color-picker__palette',
                style: {
                    'backgroundColor': 'hsl(' + hsl[0] + 'deg, 100%, 50%)'
                },
                on: {
                    mousedown: function () {
                        var palette = this,
                            rect = this.getBoundingClientRect(),
                            cursor = this.children[0];

                        function mousemove(event) {
                            var hsl = palette.skeleton.parent.value,
                                x = event.clientX - rect.left,
                                y = event.clientY - rect.top,
                                s;

                            x = Math.min(Math.max(x, 0), rect.width) / (rect.width / 100);
                            y = Math.min(Math.max(y, 0), rect.height) / (rect.height / 100);

                            var v = 100 - y,
                                l = (2 - x / 100) * v / 2;

                            hsl[1] = x * v / (l < 50 ? l * 2 : 200 - l * 2);
                            hsl[2] = l;

                            cursor.style.left = x + '%';
                            cursor.style.top = y + '%';

                            palette.nextSibling.children[0].style.backgroundColor = 'hsl(' + hsl[0] + 'deg,' + hsl[1] + '%, ' + hsl[2] + '%)';

                            event.preventDefault();
                        }

                        function mouseup() {
                            window.removeEventListener('mousemove', mousemove);
                            window.removeEventListener('mouseup', mouseup);
                        }

                        window.addEventListener('mousemove', mousemove);
                        window.addEventListener('mouseup', mouseup);
                    }
                },

                cursor: {
                    component: 'div',
                    class: 'satus-color-picker__cursor',
                    style: {
                        'left': s * 100 + '%',
                        'top': 100 - v * 100 + '%'
                    }
                }
            },
            section: {
                component: 'section',
                variant: 'color',

                color: {
                    component: 'div',
                    class: 'satus-color-picker__color',
                    style: {
                        'backgroundColor': 'rgb(' + this.rgb.join(',') + ')'
                    }
                },
                hue: {
                    component: 'slider',
                    class: 'satus-color-picker__hue',
                    storage: false,
                    value: hsl[0],
                    max: 360,
                    on: {
                        change: function () {
                            var modal = this.skeleton.parent.parent,
                                hsl = modal.value;

                            hsl[0] = this.values[0];

                            this.previousSibling.style.backgroundColor = 'hsl(' + hsl[0] + 'deg,' + hsl[1] + '%, ' + hsl[2] + '%)';
                            this.parentNode.previousSibling.style.backgroundColor = 'hsl(' + hsl[0] + 'deg, 100%, 50%)';
                        }
                    }
                }
            },
            actions: {
                component: 'section',
                variant: 'actions',

                reset: {
                    component: 'button',
                    text: 'reset',
                    on: {
                        click: function () {
                            var modal = this.skeleton.parent.parent,
                                component = modal.parent;

                            component.rgb = component.skeleton.value;

                            component.storageValue = component.rgb;
                            component.storageChange();

                            component.valueElement.style.backgroundColor = 'rgb(' + component.rgb.join(',') + ')';

                            modal.rendered.close();
                        }
                    }
                },
                cancel: {
                    component: 'button',
                    text: 'cancel',
                    on: {
                        click: function () {
                            this.skeleton.parent.parent.rendered.close();
                        }
                    }
                },
                ok: {
                    component: 'button',
                    text: 'OK',
                    on: {
                        click: function () {
                            var modal = this.skeleton.parent.parent,
                                component = modal.parent;

                            component.rgb = satus.color.hslToRgb(modal.value);

                            component.storageValue = component.rgb;
                            component.storageChange();

                            component.valueElement.style.backgroundColor = 'rgb(' + component.rgb.join(',') + ')';

                            modal.rendered.close();
                        }
                    }
                }
            }
        });
    });

    component.addEventListener('render', function () {
        component.rgb = this.storageValue || [0, 100, 50];

        component_value.style.backgroundColor = 'rgb(' + component.rgb.join(',') + ')';
    });

    return component;
};
/*--------------------------------------------------------------
>>> LIST
--------------------------------------------------------------*/

satus.components.list = function (skeleton) {
	var ul = document.createElement('ul');

	for (var i = 0, l = skeleton.items.length; i < l; i++) {
		var li = document.createElement('li'),
			item = skeleton.items[i];

		li.className = 'satus-list__item';

		for (var j = 0, k = item.length; j < k; j++) {
			var child = item[j];

			if (typeof child === 'string') {
				var span = document.createElement('span');

				span.textContent = satus.locale.get(child);

				li.appendChild(span);
			} else {
				satus.render(child, li);
			}
		}

		ul.appendChild(li);
	}

	return ul;
};
/*--------------------------------------------------------------
>>> MODAL
--------------------------------------------------------------*/

satus.components.modal = function (skeleton) {
	var component = document.createElement('div'),
		scrim = document.createElement('div'),
		surface = document.createElement('div');

	component.inner = surface;

	scrim.className = 'satus-modal__scrim';
	surface.className = 'satus-modal__surface';

	component.close = function () {
		var component = this,
			component_surface = this.children[1];

		this.classList.add('satus-modal--closing');

		setTimeout(function () {
			component.remove();

			component.dispatchEvent(new CustomEvent('close'));
		}, satus.getAnimationDuration(component_surface));
	};

	scrim.addEventListener('click', function () {
		this.parentNode.close();
	});

	component.appendChild(scrim);
	component.appendChild(surface);

	return component;
};