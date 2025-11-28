/*--------------------------------------------------------------
>>> CORE:
----------------------------------------------------------------
# Global variable
# Camelize
# Events
	# On
	# Trigger
# Inject
# Messages
	# Create element
	# Listener
	# Send
# Storage
	# Get
	# Listener
	# Load
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

var extension = {
	domReady: false,
	events: {
		listeners: {}
	},
	features: {},
	functions: {},
	messages: {
		queue: []
	},
	ready: false,
	storage: {
		data: {}
	},
	// Feature configuration and rollout control
	featureConfig: {
		// Debug mode - set to false to disable console logs in production
		debug: false,
		
		// Feature metadata for gradual rollout and targeting
		// Each feature can specify: defaultEnabled, targetCohorts, experimentalPercentage
		metadata: {
			// Example: Original title feature
			original_title: {
				defaultEnabled: false,  // Don't enable by default (experimental)
				experimental: true,     // Mark as experimental
				targetCohorts: [        // Which user groups benefit most?
					'multilingual',     // Users with multiple languages
					'multilingual_countries', // Users from countries with multiple languages
					'subtitle_users'    // Users who regularly use subtitles
				],
				description: 'Show original video titles in their native language',
				estimatedAppreciation: 40  // ~40% of users likely to appreciate
			}
			// Add more features here as needed
		}
	},
	// Feature registry for lazy loading
	featureRegistry: {
		// Define all features with their module paths and run conditions
		// Format: 'feature_name': { path: '...', run_on_pages: '...', section: '...' }
		
		// General features
		youtubeHomePage: { path: 'www.youtube.com/general/general.js', run_on_pages: '*', section: 'general' },
		collapseOfSubscriptionSections: { path: 'www.youtube.com/general/general.js', run_on_pages: 'feed', section: 'general' },
		onlyOnePlayerInstancePlaying: { path: 'www.youtube.com/general/general.js', run_on_pages: '*', section: 'general' },
		addScrollToTop: { path: 'www.youtube.com/general/general.js', run_on_pages: '*', section: 'general' },
		confirmationBeforeClosing: { path: 'www.youtube.com/general/general.js', run_on_pages: '*', section: 'general' },
		defaultContentCountry: { path: 'www.youtube.com/general/general.js', run_on_pages: '*', section: 'general' },
		popupWindowButtons: { path: 'www.youtube.com/general/general.js', run_on_pages: '*', section: 'general' },
		font: { path: 'www.youtube.com/general/general.js', run_on_pages: '*', section: 'general' },
		markWatchedVideos: { path: 'www.youtube.com/general/general.js', run_on_pages: 'home, results, feed', section: 'general' },
		trackWatchedVideos: { path: 'www.youtube.com/general/general.js', run_on_pages: 'watch', section: 'general' },
		thumbnailsQuality: { path: 'www.youtube.com/general/general.js', run_on_pages: '*', section: 'general' },
		disableThumbnailPlayback: { path: 'www.youtube.com/general/general.js', run_on_pages: '*', section: 'general' },
		openNewTab: { path: 'www.youtube.com/general/general.js', run_on_pages: '*', section: 'general' },
		removeListParamOnNewTab: { path: 'www.youtube.com/general/general.js', run_on_pages: '*', section: 'general' },
		clickableLinksInVideoDescriptions: { path: 'www.youtube.com/general/general.js', run_on_pages: 'watch', section: 'general' },
		changeThumbnailsPerRow: { path: 'www.youtube.com/general/general.js', run_on_pages: 'home, results, feed', section: 'general' },
		removeMemberOnly: { path: 'www.youtube.com/general/general.js', run_on_pages: '*', section: 'general' },
		
		// Sidebar features
		relatedVideos: { path: 'www.youtube.com/appearance/sidebar/sidebar.js', run_on_pages: 'watch', section: 'sidebar' },
		stickyNavigation: { path: 'www.youtube.com/appearance/sidebar/sidebar.js', run_on_pages: '*', section: 'sidebar' },
		
		// Night mode features
		bluelight: { path: 'www.youtube.com/night-mode/night-mode.js', run_on_pages: '*', section: 'night-mode' },
		dim: { path: 'www.youtube.com/night-mode/night-mode.js', run_on_pages: '*', section: 'night-mode' },
		
		// Comments
		comments: { path: 'www.youtube.com/appearance/comments/comments.js', run_on_pages: 'watch', section: 'comments' }
	},
	// Track loaded modules to avoid duplicate loads
	loadedModules: {}
};

/*--------------------------------------------------------------
# DEBUG LOGGING
--------------------------------------------------------------*/

