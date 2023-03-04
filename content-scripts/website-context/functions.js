/*--------------------------------------------------------------
>>> FUNCTIONS
--------------------------------------------------------------*/

ImprovedTube.childHandler = function (node) {
	var children = node.children;
	if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'svg' && node.nodeName !== '#text'&& node.nodeName !== '#comment' && node.nodeName !== 'SPAN' && node.nodeName !== 'DOM-IF' && node.nodeName !== 'DOM-REPEAT') {
		this.ytElementsHandler(node);

		if (children) {
			for (var i = 0, l = children.length; i < l; i++) {
				ImprovedTube.childHandler(children[i]);
			}
		}
	}
};

ImprovedTube.ytElementsHandler = function (node) {
	var name = node.nodeName,
		id = node.id;

	if (name === 'A') {
		if (node.href) {
			this.channelDefaultTab(node);

			if (node.className.indexOf('ytd-thumbnail') !== -1) {
				this.blacklist('video', node);
			}
			if (node.href.match(/@|((channel|user|c)\/)([^/]+)/)) {
				this.blacklist('channel', node);
			}
		}
	} else if (name === 'META') {
		if (node.getAttribute('itemprop') === 'genre') {
			ImprovedTube.genre = node.content;
		}
	} else if (name === 'YTD-TOGGLE-BUTTON-RENDERER' || name === 'YTD-PLAYLIST-LOOP-BUTTON-RENDERER') {
		if (
			node.parentComponent &&
			node.parentComponent.nodeName === 'YTD-MENU-RENDERER' &&
			node.parentComponent.parentComponent &&
			node.parentComponent.parentComponent.nodeName === 'YTD-PLAYLIST-PANEL-RENDERER'
		) {
			var index = Array.prototype.indexOf.call(node.parentNode.children, node);

			if (index === 0) {
				this.elements.playlist.actions = node.parentNode.parentNode.parentNode.parentNode;

				this.playlistReverse();
			} else if (index === 1) {
				this.elements.playlist.shuffle_button = node;

				this.playlistShuffle();

				this.elements.playlist.actions = node.parentNode.parentNode.parentNode.parentNode;

				this.playlistReverse();
			}
		}
	} else if (name === 'YTD-GUIDE-SECTION-RENDERER') {
		if (!this.elements.sidebar_section) {
			this.elements.sidebar_section = node;

			this.improvedtubeYoutubeIcon();
		}
	} else if (name === 'YTD-VIDEO-PRIMARY-INFO-RENDERER') {
		this.elements.video_title = node.querySelector('.title.ytd-video-primary-info-renderer');

		this.improvedtubeYoutubeIcon();
		this.improvedtubeYoutubeButtonsUnderPlayer();


	} else if (name === 'YTD-VIDEO-SECONDARY-INFO-RENDERER') {
		this.elements.yt_channel_name = node.querySelector('ytd-channel-name');
		this.elements.yt_channel_link = node.querySelector('ytd-channel-name a');

		if (document.documentElement.dataset.pageType === 'video') {
			this.howLongAgoTheVideoWasUploaded();
			this.channelVideosCount();
		}
	} else if (name === 'YTD-MENU-RENDERER' && node.classList.contains('ytd-video-primary-info-renderer')) {
		if(document.documentElement.dataset.pageType === 'video'){
            this.hideDetailButton(node.$['flexible-item-buttons'].children);
        }
	} else if (name === 'YTD-SUBSCRIBE-BUTTON-RENDERER') {
		if (node.className.indexOf('ytd-c4-tabbed-header-renderer') !== -1) {
			ImprovedTube.blacklist('channel', node);
		}

		ImprovedTube.elements.subscribe_button = node;
	} else if (id === 'chat') {
		this.elements.livechat.button = node.querySelector('ytd-toggle-button-renderer');

		this.livechat();
	} else if (name === 'YTD-MASTHEAD') {
		if (!this.elements.masthead) {
			this.elements.masthead = {
				start: node.querySelector('#start'),
				end: node.querySelector('#end'),
				logo: node.querySelector('a#logo')
			};

			this.improvedtubeYoutubeIcon();
		}
	}
	else if (name === 'TP-YT-APP-DRAWER') {
		if (!this.elements.app_drawer) {
			this.elements.app_drawer = {
				start: node.querySelector('div#header'),
				logo: node.querySelector('a#logo')
			};

			this.improvedtubeYoutubeIcon();
		}
	} else if (name === 'YTD-PLAYER') {
		if (!this.elements.ytd_player) {
			ImprovedTube.elements.ytd_player = node;
		}
	} else if (id === 'movie_player') {
		if (!this.elements.player) {
			ImprovedTube.elements.player = node;
			ImprovedTube.elements.video = node.querySelector('video');
			ImprovedTube.elements.player_left_controls = node.querySelector('.ytp-left-controls');
			ImprovedTube.elements.player_thumbnail = node.querySelector('.ytp-cued-thumbnail-overlay-image');
			ImprovedTube.elements.player_subtitles_button = node.querySelector('.ytp-subtitles-button');

			ImprovedTube.playerSize();

			new MutationObserver(function (mutationList) {
				for (var i = 0, l = mutationList.length; i < l; i++) {
					var mutation = mutationList[i];

					if (mutation.type === 'childList') {
						for (var j = 0, k = mutation.addedNodes.length; j < k; j++) {
							var node = mutation.addedNodes[j];

							if (node.nodeName === 'DIV' && node.className.indexOf('ytp-ad-player-overlay') !== -1) {
								ImprovedTube.playerAds(node);
							}
						}
					}
				}
			}).observe(node, {
				attributes: false,
				childList: true,
				subtree: true
			});

			new MutationObserver(function (mutationList) {
				for (var i = 0, l = mutationList.length; i < l; i++) {
					var mutation = mutationList[i];

					if (mutation.type === 'attributes') {
						if (mutation.attributeName === 'style') {
							ImprovedTube.playerHdThumbnail();
						}
					}
				}
			}).observe(ImprovedTube.elements.player_thumbnail, {
				attributes: true,
				attributeFilter: ['style'],
				childList: false,
				subtree: false
			});
		}
	} else if (name === 'YTD-WATCH-FLEXY') {
		this.elements.ytd_watch = node;

		if (
			this.isset(this.storage.player_size) &&
			this.storage.player_size !== 'do_not_change'
		) {
			node.calculateCurrentPlayerSize_ = function () {
				if (!this.theater && ImprovedTube.elements.player) {
					if (this.updateStyles) {
						this.updthisateStyles({
							'--ytd-watch-flexy-width-ratio': 1,
							'--ytd-watch-flexy-height-ratio': 0.5625
						});

						this.updateStyles({
							'--ytd-watch-width-ratio': 1,
							'--ytd-watch-height-ratio': 0.5625
						});
					}

					return {
						width: ImprovedTube.elements.player.offsetWidth,
						height: Math.round(ImprovedTube.elements.player.offsetWidth / (16 / 9))
					};
				}

				return {
					width: NaN,
					height: NaN
				};
			};

			node.calculateNormalPlayerSize_ = node.calculateCurrentPlayerSize_;
		}
	}else if (id ==='description-inner') {
	if (document.documentElement.dataset.pageType === 'video'){ 
		setTimeout(function () {
			ImprovedTube.description(node);
	    }, 750);    
		}	   
        //old
	}else if (name === 'TP-YT-PAPER-BUTTON') {
        if (document.documentElement.dataset.pageType === 'video' && id === 'more' && node.classList.contains('ytd-expander')) {
            setTimeout(function () {
               	 	ImprovedTube.description(node);
            }, 750);
        }
    }
};

