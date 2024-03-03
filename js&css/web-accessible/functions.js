/*--------------------------------------------------------------
>>> FUNCTIONS
--------------------------------------------------------------*/
const DOM_filter = /^(SCRIPT|DOM-IF|DOM-REPEAT|svg|SPAN||#text|#comment|yt-icon-shape|iron-iconset-svg)$/;  
ImprovedTube.childHandler = function (node) { //console.log(node.nodeName);
if (DOM_filter.test(node.nodeName)) {return; } 	
ImprovedTube.ytElementsHandler(node);
 	var children = node.children;
	if (children) { let i = 0; for (const child of children) {ImprovedTube.childHandler(children[i]);
//console.log("node.nodeName:CHILD-"+i+":"+children[i].id+",class:"+children[i].className+","+children[i]+"("+children[i].nodeName+")");  			
	i++;}
	} 
};
ImprovedTube.ytElementsHandler = function (node) {
	var name = node.nodeName,
		id = node.id;

	if (name === 'A') {
		if (node.href) {
			this.channelDefaultTab(node);

			if (node.className.indexOf('ytd-thumbnail') !== -1) {
				this.blocklist('video', node);
			}
			if (node.href.match(/@|((channel|user|c)\/)([^/]+)/)) {
				this.blocklist('channel', node);
			}
		}
	}  /* else if (name === 'META') {               //<META> infos are not updated when clicking related videos...
		 if(node.getAttribute('name')) {
			//if(node.getAttribute('name') === 'title')			{ImprovedTube.title = node.content;}		//duplicate
			//if(node.getAttribute('name') === 'description')		{ImprovedTube.description = node.content;}	//duplicate
			//if node.getAttribute('name') === 'themeColor')			{ImprovedTube.themeColor = node.content;}	//might help our darkmode/themes
//Do we need any of these here before the player starts?
			//if(node.getAttribute('name') === 'keywords')			{ImprovedTube.keywords = node.content;}
			} else if (node.getAttribute('itemprop')) {
			//if(node.getAttribute('itemprop') === 'name')			{ImprovedTube.title = node.content;}	
			if(node.getAttribute('itemprop') === 'genre')			{ImprovedTube.category  = node.content;}
			//if(node.getAttribute('itemprop') === 'channelId')		{ImprovedTube.channelId = node.content;}
			//if(node.getAttribute('itemprop') === 'videoId')		{ImprovedTube.videoId = node.content;}
//The following infos will enable awesome, smart features.  Some of which everyone should use.
			//if(node.getAttribute('itemprop') === 'description')	{ImprovedTube.description = node.content;}
		    //if(node.getAttribute('itemprop') === 'duration')		{ImprovedTube.duration = node.content;}
			//if(node.getAttribute('itemprop') === 'interactionCount'){ImprovedTube.views = node.content;}
			//if(node.getAttribute('itemprop') === 'isFamilyFriendly'){ImprovedTube.isFamilyFriendly = node.content;}		
			//if(node.getAttribute('itemprop') === 'unlisted')		{ImprovedTube.unlisted = node.content;}
			//if(node.getAttribute('itemprop') === 'regionsAllowed'){ImprovedTube.regionsAllowed = node.content;}
			//if(node.getAttribute('itemprop') === 'paid')			{ImprovedTube.paid = node.content;}
			// if(node.getAttribute('itemprop') === 'datePublished'	){ImprovedTube.datePublished = node.content;}  
					//to use in the "how long ago"-feature, not to fail without API key?  just like the "day-of-week"-feature above	
			// if(node.getAttribute('itemprop') === 'uploadDate')	{ImprovedTube.uploadDate = node.content;}
		}
	}  */
		else if (name === 'YTD-TOGGLE-BUTTON-RENDERER' || name === 'YTD-PLAYLIST-LOOP-BUTTON-RENDERER') {
		if (
//can be precise   previously  node.parentComponent  & node.parentComponent.parentComponent
			node.closest("YTD-MENU-RENDERER") &&   
			node.closest("YTD-PLAYLIST-PANEL-RENDERER")  
		) { var index = Array.prototype.indexOf.call(node.parentNode.children, node);
			if (index === 0) {
				if (this.storage.playlist_reverse === true) {   
//can be precise:
					try{this.elements.playlist.actions = node.parentNode.parentNode.parentNode.parentNode;} 
					catch{try{this.elements.playlist.actions = node.parentNode.parentNode.parentNode;}
						catch{try{this.elements.playlist.actions = node.parentNode.parentNode;}
							catch{try{this.elements.playlist.actions = node.parentNode;}
								catch{try{this.elements.playlist.actions = node;}catch{}}
								}
							}	
						}	
					}
				this.playlistReverse();
			} else if (index === 1) {
				this.elements.playlist.shuffle_button = node;

				this.playlistShuffle();

				if (this.storage.playlist_reverse === true) {
//can be precise:
					try{this.elements.playlist.actions = node.parentNode.parentNode.parentNode.parentNode;}
					catch{try{this.elements.playlist.actions = node.parentNode.parentNode.parentNode;}
						catch{try{this.elements.playlist.actions = node.parentNode.parentNode;}
							catch{try{this.elements.playlist.actions = node.parentNode;}
								catch{try{this.elements.playlist.actions = node;}catch{}}
								}
							}	
						}	
					}
				this.playlistReverse();
			}
		}
		this.playlistPopupUpdate();
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
            this.hideDetailButton(node.querySelector('#flexible-item-buttons').children);
        }
	} else if (name === 'YTD-PLAYLIST-HEADER-RENDERER' || (name === 'YTD-MENU-RENDERER' && node.classList.contains('ytd-playlist-panel-renderer'))) {
		this.playlistPopupUpdate();
 	} else if (name === 'YTD-SUBSCRIBE-BUTTON-RENDERER') {
		if (node.className.indexOf('ytd-c4-tabbed-header-renderer') !== -1) {
			ImprovedTube.blocklist('channel', node);
		}

		ImprovedTube.elements.subscribe_button = node;
	} else if (id === 'show-hide-button') {
		this.elements.livechat.button = document.querySelector('[aria-label="Hide chat"]');
		// console.log(document.querySelector('[aria-label="Hide chat"]'))
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
			// if (this.storage.player_autoplay === false)  {   ImprovedTube.elements.player.stopVideo();  }
			ImprovedTube.elements.video = node.querySelector('video');
			ImprovedTube.elements.player_left_controls = node.querySelector('.ytp-left-controls');
			ImprovedTube.elements.player_right_controls = node.querySelector('.ytp-right-controls');
			ImprovedTube.elements.player_thumbnail = node.querySelector('.ytp-cued-thumbnail-overlay-image');
			ImprovedTube.elements.player_subtitles_button = node.querySelector('.ytp-subtitles-button');
			ImprovedTube.playerSize();
	   if ( typeof this.storage.ads !== 'undefined' && this.storage.ads !== "all_videos" ) {
			new MutationObserver(function (mutationList) {  
				for (var i = 0, l = mutationList.length; i < l; i++) { 
					var mutation = mutationList[i];

					if (mutation.type === 'childList') {
						for (var j = 0, k = mutation.addedNodes.length; j < k; j++) {
							var node = mutation.addedNodes[j];

							if (node instanceof Element
								&& node.querySelector('ytp-ad-player-overlay, .ytp-ad-text, .ytp-ad-overlay-close-container, ytd-button-renderer#dismiss-button, *[id^="ad-text"], *[id^="skip-button"], .ytp-ad-skip-button.ytp-button, .ytp-ad-skip-button-modern.ytp-button') !== null
								){ImprovedTube.playerAds(node);}  
						}
					}
					if (mutation.type === 'attributes' && mutation.attributeName === 'id' && mutation.target.querySelector('*[id^="ad-text"], *[id^="skip-button"], .ytp-ad-skip-button-modern.ytp-button',) )
						{ImprovedTube.playerAds(node);}
				}	
			}).observe(node, {
				// attributes: true,
				childList: true,
				subtree: true
			});   
			}

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
						this.updateStyles({
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
					width: NaN,     // ?? 
					height: NaN
				};
			};

			node.calculateNormalPlayerSize_ = node.calculateCurrentPlayerSize_;     // ?? 
		}
	}else if (document.documentElement.dataset.pageType === 'video'){
		if (id === 'description-inline-expander' || id === 'description-inner') {
				setTimeout(function () {
				ImprovedTube.expandDescription(node);
			}, 300);
		} else if (id === 'meta') {setTimeout(function () {ImprovedTube.expandDescription(node.querySelector('#more'));}, 200);
		} else if (id === 'below' ){setTimeout(function () {  }, 0);
		} else if (id === 'panels'){setTimeout(function () {
			ImprovedTube.transcript(node);
			ImprovedTube.chapters(node);}, 200);
		} /* else if (name === 'TP-YT-PAPER-BUTTON') {
        if ( (id === 'expand-sizer' || id === 'expand') && node.parentNode.id === 'description-inline-expander') {
            setTimeout(function () {
                ImprovedTube.expandDescription(node); 					console.log("EXPAND DESCRIPTION, OLD WAY")
            }, 750);
        }} */
    }

};

