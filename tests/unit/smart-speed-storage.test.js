const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.join(__dirname, '../..');
const sessions = [];
const clone = value => JSON.parse(JSON.stringify(value));
const channelId = 'UC1234567890123456789012';
const channelKey = 'channel:' + channelId;

function load (initial = {}) {
	const errors = [];
	const output = new VirtualConsole();
	output.on('jsdomError', error => errors.push(error));
	const dom = new JSDOM('<!doctype html><html><body></body></html>', {
		url: 'https://www.youtube.com/watch?v=abcdefghijk', runScripts: 'outside-only', virtualConsole: output
	});
	sessions.push(dom);
	const { window } = dom;
	window.setTimeout = setTimeout;
	window.clearTimeout = clearTimeout;
	window.setInterval = setInterval;
	window.clearInterval = clearInterval;
	const stored = clone(initial);
	const listeners = [];
	function update (values, callback) {
		setTimeout(() => {
			const changes = {};
			for (const [key, value] of Object.entries(values)) {
				if (JSON.stringify(stored[key]) === JSON.stringify(value)) continue;
				changes[key] = { oldValue: stored[key], newValue: value };
				if (value === undefined) delete stored[key];
				else stored[key] = clone(value);
			}
			if (Object.keys(changes).length) listeners.forEach(listener => listener(changes, 'local'));
			callback?.();
		}, 0);
	}
	window.chrome = {
		runtime: { sendMessage () {}, onMessage: { addListener () {} } },
		storage: {
			onChanged: { addListener: listener => listeners.push(listener) },
			local: {
				get: callback => setTimeout(() => callback(clone(stored)), 0),
				set: (values, callback) => update(clone(values), callback),
				remove: (keys, callback) => update(Object.fromEntries([].concat(keys).map(key => [key, undefined])), callback)
			}
		}
	};
	const evaluate = file => window.eval(fs.readFileSync(path.join(root, file), 'utf8'));
	evaluate('js&css/web-accessible/core.js');
	evaluate('js&css/web-accessible/functions.js');
	evaluate('js&css/web-accessible/www.youtube.com/player.js');
	const IT = window.ImprovedTube;
	IT.init = () => {};
	IT.blocklistInit = () => {};
	evaluate('js&css/extension/core.js');
	window.extension.features.youtubeHomePage = () => {};
	window.extension.inject = () => {};
	evaluate('js&css/extension/init.js');
	window.extension.storage.listener();
	window.extension.storage.load();
	return {
		window, IT, stored,
		async flush () {
			await jest.advanceTimersByTimeAsync(1);
			if (errors.length) throw errors.shift();
		},
		identifyChannel () {
			IT.smartSpeed.session = { playerResponse: { videoDetails: { channelId, author: 'Guide' } } };
		}
	};
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => { sessions.splice(0).forEach(dom => dom.window.close()); jest.clearAllTimers(); jest.useRealTimers(); });

describe('Smart Speed persists through the production page/content bridge', () => {
	test.each([
		['toggleLiveWhitelist', 'smart_speed_whitelist_live'],
		['toggleShortsWhitelist', 'smart_speed_whitelist_shorts']
	])('%s saves explicit false and survives loading a new page', async (method, key) => {
		const page = load();
		await page.flush();
		page.IT.smartSpeed[method]();
		await page.flush();
		expect(page.stored[key]).toBe(false);
		expect(page.window.extension.storage.data[key]).toBe(false);
		const reloaded = load(page.stored);
		await reloaded.flush();
		expect(reloaded.IT.storage[key]).toBe(false);
		reloaded.IT.smartSpeed[method]();
		await reloaded.flush();
		expect(reloaded.stored[key]).toBe(true);
	});

	test('queues both whitelist changes without losing either preference', async () => {
		const page = load({ unrelated: 'keep' });
		await page.flush();
		page.IT.smartSpeed.toggleLiveWhitelist();
		page.IT.smartSpeed.toggleShortsWhitelist();
		await page.flush();
		expect(page.stored).toEqual({ unrelated: 'keep', smart_speed_whitelist_live: false, smart_speed_whitelist_shorts: false });
		expect(page.IT.messages.queue).toHaveLength(0);
		expect(page.window.extension.messages.queue).toHaveLength(0);
	});

	test('saves a channel whitelist and removes it after a new page loads', async () => {
		const page = load({ smart_speed_profiles: { 'category:Education': { min: 1.5, max: 2 } } });
		await page.flush();
		page.identifyChannel();
		page.IT.smartSpeed.toggleChannelWhitelist();
		await page.flush();
		expect(page.stored.smart_speed_profiles).toEqual({
			'category:Education': { min: 1.5, max: 2 },
			[channelKey]: { name: 'Guide', whitelist: true }
		});
		const reloaded = load(page.stored);
		await reloaded.flush();
		reloaded.identifyChannel();
		reloaded.IT.smartSpeed.toggleChannelWhitelist();
		await reloaded.flush();
		expect(reloaded.stored.smart_speed_profiles).toEqual({ 'category:Education': { min: 1.5, max: 2 } });
	});

	test('removing a channel whitelist preserves its speed settings and other profiles', async () => {
		const page = load({ smart_speed_profiles: {
			[channelKey]: { name: 'Guide', min: 1.25, max: 3, whitelist: true },
			'lang:en': { min: 1, max: 2 }
		} });
		await page.flush();
		page.identifyChannel();
		page.IT.smartSpeed.toggleChannelWhitelist();
		await page.flush();
		expect(page.stored.smart_speed_profiles).toEqual({
			[channelKey]: { name: 'Guide', min: 1.25, max: 3 },
			'lang:en': { min: 1, max: 2 }
		});
	});

	test('profile resolution persists legacy channel migration while preserving canonical overrides', async () => {
		const page = load({ smart_speed_profiles: {
			'name:Guide': { min: 1, max: 3, whitelist: true },
			[channelKey]: { min: 1.5 },
			'lang:en': { max: 2 }
		} });
		await page.flush();
		page.identifyChannel();
		const video = page.window.document.createElement('video');
		Object.defineProperty(video, 'paused', { value: false });
		page.window.document.body.appendChild(video);
		page.IT.smartSpeed.video = video;
		page.IT.storage.smart_speed = true;
		page.IT.smartSpeed.tick();
		await page.flush();
		expect(page.stored.smart_speed_profiles).toEqual({
			[channelKey]: { min: 1.5, max: 3, whitelist: true },
			'lang:en': { max: 2 }
		});
		const reloaded = load(page.stored);
		await reloaded.flush();
		expect(reloaded.IT.storage.smart_speed_profiles[channelKey]).toEqual({ min: 1.5, max: 3, whitelist: true });
		expect(reloaded.IT.storage.smart_speed_profiles).not.toHaveProperty('name:Guide');
	});

	test('does not create a profile when the channel identity is unavailable', async () => {
		const page = load({ unrelated: 'keep' });
		await page.flush();
		page.IT.smartSpeed.toggleChannelWhitelist();
		await page.flush();
		expect(page.stored).toEqual({ unrelated: 'keep' });
	});
});
