// Regression coverage for the last-watched overlay lifecycle (#4083).
// The production module is executed in a VM with instrumented DOM/timer APIs.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SOURCE = path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/last-watched-overlay.js');
const code = fs.readFileSync(SOURCE, 'utf8');

function createApp (settings = {}) {
	const listeners = {};
	const timeouts = [];
	const intervals = [];
	const observers = [];
	const storage = Object.assign({ show_last_watched_overlay: true }, settings);

	function element () {
		return {
			style: {}, dataset: {}, classList: { add () {} },
			appendChild () {}, querySelector: () => null,
			textContent: '', id: '', className: ''
		};
	}

	const document = {
		getElementById: () => null,
		createElement: () => element(),
		head: { appendChild () {} },
		body: {},
		querySelectorAll: () => [],
		querySelector: () => null,
		addEventListener (type, fn) {
			(listeners[type] = listeners[type] || []).push(fn);
		},
		removeEventListener (type, fn) {
			const list = listeners[type] || [];
			const index = list.indexOf(fn);
			if (index >= 0) list.splice(index, 1);
		}
	};

	const context = {
		ImprovedTube: { storage },
		document,
		location: { pathname: '/watch', search: '?v=abc123' },
		localStorage: { getItem: () => null, setItem () {} },
		console: { log () {}, warn () {}, error () {} },
		URL,
		URLSearchParams,
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

	vm.runInNewContext(code, context, { filename: 'last-watched-overlay.js' });

	return {
		context,
		storage,
		listeners,
		timeouts,
		intervals,
		observers,
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
});
