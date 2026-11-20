const fs = require('fs');
const path = require('path');
const vm = require('vm');
const featureDom = require('../helpers/feature-dom.cjs');
const root = path.join(__dirname, '../..');
const feature = 'js&css/web-accessible/www.youtube.com/features/caption-search.js';
const player = fs.readFileSync(path.join(root, 'js&css/web-accessible/www.youtube.com/player.js'), 'utf8');
const panelSelector = 'ytd-engagement-panel-section-list-renderer[target-id*="transcript"]';
let app;

function segment(time, text, modern = false) {
	const tag = modern ? 'transcript-segment-view-model' : 'ytd-transcript-segment-renderer';
	const timestamp = modern ? 'ytwTranscriptSegmentViewModelTimestamp' : 'segment-timestamp';
	const content = modern ? 'ytAttributedStringHost' : 'segment-text';
	return `<${tag}><span class="${timestamp}">${time}</span><span class="${content}">${text}</span></${tag}>`;
}

function panel(lines = '', visibility = 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED') {
	return `<ytd-engagement-panel-section-list-renderer target-id="engagement-panel-searchable-transcript" visibility="${visibility}"><div class="lines">${lines}</div></ytd-engagement-panel-section-list-renderer>`;
}

function load(settings = { caption_search: true }, transcript = panel(), setup = () => {}) {
	app = featureDom(feature, settings, '<div id="movie_player"><video></video></div>' + transcript, window => {
		window.fetch = jest.fn(() => { throw new Error('Search must not fetch captions'); });
		window.eval(player);
		Object.defineProperty(window.document.querySelector('video'), 'duration', { value: 5000, configurable: true });
		setup(window);
	});
	app.init();
	return app;
}

function results() {
	return [...app.document.querySelectorAll('#it-caption-search li button')];
}

async function search(query) {
	const input = app.document.querySelector('#it-caption-search-input');
	input.value = query;
	app.emit(input, 'input');
	await app.advance(150);
	return input;
}

afterEach(() => app?.close());

