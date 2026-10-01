const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FUNCTIONS_SRC = path.join(__dirname, '../../js&css/web-accessible/functions.js');
const PLAYER_SRC = path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js');

function extractPlayerRepeatButton() {
	const source = fs.readFileSync(PLAYER_SRC, 'utf8');
	const signature = 'ImprovedTube.playerRepeatButton = function () {';
	const start = source.indexOf(signature);

	if (start < 0) {
		throw new Error('playerRepeatButton was not found');
	}

	let depth = 0;

	for (let index = source.indexOf('{', start); index < source.length; index++) {
		if (source[index] === '{') depth++;
		if (source[index] === '}' && --depth === 0) {
			return source.slice(start, index + 1);
		}
	}

	throw new Error('playerRepeatButton is not balanced');
}

function matches(element, selector, Element) {
	if (!(element instanceof Element)) return false;
	if (selector.charAt(0) === '.') {
		return element.classList.contains(selector.slice(1));
	}
	if (selector.charAt(0) === '#') {
		return element.id === selector.slice(1);
	}
	return element.nodeName === selector.toUpperCase();
}

function createDom() {
	const allElements = [];

	class Element {
		constructor(tagName) {
			this.nodeName = String(tagName || 'DIV').toUpperCase();
			this.id = '';
			this.className = '';
			this.childNodes = [];
			this.parentNode = null;
			this.style = {};
			this.dataset = {};
			this.attributes = {};
			this.listeners = {};
			allElements.push(this);
		}

		get classList() {
			const self = this;

			return {
				contains(cls) {
					return String(self.className || '').split(/\s+/).includes(cls);
				}
			};
		}

		get children() {
			return this.childNodes.filter(node => node instanceof Element);
		}

		appendChild(child) {
			return this.insertBefore(child, null);
		}

		insertBefore(node, reference) {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}

			node.parentNode = this;
			const index = reference ? this.childNodes.indexOf(reference) : -1;

			if (index === -1) {
				this.childNodes.push(node);
			} else {
				this.childNodes.splice(index, 0, node);
			}

			return node;
		}

		removeChild(child) {
			const index = this.childNodes.indexOf(child);

			if (index !== -1) {
				this.childNodes.splice(index, 1);
			}

			if (child.parentNode === this) {
				child.parentNode = null;
			}

			return child;
		}

		remove() {
			if (this.parentNode) {
				this.parentNode.removeChild(this);
			}
		}

		querySelector(selector) {
			return this.querySelectorAll(selector)[0] || null;
		}

		querySelectorAll(selector) {
			const found = [];
			const walk = (node) => {
				for (const child of node.childNodes || []) {
					if (matches(child, selector, Element)) found.push(child);
					walk(child);
				}
			};

			walk(this);
			return found;
		}

		addEventListener(type, listener) {
			(this.listeners[type] ||= []).push(listener);
		}

		setAttribute(name, value) {
			this.attributes[name] = String(value);
		}

		setAttributeNS(_namespace, name, value) {
			this.setAttribute(name, value);
		}

		getAttribute(name) {
			return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null;
		}

		hasAttribute(name) {
			return Object.prototype.hasOwnProperty.call(this.attributes, name);
		}

		removeAttribute(name) {
			delete this.attributes[name];
		}
	}

	class TextNode {
		constructor(text) {
			this.nodeName = '#text';
			this.textContent = text;
			this.parentNode = null;
		}
	}

	const document = {
		createElement: (tag) => new Element(tag),
		createElementNS: (_namespace, tag) => new Element(tag),
		createTextNode: (text) => new TextNode(text),
		querySelector: (selector) => allElements.find(element => matches(element, selector, Element)) || null,
		querySelectorAll: (selector) => allElements.filter(element => matches(element, selector, Element)),
		body: null,
		documentElement: null
	};

	document.body = new Element('body');
	document.documentElement = new Element('html');

	return {Element, TextNode, document};
}

