/*-----------------------------------------------------------------------------
>>> «MAIN» COMPONENT
-----------------------------------------------------------------------------*/

Satus.components.main = function(object) {
    let element = document.createElement('main'),
        container = document.createElement('div'),
        path = document.querySelector('.satus').dataset.path.split('/').filter(function(value) {
            return value != '';
        });

    container.className = 'satus-main__container';
    container.dataset.path = path.join('/');

    element.appendChild(container);

    Satus.render(container, object);

    return element;
};