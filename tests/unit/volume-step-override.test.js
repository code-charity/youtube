// Test for Issue #4441: Arrow key volume step should respect user configuration
//
// Problem: YouTube hardcodes volume step of 5 for native arrow keys (↑/↓),
// ignoring the user-configured shortcuts_volume_step setting.
// Custom shortcuts (e.g. A/Z) work correctly, but default arrow keys do not.
//
// Fix: Intercept ArrowUp (keyCode 38) and ArrowDown (keyCode 40) in the
// keydown handler to call player.setVolume() with the configured step value
// and prevent the event from reaching YouTube's native handler.
//
// The override must NOT swallow an arrow key that the user has remapped to a
// configured shortcut (e.g. play/pause on ArrowUp) and must not swallow
// arrow + modifier combinations (e.g. Shift+ArrowUp).

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SHORTCUTS_SRC = path.join(
	__dirname,
	'../../js&css/web-accessible/www.youtube.com/shortcuts.js'
);

function makeImprovedTube(volumeStep = 1, extraStorage = {}) {
	const player = {
		getVolume: jest.fn().mockReturnValue(50),
		setVolume: jest.fn(),
		isMuted: jest.fn().mockReturnValue(false)
	};

	return {
		storage: {
			shortcuts_volume_step: volumeStep,
			// A configured (non-arrow) shortcut so shortcutsInit() binds the
			// keydown listener without the arrow keys themselves being remapped.
			shortcut_play_pause: { keys: { '80': true } },
			...extraStorage
		},
		elements: { player },
		// Handler for the configured play/pause shortcut above. shortcutsHandler()
		// dispatches to it when the binding matches.
		shortcutPlayPause: jest.fn(),
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

function keydownEvent({ keyCode, code, altKey = false, ctrlKey = false, shiftKey = false, metaKey = false }) {
	const event = new Event('keydown');
	Object.defineProperty(event, 'keyCode', { value: keyCode });
	Object.defineProperty(event, 'code', { value: code });
	Object.defineProperty(event, 'altKey', { value: altKey });
	Object.defineProperty(event, 'ctrlKey', { value: ctrlKey });
	Object.defineProperty(event, 'shiftKey', { value: shiftKey });
	Object.defineProperty(event, 'metaKey', { value: metaKey });
	return event;
}

function loadShortcuts(volumeStep = 1, extraStorage = {}) {
	const improvedTube = makeImprovedTube(volumeStep, extraStorage);
	const win = new EventTarget();
	const doc = new EventTarget();

	const sandbox = { ImprovedTube: improvedTube, window: win, document: doc, console };
	vm.createContext(sandbox);
	vm.runInContext(fs.readFileSync(SHORTCUTS_SRC, 'utf8'), sandbox);

	improvedTube.shortcutsInit();
	return { improvedTube, win, sandbox };
}

describe('Issue #4441: arrow key volume step override', () => {
	test('ArrowUp should increase volume by configured step (default 5)', () => {
		const { improvedTube, win } = loadShortcuts(5);
		win.dispatchEvent(keydownEvent({ keyCode: 38, code: 'ArrowUp' }));

		expect(improvedTube.elements.player.setVolume).toHaveBeenCalledWith(55);
	});

	test('ArrowDown should decrease volume by configured step', () => {
		const { improvedTube, win } = loadShortcuts(5);
		win.dispatchEvent(keydownEvent({ keyCode: 40, code: 'ArrowDown' }));

		expect(improvedTube.elements.player.setVolume).toHaveBeenCalledWith(45);
	});

	test('Arrow keys should respect custom volume_step setting (e.g., 1)', () => {
		const { improvedTube, win } = loadShortcuts(1);
		win.dispatchEvent(keydownEvent({ keyCode: 38, code: 'ArrowUp' }));

		expect(improvedTube.elements.player.setVolume).toHaveBeenCalledWith(51);
	});

	test('Arrow key event should call setVolume with correct value', () => {
		const { improvedTube, win } = loadShortcuts(1);
		win.dispatchEvent(keydownEvent({ keyCode: 38, code: 'ArrowUp' }));

		// The fix intercepts the event and calls setVolume directly
		expect(improvedTube.elements.player.setVolume).toHaveBeenCalledTimes(1);
		expect(improvedTube.elements.player.setVolume).toHaveBeenCalledWith(51);
	});

	test('Non-arrow keys should not be intercepted', () => {
		const { improvedTube, win } = loadShortcuts(1);
		win.dispatchEvent(keydownEvent({ keyCode: 32, code: 'Space' })); // Space bar

		// setVolume should not be called for space bar
		expect(improvedTube.elements.player.setVolume).not.toHaveBeenCalled();
	});

	test('When player is missing, arrow keys should fall through to normal handling', () => {
		const improvedTube = makeImprovedTube(1);
		improvedTube.elements.player = null;
		improvedTube.input.listening = {};
		improvedTube.input.listeners = {};
		improvedTube.input.pressed = { keys: new Set(), wheel: 0, alt: false, ctrl: false, shift: false };
		improvedTube.input.cancelled = new Set();

		const win = new EventTarget();
		const doc = new EventTarget();
		const sandbox = { ImprovedTube: improvedTube, window: win, document: doc, console };
		vm.createContext(sandbox);
		vm.runInContext(fs.readFileSync(SHORTCUTS_SRC, 'utf8'), sandbox);
		improvedTube.shortcutsInit();

		win.dispatchEvent(keydownEvent({ keyCode: 38, code: 'ArrowUp' }));

		// Should not throw and should add keyCode to pressed keys
		expect(improvedTube.input.pressed.keys.has(38)).toBe(true);
	});

	test('Custom keyboard shortcuts should still work alongside arrow key fix', () => {
		const { improvedTube, win } = loadShortcuts(1);
		// Simulate custom shortcut (A = 65)
		win.dispatchEvent(keydownEvent({ keyCode: 65, code: 'KeyA' }));

		// The custom shortcut should be tracked in pressed keys
		expect(improvedTube.input.pressed.keys.has(65)).toBe(true);
	});

	test('does not override ArrowUp when it is bound to a configured shortcut', () => {
		// The user remapped play/pause to ArrowUp (and volume elsewhere). The
		// configured binding must win: the arrow override must not fire.
		const { improvedTube, win, sandbox } = loadShortcuts(1, {
			shortcut_play_pause: { keys: { '38': true } }
		});

		// The bundle defines its own shortcutPlayPause; spy on it after load so the
		// configured-binding dispatch is observable.
		improvedTube.shortcutPlayPause = jest.fn();

		const event = keydownEvent({ keyCode: 38, code: 'ArrowUp' });
		// shortcutsHandler() reads the ambient `event` global in the browser.
		sandbox.event = event;
		win.dispatchEvent(event);

		expect(improvedTube.elements.player.setVolume).not.toHaveBeenCalled();
		expect(improvedTube.shortcutPlayPause).toHaveBeenCalledTimes(1);
	});

	test('does not override modified arrow combinations such as Shift+ArrowUp', () => {
		const { improvedTube, win } = loadShortcuts(1);

		win.dispatchEvent(keydownEvent({ keyCode: 38, code: 'ArrowUp', shiftKey: true }));

		expect(improvedTube.elements.player.setVolume).not.toHaveBeenCalled();
	});
});
