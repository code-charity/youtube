/*-----------------------------------------------------------------------------
>>> «HEADER» COMPONENT
-----------------------------------------------------------------------------*/

Satus.components.header = function(object) {
    let element = document.createElement('header');

    Satus.render(element, object);

    return element;
};