ImprovedTube.pageType = function () {
	if (/\/watch\?/.test(location.href)) {
		document.documentElement.dataset.pageType = 'video';
	} else if (location.pathname === '/') {
		document.documentElement.dataset.pageType = 'home';
	} else if (/\/subscriptions\?/.test(location.href)) {
		document.documentElement.dataset.pageType = 'subscriptions';
	} else if (/\/@|(\/(channel|user|c)\/)[^/]+(?!\/videos)/.test(location.href)) {
		document.documentElement.dataset.pageType = 'channel';
	} else {
		document.documentElement.dataset.pageType = 'other';
	}
};

ImprovedTube.pageOnFocus = function () {
	ImprovedTube.playerAutopauseWhenSwitchingTabs();
	ImprovedTube.playerAutoPip();
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
		ImprovedTube.playerSize(); 
		if( this.storage.player_always_repeat === true) {ImprovedTube.playerRepeat();};
		ImprovedTube.playerScreenshotButton();
		ImprovedTube.playerRepeatButton();
		ImprovedTube.playerRotateButton();
		ImprovedTube.playerPopupButton();
		ImprovedTube.playerFitToWinButton();
		ImprovedTube.playerHamburgerButton();
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
		ImprovedTube.playerPlaybackSpeed();
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
		if(this.storage.player_always_repeat === true) {ImprovedTube.playerRepeat();};
		ImprovedTube.playerScreenshotButton();
		ImprovedTube.playerRepeatButton();
		ImprovedTube.playerRotateButton();
		ImprovedTube.playerPopupButton();
		ImprovedTube.playerFitToWinButton();
		ImprovedTube.playerHamburgerButton();
		ImprovedTube.playerControls();
		ImprovedTube.expandDescription();
		setTimeout(function () { ImprovedTube.forcedTheaterMode();    }, 150);
		if (location.href.indexOf('/embed/') === -1) {  ImprovedTube.miniPlayer(); 	}  
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
	ImprovedTube.playerControls();
};

