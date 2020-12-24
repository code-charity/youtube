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
            if (option !== '/' && option !== 'search') {
                location.replace(option);
            }
        }
    }
}


/*------------------------------------------------------------------------------
2.0 ISSET
------------------------------------------------------------------------------*/

function isset(variable) {
    if (typeof variable === 'undefined' || variable === null) {
        return false;
    }

    return true;
};

function camelize(string) {
    return string.replace(/_[a-z]/g, function(match) {
        return match[1].toUpperCase();
    });
}

function attributes(items) {
    var whitelist = {
        'youtube-home-page': true
    };

    for (var key in items) {
        var attribute = key.replace(/_/g, '-');

        //if (whitelist.hasOwnProperty(attribute)) {
            document.documentElement.setAttribute('it-' + attribute, items[key]);
        //}
    }
}


/*------------------------------------------------------------------------------
3.0 INITIALIZATION
------------------------------------------------------------------------------*/

function injectScript(textContent) {
    var script = document.createElement('script');

    script.textContent = textContent;

    document.documentElement.appendChild(script);

    script.remove();
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
    }

    injectScript('ImprovedTube.onfocus();');
});


chrome.runtime.sendMessage({
    enabled: true
});