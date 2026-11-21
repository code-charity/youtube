// Regression coverage for the last-watched overlay lifecycle (#4083).
// Production modules run in a VM with instrumented DOM, timer and storage APIs.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '../..');
const SOURCE = path.join(root, 'js&css/web-accessible/www.youtube.com/last-watched-overlay.js');
const CORE_SOURCE = path.join(root, 'js&css/web-accessible/core.js');
const code = fs.readFileSync(SOURCE, 'utf8');
const coreCode = fs.readFileSync(CORE_SOURCE, 'utf8');

function buildEnvironment (settings = {}, options = {}) {
	const listeners = {};
	const timeouts = [];
	const intervals = [];
	const observers = [];
	const clearedCalls = [];
	const getCallbacks = [];
	const chromeWrites = [];
	const storage = Object.assign({ show_last_watched_overlay: true }, settings);
	const provider = { textContent: '' };
	const overlays = [];
	const containers = [];
	const saved = [];
	const style = { remove: jest.fn() };

	function element () {
		return {
			style: {}, dataset: {}, classList: { add () {}, remove () {} },
			appendChild () {}, querySelector: () => null,
			textContent: '', id: '', className: ''
		};
	}

	const document = {
		getElementById: id => id === 'it-last-watched-overlay-style' ? style : null,
		createElement: () => element(),
		documentElement: { appendChild () {} },
		head: { appendChild () {} },
		body: {},
		querySelector: selector => selector === '#it-messages-from-extension' ? provider : null,
		querySelectorAll: selector => {
			if (selector.indexOf('it-last-watched-overlay') >= 0) return overlays;
			if (selector.indexOf('it-lwo-container') >= 0) return containers;
			return [];
		},
		addEventListener (type, fn) {
			(listeners[type] = listeners[type] || []).push(fn);
		},
		removeEventListener (type, fn) {
			const list = listeners[type] || [];
			const index = list.indexOf(fn);
			if (index >= 0) list.splice(index, 1);
		},
		dispatchEvent (event) {
			(listeners[event.type] || []).slice().forEach(fn => fn(event));
		}
	};

	const localStorage = {
		getItem: () => null,
		setItem (key, value) { saved.push({ key, value }); },
		removeItem () {}
	};
	const context = {
		document,
		location: { pathname: '/watch', search: '?v=abc123' },
		localStorage,
		console: { log () {}, warn () {}, error () {} },
		URL,
		URLSearchParams,
		CustomEvent: class CustomEvent { constructor (type) { this.type = type; } },
		setTimeout (fn, ms) {
			const handle = { fn, ms, cleared: false };
			timeouts.push(handle);
			return handle;
		},
		clearTimeout (handle) {
			clearedCalls.push(handle);
			if (handle) handle.cleared = true;
		},
		setInterval (fn, ms) {
			const handle = { fn, ms, cleared: false };
			intervals.push(handle);
			return handle;
		},
		clearInterval (handle) {
			if (handle) handle.cleared = true;
		},
		MutationObserver: class MutationObserver {
			constructor (cb) {
				this.cb = cb;
				this.observed = false;
				observers.push(this);
			}
			observe () { this.observed = true; }
			disconnect () { this.observed = false; }
		}
	};

	if (options.asyncStorage) {
		context.chrome = {
			storage: {
				local: {
					get (key, cb) { getCallbacks.push(cb); },
					set (value) { chromeWrites.push(value); }
				}
			}
		};
	}

	return {
		context, document, storage, provider, listeners, timeouts, intervals, observers,
		clearedCalls, getCallbacks, chromeWrites, overlays, containers, saved, style,
		pending: ms => timeouts.filter(handle => handle.ms === ms && !handle.cleared),
		activeIntervals: () => intervals.filter(handle => !handle.cleared),
		activeObservers: () => observers.filter(observer => observer.observed),
		fire (type) {
			(listeners[type] || []).slice().forEach(fn => fn());
		},
		flush (limit = 20) {
			for (let pass = 0; pass < limit; pass++) {
				const pending = timeouts.filter(handle => !handle.cleared);
				if (!pending.length) return;
				pending.forEach(handle => {
					handle.cleared = true;
					handle.fn();
				});
			}
		}
	};
}

