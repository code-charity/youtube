const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '../../background.js'), 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));
const catalog = language => ({
	donate: { message: language + ' donate' },
	rateMe: { message: language + ' rate' },
	GitHub: { message: 'GitHub' }
});

function loadBackground (storedLanguage = 'de') {
	const event = () => {
		const listeners = [];
		return {
			addListener: jest.fn(listener => listeners.push(listener)),
			emit: (...args) => listeners.forEach(listener => listener(...args))
		};
	};
	const reads = [], removals = [], creations = [], requests = [];
	const chrome = {
		runtime: {
			onInstalled: event(), onMessage: event(), setUninstallURL: jest.fn(),
			getManifest: () => ({ version: '4' }),
			getURL: jest.fn(() => 'chrome-extension://test/')
		},
		i18n: { getUILanguage: jest.fn(() => 'en') },
		storage: {
			local: {
				get: jest.fn((key, callback) => {
					if (key === 'context_menu_locale_cache') queueMicrotask(() => callback({}));
					else reads.push(() => callback({ language: storedLanguage }));
				}),
				set: jest.fn((values, callback) => queueMicrotask(() => callback?.()))
			},
			onChanged: event()
		},
		contextMenus: {
			onClicked: event(),
			removeAll: jest.fn(callback => removals.push(callback)),
			create: jest.fn((item, callback) => { creations.push(callback); return item.id; })
		},
		tabs: { onActivated: event(), create: jest.fn() },
		windows: { onFocusChanged: event() }
	};
	const fetch = jest.fn();
	const context = { chrome, fetch, console: { error: jest.fn(), warn: jest.fn(), log: jest.fn() } };
	vm.runInNewContext(source, context, { filename: 'background.js' });
	// Control locale completion independently of the locale resolver's cache and fallback tests.
	context.getLocale = jest.fn((language, callback) => {
		fetch('_locales/' + language + '/messages.json');
		requests.push({ url: '_locales/' + language + '/messages.json', resolve: callback });
	});
	return {
		...context, reads, removals, creations, requests,
		resolveLocale: (index, messages) => requests[index].resolve(messages),
		finishCreations: () => creations.splice(0).forEach(callback => callback()),
		changeLanguage: (language, area = 'local') => chrome.storage.onChanged.emit({ language: { newValue: language } }, area)
	};
}

