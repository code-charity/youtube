
/*--------------------------------------------------------------
>>> TABLE OF CONTENTS:
----------------------------------------------------------------
# Storage
# Components
# Render
# Camelize
# Animation duration
--------------------------------------------------------------*/

var Satus = {};


/*--------------------------------------------------------------
# STORAGE
--------------------------------------------------------------*/

Satus.storage = {};


/*--------------------------------------------------------------
# STORAGE [GET]
--------------------------------------------------------------*/

Satus.storage.get = function(name) {
    return Satus.storage[name];
};


/*--------------------------------------------------------------
# STORAGE [SET]
--------------------------------------------------------------*/

Satus.storage.set = function(name, value) {};


/*--------------------------------------------------------------
# STORAGE [IMPORT]
--------------------------------------------------------------*/

Satus.storage.import = function(callback) {};


/*--------------------------------------------------------------
# STORAGE [CLEAR]
--------------------------------------------------------------*/

Satus.storage.clear = function(callback) {};


/*--------------------------------------------------------------
# LOCALE
--------------------------------------------------------------*/

Satus.locale = {
    messages: {}
};


/*--------------------------------------------------------------
# IMPORT LOCALE
--------------------------------------------------------------*/

Satus.locale.import = function(src, callback) {
    var xhr = new XMLHttpRequest();

    xhr.onload = function() {
        var object = JSON.parse(this.responseText);

        for (var key in object) {
            Satus.locale.messages[key] = object[key].message;
        }

        callback();
    };

    xhr.open('GET', src, true);
    xhr.send();
};


/*--------------------------------------------------------------
# GET MESSAGE
--------------------------------------------------------------*/

