const fs = require('fs');
const path = require('path');

describe('Squared thumbnails option', () => {
	let generalSkeletonContent;
	let generalCssContent;
	let englishMessages;

	beforeAll(() => {
		generalSkeletonContent = fs.readFileSync(
			path.join(__dirname, '../../menu/skeleton-parts/general.js'),
			'utf8'
		);
		generalCssContent = fs.readFileSync(
			path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.css'),
			'utf8'
		);
		englishMessages = fs.readFileSync(
			path.join(__dirname, '../../_locales/en/messages.json'),
			'utf8'
		);
	});

	test('adds a switch to the thumbnails settings card', () => {
		expect(generalSkeletonContent).toContain('squared_thumbnails');
		expect(generalSkeletonContent).toContain("text: 'squaredThumbnails'");

		const thumbnailsSectionIndex = generalSkeletonContent.indexOf("title: 'thumbnails'");
		const optionIndex = generalSkeletonContent.indexOf('squared_thumbnails');

		expect(optionIndex).toBeGreaterThan(thumbnailsSectionIndex);
	});

	test('adds the English menu label', () => {
		expect(englishMessages).toContain('"squaredThumbnails"');
		expect(englishMessages).toContain('"Squared thumbnails"');
	});

	test('removes rounded corners from current and legacy thumbnail renderers', () => {
		expect(generalCssContent).toContain("html[it-squared-thumbnails='true'] ytd-thumbnail");
		expect(generalCssContent).toContain("html[it-squared-thumbnails='true'] yt-thumbnail-view-model");
		expect(generalCssContent).toContain("html[it-squared-thumbnails='true'] .yt-lockup-view-model-wiz__content-image");
		expect(generalCssContent).toContain('--yt-img-border-radius: 0 !important');
		expect(generalCssContent).toContain('border-radius: 0 !important');
	});
});
