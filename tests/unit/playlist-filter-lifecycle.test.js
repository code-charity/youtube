const featureDom = require('../helpers/feature-dom.cjs');
const file = 'js&css/web-accessible/www.youtube.com/features/playlist-filter.js';
const row = (id, title, style = '') => `<ytd-playlist-video-renderer style="${style}"><a id="video-title" href="/watch?v=${id}">${title}</a></ytd-playlist-video-renderer>`;
let app;
afterEach(() => app?.close());

function load() {
	app = featureDom(file, { playlist_filter: true }, '', window => window.history.replaceState({}, '', '/playlist?list=PLtest'));
	app.init();
}

test('late lists and newly loaded rows are filtered without self-triggered renders', async () => {
	load();
	app.document.body.innerHTML = '<ytd-playlist-video-list-renderer>' + row('aaaaaaaaaaa', 'Keep') + row('bbbbbbbbbbb', 'Hide') + '</ytd-playlist-video-list-renderer>';
	await app.advance(200);
	const input = app.document.querySelector('#it-playlist-filter-bar input');
	input.value = 'keep';
	app.emit(input, 'input');
	await app.advance(200);
	expect(app.document.querySelectorAll('ytd-playlist-video-renderer')[1].style.display).toBe('none');
	app.document.querySelector('ytd-playlist-video-list-renderer').insertAdjacentHTML('beforeend', row('ccccccccccc', 'New nonmatch'));
	await app.advance(200);
	expect(app.document.querySelector('#it-playlist-filter-bar').textContent).toContain('1 / 3');
	let mutations = 0;
	const observer = new app.window.MutationObserver(records => mutations += records.length);
	observer.observe(app.document.querySelector('#it-playlist-filter-bar'), { childList: true, subtree: true });
	await app.advance(2000);
	expect(mutations).toBe(0);
	expect(app.timers.size).toBe(0);
	expect(app.errors).toEqual([]);
});

test('disabling with a pending filter restores exact previous display and cancels callbacks', async () => {
	load();
	app.document.body.innerHTML = '<ytd-playlist-video-list-renderer>' + row('aaaaaaaaaaa', 'Hidden', 'display:flex!important') + '</ytd-playlist-video-list-renderer>';
	await app.advance(200);
	const input = app.document.querySelector('input');
	input.value = 'no match';
	app.emit(input, 'input');
	await app.advance(200);
	app.emit(input, 'input');
	app.storage('playlist_filter', false);
	await app.advance(500);
	const item = app.document.querySelector('ytd-playlist-video-renderer');
	expect(item.style.display).toBe('flex');
	expect(item.style.getPropertyPriority('display')).toBe('important');
	expect(app.document.querySelector('#it-playlist-filter-bar')).toBeNull();
	expect(app.timers.size).toBe(0);
	expect(app.errors).toEqual([]);
});

test('navigation clears the query and does not filter cached playlist rows off playlist pages', async () => {
	load();
	app.document.body.innerHTML = '<ytd-playlist-video-list-renderer>' + row('aaaaaaaaaaa', 'One') + '</ytd-playlist-video-list-renderer>';
	await app.advance(200);
	const input = app.document.querySelector('input');
	input.value = 'missing';
	app.emit(input, 'input');
	await app.advance(200);
	app.navigate('/watch?v=aaaaaaaaaaa');
	await app.advance(200);
	expect(app.document.querySelector('#it-playlist-filter-bar')).toBeNull();
	expect(app.document.querySelector('ytd-playlist-video-renderer').style.display).toBe('');
	expect(app.errors).toEqual([]);
});
