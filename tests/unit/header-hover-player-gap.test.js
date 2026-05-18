const fs = require('fs');
const path = require('path');

describe('Video hover header player sizing', () => {
	let playerCss;

	beforeAll(() => {
		playerCss = fs.readFileSync(path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/player/player.css'), 'utf8');
	});

	test('does not reserve header height for full-window hover header layouts', () => {
		expect(playerCss).toContain("html[data-page-type=video][it-player-size='full_window']:is([it-header-position=hover], [it-header-position=hover_on_video_page])");
		expect(playerCss).toContain("html[data-page-type=video][it-player-size='fit_to_window']:is([it-header-position=hover], [it-header-position=hover_on_video_page])");
		expect(playerCss).toContain('--it-header-size: 0px;');
	});

	test('clears hover header top margins from full-window player containers', () => {
		expect(playerCss).toContain("html[data-page-type=video][it-player-size='full_window']:is([it-header-position=hover], [it-header-position=hover_on_video_page]) ytd-app:not([player-fullscreen_]) ytd-watch-flexy:not([fullscreen])");
		expect(playerCss).toContain("html[data-page-type=video][it-player-size='full_window']:is([it-header-position=hover], [it-header-position=hover_on_video_page]) div#page #movie_player:not(.it-mini-player):not(.ytp-fullscreen)");
		expect(playerCss).toContain('margin-top: 0 !important;');
	});
});
