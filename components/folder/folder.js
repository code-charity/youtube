/*-----------------------------------------------------------------------------
>>> «FOLDER» COMPONENT (11 January 2020)
-----------------------------------------------------------------------------*/

Satus.components.folder = function(object, name) {
    var component = document.createElement('div'),
        label = document.createElement('span'),
        icon = document.createElement('span');

    if (typeof object.icon === 'string') {
        icon.innerHTML = object.icon;
    }

    label.innerText = Satus.memory.get('locale/' + object.label) || Satus.memory.get('locale/' + name) || object.label || name;

    component.addEventListener('click', function() {
        var container = component;

        while (!container.classList.contains('satus-main')) {
            container = container.parentNode;
        }

        document.querySelector('.satus').dataset.path = (document.querySelector('.satus').dataset.path || 'main') + '/' + name;
        container.dataset.path = document.querySelector('.satus').dataset.path;

        Satus.window(this, container, name, object);

        //container.innerHTML = '';
        //Satus.render(container, object);
    });

    component.appendChild(icon);
    component.appendChild(label);

    return component;
};