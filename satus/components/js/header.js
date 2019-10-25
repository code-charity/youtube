'use strict';

/*------------------------------------------------------------------------------
>>> "HEADER" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components.header = {
    name: 'Header',
    version: '0.1',
    status: 0,

    get: function(name, object) {
        var component = document.createElement('header');

        object.group = true;

        return component;
    }
};