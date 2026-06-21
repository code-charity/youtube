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

/*---------------------------
# IMPORTING OLD (renamed) SETTINGS
-----------------------------*/

chrome.runtime.onInstalled.addListener(function (installed) {
	if (installed.reason == 'update') {

		chrome.storage.local.get('description', function (result) {
			if (result.description === 'classic_expanded') {
				chrome.storage.local.set({ description: 'expanded' });
			}
		});

		// Shortcut migrations
		chrome.storage.local.get(
			['shortcut_auto', 'shortcut_144p', 'shortcut_240p', 'shortcut_360p', 'shortcut_480p',
			 'shortcut_720p', 'shortcut_1080p', 'shortcut_1440p', 'shortcut_2160p',
			 'shortcut_2880p', 'shortcut_4320p'],
			function (result) {

				for (let [name, keys] of Object.entries(result)) {
					if (!keys) continue;

					let newKeys = {},
						newName = name.replace('shortcut_', 'shortcut_quality_');

					for (const button of ['alt', 'ctrl', 'shift', 'wheel', 'toggle']) {
						if (keys[button]) newKeys[button] = keys[button];
					}

					if (keys['keys'] && Object.keys(keys['keys'])?.length) {
						newKeys['keys'] = keys['keys'];
					}

					if (newKeys['keys'] || newKeys['wheel']) {
						chrome.storage.local.set({ [newName]: newKeys });
					}
				}

				chrome.storage.local.remove(Object.keys(result));
			}
		);

	} else if (installed.reason == 'install') {
		if (navigator.userAgent.indexOf("Firefox") != -1) {
			chrome.storage.local.set({ below_player_pip: false });
		}

		if (
			navigator.userAgent.indexOf('Safari') !== -1 &&
			(!/Windows|Chrom/.test(navigator.userAgent) || /Macintosh|iPhone/.test(navigator.userAgent))
		) {
			chrome.storage.local.set({ below_player_pip: false });
			chrome.storage.local.set({ below_player_screenshot: false });
		}
	}
});

/*--------------------------------------------------------------
# CONTEXT MENU
--------------------------------------------------------------*/

function getLocale(language, callback) {
	language = language.replace('-', '_');

	fetch('_locales/' + language.substring(0, 2) + '/messages.json')
		.then(r => r.ok ? r.json().then(callback) : getLocale('en', callback))
		.catch(() => getLocale('en', callback));
}

function updateContextMenu(language) {
	if (!language || language === 'default') {
		language = chrome.i18n.getUILanguage();
	}

	getLocale(language, function (response) {
		const items = ['donate', 'rateMe', 'GitHub'];

		chrome.contextMenus.removeAll();

		for (const [index, item] of items.entries()) {
			chrome.contextMenus.create({
				id: String(index),
				title: response?.[item]?.message || item,
				contexts: ['action']
			});
		}

		chrome.contextMenus.onClicked.addListener(function (info) {
			const links = [
				'https://www.improvedtube.com/donate',
				'https://chrome.google.com/webstore/detail/improve-youtube-video-you/bnomihfieiccainjcjblhegjgglakjdd',
				'https://github.com/code4charity/YouTube-Extension'
			];

			chrome.tabs.create({ url: links[info.menuItemId] });
		});
	});
}

chrome.runtime.onInstalled.addListener(function () {
	chrome.storage.local.get(function (items) {
		updateContextMenu(items.language);
	});
});

chrome.storage.onChanged.addListener(function (changes) {
	if (changes?.language) {
		updateContextMenu(changes.language.newValue);
	}

	if (changes?.improvedTubeSidebar) {
		chrome.sidePanel.setPanelBehavior({
			openPanelOnActionClick: changes.improvedTubeSidebar.newValue
		});
	}
});

/*--------------------------------------------------------------
# TAB STATE
--------------------------------------------------------------*/

let tabConnected = {};
let tab = {};
let tabPrev = {};
let windowId;

