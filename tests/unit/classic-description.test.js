const fs = require('fs');
const path = require('path');

describe('Classic description options (#1802)', () => {
	let detailsCss;
	let appearanceMenu;
	let appearanceJs;
	let coreJs;

	beforeAll(() => {
		detailsCss = fs.readFileSync(path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/details/details.css'), 'utf8');
		appearanceMenu = fs.readFileSync(path.join(__dirname, '../../menu/skeleton-parts/appearance.js'), 'utf8');
		appearanceJs = fs.readFileSync(path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/appearance.js'), 'utf8');
		coreJs = fs.readFileSync(path.join(__dirname, '../../js&css/web-accessible/core.js'), 'utf8');
	});

	test('restores the three Classic choices in the description menu', () => {
		expect(appearanceMenu).toContain('value: "classic"');
		expect(appearanceMenu).toContain('value: "classic_expanded"');
		expect(appearanceMenu).toContain('value: "classic_hidden"');
	});

	test('keeps the current YouTube description visible for Classic modes', () => {
		expect(detailsCss).toContain("html[it-description='classic'] ytd-watch-metadata #description");
		expect(detailsCss).toContain("html[it-description='classic_expanded'] ytd-watch-metadata #description");
		expect(detailsCss).toContain("html[it-description='classic'] ytd-watch-metadata #description-inline-expander");
		expect(detailsCss).toContain("html[it-description='classic_expanded'] ytd-watch-metadata #description-inline-expander");
		expect(detailsCss).toContain("html[it-description='classic'] ytd-watch-metadata > #above-the-fold > #title");
		expect(detailsCss).toContain("html[it-description='classic_expanded'] ytd-watch-metadata > #above-the-fold > #top-row");
		expect(detailsCss).toContain("html[it-description='classic'] ytd-watch-metadata ytd-watch-info-text");
		expect(detailsCss).toContain("html[it-description='classic_expanded'] ytd-watch-metadata ytd-watch-info-text");
		expect(detailsCss).not.toContain("html[it-description='classic'] div.style-scope.ytd-watch-flexy + ytd-watch-metadata");
	});

	test('hides the current YouTube description for Classic hidden', () => {
		expect(detailsCss).toContain("html[it-description='classic_hidden'] ytd-watch-metadata > #above-the-fold > #bottom-row");
		expect(detailsCss).toContain("html[it-description='classic_hidden'] ytd-watch-metadata #description");
	});

	test('expands descriptions for Classic expanded', () => {
		expect(appearanceJs).toContain('this.storage.description === "expanded" || this.storage.description === "classic_expanded"');
		expect(coreJs).toContain('ImprovedTube.storage.description === "expanded" || ImprovedTube.storage.description === "classic_expanded"');
	});

	test('collapses descriptions for Classic normal mode', () => {
		expect(coreJs).toContain('ImprovedTube.storage.description === "normal" || ImprovedTube.storage.description === "classic"');
	});
});
