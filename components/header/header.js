/*-----------------------------------------------------------------------------
>>> «HEADER» COMPONENT
-----------------------------------------------------------------------------*/

Satus.components.header = function(object) {
    var element = document.createElement('header');

    Satus.render(element, object);

    return element;
};