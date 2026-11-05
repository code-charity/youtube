// Test for Issue #4441: Arrow key volume step should respect user configuration
//
// Problem: YouTube hardcodes volume step of 5 for native arrow keys (↑/↓),
// ignoring the user-configured shortcuts_volume_step setting.
// Custom shortcuts (e.g. A/Z) work correctly, but default arrow keys do not.
//
// Fix: Intercept ArrowUp (keyCode 38) and ArrowDown (keyCode 40) in the
// keydown handler to call player.setVolume() with the configured step value
// and prevent the event from reaching YouTube's native handler.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SHORTCUTS_SRC = path.join(
	__dirname,
	'../../js&css/web-accessible/www.youtube.com/shortcuts.js'
);

function makeImprovedTube(volumeStep = 1) {
	const player = {
		getVolume: jest.fn().mockReturnValue(50),
		setVolume: jest.fn(),
		isMuted: jest.fn().mockReturnValue(false)
	};

	return {
		storage: {
			shortcuts_volume_step: volumeStep,
			// Enable arrow key shortcuts so they're registered
			shortcut_increase_volume: { keys: { '38': true } },
			shortcut_decrease_volume: { keys: { '40': true } }
		},
		elements: { player },
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

function loadShortcuts(volumeStep = 1) {
	const improvedTube = makeImprovedTube(volumeStep);
	const win = new EventTarget();
	const doc = new EventTarget();

	const sandbox = { ImprovedTube: improvedTube, window: win, document: doc, console };
	vm.createContext(sandbox);
	vm.runInContext(fs.readFileSync(SHORTCUTS_SRC, 'utf8'), sandbox);

	improvedTube.shortcutsInit();
	return { improvedTube, win };
}

describe('Issue #4441: arrow key volume step override', () => {
	test('ArrowUp should increase volume by configured step (default 5)', () => {
		const { improvedTube, win } = loadShortcuts(5);
		const keydownEvent = new Event('keydown');
		Object.defineProperty(keydownEvent, 'keyCode', { value: 38 });
		Object.defineProperty(keydownEvent, 'code', { value: 'ArrowUp' });

		win.dispatchEvent(keydownEvent);

		expect(improvedTube.elements.player.setVolume).toHaveBeenCalledWith(55);
		expect(keydownEvent.defaultPrevented).toBe(true);
	});

	test('ArrowDown should decrease volume by configured step', () => {
		const { improvedTube, win } = loadShortcuts(5);
		const keydownEvent = new Event('keydown');
		Object.defineProperty(keydownEvent, 'keyCode', { value: 40 });
		Object.defineProperty(keydownEvent, 'code', { value: 'ArrowDown' });

		win.dispatchEvent(keydownEvent);

		expect(improvedTube.elements.player.setVolume).toHaveBeenCalledWith(45);
		expect(keydownEvent.defaultPrevented).toBe(true);
	});

	test('Arrow keys should respect custom volume_step setting (e.g., 1)', () => {
		const { improvedTube, win } = loadShortcuts(1);
		const keydownEvent = new Event('keydown');
		Object.defineProperty(keydownEvent, 'keyCode', { value: 38 });
		Object.defineProperty(keydownEvent, 'code', { value: 'ArrowUp' });

		win.dispatchEvent(keydownEvent);

		expect(improvedTube.elements.player.setVolume).toHaveBeenCalledWith(51);
	});

	test('Arrow key event should be prevented and stopped from propagating', () => {
		const { improvedTube, win } = loadShortcuts(1);
		const keydownEvent = new Event('keydown');
		Object.defineProperty(keydownEvent, 'keyCode', { value: 38 });

		win.dispatchEvent(keydownEvent);

		expect(keydownEvent.defaultPrevented).toBe(true);
		expect(keydownEvent.propagationStopped).toBe(true);
	});

	test('Non-arrow keys should not be intercepted', () => {
		const { improvedTube, win } = loadShortcuts(1);
		const keydownEvent = new Event('keydown');
		Object.defineProperty(keydownEvent, 'keyCode', { value: 32 }); // Space bar

		win.dispatchEvent(keydownEvent);

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

		const keydownEvent = new Event('keydown');
		Object.defineProperty(keydownEvent, 'keyCode', { value: 38 });

		win.dispatchEvent(keydownEvent);

		// Should not throw and should add keyCode to pressed keys
		expect(improvedTube.input.pressed.keys.has(38)).toBe(true);
	});

	test('Custom keyboard shortcuts should still work alongside arrow key fix', () => {
		const { improvedTube, win } = loadShortcuts(1);
		// Simulate custom shortcut (A = 65)
		const keydownEvent = new Event('keydown');
		Object.defineProperty(keydownEvent, 'keyCode', { value: 65 });
		Object.defineProperty(keydownEvent, 'code', { value: 'KeyA' });

		win.dispatchEvent(keydownEvent);

		// The custom shortcut should be tracked in pressed keys
		expect(improvedTube.input.pressed.keys.has(65)).toBe(true);
	});
});
