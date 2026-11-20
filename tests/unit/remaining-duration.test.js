const fs = require('fs');
const path = require('path');
const vm = require('vm');

function media () {
	const listeners = new Map();
	return {
		currentTime: 300,
		duration: 3600,
		playbackRate: 1,
		addEventListener: jest.fn((name, listener) => {
			if (!listeners.has(name)) listeners.set(name, new Set());
			listeners.get(name).add(listener);
		}),
		removeEventListener: jest.fn((name, listener) => listeners.get(name)?.delete(listener)),
		emit: name => [...(listeners.get(name) || [])].forEach(listener => listener()),
		listenerCount: () => [...listeners.values()].reduce((count, set) => count + set.size, 0)
	};
}

function load () {
	const listeners = new Map();
	const nodes = new Map();
	const spans = [];
	const state = { video: media(), live: false };
	const durationEl = {
		textContent: '1:00:00',
		insertAdjacentElement: jest.fn((position, element) => spans.push(element))
	};
	const document = {
		addEventListener (name, listener) {
			if (!listeners.has(name)) listeners.set(name, []);
			listeners.get(name).push(listener);
		},
		dispatchEvent (event) {
			for (const listener of listeners.get(event.type) || []) listener.call(document, event);
		},
		createElement: () => ({ style: {}, remove () { this.removed = true; } }),
		querySelector: selector => nodes.get(selector) || null,
		documentElement: {
			appendChild: element => nodes.set('#' + element.id, element),
			removeAttribute: jest.fn(),
			setAttribute: jest.fn(),
			hasAttribute: () => false
		}
	};
	const player = {
		getCurrentTime: () => state.video.currentTime,
		getDuration: () => state.video.duration,
		querySelector: selector => {
			if (selector === '.ytp-time-duration') return durationEl;
			if (selector.includes('live-badge')) return state.live ? {} : null;
			if (selector === '.ytp-time-remaining-duration') return spans.find(span => !span.removed) || null;
			return null;
		}
	};
	const context = vm.createContext({
		document, CustomEvent, queueMicrotask, localStorage: {}, console,
		window: { addEventListener: jest.fn() }, setTimeout: jest.fn(), clearTimeout: jest.fn()
	});
	for (const file of ['js&css/web-accessible/core.js', 'js&css/web-accessible/www.youtube.com/appearance.js']) {
		vm.runInContext(fs.readFileSync(path.join(__dirname, '../..', file), 'utf8'), context, { filename: file });
	}
	const IT = context.ImprovedTube;
	IT.elements.player = player;
	IT.elements.video = state.video;
	IT.storage = { player_remaining_duration: true };
	return {
		IT, state, durationEl, document, spans,
		text: () => player.querySelector('.ytp-time-remaining-duration')?.textContent,
		setting (key, value) {
			nodes.set('#it-messages-from-extension', {
				textContent: JSON.stringify({ action: 'storage-changed', key, camelizedKey: key.replace(/_(.)/g, (_, letter) => letter.toUpperCase()), value })
			});
			document.dispatchEvent(new CustomEvent('it-message-from-extension'));
		}
	};
}

describe('Remaining video duration (#4100, #4053, #941)', () => {
	test.each([
		[59.9, 1, '00:59'], [3600, 2, '30:00'], [1800, 0.25, '02:00:00'],
		[90061, 1, '25:01:01'], [-10, 2, '00:00'], [61.9, 2, '00:30']
	])('formats %s seconds at %sx without wrapping or dropping hours', (seconds, speed, expected) => {
		const { IT, state } = load();
		IT.storage.duration_with_speed = true;
		state.video.playbackRate = speed;
		expect(IT.formatSecond(seconds)).toBe(expected);
	});

	test.each([undefined, 0, -1, NaN, Infinity])('falls back to normal time for invalid rate %s', rate => {
		const { IT, state } = load();
		IT.storage.duration_with_speed = true;
		state.video.playbackRate = rate;
		expect(IT.formatSecond(61)).toBe('01:01');
	});

	test.each([NaN, Infinity, -Infinity, undefined])('omits nonfinite duration %s', seconds => {
		expect(load().IT.formatSecond(seconds)).toBe('');
	});

	test('adds a separate label and preserves the native duration text', () => {
		const { IT, durationEl, text } = load();
		IT.playerRemainingDuration();
		expect(text()).toBe('  (-55:00)');
		expect(durationEl.textContent).toBe('1:00:00');
		expect(durationEl.insertAdjacentElement).toHaveBeenCalledWith('afterend', expect.objectContaining({ className: 'ytp-time-remaining-duration' }));
	});

	test('updates on seek, playback and rate changes without duplicating labels or listeners', () => {
		const { IT, state, spans, text } = load();
		IT.storage.duration_with_speed = true;
		IT.playerRemainingDuration();
		state.video.currentTime = 1200;
		state.video.emit('timeupdate');
		expect(text()).toBe('  (-40:00)');
		state.video.playbackRate = 2;
		state.video.emit('ratechange');
		expect(text()).toBe('  (-20:00)');
		state.video.currentTime = 3000;
		state.video.emit('seeking');
		expect(text()).toBe('  (-05:00)');
		expect(spans).toHaveLength(1);
		expect(state.video.listenerCount()).toBe(5);
	});

	test('reacts to speed and original-time options through the production settings receiver', () => {
		const { IT, state, setting, text } = load();
		IT.playerRemainingDuration();
		state.video.playbackRate = 2;
		setting('duration_with_speed', true);
		expect(text()).toBe('  (-27:30)');
		setting('remaining_duration_show_original', true);
		expect(text()).toBe('  (-27:30 / -55:00)');
		setting('duration_with_speed', false);
		expect(text()).toBe('  (-55:00)');
	});

	test.each([false, undefined])('removes labels and media listeners when the setting becomes %s', value => {
		const { IT, state, setting, text } = load();
		IT.playerRemainingDuration();
		setting('player_remaining_duration', value);
		expect(text()).toBeUndefined();
		expect(state.video.listenerCount()).toBe(0);
		state.video.emit('timeupdate');
		expect(text()).toBeUndefined();
	});

	test('cleans up on navigation and binds the replacement video', () => {
		const { IT, state, document, text } = load();
		IT.playerRemainingDuration();
		const previous = state.video;
		document.dispatchEvent(new CustomEvent('yt-navigate-start'));
		expect(previous.listenerCount()).toBe(0);
		expect(text()).toBeUndefined();
		state.video = media();
		state.video.duration = 60;
		state.video.currentTime = 5;
		IT.elements.video = state.video;
		IT.playerRemainingDuration();
		expect(text()).toBe('  (-00:55)');
		expect(state.video.listenerCount()).toBe(5);
	});

	test('hides stale time at the live head or while metadata is unavailable', () => {
		const { IT, state, text } = load();
		IT.playerRemainingDuration();
		state.live = true;
		state.video.emit('timeupdate');
		expect(text()).toBeUndefined();
		state.live = false;
		state.video.emit('timeupdate');
		expect(text()).toBe('  (-55:00)');
		state.video.duration = NaN;
		state.video.emit('emptied');
		expect(text()).toBeUndefined();
	});
});
