// Test for Issue #3986: keyboard shortcuts stop working when the internet
// connection is unstable, and stay broken until the page is reloaded.
//
// Root cause: shortcutsHandler() matches a shortcut only on an EXACT key-set
// size. If a keyup is ever missed — focus jumping to the player / an ad iframe,
// an SPA navigation, or a tab switch during network churn — the keyCode stays
// stuck in input.pressed.keys and no shortcut can match again. The only prior
// recovery ('improvedtube-blur') is dispatched from the extension side and can
// itself be lost when the same network issue suspends the MV3 service worker.
//
// Fix under test: shortcutsInit() also binds the pressed-keys reset to native,
// in-page events (window 'blur', document 'visibilitychange', 'yt-navigate-start')
// so a stuck key recovers without a reload and without the background worker.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SHORTCUTS_SRC = path.join(
	__dirname,
	'../../js&css/web-accessible/www.youtube.com/shortcuts.js'
);

function makeImprovedTube() {
	return {
		// one active shortcut (Space -> play/pause) so shortcutsInit installs listeners
		storage: { shortcut_play_pause: { keys: { '32': true } } },
		input: {
			listening: {},
			listeners: {},
			pressed: { keys: new Set(), wheel: 0, alt: false, ctrl: false, shift: false },
			cancelled: new Set(),
			ignoreElements: ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'],
			modifierKeys: ['AltLeft', 'AltRight', 'ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight']
		}
	};
}

// Load the real shortcuts.js into a sandbox with minimal window/document stand-ins
// (Node's built-in EventTarget), then run shortcutsInit() to wire the listeners.
function loadShortcuts() {
	const improvedTube = makeImprovedTube();
	const win = new EventTarget();
	const doc = new EventTarget();
	doc.hidden = false;

	const sandbox = { ImprovedTube: improvedTube, window: win, document: doc, console };
	vm.createContext(sandbox);
	vm.runInContext(fs.readFileSync(SHORTCUTS_SRC, 'utf8'), sandbox);

	improvedTube.shortcutsInit();
	return { improvedTube, win, doc };
}

describe('Issue #3986: shortcut stuck-key recovery', () => {
	test('a missed keyup leaves a key stuck (the failure condition)', () => {
		const { improvedTube } = loadShortcuts();
		improvedTube.input.pressed.keys.add(70); // keydown for "f" whose keyup never arrived
		// shortcutsHandler requires an exact size match, so this stuck key blocks
		// every shortcut (e.g. Space, size 1) until pressed.keys is cleared.
		expect(improvedTube.input.pressed.keys.size).toBe(1);
	});

	test('window blur clears the stuck key (recovery without reload)', () => {
		const { improvedTube, win } = loadShortcuts();
		improvedTube.input.pressed.keys.add(70);
		win.dispatchEvent(new Event('blur'));
		expect(improvedTube.input.pressed.keys.size).toBe(0);
	});

	test('tab hide (visibilitychange) clears the stuck key', () => {
		const { improvedTube, doc } = loadShortcuts();
		improvedTube.input.pressed.keys.add(70);
		doc.hidden = true;
		doc.dispatchEvent(new Event('visibilitychange'));
		expect(improvedTube.input.pressed.keys.size).toBe(0);
	});

	test('yt-navigate-start (SPA navigation) clears the stuck key', () => {
		const { improvedTube, doc } = loadShortcuts();
		improvedTube.input.pressed.keys.add(70);
		doc.dispatchEvent(new Event('yt-navigate-start'));
		expect(improvedTube.input.pressed.keys.size).toBe(0);
	});

	test('visibilitychange while still visible does NOT clear (only on hide)', () => {
		const { improvedTube, doc } = loadShortcuts();
		improvedTube.input.pressed.keys.add(70);
		doc.hidden = false;
		doc.dispatchEvent(new Event('visibilitychange'));
		expect(improvedTube.input.pressed.keys.size).toBe(1);
	});
});
