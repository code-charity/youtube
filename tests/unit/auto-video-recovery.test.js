const fs = require('fs');
const path = require('path');
const vm = require('vm');

function extractAutoVideoRecovery() {
	const source = fs.readFileSync(
		path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.js'),
		'utf8'
	);
	const start = source.indexOf('extension.features.autoVideoRecovery = function () {');
	const openingBrace = source.indexOf('{', start);
	let depth = 0;

	if (start < 0 || openingBrace < 0) {
		throw new Error('Auto video recovery function was not found');
	}

	for (let index = openingBrace; index < source.length; index++) {
		if (source[index] === '{') depth++;
		if (source[index] === '}' && --depth === 0) {
			return source.slice(start, index + 2);
		}
	}

	throw new Error('Auto video recovery function is not balanced');
}

class FakeEventTarget {
	constructor() {
		this.listeners = {};
	}

	addEventListener(type, listener) {
		(this.listeners[type] ||= []).push(listener);
	}

	removeEventListener(type, listener) {
		this.listeners[type] = (this.listeners[type] || []).filter(item => item !== listener);
	}

	emit(type) {
		for (const listener of [...(this.listeners[type] || [])]) {
			listener();
		}
	}
}

class FakeVideo extends FakeEventTarget {
	constructor() {
		super();
		this.currentTime = 42;
		this.duration = 200;
		this.ended = false;
		this.loadCalls = 0;
		this.paused = false;
		this.playCalls = 0;
		this.throwOnPlay = false;
	}

	load() {
		this.loadCalls++;
	}

	play() {
		this.paused = false;
		this.playCalls++;
		if (this.throwOnPlay) throw new Error('temporary playback failure');
		return Promise.resolve();
	}
}

describe('auto video recovery', () => {
	test('does not run during initialization unless the feature is enabled', () => {
		const initSource = fs.readFileSync(
			path.join(__dirname, '../../js&css/extension/init.js'),
			'utf8'
		);

		expect(initSource).toContain(
			"if (extension.storage.get('auto_video_recovery') === true) { extension.features.autoVideoRecovery(); }"
		);
		expect(initSource).not.toMatch(/^\s*extension\.features\.autoVideoRecovery\(\);\s*$/m);
	});

	test('ignores normal startup buffering and recovers only a video that stopped after progress', () => {
		let now = 1;
		let nextTimerId = 1;
		const timers = new Map();
		const video = new FakeVideo();
		const documentTarget = new FakeEventTarget();
		const windowTarget = new FakeEventTarget();

		function setTimer(callback, delay) {
			const id = nextTimerId++;
			timers.set(id, {callback, at: now + delay});
			return id;
		}

		function advance(ms) {
			now += ms;
			let next;

			while ((next = [...timers.entries()]
				.filter(([, timer]) => timer.at <= now)
				.sort((a, b) => a[1].at - b[1].at)[0])) {
				timers.delete(next[0]);
				next[1].callback();
			}
		}

		class FakeMutationObserver {
			constructor(callback) {
				this.callback = callback;
			}

			disconnect() {}
			observe() {}
		}

		const context = {
			Date: {now: () => now},
			Math,
			MutationObserver: FakeMutationObserver,
			Number,
			Promise,
			clearTimeout: id => timers.delete(id),
			document: Object.assign(documentTarget, {
				documentElement: {},
				querySelector: () => video
			}),
			extension: {features: {}, storage: {get: () => context.enabled}},
			navigator: {onLine: true},
			setTimeout: setTimer,
			window: windowTarget
		};

		context.enabled = true;
		vm.createContext(context);
		vm.runInContext(extractAutoVideoRecovery(), context);
		context.extension.features.autoVideoRecovery();

		const state = context.extension.features.autoVideoRecovery.state;
		expect(state.video).toBe(video);

		video.emit('waiting');
		advance(10000);
		expect(video.playCalls).toBe(0);

		video.currentTime += 0.5;
		video.emit('timeupdate');
		video.emit('waiting');
		video.throwOnPlay = true;
		advance(8000);
		expect(video.playCalls).toBe(1);
		expect(video.loadCalls).toBe(0);

		video.throwOnPlay = false;
		advance(2000);
		expect(video.playCalls).toBe(2);
		video.emit('playing');
		advance(2500);
		expect(video.loadCalls).toBe(0);

		video.emit('error');
		video.emit('pause');
		expect(state.shouldResume).toBe(true);

		advance(1001);
		video.emit('pause');
		expect(state.shouldResume).toBe(false);

		context.enabled = false;
		context.extension.features.autoVideoRecovery();
		expect(context.extension.features.autoVideoRecovery.state).toBeNull();
	});

	test('waits until media can play and does not log expected recovery rejections', () => {
		const source = fs.readFileSync(
			path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.js'),
			'utf8'
		);

		expect(source.includes("video.addEventListener('canplay', finish)")).toBe(true);
		expect(source.includes("console.warn('[ImprovedTube] Auto recovery")).toBe(false);
		expect(source.includes('!state.hasPlaybackProgress')).toBe(true);
		expect(source.includes('state.attempts >= RELOAD_AFTER_ATTEMPTS')).toBe(true);
	});
});
