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

var tabId = null,
    storage = {};

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

function sendMessage(object, callback, name) {
    document.documentElement.setAttribute('it-message', JSON.stringify(object));

    if (typeof callback === 'function') {
        new MutationObserver(function (mutationList) {
            for (var i = 0, l = mutationList.length; i < l; i++) {
                var mutation = mutationList[i];

                if (mutation.type === 'attributes') {
                    if (mutation.attributeName === 'it-response') {
                        var message = document.documentElement.getAttribute('it-response');

                        try {
                            message = JSON.parse(message);
                        } catch (error) {}

                        if (object[name]) {
                            message.tabId = tabId;

                            callback(message);
                        }

                        this.disconnect();
                    }
                }
            }
        }).observe(document.documentElement, {
            attributes: true,
            childList: false,
            subtree: false
        });
    }
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

        storage[key] = value;

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
    } else if (request.action === 'pause') {
        sendMessage({
            pause: true
        });
    } else if (request.action === 'set-volume') {
        sendMessage({
            setVolume: request.value
        });
    } else if (request.action === 'set-playback-speed') {
        sendMessage({
            setPlaybackSpeed: request.value
        });
    } else if (request.action === 'mixer') {
        sendMessage({
            mixer: true
        }, sendResponse, 'mixer');

        return true;
    } else if (request.action === 'delete-youtube-cookies') {
        sendMessage({
            deleteCookies: true
        });
    }
});


/*------------------------------------------------------------------------------
6.0 INITIALIZATION
------------------------------------------------------------------------------*/

injectYoutubeScript();

chrome.runtime.sendMessage({
    name: 'migration'
}, function (response) {
    tabId = response;
});

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
    storage = items;

    sendMessage({
        storage: items
    });

    attributes(items);

    if (window.matchMedia) {
        document.documentElement.dataset.systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
});

new MutationObserver(function (mutationList) {
    for (var i = 0, l = mutationList.length; i < l; i++) {
        var mutation = mutationList[i];

        if (mutation.type === 'attributes') {
            if (mutation.attributeName === 'it-message') {
                var message = document.documentElement.getAttribute('it-message');

                try {
                    message = JSON.parse(message);
                } catch (error) {}

                if (message && message.requestOptionsUrl) {
                    sendMessage({
                        responseOptionsUrl: chrome.runtime.getURL('ui/options.html')
                    });
                } else if (message && message.onlyOnePlayer) {
                    chrome.runtime.sendMessage({
                        name: 'only-one-player'
                    });
                }
            }
        }
    }
}).observe(document.documentElement, {
    attributes: true,
    childList: false,
    subtree: false
});

chrome.runtime.sendMessage({
    enabled: true
});

document.addEventListener('ImprovedTubeWatched', function (event) {
    if (chrome && chrome.runtime) {
        var action = event.detail.action,
            id = event.detail.id;

        if (!storage.watched || typeof storage.watched !== 'object') {
            storage.watched = {};
        }

        if (action === 'set') {
            storage.watched[id] = {
                title: event.detail.title
            };
        }

        if (action === 'remove') {
            delete storage.watched[id];
        }

        chrome.storage.local.set({
            watched: storage.watched
        });
    }
});

document.addEventListener('ImprovedTubeBlacklist', function (event) {
    if (chrome && chrome.runtime) {
        var type = event.detail.type,
            id = event.detail.id,
            title = event.detail.title;

        if (!storage.blacklist || typeof storage.blacklist !== 'object') {
            storage.blacklist = {};
        }

        if (type === 'channel') {
            if (!storage.blacklist.channels) {
                storage.blacklist.channels = {};
            }

            storage.blacklist.channels[id] = {
                title: title,
                preview: event.detail.preview
            };
        }

        if (type === 'video') {
            if (!storage.blacklist.videos) {
                storage.blacklist.videos = {};
            }

            storage.blacklist.videos[id] = {
                title: title
            };
        }

        chrome.storage.local.set({
            blacklist: storage.blacklist
        });
    }
});

document.addEventListener('analyzer', function (event) {
    if (storage.analyzer_activation === true) {
        var data = event.detail.name,
            date = new Date().toDateString(),
            hours = new Date().getHours() + ':00';

        if (!storage.analyzer) {
            storage.analyzer = {};
        }

        if (!storage.analyzer[date]) {
            storage.analyzer[date] = {};
        }

        if (!storage.analyzer[date][hours]) {
            storage.analyzer[date][hours] = {};
        }

        if (!storage.analyzer[date][hours][data]) {
            storage.analyzer[date][hours][data] = 0;
        }

        storage.analyzer[date][hours][data]++;

        chrome.storage.local.set({
            analyzer: storage.analyzer
        });
    }
});