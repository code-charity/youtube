const fs = require('fs');
const path = require('path');

describe('Playlist quick delete button (issue #4227)', () => {
	let playlistJs;

	beforeAll(() => {
		playlistJs = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/playlist-complete-playlist.js'),
			'utf8'
		);
	});

	test('registers the feature with init', () => {
		const initJs = fs.readFileSync(path.join(__dirname, '../../js&css/web-accessible/init.js'), 'utf8');

		expect(initJs).toContain('ImprovedTube.playlistCompleteInit();');
		expect(playlistJs).toContain('ImprovedTube.playlistCompleteInit');
		expect(playlistJs).toContain('ImprovedTube.playlistEnsureQuickButtons');
	});

	test('mirrors YouTube\'s current delete request (escaped params + adSignalsInfo)', () => {
		// YouTube now URL-escapes the "==" padding in params and carries
		// adSignalsInfo in the request context.
		expect(playlistJs).toContain("params: 'CAFAAQ%3D%3D'");
		expect(playlistJs).not.toContain("params: 'CAFAAQ=='");
		expect(playlistJs).toContain('adSignalsInfo');
	});

	test('does not mutate YouTube\'s live ytcfg context', () => {
		// The request context is cloned before adSignalsInfo is attached.
		expect(playlistJs).toContain('const context = { ...baseContext');
	});

	test('reports success only when YouTube confirms the edit, not on a bare 200', () => {
		// The old code returned res.ok, so a 200 with no removal looked like
		// success and the row was removed locally only to reappear on refresh.
		expect(playlistJs).toContain("response.status === 'STATUS_SUCCEEDED'");
		expect(playlistJs).toContain('return succeeded;');
		expect(playlistJs).not.toContain('return res.ok;');
	});

	test('falls back to the native three-dot menu when the API path fails', () => {
		// The native "Remove from playlist" menu item still works, so it backs
		// the direct-API path in the click handler.
		expect(playlistJs).toContain('ok = await clickMenuRemove(renderer);');
		expect(playlistJs).toContain('ACTION_REMOVE_VIDEO_FROM');
		// The fallback runs only after the direct-API removal returns false.
		expect(playlistJs.indexOf('removeVideosPersistentlyEdit(playlistId'))
			.toBeLessThan(playlistJs.indexOf('ok = await clickMenuRemove(renderer);'));
	});

	test('only removes the row after a confirmed deletion', () => {
		// renderer.remove() is guarded by the success flag from the removal chain.
		expect(playlistJs).toMatch(/if \(ok\) \{\s*try \{ renderer\.remove\(\);/);
	});
});
