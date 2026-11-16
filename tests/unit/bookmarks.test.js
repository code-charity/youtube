// Bookmarks: per-video named timestamps (issue #4097)

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
			createElement: () => ({ style: {}, setAttribute: noop, appendChild: noop, addEventListener: noop })
		},
		location: { pathname: '/watch', search: '?v=dQw4w9WgXcQ' },
		console,
		setTimeout: noop,
		Blob: function () {},
		URL: { createObjectURL: () => '', revokeObjectURL: noop }
	};
	vm.runInNewContext(read('js&css', 'web-accessible', 'www.youtube.com', 'features', 'bookmarks.js'), context);
	return context.ImprovedTube;
}

describe('Bookmarks (#4097)', () => {
	let IT;

	beforeAll(() => {
		IT = load();
	});

	test('formats seconds as a timestamp', () => {
		expect(IT.bookmarksFormatTime(0)).toBe('0:00');
		expect(IT.bookmarksFormatTime(65)).toBe('1:05');
		expect(IT.bookmarksFormatTime(3723)).toBe('1:02:03');
	});

	test('parses the formats it prints', () => {
		expect(IT.bookmarksParseTime('1:05')).toBe(65);
		expect(IT.bookmarksParseTime('01:02:03')).toBe(3723);
		expect(IT.bookmarksParseTime('95')).toBe(95);
		expect(IT.bookmarksParseTime('nope')).toBe(null);
		expect(IT.bookmarksParseTime('1:2:3:4')).toBe(null);
	});

	test('adds a bookmark sorted by time and fills a blank label', () => {
		let list = IT.bookmarksAdd([], 90, 'chorus');
		list = IT.bookmarksAdd(list, 10, '');
		list = IT.bookmarksAdd(list, 30, '  intro  ');

		expect(list.map((b) => b.t)).toEqual([10, 30, 90]);
		expect(list[0].label).toBe('0:10');
		expect(list[1].label).toBe('intro');
	});

	test('replaces a bookmark at the same second instead of duplicating it', () => {
		let list = IT.bookmarksAdd([], 42, 'first');
		list = IT.bookmarksAdd(list, 42, 'second');

		expect(list).toHaveLength(1);
		expect(list[0].label).toBe('second');
	});

	test('clamps labels to 80 characters', () => {
		const list = IT.bookmarksAdd([], 5, 'x'.repeat(120));
		expect(list[0].label).toHaveLength(80);
	});

	test('removes by index', () => {
		const list = IT.bookmarksAdd(IT.bookmarksAdd([], 1, 'a'), 2, 'b');
		expect(IT.bookmarksRemove(list, 0).map((b) => b.label)).toEqual(['b']);
	});

	test('exports text and json with timestamps', () => {
		const list = IT.bookmarksAdd([], 65, 'chorus');
		expect(IT.bookmarksExportText({}, list)).toBe('1:05  chorus');
		expect(JSON.parse(IT.bookmarksExportJson({ id: 'abc' }, list))).toEqual({
			video: { id: 'abc' },
			bookmarks: [{ time: 65, timestamp: '1:05', label: 'chorus' }]
		});
	});
});
