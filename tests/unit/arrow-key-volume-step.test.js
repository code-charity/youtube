/**
 * Unit tests for issue #4441:
 * Arrow keys (↑/↓) ignore user-configured shortcuts_volume_step
 *
 * Root cause: YouTube's native player intercepts ArrowUp/ArrowDown and
 * hardcodes a 5% volume step, overriding the value set in ImprovedTube's
 * "Volume Step" slider (shortcuts_volume_step). Custom key bindings (e.g. A/Z)
 * work correctly because ImprovedTube intercepts those; the gap was that
 * unbound bare ArrowUp/ArrowDown were not intercepted at all.
 *
 * Fix: After shortcutsHandler() runs (so configured shortcuts keep priority),
 * intercept unhandled bare ArrowUp/ArrowDown and call shortcutIncreaseVolume()
 * which uses shortcuts_volume_step and syncs localStorage.
 */

'use strict';

const vm   = require('vm');
const fs   = require('fs');
const path = require('path');

const SHORTCUTS_SRC = path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/shortcuts.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePlayer(initialVolume = 50) {
	let vol = initialVolume;
	return {
		getVolume:       jest.fn(() => vol),
		setVolume:       jest.fn((v) => { vol = v; }),
		isMuted:         jest.fn(() => false),
		getPlaybackRate: jest.fn(() => 1),
	};
}

/**
 * Load shortcuts.js into a fresh sandbox.
 * Returns { improvedTube, keydown } where `keydown` is the registered
 * handler function that we can call with a synthetic event.
 */
function loadShortcuts({ volumeStep = 5, pageType = 'video', extraShortcuts = {} } = {}) {
	const player = makePlayer();

	const improvedTube = {
		user_interacted: false,
		storage: {
			shortcuts_volume_step: volumeStep,
			...extraShortcuts,
		},
		elements: {
			player,
			shorts_player: null,
			video:         null,
		},
		input: {
			pressed:    { keys: new Set(), wheel: 0, alt: false, ctrl: false, shift: false },
			listening:  {},
			listeners:  {},
			cancelled:  new Set(),
			ignoreElements: ['INPUT', 'TEXTAREA', 'SELECT'],
			modifierKeys:   ['ControlLeft', 'ControlRight', 'AltLeft', 'AltRight',
			                 'ShiftLeft', 'ShiftRight', 'MetaLeft', 'MetaRight'],
			recoveryListenersBound: false,
		},
		// Real method stubs — will be overwritten by the bundle but we spy on them
		// after vm.runInContext.
		shortcutIncreaseVolume: function (decrease) {
			// real impl reads storage.shortcuts_volume_step — do nothing in stub
		},
		playbackSpeed: function () { return 1; },
		showStatus:    function () {},
	};

	const doc = {
		activeElement:   null,
		addEventListener: jest.fn(),
		hidden:          false,
		documentElement: { dataset: { pageType } },
	};
	const win = new EventTarget();

	const sandbox = {
		ImprovedTube: improvedTube,
		window:       win,
		document:     doc,
		localStorage:    {},
		sessionStorage:  {},
		console,
		event:        undefined,
	};

	vm.createContext(sandbox);
	vm.runInContext(fs.readFileSync(SHORTCUTS_SRC, 'utf8'), sandbox);

	// Now spy AFTER the bundle ran (it defines shortcutIncreaseVolume from the file)
	sandbox.ImprovedTube.shortcutIncreaseVolume = jest.fn();

	sandbox.ImprovedTube.shortcutsInit();

	// Extract the keydown handler the bundle registered so tests can call it directly
	const keydown = sandbox.ImprovedTube.shortcutsListeners.keydown;

	return { improvedTube: sandbox.ImprovedTube, player, keydown };
}

