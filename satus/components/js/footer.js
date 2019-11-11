'use strict';

/*------------------------------------------------------------------------------
>>> "FOOTER" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components.footer = {
    name: 'Footer',
    version: '0.1',
    status: 0,

    get: function(name, object) {
        var component = document.createElement('footer');
        
        object.group = true;

        return component;
    }
};