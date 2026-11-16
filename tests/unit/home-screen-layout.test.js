// The popup's home screen shows the nine categories either as "bubbles" or as a
// "list" (Settings > Home screen > Layout). Both are now even:
//   bubbles: a grid of three columns with circles of one size
//   list:    one column with rows of one size
// Before, both layouts had three tiers of sizes (bubbles: circles of 60, 55 and
// 47px in rows of 3, 4 and 2 whose columns did not line up; list: Blocklist and
// Analyzer squeezed in beside the other rows), and hiding categories could push a
// bubble outside the popup.

const fs = require('fs');
const path = require('path');

const CATEGORIES = ['general', 'player', 'appearance', 'shortcuts', 'channel', 'playlist', 'themes', 'blocklist', 'analyzer'];

// every rule of a stylesheet as { selector, body }
function rules (css) {
	return [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(match => ({
		selector: match[1].trim().replace(/\s+/g, ' '),
		body: match[2]
	}));
}

// the categories a selector names, e.g. '.satus-button--general > span' -> ['general']
function categoriesIn (selector) {
	return CATEGORIES.filter(name => new RegExp('\\.satus-button--' + name + '\\b').test(selector));
}

describe('Home screen: even layouts', () => {
	let satusCss, homeCss;

	beforeAll(() => {
		satusCss = fs.readFileSync(path.join(__dirname, '../../menu/satus.css'), 'utf8');
		homeCss = fs.readFileSync(path.join(__dirname, '../../menu/styles/home.css'), 'utf8');
	});

	test('bubbles: three columns', () => {
		const button = rules(homeCss).find(rule => rule.selector === '.satus-section--home .satus-button');

		expect(button.body).toMatch(/width:\s*calc\(100% \/ 3\);/);
	});

	test('bubbles: one circle size for every category', () => {
		const circle = rules(homeCss).find(rule => rule.selector === '.satus-section--home .satus-button> :nth-child(1)');

		expect(circle.body).toMatch(/width:\s*60px;/);
		expect(circle.body).toMatch(/height:\s*60px;/);
	});

	test('list: one row height for every category', () => {
		const rows = rules(homeCss).filter(rule => rule.selector.startsWith(".satus-base[home-style='list'] .satus-section--card >"));

		expect(rows).toHaveLength(1);
		expect(categoriesIn(rows[0].selector)).toEqual(CATEGORIES);
		expect(rows[0].body).toMatch(/height:\s*30px;/);
	});

	test('no category is sized, scaled or shifted on its own, in either layout', () => {
		const layout = /transform|margin|padding|(^|[\s;-])(width|height)\s*:/;

		for (const stylesheet of [satusCss, homeCss]) {
			for (const rule of rules(stylesheet)) {
				const named = categoriesIn(rule.selector);

				if (named.length === 0 || !layout.test(rule.body)) continue;

				// a rule that lays out category buttons has to name all nine
				expect({ selector: rule.selector, categories: named }).toEqual({ selector: rule.selector, categories: CATEGORIES });
			}
		}
	});

	test('the shared stylesheet (satus.css) has no rules for single categories any more', () => {
		expect(rules(satusCss).filter(rule => categoriesIn(rule.selector).length > 0)).toHaveLength(0);
	});
});