extension.log = function() {
	if (extension.featureConfig.debug) {
		console.log.apply(console, ['[ImprovedTube]'].concat(Array.prototype.slice.call(arguments)));
	}
};

extension.logError = function() {
	console.error.apply(console, ['[ImprovedTube Error]'].concat(Array.prototype.slice.call(arguments)));
};

extension.logFeature = function(featureName, action, details) {
	if (extension.featureConfig.debug) {
		console.log('[ImprovedTube Feature]', featureName, '→', action, details || '');
	}
};

/*--------------------------------------------------------------
# USER COHORT DETECTION
--------------------------------------------------------------*/

extension.detectUserCohort = function() {
	var cohorts = [];
	
	// Detect multilingual users (browser has multiple language preferences)
	var languages = navigator.languages || [navigator.language];
	if (languages.length > 1) {
		cohorts.push('multilingual');
	}
	
	// Detect users from multilingual countries
	var multilingualCountries = ['CH', 'BE', 'CA', 'IN', 'SG', 'ZA', 'PH', 'MY']; // Switzerland, Belgium, Canada, India, Singapore, South Africa, Philippines, Malaysia
	var userLanguage = navigator.language || '';
	var countryCode = userLanguage.split('-')[1];
	if (countryCode && multilingualCountries.includes(countryCode.toUpperCase())) {
		cohorts.push('multilingual_countries');
	}
	
	// Check if user regularly uses subtitles (stored in extension data)
	if (extension.storage.data.subtitle_language || extension.storage.data.subtitles) {
		cohorts.push('subtitle_users');
	}
	
	// Check if logged in to YouTube
	if (document.cookie.indexOf('LOGIN_INFO') !== -1) {
		cohorts.push('logged_in');
	}
	
	extension.log('Detected user cohorts:', cohorts);
	return cohorts;
};

/*--------------------------------------------------------------
# FEATURE ELIGIBILITY CHECK
--------------------------------------------------------------*/

extension.isFeatureEligibleForUser = function(featureKey) {
	var metadata = extension.featureConfig.metadata[featureKey];
	
	// If no metadata, feature is eligible by default (legacy features)
	if (!metadata) {
		return true;
	}
	
	// If feature is not experimental, it's available to everyone
	if (!metadata.experimental) {
		return true;
	}
	
	// If user has explicitly enabled/disabled it, respect their choice
	if (extension.storage.data.hasOwnProperty(featureKey)) {
		return true;
	}
	
	// For experimental features, check if user is in target cohort
	if (metadata.targetCohorts && metadata.targetCohorts.length > 0) {
		var userCohorts = extension.detectUserCohort();
		var isInTargetCohort = metadata.targetCohorts.some(function(cohort) {
			return userCohorts.includes(cohort);
		});
		
		if (isInTargetCohort) {
			extension.log('Feature', featureKey, 'enabled for user cohort');
			return true;
		}
	}
	
	// If experimental percentage is set, do gradual rollout
	if (metadata.experimentalPercentage) {
		// Use a deterministic hash of user agent to assign users to groups
		var userHash = extension.getUserHash();
		var isInExperiment = (userHash % 100) < metadata.experimentalPercentage;
		
		if (isInExperiment) {
			extension.log('Feature', featureKey, 'enabled via experimental rollout');
			return true;
		}
	}
	
	// Feature not eligible for this user yet
	extension.log('Feature', featureKey, 'not eligible for this user');
	return false;
};

/*--------------------------------------------------------------
# USER HASH (for consistent A/B testing)
--------------------------------------------------------------*/

extension.getUserHash = function() {
	// Create a simple hash from user agent for consistent feature assignment
	var str = navigator.userAgent + (navigator.language || '');
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		var char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash);
};

/*--------------------------------------------------------------
# PAGE DETECTION
--------------------------------------------------------------*/

extension.getCurrentPage = function() {
	var pathname = location.pathname;
	
	if (pathname === '/' || pathname === '') return 'home';
	if (pathname.startsWith('/watch')) return 'watch';
	if (pathname.startsWith('/results')) return 'results';
	if (pathname.startsWith('/feed/subscriptions')) return 'feed';
	if (pathname.startsWith('/feed')) return 'feed';
	if (pathname.startsWith('/channel') || pathname.startsWith('/c/') || pathname.startsWith('/user/') || pathname.startsWith('/@')) return 'channel';
	if (pathname.startsWith('/playlist')) return 'playlist';
	