ImprovedTube.pageType = function () {
	if (/^\/watch\?/.test(location.pathname)) {
		document.documentElement.dataset.pageType = 'video';
	} else if (location.pathname === '/') {
		document.documentElement.dataset.pageType = 'home';
	} else if (/^\/subscriptions\?/.test(location.pathname)) {
		document.documentElement.dataset.pageType = 'subscriptions';
	} else if (/^\/@|((channel|user|c)\/)[^/]+(?!\/videos)/.test(location.pathname)) {
		document.documentElement.dataset.pageType = 'channel';
	} else {
		document.documentElement.dataset.pageType = 'other';
	}
};

ImprovedTube.pageOnFocus = function () {
	ImprovedTube.playerAutopauseWhenSwitchingTabs();
};

ImprovedTube.videoPageUpdate = function () {
	if (document.documentElement.dataset.pageType === 'video') {
		var video_id = this.getParam(new URL(location.href).search.substr(1), 'v');

		if (this.storage.track_watched_videos === true && video_id) {
			ImprovedTube.messages.send({
				action: 'watched',
				type: 'add',
				id: video_id,
				title: document.title
			});
		}

		this.initialVideoUpdateDone = true;

		ImprovedTube.howLongAgoTheVideoWasUploaded();
		ImprovedTube.dayOfWeek();
		ImprovedTube.channelVideosCount();
		ImprovedTube.upNextAutoplay();
		ImprovedTube.playerAutofullscreen();
		ImprovedTube.playerScreenshotButton();
		ImprovedTube.playerRepeatButton();
		ImprovedTube.playerRotateButton();
		ImprovedTube.playerPopupButton();
		ImprovedTube.playerControls();
	}
};

