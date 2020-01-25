/*-----------------------------------------------------------------------------
>>> «SECTION» COMPONENT
-----------------------------------------------------------------------------*/

Satus.components.section = function(object) {
    var component = document.createElement('section');

    if (object.label) {
        component.classList.add('satus-section--has-label');
        component.dataset.label = Satus.memory.get('locale/' + object.label) || object.label;
    }

    Satus.render(component, object);

    return component;
};