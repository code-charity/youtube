//(Please avoid LLM spam)





// Test for Issue #3447: Add "default" option for thumbnails per row

// Read the general.js skeleton to verify the default option exists
const fs = require('fs');
const path = require('path');

describe('Thumbnails per Row Configuration', () => {
	let generalSkeletonContent;

	beforeAll(() => {
		const skeletonPath = path.join(__dirname, '../../menu/skeleton-parts/general.js');
		generalSkeletonContent = fs.readFileSync(skeletonPath, 'utf8');
	});

	test('change_thumbnails_per_row should have a default option', () => {
		// Check that the skeleton contains the default option
		expect(generalSkeletonContent).toContain("text: 'default'");
		expect(generalSkeletonContent).toContain("value: 'default'");
	});

	test('default option should be first in the options list', () => {
		// The default option should appear before the '4' option in the file
		const defaultIndex = generalSkeletonContent.indexOf("text: 'default'");
		const fourIndex = generalSkeletonContent.indexOf("text: '4'");

		expect(defaultIndex).toBeLessThan(fourIndex);
		expect(defaultIndex).toBeGreaterThan(-1);
	});
});

describe('changeThumbnailsPerRow function', () => {
	let generalJsContent;

	beforeAll(() => {
		const generalJsPath = path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.js');
		generalJsContent = fs.readFileSync(generalJsPath, 'utf8');
	});

	test('should handle default value by returning early', () => {
		// Check that the function returns early when value is 'default'
		expect(generalJsContent).toContain("value === 'default'");
	});
});
