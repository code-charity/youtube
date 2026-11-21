const fs = require('fs');
const path = require('path');
const vm = require('vm');

function readSource (file) {
	return fs.readFileSync(path.join(__dirname, '../..', file), 'utf8');
}

const playerSource = readSource('js&css/web-accessible/www.youtube.com/player.js');
const start = playerSource.indexOf('ImprovedTube.subtitlesUserSettings = function');
const end = playerSource.indexOf('ImprovedTube.subtitlesDisableLyrics = function', start);
if (start < 0 || end < 0) throw new Error('Subtitle user settings source was not found');

const settingsScript = new vm.Script(playerSource.slice(start, end));
const pageScript = new vm.Script(readSource('js&css/web-accessible/core.js'));
const extensionScript = new vm.Script(readSource('js&css/extension/core.js'));
const satusScript = new vm.Script(readSource('menu/satus.js'));
const menuScript = new vm.Script(readSource('menu/skeleton-parts/player.js'));

const youtubeSettings = {
	fontFamily: 7,
	color: '#ff0',
	fontSizeIncrement: 2,
	background: '#080808',
	backgroundOpacity: 0.75,
	windowColor: '#080808',
	windowOpacity: 0.5,
	charEdgeStyle: 4,
	textOpacity: 1,
	otherSetting: 'preserved'
};

const zeroSettings = [
	['subtitles_font_size', 'fontSizeIncrement'],
	['subtitles_background_opacity', 'backgroundOpacity'],
	['subtitles_window_opacity', 'windowOpacity'],
	['subtitles_character_edge_style', 'charEdgeStyle'],
	['subtitles_font_opacity', 'textOpacity']
];

const nonzeroSettings = [
	['subtitles_font_family', 'fontFamily', '4', 4],
	['subtitles_font_color', 'color', '#fff', '#fff'],
	['subtitles_font_size', 'fontSizeIncrement', '-2', -2],
	['subtitles_background_color', 'background', '#000', '#000'],
	['subtitles_background_opacity', 'backgroundOpacity', 25, 0.25],
	['subtitles_window_color', 'windowColor', '#0ff', '#0ff'],
	['subtitles_window_opacity', 'windowOpacity', 100, 1],
	['subtitles_character_edge_style', 'charEdgeStyle', '3', 3],
	['subtitles_font_opacity', 'textOpacity', '50', 0.5]
];

// Only DOM operations used by the production menu; native control values are strings.
class MenuElement extends EventTarget {
	constructor (tagName) {
		super();
		this.childNodes = [];
		this.style = {};
		this.dataset = {};
		if (['input', 'option', 'select'].includes(tagName)) {
			let value = '';
			Object.defineProperty(this, 'value', {
				get: () => value,
				set: next => { value = String(next); }
			});
		}
		if (tagName === 'select') {
			Object.defineProperties(this, {
				options: {get: () => this.childNodes},
				selectedIndex: {get: () => this.options.findIndex(option => option.value === this.value)}
			});
		}
	}

	appendChild (node) {
		node.parentNode = this;
		this.childNodes.push(node);
		return node;
	}

	remove () {
		this.parentNode.childNodes.splice(this.parentNode.childNodes.indexOf(this), 1);
	}

	get text () {
		return this.childNodes.map(node => node.textContent).join('');
	}
}

