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
    # Update listener
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

    for (var key in items) {
        var item = items[key];

        if (key.indexOf('shortcut') !== -1 && typeof item === 'string') {
            try {
                item = JSON.parse(item);

                var value = {
                    alt: item.altKey,
                    ctrl: item.ctrlKey,
                    shift: item.shiftKey
                };

                if (item.hasOwnProperty('key') && item.hasOwnProperty('keyCode')) {
                    value.keys = {};

                    value.keys[item.keyCode] = {
                        key: item.key
                    };
                }

                if (item.hasOwnProperty('wheel')) {
                    value.wheel = item.wheel < 0 ? -1 : 1;
                }

                items[key] = value;
            } catch (error) {
                console.log(error);
            }
        }
    }

    if (items.theme_my_colors === true) {
        items.theme = 'my-colors';
    } else if (items.default_dark_theme === true) {
        items.theme = 'dark';
    } else if (items.night_theme === true) {
        items.theme = 'night';
    } else if (items.dawn_theme === true) {
        items.theme = 'dawn';
    } else if (items.sunset_theme === true) {
        items.theme = 'sunset';
    } else if (items.desert_theme === true) {
        items.theme = 'desert';
    } else if (items.plain_theme === true) {
        items.theme = 'plain';
    } else if (items.black_theme === true) {
        items.theme = 'black';
    }

    if (typeof items.theme_primary_color === 'string') {
        var match = items.theme_primary_color.match(/[0-9.]+/g);

        if (match) {
            for (var i = 0, l = match.length; i < l; i++) {
                match[i] = parseFloat(match[i]);
            }
        }

        items.theme_primary_color = match;
    }

    if (typeof items.theme_text_color === 'string') {
        var match = items.theme_text_color.match(/[0-9.]+/g);

        if (match) {
            for (var i = 0, l = match.length; i < l; i++) {
                match[i] = parseFloat(match[i]);
            }
        }

        items.theme_text_color = match;
    }

    chrome.storage.local.set(items);

    chrome.storage.local.remove('hd_thumbnails');
    chrome.storage.local.remove('theme_my_colors');
    chrome.storage.local.remove('default_dark_theme');
    chrome.storage.local.remove('night_theme');
    chrome.storage.local.remove('dawn_theme');
    chrome.storage.local.remove('sunset_theme');
    chrome.storage.local.remove('desert_theme');
    chrome.storage.local.remove('plain_theme');
    chrome.storage.local.remove('black_theme');
}


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GET ITEMS FROM STORAGE
--------------------------------------------------------------*/

chrome.storage.local.get(function (items) {
    var language = items.language || window.navigator.language;

    if (language.indexOf('en') === 0) {
        language = 'en';
    }

    //googleAnalytics(items.ga);
    uninstallURL();

    getLocalization(language, function (locale) {
        updateContextMenu(locale);
    });

    migration(items);
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

    if (name === 'migration') {
        chrome.storage.local.get(function (items) {
            try {
                migration(items);
            } catch (error) {}

            setTimeout(function () {
                sendResponse();
            }, 500);
        });

        return true;
    } else if (name === 'get-localization') {
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


/*--------------------------------------------------------------
# UPDATE LISTENER
--------------------------------------------------------------*/

chrome.runtime.onInstalled.addListener(function (details) {
    chrome.storage.local.get(function (items) {
        migration(items);
    });
});