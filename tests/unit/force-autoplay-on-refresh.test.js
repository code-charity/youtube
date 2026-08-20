const fs = require('fs');
const path = require('path');

describe('Force Autoplay / Auto-Resume on Page Reload', () => {
	let playerContent;
	let initContent;
	let functionsContent;
	let playerMenuContent;
	let messagesContent;

	beforeAll(() => {
		playerContent = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js'),
			'utf8'
		);
		initContent = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/init.js'),
			'utf8'
		);
		functionsContent = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/functions.js'),
			'utf8'
		);
		playerMenuContent = fs.readFileSync(
			path.join(__dirname, '../../menu/skeleton-parts/player.js'),
			'utf8'
		);
		messagesContent = fs.readFileSync(
			path.join(__dirname, '../../_locales/en/messages.json'),
			'utf8'
		);
	});

	beforeEach(() => {
		global.document = {
			querySelector: () => null
		};
	});

	test('player.js should define ImprovedTube.forceAutoplayOnRefresh', () => {
		expect(playerContent).toContain('ImprovedTube.forceAutoplayOnRefresh = function');
	});

	test('player menu should expose force_autoplay_on_refresh setting', () => {
		expect(playerMenuContent).toContain('force_autoplay_on_refresh');
		expect(playerMenuContent).toContain('forceAutoplayOnRefresh');
	});

	test('en locale should contain forceAutoplayOnRefresh key', () => {
		const parsedMessages = JSON.parse(messagesContent);
		expect(parsedMessages.forceAutoplayOnRefresh).toBeDefined();
		expect(parsedMessages.forceAutoplayOnRefresh.message).toMatch(/force autoplay|auto-resume/i);
	});

	test('init.js and functions.js should wire forceAutoplayOnRefresh', () => {
		expect(initContent).toContain('ImprovedTube.forceAutoplayOnRefresh()');
		expect(functionsContent).toContain('ImprovedTube.forceAutoplayOnRefresh()');
	});

	test('forceAutoplayOnRefresh attempts video playback when enabled and handles autoplay policies', async () => {
		const ImprovedTube = {
			storage: { force_autoplay_on_refresh: true },
			elements: {}
		};

		eval(playerContent.substring(playerContent.indexOf('ImprovedTube.forceAutoplayOnRefresh = function')));

		let playCalled = false;
		let muteCalled = false;

		const mockPlayer = {
			getPlayerState: () => 2, // PAUSED
			playVideo: () => {
				playCalled = true;
				return Promise.reject(new Error('NotAllowedError'));
			},
			mute: () => {
				muteCalled = true;
			}
		};

		ImprovedTube.elements.player = mockPlayer;

		ImprovedTube.forceAutoplayOnRefresh();

		await Promise.resolve();
		await Promise.resolve();

		expect(playCalled).toBe(true);
		expect(muteCalled).toBe(true);
	});

	test('forceAutoplayOnRefresh respects player_autoplay_disable setting', () => {
		const ImprovedTube = {
			storage: { force_autoplay_on_refresh: true, player_autoplay_disable: true },
			elements: {}
		};

		eval(playerContent.substring(playerContent.indexOf('ImprovedTube.forceAutoplayOnRefresh = function')));

		let playCalled = false;
		const mockPlayer = {
			getPlayerState: () => 2,
			playVideo: () => { playCalled = true; }
		};
		ImprovedTube.elements.player = mockPlayer;

		ImprovedTube.forceAutoplayOnRefresh();

		expect(playCalled).toBe(false);
	});
});
