global.ImprovedTube = {
	storage: {},
	elements: {},
	button_icons: {}
};

global.document = {
	cookie: ''
};

require('../../js&css/web-accessible/functions.js');

describe('Theme PREF cookie handling', () => {
	beforeEach(() => {
		document.cookie = '';
		ImprovedTube.setCookie = jest.fn(function (name, value) {
			document.cookie = name + '=' + value;
		});
	});

	test('preserves the extra f6 bit when enabling dark theme', () => {
		document.cookie = 'PREF=f6=80001';

		ImprovedTube.setPrefCookieValueByName('f6', 400);

		expect(ImprovedTube.setCookie).toHaveBeenCalledWith('PREF', 'f6=401');
	});

	test('removes the f6 theme preference when switching back to light', () => {
		document.cookie = 'PREF=f6=401';

		ImprovedTube.setPrefCookieValueByName('f6', null);

		expect(ImprovedTube.setCookie).toHaveBeenCalledWith('PREF', '');
	});
});