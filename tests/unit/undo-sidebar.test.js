function setupGlobals(storage) {
	const attrs = {};
	global.document = {
		documentElement: {
			dataset: { pageType: 'video' },
			setAttribute: jest.fn((k, v) => { attrs[k] = v; }),
			removeAttribute: jest.fn((k) => { delete attrs[k]; }),
			getAttribute: jest.fn((k) => attrs[k] || null),
			style: {}
		},
		addEventListener: jest.fn(),
		querySelector: jest.fn(() => null),
		getElementById: jest.fn(() => null),
		createElement: jest.fn(() => ({
			setAttribute: jest.fn(), style: {}, appendChild: jest.fn(),
			addEventListener: jest.fn(), classList: { add: jest.fn(), remove: jest.fn() }
		})),
		head: { appendChild: jest.fn() }
	};
	global.location = { href: 'https://www.youtube.com/watch?v=test', pathname: '/watch' };
	global.navigator = { userAgent: 'Macintosh' };

	const experimentFlags = {
		// Flags that differ between logged-in (new sidebar) and logged-out (old sidebar)
		enable_lockup_redesign: true,
		enable_profile_cards_on_comments: true,
		kevlar_player_unified_player_loading: true,
		kevlar_unified_player: true,
		web_watch_move_lockup_overflow_menu: true,
		web_watch_use_secondary_max_width_percent: true,
		web_watch_use_sidebar_width_percentage: true,
		kevlar_watch_secondary_max_width: 700,
		kevlar_watch_sidebar_min_width: 200,
		kevlar_watch_sidebar_width_percentage: 0.275,
		web_watch_compact_thumbnail_width_string: '62.5%',
	};

	global.window = {
		addEventListener: jest.fn(),
		yt: { config_: { EXPERIMENT_FLAGS: experimentFlags } },
		matchMedia: jest.fn(() => ({ matches: false, addListener: jest.fn(), removeListener: jest.fn() }))
	};
	global.MutationObserver = jest.fn().mockImplementation(() => ({
		observe: jest.fn(), disconnect: jest.fn()
	}));
	global.ResizeObserver = jest.fn().mockImplementation(() => ({
		observe: jest.fn(), disconnect: jest.fn()
	}));

	global.ImprovedTube = {
		storage: storage,
		elements: {}
	};
}

function loadModule() {
	jest.resetModules();
	require('../../js&css/web-accessible/www.youtube.com/appearance.js');
}

function cleanup() {
	delete global.document;
	delete global.location;
	delete global.navigator;
	delete global.window;
	delete global.ImprovedTube;
}

describe('YouTubeExperiments - undo new sidebar', () => {
	afterEach(cleanup);

	test('overrides experiment flags when undo_the_new_sidebar is enabled', () => {
		setupGlobals({ undo_the_new_sidebar: 'true' });
		loadModule();

		ImprovedTube.YouTubeExperiments();

		const flags = window.yt.config_.EXPERIMENT_FLAGS;
		// Boolean flags reverted to false
		expect(flags.enable_lockup_redesign).toBe(false);
		expect(flags.enable_profile_cards_on_comments).toBe(false);
		expect(flags.kevlar_player_unified_player_loading).toBe(false);
		expect(flags.kevlar_unified_player).toBe(false);
		expect(flags.web_watch_move_lockup_overflow_menu).toBe(false);
		expect(flags.web_watch_use_secondary_max_width_percent).toBe(false);
		expect(flags.web_watch_use_sidebar_width_percentage).toBe(false);
		// Numeric/string flags reset to logged-out values
		expect(flags.kevlar_watch_secondary_max_width).toBe(550);
		expect(flags.kevlar_watch_sidebar_min_width).toBe(300);
		expect(flags.kevlar_watch_sidebar_width_percentage).toBe(0.25);
		expect(flags.web_watch_compact_thumbnail_width_string).toBe('168px');
	});

	test('overrides experiment flags when undo_the_new_sidebar is boolean true', () => {
		setupGlobals({ undo_the_new_sidebar: true });
		loadModule();

		ImprovedTube.YouTubeExperiments();

		const flags = window.yt.config_.EXPERIMENT_FLAGS;
		expect(flags.enable_lockup_redesign).toBe(false);
		expect(flags.web_watch_compact_thumbnail_width_string).toBe('168px');
	});

	test('does not override flags when setting is disabled', () => {
		setupGlobals({ undo_the_new_sidebar: 'false' });
		loadModule();

		ImprovedTube.YouTubeExperiments();

		const flags = window.yt.config_.EXPERIMENT_FLAGS;
		expect(flags.enable_lockup_redesign).toBe(true);
		expect(flags.web_watch_compact_thumbnail_width_string).toBe('62.5%');
	});

	test('does not override flags on non-video pages', () => {
		setupGlobals({ undo_the_new_sidebar: 'true' });
		document.documentElement.dataset.pageType = 'browse';
		loadModule();

		ImprovedTube.YouTubeExperiments();

		const flags = window.yt.config_.EXPERIMENT_FLAGS;
		expect(flags.enable_lockup_redesign).toBe(true);
	});

	test('can be re-applied on SPA navigation without throwing', () => {
		setupGlobals({ undo_the_new_sidebar: 'true' });
		loadModule();

		ImprovedTube.YouTubeExperiments();
		expect(() => ImprovedTube.YouTubeExperiments()).not.toThrow();
	});

	test('forces new sidebar flags when description is sidebar', () => {
		setupGlobals({ description: 'sidebar' });
		// Simulate account without new sidebar (flags absent/false)
		window.yt.config_.EXPERIMENT_FLAGS.enable_lockup_redesign = false;
		loadModule();

		ImprovedTube.YouTubeExperiments();

		const flags = window.yt.config_.EXPERIMENT_FLAGS;
		expect(flags.enable_lockup_redesign).toBe(true);
		expect(flags.web_watch_use_sidebar_width_percentage).toBe(true);
		expect(flags.kevlar_watch_secondary_max_width).toBe(700);
		expect(flags.web_watch_compact_thumbnail_width_string).toBe('62.5%');
	});
});
