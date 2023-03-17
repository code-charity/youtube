/*--------------------------------------------------------------
>>> BACKGROUND
----------------------------------------------------------------
# Locale
# Context menu
# Tab focus/blur
# Message listener
# Uninstall URL
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# LOCALE
--------------------------------------------------------------*/

/*---------------------------
# IMPORTING OLD SETTINGS
-----------------------------*/	
										

chrome.runtime.onInstalled.addListener(function (installed){
    if(installed.reason == 'update'){
//	    var thisVersion = chrome.runtime.getManifest().version;
//		console.log("Updated from " + installed.previousVersion + " to " + thisVersion + "!");
		chrome.storage.local.get('limit_page_width', function (result) {
                            if (result.limit_page_width === false){
								chrome.storage.local.set({no_page_margin: true});
								chrome.storage.local.remove(['limit_page_width'], (i) => {});
								chrome.storage.local.get('player_size', function (r) {
								if (r.player_size == 'full_window' || 'fit_to_window') {
								chrome.storage.local.set({player_size: 'max_width'});
								}});
								}											
                            });	 
//    } else if(installed.reason == 'install'){ console.log('Thanks for installing!');
	}
 }
);  


function getLocale(language, callback) {
	language = language.replace('-', '_');

	fetch('_locales/' + language + '/messages.json').then(function (response) {
		if (response.ok) {
			response.json().then(callback);
		} else {
			getLocale('en', callback);
		}
	}).catch(function () {
		getLocale('en', callback);
	});
}


/*--------------------------------------------------------------
# CONTEXT MENU
--------------------------------------------------------------*/

function updateContextMenu(language) {
	if (!language) {
		language = chrome.i18n.getUILanguage();
	}

	getLocale(language, function (response) {
		var items = [
			'donate',
			'rateMe',
			'GitHub'
		];

		chrome.contextMenus.removeAll();

		for (var i = 0; i < 3; i++) {
			var item = items[i],
				text = response[item];

			if (text) {
				text = text.message;
			} else {
				text = item;
			}

			chrome.contextMenus.create({
				id: String(i),
				title: text,
				contexts: ['action']
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
	});
}

chrome.runtime.onInstalled.addListener(function (details) {
	chrome.storage.local.get(function (items) {
		var language = items.language;

		updateContextMenu(language);
	});
});

chrome.storage.onChanged.addListener(function (changes) {
	for (var key in changes) {
		if (key === 'language') {
			updateContextMenu(changes[key].newValue);
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

	chrome.tabs.query({
		windowId: activeInfo.windowId
	}, function (tabs) {
		if (tabs) {
			for (var i = 0, l = tabs.length; i < l; i++) {
				if (tabs[i].id !== activeInfo.tabId) {
					chrome.tabs.sendMessage(tabs[i].id, {
						action: 'blur'
					});
				}
			}
		}
	});
});

chrome.windows.onFocusChanged.addListener(function (windowId) {
	chrome.windows.getAll(function (windows) {
		for (var i = 0, l = windows.length; i < l; i++) {
			if (windows[i].focused === true) {
				chrome.tabs.query({
					windowId: windows[i].id
				}, function (tabs) {
					if (tabs) {
						for (var j = 0, k = tabs.length; j < k; j++) {
							var tab = tabs[j];

							if (tab.active) {
								chrome.tabs.sendMessage(tab.id, {
									action: 'focus'
								});
							}
						}
					}
				});
			} else {
				chrome.tabs.query({
					windowId: windows[i].id
				}, function (tabs) {
					if (tabs) {
						for (var j = 0, k = tabs.length; j < k; j++) {
							var tab = tabs[j];

							chrome.tabs.sendMessage(tab.id, {
								action: 'blur'
							});
						}
					}
				});
			}
		}
	});
});


/*--------------------------------------------------------------
# MESSAGE LISTENER
--------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	var name = request.name;

	if (name === 'download') {
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
	}
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var action = message.action || message;

  if (action === "play") {
	  chrome.tabs.query({}, function (tabs) {
        for (var i = 0, l = tabs.length; i < l; i++) {
          var tab = tabs[i];
          chrome.tabs.sendMessage(tab.id, {
            action: "new-tab-opened",
          });
        }
      for (var i = 0, l = tabs.length; i < l; i++) {
        var tab = tabs[i];
        if (sender.tab.id !== tab.id && sender.tab.active) {
				chrome.tabs.sendMessage(tab.id, {
				  action: "another-video-started-playing",
				});
        }
      }
    });
	} else if (action === 'options-page-connected') {
		sendResponse({
			isTab: sender.hasOwnProperty('tab')
		});
	} else if (action === 'tab-connected') {
		sendResponse({
			hostname: new URL(sender.url).hostname,
			tabId: sender.tab.id
		});
	}
});

/*--------------------------------------------------------------
# UNINSTALL URL
--------------------------------------------------------------*/

chrome.runtime.setUninstallURL('https://improvedtube.com/uninstalled');
