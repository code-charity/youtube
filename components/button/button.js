/*-----------------------------------------------------------------------------
>>> «BUTTON» COMPONENT
-----------------------------------------------------------------------------*/

Satus.components.button = function(object) {
    var options = object.options || {},
        component = document.createElement('button'),
        component_label = document.createElement('span');

    if (options.full_width === true) {
        component.classList.add('satus-button_full-width');
    }

    if (typeof object.icon === 'string' && typeof object.label !== 'string') {
        component.classList.add('satus-button_icon');

        if (options.icon_small === true) {
            component.classList.add('satus-button_icon-small');
        }
    }

    if (typeof object.icon === 'string') {
        component.innerHTML = object.icon;
    }

    component_label.classList.add('label');
    component_label.innerText = Satus.memory.get('locale/' + object.label) || object.label || '';
    component.appendChild(component_label);

    return component;
};