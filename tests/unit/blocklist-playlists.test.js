const fs = require('fs');
const path = require('path');

describe('Blocklist playlist blocking (issue #4348)', () => {
	let blocklistJs;
	let initJs;
	let menuJs;
	let stylesCSS;

	beforeAll(() => {
		blocklistJs = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/blocklist.js'),
			'utf8'
		);
		initJs = fs.readFileSync(
			path.join(__dirname, '../../js&css/extension/init.js'),
			'utf8'
		);
		menuJs = fs.readFileSync(
			path.join(__dirname, '../../menu/skeleton-parts/blocklist.js'),
			'utf8'
		);
		stylesCSS = fs.readFileSync(
			path.join(__dirname, '../../js&css/extension/www.youtube.com/styles.css'),
			'utf8'
		);
	});

	test('initializes playlists storage object', () => {
		expect(blocklistJs).toContain("blocklist = {videos: {}, channels: {}, playlists: {}}");
		expect(blocklistJs).toContain("this.storage.blocklist.playlists");
	});

	test('extracts playlist IDs from URLs', () => {
		expect(blocklistJs).toContain("node.href?.match(/[&?]list=([^&]+)/)");
	});

	test('modifies early return check to allow playlists without videos', () => {
		expect(blocklistJs).toContain("if (!video && !playlist) return;");
	});

	test('applies it-blocklisted-playlist CSS class to blocked playlists', () => {
		expect(blocklistJs).toContain("it-blocklisted-playlist");
		expect(blocklistJs).toContain("blocklist?.playlists[playlist]");
	});

	test('handles playlist blocks in message handler', () => {
		expect(initJs).toContain("case 'playlist':");
		expect(initJs).toContain("blocklist.playlists[message.id]");
	});

	test('adds playlists button to UI menu', () => {
		expect(menuJs).toContain("Playlists");
		expect(menuJs).toContain("blocklist.playlists");
		expect(menuJs).toContain("Object.keys(blocklist.playlists)");
	});

	test('styles hidden playlists with CSS rule', () => {
		expect(stylesCSS).toContain(".it-blocklisted-playlist");
		expect(stylesCSS).toContain("display: none");
	});

	test('tracks playlist blocks in mutation observer', () => {
		expect(blocklistJs).toContain("blocklistObserver");
		const observerSection = blocklistJs.substring(blocklistJs.indexOf("blocklistObserver"));
		expect(observerSection).toContain("playlist");
	});

	test('cleans up playlist CSS classes on disable', () => {
		expect(blocklistJs).toContain("it-blocklisted-playlist");
		expect(blocklistJs).toContain("querySelectorAll");
		expect(blocklistJs).toContain("classList.remove");
	});
});