ImprovedTube.playerOnPlay = function () {
	HTMLMediaElement.prototype.play = (function (original) {
		return function () {
			this.removeEventListener('loadedmetadata', ImprovedTube.playerOnLoadedMetadata);
			this.addEventListener('loadedmetadata', ImprovedTube.playerOnLoadedMetadata);

			this.removeEventListener('timeupdate', ImprovedTube.playerOnTimeUpdate);
			this.addEventListener('timeupdate', ImprovedTube.playerOnTimeUpdate);

			this.removeEventListener('pause', ImprovedTube.playerOnPause, true);
			this.addEventListener('pause', ImprovedTube.playerOnPause, true);

			this.removeEventListener('ended', ImprovedTube.playerOnEnded, true);
			this.addEventListener('ended', ImprovedTube.playerOnEnded, true);

			ImprovedTube.autoplay();
			ImprovedTube.playerLoudnessNormalization();

			return original.apply(this, arguments);
		}
	})(HTMLMediaElement.prototype.play);
};

ImprovedTube.initPlayer = function () {
	if (ImprovedTube.elements.player && ImprovedTube.video_url !== location.href) {

		ImprovedTube.video_url = location.href;
		ImprovedTube.played_before_blur = false;

		delete ImprovedTube.elements.player.dataset.defaultQuality;

		ImprovedTube.forcedPlayVideoFromTheBeginning();
		ImprovedTube.playerPlaybackSpeed(false);
		ImprovedTube.subtitles();
		ImprovedTube.subtitlesLanguage();
		ImprovedTube.subtitlesFontFamily();
		ImprovedTube.subtitlesFontColor();
		ImprovedTube.subtitlesFontSize();
		ImprovedTube.subtitlesBackgroundColor();
		ImprovedTube.subtitlesWindowColor();
		ImprovedTube.subtitlesWindowOpacity();
		ImprovedTube.subtitlesCharacterEdgeStyle();
		ImprovedTube.subtitlesFontOpacity();
		ImprovedTube.subtitlesBackgroundOpacity();
		ImprovedTube.playerQuality();
		ImprovedTube.playerVolume();

		setTimeout(function () {
            ImprovedTube.forcedTheaterMode();
        }, 150);

		if (location.href.indexOf('/embed/') === -1) {
			ImprovedTube.miniPlayer();
		}
	}
};

ImprovedTube.playerOnTimeUpdate = function () {
	if (ImprovedTube.video_src !== this.src) {
		ImprovedTube.video_src = this.src;

		if (ImprovedTube.initialVideoUpdateDone !== true) {
			ImprovedTube.playerQuality();
		}
	} else if (ImprovedTube.latestVideoDuration !== this.duration) {
		ImprovedTube.latestVideoDuration = this.duration;

		ImprovedTube.playerQuality();
	}

	ImprovedTube.alwaysShowProgressBar();
	ImprovedTube.playerRemainingDuration();

	ImprovedTube.played_time += .25;
};

ImprovedTube.playerOnLoadedMetadata = function () {
	setTimeout(function () {
		ImprovedTube.playerSize();
	}, 100);
};

ImprovedTube.playerOnPause = function (event) {
	ImprovedTube.playlistUpNextAutoplay(event);

	if (ImprovedTube.elements.yt_channel_name) {
		ImprovedTube.messages.send({
			action: 'analyzer',
			name: ImprovedTube.elements.yt_channel_name.__data.tooltipText,
			time: ImprovedTube.played_time
		});
	}

	ImprovedTube.played_time = 0;
};

ImprovedTube.playerOnEnded = function (event) {
	ImprovedTube.playlistUpNextAutoplay(event);

	ImprovedTube.messages.send({
		action: 'analyzer',
		name: ImprovedTube.elements.yt_channel_name.__data.tooltipText,
		time: ImprovedTube.played_time
	});

	ImprovedTube.played_time = 0;
};

