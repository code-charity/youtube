// The right mouse button can be part of a shortcut: hold it and scroll, alone or
// together with Alt / Ctrl / Shift and keys. It is recorded in the shortcut dialog
// of the menu like any other shortcut, for example
//   Increase volume = right mouse button + wheel up
//   Decrease volume = right mouse button + wheel down
//
// The context menu must not pop up after such a shortcut. Browsers disagree on
// when 'contextmenu' fires: Windows fires it after 'mouseup', Linux and macOS
// fire it right after 'mousedown'. Both orders are covered below.
//
// The volume is shown as a whole number, white on 20% black, horizontally
// centered and 3/4 of the way up the player, fading out within one second.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '../..');
const CORE_SRC = path.join(ROOT, 'js&css/web-accessible/core.js');
const SHORTCUTS_SRC = path.join(ROOT, 'js&css/web-accessible/www.youtube.com/shortcuts.js');
const FUNCTIONS_SRC = path.join(ROOT, 'js&css/web-accessible/functions.js');
const STYLES_SRC = path.join(ROOT, 'js&css/extension/www.youtube.com/styles.css');
const SATUS_SRC = path.join(ROOT, 'menu/satus.js');

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

// Load the real core.js (input state) and shortcuts.js with stand-ins for the page.
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
	const timers = [];
	const sandbox = {
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
	doc.createElement = () => ({ style: {} });
	doc.documentElement = { dataset: { pageType: 'video' }, appendChild: () => {} };
	doc.activeElement = null;
	sandbox.window = win;
	sandbox.document = doc;
	video.dispatchEvent = jest.fn(event => win.dispatch(Object.assign(event, { target: video })));

	vm.createContext(sandbox);
	vm.runInContext(fs.readFileSync(CORE_SRC, 'utf8'), sandbox);
	vm.runInContext(fs.readFileSync(SHORTCUTS_SRC, 'utf8'), sandbox);

	const improvedTube = sandbox.ImprovedTube;
	improvedTube.storage = storage;
	improvedTube.elements.player = player;
	improvedTube.showStatus = jest.fn();
	improvedTube.shortcutsInit();

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

// Load the real shortcut recorder of the menu (satus.js) with a stand-in DOM.
function loadRecorder (stored) {
	function element (tag) {
		const node = {
			tag,
			className: '',
			textContent: '',
			style: {},
			dataset: {},
			childNodes: [],
			appendChild: function (child) {
				child.parent = this;
				this.childNodes.push(child);
				return child;
			},
			remove: function () {
				if (this.parent) this.parent.childNodes.splice(this.parent.childNodes.indexOf(this), 1);
			},
			addEventListener: () => {}
		};

		node.children = node.childNodes;
		return node;
	}

	const sandbox = {
		console,
		setTimeout,
		document: { createElement: element, addEventListener: () => {}, documentElement: element('html'), body: element('body') },
		navigator: { userAgent: '' },
		location: { href: '' },
		chrome: { runtime: {}, storage: { local: {}, onChanged: { addListener: () => {} } } },
		addEventListener: () => {},
		removeEventListener: () => {}
	};
	sandbox.window = sandbox;

	vm.createContext(sandbox);
	vm.runInContext(fs.readFileSync(SATUS_SRC, 'utf8'), sandbox);

	let open;
	const recorder = Object.assign(element('button'), {
		skeleton: {},
		storage: { key: 'shortcut_increase_volume', value: stored },
		createChildElement: tag => element(tag),
		addEventListener: (name, handler) => { if (name === 'click') open = handler; }
	});

	sandbox.satus.components.shortcut(recorder, recorder.skeleton);
	// open the dialog: the real click handler, without drawing the dialog itself
	sandbox.satus.render = () => {};
	open.call(recorder);
	recorder.primary = element('div'); // the preview inside the dialog

	return {
		recorder,
		wheel: (deltaY, buttons) => recorder.mousewheel({ deltaY, buttons, stopPropagation: () => {} }),
		key: (keyCode, key, modifiers) => recorder.keydown(Object.assign({ keyCode, key, code: key, altKey: false, ctrlKey: false, shiftKey: false, preventDefault: () => {}, stopPropagation: () => {} }, modifiers)),
		// what the dialog shows, e.g. ['key Ctrl', 'plus', 'mouse context', 'plus', 'mouse false']
		shown: () => recorder.primary.childNodes.map(node => (node.className.replace('satus-shortcut__', '') + ' ' + node.textContent).trim())
	};
}

const RIGHT_WHEEL_VOLUME = {
	shortcut_increase_volume: { wheel: -1, context: true },
	shortcut_decrease_volume: { wheel: 1, context: true }
};

describe('Shortcuts with the right mouse button', () => {
	describe('recording in the menu', () => {
		test('holding the right mouse button while scrolling records both', () => {
			const { recorder, wheel, shown } = loadRecorder();

			wheel(-100, 2);
			expect(recorder.data.wheel).toBe(-1);
			expect(recorder.data.context).toBe(true);
			// right mouse button first, then wheel up
			expect(shown()).toEqual(['mouse context', 'plus', 'mouse false']);

			wheel(100, 2);
			expect(recorder.data.wheel).toBe(1);
			expect(recorder.data.context).toBe(true);
			expect(shown()).toEqual(['mouse context', 'plus', 'mouse true']);
		});

		test('scrolling without it records the wheel alone, as before', () => {
			const { recorder, wheel, shown } = loadRecorder();

			wheel(-100, 0);
			expect(recorder.data.wheel).toBe(-1);
			expect(recorder.data.context).toBe(false);
			expect(shown()).toEqual(['mouse false']);
		});

		test('scrolling again without the right mouse button drops it', () => {
			const { recorder, wheel } = loadRecorder();

			wheel(-100, 2);
			wheel(-100, 0);
			expect(recorder.data.context).toBe(false);
		});

		test('combines with a modifier key', () => {
			const { recorder, wheel, key, shown } = loadRecorder();

			key(17, 'Control', { ctrlKey: true });
			wheel(-100, 2);
			expect(recorder.data.ctrl).toBe(true);
			expect(recorder.data.context).toBe(true);
			expect(shown()).toEqual(['key Ctrl', 'plus', 'mouse context', 'plus', 'mouse false']);
		});

		test('the first scroll replaces the shortcut the dialog opened with (here the default, arrow up)', () => {
			const { recorder, wheel, shown } = loadRecorder({ keys: { 38: { key: 'ArrowUp' } } });

			wheel(-100, 2);
			expect(Object.keys(recorder.data.keys)).toHaveLength(0);
			expect(recorder.data.wheel).toBe(-1);
			expect(recorder.data.context).toBe(true);
			expect(shown()).toEqual(['mouse context', 'plus', 'mouse false']);
		});

		test('a key pressed in the dialog still combines with the scroll that follows', () => {
			const { recorder, wheel, key, shown } = loadRecorder({ keys: { 38: { key: 'ArrowUp' } } });

			key(75, 'k');
			wheel(-100, 0);
			expect(Object.keys(recorder.data.keys)).toEqual(['75']);
			expect(recorder.data.wheel).toBe(-1);
			expect(shown()).toEqual(['key K', 'plus', 'mouse false']);
		});

		test('pressing a key afterwards starts over without it', () => {
			const { recorder, wheel, key } = loadRecorder();

			wheel(-100, 2);
			key(75, 'k');
			expect(recorder.data.context).toBeFalsy();
			expect(recorder.data.wheel).toBe(0);
		});

		test('a stored shortcut with the right mouse button is shown again', () => {
			const { recorder, shown } = loadRecorder({ alt: false, ctrl: false, shift: false, keys: {}, wheel: 1, context: true });

			recorder.render();
			expect(shown()).toEqual(['mouse context', 'plus', 'mouse true']);
		});

		test('no context menu while recording', () => {
			const { recorder } = loadRecorder();
			const event = { preventDefault: jest.fn() };

			recorder.contextmenu(event);
			expect(event.preventDefault).toHaveBeenCalledTimes(1);
		});
	});

	describe('on YouTube', () => {
		test('a stored shortcut with the right mouse button is listened for', () => {
			const { improvedTube, win } = load({ ...RIGHT_WHEEL_VOLUME });

			expect(improvedTube.input.listening.shortcutIncreaseVolume.context).toBe(true);
			expect(improvedTube.input.listening.shortcutIncreaseVolume.wheel).toBe(-1);
			for (const name of ['wheel', 'mousedown', 'contextmenu', 'mouseup']) {
				expect(win.listeners[name]).toHaveLength(1);
				expect(win.listeners[name][0].options).toEqual({ passive: false, capture: true });
			}
		});

		test('fires while the right mouse button is held: up raises, down lowers the volume', () => {
			const { fire, getVolume } = load({ ...RIGHT_WHEEL_VOLUME });

			fire('mousedown');
			fire('wheel', { deltaY: -100 });
			expect(getVolume()).toBe(55);
			fire('wheel', { deltaY: 100 });
			fire('wheel', { deltaY: 100 });
			expect(getVolume()).toBe(45);
		});

		test('the amount follows the "Step" setting (shortcuts_volume_step)', () => {
			const { fire, getVolume } = load({ ...RIGHT_WHEEL_VOLUME, shortcuts_volume_step: 12 });

			fire('mousedown');
			fire('wheel', { deltaY: -100 });
			expect(getVolume()).toBe(62);
		});

		test('the wheel event is cancelled so the page does not scroll', () => {
			const { fire } = load({ ...RIGHT_WHEEL_VOLUME });

			fire('mousedown');
			const wheel = fire('wheel', { deltaY: -100 });
			expect(wheel.preventDefault).toHaveBeenCalledTimes(1);
			expect(wheel.stopPropagation).toHaveBeenCalledTimes(1);
		});

		test('does not fire without the right mouse button', () => {
			const { fire, getVolume } = load({ ...RIGHT_WHEEL_VOLUME });

			const wheel = fire('wheel', { deltaY: -100, buttons: 0 });
			expect(getVolume()).toBe(50);
			expect(wheel.preventDefault).not.toHaveBeenCalled();
		});

		test('does not fire when the pointer is not over the player', () => {
			const { fire, outside, getVolume } = load({ ...RIGHT_WHEEL_VOLUME });

			fire('mousedown', { target: outside });
			const wheel = fire('wheel', { deltaY: -100, target: outside });
			expect(getVolume()).toBe(50);
			expect(wheel.preventDefault).not.toHaveBeenCalled();
		});

		test('"wheel" and "right mouse button + wheel" are different shortcuts', () => {
			// wheel up alone raises, right mouse button + wheel up lowers
			const { fire, getVolume } = load({
				shortcut_increase_volume: { wheel: -1 },
				shortcut_decrease_volume: { wheel: -1, context: true }
			});

			fire('wheel', { deltaY: -100, buttons: 0 });
			expect(getVolume()).toBe(55);

			fire('mousedown');
			fire('wheel', { deltaY: -100 });
			expect(getVolume()).toBe(50);
		});

		test('combines with a modifier key: Ctrl + right mouse button + wheel', () => {
			const { fire, getVolume } = load({ shortcut_increase_volume: { ctrl: true, wheel: -1, context: true } });

			fire('mousedown');
			fire('wheel', { deltaY: -100 });
			expect(getVolume()).toBe(50);
			fire('wheel', { deltaY: -100, ctrlKey: true });
			expect(getVolume()).toBe(55);
		});

		test('a key shortcut still works right after one with the right mouse button', () => {
			const { fire, getVolume } = load({
				shortcut_increase_volume: { keys: { 38: { key: 'ArrowUp' } } },
				shortcut_decrease_volume: { wheel: 1, context: true }
			});

			fire('mousedown');
			fire('wheel', { deltaY: 100 });
			expect(getVolume()).toBe(45);
			fire('keydown', { keyCode: 38, code: 'ArrowUp', button: undefined, buttons: undefined });
			expect(getVolume()).toBe(50);
		});
	});

	describe("context menu, 'contextmenu' after 'mouseup' (Windows)", () => {
		test('suppressed after a shortcut with the right mouse button', () => {
			const { fire, video, runTimers } = load({ ...RIGHT_WHEEL_VOLUME });

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
			const { fire, video, runTimers } = load({ ...RIGHT_WHEEL_VOLUME });

			fire('mousedown');
			fire('mouseup', { buttons: 0 });
			const contextmenu = fire('contextmenu', { buttons: 0 });
			runTimers();

			expect(contextmenu.preventDefault).not.toHaveBeenCalled();
			expect(contextmenu.stopPropagation).not.toHaveBeenCalled();
			expect(video.dispatchEvent).not.toHaveBeenCalled();
		});

		test('the right-click after a shortcut opens the menu again', () => {
			const { fire } = load({ ...RIGHT_WHEEL_VOLUME });

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
		test('held back while the button is down, never shown after a shortcut', () => {
			const { fire, video, runTimers } = load({ ...RIGHT_WHEEL_VOLUME });

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
			const { fire, video, runTimers } = load({ ...RIGHT_WHEEL_VOLUME });

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
			const { fire, outside, video, runTimers } = load({ ...RIGHT_WHEEL_VOLUME });

			fire('mousedown', { target: outside });
			const contextmenu = fire('contextmenu', { target: outside });
			fire('mouseup', { target: outside, buttons: 0 });
			runTimers();

			expect(contextmenu.preventDefault).not.toHaveBeenCalled();
			expect(video.dispatchEvent).not.toHaveBeenCalled();
		});
	});

	describe('nothing changes for people who do not use it', () => {
		// only a keyboard shortcut is set
		const KEYS_ONLY = { shortcut_increase_volume: { keys: { 38: { key: 'ArrowUp' } } } };

		test("right-clicks are never touched, 'contextmenu' after 'mouseup'", () => {
			const { fire, video, runTimers } = load({ ...KEYS_ONLY });

			fire('mousedown');
			fire('wheel', { deltaY: -100 });
			fire('mouseup', { buttons: 0 });
			const contextmenu = fire('contextmenu', { buttons: 0 });
			runTimers();

			expect(contextmenu.preventDefault).not.toHaveBeenCalled();
			expect(video.dispatchEvent).not.toHaveBeenCalled();
		});

		test("right-clicks are never touched, 'contextmenu' right after 'mousedown'", () => {
			const { fire, video, runTimers } = load({ ...KEYS_ONLY });

			fire('mousedown');
			const contextmenu = fire('contextmenu');
			fire('mouseup', { buttons: 0 });
			runTimers();

			expect(contextmenu.preventDefault).not.toHaveBeenCalled();
			expect(contextmenu.stopPropagation).not.toHaveBeenCalled();
			expect(video.dispatchEvent).not.toHaveBeenCalled();
		});

		test('scrolling with the right mouse button held does nothing', () => {
			const { fire, getVolume } = load({ ...KEYS_ONLY });

			fire('mousedown');
			const wheel = fire('wheel', { deltaY: -100 });
			expect(getVolume()).toBe(50);
			expect(wheel.preventDefault).not.toHaveBeenCalled();
		});
	});

	test('a context menu opened without the right mouse button is left alone (keyboard, Ctrl+click)', () => {
		const { fire } = load({ ...RIGHT_WHEEL_VOLUME });

		const contextmenu = fire('contextmenu', { button: 0, buttons: 0 });
		expect(contextmenu.preventDefault).not.toHaveBeenCalled();
	});
});

describe('Volume text', () => {
	test('shown as a whole number, as the "volume" status, for one second', () => {
		const { improvedTube, fire } = load({ ...RIGHT_WHEEL_VOLUME });

		fire('mousedown');
		fire('wheel', { deltaY: -100 });
		expect(improvedTube.showStatus).toHaveBeenLastCalledWith('55', 'volume', 1000);
	});

	test('a fractional volume is rounded, never shown with decimals', () => {
		const { improvedTube, fire, getVolume } = load({ ...RIGHT_WHEEL_VOLUME, shortcuts_volume_step: 2.5 });

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
