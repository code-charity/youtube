// Test for Issue #1530: Keep transcript visible when hiding the sidebar

const fs = require('fs');
const path = require('path');

describe('Hide Sidebar Transcript (#1530)', () => {
	let sidebarCssContent;

	beforeAll(() => {
		const filePath = path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/sidebar/sidebar.css');
		sidebarCssContent = fs.readFileSync(filePath, 'utf8');
	});

	test('should not hide secondary panels when transcript is enabled', () => {
		expect(sidebarCssContent).toContain("html[it-hide-sidebar='true']:not([it-transcript='true']) div#secondary div#panels");
	});

	test('should still hide related videos when sidebar is hidden', () => {
		expect(sidebarCssContent).toContain("html[it-hide-sidebar='true'] #related");
	});
});
