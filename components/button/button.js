/*-----------------------------------------------------------------------------
>>> «BUTTON» COMPONENT
-----------------------------------------------------------------------------*/

Satus.components.button = function(object) {
    var component = document.createElement('button'),
        component_icon = document.createElement('span'),
        component_label = document.createElement('span');

    if (typeof object.icon === 'string') {
        component.classList.add('satus-button--icon');
        component_icon.className = 'satus-button__icon';
        component_icon.innerHTML = object.icon;
        component.appendChild(component_icon);
    }

    if (typeof object.label === 'string') {
        component.classList.add('satus-button--label');
        component_icon.className = 'satus-button__label';
        component_label.innerText = Satus.memory.get('locale/' + object.label) || object.label;
        component.appendChild(component_label);
    }

    return component;
};