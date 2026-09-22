const fs = require('fs');
const path = require('path');

describe('Cinema mode no longer blacks out the whole page (issue #4353)', () => {
	let playerJs;
	let shortcutsJs;

	beforeAll(() => {
		playerJs = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js'),
			'utf8'
		);
		shortcutsJs = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/shortcuts.js'),
			'utf8'
		);
	});

	test('no longer creates a full-page fixed overlay element', () => {
		// The old approach appended a position:fixed, 100% width/height div
		// and tried to out-rank it by raising z-index on three separate
		// player containers - which no longer works against YouTube's
		// current player DOM nesting and blacked out the whole page.
		expect(playerJs).not.toContain("overlay.style.position = 'fixed'");
		expect(playerJs).not.toContain("function createOverlay");
		expect(playerJs).not.toContain("document.getElementById('overlay_cinema')");
	});

	test('darkens via a box-shadow spotlight on #ytd-player instead', () => {
		expect(playerJs).toContain('ImprovedTube.cinemaModeSetVisible = function');
		expect(playerJs).toContain("document.getElementById('ytd-player')");
		expect(playerJs).toContain('0 0 0 9999px rgba(0, 0, 0, 1)');
	});

	test('manual toggle button, auto-enable and auto-disable all share the same toggle state and helper', () => {
		expect(playerJs).toContain('ImprovedTube.cinemaModeActive = !ImprovedTube.cinemaModeActive;');
		expect(playerJs).toContain('ImprovedTube.cinemaModeSetVisible(ImprovedTube.cinemaModeActive);');

		// playerCinemaModeDisable should only act if cinema mode is actually active
		expect(playerJs).toMatch(
			/playerCinemaModeDisable = function \(\) \{\s*if \(this\.storage\.player_auto_hide_cinema_mode_when_paused && ImprovedTube\.cinemaModeActive\) \{/
		);

		// playerCinemaModeEnable should re-apply cinemaModeSetVisible(true) rather than recreate the overlay
		expect(playerJs).toContain('ImprovedTube.cinemaModeSetVisible(true);');
	});

	test('the keyboard shortcut uses the same shared toggle instead of its own copy of the z-index hack', () => {
		expect(shortcutsJs).not.toContain("container.style.zIndex = 10000");
		expect(shortcutsJs).toContain('ImprovedTube.cinemaModeActive = !ImprovedTube.cinemaModeActive;');
		expect(shortcutsJs).toContain('ImprovedTube.cinemaModeSetVisible(ImprovedTube.cinemaModeActive);');
	});
});

describe('Reverse playlist survives a refresh (issue #4353)', () => {
	let playlistJs;

	beforeAll(() => {
		playlistJs = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/playlist.js'),
			'utf8'
		);
	});

	test('no longer dereferences ImprovedTube.elements.ytd_player without checking it exists', () => {
		// Previously this line ran unconditionally inside `if (playlist_manager)`,
		// with no check that ytd_player itself was populated yet. On a fresh
		// page load ImprovedTube.elements.ytd_player is set by a separate,
		// async DOM walk and can still be undefined at this point, so the
		// call threw and silently aborted the rest of the callback -
		// including the direct playlist_panel.data patch a few lines below -
		// leaving the panel and next-video order unreversed even though
		// playlist.contents itself had already been reversed above.
		expect(playlistJs).not.toContain('ImprovedTube.elements.ytd_player.updatePlayerComponents(null, autoplay, null, playlist);');
		expect(playlistJs).toContain('var ytd_player = ImprovedTube.elements.ytd_player || document.querySelector(\'ytd-player\');');
		expect(playlistJs).toContain('if (playlist_manager && ytd_player) {');
	});

	test('retries a bounded number of times instead of a single one-shot attempt', () => {
		expect(playlistJs).toContain('attempts < 5');
		expect(playlistJs).toContain('setTimeout(applyReversedPlaylistToPlayer, 200);');
	});

	test('still updates the playlist panel directly so Polymer re-renders it', () => {
		expect(playlistJs).toContain('playlist_panel.data = playlist;');
	});
});
