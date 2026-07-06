// Test for Issue #4132: configurable touchscreen double-tap seek

const fs = require('fs');
const path = require('path');

describe('Double-tap Seek Feature (#4132)', () => {
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

	describe('player implementation', () => {
		test('should define playerDoubleTapSeek', () => {
			expect(playerContent).toContain('ImprovedTube.playerDoubleTapSeek = function');
		});

		test('should intercept touchscreen double taps before native handlers', () => {
			expect(playerContent).toContain("document.addEventListener('touchend'");
			expect(playerContent).toContain('passive: false');
			expect(playerContent).toContain('stopImmediatePropagation');
		});

		test('should seek through the YouTube player API', () => {
			expect(playerContent).toContain('player.seekBy(signedSeconds)');
			expect(playerContent).toContain('player.seekTo(targetTime, true)');
			expect(playerContent).toContain('player_double_tap_seek');
		});

		test('should support fixed and progressive seek modes', () => {
			expect(playerContent).toContain("mode === 'fixed'");
			expect(playerContent).toContain('player_double_tap_seek_double');
			expect(playerContent).toContain('player_double_tap_seek_quadruple');
			expect(playerContent).toContain('player_double_tap_seek_extra');
		});
	});

	describe('feature wiring', () => {
		test('should initialize on video page updates and new players', () => {
			expect(functionsContent.match(/ImprovedTube\.playerDoubleTapSeek\(\);/g)).toHaveLength(2);
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
