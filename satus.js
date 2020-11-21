
/*---------------------------------------------------------------
>>> TABLE OF CONTENTS:
-----------------------------------------------------------------
# Events
# Render
# Camelize
# Animation duration
---------------------------------------------------------------*/

var satus = {};


/*---------------------------------------------------------------
# EVENTS
---------------------------------------------------------------*/

satus.events = {};

satus.on = function(event, handler) {
    if (!this.isset(this.events[event])) {
        this.events[event] = [];
    }

    this.events[event].push(handler);
};


/*---------------------------------------------------------------
# COMPONENTS
---------------------------------------------------------------*/

satus.components = {};


/*---------------------------------------------------------------
# ISSET
---------------------------------------------------------------*/

satus.isset = function(variable) {
    if (typeof variable === 'undefined' || variable === null) {
        return false;
    }

    return true;
};


/*---------------------------------------------------------------
# CAMELIZE
---------------------------------------------------------------*/

satus.camelize = function(string) {
    return string.replace(/-[a-z]/g, function(match) {
        return match[1].toUpperCase();
    });
};


/*---------------------------------------------------------------
# ANIMATION DURATION
---------------------------------------------------------------*/

satus.getAnimationDuration = function(element) {
    return Number(window.getComputedStyle(element).getPropertyValue('animation-duration').replace(/[^0-9.]/g, '')) * 1000;
};
/*---------------------------------------------------------------
>>> BUTTON
---------------------------------------------------------------*/

satus.components.button = function(element) {
    var button = document.createElement('button'),
    	is_folder_type = false;

    if (satus.isset(element.label)) {
        var label = document.createElement('span');

        label.className = 'satus-button__label';
        label.innerText = satus.locale.getMessage(element.label);

        button.appendChild(label);
    }

    for (var key in element) {
    	if (element[key] && element[key].type && key !== 'onclick') {
    		is_folder_type = true;
    	}
    }

    if (is_folder_type === true) {
    	button.addEventListener('click', function() {
	        var parent = document.querySelector(button.skelet.parent) || document.querySelector('.satus-main');

	        if (!button.skelet.parent || !parent.classList.contains('satus-main')) {
	            while (!parent.classList.contains('satus-main')) {
	                parent = parent.parentNode;
	            }
	        }

	        parent.open(this.skelet, this.skelet.onopen);
	    });
    }

    return button;
};
/*---------------------------------------------------------------
>>> COLOR PICKER
-----------------------------------------------------------------
# Wheel
# Slider
---------------------------------------------------------------*/

