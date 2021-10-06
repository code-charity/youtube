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
    var whitelist = {
        'youtube-home-page': true,
        'remove-related-search-results': true,
        'limit-page-width': true,
        'squared-user-images': true,
        'hide-animated-thumbnails': true,
        'hide-thumbnail-overlay': true,
        'header-position': true,
        'header-improve-logo': true,
        'header-hide-right-buttons': true,
        'header-hide-country-code': true,
        'hide-voice-search-button': true,
        'player-hide-annotations': true,
        'player-hide-cards': true,
        'player-show-cards-on-mouse-hover': true,
        'player-size': true,
        'player-color': true,
        'player-transparent-background': true,
        'player-hide-endscreen': true,
        'hide-scroll-for-details': true,
        'always-show-progress-bar': true,
        'player-hide-skip-overlay': true,
        'hide-details': true,
        'hide-views-count': true,
        'hide-date': true,
        'hide-share-button': true,
        'hide-save-button': true,
        'hide-more-button': true,
        'likes': true,
        'red-dislike-button': true,
        'description': true,
        'livechat': true,
        'hide-playlist': true,
        'related-videos': true,
        'comments': true,
        'sidebar-left':true,
        'thumbnails-right': true,
        'thumbnails-hide': true,
        'hide-footer': true,
        'bluelight': true,
        'night-theme': true,
        'dawn-theme': true,
        'sunset-theme': true,
        'desert-theme': true,
        'plain-theme': true,
        'black-theme': true,
        'player-crop-chapter-titles': true,
        'player-ads': true,
        'scroll-bar': true,
        'improvedtube-youtube-icon': true
    };

    for (var key in items) {
        var attribute = key.replace(/_/g, '-');

        if (whitelist.hasOwnProperty(attribute)) {
            document.documentElement.setAttribute('it-' + attribute, items[key]);
        }
    }
}


/*------------------------------------------------------------------------------
3.0 INJECTION
------------------------------------------------------------------------------*/

function injectScript(string) {
    var script = document.createElement('script');

    script.textContent = string;

    document.documentElement.appendChild(script);

    script.remove();
}

function injectStyles(string, id) {
    var style = document.createElement('style');

    style.textContent = string;

    if (id) {
        style.id = id;
    }

    document.documentElement.appendChild(style);
}


/*------------------------------------------------------------------------------
4.0 STORAGE LISTENER
------------------------------------------------------------------------------*/

chrome.storage.onChanged.addListener(function (changes) {
    for (var key in changes) {
        var attribute = key.replace(/_/g, '-'),
            name = camelize(attribute),
            value = changes[key].newValue;

        if (name === 'blacklistActivate') {
            name = 'blacklist';
        } else if (name === 'playerForcedPlaybackSpeed') {
            name = 'playerPlaybackSpeed';
        }

        ImprovedTube.storage[key] = value;

        document.documentElement.setAttribute('it-' + attribute, value);

        injectScript('ImprovedTube.storage[\'' + key + '\']=' + (typeof value === 'boolean' ? value : '\'' + value + '\'') + ';');

        if (typeof ImprovedTube[name] === 'function') {
            injectScript('ImprovedTube.' + name + '();');
        }
    }
});


/*------------------------------------------------------------------------------
5.0 MESSAGE LISTENER
------------------------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'focus') {
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
            sendResponse(element.volume);
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
    }  else if (request.action === 'delete-youtube-cookies') {
        injectScript('ImprovedTube.deleteYoutubeCookies();');
    } 

    injectScript('ImprovedTube.pageOnFocus();');
});


/*------------------------------------------------------------------------------
6.0 INITIALIZATION
------------------------------------------------------------------------------*/

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

    chrome.storage.local.get(function (items) {
        var textContent = 'var ImprovedTube={';

        ImprovedTube.storage = items;

        for (var key in ImprovedTube) {
            var value = ImprovedTube[key];

            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }

            textContent += key + ': ' + value + ',';
        }

        textContent += '};ImprovedTube.init();';

        injectScript(textContent);

        attributes(items);

        if (window.matchMedia) {
            document.documentElement.dataset.systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
    });
});

chrome.runtime.sendMessage({
    enabled: true
});