function createApp (settings = {}, options = {}) {
	const app = buildEnvironment(settings, options);
	app.context.ImprovedTube = { storage: app.storage };
	vm.runInNewContext(code, app.context, { filename: 'last-watched-overlay.js' });
	return app;
}

function createDispatcherApp (settings = {}, options = {}) {
	const app = buildEnvironment(settings, options);
	vm.runInNewContext(coreCode, app.context, { filename: 'core.js' });
	app.context.ImprovedTube.storage = app.storage;
	vm.runInNewContext(code, app.context, { filename: 'last-watched-overlay.js' });
	app.send = message => {
		app.provider.textContent = JSON.stringify(message);
		app.document.dispatchEvent(new app.context.CustomEvent('it-message-from-extension'));
	};
	return app;
}

const storageChange = value => ({
	action: 'storage-changed',
	key: 'show_last_watched_overlay',
	value,
	camelizedKey: 'showLastWatchedOverlay'
});

const thumbnailMutation = {
	type: 'childList',
	addedNodes: [{ nodeType: 1, matches: () => true, querySelector: () => null }]
};

describe('last watched overlay lifecycle (#4083)', () => {
	test('repeated initialization does not duplicate observers, intervals or listeners', () => {
		const app = createApp();
		expect(app.activeObservers()).toHaveLength(1);
		expect(app.activeIntervals()).toHaveLength(1);

		for (let i = 0; i < 4; i++) app.context.ImprovedTube.lastWatchedOverlay();

		expect(app.activeObservers()).toHaveLength(1);
		expect(app.activeIntervals()).toHaveLength(1);
		expect(app.listeners['yt-navigate-finish']).toHaveLength(1);
		expect(app.listeners['yt-page-data-updated']).toHaveLength(1);
	});

	test('page-data-updated does not recursively re-initialize the feature', () => {
		const app = createApp();
		app.fire('yt-page-data-updated');
		app.flush();

		expect(app.listeners['yt-page-data-updated']).toHaveLength(1);
		expect(app.observers).toHaveLength(1);
		expect(app.activeIntervals()).toHaveLength(1);
	});

	test('disabling the setting detaches observer, interval and listeners', () => {
		const app = createApp();
		expect(app.activeObservers()).toHaveLength(1);

		app.storage.show_last_watched_overlay = false;
		app.context.ImprovedTube.lastWatchedOverlay();

		expect(app.activeObservers()).toHaveLength(0);
		expect(app.activeIntervals()).toHaveLength(0);
		expect(app.listeners['yt-navigate-finish']).toHaveLength(0);
		expect(app.listeners['yt-page-data-updated']).toHaveLength(0);

		app.context.ImprovedTube.lastWatchedOverlay();
		expect(app.observers).toHaveLength(1);
	});

	test('mutation bursts leave one pending callback and never clear a handle twice', () => {
		const app = createApp();
		for (let i = 0; i < 50; i++) app.observers[0].cb([thumbnailMutation]);

		expect(app.pending(150)).toHaveLength(1);

		app.storage.show_last_watched_overlay = false;
		app.context.ImprovedTube.lastWatchedOverlay();

		const clearedTwice = new Map();
		app.clearedCalls.forEach(handle => clearedTwice.set(handle, (clearedTwice.get(handle) || 0) + 1));
		expect([...clearedTwice.values()].every(count => count === 1)).toBe(true);
	});

	test('real storage dispatcher detaches and re-enables via camelized hook', () => {
		const app = createDispatcherApp();
		expect(app.context.ImprovedTube.showLastWatchedOverlay).toBe(app.context.ImprovedTube.lastWatchedOverlay);

		app.send(storageChange(false));
		expect(app.activeObservers()).toHaveLength(0);
		expect(app.activeIntervals()).toHaveLength(0);
		expect(app.listeners['yt-page-data-updated']).toHaveLength(0);
		expect(app.context.ImprovedTube.lastWatchedOverlayProcess).toBeNull();

		app.send(storageChange(true));
		expect(app.activeObservers()).toHaveLength(1);
		expect(app.activeIntervals()).toHaveLength(1);
		expect(typeof app.context.ImprovedTube.lastWatchedOverlayProcess).toBe('function');
	});

	test('late history callback preserves data without reviving a disabled generation', () => {
		const app = createApp({}, { asyncStorage: true });
		const staleTimer = app.timeouts[0];
		const staleGet = app.getCallbacks[0];

		app.storage.show_last_watched_overlay = false;
		app.context.ImprovedTube.lastWatchedOverlay();
		const history = app.context.ImprovedTube.storage.watch_history;

		staleTimer.fn();
		staleGet({ it_watch_history: { savedVideo: 4242 } });

		expect(app.context.ImprovedTube.storage.watch_history).toBe(history);
		expect(history.savedVideo).toBe(4242);
		expect(app.chromeWrites).toHaveLength(1);
		expect(app.observers).toHaveLength(1);
		expect(app.activeIntervals()).toHaveLength(0);

		app.storage.show_last_watched_overlay = true;
		app.context.ImprovedTube.lastWatchedOverlay();
		expect(app.observers).toHaveLength(2);
	});

	test('disable flushes pending persistence and removes owned overlays', () => {
		const app = createApp();
		app.fire('yt-navigate-finish');
		const overlay = { remove: jest.fn() };
		const container = { classList: { remove: jest.fn() } };
		app.overlays.push(overlay);
		app.containers.push(container);
		app.storage.show_last_watched_overlay = false;
		app.context.ImprovedTube.showLastWatchedOverlay();

		expect(overlay.remove).toHaveBeenCalledTimes(1);
		expect(container.classList.remove).toHaveBeenCalledWith('it-lwo-container');
		expect(app.style.remove).toHaveBeenCalledTimes(1);
		expect(app.saved).toHaveLength(1);
		expect(JSON.parse(app.saved[0].value)).toHaveProperty('abc123');
		expect(app.timeouts.every(handle => handle.cleared)).toBe(true);
	});

	test('async history load pending at disable cannot be overwritten by teardown', () => {
		const app = createApp({}, { asyncStorage: true });
		const pendingGet = app.getCallbacks[0];
		expect(pendingGet).toBeDefined();

		app.storage.show_last_watched_overlay = false;
		app.context.ImprovedTube.lastWatchedOverlay();

		expect(app.chromeWrites).toHaveLength(0);
		pendingGet({ it_watch_history: { savedVideo: 4242 } });
		expect(app.storage.watch_history.savedVideo).toBe(4242);
		expect(app.chromeWrites).toHaveLength(1);
		expect(app.observers).toHaveLength(1);

		app.storage.show_last_watched_overlay = true;
		app.context.ImprovedTube.lastWatchedOverlay();
		expect(app.observers).toHaveLength(2);
		app.getCallbacks[1]({ it_watch_history: { savedVideo: 4242 } });

		app.fire('yt-navigate-finish');
		app.flush();
		expect(app.chromeWrites[app.chromeWrites.length - 1].it_watch_history.savedVideo).toBe(4242);
	});

	test('re-enable starts one generation and keeps scheduled work bounded', () => {
		const app = createApp();
		app.fire('yt-navigate-finish');
		app.storage.show_last_watched_overlay = false;
		app.context.ImprovedTube.showLastWatchedOverlay();
		app.storage.show_last_watched_overlay = true;
		app.context.ImprovedTube.showLastWatchedOverlay();

		for (let i = 0; i < 20; i++) app.fire('yt-navigate-finish');

		expect(app.observers).toHaveLength(2);
		expect(app.activeObservers()).toHaveLength(1);
		expect(app.activeIntervals()).toHaveLength(1);
		expect(app.timeouts.filter(handle => !handle.cleared).length).toBeLessThanOrEqual(4);
	});

	test('pre-body initialization defers observation until DOMContentLoaded', () => {
		const app = buildEnvironment();
		app.context.ImprovedTube = { storage: app.storage };
		app.document.body = null;
		vm.runInNewContext(code, app.context, { filename: 'last-watched-overlay.js' });

		expect(app.observers).toHaveLength(1);
		expect(app.activeObservers()).toHaveLength(0);
		expect(app.listeners.DOMContentLoaded).toHaveLength(1);

		app.document.body = {};
		app.fire('DOMContentLoaded');
		expect(app.activeObservers()).toHaveLength(1);
		expect(app.listeners.DOMContentLoaded).toHaveLength(1);
	});
});
