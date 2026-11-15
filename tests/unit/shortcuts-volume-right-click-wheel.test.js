// Feature: hold the right mouse button over the player and use the scroll wheel
// to change the volume (menu: Shortcuts > Volume). The amount per wheel notch is
// the existing "Step" slider (shortcuts_volume_step).
//
// The volume is shown as a whole number, white on 20% black, horizontally centered and 3/4 of
// the way up the player, fading out within one second.
//
// The context menu must not pop up when the gesture was used. Browsers disagree
// on when 'contextmenu' fires: Windows fires it after 'mouseup', Linux and macOS
// fire it right after 'mousedown'. Both orders are covered below.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '../..');
const SHORTCUTS_SRC = path.join(ROOT, 'js&css/web-accessible/www.youtube.com/shortcuts.js');
const FUNCTIONS_SRC = path.join(ROOT, 'js&css/web-accessible/functions.js');
const STYLES_SRC = path.join(ROOT, 'js&css/extension/www.youtube.com/styles.css');

// Minimal event target: keeps listeners per event name and hands them plain objects.
function makeTarget (sandbox) {
	const listeners = {};

	return {
		listeners,
		addEventListener: function (name, handler, options) {
			listeners[name] = listeners[name] || [];
			if (!listeners[name].some(l => l.handler === handler)) listeners[name].push({ handler, options });
		},
		removeEventListener: function (name, handler) {
			listeners[name] = (listeners[name] || []).filter(l => l.handler !== handler);
		},
		dispatch: function (event) {
			sandbox.event = event; // shortcutsHandler() reads the global window.event
			for (const { handler } of (listeners[event.type] || []).slice()) handler(event);
		}
	};
}

function load (storage) {
	const video = {},
		outside = {};
	let volume = 50;
	const player = {
		contains: node => node === video,
		matches: () => false,
		getVolume: () => volume,
		setVolume: value => { volume = Math.max(0, Math.min(100, value)); },
		isMuted: () => false
	};
	const improvedTube = {
		storage,
		elements: { player },
		showStatus: jest.fn(),
		input: {
			listening: {},
			listeners: {},
			pressed: { keys: new Set(), wheel: 0, alt: false, ctrl: false, shift: false },
			cancelled: new Set(),
			ignoreElements: ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'],
			modifierKeys: ['AltLeft', 'AltRight', 'ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight']
		}
	};
	const timers = [];
	const sandbox = {
		ImprovedTube: improvedTube,
		console,
		localStorage: {},
		sessionStorage: {},
		setTimeout: callback => timers.push(callback),
		MouseEvent: function (type, init) {
			this.type = type;
			this.isTrusted = false;
			this.button = init.button;
			this.clientX = init.clientX;
			this.clientY = init.clientY;
		}
	};
	const win = makeTarget(sandbox);
	const doc = makeTarget(sandbox);
	doc.documentElement = { dataset: { pageType: 'video' } };
	sandbox.window = win;
	sandbox.document = doc;
	video.dispatchEvent = jest.fn(event => win.dispatch(Object.assign(event, { target: video })));

	vm.createContext(sandbox);
	vm.runInContext(fs.readFileSync(SHORTCUTS_SRC, 'utf8'), sandbox);
	improvedTube.shortcutsInit();
	improvedTube.shortcutsVolumeRightClickWheel();

	function fire (type, props) {
		const event = Object.assign({
			type,
			isTrusted: true,
			target: video,
			button: 2,
			buttons: 2,
			altKey: false,
			ctrlKey: false,
			shiftKey: false,
			clientX: 320,
			clientY: 180,
			preventDefault: jest.fn(),
			stopPropagation: jest.fn(),
			composedPath: function () { return this.target === video ? [video, player] : [this.target]; }
		}, props);

		win.dispatch(event);
		return event;
	}

	return {
		improvedTube,
		win,
		video,
		outside,
		fire,
		getVolume: () => volume,
		runTimers: () => { while (timers.length) timers.shift()(); }
	};
}

// Load the real showStatus() from functions.js with stand-ins for the DOM and timers.
function loadShowStatus () {
	const timers = [],
		cleared = [],
		status = { dataset: {}, style: {}, remove: jest.fn() },
		player = { appendChild: jest.fn() },
		improvedTube = { storage: {}, elements: { player } },
		sandbox = {
			ImprovedTube: improvedTube,
			console,
			document: { createElement: () => status, documentElement: { dataset: { pageType: 'video' } } },
			setTimeout: (callback, delay) => timers.push({ callback, delay }),
			clearTimeout: id => cleared.push(id)
		};

	vm.createContext(sandbox);
	vm.runInContext(fs.readFileSync(FUNCTIONS_SRC, 'utf8'), sandbox);

	return { improvedTube, status, player, timers, cleared };
}

