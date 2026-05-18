var fs = require('fs');
var path = require('path');

describe('Legacy description setting migration', function () {
	var background;

	beforeAll(function () {
		background = fs.readFileSync(path.join(__dirname, '../../background.js'), 'utf8');
	});

	test('maps removed classic description options to supported options', function () {
		expect(background).toContain("classic: 'normal'");
		expect(background).toContain("classic_expanded: 'expanded'");
		expect(background).toContain("classic_hidden: 'hidden'");
	});

	test('uses the migration map instead of a single legacy value check', function () {
		expect(background).toContain('legacyDescriptionSettings[result.description]');
		expect(background).toContain('chrome.storage.local.set({description: description})');
	});
});
