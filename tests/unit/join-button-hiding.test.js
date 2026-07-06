// Test for Issue #3669: Join button not hiding when set to Hidden

const fs = require('fs');
const path = require('path');

describe('Join Button Hiding (#3669)', () => {
	let detailsCssContent;

	beforeAll(() => {
		const filePath = path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/details/details.css');
		detailsCssContent = fs.readFileSync(filePath, 'utf8');
	});

	test('should hide legacy #sponsor-button', () => {
		expect(detailsCssContent).toContain("html[it-join='hidden'] #sponsor-button");
	});

	test('should hide new ytd-sponsorships-offer-module-renderer', () => {
		expect(detailsCssContent).toContain("html[it-join='hidden'] ytd-sponsorships-offer-module-renderer");
	});

	test('should remove label from legacy #sponsor-button', () => {
		expect(detailsCssContent).toContain("html[it-join='remove_label'] #sponsor-button button .yt-spec-button-shape-next__button-text-content");
	});

	test('should remove label from new sponsorships renderer', () => {
		expect(detailsCssContent).toContain("html[it-join='remove_label'] ytd-sponsorships-offer-module-renderer button .yt-spec-button-shape-next__button-text-content");
	});
});
