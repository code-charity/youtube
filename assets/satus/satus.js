/*--------------------------------------------------------------
>>> CORE
----------------------------------------------------------------
# Global variable
# Animations duration
# Append
# Attr
# Camelize
# Snakelize
# Class
# Create element
# CSS
# Empty
# Element index
# Events
# Get property
# Is
# On
# Render
# Sort
# Storage
	# Clear
	# Get
	# Import
	# Set
	# Remove
	# On changed
# Localization
# Log
# Text
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

var satus = {
	components: {},
	events: {
		data: {}
	},
	locale: {
		data: {}
	},
	storage: {
		data: {},
		type: 'extension'
	}
};


/*--------------------------------------------------------------
# ANIMATION DURATION
--------------------------------------------------------------*/

satus.getAnimationDuration = function (element) {
	return Number(window.getComputedStyle(element).getPropertyValue('animation-duration').replace(/[^0-9.]/g, '')) * 1000;
};


/*--------------------------------------------------------------
# APPEND
--------------------------------------------------------------*/

satus.append = function (child, parent) {
	(parent || document.body).appendChild(child);
};


/*--------------------------------------------------------------
# ATTR
--------------------------------------------------------------*/

satus.attr = function (element, attributes) {
	if (attributes) {
		for (var name in attributes) {
			var value = attributes[name];

			if (satus.isFunction(value)) {
				value = value();
			}

			if (element.namespaceURI) {
				if (value === false) {
					element.removeAttributeNS(null, name);
				} else {
					element.setAttributeNS(null, name, value);
				}
			} else {
				if (value === false) {
					element.removeAttribute(name);
				} else {
					element.setAttribute(name, value);
				}
			}
		}
	}
};


/*--------------------------------------------------------------
# CAMELIZE
--------------------------------------------------------------*/

satus.camelize = function (string) {
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
# SNAKELIZE
--------------------------------------------------------------*/

satus.snakelize = function (string) {
	return string.replace(/([A-Z])/g, '-$1').toLowerCase();
};


/*--------------------------------------------------------------
# CLASS
--------------------------------------------------------------*/

satus.class = function (element, className) {
	if (className) {
		element.classList.add(className);
	}
};


/*--------------------------------------------------------------
# CLONE
--------------------------------------------------------------*/

satus.clone = function (item) {
	var clone = item.cloneNode(true),
		parent_css = window.getComputedStyle(item.parentNode),
		css = window.getComputedStyle(item),
		style = '';

	for (var i = 0, l = css.length; i < l; i++) {
		var property = css[i],
			value = css.getPropertyValue(property);

		if (property === 'background-color') {
			value = parent_css.getPropertyValue('background-color');
		}

		if (['box-shadow', 'left', 'top', 'bottom', 'right', 'opacity'].indexOf(property) === -1) {
			style += property + ':' + value + ';';
		}
	}


	clone.setAttribute('style', style);

	return clone;
};


/*--------------------------------------------------------------
# CREATE ELEMENT
--------------------------------------------------------------*/

satus.createElement = function (tagName, componentName, namespaceURI) {
	var camelizedTagName = this.camelize(tagName),
		className = 'satus-' + (componentName || tagName),
		element,
		match = className.match(/__[^__]+/g);

	if (!namespaceURI) {
		if (tagName === 'svg') {
			namespaceURI = 'http://www.w3.org/2000/svg';
		}
	}

	if (namespaceURI) {
		element = document.createElementNS(namespaceURI, tagName);
	} else if (this.components[camelizedTagName]) {
		element = document.createElement('div');
	} else {
		element = document.createElement(tagName);
	}

	if (match && match.length > 1) {
		className = className.slice(0, className.indexOf('__')) + match[match.length - 1];
	}

	element.componentName = componentName;
	element.className = className;

	element.createChildElement = function (tagName, componentName, namespaceURI) {
		var element = satus.createElement(tagName, this.componentName + '__' + (componentName || tagName), namespaceURI);

		if (this.baseProvider) {
			element.baseProvider = this.baseProvider;
		}

		if (this.layersProvider) {
			element.layersProvider = this.layersProvider;
		}

		this.appendChild(element);

		return element;
	};

	return element;
};


/*--------------------------------------------------------------
# CSS
--------------------------------------------------------------*/

satus.css = function (element, property) {
	return window.getComputedStyle(element).getPropertyValue(property);
};


/*--------------------------------------------------------------
# CRYPT
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# DECRYPTION
--------------------------------------------------------------*/

satus.decrypt = async function (text, password) {
	var iv = text.slice(0, 24).match(/.{2}/g).map(byte => parseInt(byte, 16)),
		algorithm = {
			name: 'AES-GCM',
			iv: new Uint8Array(iv)
		};

	try {
		var data = new TextDecoder().decode(await crypto.subtle.decrypt(
			algorithm,
			await crypto.subtle.importKey(
				'raw',
				await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)),
				algorithm,
				false, ['decrypt']
			),
			new Uint8Array(atob(text.slice(24)).match(/[\s\S]/g).map(ch => ch.charCodeAt(0)))
		));
	} catch (err) {
		return false;
	}

	return data;
};


/*--------------------------------------------------------------
# ENCRYPTION
--------------------------------------------------------------*/

satus.encrypt = async function (text, password) {
	var iv = crypto.getRandomValues(new Uint8Array(12)),
		algorithm = {
			name: 'AES-GCM',
			iv: iv
		};

	return Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('') + btoa(Array.from(new Uint8Array(await crypto.subtle.encrypt(
		algorithm,
		await crypto.subtle.importKey('raw', await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)), algorithm, false, ['encrypt']),
		new TextEncoder().encode(text)
	))).map(byte => String.fromCharCode(byte)).join(''));
};


/*--------------------------------------------------------------
# DATA
--------------------------------------------------------------*/

satus.data = function (element, data) {
	if (data) {
		for (var key in data) {
			var value = data[key];

			if (satus.isFunction(value)) {
				value = value();
			}

			element.dataset[key] = value;
		}
	}
};


/*--------------------------------------------------------------
# EMPTY
--------------------------------------------------------------*/

satus.empty = function (element, exclude = []) {
	for (var i = element.childNodes.length - 1; i > -1; i--) {
		var child = element.childNodes[i];

		if (exclude.indexOf(child) === -1) {
			child.remove();
		}
	}
};


/*--------------------------------------------------------------
# ELEMENT INDEX
--------------------------------------------------------------*/

satus.elementIndex = function (element) {
	return Array.prototype.slice.call(element.parentNode.children).indexOf(element);
};


/*--------------------------------------------------------------
# EVENTS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# ON
--------------------------------------------------------------*/

satus.events.on = function (type, handler) {
	if (!this.data[type]) {
		this.data[type] = [];
	}

	this.data[type].push(handler);
};


/*--------------------------------------------------------------
# TRIGGER
--------------------------------------------------------------*/

satus.events.trigger = function (type, data) {
	var handlers = this.data[type];

	if (handlers) {
		for (var i = 0, l = handlers.length; i < l; i++) {
			handlers[i](data);
		}
	}
};


/*--------------------------------------------------------------
# FETCH
--------------------------------------------------------------*/

satus.fetch = function (url, success, error, type) {
	fetch(url).then(function (response) {
		if (response.ok) {
			response[type || 'json']().then(success);
		} else {
			error();
		}
	}).catch(function () {
		error(success);
	});
};


/*--------------------------------------------------------------
# GET PROPERTY
--------------------------------------------------------------*/

satus.getProperty = function (object, string) {
	var properties = string.split('.');

	for (var i = 0, l = properties.length; i < l; i++) {
		var property = properties[i];

		console.log(object);

		if (object = object[property]) {
			if (i === l - 1) {
				return object;
			}
		} else {
			return false;
		}
	}
};


/*--------------------------------------------------------------
# INDEX OF
--------------------------------------------------------------*/

satus.indexOf = function (child, parent) {
	var index = 0;

	if (satus.isArray(parent)) {
		index = parent.indexOf(child);
	} else {
		while ((child = child.previousElementSibling)) {
			index++;
		}
	}

	return index;
};


/*--------------------------------------------------------------
# TO INDEX
--------------------------------------------------------------*/

satus.toIndex = function (index, child, parent) {
	if (satus.isArray(parent)) {
		parent.splice(index, 0, parent.splice(satus.indexOf(child, parent), 1)[0])
	}
};


/*--------------------------------------------------------------
# ISSET
--------------------------------------------------------------*/

satus.isset = function (target, is_object) {
	if (is_object === true) {
		var keys = target.split('.').filter(function (value) {
			return value != '';
		});

		for (var i = 0, l = keys.length; i < l; i++) {
			if (satus.isset(target[keys[i]])) {
				target = target[keys[i]];
			} else {
				return undefined;
			}
		}

		return target;
	} else {
		if (target === null || target === undefined) {
			return false;
		}
	}

	return true;
};


/*--------------------------------------------------------------
# IS
--------------------------------------------------------------*/

satus.isArray = function (target) {
	if (Array.isArray(target)) {
		return true;
	} else {
		return false;
	}
};

satus.isBoolean = function (target) {
	return target === false || target === true;
};

satus.isElement = function (target) {
	return target instanceof Element || target instanceof HTMLDocument;
};

satus.isFunction = function (target) {
	return typeof target === 'function';
};

satus.isNodeList = function (target) {
	return target instanceof NodeList;
};

