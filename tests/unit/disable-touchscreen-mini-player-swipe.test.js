// Test for Issue #4127: disable accidental touchscreen mini-player swipe

const fs = require('fs');
const path = require('path');

describe('Disable touchscreen mini-player swipe (#4127)', () => {
	let playerContent;
	let functionsContent;
	let menuContent;
	let messages;

	beforeAll(() => {
		playerContent = fs.readFileSync(path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js'), 'utf8');
		functionsContent = fs.readFileSync(path.join(__dirname, '../../js&css/web-accessible/functions.js'), 'utf8');
		menuContent = fs.readFileSync(path.join(__dirname, '../../menu/skeleton-parts/player.js'), 'utf8');
		messages = JSON.parse(fs.readFileSync(path.join(__dirname, '../../_locales/en/messages.json'), 'utf8'));
	});

	test('defines the player touch-swipe blocker', () => {
		expect(playerContent).toContain('ImprovedTube.playerDisableTouchscreenMiniPlayerSwipe = function ()');
		expect(playerContent).toContain("this.storage.player_disable_touchscreen_mini_player_swipe");
	});

	test('installs capture-phase touch listeners that can cancel the native gesture', () => {
		expect(playerContent).toContain("document.addEventListener('touchstart'");
		expect(playerContent).toContain("document.addEventListener('touchmove'");
		expect(playerContent).toContain("document.addEventListener('touchend'");
		expect(playerContent).toContain("document.addEventListener('touchcancel'");
		expect(playerContent).toContain('passive: false');
		expect(playerContent).toContain('stopImmediatePropagation');
		expect(playerContent).toContain('event.preventDefault()');
	});

	test('blocks only downward-dominant swipe motion', () => {
		expect(playerContent).toContain('deltaY > 12 && deltaY > deltaX * 1.2');
		expect(playerContent).toContain("player.classList.contains('ad-showing')");
		expect(playerContent).toContain('.ytp-progress-bar-container');
	});

	test('wires the feature on player init and video page updates', () => {
		const matches = functionsContent.match(/ImprovedTube\.playerDisableTouchscreenMiniPlayerSwipe\(\);/g) || [];

		expect(matches).toHaveLength(2);
	});

	test('exposes a player setting and translation label', () => {
		expect(menuContent).toContain('player_disable_touchscreen_mini_player_swipe');
		expect(menuContent).toContain('disableTouchscreenMiniPlayerSwipe');
		expect(messages.disableTouchscreenMiniPlayerSwipe).toBeDefined();
		expect(messages.disableTouchscreenMiniPlayerSwipe.message).toBe('Disable touchscreen mini-player swipe');
	});
});
