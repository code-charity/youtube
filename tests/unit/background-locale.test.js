const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '../../background.js'), 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));
const response = messages => ({ ok: true, json: jest.fn().mockResolvedValue(messages) });

async function loadBackground (options = {}) {
	const listener = () => ({ addListener: jest.fn() });
	const data = options.data || {};
	const fetch = jest.fn().mockResolvedValue(response({ donate: { message: 'Donate' }, rateMe: { message: 'Rate me' } }));
	const chrome = {
		runtime: { onInstalled: listener(), onMessage: listener(), setUninstallURL: jest.fn(), getManifest: () => ({ version: options.version || '4' }) },
		storage: {
			onChanged: listener(),
			local: {
				get: jest.fn((keys, callback) => queueMicrotask(() => callback({ ...data }))),
				set: jest.fn((values, callback) => queueMicrotask(() => { Object.assign(data, values); callback(); }))
			}
		},
		contextMenus: {
			onClicked: listener(),
			removeAll: jest.fn(callback => { if (callback) setImmediate(callback); }),
			create: jest.fn((item, callback) => { if (callback) setImmediate(callback); return item.id; })
		},
		tabs: { onActivated: listener() },
		windows: { onFocusChanged: listener() },
		i18n: { getUILanguage: () => options.language || 'en' }
	};
	const context = { chrome, fetch, console: { warn: jest.fn() } };
	vm.runInNewContext(source, context, { filename: 'background.js' });
	await flush();
	return { getLocale: context.getLocale, fetch, chrome, data, console: context.console };
}

