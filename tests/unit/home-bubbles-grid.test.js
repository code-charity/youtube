// The popup's home screen, layout "bubbles": the category buttons form an even
// grid of three columns with circles of one size. Before, the three rows had
// 3, 4 and 2 buttons with circles of 60, 55 and 47px whose columns did not line
// up, and hiding categories could push a button outside the popup.

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

describe('Home screen: even grid of category bubbles', () => {
	let satusCss, homeCss;

	beforeAll(() => {
		satusCss = fs.readFileSync(path.join(__dirname, '../../menu/satus.css'), 'utf8');
		homeCss = fs.readFileSync(path.join(__dirname, '../../menu/styles/home.css'), 'utf8');
	});

	test('three columns', () => {
		const button = rules(homeCss).find(rule => rule.selector === '.satus-section--home .satus-button');

		expect(button.body).toMatch(/width:\s*calc\(100% \/ 3\);/);
	});

	test('one circle size for every category', () => {
		const circle = rules(homeCss).find(rule => rule.selector === '.satus-section--home .satus-button> :nth-child(1)');

		expect(circle.body).toMatch(/width:\s*60px;/);
		expect(circle.body).toMatch(/height:\s*60px;/);
	});

	test('no category is scaled or shifted on its own outside the "list" layout', () => {
		for (const stylesheet of [satusCss, homeCss]) {
			for (const rule of rules(stylesheet)) {
				for (const selector of rule.selector.split(',').map(part => part.trim())) {
					const category = CATEGORIES.find(name => selector.includes('.satus-button--' + name));

					if (!category || selector.includes('[home-style="list"]') || selector.includes("[home-style='list']")) continue;

					expect({ selector, body: rule.body }).not.toEqual(expect.objectContaining({ body: expect.stringMatching(/transform:\s*scale|margin|max-width/) }));
				}
			}
		}
	});

	test('the "list" layout keeps its own per-category rules', () => {
		const list = rules(satusCss).filter(rule => rule.selector.includes('div[home-style="list"] .satus-button--'));

		expect(list.length).toBeGreaterThanOrEqual(3);
		expect(list.some(rule => /transform:\s*scale\(0\.92\)/.test(rule.body))).toBe(true);
	});
});
