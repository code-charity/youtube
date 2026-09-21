const fs = require('fs');
const path = require('path');

describe('Play video from the beginning', () => {
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

	test('forcedPlayVideoFromTheBeginning should be defined on ImprovedTube', () => {
		expect(playerContent).toContain('ImprovedTube.forcedPlayVideoFromTheBeginning = function');
	});

	test('should still guard against the double-play of a fresh video (#262)', () => {
		expect(playerContent).toContain("if (video.currentTime > 1.1) {  // video.currentTime = 0; #262");
	});

	test('should catch YouTube resuming playback asynchronously after SPA navigation (#4349)', () => {
		// The initial, synchronous check alone misses playlist auto-advance and
		// clicking a previously watched video, because YouTube applies its own
		// "resume to saved position" seek after that check already ran. A
		// bounded one-shot 'seeked' listener re-checks once that late seek
		// actually happens.
		expect(playerContent).toContain("video.addEventListener('seeked', onSeeked)");
		expect(playerContent).toContain("video.removeEventListener('seeked', onSeeked)");
	});

	test('the async re-check should be bounded to a short grace window', () => {
		expect(playerContent).toContain('setTimeout(() => {');
		expect(playerContent).toContain('}, 2000)');
	});

	test('the async re-check should bail out if the page has since navigated to a different video', () => {
		expect(playerContent).toContain('this.video_url !== navigatedUrl');
	});

	test('initPlayer should call forcedPlayVideoFromTheBeginning first', () => {
		const initPlayerMatch = functionsContent.match(/ImprovedTube\.initPlayer\s*=\s*function[^{]*\{([\s\S]*?)\n\};/);
		expect(initPlayerMatch).not.toBeNull();
		const body = initPlayerMatch[1];
		expect(body).toContain('ImprovedTube.forcedPlayVideoFromTheBeginning();');
	});
});
