const featureDom = require('../helpers/feature-dom.cjs');
const file = 'js&css/web-accessible/www.youtube.com/features/playlist-health.js';
const row = (id, title, extra = '') => `<ytd-playlist-video-renderer>${id ? `<a href="/watch?v=${id}"></a>` : ''}<h3>${title}</h3>${extra}</ytd-playlist-video-renderer>`;
let app;
afterEach(() => app?.close());

function load() {
	app = featureDom(file, { playlist_health: true }, '', window => window.history.replaceState({}, '', '/playlist?list=PLtest'));
	app.init();
	app.document.querySelector('#it-playlist-health-button').click();
}

test('late lists include unavailable rows without links and do not redraw themselves forever', async () => {
	load();
	app.document.body.insertAdjacentHTML('beforeend', '<ytd-playlist-video-list-renderer>' + row('aaaaaaaaaaa', 'One') + row('aaaaaaaaaaa', 'Repeated') + row(null, '[Private video]') + row(null, '[Deleted video]') + '</ytd-playlist-video-list-renderer>');
	await app.advance(300);
	const panel = app.document.querySelector('#it-playlist-health-panel');
	expect(panel.textContent).toContain('4 rows scanned');
	expect(panel.textContent).toContain('Unavailable (2)');
	expect(panel.textContent).toContain('Duplicates (1)');
	let writes = 0;
	new app.window.MutationObserver(records => writes += records.length).observe(panel, { childList: true, subtree: true });
	await app.advance(2000);
	expect(writes).toBe(0);
	expect(app.timers.size).toBe(0);
	expect(app.errors).toEqual([]);
});

test('current resume markup distinguishes zero progress from actually watched rows', async () => {
	load();
	app.document.body.insertAdjacentHTML('beforeend', '<ytd-playlist-video-list-renderer>' + row('aaaaaaaaaaa', 'Started', '<ytw-thumbnail-overlay-resume-playback-renderer><div class="ytThumbnailOverlayResumePlaybackProgress" style="width:50%"></div></ytw-thumbnail-overlay-resume-playback-renderer>') + '</ytd-playlist-video-list-renderer>');
	await app.advance(300);
	const panel = app.document.querySelector('#it-playlist-health-panel');
	expect(panel.textContent).toContain('(started)');
	app.document.querySelector('.ytThumbnailOverlayResumePlaybackProgress').style.width = '0%';
	await app.advance(300);
	expect(panel.textContent).not.toContain('(started)');
	app.storage('playlist_health', false);
	await app.advance(300);
	expect(app.document.querySelector('#it-playlist-health-panel')).toBeNull();
	expect(app.document.querySelector('#it-playlist-health-button')).toBeNull();
	expect(app.timers.size).toBe(0);
	expect(app.errors).toEqual([]);
});

test('navigation closes a cached report and malformed numeric values produce finite scores', async () => {
	load();
	app.navigate('/watch?v=aaaaaaaaaaa');
	await app.advance(300);
	expect(app.document.querySelector('#it-playlist-health-panel')).toBeNull();
	expect(app.IT.playlistHealthParseDuration('99:99')).toBeNull();
	expect(app.IT.playlistHealthParseDuration('123:00')).toBe(7380);
	expect(Number.isFinite(app.IT.playlistHealthDecayScore({ index: Infinity, total: NaN, duration: Infinity }))).toBe(true);
	expect(app.errors).toEqual([]);
});
