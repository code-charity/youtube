/*--------------------------------------------------------------
>>> BACKGROUND
----------------------------------------------------------------
# Google Analytics
# Uninstall URL
# Localization
# Context menu
# Tab focus/blur
# Initialization
    # Get items from storage
    # Storage change listener
    # Message listener
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GOOGLE ANALYTICS
--------------------------------------------------------------*/

function googleAnalytics(previous_time) {
    var script = document.createElement('script'),
        current_time = new Date().getTime(),
        _gaq = [];

    _gaq.push(['_setAccount', 'UA-88354155-1']);
    _gaq.push(['_setSessionCookieTimeout', 14400000]);

    if (current_time - (previous_time || 0) >= 86400000) {
        _gaq.push(['_trackPageview', '/improvedtube-' + chrome.runtime.getManifest().version + '/background', 'page-loaded']);

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

    code = code || window.navigator.language || 'en';

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
    chrome.contextMenus.removeAll();

    chrome.contextMenus.create({
        id: '0',
        title: locale['donate'] || 'donate',
        contexts: ['browser_action']
    });

    chrome.contextMenus.create({
        id: '1',
        title: locale['rateMe'] || 'rateMe',
        contexts: ['browser_action']
    });

    chrome.contextMenus.create({
        id: '2',
        title: 'GitHub',
        contexts: ['browser_action']
    });

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
# MESSAGE LISTENER
--------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (typeof request === 'object') {
        if (request.name === 'translation_request') {
            getLocalization(request.path, function () {
                if (chrome && chrome.tabs) {
                    chrome.tabs.query({}, function (tabs) {
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
        }

        if (request.name === 'improvedtube-only-one-player') {
            chrome.tabs.query({}, function (tabs) {
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

            chrome.storage.local.get(function (items) {
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
            chrome.storage.local.get(function (items) {
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
            chrome.storage.local.get(function (items) {
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
            chrome.tabs.query({}, function (tabs) {
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

        if (request.hasOwnProperty('export')) {
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
                        for (var i = 0, l = tabs.length; i < l; i++) {
                            if (tabs[i].active && tabs[i].hasOwnProperty('url')) {
                                chrome.tabs.sendMessage(tabs[i].id, {
                                    action: 'focus'
                                });
                            }
                        }
                    }
                });
            } else {
                chrome.tabs.getAllInWindow(windows[i].id, function (tabs) {
                    if (tabs) {
                        for (var i = 0, l = tabs.length; i < l; i++) {
                            if (tabs[i].hasOwnProperty('url')) {
                                chrome.tabs.sendMessage(tabs[i].id, {
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
# INITIALIZATION
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GET ITEMS FROM STORAGE
--------------------------------------------------------------*/

chrome.storage.local.get(function (storage) {
    //googleAnalytics(items.ga);
    //uninstallURL();

    getLocalization(storage.language, function (locale) {
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

chrome.runtime.onMessage.addListener(function (request, sender) {
    var name = request.name;

    if (true) {

    }
});