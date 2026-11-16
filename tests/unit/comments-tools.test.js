// Comments search, newest-first and expand-all (issue #4084)

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
			documentElement: { hasAttribute: () => false }
		},
		location: { pathname: '/watch', search: '?v=dQw4w9WgXcQ' },
		console,
		setTimeout: noop,
		clearTimeout: noop
	};
	vm.runInNewContext(read('js&css', 'web-accessible', 'www.youtube.com', 'features', 'comments-tools.js'), context);
	return context.ImprovedTube;
}

describe('Comments tools (#4084)', () => {
	const IT = load();

	test('matches comment text case-insensitively', () => {
		expect(IT.commentsToolsMatch('This is a BANGING tune', 'banging')).toBe(true);
		expect(IT.commentsToolsMatch('This is a banging tune', '  TUNE ')).toBe(true);
		expect(IT.commentsToolsMatch('Rick Astley', 'taylor')).toBe(false);
	});

	test('an empty query matches everything', () => {
		expect(IT.commentsToolsMatch('anything', '')).toBe(true);
	});

	test('finds the newest-first item among English and translated labels', () => {
		expect(IT.commentsToolsNewestIndex(['Top comments', 'Newest first'])).toBe(1);
		expect(IT.commentsToolsNewestIndex(['Top comments', 'Newest'])).toBe(1);
		expect(IT.commentsToolsNewestIndex(['最新'])).toBe(0);
		expect(IT.commentsToolsNewestIndex(['Meistgesehen', 'Neueste'])).toBe(1);
	});

	test('returns -1 when the menu has no newest item', () => {
		expect(IT.commentsToolsNewestIndex(['Top comments'])).toBe(-1);
		expect(IT.commentsToolsNewestIndex([])).toBe(-1);
	});
});
