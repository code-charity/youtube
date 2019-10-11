/*------------------------------------------------------------------------------
>>> "SECTION" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components.section = {
    name: 'Section',
    version: '1.0',
    status: 0,

    get: function(name, object) {
        var component = document.createElement('section'),
            component_label = document.createElement('span'),
            label = this.storage.get('locale/' + object.label) || object.label;

        object.group = true;

        if (label) {
            object.clear = false;

            component_label.classList.add('label');
            component_label.innerText = label;

            component.appendChild(component_label);
        }

        return component;
    }
};