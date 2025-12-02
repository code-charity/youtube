/**
 * Performance Benchmarking Tests
 * 
 * These tests measure execution time of critical functions
 * to identify performance bottlenecks.
 */

describe('Performance Benchmarks', () => {
    let extension;
    
    beforeEach(() => {
        // Mock global objects
        global.navigator = {
            language: 'en-US',
            languages: ['en-US']
        };
        
        global.document = {
            cookie: ''
        };
        
        global.console = {
            log: jest.fn(),
            error: jest.fn()
        };
        
        // Reset extension object
        extension = {
            domReady: false,
            events: { listeners: {} },
            features: {},
            functions: {},
            messages: { queue: [] },
            ready: false,
            storage: { data: {} },
            featureConfig: {
                debug: false,
                metadata: {
                    test_feature: {
                        defaultEnabled: false,
                        experimental: true,
                        targetCohorts: ['multilingual'],
                        experimentalPercentage: 50
                    }
                }
            },
            featureRegistry: {},
            loadedModules: {},
            
            log: function() {},
            logError: function() {},
            logFeature: function() {},
            
            detectUserCohort: function() {
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
                
                return cohorts;
            },
            
            getUserHash: function() {
                var userAgent = navigator.userAgent || 'default';
                var hash = 0;
                for (var i = 0; i < userAgent.length; i++) {
                    var char = userAgent.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                return Math.abs(hash);
            },
            
            isFeatureEligibleForUser: function(featureKey) {
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
                    var userCohorts = extension.detectUserCohort();
                    var isInTargetCohort = metadata.targetCohorts.some(function(cohort) {
                        return userCohorts.includes(cohort);
                    });
                    
                    if (isInTargetCohort) {
                        return true;
                    }
                }
                
                if (metadata.experimentalPercentage) {
                    var userHash = extension.getUserHash();
                    var isInExperiment = (userHash % 100) < metadata.experimentalPercentage;
                    
                    if (isInExperiment) {
                        return true;
                    }
                }
                
                return false;
            },
            
            camelize: function(string) {
                // Optimized: Single-pass regex replacement for both _ and -
                // Early exit if no transformations needed (common case)
                if (string.indexOf('_') !== -1 || string.indexOf('-') !== -1) {
                    return string.replace(/[-_][a-z]/g, function(match) {
                        return match[1].toUpperCase();
                    });
                }
                return string;
            }
        };
        
        global.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
    });
    
    /**
     * Benchmark: detectUserCohort
     * This function is called frequently to determine feature eligibility
     */
    describe('detectUserCohort Performance', () => {
        test('should execute in under 1ms for simple case', () => {
            const iterations = 10000;
            const start = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                extension.detectUserCohort();
            }
            
            const end = performance.now();
            const duration = end - start;
            const averageTime = duration / iterations;
            
            console.log(`detectUserCohort: ${duration.toFixed(2)}ms for ${iterations} iterations`);
            console.log(`Average: ${(averageTime * 1000).toFixed(2)}μs per call`);
            
            // Should be very fast - under 1ms per call on average
            expect(averageTime).toBeLessThan(1);
        });
        
        test('should handle multilingual users efficiently', () => {
            global.navigator.languages = ['en-US', 'es-ES', 'fr-FR', 'de-DE'];
            global.navigator.language = 'en-US';
            
            const iterations = 10000;
            const start = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                extension.detectUserCohort();
            }
            
            const end = performance.now();
            const duration = end - start;
            const averageTime = duration / iterations;
            
            console.log(`detectUserCohort (multilingual): ${duration.toFixed(2)}ms for ${iterations} iterations`);
            console.log(`Average: ${(averageTime * 1000).toFixed(2)}μs per call`);
            
            expect(averageTime).toBeLessThan(1);
        });
    });
    
    /**
     * Benchmark: getUserHash
     * Used for A/B testing - must be fast and consistent
     */
    describe('getUserHash Performance', () => {
        test('should execute in under 0.1ms', () => {
            const iterations = 10000;
            const start = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                extension.getUserHash();
            }
            
            const end = performance.now();
            const duration = end - start;
            const averageTime = duration / iterations;
            
            console.log(`getUserHash: ${duration.toFixed(2)}ms for ${iterations} iterations`);
            console.log(`Average: ${(averageTime * 1000).toFixed(2)}μs per call`);
            
            // Hash calculation should be extremely fast
            expect(averageTime).toBeLessThan(0.1);
        });
        
        test('should handle long user agent strings', () => {
            global.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'.repeat(10);
            
            const iterations = 10000;
            const start = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                extension.getUserHash();
            }
            
            const end = performance.now();
            const duration = end - start;
            const averageTime = duration / iterations;
            
            console.log(`getUserHash (long UA): ${duration.toFixed(2)}ms for ${iterations} iterations`);
            console.log(`Average: ${(averageTime * 1000).toFixed(2)}μs per call`);
            
            expect(averageTime).toBeLessThan(1);
        });
    });
    
    /**
     * Benchmark: isFeatureEligibleForUser
     * Critical path - called for every feature on every page load
     */
    describe('isFeatureEligibleForUser Performance', () => {
        test('should execute quickly for legacy features', () => {
            const iterations = 10000;
            const start = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                extension.isFeatureEligibleForUser('legacy_feature_no_metadata');
            }
            
            const end = performance.now();
            const duration = end - start;
            const averageTime = duration / iterations;
            
            console.log(`isFeatureEligibleForUser (legacy): ${duration.toFixed(2)}ms for ${iterations} iterations`);
            console.log(`Average: ${(averageTime * 1000).toFixed(2)}μs per call`);
            
            expect(averageTime).toBeLessThan(0.5);
        });
        
        test('should handle experimental features with cohort checking', () => {
            global.navigator.languages = ['en-US', 'es-ES'];
            
            const iterations = 10000;
            const start = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                extension.isFeatureEligibleForUser('test_feature');
            }
            
            const end = performance.now();
            const duration = end - start;
            const averageTime = duration / iterations;
            
            console.log(`isFeatureEligibleForUser (experimental): ${duration.toFixed(2)}ms for ${iterations} iterations`);
            console.log(`Average: ${(averageTime * 1000).toFixed(2)}μs per call`);
            
            // This includes detectUserCohort call, so might be slower
            expect(averageTime).toBeLessThan(2);
        });
    });
    
    /**
     * Benchmark: camelize
     * String transformation utility used frequently
     */
    describe('camelize Performance', () => {
        test('should execute in under 0.1ms for snake_case', () => {
            const testString = 'this_is_a_test_string_with_underscores';
            const iterations = 10000;
            const start = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                extension.camelize(testString);
            }
            
            const end = performance.now();
            const duration = end - start;
            const averageTime = duration / iterations;
            
            console.log(`camelize (snake_case): ${duration.toFixed(2)}ms for ${iterations} iterations`);
            console.log(`Average: ${(averageTime * 1000).toFixed(2)}μs per call`);
            
            expect(averageTime).toBeLessThan(0.1);
        });
        
        test('should handle long strings efficiently', () => {
            const testString = 'very_long_snake_case_string_with_many_underscores_to_test_performance'.repeat(5);
            const iterations = 10000;
            const start = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                extension.camelize(testString);
            }
            
            const end = performance.now();
            const duration = end - start;
            const averageTime = duration / iterations;
            
            console.log(`camelize (long string): ${duration.toFixed(2)}ms for ${iterations} iterations`);
            console.log(`Average: ${(averageTime * 1000).toFixed(2)}μs per call`);
            
            expect(averageTime).toBeLessThan(1);
        });
    });
    
    /**
     * Integrated benchmark: Complete feature eligibility check
     */
    describe('Complete Feature Check Flow', () => {
        test('should complete full eligibility check efficiently', () => {
            global.navigator.languages = ['en-US', 'es-ES'];
            extension.featureConfig.metadata = {
                feature1: { experimental: true, targetCohorts: ['multilingual'] },
                feature2: { experimental: true, experimentalPercentage: 50 },
                feature3: { experimental: false },
                feature4: { experimental: true, targetCohorts: ['subtitle_users'] }
            };
            
            const features = ['feature1', 'feature2', 'feature3', 'feature4'];
            const iterations = 1000;
            const start = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                features.forEach(feature => {
                    extension.isFeatureEligibleForUser(feature);
                });
            }
            
            const end = performance.now();
            const duration = end - start;
            const averageTime = duration / iterations;
            
            console.log(`Full feature check (4 features): ${duration.toFixed(2)}ms for ${iterations} iterations`);
            console.log(`Average: ${averageTime.toFixed(2)}ms per check`);
            console.log(`Per feature: ${(averageTime / 4).toFixed(2)}ms`);
            
            // Should check all 4 features in under 10ms
            expect(averageTime).toBeLessThan(10);
        });
    });
});
