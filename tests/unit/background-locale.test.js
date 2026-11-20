const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '../../background.js'), 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));
const response = messages => ({ ok: true, json: jest.fn().mockResolvedValue(messages) });

async function loadBackground () {
	const listener = () => ({ addListener: jest.fn() });
	const fetch = jest.fn().mockResolvedValue(response({}));
	const chrome = {
		runtime: { onInstalled: listener(), onMessage: listener(), setUninstallURL: jest.fn() },
		storage: { onChanged: listener() },
		contextMenus: { onClicked: listener(), removeAll: jest.fn(), create: jest.fn() },
		tabs: { onActivated: listener() },
		windows: { onFocusChanged: listener() },
		i18n: { getUILanguage: () => 'en' }
	};
	const context = { chrome, fetch, console };
	vm.runInNewContext(source, context, { filename: 'background.js' });
	await flush();
	fetch.mockClear();
	return { getLocale: context.getLocale, fetch };
}

describe('Background locale fallback (#4108)', () => {
	let getLocale, fetch;

	beforeEach(async () => {
		({ getLocale, fetch } = await loadBackground());
	});

	test.each(['pt_BR', 'pt-BR', ' pt-br '])('loads the exact regional locale first: %s', async language => {
		const messages = { donate: { message: 'Doar' } };
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
		const messages = { donate: { message: 'Doar' } };
		fetch.mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce(response(messages));
		const callback = jest.fn();
		getLocale('pt-BR', callback);
		await flush();

		expect(fetch.mock.calls).toEqual([['_locales/pt_BR/messages.json'], ['_locales/pt/messages.json']]);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(messages);
	});

	test('tries English once after an HTTP failure and invalid JSON', async () => {
		const messages = { donate: { message: 'Donate' } };
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
		expect(callback).toHaveBeenCalledWith({});
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
});