ImprovedTube.playerOnEnded = function (event) {
	ImprovedTube.playlistUpNextAutoplay(event);

	ImprovedTube.messages.send({
		action: 'analyzer',
		//adding "?" (not a fix)
		name: ImprovedTube.elements.yt_channel_name?.__data.tooltipText,
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
			ImprovedTube.ignore_autoplay_off = true;
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
					ImprovedTube.ignore_autoplay_off = true;
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
	var controls = options.position == "right" ? this.elements.player_right_controls : this.elements.player_left_controls;

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
ImprovedTube.empty = function (element) {for (var i = element.childNodes.length - 1; i > -1; i--) { element.childNodes[i].remove();	}};
ImprovedTube.isset = function (variable) { 	return !(typeof variable === 'undefined' || variable === null || variable === 'null');};
ImprovedTube.stopPropagation = function (event) { event.stopPropagation(); };
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

ImprovedTube.videoId =  function (url = document.URL) { return url.match(ImprovedTube.regex.video_id)[1] ||  url.searchParams.get('v') || movie_player.getVideoData().video_id }
ImprovedTube.videoTitle =  function () {  return document.title?.replace(/\s*-\s*YouTube$/, '') || movie_player.getVideoData().title || document.querySelector('#title > h1 > *')?.textContent  }


// Function to extract and store the number of subscribers
ImprovedTube.extractSubscriberCount = function (subscriberCountNode) {
    if (!subscriberCountNode){var subscriberCountNode = document.getElementById('owner-sub-count');}
	if (subscriberCountNode){
		// Extract the subscriber count and store it for further use
		var subscriberCountText = subscriberCountNode.textContent.trim();
		var subscriberCount = parseFloat(subscriberCountText.replace(/[^0-9.]/g, ''));
	
		if (subscriberCountText.includes('K')) {
			subscriberCount *= 1000;
		} else if (subscriberCountText.includes('M')) {
			subscriberCount *= 1000000;
		} 

		ImprovedTube.subscriberCount = subscriberCount;
	}
};

