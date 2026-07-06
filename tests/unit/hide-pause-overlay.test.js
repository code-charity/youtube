// Test for Issue #3427: Hide Pause Overlay option

const fs = require('fs');
const path = require('path');

describe('Hide Pause Overlay Feature', () => {
	describe('Menu Configuration', () => {
		let appearanceContent;

		beforeAll(() => {
			const appearancePath = path.join(__dirname, '../../menu/skeleton-parts/appearance.js');
			appearanceContent = fs.readFileSync(appearancePath, 'utf8');
		});

		test('player_hide_pause_overlay option should exist in appearance.js', () => {
			expect(appearanceContent).toContain('player_hide_pause_overlay');
		});

		test('player_hide_pause_overlay should use hidePauseOverlay text key', () => {
			expect(appearanceContent).toContain("text: \"hidePauseOverlay\"");
		});

		test('player_hide_pause_overlay should be a switch component', () => {
			// Check that there's a switch component for player_hide_pause_overlay
			const pauseOverlayMatch = appearanceContent.match(/player_hide_pause_overlay:\s*{[^}]*component:\s*"switch"/);
			expect(pauseOverlayMatch).not.toBeNull();
		});
	});

	describe('CSS Rules', () => {
		let playerCssContent;

		beforeAll(() => {
			const cssPath = path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/player/player.css');
			playerCssContent = fs.readFileSync(cssPath, 'utf8');
		});

		test('CSS should target .ytp-bezel class', () => {
			expect(playerCssContent).toContain('.ytp-bezel');
		});

		test('CSS should target .ytp-bezel-text-wrapper class', () => {
			expect(playerCssContent).toContain('.ytp-bezel-text-wrapper');
		});

		test('CSS should use it-player-hide-pause-overlay attribute', () => {
			expect(playerCssContent).toContain("it-player-hide-pause-overlay='true'");
		});

		test('CSS should hide pause overlay with display:none', () => {
			expect(playerCssContent).toContain('display: none !important');
		});
	});

	describe('Translations', () => {
		let messagesContent;

		beforeAll(() => {
			const messagesPath = path.join(__dirname, '../../_locales/en/messages.json');
			messagesContent = fs.readFileSync(messagesPath, 'utf8');
		});

		test('hidePauseOverlay translation key should exist', () => {
			expect(messagesContent).toContain('"hidePauseOverlay"');
		});

		test('hidePauseOverlay should have a message', () => {
			const messages = JSON.parse(messagesContent);
			expect(messages.hidePauseOverlay).toBeDefined();
			expect(messages.hidePauseOverlay.message).toBeDefined();
		});
	});
});
