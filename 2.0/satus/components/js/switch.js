'use strict';

/*------------------------------------------------------------------------------
>>> "SWITCH" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components.switch = {
    name: 'Switch',
    version: '1.0',
    status: 2,

    get: function(name, object) {
        var self = this,
            component = document.createElement('div'),
            label = this.storage.get('locale/' + object.label) || this.storage.get('locale/' + name) || object.label,
            stor = this.storage.get((object.storage_path || '') + '/' + name);

        object.tabindex = true;

        component.innerHTML = (label ? '<div class=label>' + label + '</div>' : '') +
            '<div class=container>' +
            ((object.icons || {}).start || '') + '<div class=track><div class=thumb></div></div>' + ((object.icons || {}).end || '') +
            '</div>';

        component.dataset.value = object.value || false;

        if (this.storage.has(name)) {
            component.dataset.value = stor;
        }

        component.addEventListener('click', function(event) {
            if (component.dataset.value == 'true') {
                component.dataset.value = 'false';
            } else {
                component.dataset.value = 'true';
            }

            self.storage.set(name, component.dataset.value == 'true' ? true : false, object.storage_path);

            if (typeof object.onchange === 'function') {
                object.onchange(event, self);
            }
        });

        return component;
    }
};