satus.isNumber = function (target) {
	if (typeof target === 'number' && isNaN(target) === false) {
		return true;
	} else {
		return false;
	}
};

satus.isObject = function (target) {
	return target instanceof Object && target !== null;
};

satus.isString = function (target) {
	if (typeof target === 'string') {
		return true;
	} else {
		return false;
	}
};


/*--------------------------------------------------------------
# ON
--------------------------------------------------------------*/

satus.on = function (element, listeners) {
	if (listeners) {
		for (var type in listeners) {
			var listener = listeners[type];

			if (type === 'selectionchange') {
				element = document;
			}

			if (satus.isFunction(listener)) {
				element.addEventListener(type, listener);
			} else if (satus.isArray(listener) || satus.isObject(listener)) {
				element.addEventListener(type, function (event) {
					var target = this.skeleton.on[event.type],
						layers = this.layersProvider;

					target.parentSkeleton = this.skeleton;
					target.parentElement = this;

					if (!layers && this.baseProvider.layers.length > 0) {
						layers = this.baseProvider.layers[0];
					}

					if (target.prepend === true) {
						satus.prepend(target, this.parentNode);
					} else if (layers && target.component !== 'modal') {
						layers.open(target);
					} else {
						satus.render(target, this.baseProvider);
					}
				});
			} else if (satus.isString(listener)) {
				element.addEventListener(type, function () {
					var match = this.skeleton.on[event.type].match(/(["'`].+["'`]|[^.()]+)/g),
						target = this.baseProvider;

					for (var i = 0, l = match.length; i < l; i++) {
						var key = match[i];

						if (target.skeleton[key]) {
							target = target.skeleton[key];
						} else {
							if (typeof target[key] === 'function') {
								target[key]();
							} else {
								target = target[key];
							}
						}

						if (target.rendered) {
							target = target.rendered;
						}
					}
				});
			}
		}
	}
};


/*--------------------------------------------------------------
# PARENTIFY
--------------------------------------------------------------*/

satus.parentify = function (parentObject, exclude) {
	for (var key in parentObject) {
		if (exclude.indexOf(key) === -1) {
			var child = parentObject[key];

			if (satus.isset(child)) {
				child.parentObject = parentObject;

				if (
					satus.isObject(child) &&
					!satus.isArray(child) &&
					!satus.isElement(child) &&
					!satus.isFunction(child)
				) {
					this.parentify(child, exclude);
				}
			}
		}
	}
};


/*--------------------------------------------------------------
# PREPEND
--------------------------------------------------------------*/

satus.prepend = function (child, parent) {
	if (this.isElement(child)) {
		parent.prepend(child);
	} else if (this.isObject(child)) {
		this.render(child, parent, undefined, undefined, true);
	}
};


/*--------------------------------------------------------------
# PROPERTIES
--------------------------------------------------------------*/

satus.properties = function (element, properties) {
	if (properties) {
		for (var key in properties) {
			var property = properties[key];

			if (['placeholder', 'title'].indexOf(key) !== -1) {
				property = satus.locale.get(property);
			}

			element[key] = property;
		}
	}
};


/*--------------------------------------------------------------
# REMOVE
--------------------------------------------------------------*/

satus.remove = function (child, parent) {
	if (satus.isArray(parent)) {
		parent.splice(satus.indexOf(child, parent), 1);
	}
};


/*--------------------------------------------------------------
# RENDER
--------------------------------------------------------------*/

satus.render = function (skeleton, container, property, childrenOnly, prepend, skip_children) {
	var element;

	if (skeleton.component && childrenOnly !== true) {
		var tagName = skeleton.component,
			camelizedTagName = this.camelize(tagName),
			namespaceURI = skeleton.namespaceURI;

		if (!namespaceURI) {
			if (tagName === 'svg') {
				namespaceURI = 'http://www.w3.org/2000/svg';
			} else if (skeleton.parentSkeleton && skeleton.parentSkeleton.namespaceURI) {
				namespaceURI = skeleton.parentSkeleton.namespaceURI;
			}

			skeleton.namespaceURI = namespaceURI;
		}

		element = this.createElement(tagName, tagName, namespaceURI);

		skeleton.rendered = element;
		element.skeleton = skeleton;
		element.childrenContainer = element;
		element.componentName = tagName;

		if (skeleton.variant) {
			var variant = skeleton.variant;

			if (this.isFunction(variant)) {
				variant = variant();
			}

			if (satus.isArray(variant)) {
				for (var i = 0, l = variant.length; i < l; i++) {
					element.className += ' satus-' + tagName + '--' + variant[i];
				}
			} else {
				element.className += ' satus-' + tagName + '--' + variant;
			}
		}

		if (skeleton.id) {
			element.id = skeleton.id;
		}

		if (container) {
			if (container.baseProvider) {
				element.baseProvider = container.baseProvider;
			}

			if (container.layersProvider) {
				element.layersProvider = container.layersProvider;
			}
		}

		this.attr(element, skeleton.attr);
		this.style(element, skeleton.style);
		this.data(element, skeleton.data);
		this.class(element, skeleton.class);
		this.properties(element, skeleton.properties);
		this.on(element, skeleton.on);

		element.storage = (function () {
			var parent = element,
				key = skeleton.storage || property || false,
				value;

			if (satus.isFunction(key)) {
				key = key();
			}

			if (skeleton.storage !== false) {
				if (key) {
					value = satus.storage.get(key);
				}

				if (skeleton.hasOwnProperty('value') && value === undefined) {
					value = skeleton.value;
				}
			}

			return Object.defineProperties({}, {
				key: {
					get: function () {
						return key;
					},
					set: function (string) {
						key = string;
					}
				},
				value: {
					get: function () {
						return value;
					},
					set: function (val) {
						value = val;

						if (skeleton.storage !== false) {
							satus.storage.set(key, val);
						}

						parent.dispatchEvent(new CustomEvent('change'));
					}
				}
			});
		}());

		if (this.components[camelizedTagName]) {
			this.components[camelizedTagName](element, skeleton);
		}

		this.text(element.childrenContainer, skeleton.text);
		this.prepend(skeleton.before, element.childrenContainer);

		if (prepend) {
			this.prepend(element, container);
		} else {
			this.append(element, container);
		}

		if (skeleton.hasOwnProperty('parentSkeleton') === false && container) {
			skeleton.parentSkeleton = container.skeleton;
		}

		satus.events.trigger('render', element);

		element.dispatchEvent(new CustomEvent('render'));

		container = element.childrenContainer || element;
	}

	if ((!element || element.renderChildren !== false) & skip_children !== true) {
		for (var key in skeleton) {
			var item = skeleton[key];

			if (key !== 'parentSkeleton' && key !== 'parentElement' && key !== 'parentObject' && key !== 'before') {
				if (item && item.component) {
					item.parentSkeleton = skeleton;

					if (element) {
						item.parentElement = element;
					}

					this.render(item, container, key, undefined, prepend);
				}
			}
		}
	}

	return element;
};


/*--------------------------------------------------------------
# SORT
--------------------------------------------------------------*/

satus.sort = function (array, order, property) {
	var type;

	if (property) {
		type = typeof array[0][property];
	} else {
		type = typeof array[0];
	}

	if (order !== 'desc') {
		if (type === 'number') {
			if (property) {
				return array.sort(function (a, b) {
					return a[property] - b[property];
				});
			} else {
				return array.sort(function (a, b) {
					return a - b;
				});
			}
		} else if (type === 'string') {
			if (property) {
				return array.sort(function (a, b) {
					return a[property].localeCompare(b[property]);
				});
			} else {
				return array.sort(function (a, b) {
					return a.localeCompare(b);
				});
			}
		}
	} else {
		if (type === 'number') {
			if (property) {
				return array.sort(function (a, b) {
					return b[property] - a[property];
				});
			} else {
				return array.sort(function (a, b) {
					return b - a;
				});
			}
		} else if (type === 'string') {
			if (property) {
				return array.sort(function (a, b) {
					return b[property].localeCompare(a[property]);
				});
			} else {
				return array.sort(function (a, b) {
					return b.localeCompare(a);
				});
			}
		}
	}
};


/*--------------------------------------------------------------
# STORAGE
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# CLEAR
--------------------------------------------------------------*/

satus.storage.clear = function (callback) {
	this.data = {};

	chrome.storage.local.clear(function () {
		satus.events.trigger('storage-clear');

		if (callback) {
			callback();
		}
	});
};


/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

satus.storage.get = function (key, callback) {
	var target = this.data;

	if (typeof key !== 'string') {
		return;
	}

	key = key.split('/').filter(function (value) {
		return value != '';
	});

	for (var i = 0, l = key.length; i < l; i++) {
		if (satus.isset(target[key[i]])) {
			target = target[key[i]];
		} else {
			return undefined;
		}
	}

	if (typeof target === 'function') {
		return target();
	} else {
		return target;
	}
};


/*--------------------------------------------------------------
# IMPORT
--------------------------------------------------------------*/

satus.storage.import = function (keys, callback) {
	var self = this;

	if (typeof keys === 'function') {
		callback = keys;

		keys = undefined;
	}

	chrome.storage.local.get(keys, function (items) {
		for (var key in items) {
			self.data[key] = items[key];
		}

		satus.log('STORAGE: data was successfully imported');

		satus.events.trigger('storage-import');

		if (callback) {
			callback(items);
		}
	});
};


/*--------------------------------------------------------------
# REMOVE
--------------------------------------------------------------*/

satus.storage.remove = function (key, callback) {
	var target = this.data;

	if (typeof key !== 'string') {
		return;
	}

	key = key.split('/').filter(function (value) {
		return value != '';
	});

	for (var i = 0, l = key.length; i < l; i++) {
		if (satus.isset(target[key[i]])) {
			if (i === l - 1) {
				delete target[key[i]];
			} else {
				target = target[key[i]];
			}
		} else {
			return undefined;
		}
	}

	if (key.length === 1) {
		chrome.storage.local.remove(key[0]);
	} else {
		chrome.storage.local.set(this.data, function () {
			satus.events.trigger('storage-remove');

			if (callback) {
				callback();
			}
		});
	}
};


/*--------------------------------------------------------------
# SET
--------------------------------------------------------------*/

satus.storage.set = function (key, value, callback) {
	var items = {},
		target = this.data;

	if (typeof key !== 'string') {
		return;
	}

	key = key.split('/').filter(function (value) {
		return value != '';
	});

	for (var i = 0, l = key.length; i < l; i++) {
		var item = key[i];

		if (i < l - 1) {

			if (target[item]) {
				target = target[item];
			} else {
				target[item] = {};

				target = target[item];
			}
		} else {
			target[item] = value;
		}
	}

	for (var key in this.data) {
		if (typeof this.data[key] !== 'function') {
			items[key] = this.data[key];
		}
	}

	chrome.storage.local.set(items, function () {
		satus.events.trigger('storage-set');

		if (callback) {
			callback();
		}
	});
};


/*--------------------------------------------------------------
# ON CHANGED
--------------------------------------------------------------*/

satus.storage.onchanged = function (callback) {
	chrome.storage.onChanged.addListener(function (changes) {
		for (var key in changes) {
			callback(key, changes[key].newValue);
		}
	});
};


/*--------------------------------------------------------------
# LAST
--------------------------------------------------------------*/

satus.last = function (variable) {
	if (this.isArray(variable) || this.isNodeList(variable) || variable instanceof HTMLCollection) {
		return variable[variable.length - 1];
	}
};


/*--------------------------------------------------------------
# LOCALIZATION
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

satus.locale.get = function (string) {
	return this.data[string] || string;
};


/*--------------------------------------------------------------
# IMPORT
----------------------------------------------------------------
satus.locale.import(url, onload, onsuccess);
--------------------------------------------------------------*/

satus.locale.import = function (code, callback, path) {
	var language = code || window.navigator.language;

	if (language.indexOf('en') === 0) {
		language = 'en';
	}

	language = language.replace('-', '_');

	if (!path) {
		path = '_locales/';
	}

	satus.fetch(chrome.runtime.getURL(path + language + '/messages.json'), function (response) {
		for (var key in response) {
			satus.locale.data[key] = response[key].message;
		}

		//satus.log('LOCALE: data was successfully imported');

		if (callback) {
			callback();
		}
	}, function (success) {
		satus.fetch(chrome.runtime.getURL(path + 'en/messages.json'), success, function () {
			success();
		});
	});
};


/*--------------------------------------------------------------
# LOG
--------------------------------------------------------------*/

satus.log = function () {
	console.log.apply(null, arguments);
};


/*--------------------------------------------------------------
# STYLE
--------------------------------------------------------------*/

satus.style = function (element, object) {
	if (object) {
		for (var key in object) {
			element.style[key] = object[key];
		}
	}
};


/*--------------------------------------------------------------
# TEXT
--------------------------------------------------------------*/

satus.text = function (element, value) {
	if (value) {
		if (satus.isFunction(value)) {
			value = value();
		}

		element.appendChild(document.createTextNode(this.locale.get(value)));
	}
};
/*--------------------------------------------------------------
>>> MODAL
----------------------------------------------------------------
# Confirm
--------------------------------------------------------------*/

satus.components.modal = function (component, skeleton) {
	component.scrim = component.createChildElement('div', 'scrim');
	component.surface = component.createChildElement('div', 'surface');

	component.close = function () {
		var component = this;

		this.classList.add('satus-modal--closing');

		setTimeout(function () {
			component.remove();

			component.dispatchEvent(new CustomEvent('close'));
		}, Number(satus.css(this.surface, 'animation-duration').replace(/[^0-9.]/g, '')) * 1000);
	};

	component.scrim.addEventListener('click', function () {
		this.parentNode.close();
	});

	if (satus.isset(skeleton.content)) {
		component.surface.content = component.surface.createChildElement('p', 'content');

		if (satus.isObject(skeleton.content)) {
			satus.render(skeleton.content, component.surface.content);
		} else {
			component.surface.content.textContent = satus.locale.get(skeleton.content);
		}
	} else {
		component.childrenContainer = component.surface;
	}

	if (satus.components.modal[skeleton.variant]) {
		satus.components.modal[skeleton.variant](component, skeleton);
	}
};


/*--------------------------------------------------------------
# CONFIRM
--------------------------------------------------------------*/

satus.components.modal.confirm = function (component, skeleton) {
	component.surface.actions = satus.render({
		component: 'section',
		variant: 'align-end'
	}, component.surface);

	if (skeleton.buttons) {
		for (var key in skeleton.buttons) {
			var button = skeleton.buttons[key];

			if (satus.isObject(button) && button.component === 'button') {
				satus.render(button, component.surface.actions).modalProvider = component;
			}
		}
	} else {
		satus.render({
			cancel: {
				component: 'button',
				text: 'cancel',
				properties: {
					modalProvider: component,
				},
				on: {
					click: function () {
						this.modalProvider.dispatchEvent(new CustomEvent('cancel'));
						this.modalProvider.close();
					}
				}
			},
			ok: {
				component: 'button',
				text: 'ok',
				properties: {
					modalProvider: component,
				},
				on: {
					click: function () {
						this.modalProvider.dispatchEvent(new CustomEvent('confirm'));
						this.modalProvider.close();
					}
				}
			}
		}, component.surface.actions);
	}
};
/*--------------------------------------------------------------
>>> GRID
--------------------------------------------------------------*/

satus.components.grid = function (component, skeleton) {
	console.log(component, skeleton);
};
/*--------------------------------------------------------------
>>> TEXT FIELD
--------------------------------------------------------------*/

satus.components.textField = function (component, skeleton) {
	var container = component.createChildElement('div', 'container'),
		input = container.createChildElement(skeleton.rows === 1 ? 'input' : 'textarea'),
		display = container.createChildElement('div', 'display'),
		line_numbers = display.createChildElement('div', 'line-numbers'),
		pre = display.createChildElement('pre'),
		selection = display.createChildElement('div', 'selection'),
		cursor = display.createChildElement('div', 'cursor'),
		hiddenValue = container.createChildElement('pre', 'hidden-value');

	if (skeleton.rows === 1) {
		component.setAttribute('multiline', 'false');

		component.multiline = false;
	}

	component.placeholder = skeleton.placeholder;
	component.input = input;
	component.display = display;
	component.lineNumbers = line_numbers;
	component.pre = pre;
	component.hiddenValue = hiddenValue;
	component.selection = selection;
	component.cursor = cursor;
	component.syntax = {
		current: 'text',
		handlers: {
			regex: function (value, target) {
				var regex_token = /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g,
					char_class_token = /[^\\-]+|-|\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)/g,
					char_class_parts = /^(\[\^?)(]?(?:[^\\\]]+|\\[\S\s]?)*)(]?)$/,
					quantifier = /^(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??$/,
					matches = value.match(regex_token);

				function create(type, string) {
					var span = document.createElement('span');

					span.className = type;
					span.textContent = string;

					target.appendChild(span);
				}

				if (matches) {
					for (var i = 0, l = matches.length; i < l; i++) {
						var match = matches[i];

						if (match[0] === '[') {
							create('character-class', match);
						} else if (match[0] === '(') {
							create('group', match);
						} else if (match[0] === ')') {
							create('group', match);
						} else if (match[0] === '\\' || match === '^') {
							create('anchor', match);
						} else if (quantifier.test(match)) {
							create('quantifier', match);
						} else if (match === '|' || match === '.') {
							create('metasequence', match);
						} else {
							create('text', match);
						}
					}
				}
			}
		},
		set: function (syntax) {
			if (this.handlers[syntax]) {
				this.current = syntax;
			} else {
				this.current = 'text';
			}

			pre.update();
		}
	};
	component.focus = function () {
		this.input.focus();
	};

	if (skeleton.lineNumbers === false) {
		component.setAttribute('line-numbers', 'false');

		component.lineNumbers.setAttribute('hidden', '');
	}

	if (satus.isset(skeleton.cols)) {
		input.cols = skeleton.cols;
	}

	if (satus.isset(skeleton.rows)) {
		input.rows = skeleton.rows;
	}

	Object.defineProperty(component, 'value', {
		get: function () {
			return this.input.value;
		},
		set: function (value) {
			this.input.value = value;
		}
	});

	if (skeleton.syntax) {
		component.syntax.set(skeleton.syntax);
	}

	selection.setAttribute('disabled', '');

	line_numbers.update = function () {
		var component = this.parentNode.parentNode.parentNode,
			count = component.input.value.split('\n').length;

		if (count !== this.children.length) {
			satus.empty(this);

			for (var i = 1; i <= count; i++) {
				var span = document.createElement('span');

				span.textContent = i;

				this.appendChild(span);
			}
		}

		component.input.style.paddingLeft = this.offsetWidth + 'px';
	};

	pre.update = function () {
		var component = this.parentNode.parentNode.parentNode,
			handler = component.syntax.handlers[component.syntax.current],
			value = component.value || '';

		for (var i = this.childNodes.length - 1; i > -1; i--) {
			this.childNodes[i].remove();
		}

		if (handler) {
			handler(value, this);
		} else {
			this.textContent = value;
		}

		if (value.length === 0) {
			var placeholder = component.placeholder;

			if (typeof placeholder === 'function') {
				placeholder = component.placeholder();
			} else {
				placeholder = satus.locale.get(placeholder);
			}

			this.textContent = placeholder;
		}
	};

	cursor.update = function () {
		var component = this.parentNode.parentNode.parentNode,
			input = component.input,
			value = input.value,
			rows_count = value.split('\n').length,
			start = input.selectionStart,
			end = input.selectionEnd,
			rows = value.slice(0, start).split('\n'),
			top = 0;

		this.style.animation = 'none';

		if (input.selectionDirection === 'forward') {
			component.hiddenValue.textContent = value.substring(0, end);
		} else {
			component.hiddenValue.textContent = value.substring(0, start);
		}

		top = component.hiddenValue.offsetHeight;

		component.hiddenValue.textContent = satus.last(rows);

		top -= component.hiddenValue.offsetHeight;

		if (component.multiline !== false) {
			this.style.top = top + 'px';
		}

		this.style.left = component.hiddenValue.offsetWidth + component.lineNumbers.offsetWidth + 'px';

		if (start === end) {
			component.selection.setAttribute('disabled', '');
		} else {
			component.selection.removeAttribute('disabled');

			/*component.hiddenValue.textContent = value.substring(0, start);

			component.selection.style.left = component.hiddenValue.offsetWidth - input.scrollLeft + 'px';

			component.hiddenValue.textContent = value.substring(start, end);

			component.selection.style.width = component.hiddenValue.offsetWidth + 'px';*/
		}

		this.style.animation = '';

		component.hiddenValue.textContent = '';
	};

	document.addEventListener('selectionchange', function (event) {
		component.lineNumbers.update();
		component.pre.update();
		component.cursor.update();
	});

	input.addEventListener('input', function () {
		var component = this.parentNode.parentNode;

		component.storage.value = this.value;

		component.lineNumbers.update();
		component.pre.update();
		component.cursor.update();
	});

	input.addEventListener('scroll', function (event) {
		var component = this.parentNode.parentNode;

		component.display.style.top = -this.scrollTop + 'px';
		component.display.style.left = -this.scrollLeft + 'px';

		component.lineNumbers.update();
		component.pre.update();
		component.cursor.update();
	});

	component.addEventListener('change', function () {
		this.lineNumbers.update();
		this.pre.update();
		this.cursor.update();
	});

	component.value = component.storage.value || '';

	component.addEventListener('render', function () {
		component.lineNumbers.update();
		component.pre.update();
		component.cursor.update();
	});

	if (skeleton.on) {
		for (var type in skeleton.on) {
			input.addEventListener(type, function (event) {
				this.parentNode.parentNode.dispatchEvent(new Event(event.type));
			});
		}
	}
};
/*--------------------------------------------------------------
>>> CHART
----------------------------------------------------------------
# Core
	# Bar
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# CORE
--------------------------------------------------------------*/

satus.components.chart = function (component, skeleton) {
	var type = skeleton.type;

	if (this.chart[type]) {
		component.classList.add('satus-chart--' + type);

		this.chart[type](component, skeleton);
	}
};


/*--------------------------------------------------------------
# BAR
--------------------------------------------------------------*/

satus.components.chart.bar = function (component, skeleton) {
	var labels = skeleton.labels,
		datasets = skeleton.datasets,
		bars = [];

	if (satus.isFunction(labels)) {
		labels = labels();
	}

	if (satus.isFunction(datasets)) {
		datasets = datasets();
	}

	if (satus.isArray(labels)) {
		var container = component.createChildElement('div', 'labels');

		for (var i = 0, l = labels.length; i < l; i++) {
			var label = labels[i],
				section = container.createChildElement('div', 'section');

			section.textContent = label;
		}
	}

	if (satus.isArray(datasets)) {
		var container = component.createChildElement('div', 'bars');

		for (var i = 0, l = datasets.length; i < l; i++) {
			var dataset = datasets[i];

			for (var j = 0, k = dataset.data.length; j < k; j++) {
				if (!satus.isElement(bars[j])) {
					bars.push(container.createChildElement('div', 'bar'));
				}

				var piece = bars[j].createChildElement('div', 'piece');

				piece.title = dataset.label;
				piece.style.height = dataset.data[j] + '%';
				piece.style.backgroundColor = 'rgb(' + dataset.color.join(',') + ')';
			}
		}
	}
};
/*--------------------------------------------------------------
>>> SELECT
--------------------------------------------------------------*/

satus.components.select = function (component, skeleton) {
	var content = component.createChildElement('div', 'content');
	
	component.childrenContainer = content;
	component.valueElement = document.createElement('span');
	component.selectElement = document.createElement('select');

	component.valueElement.className = 'satus-select__value';

	component.appendChild(component.valueElement);
	component.appendChild(component.selectElement);

	component.options = skeleton.options || [];

	if (satus.isFunction(component.options)) {
		component.options = component.options();

		if (!satus.isset(component.options)) {
			component.options = [];
		}
	}

	for (var i = 0, l = component.options.length; i < l; i++) {
		var option = document.createElement('option');

		option.value = component.options[i].value;

		satus.text(option, component.options[i].text);

		component.selectElement.appendChild(option);
	}

	Object.defineProperty(component, 'value', {
		get() {
			return this.selectElement.value;
		},
		set(value) {
			this.selectElement.value = value;
		}
	});

	component.render = function () {
		satus.empty(this.valueElement);

		if (this.selectElement.options[this.selectElement.selectedIndex]) {
			satus.text(this.valueElement, this.selectElement.options[this.selectElement.selectedIndex].text);
		}

		this.dataset.value = this.value;
	};

	component.selectElement.addEventListener('change', function () {
		var component = this.parentNode;

		component.storage.value = this.value;

		component.render();
	});

	component.value = component.storage.value || component.options[0].value;
	
	component.render();
};
/*--------------------------------------------------------------
>>> DIVIDER
--------------------------------------------------------------*/

satus.components.divider = function () {};
/*--------------------------------------------------------------
>>> SECTION
--------------------------------------------------------------*/

satus.components.section = function (component, skeleton) {
	if (satus.isString(skeleton.title)) {
		component.dataset.title = satus.locale.get(skeleton.title);
	}
};
/*--------------------------------------------------------------
>>> BASE
--------------------------------------------------------------*/

satus.components.base = function (component) {
	component.baseProvider = component;
	component.layers = [];
};
/*--------------------------------------------------------------
>>> ALERT
--------------------------------------------------------------*/

satus.components.alert = function (component, skeleton) {};
/*--------------------------------------------------------------
>>> TIME
--------------------------------------------------------------*/

satus.components.time = function (component, skeleton) {
	var select_skeleton = Object.assign({}, skeleton);

	select_skeleton.component = 'select';
	select_skeleton.options = [];

	if (satus.isFunction(select_skeleton.hour12)) {
		select_skeleton.hour12 = select_skeleton.hour12();
	}

	for (var i = 0, l = 24; i < l; i++) {
		var hour = i,
			value = i;

		if (select_skeleton.hour12 === true && i > 12) {
			hour -= 12;
		}

		if (hour < 10) {
			hour = '0' + hour;
			value = '0' + value;
		}

		if (select_skeleton.hour12 === true) {
			if (i > 12) {
				hour += ':00 pm';
			} else {
				hour += ':00 am';
			}
		} else {
			hour += ':00'
		}

		select_skeleton.options.push({
			text: hour,
			value: value + ':00'
		});
	}

	satus.components.select(component, select_skeleton);

	component.classList.add('satus-select');
};
/*--------------------------------------------------------------
>>> SIDEBAR
--------------------------------------------------------------*/

satus.components.sidebar = function (component, skeleton) {};
/*--------------------------------------------------------------
>>> LAYERS
--------------------------------------------------------------*/

satus.components.layers = function (component, skeleton) {
	component.path = [];
	component.renderChildren = false;
	component.baseProvider.layers.push(component);
	component.layersProvider = component;

	component.back = function () {
		if (this.path.length > 1) {
			this.path.pop();

			this.open(this.path[this.path.length - 1], false);
		}
	};

	component.open = function (skeleton, history) {
		var previous_layer = satus.last(this.querySelectorAll('.satus-layers__layer')),
			layer = this.createChildElement('div', 'layer');

		if (history !== false) {
			if (previous_layer) {
				previous_layer.style.animation = 'fadeOutLeft 100ms linear forwards';
				layer.style.animation = 'fadeInRight 100ms linear forwards';
			}

			this.path.push(skeleton);
		} else {
			previous_layer.style.animation = 'fadeOutRight 100ms linear forwards';
			layer.style.animation = 'fadeInLeft 100ms linear forwards';
		}

		if (previous_layer) {
			setTimeout(function () {
				previous_layer.remove();
			}, satus.getAnimationDuration(previous_layer));
		}

		layer.skeleton = skeleton;
		layer.baseProvider = this.baseProvider;

		satus.render(skeleton, layer, undefined, skeleton.component === 'layers');

		this.dispatchEvent(new Event('open'));
	};

	component.update = function () {
		var layer = this.querySelector('.satus-layers__layer');

		satus.empty(layer);
		satus.render(layer.skeleton, layer);
	};

	component.open(skeleton);
};
/*--------------------------------------------------------------
>>> LIST
--------------------------------------------------------------*/

satus.components.list = function (component, skeleton) {
	for (var i = 0, l = skeleton.items.length; i < l; i++) {
		var li = component.createChildElement('div', 'item'),
			item = skeleton.items[i];

		for (var j = 0, k = item.length; j < k; j++) {
			var child = item[j];

			if (satus.isObject(child)) {
				satus.render(child, li);
			} else {
				var span = li.createChildElement('span');

				span.textContent = satus.locale.get(child);
			}
		}
	}
};
/*--------------------------------------------------------------
>>> COLOR PICKER
--------------------------------------------------------------*/

satus.components.colorPicker = function (component, skeleton) {
    var component_content = component.createChildElement('div', 'content'),
        component_value = component.createChildElement('span', 'value');

    component.childrenContainer = component_content;
    component.valueElement = component_value;

    component.className = 'satus-button';

    component.addEventListener('click', function () {
        var rgb = this.rgb,
            hsl = satus.color.rgbToHsl(rgb),
            s = hsl[1] / 100,
            l = hsl[2] / 100;

        s *= l < .5 ? l : 1 - l;

        var v = l + s;

        s = 2 * s / (l + s);

        satus.render({
            component: 'modal',
            variant: 'color-picker',
            value: hsl,
            parentElement: this,

            palette: {
                component: 'div',
                class: 'satus-color-picker__palette',
                style: {
                    'backgroundColor': 'hsl(' + hsl[0] + 'deg, 100%, 50%)'
                },
                on: {
                    mousedown: function () {
                        var palette = this,
                            rect = this.getBoundingClientRect(),
                            cursor = this.children[0];

                        function mousemove(event) {
                            var hsl = palette.skeleton.parentSkeleton.storage.value,
                                x = event.clientX - rect.left,
                                y = event.clientY - rect.top,
                                s;

                            x = Math.min(Math.max(x, 0), rect.width) / (rect.width / 100);
                            y = Math.min(Math.max(y, 0), rect.height) / (rect.height / 100);

                            var v = 100 - y,
                                l = (2 - x / 100) * v / 2;

                            hsl[1] = x * v / (l < 50 ? l * 2 : 200 - l * 2);
                            hsl[2] = l;

                            cursor.style.left = x + '%';
                            cursor.style.top = y + '%';

                            palette.nextSibling.children[0].style.backgroundColor = 'hsl(' + hsl[0] + 'deg,' + hsl[1] + '%, ' + hsl[2] + '%)';

                            event.preventDefault();
                        }

                        function mouseup() {
                            window.removeEventListener('mousemove', mousemove);
                            window.removeEventListener('mouseup', mouseup);
                        }

                        window.addEventListener('mousemove', mousemove);
                        window.addEventListener('mouseup', mouseup);
                    }
                },

                cursor: {
                    component: 'div',
                    class: 'satus-color-picker__cursor',
                    style: {
                        'left': s * 100 + '%',
                        'top': 100 - v * 100 + '%'
                    }
                }
            },
            section: {
                component: 'section',
                variant: 'color',

                color: {
                    component: 'div',
                    class: 'satus-color-picker__color',
                    style: {
                        'backgroundColor': 'rgb(' + this.rgb.join(',') + ')'
                    }
                },
                hue: {
                    component: 'slider',
                    class: 'satus-color-picker__hue',
                    storage: false,
                    value: hsl[0],
                    max: 360,
                    on: {
                        change: function () {
                            var modal = this.skeleton.parentSkeleton.parentSkeleton,
                                hsl = modal.storage.value;

                            hsl[0] = this.values[0];

                            this.previousSibling.style.backgroundColor = 'hsl(' + hsl[0] + 'deg,' + hsl[1] + '%, ' + hsl[2] + '%)';
                            this.parentSkeletonNode.previousSibling.style.backgroundColor = 'hsl(' + hsl[0] + 'deg, 100%, 50%)';
                        }
                    }
                }
            },
            actions: {
                component: 'section',
                variant: 'actions',

                reset: {
                    component: 'button',
                    text: 'reset',
                    on: {
                        click: function () {
                            var modal = this.skeleton.parentSkeleton.parentSkeleton,
                                component = modal.parentSkeleton;

                            component.rgb = component.skeleton.value;

                            component.storage.value = component.rgb;

                            component.valueElement.style.backgroundColor = 'rgb(' + component.rgb.join(',') + ')';

                            modal.rendered.close();
                        }
                    }
                },
                cancel: {
                    component: 'button',
                    text: 'cancel',
                    on: {
                        click: function () {
                            this.skeleton.parentSkeleton.parentSkeleton.rendered.close();
                        }
                    }
                },
                ok: {
                    component: 'button',
                    text: 'OK',
                    on: {
                        click: function () {
                            var modal = this.skeleton.parentSkeleton.parentSkeleton,
                                component = modal.parentSkeleton;

                            component.rgb = satus.color.hslToRgb(modal.storage.value);

                            component.storage.value = component.rgb;

                            component.valueElement.style.backgroundColor = 'rgb(' + component.rgb.join(',') + ')';

                            modal.rendered.close();
                        }
                    }
                }
            }
        }, this.baseProvider.layers[0]);
    });

    component.addEventListener('render', function () {
        component.rgb = this.storage.value || [0, 100, 50];

        component_value.style.backgroundColor = 'rgb(' + component.rgb.join(',') + ')';
    });
};

satus.components.colorPicker = function (component, skeleton) {
    component.childrenContainer = component.createChildElement('div', 'content');

    component.color = (function (element) {
        var array;

        Object.defineProperty(element, 'value', {
            get: function () {
                return array;
            },
            set: function (value) {
                array = value;

                this.parentNode.storage.value = array;

                element.style.backgroundColor = 'rgb(' + value.join(',') + ')';
            }
        });

        element.value = component.storage.value || component.skeleton.value || [0, 0, 0];

        return element;
    })(component.createChildElement('span', 'value'));

    component.addEventListener('click', function () {
        var hsl = satus.color.rgbToHsl(this.color.value),
            s = hsl[1] / 100,
            l = hsl[2] / 100;

        s *= l < .5 ? l : 1 - l;

        var v = l + s;

        s = 2 * s / (l + s);

        satus.render({
            component: 'modal',
            variant: 'color-picker',
            value: hsl,
            parentElement: this,

            palette: {
                component: 'div',
                class: 'satus-color-picker__palette',
                style: {
                    'backgroundColor': 'hsl(' + hsl[0] + 'deg, 100%, 50%)'
                },
                on: {
                    mousedown: function (event) {
                        if (event.button !== 0) {
                            return false;
                        }

                        var palette = this,
                            rect = this.getBoundingClientRect(),
                            cursor = this.children[0];

                        function mousemove(event) {
                            var hsl = palette.skeleton.parentSkeleton.value,
                                x = event.clientX - rect.left,
                                y = event.clientY - rect.top,
                                s;

                            x = Math.min(Math.max(x, 0), rect.width) / (rect.width / 100);
                            y = Math.min(Math.max(y, 0), rect.height) / (rect.height / 100);

                            var v = 100 - y,
                                l = (2 - x / 100) * v / 2;

                            hsl[1] = x * v / (l < 50 ? l * 2 : 200 - l * 2);
                            hsl[2] = l;

                            cursor.style.left = x + '%';
                            cursor.style.top = y + '%';

                            palette.nextSibling.children[0].style.backgroundColor = 'hsl(' + hsl[0] + 'deg,' + hsl[1] + '%, ' + hsl[2] + '%)';

                            event.preventDefault();
                        }

                        function mouseup() {
                            window.removeEventListener('mousemove', mousemove);
                            window.removeEventListener('mouseup', mouseup);
                        }

                        window.addEventListener('mousemove', mousemove);
                        window.addEventListener('mouseup', mouseup);
                    }
                },

                cursor: {
                    component: 'div',
                    class: 'satus-color-picker__cursor',
                    style: {
                        'left': s * 100 + '%',
                        'top': 100 - v * 100 + '%'
                    }
                }
            },
            section: {
                component: 'section',
                variant: 'color',

                color: {
                    component: 'div',
                    class: 'satus-color-picker__color',
                    style: {
                        'backgroundColor': 'rgb(' + this.color.value.join(',') + ')'
                    }
                },
                hue: {
                    component: 'slider',
                    class: 'satus-color-picker__hue',
                    storage: false,
                    value: hsl[0],
                    max: 360,
                    on: {
                        input: function () {
                            var modal = this.skeleton.parentSkeleton.parentSkeleton,
                                hsl = modal.value;

                            hsl[0] = this.storage.value;

                            this.previousSibling.style.backgroundColor = 'hsl(' + hsl[0] + 'deg,' + hsl[1] + '%, ' + hsl[2] + '%)';
                            this.parentNode.previousSibling.style.backgroundColor = 'hsl(' + hsl[0] + 'deg, 100%, 50%)';
                        }
                    }
                }
            },
            actions: {
                component: 'section',
                variant: 'actions',

                reset: {
                    component: 'button',
                    text: 'reset',
                    on: {
                        click: function () {
                            var modal = this.skeleton.parentSkeleton.parentSkeleton,
                                component = modal.parentElement;

                            component.color.value = component.skeleton.value || [0, 0, 0];

                            modal.rendered.close();
                        }
                    }
                },
                cancel: {
                    component: 'button',
                    text: 'cancel',
                    on: {
                        click: function () {
                            this.skeleton.parentSkeleton.parentSkeleton.rendered.close();
                        }
                    }
                },
                ok: {
                    component: 'button',
                    text: 'OK',
                    on: {
                        click: function () {
                            var modal = this.skeleton.parentSkeleton.parentSkeleton,
                                component = modal.parentElement;

                            component.color.value = satus.color.hslToRgb(modal.value);

                            modal.rendered.close();
                        }
                    }
                }
            }
        }, this.baseProvider.layers[0]);
    });
};
/*--------------------------------------------------------------
>>> RADIO
--------------------------------------------------------------*/

satus.components.radio = function (component, skeleton) {
	component.nativeControl = component.createChildElement('input', 'input');

	component.createChildElement('i');
	
	component.childrenContainer = component.createChildElement('div', 'content');
	
	component.nativeControl.type = 'radio';

	if (skeleton.group) {
		component.storage.key = skeleton.group;
		component.nativeControl.name = skeleton.group;
	}

	if (skeleton.value) {
		component.nativeControl.value = skeleton.value;
	}

	component.storage.value = satus.storage.get(component.storage.key);

	if (satus.isset(component.storage.value)) {
		component.nativeControl.checked = component.storage.value === skeleton.value;
	} else if (skeleton.checked) {
		component.nativeControl.checked = true;
	}

	component.nativeControl.addEventListener('change', function () {
		var component = this.parentNode;

		component.storage.value = this.value;
	});
};
/*--------------------------------------------------------------
>>> SLIDER
--------------------------------------------------------------*/

satus.components.slider = function (component, skeleton) {
	var content = component.createChildElement('div', 'content'),
		children_container = content.createChildElement('div', 'children-container'),
		text_input = content.createChildElement('input'),
		track_container = component.createChildElement('div', 'track-container'),
		input = track_container.createChildElement('input', 'input');

	component.childrenContainer = children_container;
	component.textInput = text_input;
	component.input = input;
	component.track = track_container.createChildElement('div', 'track');

	text_input.type = 'text';

	input.type = 'range';
	input.min = skeleton.min || 0;
	input.max = skeleton.max || 1;
	input.step = skeleton.step || 1;
	input.value = component.storage.value || skeleton.value || 0;

	text_input.addEventListener('blur', function () {
		var component = this.parentNode.parentNode;

		component.input.value = Number(this.value.replace(/[^0-9.]/g, ''));
		component.storage.value = Number(component.input.value);

		component.update();
	});

	text_input.addEventListener('keydown', function (event) {
		if (event.key === 'Enter') {
			var component = this.parentNode.parentNode;

			component.input.value = Number(this.value.replace(/[^0-9.]/g, ''));
			component.storage.value = Number(component.input.value);

			component.update();
		}
	});

	input.addEventListener('input', function () {
		var component = this.parentNode.parentNode;

		component.storage.value = Number(this.value);

		component.update();
	});

	component.update = function () {
		var input = this.input;

		this.textInput.value = input.value;

		this.track.style.width = 100 / (input.max - input.min) * (input.value - input.min) + '%';
	};

	component.update();

	if (skeleton.on) {
		for (var type in skeleton.on) {
			input.addEventListener(type, function (event) {
				this.parentNode.parentNode.dispatchEvent(new Event(event.type));
			});
		}
	}
};
/*--------------------------------------------------------------
>>> TABS
--------------------------------------------------------------*/

satus.components.tabs = function (component, skeleton) {
	var tabs = skeleton.items,
		value = skeleton.value;

	if (satus.isFunction(tabs)) {
		tabs = tabs();
	}

	if (satus.isFunction(value)) {
		value = value();
	}

	for (var i = 0, l = tabs.length; i < l; i++) {
		var tab = tabs[i],
			button = component.createChildElement('button');

		button.addEventListener('click', function () {
			var component = this.parentNode,
				index = satus.elementIndex(this);

			component.value = index;

			component.style.setProperty('--satus-tabs-current', index);
		});

		satus.text(button, tab);
	}

	component.style.setProperty('--satus-tabs-count', tabs.length);
	component.style.setProperty('--satus-tabs-current', value || 0);
};
/*--------------------------------------------------------------
>>> SHORTCUT
--------------------------------------------------------------*/

satus.components.shortcut = function (component, skeleton) {
	component.childrenContainer = component.createChildElement('div', 'content');
	component.valueElement = component.createChildElement('div', 'value');

	component.className = 'satus-button';

	component.render = function (parent) {
		var self = this,
			parent = parent || self.primary,
			children = parent.children;

		satus.empty(parent);

		function createElement(name) {
			var element = document.createElement('div');

			element.className = 'satus-shortcut__' + name;

			parent.appendChild(element);

			return element;
		}

		if (this.data.alt) {
			createElement('key').textContent = 'Alt';
		}

		if (this.data.ctrl) {
			if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
				createElement('plus');
			}

			createElement('key').textContent = 'Ctrl';
		}

		if (this.data.shift) {
			if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
				createElement('plus');
			}

			createElement('key').textContent = 'Shift';
		}

		for (var code in this.data.keys) {
			var key = this.data.keys[code].key,
				arrows = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'],
				index = arrows.indexOf(key);

			if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
				createElement('plus');
			}

			if (index !== -1) {
				createElement('key').textContent = ['↑', '→', '↓', '←'][index];
			} else if (key === ' ') {
				createElement('key').textContent = '␣';
			} else if (key) {
				createElement('key').textContent = key.toUpperCase();
			}
		}

		if (this.data.wheel) {
			if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
				createElement('plus');
			}

			var mouse = createElement('mouse'),
				div = document.createElement('div');

			mouse.appendChild(div);

			mouse.className += ' ' + (this.data.wheel > 0);
		}

		if (this.data.click) {
			if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
				createElement('plus');
			}

			var mouse = createElement('mouse'),
				div = document.createElement('div');

			mouse.appendChild(div);

			mouse.className += ' click';
		}

		if (this.data.middle) {
			if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
				createElement('plus');
			}

			var mouse = createElement('mouse'),
				div = document.createElement('div');

			mouse.appendChild(div);

			mouse.className += ' middle';
		}

		if (this.data.context) {
			if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
				createElement('plus');
			}

			var mouse = createElement('mouse'),
				div = document.createElement('div');

			mouse.appendChild(div);

			mouse.className += ' context';
		}
	};

	component.keydown = function (event) {
		event.preventDefault();
		event.stopPropagation();

		component.data = {
			alt: event.altKey,
			ctrl: event.ctrlKey,
			shift: event.shiftKey,
			keys: {}
		};

		if (['control', 'alt', 'altgraph', 'shift'].indexOf(event.key.toLowerCase()) === -1) {
			component.data.keys[event.keyCode] = {
				code: event.code,
				key: event.key
			};
		}

		component.data.wheel = 0;

		component.render();

		return false;
	};

	if (skeleton.wheel !== false) {
		component.mousewheel = function (event) {
			event.stopPropagation();

			if (
				(
					component.data.wheel === 0 &&
					(
						Object.keys(component.data.keys).length === 0 &&
						component.data.alt === false &&
						component.data.ctrl === false &&
						component.data.shift === false
					)
				) ||
				component.data.wheel < 0 && event.deltaY > 0 ||
				component.data.wheel > 0 && event.deltaY < 0) {
				component.data = {
					alt: false,
					ctrl: false,
					shift: false,
					keys: {}
				};
			}

			component.data.wheel = event.deltaY < 0 ? -1 : 1;

			component.render();

			return false;
		};
	}

	component.addEventListener('click', function () {
		satus.render({
			component: 'modal',
			properties: {
				parent: this
			},
			on: {
				close: function () {
					window.removeEventListener('keydown', component.keydown);
					window.removeEventListener('wheel', component.mousewheel);
				}
			},

			primary: {
				component: 'div',
				class: 'satus-shortcut__primary',
				on: {
					render: function () {
						component.primary = this;

						if (component.skeleton.mouseButtons === true) {
							this.addEventListener('mousedown', function (event) {
								if (
									component.data.click && event.button === 0 ||
									component.data.middle && event.button === 1
								) {
									component.data = {
										alt: false,
										ctrl: false,
										shift: false,
										keys: {}
									};
								}

								component.data.click = false;
								component.data.middle = false;
								component.data.context = false;

								if (event.button === 0) {
									component.data.click = true;

									component.render();
								} else if (event.button === 1) {
									component.data.middle = true;

									component.render();
								}
							});

							this.addEventListener('contextmenu', function (event) {
								event.preventDefault();
								event.stopPropagation();

								if (component.data.context) {
									component.data = {
										alt: false,
										ctrl: false,
										shift: false,
										keys: {}
									};
								}

								component.data.context = true;
								component.data.middle = false;
								component.data.click = false;

								component.render();

								return false;
							});
						}

						component.render();
					}
				}
			},
			actions: {
				component: 'section',
				variant: 'actions',

				reset: {
					component: 'button',
					text: 'reset',
					on: {
						click: function () {
							var component = this.parentNode.parentNode.parentNode.parent;

							component.data = component.skeleton.value || {};

							component.render(component.valueElement);

							satus.storage.remove(component.storage);

							this.parentNode.parentNode.parentNode.close();

							window.removeEventListener('keydown', component.keydown);
							window.removeEventListener('wheel', component.mousewheel);
						}
					}
				},
				cancel: {
					component: 'button',
					text: 'cancel',
					on: {
						click: function () {
							component.data = satus.storage.get(component.storage) || component.skeleton.value || {};

							component.render(component.valueElement);

							this.parentNode.parentNode.parentNode.close();

							window.removeEventListener('keydown', component.keydown);
							window.removeEventListener('wheel', component.mousewheel);
						}
					}
				},
				save: {
					component: 'button',
					text: 'save',
					on: {
						click: function () {
							component.storage.value = component.data;

							component.render(component.valueElement);

							this.parentNode.parentNode.parentNode.close();

							window.removeEventListener('keydown', component.keydown);
							window.removeEventListener('wheel', component.mousewheel);
						}
					}
				}
			}
		}, this.baseProvider);

		window.addEventListener('keydown', this.keydown);
		window.addEventListener('wheel', this.mousewheel);
	});

	component.data = component.storage.value || {
		alt: false,
		ctrl: false,
		shift: false,
		keys: {},
		wheel: 0
	};

	component.render(component.valueElement);
};
/*--------------------------------------------------------------
>>> CHECKBOX
--------------------------------------------------------------*/

