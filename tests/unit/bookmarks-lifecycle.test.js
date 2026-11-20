const featureDom = require('../helpers/feature-dom.cjs');
const file = 'js&css/web-accessible/www.youtube.com/features/bookmarks.js';
const html = '<div id="movie_player"><video class="html5-main-video"></video></div><div id="subscribe-button"></div>';
let app;
afterEach(() => app?.close());

test('discovers late anchors, creates one button and removes disabled UI', async () => {
	app = featureDom(file, { bookmarks_enabled: true });
	app.init();
	app.document.body.insertAdjacentHTML('beforeend', html);
	await app.advance(100);
	expect(app.document.querySelectorAll('#it-bookmarks-button')).toHaveLength(1);
	app.receive({ focus: true });
	await app.advance(100);
	expect(app.document.querySelectorAll('#it-bookmarks-button')).toHaveLength(1);
	app.storage('bookmarks_enabled', false);
	expect(app.document.querySelector('#it-bookmarks-button')).toBeNull();
	expect(app.sent).toHaveLength(0);
	expect(app.errors).toEqual([]);
});

test('navigation closes the old panel and detached forms cannot save to the old video', async () => {
	app = featureDom(file, { bookmarks_enabled: true }, html);
	app.init();
	app.document.querySelector('#it-bookmarks-button').click();
	const oldForm = app.document.querySelector('#it-bookmarks-panel form');
	app.navigate('/watch?v=bbbbbbbbbbb');
	await app.advance(100);
	expect(app.document.querySelector('#it-bookmarks-panel')).toBeNull();
	app.document.querySelector('video').currentTime = 123;
	app.emit(oldForm, 'submit');
	expect(app.sent).toHaveLength(0);
	app.document.querySelector('#it-bookmarks-button').click();
	app.emit(app.document.querySelector('#it-bookmarks-panel form'), 'submit');
	await app.flush();
	expect(app.persisted.bookmarks.bbbbbbbbbbb[0].t).toBe(123);
	expect(app.persisted.bookmarks.aaaaaaaaaaa).toBeUndefined();
	expect(app.errors).toEqual([]);
});

test('storage updates refresh the panel and deletion uses timestamp identity', async () => {
	app = featureDom(file, { bookmarks_enabled: true, bookmarks: { aaaaaaaaaaa: [{ t: 20, label: 'twenty' }] } }, html);
	app.init();
	app.IT.bookmarksOpen();
	const oldDelete = app.document.querySelector('button[title="Delete bookmark"]');
	app.storage('bookmarks', { aaaaaaaaaaa: [{ t: 10, label: 'ten' }, { t: 20, label: 'twenty' }] });
	expect(app.document.querySelector('#it-bookmarks-panel').textContent).toContain('ten');
	oldDelete.click();
	await app.flush();
	expect(app.persisted.bookmarks.aaaaaaaaaaa.map(item => item.t)).toEqual([10]);
	expect(app.errors).toEqual([]);
});

test('invalid imported entries do not crash and reaching the cap preserves saved bookmarks', () => {
	app = featureDom(file, { bookmarks_enabled: true, bookmarks: { aaaaaaaaaaa: [null, {}, { t: -1 }, { t: 5, label: '<b>note</b>' }] } }, html);
	app.init();
	app.IT.bookmarksOpen();
	expect(app.document.querySelectorAll('button[title="Delete bookmark"]')).toHaveLength(1);
	expect(app.document.querySelector('#it-bookmarks-panel b')).toBeNull();
	const full = Array.from({ length: 100 }, (_, t) => ({ t, label: String(t) }));
	expect(app.IT.bookmarksAdd(full, 101, 'new')).toEqual(full.map(item => ({ ...item, at: 0 })));
	expect(app.IT.bookmarksAdd(full, Infinity, 'bad')).toHaveLength(100);
	expect(app.IT.bookmarksParseTime('1:90')).toBeNull();
	app.storage('bookmarks', { aaaaaaaaaaa: [{ t: 1, label: { toString: null }, at: { valueOf: null } }] });
	expect(app.document.querySelector('#it-bookmarks-panel').textContent).toContain('0:01');
	expect(app.errors).toEqual([]);
});
