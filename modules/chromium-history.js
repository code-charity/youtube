/*-----------------------------------------------------------------------------
>>> CHROMIUM HISTORY
-----------------------------------------------------------------------------*/

Satus.chromium_history = {
    get: function(query, callback) {
        chrome.history.search({
            text: query,
            maxResults: 9999
        }, function(items) {
            callback(items);
        });
    }
};