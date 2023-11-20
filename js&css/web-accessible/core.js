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
		channel: new RegExp('\/(@|c\/@?|channel\/|user\/)(?<name>[^/]+)'),
		channel_home_page: new RegExp('\/@|((channel|user|c)\/)[^/]+(\/featured)?\/?$'),
		channel_home_page_postfix: new RegExp('\/(featured)?\/?$'),
		thumbnail_quality: new RegExp('(default\.jpg|mqdefault\.jpg|hqdefault\.jpg|hq720\.jpg|sddefault\.jpg|maxresdefault\.jpg)+'),
		video_id: new RegExp('[?&]v=([^&]+)'),
		video_time: new RegExp('[?&](?:t|start)=([^&]+)'),
		playlist_id: new RegExp('[?&]list=([^&]+)'),
		channel_link: new RegExp('https:\/\/www.youtube.com\/@|((channel|user|c)\/)')
	},
	video_src: false,
	initialVideoUpdateDone: false,
	latestVideoDuration: 0,
	video_url: '',
	focus: false,
	played_before_blur: false,
	played_time: 0,
	ignore_autoplay_off: false,
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
CODEC || 30FPS
----------------------------------------------------------------
	Do not move, needs to be on top of first injected content
	file to patch HTMLMediaElement before YT player uses it.
