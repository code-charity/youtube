const fs = require('fs');
const path = require('path');

/* A "none" theme that leaves YouTube's own styling alone, so user styles
 * (Stylus and similar) are not fought (#4329). */

describe('"none" theme option in the menu', () => {
	beforeAll(() => {
		global.extension = {skeleton: {main: {layers: {section: {}}}}};
		global.satus = {storage: {get: jest.fn()}};
		jest.isolateModules(() => {
			require('../../menu/skeleton-parts/themes.js');
		});
	});

	test('is offered as a theme radio with the value "none"', () => {
		const option = extension.skeleton.main.layers.section.themes.on.click.section.none;

		// reuses the existing "none" string, already translated in most locales
		expect(option.text).toBe('none');
		expect(option.radio.group).toBe('theme');
		expect(option.radio.value).toBe('none');
	});
});

describe('setTheme with the "none" theme', () => {
	let html, masthead, cinematics;

	beforeEach(() => {
		html = {setAttribute: jest.fn(), removeAttribute: jest.fn()};
		masthead = {setAttribute: jest.fn(), removeAttribute: jest.fn()};
		cinematics = {removeAttribute: jest.fn(), style: {setProperty: jest.fn()}};

		global.document = {
			documentElement: html,
			querySelector: jest.fn(() => masthead),
			getElementById: jest.fn(() => cinematics)
		};
		global.ImprovedTube = {
			storage: {theme: 'none'},
			elements: {my_colors: {remove: jest.fn()}},
			messages: {send: jest.fn()},
			setPrefCookieValueByName: jest.fn()
		};
		jest.isolateModules(() => {
			require('../../js&css/web-accessible/www.youtube.com/themes.js');
		});
	});

	test("leaves YouTube's own light/dark mode untouched", () => {
		ImprovedTube.setTheme();

		// neither the `dark` attribute nor YouTube's PREF f6 dark-mode cookie is touched
		expect(html.setAttribute).not.toHaveBeenCalled();
		expect(html.removeAttribute).not.toHaveBeenCalled();
		expect(masthead.setAttribute).not.toHaveBeenCalled();
		expect(masthead.removeAttribute).not.toHaveBeenCalled();
		expect(ImprovedTube.setPrefCookieValueByName).not.toHaveBeenCalled();
		expect(ImprovedTube.messages.send).not.toHaveBeenCalled();
	});

	test('drops the custom palette and restores the default cinematics glow', () => {
		const palette = ImprovedTube.elements.my_colors;

		ImprovedTube.setTheme();

		expect(palette.remove).toHaveBeenCalled();
		expect(cinematics.removeAttribute).toHaveBeenCalledWith('style');
		expect(cinematics.style.setProperty).not.toHaveBeenCalled();
	});
});

describe('theme stylesheet with the "none" theme', () => {
	const css = fs.readFileSync(
		path.join(__dirname, '../../js&css/extension/www.youtube.com/styles.css'),
		'utf8'
	);

	test('no rule meant for "any theme but default" also matches "none"', () => {
		// `html[it-theme]` matches every stored theme, "none" included, so each of
		// these rules has to exclude "none" explicitly or it restyles the page anyway.
		const selectors = css.match(/html\[it-theme\]:not\(\[it-theme=default\]\)[^,{]*/g) || [];

		expect(selectors.length).toBeGreaterThan(0);
		for (const selector of selectors) {
			expect(selector).toContain(':not([it-theme=none])');
		}
	});
});
