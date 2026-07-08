const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PLAYER_SRC = path.join(
	__dirname,
	'../../js&css/web-accessible/www.youtube.com/player.js'
);

function makeClassList(names = []) {
	const set = new Set(names);
	return {
		contains: (name) => set.has(name)
	};
}

function makeNode({ parent = null, closestResult = null, inPlayer = false } = {}) {
	return {
		nodeType: 1,
		parentElement: parent,
		closest: jest.fn(() => closestResult),
		_inPlayer: inPlayer
	};
}

function loadFeature() {
	const listeners = {};
	const documentMock = {
		addEventListener: jest.fn((type, handler) => {
			listeners[type] = handler;
		}),
		removeEventListener: jest.fn()
	};
	const playerElement = {
		classList: makeClassList(),
		contains: (node) => Boolean(node && node._inPlayer)
	};
	const improvedTube = {
		storage: { player_disable_touchscreen_mini_player_swipe: true },
		elements: { player: playerElement }
	};

	const sandbox = {
		ImprovedTube: improvedTube,
		document: documentMock,
		window: {
			addEventListener: jest.fn()
		},
		setTimeout: jest.fn(() => 0),
		clearTimeout: jest.fn(),
		console
	};

	vm.createContext(sandbox);
	vm.runInContext(fs.readFileSync(PLAYER_SRC, 'utf8'), sandbox);

	return { improvedTube, listeners, documentMock };
}

function makeTouchEvent(target, coords, extra = {}) {
	return {
		target,
		touches: [{ clientX: coords.x, clientY: coords.y }],
		changedTouches: [{ clientX: coords.x, clientY: coords.y }],
		cancelable: true,
		preventDefault: jest.fn(),
		stopPropagation: jest.fn(),
		stopImmediatePropagation: jest.fn(),
		...extra
	};
}

function makePointerEvent(target, coords, extra = {}) {
	return {
		target,
		pointerId: 7,
		pointerType: 'touch',
		clientX: coords.x,
		clientY: coords.y,
		cancelable: true,
		preventDefault: jest.fn(),
		stopPropagation: jest.fn(),
		stopImmediatePropagation: jest.fn(),
		...extra
	};
}

describe('Disable touchscreen mini-player swipe (#4127)', () => {
	test('registers touch and pointer listeners when enabled', () => {
		const { improvedTube, documentMock } = loadFeature();

		improvedTube.playerDisableTouchscreenMiniPlayerSwipe();

		expect(documentMock.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), expect.objectContaining({ capture: true, passive: false }));
		expect(documentMock.addEventListener).toHaveBeenCalledWith('pointerdown', expect.any(Function), expect.objectContaining({ capture: true, passive: false }));
	});

	test('blocks downward swipe on the video surface', () => {
		const { improvedTube, listeners } = loadFeature();
		improvedTube.playerDisableTouchscreenMiniPlayerSwipe();

		const target = makeNode({ inPlayer: true });
		listeners.touchstart(makeTouchEvent(target, { x: 100, y: 100 }));
		const moveEvent = makeTouchEvent(target, { x: 106, y: 132 });

		listeners.touchmove(moveEvent);

		expect(moveEvent.preventDefault).toHaveBeenCalled();
		expect(improvedTube.playerDisableTouchscreenMiniPlayerSwipeState.blocked).toBe(true);
	});

	test('does not block player control interactions', () => {
		const { improvedTube, listeners } = loadFeature();
		improvedTube.playerDisableTouchscreenMiniPlayerSwipe();

		const controlTarget = makeNode({ inPlayer: true, closestResult: {} });
		listeners.touchstart(makeTouchEvent(controlTarget, { x: 100, y: 100 }));
		const moveEvent = makeTouchEvent(controlTarget, { x: 100, y: 140 });

		listeners.touchmove(moveEvent);

		expect(moveEvent.preventDefault).not.toHaveBeenCalled();
		expect(improvedTube.playerDisableTouchscreenMiniPlayerSwipeState).toBe(null);
	});

	test('blocks downward pointer gestures too', () => {
		const { improvedTube, listeners } = loadFeature();
		improvedTube.playerDisableTouchscreenMiniPlayerSwipe();

		const target = makeNode({ inPlayer: true });
		listeners.pointerdown(makePointerEvent(target, { x: 80, y: 80 }));
		const moveEvent = makePointerEvent(target, { x: 82, y: 108 });

		listeners.pointermove(moveEvent);

		expect(moveEvent.preventDefault).toHaveBeenCalled();
		expect(improvedTube.playerDisableTouchscreenMiniPlayerSwipeState.blocked).toBe(true);
	});
});
