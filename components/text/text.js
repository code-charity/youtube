/*-----------------------------------------------------------------------------
>>> «TEXT» COMPONENT
-----------------------------------------------------------------------------*/

Satus.components.text = function(object) {
    let component = document.createElement('span'),
        component_label = document.createElement('span'),
        component_value = document.createElement('span');

    component_label.innerText = Satus.memory.get('locale/' + object.label) || object.label || '';
    component_label.classList.add('label');

    component.appendChild(component_label);

    if (object.value !== undefined) {
        component_value.classList.add('value');

        if (typeof object.value === 'function') {
            var func_value = object.value(this, component);

            if (func_value && typeof func_value === 'object' && func_value.nodeName) {
                component_value.appendChild(func_value);
            } else {
                component_value.innerHTML = func_value;
            }
        } else {
            component_value.innerHTML = object.value;
        }

        component.appendChild(component_value);
    }

    return component;
};