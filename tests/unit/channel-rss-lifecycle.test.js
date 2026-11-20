const featureDom = require('../helpers/feature-dom.cjs');
const file = 'js&css/web-accessible/www.youtube.com/features/channel-rss.js';
const first = 'UC' + 'a'.repeat(22);
const second = 'UC' + 'b'.repeat(22);
let app;
afterEach(() => app?.close());

function load() {
	app = featureDom(file, { channel_rss_button: true }, '', window => {
		window.history.replaceState({}, '', '/@first');
		window.ytInitialData = { metadata: { channelMetadataRenderer: { externalId: first } } };
		window.HTMLElement.prototype.getBoundingClientRect = () => ({ width: 40, height: 40 });
	});
	app.init();
}

test('discovers a late channel header and cleans up outside channels or when disabled', async () => {
	load();
	app.document.body.innerHTML = '<yt-subscribe-button-view-model></yt-subscribe-button-view-model>';
	await app.advance(150);
	expect(app.document.querySelector('#it-rss-button').dataset.channel).toBe(first);
	app.navigate('/watch?v=bbbbbbbbbbb');
	await app.advance(150);
	expect(app.document.querySelector('#it-rss-button')).toBeNull();
	app.navigate('/channel/' + second);
	await app.advance(150);
	expect(app.document.querySelector('#it-rss-button').dataset.channel).toBe(second);
	app.storage('channel_rss_button', false);
	expect(app.document.querySelector('#it-rss-button')).toBeNull();
	expect(app.errors).toEqual([]);
});

test('does not copy the initial channel after SPA navigation while new metadata is missing', async () => {
	load();
	app.document.body.innerHTML = '<ytd-app></ytd-app><yt-subscribe-button-view-model></yt-subscribe-button-view-model>';
	await app.advance(150);
	app.navigate('/@second');
	await app.advance(150);
	expect(app.document.querySelector('#it-rss-button')).toBeNull();
	app.document.querySelector('ytd-app').__data = { data: { response: { metadata: { channelMetadataRenderer: {
		externalId: second, vanityChannelUrl: 'https://www.youtube.com/@second'
	} } } } };
	app.emit(app.document, 'yt-page-data-updated');
	await app.advance(150);
	expect(app.document.querySelector('#it-rss-button').dataset.channel).toBe(second);
});

test('failed clipboard operations never report Copied and a successful fallback does', async () => {
	load();
	app.document.body.innerHTML = '<yt-subscribe-button-view-model></yt-subscribe-button-view-model>';
	await app.advance(150);
	app.window.navigator.clipboard = { writeText: () => Promise.reject(new Error('denied')) };
	app.document.execCommand = () => false;
	const button = app.document.querySelector('#it-rss-button');
	button.click();
	await app.advance(1);
	await app.flush();
	expect(button.dataset.tooltip).toBe('Copy failed');
	app.document.execCommand = () => true;
	button.click();
	await app.advance(1);
	await app.flush();
	expect(button.dataset.tooltip).toBe('Copied');
	expect(app.document.querySelector('textarea')).toBeNull();
	expect(app.errors).toEqual([]);
});
