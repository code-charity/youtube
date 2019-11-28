/*-----------------------------------------------------------------------------
>>> «TEXT» COMPONENT
-----------------------------------------------------------------------------*/

Satus.components.text = function(object) {
    var component = document.createElement('span'),
        component_label = document.createElement('span'),
        component_value = document.createElement('span'),
        label = Satus.memory.get('locale/' + object.label);

    component_label.classList.add('label');

    if (
        !Satus.isset(label) ||
        typeof label === 'object'
    ) {
        component_label.innerText = object.label || '';
    } else {
        component_label.innerText = label;
    }

    component.appendChild(component_label);

    component.label = function(string) {
        component_label.innerText = Satus.memory.get('locale/' + string) || string;
    };

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