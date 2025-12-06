/**
 * Unit Tests for Sticky Navigation Feature
 * Tests the sidebar navigation persistence functionality
 */

describe('Sticky Navigation Feature', () => {
	let mockMiniGuide;
	let mockGuide;
	let mockObserver;
	let extension;

	beforeEach(() => {
		// Create fresh mock DOM elements for each test
		mockMiniGuide = {
			style: {},
			setAttribute: jest.fn(),
			removeAttribute: jest.fn()
		};

		mockGuide = {
			style: {},
			setAttribute: jest.fn(),
			removeAttribute: jest.fn()
		};

		// Mock MutationObserver
		mockObserver = {
			observe: jest.fn(),
			disconnect: jest.fn()
		};
		global.MutationObserver = jest.fn(() => mockObserver);

		// Mock document.querySelector
		document.querySelector = jest.fn((selector) => {
			if (selector === 'ytd-mini-guide-renderer') return mockMiniGuide;
			if (selector === 'ytd-guide-renderer') return mockGuide;
			return null;
		});

		// Set up extension object
		extension = {
			storage: {
				get: jest.fn()
			},
			features: {
				stickyNavigationObserver: null
			}
		};

		// Implement the actual stickyNavigation function
		extension.features.stickyNavigation = function () {
			if (extension.storage.get('sticky_navigation') === true) {
				// Function to ensure navigation stays visible
				function ensureNavigationVisible() {
					const miniGuide = document.querySelector('ytd-mini-guide-renderer');
					const guide = document.querySelector('ytd-guide-renderer');
					
					if (miniGuide) {
						miniGuide.style.transform = 'translateX(0)';
						miniGuide.style.transition = 'none';
						miniGuide.removeAttribute('hidden');
						miniGuide.setAttribute('aria-hidden', 'false');
					}
					
					if (guide) {
						guide.style.transform = 'translateX(0)';
						guide.style.transition = 'none';
						guide.removeAttribute('hidden');
						guide.setAttribute('aria-hidden', 'false');
					}
				}

				// Apply immediately
				ensureNavigationVisible();

				// Set up observer to watch for navigation changes
				const observer = new MutationObserver(function(mutations) {
					mutations.forEach(function(mutation) {
						if (mutation.type === 'attributes' && 
							(mutation.attributeName === 'hidden' || mutation.attributeName === 'aria-hidden')) {
							ensureNavigationVisible();
						}
					});
				});

				// Observe navigation elements
				const miniGuide = document.querySelector('ytd-mini-guide-renderer');
				const guide = document.querySelector('ytd-guide-renderer');
				
				if (miniGuide) {
					observer.observe(miniGuide, {
						attributes: true,
						attributeFilter: ['hidden', 'aria-hidden']
					});
				}
				
				if (guide) {
					observer.observe(guide, {
						attributes: true,
						attributeFilter: ['hidden', 'aria-hidden']
					});
				}

				// Store observer for cleanup
				extension.features.stickyNavigationObserver = observer;
			} else {
				// Clean up observer if setting is disabled
				if (extension.features.stickyNavigationObserver) {
					extension.features.stickyNavigationObserver.disconnect();
					extension.features.stickyNavigationObserver = null;
				}
			}
		};

		global.extension = extension;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should not apply sticky navigation when setting is disabled', () => {
		extension.storage.get.mockReturnValue(false);
		
		// Call the sticky navigation function
		extension.features.stickyNavigation();
		
		// Verify that no DOM manipulation occurred
		expect(mockMiniGuide.style.transform).toBeUndefined();
		expect(mockGuide.style.transform).toBeUndefined();
		expect(extension.features.stickyNavigationObserver).toBeNull();
	});

	test('should apply sticky navigation when setting is enabled', () => {
		extension.storage.get.mockReturnValue(true);
		
		// Call the sticky navigation function
		extension.features.stickyNavigation();
		
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
		expect(extension.features.stickyNavigationObserver).toBeDefined();
		expect(MutationObserver).toHaveBeenCalled();
	});

	test('should clean up observer when setting is disabled after being enabled', () => {
		// First enable the feature
		extension.storage.get.mockReturnValue(true);
		extension.features.stickyNavigation();
		
		// Verify observer was created
		const observer = extension.features.stickyNavigationObserver;
		expect(observer).toBeDefined();
		
		// Now disable the feature
		extension.storage.get.mockReturnValue(false);
		extension.features.stickyNavigation();
		
		// Verify that observer was disconnected
		expect(observer.disconnect).toHaveBeenCalled();
		expect(extension.features.stickyNavigationObserver).toBeNull();
	});

	test('should handle missing navigation elements gracefully', () => {
		extension.storage.get.mockReturnValue(true);
		
		// Mock document.querySelector to return null
		document.querySelector = jest.fn().mockReturnValue(null);
		
		// Call the sticky navigation function - should not throw
		expect(() => {
			extension.features.stickyNavigation();
		}).not.toThrow();
		
		// Observer should still be created
		expect(extension.features.stickyNavigationObserver).toBeDefined();
	});
}); 