satus.components.colorPicker = function(element) {
    var component = satus.render({
            type: 'button',
            label: element.label,
            onclick: {
                type: 'dialog',
                onrender: function() {
                    var component = document.createElement('div');

                    component.className = 'satus-color-picker';

                    component.data = satus.storage.get(element.storage_key) || {
                        color: [255, 255, 255, 1],
                        x: 128,
                        y: 128
                    };

                    component.update = function() {
                        var rgba = this.data.color;

                        this.slider.style.backgroundColor = 'rgb(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ')';
                    };


                    /*--------------------------------------------------
                    # WHEEL
                    --------------------------------------------------*/

                    var wheel = document.createElement('div'),
                        cvs = document.createElement('canvas'),
                        ctx = cvs.getContext('2d'),
                        cursor = document.createElement('div'),
                        shader = document.createElement('div');

                    component.canvas = cvs;
                    component.wheel_shader = shader;

                    wheel.className = 'satus-color-picker__wheel';
                    cursor.className = 'satus-color-picker__cursor';
                    shader.className = 'satus-color-picker__shader';

                    cvs.width = 256;
                    cvs.height = 256;

                    var rgb = [255, 0, 0];

                    for (var i = 0, j = 0; i < 360; i++) {
                        var gradient = ctx.createRadialGradient(
                                128,
                                128,
                                0,
                                128,
                                128,
                                128
                            ),
                            k = (j + 3 - 1) % 3;

                        if (rgb[j] < 255) {
                            rgb[j] = Math.min(rgb[j] + 4.322, 255);
                        } else if (rgb[k] > 0) {
                            rgb[k] = Math.max(rgb[k] - 4.322, 0);
                        } else if (rgb[j] >= 255) {
                            rgb[j] = 255;

                            j = (j + 1) % 3
                        }

                        gradient.addColorStop(0, '#fff');
                        gradient.addColorStop(
                            1,
                            'rgb(' +
                            rgb[0] + ',' +
                            rgb[1] + ',' +
                            rgb[2] +
                            ')'
                        );
                        ctx.fillStyle = gradient;
                        ctx.beginPath();
                        ctx.moveTo(128, 128);
                        ctx.arc(
                            128,
                            128,
                            128,
                            satus.math.degToRad(i),
                            satus.math.degToRad(360)
                        );
                        ctx.closePath();
                        ctx.fill();
                    }

                    cursor.style.left = component.data.x + 'px';
                    cursor.style.top = component.data.y + 'px';

                    cvs.cursor = cursor;
                    cvs.ctx = cvs.getContext('2d');
                    cvs.move = function(event) {
                        //console.log(event);

                        var component = this.parentNode.parentNode,
                            x = event.offsetX,
                            y = event.offsetY,
                            rgba = this.ctx.getImageData(x, y, 1, 1).data;

                        console.log(component, component.data);

                        this.cursor.style.left = x + 'px';
                        this.cursor.style.top = y + 'px';

                        component.data.x = x;
                        component.data.y = y;
                        component.data.color = [
                            rgba[0],
                            rgba[1],
                            rgba[2]
                        ];

                        component.update();
                    };

                    function start(event) {
                        var self = this;

                        function end() {
                            self.removeEventListener('mousemove', self.move);
                            window.removeEventListener('mouseup', end);
                            self.removeEventListener('touchmove', self.move);
                            window.removeEventListener('touchend', end);
                        }

                        this.addEventListener('mousemove', this.move);
                        window.addEventListener('mouseup', end);
                        this.addEventListener('touchmove', this.move);
                        window.addEventListener('touchend', end);

                        this.move(event);
                    }

                    cvs.addEventListener('mousedown', start);
                    cvs.addEventListener('touchstart', start);

                    wheel.appendChild(cvs);
                    wheel.appendChild(shader);
                    wheel.appendChild(cursor);
                    component.appendChild(wheel);


                    /*--------------------------------------------------
                    # SLIDER
                    --------------------------------------------------*/

                    var slider = document.createElement('div'),
                        thumb = document.createElement('div');

                    component.slider = slider;

                    slider.className = 'satus-color-picker__slider';
                    thumb.className = 'satus-color-picker__thumb';

                    slider.thumb = thumb;

                    function startSlider(event) {
                        var self = this;

                        event.preventDefault();

                        function move(event) {
                            event.preventDefault();

                            var x = event.clientX - self.getBoundingClientRect().left - 1,
                                maxWidth = self.offsetWidth - 2,
                                value = (x / (maxWidth / 100)) / 100;

                            if (x < 1) {
                                x = 1;
                            } else if (x > maxWidth) {
                                x = maxWidth;
                            }

                            self.parentNode.wheel_shader.style.opacity = value;

                            if (value > .5) {
                                self.parentNode.canvas.cursor.classList.add('invert');
                            } else {
                                self.parentNode.canvas.cursor.classList.remove('invert');
                            }

                            self.thumb.style.left = x + 'px';
                        }

                        function end() {
                            window.removeEventListener('mousemove', move);
                            window.removeEventListener('mouseup', end);
                            window.removeEventListener('touchmove', move);
                            window.removeEventListener('touchend', end);
                        }

                        window.addEventListener('mousemove', move);
                        window.addEventListener('mouseup', end);
                        window.addEventListener('touchmove', move);
                        window.addEventListener('touchend', end);

                        move(event);
                    }

                    slider.addEventListener('mousedown', startSlider);
                    slider.addEventListener('touchstart', startSlider);

                    slider.appendChild(thumb);
                    component.appendChild(slider);


                    /*--------------------------------------------------
                    # ACTIONS
                    --------------------------------------------------*/

                    var section = document.createElement('div'),
                        cancel = document.createElement('button'),
                        save = document.createElement('button');

                    section.className = 'satus-section satus-section--actions';
                    cancel.className = 'satus-button';
                    save.className = 'satus-button';

                    cancel.innerText = satus.locale.getMessage('cancel');
                    save.innerText = satus.locale.getMessage('save');

                    cancel.onclick = function() {
                        var component = this.parentNode.parentNode;

                        
                    };

                    save.onclick = function() {
                        var component = this.parentNode.parentNode;

                        satus.storage.set(component.storage_key, component.data);
                    };

                    section.appendChild(cancel);
                    section.appendChild(save);
                    component.appendChild(section);

                    component.update();

                    this.surface.querySelector('.satus-scrollbar__content').appendChild(component);
                }
            }
        }),
        value = document.createElement('span');

    component.data = satus.storage.get(element.storage_key) || {
        color: [255, 255, 255],
        x: 128,
        y: 128
    };

    component.className = 'satus-button ' + (element.variant ? 'satus-button--' + element.variant : '') + ' satus-button--color-picker';

    value.className = 'satus-button__value';
    value.style.background = 'rgb(' + component.data[0] + ',' + component.data[1] + ',' + component.data[2] + ')';

    component.appendChild(value);

    return component;
};
/*---------------------------------------------------------------
>>> DIALOG
---------------------------------------------------------------*/

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
            if (element.clickclose === false) {
                return false;
            }
            
            if (typeof element.onclickclose === 'function') {
                element.onclickclose();
            }
        
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

    component_scrim.addEventListener('click', function() {
        if (element.clickclose === false) {
            return false;
        }
        
        if (typeof element.onclickclose === 'function') {
            element.onclickclose();
        }
        
        close();
    });
    window.addEventListener('keydown', function(event) {
        keydown(event);
    });

    component.appendChild(component_scrim);
    component.appendChild(component_surface);
    
    component.close = close;
    component.scrim = component_scrim;
    component.surface = component_surface;

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
>>> DIV
---------------------------------------------------------------*/

