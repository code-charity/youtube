// Mock extension object for sticky navigation tests
jest.mock('../../js&css/extension/core', () => ({
	storage: {
		get: jest.fn(),
		data: {}
	},
	features: {
		stickyNavigationObserver: null
	}
}));

// Set up global extension object before requiring sidebar.js
global.extension = {
	storage: {
		get: jest.fn(),
		data: {}
	},
	features: {
		stickyNavigationObserver: null
	}
};

// Mock DOM elements
const mockMiniGuide = {
	style: {},
	setAttribute: jest.fn(),
	removeAttribute: jest.fn()
};

const mockGuide = {
	style: {},
	setAttribute: jest.fn(),
	removeAttribute: jest.fn()
};

// Mock document.querySelector
global.document = {
	querySelector: jest.fn((selector) => {
		if (selector === 'ytd-mini-guide-renderer') {
			return mockMiniGuide;
		}
		if (selector === 'ytd-guide-renderer') {
			return mockGuide;
		}
		return null;
	})
};

// Mock MutationObserver
global.MutationObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	disconnect: jest.fn()
}));

// Import the sticky navigation feature
require('../../js&css/extension/www.youtube.com/appearance/sidebar/sidebar.js');

describe('Sticky Navigation Feature', () => {
	beforeEach(() => {
		// Reset mocks
		jest.clearAllMocks();
		global.extension.storage.get.mockReturnValue(false);
		global.extension.features.stickyNavigationObserver = null;
	});

	test('should not apply sticky navigation when setting is disabled', () => {
		global.extension.storage.get.mockReturnValue(false);
		
		// Call the sticky navigation function
		global.extension.features.stickyNavigation();
		
		// Verify that no DOM manipulation occurred
		expect(mockMiniGuide.style.transform).toBeUndefined();
		expect(mockGuide.style.transform).toBeUndefined();
		expect(global.extension.features.stickyNavigationObserver).toBeNull();
	});

	test('should apply sticky navigation when setting is enabled', () => {
		global.extension.storage.get.mockReturnValue(true);
		
		// Call the sticky navigation function
		global.extension.features.stickyNavigation();
		
		// Verify that DOM manipulation occurred
		expect(mockMiniGuide.style.transform).toBe('translateX(0)');
		expect(mockMiniGuide.style.transition).toBe('none');
		expect(mockGuide.style.transform).toBe('translateX(0)');
		expect(mockGuide.style.transition).toBe('none');
		
		// Verify that attributes were set correctly
		expect(mockMiniGuide.removeAttribute).toHaveBeenCalledWith('hidden');
		expect(mockMiniGuide.setAttribute).toHaveBeenCalledWith('aria-hidden', 'false');
		expect(mockGuide.removeAttribute).toHaveBeenCalledWith('hidden');
		expect(mockGuide.setAttribute).toHaveBeenCalledWith('aria-hidden', 'false');
		
		// Verify that observer was created
		expect(global.extension.features.stickyNavigationObserver).toBeDefined();
	});

	test('should clean up observer when setting is disabled after being enabled', () => {
		// First enable the feature
		global.extension.storage.get.mockReturnValue(true);
		global.extension.features.stickyNavigation();
		
		// Mock the observer
		const mockObserver = {
			disconnect: jest.fn()
		};
		global.extension.features.stickyNavigationObserver = mockObserver;
		
		// Now disable the feature
		global.extension.storage.get.mockReturnValue(false);
		global.extension.features.stickyNavigation();
		
		// Verify that observer was disconnected
		expect(mockObserver.disconnect).toHaveBeenCalled();
		expect(global.extension.features.stickyNavigationObserver).toBeNull();
	});

	test('should handle missing navigation elements gracefully', () => {
		global.extension.storage.get.mockReturnValue(true);
		
		// Mock document.querySelector to return null
		global.document.querySelector = jest.fn().mockReturnValue(null);
		
		// Call the sticky navigation function
		global.extension.features.stickyNavigation();
		
		// Should not throw an error and should still create an observer
		expect(global.extension.features.stickyNavigationObserver).toBeDefined();
	});
}); 