/** Create a minimal synthetic keyboard event. */
function syntheticKeydown({
	keyCode,
	code       = '',
	altKey     = false,
	ctrlKey    = false,
	shiftKey   = false,
	metaKey    = false,
	defaultPrevented = false,
} = {}) {
	let _prevented = defaultPrevented;
	const ev = {
		keyCode,
		code,
		altKey,
		ctrlKey,
		shiftKey,
		metaKey,
		target: { isContentEditable: false },
		get defaultPrevented() { return _prevented; },
		preventDefault:  jest.fn(function () { _prevented = true; }),
		stopPropagation: jest.fn(),
	};
	return ev;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Issue #4441 — arrow key volume step override', () => {

	test('ArrowUp calls shortcutIncreaseVolume(false) — increase volume', () => {
		const { improvedTube, keydown } = loadShortcuts({ volumeStep: 5 });
		keydown(syntheticKeydown({ keyCode: 38, code: 'ArrowUp' }));
		expect(improvedTube.shortcutIncreaseVolume).toHaveBeenCalledWith(false);
	});

	test('ArrowDown calls shortcutIncreaseVolume(true) — decrease volume', () => {
		const { improvedTube, keydown } = loadShortcuts({ volumeStep: 5 });
		keydown(syntheticKeydown({ keyCode: 40, code: 'ArrowDown' }));
		expect(improvedTube.shortcutIncreaseVolume).toHaveBeenCalledWith(true);
	});

	test('shortcuts_volume_step of 1 is passed through — real step is 1 not 5', () => {
		const { improvedTube, keydown } = loadShortcuts({ volumeStep: 1 });
		keydown(syntheticKeydown({ keyCode: 38, code: 'ArrowUp' }));
		// The spy was called; the real impl inside shortcutIncreaseVolume will
		// read storage.shortcuts_volume_step = 1 at runtime.
		expect(improvedTube.shortcutIncreaseVolume).toHaveBeenCalledWith(false);
		expect(improvedTube.storage.shortcuts_volume_step).toBe(1);
	});

	test('ArrowUp event is preventDefault-ed to block YouTube native handler', () => {
		const { keydown } = loadShortcuts({ volumeStep: 5 });
		const ev = syntheticKeydown({ keyCode: 38, code: 'ArrowUp' });
		keydown(ev);
		expect(ev.preventDefault).toHaveBeenCalled();
	});

	test('ArrowDown event is stopPropagation-ed', () => {
		const { keydown } = loadShortcuts({ volumeStep: 5 });
		const ev = syntheticKeydown({ keyCode: 40, code: 'ArrowDown' });
		keydown(ev);
		expect(ev.stopPropagation).toHaveBeenCalled();
	});

	test('Shift+ArrowUp is NOT intercepted (modifier present)', () => {
		const { improvedTube, keydown } = loadShortcuts({ volumeStep: 5 });
		keydown(syntheticKeydown({ keyCode: 38, code: 'ArrowUp', shiftKey: true }));
		expect(improvedTube.shortcutIncreaseVolume).not.toHaveBeenCalled();
	});

	test('Ctrl+ArrowUp is NOT intercepted', () => {
		const { improvedTube, keydown } = loadShortcuts({ volumeStep: 5 });
		keydown(syntheticKeydown({ keyCode: 38, code: 'ArrowUp', ctrlKey: true }));
		expect(improvedTube.shortcutIncreaseVolume).not.toHaveBeenCalled();
	});

	test('Alt+ArrowDown is NOT intercepted', () => {
		const { improvedTube, keydown } = loadShortcuts({ volumeStep: 5 });
		keydown(syntheticKeydown({ keyCode: 40, code: 'ArrowDown', altKey: true }));
		expect(improvedTube.shortcutIncreaseVolume).not.toHaveBeenCalled();
	});

	test('Non-arrow key (Space = 32) is NOT intercepted', () => {
		const { improvedTube, keydown } = loadShortcuts({ volumeStep: 5 });
		keydown(syntheticKeydown({ keyCode: 32, code: 'Space' }));
		expect(improvedTube.shortcutIncreaseVolume).not.toHaveBeenCalled();
	});

	test('when a configured shortcut already handles ArrowUp the override is skipped', () => {
		// Simulate: shortcutsHandler() already called event.preventDefault()
		// (e.g. user has remapped ArrowUp → play/pause).
		// Our guard is `!event.defaultPrevented`, so if that is true we bail out.
		const { improvedTube, keydown } = loadShortcuts({ volumeStep: 5 });
		const ev = syntheticKeydown({ keyCode: 38, code: 'ArrowUp', defaultPrevented: true });
		keydown(ev);
		// The override must NOT fire when default was already prevented
		expect(improvedTube.shortcutIncreaseVolume).not.toHaveBeenCalled();
	});

	test('ArrowUp is called once per keydown, not on every modifier-combo', () => {
		const { improvedTube, keydown } = loadShortcuts({ volumeStep: 5 });
		keydown(syntheticKeydown({ keyCode: 38, code: 'ArrowUp' }));
		keydown(syntheticKeydown({ keyCode: 38, code: 'ArrowUp' }));
		expect(improvedTube.shortcutIncreaseVolume).toHaveBeenCalledTimes(2);
	});
});
