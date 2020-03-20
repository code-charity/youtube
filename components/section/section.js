/*-----------------------------------------------------------------------------
>>> «SECTION» COMPONENT
-----------------------------------------------------------------------------*/

Satus.components.section = function(object) {
    let component = document.createElement('section'),
        label = Satus.memory.get('locale/' + object.label) || object.label;

    if (Satus.isset(label)) {
        component.classList.add('satus-section--has-label');
        component.dataset.label = label;
    }

    Satus.render(component, object);

    return component;
};