test('is default-off, only reads the expanded transcript and enables through real core storage dispatch', async () => {
	load({}, panel(segment('0:00', 'Visible')) + panel(segment('0:03', 'Hidden'), 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN'));
	expect(app.document.querySelector('#it-caption-search')).toBeNull();
	// The complete player source schedules its unrelated Smart Speed startup check at 1 s.
	await app.advance(1200);
	expect(app.timers.size).toBe(0);
	app.storage('caption_search', true);
	await app.advance(200);
	expect(app.document.querySelectorAll('#it-caption-search')).toHaveLength(1);
	expect(app.document.querySelector('#it-caption-search').textContent).toContain('1 loaded lines');
	await search('hidden');
	expect(results()).toHaveLength(0);
	expect(app.document.querySelector('[role="status"]').textContent).toContain('0 matches in 1 loaded lines');
	app.storage('unrelated_setting', true);
	app.receive({ focus: true });
	await app.advance(100);
	expect(app.document.querySelector('#it-caption-search-input').value).toBe('hidden');
	expect(app.sent).toHaveLength(0);
	expect(app.window.fetch).not.toHaveBeenCalled();
	expect(app.errors).toEqual([]);
});

test('searches manual and current caption markup literally and seeks valid timestamps including zero', async () => {
	load(undefined, panel(segment('0:00', 'Hello [world]') + segment('1:05', 'HELLO again', true) + segment('1:02:03', 'Hello later')));
	const input = await search('  hello  ');
	expect(results()).toHaveLength(3);
	const video = app.document.querySelector('video');
	video.currentTime = 10;
	results()[0].click();
	expect(video.currentTime).toBe(0);
	results()[1].click();
	expect(video.currentTime).toBe(65);
	results()[2].click();
	expect(video.currentTime).toBe(3723);
	await search('[world]');
	expect(results()).toHaveLength(1);
	input.dispatchEvent(new app.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
	expect(video.currentTime).toBe(0);
	input.dispatchEvent(new app.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
	expect(app.document.activeElement).toBe(results()[0]);
	input.dispatchEvent(new app.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
	expect(input.value).toBe('');
	expect(results()).toHaveLength(0);
	expect(app.document.activeElement).toBe(input);
	expect(app.errors).toEqual([]);
});

test('discovers late/replaced panels, updates loaded lines and does not observe its own search output forever', async () => {
	load(undefined, '');
	expect(app.document.querySelector('#it-caption-search')).toBeNull();
	app.document.body.insertAdjacentHTML('beforeend', panel());
	await app.advance(200);
	expect(app.document.querySelector('[role="status"]').textContent).toContain('No transcript lines are loaded');
	app.document.querySelector('.lines').innerHTML = segment('0:18', 'Match');
	await app.advance(200);
	await search('match');
	expect(results()).toHaveLength(1);
	app.document.querySelector('.lines').insertAdjacentHTML('beforeend', segment('0:32', 'Another match', true));
	await app.advance(200);
	expect(results()).toHaveLength(2);
	let changes = 0;
	const observer = new app.window.MutationObserver(records => { changes += records.length; });
	observer.observe(app.document.querySelector('#it-caption-search'), { childList: true, subtree: true });
	await app.advance(2000);
	expect(changes).toBe(0);
	expect(app.timers.size).toBe(0);
	app.document.querySelector(panelSelector).outerHTML = panel(segment('0:41', 'Replacement match'));
	await app.advance(200);
	expect(app.document.querySelectorAll('#it-caption-search')).toHaveLength(1);
	expect(results()[0].textContent).toContain('Replacement match');
	expect(app.errors).toEqual([]);
});

test('cancels pending work on disable, removes the UI when hidden and preserves the native transcript', async () => {
	load(undefined, panel(segment('0:01', 'Keep native line')));
	await app.advance(1200);
	const nativePanel = app.document.querySelector(panelSelector);
	const nativeLine = nativePanel.querySelector('ytd-transcript-segment-renderer');
	const input = app.document.querySelector('input');
	input.value = 'keep';
	app.emit(input, 'input');
	app.storage('caption_search', false);
	await app.advance(500);
	expect(app.document.querySelector('#it-caption-search')).toBeNull();
	expect(nativeLine.isConnected).toBe(true);
	expect(nativeLine.style.display).toBe('');
	expect(app.timers.size).toBe(0);
	app.storage('caption_search', true);
	expect(app.document.querySelector('input').value).toBe('');
	nativePanel.setAttribute('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN');
	await app.advance(200);
	expect(app.document.querySelector('#it-caption-search')).toBeNull();
	nativePanel.setAttribute('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED');
	await app.advance(200);
	expect(app.document.querySelector('#it-caption-search')).not.toBeNull();
	app.document.body.hidden = true;
	await app.advance(200);
	expect(app.document.querySelector('#it-caption-search')).toBeNull();
	app.document.body.hidden = false;
	await app.advance(200);
	expect(app.document.querySelector('#it-caption-search')).not.toBeNull();
	expect(app.errors).toEqual([]);
});

test('does not seek through stale results after a query change, video navigation or language replacement', async () => {
	load(undefined, panel(segment('0:10', 'Old match')));
	await search('match');
	const oldResult = results()[0];
	const input = app.document.querySelector('#it-caption-search-input');
	input.value = 'new query';
	app.emit(input, 'input');
	oldResult.click();
	expect(app.document.querySelector('video').currentTime).toBe(0);
	await search('no match');
	oldResult.click();
	expect(app.document.querySelector('video').currentTime).toBe(0);
	await search('match');
	const priorVideoResult = results()[0];
	app.navigate('/watch?v=bbbbbbbbbbb');
	await app.advance(200);
	expect(results()).toHaveLength(0);
	expect(app.document.querySelector('[role="status"]').textContent).toContain('Waiting for this video');
	priorVideoResult.click();
	expect(app.document.querySelector('video').currentTime).toBe(0);
	app.document.querySelector('.lines').innerHTML = segment('0:20', 'New match', true);
	await app.advance(200);
	await search('new');
	const oldLanguageResult = results()[0];
	app.document.querySelector('.ytAttributedStringHost').textContent = 'Different language';
	oldLanguageResult.click();
	expect(app.document.querySelector('video').currentTime).toBe(0);
	await app.advance(200);
	await search('different');
	results()[0].click();
	expect(app.document.querySelector('video').currentTime).toBe(20);
	app.navigate('/feed/subscriptions');
	await app.advance(500);
	expect(app.document.querySelector('#it-caption-search')).toBeNull();
	expect(app.timers.size).toBe(0);
	expect(app.errors).toEqual([]);
});

test('same-video playlist/timestamp navigation can reuse loaded transcript and a replacement player is resolved on click', async () => {
	load(undefined, panel(segment('0:21', 'Match')));
	await search('match');
	app.navigate('/watch?v=aaaaaaaaaaa&list=PLtest&t=10');
	await app.advance(200);
	expect(app.document.querySelector('[role="status"]').textContent).toContain('1 loaded lines');
	await search('match');
	const oldVideo = app.document.querySelector('video');
	const replacement = app.document.createElement('video');
	Object.defineProperty(replacement, 'duration', { value: 60 });
	oldVideo.replaceWith(replacement);
	results()[0].click();
	expect(replacement.currentTime).toBe(21);
	expect(oldVideo.currentTime).toBe(0);
	expect(app.errors).toEqual([]);
});

test('URL updates before navigation-start and same-video navigations cannot revive a stale transcript', async () => {
	load(undefined, panel(segment('0:12', 'Old match')));
	await search('match');
	app.window.history.pushState({}, '', '/watch?v=bbbbbbbbbbb');
	app.emit(app.document, 'yt-navigate-start');
	app.emit(app.document, 'yt-navigate-finish');
	await app.advance(200);
	expect(app.document.querySelector('[role="status"]').textContent).toContain('Waiting for this video');
	app.navigate('/watch?v=bbbbbbbbbbb&list=PLtest');
	await app.advance(200);
	await search('match');
	expect(results()).toHaveLength(0);
	expect(app.document.querySelector('[role="status"]').textContent).toContain('Waiting for this video');
	app.document.querySelector('.lines').innerHTML = segment('0:24', 'New match');
	await app.advance(200);
	results()[0].click();
	expect(app.document.querySelector('video').currentTime).toBe(24);
	expect(app.errors).toEqual([]);
});

test('IME composition and already handled keys do not trigger search actions', async () => {
	load(undefined, panel(segment('0:12', 'Match')));
	const input = await search('match');
	input.dispatchEvent(new app.window.KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }));
	expect(app.document.querySelector('video').currentTime).toBe(0);
	const escape = new app.window.KeyboardEvent('keydown', { key: 'Escape', cancelable: true, bubbles: true });
	escape.preventDefault();
	input.dispatchEvent(escape);
	expect(input.value).toBe('match');
	expect(results()).toHaveLength(1);
	expect(app.errors).toEqual([]);
});

test('invalid/out-of-range timestamps cannot seek, and result rendering remains bounded and text-only', async () => {
	load(undefined, panel(segment('bogus', 'Match invalid') + segment('0:60', 'Match bad minute') + segment('9'.repeat(30) + ':00', 'Match unsafe') + segment('1:30:00', 'Match too far') + segment('0:02', '&lt;img src=x onerror=alert(1)&gt; Match')));
	await search('match');
	expect(results().filter(button => button.disabled)).toHaveLength(3);
	results()[3].click();
	expect(app.document.querySelector('video').currentTime).toBe(0);
	expect(app.document.querySelector('[role="status"]').textContent).toContain('not available');
	expect(app.document.querySelector('#it-caption-search img')).toBeNull();
	app.document.querySelector('.lines').innerHTML = Array.from({ length: 105 }, (_, i) => segment('0:01', 'Match ' + i)).join('');
	await app.advance(200);
	expect(results()).toHaveLength(100);
	expect(app.document.querySelector('[role="status"]').textContent).toContain('105 matches');
	expect(app.document.querySelector('[role="status"]').textContent).toContain('first 100');
	expect(app.window.fetch).not.toHaveBeenCalled();
	expect(app.errors).toEqual([]);
});

test('only jumps inside known seekable ranges for live media', async () => {
	load(undefined, panel(segment('0:10', 'Match expired') + segment('1:00', 'Match live')));
	const video = app.document.querySelector('video');
	Object.defineProperties(video, {
		duration: { value: Infinity, configurable: true },
		seekable: { value: { length: 1, start: () => 50, end: () => 120 } }
	});
	await search('match');
	results()[0].click();
	expect(video.currentTime).toBe(0);
	results()[1].click();
	expect(video.currentTime).toBe(60);
	expect(app.errors).toEqual([]);
});

test('registers existing source/CSS/menu assets in loader order and exposes an explicit default-off setting', () => {
	const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
	expect(manifest.web_accessible_resources[0].resources).toContain(feature);
	expect(manifest.content_scripts[0].css).toContain('js&css/extension/www.youtube.com/features/caption-search.css');
	for (const asset of [feature, 'js&css/extension/www.youtube.com/features/caption-search.css', 'menu/skeleton-parts/caption-search.js']) {
		expect(fs.existsSync(path.join(root, asset))).toBe(true);
	}
	const init = fs.readFileSync(path.join(root, 'js&css/extension/init.js'), 'utf8');
	expect(init.indexOf("'/" + feature + "'")).toBeGreaterThan(init.indexOf("'/js&css/web-accessible/www.youtube.com/player.js'"));
	expect(init.indexOf("'/" + feature + "'")).toBeLessThan(init.indexOf("'/js&css/web-accessible/init.js'"));
	for (const page of ['index.html', 'sidepanel.html']) {
		const html = fs.readFileSync(path.join(root, 'menu', page), 'utf8');
		expect(html.indexOf('skeleton-parts/caption-search.js')).toBeGreaterThan(html.indexOf('skeleton-parts/appearance.js'));
	}
	const context = vm.createContext({ extension: { skeleton: { main: { layers: { section: { appearance: { on: { click: {} } } } } } } } });
	vm.runInContext(fs.readFileSync(path.join(root, 'menu/skeleton-parts/caption-search.js'), 'utf8'), context);
	const control = context.extension.skeleton.main.layers.section.appearance.on.click.caption_search_section.caption_search;
	expect(control.value).toBe(false);
	expect(control.component).toBe('switch');
});
