chrome.storage.local.get(function(items) {
    for (var key in items) {
        document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), items[key]);
    }
});

chrome.storage.onChanged.addListener(function(changes) {
    for (var key in changes) {
        document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), changes[key].newValue);
    }
});

satus.storage.import(function() {
    if (satus.storage.get('default_dark_theme') === true) {
        document.documentElement.setAttribute('theme', 'dark');
    }
    
    if (satus.storage.get('night_theme') === true) {
        document.documentElement.setAttribute('theme', 'night');
    }
    
    if (satus.storage.get('dawn_theme') === true) {
        document.documentElement.setAttribute('theme', 'dawn');
    }
    
    if (satus.storage.get('sunset_theme') === true) {
        document.documentElement.setAttribute('theme', 'sunset');
    }
    
    if (satus.storage.get('desert_theme') === true) {
        document.documentElement.setAttribute('theme', 'desert');
    }
    
    if (satus.storage.get('plain_theme') === true) {
        document.documentElement.setAttribute('theme', 'plain');
    }
    
    if (satus.storage.get('black_theme') === true) {
        document.documentElement.setAttribute('theme', 'black');
    }

    satus.locale.import(satus.storage.get('language'), function() {
        satus.modules.updateStorageKeys(Menu, function() {
            satus.render(Menu, document.body);
        });
    });
});
