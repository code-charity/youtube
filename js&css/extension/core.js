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
	}
};

// list of settings we inject into HTML element as attributes, used by CSS.
let htmlAttributes = [
	"activated",
	"ads",
	"always-show-progress-bar",
	"bluelight",
	"channel-compact-theme",
	"channel-hide-featured-content",
	"collapse-of-subscription-sections",
	"columns",
	"comments",
	"comments-sidebar",
	"comments-sidebar-left",
	"comments-sidebar-simple",
	"compactSpacing",
	"description",
	"embeddedHidePauseOverlay",
	"embeddedHideShare",
	"embeddedHideYoutubeLogo",
	"header-hide-country-code",
	"header-hide-right-buttons",
	"header-improve-logo",
	"header-position",
	"header-transparent",
	"hide-animated-thumbnails",
	"hide-author-avatars",
	"hide-clip-button",
	"hide-comments-count",
	"hide-date",
	"hide-details",
	"hide-dislike-button",
	"hide-download-button",
	"hide-footer",
	"hide-gradient-bottom",
	"hide-more-button",
	"hide-playlist",
	"hide-report-button",
	"hide-save-button",
	"hide-scroll-for-details",
	"hide-share-button",
	"hide-shorts-remixing",
	"hide-sidebar",
	"hide-thanks-button",
	"hide-thumbnail-overlay",
	"hide-video-title-fullScreen",
	"hide-views-count",
	"hide-voice-search-button",
	"improvedtube-search",
	"likes",
	"livechat",
	"mini-player-cursor",
	"no-page-margin",
	"player-autoplay-button",
	"player-color",
	"player-crop-chapter-titles",
	"player-fit-to-win-button",
	"player-hide-annotations",
	"player-hide-cards",
	"player-hide-endscreen",
	"player-hide-skip-overlay",
	"player-miniplayer-button",
	"player-next-button",
	"player-play-button",
	"player-previous-button",
	"player-remote-button",
	"player-screen-button",
	"player-settings-button",
	"player-show-cards-on-mouse-hover",
	"player-size",
	"player-size",
	"player-subtitles-button",
	"player-transparent-background",
	"player-view-button",
	"player-volume-button",
	"red-dislike-button",
	"related-videos",
	"remove-black-bars",
	"remove-history-shorts",
	"remove-home-page-shorts",
	"remove-related-search-results",
	"remove-shorts-reel-search-results",
	"remove-subscriptions-shorts",
	"remove-trending-shorts",
	"schedule",
	"scroll-bar",
	"scroll-to-top",
	"search-focus",
	"sidebar-left",
	"squared-user-images",
	"subscribe",
	"theme",
	"thumbnails-hide",
	"thumbnails-right",
	"transcript",
	"youtube-home-page",
	"youtubeDetailButtons"
];

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
				if (listener instanceof(async function () {}).constructor === true) {
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
		for (const key in changes) {
			let value = changes[key].newValue,
				camelized_key = extension.camelize(key);

			extension.storage.data[key] = value;

			if (htmlAttributes.includes(key)) {
				document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), value);
			}

			if (typeof extension.features[camelized_key] === 'function') {
				extension.features[camelized_key](true);
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

		extension.events.trigger('storage-loaded');
		extension.messages.send({
			action: 'storage-loaded',
			storage: items
		});

		for (const key in items) {
			if (htmlAttributes.includes(key)) {
				document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), items[key]);
			}
		}

		if (callback) {
			callback(extension.storage.data);
		}
	});
};
