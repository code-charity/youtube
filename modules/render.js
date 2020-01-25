/*------------------------------------------------------------------------------
>>> «RENDER» MODULE
------------------------------------------------------------------------------*/

Satus.render = function(container, object) {
    for (var key in object) {
        var item = object[key],
            type = (item && item.type || '').replace(/(-[a-z])/, function(match) {
                return match.replace('-', '').toUpperCase();
            });

        if (
            typeof item === 'object' &&
            typeof item.type === 'string' &&
            typeof this.components[type] === 'function'
        ) {
            var element = this.components[type](item, key);

            if (element) {
                element.classList.add('satus-' + item.type);

                /*-------------------------------------------------------------
                # Properties
                -------------------------------------------------------------*/

                for (var property in item) {
                    if (
                        property !== 'type' &&
                        property !== 'class' &&
                        property !== 'on' &&
                        (
                            typeof item[property] === 'object' ?
                            !item[property].hasOwnProperty('type') :
                            true
                        ) &&
                        !element[property]
                    ) {
                        if (
                            item[property] &&
                            typeof item[property] === 'object' &&
                            element[property] &&
                            typeof element[property] === 'object'
                        ) {
                            for (var ii in item[property]) {
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
                    for (var i = 0, l = item.class.length; i < l; i++) {
                        element.classList.add(item.class[i]);
                    }
                }


                /*-------------------------------------------------------------
                # Events
                -------------------------------------------------------------*/

                if (item.hasOwnProperty('on')) {
                    for (var property in item.on) {
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