function createContext (storage = {}, settings = youtubeSettings) {
	const document = new EventTarget();
	document.createElement = tagName => new MenuElement(tagName);
	document.createTextNode = textContent => Object.assign(new MenuElement('#text'), {textContent});
	document.body = new MenuElement('body');
	document.documentElement = new MenuElement('html');
	document.documentElement.setAttribute = jest.fn();
	document.querySelector = selector => document.documentElement.childNodes.find(node => '#' + node.id === selector) || null;
	const storageListeners = [];
	const stored = {...storage};
	function changeSetting (key, value) {
		if (value === undefined) delete stored[key];
		else stored[key] = value;
		for (const listener of storageListeners) listener({[key]: {newValue: value}}, 'local');
	}
	const context = vm.createContext({
		document,
		CustomEvent,
		Element: MenuElement,
		HTMLDocument: EventTarget,
		localStorage: {},
		console: {error: jest.fn()},
		chrome: {
			storage: {
				onChanged: {addListener: listener => storageListeners.push(listener)},
				local: {
					set: jest.fn((items, callback) => {
						for (const [key, value] of Object.entries(items)) changeSetting(key, value);
						if (callback) callback();
					}),
					remove: jest.fn(key => changeSetting(key, undefined))
				}
			}
		}
	});
	pageScript.runInContext(context);
	extensionScript.runInContext(context);
	settingsScript.runInContext(context);
	context.extension.messages.create();
	context.extension.messages.listener();
	context.extension.storage.listener();

	const player = {
		getSubtitlesUserSettings: jest.fn(() => settings && {...settings}),
		updateSubtitlesUserSettings: jest.fn()
	};
	const improvedTube = context.ImprovedTube;
	improvedTube.storage = {...storage};
	improvedTube.elements.player = player;

	return {
		improvedTube,
		player,
		stored,
		changeSetting,
		loadMenu () {
			satusScript.runInContext(context);
			context.satus.storage.data = {...stored};
			context.extension.skeleton = {main: {layers: {section: {}}}};
			menuScript.runInContext(context);
			const definitions = context.extension.skeleton.main.layers.section.player.on.click.section_1.subtitles.on.click;
			return {
				definitions,
				render: key => context.satus.render(definitions[key], document.body, key)
			};
		}
	};
}

describe('subtitle user settings', () => {
	describe.each([0, '0'])('configured zero (%p)', value => {
		test.each(zeroSettings)('applies %s without changing other YouTube settings', (key, setting) => {
			const {improvedTube, player} = createContext({[key]: value});

			improvedTube.subtitlesUserSettings();

			expect(player.updateSubtitlesUserSettings).toHaveBeenCalledTimes(1);
			expect(player.updateSubtitlesUserSettings).toHaveBeenCalledWith({...youtubeSettings, [setting]: 0});
			expect(improvedTube.storage).toEqual({[key]: value});
		});
	});

	test.each(nonzeroSettings)('preserves the conversion for %s', (key, setting, value, expected) => {
		const {improvedTube, player} = createContext({[key]: value});

		improvedTube.subtitlesUserSettings();

		expect(player.updateSubtitlesUserSettings).toHaveBeenCalledWith({...youtubeSettings, [setting]: expected});
	});

	test.each([undefined, null, false, ''])('does not treat %p as an explicit zero override', value => {
		const storage = Object.fromEntries(nonzeroSettings.map(([key]) => [key, value]));
		const {improvedTube, player} = createContext(storage);

		improvedTube.subtitlesUserSettings();

		expect(player.getSubtitlesUserSettings).not.toHaveBeenCalled();
		expect(player.updateSubtitlesUserSettings).not.toHaveBeenCalled();
	});

	test('leaves YouTube settings alone when no overrides are stored', () => {
		const {improvedTube, player} = createContext();

		improvedTube.subtitlesUserSettings();

		expect(player.getSubtitlesUserSettings).not.toHaveBeenCalled();
		expect(player.updateSubtitlesUserSettings).not.toHaveBeenCalled();
	});

	test('applies zero alongside other overrides while skipping unset and false values', () => {
		const {improvedTube, player} = createContext({
			subtitles_font_size: 0,
			subtitles_font_color: '#000',
			subtitles_background_opacity: false,
			subtitles_window_opacity: null,
			subtitles_character_edge_style: '',
			subtitles_font_opacity: undefined
		});

		improvedTube.subtitlesUserSettings();

		expect(player.updateSubtitlesUserSettings).toHaveBeenCalledWith({
			...youtubeSettings, fontSizeIncrement: 0, color: '#000'
		});
	});

	test.each(['player', 'getSubtitlesUserSettings', 'updateSubtitlesUserSettings'])('tolerates an unavailable %s', missing => {
		const {improvedTube, player} = createContext({subtitles_font_size: 0});
		if (missing === 'player') delete improvedTube.elements.player;
		else delete player[missing];

		expect(() => improvedTube.subtitlesUserSettings()).not.toThrow();
	});

	test('does not update when YouTube returns no subtitle settings', () => {
		const {improvedTube, player} = createContext({subtitles_font_size: 0}, null);

		improvedTube.subtitlesUserSettings();

		expect(player.updateSubtitlesUserSettings).not.toHaveBeenCalled();
	});
});

