global.extension = {
	skeleton: {
		main: {
			layers: {
				section: {}
			}
		}
	}
};

global.satus = {
	storage: {
		get: jest.fn(),
		set: jest.fn(),
		onchanged: jest.fn()
	}
};

require('../../menu/skeleton-parts/appearance.js');
require('../../menu/skeleton-parts/player.js');

// Mirrors the dot-path walk satus.on() performs for string click handlers
// (menu/satus.js). Returns undefined as soon as a key is missing, which is
// what made the menu entry dead instead of opening the sub-section.
function resolveSkeletonPath(pathString) {
	const keys = pathString.match(/(["'`].+["'`]|[^.()]+)/g);
	let target = { skeleton: extension.skeleton };

	for (const key of keys) {
		if (target.skeleton && target.skeleton[key]) {
			target = target.skeleton[key];
		} else {
			target = target[key];
		}

		if (target === undefined) {
			return undefined;
		}
	}

	return target;
}

describe('Player > "Hide player controls bar buttons" menu entry', () => {
	const button = () =>
		extension.skeleton.main.layers.section.player.on.click.section_2.player_hide_controls_options;

	test('is a button that delegates to the Appearance sub-section by path', () => {
		expect(button().component).toBe('button');
		expect(button().text).toBe('hidePlayerControlsBarButtons');
		expect(typeof button().on.click).toBe('string');
	});

	test('its click path resolves to the sub-section instead of undefined', () => {
		const target = resolveSkeletonPath(button().on.click);

		expect(target).toBeDefined();
		expect(target.component).toBe('section');
	});

	test('the resolved sub-section carries the control-button switches', () => {
		const target = resolveSkeletonPath(button().on.click);
		const switches = Object.keys(target).filter(
			(key) => target[key] && target[key].component === 'switch'
		);

		expect(switches).toContain('player_play_button');
		expect(switches).toContain('player_volume_button');
		expect(switches.length).toBeGreaterThan(1);
	});
});