	return 'other';
};

/*--------------------------------------------------------------
# LAZY LOAD FEATURE MODULE
--------------------------------------------------------------*/

extension.loadFeatureModule = function(modulePath) {
	// Return existing promise if module is already loading/loaded
	if (this.loadedModules[modulePath]) {
		return this.loadedModules[modulePath];
	}
	
	this.log('Loading module:', modulePath);
	
	// Create promise for this module load
	var loadPromise = new Promise(function(resolve, reject) {
		var script = document.createElement('script');
		script.src = chrome.runtime.getURL('/js&css/extension/' + modulePath);
		script.onload = function() {
			extension.log('Module loaded:', modulePath);
			script.remove();
			resolve();
		};
		script.onerror = function() {
			extension.logError('Failed to load module:', modulePath);
			reject(new Error('Failed to load: ' + modulePath));
		};
		(document.head || document.documentElement).appendChild(script);
	});
	
	// Cache the promise
	this.loadedModules[modulePath] = loadPromise;
	
	return loadPromise;
};

/*--------------------------------------------------------------
# LOAD AND ENABLE FEATURE
--------------------------------------------------------------*/

extension.loadAndEnableFeature = function(featureKey, value) {
	var featureInfo = this.featureRegistry[featureKey];
	
	if (!featureInfo) {
		this.log('Feature not in registry:', featureKey);
		return Promise.resolve();
	}
	
	// Check if feature should run on current page
	var currentPage = this.getCurrentPage();
	var runOnPages = featureInfo.run_on_pages.split(',').map(function(p) { return p.trim(); });
	var shouldRun = runOnPages.includes('*') || runOnPages.includes(currentPage);
	
	if (!shouldRun) {
		this.log('Feature', featureKey, 'not applicable on page:', currentPage);
		return Promise.resolve();
	}
	
	// Load the module
	return this.loadFeatureModule(featureInfo.path).then(function() {
		// Module loaded, now call the feature function
		var camelizedKey = extension.camelize(featureKey);
		
		if (typeof extension.features[camelizedKey] === 'function') {
			extension.logFeature(camelizedKey, 'ENABLE', value);
			extension.features[camelizedKey](value);
		} else {
			extension.log('Feature function not found after load:', camelizedKey);
		}
	}).catch(function(err) {
		extension.logError('Failed to load feature', featureKey, err);
	});
};

/*--------------------------------------------------------------
# CAMELIZE
--------------------------------------------------------------*/

extension.camelize = function (string) {
	var result = '';

	for (var i = 0, l = string.length; i < l; i++) {
		var character = string[i];

		if (character === '_' || character === '-') {
			i++;

			result += string[i].toUpperCase();
		} else {
			result += character;
		}
	}

	return result;
};

/*--------------------------------------------------------------
# EVENTS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# ON
--------------------------------------------------------------*/

extension.events.on = function (type, listener, options = {}) {
	var listeners = extension.events.listeners;

	if (!listeners[type]) {
		listeners[type] = [];
	}

	if (options.async === true) {
		listener = (function (original) {
			return async function () {
				return new Promise(original);
			};
		})(listener);
	}

	if (options.prepend === true) {
		listeners[type].unshift(listener);
	} else {
		listeners[type].push(listener);
	}
};

/*--------------------------------------------------------------
# TRIGGER
--------------------------------------------------------------*/

extension.events.trigger = async function (type, data) {
	var listeners = extension.events.listeners[type];

	if (listeners) {
		for (var i = 0, l = listeners.length; i < l; i++) {
			var listener = listeners[i];

			if (typeof listener === 'function') {
				if (listener instanceof (async function () { }).constructor === true) {
					await listener(data);
				} else {
					listener(data);
				}
			}
		}
	}
};

/*--------------------------------------------------------------
# INJECT
----------------------------------------------------------------

--------------------------------------------------------------*/

extension.inject = function (paths, callback) {
	if (paths.length > 0) {
		var element,
			path = chrome.runtime.getURL(paths[0]);

		if (path.indexOf('.css') !== -1) {
			element = document.createElement('link');

			element.rel = 'stylesheet';
			element.href = path;
		} else {
			element = document.createElement('script');

			element.src = path;
		}

		element.onload = function () {
			paths.shift();

			extension.inject(paths, callback);
		};

		document.documentElement.appendChild(element);
	} else if (callback) {
		callback();
	}
};