// Load the production player handler and repeat-button factory. The movie-player
// fallback observer is the one registered on the player with subtree: true.
function loadPlayer(storage) {
	const {Element, TextNode, document} = createDom();
	const observers = [];
	const createdButtons = [];
	const originalCreateElement = document.createElement.bind(document);

	document.createElement = (tag) => {
		const element = originalCreateElement(tag);

		if (String(tag).toLowerCase() === 'button') {
			createdButtons.push(element);
		}

		return element;
	};

	class MutationObserver {
		constructor(callback) {
			this.callback = callback;
			this.disconnected = false;
			this.buttonAtDisconnect = undefined;
			observers.push(this);
		}

		observe(target, options) {
			this.target = target;
			this.options = options;
		}

		disconnect() {
			this.disconnected = true;
			const button = ImprovedTube.elements.buttons['it-repeat-button'];

			this.buttonAtDisconnect = button && button.parentNode ? button : null;
		}
	}

	const ImprovedTube = {
		storage: Object.assign({player_repeat_button: true}, storage),
		elements: {buttons: {}},
		playerSize() {},
		regex: {
			video_id: /(?:[?&]v=|embed\/|shorts\/)([^&?]{11})/
		}
	};

	const sandbox = {
		console,
		document,
		Element,
		ImprovedTube,
		MutationObserver
	};

	vm.createContext(sandbox);
	vm.runInContext(fs.readFileSync(FUNCTIONS_SRC, 'utf8'), sandbox);
	vm.runInContext(extractPlayerRepeatButton(), sandbox);

	return {ImprovedTube, Element, TextNode, document, observers, createdButtons};
}

function element(Element, tag, className) {
	const node = new Element(tag || 'div');

	if (className) node.className = className;
	return node;
}

function makePlayer(Element, parts = {}) {
	const player = element(Element, 'div');

	player.id = 'movie_player';
	player.className = parts.className || 'html5-video-player';
	player.appendChild(element(Element, 'video'));

	const controls = {};

	if (parts.left) {
		controls.left = element(Element, 'div', 'ytp-left-controls');
		player.appendChild(controls.left);
	}
	if (parts.right) {
		controls.right = element(Element, 'div', 'ytp-right-controls');
		player.appendChild(controls.right);
	}
	if (parts.thumbnail) {
		controls.thumbnail = element(Element, 'div', 'ytp-cued-thumbnail-overlay-image');
		player.appendChild(controls.thumbnail);
	}
	if (parts.subtitles) {
		controls.subtitles = element(Element, 'div', 'ytp-subtitles-button');
		player.appendChild(controls.subtitles);
	}

	return {player, controls};
}

function registerPlayer(env, player) {
	env.ImprovedTube.ytElementsHandler(player);

	const observer = env.observers.find(candidate => candidate.options && candidate.options.subtree);

	if (!observer) {
		throw new Error('movie-player fallback observer was not registered');
	}

	return observer;
}

function repeatButton(env) {
	return env.ImprovedTube.elements.buttons['it-repeat-button'] || null;
}

function childList(addedNodes) {
	return {type: 'childList', addedNodes};
}

// Same call the storage-changed dispatcher makes for camelizedKey playerRepeatButton.
function applyRepeatButtonSetting(improvedTube, enabled) {
	improvedTube.storage.player_repeat_button = enabled;
	improvedTube.playerRepeatButton();
}

