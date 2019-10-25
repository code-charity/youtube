'use strict';

/*------------------------------------------------------------------------------
>>> "COLOR" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components.color = {
    name: 'Color',
    version: '1.0',
    status: 2,

    get: function(name, object) {
        let self = this,
            component = document.createElement('div'),
            component_label = document.createElement('span'),
            component_container = document.createElement('div');

        object.tabindex = true;

        component_label.className = 'label';
        component_container.className = 'container';

        component_label.innerText = this.storage.get('locale/' + object.label) || this.storage.get('locale/' + name) || object.label;

        for (let i = 0, l = object.colors.length; i < l; i++) {
            let component_color = document.createElement('div');

            component_color.className = 'color';
            component_color.style.background = 'rgb(' + object.colors[i].join() + ')';
            component_color.dataset.value = object.colors[i].join();

            if (object.colors[i].join() === (self.storage.get((object.storage_path || '') + '/' + name) || (object.value ? object.value.join() : false))) {
                component_color.className = 'color selected';
            }

            component_color.addEventListener('click', function() {
                if (this.parentNode.querySelector('.selected')) {
                    this.parentNode.querySelector('.selected').classList.remove('selected');
                }

                this.classList.add('selected');
                self.storage.set(name, this.dataset.value, object.storage_path);
            });

            component_container.appendChild(component_color);
        }

        component.appendChild(component_label);
        component.appendChild(component_container);

        return component;
    }
};