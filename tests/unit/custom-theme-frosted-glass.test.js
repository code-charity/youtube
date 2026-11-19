const createElement = () => ({
	textContent: '',
	className: '',
	remove: jest.fn(),
	style: { setProperty: jest.fn() },
	removeAttribute: jest.fn(),
	appendChild: jest.fn()
});

global.document = {
	createElement: jest.fn(createElement),
	documentElement: createElement(),
	head: createElement(),
	querySelector: jest.fn(() => null),
	getElementById: jest.fn(() => null)
};

global.ImprovedTube = {
	storage: {},
	elements: {},
	button_icons: {}
};

require('../../js&css/web-accessible/www.youtube.com/themes.js');

describe('Custom theme frosted glass colour', () => {
	beforeEach(() => {
		ImprovedTube.elements = {};
		ImprovedTube.storage = {
			theme: 'custom',
			theme_primary_color: [0, 51, 89],
			theme_secondary_color: [10, 20, 30],
			theme_text_color: [255, 255, 255]
		};
	});

	test('emits a valid rgba() value for --yt-frosted-glass-desktop', () => {
		ImprovedTube.myColors();

		const css = ImprovedTube.elements.my_colors.textContent;
		const match = css.match(/--yt-frosted-glass-desktop:([^;]+);/);

		expect(match).not.toBeNull();
		expect(match[1].trim()).toBe('rgba(0,51,89, 0.8) !important');
		expect(css).not.toMatch(/rgb\([^)]*\)cc/);
	});
});
