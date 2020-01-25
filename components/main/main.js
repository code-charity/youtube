/*-----------------------------------------------------------------------------
>>> «MAIN» COMPONENT (11 January 2020)
-----------------------------------------------------------------------------*/

Satus.components.main = function(object) {
	var component = document.createElement('main'),
		component_window = document.createElement('div');

    component.dataset.path = document.querySelector('.satus').dataset.path || 'main';
	component.appendChild(component_window);

    component_window.dataset.path = document.querySelector('.satus').dataset.path || 'main';
    component_window.className = 'satus-main__container';

	Satus.render(component_window, object);

	return component;
};
