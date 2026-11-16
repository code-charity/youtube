// Playlist row filter (userscript parity: yt-playlist-filter)

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const read = (...parts) => fs.readFileSync(path.join(__dirname, '../..', ...parts), 'utf8');

function load() {
	const noop = () => {};
	const context = {
		ImprovedTube: { storage: {}, messages: { send: noop } },
		document: {
			querySelector: () => null,
			querySelectorAll: () => [],
			addEventListener: noop,
			createElement: () => ({ style: {}, setAttribute: noop, appendChild: noop, addEventListener: noop }),
			documentElement: { hasAttribute: () => false },
			body: null
		},
		location: { pathname: '/playlist', search: '?list=PL123' },
		console,
		setTimeout: noop,
		clearTimeout: noop,
		MutationObserver: function () { this.observe = noop; }
	};
	vm.runInNewContext(read('js&css', 'web-accessible', 'www.youtube.com', 'features', 'playlist-filter.js'), context);
	return context.ImprovedTube;
}

describe('Playlist row filter', () => {
	const IT = load();

	test('matches title or channel case-insensitively', () => {
		expect(IT.playlistFilterMatch('Rick Astley - Dance', 'dance')).toBe(true);
		expect(IT.playlistFilterMatch('Rick Astley', 'rick')).toBe(true);
		expect(IT.playlistFilterMatch('Rick Astley', '  RICK  ')).toBe(true);
		expect(IT.playlistFilterMatch('Rick Astley', 'taylor')).toBe(false);
	});

	test('empty or whitespace queries match everything without filtering', () => {
		// The module skips filtering for an empty query; the matcher itself is literal.
		expect(IT.playlistFilterMatch('anything', '')).toBe(true);
	});

	test('extracts the 11-character video id from playlist hrefs', () => {
		expect(IT.playlistFilterVideoId('/watch?v=PXC_PYeB6F8&list=PL123&index=1')).toBe('PXC_PYeB6F8');
		expect(IT.playlistFilterVideoId('/watch?v=PXC_PYeB6F8')).toBe('PXC_PYeB6F8');
		expect(IT.playlistFilterVideoId('/playlist?list=PL123')).toBe(null);
	});
});