satus.components.div = function(object) {
    var component = document.createElement('div');

	for (var key in object) {
		satus.render(object[key], component);
	}

    return component;
};

/*--------------------------------------------------------------
>>> HEADER
--------------------------------------------------------------*/

satus.components.header = function(object) {
    var component = document.createElement('header');

	for (var key in object) {
		satus.render(object[key], component);
	}

    return component;
};
/*---------------------------------------------------------------
>>> LIST
---------------------------------------------------------------*/

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
                                clone = satus.clone(self);

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

                            if (index !== current_index) {
                                var new_clone = self.cloneNode(true);

                                index = Math.max(Math.min(index, self.parentNode.children.length - 1), 0);

                                if (index > 0) {
                                    if (index > current_index) {
                                        self.parentNode.insertBefore(new_clone, self.parentNode.children[index].nextSibling);
                                    } else {
                                        self.parentNode.insertBefore(new_clone, self.parentNode.children[index]);
                                    }
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

                            if (typeof object.onend === 'function') {
                                object.onend();
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
/*---------------------------------------------------------------
>>> MAIN
---------------------------------------------------------------*/

satus.components.main = function(object) {
    var component = document.createElement('main');

    component.history = [object];

    function create(self, animation, callback) {
        var container = self.querySelector('.satus-main__container'),
            component_container = document.createElement('div'),
            component_scrollbar = satus.components.scrollbar(component_container),
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
            satus.render(object[key], object.scrollbar === false ? component : component_scrollbar);
        }

        if (object.scrollbar !== false) {
            self.appendChild(component_container);
        }

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
            }, satus.getAnimationDuration(container));
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
/*---------------------------------------------------------------
>>> RADIO GROUP
---------------------------------------------------------------*/

satus.components.radioGroup = function(element) {
    var element = Object.assign({}, element),
        component = document.createElement('div');

    for (var key in element.radios) {
        var item = element.radios[key];

        item.type = 'button';
        item.variant = 'radio';

        component.appendChild(satus.render(item));
    }

    return component;
};
/*-----------------------------------------------------------------------------
>>> SCROLL BAR
-----------------------------------------------------------------------------*/

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
        
        if (this.parentNode.parentNode.parentNode.skelet.onscroll) {
            this.parentNode.parentNode.parentNode.skelet.onscroll(event);
        }
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
/*---------------------------------------------------------------
>>> SECTION
---------------------------------------------------------------*/

satus.components.section = function(element) {
    var component = document.createElement('section');

	for (var key in element) {
		satus.render(element[key], component);
	}

    return component;
};

/*---------------------------------------------------------------
>>> SELECT
---------------------------------------------------------------*/

satus.components.select = function(element) {
    var skelet = {
            type: 'button',
            label: element.label,
            onclick: {
                type: 'dialog'
            }
        },
        value = document.createElement('span');

    value.className = 'satus-button__value';

    for (var key in element.options) {
        skelet.onclick[key] = element.options[key];

        skelet.onclick[key].type = 'button';
        skelet.onclick[key].variant = 'list-item';
        skelet.onclick[key].parentValue = value;
        skelet.onclick[key].dataset = {
            key: element.options[key].label,
            value: element.options[key].value
        };
        skelet.onclick[key].onclick = function() {
            this.parentValue.parentNode.querySelector('.satus-button__value').innerText = satus.locale.getMessage(this.dataset.key);

            satus.storage.set(component.dataset.storageKey, this.dataset.value);

            if (typeof element.onchange === 'function') {
                element.onchange(this.dataset.key, this.dataset.value);
            }

            var parent = this.parentNode;

            while (!parent.classList.contains('satus-dialog')) {
                parent = parent.parentNode;
            }

            parent.querySelector('.satus-dialog__scrim').click();
        };
    }

    var component = satus.render(skelet);

    component.className = 'satus-button ' + (element.variant ? 'satus-button--' + element.variant : '') + ' satus-button--select';

    if (element.storage_key) {
        var storage_value = satus.storage.get(element.storage_key);

        component.dataset.storageKey = element.storage_key;

        for (var i = 0, l = element.options.length; i < l; i++) {
            if (storage_value === element.options[i].value) {
                storage_value = element.options[i].label;
            }
        }

        value.innerText = satus.locale.getMessage(storage_value || element.options[0].label);
    }

    component.appendChild(value);

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
        value = JSON.parse(satus.storage.get(object.storage_key));
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
            button_reset = document.createElement('button'),
            button_cancel = document.createElement('button'),
            button_save = document.createElement('button');

        component_dialog.className = 'satus-dialog satus-dialog_open';
        component_scrim.className = 'satus-dialog__scrim';
        component_surface.className = 'satus-dialog__surface satus-dialog__surface_shortcut';
        component_canvas.className = 'satus-shortcut__canvas';
        component_section.className = 'satus-section satus-section--actions';
        button_reset.className = 'satus-button';
        button_cancel.className = 'satus-button';
        button_save.className = 'satus-button';

        button_reset.innerText = satus.locale.getMessage('reset');
        button_cancel.innerText = satus.locale.getMessage('cancel');
        button_save.innerText = satus.locale.getMessage('save');

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
        
        button_reset.addEventListener('click', function() {
            satus.storage.set(object.storage_key, null);
            value = (satus.storage.get(object.storage_key) ? JSON.parse(satus.storage.get(object.storage_key)) : false) || object.value || {};
            component_value.innerHTML = renderValue();
            close();
        });
        
        button_cancel.addEventListener('click', function() {
            value = (satus.storage.get(object.storage_key) ? JSON.parse(satus.storage.get(object.storage_key)) : false) || object.value || {};
            close();
        });
        
        button_save.addEventListener('click', function() {
            if (document.querySelector('.satus-shortcut__custom > *')) {
                var items = document.querySelectorAll('.satus-shortcut__custom > *');
                
                for (var i = 0, l = items.length; i < l; i++) {
                    value[items[i].storage_key] = items[i].value;
                }
            }
            
            satus.storage.set(object.storage_key, JSON.stringify(value));
            
            if (typeof object.onchange === 'function') {
                object.onchange(object, value);
            }
            
            close();
        });

        component_section.appendChild(button_reset);
        component_section.appendChild(button_cancel);
        component_section.appendChild(button_save);

        component_surface.appendChild(component_canvas);
        
        if (object.custom_data) {
            var custom = document.createElement('section');
            
            custom.className = 'satus-shortcut__custom';
            
            satus.render(object.custom_data, custom);
            
            component_surface.appendChild(custom);
        }
        
        component_surface.appendChild(component_section);

        component_dialog.appendChild(component_scrim);
        component_dialog.appendChild(component_surface);

        document.body.appendChild(component_dialog);
    });
    
    return component;
};

