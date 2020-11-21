/*------------------------------------------------------
>>> INDEX
--------------------------------------------------------
# Import
# On changed
------------------------------------------------------*/

/*------------------------------------------------------
# IMPORT
------------------------------------------------------*/

satus.storage.import(function(items) {
    var html = document.documentElement;

    if (
        chrome &&
        chrome.runtime &&
        chrome.runtime.getManifest().version_name.indexOf('beta') === -1
    ) {
        html.setAttribute('stable-version', '');
    }

    for (var key in items) {
        html.setAttribute('it-' + key.replace(/_/g, '-'), items[key]);
    }

    if (items.default_dark_theme === true) {
        html.setAttribute('theme', 'dark');
    } else if (items.night_theme === true) {
        html.setAttribute('theme', 'night');
    } else if (items.dawn_theme === true) {
        html.setAttribute('theme', 'dawn');
    } else if (items.sunset_theme === true) {
        html.setAttribute('theme', 'sunset');
    } else if (items.desert_theme === true) {
        html.setAttribute('theme', 'desert');
    } else if (items.plain_theme === true) {
        html.setAttribute('theme', 'plain');
    } else if (items.black_theme === true) {
        html.setAttribute('theme', 'black');
    }

    satus.locale.import(items.language, function() {
        satus.updateStorageKeys(Menu, function() {
            satus.render(Menu, document.body);
        });
    });
});


/*------------------------------------------------------
# ON CHANGED
------------------------------------------------------*/

satus.storage.onChanged(function(items) {
    for (var key in items) {
        document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), items[key].newValue);
    }
});