Satus.locale.getMessage = function(string) {
    return this.messages[string] || string;
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
# RENDER
--------------------------------------------------------------*/

Satus.render = function(element, container, callback) {
    function convert(object) {
        if (object && object.type) {
            var type = Satus.camelize(object.type),
                component = Satus.components[type](object),
                className = 'satus-' + object.type,
                excluded_properties = ['type', 'label', 'class', 'title', 'storage'];

            function applyProperties(object, target) {
                for (var key in object) {
                    if (typeof object[key] === 'object' && !object[key].type) {
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

            if (object.class) {
                className += ' ' + object.class;
            }

            if (object.before) {
                var component_before = document.createElement('span');

                component_before.innerHTML = object.before;

                for (var i = component_before.children.length - 1; i > -1; i--) {
                    component.insertBefore(component_before.children[i], component.firstChild);
                }
            }

            component.className = className;

            (container || document.body).appendChild(component);

            if (typeof component.onClickRender === 'object') {
                component.addEventListener('click', function() {
                    Satus.render(component.onClickRender);
                });
            }

            if (typeof component.onrender === 'function') {
                component.onrender();
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
>>> CHROMIUM STORAGE
----------------------------------------------------------------
1.0 Get
2.0 Set
3.0 Import
4.0 Clear
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

Satus.storage.get = function(name) {
    return Satus.storage[name];
};


/*--------------------------------------------------------------
# SET
--------------------------------------------------------------*/

Satus.storage.set = function(name, value) {
    var items = {};

    Satus.storage[name] = value;

    for (var key in Satus.storage) {
        if (typeof items[key] !== 'function') {
            items[key] = Satus.storage[key];
        }
    }

    chrome.storage.local.set(items);
};


/*--------------------------------------------------------------
# IMPORT
--------------------------------------------------------------*/

Satus.storage.import = function(callback) {
    chrome.storage.local.get(function(items) {
        for (var key in items) {
            Satus.storage[key] = items[key];
        }

        if (callback) {
            callback();
        }
    });
};


/*--------------------------------------------------------------
# CLEAR
--------------------------------------------------------------*/

Satus.storage.clear = function() {
    chrome.storage.local.clear();

    for (var key in Satus.storage) {
        if (typeof Satus.storage[key] !== 'function') {
            delete Satus.storage[key];
        }
    }
};
/*-----------------------------------------------------------------------------
>>> «SEARCH» MODULE
-----------------------------------------------------------------------------*/

Satus.search = function(query, object, callback) {
    var threads = 0,
        results = {};

    function parse(items) {
        threads++;

        for (var key in items) {
            var item = items[key];


            if (['switch', 'select', 'slider'].indexOf(item.type) !== -1 && key.indexOf(query) !== -1) {
                results[key] = item;
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
/*--------------------------------------------------------------
>>> BUTTON
--------------------------------------------------------------*/

Satus.components.button = function(element) {
    var component = document.createElement('button');

    if (Satus.isset(element.icon)) {
        var component_icon = document.createElement('span');

        component_icon.className = 'satus-button__icon';
        component_icon.innerHTML = element.icon;

        component.appendChild(component_icon);
    }

    if (Satus.isset(element.label)) {
        var component_label = document.createElement('span');

        component_label.className = 'satus-button__label';
        component_label.innerText = Satus.locale.getMessage(element.label);

        component.appendChild(component_label);
    }

    return component;
};
/*--------------------------------------------------------------
>>> DIALOG
--------------------------------------------------------------*/

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
>>> FOLDER
--------------------------------------------------------------*/

Satus.components.folder = function(object) {
    var component = document.createElement('button');

    component.object = object;

    component.addEventListener('click', function() {
        var parent = document.querySelector(component.object.parent) || document.querySelector('.satus-main');

        if (!component.object.parent || !parent.classList.contains('satus-main')) {
            while (!parent.classList.contains('satus-main')) {
                parent = parent.parentNode;
            }
        }

        parent.open(this.object, object.onopen);
    });

    if (Satus.isset(object.label)) {
        var component_label = document.createElement('span');

        component_label.className = 'satus-folder__label';
        component_label.innerText = Satus.locale.getMessage(object.label);

        component.appendChild(component_label);
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
>>> MAIN
--------------------------------------------------------------*/

Satus.components.main = function(object) {
    var component = document.createElement('main'),
        component_container = document.createElement('div'),
        component_scrollbar = Satus.components.scrollbar(component_container);

    component.history = [object];

    component.back = function() {
        var container = this.querySelector('.satus-main__container'),
            component_container = document.createElement('div'),
            component_scrollbar = Satus.components.scrollbar(component_container);

        container.classList.add('satus-main__container--fade-out-right');
        component_container.className = 'satus-main__container satus-main__container--fade-in-left';

        this.history.pop();

        for (var key in this.history[this.history.length - 1]) {
            Satus.render(this.history[this.history.length - 1][key], component_scrollbar);
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
        }, Satus.getAnimationDuration(container));
    };

    component.open = function(element, callback) {
        var container = this.querySelector('.satus-main__container'),
            component_container = document.createElement('div'),
            component_scrollbar = Satus.components.scrollbar(component_container);

        container.classList.add('satus-main__container--fade-out-left');
        component_container.className = 'satus-main__container satus-main__container--fade-in-right';

        this.history.push(element);

        for (var key in this.history[this.history.length - 1]) {
            Satus.render(this.history[this.history.length - 1][key], component_scrollbar);
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
        }, Satus.getAnimationDuration(container));
    };

    component_container.className = 'satus-main__container';

    if (object.on && object.on.change) {
        component.historyListener = object.on.change;
    }

    if (component.historyListener) {
        component.historyListener(component_container);
    }

    for (var key in object) {
        Satus.render(object[key], component_scrollbar);
    }

    component.appendChild(component_container);

    return component;
};
/*--------------------------------------------------------------
>>> SCROLL BAR
--------------------------------------------------------------*/

Satus.components.scrollbar = function(parent) {
    var component = document.createElement('div'),
        component_wrapper = document.createElement('div'),
        component_content = document.createElement('div'),
        component_thumb = document.createElement('div');

    component.className = 'satus-scrollbar';
    component_wrapper.className = 'satus-scrollbar__wrapper';
    component_content.className = 'satus-scrollbar__content';
    component_thumb.className = 'satus-scrollbar__thumb';

    parent.addEventListener('resize', function(event) {
        component_content.style.width = component.offsetWidth + 'px';
    });

    component.interval = false;

    function active() {
        if (component.interval) {
            clearTimeout(component.interval);

            component.interval = false;
        }

        component.classList.add('active');

        component.interval = setTimeout(function() {
            component.classList.remove('active');

            component.interval = false;
        }, 1000);
    }

    component.addEventListener('mousemove', active);

    component_wrapper.addEventListener('scroll', function(event) {
        active();

        component_thumb.style.top = Math.floor(component_wrapper.scrollTop * (component_wrapper.offsetHeight - component_thumb.offsetHeight) / (component_wrapper.scrollHeight - component_wrapper.offsetHeight)) + 'px';
    });

    new MutationObserver(function() {
        component_content.style.width = component.offsetWidth + 'px';

        if (component_wrapper.scrollHeight > component_wrapper.offsetHeight) {
            component_thumb.style.height = component_wrapper.offsetHeight / component_wrapper.scrollHeight * component_wrapper.offsetHeight + 'px';
        }
    }).observe(component_content, {
        subtree: true,
        childList: true
    });

    component_thumb.addEventListener('mousedown', function(event) {
        var offsetY = event.layerY;

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
>>> SECTION
--------------------------------------------------------------*/

Satus.components.section = function(element) {
    var component = document.createElement('section');

	for (var key in element) {
		Satus.render(element[key], component);
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
                class: 'satus-dialog--select-component',

                section: {
                    type: 'section',
                    style: {
                        width: position.width + 'px'
                    }
                }
            };

        for (var key in element.options) {
            dialog.section[key] = element.options[key];

            dialog.section[key].type = 'button';
            dialog.section[key].dataset = {};
            dialog.section[key].dataset.key = element.options[key].label;
            dialog.section[key].dataset.value = element.options[key].value;
            dialog.section[key].onclick = function() {
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
/*------------------------------------------------------------------------------
>>> SHORTCUT
------------------------------------------------------------------------------*/

Satus.components.shortcut = function(element) {
    var self = this,
        value = (Satus.storage.get(element.storage_key) ? JSON.parse(Satus.storage.get(element.storage_key)) : false) || element.value || {},
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
            let key = value.key.toUpperCase();

            text_value.push(key);
            keys_value.push('<div class=satus-shortcut__key>' + key + '</div>');
        }

        if (value.wheel) {
            keys_value.push('<div class="satus-shortcut__mouse ' + (value.wheel > 0) + '"><div></div></div>');
        }

        component_value.innerText = text_value.join('+');

        if (canvas) {
            if (keys_value.length > 0) {
                canvas.innerHTML = keys_value.join('<div class=satus-shortcut__plus></div>');
            } else {
                canvas.innerText = Satus.locale.getMessage('pressAnyKeyOrUseMouseWheel');
            }
        }
    }

    update();

    component_value.dataset.value = component_value.innerText;

    component_label.innerText = Satus.locale.getMessage(element.label);

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
        component_button_reset.innerText = Satus.locale.getMessage('reset');
        component_button_cancel.innerText = Satus.locale.getMessage('cancel');
        component_button_save.innerText = Satus.locale.getMessage('save');

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
            Satus.storage.set(element.storage_key, null);
            close();
            value = (Satus.storage.get(element.storage_key) ? JSON.parse(Satus.storage.get(element.storage_key)) : false) || object.value || {};
            update();
        });
        component_button_cancel.addEventListener('click', close);
        component_button_save.addEventListener('click', function() {
            Satus.storage.set(element.storage_key, JSON.stringify(value));
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

        if (component.onchange) {
            component.onchange(Number(this.value));
        }
    };

    component.change = function(value) {
        component_range.value = value;

        component_range.oninput();
    };

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
        } else {
            component_range.value = 0;
        }
    }


    // FOCUS RING
    var component_ring = document.createElement('div');

    component_ring.className = 'satus-slider__ring';

    component_track.appendChild(component_ring);


    // THUMB
    var component_thumb = document.createElement('div');

    component_thumb.className = 'satus-slider__thumb';

    component_track.appendChild(component_thumb);


    return component;
};
/*--------------------------------------------------------------
>>> SWITCH
--------------------------------------------------------------*/

Satus.components.switch = function(element) {
    var component = document.createElement('div');

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
        var value = Satus.storage.get(element.storage_key);

        if (!Satus.isset(value)) {
            value = element.value;
        }

        component_input.dataset.storageKey = element.storage_key;

        if (value) {
            component_input.checked = value;
        }
    }

    component_input.addEventListener('change', function() {
        Satus.storage.set(this.dataset.storageKey, this.checked);

        if (typeof component.onchange === 'function') {
            component.onchange();
        }
    });

    component.appendChild(component_input);


    // TRACK
    var component_track = document.createElement('div');

    component_track.className = 'satus-switch__track';

    component.appendChild(component_track);


    // MOUSE MOVE
    component.addEventListener('mousedown', function(event) {
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
    component.addEventListener('touchstart', function(event) {
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
>>> TEXT
--------------------------------------------------------------*/

Satus.components.text = function(element) {
    var component = document.createElement('span'),
        component_label = document.createElement('span');

    if (Satus.isset(element.label)) {
        var component_label = document.createElement('span');

        component_label.className = 'satus-switch__label';
        component_label.innerText = Satus.locale.getMessage(element.label);

        component.appendChild(component_label);
    }

    return component;
};
/*--------------------------------------------------------------
>>> TEXT FIELD
--------------------------------------------------------------*/

Satus.components.textField = function(element) {
    var component = document.createElement('input');

    component.type = 'text';

    return component;
};