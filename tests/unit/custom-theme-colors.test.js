// Test for Issue #2850: selecting a custom theme made YouTube's notifications
// dropdown (and other menus) fully transparent.
//
// The reporter's exported settings contained
//   "theme_primary_color": [null, null, null]
// produced by the color-picker before a color is chosen. myColors() only
// checked that the stored value was truthy, so the array passed the check and
// [null,null,null].join(',') yielded "rgb(,,)". That invalid value was written
// into --yt-spec-menu-background (and every other primary-color variable), so
// Chromium discarded the declaration and menus rendered transparent.
//
// The fix validates each stored color as a usable RGB triplet and falls back
// to the same defaults the color-picker declares.

const createElement = () => ({
	textContent: '',
	className: '',
	remove: jest.fn(),
	style: { setProperty: jest.fn() },
	removeAttribute: jest.fn(),
	appendChild: jest.fn()
});

global.document = {
	createElement: jest.fn(createElement),
	documentElement: createElement(),
	head: createElement(),
	querySelector: jest.fn(() => null),
	getElementById: jest.fn(() => null)
};

global.ImprovedTube = {
	storage: {},
	elements: {},
	button_icons: {}
};

require('../../js&css/web-accessible/www.youtube.com/themes.js');

const runMyColors = (storage) => {
	ImprovedTube.elements = {};
	ImprovedTube.storage = Object.assign({ theme: 'custom' }, storage);

	ImprovedTube.myColors();

	return ImprovedTube.elements.my_colors.textContent;
};

const cssVariable = (css, name) => {
	const match = css.match(new RegExp(name + ':([^;]+);'));

	return match && match[1];
};

const expectAllRgbValuesValid = (css) => {
	const rgbValues = css.match(/\brgb\([^)]*\)/g) || [];

	expect(rgbValues.length).toBeGreaterThan(0);

	for (const value of rgbValues) {
		expect(value).toMatch(/^rgb\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)$/);
	}
};

describe('Custom theme color validation (issue #2850)', () => {
	test('null channels fall back to the default primary color', () => {
		const css = runMyColors({
			theme_primary_color: [null, null, null],
			theme_text_color: [0, 255, 247]
		});

		expect(css).not.toContain('rgb(,,)');
		expectAllRgbValuesValid(css);
		expect(cssVariable(css, '--yt-spec-menu-background')).toBe('rgb(200, 200, 200)!important');
		expect(cssVariable(css, '--yt-spec-general-background-a')).toBe('rgb(200, 200, 200)!important');
		expect(cssVariable(css, '--ytd-masthead-background')).toBe('rgb(100, 0, 0)!important');
		expect(cssVariable(css, '--yt-spec-text-primary')).toBe('rgb(0,255,247) !important');
	});

	test('null channels in every color fall back to all defaults', () => {
		const css = runMyColors({
			theme_primary_color: [null, null, null],
			theme_secondary_color: [null, null, null],
			theme_text_color: [null, null, null]
		});

		expect(css).not.toContain('rgb(,,)');
		expectAllRgbValuesValid(css);
		expect(cssVariable(css, '--yt-spec-menu-background')).toBe('rgb(200, 200, 200)!important');
		expect(cssVariable(css, '--ytd-masthead-background')).toBe('rgb(100, 0, 0)!important');
		expect(cssVariable(css, '--yt-spec-text-primary')).toBe('rgb(25, 25, 25) !important');
	});

	test.each([
		['too few channels', [200, 200]],
		['too many channels', [200, 200, 200, 200]],
		['string channels', ['200', '200', '200']],
		['NaN channel', [NaN, 0, 0]],
		['out-of-range channels', [300, 0, -5]],
		['non-array value', 'rgb(1,2,3)']
	])('malformed primary color (%s) falls back to the default', (label, value) => {
		const css = runMyColors({ theme_primary_color: value });

		expect(css).not.toContain('rgb(,,)');
		expectAllRgbValuesValid(css);
		expect(cssVariable(css, '--yt-spec-menu-background')).toBe('rgb(200, 200, 200)!important');
	});

	test.each([
		['light', [245, 245, 245]],
		['dark', [16, 16, 16]]
	])('valid %s custom colors are used verbatim', (label, primary) => {
		const css = runMyColors({
			theme_primary_color: primary,
			theme_secondary_color: [40, 40, 40],
			theme_text_color: [250, 250, 250]
		});

		const primaryValue = 'rgb(' + primary.join(',') + ')';

		expectAllRgbValuesValid(css);
		expect(cssVariable(css, '--yt-spec-menu-background')).toBe(primaryValue + '!important');
		expect(cssVariable(css, '--yt-spec-base-background')).toBe(primaryValue + '!important');
		expect(cssVariable(css, '--ytd-masthead-background')).toBe('rgb(40,40,40)!important');
		expect(cssVariable(css, '--yt-spec-text-primary')).toBe('rgb(250,250,250) !important');
	});
});
