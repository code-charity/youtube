const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '../..');
const playerSource = fs.readFileSync(path.join(root, 'js&css/web-accessible/www.youtube.com/player.js'), 'utf8');
const shortcutsSource = fs.readFileSync(path.join(root, 'js&css/web-accessible/www.youtube.com/shortcuts.js'), 'utf8');
const start = playerSource.indexOf('ImprovedTube.playerQuality = function');
const end = playerSource.indexOf('ImprovedTube.playerVolume = function', start);
if (start < 0 || end < 0) throw new Error('Player quality source was not found');

function createApp (settings = {}, levels = ['hd720', 'medium'], search = '?v=video') {
	const player = {
		dataset: {},
		getAvailableQualityLevels: jest.fn(() => levels),
		setPlaybackQualityRange: jest.fn(),
		setPlaybackQuality: jest.fn()
	};
	const document = new EventTarget();
	document.querySelector = () => null;
	const timers = [];
	const batteryListeners = {};
	const battery = {
		charging: false, level: 0.5, dischargingTime: 1200,
		addEventListener: (type, listener) => { batteryListeners[type] = listener; }
	};
	const app = {
		storage: Object.assign({ player_quality: 'hd720' }, settings),
		elements: { player },
		input: {
			listening: {}, listeners: {},
			pressed: { keys: new Set(), wheel: 0, alt: false, ctrl: false, shift: false },
			cancelled: new Set()
		}
	};
	const context = vm.createContext({
		ImprovedTube: app, document, window: new EventTarget(), location: { search }, URLSearchParams, console,
		navigator: { getBattery: async () => battery },
		setTimeout: callback => timers.push(callback)
	});
	vm.runInContext(playerSource.slice(start, end), context);
	vm.runInContext(shortcutsSource, context);
	return { app, player, document, timers, batteryListeners };
}

