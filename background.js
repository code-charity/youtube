/*--------------------------------------------------------------
>>> BACKGROUND
----------------------------------------------------------------
1.0 Global variables
2.0 Functions
3.0 Context menu items
4.0 Message listener
5.0 Storage change listener
6.0 Tab focus/blur
7.0 Uninstall URL
8.0 Google Analytics
9.0 Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
1.0 GLOBAL VARIABLES
--------------------------------------------------------------*/

var locale_code = 'en',
    browser_icon = false;

/*--------------------------------------------------------------
2.0 FUNCTIONS
--------------------------------------------------------------*/

function isset(variable) {
    return !(typeof variable === 'undefined' || variable === null);
}

function getTranslations(path) {
    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function() {
        if (chrome && chrome.tabs) {
            chrome.tabs.query({}, function(tabs) {
                for (var i = 0, l = tabs.length; i < l; i++) {
                    if (tabs[i].hasOwnProperty('url')) {
                        chrome.tabs.sendMessage(tabs[i].id, {
                            name: 'translation_response',
                            value: xhr.responseText
                        });
                    }
                }
            });
        }

        chrome.runtime.sendMessage({
            name: 'translation_response',
            value: xhr.responseText
        });
    });

    xhr.addEventListener('error', function() {
        getTranslations('_locales/en/messages.json');
    });

    xhr.open('GET', path, true);
    xhr.send();
}

function browserActionIcon() {
    if (browser_icon === 'always') {
        chrome.browserAction.setIcon({
            path: 'assets/icons/32.png'
        });
    } else {
        chrome.browserAction.setIcon({
            path: 'assets/icons/32g.png'
        });
    }
}


/*--------------------------------------------------------------
3.0 CONTEXT MENU ITEMS
--------------------------------------------------------------*/

chrome.contextMenus.removeAll();

chrome.contextMenus.create({
    id: '1111',
    title: 'Donate',
    contexts: ['browser_action']
});

chrome.contextMenus.create({
    id: '1112',
    title: 'Rate me',
    contexts: ['browser_action']
});

chrome.contextMenus.create({
    id: '1113',
    title: 'GitHub',
    contexts: ['browser_action']
});

chrome.contextMenus.onClicked.addListener(function(event) {
    if (event.menuItemId === '1111') {
        window.open('https://www.improvedtube.com/donate');
    } else if (event.menuItemId === '1112') {
        window.open('https://chrome.google.com/webstore/detail/improvedtube-for-youtube/bnomihfieiccainjcjblhegjgglakjdd');
    } else if (event.menuItemId === '1113') {
        window.open('https://github.com/ImprovedTube/ImprovedTube');
    }
});


