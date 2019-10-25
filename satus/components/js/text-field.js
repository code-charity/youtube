'use strict';

/*------------------------------------------------------------------------------
>>> "TEXT-FIELD" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components['text-field'] = {
    name: 'Text field',
    version: '1.0',
    status: 1,

    get: function(name, object) {
        var component = document.createElement('div'),
            component_input = document.createElement('input');

        component_input.type = 'text';

        if (typeof object.placeholder === 'string') {
            component_input.placeholder = this.storage.get('locale/' + object.placeholder) || object.placeholder;
        }

        if (typeof object.value === 'string') {
            component_input.value = this.storage.get(object.value) || object.value;
        }

        if (typeof object.before === 'object') {
            this.constructors.render(object.before, component, {
                clear: false
            });
        }

        component.appendChild(component_input);

        if (typeof object.after === 'object') {
            this.constructors.render(object.after, component, {
                clear: false
            });
        }

        return component;
    }
};