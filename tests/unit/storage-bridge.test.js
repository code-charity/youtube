const fs = require('fs');
const path = require('path');
const vm = require('vm');

const read = file => fs.readFileSync(path.join(__dirname, '../..', file), 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));

function loadBridge () {
	const listeners = new Map();
	const elements = new Map();
	const document = {
		addEventListener (type, handler) {
			if (!listeners.has(type)) listeners.set(type, []);
			listeners.get(type).push(handler);
		},
		dispatchEvent (event) {
			for (const handler of [...(listeners.get(event.type) || [])]) handler.call(document, event);
		},
		createElement: () => ({ style: {} }),
		querySelector: selector => elements.get(selector) || null,
		documentElement: {
			appendChild: element => elements.set('#' + element.id, element),
			setAttribute: jest.fn(),
			hasAttribute: () => false
		}
	};
	const changes = [];
	const stored = {};
	const chrome = {
		runtime: { getURL: file => 'chrome-extension://test/' + file, sendMessage: jest.fn(), onMessage: { addListener: jest.fn() } },
		storage: {
			onChanged: { addListener: listener => changes.push(listener) },
			local: {
				set: jest.fn(values => {
					Object.assign(stored, values);
					for (const listener of changes) listener(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { newValue: value }])), 'local');
				}),
				remove: jest.fn(keys => {
					for (const key of keys) delete stored[key];
					for (const listener of changes) listener(Object.fromEntries(keys.map(key => [key, {}])), 'local');
				})
			}
		}
	};
	const sandbox = vm.createContext({
		document, chrome, CustomEvent, queueMicrotask, console: { log: jest.fn() }, localStorage: {},
		setTimeout: jest.fn(), clearTimeout: jest.fn(),
		window: { addEventListener: jest.fn() }, navigator: { userAgent: 'Chrome' }, location: { pathname: '/watch' }
	});
	vm.runInContext(read('js&css/extension/core.js'), sandbox);
	sandbox.extension.features.youtubeHomePage = jest.fn();
	sandbox.extension.inject = jest.fn();
	vm.runInContext(read('js&css/extension/init.js'), sandbox);
	vm.runInContext(read('js&css/web-accessible/core.js'), sandbox);
	sandbox.ImprovedTube.init = jest.fn();
	sandbox.ImprovedTube.blocklistInit = jest.fn();
	sandbox.extension.storage.listener();
	return { ...sandbox, stored, elements, changes, listeners };
}

