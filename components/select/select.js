/*------------------------------------------------------------------------------
>>> «SELECT» COMPONENT
------------------------------------------------------------------------------*/

Satus.components.select = function(object, name) {
    var self = this,
        component = document.createElement('div'),
        component_label = document.createElement('span'),
        component_value = document.createElement('span');

    if (typeof object.icon === 'string') {
        component_label.innerHTML = object.icon;
    }

    component_label.classList.add('label');
    component_value.classList.add('value');

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

    component.addEventListener('click', function(event) {
        var component_options = document.createElement('div'),
            component_scrim = document.createElement('div');;

        event.stopPropagation();
        event.preventDefault();

        component_options.classList.add('satus-select__options');
        component_scrim.classList.add('satus-select__scrim');

        component_scrim.addEventListener('click', function(event) {
            event.stopPropagation();
            event.preventDefault();

            component_scrim.remove();
            component_options.remove();
        });

        component_options.style.top = this.getBoundingClientRect().y + this.getBoundingClientRect().height - 4 + 'px';
        component_options.style.maxHeight = window.innerHeight - component.getBoundingClientRect().y - component.getBoundingClientRect().height + 'px';

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

                component_scrim.remove();
                component_options.remove();
            }, true);

            component_options.appendChild(option);
        }

        document.querySelector('.satus').appendChild(component_scrim);
        document.querySelector('.satus').appendChild(component_options);
    });

    return component;
};