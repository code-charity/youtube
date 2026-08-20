// Test for issue #4020: Accordions for side panels (Watch later, In this video, etc.)
// Verifies the feature wires into init.js, the menu exposes the option, the
// CSS collapses panels in place rather than hiding them, and the JS handler
// marks panels collapsed instead of letting YouTube remove them from the DOM.

const fs = require('fs');
const path = require('path');

describe('Side panels accordion (#4020)', () => {
	let sidebarJs;
	let sidebarCss;
	let initJs;
	let appearanceSkeleton;
	let messagesJson;

	beforeAll(() => {
		sidebarJs = fs.readFileSync(path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/sidebar/sidebar.js'), 'utf8');
		sidebarCss = fs.readFileSync(path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/sidebar/sidebar.css'), 'utf8');
		initJs = fs.readFileSync(path.join(__dirname, '../../js&css/extension/init.js'), 'utf8');
		appearanceSkeleton = fs.readFileSync(path.join(__dirname, '../../menu/skeleton-parts/appearance.js'), 'utf8');
		messagesJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../_locales/en/messages.json'), 'utf8'));
	});

	test('registers the feature with init', () => {
		expect(initJs).toContain('extension.features.sidePanels();');
		expect(sidebarJs).toContain('extension.features.sidePanels');
	});

	test('exposes the option in the appearance menu', () => {
		expect(appearanceSkeleton).toContain('side_panels:');
		expect(appearanceSkeleton).toContain('"sidePanels"');
		expect(appearanceSkeleton).toContain('side_panels_only_one_expanded');
	});

	test('ships English locale strings for the menu label', () => {
		expect(messagesJson.sidePanels).toBeDefined();
		expect(messagesJson.sidePanels.message).toBe('Side panels (Watch later, In this video, ...)');
		expect(messagesJson.sidePanelsOnlyOneExpanded).toBeDefined();
		expect(messagesJson.sidePanelsOnlyOneExpanded.message).toBe('Only one expanded at a time');
	});

	test('CSS hides the body of collapsed panels but keeps the header', () => {
		expect(sidebarCss).toContain('[it-panel-collapsed]');
		// The body of a collapsed panel (everything except the header/title) is hidden.
		expect(sidebarCss).toMatch(/\[it-panel-collapsed\][\s\S]*?display:\s*none/);
		expect(sidebarCss).toContain('#playlist[it-panel-collapsed]');
		// The header/title itself is preserved via :not() in the hide rule.
		expect(sidebarCss).toContain(':not(.it-side-panel-collapsed-prompt)');
	});

	test('uses the configured storage key side_panels', () => {
		expect(sidebarJs).toContain("extension.storage.get('side_panels')");
	});

	test('collapses on X click instead of letting YouTube dismiss the panel', () => {
		// The handler should mark the panel as collapsed and stop propagation so
		// YouTube's own dismiss handler never sees the click.
		expect(sidebarJs).toContain("setAttribute('it-panel-collapsed'");
		expect(sidebarJs).toContain('preventDefault');
		expect(sidebarJs).toContain('stopPropagation');
	});

	test('clicking the header of a collapsed panel expands it', () => {
		expect(sidebarJs).toContain("removeAttribute('it-panel-collapsed')");
		expect(sidebarJs).toContain('handleHeaderClick');
	});

	test('does not hijack clicks on links or non-close buttons inside the header', () => {
		expect(sidebarJs).toMatch(/if \(target\.closest\('a'\)\)/);
		expect(sidebarJs).toMatch(/if \(target\.closest\('button:not\(\[aria-label="Close"\]\)'\)\)/);
	});

	test('sets an html attribute so CSS can scope its rules', () => {
		expect(sidebarJs).toContain("setAttribute('it-side-panels', 'collapsed')");
		expect(sidebarCss).toContain("html[it-side-panels='collapsed']");
	});

	test('auto-collapse-others opt-in collapses siblings', () => {
		expect(sidebarJs).toContain("side_panels_only_one_expanded");
		expect(sidebarJs).toContain('siblings');
	});
});