--------------------------------------------------------------*/
if (localStorage['it-codec'] || localStorage['it-player30fps']) {
	function overwrite(self, callback, mime) {
		if (localStorage['it-codec']) {
			var re = new RegExp(localStorage['it-codec']);
			// /webm|vp8|vp9|av01/
			if (re.test(mime)) return '';
		}
		if (localStorage['it-player30fps']) {
			var match = /framerate=(\d+)/.exec(mime);
			if (match && match[1] > 30) return '';
		}
		return callback.call(self, mime);
	};

	if (window.MediaSource) {
		var isTypeSupported = window.MediaSource.isTypeSupported;
		window.MediaSource.isTypeSupported = function (mime) {
			return overwrite(this, isTypeSupported, mime);
		}
	}
	var canPlayType = HTMLMediaElement.prototype.canPlayType;
	HTMLMediaElement.prototype.canPlayType = function (mime) {
		return overwrite(this, canPlayType, mime);
	}
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
			
			if (ImprovedTube.storage.block_vp9 || ImprovedTube.storage.block_av1 || ImprovedTube.storage.block_h264) {
				let atlas = {block_vp9:'vp9|vp09', block_h264:'avc1', block_av1:'av01'}
				localStorage['it-codec'] = Object.keys(atlas).reduce(function (all, key) {
					return ImprovedTube.storage[key] ? ((all?all+'|':'') + atlas[key]) : all}, '');
			} else {
				localStorage.removeItem('it-codec');
			}
			if (ImprovedTube.storage.player_60fps === false) {
				localStorage['it-player30fps'] = true;
			} else {
				localStorage.removeItem('it-player30fps');
			}

//	  FEEDBACK WHEN THE USER CHANGED A SETTING
			ImprovedTube.init();
		} else if (message.action === 'storage-changed') {
			var camelized_key = message.camelizedKey;

			ImprovedTube.storage[message.key] = message.value;
			if(['block_vp9', 'block_h264', 'block_av1'].includes(message.key)){
				let atlas = {block_vp9:'vp9|vp09', block_h264:'avc1', block_av1:'av01'}
				localStorage['it-codec'] = Object.keys(atlas).reduce(function (all, key) {
					return ImprovedTube.storage[key] ? ((all?all+'|':'') + atlas[key]) : all}, '');
				if (!localStorage['it-codec']) {
					localStorage.removeItem('it-codec');
				}
			}
			if(message.key==="player_60fps"){
				if (ImprovedTube.storage.player_60fps === false) {
				localStorage['it-player30fps'] = true;
				} else {
					localStorage.removeItem('it-player30fps');
				}
			}
			if(ImprovedTube.storage[message.key]==="when_paused"){
				ImprovedTube.whenPaused();
			};
			if (camelized_key === 'blacklistActivate') {
				camelized_key = 'blacklist';
			} else if (camelized_key === 'playerForcedPlaybackSpeed') {
				camelized_key = 'playerPlaybackSpeed';
			} else if (camelized_key === 'theme') {
				ImprovedTube.myColors();
				ImprovedTube.setTheme();
			} else if (camelized_key === 'description') {
				if (ImprovedTube.storage.description === "expanded" || ImprovedTube.storage.description === "classic_expanded" )
				{try{document.querySelector("#more").click() || document.querySelector("#expand").click() ;} catch{} }
				if (ImprovedTube.storage.description === "normal" || ImprovedTube.storage.description === "classic" )
				{try{document.querySelector("#less").click() || document.querySelector("#collapse").click();} catch{}}
				ImprovedTube.improvedtubeYoutubeButtonsUnderPlayer();
			}
			  else if (camelized_key === 'transcript') {
				  if (ImprovedTube.storage.transcript === true) {try{document.querySelector('*[target-id*=transcript]').removeAttribute('visibility');}catch{}
				} if (ImprovedTube.storage.transcript === false){try{document.querySelector('*[target-id*=transcript] #visibility-button button').click();}catch{}}
			  }
			  else if (camelized_key === 'chapters') {
					 if (ImprovedTube.storage.chapters === true){try{document.querySelector('*[target-id*=chapters]').removeAttribute('visibility');}catch{}
				} if (ImprovedTube.storage.chapters === false){try{document.querySelector('*[target-id*=chapters] #visibility-button button').click();}catch{}}
			  }
				else if (camelized_key === 'commentsSidebar') {
				 if(ImprovedTube.storage.comments_sidebar === false)
				 {document.querySelector("#below").appendChild(document.querySelector("#comments"));
				  document.querySelector("#secondary").appendChild(document.querySelector("#related"));	}
						else{ImprovedTube.commentsSidebar();}
			  }
			 else if (camelized_key === 'forcedTheaterMode') {  if(ImprovedTube.storage.forced_theater_mode === false && ImprovedTube.elements.ytd_watch && ImprovedTube.elements.player){
				var button = ImprovedTube.elements.player.querySelector("button.ytp-size-button");
				if (button && ImprovedTube.elements.ytd_watch.theater === true) {
				ImprovedTube.elements.ytd_watch.theater = false;
				setTimeout(function () { button.click();}, 100);
				}
			  }
			 }
			if (ImprovedTube[camelized_key]) {
				try{ImprovedTube[camelized_key]()}catch{};
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
		} else if (camelized_key === 'playerScreenshotButton') { if (ImprovedTube.storage.player_screenshot_button === false) {
			if (ImprovedTube.elements.buttons['it-screenshot-button']) {
			ImprovedTube.elements.buttons['it-screenshot-button'].remove();
			ImprovedTube.elements.buttons['it-screenshot-styles'].remove();}		 }
		} else if (camelized_key === 'playerRepeatButton') { if (ImprovedTube.storage.player_repeat_button === false) {
			if (ImprovedTube.elements.buttons['it-repeat-button']) {
			ImprovedTube.elements.buttons['it-repeat-button'].remove();
			ImprovedTube.elements.buttons['it-repeat-styles'].remove();}  		 }
		} else if (camelized_key === 'playerHamburgerButton') { if(ImprovedTube.storage.player_hamburger_button == false) {
			document.querySelector('.custom-hamburger-menu')?.remove(); 
			// Restoring the original padding:
			document.querySelector('.html5-video-player')?.querySelector('.ytp-right-controls')?.style.setProperty('padding-right', '0', 'important')	}
		} /* else if (message.hasOwnProperty('mixer')) {
			if (ImprovedTube.elements.player) {
				  document.documentElement.setAttribute('it-response', JSON.stringify({
					mixer: true,
					url: location.href.match(/(\?|\&)v=[^&]+/)[0].substr(3),
					volume: ImprovedTube.elements.player.getVolume(),
					playbackRate: ImprovedTube.elements.player.getPlaybackRate(),
					title: document.title
				}));
			}
		} */
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
