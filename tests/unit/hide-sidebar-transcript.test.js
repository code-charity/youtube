// Test for Issue #1530: Keep transcript visible when hiding the sidebar

const fs = require('fs');
const path = require('path');

describe('Hide Sidebar + Transcript Visibility (#1530)', () => {
	let sidebarCssContent;

	beforeAll(() => {
		const filePath = path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/sidebar/sidebar.css');
		sidebarCssContent = fs.readFileSync(filePath, 'utf8');
	});

	test('should hide panels when sidebar is hidden but transcript is NOT enabled', () => {
		expect(sidebarCssContent).toContain("html[it-hide-sidebar='true']:not([it-transcript='true']) div#secondary div#panels");
	});

	test('should show panels when both sidebar hidden and transcript enabled', () => {
		expect(sidebarCssContent).toContain("html[it-hide-sidebar='true'][it-transcript='true'] div#secondary div#panels");
		expect(sidebarCssContent).toMatch(/html\[it-hide-sidebar='true'\]\[it-transcript='true'\] div#secondary div#panels\s*\{[^}]*display:\s*block\s*!important/);
	});

	test('should hide non-transcript panels when sidebar hidden + transcript enabled', () => {
		expect(sidebarCssContent).toContain("html[it-hide-sidebar='true'][it-transcript='true'] div#secondary div#panels > :not([target-id*='transcript'])");
	});

	test('should ensure secondary has proper width when both features active', () => {
		expect(sidebarCssContent).toMatch(/html\[it-hide-sidebar='true'\]\[it-transcript='true'\] ytd-watch-flexy\[flexy\] #secondary\.ytd-watch-flexy/);
		expect(sidebarCssContent).toMatch(/min-width:\s*max\(445px,\s*17vw\)/);
	});

	test('should still hide related videos when sidebar is hidden', () => {
		expect(sidebarCssContent).toContain("html[it-hide-sidebar='true'] #related");
	});

	test('should still hide donation shelf when sidebar is hidden', () => {
		expect(sidebarCssContent).toContain("html[it-hide-sidebar='true'] div#secondary div#donation-shelf");
	});
});
