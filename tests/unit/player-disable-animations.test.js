// Test for Issue #4458: Disable animations for the player and its context menus
//
// The feature is CSS-only: core.js mirrors every storage key onto <html> as
// it-<key-with-dashes>, and player.css gates on that attribute. The load-bearing
// invariant is that the attribute the runtime writes and the attribute the CSS
// reads are the same string, so this derives the name from the menu entry and
// runs the real core.js mirroring code instead of hardcoding either side.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '../..');
const menuPath = path.join(root, 'menu/skeleton-parts/player.js');
const cssPath = path.join(root, 'js&css/extension/www.youtube.com/appearance/player/player.css');
const corePath = path.join(root, 'js&css/extension/core.js');
const messagesPath = path.join(root, '_locales/en/messages.json');
const manifestPath = path.join(root, 'manifest.json');

const menuSource = fs.readFileSync(menuPath, 'utf8');
const cssSource = fs.readFileSync(cssPath, 'utf8');
const coreSource = fs.readFileSync(corePath, 'utf8');
const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));

function slice (source, startMarker, endMarker) {
	const start = source.indexOf(startMarker);

	expect(start).toBeGreaterThan(-1);

	if (endMarker === undefined) {
		return source.slice(start);
	}

	const end = source.indexOf(endMarker, start + startMarker.length);

	expect(end).toBeGreaterThan(start);

	return source.slice(start, end);
}

