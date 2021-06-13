/*------------------------------------------------------------------------------
>>> TABLE OF CONTENTS:
--------------------------------------------------------------------------------
1.0 Features
2.0 Isset
3.0 Initialization
4.0 Change listener
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
1.0 FEATURES
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
1.1 YOUTUBE HOME PAGE
------------------------------------------------------------------------------*/

function youtubeHomePage(option) {
    if (location.pathname === '/') {
        if (location.hostname === 'www.youtube.com') {
            if (
                option === '/feed/trending' ||
                option === '/feed/subscriptions' ||
                option === '/feed/history' ||
                option === '/playlist?list=WL'  ||
                option === '/playlist?list=LL'  ||
                option === '/feed/library'
            ) {
                location.replace(option);
            }
        }
    }
}


/*------------------------------------------------------------------------------
2.0 ISSET
------------------------------------------------------------------------------*/

function isset(variable) {
    return !(typeof variable === 'undefined' || variable === null);
}

function camelize(string) {
    return string.replace(/_[a-z]/g, function(match) {
        return match[1].toUpperCase();
    });
}

function attributes(items) {
    var whitelist = {
        'youtube-home-page': true,
        'remove-related-search-results': true,
        'squared-user-images': true,
        'hide-animated-thumbnails': true,
        'header-position': true,
        'header-improve-logo': true,
        'header-hide-right-buttons': true,
        'header-hide-country-code': true,
        'player-hide-annotations': true,
        'player-hide-cards': true,
        'player-show-cards-on-mouse-hover': true,
        'player-size': true,
        'player-color': true,
        'player-transparent-background': true,
        'player-hide-endscreen': true,
        'hide-scroll-for-details': true,
        'always-show-progress-bar': true,
        'hide-details': true,
        'description': true,
        'hide-views-count': true,
        'likes': true,
        'red-dislike-button': true,
        'livechat': true,
        'hide-playlist': true,
        'related-videos': true,
        'comments': true,
        'hide-footer': true,
        'night-theme': true,
        'dawn-theme': true,
        'sunset-theme': true,
        'desert-theme': true,
        'plain-theme': true,
        'black-theme': true,
        'player-crop-chapter-titles': true,
        'player-ads': true,
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
3.0 INITIALIZATION
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

chrome.storage.local.get('youtube_home_page', function(items) {
    youtubeHomePage(items.youtube_home_page);
});

chrome.storage.local.get(function(items) {
    var textContent = 'var ImprovedTube={';

    // <HTML> attributes
    attributes(items);

    // Isset
    textContent += 'isset:' + isset + ',';

    // Features
    for (var key in ImprovedTube) {
        textContent += key + ': ' + ImprovedTube[key] + ',';
    }

    // Storage
    textContent += 'storage:' + JSON.stringify(items);

    // Initialization
    textContent += '};ImprovedTube.init();';

    document.documentElement.dataset.systemColorScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    injectScript(textContent);
});


/*------------------------------------------------------------------------------
4.0 CHANGE LISTENER
------------------------------------------------------------------------------*/

chrome.storage.onChanged.addListener(function(changes) {
    for (var key in changes) {
        var value = changes[key].newValue,
            func = camelize(key);

        document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), value);

        injectScript('ImprovedTube.storage[\'' + key + '\']=' + (typeof value === 'boolean' ? value : '\'' + value + '\'') + ';');

        if (typeof ImprovedTube[func] === 'function') {
            injectScript('ImprovedTube.' + func + '();');
        }
    }
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'focus') {
        injectScript('ImprovedTube.focus = true;');
    } else if (request.action === 'blur') {
        injectScript('ImprovedTube.focus = false;');
    } else if (request.action === 'improvedtube-pause') {
        injectScript('if (document.querySelector("video")) { document.querySelector("video").pause(); }');
    }

    injectScript('ImprovedTube.onfocus();');
});


chrome.runtime.sendMessage({
    enabled: true
});
