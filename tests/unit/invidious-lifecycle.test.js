const featureDom = require('../helpers/feature-dom.cjs');
const file = 'js&css/web-accessible/www.youtube.com/features/invidious.js';
let app;
afterEach(() => app?.close());

test('uses the current video and instance after SPA navigation and settings changes', async () => {
	app = featureDom(file, { invidious_instance: 'yewtu.be' }, '<div id="subscribe-button"></div>');
	app.window.open = jest.fn();
	app.init();
	app.navigate('/watch?v=bbbbbbbbbbb');
	await app.advance(200);
	app.storage('invidious_instance', 'inv.nadeko.net');
	app.document.querySelector('#it-invidious-button').click();
	expect(app.window.open).toHaveBeenCalledWith('https://inv.nadeko.net/watch?v=bbbbbbbbbbb', '_blank', 'noopener');
	const button = app.document.querySelector('#it-invidious-button');
	app.storage('invidious_instance', 'off');
	expect(app.document.querySelector('#it-invidious-button')).toBeNull();
	button.click();
	expect(app.window.open).toHaveBeenCalledTimes(1);
	expect(app.errors).toEqual([]);
});

test('late anchors are discovered and malformed video IDs or hosts cannot be opened', async () => {
	app = featureDom(file, { invidious_instance: 'yewtu.be' });
	app.init();
	app.document.body.innerHTML = '<div id="subscribe-button"></div>';
	await app.advance(200);
	expect(app.document.querySelectorAll('#it-invidious-button')).toHaveLength(1);
	app.navigate('/watch?v=aaaaaaaaaaaa');
	await app.advance(200);
	expect(app.document.querySelector('#it-invidious-button')).toBeNull();
	expect(app.IT.invidiousWatchUrl('evil.example', 'aaaaaaaaaaa')).toBeNull();
	expect(app.IT.invidiousWatchUrl('yewtu.be', 'a#bad')).toBeNull();
	expect(app.errors).toEqual([]);
});
