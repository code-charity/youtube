/*-----------------------------------------------------------------------------
>>> «CHROMIUM STORAGE» MODULE
-----------------------------------------------------------------------------*/

Satus.chromium_storage = (function() {
    Satus.on('set', function(data) {
        let name = data.name,
            value = data.value,
            object = {},
            path;

        if (typeof name !== 'string') {
            return false;
        }

        path = name.split('/').filter(function(value) {
            return value != '';
        });

        object[path[0]] = Satus.storage.get('')[path[0]];

        chrome.storage.local.set(object);

        if (chrome && chrome.tabs) {
            chrome.tabs.query({}, function(tabs) {
                for (var i = 0, l = tabs.length; i < l; i++) {
                    if (tabs[i].hasOwnProperty('url')) {
                        chrome.tabs.sendMessage(tabs[i].id, {
                            name: name.replace('/', ''),
                            value: value
                        });
                    }
                }
            });
        }

        chrome.runtime.sendMessage({
            name: name.replace('/', ''),
            value: value
        });
    });

    Satus.on('clear', function() {
        chrome.storage.local.clear();
    });

    return {
        sync: function(callback) {
            chrome.storage.local.get(function(items) {
                for (let key in items) {
                    Satus.storage.set(key, items[key], false);
                }

                callback();
            });
        }
    };
})();