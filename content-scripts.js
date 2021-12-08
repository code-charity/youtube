/*------------------------------------------------------------------------------
>>> TABLE OF CONTENTS:
--------------------------------------------------------------------------------
1.0 Camelize
2.0 Attributes
3.0 Injection
4.0 Storage
5.0 Messages
6.0 Initialization
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
1.0 CAMELIZE
------------------------------------------------------------------------------*/

function camelize(string) {
    return string.split('-').map(function (element, index) {
        if (index === 0) {
            return element;
        }

        return element[0].toUpperCase() + element.slice(1);
    }).join('');
}


/*------------------------------------------------------------------------------
2.0 ATTRIBUTES
------------------------------------------------------------------------------*/

function attributes(items) {
    for (var key in items) {
        var attribute = key.replace(/_/g, '-');

        document.documentElement.setAttribute('it-' + attribute, items[key]);
    }
}

function sendMessage(object) {
    document.documentElement.setAttribute('it-message', JSON.stringify(object));
}


/*------------------------------------------------------------------------------
3.0 INJECTION
------------------------------------------------------------------------------*/

function injectYoutubeScript() {
    var script = document.createElement('script');

    script.src = chrome.runtime.getURL('youtube-scripts.js');

    document.documentElement.appendChild(script);
}


/*------------------------------------------------------------------------------
4.0 STORAGE LISTENER
------------------------------------------------------------------------------*/

chrome.storage.onChanged.addListener(function (changes) {
    for (var key in changes) {
        var attribute = key.replace(/_/g, '-'),
            camelized_key = camelize(attribute),
            value = changes[key].newValue;

        if (camelized_key === 'blacklistActivate') {
            camelized_key = 'blacklist';
        } else if (camelized_key === 'playerForcedPlaybackSpeed') {
            camelized_key = 'playerPlaybackSpeed';
        }

        document.documentElement.setAttribute('it-' + attribute, value);

        sendMessage({
            'storage-update': {
                key: key,
                camelizedKey: camelized_key,
                value: value
            }
        });
    }
});


/*------------------------------------------------------------------------------
5.0 MESSAGE LISTENER
------------------------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'focus') {
        sendMessage({
            focus: true
        });
    } else if (request.action === 'blur') {
        sendMessage({
            blur: true
        });
    } else if (request.action === 'improvedtube-pause') {
        sendMessage({
            pause: true
        });
    } else if (request.action === 'request-volume') {
        new MutationObserver(function (mutationList) {
            for (var i = 0, l = mutationList.length; i < l; i++) {
                var mutation = mutationList[i];

                if (mutation.type === 'attributes') {
                    if (mutation.attributeName === 'it-response') {
                        var message = document.documentElement.getAttribute('it-response');

                        try {
                            message = JSON.parse(message);
                        } catch (error) {}

                        if (message && message.hasOwnProperty('getVolume')) {
                            sendResponse(message.getVolume);

                            this.disconnect();
                        }
                    }
                }
            }
        }).observe(document.documentElement, {
            attributes: true,
            childList: false,
            subtree: false
        });

        sendMessage({
            getVolume: true
        });

        return true;
    } else if (request.action === 'set-volume') {
        sendMessage({
            setVolume: request.value / 100
        });
    } else if (request.action === 'request-playback-speed') {
        new MutationObserver(function (mutationList) {
            for (var i = 0, l = mutationList.length; i < l; i++) {
                var mutation = mutationList[i];

                if (mutation.type === 'attributes') {
                    if (mutation.attributeName === 'it-response') {
                        var message = document.documentElement.getAttribute('it-response');

                        try {
                            message = JSON.parse(message);
                        } catch (error) {}

                        if (message && message.hasOwnProperty('getPlaybackRate')) {
                            sendResponse(message.getPlaybackRate);

                            this.disconnect();
                        }
                    }
                }
            }
        }).observe(document.documentElement, {
            attributes: true,
            childList: false,
            subtree: false
        });

        sendMessage({
            getPlaybackRate: true
        });

        return true;
    } else if (request.action === 'set-playback-speed') {
        sendMessage({
            setPlaybackSpeed: request.value
        });
    } else if (request.action === 'delete-youtube-cookies') {
        sendMessage({
            deleteCookies: true
        });
    }

    sendMessage({
        pageOnFocus: true
    });
});


/*------------------------------------------------------------------------------
6.0 INITIALIZATION
------------------------------------------------------------------------------*/

chrome.runtime.sendMessage({
    name: 'migration'
});

injectYoutubeScript();

chrome.storage.local.get('youtube_home_page', function (items) {
    var option = items.youtube_home_page;

    if (location.pathname === '/') {
        if (location.hostname === 'www.youtube.com') {
            if (
                option === '/feed/trending' ||
                option === '/feed/subscriptions' ||
                option === '/feed/history' ||
                option === '/playlist?list=WL' ||
                option === '/playlist?list=LL' ||
                option === '/feed/library'
            ) {
                location.replace(option);

                return;
            }
        }
    }
});

chrome.storage.local.get(function (items) {
    sendMessage({
        storage: items
    });

    attributes(items);

    if (window.matchMedia) {
        document.documentElement.dataset.systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
});

chrome.runtime.sendMessage({
    enabled: true
});