describe('Auto quality selection (#4050)', () => {
	test('the configured Auto binding resolves its camelized action to auto', () => {
		const { app, player } = createApp({ shortcut_quality_auto: { keys: { 65: { key: 'a' } } } });
		app.shortcutsInit();
		expect(Object.keys(app.input.listening)).toEqual(['shortcutQualityAuto']);

		app.shortcutQuality(Object.keys(app.input.listening)[0]);

		expect(player.setPlaybackQualityRange).toHaveBeenCalledWith('auto');
		expect(player.setPlaybackQuality).toHaveBeenCalledWith('auto');
		expect(app.storage.player_quality).toBe('hd720');
	});

	test.each([
		{ levels: ['hd720', 'medium'] },
		{ levels: ['auto', 'hd720'] },
		{ levels: [] }
	])('Auto does not depend on available rendition levels: $levels', ({ levels }) => {
		const { app, player } = createApp({}, levels);
		app.playerQuality('auto');
		expect(player.setPlaybackQualityRange).toHaveBeenCalledWith('auto');
		expect(player.setPlaybackQuality).toHaveBeenCalledWith('auto');
		expect(player.dataset.defaultQuality).toBe('auto');
	});

	test('Auto can be selected while the rendition-list API is unavailable', () => {
		const { app, player } = createApp();
		delete player.getAvailableQualityLevels;
		app.playerQuality('auto');
		expect(player.setPlaybackQualityRange).toHaveBeenCalledWith('auto');
	});

	test('the Auto shortcut takes precedence over the playlist preference', () => {
		const { app, player } = createApp({ player_quality_playlist: 'medium' }, ['medium', 'hd720'], '?v=video&list=PLexample');
		app.shortcutQuality('shortcutQualityAuto');
		expect(player.setPlaybackQuality).toHaveBeenCalledWith('auto');
		expect(app.storage.player_quality_playlist).toBe('medium');
	});

	test('automatic policy calls continue to use the playlist preference', () => {
		const { app, player } = createApp({ player_quality_playlist: 'medium' }, ['medium', 'hd720'], '?v=video&list=PLexample');
		app.playerQuality();
		expect(player.setPlaybackQuality).toHaveBeenCalledWith('medium');
	});

	test('disabled playlist policy falls back to the global preference', () => {
		const { app, player } = createApp({ player_quality_playlist: 'disabled' }, ['medium', 'hd720'], '?v=video&list=PLexample');
		app.playerQuality();
		expect(player.setPlaybackQuality).toHaveBeenCalledWith('hd720');
	});

	test('explicit selection reapplies Auto even after a cached automatic selection', () => {
		const { app, player } = createApp();
		player.dataset.defaultQuality = 'auto';
		app.shortcutQuality('shortcutQualityAuto');
		expect(player.setPlaybackQuality).toHaveBeenCalledWith('auto');
	});

	test('repeated automatic policy application remains idempotent', () => {
		const { app, player } = createApp();
		app.playerQuality();
		app.playerQuality();
		expect(player.setPlaybackQuality).toHaveBeenCalledTimes(1);
	});

	test.each(['hd720', 'auto'])('automatic callers passing %s retain playlist precedence and caching', quality => {
		const { app, player } = createApp({ player_quality_playlist: 'medium' }, ['medium', 'hd720'], '?v=video&list=PLexample');
		app.playerQuality(quality);
		app.playerQuality(quality);
		expect(player.setPlaybackQuality).toHaveBeenCalledTimes(1);
		expect(player.setPlaybackQuality).toHaveBeenCalledWith('medium');
	});

	test.each(['?v=video', '?v=video&list=PLexample'])('fullscreen retries retain the automatic policy on %s', search => {
		const { app, player, document, timers } = createApp({ full_screen_quality: 'hd720', player_quality_playlist: 'medium' }, ['medium', 'hd720'], search);
		document.fullscreenElement = player;
		app.playerQualityFullScreen();
		expect(timers).toHaveLength(4);
		timers.forEach(callback => callback());
		expect(player.setPlaybackQuality).toHaveBeenCalledTimes(1);
		expect(player.setPlaybackQuality).toHaveBeenCalledWith(search.includes('list=') ? 'medium' : 'hd720');
	});

	test('focus quality and restore retain the playlist policy', () => {
		const { app, player } = createApp({ player_quality_playlist: 'medium', player_quality_without_focus: 'large' }, ['large', 'medium', 'hd720'], '?v=video&list=PLexample');
		player.getPlaybackQuality = () => 'hd720';
		app.elements.video = { paused: false };
		app.focus = false;
		app.playerQualityWithoutFocus();
		app.playerQualityWithoutFocus();
		app.focus = true;
		app.playerQualityWithoutFocus();
		expect(player.setPlaybackQuality).toHaveBeenCalledTimes(1);
		expect(player.setPlaybackQuality).toHaveBeenCalledWith('medium');
	});

	test('battery events retain the playlist policy and avoid repeated quality writes', async () => {
		const { app, player, batteryListeners } = createApp({ player_quality_playlist: 'medium', qualityWhenRunningOnBattery: 'large' }, ['large', 'medium', 'hd720'], '?v=video&list=PLexample');
		await app.batteryFeatures();
		await batteryListeners.levelchange();
		await batteryListeners.chargingchange();
		expect(player.setPlaybackQuality).toHaveBeenCalledTimes(1);
		expect(player.setPlaybackQuality).toHaveBeenCalledWith('medium');
	});

	test.each([
		['144p', 'tiny'], ['240p', 'small'], ['360p', 'medium'], ['480p', 'large'],
		['720p', 'hd720'], ['1080p', 'hd1080'], ['1440p', 'hd1440'],
		['2160p', 'hd2160'], ['2880p', 'hd2880'], ['4320p', 'highres']
	])('preserves the %s shortcut mapping', (resolution, quality) => {
		const { app, player } = createApp({}, [quality]);
		app.shortcutQuality('shortcutQuality' + resolution);
		expect(player.setPlaybackQuality).toHaveBeenCalledWith(quality);
	});

	test.each(['shortcutQuality', 'shortcutQualityUnknown', 'otherAuto'])('ignores an unrecognized shortcut action: %s', key => {
		const { app, player } = createApp();
		app.shortcutQuality(key);
		expect(player.setPlaybackQuality).not.toHaveBeenCalled();
	});

	test('a missing numeric rendition falls back to the closest known available level', () => {
		const { app, player } = createApp({}, ['auto', 'unknown', 'large', 'medium']);
		app.playerQuality('hd720');
		expect(player.setPlaybackQuality).toHaveBeenCalledWith('large');
	});

	test.each([{ levels: [] }, { levels: ['auto', 'unknown'] }, { levels: null }])('does not send an undefined quality for unavailable numeric renditions: $levels', ({ levels }) => {
		const { app, player } = createApp({}, levels);
		app.playerQuality('hd720');
		expect(player.setPlaybackQualityRange).not.toHaveBeenCalled();
		expect(player.setPlaybackQuality).not.toHaveBeenCalled();
		expect(player.dataset.defaultQuality).toBeUndefined();
	});

	test('disabled policy and absent player are harmless', () => {
		const { app, player } = createApp({ player_quality: 'disabled' });
		app.playerQuality();
		expect(player.setPlaybackQuality).not.toHaveBeenCalled();
		app.elements.player = null;
		expect(() => app.playerQuality('auto')).not.toThrow();
	});
});
