/*-----------------------------------------------------------------------------
>>> SATUS CORE
-------------------------------------------------------------------------------
# Variables
# Functions
# Events
# Memory
# Storage
# Components
-----------------------------------------------------------------------------*/

var Satus = new function() {
    // VARIABLES
    var events = {},
        memory = {},
        storage = {};


    // FUNCTIONS
    function get(target, name, trigger) {
        if (trigger !== false) {
            Satus.trigger('get');
        }

        if (!name) {
            return target;
        }

        name = name.split('/').filter(function(value) {
            return value != '';
        });

        for (var i = 0, l = name.length; i < l; i++) {
            if (target[name[i]]) {
                target = target[name[i]];
            } else {
                return false;
            }
        }

        return target;
    }

    function set(target, name, value, trigger) {
        var path = name.split('/');

        for (var i = 0, l = path.length; i < l; i++) {
            var item = path[i];

            if (i + 1 < l) {
                if (target[item]) {
                    target = target[item];
                } else {
                    target[item] = {};
                }
            } else {
                target[item] = value;
            }
        }

        if (trigger !== false) {
            Satus.trigger('set', {
                name: name,
                value: value
            });
        }
    }


    // EVENTS
    this.on = function(type, listener) {
        if (!events[type]) {
            events[type] = [];
        }

        events[type].push(listener);
    };

    this.trigger = function(type, data) {
        var listeners = events[type];

        if (listeners) {
            for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i](data);
            }
        }
    };


    // MEMORY
    this.memory = {
        clear: function() {
            delete memory;

            memory = {};

            Satus.trigger('clear');
        },
        get: function(name, trigger) {
            return get(memory, name, trigger);
        },
        set: function(name, value, trigger) {
            set(memory, name, value, trigger);
        }
    };


    // STORAGE
    this.storage = {
        clear: function() {
            delete storage;

            storage = {};

            Satus.trigger('clear');
        },
        get: function(name, trigger) {
            return get(storage, name, trigger);
        },
        set: function(name, value, trigger) {
            set(storage, name, value, trigger);
        }
    };


    // COMPONENTS
    this.components = {};
};