satus.components.checkbox = function (component, skeleton) {
	component.input = component.createChildElement('input');
	component.input.type = 'checkbox';

	component.checkmark = component.createChildElement('div', 'checkmark');

	component.childrenContainer = component.createChildElement('div', 'content');

	component.dataset.value = component.storage.value || skeleton.value;
	component.input.checked = component.storage.value || skeleton.value;

	component.input.addEventListener('change', function () {
		var component = this.parentNode;

		if (this.checked === true) {
			component.storage.value = true;
			component.dataset.value = 'true';
		} else {
			component.storage.value = false;
			component.dataset.value = 'false';
		}
	});
};
/*--------------------------------------------------------------
>>> SWITCH
--------------------------------------------------------------*/

satus.components.switch = function (component, skeleton) {
	var value = satus.isset(component.storage.value) ? component.storage.value : skeleton.value;

	if (satus.isFunction(value)) {
		value = value();
	}

	component.childrenContainer = component.createChildElement('div', 'content');

	component.createChildElement('i');

	component.dataset.value = value;

	component.addEventListener('click', function () {
		if (this.dataset.value === 'true') {
			this.dataset.value = 'false';
			this.storage.value = false;
		} else {
			this.dataset.value = 'true';
			this.storage.value = true;
		}
	}, true);
};
/*--------------------------------------------------------------
>>> CONTEXT MENU
--------------------------------------------------------------*/

