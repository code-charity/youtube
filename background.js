/*--------------------------------------------------------------
>>> BACKGROUND
----------------------------------------------------------------
# webRequest.onBeforeRequest
# Locale
# IMPORTING OLD SETTINGS
# Context menu
# Tab focus/blur
# Message listener
# Uninstall URL
--------------------------------------------------------------*/
/*
// For Manifest3:
/*-----# Persistent Serviceworker:
		"Manifest2 Background.js"-----*/
// Periodic "keep-alive" message every 29.5 seconds
// const keepAliveInterval = setInterval(() => chrome.runtime.sendMessage({ status: 'keep-alive' }), 29.5 * 1000);

/* Sidepanel Option
  chrome.storage.local.get('improvedTubeSidePanel', function (result) {
	if ( result.improvedTubeSidePanel && result.improvedTubeSidePanel === true) {
		chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
	} else {chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }) }
  });
*/
/*---------------------------
# IMPORTING OLD SETTINGS
-----------------------------*/
chrome.runtime.onInstalled.addListener(function (installed) {
	if(installed.reason == 'update') {
		//		var thisVersion = chrome.runtime.getManifest().version;
		//		console.log("Updated from " + installed.previousVersion + " to " + thisVersion + "!");
		chrome.storage.local.get('player_autoplay', function (result) {
			if (result.player_autoplay === false) {
				chrome.storage.local.set({player_autoplay_disable: true});
				chrome.storage.local.remove(['player_autoplay'], (i) => {});
			}
		});
		chrome.storage.local.get('channel_default_tab', function (result) {
			if (result.channel_default_tab === '/home') {
				chrome.storage.local.set({channel_default_tab: '/'});
			}
		});
		chrome.storage.local.get('player_quality', function (result) {
			if (result.player_quality === 'auto') {
				chrome.storage.local.get('player_quality_auto', function (result) {
					if (result.player_quality_auto !== 'migrated') {
						chrome.storage.local.set({player_quality: 'disabled'});
						chrome.storage.local.set({player_quality_auto: 'migrated'});
					}
				});
			}
		});
		chrome.storage.local.get('hideSubscribe', function (result) {
			if (result.hideSubscribe === true) {
				chrome.storage.local.set({subscribe: 'hidden'});
				chrome.storage.local.remove(['hideSubscribe'], (i) => {});
			}
		});
		chrome.storage.local.get('limit_page_width', function (result) {
			if (result.limit_page_width === false) {
				chrome.storage.local.set({no_page_margin: true});
				chrome.storage.local.remove(['limit_page_width'], (i) => {});
				chrome.storage.local.get('player_size', function (r) {
					if (r.player_size == 'full_window' || 'fit_to_window') {
						chrome.storage.local.set({player_size: 'max_width'});
					}
				});
			}
		});
	} else if(installed.reason == 'install') {
		if(navigator.userAgent.indexOf("Firefox") != -1){
			chrome.storage.local.set({below_player_pip: false})}
		if(navigator.userAgent.indexOf('Safari') !== -1
		   && (!/Windows|Chrom/.test(navigator.userAgent)
			   || /Macintosh|iPhone/.test(navigator.userAgent))) {
			chrome.storage.local.set({below_player_pip: false})
			// still needed? (are screenshots broken in Safari?):
			chrome.storage.local.set({below_player_screenshot: false})}
		// console.log('Thanks for installing!');
	}
});
/*--------------------------------------------------------------
# LOCALE
--------------------------------------------------------------*/
function getLocale(language, callback) {
	language = language.replace('-', '_');
	fetch('_locales/' + language.substring(0,2) + '/messages.json').then(function (response) {
		if (response.ok) {
			response.json().then(callback);
		} else {
			fetch('_locales/' + language.substring(0,2) + '/messages.json').then(function (response) {
				if (response.ok) {
					response.json().then(callback);
				} else {
					getLocale('en', callback);
				}
			}).catch(function () { getLocale('en', callback); });
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
				contexts: ['action'] //manifest3
				// contexts: ['browser_action'] //manifest2
			});
		}
		chrome.contextMenus.onClicked.addListener(function (info) {
			var links = [
				'https://www.improvedtube.com/donate',
				'https://chrome.google.com/webstore/detail/improve-youtube-video-you/bnomihfieiccainjcjblhegjgglakjdd',
				'https://github.com/code4charity/YouTube-Extension'
			];
			chrome.tabs.create({ url: links[info.menuItemId] }); //manifest3
			// window.open(links[info.menuItemId]); //manifest2
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
		if (key === 'language') { updateContextMenu(changes[key].newValue); }
		if (key === 'improvedTubeSidebar') { chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: changes[key].newValue}); }
	}
});
/*--------------------------------------------------------------
# TAB FOCUS/BLUR
--------------------------------------------------------------*/
chrome.tabs.onActivated.addListener(function (activeInfo) {
	chrome.tabs.sendMessage(activeInfo.tabId, {action: 'focus'});

	chrome.tabs.query({
		windowId: activeInfo.windowId
	}, function (tabs) {
		if (tabs) {
			for (var i = 0, l = tabs.length; i < l; i++) {
				if (tabs[i].id !== activeInfo.tabId) {
					chrome.tabs.sendMessage(tabs[i].id, {action: 'blur'});
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
								chrome.tabs.sendMessage(tab.id, {action: 'focus'});
							}
						}
					}
				});
			} else {
				chrome.tabs.query({windowId: windows[i].id}, function (tabs) {
					if (tabs) {
						for (var j = 0, k = tabs.length; j < k; j++) {
							var tab = tabs[j];

							chrome.tabs.sendMessage(tab.id, {action: 'blur'});
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
let tabConnected = {};

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	console.log(message);
	console.log(sender);

	switch(message.action || message.name || message) {
		case 'play':
			chrome.tabs.query({ url: 'https://www.youtube.com/*' }).then(function (tabs) {
				let tabIds = [];
				for (let tab of tabs) {
					tabIds.push(tab.id);
					if (!tab.discarded && tab.id !== sender.tab.id && tabConnected[tab.id]) {
						chrome.tabs.sendMessage(tab.id, {action: "another-video-started-playing"});
					}
				}
				// prune stale tab-connected data
				for (let id in tabConnected) {
					if (!tabIds.includes(Number(id))) {
						delete tabConnected[id];
					}
				}
			}, function () {console.log("Error querying Tabs")});
			break

		case 'options-page-connected':
			sendResponse({
				isTab: sender.hasOwnProperty('tab')
			});
			break

		case 'tab-connected':
			tabConnected[sender.tab.id] = true;
			sendResponse({
				tabId: sender.tab.id
			});
			break

		case 'fixPopup':
			//~ get the current focused tab and convert it to a URL-less popup (with same state and size)
			chrome.windows.getLastFocused(w => {
				chrome.tabs.query({
					windowId: w.id,
					active: true
				}, ts => {
					const tID = ts[0]?.id,
						  data = { type: 'popup',
								  state: w.state,
								  width: parseInt(message.width, 10),
								  height: parseInt(message.height, 10),
								  left: 0,
								  top: 20
								 }

					if (tID) {data.tabId = tID;}
					chrome.windows.create(data, pw => {});

					//append to title?
					chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
						if (tabId === tID && changeInfo.status === 'complete' && !message.title.startsWith("undefined")) {
							chrome.tabs.onUpdated.removeListener(listener);
							chrome.scripting.executeScript({ target: { tabId: tID }, func: () => { document.title = `${message.title} - ImprovedTube`; } });			//manifest3
							// chrome.tabs.executeScript(tID, {code: `document.title = "${message.title} - ImprovedTube";`});  //manifest2
						}
					});
				});
			});
			break
		case 'download':
			chrome.permissions.request({
				permissions: ['downloads'],
				origins: ['https://www.youtube.com/*']
			}, function (granted) {
				if (granted) {
					try {
						var blob = new Blob([JSON.stringify(message.value)], {
							type: 'application/json;charset=utf-8'
						});
						chrome.downloads.download({
							url: URL.createObjectURL(blob),
							filename: message.filename,
							saveAs: true
						});
					} catch (error) {
						console.error(error);
					}
				} else {
					console.error('Permission is not granted.');
				}})
			break
	}
});
/*-----# UNINSTALL URL-----------------------------------*/
chrome.runtime.setUninstallURL('https://improvedtube.com/uninstalled');
