/*-----------------------------------------------------------------------------
>>> «RENDER» MODULE
-------------------------------------------------------------------------------*/

Satus.render = function(container, object) {
    for (let key in object) {
        let item = object[key];

        if (
            typeof item === 'object' &&
            typeof item.type === 'string' &&
            typeof this.components[item.type] === 'function'
        ) {
            let element = this.components[item.type](item, key);

            if (element) {
                element.classList.add('satus-' + item.type);

                /*-------------------------------------------------------------
                # Properties
                -------------------------------------------------------------*/

                for (let property in item) {
                    if (
                        property !== 'type' &&
                        property !== 'class' &&
                        property !== 'on' &&
                        (
                            typeof item[property] === 'object' ?
                            !item[property].hasOwnProperty('type') :
                            true
                        )
                    ) {
                        if (
                            item[property] &&
                            typeof item[property] === 'object' &&
                            element[property] &&
                            typeof element[property] === 'object'
                        ) {
                            for (let ii in item[property]) {
                                element[property][ii] = item[property][ii];
                            }
                        } else {
                            element[property] = item[property];
                        }
                    }
                }


                /*-------------------------------------------------------------
                # Class
                -------------------------------------------------------------*/
                if (Array.isArray(item.class)) {
                    for (let i = 0, l = item.class.length; i < l; i++) {
                        element.classList.add(item.class[i]);
                    }
                }


                /*-------------------------------------------------------------
                # Events
                -------------------------------------------------------------*/

                if (item.hasOwnProperty('on')) {
                    for (let property in item.on) {
                        if (property !== 'render') {
                            element.addEventListener(property, item.on[property]);
                        } else {
                            item.on['render'](element, item);
                        }
                    }
                }

                element.satusItem = item;

                container.appendChild(element);

                Satus.trigger('render', {
                    element: element,
                    item: item
                })
            }
        }
    }
};