satus.events.on('render', function (component) {
	if (component.skeleton.contextMenu) {
		component.addEventListener('contextmenu', function (event) {
			var base = this.baseProvider,
				base_rect = base.getBoundingClientRect(),
				x = event.clientX - base_rect.left,
				y = event.clientY - base_rect.top,
				modal = satus.render({
					component: 'modal',
					variant: 'contextmenu',
					parentSkeleton: this.skeleton,
					baseProvider: base
				}, base);

			if (base_rect.width - x < 200) {
				x = base_rect.width - x;

				if (x + 200 > base_rect.width) {
					x = 0;
				}

				modal.childrenContainer.style.right = x + 'px';
			} else {
				modal.childrenContainer.style.left = x + 'px';
			}

			modal.childrenContainer.style.top = y + 'px';

			this.skeleton.contextMenu.parentSkeleton = this.skeleton;

			satus.render(this.skeleton.contextMenu, modal.childrenContainer);

			event.preventDefault();
			event.stopPropagation();

			return false;
		});
	}
});
/*--------------------------------------------------------------
>>> SORTABLE
--------------------------------------------------------------*/

satus.events.on('render', function (component) {
	if (component.skeleton.sortable === true) {
		component.addEventListener('mousedown', function (event) {
			if (event.button !== 0) {
				return false;
			}

			var component = this,
				rect = this.getBoundingClientRect(),
				x = event.clientX,
				y = event.clientY,
				offset_x = event.clientX - rect.left,
				offset_y = event.clientY - rect.top,
				ghost = satus.clone(this),
				children = this.parentNode.children,
				appended = false;

			ghost.classList.add('satus-sortable__ghost');

			function mousemove(event) {
				if (appended === false && (Math.abs(event.clientX - x) > 4 || Math.abs(event.clientY - y) > 4)) {
					appended = true;

					component.classList.add('satus-sortable__chosen');

					component.baseProvider.appendChild(ghost);
				}

				ghost.style.transform = 'translate(' + (event.clientX - offset_x) + 'px, ' + (event.clientY - offset_y) + 'px)';
			}

			function mouseup(event) {
				component.classList.remove('satus-sortable__chosen');
				ghost.remove();

				window.removeEventListener('mousemove', mousemove, true);
				window.removeEventListener('mouseup', mouseup, true);

				for (var i = 0, l = children.length; i < l; i++) {
					var child = children[i];

					if (child !== component) {
						child.removeEventListener('mouseover', siblingMouseOver);
					}
				}

				component.dispatchEvent(new CustomEvent('sort'));

				event.stopPropagation();

				return false;
			}

			window.addEventListener('mousemove', mousemove, {
				passive: true,
				capture: true
			});

			window.addEventListener('mouseup', mouseup, {
				passive: true,
				capture: true
			});

			function siblingMouseOver(event) {
				var parent = this.parentNode,
					y = event.layerY / (this.offsetHeight / 100);

				if (y < 50 && this.previousSibling !== component || y >= 50 && this.nextSibling === component) {
					parent.insertBefore(component, this);
				} else {
					parent.insertBefore(component, this.nextSibling);
				}
			}

			for (var i = 0, l = children.length; i < l; i++) {
				var child = children[i];

				if (child !== component) {
					child.addEventListener('mouseover', siblingMouseOver);
				}
			}

			event.stopPropagation();
			event.preventDefault();

			return false;
		});
	}
});
/*--------------------------------------------------------------
>>> MANIFEST
--------------------------------------------------------------*/

