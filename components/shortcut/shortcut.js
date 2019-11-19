'use strict';

/*------------------------------------------------------------------------------
>>> "SHORTCUT" COMPONENT:
------------------------------------------------------------------------------*/

Satus.components.shortcut = function(object, name) {
    let self = this,
        value = (Satus.storage.get(name) ? JSON.parse(Satus.storage.get(name)) : false) || object.value || {},
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
                canvas.innerText = Satus.memory.get('locale/pressAnyKeyOrUseMouseWheel');
            }
        }
    }

    update();

    component_value.dataset.value = component_value.innerText;

    component_label.innerText = Satus.memory.get('locale/' + object.label) || object.label || Satus.memory.get('locale/' + name) || name;

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
        component_button_reset.innerText = Satus.memory.get('locale/reset');
        component_button_cancel.innerText = Satus.memory.get('locale/cancel');
        component_button_save.innerText = Satus.memory.get('locale/save');

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
            Satus.storage.remove(name);
            close();
        });
        component_button_cancel.addEventListener('click', close);
        component_button_save.addEventListener('click', function() {
            Satus.storage.set(name, JSON.stringify(value));
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

        document.querySelector('.satus').appendChild(component_dialog);
    });

    component.appendChild(component_label);
    component.appendChild(component_value);

    return component;
};