/*extension.inject = function (urls, callback) {
	var threads = urls.length;

	for (var i = 0, l = urls.length; i < l; i++) {
		var element,
			url = chrome.runtime.getURL(urls[i]);

		if (url.indexOf('.css') !== -1) {
			element = document.createElement('link');

			element.rel = 'stylesheet';
			element.href = url;
		} else {
			element = document.createElement('script');

			element.src = url;
		}

		element.onload = function () {
			threads--;

			if (threads === 0) {
				callback();
			}
		};

		document.documentElement.appendChild(element);
	}
};*/

/*--------------------------------------------------------------
# MESSAGES
----------------------------------------------------------------
	Designed for messaging between contexts of extension and
	website.
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# CREATE ELEMENT
--------------------------------------------------------------*/

extension.messages.create = function () {
	this.element = document.createElement('div');

	this.element.id = 'it-messages-from-extension';

	this.element.style.display = 'none';

	document.documentElement.appendChild(this.element);
};

/*--------------------------------------------------------------
# LISTENER
--------------------------------------------------------------*/

extension.messages.listener = function () {
	document.addEventListener('it-message-from-extension--readed', function () {
		extension.messages.queue.pop();

		if (extension.messages.queue.length > 0) {
			extension.messages.element.textContent = message;

			document.dispatchEvent(new CustomEvent('it-message-from-extension'));
		}
	});
};

/*--------------------------------------------------------------
# SEND
--------------------------------------------------------------*/

extension.messages.send = function (message) {
	if (typeof message === 'object') {
		message = JSON.stringify(message);
	}

	this.queue.push(message);

	if (this.queue.length === 1) {
		this.element.textContent = message;

		document.dispatchEvent(new CustomEvent('it-message-from-extension'));
	}
};

/*--------------------------------------------------------------
# STORAGE
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

extension.storage.get = function (key) {
	if (key.indexOf('/') === -1) {
		return this.data[key];
	} else {
		var target = this.data,
			path = key.split('/').filter(function (value) {
				return value != '';
			});

		for (var i = 0, l = key.length; i < l; i++) {
			var part = key[i];

			if (target.hasOwnProperty(part)) {
				target = target[part];
			} else {
				return undefined;
			}
		}
	}
};

/*--------------------------------------------------------------
# LISTENER
--------------------------------------------------------------*/

extension.storage.listener = function () {
	chrome.storage.onChanged.addListener(function (changes) {
		for (var key in changes) {
			var value = changes[key].newValue;
			var camelized_key = extension.camelize(key);

			extension.storage.data[key] = value;

			document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), value);

			// Check if feature is eligible for this user before enabling
			if (!extension.isFeatureEligibleForUser(key)) {
				extension.log('Feature', key, 'skipped - not eligible for this user');
				continue;
			}

			// Handle enabling/disabling features with lazy loading
			if (value === true || (typeof value === 'string' && value !== 'false' && value !== '')) {
				// Enable the feature - load module if needed
				extension.loadAndEnableFeature(key, value);
			} else if (value === false || value === '' || value === null || value === undefined) {
				// Disable the feature if already loaded and disable function exists
				var disableFunction = extension.features[camelized_key + 'Disable'];
				if (typeof disableFunction === 'function') {
					extension.logFeature(camelized_key, 'DISABLE');
					disableFunction();
				}
			}

			extension.events.trigger('storage-changed', {
				key,
				value
			});

			extension.messages.send({
				action: 'storage-changed',
				camelizedKey: camelized_key,
				key,
				value
			});
		}
	});
};

/*--------------------------------------------------------------
# LOAD
--------------------------------------------------------------*/

extension.storage.load = function (callback) {
	chrome.storage.local.get(function (items) {
		extension.storage.data = items;

		// initialize theme in case YT is in Dark cookie mode
		if (!extension.storage.data['theme'] && document.documentElement.hasAttribute('dark')) {
			extension.storage.data['theme'] = 'dark';
			chrome.storage.local.set({ theme: 'dark' });
		}

		for (const key in items) {
			document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), items[key]);
		}

		extension.events.trigger('storage-loaded');
		extension.messages.send({
			action: 'storage-loaded',
			storage: items
		});

		if (callback) {
			callback(extension.storage.data);
		}
	});
};
