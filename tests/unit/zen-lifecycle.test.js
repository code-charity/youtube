const featureDom = require('../helpers/feature-dom.cjs');
const file = 'js&css/web-accessible/www.youtube.com/features/zen.js';
let app;
afterEach(() => app?.close());

test('live toggles and navigation scope Zen to video pages without changing the preference', async () => {
	app = featureDom(file);
	app.init();
	app.storage('zen_mode', 'hide');
	expect(app.document.querySelectorAll('#it-zen-exit')).toHaveLength(1);
	expect(app.document.documentElement.hasAttribute('it-zen-active')).toBe(true);
	app.navigate('/results?search_query=example');
	expect(app.document.querySelector('#it-zen-exit')).toBeNull();
	expect(app.document.documentElement.hasAttribute('it-zen-active')).toBe(false);
	app.navigate('/watch?v=bbbbbbbbbbb');
	expect(app.document.querySelectorAll('#it-zen-exit')).toHaveLength(1);
	app.document.querySelector('#it-zen-exit').click();
	await app.flush();
	expect(app.persisted.zen_mode).toBe('off');
	expect(app.sent).toHaveLength(1);
	expect(app.document.documentElement.hasAttribute('it-zen-active')).toBe(false);
	expect(app.errors).toEqual([]);
});

test('early init is safe and Escape in an input or fullscreen does not change saved Zen mode', () => {
	app = featureDom(file, { zen_mode: 'dim' });
	const body = app.document.body;
	body.remove();
	app.init();
	app.document.documentElement.appendChild(body);
	app.emit(app.document, 'DOMContentLoaded');
	expect(app.document.querySelector('#it-zen-exit')).not.toBeNull();
	const input = app.document.createElement('input');
	body.appendChild(input);
	input.dispatchEvent(new app.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
	expect(app.sent).toHaveLength(0);
	Object.defineProperty(app.document, 'fullscreenElement', { value: body, configurable: true });
	body.dispatchEvent(new app.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
	expect(app.sent).toHaveLength(0);
	expect(app.errors).toEqual([]);
});
