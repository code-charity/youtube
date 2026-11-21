// Regression coverage for the last-watched overlay lifecycle (#4083).
// Production modules are executed in a VM with instrumented DOM/timer APIs.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '../..');
const SOURCE = path.join(root, 'js&css/web-accessible/www.youtube.com/last-watched-overlay.js');
const CORE_SOURCE = path.join(root, 'js&css/web-accessible/core.js');
const code = fs.readFileSync(SOURCE, 'utf8');
const coreCode = fs.readFileSync(CORE_SOURCE, 'utf8');

function buildEnvironment (settings = {}) {
	const listeners = {};
	const timeouts = [];
	const intervals = [];
	const observers = [];
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

	return {
		context, document, storage, provider, listeners, timeouts, intervals, observers, overlays, containers, saved, style,
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

function createApp (settings = {}, source = code) {
	const app = buildEnvironment(settings);
	app.context.ImprovedTube = { storage: app.storage };
	vm.runInNewContext(source, app.context, { filename: 'last-watched-overlay.js' });
	return app;
}

function createDispatcherApp (settings = {}, source = code) {
	const app = buildEnvironment(settings);
	vm.runInNewContext(coreCode, app.context, { filename: 'core.js' });
	app.context.ImprovedTube.storage = app.storage;
	vm.runInNewContext(source, app.context, { filename: 'last-watched-overlay.js' });
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

	test('mutation bursts keep tracked timeouts bounded', () => {
		const legacy = code.replace('cancel(processingTimeout);', 'clearTimeout(processingTimeout);');
		const broken = createApp({}, legacy);
		broken.observers[0].cb([thumbnailMutation]);
		broken.observers[0].cb([thumbnailMutation]);
		broken.observers[0].cb([thumbnailMutation]);
		expect(broken.context.ImprovedTube.lastWatchedOverlayTracked()).toBe(4);

		const app = createApp();
		for (let i = 0; i < 50; i++) app.observers[0].cb([thumbnailMutation]);

		expect(app.context.ImprovedTube.lastWatchedOverlayTracked()).toBeLessThanOrEqual(2);
		expect(app.activeObservers()).toHaveLength(1);
	});

	test('real storage dispatcher detaches and re-enables via camelized hook', () => {
		const noAlias = code.replace('ImprovedTube.showLastWatchedOverlay = ImprovedTube.lastWatchedOverlay;', '');
		const broken = createDispatcherApp({}, noAlias);
		broken.send(storageChange(false));
		expect(broken.activeObservers()).toHaveLength(1);

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

	test('stale history callbacks and timers cannot mutate a re-enabled generation', () => {
		const app = createApp();
		const staleTimer = app.timeouts[0];
		const staleHistory = Object.assign({}, app.storage.watch_history, { stale: 12345 });

		app.storage.show_last_watched_overlay = false;
		app.context.ImprovedTube.lastWatchedOverlay();
		app.storage.show_last_watched_overlay = true;
		app.context.ImprovedTube.lastWatchedOverlay();

		const currentHistory = app.context.ImprovedTube.storage.watch_history;
		staleTimer.fn();
		expect(app.context.ImprovedTube.storage.watch_history).toBe(currentHistory);
		expect(app.context.ImprovedTube.storage.watch_history.stale).toBeUndefined();
		expect(app.observers).toHaveLength(2);
		expect(staleHistory.stale).toBe(12345);
	});

	test('disable flushes pending persistence and removes owned overlays', () => {
		const brokenSource = code
			.replace('try { state.flush(); }', 'try { /* pending save dropped */ }')
			.replace("document.querySelectorAll('.it-last-watched-overlay')", '[]');
		const broken = createApp({}, brokenSource);
		broken.fire('yt-navigate-finish');
		const brokenOverlay = { remove: jest.fn() };
		broken.overlays.push(brokenOverlay);
		broken.storage.show_last_watched_overlay = false;
		broken.context.ImprovedTube.showLastWatchedOverlay();
		expect(broken.saved).toHaveLength(0);
		expect(brokenOverlay.remove).not.toHaveBeenCalled();

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
		expect(app.context.ImprovedTube.lastWatchedOverlayTracked()).toBe(0);
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
		expect(app.context.ImprovedTube.lastWatchedOverlayTracked()).toBeLessThanOrEqual(4);
	});

	test('pre-body initialization defers observation until DOMContentLoaded', () => {
		const app = createApp();
		app.document.body = null;
		const deferred = createApp();
		deferred.document.body = null;

		// Re-run against a context whose body is absent at initialization time.
		const fresh = buildEnvironment();
		fresh.context.ImprovedTube = { storage: fresh.storage };
		fresh.document.body = null;
		vm.runInNewContext(code, fresh.context, { filename: 'last-watched-overlay.js' });

		expect(fresh.observers).toHaveLength(1);
		expect(fresh.activeObservers()).toHaveLength(0);
		expect(fresh.listeners.DOMContentLoaded).toHaveLength(1);

		fresh.document.body = {};
		fresh.fire('DOMContentLoaded');
		expect(fresh.activeObservers()).toHaveLength(1);
		expect(fresh.listeners.DOMContentLoaded).toHaveLength(1);

		expect(app.observers).toHaveLength(1);
		expect(deferred.observers).toHaveLength(1);
	});
});
