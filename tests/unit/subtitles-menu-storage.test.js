const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Minimal DOM surface for the production Satus select and slider components.
class Element extends EventTarget {
	constructor (tagName) {
		super();
		this.style = {};
		this.dataset = {};
		this.childNodes = [];
		if (['input', 'option', 'select'].includes(tagName)) {
			let value = '';
			Object.defineProperty(this, 'value', {
				get: () => value,
				set: next => { value = String(next); }
			});
		}
	}

	appendChild (child) {
		child.parentNode = this;
		this.childNodes.push(child);
		return child;
	}

	remove () {
		this.parentNode.childNodes.splice(this.parentNode.childNodes.indexOf(this), 1);
	}

	get options () { return this.childNodes; }
	get selectedIndex () { return this.options.findIndex(option => option.value === this.value); }
	get text () { return this.childNodes.map(child => child.textContent).join(''); }
}

function createMenu (storage = {}) {
	const document = Object.assign(new EventTarget(), {
		createElement: tagName => new Element(tagName),
		createTextNode: text => Object.assign(new Element('#text'), {textContent: text}),
		body: new Element('body')
	});
	const local = {
		set: jest.fn((items, callback) => { if (callback) callback(); }),
		remove: jest.fn()
	};
	const context = vm.createContext({
		document,
		Element,
		HTMLDocument: EventTarget,
		CustomEvent,
		chrome: {storage: {local}},
		extension: {skeleton: {main: {layers: {section: {}}}}}
	});
	for (const file of ['menu/satus.js', 'menu/skeleton-parts/player.js']) {
		vm.runInContext(fs.readFileSync(path.join(__dirname, '../..', file), 'utf8'), context);
	}
	const satus = context.satus;
	satus.storage.data = {...storage};
	const menu = context.extension.skeleton.main.layers.section.player.on.click.section_1.subtitles.on.click;
	return {satus, menu, local, render: key => satus.render(menu[key], document.body, key)};
}

describe('subtitle menu storage contracts', () => {
	test.each([
		['subtitles_font_size', '100%'],
		['subtitles_character_edge_style', 'none']
	])('%s select keeps unset distinct from the string-zero option', (key, text) => {
		const {satus, menu, local, render} = createMenu();
		const component = render(key);
		const option = menu[key].options.find(option => option.text === text);
		expect(option.value).toBe(0);
		expect(satus.storage.get(key)).toBeUndefined();
		expect(local.set).not.toHaveBeenCalled();

		component.selectElement.value = option.value;
		component.selectElement.dispatchEvent(new Event('change'));

		expect(satus.storage.get(key)).toBe('0');
		expect(local.set).toHaveBeenLastCalledWith({[key]: '0'}, expect.any(Function));
	});

	test.each(['subtitles_background_opacity', 'subtitles_font_opacity'])('%s slider stores numeric zero', key => {
		const {satus, local, render} = createMenu();
		const component = render(key);
		expect(satus.storage.get(key)).toBeUndefined();

		component.input.value = 0;
		component.input.dispatchEvent(new Event('input'));

		expect(satus.storage.get(key)).toBe(0);
		expect(local.set).toHaveBeenLastCalledWith({[key]: 0}, expect.any(Function));
	});

	test('the window-opacity slider removes its default instead of storing an explicit zero', () => {
		const key = 'subtitles_window_opacity';
		const {satus, local, render} = createMenu({[key]: 50});
		const component = render(key);

		component.input.value = 0;
		component.input.dispatchEvent(new Event('input'));

		expect(satus.storage.get(key)).toBeUndefined();
		expect(local.remove).toHaveBeenCalledWith(key);
		expect(local.set).not.toHaveBeenCalled();
	});
});
