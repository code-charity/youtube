// Test for Issue #4294: Tooltips are hidden behind the video player

const fs = require('fs');
const path = require('path');

describe('Player button tooltip stacking in fullscreen', () => {
	let functionsContent;

	beforeAll(() => {
		const functionsPath = path.join(__dirname, '../../js&css/web-accessible/functions.js');
		functionsContent = fs.readFileSync(functionsPath, 'utf8');
	});

	test('createPlayerButton tooltip should not always append to document.body', () => {
		// A tooltip appended to document.body is outside the Fullscreen API's
		// rendered subtree once the player enters fullscreen, so it is hidden
		// behind the video instead of appearing above it.
		expect(functionsContent).not.toMatch(/tooltip\.className = 'it-player-button--tooltip';\s*tooltip\.textContent = this\.dataset\.title;\s*document\.body\.appendChild\(tooltip\);/);
	});

	test('createPlayerButton tooltip should append inside the current fullscreen element when present', () => {
		expect(functionsContent).toContain('(document.fullscreenElement || document.body).appendChild(tooltip)');
	});
});
