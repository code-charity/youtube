'use strict';

/*------------------------------------------------------------------------------
>>> "MAIN" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components.main = {
    name: 'Main',
    version: '0.1',
    status: 0,

    get: function(name, object) {
        var component = document.createElement('main');

        object.group = true;

        return component;
    }
};