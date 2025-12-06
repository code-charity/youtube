/**
 * Unit Tests for Lazy Loading System
 * Tests for: detectUserCohort, isFeatureEligibleForUser, getUserHash, getCurrentPage, loadFeatureModule
 * 
 * Uses: Mocks, Stubs, Fakes for testing
 */

describe('Lazy Loading and Feature Eligibility System', () => {
	let extension;
	let mockNavigator;
	let mockChrome;

	beforeEach(() => {
		// Reset extension object before each test
		extension = {
			featureConfig: {
				debug: false,
				metadata: {
					test_feature: {
						experimental: true,
						targetCohorts: ['multilingual', 'subtitle_users'],
						experimentalPercentage: 50
					},
					legacy_feature: {
						experimental: false
					}
				}
			},
			storage: {
				data: {}
			},
			featureRegistry: {
				test_feature: {
					path: 'www.youtube.com/test/test.js',
					run_on_pages: 'watch',
					section: 'test'
				},
				global_feature: {
					path: 'www.youtube.com/test/global.js',
					run_on_pages: '*',
					section: 'test'
				}
			},
			loadedModules: {},
			log: jest.fn()
		};

		// Mock navigator (stub) - Single language by default
		mockNavigator = {
			languages: ['en-US'],
			language: 'en-US',
			userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
		};
		// Delete and redefine to allow updates in tests
		delete global.navigator;
		Object.defineProperty(global, 'navigator', {
			get: () => mockNavigator,
			configurable: true
		});

		// Reset document.cookie (jsdom provides document object)
		if (global.document) {
			// Clear all cookies by setting them to expired
			const cookies = global.document.cookie.split(';');
			for (let cookie of cookies) {
				const eqPos = cookie.indexOf('=');
				const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
				global.document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
			}
		}

		// Mock location (stub) - Avoid jsdom navigation issues
		delete global.location;
		global.location = { 
			pathname: '/watch',
			href: 'https://www.youtube.com/watch'
		};

		// Mock chrome runtime (fake)
		mockChrome = {
			runtime: {
				getURL: jest.fn((path) => `chrome-extension://test${path}`)
			}
		};
		global.chrome = mockChrome;
	});

	// ==================== USER COHORT DETECTION ====================

	describe('detectUserCohort', () => {
		// Implementation of detectUserCohort for testing
		function detectUserCohort() {
			var cohorts = [];
			
			var languages = navigator.languages || [navigator.language];
			if (languages.length > 1) {
				cohorts.push('multilingual');
			}
			
			var multilingualCountries = ['CH', 'BE', 'CA', 'IN', 'SG', 'ZA', 'PH', 'MY'];
			var userLanguage = navigator.language || '';
			var countryCode = userLanguage.split('-')[1];
			if (countryCode && multilingualCountries.includes(countryCode.toUpperCase())) {
				cohorts.push('multilingual_countries');
			}
			
			if (extension.storage.data.subtitle_language || extension.storage.data.subtitles) {
				cohorts.push('subtitle_users');
			}
			
			if (document.cookie.indexOf('LOGIN_INFO') !== -1) {
				cohorts.push('logged_in');
			}
			
			extension.log('Detected user cohorts:', cohorts);
			return cohorts;
		}

		test('should detect multilingual users with multiple browser languages', () => {
			// Arrange - Mock with multiple languages
			mockNavigator.languages = ['en-US', 'es-ES', 'fr-FR'];

			// Act
			const cohorts = detectUserCohort();

			// Assert
			expect(cohorts).toContain('multilingual');
			expect(extension.log).toHaveBeenCalled();
		});

		test('should detect users from multilingual countries', () => {
			// Arrange - Mock Swiss user (CH) with exactly ONE language to avoid multilingual flag
			mockNavigator.languages = ['de-CH']; // Only ONE language
			mockNavigator.language = 'de-CH';

			// Act
			const cohorts = detectUserCohort();

			// Assert
			expect(cohorts).toContain('multilingual_countries');
			expect(cohorts).not.toContain('multilingual'); // Should NOT be multilingual with 1 language
		});

		test('should detect subtitle users when subtitle_language is set', () => {
			// Arrange - Mock subtitle user
			extension.storage.data.subtitle_language = 'en';

			// Act
			const cohorts = detectUserCohort();

			// Assert
			expect(cohorts).toContain('subtitle_users');
		});

		test('should detect logged-in users via cookie', () => {
			// Arrange - Mock logged-in user with fake cookie
			document.cookie = 'LOGIN_INFO=somevalue; other=data';

			// Act
			const cohorts = detectUserCohort();

			// Assert
			expect(cohorts).toContain('logged_in');
		});

		test('should return multiple cohorts for user matching multiple criteria', () => {
			// Arrange - User with multiple characteristics
			mockNavigator.languages = ['en-CA', 'fr-CA']; // Multilingual
			mockNavigator.language = 'en-CA'; // Canadian (multilingual country)
			extension.storage.data.subtitles = true; // Subtitle user
			document.cookie = 'LOGIN_INFO=test'; // Logged in

			// Act
			const cohorts = detectUserCohort();

			// Assert
			expect(cohorts).toContain('multilingual');
			expect(cohorts).toContain('multilingual_countries');
			expect(cohorts).toContain('subtitle_users');
			expect(cohorts).toContain('logged_in');
			expect(cohorts.length).toBe(4);
		});

		test('should return empty array for user matching no cohort criteria', () => {
			// Arrange - Basic user with defaults set in beforeEach

			// Act
			const cohorts = detectUserCohort();

			// Assert
			expect(cohorts).toEqual([]);
			expect(cohorts.length).toBe(0);
		});
	});

	// ==================== FEATURE ELIGIBILITY CHECK ====================

	describe('isFeatureEligibleForUser', () => {
		let mockDetectUserCohort;
		let mockGetUserHash;

		beforeEach(() => {
			// Mock implementation (stub)
			mockDetectUserCohort = jest.fn(() => ['multilingual']);
			mockGetUserHash = jest.fn(() => 42);
		});

		function isFeatureEligibleForUser(featureKey) {
			var metadata = extension.featureConfig.metadata[featureKey];
			
			if (!metadata) {
				return true;
			}
			
			if (!metadata.experimental) {
				return true;
			}
			
			if (extension.storage.data.hasOwnProperty(featureKey)) {
				return true;
			}
			
			if (metadata.targetCohorts && metadata.targetCohorts.length > 0) {
				var userCohorts = mockDetectUserCohort();
				var isInTargetCohort = metadata.targetCohorts.some(function(cohort) {
					return userCohorts.includes(cohort);
				});
				
				if (isInTargetCohort) {
					extension.log('Feature', featureKey, 'enabled for user cohort');
					return true;
				}
			}
			
			if (metadata.experimentalPercentage) {
				var userHash = mockGetUserHash();
				var isInExperiment = (userHash % 100) < metadata.experimentalPercentage;
				
				if (isInExperiment) {
					extension.log('Feature', featureKey, 'enabled via experimental rollout');
					return true;
				}
			}
			
			extension.log('Feature', featureKey, 'not eligible for this user');
			return false;
		}

		test('should allow feature with no metadata (legacy feature)', () => {
			// Act
			const eligible = isFeatureEligibleForUser('unknown_feature');

			// Assert
			expect(eligible).toBe(true);
		});

		test('should allow non-experimental features for all users', () => {
			// Act
			const eligible = isFeatureEligibleForUser('legacy_feature');

			// Assert
			expect(eligible).toBe(true);
		});

		test('should allow feature if user has explicitly enabled it', () => {
			// Arrange - User has explicitly enabled the feature
			extension.storage.data.test_feature = true;

			// Act
			const eligible = isFeatureEligibleForUser('test_feature');

			// Assert
			expect(eligible).toBe(true);
		});

		test('should enable feature for users in target cohort', () => {
			// Arrange - User is multilingual (in target cohort)
			mockDetectUserCohort.mockReturnValue(['multilingual']);

			// Act
			const eligible = isFeatureEligibleForUser('test_feature');

			// Assert
			expect(eligible).toBe(true);
			expect(mockDetectUserCohort).toHaveBeenCalled();
		});

		test('should enable feature via experimental rollout percentage', () => {
			// Arrange - User hash falls within 50% rollout
			mockDetectUserCohort.mockReturnValue([]); // Not in cohort
			mockGetUserHash.mockReturnValue(25); // 25% < 50% rollout

			// Act
			const eligible = isFeatureEligibleForUser('test_feature');

			// Assert
			expect(eligible).toBe(true);
			expect(mockGetUserHash).toHaveBeenCalled();
		});

		test('should reject feature when user not in cohort and outside rollout percentage', () => {
			// Arrange - User doesn't meet any criteria
			mockDetectUserCohort.mockReturnValue([]); // Not in cohort
			mockGetUserHash.mockReturnValue(75); // 75% > 50% rollout

			// Act
			const eligible = isFeatureEligibleForUser('test_feature');

			// Assert
			expect(eligible).toBe(false);
		});
	});

	// ==================== USER HASH (for A/B testing) ====================

	describe('getUserHash', () => {
		function getUserHash() {
			var str = navigator.userAgent + (navigator.language || '');
			var hash = 0;
			for (var i = 0; i < str.length; i++) {
				var char = str.charCodeAt(i);
				hash = ((hash << 5) - hash) + char;
				hash = hash & hash;
			}
			return Math.abs(hash);
		}

		test('should generate consistent hash for same user agent', () => {
			// Act
			const hash1 = getUserHash();
			const hash2 = getUserHash();

			// Assert
			expect(hash1).toBe(hash2);
			expect(typeof hash1).toBe('number');
			expect(hash1).toBeGreaterThanOrEqual(0);
		});

		test('should generate different hash for different user agents', () => {
			// Arrange - Get hash with first user agent
			const hash1 = getUserHash();
			
			// Change user agent
			mockNavigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
			const hash2 = getUserHash();

			// Assert
			expect(hash1).not.toBe(hash2);
			expect(typeof hash1).toBe('number');
			expect(typeof hash2).toBe('number');
		});

		test('should always return positive number', () => {
			// Act
			const hash = getUserHash();

			// Assert
			expect(hash).toBeGreaterThanOrEqual(0);
		});
	});

	// ==================== PAGE DETECTION ====================

	describe('getCurrentPage', () => {
		// Accept pathname as parameter for testability
		function getCurrentPage(pathname) {
			if (pathname === '/' || pathname === '') return 'home';
			if (pathname.startsWith('/watch')) return 'watch';
			if (pathname.startsWith('/results')) return 'results';
			if (pathname.startsWith('/feed/subscriptions')) return 'feed';
			if (pathname.startsWith('/feed')) return 'feed';
			if (pathname.startsWith('/channel') || pathname.startsWith('/c/') || 
			    pathname.startsWith('/user/') || pathname.startsWith('/@')) return 'channel';
			if (pathname.startsWith('/playlist')) return 'playlist';
			
			return 'other';
		}

		test('should detect home page', () => {
			expect(getCurrentPage('/')).toBe('home');
		});

		test('should detect watch page', () => {
			expect(getCurrentPage('/watch')).toBe('watch');
		});

		test('should detect search results page', () => {
			expect(getCurrentPage('/results')).toBe('results');
		});

		test('should detect feed/subscriptions page', () => {
			expect(getCurrentPage('/feed/subscriptions')).toBe('feed');
		});

		test('should detect channel page with /channel/', () => {
			expect(getCurrentPage('/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw')).toBe('channel');
		});

		test('should detect channel page with /@username', () => {
			expect(getCurrentPage('/@username')).toBe('channel');
		});

		test('should detect playlist page', () => {
			expect(getCurrentPage('/playlist')).toBe('playlist');
		});

		test('should return "other" for unknown pages', () => {
			expect(getCurrentPage('/unknown/page')).toBe('other');
		});
	});

	// ==================== LOAD AND ENABLE FEATURE ====================

	describe('loadAndEnableFeature', () => {
		let mockLoadFeatureModule;
		let mockCamelize;

		beforeEach(() => {
			mockLoadFeatureModule = jest.fn(() => Promise.resolve());
			mockCamelize = jest.fn((str) => str.replace(/_/g, ''));
			
			extension.loadFeatureModule = mockLoadFeatureModule;
			extension.camelize = mockCamelize;
			extension.features = {
				testfeature: jest.fn()
			};
			extension.logFeature = jest.fn();
		});

		function loadAndEnableFeature(featureKey, value) {
			var featureInfo = extension.featureRegistry[featureKey];
			
			if (!featureInfo) {
				extension.log('Feature not in registry:', featureKey);
				return Promise.resolve();
			}
			
			// Simplified page check for test
			var currentPage = 'watch'; // Mocked
			var runOnPages = featureInfo.run_on_pages.split(',').map(function(p) { return p.trim(); });
			var shouldRun = runOnPages.includes('*') || runOnPages.includes(currentPage);
			
			if (!shouldRun) {
				extension.log('Feature', featureKey, 'not applicable on page:', currentPage);
				return Promise.resolve();
			}
			
			return extension.loadFeatureModule(featureInfo.path).then(function() {
				var camelizedKey = extension.camelize(featureKey);
				
				if (typeof extension.features[camelizedKey] === 'function') {
					extension.logFeature(camelizedKey, 'ENABLE', value);
					extension.features[camelizedKey](value);
				} else {
					extension.log('Feature function not found after load:', camelizedKey);
				}
			});
		}

		test('should not load feature not in registry', async () => {
			// Act
			await loadAndEnableFeature('nonexistent_feature', true);

			// Assert
			expect(mockLoadFeatureModule).not.toHaveBeenCalled();
			expect(extension.log).toHaveBeenCalledWith('Feature not in registry:', 'nonexistent_feature');
		});

		test('should load and enable feature on applicable page', async () => {
			// Act
			await loadAndEnableFeature('test_feature', true);

			// Assert
			expect(mockLoadFeatureModule).toHaveBeenCalledWith('www.youtube.com/test/test.js');
			expect(mockCamelize).toHaveBeenCalledWith('test_feature');
			expect(extension.logFeature).toHaveBeenCalled();
		});

		test('should load global feature on any page', async () => {
			// Act
			await loadAndEnableFeature('global_feature', true);

			// Assert
			expect(mockLoadFeatureModule).toHaveBeenCalledWith('www.youtube.com/test/global.js');
		});

		test('should pass value to feature function', async () => {
			// Arrange
			const testValue = { setting: 'value' };

			// Act
			await loadAndEnableFeature('test_feature', testValue);

			// Assert
			expect(extension.features.testfeature).toHaveBeenCalledWith(testValue);
		});
	});
});
