'use strict';

/*------------------------------------------------------------------------------
>>> "CHROMIUM STORAGE" MODULE:
------------------------------------------------------------------------------*/

Satus.prototype.modules.chromium_storage = {
    name: 'Chromium Storage',
    version: '1.0',
    status: 1,

    init: function(callback) {
        var self = this;

        this.load(function() {
            self.storage.onset(function(name, value, storage) {
                self.set(name, value, storage);
            });

            self.storage.onremove(function(name, storage) {
                self.remove(name, storage);
            });

            self.storage.onclear(function() {
                self.clear();
            });

            callback();
        });
    },

    set: function(name, value, old_storage) {
        var new_storage = {},
            message = {
                name: name,
                value: value,
                storage: this.storage.get()
            },
            exclude = this.getOption('chromium_storage').exclude;

        chrome.storage.local.clear();
        chrome.storage.local.set(old_storage);

        if (Object.keys(message).length > 0) {
            if (chrome && chrome.tabs) {
                chrome.tabs.query({}, function(tabs) {
                    for (var i = 0, l = tabs.length; i < l; i++) {
                        if (tabs[i].hasOwnProperty('url')) {
                            chrome.tabs.sendMessage(tabs[i].id, message);
                        }
                    }
                });
            }
        }
    },

    remove: function(name, old_storage) {
        var new_storage = {},
            message = {
                name: name,
                value: null,
                storage: this.storage.get()
            },
            exclude = this.getOption('chromium_storage').exclude;

        chrome.storage.local.clear();
        chrome.storage.local.set(old_storage);

        if (Object.keys(message).length > 0) {
            if (chrome && chrome.tabs) {
                chrome.tabs.query({}, function(tabs) {
                    for (var i = 0, l = tabs.length; i < l; i++) {
                        if (tabs[i].hasOwnProperty('url')) {
                            chrome.tabs.sendMessage(tabs[i].id, message);
                        }
                    }
                });
            }
        }
    },

    clear: function() {
        chrome.storage.local.clear();
    },

    load: function(callback = function() {}) {
        var self = this;

        chrome.storage.local.get(function(data) {
            for (var i in data) {
                self.storage.set(i, data[i]);
            }

            if (typeof callback === 'function') {
                callback();
            }
        });
    }
};