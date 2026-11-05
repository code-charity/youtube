// Test for Issue #4283: the "Chapters (Sidebar) On/Off" shortcut.
//
// Observed on YouTube (Chromium 141, Nov 2026): once the chapters panel has been
// opened, the page holds two chapters panels, the open one and a hidden copy.
// shortcutChapters() chose "open" whenever ANY hidden chapters panel existed, so
// a second press never closed the panel, in normal view or in full screen. It
// also read two block-scoped consts outside their blocks (ReferenceError on every
// press) and read .clientHeight of null on pages without a chapters panel.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SHORTCUTS_SRC = path.join(
	__dirname,
	'../../js&css/web-accessible/www.youtube.com/shortcuts.js'
);

const HIDDEN = 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN';
const EXPANDED = 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED';

// A minimal stand-in for the parts of YouTube's page the shortcut touches.
// Only the selectors shortcuts.js uses are supported; anything else throws, so
// a changed selector shows up as a test failure instead of a silent null.
function makePage({ withPanel = true } = {}) {
	const panels = [];
	const makePanel = visibility => {
		const panel = {
			visibility,
			clientHeight: 0,
			removeAttribute(name) {
				if (name === 'visibility') panel.visibility = EXPANDED;
			},
			querySelector(selector) {
				if (selector === '#visibility-button button[aria-label]' || selector === '#visibility-button button') {
					return { click() { panel.visibility = HIDDEN; } };
				}
				throw new Error('unexpected panel selector: ' + selector);
			}
		};
		panels.push(panel);
		return panel;
	};
	if (withPanel) makePanel(HIDDEN);

	const openButton = {
		click() {
			panels[0].visibility = EXPANDED;
			// YouTube keeps a hidden copy of the panel next to the open one
			if (panels.length === 1) makePanel(HIDDEN);
		}
	};

	const document = {
		querySelector(selector) {
			switch (selector) {
				case '[target-id*=chapters]':
				case '*[target-id*=chapters] #visibility-button button':
					return panels[0] || null;
				case '[target-id*=chapters][visibility*=HIDDEN]':
					return panels.find(p => p.visibility === HIDDEN) || null;
				case '[target-id*=chapters][visibility*=EXPANDED]':
					return panels.find(p => p.visibility === EXPANDED) || null;
				case '[target-id*=chapters][visibility*=EXPANDED] #visibility-button button[aria-label]': {
					const open = panels.find(p => p.visibility === EXPANDED);
					return open ? open.querySelector('#visibility-button button[aria-label]') : null;
				}
				case '[modern-chapters] #navigation-button button[aria-label]':
					return panels.length ? openButton : null;
				default:
					throw new Error('unexpected selector: ' + selector);
			}
		}
	};
	return { document, panels };
}

function loadShortcuts(document) {
	const improvedTube = {};
	const sandbox = { ImprovedTube: improvedTube, window: {}, document, console };
	vm.createContext(sandbox);
	vm.runInContext(fs.readFileSync(SHORTCUTS_SRC, 'utf8'), sandbox);
	return improvedTube;
}

const isOpen = panels => panels.some(p => p.visibility === EXPANDED);

describe('Issue #4283: chapters shortcut toggles on and off', () => {
	test('first press opens the chapters panel', () => {
		const { document, panels } = makePage();
		const improvedTube = loadShortcuts(document);
		improvedTube.shortcutChapters();
		expect(isOpen(panels)).toBe(true);
	});

	test('second press closes it, even with a hidden copy of the panel on the page', () => {
		const { document, panels } = makePage();
		const improvedTube = loadShortcuts(document);
		improvedTube.shortcutChapters();
		expect(panels).toHaveLength(2);
		try { improvedTube.shortcutChapters(); } catch (e) { /* asserted separately below */ }
		expect(isOpen(panels)).toBe(false);
	});

	test('pressing it does not throw', () => {
		const { document } = makePage();
		const improvedTube = loadShortcuts(document);
		expect(() => improvedTube.shortcutChapters()).not.toThrow();
		expect(() => improvedTube.shortcutChapters()).not.toThrow();
	});

	test('does nothing on a page without a chapters panel', () => {
		const { document } = makePage({ withPanel: false });
		const improvedTube = loadShortcuts(document);
		expect(() => improvedTube.shortcutChapters()).not.toThrow();
	});
});
