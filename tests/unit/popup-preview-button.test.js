// Test for Issue #1528: Popup player button should work from feed preview UI

const fs = require('fs');
const path = require('path');

describe('Popup Preview Button (#1528)', () => {
	let generalContent;

	beforeAll(() => {
		const filePath = path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.js');
		generalContent = fs.readFileSync(filePath, 'utf8');
	});

	test('should resolve the nearest video link instead of assuming the hovered preview is a link', () => {
		expect(generalContent).toContain('extension.features.popupWindowButtons.findVideoLink(this.parentElement)');
		expect(generalContent).toContain('element.closest(\'a[href*="/watch"], a[href*="/shorts/"]\')');
	});

	test('should fall back to the thumbnail link inside rich feed renderers', () => {
		expect(generalContent).toContain('a#thumbnail[href], a[href*="/watch"], a[href*="/shorts/"]');
		expect(generalContent).toContain('ytd-rich-grid-media, ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer');
	});

	test('should keep preview popup sizing variables in scope', () => {
		expect(generalContent).toContain('let vertical = width / height < 1;');
	});
});
