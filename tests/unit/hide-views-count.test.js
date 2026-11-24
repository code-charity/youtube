// Test for Issue #926: separator dot remains visible when hiding views count

const fs = require('fs');
const path = require('path');

describe('Hide Views Count (#926)', () => {
	let css;

	beforeAll(() => {
		const filePath = path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/details/details.css');
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
		expect(css).not.toMatch(/it-hide-views-count='true'\][^,{]*(span:nth-child\(3\)|span:last-child|yt-formatted-string)/);
	});
});
