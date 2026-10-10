// Test for Issue #4383: emit an "init_completed" event when the plugin is done initializing

const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('init_completed event', () => {
	let context;
	let order;
	let completed;

	function sendFromExtension(message) {
		const provider = { textContent: JSON.stringify(message) };
		context.document.querySelector = (selector) => (selector === '#it-messages-from-extension' ? provider : null);
		context.document.dispatchEvent(new context.CustomEvent('it-message-from-extension'));
	}

	beforeEach(() => {
		const document = new EventTarget();

		document.documentElement = { appendChild: () => {} };
		document.createElement = () => ({ style: {} });
		document.querySelector = () => null;

		context = vm.createContext({
			document,
			CustomEvent,
			console,
			localStorage: {},
			Object,
			JSON,
		});

		const corePath = path.join(__dirname, '../../js&css/web-accessible/core.js');

		vm.runInContext(fs.readFileSync(corePath, 'utf8'), context);

		order = [];
		completed = jest.fn(() => order.push('init_completed'));

		context.ImprovedTube.init = jest.fn(() => order.push('init'));
		context.ImprovedTube.blocklistInit = jest.fn(() => order.push('blocklistInit'));
		context.document.addEventListener('init_completed', completed);
	});

	test('is not emitted before the extension storage is loaded', () => {
		expect(completed).not.toHaveBeenCalled();
	});

	test('is emitted once after init() and blocklistInit() have run', () => {
		sendFromExtension({ action: 'storage-loaded', storage: {} });

		expect(context.ImprovedTube.init).toHaveBeenCalledTimes(1);
		expect(context.ImprovedTube.blocklistInit).toHaveBeenCalledTimes(1);
		expect(completed).toHaveBeenCalledTimes(1);
		expect(order).toEqual(['init', 'blocklistInit', 'init_completed']);
	});

	test('is not emitted for other messages', () => {
		sendFromExtension({ action: 'storage-changed', key: 'some_key', camelizedKey: 'someKey', value: true });

		expect(completed).not.toHaveBeenCalled();
	});
});