ImprovedTube.onkeydown = function () {
	window.addEventListener('keydown', function () {
		if (
			ImprovedTube.elements.player &&
			ImprovedTube.elements.player.className.indexOf('ad-showing') === -1
		) {
			ImprovedTube.allow_autoplay = true;
		}
	}, true);
};

ImprovedTube.onmousedown = function (event) {
	window.addEventListener('mousedown', function (event) {
		if (ImprovedTube.elements.player && ImprovedTube.elements.player.className.indexOf('ad-showing') === -1) {
			var path = event.composedPath();

			for (var i = 0, l = path.length; i < l; i++) {
				if (
					path[i].className &&
					path[i].className.indexOf &&
					(
						path[i].className.indexOf('html5-main-video') !== -1 ||
						path[i].className.indexOf('ytp-play-button') !== -1
					)
				) {
					ImprovedTube.allow_autoplay = true;
				}
			}
		}
	}, true);
};

ImprovedTube.getCookieValueByName = function (name) {
	var match = document.cookie.match(new RegExp('([; ]' + name + '|^' + name + ')([^\\s;]*)', 'g'));

	if (match) {
		var cookie = match[0];

		return cookie.replace(name + '=', '').replace(' ', '');
	} else
		return '';
};

ImprovedTube.getParam = function (query, name) {
	var params = query.split('&'),
		param = false;

	for (var i = 0; i < params.length; i++) {
		params[i] = params[i].split('=');

		if (params[i][0] == name) {
			param = params[i][1];
		}
	}

	if (param) {
		return param;
	} else {
		return false;
	}
};

ImprovedTube.getParams = function (query) {
	var params = query.split('&'),
		result = {};

	for (var i = 0, l = params.length; i < l; i++) {
		params[i] = params[i].split('=');

		result[params[i][0]] = params[i][1];
	}

	return result;
};

ImprovedTube.setCookie = function (name, value) {
	var date = new Date();

	date.setTime(date.getTime() + 3.154e+10);

	document.cookie = name + '=' + value + '; path=/; domain=.youtube.com; expires=' + date.toGMTString();
};

ImprovedTube.createPlayerButton = function (options) {
	var controls = this.elements.player_left_controls;

	if (controls) {
		var button = document.createElement('button');

		button.className = 'ytp-button it-player-button';

		button.dataset.title = options.title;

		button.addEventListener('mouseover', function () {
			var tooltip = document.createElement('div'),
				rect = this.getBoundingClientRect();

			tooltip.className = 'it-player-button--tooltip';

			tooltip.style.left = rect.left + rect.width / 2 + 'px';
			tooltip.style.top = rect.top - 8 + 'px';

			tooltip.textContent = this.dataset.title;

			function mouseleave() {
				tooltip.remove();

				this.removeEventListener('mouseleave', mouseleave);
			}

			this.addEventListener('mouseleave', mouseleave);

			document.body.appendChild(tooltip);
		});

		if (options.id) {
			if (this.elements.buttons[options.id]) {
				this.elements.buttons[options.id].remove();
			}

			button.id = options.id;

			this.elements.buttons[options.id] = button;
		}

		if (options.child) {
			button.appendChild(options.child);
		}

		button.style.opacity = options.opacity || '.5';

		if (options.onclick) {
			button.onclick = options.onclick;
		}

		controls.insertBefore(button, controls.childNodes[3]);
	}
};

ImprovedTube.empty = function (element) {
	for (var i = element.childNodes.length - 1; i > -1; i--) {
		element.childNodes[i].remove();
	}
};

ImprovedTube.isset = function (variable) {
	return !(typeof variable === 'undefined' || variable === null || variable === 'null');
};

ImprovedTube.stopPropagation = function (event) {
	event.stopPropagation();
};

ImprovedTube.showStatus = function (value) {
	if (!this.elements.status) {
		this.elements.status = document.createElement('div');

		this.elements.status.id = 'it-status';
	}

	if (typeof value === 'number') {
		value = value.toFixed(2);
	}

	this.elements.status.textContent = value;

	if (ImprovedTube.status_timer) {
		clearTimeout(ImprovedTube.status_timer);
	}

	ImprovedTube.status_timer = setTimeout(function () {
		ImprovedTube.elements.status.remove();
	}, 500);

	this.elements.player.appendChild(this.elements.status);
};
