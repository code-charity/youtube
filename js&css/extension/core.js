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
	"always_show_progress_bar",
	"bluelight",
	"channel_compact_theme",
	"channel_hide_featured_content",
	"collapse_of_subscription_sections",
	"columns",
	"comments",
	"comments_sidebar",
	"comments_sidebar_left",
	"comments_sidebar_simple",
	"compactSpacing",
	"description",
	"embeddedHidePauseOverlay",
	"embeddedHideShare",
	"embeddedHideYoutubeLogo",
	"header_hide_country_code",
	"header_hide_right_buttons",
	"header_improve_logo",
	"header_position",
	"header_transparent",
	"hide_animated_thumbnails",
	"hide_author_avatars",
	"hide_clip_button",
	"hide_comments_count",
	"hide_date",
	"hide_details",
	"hide_dislike_button",
	"hide_download_button",
	"hide_footer",
	"hide_gradient_bottom",
	"hide_more_button",
	"hide_playlist",
	"hide_report_button",
	"hide_save_button",
	"hide_scroll_for_details",
	"hide_share_button",
	"hide_shorts_remixing",
	"hide_sidebar",
	"hide_thanks_button",
	"hide_thumbnail_overlay",
	"hide_video_title_fullScreen",
	"hide_views_count",
	"hide_voice_search_button",
	"improvedtube_search",
	"likes",
	"livechat",
	"mini_player_cursor",
	"no_page_margin",
	"player_autoplay_button",
	"player_color",
	"player_crop_chapter_titles",
	"player_fit_to_win_button",
	"player_hide_annotations",
	"player_hide_cards",
	"player_hide_endscreen",
	"player_hide_skip_overlay",
	"player_miniplayer_button",
	"player_next_button",
	"player_play_button",
	"player_previous_button",
	"player_remote_button",
	"player_screen_button",
	"player_settings_button",
	"player_show_cards_on_mouse_hover",
	"player_size",
	"player_size",
	"player_subtitles_button",
	"player_transparent_background",
	"player_view_button",
	"player_volume_button",
	"red_dislike_button",
	"related_videos",
	"remove_black_bars",
	"remove_history_shorts",
	"remove_home_page_shorts",
	"remove_related_search_results",
	"remove_shorts_reel_search_results",
	"remove_subscriptions_shorts",
	"remove_trending_shorts",
	"schedule",
	"scroll_bar",
	"scroll_to_top",
	"search_focus",
	"sidebar_left",
	"squared_user_images",
	"subscribe",
	"theme",
	"thumbnails_hide",
	"thumbnails_right",
	"transcript",
	"youtube_home_page",
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

		// initialize theme in case YT is in Dark cookie mode
		if (!extension.storage.data['theme'] && document.documentElement.hasAttribute('dark')) {
			extension.storage.data['theme'] = 'dark';
			chrome.storage.local.set({theme: 'dark'});
		}

		for (const key in items) {
			if (htmlAttributes.includes(key)) {
				document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), items[key]);
			}
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
