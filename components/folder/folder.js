/*-----------------------------------------------------------------------------
>>> «FOLDER» COMPONENT
-----------------------------------------------------------------------------*/

Satus.components.folder = function(object, name) {
    let element = document.createElement('div'),
        label = document.createElement('span');

    if (typeof object.icon === 'string') {
        element.innerHTML = object.icon;
    }

    label.innerText = Satus.memory.get('locale/' + object.label) || object.label || Satus.memory.get('locale/' + name) || name;

    function create() {
        let container = document.createElement('div'),
            path = document.querySelector('.satus').dataset.path.split('/').filter(function(value) {
                return value != '';
            });

        container.className = 'satus-main__container';

        container.close = function() {
            let self = this,
                container = create(),
                object = Menu,
                parent = this.parentNode,
                path = document.querySelector('.satus').dataset.path.split('/').filter(function(value) {
                    return value != '';
                });

            if (parent.classList.contains('changing') || path.length === 1) {
                return false;
            }

            parent.classList.add('changing');

            path.pop();

            document.querySelector('.satus').dataset.path = path.join('/');
            container.dataset.path = document.querySelector('.satus').dataset.path;

            for (let i = 0, l = path.length; i < l; i++) {

                if (!Satus.isset(object[path[i]])) {
                    for (var key in object) {
                        if (Satus.isset(object[key][path[i]])) {
                            object = object[key][path[i]];

                            break;
                        }
                    }
                } else {
                    object = object[path[i]];
                }
            }

            Satus.render(container, object);

            self.classList.add('satus-main__container--pre-closing');
            container.classList.add('satus-main__container--pre-closing');

            parent.appendChild(container);

            if (
                typeof container.SatusItem === 'object' &&
                typeof container.SatusItem.on === 'object' &&
                typeof container.SatusItem.on.render === 'function'
            ) {
                container.SatusItem.on.render(container);
            }

            setTimeout(function() {
                self.classList.remove('satus-main__container--pre-closing');
                container.classList.remove('satus-main__container--pre-closing');
                self.classList.add('satus-main__container--closing');
                container.classList.add('satus-main__container--closing');

                document.querySelector('.satus').dispatchEvent(new CustomEvent('satus-navigate', {
                    detail: {
                        item: object,
                        name: path[path.length - 1],
                        path: document.querySelector('.satus').dataset.path.split('/').filter(function(value) {
                            return value != '';
                        })
                    }
                }));

                setTimeout(function() {
                    self.remove();
                    container.classList.remove('satus-main__container--closing');
                    container.parentNode.classList.remove('changing');
                }, Number(window.getComputedStyle(document.querySelector('.satus-main__container')).getPropertyValue('transition-duration').replace(/[^0-9.]/g, '')) * 1000);
            }, 50);
        };

        return container;
    }

    element.addEventListener('click', function() {
        let main_container = this,
            parent = this.parentNode;

        while (!main_container.classList.contains('satus-main')) {
            main_container = main_container.parentNode;
        }

        if (parent.classList.contains('changing')) {
            return false;
        }

        parent.classList.add('changing');

        let container = create();

        element.classList.add('satus-main__container--pre-opening');
        container.classList.add('satus-main__container--pre-opening');
        document.querySelector('.satus').dataset.path = (document.querySelector('.satus').dataset.path || 'main') + '/' + name;
        container.dataset.path = document.querySelector('.satus').dataset.path;

        Satus.render(container, object);

        main_container.appendChild(container);

        if (
            typeof container.SatusItem === 'object' &&
            typeof container.SatusItem.on === 'object' &&
            typeof container.SatusItem.on.render === 'function'
        ) {
            container.SatusItem.on.render(container);
        }

        setTimeout(function() {
            main_container.querySelector('*').classList.remove('satus-main__container--pre-opening');
            container.classList.remove('satus-main__container--pre-opening');
            main_container.querySelector('*').classList.add('satus-main__container--opening');
            container.classList.add('satus-main__container--opening');

            document.querySelector('.satus').dispatchEvent(new CustomEvent('satus-navigate', {
                detail: {
                    item: object,
                    name: name,
                    path: document.querySelector('.satus').dataset.path.split('/').filter(function(value) {
                        return value != '';
                    })
                }
            }));

            setTimeout(function() {
                main_container.querySelector('*').remove();
                container.classList.remove('satus-main__container--opening');
                container.parentNode.classList.remove('changing');
            }, Number(window.getComputedStyle(document.querySelector('.satus-main__container')).getPropertyValue('transition-duration').replace(/[^0-9.]/g, '')) * 1000);
        }, 50);
    });

    element.appendChild(label);

    return element;
};