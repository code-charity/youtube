// Playlist health (userscript parity: yt-playlist-prune + yt-playlist-decay)

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
	vm.runInNewContext(read('js&css', 'web-accessible', 'www.youtube.com', 'features', 'playlist-health.js'), context);
	return context.ImprovedTube;
}

describe('Playlist health', () => {
	const IT = load();

	test('parses mm:ss and h:mm:ss durations', () => {
		expect(IT.playlistHealthParseDuration('3:54')).toBe(234);
		expect(IT.playlistHealthParseDuration('1:02:03')).toBe(3723);
		expect(IT.playlistHealthParseDuration('no time here')).toBe(null);
	});

	test('scores depth, length and playlist size, and subtracts progress', () => {
		const deep = IT.playlistHealthDecayScore({ index: 99, total: 100, duration: 7200, watched: false });
		const shallow = IT.playlistHealthDecayScore({ index: 0, total: 3, duration: 60, watched: true });

		expect(deep).toBeGreaterThan(80);
		expect(deep).toBeLessThanOrEqual(100);
		expect(shallow).toBe(0);
	});

	test('clamps the score to 0..100', () => {
		expect(IT.playlistHealthDecayScore({ index: 399, total: 400, duration: 5400, watched: false })).toBe(100);
		expect(IT.playlistHealthDecayScore({ index: 0, total: 1, duration: 0, watched: true })).toBe(0);
	});

	test('reports duplicates by video id and unavailable rows separately', () => {
		const data = IT.playlistHealthReport([
			{ id: 'aaaaaaaaaaa', title: 'Good one', duration: 600, watched: false, unavailable: false },
			{ id: 'aaaaaaaaaaa', title: 'Good one (again)', duration: 600, watched: false, unavailable: false },
			{ id: 'bbbbbbbbbbb', title: '[Deleted video]', duration: null, watched: false, unavailable: true }
		]);

		expect(data.scanned).toBe(3);
		expect(data.duplicates).toEqual([{ title: 'Good one (again)', id: 'aaaaaaaaaaa', first: 'Good one' }]);
		expect(data.unavailable.map((item) => item.id)).toEqual(['bbbbbbbbbbb']);
		expect(data.ranked).toHaveLength(3);
	});

	test('ranks the highest score first', () => {
		const data = IT.playlistHealthReport([
			{ id: '11111111111', title: 'first', duration: 60, watched: true, unavailable: false },
			{ id: '22222222222', title: 'last', duration: 7200, watched: false, unavailable: false }
		]);

		expect(data.ranked[0].title).toBe('last');
		expect(data.ranked[0].score).toBeGreaterThan(data.ranked[1].score);
	});
});
