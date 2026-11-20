// Playlist series gaps (userscript parity: yt-playlist-series-gap)

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
	vm.runInNewContext(read('js&css', 'web-accessible', 'www.youtube.com', 'features', 'playlist-series-gap.js'), context);
	return context.ImprovedTube;
}

describe('Playlist series gaps', () => {
	const IT = load();
	const parse = (title) => IT.seriesGapParseEpisode(title);

	test('parses the formats the userscript supports', () => {
		expect(parse('S1E2 - Intro')).toEqual({ season: 1, episode: 2 });
		expect(parse('Season 01 Episode 03')).toEqual({ season: 1, episode: 3 });
		expect(parse('EP4: Variables')).toEqual({ season: null, episode: 4 });
		expect(parse('Episode 4')).toEqual({ season: null, episode: 4 });
		expect(parse('Ep. 12')).toEqual({ season: null, episode: 12 });
		expect(parse('Part 2 - The Return')).toEqual({ season: null, episode: 2 });
		expect(parse('#7 Python Tutorial')).toEqual({ season: null, episode: 7 });
		expect(parse('第3集 函数')).toEqual({ season: null, episode: 3 });
		expect(parse('3. Getting started')).toEqual({ season: null, episode: 3 });
		expect(parse('12) Review')).toEqual({ season: null, episode: 12 });
	});

	test('does not invent an episode number', () => {
		expect(parse('Rick Astley - Never Gonna Give You Up')).toBe(null);
		expect(parse('Python in 100 seconds')).toBe(null);
		expect(parse('')).toBe(null);
	});

	test('reports missing episodes once the minimum is reached', () => {
		const data = IT.seriesGapReport([
			{ title: 'Ep 1' },
			{ title: 'Ep 2' },
			{ title: 'Ep 4' }
		], 3);

		expect(data.scanned).toBe(3);
		expect(data.numbered).toBe(3);
		expect(data.missing).toEqual([{ season: null, episodes: [3] }]);
		expect(data.duplicates).toEqual([]);
	});

	test('does not report gaps below the minimum', () => {
		const data = IT.seriesGapReport([{ title: 'Ep 1' }, { title: 'Ep 3' }], 3);
		expect(data.missing).toEqual([]);
	});

	test('groups by season when the title has one', () => {
		const data = IT.seriesGapReport([
			{ title: 'S1E1' }, { title: 'S1E3' }, { title: 'S2E1' }, { title: 'S2E2' }
		], 2);

		expect(data.missing).toEqual([{ season: 1, episodes: [2] }]);
	});

	test('reports duplicate numbers with every title', () => {
		const data = IT.seriesGapReport([
			{ title: 'Ep 2 First' }, { title: 'Ep 2 Again' }, { title: 'Ep 3' }
		], 3);

		expect(data.duplicates).toEqual([{ season: null, episode: 2, titles: ['Ep 2 First', 'Ep 2 Again'] }]);
	});

	test('lists titles it could not read', () => {
		const data = IT.seriesGapReport([{ title: 'Ep 1' }, { title: 'Ep 2' }, { title: 'Bonus' }], 3);

		expect(data.unparsed.map((item) => item.title)).toEqual(['Bonus']);
		expect(data.numbered).toBe(2);
	});
});
