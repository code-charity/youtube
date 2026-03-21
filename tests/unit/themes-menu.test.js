global.extension = {
	skeleton: {
		main: {
			layers: {
				section: {}
			}
		}
	}
};

global.satus = {
	storage: {
		get: jest.fn()
	}
};

require('../../menu/skeleton-parts/themes.js');

describe('Themes menu radio state', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('keeps YouTube light as the default option when there is no stored theme', () => {
		satus.storage.get.mockReturnValue(undefined);

		const section = extension.skeleton.main.layers.section.themes.on.click.section;
		const currentTheme = section.default();
		const oppositeTheme = section.opposite();

		expect(currentTheme.text).toBe('youtubesLight');
		expect(currentTheme.radio.value).toBe('light');
		expect(currentTheme.radio.checked).toBe(true);
		expect(oppositeTheme.text).toBe('youtubesDark');
		expect(oppositeTheme.radio.value).toBe('dark');
		expect(oppositeTheme.radio.checked).toBeUndefined();
	});

	test('marks YouTube dark as checked when dark is the current theme', () => {
		satus.storage.get.mockReturnValue('dark');

		const section = extension.skeleton.main.layers.section.themes.on.click.section;
		const currentTheme = section.default();
		const oppositeTheme = section.opposite();

		expect(currentTheme.text).toBe('youtubesLight');
		expect(currentTheme.radio.value).toBe('light');
		expect(currentTheme.radio.checked).toBeUndefined();
		expect(oppositeTheme.text).toBe('youtubesDark');
		expect(oppositeTheme.radio.value).toBe('dark');
		expect(oppositeTheme.radio.checked).toBe(true);
	});

	test('keeps YouTube light selected when light is explicitly stored', () => {
		satus.storage.get.mockReturnValue('light');

		const section = extension.skeleton.main.layers.section.themes.on.click.section;
		const currentTheme = section.default();
		const oppositeTheme = section.opposite();

		expect(currentTheme.radio.value).toBe('light');
		expect(currentTheme.radio.checked).toBe(true);
		expect(oppositeTheme.radio.value).toBe('dark');
		expect(oppositeTheme.radio.checked).toBeUndefined();
	});
});