describe('Background context-menu lifecycle (#4124 follow-up)', () => {
	test('loads the stored language on worker startup and waits for removal before creating items', async () => {
		const bg = loadBackground();
		expect(bg.fetch).not.toHaveBeenCalled();
		bg.reads.shift()();
		await flush();
		expect(bg.requests[0].url).toBe('_locales/de/messages.json');
		bg.resolveLocale(0, catalog('de'));
		await flush();
		expect(bg.chrome.contextMenus.removeAll).toHaveBeenCalledTimes(1);
		expect(bg.chrome.contextMenus.create).not.toHaveBeenCalled();

		bg.removals.shift()();
		await flush();
		expect(bg.chrome.contextMenus.create.mock.calls.map(([item]) => item)).toEqual([
			{ id: '0', title: 'de donate', contexts: ['action'] },
			{ id: '1', title: 'de rate', contexts: ['action'] },
			{ id: '2', title: 'GitHub', contexts: ['action'] }
		]);
		bg.finishCreations();
	});

	test.each([undefined, 'default', '', null])('uses the browser language for the saved default %j', async saved => {
		const bg = loadBackground(saved);
		if (saved === undefined) bg.chrome.storage.local.get.mock.calls[0][1]({});
		else bg.reads.shift()();
		await flush();
		expect(bg.requests[0].url).toBe('_locales/en/messages.json');
	});

	test('ignores a startup storage read that finishes after a language change', async () => {
		const bg = loadBackground();
		bg.changeLanguage('fr');
		bg.reads.shift()();
		await flush();
		expect(bg.fetch.mock.calls).toEqual([['_locales/fr/messages.json']]);
	});

	test('ignores an older locale response that arrives after the newest response', async () => {
		const bg = loadBackground();
		bg.reads.shift()();
		bg.changeLanguage('fr');
		bg.resolveLocale(1, catalog('fr'));
		await flush();
		bg.resolveLocale(0, catalog('de'));
		await flush();
		expect(bg.removals).toHaveLength(1);
		bg.removals.shift()();
		await flush();
		expect(bg.chrome.contextMenus.create.mock.calls.map(([item]) => item.title)).toEqual(Object.values(catalog('fr')).map(item => item.message));
		bg.finishCreations();
	});

	test('serializes overlapping clears and skips creation when a request becomes stale during removal', async () => {
		const bg = loadBackground();
		bg.reads.shift()();
		bg.resolveLocale(0, catalog('de'));
		await flush();
		bg.changeLanguage('fr');
		bg.resolveLocale(1, catalog('fr'));
		await flush();
		expect(bg.chrome.contextMenus.removeAll).toHaveBeenCalledTimes(1);
		bg.removals.shift()();
		await flush();
		expect(bg.chrome.contextMenus.create).not.toHaveBeenCalled();
		expect(bg.chrome.contextMenus.removeAll).toHaveBeenCalledTimes(2);
		bg.removals.shift()();
		await flush();
		expect(bg.chrome.contextMenus.create.mock.calls[0][0].title).toBe('fr donate');
		bg.finishCreations();
	});

	test('waits for all old creation callbacks before clearing for a new language', async () => {
		const bg = loadBackground();
		bg.reads.shift()();
		bg.resolveLocale(0, catalog('de'));
		await flush();
		bg.removals.shift()();
		await flush();
		bg.changeLanguage('fr');
		bg.resolveLocale(1, catalog('fr'));
		await flush();
		expect(bg.chrome.contextMenus.removeAll).toHaveBeenCalledTimes(1);
		bg.creations.shift()();
		bg.creations.shift()();
		await flush();
		expect(bg.chrome.contextMenus.removeAll).toHaveBeenCalledTimes(1);
		bg.creations.shift()();
		await flush();
		expect(bg.chrome.contextMenus.removeAll).toHaveBeenCalledTimes(2);
	});

	test('coalesces queued languages to the newest one', async () => {
		const bg = loadBackground();
		bg.reads.shift()();
		bg.resolveLocale(0, catalog('de'));
		await flush();
		bg.changeLanguage('fr');
		bg.resolveLocale(1, catalog('fr'));
		await flush();
		bg.changeLanguage('es');
		bg.resolveLocale(2, catalog('es'));
		await flush();
		bg.removals.shift()();
		await flush();
		expect(bg.chrome.contextMenus.removeAll).toHaveBeenCalledTimes(2);
		bg.removals.shift()();
		await flush();
		expect(bg.chrome.contextMenus.create.mock.calls.map(([item]) => item.title)).toEqual(Object.values(catalog('es')).map(item => item.message));
		bg.finishCreations();
	});

	test('keeps one click listener after startup, installation and repeated language changes', async () => {
		const bg = loadBackground();
		bg.reads.shift()();
		bg.chrome.runtime.onInstalled.emit({ reason: 'browser_update' });
		bg.reads.shift()();
		bg.changeLanguage('fr');
		bg.changeLanguage('es');
		bg.requests.forEach((request, index) => bg.resolveLocale(index, catalog(String(index))));
		await flush();
		bg.removals.shift()();
		await flush();
		bg.finishCreations();
		expect(bg.chrome.contextMenus.onClicked.addListener).toHaveBeenCalledTimes(1);
		bg.chrome.contextMenus.onClicked.emit({ menuItemId: '0' });
		expect(bg.chrome.tabs.create.mock.calls).toEqual([[{ url: 'https://www.improvedtube.com/donate' }]]);
	});

	test.each([undefined, null, -1, 3, 'constructor', '__proto__', 'length', '01', 'unknown'])('ignores unsupported menu ID %j', menuItemId => {
		const bg = loadBackground();
		bg.chrome.contextMenus.onClicked.emit({ menuItemId });
		expect(bg.chrome.tabs.create).not.toHaveBeenCalled();
	});

	test('keeps the Firefox-specific rating destination', () => {
		const bg = loadBackground();
		bg.chrome.runtime.getURL.mockReturnValue('moz-extension://test/');
		bg.chrome.contextMenus.onClicked.emit({ menuItemId: '1' });
		expect(bg.chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://addons.mozilla.org/firefox/addon/youtube-addon/' });
	});

	test('ignores language changes outside local storage', () => {
		const bg = loadBackground();
		bg.changeLanguage('fr', 'sync');
		expect(bg.fetch).not.toHaveBeenCalled();
		bg.reads.shift()();
		expect(bg.requests[0].url).toBe('_locales/de/messages.json');
	});

	test('falls back to usable titles for missing or invalid messages', async () => {
		const bg = loadBackground();
		bg.reads.shift()();
		bg.resolveLocale(0, { donate: { message: 12 }, rateMe: { message: '   ' } });
		await flush();
		bg.removals.shift()();
		await flush();
		expect(bg.chrome.contextMenus.create.mock.calls.map(([item]) => item.title)).toEqual(['donate', 'rateMe', 'GitHub']);
		bg.finishCreations();
	});

	test('recovers on the next update after removeAll fails', async () => {
		const bg = loadBackground();
		bg.reads.shift()();
		bg.resolveLocale(0, catalog('de'));
		await flush();
		bg.chrome.runtime.lastError = { message: 'Removal failed' };
		bg.removals.shift()();
		delete bg.chrome.runtime.lastError;
		await flush();
		expect(bg.console.error).toHaveBeenCalledTimes(1);
		expect(bg.chrome.contextMenus.create).not.toHaveBeenCalled();
		bg.changeLanguage('fr');
		bg.resolveLocale(1, catalog('fr'));
		await flush();
		bg.removals.shift()();
		await flush();
		expect(bg.chrome.contextMenus.create).toHaveBeenCalledTimes(3);
		bg.finishCreations();
	});

	test('waits for other creations when one item fails and permits another update', async () => {
		const bg = loadBackground();
		bg.reads.shift()();
		bg.resolveLocale(0, catalog('de'));
		await flush();
		bg.removals.shift()();
		await flush();
		bg.chrome.runtime.lastError = { message: 'Creation failed' };
		bg.creations.shift()();
		delete bg.chrome.runtime.lastError;
		bg.changeLanguage('fr');
		bg.resolveLocale(1, catalog('fr'));
		await flush();
		expect(bg.console.error).toHaveBeenCalledTimes(1);
		expect(bg.chrome.contextMenus.removeAll).toHaveBeenCalledTimes(1);
		bg.finishCreations();
		await flush();
		expect(bg.chrome.contextMenus.removeAll).toHaveBeenCalledTimes(2);
	});
});