/*---------------------------------------------------------------
>>> SLIDER
---------------------------------------------------------------*/

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
/*---------------------------------------------------------------
>>> SWITCH
---------------------------------------------------------------*/

satus.components.switch = function(element) {
    var component = document.createElement('div');

    // LABEL
    if (satus.isset(element.label)) {
        var label = document.createElement('span');

        label.className = 'satus-switch__label';
        label.innerText = satus.locale.getMessage(element.label);

        component.appendChild(label);
    }


    // INPUT
    var component_input = document.createElement('input');

    component_input.type = 'checkbox';
    component_input.className = 'satus-switch__input';

    if (element.storage_key && element.storage !== false) {
        component.value = satus.storage.get(element.storage_key);

        component_input.dataset.storageKey = element.storage_key;
    }

    if (!satus.isset(component.value)) {
        component.value = element.value;
    }

    if (component.value && element.storage !== false) {
        component_input.checked = component.value;
    }

    component_input.addEventListener('change', function() {
        component.value = this.checked;
        
        if (element.storage !== false) {
            satus.storage.set(this.dataset.storageKey, this.checked);
        }
    });

    component.appendChild(component_input);


    // TRACK
    var component_value = document.createElement('div'),
        component_track = document.createElement('div');

    component_value.className = 'satus-switch__value';
    component_track.className = 'satus-switch__track';

    component_value.appendChild(component_track);
    component.appendChild(component_value);


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
        var pages = item.pages,
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
        column.addEventListener('click', function() {
            if (typeof item.beforeUpdate === 'function') {
                item.beforeUpdate(item);
            }
        });
        column.innerHTML = '<span>' + satus.locale.getMessage(item.columns[i].title) + '</span>';

        component_head.appendChild(column);
    }

    component_scrollbar.appendChild(table);

    component.appendChild(component_head);
    component.appendChild(component_body);

    component.data = item.data;
    component.paging = item.paging;
    component.pages = item.pages;
    component.pagingIndex = 1;

    component.update = function(data, update_pages) {
        if (satus.isset(data)) {
            this.data = data;
        }
        
        if (update_pages !== false) {
            item.pages = Math.ceil(this.data.length / this.paging);
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
            if (typeof item.beforeUpdate === 'function') {
                item.beforeUpdate(item);
            }
            
            this.parentComponent.pagingIndex = Number(this.innerText);
            this.parentComponent.update(this.parentComponent.data);
            this.parentComponent.pagingUpdate();
        });

        c.appendChild(button);
    }

    function pagingUpdate() {
        if (typeof this.paging === 'number') {
            var pages = item.pages,
                c = this.querySelector('.satus-table__paging');

            c.innerHTML = '';
            
            if (pages > 1) {
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
        }
        
        resize();
    }

    component.pagingUpdate = pagingUpdate;

    component_paging = document.createElement('div');

    component_paging.className = 'satus-table__paging';

    component_scrollbar.appendChild(component_paging);

    // END PAGING
    
    if (item.data) {
        component.update(item.data, false);
    }
    
    return component;
};

