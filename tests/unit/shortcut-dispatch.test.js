const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.join(__dirname, '../..');
const sources = ['js&css/web-accessible/core.js', 'js&css/web-accessible/www.youtube.com/shortcuts.js'].map(file => ({
	file, code: fs.readFileSync(path.join(root, file), 'utf8')
}));
const sessions = [];

function load (storage = {}) {
	const errors = [];
	const virtualConsole = new VirtualConsole();
	virtualConsole.on('jsdomError', error => errors.push(error));
	const dom = new JSDOM('<!doctype html><html><body><div id="movie_player"><video></video></div></body></html>', {
		url: 'https://www.youtube.com/watch?v=abcdefghijk', runScripts: 'outside-only', virtualConsole
	});
	sessions.push(dom);
	const { window } = dom, { document } = window;
	// Browsers need not provide window.event. Dispatch must use the native listener argument.
	Object.defineProperty(window, 'event', { configurable: true, get () { throw new Error('Unexpected window.event access'); } });
	const add = jest.spyOn(window, 'addEventListener');
	const remove = jest.spyOn(window, 'removeEventListener');
	const context = dom.getInternalVMContext();
	for (const { file, code } of sources) vm.runInContext(code, context, { filename: file });
	const IT = window.ImprovedTube;
	const player = document.getElementById('movie_player');
	player.seekBy = jest.fn();
	IT.elements.player = player;
	IT.elements.video = player.querySelector('video');
	IT.storage = JSON.parse(JSON.stringify(storage));
	IT.shortcutsInit();
	const emit = (target, event) => {
		target.dispatchEvent(event);
		if (errors.length) throw errors.shift();
		return event;
	};
	const key = (type = 'keydown', code = 70, target = document.body, options = {}) => emit(target, new window.KeyboardEvent(type, {
		key: String.fromCharCode(code).toLowerCase(), code: 'Key' + String.fromCharCode(code), keyCode: code,
		bubbles: true, composed: true, cancelable: true, ...options
	}));
	const wheel = (deltaY, target = player, options = {}) => emit(target, new window.WheelEvent('wheel', {
		deltaY, bubbles: true, composed: true, cancelable: true, ...options
	}));
	const provider = document.createElement('div');
	provider.id = 'it-messages-from-extension';
	document.documentElement.appendChild(provider);
	const change = (name, value) => {
		provider.textContent = JSON.stringify({ action: 'storage-changed', key: name, camelizedKey: name.replace(/_(.)/g, (match, letter) => letter.toUpperCase()), value });
		emit(document, new window.CustomEvent('it-message-from-extension'));
	};
	return { window, document, IT, player, key, wheel, emit, change, add, remove, errors };
}

const forward = { shortcut_seek_forward: { keys: { 70: { key: 'f', code: 'KeyF' } } } };

afterEach(() => { sessions.splice(0).forEach(dom => dom.window.close()); });

