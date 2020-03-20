/*-----------------------------------------------------------------------------
>>> CORE
-----------------------------------------------------------------------------*/

const Satus = new function() {
    let memory = {},
        storage = {},
        events = {};

    function get(type, name, on) {
        let object = type === 'storage' ? storage : memory,
            path;

        if (typeof name !== 'string') {
            return false;
        }

        path = name.split('/').filter(function(value) {
            return value != '';
        });

        for (let i = 0, l = path.length; i < l; i++) {
            object = object[path[i]];

            if (Satus.isset(object) === false) {
                break;
            }
        }

        if (on !== false) {
            Satus.trigger('get');
        }

        return object;
    }

    function set(type, name, value, on) {
        let object = type === 'storage' ? storage : memory,
            path;

        if (typeof name !== 'string') {
            return false;
        }

        path = name.split('/').filter(function(value) {
            return value != '';
        });

        for (let i = 0, l = path.length; i < l; i++) {
            let key = path[i];

            if (i === l - 1) {
                object[key] = value;
            } else {
                if (
                    Satus.isset(object) === false ||
                    Satus.isset(object[key]) === false
                ) {
                    object[key] = {};
                }

                object = object[key];
            }
        }

        if (on !== false) {
            Satus.trigger('set', {
                name: name,
                value: value
            });
        }
    }

    this.components = {};

    this.isset = function(variable) {
        if (typeof variable === 'undefined' || variable === null) {
            return false;
        }

        return true;
    };

    this.memory = {
        get: function(name, on) {
            return get('memory', name, on);
        },
        set: function(name, value, on) {
            set('memory', name, value, on);
        },
        clear: function() {
            memory = {};
        }
    };

    this.storage = {
        get: function(name, on) {
            return get('storage', name, on);
        },
        set: function(name, value, on) {
            set('storage', name, value, on);
        },
        clear: function() {
            storage = {};

            Satus.trigger('clear');
        }
    };

    this.on = function(name, callback) {
        if (!events.hasOwnProperty(name)) {
            events[name] = [];
        }

        events[name].push(callback);
    };

    this.trigger = function(name, data) {
        if (events.hasOwnProperty(name)) {
            for (let i = 0, l = events[name].length; i < l; i++) {
                events[name][i](data);
            }
        }
    };
};