// Test for Issue #4132: configurable touchscreen double-tap seek

const fs = require('fs');
const path = require('path');

describe('Double-tap Seek Feature (#4132)', () => {
	let shortcutsContent;
	let playerContent;
	let functionsContent;
	let menuContent;
	let messages;

	beforeAll(() => {
		shortcutsContent = fs.readFileSync(path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/shortcuts.js'), 'utf8');
		playerContent = fs.readFileSync(path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js'), 'utf8');
		functionsContent = fs.readFileSync(path.join(__dirname, '../../js&css/web-accessible/functions.js'), 'utf8');
		menuContent = fs.readFileSync(path.join(__dirname, '../../menu/skeleton-parts/player.js'), 'utf8');
		messages = JSON.parse(fs.readFileSync(path.join(__dirname, '../../_locales/en/messages.json'), 'utf8'));
	});

	describe('shortcut implementation', () => {
		test('should keep the touch listener in shortcuts.js', () => {
			expect(shortcutsContent).toContain('touchend: function (event)');
			expect(shortcutsContent).toContain('ImprovedTube.shortcutDoubleTapSeek(event)');
			expect(shortcutsContent).toContain("name === 'touchend' ? hasTouchSeek : hasShortcuts");
		});

		test('should reinitialize shortcut listeners when the setting changes', () => {
			expect(shortcutsContent).toContain('ImprovedTube.playerDoubleTapSeek = function');
			expect(shortcutsContent).toContain('ImprovedTube.shortcutsInit();');
		});

		test('should seek through the YouTube player API', () => {
			expect(shortcutsContent).toContain('player.seekBy(signedSeconds)');
			expect(shortcutsContent).toContain('player.seekTo(targetTime, true)');
			expect(shortcutsContent).toContain('player_double_tap_seek');
		});

		test('should trigger YouTube seek feedback classes', () => {
			expect(shortcutsContent).toContain('ytp-seek-forward-bump');
			expect(shortcutsContent).toContain('ytp-seek-backward-bump');
			expect(shortcutsContent).toContain('ytp-doubletap-ui');
		});

		test('should support fixed and progressive seek modes', () => {
			expect(shortcutsContent).toContain("this.storage.player_double_tap_seek === 'fixed'");
			expect(shortcutsContent).toContain('player_double_tap_seek_double');
			expect(shortcutsContent).toContain('player_double_tap_seek_quadruple');
			expect(shortcutsContent).toContain('player_double_tap_seek_extra');
		});
	});

	describe('feature wiring', () => {
		test('should avoid player-specific duplicate listener wiring', () => {
			expect(playerContent).not.toContain('Double-tap Seek');
			expect(functionsContent).not.toContain('ImprovedTube.playerDoubleTapSeek();');
		});
	});

	describe('menu configuration', () => {
		test('should expose the mode selector', () => {
			expect(menuContent).toContain('player_double_tap_seek');
			expect(menuContent).toContain("component: 'select'");
			expect(menuContent).toContain("value: 'fixed'");
			expect(menuContent).toContain("value: 'progressive'");
		});

		test('should expose fixed and progressive seek sliders', () => {
			expect(menuContent).toContain('player_double_tap_seek_seconds');
			expect(menuContent).toContain('player_double_tap_seek_double');
			expect(menuContent).toContain('player_double_tap_seek_triple');
			expect(menuContent).toContain('player_double_tap_seek_quadruple');
			expect(menuContent).toContain('player_double_tap_seek_extra');
		});
	});

	describe('translations', () => {
		test('should include menu labels', () => {
			[
				'playerDoubleTapSeek',
				'fixedSeekDistance',
				'progressiveSeekDistances',
				'doubleTapSeekSeconds',
				'doubleTapSeekDouble',
				'doubleTapSeekTriple',
				'doubleTapSeekQuadruple',
				'doubleTapSeekExtra'
			].forEach(key => {
				expect(messages[key]).toBeDefined();
				expect(messages[key].message).toBeDefined();
			});
		});
	});
});
