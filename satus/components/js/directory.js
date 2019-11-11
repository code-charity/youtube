'use strict';

/*------------------------------------------------------------------------------
>>> "DIRECTORY" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components.directory = {
    name: 'Directory',
    version: '1.0',
    status: 2,

    get: function(name, object) {
        var self = this,
            component = document.createElement('div'),
            component_label = document.createElement('span');

        if (typeof object.icon === 'string') {
            component.innerHTML = object.icon;
        }

        component_label.innerText = this.storage.get('locale/' + object.label) || object.label || this.storage.get('locale/' + name) || name;
        component.appendChild(component_label);

        component.addEventListener('click', function() {
            var container = this;

            while (!container.hasAttribute('repeat') && container !== self.container) {
                container = container.parentNode;
            }

            var path = container.dataset.path.split('/').filter(function(i) {
                return i != '';
            });

            self.constructors.render(object, container);

            path.push(name);

            container.dataset.path = '/' + path.join('/');

            document.querySelector(container.dataset.copyPathTo).dataset.path = '/' + path.join('/');
        });

        object.tabindex = true;

        return component;
    }
};