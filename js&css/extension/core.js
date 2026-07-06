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
			var value = changes[key].newValue,
				camelized_key = extension.camelize(key);

			extension.storage.data[key] = value;

			document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), value);

			if (typeof extension.features[camelized_key] === 'function') {
				extension.features[camelized_key](value);
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