/*---------------------------------------------------------------
>>> TABS
---------------------------------------------------------------*/

satus.components.tabs = function(object) {
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
>>> TEXT
---------------------------------------------------------------*/

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
/*---------------------------------------------------------------
>>> TEXT FIELD
---------------------------------------------------------------*/

satus.components.textField = function(element) {
    if (element.rows > 1) {
        var component = document.createElement('textarea');
    } else {
        var component = document.createElement('input');
        
        component.type = 'text';
    }

    return component;
};

/*---------------------------------------------------------------
>>> AES-CTR
-----------------------------------------------------------------
# Encryption
# Decryption
---------------------------------------------------------------*/

satus.aes = {};

/*---------------------------------------------------------------
# ENCRYPTION
---------------------------------------------------------------*/

satus.aes.encrypt = async function(text, password) {
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


/*---------------------------------------------------------------
# DECRYPTION
---------------------------------------------------------------*/

satus.aes.decrypt = async function(text, password) {
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
                false,
                ['decrypt']
            ),
            new Uint8Array(atob(text.slice(24)).match(/[\s\S]/g).map(ch => ch.charCodeAt(0)))
        ));
    } catch (err) {
        return false;
    }

    return data;
};
/*---------------------------------------------------------------
# CLONE
---------------------------------------------------------------*/

