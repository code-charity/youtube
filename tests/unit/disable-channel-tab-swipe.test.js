const fs = require('fs');
const path = require('path');
const vm = require('vm');

const CHANNEL_SRC = path.join(
	__dirname,
	'../../js&css/web-accessible/www.youtube.com/channel.js'
);

function makeNode({ parent = null, closestResult = null } = {}) {
	return {
		nodeType: 1,
		parentElement: parent,
		closest: jest.fn(() => closestResult),
		matches: jest.fn(() => false)
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
		documentElement: { dataset: { pageType: 'channel' } },
		addEventListener: jest.fn((type, handler) => {
			listeners[type] = handler;
		}),
		removeEventListener: jest.fn()
	};
	const improvedTube = {
		storage: { channel_disable_tab_swipe: true }
	};

	const sandbox = {
		ImprovedTube: improvedTube,
		document: documentMock,
		window: {
			addEventListener: jest.fn(),
			removeEventListener: jest.fn()
		},
		location: { pathname: '/@demo/videos' },
		console
	};

	vm.createContext(sandbox);
	vm.runInContext(fs.readFileSync(CHANNEL_SRC, 'utf8'), sandbox);

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
		pointerId: 9,
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

describe('Disable channel tab swipe follow-up (#4127)', () => {
	test('registers listeners only on channel pages', () => {
		const { improvedTube, documentMock } = loadFeature();

		improvedTube.channelDisableTabSwipe();

		expect(documentMock.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), expect.objectContaining({ capture: true, passive: false }));
		expect(documentMock.addEventListener).toHaveBeenCalledWith('pointerdown', expect.any(Function), expect.objectContaining({ capture: true, passive: false }));
	});

	test('blocks horizontal tab swipe', () => {
		const { improvedTube, listeners } = loadFeature();
		improvedTube.channelDisableTabSwipe();

		const target = makeNode();
		const surface = makeSurfaceNode('ytd-rich-grid-renderer');
		listeners.touchstart(makeTouchEvent(target, { x: 100, y: 100 }, { composedPath: () => [target, surface] }));
		const moveEvent = makeTouchEvent(target, { x: 134, y: 106 }, { composedPath: () => [target, surface] });

		listeners.touchmove(moveEvent);

		expect(moveEvent.preventDefault).toHaveBeenCalled();
		expect(improvedTube.channelDisableTabSwipeState.blocked).toBe(true);
	});

	test('allows vertical movement through the channel content area', () => {
		const { improvedTube, listeners } = loadFeature();
		improvedTube.channelDisableTabSwipe();

		const target = makeNode();
		const surface = makeSurfaceNode('ytd-rich-grid-renderer');
		listeners.touchstart(makeTouchEvent(target, { x: 100, y: 100 }, { composedPath: () => [target, surface] }));
		const moveEvent = makeTouchEvent(target, { x: 104, y: 138 }, { composedPath: () => [target, surface] });

		listeners.touchmove(moveEvent);

		expect(moveEvent.preventDefault).not.toHaveBeenCalled();
		expect(improvedTube.channelDisableTabSwipeState.blocked).toBe(false);
	});

	test('blocks horizontal pointer swipe too', () => {
		const { improvedTube, listeners } = loadFeature();
		improvedTube.channelDisableTabSwipe();

		const target = makeNode();
		const surface = makeSurfaceNode('ytd-rich-grid-renderer');
		listeners.pointerdown(makePointerEvent(target, { x: 100, y: 100 }, { composedPath: () => [target, surface] }));
		const moveEvent = makePointerEvent(target, { x: 128, y: 104 }, { composedPath: () => [target, surface] });

		listeners.pointermove(moveEvent);

		expect(moveEvent.preventDefault).toHaveBeenCalled();
		expect(improvedTube.channelDisableTabSwipeState.blocked).toBe(true);
	});

	test('keeps blocking when move target drifts outside the tab strip after starting inside', () => {
		const { improvedTube, listeners } = loadFeature();
		improvedTube.channelDisableTabSwipe();

		const surface = makeSurfaceNode('ytd-rich-grid-renderer');
		const startTarget = makeNode();
		const moveTarget = makeNode();
		listeners.touchstart(makeTouchEvent(startTarget, { x: 100, y: 100 }, { composedPath: () => [startTarget, surface] }));
		const moveEvent = makeTouchEvent(moveTarget, { x: 136, y: 104 }, { composedPath: () => [moveTarget, surface] });

		listeners.touchmove(moveEvent);

		expect(moveEvent.preventDefault).toHaveBeenCalled();
		expect(improvedTube.channelDisableTabSwipeState.blocked).toBe(true);
	});
});
