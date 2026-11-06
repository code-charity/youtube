const fs = require('fs');
const path = require('path');

describe('playerSubtitles SPA retry', () => {
	let playerContent;

	beforeAll(() => {
		playerContent = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js'),
			'utf8'
		);
	});

	function playerSubtitlesSource() {
		const start = playerContent.indexOf('ImprovedTube.playerSubtitles = function');
		const end = playerContent.indexOf('ImprovedTube.retryPlayerAction = function', start);
		if (start < 0 || end < 0) {
			throw new Error('playerSubtitles source was not found');
		}
		return playerContent.slice(start, end);
	}

	test('playerSubtitles should apply through retryPlayerAction', () => {
		const source = playerSubtitlesSource();
		expect(source).toContain('this.retryPlayerAction');
		expect(source).toContain("case 'disabled'");
		expect(source).toContain("case 'enabled'");
	});

	test('playerSubtitles should require observed subtitle state to match storage', () => {
		const source = playerSubtitlesSource();
		expect(source).toContain('player.isSubtitlesOn() === true');
		expect(source).toContain('player.isSubtitlesOn() === false');
	});

	test('playerSubtitles should not use the old missing-method attempt < 10 loop', () => {
		const source = playerSubtitlesSource();
		expect(source).not.toContain('attempt < 10');
		expect(source).not.toContain('ImprovedTube.playerSubtitles(attempt + 1)');
		expect(source).not.toMatch(/function\s*\(\s*attempt\s*=\s*0\s*\)/);
	});
});