satus.clone = function(target) {
	var node = target.cloneNode(true);

	function update(node, target) {
		node.style.cssText = window.getComputedStyle(target, '').cssText;

	    for (var i = 0, l = target.children.length; i < l; i++) {
	        update(node.children[i], target.children[i]);
	    }
	}

	update(node, target);

    return node;
};
/*---------------------------------------------------------------
>>> COLOR
-----------------------------------------------------------------
# Keywords
# Convert RGB to HEX
# Convert RGB to HSL
# Convert HEX to RGB
# Convert HEX to HSL
# Convert HSL to RGB
# Convert HSL to HEX
---------------------------------------------------------------*/

satus.color = {};


/*---------------------------------------------------------------
# KEYWORDS
---------------------------------------------------------------*/

satus.color.keywords = {
    aliceblue: 0xF0F8FF,
    antiquewhite: 0xFAEBD7,
    aqua: 0x00FFFF,
    aquamarine: 0x7FFFD4,
    azure: 0xF0FFFF,
    beige: 0xF5F5DC,
    bisque: 0xFFE4C4,
    black: 0x000000,
    blanchedalmond: 0xFFEBCD,
    blue: 0x0000FF,
    blueviolet: 0x8A2BE2,
    brown: 0xA52A2A,
    burlywood: 0xDEB887,
    cadetblue: 0x5F9EA0,
    chartreuse: 0x7FFF00,
    chocolate: 0xD2691E,
    coral: 0xFF7F50,
    cornflowerblue: 0x6495ED,
    cornsilk: 0xFFF8DC,
    crimson: 0xDC143C,
    cyan: 0x00FFFF,
    darkblue: 0x00008B,
    darkcyan: 0x008B8B,
    darkgoldenrod: 0xB8860B,
    darkgray: 0xA9A9A9,
    darkgreen: 0x006400,
    darkgrey: 0xA9A9A9,
    darkkhaki: 0xBDB76B,
    darkmagenta: 0x8B008B,
    darkolivegreen: 0x556B2F,
    darkorange: 0xFF8C00,
    darkorchid: 0x9932CC,
    darkred: 0x8B0000,
    darksalmon: 0xE9967A,
    darkseagreen: 0x8FBC8F,
    darkslateblue: 0x483D8B,
    darkslategray: 0x2F4F4F,
    darkslategrey: 0x2F4F4F,
    darkturquoise: 0x00CED1,
    darkviolet: 0x9400D3,
    deeppink: 0xFF1493,
    deepskyblue: 0x00BFFF,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1E90FF,
    firebrick: 0xB22222,
    floralwhite: 0xFFFAF0,
    forestgreen: 0x228B22,
    fuchsia: 0xFF00FF,
    gainsboro: 0xDCDCDC,
    ghostwhite: 0xF8F8FF,
    gold: 0xFFD700,
    goldenrod: 0xDAA520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xADFF2F,
    grey: 0x808080,
    honeydew: 0xF0FFF0,
    hotpink: 0xFF69B4,
    indianred: 0xCD5C5C,
    indigo: 0x4B0082,
    ivory: 0xFFFFF0,
    khaki: 0xF0E68C,
    lavender: 0xE6E6FA,
    lavenderblush: 0xFFF0F5,
    lawngreen: 0x7CFC00,
    lemonchiffon: 0xFFFACD,
    lightblue: 0xADD8E6,
    lightcoral: 0xF08080,
    lightcyan: 0xE0FFFF,
    lightgoldenrodyellow: 0xFAFAD2,
    lightgray: 0xD3D3D3,
    lightgreen: 0x90EE90,
    lightgrey: 0xD3D3D3,
    lightpink: 0xFFB6C1,
    lightsalmon: 0xFFA07A,
    lightseagreen: 0x20B2AA,
    lightskyblue: 0x87CEFA,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xB0C4DE,
    lightyellow: 0xFFFFE0,
    lime: 0x00FF00,
    limegreen: 0x32CD32,
    linen: 0xFAF0E6,
    magenta: 0xFF00FF,
    maroon: 0x800000,
    mediumaquamarine: 0x66CDAA,
    mediumblue: 0x0000CD,
    mediumorchid: 0xBA55D3,
    mediumpurple: 0x9370DB,
    mediumseagreen: 0x3CB371,
    mediumslateblue: 0x7B68EE,
    mediumspringgreen: 0x00FA9A,
    mediumturquoise: 0x48D1CC,
    mediumvioletred: 0xC71585,
    midnightblue: 0x191970,
    mintcream: 0xF5FFFA,
    mistyrose: 0xFFE4E1,
    moccasin: 0xFFE4B5,
    navajowhite: 0xFFDEAD,
    navy: 0x000080,
    oldlace: 0xFDF5E6,
    olive: 0x808000,
    olivedrab: 0x6B8E23,
    orange: 0xFFA500,
    orangered: 0xFF4500,
    orchid: 0xDA70D6,
    palegoldenrod: 0xEEE8AA,
    palegreen: 0x98FB98,
    paleturquoise: 0xAFEEEE,
    palevioletred: 0xDB7093,
    papayawhip: 0xFFEFD5,
    peachpuff: 0xFFDAB9,
    peru: 0xCD853F,
    pink: 0xFFC0CB,
    plum: 0xDDA0DD,
    powderblue: 0xB0E0E6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xFF0000,
    rosybrown: 0xBC8F8F,
    royalblue: 0x4169E1,
    saddlebrown: 0x8B4513,
    salmon: 0xFA8072,
    sandybrown: 0xF4A460,
    seagreen: 0x2E8B57,
    seashell: 0xFFF5EE,
    sienna: 0xA0522D,
    silver: 0xC0C0C0,
    skyblue: 0x87CEEB,
    slateblue: 0x6A5ACD,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xFFFAFA,
    springgreen: 0x00FF7F,
    steelblue: 0x4682B4,
    tan: 0xD2B48C,
    teal: 0x008080,
    thistle: 0xD8BFD8,
    tomato: 0xFF6347,
    turquoise: 0x40E0D0,
    violet: 0xEE82EE,
    wheat: 0xF5DEB3,
    white: 0xFFFFFF,
    whitesmoke: 0xF5F5F5,
    yellow: 0xFFFF00,
    yellowgreen: 0x9ACD32
};


