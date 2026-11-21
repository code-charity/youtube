const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.join(__dirname, '../..');
const sources = ['js&css/web-accessible/core.js', 'js&css/web-accessible/functions.js',
	'js&css/web-accessible/www.youtube.com/player.js', 'js&css/web-accessible/www.youtube.com/shortcuts.js']
	.map(file => ({ file, code: fs.readFileSync(path.join(root, file), 'utf8') }));
const sessions = [];

function load (storage = {}) {
	const errors = [];
	const virtualConsole = new VirtualConsole();
	virtualConsole.on('jsdomError', error => errors.push(error));
	// Active reel/media lookup is already used by shortsAutoScroll; native reaction hosts
	// are shared with return-youtube-dislike.js and its upstream native-button selectors.
	const dom = new JSDOM(`<!doctype html><html><body>
		<ytd-watch-flexy hidden video-id="watchvid001">
			<div id="movie_player" class="html5-video-player"><video></video></div>
			<like-button-view-model><button id="watch-like" aria-pressed="false">Like</button></like-button-view-model>
			<dislike-button-view-model><button id="watch-dislike" aria-pressed="false">Dislike</button></dislike-button-view-model>
		</ytd-watch-flexy>
		<ytd-reel-video-renderer video-id="inactive001">
			<div class="html5-video-player"><video></video></div>
			<like-button-view-model><button id="old-like" aria-pressed="false">Like</button></like-button-view-model>
			<dislike-button-view-model><button id="old-dislike" aria-pressed="false">Dislike</button></dislike-button-view-model>
		</ytd-reel-video-renderer>
		<ytd-reel-video-renderer is-active video-id="abcdefghijk">
			<div id="shorts-player" class="html5-video-player"><video></video></div>
			<reel-action-bar-view-model>
				<like-button-view-model><button id="current-like" aria-pressed="false">Like</button></like-button-view-model>
				<dislike-button-view-model><button id="current-dislike" aria-pressed="false">Dislike</button></dislike-button-view-model>
			</reel-action-bar-view-model>
		</ytd-reel-video-renderer>
	</body></html>`, { url: 'https://www.youtube.com/shorts/abcdefghijk', runScripts: 'outside-only', virtualConsole });
	sessions.push(dom);
	const { window } = dom, { document } = window;
	window.setTimeout = setTimeout;
	window.clearTimeout = clearTimeout;
	document.documentElement.dataset.pageType = 'shorts';
	const context = dom.getInternalVMContext();
	for (const { file, code } of sources) vm.runInContext(code, context, { filename: file });
	const IT = window.ImprovedTube;
	const reel = document.querySelector('ytd-reel-video-renderer[is-active]');
	const inactive = document.querySelector('ytd-reel-video-renderer:not([is-active])');
	const watch = document.getElementById('movie_player');
	IT.elements.player = watch;
	IT.elements.video = watch.querySelector('video');
	IT.elements.shorts_player = inactive.querySelector('.html5-video-player');
	IT.storage = JSON.parse(JSON.stringify(storage));
	IT.shortcutsInit();
	const clicks = {};
	for (const button of document.querySelectorAll('button')) {
		clicks[button.id] = jest.fn();
		button.addEventListener('click', clicks[button.id]);
	}
	function emit (target, event) {
		target.dispatchEvent(event);
		if (errors.length) throw errors.shift();
		return event;
	}
	return { IT, document, window, reel, inactive, watch, clicks, errors,
		video: reel.querySelector('video'),
		key: code => {
			const options = { key: String.fromCharCode(code), code: 'Key' + String.fromCharCode(code), keyCode: code, bubbles: true, composed: true, cancelable: true };
			const event = emit(document.body, new window.KeyboardEvent('keydown', options));
			emit(document.body, new window.KeyboardEvent('keyup', options));
			return event;
		},
		wheel: (target, deltaY = 100) => emit(target, new window.WheelEvent('wheel', { deltaY, bubbles: true, composed: true, cancelable: true }))
	};
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => { sessions.splice(0).forEach(dom => dom.window.close()); jest.clearAllTimers(); jest.useRealTimers(); });