describe('Background locale fallback (#4108)', () => {
	let getLocale, fetch, chrome, data, background;

	beforeEach(async () => {
		background = await loadBackground();
		({ getLocale, fetch, chrome, data } = background);
		delete data.context_menu_locale_cache;
		fetch.mockClear();
		chrome.storage.local.set.mockClear();
	});

	test.each(['pt_BR', 'pt-BR', ' pt-br '])('loads the exact regional locale first: %s', async language => {
		const messages = { donate: { message: 'Doar' }, rateMe: { message: 'Avalie-me' } };
		fetch.mockResolvedValue(response(messages));
		const callback = jest.fn();

		expect(getLocale(language, callback)).toBeUndefined();
		expect(callback).not.toHaveBeenCalled();
		await flush();

		expect(fetch.mock.calls).toEqual([['_locales/pt_BR/messages.json']]);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(messages);
	});

	test.each(['en_GB', 'zh_CN', 'zh_TW', 'es_419', 'fil'])('keeps packaged locale names intact: %s', async language => {
		const callback = jest.fn();
		getLocale(language, callback);
		await flush();
		expect(fetch.mock.calls).toEqual([['_locales/' + language + '/messages.json']]);
		expect(callback).toHaveBeenCalledTimes(1);
	});

	test('falls back to the base language before English', async () => {
		const messages = { donate: { message: 'Doar' }, rateMe: { message: 'Avalie-me' } };
		fetch.mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce(response(messages));
		const callback = jest.fn();
		getLocale('pt-BR', callback);
		await flush();

		expect(fetch.mock.calls).toEqual([['_locales/pt_BR/messages.json'], ['_locales/pt/messages.json']]);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(messages);
	});

	test('tries English once after an HTTP failure and invalid JSON', async () => {
		const messages = { donate: { message: 'Donate' }, rateMe: { message: 'Rate me' } };
		fetch.mockResolvedValueOnce({ ok: false })
			.mockResolvedValueOnce({ ok: true, json: () => Promise.reject(new SyntaxError('Invalid JSON')) })
			.mockResolvedValueOnce(response(messages));
		const callback = jest.fn();
		getLocale('pt_BR', callback);
		await flush();

		expect(fetch.mock.calls).toEqual([
			['_locales/pt_BR/messages.json'], ['_locales/pt/messages.json'], ['_locales/en/messages.json']
		]);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(messages);
	});

	test('waits for each request before advancing, including a rejected fetch', async () => {
		let reject;
		fetch.mockImplementationOnce(() => new Promise((resolve, fail) => { reject = fail; }));
		const callback = jest.fn();
		getLocale('pt_BR', callback);
		await flush();
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(callback).not.toHaveBeenCalled();

		reject(new Error('Network failure'));
		await flush();
		expect(fetch.mock.calls).toEqual([['_locales/pt_BR/messages.json'], ['_locales/pt/messages.json']]);
		expect(callback).toHaveBeenCalledTimes(1);
	});

	test('handles a synchronous fetch failure', async () => {
		fetch.mockImplementationOnce(() => { throw new Error('Fetch unavailable'); });
		const callback = jest.fn();
		expect(() => getLocale('de', callback)).not.toThrow();
		await flush();
		expect(fetch.mock.calls).toEqual([['_locales/de/messages.json'], ['_locales/en/messages.json']]);
		expect(callback).toHaveBeenCalledTimes(1);
	});

	test.each([null, [], 'not a message catalog', 42])('falls back from invalid JSON catalog shape %j', async messages => {
		fetch.mockResolvedValueOnce(response(messages));
		const callback = jest.fn();
		getLocale('de', callback);
		await flush();
		expect(fetch.mock.calls).toEqual([['_locales/de/messages.json'], ['_locales/en/messages.json']]);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith({ donate: { message: 'Donate' }, rateMe: { message: 'Rate me' } });
	});

	test.each(['en', 'en-GB', 'pt_BR'])('terminates with one empty result when every candidate fails: %s', async language => {
		const candidates = language === 'en' ? 1 : language === 'en-GB' ? 2 : 3;
		// A later success makes a regressed recursive implementation fail rather than hang Jest.
		fetch.mockResolvedValue(response({ unexpected: true }));
		for (let i = 0; i < candidates; i++) fetch.mockRejectedValueOnce(new Error('Missing file'));
		const callback = jest.fn();
		getLocale(language, callback);
		await flush();

		expect(fetch).toHaveBeenCalledTimes(candidates);
		expect(new Set(fetch.mock.calls.map(([url]) => url)).size).toBe(candidates);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith({});
	});

	test('terminates when English contains malformed JSON', async () => {
		fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.reject(new SyntaxError('Invalid English JSON')) });
		const callback = jest.fn();
		getLocale('en', callback);
		await flush();
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith({});
	});

	test.each([undefined, null, false, 0, {}, '', 'default', '../en', 'en/GB', 'en?x=1'])('uses English for invalid language %j', async language => {
		const callback = jest.fn();
		expect(() => getLocale(language, callback)).not.toThrow();
		await flush();
		expect(fetch.mock.calls).toEqual([['_locales/en/messages.json']]);
		expect(callback).toHaveBeenCalledTimes(1);
	});

	test('fills missing labels from base and English without replacing regional translations', async () => {
		fetch.mockResolvedValueOnce(response({ donate: { message: 'Doar regional' }, unrelated: { message: 'Do not cache' } }))
			.mockResolvedValueOnce(response({ donate: { message: 'Doar base' } }))
			.mockResolvedValueOnce(response({ donate: { message: 'Donate' }, rateMe: { message: 'Rate me' } }));
		const callback = jest.fn();
		getLocale('pt-BR', callback);
		await flush();
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith({ donate: { message: 'Doar regional' }, rateMe: { message: 'Rate me' } });
		expect(data.context_menu_locale_cache).toEqual({ version: '4', language: 'pt_BR', messages: { donate: 'Doar regional', rateMe: 'Rate me' } });
	});

	test('reuses the two cached labels after a worker restart without fetching catalogs', async () => {
		getLocale('en', jest.fn());
		await flush();
		const restarted = await loadBackground({ data });
		expect(restarted.fetch).not.toHaveBeenCalled();
		const callback = jest.fn();
		restarted.getLocale('en', callback);
		await flush();
		expect(callback).toHaveBeenCalledWith({ donate: { message: 'Donate' }, rateMe: { message: 'Rate me' } });
		expect(restarted.fetch).not.toHaveBeenCalled();
	});

	test('refreshes the cached labels when the extension version changes', async () => {
		getLocale('en', jest.fn());
		await flush();
		const updated = await loadBackground({ data, version: '4.1' });
		expect(updated.fetch.mock.calls).toEqual([['_locales/en/messages.json']]);
		expect(data.context_menu_locale_cache.version).toBe('4.1');
	});

	test('refreshes the cache for a different language', async () => {
		getLocale('en', jest.fn());
		await flush();
		fetch.mockClear();
		getLocale('de', jest.fn());
		await flush();
		expect(fetch.mock.calls).toEqual([['_locales/de/messages.json']]);
		expect(data.context_menu_locale_cache.language).toBe('de');
	});

	test('shares concurrent normalized locale lookups and invokes each callback once', async () => {
		const first = jest.fn(), second = jest.fn();
		getLocale('pt-BR', first);
		getLocale('pt_br', second);
		await flush();
		expect(fetch.mock.calls).toEqual([['_locales/pt_BR/messages.json']]);
		expect(first).toHaveBeenCalledTimes(1);
		expect(second).toHaveBeenCalledTimes(1);
		expect(chrome.storage.local.set).toHaveBeenCalledTimes(1);
	});

	test.each([null, {}, { donate: 'Donate' }, { donate: 'Donate', rateMe: ' ' }, { donate: 42, rateMe: 'Rate me' }])('refreshes an invalid label cache %j', messages => {
		data.context_menu_locale_cache = { version: '4', language: 'en', messages };
		return new Promise(resolve => getLocale('en', resolve)).then(result => {
			expect(result.rateMe.message).toBe('Rate me');
			expect(fetch).toHaveBeenCalledTimes(1);
		});
	});

	test('does not cache incomplete catalogs and retries them on the next lookup', async () => {
		fetch.mockResolvedValue(response({ donate: { message: 'Donate' }, rateMe: { message: '' } }));
		const first = jest.fn();
		getLocale('en', first);
		await flush();
		expect(first).toHaveBeenCalledWith({ donate: { message: 'Donate' } });
		expect(chrome.storage.local.set).not.toHaveBeenCalled();
		getLocale('en', jest.fn());
		await flush();
		expect(fetch).toHaveBeenCalledTimes(2);
	});

	test.each(['read', 'write'])('still returns labels after an asynchronous cache %s failure', async operation => {
		const method = operation === 'read' ? 'get' : 'set';
		chrome.storage.local[method].mockImplementationOnce((value, callback) => queueMicrotask(() => {
			chrome.runtime.lastError = { message: 'Storage unavailable' };
			callback();
			delete chrome.runtime.lastError;
		}));
		const callback = jest.fn();
		getLocale('en', callback);
		await flush();
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback.mock.calls[0][0].rateMe.message).toBe('Rate me');
	});

	test.each(['get', 'set'])('still returns labels when storage.%s throws synchronously', async method => {
		chrome.storage.local[method].mockImplementationOnce(() => { throw new Error('Storage unavailable'); });
		const callback = jest.fn();
		getLocale('en', callback);
		await flush();
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback.mock.calls[0][0].rateMe.message).toBe('Rate me');
	});
});