/*---------------------------------------------------------------
# CONVERT RGB TO HEX
---------------------------------------------------------------*/

/*satus.color.rgb = function(value) {
    if (typeof value === 'number') {
        return [
            value >> 16 & 255,
            value >> 8 & 255,
            value & 255
        ];
    } else if (typeof value === 'string') {
        var match = /^((?:rgb|#|hsl)a?)\(?\s*([^\)]*)\)?/.exec(value),
            name = match[1],
            components = match[2];

        if (name === '#') {
            if (components.length <= 4) {
                return [
                    parseInt(components.charAt(0) + components.charAt(0), 16),
                    parseInt(components.charAt(1) + components.charAt(1), 16),
                    parseInt(components.charAt(2) + components.charAt(2), 16)
                ];
            } else if (components.length <= 7) {

            }

            return [name, components];
        } else if (name === 'hsl' || name === 'hsla') {
            return [name, components];
        }
    }
};*/

satus.color.rgbToHex = function (value) {
	if (true) {

	}
};
/*---------------------------------------------------------------
>>> LOCALE
-----------------------------------------------------------------
# Get message
# Import locale
---------------------------------------------------------------*/

satus.locale = {
    messages: {}
};


/*---------------------------------------------------------------
# GET MESSAGE
---------------------------------------------------------------*/

satus.locale.getMessage = function(string) {
    return this.messages[string] || string;
};

satus.locale.get = satus.locale.getMessage;


/*---------------------------------------------------------------
# IMPORT LOCALE
---------------------------------------------------------------*/

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
/*---------------------------------------------------------------
>>> MATH
-----------------------------------------------------------------
# Converts degrees to radians
# Converts radians to degrees
# Random float
# Random integer
---------------------------------------------------------------*/

satus.math = {
    deg: Math.PI / 180,
    rad: 180 / Math.PI
};


/*---------------------------------------------------------------
# CONVERTS DEGREES TO RADIANS
---------------------------------------------------------------*/

satus.math.degToRad = function(deg) {
    return deg * this.deg;
};


/*---------------------------------------------------------------
# CONVERTS RADIANS TO DEGREES
---------------------------------------------------------------*/

satus.math.radToDeg = function(rad) {
    return rad * this.rad;
};


/*---------------------------------------------------------------
# RANDOM FLOAT
---------------------------------------------------------------*/

