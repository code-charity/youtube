// Test for Issue #3639: Disable video playback on hover not working on sidebar

const fs = require('fs');
const path = require('path');

describe('Disable Thumbnail Playback (#3639)', () => {
	let generalContent;

	beforeAll(() => {
		const filePath = path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.js');
		generalContent = fs.readFileSync(filePath, 'utf8');
	});

	test('should match home page grid items', () => {
		expect(generalContent).toContain('#content.ytd-rich-item-renderer');
	});

	test('should match search results items', () => {
		expect(generalContent).toContain('#contents.ytd-item-section-renderer');
	});

	test('should match sidebar compact video items', () => {
		expect(generalContent).toContain('#dismissible.ytd-compact-video-renderer');
	});

	test('should use stopImmediatePropagation to block hover playback', () => {
		expect(generalContent).toContain('event.stopImmediatePropagation()');
	});
});
