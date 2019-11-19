/*------------------------------------------------------------------------------
>>> "SELECT" COMPONENT:
------------------------------------------------------------------------------*/

Satus.components.select = function(object, name) {
    var self = this,
        component = document.createElement('div'),
        component_label = document.createElement('span'),
        component_value = document.createElement('span'),
        component_scrim = document.createElement('div'),
        component_options = document.createElement('div');

    if (typeof object.icon === 'string') {
        component_label.innerHTML = object.icon;
    }

    component_label.classList.add('label');
    component_value.classList.add('value');
    component_scrim.classList.add('scrim');
    component_options.classList.add('options');

    component_label.innerHTML += Satus.memory.get('locale/' + object.label) || Satus.memory.get('locale/' + name) || object.label || name;

    var value = false;

    for (var i = 0, l = object.options.length; i < l; i++) {
        if (Satus.storage.get(name) === object.options[i].value) {
            value = object.options[i].label;
        }
    }

    if (!value) {
        value = object.options[0].label;
    }

    component_value.innerText = Satus.memory.get('locale/' + value) || value;

    component.appendChild(component_label);
    component.appendChild(component_value);

    component_scrim.addEventListener('click', function(event) {
        event.stopPropagation();
        event.preventDefault();

        component.classList.remove('show');
        component_options.innerHTML = '';
    });

    component.addEventListener('click', function(event) {
        event.stopPropagation();
        event.preventDefault();

        component_options.style.maxHeight = window.innerHeight - component.getBoundingClientRect().y - component.getBoundingClientRect().height + 'px';

        this.classList.add('show');

        for (var i = 0, l = object.options.length; i < l; i++) {
            var option = document.createElement('div');

            option.innerText = Satus.memory.get('locale/' + object.options[i].label) || object.options[i].label;
            option.dataset.value = object.options[i].value;
            option.dataset.label = Satus.memory.get('locale/' + object.options[i].label) || object.options[i].label;

            option.addEventListener('click', function(event) {
                event.stopPropagation();
                event.preventDefault();

                Satus.storage.set(name, this.dataset.value);
                component_value.innerText = this.dataset.label;

                if (typeof object.onchange === 'function') {
                    object.onchange(name, this.dataset.value);
                }

                component.classList.remove('show');
                component_options.innerHTML = '';
            }, true);

            component_options.appendChild(option);
        }

        component.appendChild(component_scrim);
        component.appendChild(component_options);
    });

    return component;
};