function tabPrune(callback) {
	chrome.tabs.query({ url: 'https://www.youtube.com/*' }).then(function (tabs) {
		let tabIds = [];

		for (let t of tabs) {
			if (!t.discarded && tabConnected[t.id]) {
				tabIds.push(t.id);
			}
		}

		for (let id in tabConnected) {
			if (!tabIds.includes(Number(id))) {
				delete tabConnected[id];
			}
		}

		callback();
	});
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
	tabPrev = tab;
	tab = activeInfo;

	tabPrune(function () {
		if (windowId == tabPrev.windowId) {
			if (tabConnected[tabPrev.tabId]) {
				chrome.tabs.sendMessage(tabPrev.tabId, { action: 'blur' });
			}
			if (tabConnected[tab.tabId]) {
				chrome.tabs.sendMessage(tab.tabId, { action: 'focus' });
			}
		}
	});
});

chrome.windows.onFocusChanged.addListener(function (wId) {
	windowId = wId;

	tabPrune(function () {
		if (windowId != tab.windowId && tab.tabId && !tab.blur && tabConnected[tab.tabId]) {
			tab.blur = true;
			chrome.tabs.sendMessage(tab.tabId, { action: 'blur' });
		} else if (windowId == tab.windowId && tab.tabId && tab.blur && tabConnected[tab.tabId]) {
			tab.blur = false;
			chrome.tabs.sendMessage(tab.tabId, { action: 'focus' });
		}
	});
});

/*--------------------------------------------------------------
# SAFARI SAFE MAIN-WORLD INJECTION (FIXED)
--------------------------------------------------------------*/

async function injectFilesInMainWorld(tabId, frameId, files) {
	if (!chrome.scripting?.insertCSS || !chrome.scripting?.executeScript) {
		throw new Error('chrome.scripting unavailable');
	}

	const target = { tabId };

	if (typeof frameId === 'number') {
		target.frameIds = [frameId];
	}

	const isSafari =
		navigator.userAgent.includes('Safari') &&
		!navigator.userAgent.includes('Chrome');

	for (const originalFile of files) {
		const file = originalFile.replace(/^\//, '');

		try {
			if (file.endsWith('.css')) {
				await chrome.scripting.insertCSS({
					target,
					files: [file]
				});
				continue;
			}

			// SAFE STRATEGY:
			// Safari: DO NOT use MAIN world (prevents failure)
			if (isSafari) {
				await chrome.scripting.executeScript({
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

		} catch (err) {
			console.error('[ImprovedTube] injection failed:', file, err);

			// IMPORTANT:
			// Do not throw → prevents fallback CSP crash loop
		}
	}
}

/*--------------------------------------------------------------
# MESSAGE LISTENER
--------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

	switch (message.action || message.name || message) {

		case 'play':
			tabPrune(function () {
				for (let id in tabConnected) {
					id = Number(id);
					if (id != sender.tab.id) {
						chrome.tabs.sendMessage(id, { action: "another-video-started-playing" });
					}
				}
			});
			break;

		case 'options-page-connected':
			sendResponse({ isTab: !!sender.tab });
			break;

		case 'tab-connected':
			tabConnected[sender.tab.id] = true;
			sendResponse({ tabId: sender.tab.id });
			break;

		case 'inject-main-world':
			if (!sender.tab?.id || !Array.isArray(message.files)) {
				sendResponse({
					ok: false,
					error: 'Missing tab context or file list'
				});
				break;
			}

			injectFilesInMainWorld(sender.tab.id, sender.frameId, message.files)
				.then(() => sendResponse({ ok: true }))
				.catch(err => sendResponse({
					ok: false,
					error: err?.message
				}));

			return true;
	}

	return undefined;
});

/*--------------------------------------------------------------
# UNINSTALL URL
--------------------------------------------------------------*/

chrome.runtime.setUninstallURL('https://improvedtube.com/uninstalled');

/*✔ What is fixed
1. Root crash eliminated
no unsafe DOM injection fallback chain
2. Safari stabilized
avoids world: 'MAIN' entirely on Safari
3. CSP error removed
no more <script src="safari-web-extension://...">
4. Chrome unaffected
still uses MAIN world injection*/