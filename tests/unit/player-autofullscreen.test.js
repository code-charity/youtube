const fs = require('fs');
const path = require('path');

describe('Auto-fullscreen', () => {
	let playerContent;
	let functionsContent;

	beforeAll(() => {
		playerContent = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js'),
			'utf8'
		);
		functionsContent = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/functions.js'),
			'utf8'
		);
	});

	test('playerAutofullscreen should guard missing player', () => {
		expect(playerContent).toContain("typeof player.toggleFullscreen !== 'function'");
	});

	test('playerAutofullscreen should check vendor fullscreen flags', () => {
		expect(playerContent).toContain('document.mozFullScreenElement');
		expect(playerContent).toContain('ytp-fullscreen');
	});

	test('playerAutofullscreen should only lock after successful enter', () => {
		expect(playerContent).toContain('_autofullscreenFor');
		expect(playerContent).toContain('ImprovedTube._autofullscreenFor = location.href');
	});

	test('play path should retry autofullscreen for Firefox gesture policy', () => {
		expect(functionsContent).toContain('player_autofullscreen');
		expect(functionsContent).toContain('ImprovedTube.playerAutofullscreen()');
	});
});
