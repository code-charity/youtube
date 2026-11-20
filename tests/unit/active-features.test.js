const createMenu = require('../helpers/menu-dom.cjs');

const menus = [];
function loadMenu (...args) {
	const menu = createMenu(...args);
	menus.push(menu);
	return menu;
}

const fixture = `
extension.skeleton.main.layers.section.fixture = {
	component: 'button', category: true, text: 'Fixture',
	on: { click: { component: 'section', variant: 'card',
		off: { component: 'switch', text: 'Off', storage: 'aliased_off', value: false },
		on: { component: 'switch', text: 'On', storage: 'aliased_on', value: true },
		zero: { component: 'slider', text: 'Zero', storage: 'aliased_zero', value: 5, max: 10 },
		dynamic: { component: 'switch', text: 'Dynamic', value: function () { return true; } },
		select: { component: 'select', text: 'Select', options: function () { return [{value: 0, text: 'Default'}, {value: 2, text: 'Two'}]; } },
		explicit: { component: 'select', text: 'Explicit', value: 'chosen', options: [{value: 'first', text: 'First'}, {value: 'chosen', text: 'Chosen'}] },
		color: { component: 'color-picker', text: 'Color', value: [200, 100, 50] },
		transient: { component: 'slider', text: 'Transient', storage: false, value: 1 },
		empty: { component: 'shortcut', text: 'Empty' },
		binding: { component: 'shortcut', text: 'Binding', value: { keys: {65: {key: 'a'}} } }
	} }
};`;

