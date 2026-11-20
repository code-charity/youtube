// Invidious / Piped redirect (issue #4099)

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const read = (...parts) => fs.readFileSync(path.join(__dirname, '../..', ...parts), 'utf8');

function load({ instance = 'yewtu.be', auto = false, search = '?v=dQw4w9WgXcQ', pathname = '/watch' } = {}) {
	const noop = () => {};
	const store = {};
	const calls = [];
	const context = {
		ImprovedTube: {
			storage: { invidious_instance: instance, invidious_auto_redirect: auto },
			messages: { send: noop }
		},
		document: {
			querySelector: () => null,
			querySelectorAll: () => [],
			addEventListener: noop,
			createElement: () => ({ style: {}, setAttribute: noop, appendChild: noop, addEventListener: noop }),
			createElementNS: () => ({ setAttribute: noop, appendChild: noop, style: {} }),
			documentElement: { hasAttribute: () => false }
		},
		location: {
			pathname,
			search,
			replace: (url) => calls.push(url),
			href: 'https://www.youtube.com' + pathname + search
		},
		sessionStorage: {
			getItem: (key) => (key in store ? store[key] : null),
			setItem: (key, value) => { store[key] = String(value); }
		},
		window: { open: noop },
		console,
		setTimeout: noop,
		clearTimeout: noop
	};
	vm.runInNewContext(read('js&css', 'web-accessible', 'www.youtube.com', 'features', 'invidious.js'), context);
	return { IT: context.ImprovedTube, calls, store, location: context.location };
}

describe('Invidious redirect (#4099)', () => {
	test('builds a watch URL for a host', () => {
		expect(load().IT.invidiousWatchUrl('yewtu.be', 'dQw4w9WgXcQ'))
			.toBe('https://yewtu.be/watch?v=dQw4w9WgXcQ');
	});

	test('knows the offered instances and treats off as no instance', () => {
		expect(Object.keys(load().IT.invidiousInstances)).toContain('piped.video');
		expect(load({ instance: 'off' }).IT.invidiousInstances['off']).toBe(undefined);
	});

	test('auto redirect is only on when the switch is true', () => {
		expect(load({ auto: true }).IT.invidiousAutoRedirect()).toBe(true);
		expect(load({ auto: false }).IT.invidiousAutoRedirect()).toBe(false);
	});

	test('redirects a watch page once per video per tab', () => {
		const { IT, calls, store } = load({ auto: true });

		IT.invidiousMaybeRedirect();
		IT.invidiousMaybeRedirect();

		expect(calls).toEqual(['https://yewtu.be/watch?v=dQw4w9WgXcQ']);
		expect(store['it-invidious-redirected']).toBe('dQw4w9WgXcQ');
	});

	test('a different video may redirect again', () => {
		const { IT, calls, location } = load({ auto: true });

		IT.invidiousMaybeRedirect();
		location.search = '?v=abcdefghijk';
		IT.invidiousMaybeRedirect();

		expect(calls).toHaveLength(2);
	});

	test('never redirects when auto is off, off the watch page, or with no video', () => {
		const off = load({ auto: false });
		off.IT.invidiousMaybeRedirect();
		expect(off.calls).toHaveLength(0);

		const feed = load({ auto: true, pathname: '/feed/subscriptions' });
		feed.IT.invidiousMaybeRedirect();
		expect(feed.calls).toHaveLength(0);

		const noId = load({ auto: true, search: '' });
		noId.IT.invidiousMaybeRedirect();
		expect(noId.calls).toHaveLength(0);
	});
});
