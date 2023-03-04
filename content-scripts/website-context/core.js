/*--------------------------------------------------------------
>>> CORE:
----------------------------------------------------------------
# Global variable
# Messages
	# Create element
	# Listener
	# Send
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

var ImprovedTube = {
	messages: {
		queue: []
	},
	storage: {},
	elements: {
		buttons: {},
		masthead: {},
		app_drawer: {},
		playlist: {},
		livechat: {},
		related: {},
		comments: {},
		collapse_of_subscription_sections: [],
		mark_watched_videos: [],
		blacklist_buttons: []
	},
	regex: {
		channel: new RegExp('\/@|((channel|user|c)\/)'),
		channel_home_page: new RegExp('\/@|((channel|user|c)\/)[^/]+(\/featured)?\/?$'),
		channel_home_page_postfix: new RegExp('\/(featured)?\/?$'),
		thumbnail_quality: new RegExp('(default\.jpg|mqdefault\.jpg|hqdefault\.jpg|hq720\.jpg|sddefault\.jpg|maxresdefault\.jpg)+'),
		video_id: new RegExp('[?&]v=([^&]+)'),
		channel_link: new RegExp('https:\/\/www.youtube.com\/@|((channel|user|c)\/)')
	},
	video_src: false,
	initialVideoUpdateDone: false,
	latestVideoDuration: 0,
	video_url: '',
	focus: false,
	played_before_blur: false,
	played_time: 0,
	allow_autoplay: false,
	mini_player__mode: false,
	mini_player__move: false,
	mini_player__cursor: '',
	mini_player__x: 0,
	mini_player__y: 0,
	mini_player__max_x: 0,
	mini_player__max_y: 0,
	mini_player__original_width: 0,
	mini_player__original_height: 0,
	mini_player__width: 200,
	mini_player__height: 160,
	miniPlayer_mouseDown_x: 0,
	miniPlayer_mouseDown_y: 0,
	mini_player__player_offset_x: 0,
	mini_player__player_offset_y: 0,
	miniPlayer_resize_offset: 16,
	playlistReversed: false,
	status_timer: false,
	defaultApiKey: 'AIzaSyCXRRCFwKAXOiF1JkUBmibzxJF1cPuKNwA'
};


/*--------------------------------------------------------------
# MESSAGES
----------------------------------------------------------------
	Designed for messaging between contexts of extension and
	website.
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# CREATE ELEMENT
--------------------------------------------------------------*/

ImprovedTube.messages.create = function () {
	this.element = document.createElement('div');

	this.element.id = 'it-messages-from-youtube';

	this.element.style.display = 'none';

	document.documentElement.appendChild(this.element);
};

/*--------------------------------------------------------------
# LISTENER
--------------------------------------------------------------*/

ImprovedTube.messages.listener = function () {
	document.addEventListener('it-message-from-youtube--readed', function () {
		ImprovedTube.messages.queue.pop();

		if (ImprovedTube.messages.queue.length > 0) {
			ImprovedTube.messages.element.textContent = message;

			document.dispatchEvent(new CustomEvent('it-message-from-youtube'));
		}
	});
};

document.addEventListener('it-message-from-extension', function () {
	var provider = document.querySelector('#it-messages-from-extension');

	if (provider) {
		var message = provider.textContent;

		document.dispatchEvent(new CustomEvent('it-message-from-extension--readed'));

		try {
			message = JSON.parse(message);
		} catch (error) {
			console.log(error);
		}

		if (message.action === 'storage-loaded') {
			ImprovedTube.storage = message.storage;

			ImprovedTube.init();
		} else if (message.action === 'storage-changed') {
			var camelized_key = message.camelizedKey;

			ImprovedTube.storage[message.key] = message.value;
			if(ImprovedTube.storage[message.key]==="when_paused"){
				ImprovedTube.whenPaused();
			};
			if (camelized_key === 'blacklistActivate') {
				camelized_key = 'blacklist';
			} else if (camelized_key === 'playerForcedPlaybackSpeed') {
				camelized_key = 'playerPlaybackSpeed';
			} else if (camelized_key === 'theme') {
				ImprovedTube.themes();
			}

			if (ImprovedTube[camelized_key]) {
				ImprovedTube[camelized_key]();
			}
		} else if (message.focus === true && ImprovedTube.elements.player) {
			ImprovedTube.focus = true;

			ImprovedTube.pageOnFocus();
		} else if (message.blur === true && ImprovedTube.elements.player) {
			ImprovedTube.focus = false;

			ImprovedTube.pageOnFocus();

			document.dispatchEvent(new CustomEvent('improvedtube-blur'));
		} else if (message.pause === true) {
			if (ImprovedTube.elements.player) {
				ImprovedTube.played_before_blur = ImprovedTube.elements.player.getPlayerState() === 1;
				ImprovedTube.elements.player.pauseVideo();
			}
		} else if (message.hasOwnProperty('setVolume')) {
			if (ImprovedTube.elements.player) {
				ImprovedTube.elements.player.setVolume(message.setVolume);
			}
		} else if (message.hasOwnProperty('setPlaybackSpeed')) {
			if (ImprovedTube.elements.player) {
				ImprovedTube.elements.player.setPlaybackRate(message.setPlaybackSpeed);
			}
		} else if (message.deleteCookies === true) {
			ImprovedTube.deleteYoutubeCookies();
		} else if (message.hasOwnProperty('responseOptionsUrl')) {
			var iframe = document.querySelector('.it-button__iframe');

			if (iframe) {
				iframe.src = message.responseOptionsUrl;
			}
		} else if (message.hasOwnProperty('mixer')) {
			if (ImprovedTube.elements.player) {
				/*document.documentElement.setAttribute('it-response', JSON.stringify({
					mixer: true,
					url: location.href.match(/(\?|\&)v=[^&]+/)[0].substr(3),
					volume: ImprovedTube.elements.player.getVolume(),
					playbackRate: ImprovedTube.elements.player.getPlaybackRate(),
					title: document.title
				}));*/
			}
		}
	}
});

/*--------------------------------------------------------------
# SEND
--------------------------------------------------------------*/

ImprovedTube.messages.send = function (message) {
	if (typeof message === 'object') {
		message = JSON.stringify(message);
	}

	this.queue.push(message);

	if (this.queue.length === 1) {
		this.element.textContent = message;

		document.dispatchEvent(new CustomEvent('it-message-from-youtube'));
	}
};