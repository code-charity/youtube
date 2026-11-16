// Test for Issue #4474: collapsed related videos leave a blank sidebar on the dark theme

const fs = require('fs');
const path = require('path');

describe('Collapsed related videos bar (#4474)', () => {
	let sidebarCss;

	beforeAll(() => {
		sidebarCss = fs.readFileSync(
			path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/sidebar/sidebar.css'),
			'utf8'
		);
	});

	test('should color the show more bar with a text color YouTube still defines', () => {
		const rule = sidebarCss.match(
			/html\[it-related-videos='collapsed'\] #related > ytd-watch-next-secondary-results-renderer > #items::before\s*\{([^}]*)\}/
		);
		expect(rule).not.toBeNull();
		expect(rule[1]).toMatch(
			/color:\s*var\(--yt-spec-text-primary,\s*var\(--yt-sys-color-baseline--text-primary\)\)\s*!important/
		);
	});
});