describe('Shorts shortcuts target the current reel and media (#4068)', () => {
	test('keyboard reactions hit only the active Short, not retained watch-page or inactive reel controls', () => {
		const page = load({ shortcut_like: { keys: {76: {key: 'l'}} }, shortcut_dislike: { keys: {68: {key: 'd'}} } });
		expect(page.key(76).defaultPrevented).toBe(true);
		expect(page.key(68).defaultPrevented).toBe(true);
		expect(page.clicks['current-like']).toHaveBeenCalledTimes(1);
		expect(page.clicks['current-dislike']).toHaveBeenCalledTimes(1);
		for (const id of ['old-like', 'old-dislike', 'watch-like', 'watch-dislike']) expect(page.clicks[id]).not.toHaveBeenCalled();
	});

	test('uses the current reel video and status host when the cached Shorts player belongs to another reel', () => {
		const page = load({ shortcuts_playback_speed_step: 0.25, shortcut_increase_playback_speed: { keys: {83: {key: 's'}} } });
		page.key(83);
		expect(page.video.playbackRate).toBe(1.25);
		expect(page.inactive.querySelector('video').playbackRate).toBe(1);
		expect(page.watch.querySelector('video').playbackRate).toBe(1);
		expect(page.reel.querySelector('#it-status').textContent).toBe('1.25');
		expect(page.inactive.querySelector('#it-status')).toBeNull();
		page.IT.shortcutDecreasePlaybackSpeed();
		expect(page.video.playbackRate).toBe(1);
		page.IT.shortcutPlaybackSpeed('shortcutPlaybackSpeed2');
		expect(page.video.playbackRate).toBe(2);
		page.IT.shortcutResetPlaybackSpeed();
		expect(page.video.playbackRate).toBe(1);
		jest.advanceTimersByTime(500);
		expect(page.document.querySelector('#it-status')).toBeNull();
	});

	test('wheel speed shortcuts work with no watch player and ignore inactive reels', () => {
		const page = load({ shortcuts_playback_speed_step: 0.25, shortcut_increase_playback_speed: { wheel: 1 } });
		page.IT.elements.player = null;
		expect(page.wheel(page.video).defaultPrevented).toBe(true);
		expect(page.video.playbackRate).toBe(1.25);
		expect(page.wheel(page.inactive.querySelector('video')).defaultPrevented).toBe(false);
		expect(page.video.playbackRate).toBe(1.25);
	});

	test('retains ID-based native reaction controls and skips unrelated menu buttons', () => {
		const page = load();
		page.reel.querySelector('reel-action-bar-view-model').innerHTML =
			'<div id="like-button"><button>Menu</button><button aria-pressed="false">Like</button></div>' +
			'<div id="dislike-button"><button aria-pressed="true">Dislike</button></div>';
		const like = jest.fn(), dislike = jest.fn(), other = jest.fn();
		page.reel.querySelector('#like-button button:not([aria-pressed])').addEventListener('click', other);
		page.reel.querySelector('#like-button button[aria-pressed]').addEventListener('click', like);
		page.reel.querySelector('#dislike-button button').addEventListener('click', dislike);
		page.IT.shortcutLike();
		page.IT.shortcutDislike();
		expect(like).toHaveBeenCalledTimes(1);
		expect(dislike).toHaveBeenCalledTimes(1);
		expect(other).not.toHaveBeenCalled();
	});

	test.each(['hidden', 'inert', 'aria-hidden'])('ignores an active reel inside %s content', attribute => {
		const page = load();
		page.reel.setAttribute(attribute, attribute === 'aria-hidden' ? 'true' : '');
		expect(page.IT.getActiveShortsRenderer()).toBeNull();
		page.IT.shortcutLike();
		page.IT.shortcutDislike();
		expect(page.IT.playbackSpeed(2)).toBe(false);
		expect(page.clicks['current-like']).not.toHaveBeenCalled();
		expect(page.clicks['current-dislike']).not.toHaveBeenCalled();
		expect(page.video.playbackRate).toBe(1);
	});

	test('does not fall back to a cached player or a watch-page reaction while no reel is active', () => {
		const page = load();
		page.reel.removeAttribute('is-active');
		page.IT.shortcutLike();
		page.IT.shortcutDislike();
		page.IT.shortcutIncreasePlaybackSpeed();
		page.IT.shortcutResetPlaybackSpeed();
		expect(page.IT.playbackSpeed(2)).toBe(false);
		for (const clicked of Object.values(page.clicks)) expect(clicked).not.toHaveBeenCalled();
		expect(page.document.querySelector('#it-status')).toBeNull();
	});

	test('ignores disabled, hidden or unhydrated reaction controls without falling back outside the reel', () => {
		const page = load();
		page.reel.querySelector('#current-like').disabled = true;
		page.reel.querySelector('#current-dislike').setAttribute('aria-disabled', 'true');
		page.IT.shortcutLike();
		page.IT.shortcutDislike();
		page.reel.querySelector('#current-like').disabled = false;
		page.reel.querySelector('#current-like').removeAttribute('aria-pressed');
		page.reel.querySelector('dislike-button-view-model').hidden = true;
		page.reel.querySelector('#current-dislike').removeAttribute('aria-disabled');
		page.IT.shortcutLike();
		page.IT.shortcutDislike();
		for (const clicked of Object.values(page.clicks)) expect(clicked).not.toHaveBeenCalled();
	});

	test('does not act on the outgoing Short when the URL changes before is-active', () => {
		const page = load();
		page.window.history.replaceState({}, '', '/shorts/nextshort01');
		page.IT.shortcutLike();
		page.IT.shortcutDislike();
		page.IT.shortcutPlaybackSpeed('shortcutPlaybackSpeed2');
		expect(page.video.playbackRate).toBe(1);
		for (const clicked of Object.values(page.clicks)) expect(clicked).not.toHaveBeenCalled();
		expect(page.document.querySelector('#it-status')).toBeNull();
	});

	test('resolves a new active reel on every shortcut after SPA navigation', () => {
		const page = load();
		page.reel.removeAttribute('is-active');
		page.inactive.setAttribute('is-active', '');
		page.window.history.replaceState({}, '', '/shorts/inactive001');
		page.IT.elements.shorts_player = page.reel.querySelector('#shorts-player');
		page.IT.shortcutLike();
		page.IT.shortcutDislike();
		expect(page.IT.playbackSpeed(1.5)).toBe(1.5);
		expect(page.inactive.querySelector('video').playbackRate).toBe(1.5);
		expect(page.video.playbackRate).toBe(1);
		expect(page.clicks['old-like']).toHaveBeenCalledTimes(1);
		expect(page.clicks['old-dislike']).toHaveBeenCalledTimes(1);
		expect(page.clicks['current-like']).not.toHaveBeenCalled();
	});

	test('accepts one identityless active reel but refuses ambiguous or explicitly inactive reels', () => {
		const page = load();
		page.reel.removeAttribute('video-id');
		expect(page.IT.getActiveShortsRenderer()).toBe(page.reel);
		page.inactive.setAttribute('is-active', 'false');
		expect(page.IT.getActiveShortsRenderer()).toBe(page.reel);
		page.inactive.setAttribute('is-active', '');
		expect(page.IT.getActiveShortsRenderer()).toBeNull();
	});

	test('ignores duplicate active reels claiming the current video instead of choosing arbitrarily', () => {
		const page = load();
		page.inactive.setAttribute('is-active', '');
		page.inactive.setAttribute('video-id', 'abcdefghijk');
		expect(page.IT.getActiveShortsRenderer()).toBeNull();
		page.IT.shortcutLike();
		for (const clicked of Object.values(page.clicks)) expect(clicked).not.toHaveBeenCalled();
	});

	test('reads replacement media and does not display false speed feedback while media is absent', () => {
		const page = load();
		page.video.remove();
		page.IT.shortcutResetPlaybackSpeed();
		page.IT.shortcutPlaybackSpeed('shortcutPlaybackSpeed2');
		expect(page.document.querySelector('#it-status')).toBeNull();
		const replacement = page.document.createElement('video');
		page.reel.querySelector('#shorts-player').appendChild(replacement);
		page.IT.shortcutPlaybackSpeed('shortcutPlaybackSpeed2');
		expect(replacement.playbackRate).toBe(2);
		expect(page.reel.querySelector('#it-status').textContent).toBe('2.00');
		expect(page.video.playbackRate).toBe(1);
	});

	test('preserves ordinary watch-page shortcuts after navigating away from Shorts', () => {
		const page = load();
		page.window.history.replaceState({}, '', '/watch?v=watchvid001');
		page.document.querySelector('ytd-watch-flexy').hidden = false;
		page.IT.shortcutLike();
		page.IT.shortcutDislike();
		expect(page.IT.playbackSpeed(2)).toBe(2);
		expect(page.watch.querySelector('video').playbackRate).toBe(2);
		expect(page.clicks['watch-like']).toHaveBeenCalledTimes(1);
		expect(page.clicks['watch-dislike']).toHaveBeenCalledTimes(1);
		expect(page.video.playbackRate).toBe(1);
		expect(page.IT.getActiveShortsRenderer()).toBeNull();
	});
});
