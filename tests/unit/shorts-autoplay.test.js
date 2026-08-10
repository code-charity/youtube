// Mock global setup
global.ImprovedTube = {
	elements: {},
	storage: {},
	messages: {
		send: jest.fn()
	},
	playlistUpNextAutoplay: jest.fn()
};

// Mock DOM environment elements
const mockVideo = {
	removeAttribute: jest.fn(),
	addEventListener: jest.fn(),
	removeEventListener: jest.fn(),
	_loopObserver: null
};

const mockNextButton = {
	click: jest.fn()
};

// Mock global document
global.document = {
	documentElement: {
		dataset: {},
		removeAttribute: jest.fn(),
		setAttribute: jest.fn()
	},
	querySelector: jest.fn((selector) => {
		if (selector === '#navigation-button-down button') {
			return mockNextButton;
		}
		if (selector === 'button[aria-label="Next video"]') {
			return mockNextButton;
		}
		return null;
	}),
	querySelectorAll: jest.fn(() => [])
};

// Mock MutationObserver
global.MutationObserver = jest.fn().mockImplementation(function (callback) {
	this.observe = jest.fn();
	this.disconnect = jest.fn();
	this.callback = callback;
});

// Require the functions file to load ImprovedTube.stop_shorts_autoloop, playerOnEnded
require('../../js&css/web-accessible/functions.js');

describe('Shorts Autoplay & Loop Controls', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		global.ImprovedTube.storage = {};
		global.ImprovedTube.elements = {};
		global.document.documentElement.dataset = {};
		mockVideo._loopObserver = null;
	});

	test('stop_shorts_autoloop should remove loop attribute and register MutationObserver', () => {
		global.document.documentElement.dataset.pageType = 'shorts';

		ImprovedTube.stop_shorts_autoloop(mockVideo);

		expect(mockVideo.removeAttribute).toHaveBeenCalledWith('loop');
		expect(global.MutationObserver).toHaveBeenCalled();
		expect(mockVideo._loopObserver).toBeDefined();
	});

	test('playerOnEnded should click next button on shorts page if up_next_autoplay is true', () => {
		global.document.documentElement.dataset.pageType = 'shorts';
		global.ImprovedTube.storage.up_next_autoplay = true;

		ImprovedTube.playerOnEnded(new Event('ended'));

		expect(global.document.querySelector).toHaveBeenCalledWith('#navigation-button-down button');
		expect(mockNextButton.click).toHaveBeenCalled();
	});

	test('playerOnEnded should not click next button on shorts page if up_next_autoplay is false', () => {
		global.document.documentElement.dataset.pageType = 'shorts';
		global.ImprovedTube.storage.up_next_autoplay = false;

		ImprovedTube.playerOnEnded(new Event('ended'));

		expect(mockNextButton.click).not.toHaveBeenCalled();
	});
});
