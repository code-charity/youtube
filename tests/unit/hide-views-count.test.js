// Test for Issue #926: separator dot remains visible when hiding views count

const fs = require('fs');
const path = require('path');

describe('Hide Views Count (#926)', () => {
	let css;

	beforeAll(() => {
		const filePath = path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/details/details.css');
		if (!fs.existsSync(filePath)) {
			throw new Error(`Expected CSS file is missing: ${filePath}`);
		}
		css = fs.readFileSync(filePath, 'utf8');
	});

	test('should hide view count and separator dot', () => {
		expect(css).toContain("html[it-hide-views-count='true'] #info #count,");
		expect(css).toContain("html[it-hide-views-count='true'] ytd-watch-metadata #info>span:first-child,");
		expect(css).toContain("html[it-hide-views-count='true'] ytd-watch-metadata #info>span:nth-child(2),");
		expect(css).toContain("html[it-hide-views-count='true'] ytd-watch-metadata #info>#dot,");
		expect(css).toContain("html[it-hide-views-count='true'] #info #info-strings>#dot,");
	});

	test('should not hide upload date', () => {
		const selectors = css.split(/\r?\n/).filter(line =>
			/^html\[it-hide-views-count=(?:'true'|"true"|true)\]/.test(line.trimStart())
		);
		expect(selectors.length).toBeGreaterThan(0);

		for (const selector of selectors) {
			expect(selector).not.toMatch(/yt-formatted-string|span:last-child/);
			for (const [, position] of selector.matchAll(/span:nth-child\(\s*(\+?\d+)\s*\)/g)) {
				expect(Number(position)).toBeLessThan(3);
			}
		}
	});
});