/*--------------------------------------------------------------
4.0 MESSAGE LISTENER
--------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (isset(request) && typeof request === 'object') {
        if (request.enabled === true && browser_icon !== 'always') {
            chrome.browserAction.setIcon({
                path: 'assets/icons/32.png',
                tabId: sender.tab.id
            });
        }

        if (request.name === 'translation_request') {
            getTranslations(request.path);
        }

        if (request.name === 'improvedtube-only-one-player') {
            chrome.tabs.query({}, function(tabs) {
                for (var i = 0, l = tabs.length; i < l; i++) {
                    if (tabs[i].hasOwnProperty('url') && sender.tab.id !== tabs[i].id) {
                        chrome.tabs.sendMessage(tabs[i].id, {
                            action: 'improvedtube-pause'
                        });
                    }
                }
            });
        }

        if (request.name === 'improvedtube-analyzer') {
            var data = request.value,
                date = new Date().toDateString(),
                hours = new Date().getHours() + ':00';

            chrome.storage.local.get(function(items) {
                if (!items.analyzer) {
                    items.analyzer = {};
                }

                if (!items.analyzer[date]) {
                    items.analyzer[date] = {};
                }

                if (!items.analyzer[date][hours]) {
                    items.analyzer[date][hours] = {};
                }

                if (!items.analyzer[date][hours][data]) {
                    items.analyzer[date][hours][data] = 0;
                }

                items.analyzer[date][hours][data]++;

                chrome.storage.local.set({
                    analyzer: items.analyzer
                });
            });
        }

        if (request.name === 'improvedtube-blacklist') {
            chrome.storage.local.get(function(items) {
                if (!items.blacklist || typeof items.blacklist !== 'object') {
                    items.blacklist = {};
                }

                if (request.data.type === 'channel') {
                    if (!items.blacklist.channels) {
                        items.blacklist.channels = {};
                    }

                    items.blacklist.channels[request.data.id] = {
                        title: request.data.title,
                        preview: request.data.preview
                    };
                }

                if (request.data.type === 'video') {
                    if (!items.blacklist.videos) {
                        items.blacklist.videos = {};
                    }

                    items.blacklist.videos[request.data.id] = {
                        title: request.data.title
                    };
                }

                chrome.storage.local.set({
                    blacklist: items.blacklist
                });
            });
        }

        if (request.name === 'improvedtube-watched') {
            chrome.storage.local.get(function(items) {
                if (!items.watched || typeof items.watched !== 'object') {
                    items.watched = {};
                }

                if (request.data.action === 'set') {
                    items.watched[request.data.id] = {
                        title: request.data.title
                    };
                }

                if (request.data.action === 'remove') {
                    delete items.watched[request.data.id];
                }

                chrome.storage.local.set({
                    watched: items.watched
                });
            });
        }

        if (request.name === 'download') {
            chrome.permissions.request({
                permissions: ['downloads'],
                origins: ['https://www.youtube.com/*']
            }, function(granted) {
                if (granted) {
                    try {
                        var blob = new Blob([JSON.stringify(request.value)], {
                            type: 'application/json;charset=utf-8'
                        });

                        chrome.downloads.download({
                            url: URL.createObjectURL(blob),
                            filename: request.filename,
                            saveAs: true
                        });
                    } catch (err) {
                        chrome.runtime.sendMessage({
                            name: 'dialog-error',
                            value: err
                        });
                    }
                } else {
                    chrome.runtime.sendMessage({
                        name: 'dialog-error',
                        value: 'permissionIsNotGranted'
                    });
                }
            });
        }

        if (request.name === 'improvedtube-play') {
            chrome.tabs.query({}, function(tabs) {
                for (var i = 0, l = tabs.length; i < l; i++) {
                    if (tabs[i].hasOwnProperty('url')) {
                        chrome.tabs.sendMessage(tabs[i].id, {
                            name: 'improvedtube-play',
                            id: request.id
                        });
                    }
                }
            });
        }

        if (isset(request.export)) {
            chrome.storage.local.get(function(data) {
                chrome.permissions.request({
                    permissions: ['downloads'],
                    origins: ['https://www.youtube.com/*']
                }, function(granted) {
                    if (granted) {
                        var blob = new Blob([JSON.stringify(data)], {
                                type: 'application/octet-stream'
                            }),
                            date = new Date();

                        chrome.downloads.download({
                            url: URL.createObjectURL(blob),
                            filename: 'improvedtube_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getFullYear() + '.txt',
                            saveAs: true
                        });
                    }
                });
            });
        }
    }
});


/*--------------------------------------------------------------
5.0 STORAGE CHANGE LISTENER
--------------------------------------------------------------*/

chrome.storage.onChanged.addListener(function(changes) {
    if (isset(changes.improvedtube_language)) {
        locale_code = changes.improvedtube_language.newValue;
    }

    if (isset(changes.improvedtube_browser_icon)) {
        browser_icon = changes.improvedtube_browser_icon.newValue;
    }

    browserActionIcon();
});


/*--------------------------------------------------------------
6.0 TAB FOCUS/BLUR
--------------------------------------------------------------*/

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.sendMessage(activeInfo.tabId, {
        action: 'focus'
    });

    chrome.tabs.getAllInWindow(activeInfo.windowId, function(tabs) {
        if (tabs) {
            for (var i = 0, l = tabs.length; i < l; i++) {
                if (tabs[i].id !== activeInfo.tabId) {
                    if (tabs[i].hasOwnProperty('url')) {
                        chrome.tabs.sendMessage(tabs[i].id, {
                            action: 'blur'
                        });
                    }
                }
            }
        }
    });
});


/*--------------------------------------------------------------
7.0 UNINSTALL URL
--------------------------------------------------------------*/

chrome.runtime.setUninstallURL('https://improvedtube.com/uninstalled');


/**--------------------------------------------------------------
8.0 GOOGLE ANALYTICS
--------------------------------------------------------------*/

var _gaq = _gaq || [];

(function() {
    var ga = document.createElement('script');

    _gaq.push(['_setAccount', 'UA-88354155-1']);
    _gaq.push(['_setSessionCookieTimeout', 14400000]);

    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';

    document.body.appendChild(ga);
})();

//**


/*--------------------------------------------------------------
9.0 INITIALIZATION
--------------------------------------------------------------*/

chrome.storage.local.get(function(items) {
    if (isset(items.improvedtube_language)) {
        locale_code = items.improvedtube_language;
    }

    if (isset(items.improvedtube_browser_icon)) {
        browser_icon = items.improvedtube_browser_icon;
    }

    browserActionIcon();

    var a = new Date().getTime();

    if (a - (items.ga || 0) >= 86400000) {
        _gaq.push(['_trackPageview', '/improvedtube-' + chrome.runtime.getManifest().version + '/background', 'page-loaded']);

        chrome.storage.local.set({
            ga: a
        });
    }
});