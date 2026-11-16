// Smart keyword and duration filters (issue #4073)

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
			documentElement: { hasAttribute: () => false },
			body: { classList: { toggle: noop }, appendChild: noop }
		},
		location: { pathname: '/' },
		console,
		setTimeout: noop,
		clearTimeout: noop,
		MutationObserver: function () { this.observe = noop; }
	};
	vm.runInNewContext(read('js&css', 'web-accessible', 'www.youtube.com', 'features', 'smart-filters.js'), context);
	return context.ImprovedTube;
}

describe('Smart filters (#4073)', () => {
	const IT = load();

	test('parses mm:ss and h:mm:ss durations', () => {
		expect(IT.smartFiltersDurationSeconds('3:59')).toBe(239);
		expect(IT.smartFiltersDurationSeconds('1:02:03')).toBe(3723);
		expect(IT.smartFiltersDurationSeconds('LIVE')).toBe(null);
		expect(IT.smartFiltersDurationSeconds('')).toBe(null);
	});

	test('matches any keyword case-insensitively', () => {
		expect(IT.smartFiltersMatchKeywords('GTA VI trailer', ['gta', 'minecraft'])).toBe(true);
		expect(IT.smartFiltersMatchKeywords('Minecraft 1.21', ['gta'])).toBe(false);
		expect(IT.smartFiltersMatchKeywords('anything', [])).toBe(false);
	});

	test('hides by keyword', () => {
		expect(IT.smartFiltersShouldHide('GTA VI trailer', '10:00', 'any', ['gta'])).toBe(true);
		expect(IT.smartFiltersShouldHide('Minecraft', '10:00', 'any', ['gta'])).toBe(false);
	});

	test('hides by duration band and keeps unknown durations', () => {
		expect(IT.smartFiltersShouldHide('Short', '2:00', 'short', [])).toBe(true);
		expect(IT.smartFiltersShouldHide('Long', '2:00', 'long', [])).toBe(false);
		expect(IT.smartFiltersShouldHide('Long', '25:00', 'long', [])).toBe(true);
		expect(IT.smartFiltersShouldHide('Medium', '10:00', 'medium', [])).toBe(true);
		expect(IT.smartFiltersShouldHide('Live', '', 'long', [])).toBe(false);
	});

	test('an empty keyword list and "any" hide nothing', () => {
		expect(IT.smartFiltersShouldHide('Anything', '10:00', 'any', [])).toBe(false);
	});
});
