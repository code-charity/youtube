/*-----------------------------------------------------------------------------
>>> INJECTION
-------------------------------------------------------------------------------
1.0 Storage
2.0 Message listener
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Storage
-----------------------------------------------------------------------------*/

chrome.storage.local.get(function(items) {
    var inject = 'var ImprovedTube={';

    inject += 'storage:' + JSON.stringify(items);

    for (var key in items) {
        var name = key;

        document.documentElement.setAttribute('it-' + name.replace(/_/g, '-'), items[key]);
    }

    for (var key in ImprovedTube) {
        inject += ',' + key + ':' + ImprovedTube[key];
    }

    inject += '};ImprovedTube.init();';

    injectScript(inject);
});


/*-----------------------------------------------------------------------------
2.0 Message listener
-----------------------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var name = request.name || '',
        value = request.value;

    document.documentElement.setAttribute('it-' + name.replace(/_/g, '-'), value);

    injectScript('ImprovedTube.storage[\'' + name + '\']=' + (typeof value === 'boolean' ? value : '\'' + value + '\'') + ';');

    if (name.indexOf('theme') !== -1) {
        injectScript('ImprovedTube.theme();');
    }

    if (typeof ImprovedTube[name] === 'function') {
        injectScript('ImprovedTube.' + name + '();');
    }




    if (request == 'request_volume' && document.querySelector('video')) {
        sendResponse(document.querySelector('video').volume);
    } else if (typeof request == 'object' && request.name == 'change_volume') {
        injectScript(['if(document.querySelector(".html5-video-player")){document.querySelector(".html5-video-player").setVolume(' + request.volume + ');}'], 'improvedtube-mixer-data');
    } else if (request == 'request_playback_speed' && document.querySelector('video')) {
        sendResponse(document.querySelector('video').playbackRate);
    } else if (typeof request == 'object' && request.name == 'change_playback_speed') {
        injectScript(['if(document.querySelector(".html5-video-player")){document.querySelector(".html5-video-player").setPlaybackRate(' + request.playback_speed + ');}'], 'improvedtube-mixer-data');
    }
});