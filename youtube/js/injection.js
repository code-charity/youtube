/*-----------------------------------------------------------------------------
>>> INJECTION
-------------------------------------------------------------------------------
1.0 Initialization
2.0 Storage listener
3.0 Message listener
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Initialization
-----------------------------------------------------------------------------*/

chrome.storage.local.get(function(items) {
    var content = 'var ImprovedTube={';

    if (typeof items.player_volume === 'string') {
        items.player_volume = Number(items.player_volume);
    }

    if (!items.hasOwnProperty('header_position')) {
        items.header_position = 'normal';
    }

    if (!items.hasOwnProperty('player_size')) {
        items.player_size = 'do_not_change';
    }

    if (items.bluelight === '0') {
        items.bluelight = 0;
    }

    if (items.dim === '0') {
        items.dim = 0;
    }

    withoutInjection(items);

    content += 'storage:' + JSON.stringify(items);

    for (var key in items) {
        document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), items[key]);
    }

    for (var key in ImprovedTube) {
        content += ',' + key + ':' + ImprovedTube[key];
    }

    content += '};ImprovedTube.init();';

    injectScript(content);
});


/*-----------------------------------------------------------------------------
2.0 Storage listener
-----------------------------------------------------------------------------*/

chrome.storage.onChanged.addListener(function(changes) {
    for (var key in changes) {
        var value = changes[key].newValue;

        document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), value);

        injectScript('ImprovedTube.storage[\'' + key + '\']=' + (typeof value === 'boolean' ? value : '\'' + value + '\'') + ';');

        if (typeof ImprovedTube[key] === 'function') {
            injectScript('ImprovedTube.' + key + '();');
        }

        if (key === 'schedule' || key === 'schedule_time_from' || key === 'schedule_time_to') {
            injectScript('ImprovedTube.bluelight();');
            injectScript('ImprovedTube.dim();');
            injectScript('ImprovedTube.theme();');
        }
    }
});


/*-----------------------------------------------------------------------------
3.0 Message listener
-----------------------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var name = request.name || '',
        value = request.value;

    if (request == 'request_volume' && document.querySelector('video')) {
        sendResponse(document.querySelector('video').volume);
    } else if (typeof request == 'object' && request.name == 'change_volume') {
        injectScript(['if(document.querySelector(".html5-video-player")){document.querySelector(".html5-video-player").setVolume(' + request.volume + ');}'], 'improvedtube-mixer-data');
    } else if (request == 'request_playback_speed' && document.querySelector('video')) {
        sendResponse(document.querySelector('video').playbackRate);
    } else if (typeof request == 'object' && request.name == 'change_playback_speed') {
        injectScript(['if(document.querySelector(".html5-video-player video")){document.querySelector(".html5-video-player video").playbackRate = ' + request.playback_speed + ';}'], 'improvedtube-mixer-data');
    } else if (request === 'delete_youtube_cookies') {
        var cookies = document.cookie.split(';');

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i],
                eqPos = cookie.indexOf('='),
                name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

            document.cookie = name + '=; domain=.youtube.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }

        setTimeout(function() {
            location.reload();
        }, 250);
    }
});