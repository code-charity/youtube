/*------------------------------------------------------------------------------
4.2.0 APPEARANCE
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.2.1 PLAYER
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.2.1.1 PLAYER SIZE
------------------------------------------------------------------------------*/

ImprovedTube.playerSize = function () {
	if (window.self === window.top) {
		if (this.elements.player_size_style) {
			this.elements.player_size_style.remove();
		}

		if (this.storage.forced_theater_mode === true && this.storage.player_size === 'fit_to_window') {
			var button = document.querySelector('button.ytp-size-button'),
				container = document.getElementById('player-theater-container');

			if (button && (container && !container.firstChild)) {
				button.click();
			}
		}

		if (this.storage.player_size === 'fit_to_window' && this.elements.ytd_watch && this.elements.ytd_player) {
			var video = this.elements.video,
				aspect_ratio = video.videoWidth / video.videoHeight,
				width,
				height,
				max_height = window.innerHeight,
				style = this.elements.player_size_style || document.createElement('style');

			if (this.elements.ytd_watch.theater === true) {
				width = this.elements.ytd_player.offsetWidth;

				style.textContent = '[data-page-type="video"][it-player-size="fit_to_window"] ytd-app:not([player-fullscreen_]) ytd-watch-flexy[theater]:not([fullscreen]) video {';
			} else {
				width = this.elements.ytd_watch.offsetWidth;

				style.textContent = '[data-page-type="video"][it-player-size="fit_to_window"] ytd-app:not([player-fullscreen_]) ytd-watch-flexy:not([theater]):not([fullscreen]) video {';
			}

			height = width / aspect_ratio;

			if (height > max_height) {
				width -= (height - max_height) * aspect_ratio;
				height = max_height;
			}

			style.textContent += 'width:' + width + 'px !important;';
			style.textContent += 'height:' + height + 'px !important;';

			style.textContent += '}';

			this.elements.player_size_style = style;

			document.body.appendChild(style);

			setTimeout(function () {
				window.dispatchEvent(new Event('resize'));
			}, 100);
		}

		if (this.storage.player_size === 'custom') {
			var width = Number(this.storage.custom_player_size_width) || 1280,
				height = Number(this.storage.custom_player_size_height) || 720,
				style = this.elements.player_size_style || document.createElement('style');

			style.textContent = '[data-page-type="video"][it-player-size="custom"] ytd-app:not([player-fullscreen_]) ytd-watch-flexy:not([fullscreen]) .html5-video-player:not(.it-mini-player) video {';
			style.textContent += 'width:' + width + 'px !important;';
			style.textContent += 'height:' + height + 'px !important;';
			style.textContent += '}';

			style.textContent += '[data-page-type="video"][it-player-size="custom"] ytd-app:not([player-fullscreen_]) ytd-watch-flexy:not([fullscreen]) #player-container-inner.ytd-watch-flexy {';
			style.textContent += 'padding-top:' + height + 'px !important;';
			style.textContent += '}';

			style.textContent += '[data-page-type="video"][it-player-size="custom"] ytd-app:not([player-fullscreen_]) ytd-watch-flexy:not([fullscreen]) #player-theater-container.ytd-watch-flexy {';
			style.textContent += 'height:' + height + 'px !important;';
			style.textContent += 'min-height:' + height + 'px !important;';
			style.textContent += 'max-height:' + height + 'px !important;';
			style.textContent += '}';

			this.elements.player_size_style = style;

			document.body.appendChild(style);

			setTimeout(function () {
				window.dispatchEvent(new Event('resize'));
			}, 100);
		}
	}
};


/*------------------------------------------------------------------------------
4.2.1.2 FORCED THEATER MODE
------------------------------------------------------------------------------*/

ImprovedTube.forcedTheaterMode = function () {
	if (
		window.self === window.top &&
		this.storage.forced_theater_mode === true &&
		this.elements.ytd_watch &&
		this.elements.player
	) {
		var button = this.elements.player.querySelector('button.ytp-size-button');

		if (button && this.elements.ytd_watch.theater === false) {
			document.cookie = 'wide=1;domain=.youtube.com';

			setTimeout(function () {
				button.click();
			}, 200);
		}
	}
};


/*------------------------------------------------------------------------------
4.2.1.3 HD THUMBNAIL
------------------------------------------------------------------------------*/

ImprovedTube.playerHdThumbnail = function () {
	if (this.storage.player_hd_thumbnail === true) {
		var thumbnail = ImprovedTube.elements.player_thumbnail;

		if (thumbnail.style.backgroundImage.indexOf('/hqdefault.jpg') !== -1) {
			thumbnail.style.backgroundImage = thumbnail.style.backgroundImage.replace('/hqdefault.jpg', '/maxresdefault.jpg');
		}
	}
};


/*------------------------------------------------------------------------------
4.2.1.4 ALWAYS SHOW PROGRESS BAR
------------------------------------------------------------------------------*/

ImprovedTube.alwaysShowProgressBar = function () {
	if (this.storage.always_show_progress_bar === true) {
		var player = ImprovedTube.elements.player;

		if (player && player.className.indexOf('ytp-autohide') !== -1) {
			var played = player.getCurrentTime() * 100 / player.getDuration(),
				loaded = player.getVideoBytesLoaded() * 100,
				play_bars = player.querySelectorAll('.ytp-play-progress'),
				load_bars = player.querySelectorAll('.ytp-load-progress'),
				width = 0,
				progress_play = 0,
				progress_load = 0;

			for (var i = 0, l = play_bars.length; i < l; i++) {
				width += play_bars[i].offsetWidth;
			}

			var width_percent = width / 100;

			for (var i = 0, l = play_bars.length; i < l; i++) {
				var a = play_bars[i].offsetWidth / width_percent,
					b = 0,
					c = 0;

				if (played - progress_play >= a) {
					b = 100;
				} else if (played > progress_play && played < a + progress_play) {
					b = 100 * ((played - progress_play) * width_percent) / play_bars[i].offsetWidth;
				}

				play_bars[i].style.transform = 'scaleX(' + b / 100 + ')';

				if (loaded - progress_load >= a) {
					c = 100;
				} else if (loaded > progress_load && loaded < a + progress_load) {
					c = 100 * ((loaded - progress_load) * width_percent) / play_bars[i].offsetWidth;
				}

				load_bars[i].style.transform = 'scaleX(' + c / 100 + ')';

				progress_play += a;
				progress_load += a;
			}
		}
	}
};


