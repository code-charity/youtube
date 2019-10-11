'use strict';

/*------------------------------------------------------------------------------
>>> "BUTTON" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components.button = {
    name: 'Button',
    version: '1.0',
    status: 2,

    get: function(name, object) {
        var options = object.options || {},
            component = document.createElement('div'),
            component_label = document.createElement('span');

        object.tabindex = true;

        if (options.full_width === true) {
            component.classList.add('satus-button_full-width');
        }

        if (typeof object.icon === 'string' && typeof object.label !== 'string') {
            component.classList.add('satus-button_icon');

            if (options.icon_small === true) {
                component.classList.add('satus-button_icon-small');
            }
        }

        if (typeof object.icon === 'string') {
            component.innerHTML = object.icon;
        }

        component_label.classList.add('label');
        component_label.innerText = this.storage.get('locale/' + object.label) || object.label || '';
        component.appendChild(component_label);

        return component;
    }
};