satus.manifest = function () {
	var object = {};

	if (this.isset('chrome.runtime.getManifest')) {
		object = chrome.runtime.getManifest();
	}

	return object;
};
/*--------------------------------------------------------------
>>> COLOR:
----------------------------------------------------------------
# String to array
# RGB to HSL
# HUE to RGB
# HSL to RGB
--------------------------------------------------------------*/

satus.color = {};


/*--------------------------------------------------------------
# STRING TO ARRAY
--------------------------------------------------------------*/

satus.color.stringToArray = function (string) {
	var match = string.match(/[0-9.]+/g);

    if (match) {
        for (var i = 0, l = match.length; i < l; i++) {
            match[i] = parseFloat(match[i]);
        }
    }

    return match;
};


/*--------------------------------------------------------------
# RGB TO HSL
--------------------------------------------------------------*/

satus.color.rgbToHsl = function (array) {
	var r = array[0] / 255,
		g = array[1] / 255,
		b = array[2] / 255,
		min = Math.min(r, g, b),
		max = Math.max(r, g, b),
		h = 0,
		s = 0,
		l = (min + max) / 2;

	if (min === max) {
		h = 0;
		s = 0;
	} else {
		var delta = max - min;

		s = l <= 0.5 ? delta / (max + min) : delta / (2 - max - min);

		if (max === r) {
			h = (g - b) / delta + (g < b ? 6 : 0);
		} else if (max === g) {
			h = (b - r) / delta + 2;
		} else if (max === b) {
			h = (r - g) / delta + 4;
		}

		h /= 6;
	}

	h *= 360;
	s *= 100;
	l *= 100;

	if (array.length === 3) {
		return [h, s, l];
	} else {
		return [h, s, l, array[3]];
	}
};