// The switch as the menu actually declares it, key included.
const entryMatch = menuSource.match(/([A-Za-z0-9_]+):\s*\{[^{}]*text:\s*['"]playerDisableAnimations['"][^{}]*\}/);
const entry = entryMatch ? entryMatch[0] : '';
const skeletonKey = entryMatch ? entryMatch[1] : '';
const storageOverride = entry.match(/storage:\s*['"]([^'"]+)['"]/);
const storageKey = storageOverride ? storageOverride[1] : skeletonKey;
const expectedAttribute = 'it-' + storageKey.replace(/_/g, '-');

// The block of CSS this feature owns, so assertions cannot be satisfied by an
// unrelated rule elsewhere in the file.
const blockStart = cssSource.indexOf('# DISABLE PLAYER ANIMATIONS');
const block = blockStart === -1 ? '' : cssSource.slice(blockStart);
const gatedSelectors = block.match(/html\[[^\]]+\][^{,]*/g) || [];

function runCore (storedItems, changes) {
	const attributes = {};
	const listeners = [];
	const documentElement = {
		setAttribute: function (name, value) {
			attributes[name] = String(value);
		},
		hasAttribute: function () {
			return false;
		}
	};
	const context = vm.createContext({
		document: { documentElement },
		chrome: {
			storage: {
				onChanged: {
					addListener: function (listener) {
						listeners.push(listener);
					}
				},
				local: {
					get: function (callback) {
						callback(storedItems);
					},
					set: function () {}
				}
			}
		}
	});

	vm.runInContext('var extension = { storage: { data: {} }, features: {}, events: { trigger: function () {} }, messages: { send: function () {} } };', context);
	vm.runInContext(slice(coreSource, 'extension.camelize = function (string) {', 'extension.events.on = function'), context);
	vm.runInContext(slice(coreSource, 'extension.storage.listener = function () {', 'extension.storage.load = function'), context);
	vm.runInContext(slice(coreSource, 'extension.storage.load = function (callback) {'), context);
	vm.runInContext('extension.storage.listener(); extension.storage.load();', context);

	if (changes) {
		listeners.forEach(function (listener) {
			listener(changes);
		});
	}

	return { attributes };
}

describe('Disable player animations (#4458)', () => {
	describe('menu entry', () => {
		test('the switch exists in the player section', () => {
			expect(entryMatch).not.toBeNull();
			expect(skeletonKey.length).toBeGreaterThan(0);
		});

		test('it is a switch, not a button or select', () => {
			expect(entry).toMatch(/component:\s*['"]switch['"]/);
		});

		test('the text key is the camelize of the storage key, as the wiki requires', () => {
			const camelized = storageKey.replace(/[_-]([a-z])/g, function (_, letter) {
				return letter.toUpperCase();
			});

			expect(entry).toContain("text: '" + camelized + "'");
		});

		test('it carries search tags so people can find it by "animation" or "performance"', () => {
			const tags = entry.match(/tags:\s*['"]([^'"]+)['"]/);

			expect(tags).not.toBeNull();
			expect(tags[1].toLowerCase()).toContain('animation');
			expect(tags[1].toLowerCase()).toContain('menu');
		});

		test('it defaults to off, so existing installs keep their animations', () => {
			expect(entry).not.toMatch(/value:\s*true/);
		});
	});

	describe('translation', () => {
		test('the text key resolves to a non-empty English message', () => {
			expect(messages.playerDisableAnimations).toBeDefined();
			expect(typeof messages.playerDisableAnimations.message).toBe('string');
			expect(messages.playerDisableAnimations.message.trim().length).toBeGreaterThan(0);
		});
	});

	describe('runtime writes the attribute the CSS reads', () => {
		test('flipping the switch on sets it-<key> to "true" on <html>', () => {
			const result = runCore({}, { [storageKey]: { newValue: true } });

			expect(result.attributes[expectedAttribute]).toBe('true');
		});

		test('flipping it back off sets the same attribute to "false"', () => {
			const result = runCore({}, { [storageKey]: { newValue: false } });

			expect(result.attributes[expectedAttribute]).toBe('false');
		});

		test('a stored value is mirrored on page load, without any toggle click', () => {
			const result = runCore({ [storageKey]: true });

			expect(result.attributes[expectedAttribute]).toBe('true');
		});
	});

	describe('CSS', () => {
		test('player.css is injected as a content script, so the rules reach the page', () => {
			const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
			const injected = manifest.content_scripts.some(function (script) {
				return (script.css || []).some(function (file) {
					return path.normalize(file) === path.normalize('js&css/extension/www.youtube.com/appearance/player/player.css');
				});
			});

			expect(injected).toBe(true);
		});

		test('the feature owns a block of rules in player.css', () => {
			expect(blockStart).toBeGreaterThan(-1);
			expect(gatedSelectors.length).toBeGreaterThan(0);
		});

		test('every selector gates on the exact attribute core.js writes', () => {
			gatedSelectors.forEach(function (selector) {
				expect(selector).toContain("html[" + expectedAttribute + "='true']");
			});
		});

		test('no selector uses a bare attribute gate, which would fire for "false" too', () => {
			expect(block).not.toMatch(new RegExp('html\\[' + expectedAttribute + '\\](?!=)'));
		});

		test('the rules kill both transitions and animations, with !important', () => {
			expect(block).toMatch(/transition:\s*none\s*!important/);
			expect(block).toMatch(/animation:\s*none\s*!important/);
		});

		test('the player itself is covered', () => {
			expect(gatedSelectors.join(' ')).toContain('#movie_player');
		});

		test('the player context menus are covered, including their rows', () => {
			const joined = gatedSelectors.join(' ');

			expect(joined).toContain('.ytp-settings-menu');
			expect(joined).toContain('.ytp-menuitem');
		});

		test('descendants are covered, since the animated nodes are the children', () => {
			const joined = gatedSelectors.join(' ');

			expect(joined).toContain('#movie_player *');
			expect(joined).toContain('.ytp-settings-menu *');
		});

		test('the block declares nothing but transition/animation, so it cannot hide or move anything', () => {
			const declarations = block.slice(block.indexOf('{') + 1, block.indexOf('}'));
			const properties = declarations.split(';').map(function (part) {
				return part.split(':')[0].trim();
			}).filter(Boolean);

			expect(properties.length).toBeGreaterThan(0);
			properties.forEach(function (property) {
				expect(['transition', 'animation']).toContain(property);
			});
		});
	});
});