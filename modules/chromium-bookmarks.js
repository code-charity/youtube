/*-----------------------------------------------------------------------------
>>> CHROMIUM BOOKMARKS
-----------------------------------------------------------------------------*/

Satus.chromium_bookmarks = {
    get: function(callback) {
        chrome.bookmarks.getTree(function(items) {
            callback(items);
        });
    }
};