/*--------------------------------------------------------------
# HUE TO RGB
--------------------------------------------------------------*/

satus.color.hueToRgb = function (array) {
	var t1 = array[0],
		t2 = array[1],
		hue = array[2];

	if (hue < 0) {
		hue += 6;
	}

	if (hue >= 6) {
		hue -= 6;
	}

	if (hue < 1) {
		return (t2 - t1) * hue + t1;
	} else if (hue < 3) {
		return t2;
	} else if (hue < 4) {
		return (t2 - t1) * (4 - hue) + t1;
	} else {
		return t1;
	}
};


/*--------------------------------------------------------------
# HSL TO RGB
--------------------------------------------------------------*/

satus.color.hslToRgb = function (array) {
	var h = array[0] / 360,
		s = array[1] / 100,
		l = array[2] / 100,
		r, g, b;

	if (s == 0) {
		r = g = b = l;
	} else {
		var hue2rgb = function (p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};
/*--------------------------------------------------------------
>>> USER
----------------------------------------------------------------
# OS
    # Name
    # Bitness
# Browser
    # Name
    # Version
    # Platform
    # Manifest
    # Languages
    # Cookies
    # Flash
    # Java
    # Audio
    # Video
    # WebGL
# Device
    # Screen
    # RAM
    # GPU
    # Cores
    # Touch
    # Connection
--------------------------------------------------------------*/

satus.user = {
	browser: {},
	device: {},
	os: {}
};

/*--------------------------------------------------------------
# OS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# NAME
--------------------------------------------------------------*/

satus.user.os.name = function () {
	var app_version = navigator.appVersion;

	if (app_version.indexOf('Win') !== -1) {
		if (app_version.match(/(Windows 10.0|Windows NT 10.0)/)) {
			return 'Windows 10';
		} else if (app_version.match(/(Windows 8.1|Windows NT 6.3)/)) {
			return 'Windows 8.1';
		} else if (app_version.match(/(Windows 8|Windows NT 6.2)/)) {
			return 'Windows 8';
		} else if (app_version.match(/(Windows 7|Windows NT 6.1)/)) {
			return 'Windows 7';
		} else if (app_version.match(/(Windows NT 6.0)/)) {
			return 'Windows Vista';
		} else if (app_version.match(/(Windows NT 5.1|Windows XP)/)) {
			return 'Windows XP';
		} else {
			return 'Windows';
		}
	} else if (app_version.indexOf('(iPhone|iPad|iPod)') !== -1) {
		return 'iOS';
	} else if (app_version.indexOf('Mac') !== -1) {
		return 'macOS';
	} else if (app_version.indexOf('Android') !== -1) {
		return 'Android';
	} else if (app_version.indexOf('OpenBSD') !== -1) {
		return 'OpenBSD';
	} else if (app_version.indexOf('SunOS') !== -1) {
		return 'SunOS';
	} else if (app_version.indexOf('Linux') !== -1) {
		return 'Linux';
	} else if (app_version.indexOf('X11') !== -1) {
		return 'UNIX';
	}
};


/*--------------------------------------------------------------
# BITNESS
--------------------------------------------------------------*/

satus.user.os.bitness = function () {
	if (navigator.appVersion.match(/(Win64|x64|x86_64|WOW64)/)) {
		return '64-bit';
	} else {
		return '32-bit';
	}
};


/*--------------------------------------------------------------
# BROWSER
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# NAME
--------------------------------------------------------------*/

satus.user.browser.name = function () {
	var user_agent = navigator.userAgent;

	if (user_agent.indexOf('Opera') !== -1) {
		return 'Opera';
	} else if (user_agent.indexOf('Vivaldi') !== -1) {
		return 'Vivaldi';
	} else if (user_agent.indexOf('Edge') !== -1) {
		return 'Edge';
	} else if (user_agent.indexOf('Chrome') !== -1) {
		return 'Chrome';
	} else if (user_agent.indexOf('Safari') !== -1) {
		return 'Safari';
	} else if (user_agent.indexOf('Firefox') !== -1) {
		return 'Firefox';
	} else if (user_agent.indexOf('MSIE') !== -1) {
		return 'IE';
	}
};


/*--------------------------------------------------------------
# VERSION
--------------------------------------------------------------*/

satus.user.browser.version = function () {
	var browser_name = satus.user.browser.name(),
		browser_version = navigator.userAgent.match(new RegExp(browser_name + '/([0-9.]+)'));

	return browser_version[1];
};


/*--------------------------------------------------------------
# PLATFORM
--------------------------------------------------------------*/

satus.user.browser.platform = function () {
	return navigator.platform;
};


/*--------------------------------------------------------------
# MANIFEST
--------------------------------------------------------------*/

satus.user.browser.manifest = function () {
	return chrome.runtime.getManifest() || {};
};


/*--------------------------------------------------------------
# LANGUAGES
--------------------------------------------------------------*/

satus.user.browser.languages = function () {
	return navigator.languages;
};


/*--------------------------------------------------------------
# COOKIES
--------------------------------------------------------------*/

satus.user.browser.cookies = function () {
	if (document.cookie) {
		var random_cookie = 'ta{t`nX6cMXK,Wsc';

		document.cookie = random_cookie;

		if (document.cookie.indexOf(random_cookie) !== -1) {
			return true;
		}
	}

	return false;
};


/*--------------------------------------------------------------
# FLASH
--------------------------------------------------------------*/

satus.user.browser.flash = function () {
	try {
		if (new ActiveXObject('ShockwaveFlash.ShockwaveFlash')) {
			return true;
		}
	} catch (error) {
		if (navigator.mimeTypes['application/x-shockwave-flash']) {
			return true;
		}
	}

	return false;
};


/*--------------------------------------------------------------
# JAVA
--------------------------------------------------------------*/

satus.user.browser.java = function () {
	if (satus.isFunction(navigator.javaEnabled) && navigator.javaEnabled()) {
		return true;
	} else {
		return false;
	}
};


/*--------------------------------------------------------------
# AUDIO
--------------------------------------------------------------*/

satus.user.browser.audio = function () {
	var audio = document.createElement('audio'),
		types = {
			mp3: 'audio/mpeg',
			mp4: 'audio/mp4',
			aif: 'audio/x-aiff'
		},
		result = [];

	if (satus.isFunction(audio.canPlayType)) {
		for (var key in types) {
			var can_play_type = audio.canPlayType(types[key]);

			if (can_play_type !== '') {
				result.push(key);
			}
		}
	}

	return result;
};


/*--------------------------------------------------------------
# VIDEO
--------------------------------------------------------------*/

satus.user.browser.video = function () {
	var video = document.createElement('video'),
		types = {
			ogg: 'video/ogg; codecs="theora"',
			h264: 'video/mp4; codecs="avc1.42E01E"',
			webm: 'video/webm; codecs="vp8, vorbis"',
			vp9: 'video/webm; codecs="vp9"',
			hls: 'application/x-mpegURL; codecs="avc1.42E01E"'
		},
		result = [];

	if (satus.isFunction(video.canPlayType)) {
		for (var key in types) {
			var can_play_type = video.canPlayType(types[key]);

			if (can_play_type !== '') {
				result.push(key);
			}
		}
	}

	return result;
};


/*--------------------------------------------------------------
# WEBGL
--------------------------------------------------------------*/

satus.user.browser.webgl = function () {
	var cvs = document.createElement('canvas'),
		ctx = cvs.getContext('webgl');

	return ctx && ctx instanceof WebGLRenderingContext;
};


/*--------------------------------------------------------------
# HARDWARE
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# SCREEN
--------------------------------------------------------------*/

satus.user.device.screen = function () {
	if (screen) {
		return screen.width + 'x' + screen.height;
	}
};


/*--------------------------------------------------------------
# RAM
--------------------------------------------------------------*/

satus.user.device.ram = function () {
	if ('deviceMemory' in navigator) {
		return navigator.deviceMemory + ' GB';
	}
};


/*--------------------------------------------------------------
# GPU
--------------------------------------------------------------*/

satus.user.device.gpu = function () {
	var cvs = document.createElement('canvas'),
		ctx = cvs.getContext('webgl');

	if (
		ctx &&
		ctx instanceof WebGLRenderingContext &&
		'getParameter' in ctx &&
		'getExtension' in ctx
	) {
		var info = ctx.getExtension('WEBGL_debug_renderer_info');

		if (info) {
			return ctx.getParameter(info.UNMASKED_RENDERER_WEBGL);
		}
	}
};


/*--------------------------------------------------------------
# CORES
--------------------------------------------------------------*/

satus.user.device.cores = function () {
	return navigator.deviceConcurrency;
};


/*--------------------------------------------------------------
# TOUCH
--------------------------------------------------------------*/

satus.user.device.touch = function () {
	var result = {};

	if (
		window.hasOwnProperty('ontouchstart') ||
		window.DocumentTouch && document instanceof window.DocumentTouch ||
		navigator.maxTouchPoints > 0 ||
		window.navigator.msMaxTouchPoints > 0
	) {
		result.touch = true;
		result.maxTouchPoints = navigator.maxTouchPoints;
	}

	return result;
};


/*--------------------------------------------------------------
# CONNECTION
--------------------------------------------------------------*/

satus.user.device.connection = function () {
	var result = {};

	if (typeof navigator.connection === 'object') {
		result.type = navigator.connection.effectiveType || null;

		if (navigator.connection.downlink) {
			result.speed = navigator.connection.downlink + ' Mbps';
		}
	}

	return result;
};
/*--------------------------------------------------------------
# SEARCH
--------------------------------------------------------------*/

satus.search = function (query, object, callback) {
    var elements = ['switch', 'select', 'slider', 'shortcut', 'radio', 'color-picker'],
        threads = 0,
        results = {},
        excluded = [
            'baseProvider',
            'layersProvider',
            'parentObject',
            'parentSkeleton',
            'namespaceURI'
        ];

    query = query.toLowerCase();

    function parse(items, parent) {
        threads++;

        for (var key in items) {
            if (excluded.indexOf(key) === -1) {
                var item = items[key];

                if (item.component) {
                    //console.log(key, item.component);

                    if (elements.indexOf(item.component) !== -1 && key.indexOf(query) !== -1) {
                        results[key] = Object.assign({}, item);
                    }
                }

                if (
                    satus.isObject(item) &&
                    !satus.isArray(item) &&
                    !satus.isElement(item) &&
                    !satus.isFunction(item)
                ) {
                    parse(item, items);
                }
            }
        }

        threads--;

        if (threads === 0) {
            callback(results);
        }
    }

    parse(object);
};
