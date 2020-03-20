/*-----------------------------------------------------------------------------
>>> «SWITCH» COMPONENT
-----------------------------------------------------------------------------*/

Satus.components.switch = function(object, key) {
    let element = document.createElement('div'),
        label = Satus.memory.get('locale/' + object.label) || object.label || false,
        value = Satus.storage.get((object.storage || '') + '/' + key);

    element.innerHTML = (label ? '<div class=label>' + label + '</div>' : '') +
        '<div class=container>' +
        ((object.icons || {}).before || '') + '<div class=track><div class=thumb></div></div>' + ((object.icons || {}).after || '') +
        '</div>';

    if (Satus.isset(value) || value === false) {
        element.dataset.value = value;
    } else {
        element.dataset.value = object.value || false;
    }


    element.addEventListener('click', function(event) {
        if (this.dataset.value == 'true') {
            this.dataset.value = 'false';
        } else {
            this.dataset.value = 'true';
        }

        Satus.storage.set((object.storage || '') + '/' + key, this.dataset.value === 'true');

        if (typeof object.onchange === 'function') {
            object.onchange(key, this.dataset.value, element);
        }
    });

    return element;
};