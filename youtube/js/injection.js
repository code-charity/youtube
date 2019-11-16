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

    inject += 'storage:' + JSON.stringify(items);

    for (var key in items) {
        var name = key;

        //if (name.indexOf('_theme') === -1) {
            document.documentElement.setAttribute('it-' + name.replace(/_/g, '-'), items[key]);
        //}
        //if (name.indexOf('_theme') !== -1) {

        //}
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

    if (name === 'schedule' || name === 'schedule_time_from' || name === 'schedule_time_to') {
        injectScript('ImprovedTube.bluelight();');
        injectScript('ImprovedTube.dim();');
        injectScript('ImprovedTube.theme();');
    }




    if (request == 'request_volume' && document.querySelector('video')) {
        sendResponse(document.querySelector('video').volume);
    } else if (typeof request == 'object' && request.name == 'change_volume') {
        injectScript(['if(document.querySelector(".html5-video-player")){document.querySelector(".html5-video-player").setVolume(' + request.volume + ');}'], 'improvedtube-mixer-data');
    } else if (request == 'request_playback_speed' && document.querySelector('video')) {
        sendResponse(document.querySelector('video').playbackRate);
    } else if (typeof request == 'object' && request.name == 'change_playback_speed') {
        injectScript(['if(document.querySelector(".html5-video-player video")){document.querySelector(".html5-video-player video").playbackRate = ' + request.playback_speed + ';}'], 'improvedtube-mixer-data');
    }
});