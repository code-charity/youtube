/**
 * Unit tests for Forced Theater Mode (issue #4431):
 *
 * Root causes of alternating ON -> OFF -> ON -> OFF theater behavior across
 * video navigations and setting toggles:
 * 1. forcedTheaterMode() scheduled button.click() after 100ms without
 *    re-checking theater state inside the timeout. When YouTube applied wide=1
 *    async during navigation, button.click() toggled theater back OFF.
 * 2. Pending timers across initPlayer(), retries, yt-page-data-updated, and
 *    storage-changed were never cancelled, allowing overlapping double clicks.
 * 3. core.js set ytd_watch.theater = false before clicking button when
 *    disabling forced_theater_mode, double-toggling theater back ON.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const APPEARANCE_SRC = path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/appearance.js');
const CORE_SRC = path.join(__dirname, '../../js&css/web-accessible/core.js');
const FUNCTIONS_SRC = path.join(__dirname, '../../js&css/web-accessible/functions.js');
const INIT_SRC = path.join(__dirname, '../../js&css/web-accessible/init.js');

function extractSlice (source, startMarker, endMarker) {
	const start = source.indexOf(startMarker);
	const end = endMarker ? source.indexOf(endMarker, start) : source.length;
	if (start < 0 || end < 0) {
		throw new Error(`Could not extract slice from ${startMarker}`);
	}
	return source.slice(start, end);
}

function createWatchElements ({ initialTheater = false, attributeOnly = false, fullscreen = false, connected = true } = {}) {
	let theater = initialTheater;
	let buttonClicks = 0;

	const button = {
		click: jest.fn(() => {
			buttonClicks++;
			theater = !theater;
		})
	};

	const ytdWatch = {
		isConnected: connected,
		get theater () {
			return attributeOnly ? undefined : theater;
		},
		set theater (val) {
			theater = Boolean(val);
		},
		hasAttribute: jest.fn((attr) => {
			if (attr === 'theater') return theater;
			if (attr === 'fullscreen') return fullscreen;
			return false;
		})
	};

	const player = {
		isConnected: connected,
		classList: {
			contains: jest.fn((cls) => cls === 'ytp-fullscreen' && fullscreen)
		},
		querySelector: jest.fn((sel) => (sel === 'button.ytp-size-button' ? button : null))
	};

	return {
		ytdWatch,
		player,
		button,
		getTheater: () => theater,
		setTheater: (val) => { theater = val; },
		getClickCount: () => buttonClicks
	};
}

function loadForcedTheaterHarness ({
	forcedTheaterMode = true,
	pageType = 'video',
	initialTheater = false,
	attributeOnly = false,
	fullscreen = false,
	attachElements = true
} = {}) {
	jest.useFakeTimers();

	const appearanceSrc = fs.readFileSync(APPEARANCE_SRC, 'utf8');
	const coreSrc = fs.readFileSync(CORE_SRC, 'utf8');

	const slice = extractSlice(
		appearanceSrc,
		'ImprovedTube._clearForcedTheaterTimers = function',
		'ImprovedTube.playerHdThumbnail = function'
	);

	const watch = createWatchElements({ initialTheater, attributeOnly, fullscreen });
	const win = new EventTarget();
	const doc = {
		cookie: '',
		fullscreenElement: null,
		documentElement: { dataset: { pageType } },
		querySelector: jest.fn((sel) => (sel === 'ytd-watch-flexy' && attachElements ? watch.ytdWatch : null)),
		getElementById: jest.fn((id) => (id === 'movie_player' && attachElements ? watch.player : null))
	};

	const sandbox = {
		document: doc,
		window: win,
		setTimeout,
		clearTimeout,
		console,
		ImprovedTube: {
			storage: { forced_theater_mode: forcedTheaterMode },
			elements: attachElements
				? { ytd_watch: watch.ytdWatch, player: watch.player }
				: {}
		}
	};

	vm.createContext(sandbox);
	vm.runInContext(slice, sandbox);

	const caseSlice = extractSlice(
		coreSrc,
		"case 'forcedTheaterMode':",
		"case 'playerScreenshotButton':"
	);

	function dispatchStorageChanged (value) {
		sandbox.ImprovedTube.storage.forced_theater_mode = value;
		const fn = new vm.Script(`(function (ImprovedTube) { switch ('forcedTheaterMode') { ${caseSlice} } })`);
		fn.runInContext(sandbox)(sandbox.ImprovedTube);
		if (sandbox.ImprovedTube.forcedTheaterMode) {
			sandbox.ImprovedTube.forcedTheaterMode();
		}
	}

	return {
		ImprovedTube: sandbox.ImprovedTube,
		doc,
		watch,
		dispatchStorageChanged
	};
}

describe('Forced Theater Mode race fixes (issue #4431)', () => {
	afterEach(() => {
		jest.useRealTimers();
	});

	test('enables theater mode once when initially off on a video page', () => {
		const { ImprovedTube, doc, watch } = loadForcedTheaterHarness({ initialTheater: false });

		ImprovedTube.forcedTheaterMode();
		expect(doc.cookie).toContain('wide=1');
		expect(watch.getClickCount()).toBe(0);

		jest.advanceTimersByTime(100);
		expect(watch.getClickCount()).toBe(1);
		expect(watch.getTheater()).toBe(true);
	});

	test('does NOT toggle theater OFF if YouTube enables theater during the 100ms wait', () => {
		const { ImprovedTube, watch } = loadForcedTheaterHarness({ initialTheater: false });

		ImprovedTube.forcedTheaterMode();

		// Simulate YouTube applying wide=1 cookie async before the 100ms click fires
		jest.advanceTimersByTime(50);
		watch.setTheater(true);

		jest.advanceTimersByTime(100);
		expect(watch.getClickCount()).toBe(0);
		expect(watch.getTheater()).toBe(true);
	});

	test('rapid consecutive calls across SPA navigations coalesce into a single click', () => {
		const { ImprovedTube, watch } = loadForcedTheaterHarness({ initialTheater: false });

		ImprovedTube.scheduleForcedTheaterMode();
		jest.advanceTimersByTime(80);
		ImprovedTube.scheduleForcedTheaterMode();
		jest.advanceTimersByTime(50);
		ImprovedTube.forcedTheaterMode();

		jest.advanceTimersByTime(500);
		expect(watch.getClickCount()).toBe(1);
		expect(watch.getTheater()).toBe(true);
	});

	test('does not click on subsequent videos when theater mode is already active', () => {
		const { ImprovedTube, watch } = loadForcedTheaterHarness({ initialTheater: true });

		for (let i = 0; i < 4; i++) {
			ImprovedTube.scheduleForcedTheaterMode();
			jest.advanceTimersByTime(300);
		}

		expect(watch.getClickCount()).toBe(0);
		expect(watch.getTheater()).toBe(true);
	});

	test('recognizes theater attribute when Polymer property is not set yet', () => {
		const { ImprovedTube, watch } = loadForcedTheaterHarness({
			initialTheater: true,
			attributeOnly: true
		});

		ImprovedTube.forcedTheaterMode();
		jest.advanceTimersByTime(200);

		expect(watch.getClickCount()).toBe(0);
	});

	test('does not click if forced_theater_mode is turned off before timer fires', () => {
		const { ImprovedTube, watch } = loadForcedTheaterHarness({ initialTheater: false });

		ImprovedTube.forcedTheaterMode();
		ImprovedTube.storage.forced_theater_mode = false;
		jest.advanceTimersByTime(200);

		expect(watch.getClickCount()).toBe(0);
		expect(watch.getTheater()).toBe(false);
	});

	test('does not act outside video pages (e.g., hidden ytd-watch-flexy on home page)', () => {
		const { ImprovedTube, watch } = loadForcedTheaterHarness({
			pageType: 'home',
			initialTheater: false
		});

		ImprovedTube.forcedTheaterMode();
		jest.advanceTimersByTime(300);

		expect(watch.getClickCount()).toBe(0);
	});

	test('does not click ytp-size-button while player is in fullscreen', () => {
		const { ImprovedTube, watch } = loadForcedTheaterHarness({
			initialTheater: false,
			fullscreen: true
		});

		ImprovedTube.forcedTheaterMode();
		jest.advanceTimersByTime(300);

		expect(watch.getClickCount()).toBe(0);
	});

	test('retries when watch/player elements appear lazily and enforces once ready', () => {
		const { ImprovedTube, watch, doc } = loadForcedTheaterHarness({
			attachElements: false,
			initialTheater: false
		});

		ImprovedTube.forcedTheaterMode();
		jest.advanceTimersByTime(250);
		expect(watch.getClickCount()).toBe(0);

		// Elements finish mounting in DOM
		doc.querySelector.mockImplementation((sel) => (sel === 'ytd-watch-flexy' ? watch.ytdWatch : null));
		doc.getElementById.mockImplementation((id) => (id === 'movie_player' ? watch.player : null));

		jest.advanceTimersByTime(350);
		expect(watch.getClickCount()).toBe(1);
		expect(watch.getTheater()).toBe(true);
	});

	test('ignores detached ImprovedTube.elements refs and queries live DOM elements', () => {
		const { ImprovedTube, watch, doc } = loadForcedTheaterHarness({ initialTheater: false });

		// Simulate detached stale references left over after DOM replacement
		const staleWatch = createWatchElements({ initialTheater: true, connected: false });
		ImprovedTube.elements.ytd_watch = staleWatch.ytdWatch;
		ImprovedTube.elements.player = staleWatch.player;

		doc.querySelector.mockImplementation((sel) => (sel === 'ytd-watch-flexy' ? watch.ytdWatch : null));
		doc.getElementById.mockImplementation((id) => (id === 'movie_player' ? watch.player : null));

		ImprovedTube.forcedTheaterMode();
		jest.advanceTimersByTime(150);

		expect(watch.getClickCount()).toBe(1);
		expect(staleWatch.getClickCount()).toBe(0);
	});

	test('disabling forced_theater_mode via storage-changed exits theater once without double-toggling', () => {
		const { watch, dispatchStorageChanged } = loadForcedTheaterHarness({
			forcedTheaterMode: true,
			initialTheater: true
		});

		dispatchStorageChanged(false);
		jest.advanceTimersByTime(200);

		expect(watch.getClickCount()).toBe(1);
		expect(watch.getTheater()).toBe(false);
	});

	test('re-enabling forced_theater_mode cancels pending disable timer', () => {
		const { watch, dispatchStorageChanged } = loadForcedTheaterHarness({
			forcedTheaterMode: true,
			initialTheater: true
		});

		dispatchStorageChanged(false);
		jest.advanceTimersByTime(50);
		dispatchStorageChanged(true);

		jest.advanceTimersByTime(300);
		expect(watch.getClickCount()).toBe(0);
		expect(watch.getTheater()).toBe(true);
	});

	test('initPlayer and yt-page-data-updated use scheduleForcedTheaterMode', () => {
		const functionsSrc = fs.readFileSync(FUNCTIONS_SRC, 'utf8');
		const initSrc = fs.readFileSync(INIT_SRC, 'utf8');

		expect(functionsSrc).toContain('ImprovedTube.scheduleForcedTheaterMode');
		expect(initSrc).toContain('ImprovedTube.scheduleForcedTheaterMode');
	});
});
