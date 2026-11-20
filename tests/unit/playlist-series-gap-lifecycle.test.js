const featureDom = require('../helpers/feature-dom.cjs');
const file = 'js&css/web-accessible/www.youtube.com/features/playlist-series-gap.js';
const row = (id, title) => `<ytd-playlist-video-renderer><a id="video-title" href="/watch?v=${id}">${title}</a></ytd-playlist-video-renderer>`;
let app;
afterEach(() => app?.close());

function load() {
	app = featureDom(file, { playlist_series_gap: true }, '', window => window.history.replaceState({}, '', '/playlist?list=PLtest'));
	app.init();
	app.document.querySelector('#it-series-gap-button').click();
}

test('late lists refresh the report once, retain Rescan and preserve duplicate playlist entries', async () => {
	load();
	app.document.body.insertAdjacentHTML('beforeend', '<ytd-playlist-video-list-renderer>' + row('aaaaaaaaaaa', 'Ep 1') + row('aaaaaaaaaaa', 'Ep 1') + row('bbbbbbbbbbb', 'Ep 3') + '</ytd-playlist-video-list-renderer>');
	await app.advance(300);
	const panel = app.document.querySelector('#it-series-gap-panel');
	expect(panel.textContent).toContain('3 rows scanned, 3 numbered');
	expect(panel.textContent).toContain('Duplicate episodes');
	expect(panel.querySelector('#it-series-gap-footer button').textContent).toBe('Rescan');
	let writes = 0;
	new app.window.MutationObserver(records => writes += records.length).observe(panel, { childList: true, subtree: true });
	await app.advance(2000);
	expect(writes).toBe(0);
	expect(app.timers.size).toBe(0);
	app.document.querySelectorAll('#video-title')[2].textContent = 'Ep 2';
	await app.advance(300);
	expect(panel.textContent).toContain('No gaps in the numbered range');
	expect(app.errors).toEqual([]);
});

test('disable and leaving a playlist remove controls and pending callbacks', async () => {
	load();
	app.storage('playlist_series_gap', false);
	await app.advance(300);
	expect(app.document.querySelector('#it-series-gap-panel')).toBeNull();
	expect(app.document.querySelector('#it-series-gap-button')).toBeNull();
	app.storage('playlist_series_gap', true);
	app.document.querySelector('#it-series-gap-button').click();
	app.navigate('/watch?v=aaaaaaaaaaa');
	await app.advance(300);
	expect(app.document.querySelector('#it-series-gap-panel')).toBeNull();
	expect(app.document.querySelector('#it-series-gap-button')).toBeNull();
	expect(app.timers.size).toBe(0);
	expect(app.sent).toHaveLength(0);
	expect(app.errors).toEqual([]);
});

test('untrusted large episode numbers cannot create an unbounded range', () => {
	load();
	const result = app.IT.seriesGapReport([{ title: 'Ep 1' }, { title: 'Ep 2' }, { title: 'Ep 999999999999' }], 3);
	expect(result.missing[0].episodes).toHaveLength(100);
	expect(result.missing[0].omitted).toBe(999999999896);
	const invalid = app.IT.seriesGapReport([{ title: 'Ep ' + '9'.repeat(400) }, null, { title: 'Ep 3' }], Infinity);
	expect(invalid.numbered).toBe(1);
	expect(invalid.missing).toHaveLength(0);
});
