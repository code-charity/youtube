const fs = require('fs');
const path = require('path');

describe('Switch row spacing', () => {
	test('does not compact enabled switch rows', () => {
		const css = fs.readFileSync(path.join(__dirname, '../../menu/satus.css'), 'utf8');
		const compactEnabledRule = css.match(/([^{}]+)\{[^{}]*margin-bottom:\s*-4\.5px[^{}]*margin-top:\s*-3\.5px[^{}]*\}/);

		expect(compactEnabledRule).not.toBeNull();
		expect(compactEnabledRule[1]).toContain(':not(.satus-switch)');
	});
});
