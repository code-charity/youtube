'use strict';

/*------------------------------------------------------------------------------
>>> "DRAWER" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components.drawer = {
    name: 'Drawer',
    version: '0.1',
    status: 2,

    get: function(name, object) {
        var component = document.createElement('div'),
            component_inner = document.createElement('div');

        component_inner.classList.add('satus-drawer__inner');

        component.appendChild(component_inner);

        component.toggle = function() {
        	if (!this.style.width) {
        		this.style.width = '300px';
        	} else {
        		this.style.width = '';
        	}
        };

        return component;
    }
};