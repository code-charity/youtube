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
		matches: jest.fn(() => false),
		_inPlayer: inPlayer
	};
}

function makeSurfaceNode(selectorMatch) {
	return {
		matches: jest.fn((selector) => selector.split(',').map((item) => item.trim()).includes(selectorMatch))
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
		composedPath: () => [target],
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
		composedPath: () => [target],
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
		const surface = makeSurfaceNode('.html5-video-player');
		listeners.touchstart(makeTouchEvent(target, { x: 100, y: 100 }, { composedPath: () => [target, surface] }));
		const moveEvent = makeTouchEvent(target, { x: 106, y: 132 }, { composedPath: () => [target, surface] });

		listeners.touchmove(moveEvent);

		expect(moveEvent.preventDefault).toHaveBeenCalled();
		expect(improvedTube.playerDisableTouchscreenMiniPlayerSwipeState.blocked).toBe(true);
	});

	test('does not block player control interactions', () => {
		const { improvedTube, listeners } = loadFeature();
		improvedTube.playerDisableTouchscreenMiniPlayerSwipe();

		const controlTarget = makeNode({ inPlayer: true, closestResult: {} });
		const surface = makeSurfaceNode('.html5-video-player');
		const buttonNode = makeSurfaceNode('button');
		listeners.touchstart(makeTouchEvent(controlTarget, { x: 100, y: 100 }, { composedPath: () => [controlTarget, buttonNode, surface] }));
		const moveEvent = makeTouchEvent(controlTarget, { x: 100, y: 140 }, { composedPath: () => [controlTarget, buttonNode, surface] });

		listeners.touchmove(moveEvent);

		expect(moveEvent.preventDefault).not.toHaveBeenCalled();
		expect(improvedTube.playerDisableTouchscreenMiniPlayerSwipeState).toBe(null);
	});

	test('blocks downward pointer gestures too', () => {
		const { improvedTube, listeners } = loadFeature();
		improvedTube.playerDisableTouchscreenMiniPlayerSwipe();

		const target = makeNode({ inPlayer: true });
		const surface = makeSurfaceNode('.html5-video-player');
		listeners.pointerdown(makePointerEvent(target, { x: 80, y: 80 }, { composedPath: () => [target, surface] }));
		const moveEvent = makePointerEvent(target, { x: 82, y: 108 }, { composedPath: () => [target, surface] });

		listeners.pointermove(moveEvent);

		expect(moveEvent.preventDefault).toHaveBeenCalled();
		expect(improvedTube.playerDisableTouchscreenMiniPlayerSwipeState.blocked).toBe(true);
	});

	test('keeps blocking when move target drifts outside the player after starting inside', () => {
		const { improvedTube, listeners } = loadFeature();
		improvedTube.playerDisableTouchscreenMiniPlayerSwipe();

		const startTarget = makeNode({ inPlayer: true });
		const moveTarget = makeNode({ inPlayer: false });
		const surface = makeSurfaceNode('.html5-video-player');
		listeners.touchstart(makeTouchEvent(startTarget, { x: 100, y: 100 }, { composedPath: () => [startTarget, surface] }));
		const moveEvent = makeTouchEvent(moveTarget, { x: 104, y: 132 }, { composedPath: () => [moveTarget, surface] });

		listeners.touchmove(moveEvent);

		expect(moveEvent.preventDefault).toHaveBeenCalled();
		expect(improvedTube.playerDisableTouchscreenMiniPlayerSwipeState.blocked).toBe(true);
	});
});