describe('Shortcut dispatch through the real page core and native events', () => {
	test('leaves native events alone for unknown or removed shortcut actions', () => {
		const page = load({ shortcut_removed_action: { keys: {70: true} }, shortcut_removed_wheel: { wheel: 1 } });
		expect(page.key().defaultPrevented).toBe(false);
		expect(page.key('keyup').defaultPrevented).toBe(false);
		expect(page.wheel(100).defaultPrevented).toBe(false);
		expect(page.IT.input.cancelled.size).toBe(0);
		expect(page.player.seekBy).not.toHaveBeenCalled();
		page.change('shortcut_seek_forward', forward.shortcut_seek_forward);
		expect(page.key().defaultPrevented).toBe(true);
		expect(page.player.seekBy).toHaveBeenCalledTimes(1);
	});

	test('dispatches a configured key with no global event and cancels its keyup once', () => {
		const page = load(forward);
		expect(page.key().defaultPrevented).toBe(true);
		expect(page.player.seekBy.mock.calls).toEqual([[10]]);
		expect(page.IT.input.cancelled.has(70)).toBe(true);
		expect(page.key('keyup').defaultPrevented).toBe(true);
		expect(page.IT.input.pressed.keys.size).toBe(0);
		expect(page.IT.input.cancelled.size).toBe(0);
		expect(page.key('keyup').defaultPrevented).toBe(false);
	});

	test('preserves exact key-set and modifier matching without cancelling unrelated keys', () => {
		const page = load({ shortcut_seek_forward: { keys: { 70: true }, ctrl: true } });
		expect(page.key().defaultPrevented).toBe(false);
		page.key('keyup');
		page.key('keydown', 71, page.document.body, { ctrlKey: true });
		expect(page.key('keydown', 70, page.document.body, { ctrlKey: true }).defaultPrevented).toBe(false);
		page.key('keyup', 71, page.document.body, { ctrlKey: true });
		expect(page.key('keydown', 70, page.document.body, { ctrlKey: true }).defaultPrevented).toBe(true);
		expect(page.player.seekBy).toHaveBeenCalledTimes(1);
	});

	test('uses the wheel event for both directions, only over the player', () => {
		const page = load({ shortcut_seek_forward: { wheel: 1 }, shortcut_seek_backward: { wheel: -1 } });
		expect(page.wheel(100).defaultPrevented).toBe(true);
		expect(page.wheel(-100).defaultPrevented).toBe(true);
		expect(page.player.seekBy.mock.calls).toEqual([[10], [-10]]);
		expect(page.wheel(0).defaultPrevented).toBe(false);
		expect(page.wheel(100, page.document.body).defaultPrevented).toBe(false);
		page.IT.elements.player = null;
		expect(page.wheel(100).defaultPrevented).toBe(false);
		expect(page.player.seekBy).toHaveBeenCalledTimes(2);
	});

	test.each(['input', 'textarea', 'select'])('leaves key and wheel input in %s controls alone', tag => {
		const page = load({ ...forward, shortcut_seek_backward: { wheel: 1 } });
		const input = page.document.createElement(tag);
		page.player.appendChild(input);
		input.focus();
		expect(page.key('keydown', 70, input).defaultPrevented).toBe(false);
		expect(page.wheel(100, input).defaultPrevented).toBe(false);
		expect(page.player.seekBy).not.toHaveBeenCalled();
		expect(page.IT.input.pressed.keys.size).toBe(0);
	});

	test('recognizes a shadow-root input from its composed event path', () => {
		const page = load(forward);
		const host = page.document.createElement('div');
		page.player.appendChild(host);
		const input = page.document.createElement('input');
		host.attachShadow({ mode: 'open' }).appendChild(input);
		input.focus();
		expect(page.document.activeElement).toBe(host);
		expect(page.key('keydown', 70, input).defaultPrevented).toBe(false);
		expect(page.player.seekBy).not.toHaveBeenCalled();
	});

	test('ignores composing and contenteditable input', () => {
		const page = load(forward);
		const editable = page.document.createElement('div');
		// JSDOM does not implement the browser's isContentEditable property.
		Object.defineProperty(editable, 'isContentEditable', { value: true });
		page.document.body.appendChild(editable);
		expect(page.key('keydown', 70, editable).defaultPrevented).toBe(false);
		expect(page.key('keydown', 70, page.document.body, { isComposing: true }).defaultPrevented).toBe(false);
		expect(page.player.seekBy).not.toHaveBeenCalled();
	});

	test('rebuilds edited shortcuts through the actual storage-changed message without invoking the action', () => {
		const page = load(forward);
		page.key();
		page.change('shortcut_seek_forward', { keys: { 71: { key: 'g' } } });
		expect(page.player.seekBy).toHaveBeenCalledTimes(1);
		expect(page.IT.input.pressed.keys.size).toBe(0);
		expect(page.IT.input.cancelled.size).toBe(0);
		expect(page.key('keyup').defaultPrevented).toBe(false);
		expect(page.key().defaultPrevented).toBe(false);
		page.key('keyup');
		expect(page.key('keydown', 71).defaultPrevented).toBe(true);
		expect(page.player.seekBy).toHaveBeenCalledTimes(2);
		page.key('keyup', 71);
	});

	test('installs a first shortcut and removes a cleared or deleted last shortcut immediately', () => {
		const page = load();
		page.change('shortcut_seek_forward', forward.shortcut_seek_forward);
		expect(page.key().defaultPrevented).toBe(true);
		page.key('keyup');
		page.change('shortcut_seek_forward', { keys: {}, ctrl: false, wheel: 0 });
		expect(Object.keys(page.IT.input.listening)).toHaveLength(0);
		expect(page.key().defaultPrevented).toBe(false);
		page.change('shortcut_seek_forward', forward.shortcut_seek_forward);
		page.change('shortcut_seek_forward', undefined);
		expect(Object.keys(page.IT.input.listeners)).toHaveLength(0);
		expect(page.key().defaultPrevented).toBe(false);
		expect(page.player.seekBy).toHaveBeenCalledTimes(1);
	});

	test('does not duplicate listeners on repeated initialization or unrelated settings changes', () => {
		const page = load(forward);
		page.IT.shortcutsInit();
		page.change('shortcut_seek_forward', { keys: { 71: true } });
		page.change('unrelated_setting', true);
		for (const type of ['keydown', 'keyup', 'wheel', 'blur']) {
			expect(page.add.mock.calls.filter(([name]) => name === type)).toHaveLength(1);
		}
		page.key('keydown', 71);
		expect(page.player.seekBy).toHaveBeenCalledTimes(1);
	});

	test.each(['blur', 'visibilitychange', 'yt-navigate-start', 'improvedtube-blur'])('recovers pressed and cancelled state on %s', type => {
		const page = load(forward);
		page.key();
		page.IT.input.pressed.ctrl = true;
		page.IT.input.pressed.wheel = 1;
		if (type === 'visibilitychange') Object.defineProperty(page.document, 'hidden', { value: true });
		page.emit(type === 'blur' || type === 'improvedtube-blur' ? page.window : page.document, new page.window.Event(type));
		expect(page.IT.input.pressed.keys.size).toBe(0);
		expect(page.IT.input.cancelled.size).toBe(0);
		expect(page.IT.input.pressed.ctrl).toBe(false);
		expect(page.IT.input.pressed.wheel).toBe(0);
		expect(page.key('keyup').defaultPrevented).toBe(false);
		expect(page.key().defaultPrevented).toBe(true);
		expect(page.player.seekBy).toHaveBeenCalledTimes(2);
	});
});

