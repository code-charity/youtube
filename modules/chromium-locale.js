Satus.locale = function(callback) {
    let language = Satus.storage.get('language') || 'en';

    function load(lang) {
        let xhr = new XMLHttpRequest();

        xhr.onload = function() {
            let data = {},
                locale = {};

            try {
                data = JSON.parse(this.responseText)
            } catch (err) {
                function listener(request) {
                    if (request !== null && typeof request === 'object') {
                        if (request.name === 'translation_response') {
                            chrome.runtime.onMessage.removeListener(listener);

                            let data = JSON.parse(request.value);

                            for (let i in data) {
                                locale[i] = data[i].message;
                            }

                            Satus.memory.set('locale', locale);

                            callback();
                        }
                    }
                }

                chrome.runtime.onMessage.addListener(listener);

                chrome.runtime.sendMessage({
                    name: 'translation_request',
                    path: '../_locales/' + lang + '/messages.json'
                });

                return false;
            }

            for (let i in data) {
                locale[i] = data[i].message;
            }

            Satus.memory.set('locale', locale);

            callback();
        };

        xhr.onerror = function() {
            load('en');
        };

        xhr.open('GET', '../_locales/' + lang + '/messages.json', true);
        xhr.send();
    }

    load(language);
};