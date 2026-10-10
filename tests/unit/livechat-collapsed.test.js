// Test for Issue #4199: collapsed live chat leaves a blank column

const fs = require('fs');
const path = require('path');

describe('Collapsed live chat shell (#4199)', () => {
	let sidebarCss;
	let appearanceJs;
	let functionsJs;

	beforeAll(() => {
		sidebarCss = fs.readFileSync(
			path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/sidebar/sidebar.css'),
			'utf8'
		);
		appearanceJs = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/appearance.js'),
			'utf8'
		);
		functionsJs = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/functions.js'),
			'utf8'
		);
	});

	test('should cap an inactive collapsed chat shell at the show-live-chat bar', () => {
		const rule = sidebarCss.match(
			/html\[it-livechat='collapsed'\] #chat-container:not\(\[it-activated\]\)\s*\{([^}]*)\}/
		);
		expect(rule).not.toBeNull();
		const body = rule[1];
		expect(body).toMatch(/height:\s*48px\s*!important/);
		expect(body).toMatch(/max-height:\s*48px\s*!important/);
		expect(body).toMatch(/min-height:\s*0\s*!important/);
		expect(body).toMatch(/flex:\s*0\s+0\s+auto\s*!important/);
		expect(body).toMatch(/overflow:\s*hidden\s*!important/);
		expect(body).toMatch(/top:\s*auto\s*!important/);
		expect(body).toMatch(/bottom:\s*auto\s*!important/);
		expect(sidebarCss).toContain("content: 'Show live chat' !important;");
	});

	test('should hide a nested live chat frame and chatframe while the shell is collapsed', () => {
		expect(sidebarCss).toMatch(
			/html\[it-livechat='collapsed'\] #chat-container:not\(\[it-activated\]\) ytd-live-chat-frame#chat\s*,\s*html\[it-livechat='collapsed'\] #chat-container:not\(\[it-activated\]\) iframe#chatframe\s*\{[^}]*display:\s*none\s*!important/
		);
		expect(sidebarCss).not.toContain("html[it-livechat='collapsed'][it-livechat='hidden']");
	});

	test('should drop the shell cap once the bar sets it-activated', () => {
		expect(sidebarCss).not.toMatch(
			/html\[it-livechat='collapsed'\] #chat-container\[it-activated\]\s*\{[^}]*height\s*:/
		);
		expect(sidebarCss).not.toMatch(
			/html\[it-livechat='collapsed'\] #chat-container\[it-activated\]\s*\{[^}]*display\s*:\s*none/
		);
	});

	test('should scope both live chat bar backgrounds to collapsed mode', () => {
		expect(sidebarCss).toMatch(
			/html\[it-livechat='collapsed'\] #chat-container:not\(\[it-activated\]\)::before\s*,\s*html\[it-livechat='collapsed'\] #chat-container\[it-activated\]::before\s*\{[^}]*background-color/
		);
		expect(sidebarCss).not.toMatch(/(?:^|\n)[ \t]*#chat-container\[it-activated\]::before/);
	});

	test('should keep hidden mode and the theatre full-bleed collapse, and add nothing for normal', () => {
		expect(sidebarCss).toContain("html[it-livechat='hidden'] ytd-live-chat-frame#chat");
		expect(sidebarCss).toMatch(
			/html\[it-livechat='hidden'\] ytd-watch-flexy\[theater\] #panels-full-bleed-container:not\(:has\(ytd-engagement-panel-section-list-renderer\[visibility='ENGAGEMENT_PANEL_VISIBILITY_EXPANDED'\]\)\)/
		);
		expect(sidebarCss).toContain(
			"html[it-livechat='collapsed'] ytd-watch-flexy[theater]:has(#chat-container:not([it-activated])) #panels-full-bleed-container"
		);
		expect(sidebarCss).toContain(
			"html[it-livechat='collapsed'] ytd-watch-flexy[fixed-panels] #columns.ytd-watch-flexy:has(#chat-container:not([it-activated]) > ytd-live-chat-frame#chat)"
		);
		expect(sidebarCss).not.toMatch(/it-livechat='normal'/);
	});

	test('should click a chat-scoped Close button at most once while collapsed', () => {
		const livechat = appearanceJs.match(/ImprovedTube\.livechat\s*=\s*function\s*\(\)\s*\{([\s\S]*?)\n\};/);
		expect(livechat).not.toBeNull();
		const body = livechat[1];
		expect(body).not.toContain('isCollapsed');
		expect(body).toMatch(
			/if\s*\(\s*this\.storage\.livechat === "collapsed"\s*\)\s*\{[\s\S]*if\s*\(\s*button && !this\.elements\.livechat\.collapsed\s*\)\s*\{[\s\S]*button\.click\(\);[\s\S]*this\.elements\.livechat\.collapsed = true;[\s\S]*\}\s*else if\s*\(\s*this\.elements\.livechat\s*\)\s*\{[\s\S]*this\.elements\.livechat\.collapsed = false;/
		);

		const chatBranch = functionsJs.match(/else if \(id === 'chat-messages'\) \{([\s\S]*?)\n\t\} else if/);
		expect(chatBranch).not.toBeNull();
		const branch = chatBranch[1];
		expect(branch).toContain("node.closest('yt-live-chat-renderer, ytd-live-chat-frame, #chat-container')");
		expect(branch).toContain('button[aria-label="Close"]');
		expect(branch).toContain(': null');
		expect(branch).toContain('this.livechat()');
		expect(branch).not.toContain('document.querySelector');
	});
});
