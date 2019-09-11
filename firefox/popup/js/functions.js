/*-----------------------------------------------------------------------------
>>> FUNCTIONS:
-------------------------------------------------------------------------------
1.0 Get translations
2.0 Remove element
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 GET TRANSLATIONS
-----------------------------------------------------------------------------*/

function loadLocale(string = 'en', callback) {
    if (document.documentElement.hasAttribute('improvedtube-page')) {
        function listener(request) {
            if (request !== null && typeof request === 'object') {
                if (request.name === 'improvedtube_translation_response') {
                    chrome.runtime.onMessage.removeListener(listener);

                    callback(self, request.value);
                }
            }
        }

        chrome.runtime.onMessage.addListener(listener);

        chrome.runtime.sendMessage({
            name: 'improvedtube_translation_request',
            path: '../_locales/' + string + '/messages.json'
        });
    } else {
        let xhr = new XMLHttpRequest(),
            self = this;

        xhr.onload = function() {
            callback(self, this.responseText);
        };

        xhr.onerror = function() {
            callback(self, false);
        };

        xhr.open('post', '../_locales/' + string + '/messages.json', true);
        xhr.send();
    }
}

HTMLElement.prototype.getMessage = function(string, clear) {
    if (clear) {
        this.innerHTML = '';
    }

    if (locale.hasOwnProperty(string) && locale[string].hasOwnProperty('message')) {
        this.innerHTML += this.classList.contains('header__title') && locale[string].message.length > 20 ? (locale[string].message.substring(0, 20) + '...') : locale[string].message;
    } else if (string) {
        this.innerHTML += this.classList.contains('header__title') && string.length > 20 ? (string.substring(0, 20) + '...') : string;
    }
};

function getMessage(string) {
    if (locale.hasOwnProperty(string) && locale[string].hasOwnProperty('message')) {
        return locale[string].message;
    } else if (string) {
        return string;
    }
};


/*-----------------------------------------------------------------------------
2.0 REMOVE ELEMENT
-----------------------------------------------------------------------------*/

HTMLElement.prototype.remove = function() {
    this.parentElement.removeChild(this);
};