describe('Cross-context settings bridge', () => {
	test('reads nested storage paths without losing falsy values or following prototypes', () => {
		const { extension } = loadBridge();
		extension.storage.data = { settings: { enabled: false, count: 0, label: '', empty: null, hasOwnProperty: 'custom' } };
		expect(extension.storage.get('settings/enabled')).toBe(false);
		expect(extension.storage.get('/settings/count/')).toBe(0);
		expect(extension.storage.get('settings/label')).toBe('');
		expect(extension.storage.get('settings/empty')).toBeNull();
		expect(extension.storage.get('settings/empty/missing')).toBeUndefined();
		expect(extension.storage.get('settings/hasOwnProperty')).toBe('custom');
		expect(extension.storage.get('settings/toString')).toBeUndefined();
		expect(extension.storage.get('settings/missing')).toBeUndefined();
	});

	test.each([false, 0, '', true, 12, { enabled: false }])('persists an explicit setting value %j through the real bridge', async value => {
		const bridge = loadBridge();
		bridge.ImprovedTube.messages.send({ action: 'set', key: 'test_preference', value });
		await flush();
		expect(bridge.stored.test_preference).toEqual(value);
		expect(bridge.extension.storage.data.test_preference).toEqual(value);
		expect(bridge.ImprovedTube.storage.test_preference).toEqual(value);
		expect(bridge.chrome.storage.local.remove).not.toHaveBeenCalled();
	});

	test.each([null, undefined])('retains the null/omitted-value reset contract for %j', async value => {
		const bridge = loadBridge();
		bridge.stored.theme = 'dark';
		bridge.ImprovedTube.messages.send({ action: 'set', key: 'theme', value });
		await flush();
		expect(bridge.stored).not.toHaveProperty('theme');
		expect(bridge.chrome.storage.local.remove).toHaveBeenCalledWith(['theme']);
	});

	test('applies rapid writes in order and preserves the last explicit false', async () => {
		const bridge = loadBridge();
		for (const value of [true, false, true, false]) bridge.ImprovedTube.messages.send({ action: 'set', key: 'test_preference', value });
		await flush();
		expect(bridge.chrome.storage.local.set.mock.calls.map(([values]) => values.test_preference)).toEqual([true, false, true, false]);
		expect(bridge.ImprovedTube.storage.test_preference).toBe(false);
		expect(bridge.extension.messages.queue).toHaveLength(0);
		expect(bridge.ImprovedTube.messages.queue).toHaveLength(0);
	});

	test('finishes applying the current message before a reentrant update', async () => {
		const bridge = loadBridge();
		const observed = [];
		bridge.ImprovedTube.onPreference = () => {
			observed.push(bridge.ImprovedTube.storage.test_preference);
			if (observed.length === 1) bridge.extension.messages.send({ action: 'storage-changed', key: 'test_preference', camelizedKey: 'onPreference', value: 2 });
		};
		bridge.extension.messages.send({ action: 'storage-changed', key: 'test_preference', camelizedKey: 'onPreference', value: 1 });
		await flush();
		expect(observed).toEqual([1, 2]);
		expect(bridge.ImprovedTube.storage.test_preference).toBe(2);
	});

	test.each(['extension', 'ImprovedTube'])('delivers a queued backlog once and in FIFO order: %s', async namespace => {
		const bridge = loadBridge();
		const messages = bridge[namespace].messages;
		const event = namespace === 'extension' ? 'it-message-from-extension' : 'it-message-from-youtube';
		const handlers = bridge.listeners.get(event);
		bridge.listeners.set(event, []);
		messages.send({ action: 'set', key: 'first', value: 1 });
		messages.send({ action: 'set', key: 'second', value: 2 });
		messages.send({ action: 'set', key: 'third', value: 3 });
		const received = [];
		bridge.listeners.set(event, [() => {
			received.push(JSON.parse(messages.element.textContent).key);
			bridge.document.dispatchEvent(new CustomEvent(event + '--readed'));
		}]);
		bridge.document.dispatchEvent(new CustomEvent(event));
		await flush();
		expect(received).toEqual(['first', 'second', 'third']);
		expect(messages.queue).toHaveLength(0);
		bridge.listeners.set(event, handlers);
	});

	test('registers acknowledgement listeners once and ignores duplicate acknowledgements', async () => {
		const bridge = loadBridge();
		bridge.extension.messages.listener();
		bridge.ImprovedTube.messages.listener();
		for (const namespace of ['extension', 'ImprovedTube']) {
			const name = namespace === 'extension' ? 'it-message-from-extension' : 'it-message-from-youtube';
			expect(bridge.listeners.get(name + '--readed')).toHaveLength(1);
			bridge.document.dispatchEvent(new CustomEvent(name + '--readed'));
			expect(bridge[namespace].messages.queue).toHaveLength(0);
		}
		bridge.ImprovedTube.messages.send({ action: 'set', key: 'preference', value: false });
		bridge.document.dispatchEvent(new CustomEvent('it-message-from-youtube--readed'));
		await flush();
		expect(bridge.chrome.storage.local.set).toHaveBeenCalledTimes(1);
	});

	test.each(['not json', 'null', '[]', '42', '"text"', '{"action":"set"}', '{"action":"set","key":12,"value":true}'])('ignores malformed page messages and continues after %s', async payload => {
		const bridge = loadBridge();
		bridge.ImprovedTube.messages.send(payload);
		bridge.ImprovedTube.messages.send({ action: 'set', key: 'valid', value: false });
		await flush();
		expect(bridge.chrome.storage.local.set).toHaveBeenCalledTimes(1);
		expect(bridge.stored.valid).toBe(false);
		expect(bridge.chrome.storage.local.remove).not.toHaveBeenCalled();
	});

	test('drains a large synchronous burst without recursive event dispatch', async () => {
		const bridge = loadBridge();
		for (let value = 0; value < 2000; value++) bridge.ImprovedTube.messages.send({ action: 'set', key: 'counter', value });
		await flush();
		expect(bridge.chrome.storage.local.set).toHaveBeenCalledTimes(2000);
		expect(bridge.ImprovedTube.storage.counter).toBe(1999);
	});
});
