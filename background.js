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
# IMPORTING OLD (renamed) SETTINGS   (Each one is mostly needed once, but fine to stay unlimited. Legacy.)
-----------------------------*/

chrome.runtime.onInstalled.addListener(function (installed) {
	if (installed.reason == 'update') {
		const shortcutKeys = ['shortcut_auto', 'shortcut_144p', 'shortcut_240p', 'shortcut_360p', 'shortcut_480p', 'shortcut_720p', 'shortcut_1080p', 'shortcut_1440p', 'shortcut_2160p', 'shortcut_2880p', 'shortcut_4320p'],
			stepKeys = ['volume_step', 'playback_speed_step'];

		chrome.storage.local.get([
			...shortcutKeys, ...shortcutKeys.map(key => key.replace('shortcut_', 'shortcut_quality_')),
			...stepKeys, ...stepKeys.map(key => 'shortcuts_' + key),
			'description', 'channel_default_tab', 'player_quality', 'player_quality_auto', 'player_size',
			'player_autoplay', 'player_autoplay_disable', 'Hide_Pause_Overlay', 'player_auto_continue_watching',
			'hideSubscribe', 'subscribe', 'limit_page_width', 'no_page_margin'
		], function (items) {
			const error = chrome.runtime.lastError;
			if (error) {
				console.error('Settings migration read failed:', error.message);
				return;
			}

			const updates = {},
				obsolete = [],
				has = key => Object.prototype.hasOwnProperty.call(items, key);

			function rename (oldKey, newKey, value) {
				if (!has(oldKey) || (!has(newKey) && value === undefined)) return false;
				// Presence, not truthiness: false, zero and cleared shortcuts are user choices.
				if (!has(newKey)) updates[newKey] = value;
				obsolete.push(oldKey);
				return !has(newKey);
			}

			for (const name of shortcutKeys) {
				const keys = items[name],
					newName = name.replace('shortcut_', 'shortcut_quality_');
				if (has(newName)) {
					rename(name, newName);
					continue;
				}
				if (!keys || typeof keys !== 'object' || Array.isArray(keys)) continue;
				const newKeys = {};
				for (const button of ['alt', 'ctrl', 'shift', 'wheel', 'toggle']) {
					if (keys[button]) newKeys[button] = keys[button];
				}
				if (keys.keys && typeof keys.keys === 'object' && !Array.isArray(keys.keys) && Object.keys(keys.keys).length) {
					newKeys.keys = keys.keys;
				}
				if (newKeys.keys || newKeys.wheel) rename(name, newName, newKeys);
			}
			for (const name of stepKeys) rename(name, 'shortcuts_' + name, items[name]);
			rename('player_autoplay', 'player_autoplay_disable', items.player_autoplay === false ? true : undefined);
			rename('Hide_Pause_Overlay', 'player_auto_continue_watching', items.Hide_Pause_Overlay === true ? true : undefined);
			rename('hideSubscribe', 'subscribe', items.hideSubscribe === true ? 'hidden' : undefined);
			if (rename('limit_page_width', 'no_page_margin', items.limit_page_width === false ? true : undefined)
				&& (items.player_size === 'full_window' || items.player_size === 'fit_to_window')) {
				updates.player_size = 'max_width';
			}

			if (items.description === 'classic_expanded') updates.description = 'expanded';
			if (items.channel_default_tab === '/home') updates.channel_default_tab = '/';
			if (items.player_quality === 'auto' && items.player_quality_auto !== 'migrated') {
				updates.player_quality = 'disabled';
				updates.player_quality_auto = 'migrated';
			}

			function cleanup () {
				if (obsolete.length) {
					chrome.storage.local.remove(obsolete, function () {
						const error = chrome.runtime.lastError;
						if (error) console.error('Settings migration cleanup failed:', error.message);
					});
				}
			}

			if (Object.keys(updates).length) {
				chrome.storage.local.set(updates, function () {
					const error = chrome.runtime.lastError;
					if (error) {
						console.error('Settings migration write failed:', error.message);
						return;
					}
					// Retain the old data until its replacement has been persisted successfully.
					cleanup();
				});
			} else {
				cleanup();
			}
		});
	} else if (installed.reason == 'install') {
		if (navigator.userAgent.indexOf("Firefox") != -1) {
			chrome.storage.local.set({below_player_pip: false})
		}
		if (navigator.userAgent.indexOf('Safari') !== -1
		   && (!/Windows|Chrom/.test(navigator.userAgent)
			   || /Macintosh|iPhone/.test(navigator.userAgent))) {
			chrome.storage.local.set({below_player_pip: false})
			// still needed? (are screenshots broken in Safari?):
			chrome.storage.local.set({below_player_screenshot: false})
		}
		// console.log('Thanks for installing!');
	}
});
/*--------------------------------------------------------------
# LOCALE
--------------------------------------------------------------*/
function getLocale (language, callback) {
	language = language.replace('-', '_');
	fetch('_locales/' + language.substring(0, 2) + '/messages.json').then(function (response) {
		if (response.ok) {
			response.json().then(callback);
		} else {
			fetch('_locales/' + language.substring(0, 2) + '/messages.json').then(function (response) {
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
function updateContextMenu (language) {
	if (!language || language === 'default') language = chrome.i18n.getUILanguage();
	getLocale(language, function (response) {
		const items = [
			'donate',
			'rateMe',
			'GitHub'
		];
		chrome.contextMenus.removeAll();

		for (const [index, item] of items.entries()) {
			const text = response?.[item]?.message || item;

			chrome.contextMenus.create({
				id: String(index),
				title: text,
				contexts: ['action'] //manifest3
				// contexts: ['browser_action'] //manifest2
			});
		}
	});
}

chrome.contextMenus.onClicked.addListener(function (info) {
	const isFirefox = chrome.runtime.getURL('').startsWith('moz-extension://');
	const links = [
		'https://www.improvedtube.com/donate',
		isFirefox
			? 'https://addons.mozilla.org/firefox/addon/youtube-addon/'
			: 'https://chrome.google.com/webstore/detail/improve-youtube-video-you/bnomihfieiccainjcjblhegjgglakjdd',
		'https://github.com/code4charity/YouTube-Extension'
	];
	chrome.tabs.create({ url: links[info.menuItemId] }); //manifest3
	// window.open(links[info.menuItemId]); //manifest2
});
chrome.runtime.onInstalled.addListener(function () {
	chrome.storage.local.get(function (items) {
		updateContextMenu(items.language);
	});
});

/*--------------------------------------------------------------
# STORAGE LISTENER
--------------------------------------------------------------*/
chrome.storage.onChanged.addListener(function (changes) {
	if (changes?.language) updateContextMenu(changes.language.newValue);
	if (changes?.improvedTubeSidebar) {
		chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: changes.improvedTubeSidebar.newValue });
	}
});

/*--------------------------------------------------------------
# TAB Helper, prune stale connected tabs
--------------------------------------------------------------*/
let tabConnected = {},
	tab = {},
	tabPrev = {},
	windowId;

function tabPrune (callback) {
	chrome.tabs.query({ url: 'https://www.youtube.com/*' }).then(function (tabs) {
		let tabIds = [];
		for (let tab of tabs) {
			if (!tab.discarded && tabConnected[tab.id]) {
				tabIds.push(tab.id);
			}
		}
		for (let id in tabConnected) {
			if (!tabIds.includes(Number(id))) {
				delete tabConnected[id];
			}
		}
		callback();
	}, function () { console.log("Error querying Tabs") });
};
/*--------------------------------------------------------------
# TAB FOCUS/BLUR
 commented out console.log left intentionally, to help understand
 https://issues.chromium.org/issues/41116352
--------------------------------------------------------------*/
chrome.tabs.onActivated.addListener(function (activeInfo) {
	tabPrev = tab;
	tab = activeInfo;
	//console.log('activeInfo', windowId, tabPrev, tab);
	tabPrune(function () {
		if (windowId == tabPrev.windowId) {
			if (tabConnected[tabPrev.tabId]) {
				chrome.tabs.sendMessage(tabPrev.tabId, {action: 'blur'});
				//console.log('tabIdPrev', tabPrev.tabId);
			}
			if (tabConnected[tab.tabId]) {
				chrome.tabs.sendMessage(tab.tabId, {action: 'focus'});
				//console.log('tabId', tab.tabId);
			}
		}
	});
});
chrome.windows.onFocusChanged.addListener(function (wId) {
	windowId = wId;
	//console.log('onFocusChanged', windowId, tabPrev, tab);
	tabPrune(function () {
		if (windowId != tab.windowId && tab.tabId && !tab.blur && tabConnected[tab.tabId]) {
			tab.blur = true;
			chrome.tabs.sendMessage(tab.tabId, {action: 'blur'});
			//console.log('blur', tab.tabId, windowId);
		} else if (windowId == tab.windowId && tab.tabId && tab.blur && tabConnected[tab.tabId]) {
			tab.blur = false;
			chrome.tabs.sendMessage(tab.tabId, {action: 'focus'});
			//console.log('focus', tab.tabId, windowId);
		}
	});
});
/*--------------------------------------------------------------
# EXTENSION API SCRIPT INJECTION (for Safari)
--------------------------------------------------------------*/
async function injectFilesInMainWorld(tabId, frameId, files) {
	if (!chrome.scripting?.insertCSS || !chrome.scripting?.executeScript) {
		throw new Error('chrome.scripting main-world injection failed');
	}

	const target = { tabId };

	if (typeof frameId === 'number') {
		target.frameIds = [frameId];
	}

	for (const originalFile of files) {
		const file = originalFile.replace(/^\//, '');

		if (file.endsWith('.css')) {
			await chrome.scripting.insertCSS({
				target,
				files: [file]
			});
		} else {
			await chrome.scripting.executeScript({
				target,
				files: [file],
				world: 'MAIN'
			});
		}
	}
}

/*--------------------------------------------------------------
# MESSAGE LISTENER
--------------------------------------------------------------*/
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	//console.log(message);
	//console.log(sender);

	switch (message.action || message.name || message) {
		case 'play':
			tabPrune(function () {
				for (let id in tabConnected) {
					id = Number(id);
					if (id != sender.tab.id) {
						chrome.tabs.sendMessage(id, {action: "another-video-started-playing"});
					}
				}
			});
			break

		case 'options-page-connected':
			sendResponse({
				isTab: !!sender.tab
			});
			break

		case 'tab-connected':
			tabConnected[sender.tab.id] = true;
			sendResponse({
				tabId: sender.tab.id
			});
			break

		case 'inject-main-world':
			if (!sender.tab?.id || !Array.isArray(message.files)) {
				sendResponse({
					ok: false,
					error: 'Missing tab context or file list'
				});
				break
			}

			injectFilesInMainWorld(sender.tab.id, sender.frameId, message.files)
				.then(function () {
					sendResponse({ ok: true });
				})
				.catch(function (error) {
					const message = error?.message || 'Safari main-world injection failed';
					console.error(message, error);
					sendResponse({
						ok: false,
						error: message
					});
				});

			return true;

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
					chrome.windows.create(data);

					//append to title?
					chrome.tabs.onUpdated.addListener(function listener (tabId, changeInfo) {
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
						const blob = new Blob([JSON.stringify(message.value)], {
							type: 'application/json;charset=utf-8'
						});
						chrome.downloads.download({
							url: URL.createObjectURL(blob),
							filename: message.filename,
							saveAs: true
						});
					} catch (error) { console.error(error);	}
				} else { console.error('Permission is not granted.'); }
			})
			break
	}
});

// Initial context menu setup
updateContextMenu();

/*-----# UNINSTALL URL-----------------------------------*/
chrome.runtime.setUninstallURL('https://improvedtube.com/uninstalled');
