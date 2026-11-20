// Zen mode (issue #4093): the CSS-only layout plus the exit control

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const read = (...parts) => fs.readFileSync(path.join(__dirname, '../..', ...parts), 'utf8');

function loadModule(storage) {
	const noop = () => {};
	const context = {
		ImprovedTube: { storage: storage || {}, messages: { send: noop } },
		document: {
			querySelector: () => null,
			querySelectorAll: () => [],
			addEventListener: noop,
			createElement: () => ({ style: {}, addEventListener: noop }),
			documentElement: { hasAttribute: () => false, toggleAttribute: noop },
			body: { appendChild: noop }
		},
		location: { pathname: '/watch' },
		console,
		setTimeout: noop
	};
	vm.runInNewContext(read('js&css', 'web-accessible', 'www.youtube.com', 'features', 'zen.js'), context);
	return context.ImprovedTube;
}

describe('Zen mode (#4093)', () => {
	test('is inactive when the setting is off or missing', () => {
		expect(loadModule({}).zenModeActive()).toBe(false);
		expect(loadModule({ zen_mode: 'off' }).zenModeActive()).toBe(false);
	});

	test('is active in dim and hide modes', () => {
		expect(loadModule({ zen_mode: 'dim' }).zenModeActive()).toBe(true);
		expect(loadModule({ zen_mode: 'hide' }).zenModeActive()).toBe(true);
	});

	test('exiting writes off through the storage bridge', () => {
		const sent = [];
		const IT = loadModule({ zen_mode: 'hide' });
		IT.messages.send = (message) => sent.push(message);

		IT.zenModeExit();

		expect(IT.storage.zen_mode).toBe('off');
		expect(sent).toEqual([{ action: 'set', key: 'zen_mode', value: 'off' }]);
		expect(IT.zenModeActive()).toBe(false);
	});

	test('every CSS rule is scoped to the zen attribute', () => {
		const css = read('js&css', 'extension', 'www.youtube.com', 'features', 'zen.css')
			.replace(/\/\*[\s\S]*?\*\//g, '');
		const selectors = [...css.matchAll(/([^{}]+)\{/g)]
			.map((match) => match[1])
			.join(',')
			.split(',')
			.map((selector) => selector.trim())
			.filter(Boolean);

		expect(selectors.length).toBeGreaterThan(10);
		selectors.forEach((selector) => {
			expect(selector).toContain('it-zen-mode');
		});
	});

	test('the menu exposes off, dim and hide', () => {
		const skeleton = read('menu', 'skeleton-parts', 'zen.js');
		expect(skeleton).toContain("value: 'off'");
		expect(skeleton).toContain("value: 'dim'");
		expect(skeleton).toContain("value: 'hide'");
	});
});
