'use strict';

/*------------------------------------------------------------------------------
>>> "SLIDER" COMPONENT:
------------------------------------------------------------------------------*/

Satus.components.slider = function(object, key) {
    var component = document.createElement('div'),
        component_label = document.createElement('span'),
        component_track_container = document.createElement('div'),
        component_track = document.createElement('div'),
        component_thumb = document.createElement('div'),
        min = object.min || 0,
        max = object.max || 1,
        step = object.step || 1,
        value = Satus.storage.get((object.storage || '') + '/' + key) || object.value || 0;

    if (Satus.storage.get((object.storage || '') + '/' + key) === 0) {
        value = 0;
    }

    component_label.classList.add('label');
    component_track_container.classList.add('track-container');
    component_track.classList.add('track');
    component_thumb.classList.add('thumb');

    component_label.innerText = Satus.memory.get('locale/' + object.label) || object.label || Satus.memory.get('locale/' + key) || key;

    component.dataset.value = value;
    component_thumb.dataset.value = value;
    component_thumb.style.left = value * 100 / (max - min) + '%';
    component_track.style.width = value * 100 / (max - min) + '%';

    component_track_container.appendChild(component_track);
    component_track_container.appendChild(component_thumb);
    component.appendChild(component_label);
    component.appendChild(component_track_container);

    component.change = function(value) {
        value = Number(value);

        this.dataset.value = value;
        component_thumb.dataset.value = value;
        this.querySelector('.thumb').style.left = value * 100 / (max - min) + '%';
        this.querySelector('.track').style.width = value * 100 / (max - min) + '%';
        Satus.storage.set((object.storage || '') + '/' + key, value);
        if (object.onchange) {
            object.onchange(value);
        }

        if (component.querySelector('.satus-textarea')) {
            component.querySelector('.satus-textarea').value = value;
        }
    }

    component.addEventListener('mousedown', function(event) {
        if (event.button == 0 && event.target.nodeName !== 'INPUT') {
            event.preventDefault();

            function move(event) {
                var clientX = event.clientX,
                    clientRectX = component_track_container.getBoundingClientRect().left,
                    x = clientX - clientRectX,
                    width = component_track_container.offsetWidth;

                if (x < 0) {
                    x = 0;
                } else if (x > width) {
                    x = width;
                }

                var steps = Math.round(x / (width / ((max - min) / step)));

                x = steps * 100 / ((max - min) / step);

                var value = Number((steps * step + min).toFixed(2));

                component.dataset.value = value;
                component_thumb.dataset.value = value;
                Satus.storage.set((object.storage || '') + '/' + key, value);

                if (component.querySelector('.satus-textarea')) {
                    component.querySelector('.satus-textarea').value = value;
                }

                if (object.onchange) {
                    object.onchange(value);
                }

                component_thumb.style.left = x + '%';
                component_track.style.width = x + '%';
            }

            function blur() {
                window.removeEventListener('mouseup', blur);
                window.removeEventListener('mousemove', move);
            }

            move(event);

            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', blur);

            return false;
        }
    });

    component.addEventListener('keydown', function(event) {
        if ((event.keyCode == 37 || event.keyCode == 39) && event.target.nodeName !== 'INPUT') {
            event.preventDefault();

            var value = Number(this.dataset.value);

            if (event.keyCode == 37 && value > min) {
                value -= step;
            } else if (event.keyCode == 39 && value < max) {
                value += step;
            }

            var x = (value - min) * 100 / (max - min);

            this.querySelector('.thumb').style.left = x + '%';
            this.querySelector('.track').style.width = x + '%';

            this.dataset.value = value;
            Satus.storage.set((object.storage || '') + '/' + key, value);
            if (object.onchange) {
                object.onchange(value);
            }
        }
    });

    if (object.textarea === true) {
        var component_textarea = document.createElement('input');

        component_textarea.className = 'satus-textarea';
        component_textarea.value = value;

        component_track_container.style.width = 'calc(100% - 32px)';

        component_textarea.onchange = function() {
            component.change(Number(this.value));
        };

        component.appendChild(component_textarea);
    }

    return component;
};