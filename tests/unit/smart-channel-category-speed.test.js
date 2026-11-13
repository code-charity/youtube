const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PLAYER = 'js&css/web-accessible/www.youtube.com/player.js';

function loadHelperBlock() {
	const source = fs.readFileSync(path.join(__dirname, '../..', PLAYER), 'utf8');
	const start = source.indexOf('ImprovedTube.currentVideoChannelIdentity = function');
	const end = source.indexOf('PERMANENT PLAYBACK SPEED');

	if (start < 0 || end < 0 || end < start) {
		throw new Error('smart channel/category detection block was not found');
	}

	const tail = source.slice(0, end);
	const block = source.slice(start, tail.lastIndexOf('/*'));

	expect(block).toContain('ImprovedTube.resolveForcedPlaybackSpeed = function');

	return block;
}

const helperBlock = loadHelperBlock();

function setup({ storage, playerResponse, genre = 'Education', anchor = null, videoId = 'abc123abc12' } = {}) {
	const defaultAnchor = { getAttribute: () => '/channel/UC123', textContent: 'Some Channel' };
	const sandbox = {
		document: {
			querySelector: selector => {
				if (selector.includes('a[href]')) return anchor === undefined ? defaultAnchor : anchor;
				if (selector === 'meta[itemprop="genre"]') return genre ? { content: genre } : null;
				if (selector === '#microformat script') return null;
				if (selector === 'meta[itemprop="author"]') return null;
				if (selector === 'meta[itemprop="channelId"]') return null;
				return { textContent: 'Some Channel' };
			}
		},
		location: { href: `https://www.youtube.com/watch?v=${videoId}` },
		ImprovedTube: {
			storage,
			elements: {
				player: {
					getPlayerResponse: () => playerResponse === undefined ? {
						videoDetails: { videoId, channelId: 'UC123', author: 'Some Channel' }
					} : playerResponse
				}
			},
			category: ''
		}
	};
	sandbox.window = sandbox;

	vm.createContext(sandbox);
	vm.runInContext(helperBlock, sandbox);
	sandbox.ImprovedTube.videoId = () => videoId;

	return sandbox.ImprovedTube;
}

describe('smart channel & category playback-speed detection', () => {
	test('a channel rule keyed by stable ID beats a category rule and the default', () => {
		const ImprovedTube = setup({
			storage: {
				player_playback_speed: 1,
				channel_playback_speeds: { 'channel:UC123': 2 },
				category_playback_speeds: { Education: 1.5 }
			}
		});

		const resolved = ImprovedTube.resolveForcedPlaybackSpeed();

		expect(resolved.speed).toBe(2);
		expect(resolved.source).toEqual({ type: 'channel', key: 'channel:UC123' });
	});

	test('a legacy channel rule keyed by display name still matches', () => {
		const ImprovedTube = setup({
			storage: {
				player_playback_speed: 1,
				channel_playback_speeds: { 'Some Channel': 1.75 },
				category_playback_speeds: {}
			},
			playerResponse: null,
			anchor: { getAttribute: () => '/@somechannel', textContent: 'Some Channel' }
		});

		const resolved = ImprovedTube.resolveForcedPlaybackSpeed();

		expect(resolved.speed).toBe(1.75);
		expect(resolved.source.type).toBe('channel');
	});

	test('a @handle rule matches the channel link', () => {
		const ImprovedTube = setup({
			storage: {
				player_playback_speed: 1,
				channel_playback_speeds: { '@SomeChannel': 1.25 },
				category_playback_speeds: {}
			},
			playerResponse: null,
			anchor: { getAttribute: () => '/@SomeChannel', textContent: 'Some Channel' }
		});

		expect(ImprovedTube.resolveForcedPlaybackSpeed().speed).toBe(1.25);
	});

	test('a category rule overrides the global default speed', () => {
		const ImprovedTube = setup({
			storage: {
				player_playback_speed: 1,
				channel_playback_speeds: {},
				category_playback_speeds: { Education: 1.5 }
			}
		});

		const resolved = ImprovedTube.resolveForcedPlaybackSpeed();

		expect(resolved.speed).toBe(1.5);
		expect(resolved.source).toEqual({ type: 'category', key: 'Education' });
	});

	test('invalid stored speeds fall through to the next tier', () => {
		const ImprovedTube = setup({
			storage: {
				player_playback_speed: 1.8,
				channel_playback_speeds: { 'channel:UC123': 'fast' },
				category_playback_speeds: { Education: 0 }
			}
		});

		const resolved = ImprovedTube.resolveForcedPlaybackSpeed();

		expect(resolved.speed).toBe(1.8);
		expect(resolved.source.type).toBe('default');
	});

	test('a missing default falls back to 1x instead of breaking playback', () => {
		const ImprovedTube = setup({
			storage: { channel_playback_speeds: {}, category_playback_speeds: {} }
		});

		const resolved = ImprovedTube.resolveForcedPlaybackSpeed();

		expect(resolved.speed).toBe(1);
		expect(resolved.source.type).toBe('default');
	});
});

describe('forced playback speed wiring', () => {
	let playerContent;
	let coreContent;
	let skeletonContent;
	let enMessages;

	beforeAll(() => {
		playerContent = fs.readFileSync(path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js'), 'utf8');
		coreContent = fs.readFileSync(path.join(__dirname, '../../js&css/web-accessible/core.js'), 'utf8');
		skeletonContent = fs.readFileSync(path.join(__dirname, '../../menu/skeleton-parts/player.js'), 'utf8');
		enMessages = fs.readFileSync(path.join(__dirname, '../../_locales/en/messages.json'), 'utf8');
	});

	test('channel and category rules share one priority resolver (channel > category > default)', () => {
		expect(playerContent).toContain('ImprovedTube.resolveForcedPlaybackSpeed = function');
		expect(playerContent).toContain("source: {type: 'channel'");
		expect(playerContent).toContain("source: {type: 'category'");
		expect(playerContent).toContain("source: {type: 'default'");
	});

	test('channel identity prefers the stable channel ID over the display name', () => {
		expect(playerContent).toContain("'channel:' + identity.id");
	});

	test('runtime setting changes re-run the smart resolver instead of the old global-only path', () => {
		expect(coreContent).toContain("case 'channelPlaybackSpeeds':");
		expect(coreContent).toContain("case 'categoryPlaybackSpeeds':");
		expect(coreContent).toContain('try { ImprovedTube.playerPlaybackSpeed(); } catch (error) {}');
		expect(coreContent).not.toContain('setPlaybackRate(Number(ImprovedTube.storage.player_playback_speed))');
	});

	test('the settings page has a category rule editor mirroring the channel one', () => {
		expect(skeletonContent).toContain('category_playback_speed: {');
		expect(skeletonContent).toContain("text: 'categoryPlaybackSpeed'");
		expect(skeletonContent).toContain("satus.storage.get('category_playback_speeds')");
		expect(enMessages).toContain('"categoryPlaybackSpeed"');
		expect(enMessages).toContain('overrides default');
	});
});