/*------------------------------------------------------------------------------
4.2.1.5 VIDEO REMAINING DURATION
------------------------------------------------------------------------------*/

ImprovedTube.formatSecond = function (rTime) {
	var time = new Date(null);
	time.setSeconds(rTime);
	if (rTime / 3600 < 1) {
		return time.toISOString().substr(14, 5);
	} else {
		return time.toISOString().substr(11, 8);
	}
}

ImprovedTube.playerRemainingDuration = function () {
	var element = document.querySelector('.ytp-time-remaining-duration');
	if (this.storage.player_remaining_duration === true) {
		var player = ImprovedTube.elements.player;
		var rTime = ImprovedTube.formatSecond((player.getDuration() - player.getCurrentTime()).toFixed(0));
		if (!element) {
			var label = document.createElement('span');
			label.textContent = ' (-' + rTime + ')';
			label.className = 'ytp-time-remaining-duration';
			document.querySelector('.ytp-time-display').appendChild(label);
		} else {
			element.textContent = ' (-' + rTime + ')';
		}
	} else if (element) {
		element.remove();
	}
};


/*------------------------------------------------------------------------------
4.2.2 SIDEBAR
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.2.2.1 LIVECHAT
------------------------------------------------------------------------------*/

ImprovedTube.livechat = function () {
	if (this.storage.livechat === 'collapsed') {
		ImprovedTube.elements.livechat.button.click();
	}
};


/*------------------------------------------------------------------------------
4.2.3 DETAILS
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.2.3.1 HOW LONG AGO THE VIDEO WAS UPLOADED
------------------------------------------------------------------------------*/

ImprovedTube.howLongAgoTheVideoWasUploaded = function () {
	if (this.storage.how_long_ago_the_video_was_uploaded === true && this.elements.yt_channel_name) {
		var xhr = new XMLHttpRequest(),
			key = this.storage['google-api-key'] || ImprovedTube.defaultApiKey,
			id = this.getParam(location.href.slice(location.href.indexOf('?') + 1), 'v');

		function timeSince(date) {
			var seconds = Math.floor((new Date() - new Date(date)) / 1000),
				interval = Math.floor(seconds / 31536000);

			if (interval > 1) {
				return interval + ' years ago';
			}
			interval = Math.floor(seconds / 2592000);
			if (interval > 1) {
				return interval + ' months ago';
			}
			interval = Math.floor(seconds / 86400);
			if (interval > 1) {
				return interval + ' days ago';
			}
			interval = Math.floor(seconds / 3600);
			if (interval > 1) {
				return interval + ' hours ago';
			}
			interval = Math.floor(seconds / 60);
			if (interval > 1) {
				return interval + ' minutes ago';
			}

			return Math.floor(seconds) + ' seconds ago';
		}

		xhr.addEventListener('load', function () {
			var response = JSON.parse(this.responseText),
				element = ImprovedTube.elements.how_long_ago_the_video_was_uploaded || document.createElement('div');

			ImprovedTube.empty(element);

			if (response.error) {
				element.appendChild(document.createTextNode('• Error: ' + response.error.code));
			} else {
				element.appendChild(document.createTextNode('• ' + timeSince(response.items[0].snippet.publishedAt)));
			}

			element.className = 'it-how-long-ago-the-video-was-uploaded';

			ImprovedTube.elements.how_long_ago_the_video_was_uploaded = element;

			document.querySelector('#info #info-text').appendChild(element);
		});

		xhr.open('GET', 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + id + '&key=' + key, true);
		xhr.send();
	}
};


/*------------------------------------------------------------------------------
4.2.3.2 SHOW CHANNEL VIDEOS COUNT
------------------------------------------------------------------------------*/

ImprovedTube.channelVideosCount = function () {
	if (this.storage.channel_videos_count === true && this.elements.yt_channel_link) {
		var xhr = new XMLHttpRequest(),
			key = this.storage['google-api-key'] || ImprovedTube.defaultApiKey,
			id = this.elements.yt_channel_link.href.slice(this.elements.yt_channel_link.href.indexOf('/channel/') + '/channel/'.length);

		if (id.indexOf('/') !== -1) {
			id = id.match(/.+?(?=\/)/)[0];
		}

		xhr.addEventListener('load', function () {
			var response = JSON.parse(this.responseText),
				parent = document.querySelector('#meta ytd-channel-name + yt-formatted-string'),
				element = ImprovedTube.elements.channel_videos_count || document.createElement('div');

			ImprovedTube.empty(element);

			if (response.error) {
				element.appendChild(document.createTextNode('• Error: ' + response.error.code));
			} else {
				element.appendChild(document.createTextNode('• ' + response.items[0].statistics.videoCount + ' videos'));
			}

			element.className = 'it-channel-videos-count';

			ImprovedTube.elements.channel_videos_count = element;

			parent.appendChild(element);

			ImprovedTube.elements.channel_videos_count = element;
		});


		xhr.open('GET', 'https://www.googleapis.com/youtube/v3/channels?part=statistics&id=' + id + '&key=' + key, true);
		xhr.send();
	}
};