const ENABLED = { shortcuts_volume_right_click_wheel: true };

describe('Volume: hold right mouse button + scroll wheel', () => {
	describe('listeners', () => {
		test('nothing is installed while the setting is off', () => {
			const { win } = load({});
			for (const name of ['mousedown', 'wheel', 'contextmenu', 'mouseup']) {
				expect(win.listeners[name] || []).toHaveLength(0);
			}
		});

		test('installed in the capture phase and non-passive when the setting is on', () => {
			const { win } = load({ ...ENABLED });
			for (const name of ['mousedown', 'wheel', 'contextmenu', 'mouseup']) {
				expect(win.listeners[name]).toHaveLength(1);
				expect(win.listeners[name][0].options).toEqual({ passive: false, capture: true });
			}
		});

		test('switching the setting applies without a reload and never duplicates listeners', () => {
			const { improvedTube, win } = load({});

			improvedTube.storage.shortcuts_volume_right_click_wheel = true;
			improvedTube.shortcutsVolumeRightClickWheel();
			improvedTube.shortcutsVolumeRightClickWheel();
			expect(win.listeners.wheel).toHaveLength(1);

			improvedTube.storage.shortcuts_volume_right_click_wheel = false;
			improvedTube.shortcutsVolumeRightClickWheel();
			expect(win.listeners.wheel).toHaveLength(0);
		});
	});

	describe('wheel', () => {
		test('scrolling up raises and scrolling down lowers the volume by the default step (5)', () => {
			const { fire, getVolume } = load({ ...ENABLED });

			fire('mousedown');
			fire('wheel', { deltaY: -100 });
			expect(getVolume()).toBe(55);
			fire('wheel', { deltaY: 100 });
			fire('wheel', { deltaY: 100 });
			expect(getVolume()).toBe(45);
		});

		test('the amount follows the "Step" setting (shortcuts_volume_step)', () => {
			const { fire, getVolume } = load({ ...ENABLED, shortcuts_volume_step: 12 });

			fire('mousedown');
			fire('wheel', { deltaY: -100 });
			expect(getVolume()).toBe(62);
		});

		test('the wheel event is cancelled so the page does not scroll', () => {
			const { fire } = load({ ...ENABLED });

			fire('mousedown');
			const wheel = fire('wheel', { deltaY: -100 });
			expect(wheel.preventDefault).toHaveBeenCalledTimes(1);
			expect(wheel.stopPropagation).toHaveBeenCalledTimes(1);
		});

		test('ignored without the right mouse button', () => {
			const { fire, getVolume } = load({ ...ENABLED });

			const wheel = fire('wheel', { deltaY: -100, buttons: 0 });
			expect(getVolume()).toBe(50);
			expect(wheel.preventDefault).not.toHaveBeenCalled();
		});

		test('ignored when the pointer is not over the player', () => {
			const { fire, outside, getVolume } = load({ ...ENABLED });

			fire('mousedown', { target: outside });
			const wheel = fire('wheel', { deltaY: -100, target: outside });
			expect(getVolume()).toBe(50);
			expect(wheel.preventDefault).not.toHaveBeenCalled();
		});

		test('ignored for horizontal scrolling', () => {
			const { fire, getVolume } = load({ ...ENABLED });

			fire('mousedown');
			const wheel = fire('wheel', { deltaY: 0 });
			expect(getVolume()).toBe(50);
			expect(wheel.preventDefault).not.toHaveBeenCalled();
		});

		test('a wheel shortcut does not fire on top of the gesture', () => {
			// "wheel up" is bound to Increase volume: without the guard both would run (+10)
			const { fire, getVolume } = load({ ...ENABLED, shortcut_increase_volume: { wheel: -1 } });

			fire('mousedown');
			fire('wheel', { deltaY: -100 });
			expect(getVolume()).toBe(55);
		});

		test('that wheel shortcut keeps working without the right mouse button', () => {
			const { fire, getVolume } = load({ ...ENABLED, shortcut_increase_volume: { wheel: -1 } });

			fire('wheel', { deltaY: -100, buttons: 0 });
			expect(getVolume()).toBe(55);
		});
	});

	describe("context menu, 'contextmenu' after 'mouseup' (Windows)", () => {
		test('suppressed after the gesture was used', () => {
			const { fire, video, runTimers } = load({ ...ENABLED });

			fire('mousedown');
			fire('wheel', { deltaY: -100 });
			fire('mouseup', { buttons: 0 });
			const contextmenu = fire('contextmenu', { buttons: 0 });
			runTimers();

			expect(contextmenu.preventDefault).toHaveBeenCalledTimes(1);
			expect(contextmenu.stopPropagation).toHaveBeenCalledTimes(1);
			expect(video.dispatchEvent).not.toHaveBeenCalled();
		});

		test('a plain right-click is left alone', () => {
			const { fire, video, runTimers } = load({ ...ENABLED });

			fire('mousedown');
			fire('mouseup', { buttons: 0 });
			const contextmenu = fire('contextmenu', { buttons: 0 });
			runTimers();

			expect(contextmenu.preventDefault).not.toHaveBeenCalled();
			expect(contextmenu.stopPropagation).not.toHaveBeenCalled();
			expect(video.dispatchEvent).not.toHaveBeenCalled();
		});

		test('the right-click after a gesture opens the menu again', () => {
			const { fire } = load({ ...ENABLED });

			fire('mousedown');
			fire('wheel', { deltaY: -100 });
			fire('mouseup', { buttons: 0 });
			fire('contextmenu', { buttons: 0 });

			fire('mousedown');
			fire('mouseup', { buttons: 0 });
			const contextmenu = fire('contextmenu', { buttons: 0 });
			expect(contextmenu.preventDefault).not.toHaveBeenCalled();
		});
	});

	describe("context menu, 'contextmenu' right after 'mousedown' (Linux, macOS)", () => {
		test('held back while the button is down, never shown after the gesture was used', () => {
			const { fire, video, runTimers } = load({ ...ENABLED });

			fire('mousedown');
			const contextmenu = fire('contextmenu');
			fire('wheel', { deltaY: -100 });
			fire('mouseup', { buttons: 0 });
			runTimers();

			expect(contextmenu.preventDefault).toHaveBeenCalledTimes(1);
			expect(contextmenu.stopPropagation).toHaveBeenCalledTimes(1);
			expect(video.dispatchEvent).not.toHaveBeenCalled();
		});

		test('a plain right-click gets its menu when the button is released', () => {
			const { fire, video, runTimers } = load({ ...ENABLED });

			fire('mousedown');
			const contextmenu = fire('contextmenu', { clientX: 111, clientY: 222 });
			expect(contextmenu.preventDefault).toHaveBeenCalledTimes(1);
			expect(video.dispatchEvent).not.toHaveBeenCalled();

			fire('mouseup', { buttons: 0 });
			expect(video.dispatchEvent).not.toHaveBeenCalled(); // only after 'mouseup' has finished
			runTimers();

			expect(video.dispatchEvent).toHaveBeenCalledTimes(1);
			const replayed = video.dispatchEvent.mock.calls[0][0];
			expect(replayed.type).toBe('contextmenu');
			expect(replayed.button).toBe(2);
			expect(replayed.clientX).toBe(111);
			expect(replayed.clientY).toBe(222);
			// the replayed event passes through our own listener untouched
			expect(replayed.isTrusted).toBe(false);
		});

		test('a right-click outside the player is left alone', () => {
			const { fire, outside, video, runTimers } = load({ ...ENABLED });

			fire('mousedown', { target: outside });
			const contextmenu = fire('contextmenu', { target: outside });
			fire('mouseup', { target: outside, buttons: 0 });
			runTimers();

			expect(contextmenu.preventDefault).not.toHaveBeenCalled();
			expect(video.dispatchEvent).not.toHaveBeenCalled();
		});
	});

	test('a context menu opened without the right mouse button is left alone (keyboard, Ctrl+click)', () => {
		const { fire } = load({ ...ENABLED });

		const contextmenu = fire('contextmenu', { button: 0, buttons: 0 });
		expect(contextmenu.preventDefault).not.toHaveBeenCalled();
	});

	describe('volume text', () => {
		test('shown as a whole number, as the "volume" status, for one second', () => {
			const { improvedTube, fire } = load({ ...ENABLED });

			fire('mousedown');
			fire('wheel', { deltaY: -100 });
			expect(improvedTube.showStatus).toHaveBeenLastCalledWith('55', 'volume', 1000);
		});

		test('a fractional volume is rounded, never shown with decimals', () => {
			const { improvedTube, fire, getVolume } = load({ ...ENABLED, shortcuts_volume_step: 2.5 });

			fire('mousedown');
			fire('wheel', { deltaY: -100 });
			expect(getVolume()).toBe(52.5);
			expect(improvedTube.showStatus).toHaveBeenLastCalledWith('53', 'volume', 1000);
		});

		test('showStatus marks the element for the stylesheet and removes it after the given time', () => {
			const { improvedTube, status, player, timers } = loadShowStatus();

			improvedTube.showStatus('55', 'volume', 1000);

			expect(status.id).toBe('it-status');
			expect(status.textContent).toBe('55');
			expect(status.dataset.type).toBe('volume');
			expect(status.style.animationDuration).toBe('1000ms');
			expect(player.appendChild).toHaveBeenCalledWith(status);
			expect(timers).toHaveLength(1);
			expect(timers[0].delay).toBe(1000);

			expect(status.remove).not.toHaveBeenCalled();
			timers[0].callback();
			expect(status.remove).toHaveBeenCalledTimes(1);
		});

		test('every new volume change restarts the one second', () => {
			const { improvedTube, timers, cleared } = loadShowStatus();

			improvedTube.showStatus('55', 'volume', 1000);
			improvedTube.showStatus('60', 'volume', 1000);

			expect(cleared).toEqual([improvedTube.status_timer - 1]);
			expect(timers.map(timer => timer.delay)).toEqual([1000, 1000]);
		});

		test('the other status texts are unchanged (two decimals, 500 ms, no volume styling)', () => {
			const { improvedTube, status, timers } = loadShowStatus();

			improvedTube.showStatus('55', 'volume', 1000);
			improvedTube.showStatus(1.5);

			expect(status.textContent).toBe('1.50');
			expect(status.dataset.type).toBe('');
			expect(timers[1].delay).toBe(500);
		});

		test('stylesheet: 30px (other status texts: 40px), white on 20% black, horizontally centered, 3/4 of the way up, fading out', () => {
			const styles = fs.readFileSync(STYLES_SRC, 'utf8'),
				rule = styles.match(/#it-status\[data-type="volume"\] \{([^}]*)\}/)[1],
				declarations = Object.fromEntries(rule.split(';').map(d => d.split(':').map(part => part.trim())).filter(d => d.length === 2)),
				base = styles.match(/#it-status \{([^}]*)\}/)[1];

			expect(base).toContain('font-size: 40px;');

			expect(declarations).toEqual({
				'font-size': '30px',
				'top': '25%',
				'right': 'auto',
				'left': '50%',
				'transform': 'translate(-50%, -50%)',
				'padding': '4px 12px',
				'border-radius': '4px',
				'color': '#fff',
				'background': 'rgba(0, 0, 0, .2)',
				'pointer-events': 'none',
				'animation-name': 'it-status-fade',
				'animation-timing-function': 'ease-in',
				'animation-fill-mode': 'forwards'
			});
			expect(styles).toMatch(/@keyframes it-status-fade \{\s*to \{\s*opacity: 0;\s*\}\s*\}/);
		});
	});

	describe('wiring', () => {
		test('runs on page load', () => {
			const init = fs.readFileSync(path.join(ROOT, 'js&css/web-accessible/init.js'), 'utf8');
			expect(init).toContain('this.shortcutsVolumeRightClickWheel();');
		});

		test('has a switch next to the volume step in the menu', () => {
			const extension = { skeleton: { main: { layers: { section: {} } } } };
			vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'menu/skeleton-parts/shortcuts.js'), 'utf8'), { extension });
			const section = extension.skeleton.main.layers.section.shortcuts.on.click.playerSection.volume.on.click.section_1;

			expect(section.shortcuts_volume_step.component).toBe('slider');
			expect(section.shortcuts_volume_right_click_wheel.component).toBe('switch');
		});

		test('the switch has an English label', () => {
			const extension = { skeleton: { main: { layers: { section: {} } } } };
			vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'menu/skeleton-parts/shortcuts.js'), 'utf8'), { extension });
			const text = extension.skeleton.main.layers.section.shortcuts.on.click.playerSection.volume.on.click.section_1.shortcuts_volume_right_click_wheel.text;
			const messages = JSON.parse(fs.readFileSync(path.join(ROOT, '_locales/en/messages.json'), 'utf8'));

			expect(messages[text].message).toBeTruthy();
		});

		test('the setting name is not mistaken for a key binding', () => {
			// shortcutsInit() treats every "shortcut_*" setting as a key binding
			expect('shortcuts_volume_right_click_wheel'.startsWith('shortcut_')).toBe(false);
		});
	});
});
