/*--------------------------------------------------------------
>>> FUNCTIONS:
----------------------------------------------------------------
1.0 Get accept languages (i18n)
2.0 Remove element
--------------------------------------------------------------*/

function loadLocale(string = 'en', callback) {
    if (document.documentElement.hasAttribute('improvedtube-page')) {
        chrome.runtime.sendMessage({
            path: '../_locales/' + string + '/messages.json'
        }, function(response) {
            callback(self, response.locale);
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


/*--------------------------------------------------------------
1.0 Get accept languages (i18n)
--------------------------------------------------------------*/

HTMLElement.prototype.getMessage = function(string, clear) {
    if (clear)
        this.innerHTML = '';

    if (locale.hasOwnProperty(string) && locale[string].hasOwnProperty('message'))
        this.innerHTML += this.classList.contains('header__title') && locale[string].message.length > 20 ? (locale[string].message.substring(0, 20) + '...') : locale[string].message;
    else if (string)
        this.innerHTML += this.classList.contains('header__title') && string.length > 20 ? (string.substring(0, 20) + '...') : string;
};

function getMessage(string) {
    if (locale.hasOwnProperty(string) && locale[string].hasOwnProperty('message'))
        return locale[string].message;
    else if (string)
        return string;
};


/*--------------------------------------------------------------
1.0 Remove element
--------------------------------------------------------------*/

HTMLElement.prototype.remove = function() {
    this.parentElement.removeChild(this);
};