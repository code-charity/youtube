'use strict';

/*------------------------------------------------------------------------------
>>> SATUS:
--------------------------------------------------------------------------------
1.0 Version
2.0 Container
3.0 Storage
    3.1 "Has"
    3.2 "Get"
    3.3 "Set"
4.0 Localization
5.0 Menu path
6.0 Constructors
7.0 Init
------------------------------------------------------------------------------*/

function Satus(query, options = {}) {
    let satus = this,
        satus_options = options,
        storage = {},
        event_listeners = {
            storage: {
                get: [],
                set: [],
                remove: [],
                clear: []
            },
            components: {
                rendered: []
            }
        };

    /*--------------------------------------------------------------------------
    1.0 Version
    --------------------------------------------------------------------------*/
    Object.defineProperty(this, 'version', {
        value: '1.0.0'
    });

    if (satus_options.debug === true) {
        console.log('%cSATUS%c ' + this.version, 'color:#0f0', 'color:unset');
    }


    /*--------------------------------------------------------------------------
    2.0 Container
    --------------------------------------------------------------------------*/
    Object.defineProperty(this, 'container', {
        value: document.querySelector(query)
    });


    /*--------------------------------------------------------------------------
    3.0 Storage
    --------------------------------------------------------------------------*/
    Object.defineProperty(this, 'storage', {
        value: {}
    });

    Object.defineProperty(this.storage, 'onget', {
        value: function(callback) {
            event_listeners.storage.get.push(callback);
        }
    });

    Object.defineProperty(this.storage, 'onset', {
        value: function(callback) {
            event_listeners.storage.set.push(callback);
        }
    });

    Object.defineProperty(this.storage, 'onremove', {
        value: function(callback) {
            event_listeners.storage.remove.push(callback);
        }
    });

    Object.defineProperty(this.storage, 'onclear', {
        value: function(callback) {
            event_listeners.storage.clear.push(callback);
        }
    });

    Object.defineProperty(this.storage, 'get', {
        value: function(path = '') {
            var path_array = path.split('/'),
                result = storage;

            for (var i = 0, l = path_array.length; i < l; i++) {
                if (path_array[i] == '') {
                    path_array.splice(i, 1);

                    i--;
                }
            }

            for (var i = 0, l = path_array.length; i < l; i++) {
                if (result.hasOwnProperty(path_array[i])) {
                    result = result[path_array[i]];
                } else {
                    return false;
                }
            }

            for (var i in event_listeners.storage.get) {
                event_listeners.storage.get[i]();
            }

            return result;
        }
    });

    Object.defineProperty(this.storage, 'has', {
        value: function(name) {
            console.log(name, storage.hasOwnProperty(name), storage);
            return storage.hasOwnProperty(name);
        }
    });

    Object.defineProperty(this.storage, 'set', {
        value: function(name, value, path) {
            if (typeof path === 'string') {
                let path_array_before = path.split('/'),
                    path_array = [],
                    storage_link = storage;

                for (let i = 0, l = path_array_before.length; i < l; i++) {
                    if (path_array_before[i] != '') {
                        path_array.push(path_array_before[i]);
                    }
                }

                for (let i = 0, l = path_array.length; i < l; i++) {
                    if (!storage_link.hasOwnProperty(path_array[i])) {
                        storage_link[path_array[i]] = {};
                    }

                    storage_link = storage_link[path_array[i]];
                }

                storage_link[name] = value;
            } else {
                storage[name] = value;
            }

            for (var i in event_listeners.storage.set) {
                event_listeners.storage.set[i](name, value, storage);
            }
        }
    });

    Object.defineProperty(this.storage, 'remove', {
        value: function(name, path) {
            if (typeof path === 'string') {
                let path_array_before = path.split('/'),
                    path_array = [],
                    storage_link = storage;

                for (let i = 0, l = path_array_before.length; i < l; i++) {
                    if (path_array_before[i] != '') {
                        path_array.push(path_array_before[i]);
                    }
                }

                for (let i = 0, l = path_array.length; i < l; i++) {
                    if (!storage_link.hasOwnProperty(path_array[i])) {
                        storage_link[path_array[i]] = {};
                    }

                    storage_link = storage_link[path_array[i]];
                }

                delete storage_link[name];
            } else {
                delete storage[name];
            }

            for (var i in event_listeners.storage.remove) {
                event_listeners.storage.remove[i](name, storage);
            }
        }
    });

    Object.defineProperty(this.storage, 'clear', {
        value: function() {
            storage = {};

            for (var i in event_listeners.storage.clear) {
                event_listeners.storage.clear[i]();
            }
        }
    });


    /*--------------------------------------------------------------------------
    0.0 Modules
    --------------------------------------------------------------------------*/

    Object.defineProperty(this, 'modules', {
        value: {}
    });


    /*--------------------------------------------------------------------------
    0.0 Components
    --------------------------------------------------------------------------*/

    Object.defineProperty(this, 'components', {
        value: {}
    });


    /*--------------------------------------------------------------------------
    6.0 Constructors
    --------------------------------------------------------------------------*/
    Object.defineProperty(this, 'constructors', {
        value: {}
    });

    Object.defineProperty(this.constructors, 'onrendered', {
        set: function(callback) {
            event_listeners.components.rendered.push(callback);
        }
    });

    Object.defineProperty(this.constructors, 'render', {
        value: function(object = satus.menu, parent = satus.container, options = {}) {
            if (options.clear !== false) {
                parent.innerHTML = '';
            }

            for (let key in object) {
                let item = object[key];

                if (typeof item === 'object' && ['icon'].indexOf(key) == -1) {
                    if (item.hasOwnProperty('type')) {
                        if (typeof satus.components[item.type] === 'object') {
                            let component = satus.components[item.type].get(key, item);

                            // STYLES
                            if (typeof object[key].styles === 'object') {
                                for (var style in object[key].styles) {
                                    component.style[style] = object[key].styles[style];
                                }
                            }

                            // ID
                            if (typeof object[key].id === 'string') {
                                component.setAttribute('id', object[key].id);
                            }

                            // ONCLICK
                            if (typeof object[key].onclick === 'function') {
                                component.addEventListener('click', function(event) {
                                    object[key].onclick(satus, component, event, options);
                                });
                            }

                            // GROUP
                            if (object[key].group === true) {
                                satus.constructors.render(object[key], component, {
                                    grouped: key,
                                    clear: object[key].clear
                                });
                            }

                            if (typeof object[key].dataset === 'object') {
                                for (var ds in object[key].dataset) {
                                    component.dataset[ds] = object[key].dataset[ds];
                                }
                            }

                            // REPEAT
                            if (object[key].repeat === true) {
                                component.setAttribute('repeat', '');
                                component.dataset.path = '/';

                                if (object[key].repeat_options) {
                                    if (object[key].repeat_options.copy_path_to) {
                                        component.dataset.copyPathTo = object[key].repeat_options.copy_path_to;
                                        document.querySelector(object[key].repeat_options.copy_path_to).dataset.path = '/';
                                    }
                                }

                                var object_l = object[key];

                                Object.defineProperty(component, 'goBack', {
                                    value: function() {
                                        var path = component.dataset.path.split('/').filter(function(i) {
                                                return i != '';
                                            }),
                                            object_path = object[key];

                                        path.pop();

                                        for (var i in path) {
                                            object_path = object_path[path[i]];
                                        }

                                        component.dataset.path = '/' + path.join('/');
                                        satus.constructors.render(object_path, component);

                                        document.querySelector(object[key].repeat_options.copy_path_to).dataset.path = '/' + path.join('/');

                                        return path.length > 0 ? true : false;
                                    }
                                });
                            }

                            // START Add classes

                            component.classList.add('satus-' + object[key].type);

                            if (component.id != '') {
                                component.classList.add('satus-' + component.id);
                            }

                            if (typeof object[key].class === 'string') {
                                component.className += ' satus-' + object[key].type + '--' + object[key].class.replace(' ', 'satus--');
                            }

                            // END add classes
                            parent.appendChild(component);

                            for (var i in event_listeners.components.rendered) {
                                event_listeners.components.rendered[i](component, object[key]);
                            }

                            if (typeof object[key].onload === 'function') {
                                object[key].onload(satus, component);
                            }
                        }
                    }
                }
            }
        }
    });


    /*--------------------------------------------------------------------------
    7.0 Init
    --------------------------------------------------------------------------*/

    (function() {
        var modules_keys = Object.keys(Satus.prototype.modules),
            modules_values = Object.values(Satus.prototype.modules),
            components_keys = Object.keys(Satus.prototype.components),
            components_values = Object.values(Satus.prototype.components),
            key = -1;

        if (satus_options.debug === true) {
            console.log('\nModules:');
        }

        function initCheck(object) {
            if (typeof object.name !== 'string') {
                console.log('[ %c!!%c ] Required value \'name\' is missing or invalid.', 'color:#f00', 'color:unset');
                return false;
            }

            if (typeof object.version !== 'string' || /[^0-9.]+/.test(object.version)) {
                console.log('[ %c!!%c ] Required value \'version\' is missing or invalid.', 'color:#f00', 'color:unset');
                return false;
            }

            return true;
        }

        function initPermissions(object) {
            Object.defineProperty(object, 'storage', {
                value: satus.storage
            });

            Object.defineProperty(object, 'modules', {
                value: satus.modules
            });

            Object.defineProperty(object, 'components', {
                value: satus.components
            });

            Object.defineProperty(object, 'constructors', {
                value: satus.constructors
            });

            Object.defineProperty(object, 'path', {
                value: satus.path
            });

            Object.defineProperty(object, 'getOption', {
                value: function(name) {
                    return satus_options[name] || {};
                }
            });
        }

        function initModule(name, object) {
            if (initCheck(object) === true && typeof object.init === 'function') {
                var module_key = modules_keys[name],
                    module_value = Object.assign(object);

                Object.defineProperty(satus.modules, module_key, {
                    value: module_value
                });

                if (satus_options.debug === true) {
                    var color = 'unset';

                    if (object.status === 0) {
                        color = '0f0';
                    } else if (object.status === 1) {
                        color = 'ffc400';
                    } else if (object.status === 2) {
                        color = 'f44336';
                    }

                    console.log('[ %cOK%c ] Module "' + satus.modules[module_key].name + '" has been initialized.', 'color:#' + color, 'color:unset');
                }

                Object.defineProperty(module_value, 'container', {
                    value: satus.container
                });

                initPermissions(module_value);

                object.init(get);
            }
        }

        function initComponent(name, object) {
            if (initCheck(object) === true) {
                var component_key = components_keys[name],
                    component_value = Object.assign(object);

                Object.defineProperty(satus.components, component_key, {
                    value: component_value
                });

                if (satus_options.debug === true) {
                    var color = 'unset';

                    if (object.status === 0) {
                        color = '0f0';
                    } else if (object.status === 1) {
                        color = 'ffc400';
                    } else if (object.status === 2) {
                        color = 'f44336';
                    }

                    console.log('[ %cOK%c ] Component "' + satus.components[component_key].name + '" has been initialized.', 'color:#' + color, 'color:unset');
                }

                Object.defineProperty(component_value, 'container', {
                    value: satus.container
                });

                Object.defineProperty(component_value, 'components', {
                    value: satus.components
                });

                initPermissions(component_value);

                get();
            }
        }

        function get() {
            key++;

            if (key < modules_values.length) {
                initModule(key, modules_values[key]);
            } else if (key - modules_values.length < components_values.length) {
                if (satus_options.debug === true && key - modules_values.length == 0) {
                    console.log('\nComponents:');
                }

                initComponent(key - modules_values.length, components_values[key - modules_values.length]);
            } else {
                satus.constructors.render();
            }
        }

        get();
    }());
}

Satus.prototype.menu = {};

Satus.prototype.modules = {};

Satus.prototype.components = {};