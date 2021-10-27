/*--------------------------------------------------------------
>>> BACKGROUND
----------------------------------------------------------------
# Google Analytics
# Uninstall URL
# Localization
# Context menu
# Tab focus/blur
# Migration
# Initialization
    # Get items from storage
    # Storage change listener
    # Message listener
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GOOGLE ANALYTICS
--------------------------------------------------------------*/

function googleAnalytics(previous_time) {
    var version = chrome.runtime.getManifest().version,
        script = document.createElement('script'),
        current_time = new Date().getTime(),
        _gaq = [];

    _gaq.push(['_setAccount', 'UA-88354155-1']);
    _gaq.push(['_setSessionCookieTimeout', 14400000]);

    if (current_time - (previous_time || 0) >= 86400000) {
        _gaq.push([
            '_trackPageview',
            '/improvedtube-' + version + '/background',
            'page-loaded'
        ]);

        chrome.storage.local.set({
            ga: current_time
        });
    }

    script.src = 'https://ssl.google-analytics.com/ga.js';

    document.body.appendChild(script);
}


/*--------------------------------------------------------------
# UNINSTALL URL
--------------------------------------------------------------*/

function uninstallURL() {
    chrome.runtime.setUninstallURL('https://improvedtube.com/uninstalled');
}


/*--------------------------------------------------------------
# LOCALIZATION
--------------------------------------------------------------*/

function getLocalization(code, callback) {
    var xhr = new XMLHttpRequest();

    if (!code) {
        code = window.navigator.language;
    }

    xhr.onload = function () {
        try {
            var response = JSON.parse(this.response),
                result = {};

            for (var key in response) {
                result[key] = response[key].message;
            }

            callback(result);
        } catch (error) {
            console.error(error);
        }
    };

    xhr.onerror = function () {
        xhr.open('GET', '_locales/en/messages.json', true);
        xhr.send();
    };

    xhr.open('GET', '_locales/' + code + '/messages.json', true);
    xhr.send();
}


/*--------------------------------------------------------------
# CONTEXT MENU
--------------------------------------------------------------*/

function updateContextMenu(locale) {
    var items = [
        'donate',
        'rateMe',
        'GitHub'
    ];

    chrome.contextMenus.removeAll();

    for (var i = 0; i < 3; i++) {
        var item = items[i];

        chrome.contextMenus.create({
            id: String(i),
            title: locale[item] || item,
            contexts: ['browser_action']
        });
    }

    chrome.contextMenus.onClicked.addListener(function (info) {
        var links = [
            'https://www.improvedtube.com/donate',
            'https://chrome.google.com/webstore/detail/improve-youtube-video-you/bnomihfieiccainjcjblhegjgglakjdd',
            'https://github.com/code4charity/YouTube-Extension'
        ];

        window.open(links[info.menuItemId]);
    });
}


/*--------------------------------------------------------------
# TAB FOCUS/BLUR
--------------------------------------------------------------*/

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.sendMessage(activeInfo.tabId, {
        action: 'focus'
    });

    chrome.tabs.getAllInWindow(activeInfo.windowId, function (tabs) {
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

chrome.windows.onFocusChanged.addListener(function (windowId) {
    chrome.windows.getAll(function (windows) {
        for (var i = 0, l = windows.length; i < l; i++) {
            if (windows[i].focused === true) {
                chrome.tabs.getAllInWindow(windows[i].id, function (tabs) {
                    if (tabs) {
                        for (var j = 0, k = tabs.length; j < k; j++) {
                            var tab = tabs[j];

                            if (tab.active && tab.hasOwnProperty('url')) {
                                chrome.tabs.sendMessage(tab.id, {
                                    action: 'focus'
                                });
                            }
                        }
                    }
                });
            } else {
                chrome.tabs.getAllInWindow(windows[i].id, function (tabs) {
                    if (tabs) {
                        for (var j = 0, k = tabs.length; j < k; j++) {
                            var tab = tabs[j];

                            if (tab.hasOwnProperty('url')) {
                                chrome.tabs.sendMessage(tab.id, {
                                    action: 'blur'
                                });
                            }
                        }
                    }
                });
            }
        }
    });
});


/*--------------------------------------------------------------
# MIGRATION
--------------------------------------------------------------*/

function migration(items) {
    if (items.hd_thumbnails === true) {
        items.thumbnails_quality = 'maxresdefault';
    }

    delete items.hd_thumbnails;
}


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GET ITEMS FROM STORAGE
--------------------------------------------------------------*/

chrome.storage.local.get(function (items) {
    //googleAnalytics(items.ga);
    //uninstallURL();
    migration(items);

    getLocalization(items.language, function (locale) {
        updateContextMenu(locale);
    });
});


/*--------------------------------------------------------------
# STORAGE CHANGE LISTENER
--------------------------------------------------------------*/

chrome.storage.onChanged.addListener(function (changes) {
    if (changes.language) {
        language = changes.language.newValue;
    }
});


/*--------------------------------------------------------------
# MESSAGE LISTENER
--------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var name = request.name;

    if (name === 'get-localization') {
        getLocalization(request.code, function (locale) {
            sendResponse(locale);
        });

        return true;
    } else if (name === 'only-one-player') {
        chrome.tabs.query({}, function (tabs) {
            for (var i = 0, l = tabs.length; i < l; i++) {
                var tab = tabs[i];

                if (tab.hasOwnProperty('url') && sender.tab.id !== tab.id) {
                    chrome.tabs.sendMessage(tabs[i].id, {
                        action: 'improvedtube-pause'
                    });
                }
            }
        });
    } else if (name === 'download') {
        chrome.permissions.request({
            permissions: ['downloads'],
            origins: ['https://www.youtube.com/*']
        }, function (granted) {
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
                } catch (error) {
                    console.error(error);
                }
            } else {
                console.error('Permission is not granted.');
            }
        });
    } else if (name === 'export') {
        chrome.storage.local.get(function (data) {
            chrome.permissions.request({
                permissions: ['downloads'],
                origins: ['https://www.youtube.com/*']
            }, function (granted) {
                if (granted) {
                    var blob = new Blob([JSON.stringify(data)], {
                            type: 'application/octet-stream'
                        }),
                        date = new Date();

                    chrome.downloads.download({
                        url: URL.createObjectURL(blob),
                        filename: 'improvedtube-' + (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear() + '.txt',
                        saveAs: true
                    });
                }
            });
        });
    }
});