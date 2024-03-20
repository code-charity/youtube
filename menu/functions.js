/*--------------------------------------------------------------
>>> FUNCTIONS:
----------------------------------------------------------------
# Attributes
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# ATTRIBUTES
--------------------------------------------------------------*/

extension.attributes = function () {
    var attributes = {
        theme: true,
        improvedtube_home: true,
        title_version: true,
        it_general: true,
        it_appearance: true,
        it_themes: true,
        it_player: true,
        it_playlist: true,
        it_channel: true,
        it_shortcuts: true,
        it_blocklist: true,
        it_analyzer: true,
        layer_animation_scale: false
    };

    for (var attribute in attributes) {
        var value = satus.storage.get(attribute);

        if (attribute === 'improvedtube_home') {
            attribute = 'home-style';
        }

        if (satus.isset(value)) {
            extension.skeleton.rendered.setAttribute(attribute.replace('it_', '').replace(/_/g, '-'), value);
        }
    }
};

// The remaining functions related to exporting, importing, and syncing settings are removed as they are replaced by the following code.

/*--------------------------------------------------------------
# SYNC SETTINGS
--------------------------------------------------------------*/

extension.syncSettings = function () {
    chrome.storage.sync.set(satus.storage.data, function() {
        console.log("Settings synchronized.");
    });
}

/*--------------------------------------------------------------
# PULL SETTINGS
--------------------------------------------------------------*/

extension.pullSettings = function () {
    chrome.storage.sync.get(null, function(syncedData) {
        for (var key in syncedData) {
            satus.storage.set(key, syncedData[key]);
        }
        console.log("Settings pulled from synced storage.");
    });
}
