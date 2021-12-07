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
        var item = {},
            attribute = key.replace(/_/g, '-'),
            name = camelize(attribute),
            value = changes[key].newValue;

        if (name === 'blacklistActivate') {
            name = 'blacklist';
        } else if (name === 'playerForcedPlaybackSpeed') {
            name = 'playerPlaybackSpeed';
        }

        document.documentElement.setAttribute('it-' + attribute, value);

        item.key = key;
        item.func = name;
        item.value = value;

        document.documentElement.setAttribute('it-message', '{"storage-update": ' + JSON.stringify(item) + '}');
    }
});


/*------------------------------------------------------------------------------
5.0 MESSAGE LISTENER
------------------------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    /*if (request.action === 'focus') {
        injectScript('ImprovedTube.focus = true;');
    } else if (request.action === 'blur') {
        injectScript(`
            ImprovedTube.focus = false;
            document.dispatchEvent(new CustomEvent('improvedtube-blur'));
        `);
    } else if (request.action === 'improvedtube-pause') {
        injectScript(`
            if (ImprovedTube.elements.player) {
                ImprovedTube.played_before_blur = ImprovedTube.elements.player.getPlayerState() === 1;
                ImprovedTube.elements.player.pauseVideo();
            }
        `);
    } else if (request.action === 'request-volume') {
        var element = document.querySelector('video');

        if (element) {
            sendResponse(element.volume * 100);
        }
    } else if (request.action === 'set-volume') {
        var element = document.querySelector('video');

        if (element) {
            element.volume = request.value / 100;
        }
    } else if (request.action === 'request-playback-speed') {
        var element = document.querySelector('video');

        if (element) {
            sendResponse(element.playbackRate);
        }
    } else if (request.action === 'set-playback-speed') {
        var element = document.querySelector('video');

        if (element) {
            element.playbackRate = request.value;
        }
    } else if (request.action === 'delete-youtube-cookies') {
        injectScript('ImprovedTube.deleteYoutubeCookies();');
    }

    injectScript('ImprovedTube.pageOnFocus();');*/
});


/*------------------------------------------------------------------------------
6.0 INITIALIZATION
------------------------------------------------------------------------------*/

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

    chrome.runtime.sendMessage({
        name: 'migration'
    });
});

chrome.storage.local.get(function (items) {
    document.documentElement.setAttribute('it-message', '{"storage": ' + JSON.stringify(items) + '}');

    attributes(items);

    if (window.matchMedia) {
        document.documentElement.dataset.systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
});

chrome.runtime.sendMessage({
    enabled: true
});