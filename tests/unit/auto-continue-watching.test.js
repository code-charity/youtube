const fs = require('fs');
const path = require('path');

describe('Auto-accept Continue watching dialog', () => {
	let playerContent;
	let initContent;
	let playerMenuContent;

	beforeAll(() => {
		playerContent = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js'),
			'utf8'
		);
		initContent = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/init.js'),
			'utf8'
		);
		playerMenuContent = fs.readFileSync(
			path.join(__dirname, '../../menu/skeleton-parts/player.js'),
			'utf8'
		);
	});

	test('playerAutoContinueWatching should be defined on ImprovedTube', () => {
		expect(playerContent).toContain('ImprovedTube.playerAutoContinueWatching = function');
	});

	test('should click confirm button instead of removing the dialog', () => {
		expect(playerContent).toContain('button.click()');
		expect(playerContent).not.toContain('&&e.remove()');
	});

	test('should resume playback after accepting the dialog', () => {
		expect(playerContent).toContain('player.playVideo()');
	});

	test('init should wire playerAutoContinueWatching', () => {
		expect(initContent).toContain('ImprovedTube.playerAutoContinueWatching()');
	});

	test('player menu should expose player_auto_continue_watching setting', () => {
		expect(playerMenuContent).toContain('player_auto_continue_watching');
		expect(playerMenuContent).toContain('autoContinueWatching');
	});
});
