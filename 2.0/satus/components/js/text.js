'use strict';

/*------------------------------------------------------------------------------
>>> "TEXT" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components.text = {
    name: 'Text',
    version: '1.0',
    status: 0,

    get: function(name, object) {
        var self = this,
            component = document.createElement('span'),
            component_label = document.createElement('span'),
            component_value = document.createElement('span');

        component_label.classList.add('label');
        component_label.innerText = this.storage.get('locale/' + object.label) || object.label || this.storage.get('locale/' + name) || name;
        component.appendChild(component_label);

        component.label = function(string) {
            component_label.innerText = self.storage.get('locale/' + string) || string;
        };

        if (object.value !== undefined) {
            component_value.classList.add('value');

            if (typeof object.value === 'function') {
                var func_value = object.value(this, component);

                if (func_value && typeof func_value === 'object' && func_value.nodeName) {
                    component_value.appendChild(func_value);
                } else {
                    component_value.innerHTML = func_value;
                }
            } else {
                component_value.innerHTML = object.value;
            }

            component.appendChild(component_value);
        }

        if (typeof object.html === 'string') {
            component_label.innerHTML = object.html;
        }

        return component;
    }
};