const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.join(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sources = ['js&css/web-accessible/core.js', 'js&css/web-accessible/functions.js',
	'js&css/web-accessible/www.youtube.com/playlist.js', 'js&css/web-accessible/www.youtube.com/shortcuts.js'];
const sessions = [];
const keyFor = id => 'playlist_autoplay_override_' + id + '_value';
const initialUrl = 'https://www.youtube.com/watch?v=abcdefghijk&list=PLalpha';

function load (storage = {}, url = initialUrl, withWatch = true) {
	const errors = [];
	const console = new VirtualConsole();
	console.on('jsdomError', error => errors.push(error));
	const dom = new JSDOM('<!doctype html><html><body></body></html>', { url, runScripts: 'outside-only', virtualConsole: console });
	sessions.push(dom);
	const { window } = dom, { document } = window;
	window.setTimeout = setTimeout;
	window.clearTimeout = clearTimeout;
	const observers = new Set();
	const NativeObserver = window.MutationObserver;
	window.MutationObserver = class extends NativeObserver {
		constructor (callback) { super(callback); this.active = false; observers.add(this); }
		observe (...args) { this.active = true; return super.observe(...args); }
		disconnect () { this.active = false; return super.disconnect(); }
	};
	const add = jest.spyOn(document, 'addEventListener');
	const remove = jest.spyOn(document, 'removeEventListener');
	function addWatch (id = 'PLalpha', index = 0) {
		const watch = document.createElement('ytd-watch-flexy');
		watch.innerHTML = '<div id="movie_player"><video></video><a class="ytp-next-button">Next</a><a class="ytp-prev-button">Previous</a></div>' +
			'<ytd-playlist-panel-renderer><div id="playlist-action-menu"><div id="top-level-buttons-computed"></div></div></ytd-playlist-panel-renderer>';
		watch.playlistData = { playlistId: id, currentIndex: index, localCurrentIndex: index, totalVideos: 66, contents: Array.from({ length: 66 }, () => ({})) };
		const panel = watch.querySelector('ytd-playlist-panel-renderer');
		panel.data = { ...watch.playlistData };
		const player = watch.querySelector('#movie_player'), video = player.querySelector('video');
		player.getVideoData = jest.fn(() => ({ video_id: new URL(window.location.href).searchParams.get('v') }));
		player.nextVideo = jest.fn();
		player.previousVideo = jest.fn();
		document.body.appendChild(watch);
		return { watch, panel, player, video };
	}
	const elements = withWatch ? addWatch() : {};
	const context = dom.getInternalVMContext();
	for (const file of sources) vm.runInContext(read(file), context, { filename: file });
	const IT = window.ImprovedTube;
	IT.storage = JSON.parse(JSON.stringify(storage));
	IT.init = () => {};
	IT.blocklistInit = () => {};
	Object.assign(IT.elements, { ytd_watch: elements.watch, player: elements.player, video: elements.video });
	const provider = document.createElement('div');
	provider.id = 'it-messages-from-extension';
	document.documentElement.appendChild(provider);
	const sent = [];
	let contentBridge = false;
	document.addEventListener('it-message-from-youtube', function () {
		sent.push(JSON.parse(document.getElementById('it-messages-from-youtube').textContent));
		if (!contentBridge) document.dispatchEvent(new window.CustomEvent('it-message-from-youtube--readed'));
	});
	const connectStorage = () => {
		contentBridge = true;
		provider.remove();
		const persisted = JSON.parse(JSON.stringify(IT.storage));
		let storageChanged;
		const update = values => setTimeout(() => {
			const changes = {};
			for (const [key, value] of Object.entries(values)) {
				if (JSON.stringify(persisted[key]) === JSON.stringify(value)) continue;
				changes[key] = { oldValue: persisted[key], newValue: value };
				if (value === undefined) delete persisted[key];
				else persisted[key] = JSON.parse(JSON.stringify(value));
			}
			if (Object.keys(changes).length) storageChanged(changes, 'local');
		}, 0);
		const local = {
			set: jest.fn(update),
			remove: jest.fn(keys => update(Object.fromEntries(keys.map(key => [key, undefined]))))
		};
		window.chrome = {
			runtime: { sendMessage: jest.fn(), onMessage: { addListener: jest.fn() } },
			storage: { local, onChanged: { addListener: listener => { storageChanged = listener; } } }
		};
		vm.runInContext(read('js&css/extension/core.js'), context, { filename: 'js&css/extension/core.js' });
		window.extension.features.youtubeHomePage = () => {};
		window.extension.inject = () => {};
		window.extension.storage.data = JSON.parse(JSON.stringify(IT.storage));
		vm.runInContext(read('js&css/extension/init.js'), context, { filename: 'js&css/extension/init.js' });
		window.extension.storage.listener();
		return { persisted, ...local };
	};
	const emit = (target, type, options = {}) => {
		const Constructor = type === 'keydown' ? window.KeyboardEvent : window.Event;
		const event = new Constructor(type, { bubbles: true, cancelable: true, composed: true, ...options });
		target.dispatchEvent(event);
		if (errors.length) throw errors.shift();
		return event;
	};
	const change = (key, value) => {
		provider.textContent = JSON.stringify({ action: 'storage-changed', key, value,
			camelizedKey: key.replace(/[_-](.)/g, (match, letter) => letter.toUpperCase()) });
		emit(document, 'it-message-from-extension');
	};
	return { ...elements, IT, window, document, addWatch, observers, sent, add, remove, emit, change, connectStorage,
		init: () => {
			provider.textContent = JSON.stringify({ action: 'storage-loaded', storage: JSON.parse(JSON.stringify(storage)) });
			emit(document, 'it-message-from-extension');
		},
		echo: index => { const message = sent[index]; change(message.key, message.value === null ? undefined : message.value); },
		toggle: () => document.getElementById('it-playlist-autoplay-toggle'),
		reset: () => document.getElementById('it-playlist-autoplay-reset'),
		flush: async (milliseconds = 60) => {
			await Promise.resolve();
			jest.advanceTimersByTime(milliseconds);
			await Promise.resolve();
			jest.advanceTimersByTime(0);
			await Promise.resolve();
			if (errors.length) throw errors.shift();
		} };
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => { sessions.splice(0).forEach(dom => dom.window.close()); jest.clearAllTimers(); jest.useRealTimers(); });

describe('Per-playlist autoplay through production playlist and page core code (#4086)', () => {
	test('is opt-in and does not write preferences or mask an allowed playlist', async () => {
		const page = load();
		page.init();
		await page.flush();
		expect(page.toggle()).toBeNull();
		expect(page.watch.playlistData.currentIndex).toBe(0);
		expect(page.sent).toEqual([]);
	});

	test('suppresses index zero for both playlist data objects and restores their real indices', async () => {
		const page = load({ playlist_up_next_autoplay: false });
		page.init();
		await page.flush();
		expect(page.watch.playlistData.currentIndex).toBe(66);
		expect(page.panel.data.currentIndex).toBe(66);
		page.change('playlist_up_next_autoplay', true);
		expect(page.watch.playlistData.currentIndex).toBe(0);
		expect(page.panel.data.currentIndex).toBe(0);
		expect(page.sent).toEqual([]);
	});

	test.each([[true, false], [false, true]])('an override %s wins over the global default %s', async (override, global) => {
		const page = load({ playlist_autoplay_per_playlist: true, playlist_up_next_autoplay: global, [keyFor('PLalpha')]: { enabled: override } });
		page.init();
		await page.flush();
		expect(page.IT.playlistAutoplayEnabled()).toBe(override);
		expect(page.toggle().getAttribute('aria-checked')).toBe(String(override));
		expect(page.watch.playlistData.currentIndex).toBe(override ? 0 : 66);
		page.change('playlist_autoplay_per_playlist', false);
		expect(page.toggle()).toBeNull();
		expect(page.IT.playlistAutoplayEnabled()).toBe(global);
		expect(page.watch.playlistData.currentIndex).toBe(global ? 0 : 66);
	});

	test.each([null, false, [], {}, { enabled: 'false' }])('ignores malformed override %j', async override => {
		const page = load({ playlist_autoplay_per_playlist: true, [keyFor('PLalpha')]: override });
		page.init();
		await page.flush();
		expect(page.IT.playlistAutoplayEnabled()).toBe(true);
		expect(page.reset().disabled).toBe(true);
	});

	test('writes an independent per-list record and Use default removes only that record', async () => {
		const page = load({ playlist_autoplay_per_playlist: true, [keyFor('PLother')]: { enabled: false } });
		page.init();
		await page.flush();
		page.toggle().click();
		expect(page.sent).toEqual([{ action: 'set', key: keyFor('PLalpha'), value: { enabled: false } }]);
		expect(page.watch.playlistData.currentIndex).toBe(66);
		page.echo(0);
		page.reset().click();
		expect(page.sent[1]).toEqual({ action: 'set', key: keyFor('PLalpha'), value: null });
		page.echo(1);
		expect(page.watch.playlistData.currentIndex).toBe(0);
		expect(page.IT.storage[keyFor('PLother')]).toEqual({ enabled: false });
		expect(page.IT.storage.playlist_up_next_autoplay).toBeUndefined();
		expect(page.reset().disabled).toBe(true);
	});

	test('persists false and reset through the production content bridge, including playlist IDs ending in an underscore', async () => {
		const id = 'PLalpha_';
		const page = load({ playlist_autoplay_per_playlist: true, [keyFor('PLother')]: { enabled: false } }, initialUrl.replace('PLalpha', id));
		page.watch.playlistData.playlistId = page.panel.data.playlistId = id;
		page.init();
		await page.flush();
		const bridge = page.connectStorage();
		page.toggle().click();
		await page.flush();
		expect(bridge.set).toHaveBeenCalledWith({ [keyFor(id)]: { enabled: false } });
		expect(bridge.persisted[keyFor(id)]).toEqual({ enabled: false });
		expect(page.IT.storage[keyFor(id)]).toEqual({ enabled: false });
		expect(page.watch.playlistData.currentIndex).toBe(66);
		page.toggle().click();
		await page.flush();
		bridge.set({ playlist_up_next_autoplay: false });
		await page.flush();
		expect(page.toggle().getAttribute('aria-checked')).toBe('true');
		expect(page.watch.playlistData.currentIndex).toBe(0);
		page.reset().click();
		await page.flush();
		expect(bridge.remove).toHaveBeenCalledWith([keyFor(id)]);
		expect(bridge.persisted[keyFor(id)]).toBeUndefined();
		expect(bridge.persisted[keyFor('PLother')]).toEqual({ enabled: false });
		expect(page.toggle().textContent).toBe('Autoplay next video: Off (default)');
		expect(page.watch.playlistData.currentIndex).toBe(66);
		bridge.remove(['playlist_up_next_autoplay']);
		await page.flush();
		expect(page.toggle().textContent).toBe('Autoplay next video: On (default)');
		expect(page.watch.playlistData.currentIndex).toBe(0);
		expect(page.document.getElementById('it-playlist-autoplay-status').textContent).toBe('');
		expect(page.sent).toHaveLength(3);
		expect(jest.getTimerCount()).toBe(0);
	});

	test('keeps the latest rapid click effective while older storage echoes arrive', async () => {
		const page = load({ playlist_autoplay_per_playlist: true });
		page.init();
		await page.flush();
		page.toggle().click();
		page.toggle().click();
		page.toggle().click();
		expect(page.sent.map(message => message.value.enabled)).toEqual([false]);
		page.echo(0);
		expect(page.toggle().getAttribute('aria-checked')).toBe('false');
		expect(page.watch.playlistData.currentIndex).toBe(66);
		page.change(keyFor('PLalpha'), { enabled: true });
		expect(page.watch.playlistData.currentIndex).toBe(0);
		expect(page.sent).toHaveLength(1);
		expect(jest.getTimerCount()).toBe(0);
	});

	test('serializes a newer preference behind its old echo and sends no extra writes on acknowledgement', async () => {
		const page = load({ playlist_autoplay_per_playlist: true });
		page.init();
		await page.flush();
		page.toggle().click();
		page.toggle().click();
		expect(page.sent).toHaveLength(1);
		expect(page.IT.storage[keyFor('PLalpha')]).toBeUndefined();
		expect(page.toggle().getAttribute('aria-checked')).toBe('true');
		page.echo(0);
		expect(page.sent.map(message => message.value.enabled)).toEqual([false, true]);
		expect(page.toggle().getAttribute('aria-checked')).toBe('true');
		page.echo(1);
		await page.flush(6000);
		expect(page.IT.storage[keyFor('PLalpha')]).toEqual({ enabled: true });
		expect(page.sent).toHaveLength(2);
		expect(page.document.getElementById('it-playlist-autoplay-status').textContent).toBe('');
		expect(jest.getTimerCount()).toBe(0);
	});

	test('reset while a write is pending follows it with removal, without deleting unrelated settings', async () => {
		const page = load({ playlist_autoplay_per_playlist: true, [keyFor('PLother')]: { enabled: false } });
		page.init();
		await page.flush();
		page.toggle().click();
		page.reset().click();
		expect(page.sent).toHaveLength(1);
		expect(page.toggle().getAttribute('aria-checked')).toBe('true');
		page.echo(0);
		expect(page.sent[1]).toEqual({ action: 'set', key: keyFor('PLalpha'), value: null });
		page.echo(1);
		await page.flush(6000);
		expect(page.IT.storage[keyFor('PLalpha')]).toBeUndefined();
		expect(page.IT.storage[keyFor('PLother')]).toEqual({ enabled: false });
		expect(page.reset().disabled).toBe(true);
		expect(jest.getTimerCount()).toBe(0);
	});

	test('unconfirmed persistence expires without inventing a saved value or retrying indefinitely', async () => {
		const page = load({ playlist_autoplay_per_playlist: true });
		page.init();
		await page.flush();
		page.toggle().click();
		expect(page.document.getElementById('it-playlist-autoplay-status').textContent).toBe('Saving…');
		await page.flush(5000);
		expect(page.toggle().getAttribute('aria-checked')).toBe('true');
		expect(page.watch.playlistData.currentIndex).toBe(0);
		expect(page.IT.storage[keyFor('PLalpha')]).toBeUndefined();
		expect(page.document.getElementById('it-playlist-autoplay-status').textContent).toContain('not confirmed');
		expect(page.sent).toHaveLength(1);
		expect(jest.getTimerCount()).toBe(0);
		page.echo(0);
		expect(page.toggle().getAttribute('aria-checked')).toBe('false');
		expect(page.document.getElementById('it-playlist-autoplay-status').textContent).toBe('');
	});

	test('finishes pending preference writes after navigation without reviving outgoing controls or masks', async () => {
		const page = load({ playlist_autoplay_per_playlist: true });
		page.init();
		await page.flush();
		page.toggle().click();
		page.toggle().click();
		page.emit(page.document, 'yt-navigate-start');
		page.window.history.replaceState({}, '', '/');
		page.emit(page.document, 'yt-navigate-finish');
		page.echo(0);
		expect(page.sent[1]).toEqual({ action: 'set', key: keyFor('PLalpha'), value: { enabled: true } });
		page.echo(1);
		await page.flush(6000);
		expect(page.toggle()).toBeNull();
		expect(page.watch.playlistData.currentIndex).toBe(0);
		expect(page.IT.storage[keyFor('PLalpha')]).toEqual({ enabled: true });
		expect([...page.observers].filter(observer => observer.active)).toHaveLength(0);
		expect(page.sent).toHaveLength(2);
		expect(jest.getTimerCount()).toBe(0);
	});

	test('adds controls for late DOM and replaces a detached header without feedback loops', async () => {
		const page = load({ playlist_autoplay_per_playlist: true }, initialUrl, false);
		page.init();
		const { panel } = page.addWatch();
		await page.flush();
		const old = page.toggle();
		expect(old).not.toBeNull();
		panel.querySelector('#playlist-action-menu').replaceWith(page.document.createElement('div'));
		panel.firstElementChild.id = 'playlist-action-menu';
		await page.flush();
		expect(page.toggle()).not.toBe(old);
		expect(page.document.querySelectorAll('#it-playlist-autoplay-control')).toHaveLength(1);
		old.click();
		expect(page.sent).toHaveLength(0);
		await page.flush();
		expect(jest.getTimerCount()).toBe(0);
	});

	test('shows the playlist-page header control without masking a hidden watch page', async () => {
		const page = load({ playlist_autoplay_per_playlist: true, playlist_up_next_autoplay: false }, 'https://www.youtube.com/playlist?list=PLalpha');
		page.document.body.insertAdjacentHTML('beforeend', '<ytd-playlist-header-renderer><div id="top-level-buttons-computed"></div></ytd-playlist-header-renderer>');
		page.init();
		await page.flush();
		expect(page.toggle().closest('ytd-playlist-header-renderer')).not.toBeNull();
		expect(page.watch.playlistData.currentIndex).toBe(0);
	});

	test('ignores stale playlist data and does not let an outgoing control save for the next playlist', async () => {
		const page = load({ playlist_autoplay_per_playlist: true });
		page.init();
		await page.flush();
		const old = page.toggle();
		page.window.history.replaceState({}, '', '/watch?v=abcdefghijk&list=PLother');
		old.click();
		expect(page.sent).toHaveLength(0);
		page.emit(page.document, 'yt-page-data-updated');
		await page.flush();
		expect(page.toggle()).toBeNull();
		expect(page.watch.playlistData.currentIndex).toBe(0);
	});

	test('restores replaced data, masks new data and never overwrites an external current-index edit', async () => {
		const page = load({ playlist_up_next_autoplay: false });
		page.init();
		const old = page.watch.playlistData;
		page.watch.playlistData = { playlistId: 'PLalpha', currentIndex: 4, localCurrentIndex: 4, totalVideos: 70 };
		page.emit(page.document, 'yt-page-data-updated');
		await page.flush();
		expect(old.currentIndex).toBe(0);
		expect(page.watch.playlistData.currentIndex).toBe(70);
		page.watch.playlistData.currentIndex = 5;
		page.change('playlist_up_next_autoplay', true);
		expect(page.watch.playlistData.currentIndex).toBe(5);
	});

	test('does not infer an absolute position from a changed chunk-local index when restoring', () => {
		const page = load({ playlist_up_next_autoplay: false });
		page.watch.playlistData.currentIndex = 420;
		page.watch.playlistData.localCurrentIndex = 20;
		page.watch.playlistData.totalVideos = 660;
		page.init();
		page.watch.playlistData.localCurrentIndex = 21;
		page.watch.playlistData.totalVideos = 670;
		page.IT.playlistUpNextAutoplay();
		expect(page.watch.playlistData.currentIndex).toBe(670);
		page.change('playlist_up_next_autoplay', true);
		expect(page.watch.playlistData.currentIndex).toBe(420);
		expect(page.watch.playlistData.localCurrentIndex).toBe(21);
	});

	test('captures fresh ownership when a metadata object is reused for a different playlist', () => {
		const page = load({ playlist_up_next_autoplay: false });
		page.init();
		page.window.history.replaceState({}, '', initialUrl.replace('PLalpha', 'PLbeta'));
		Object.assign(page.watch.playlistData, { playlistId: 'PLbeta', currentIndex: 66, localCurrentIndex: 6, totalVideos: 80 });
		page.IT.playlistUpNextAutoplay();
		expect(page.watch.playlistData.currentIndex).toBe(80);
		expect(page.panel.data.currentIndex).toBe(0);
		page.change('playlist_up_next_autoplay', true);
		expect(page.watch.playlistData.currentIndex).toBe(66);
		expect(page.watch.playlistData.localCurrentIndex).toBe(6);
	});

	test('drops ownership after observing an external out-of-range index edit', () => {
		const page = load({ playlist_up_next_autoplay: false });
		page.init();
		page.watch.playlistData.currentIndex = 80;
		page.IT.playlistUpNextAutoplay();
		expect(page.watch.playlistData.currentIndex).toBe(80);
		page.watch.playlistData.currentIndex = 66;
		page.change('playlist_up_next_autoplay', true);
		expect(page.watch.playlistData.currentIndex).toBe(66);
	});

	test.each(['.ytp-next-button', '.ytp-prev-button'])('restores indices before a manual %s click and bounds a cancelled navigation', async selector => {
		const page = load({ playlist_up_next_autoplay: false });
		page.init();
		const indices = [];
		page.player.querySelector(selector).addEventListener('click', () => indices.push(page.watch.playlistData.currentIndex));
		page.player.querySelector(selector).click();
		expect(indices).toEqual([0]);
		page.emit(page.video, 'pause');
		page.IT.playlistUpNextAutoplay({ target: page.video, type: 'pause' });
		expect(page.watch.playlistData.currentIndex).toBe(0);
		await page.flush(1000);
		expect(page.watch.playlistData.currentIndex).toBe(66);
	});

	test.each(['KeyN', 'KeyP'])('preserves native Shift+%s navigation without stealing the key', code => {
		const page = load({ playlist_up_next_autoplay: false });
		page.init();
		let observed;
		page.window.addEventListener('keydown', () => { observed = page.watch.playlistData.currentIndex; });
		const event = page.emit(page.document.body, 'keydown', { code, key: code.slice(-1), shiftKey: true });
		expect(observed).toBe(0);
		expect(event.defaultPrevented).toBe(false);
	});

	test('does not grant manual navigation for text input or composing keys', () => {
		const page = load({ playlist_up_next_autoplay: false });
		page.init();
		const input = page.document.createElement('input');
		page.document.body.appendChild(input);
		input.focus();
		page.emit(input, 'keydown', { code: 'KeyN', shiftKey: true });
		expect(page.watch.playlistData.currentIndex).toBe(66);
		input.blur();
		page.emit(page.document.body, 'keydown', { code: 'KeyN', shiftKey: true, isComposing: true });
		expect(page.watch.playlistData.currentIndex).toBe(66);
	});

	test.each(['shortcutNextVideo', 'shortcutPrevVideo'])('keeps the existing extension %s fallback usable without native buttons', method => {
		const page = load({ playlist_up_next_autoplay: false });
		page.init();
		page.player.querySelectorAll('a').forEach(button => button.remove());
		const indices = [];
		page.player.nextVideo.mockImplementation(() => indices.push(page.watch.playlistData.currentIndex));
		page.player.previousVideo.mockImplementation(() => indices.push(page.watch.playlistData.currentIndex));
		page.IT[method]();
		expect(indices).toEqual([0]);
	});

	test('synchronizes a fully loaded finite playlist, including local index zero', async () => {
		const page = load();
		const manager = page.document.createElement('yt-playlist-manager');
		manager.autoplayData = { playlistId: 'PLalpha', currentIndex: 4 };
		page.document.body.appendChild(manager);
		page.watch.playlistData.currentIndex = 4;
		page.init();
		page.emit(page.video, 'loadedmetadata');
		await page.flush(100);
		expect(page.watch.playlistData.currentIndex).toBe(0);
		expect(manager.autoplayData.currentIndex).toBe(0);
	});

	test('does not replace the absolute index with a chunk-local index in a partially loaded playlist', async () => {
		const page = load();
		Object.assign(page.watch.playlistData, { currentIndex: 420, localCurrentIndex: 20, totalVideos: 660 });
		page.init();
		page.emit(page.video, 'loadedmetadata');
		await page.flush(100);
		expect(page.watch.playlistData.currentIndex).toBe(420);
		expect(page.watch.playlistData.localCurrentIndex).toBe(20);
	});

	test('does not capture or resynchronize an end sentinel owned by YouTube', async () => {
		const page = load();
		page.watch.playlistData.currentIndex = page.panel.data.currentIndex = 66;
		page.init();
		page.emit(page.video, 'loadedmetadata', { bubbles: false });
		await page.flush(100);
		expect(page.watch.playlistData.currentIndex).toBe(66);
		page.change('playlist_up_next_autoplay', false);
		page.change('playlist_up_next_autoplay', true);
		expect(page.watch.playlistData.currentIndex).toBe(66);
		expect(page.panel.data.currentIndex).toBe(66);
	});

	test('a late or replacement video binds through captured media events when the per-list UI is disabled', async () => {
		const page = load({}, initialUrl, false);
		page.init();
		const { watch, video } = page.addWatch();
		watch.playlistData.currentIndex = 4;
		page.emit(video, 'play');
		await page.flush(100);
		expect(page.toggle()).toBeNull();
		expect(watch.playlistData.currentIndex).toBe(0);
		const removed = jest.spyOn(video, 'removeEventListener');
		const replacement = page.document.createElement('video');
		video.replaceWith(replacement);
		page.emit(replacement, 'loadedmetadata');
		await page.flush(100);
		expect(removed).toHaveBeenCalledWith('loadedmetadata', expect.any(Function));
		expect([...page.observers].filter(observer => observer.active)).toHaveLength(0);
	});

	test('cancels queued sync when disabled and detaches listeners from replaced media', async () => {
		const page = load({ playlist_autoplay_per_playlist: true });
		page.init();
		const oldListener = page.IT.playlistVideoChangeListener;
		page.watch.playlistData.currentIndex = 4;
		page.emit(page.video, 'loadedmetadata');
		page.change(keyFor('PLalpha'), { enabled: false });
		await page.flush(100);
		expect(page.watch.playlistData.currentIndex).toBe(66);
		page.change(keyFor('PLalpha'), { enabled: true });
		const replacement = page.document.createElement('video');
		const removed = jest.spyOn(page.video, 'removeEventListener');
		page.video.replaceWith(replacement);
		await page.flush();
		expect(removed).toHaveBeenCalledWith('loadedmetadata', expect.any(Function));
		expect(page.IT.playlistVideoChangeListener).not.toBe(oldListener);
		page.watch.playlistData.currentIndex = 7;
		oldListener();
		await page.flush(100);
		expect(page.watch.playlistData.currentIndex).toBe(7);
	});

	test.each(['route', 'metadata', 'media'])('rejects an already queued synchronization after %s replacement', async replacement => {
		const page = load();
		page.init();
		const original = page.watch.playlistData;
		original.currentIndex = 4;
		page.emit(page.video, 'loadedmetadata', { bubbles: false });
		if (replacement === 'route') page.window.history.replaceState({}, '', initialUrl.replace('PLalpha', 'PLbeta'));
		else if (replacement === 'metadata') page.watch.playlistData = { ...original, currentIndex: 7 };
		else page.video.replaceWith(page.document.createElement('video'));
		await page.flush(100);
		expect(original.currentIndex).toBe(4);
		if (replacement === 'metadata') expect(page.watch.playlistData.currentIndex).toBe(7);
	});

	test.each(['WL', 'RD123456789', 'OLAK5uy_example'])('does not synchronize queue indices for %s', async id => {
		const page = load({ playlist_autoplay_per_playlist: true }, initialUrl.replace('PLalpha', id));
		page.watch.playlistData.playlistId = page.panel.data.playlistId = id;
		page.init();
		await page.flush();
		expect(page.IT.playlistVideoChangeListener).toBeNull();
		page.toggle().click();
		expect(page.watch.playlistData.currentIndex).toBe(66);
	});

	test('an infinite Mix keeps its native indices and explicitly discloses preference-only scope', async () => {
		const page = load({ playlist_autoplay_per_playlist: true }, initialUrl.replace('PLalpha', 'RD123456789'));
		Object.assign(page.watch.playlistData, { playlistId: 'RD123456789', isInfinite: true });
		Object.assign(page.panel.data, { playlistId: 'RD123456789', isInfinite: true });
		page.init();
		await page.flush();
		page.toggle().click();
		page.echo(0);
		expect(page.IT.playlistAutoplayEnabled()).toBe(false);
		expect(page.watch.playlistData.currentIndex).toBe(0);
		expect(page.panel.data.currentIndex).toBe(0);
		expect(page.toggle().title).toContain('Saved preference only');
		expect(page.IT.playlistVideoChangeListener).toBeNull();
	});

	test.each(['watch', 'panel'])('an infinite marker on only the %s restores both masks and leaves manual navigation untouched', async host => {
		const page = load({ playlist_autoplay_per_playlist: true, playlist_up_next_autoplay: false });
		page.init();
		const data = host === 'watch' ? page.watch.playlistData : page.panel.data;
		data.isInfinite = true;
		page.emit(page.document, 'yt-page-data-updated');
		await page.flush();
		expect(page.watch.playlistData.currentIndex).toBe(0);
		expect(page.panel.data.currentIndex).toBe(0);
		expect(page.toggle().title).toContain('Saved preference only');
		expect(page.IT.playlistVideoChangeListener).toBeNull();
		const schedule = jest.spyOn(page.window, 'setTimeout');
		page.player.querySelector('.ytp-next-button').click();
		expect(schedule).not.toHaveBeenCalled();
		// Drain the initial DOMContentLoaded reconciliation separately from the manual action.
		await page.flush(1000);
		expect(page.watch.playlistData.currentIndex).toBe(0);
		expect(page.panel.data.currentIndex).toBe(0);
		expect(jest.getTimerCount()).toBe(0);
	});

	test('does not apply stale playlist header or outgoing-player metadata', async () => {
		const page = load({ playlist_autoplay_per_playlist: true, playlist_up_next_autoplay: false });
		page.player.getVideoData.mockReturnValue({ video_id: 'other-video' });
		page.init();
		await page.flush();
		expect(page.toggle()).toBeNull();
		expect(page.watch.playlistData.currentIndex).toBe(0);
		page.emit(page.document, 'yt-navigate-start');
		page.window.history.replaceState({}, '', '/playlist?list=PLother');
		const app = page.document.createElement('ytd-app');
		app.data = { response: { header: { playlistHeaderRenderer: { playlistId: 'PLalpha' } } } };
		app.innerHTML = '<ytd-playlist-header-renderer><div id="top-level-buttons-computed"></div></ytd-playlist-header-renderer>';
		page.document.body.appendChild(app);
		page.emit(page.document, 'yt-navigate-finish');
		expect(page.toggle()).toBeNull();
		app.data.response.header.playlistHeaderRenderer.playlistId = 'PLother';
		page.emit(page.document, 'yt-page-data-updated');
		await page.flush();
		expect(page.toggle()).not.toBeNull();
	});

	test('independent tab requests persist separate playlist keys and restore their preferences on reload', async () => {
		const first = load({ playlist_autoplay_per_playlist: true });
		const second = load({ playlist_autoplay_per_playlist: true }, initialUrl.replace('PLalpha', 'PLbeta'));
		second.watch.playlistData.playlistId = second.panel.data.playlistId = 'PLbeta';
		first.init();
		second.init();
		await first.flush();
		await second.flush();
		first.toggle().click();
		second.toggle().click();
		const persisted = { playlist_autoplay_per_playlist: true };
		for (const page of [second, first]) {
			const message = page.sent[0];
			persisted[message.key] = message.value;
			page.echo(0);
		}
		expect(persisted[keyFor('PLalpha')]).toEqual({ enabled: false });
		expect(persisted[keyFor('PLbeta')]).toEqual({ enabled: false });
		const reloaded = load(persisted);
		reloaded.init();
		expect(reloaded.IT.playlistAutoplayEnabled()).toBe(false);
		expect(reloaded.watch.playlistData.currentIndex).toBe(66);
		expect(reloaded.sent).toHaveLength(0);
	});

	test('revisiting a playlist reapplies its preference after restoring the outgoing data', async () => {
		const page = load({ playlist_autoplay_per_playlist: true, [keyFor('PLalpha')]: { enabled: false } });
		page.init();
		const initialData = page.watch.playlistData;
		page.emit(page.document, 'yt-navigate-start');
		expect(initialData.currentIndex).toBe(0);
		page.window.history.replaceState({}, '', '/watch?v=bbbbbbbbbbb&list=PLbeta');
		page.watch.playlistData = { ...initialData, playlistId: 'PLbeta' };
		page.panel.data = { ...page.watch.playlistData };
		page.emit(page.document, 'yt-navigate-finish');
		expect(page.IT.playlistAutoplayEnabled()).toBe(true);
		page.emit(page.document, 'yt-navigate-start');
		page.window.history.replaceState({}, '', initialUrl);
		page.watch.playlistData = initialData;
		page.panel.data = { ...initialData };
		page.emit(page.document, 'yt-navigate-finish');
		expect(page.IT.playlistAutoplayEnabled()).toBe(false);
		expect(initialData.currentIndex).toBe(66);
		await page.flush();
		expect(page.sent).toHaveLength(0);
	});

	test('tears down observers, metadata masks and pending work on navigation away', async () => {
		const page = load({ playlist_autoplay_per_playlist: true, playlist_up_next_autoplay: false });
		page.init();
		page.init();
		await page.flush();
		expect([...page.observers].filter(observer => observer.active)).toHaveLength(1);
		expect(page.add.mock.calls.filter(([name]) => name === 'click')).toHaveLength(1);
		page.emit(page.document, 'yt-navigate-start');
		expect(page.watch.playlistData.currentIndex).toBe(0);
		expect(page.toggle()).toBeNull();
		page.window.history.replaceState({}, '', '/');
		page.emit(page.document, 'yt-navigate-finish');
		await page.flush(1000);
		expect([...page.observers].filter(observer => observer.active)).toHaveLength(0);
		expect(page.remove).toHaveBeenCalledWith('click', expect.any(Function), true);
		expect(page.IT.playlistVideoChangeListener).toBeNull();
		expect(jest.getTimerCount()).toBe(0);
	});
});