describe('subtitle settings storage dispatch', () => {
	test.each(zeroSettings)('applies numeric zero from a %s storage change', (key, setting) => {
		const {improvedTube, player, changeSetting} = createContext({[key]: 2});

		changeSetting(key, 0);

		expect(improvedTube.storage[key]).toBe(0);
		expect(player.updateSubtitlesUserSettings).toHaveBeenCalledTimes(1);
		expect(player.updateSubtitlesUserSettings).toHaveBeenCalledWith({...youtubeSettings, [setting]: 0});
	});

	test.each([undefined, null, false, ''])('stops overriding after a setting becomes %p', value => {
		const {improvedTube, player, changeSetting} = createContext();
		changeSetting('subtitles_font_size', 0);
		player.updateSubtitlesUserSettings.mockClear();

		changeSetting('subtitles_font_size', value);

		expect(improvedTube.storage.subtitles_font_size).toBe(value);
		expect(player.updateSubtitlesUserSettings).not.toHaveBeenCalled();
	});
});

describe('subtitle settings menu storage', () => {
	test.each([
		['subtitles_font_size', 'fontSizeIncrement', '100%'],
		['subtitles_character_edge_style', 'charEdgeStyle', 'none']
	])('applies the string zero selected for %s', (key, setting, text) => {
		const {improvedTube, player, stored, loadMenu} = createContext({[key]: 2});
		const {definitions, render} = loadMenu();
		expect(definitions[key].options.find(option => option.text === text).value).toBe(0);
		const component = render(key);

		component.selectElement.value = '0';
		component.selectElement.dispatchEvent(new Event('change'));

		expect(stored[key]).toBe('0');
		expect(improvedTube.storage[key]).toBe('0');
		expect(player.updateSubtitlesUserSettings).toHaveBeenCalledTimes(1);
		expect(player.updateSubtitlesUserSettings).toHaveBeenCalledWith({...youtubeSettings, [setting]: 0});
	});

	test.each([
		['subtitles_background_opacity', 'backgroundOpacity'],
		['subtitles_font_opacity', 'textOpacity']
	])('applies numeric zero saved by the %s slider', (key, setting) => {
		const {improvedTube, player, stored, loadMenu} = createContext({[key]: 50});
		const component = loadMenu().render(key);

		component.input.value = '0';
		component.input.dispatchEvent(new Event('input'));

		expect(stored[key]).toBe(0);
		expect(improvedTube.storage[key]).toBe(0);
		expect(player.updateSubtitlesUserSettings).toHaveBeenCalledTimes(1);
		expect(player.updateSubtitlesUserSettings).toHaveBeenCalledWith({...youtubeSettings, [setting]: 0});
	});

	test.each([
		['subtitles_background_opacity', 75],
		['subtitles_window_opacity', 0],
		['subtitles_font_opacity', 100]
	])('removes the override when the %s slider returns to its default', (key, value) => {
		const {improvedTube, player, stored, loadMenu} = createContext({[key]: 50});
		const {definitions, render} = loadMenu();
		expect(definitions[key].value).toBe(value);
		const component = render(key);

		component.input.value = String(value);
		component.input.dispatchEvent(new Event('input'));

		expect(stored).not.toHaveProperty(key);
		expect(improvedTube.storage[key]).toBeUndefined();
		expect(player.updateSubtitlesUserSettings).not.toHaveBeenCalled();
	});

	test.each(zeroSettings)('does not save an override when an unconfigured %s control is rendered', key => {
		const {improvedTube, player, stored, loadMenu} = createContext();

		loadMenu().render(key);

		expect(stored).toEqual({});
		expect(improvedTube.storage).toEqual({});
		expect(player.updateSubtitlesUserSettings).not.toHaveBeenCalled();
	});
});