describe('player repeat button late controls', () => {
	test('inserts exactly one repeat button when left controls arrive after setup', () => {
		const env = loadPlayer();
		const {player} = makePlayer(env.Element);
		const observer = registerPlayer(env, player);
		const left = element(env.Element, 'div', 'ytp-left-controls');

		env.ImprovedTube.playerRepeatButton();
		expect(repeatButton(env)).toBeNull();
		expect(env.createdButtons).toHaveLength(0);

		observer.callback([
			childList([new env.TextNode(' '), left])
		]);

		const button = repeatButton(env);

		expect(env.createdButtons).toHaveLength(1);
		expect(button).toBe(env.createdButtons[0]);
		expect(button.id).toBe('it-repeat-button');
		expect(button.className).toBe('ytp-button it-player-button');
		expect(button.dataset.title).toBe('Repeat');
		expect(button.parentNode).toBe(left);
		expect(left.querySelectorAll('#it-repeat-button')).toHaveLength(1);
		expect(env.ImprovedTube.elements.player_left_controls).toBe(left);
	});

	test('finds left controls nested inside an added wrapper', () => {
		const env = loadPlayer();
		const {player} = makePlayer(env.Element);
		const observer = registerPlayer(env, player);
		const wrapper = element(env.Element, 'div', 'ytp-chrome-bottom');
		const left = element(env.Element, 'div', 'ytp-left-controls');
		const decoy = element(env.Element, 'div', 'ytp-right-controls');

		wrapper.appendChild(decoy);
		wrapper.appendChild(left);
		env.ImprovedTube.playerRepeatButton();

		observer.callback([childList([wrapper])]);

		expect(env.createdButtons).toHaveLength(1);
		expect(repeatButton(env).parentNode).toBe(left);
		expect(decoy.querySelectorAll('#it-repeat-button')).toHaveLength(0);
		expect(env.ImprovedTube.elements.player_left_controls).toBe(left);
		expect(env.ImprovedTube.elements.player_right_controls).toBe(decoy);
	});

	test('retries before disconnecting when the rest of the player arrives in the same batch', () => {
		const env = loadPlayer();
		const {player} = makePlayer(env.Element);
		const observer = registerPlayer(env, player);
		const left = element(env.Element, 'div', 'ytp-left-controls');
		const right = element(env.Element, 'div', 'ytp-right-controls');
		const thumbnail = element(env.Element, 'div', 'ytp-cued-thumbnail-overlay-image');
		const subtitles = element(env.Element, 'div', 'ytp-subtitles-button');

		observer.callback([
			childList([right]),
			{type: 'attributes', target: player},
			childList([new env.TextNode('late'), left, thumbnail, subtitles])
		]);

		expect(observer.disconnected).toBe(true);
		expect(observer.buttonAtDisconnect).toBe(repeatButton(env));
		expect(observer.buttonAtDisconnect.parentNode).toBe(left);
		expect(env.createdButtons).toHaveLength(1);

		const thumbnailObserver = env.observers.find(candidate => candidate !== observer);

		expect(thumbnailObserver).toBeDefined();
		expect(thumbnailObserver.target).toBe(thumbnail);
		expect(thumbnailObserver.options).toEqual({
			attributes: true,
			attributeFilter: ['style']
		});
		expect(thumbnailObserver.disconnected).toBe(false);
		expect(observer.options).toEqual({childList: true, subtree: true});
	});

	test('shows the repeat button immediately when thumbnail or subtitles controls are still absent', () => {
		const env = loadPlayer();
		const {player} = makePlayer(env.Element);
		const observer = registerPlayer(env, player);
		const left = element(env.Element, 'div', 'ytp-left-controls');

		observer.callback([childList([left])]);

		expect(repeatButton(env).parentNode).toBe(left);
		expect(env.createdButtons).toHaveLength(1);
		expect(observer.disconnected).toBe(false);
		expect(env.observers).toHaveLength(1);
	});

	test('ignores text nodes and does not replace or recurse when the button insertion is delivered again', () => {
		const env = loadPlayer();
		const {player} = makePlayer(env.Element);
		const observer = registerPlayer(env, player);
		const left = element(env.Element, 'div', 'ytp-left-controls');
		const again = element(env.Element, 'div', 'ytp-left-controls');
		const originalInsertBefore = left.insertBefore.bind(left);
		let reentered = false;

		left.insertBefore = (node, reference) => {
			const inserted = originalInsertBefore(node, reference);

			if (!reentered) {
				reentered = true;
				observer.callback([
					childList([new env.TextNode('tooltip'), node, {}])
				]);
			}

			return inserted;
		};

		observer.callback([
			childList([new env.TextNode(''), {}, left, again])
		]);

		const button = repeatButton(env);

		expect(reentered).toBe(true);
		expect(env.createdButtons).toHaveLength(1);
		expect(button.parentNode).toBe(left);
		expect(env.ImprovedTube.elements.player_left_controls).toBe(left);

		button.style.opacity = 1;
		button.dataset.mode = 'looping';

		observer.callback([childList([new env.TextNode('unchanged')])]);
		observer.callback([childList([element(env.Element, 'div', 'ytp-progress-bar')])]);
		observer.callback([
			childList([new env.TextNode(' '), button, {}]),
			{type: 'attributes'}
		]);
		observer.callback([childList([again])]);

		expect(env.createdButtons).toHaveLength(1);
		expect(repeatButton(env)).toBe(button);
		expect(button.style.opacity).toBe(1);
		expect(button.dataset.mode).toBe('looping');
		expect(button.parentNode).toBe(left);
		expect(left.querySelectorAll('#it-repeat-button')).toHaveLength(1);
	});

	test('keeps an existing button and its state when controls are already present', () => {
		const env = loadPlayer();
		const {player, controls} = makePlayer(env.Element, {
			left: true,
			right: true,
			thumbnail: true,
			subtitles: true
		});
		const observer = registerPlayer(env, player);

		env.ImprovedTube.playerRepeatButton();

		const button = repeatButton(env);

		expect(button.parentNode).toBe(controls.left);
		expect(env.createdButtons).toHaveLength(1);

		button.style.opacity = 1;
		button.dataset.mode = 'looping';

		observer.callback([
			childList([
				new env.TextNode(' '),
				controls.left,
				button,
				element(env.Element, 'div', 'ytp-volume-panel')
			])
		]);

		expect(observer.disconnected).toBe(true);
		expect(env.createdButtons).toHaveLength(1);
		expect(repeatButton(env)).toBe(button);
		expect(button.style.opacity).toBe(1);
		expect(button.dataset.mode).toBe('looping');
		expect(button.parentNode).toBe(controls.left);
	});

	test('does not create a button while repeat is disabled, then creates one from the setting callback', () => {
		const env = loadPlayer({player_repeat_button: false});
		const {player} = makePlayer(env.Element);
		const observer = registerPlayer(env, player);
		const left = element(env.Element, 'div', 'ytp-left-controls');
		const right = element(env.Element, 'div', 'ytp-right-controls');
		const thumbnail = element(env.Element, 'div', 'ytp-cued-thumbnail-overlay-image');
		const subtitles = element(env.Element, 'div', 'ytp-subtitles-button');

		env.ImprovedTube.playerRepeatButton();
		observer.callback([childList([left, right, thumbnail, subtitles])]);

		expect(observer.disconnected).toBe(true);
		expect(repeatButton(env)).toBeNull();
		expect(env.createdButtons).toHaveLength(0);

		applyRepeatButtonSetting(env.ImprovedTube, true);

		expect(env.createdButtons).toHaveLength(1);
		expect(repeatButton(env).parentNode).toBe(left);
		expect(observer.disconnected).toBe(true);
	});

	test('does not create a button when repeat is turned off before late controls arrive', () => {
		const env = loadPlayer({player_repeat_button: true});
		const {player} = makePlayer(env.Element);
		const observer = registerPlayer(env, player);
		const left = element(env.Element, 'div', 'ytp-left-controls');

		env.ImprovedTube.playerRepeatButton();
		expect(repeatButton(env)).toBeNull();

		applyRepeatButtonSetting(env.ImprovedTube, false);
		observer.callback([childList([left])]);

		expect(repeatButton(env)).toBeNull();
		expect(env.createdButtons).toHaveLength(0);
		expect(observer.disconnected).toBe(false);

		applyRepeatButtonSetting(env.ImprovedTube, true);

		const button = repeatButton(env);

		expect(env.createdButtons).toHaveLength(1);
		expect(button.parentNode).toBe(left);

		button.style.opacity = 1;
		observer.callback([childList([new env.TextNode(''), button])]);

		expect(repeatButton(env)).toBe(button);
		expect(button.style.opacity).toBe(1);
		expect(env.createdButtons).toHaveLength(1);
	});

	test('toggles loop state from the real repeat button without creating another button', () => {
		const env = loadPlayer({below_player_loop: true});
		const {player} = makePlayer(env.Element);
		const observer = registerPlayer(env, player);
		const left = element(env.Element, 'div', 'ytp-left-controls');
		const below = element(env.Element, 'button');
		const belowIcon = element(env.Element, 'span');

		below.id = 'it-below-player-loop';
		below.appendChild(belowIcon);
		observer.callback([childList([left])]);

		const button = repeatButton(env);
		const video = env.ImprovedTube.elements.video;

		expect(video.hasAttribute('loop')).toBe(false);

		button.onclick();

		expect(video.hasAttribute('loop')).toBe(true);
		expect(button.style.opacity).toBe('1');
		expect(belowIcon.style.opacity).toBe('1');
		expect(env.createdButtons).toHaveLength(1);

		button.onclick();

		expect(video.hasAttribute('loop')).toBe(false);
		expect(button.style.opacity).toBe('.5');
		expect(belowIcon.style.opacity).toBe('.5');
		expect(repeatButton(env)).toBe(button);
		expect(env.createdButtons).toHaveLength(1);
	});
});
