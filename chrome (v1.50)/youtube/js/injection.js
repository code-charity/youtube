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

chrome.runtime.onMessage.addListener(function(request) {
    var name = request.name,
        value = request.value;

    document.documentElement.setAttribute('it-' + name.replace(/_/g, '-'), value);

    injectScript('ImprovedTube.storage[\'' + name + '\']=\'' + value + '\';');

    if (typeof ImprovedTube[name] === 'function') {
        injectScript('ImprovedTube.' + name + '();');
    }
});