satus.math.randFloat = function(min, max) {
    return low + Math.random() * (high - low);
};


/*---------------------------------------------------------------
# RANDOM INTEGER
---------------------------------------------------------------*/

satus.math.randInt = function(min, max) {
    return low + Math.floor(Math.random() * (high - low + 1));
};
/*---------------------------------------------------------------
>>> RENDER
---------------------------------------------------------------*/

satus.render = function(element, container, callback) {
    if (typeof container === 'function') {
        var callback = container;

        container = undefined;
    }

    function convert(object) {
        if (object && object.type) {
            var type = satus.camelize(object.type),
                component = satus.components[type](object),
                excluded_properties = ['type', 'label', 'class', 'title', 'storage', 'onclick'];

            function applyProperties(object, target) {
                for (var key in object) {
                    if (
                        satus.isset(object[key]) &&
                        typeof object[key] === 'object' &&
                        !object[key].type &&
                        !object.nodeName
                    ) {
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

            if (satus.isset(component.skelet) === false) {
                component.skelet = object;
            }

            if (component.className === '') {
                component.classList.add('satus-' + object.type);
            }

            if (object.class) {
                var class_list = object.class.split(' ');

                for (var i = 0, l = class_list.length; i < l; i++) {
                    component.classList.add(class_list[i]);
                }
            }

            if (object.variant) {
                component.classList.add('satus-' + type + '--' + object.variant);
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

            //(container || document.body).appendChild(component);

            if (satus.isset(container) === true) {
                container.appendChild(component)
            }

            if (typeof object.onclick === 'object') {
                component.addEventListener('click', function() {
                    satus.render(this.skelet.onclick, document.body);
                });
            } else if (typeof object.onclick === 'function') {
                component.onclick = object.onclick;
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

            return component;
        }
    }

    if (element.type) {
        return convert(element);
    } else {
        for (var key in element) {
            convert(element[key]);
        }
    }
};
/*-----------------------------------------------------------------------------
>>> «SEARCH» MODULE
-----------------------------------------------------------------------------*/

satus.search = function(query, object, callback, categories) {
    var threads = 0,
        button = '',
        results = {};

    function parse(items) {
        threads++;

        for (var key in items) {
            var item = items[key];
            
            if (categories === true && item.type === 'button' && button !== item.label) {
                button = item.label;
            }

            if (['switch', 'select', 'slider'].indexOf(item.type) !== -1 && key.indexOf(query) !== -1) {
                if (categories === true) {
                    if (!results[button]) {
                        results[button] = {};
                    }
                    
                    results[button][key] = item;
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
>>> STORAGE KEYS
--------------------------------------------------------------*/

satus.updateStorageKeys = function(object, callback) {
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
            if (callback) {
                callback();
            }
        }
    }

    parse(object);
};
/*---------------------------------------------------------------
>>> CHROMIUM STORAGE
-----------------------------------------------------------------
# Get
# Set
# Import
# Clear
# On changed
---------------------------------------------------------------*/

satus.storage = {
    data: {}
};


/*---------------------------------------------------------------
# GET
---------------------------------------------------------------*/

satus.storage.get = function(name) {
    if (satus.isset(name)) {
        var target = satus.storage.data;

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
    }
};


/*---------------------------------------------------------------
# SET
---------------------------------------------------------------*/

satus.storage.set = function(name, value) {
    var items = {},
        target = satus.storage.data;
        
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
# IMPORT
---------------------------------------------------------------*/

satus.storage.import = function(name, callback) {
    if (typeof name === 'function') {
        chrome.storage.local.get(function(items) {
            satus.storage.data = items;

            if (name) {
                name(items);
            }
        });
    } else {
        chrome.storage.local.get(name, function(items) {
            for (var key in items) {
                satus.storage.data[key] = items[key];
            }

            if (callback) {
                callback(items[name]);
            }
        });
    }
};


/*---------------------------------------------------------------
# CLEAR
---------------------------------------------------------------*/

satus.storage.clear = function() {
    chrome.storage.local.clear();

    delete satus.storage.data;
};


/*------------------------------------------------------
# ON CHANGED
------------------------------------------------------*/

satus.storage.onChanged = function(callback) {
    chrome.storage.onChanged.addListener(callback);
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

satus.user = function() {
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