describe('Active Features uses the actual Satus renderer and storage', () => {
	beforeEach(() => jest.useFakeTimers());
	afterEach(() => { menus.splice(0).forEach(menu => menu.close()); jest.clearAllTimers(); jest.useRealTimers(); });

	test('uses only the configured alias and preserves false/zero customizations', async () => {
		const menu = loadMenu({ aliased_off: false, off: true, aliased_on: false, aliased_zero: 0, zero: 5 }, fixture);
		const view = menu.open();
		await menu.flush();
		expect(menu.control(view, 'aliased_off')).toBeUndefined();
		expect(menu.control(view, 'aliased_on').dataset.value).toBe('false');
		expect(menu.control(view, 'aliased_zero').input.value).toBe('0');
		expect(menu.data.aliased_zero).toBe(0);
		expect(menu.chrome.storage.local.set).not.toHaveBeenCalled();
		expect(menu.chrome.storage.local.remove).not.toHaveBeenCalled();
	});

	test('does not fall through an absent alias to an unrelated key', async () => {
		const menu = loadMenu({ on: false, zero: 9, transient: 8 }, fixture);
		const view = menu.open();
		await menu.flush();
		expect(menu.controls(view)).toHaveLength(0);
		expect(view.textContent).toBe('empty');
	});

	test('evaluates defaults/options and compares numeric select values and color arrays by value', async () => {
		const menu = loadMenu({ dynamic: true, select: '0', explicit: 'chosen', color: [200, 100, 50] }, fixture);
		const view = menu.open();
		await menu.flush();
		expect(menu.controls(view)).toHaveLength(0);
		menu.satus.storage.set('dynamic', false);
		menu.satus.storage.set('select', '2');
		menu.satus.storage.set('color', [1, 2, 3]);
		await menu.flush();
		expect(menu.control(view, 'dynamic').dataset.value).toBe('false');
		expect(menu.control(view, 'select').value).toBe('2');
		expect(menu.control(view, 'color').color.value).toEqual([1, 2, 3]);
	});

	test('preserves falsy native select options and tolerates an empty dynamic option list', async () => {
		const menu = loadMenu({ choice: false, blank: '' }, `extension.skeleton.main.layers.section.fixture = {
			component: 'button', category: true, text: 'Fixture', on: { click: { component: 'section',
				choice: {component: 'select', text: 'Choice', options: [{value: 'first', text: 'First'}, {value: false, text: 'Off'}]},
				blank: {component: 'select', text: 'Blank', options: [{value: 'first', text: 'First'}, {value: '', text: 'None'}]},
				unavailable: {component: 'select', text: 'Unavailable', options: function () { return []; }}
			} }
		};`);
		const view = menu.open();
		await menu.flush();
		expect(menu.control(view, 'choice').value).toBe('false');
		expect(menu.control(view, 'blank').value).toBe('');
		const empty = menu.satus.render({ component: 'select', options: [] }, menu.document.body, 'empty_options');
		expect(empty.value).toBe('');
		expect(menu.chrome.storage.local.set).not.toHaveBeenCalled();
	});

	test('refreshes dynamic select options after editing ends, without replacing a focused control', async () => {
		const menu = loadMenu({ select: '2' }, fixture + `
			extension.skeleton.main.layers.section.fixture.on.click.select.options = function () {
				return [{value: 0, text: 'Default'}, {value: 2, text: satus.storage.get('option_label') || 'Two'}];
			};`);
		const view = menu.open();
		await menu.flush();
		const select = menu.control(view, 'select');
		select.selectElement.focus();
		menu.chrome.storage.local.set({ option_label: 'Second' });
		await menu.flush();
		expect(menu.control(view, 'select')).toBe(select);
		expect(menu.document.activeElement).toBe(select.selectElement);
		select.selectElement.blur();
		await menu.flush();
		expect(menu.control(view, 'select').valueElement.textContent).toBe('Second');
		expect(menu.control(view, 'select').value).toBe('2');
		expect(menu.chrome.storage.local.set).toHaveBeenCalledTimes(1);
	});

	test('treats a native select string value as its boolean default without confusing false and zero switches', async () => {
		const menu = loadMenu({ choice: 'false', aliased_on: 0 }, fixture + `
			extension.skeleton.main.layers.section.fixture.on.click.choice = {
				component: 'select', text: 'Choice', options: [{value: false, text: 'Off'}, {value: true, text: 'On'}]
			};`);
		const view = menu.open();
		await menu.flush();
		expect(menu.control(view, 'choice')).toBeUndefined();
		expect(menu.control(view, 'aliased_on')).toBeDefined();
	});

	test('keeps filtered controls safe when a render callback expects an unavailable companion', async () => {
		const menu = loadMenu({ player_autoPip_outside: false });
		menu.document.pictureInPictureEnabled = false;
		const view = menu.open();
		await menu.flush();
		expect(menu.controls(view)).toHaveLength(0);
		expect(view.textContent).toBe('empty');
		expect(menu.data.player_autoPip_outside).toBe(false);
	});

	test.each([{}, {keys: {}}, {alt: false, ctrl: false, shift: false, wheel: 0, keys: {}}, {ctrl: true, keys: {}}])('omits an unbound shortcut %j', async value => {
		const menu = loadMenu({ empty: value }, fixture);
		const view = menu.open();
		await menu.flush();
		expect(menu.controls(view)).toHaveLength(0);
	});

	test('compares shortcut key codes and modifiers rather than labels, object identity or key order', async () => {
		const value = { shift: false, wheel: 0, keys: { 65: { code: 'KeyA', key: 'A' } }, ctrl: false, alt: false };
		const menu = loadMenu({ binding: value, shortcut_increase_volume: { keys: {38: {key: 'ArrowUp', code: 'ArrowUp'}}, wheel: 0 } }, fixture);
		const view = menu.open();
		await menu.flush();
		expect(menu.controls(view)).toHaveLength(0);
		menu.satus.storage.set('binding', { ...value, ctrl: true });
		await menu.flush();
		expect(menu.control(view, 'binding').textContent).toContain('Ctrl');
	});

	test('reflects user deactivation and keeps a default-on setting disabled by choice until it is reset', async () => {
		const menu = loadMenu({ aliased_off: true, aliased_on: false }, fixture);
		const view = menu.open();
		await menu.flush();
		menu.control(view, 'aliased_off').click();
		await menu.flush();
		expect(menu.control(view, 'aliased_off')).toBeUndefined();
		expect(menu.control(view, 'aliased_on').dataset.value).toBe('false');
		menu.control(view, 'aliased_on').click();
		await menu.flush();
		expect(menu.controls(view)).toHaveLength(0);
		expect(view.textContent).toBe('empty');
		expect(menu.data).toEqual({ aliased_off: false, aliased_on: true });
	});

	test('keeps a slider input and its editing state while unrelated storage changes arrive', async () => {
		const menu = loadMenu({ aliased_zero: 3, aliased_off: true }, fixture);
		const view = menu.open();
		await menu.flush();
		const slider = menu.control(view, 'aliased_zero');
		slider.textInput.focus();
		slider.textInput.value = '4.';
		menu.chrome.storage.local.set({ aliased_off: false });
		await menu.flush();
		expect(menu.control(view, 'aliased_zero')).toBe(slider);
		expect(menu.document.activeElement).toBe(slider.textInput);
		expect(slider.textInput.value).toBe('4.');
		expect(menu.control(view, 'aliased_off')).toBeUndefined();
		slider.textInput.value = '5';
		slider.textInput.blur();
		await menu.flush();
		expect(menu.control(view, 'aliased_zero')).toBeUndefined();
		expect(menu.data.aliased_zero).toBeUndefined();
	});

	test('does not move a focused group when an earlier group disappears or reappears', async () => {
		const menu = loadMenu({ up_next_autoplay: false, aliased_zero: 3 }, fixture);
		const view = menu.open();
		await menu.flush();
		const slider = menu.control(view, 'aliased_zero');
		slider.textInput.focus();
		slider.textInput.value = '4.';
		menu.chrome.storage.local.remove('up_next_autoplay');
		await menu.flush();
		expect(menu.document.activeElement).toBe(slider.textInput);
		menu.chrome.storage.local.set({ up_next_autoplay: false });
		await menu.flush();
		expect(menu.document.activeElement).toBe(slider.textInput);
		expect(slider.textInput.value).toBe('4.');
	});

	test('does not remove a dragged slider at its default until pointer release', async () => {
		const menu = loadMenu({ aliased_zero: 3 }, fixture);
		const view = menu.open();
		await menu.flush();
		const slider = menu.control(view, 'aliased_zero');
		menu.event(slider.input, 'pointerdown');
		slider.input.value = '5';
		menu.event(slider.input, 'input');
		await menu.flush();
		expect(menu.control(view, 'aliased_zero')).toBe(slider);
		menu.event(menu.window, 'pointerup');
		await menu.flush();
		expect(menu.control(view, 'aliased_zero')).toBeUndefined();
	});

	test('resets a shortcut through the real modal and removes it after closing the editor', async () => {
		const menu = loadMenu({ shortcut_quality_720p: { keys: {65: {key: 'a'}} } });
		const view = menu.open();
		await menu.flush();
		const shortcut = menu.control(view, 'shortcut_quality_720p');
		shortcut.click();
		const modal = [...menu.document.querySelectorAll('.satus-modal')].find(element => element.parent === shortcut);
		expect(modal).toBeDefined();
		menu.chrome.storage.local.set({ unrelated: true });
		await menu.flush();
		expect(menu.control(view, 'shortcut_quality_720p')).toBe(shortcut);
		expect(modal.isConnected).toBe(true);
		modal.skeleton.actions.reset.rendered.click();
		await menu.flush();
		expect(menu.control(view, 'shortcut_quality_720p')).toBeUndefined();
		expect(menu.data.shortcut_quality_720p).toBeUndefined();
		expect(menu.window.listeners.get('keydown')).toHaveLength(0);
	});

	test('shows only the selected nondefault radio option from the real theme factories', async () => {
		const menu = loadMenu({ theme: 'dark' });
		const view = menu.open();
		await menu.flush();
		const radios = menu.controls(view).filter(control => control.componentName === 'radio');
		expect(radios).toHaveLength(1);
		expect(radios[0].nativeControl.value).toBe('dark');
		expect(radios[0].nativeControl.checked).toBe(true);
		menu.chrome.storage.local.set({ theme: 'light' });
		await menu.flush();
		expect(menu.controls(view)).toHaveLength(0);
	});

	test('retains source radio defaults when editing a filtered radio group', async () => {
		const menu = loadMenu({ choice: '2' }, `extension.skeleton.main.layers.section.fixture = {
			component: 'button', category: true, text: 'Fixture', on: { click: { component: 'section',
				zero: {component: 'label', text: 'Zero', radio: {component: 'radio', group: 'choice', value: 0, checked: true}},
				two: {component: 'label', text: 'Two', radio: {component: 'radio', group: 'choice', value: 2}}
			} }
		};`);
		const view = menu.open();
		await menu.flush();
		const radio = menu.control(view, 'choice');
		expect(radio.nativeControl.checked).toBe(true);
		menu.event(radio.nativeControl, 'change');
		await menu.flush();
		expect(menu.data.choice).toBe('2');
		expect(menu.chrome.storage.local.remove).not.toHaveBeenCalled();
	});

	test('discovers a directly named radio control without treating its section as another radio', async () => {
		const menu = loadMenu({ direct_choice: 'two' }, `extension.skeleton.main.layers.section.fixture = {
			component: 'button', category: true, text: 'Fixture', on: { click: { component: 'section',
				first: {component: 'radio', text: 'First', group: 'direct_choice', value: 'one', checked: true},
				radio: {component: 'radio', text: 'Second', group: 'direct_choice', value: 'two'}
			} }
		};`);
		const view = menu.open();
		await menu.flush();
		const radios = menu.controls(view).filter(control => control.componentName === 'radio');
		expect(radios).toHaveLength(1);
		expect(radios[0].nativeControl.checked).toBe(true);
		menu.event(radios[0].nativeControl, 'change');
		await menu.flush();
		expect(menu.data.direct_choice).toBe('two');
		expect(menu.chrome.storage.local.remove).not.toHaveBeenCalled();
	});

	test('does not change the original skeleton or its parent pointers while rendering/editing Active Features', async () => {
		const menu = loadMenu({ binding: {keys: {66: {key: 'b'}}} }, fixture);
		const original = menu.extension.skeleton.main.layers.section.fixture.on.click.binding;
		const parent = original.parentObject;
		const keys = Object.keys(original);
		const view = menu.open();
		await menu.flush();
		const shortcut = menu.control(view, 'binding');
		expect(shortcut.skeleton).not.toBe(original);
		expect(shortcut.skeleton.value).not.toBe(original.value);
		expect(original.parentObject).toBe(parent);
		expect(Object.keys(original)).toEqual(keys);
	});

	test('refreshes external stored values without echoing writes or replacing unaffected controls', async () => {
		const menu = loadMenu({ aliased_zero: 3, select: '2' }, fixture);
		const view = menu.open();
		await menu.flush();
		const slider = menu.control(view, 'aliased_zero'), select = menu.control(view, 'select');
		menu.chrome.storage.local.set({ aliased_zero: 4 });
		await menu.flush();
		expect(menu.control(view, 'aliased_zero')).toBe(slider);
		expect(menu.control(view, 'select')).toBe(select);
		expect(slider.textInput.value).toBe('4');
		expect(menu.chrome.storage.local.set).toHaveBeenCalledTimes(1);
		expect(jest.getTimerCount()).toBe(0);
	});

	test('keeps static select controls stable despite Satus parent references on their options', async () => {
		const menu = loadMenu({ explicit: 'first' }, fixture);
		const view = menu.open();
		await menu.flush();
		const select = menu.control(view, 'explicit');
		const source = menu.extension.skeleton.main.layers.section.fixture.on.click.explicit;
		expect(source.options.parentObject).toBe(source);
		menu.chrome.storage.local.set({ unrelated: true });
		await menu.flush();
		expect(menu.control(view, 'explicit')).toBe(select);
		expect(select.value).toBe('first');
		expect(menu.chrome.storage.local.set).toHaveBeenCalledTimes(1);
		expect(jest.getTimerCount()).toBe(0);
	});

	test('clears the displayed list when all preferences are reset', async () => {
		const menu = loadMenu({ aliased_off: true, aliased_on: false, empty: {wheel: 1} }, fixture);
		const view = menu.open();
		await menu.flush();
		menu.satus.storage.clear();
		await menu.flush();
		expect(menu.controls(view)).toHaveLength(0);
		expect(view.textContent).toBe('empty');
		expect(menu.data).toEqual({});
	});

	test('ignores changes from another storage area while the panel is open', async () => {
		const menu = loadMenu({ aliased_off: true }, fixture);
		const view = menu.open();
		await menu.flush();
		for (const listener of menu.storageListeners) listener({ aliased_off: {newValue: false} }, 'sync');
		await menu.flush();
		expect(menu.control(view, 'aliased_off').dataset.value).toBe('true');
		expect(menu.satus.storage.get('aliased_off')).toBe(true);
	});

	test('synchronizes storage once per event and does not undo another subscriber\'s write', async () => {
		const menu = loadMenu({}, fixture);
		const unsubscribe = menu.satus.storage.onchanged(function (key, value) {
			if (key === 'aliased_off' && value === true) menu.satus.storage.set(key, false);
		});
		const values = [];
		const stop = menu.satus.storage.onchanged(function (key) {
			if (key === 'aliased_off') values.push(menu.satus.storage.get(key));
		});
		const view = menu.open();
		await menu.flush();
		menu.chrome.storage.local.set({ aliased_off: true });
		await menu.flush();
		expect(values).toEqual([false, false]);
		expect(menu.control(view, 'aliased_off')).toBeUndefined();
		expect(menu.chrome.storage.local.set).toHaveBeenCalledTimes(2);
		menu.layers.back();
		await menu.flush();
		expect(menu.storageListeners.size).toBe(1);
		unsubscribe();
		stop();
		expect(menu.storageListeners.size).toBe(0);
	});

	test.each([undefined, 1, 2])('keeps the configured speed %j directly below Force speed without initial storage writes', async speed => {
		const stored = { player_forced_playback_speed: true, player_force_speed_on_music: true, player_dont_speed_education: true };
		if (speed !== undefined) stored.player_playback_speed = speed;
		const menu = loadMenu(stored);
		const original = menu.extension.skeleton.main.layers.section.player.on.click.section_1;
		const order = Object.keys(original);
		const view = menu.open();
		await menu.flush();
		const force = menu.control(view, 'player_forced_playback_speed');
		const slider = menu.control(view, 'player_playback_speed');
		expect(force.nextElementSibling).toBe(slider);
		expect(slider.textInput.value).toBe(String(speed ?? 1));
		expect(menu.chrome.storage.local.set).not.toHaveBeenCalled();
		expect(menu.chrome.storage.local.remove).not.toHaveBeenCalled();
		expect(Object.keys(original)).toEqual(order);
		force.click();
		await menu.flush();
		expect(menu.control(view, 'player_forced_playback_speed')).toBeUndefined();
		if (speed === 2) expect(menu.control(view, 'player_playback_speed')).toBe(slider);
		else expect(menu.control(view, 'player_playback_speed')).toBeUndefined();
	});

	test('keeps the speed companion editable when reset to its default and follows external changes', async () => {
		const menu = loadMenu({ player_forced_playback_speed: true, player_playback_speed: 2 });
		const view = menu.open();
		await menu.flush();
		const slider = menu.control(view, 'player_playback_speed');
		slider.input.value = '1';
		menu.event(slider.input, 'input');
		await menu.flush();
		expect(menu.control(view, 'player_playback_speed')).toBe(slider);
		expect(slider.textInput.value).toBe('1');
		expect(menu.data.player_playback_speed).toBeUndefined();
		menu.chrome.storage.local.set({ player_playback_speed: 1.5 });
		await menu.flush();
		expect(slider.textInput.value).toBe('1.5');
		expect(menu.control(view, 'player_forced_playback_speed').nextElementSibling).toBe(slider);
	});

	test('renders a stored default slider without deleting the preference or firing a change', async () => {
		const menu = loadMenu({ player_playback_speed: 1 });
		const changed = jest.fn();
		const slider = menu.satus.render({ component: 'slider', value: 1, max: 4, on: { change: changed } }, menu.document.body, 'player_playback_speed');
		await menu.flush();
		expect(slider.textInput.value).toBe('1');
		expect(menu.chrome.storage.local.set).not.toHaveBeenCalled();
		expect(menu.chrome.storage.local.remove).not.toHaveBeenCalled();
		expect(changed).not.toHaveBeenCalled();
	});

	test('removes subscriptions and global input listeners when the layer is left, including repeated visits', async () => {
		const menu = loadMenu({ aliased_zero: 3 }, fixture);
		for (let index = 0; index < 3; index++) {
			menu.open();
			await menu.flush();
			expect(menu.storageListeners.size).toBe(1);
			menu.layers.back();
			await menu.flush();
			expect(menu.storageListeners.size).toBe(0);
			expect(menu.window.listeners.get('pointerup')).toHaveLength(0);
			expect([...menu.observers].filter(observer => observer.targets.length)).toHaveLength(0);
		}
	});

	test('cleans up when the view is detached directly and ignores later storage updates', async () => {
		const menu = loadMenu({ aliased_off: true }, fixture);
		const view = menu.open();
		await menu.flush();
		view.remove();
		await menu.flush();
		expect(menu.storageListeners.size).toBe(0);
		menu.chrome.storage.local.set({ aliased_off: false });
		await menu.flush();
		expect(jest.getTimerCount()).toBe(0);
	});

	test('closes only the view\'s shortcut editor and releases its key listeners when navigating away', async () => {
		const menu = loadMenu({ shortcut_quality_720p: { keys: {65: {key: 'a'}} } });
		const view = menu.open();
		await menu.flush();
		const shortcut = menu.control(view, 'shortcut_quality_720p');
		shortcut.click();
		const modal = [...menu.document.querySelectorAll('.satus-modal')].find(element => element.parent === shortcut);
		const foreign = menu.satus.render({ component: 'modal', text: 'Unrelated dialog' }, menu.extension.skeleton.rendered);
		expect(menu.window.listeners.get('keydown')).toHaveLength(1);
		menu.layers.back();
		await menu.flush();
		expect(modal.isConnected).toBe(false);
		expect(foreign.isConnected).toBe(true);
		expect(menu.window.listeners.get('keydown')).toHaveLength(0);
		expect(menu.window.listeners.get('wheel')).toHaveLength(0);
		expect(menu.storageListeners.size).toBe(0);
		expect(menu.data.shortcut_quality_720p).toEqual({ keys: {65: {key: 'a'}} });
	});
});
