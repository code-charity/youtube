/*------------------------------------------------------------------------------
>>> "IMAGE" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components.image = {
    name: 'Image',
    version: '1.0',
    status: 0,

    get: function(name, object) {
        var component = document.createElement('img');

        component.src = object.src;

        return component;
    }
};