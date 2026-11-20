const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

// Only browser services are mocked: Satus provides the renderer, controls and storage accessors.
module.exports = function loadMenu (stored = {}, extra = '') {
	const errors = [];
	const virtualConsole = new VirtualConsole();
	virtualConsole.on('jsdomError', error => errors.push(error));
	const dom = new JSDOM('<!doctype html><html><body></body></html>', {
		url: 'https://extension.test/menu/index.html',
		runScripts: 'outside-only',
		virtualConsole
	});
	const { window } = dom;
	const { document } = window;
	window.setTimeout = setTimeout;
	window.clearTimeout = clearTimeout;
	window.listeners = new Map();
	const addListener = window.addEventListener, removeListener = window.removeEventListener;
	window.addEventListener = function (type, listener, options) {
		const capture = options === true || !!options?.capture;
		const listeners = window.listeners.get(type) || [];
		if (!listeners.some(item => item.listener === listener && item.capture === capture)) listeners.push({ listener, capture });
		window.listeners.set(type, listeners);
		return addListener.call(this, type, listener, options);
	};
	window.removeEventListener = function (type, listener, options) {
		const capture = options === true || !!options?.capture;
		window.listeners.set(type, (window.listeners.get(type) || []).filter(item => item.listener !== listener || item.capture !== capture));
		return removeListener.call(this, type, listener, options);
	};
	document.pictureInPictureEnabled = true;
	const observers = new Set();
	const NativeObserver = window.MutationObserver;
	window.MutationObserver = class extends NativeObserver {
		constructor (callback) { super(callback); this.targets = []; observers.add(this); }
		observe (target, options) { this.targets.push({ target, options }); return super.observe(target, options); }
		disconnect () { this.targets = []; return super.disconnect(); }
	};
	const storageListeners = new Set();
	const data = JSON.parse(JSON.stringify(stored));
	const notify = (changes, callback) => {
		if (Object.keys(changes).length) for (const listener of [...storageListeners]) listener(changes, 'local');
		callback?.();
	};
	const chrome = {
		runtime: { getManifest: () => ({ version: '4' }) },
		storage: {
			onChanged: {
				addListener: jest.fn(listener => storageListeners.add(listener)),
				removeListener: jest.fn(listener => storageListeners.delete(listener))
			},
			local: {
				set: jest.fn((values, callback) => {
					const snapshot = JSON.parse(JSON.stringify(values));
					setTimeout(() => {
						const changes = {};
						for (const [key, value] of Object.entries(snapshot)) {
							if (JSON.stringify(data[key]) !== JSON.stringify(value)) changes[key] = { oldValue: data[key], newValue: value };
							data[key] = value;
						}
						notify(changes, callback);
					}, 0);
				}),
				remove: jest.fn((keys, callback) => setTimeout(() => {
					const changes = {};
					for (const key of [].concat(keys)) {
						if (Object.prototype.hasOwnProperty.call(data, key)) changes[key] = { oldValue: data[key] };
						delete data[key];
					}
					notify(changes, callback);
				}, 0)),
				clear: jest.fn(callback => chrome.storage.local.remove(Object.keys(data), callback))
			}
		}
	};
	window.chrome = chrome;
	const context = dom.getInternalVMContext();
	const root = path.join(__dirname, '../..');
	for (const file of ['menu/satus.js', 'menu/skeleton.js', 'menu/skeleton-parts/player.js', 'menu/skeleton-parts/shortcuts.js', 'menu/skeleton-parts/themes.js', 'menu/skeleton-parts/active-features.js']) {
		vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
	}
	vm.runInContext('satus.storage.data = ' + JSON.stringify(stored) + ';' + extra, context);
	vm.runInContext("satus.render(extension.skeleton); satus.parentify(extension.skeleton, ['attr', 'baseProvider', 'layersProvider', 'rendered', 'storage', 'parentObject', 'parentSkeleton', 'childrenContainer', 'value']);", context);
	const extension = vm.runInContext('extension', context), satus = window.satus;
	const layers = extension.skeleton.main.layers.rendered;
	const open = () => {
		extension.skeleton.header.sectionEnd.menu.rendered.click();
		extension.skeleton.header.sectionEnd.menu.on.click.activeFeatures.rendered.click();
		return extension.skeleton.header.sectionEnd.menu.on.click.activeFeatures.on.click.rendered;
	};
	const controls = view => [...view.querySelectorAll('*')].filter(element => ['switch', 'select', 'slider', 'shortcut', 'radio', 'color-picker', 'time'].includes(element.componentName));
	return { context, satus, extension, document, window, chrome, layers, open, controls, data, storageListeners, observers, errors,
		control: (view, key) => controls(view).find(element => element.storage?.key === key),
		event: (element, type, options) => element.dispatchEvent(new window.Event(type, { bubbles: true, ...options })),
		flush: async () => {
			jest.runAllTimers();
			await Promise.resolve();
			jest.runAllTimers();
			await Promise.resolve();
			if (errors.length) throw errors.shift();
		},
		close: () => { document.body.textContent = ''; window.close(); } };
};