describe.each([
	['chapters', 'shortcutChapters', '<div modern-chapters><div id="navigation-button"><button aria-label="Chapters">Open</button></div></div>'],
	['transcript', 'shortcutTranscript', '<ytd-video-description-transcript-section-renderer><button aria-label="Transcript">Open</button></ytd-video-description-transcript-section-renderer>']
])('%s panel shortcut', (kind, method, markup) => {
	test('is a safe no-op when the panel and its launch button are both absent', () => {
		const page = load();
		expect(() => page.IT[method]()).not.toThrow();
		expect(page.errors).toHaveLength(0);
	});

	test('uses the existing launch control even before the panel is created', () => {
		const page = load();
		const launcher = page.document.createElement('div');
		launcher.innerHTML = markup;
		page.document.body.appendChild(launcher);
		const clicked = jest.fn();
		launcher.querySelector('button').addEventListener('click', clicked);
		page.IT[method]();
		expect(clicked).toHaveBeenCalledTimes(1);
	});

	test('closes an expanded panel rather than reopening it, and tolerates a missing close button', () => {
		const page = load();
		const container = page.document.createElement('div');
		container.innerHTML = markup + `<ytd-engagement-panel-section-list-renderer target-id="engagement-panel-${kind}" visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED">` +
			'<div id="visibility-button"><button>Close</button></div></ytd-engagement-panel-section-list-renderer>';
		page.document.body.appendChild(container);
		const panel = container.querySelector('[target-id]');
		const closed = jest.fn(), opened = jest.fn();
		panel.querySelector('button').addEventListener('click', closed);
		container.querySelector('button').addEventListener('click', opened);
		page.IT[method]();
		expect(closed).toHaveBeenCalledTimes(1);
		expect(opened).not.toHaveBeenCalled();
		panel.querySelector('button').remove();
		expect(() => page.IT[method]()).not.toThrow();
		expect(opened).not.toHaveBeenCalled();
	});

	test('retains the legacy visibility fallback and closes an unmarked visible panel', () => {
		const page = load();
		const panel = page.document.createElement('ytd-engagement-panel-section-list-renderer');
		panel.setAttribute('target-id', 'engagement-panel-' + kind);
		panel.setAttribute('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN');
		panel.innerHTML = '<div id="visibility-button"><button>Close</button></div>';
		page.document.body.appendChild(panel);
		const closed = jest.fn();
		panel.querySelector('button').addEventListener('click', closed);
		Object.defineProperty(panel, 'clientHeight', { value: 300 });
		page.IT[method]();
		expect(panel.hasAttribute('visibility')).toBe(false);
		expect(closed).not.toHaveBeenCalled();
		page.IT[method]();
		expect(closed).toHaveBeenCalledTimes(1);
	});
});
