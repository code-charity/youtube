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

describe('theme stylesheets with the "none" theme', () => {
	// Every stylesheet the extension ships, not just the one that has these rules
	// today: a rule added to a sibling file would otherwise keep restyling the
	// page under "none" without failing anything.
	const cssRoot = path.join(__dirname, '../../js&css');

	function stylesheets(dir) {
		return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) return stylesheets(full);
			return entry.isFile() && entry.name.endsWith('.css') ? [full] : [];
		});
	}

	const files = stylesheets(cssRoot);

	test('every shipped stylesheet is checked', () => {
		expect(files.length).toBeGreaterThan(1);
	});

	test('no rule meant for "any theme but default" also matches "none"', () => {
		// `html[it-theme]` matches every stored theme, "none" included, so each of
		// these rules has to exclude "none" explicitly or it restyles the page anyway.
		const offenders = [];
		let checked = 0;

		for (const file of files) {
			const css = fs.readFileSync(file, 'utf8');
			const selectors = css.match(/html\[it-theme\]:not\(\[it-theme=default\]\)[^,{]*/g) || [];
			for (const selector of selectors) {
				checked += 1;
				if (!selector.includes(':not([it-theme=none])')) {
					offenders.push(`${path.relative(cssRoot, file)}: ${selector.trim()}`);
				}
			}
		}

		expect(offenders).toEqual([]);
		expect(checked).toBe(10);
	});
});
