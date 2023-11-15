/*------------------------------------------------------------------------------
AUTOPLAY
------------------------------------------------------------------------------*/
ImprovedTube.autoplay = function () {
    var video = ImprovedTube.elements.player;
    if (ImprovedTube.video_url !== location.href) {
        ImprovedTube.ignore_autoplay_off = false;
    }
    // if (allow autoplay is false) and  (no ads playing) and
	// ( there is a video and ( (it is not in a playlist and  auto play is off ) or ( playlist auto play is off and it is not in a playlist ) ) ) or (if we are in a channel and the channel trailer autoplay is off)  )
    if (ImprovedTube.ignore_autoplay_off === false && video.classList.contains('ad-showing') === false &&
        ( 
// quick fix #1703  thanks to @AirRaid#9957
            (/* document.documentElement.dataset.pageType === "video" */ location.href.indexOf('/watch?') !== -1 && ((location.href.indexOf('list=') === -1 && ImprovedTube.storage.player_autoplay === false) || (ImprovedTube.storage.playlist_autoplay === false && location.href.indexOf('list=') !== -1))) ||
            (/* document.documentElement.dataset.pageType === "channel" */ ImprovedTube.regex.channel.test(location.href) && ImprovedTube.storage.channel_trailer_autoplay === false)
        )
    ) {
        setTimeout(function () {
         video.pauseVideo();     //console.log("autoplayyOFFFF");
        });
    }
};
/*------------------------------------------------------------------------------
FORCED PLAY VIDEO FROM THE BEGINNING
------------------------------------------------------------------------------*/
ImprovedTube.forcedPlayVideoFromTheBeginning = function () {
	if (this.storage.forced_play_video_from_the_beginning === true && document.documentElement.dataset.pageType === 'video') {
		this.elements.player.seekTo(0);
	}
};

/*------------------------------------------------------------------------------
AUTOPAUSE WHEN SWITCHING TABS
------------------------------------------------------------------------------*/
ImprovedTube.playerAutopauseWhenSwitchingTabs = function () {
	var player = ImprovedTube.elements.player;

	if (this.storage.player_autopause_when_switching_tabs === true && player) {
		if (this.focus === false) {
			this.played_before_blur = player.getPlayerState() === 1;

			player.pauseVideo();
		} else if (this.focus === true && this.played_before_blur === true) {
			player.playVideo();
		}
	}
};
/*------------------------------------------------------------------------------
AUTO PIP WHEN SWITCHING TABS
------------------------------------------------------------------------------*/
ImprovedTube.playerAutoPip = function () {
	const video = ImprovedTube.elements.video;

	if (this.storage.player_autoPip === true && video) {
		(async () => {
			try {
				await video.requestPictureInPicture();
			  } catch (error) {
				console.error('Failed to enter Picture-in-Picture mode', error);
			  }
		  })();
		}
};
/*------------------------------------------------------------------------------
FORCED PLAYBACK SPEED
------------------------------------------------------------------------------*/
ImprovedTube.playerPlaybackSpeed = function () {
	if (this.storage.player_forced_playback_speed === true) {
		var player = this.elements.player,
		video = player.querySelector('video'),
		option = this.storage.player_playback_speed;
		if (this.isset(option) === false) {	option = 1; }
	
		if (player.getVideoData().isLive === false
			&& this.storage.player_force_speed_on_music !== true 
			|| this.storage.player_dont_speed_education === true) {
	// Data: 
		let category = document.querySelector('meta[itemprop=genre]')?.content || false;
			if (this.storage.player_dont_speed_education === true && category === 'Education') {return;} 
			if (this.storage.player_force_speed_on_music === true) {player.setPlaybackRate(Number(option));	video.playbackRate = Number(option); return;} 

		let titleAndKeywords = document.getElementsByTagName('meta')?.title?.content + " " + document.getElementsByTagName('meta')?.keywords?.content  || false;
		let musicRegexMatch = /official (music )?video|lyrics|cover[\)\]]|[\(\[]cover|cover version|soundtrack|unplugged|lo-fi|lofi|a(lla)? cappella|remix| feat\.|(piano|guitar|jazz|ukulele|violin|reggae) (version|cover)|karaok|(sing|play)[- ]?along|卡拉OK|卡拉OK|الكاريوكي|караоке|カラオケ|노래방/i.test(titleAndKeywords);
		let notMusicRegexMatch = /do[ck]u|interv[iyj]|back[- ]?stage|インタビュー|entrevista|面试|面試|회견|wawancara|مقابلة|интервью|entretien|기록한 것|记录|記錄|ドキュメンタリ|وثائقي|документальный/i.test(titleAndKeywords);						     // (Tags/keywords shouldnt lie & very few songs titles might have these words)  	
		let duration = document.querySelector('meta[itemprop=duration]')?.content || false; // Example:  PT1H20M30S
			if(!duration) { itemprops = document.getElementsByTagName('meta'); 
					for (var i = 0; i < itemprops.length; i++) {
						if (itemprops[i].getAttribute('itemprop') === 'duration') {
						let duration = itemprops[i].getAttribute('content') || false; break;}}}
		if (duration) {
				function parseDuration(duration) {	const [_, h = 0, m = 0, s = 0] = duration.match(/PT(?:(\d+)?H)?(?:(\d+)?M)?(\d+)?S?/).map(part => parseInt(part) || 0); 
				return h * 3600 + m * 60 + s; } 
		var durationInSeconds = parseDuration(duration); 
				function testSongDuration(s) { 
				if (135 <= s && s <= 260) {return 'veryCommon';}
				if (105 <= s && s <= 420) {return 'common';}
				if (420 <= s && s <= 720) {return 'long';}	
				if  (45 <= s && s <= 105) {return 'short';}	  
				let musicSectionLength = document.querySelector('div#items[class*="music-section"]')?.children?.length;
				if (musicSectionLength && (85 <= s / musicSectionLength && s / musicSectionLength<= 355)) {return 'multiple';}
			}				
		var songDurationType = testSongDuration(durationInSeconds); 
		// console.log(category + "//" +  titleAndKeywords + "//" +  musicRegexMatch + "//" + notMusicRegexMatch + "//" + duration + "//" +  songDurationType);
		}	
		
 // check if the video is PROBABLY MUSIC:
	if  ( 		( category === 'Music' && (!notMusicRegexMatch || songDurationType === 'veryCommon'))
			||  ( musicRegexMatch && !notMusicRegexMatch && typeof songDurationType !== 'undefined' 
						|| (/album|Álbum|专辑|專輯|एलबम|البوم|アルバム|альбом|앨범/i.test(titleAndKeywords) 
							&& 1150 <= durationInSeconds && durationInSeconds <= 5000) )
			||	( category === 'Music' && musicRegexMatch && typeof songDurationType !== 'undefined'  
						|| (/album|Álbum|专辑|專輯|एलबम|البوم|アルバム|альбом|앨범/i.test(titleAndKeywords) 
							&& 1150 <= durationInSeconds && durationInSeconds <= 5000) )
		  //	||  location.href.indexOf('music.') !== -1  // (=currently we are only running on www.youtube.com anyways)
		)	{ } //music player.setPlaybackRate(1); video.playbackRate = 1;				 				
			else { player.setPlaybackRate(Number(option));	video.playbackRate = Number(option);	//  #1729 question2		 
				// Now this video might rarely be music 
				// - however we can make extra-sure after waiting for the video descripion to load... (#1539)
					var tries = 0; 	var intervalMs = 150;  	if (location.href.indexOf('/watch?') !== -1) {var maxTries = 10;} else {var maxTries = 1;}  	
														// ...except when it is an embedded player?
		
					var waitForDescription = setInterval(() => { 	
					if ((++tries >= maxTries) || document.querySelector('div#description')) { 
					if (document.querySelector('h3#title[class*="music-section"]')   // indicates buyable/registered music
						&& typeof testSongDuration(parseDuration(document.querySelector('meta[itemprop=duration]')?.content)) !== 'undefined' ) // resonable duration
							{player.setPlaybackRate(1); video.playbackRate = 1; } clearInterval(waitForDescription); } 			
					intervalMs *= 1.4;				
					}, intervalMs);	   						
				}
		}	else { player.setPlaybackRate(Number(option));	video.playbackRate = Number(option);} // #1729 question2	 
	} 
};
// hi @raszpl  // ImprovedTube.playerForceSpeedOnMusic = function () {  ImprovedTube.playerPlaybackSpeed(); };  
/*------------------------------------------------------------------------------
SUBTITLES
------------------------------------------------------------------------------*/
ImprovedTube.subtitles = function () {
	if (this.storage.player_subtitles === true) {
		var player = this.elements.player;

		if (player && player.toggleSubtitlesOn) {
			player.toggleSubtitlesOn();
		}
	}
};
/*------------------------------------------------------------------------------
SUBTITLES LANGUAGE
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesLanguage = function () {
    var option = this.storage.subtitles_language;
    if (this.isset(option) && option !== 'default') {
        var player = this.elements.player,
            button = this.elements.player_subtitles_button;

        if (player && player.getOption && button && button.getAttribute('aria-pressed') === 'true') {
            var tracklist = this.elements.player.getOption('captions', 'tracklist', {
                includeAsr: true
            });

            var matchTrack = false;
            for (var i =0, l = tracklist.length; i<l; i++){
                if (tracklist[i].languageCode.includes(option)) {
                    if( false === tracklist[i].vss_id.includes("a.") || true === this.storage.auto_generate){
                        this.elements.player.setOption('captions', 'track', tracklist[i]);
                        matchTrack = true; break;
                    }
                }
            }
         //   if (!matchTrack){  player.toggleSubtitles();  }
        }
    }
};
/*------------------------------------------------------------------------------
SUBTITLES FONT FAMILY
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesFontFamily = function () {
	var option = this.storage.subtitles_font_family;

	if (this.isset(option)) {
		var player = this.elements.player,
			button = this.elements.player_subtitles_button;

		if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
			var settings = player.getSubtitlesUserSettings();

			if (settings) {
				settings.fontFamily = Number(option);

				player.updateSubtitlesUserSettings(settings);
			}
		}
	}
};
/*------------------------------------------------------------------------------
SUBTITLES FONT COLOR
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesFontColor = function () {
	var option = this.storage.subtitles_font_color;

	if (this.isset(option)) {
		var player = this.elements.player,
			button = this.elements.player_subtitles_button;

		if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
			var settings = player.getSubtitlesUserSettings();

			if (settings) {
				settings.color = option;

				player.updateSubtitlesUserSettings(settings);
			}
		}
	}
};
/*------------------------------------------------------------------------------
SUBTITLES FONT SIZE
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesFontSize = function () {
	var option = this.storage.subtitles_font_size;

	if (this.isset(option)) {
		var player = this.elements.player,
			button = this.elements.player_subtitles_button;

		if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
			var settings = player.getSubtitlesUserSettings();

			if (settings) {
				settings.fontSizeIncrement = Number(option);

				player.updateSubtitlesUserSettings(settings);
			}
		}
	}
};
/*------------------------------------------------------------------------------
SUBTITLES BACKGROUND COLOR
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesBackgroundColor = function () {
	var option = this.storage.subtitles_background_color;

	if (this.isset(option)) {
		var player = this.elements.player,
			button = this.elements.player_subtitles_button;

		if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
			var settings = player.getSubtitlesUserSettings();

			if (settings) {
				settings.background = option;

				player.updateSubtitlesUserSettings(settings);
			}
		}
	}
};
/*------------------------------------------------------------------------------
SUBTITLES BACKGROUND OPACITY
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesBackgroundOpacity = function () {
	var option = this.storage.subtitles_background_opacity;

	if (this.isset(option)) {
		var player = this.elements.player,
			button = this.elements.player_subtitles_button;

		if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
			var settings = player.getSubtitlesUserSettings();

			if (settings) {
				settings.backgroundOpacity = option / 100;

				player.updateSubtitlesUserSettings(settings);
			}
		}
	}
};
/*------------------------------------------------------------------------------
SUBTITLES WINDOW COLOR
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesWindowColor = function () {
	var option = this.storage.subtitles_window_color;

	if (this.isset(option)) {
		var player = this.elements.player,
			button = this.elements.player_subtitles_button;

		if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
			var settings = player.getSubtitlesUserSettings();

			if (settings) {
				settings.windowColor = option;

				player.updateSubtitlesUserSettings(settings);
			}
		}
	}
};
/*------------------------------------------------------------------------------
SUBTITLES WINDOW OPACITY
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesWindowOpacity = function () {
	var option = this.storage.subtitles_window_opacity;

	if (this.isset(option)) {
		var player = this.elements.player,
			button = this.elements.player_subtitles_button;

		if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
			var settings = player.getSubtitlesUserSettings();

			if (settings) {
				settings.windowOpacity = Number(option) / 100;

				player.updateSubtitlesUserSettings(settings);
			}
		}
	}
};
/*------------------------------------------------------------------------------
SUBTITLES CHARACTER EDGE STYLE
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesCharacterEdgeStyle = function () {
	var option = this.storage.subtitles_character_edge_style;

	if (this.isset(option)) {
		var player = this.elements.player,
			button = this.elements.player_subtitles_button;

		if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
			var settings = player.getSubtitlesUserSettings();

			if (settings) {
				settings.charEdgeStyle = Number(option);

				player.updateSubtitlesUserSettings(settings);
			}
		}
	}
};
/*------------------------------------------------------------------------------
SUBTITLES FONT OPACITY
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesFontOpacity = function () {
	var option = this.storage.subtitles_font_opacity;

	if (this.isset(option)) {
		var player = this.elements.player,
			button = this.elements.player_subtitles_button;

		if (player && player.getSubtitlesUserSettings && button && button.getAttribute('aria-pressed') === 'true') {
			var settings = player.getSubtitlesUserSettings();

			if (settings) {
				settings.textOpacity = option / 100;

				player.updateSubtitlesUserSettings(settings);
			}
		}
	}
};
/*------------------------------------------------------------------------------
UP NEXT AUTOPLAY
------------------------------------------------------------------------------*/
ImprovedTube.upNextAutoplay = function () {
	var option = this.storage.up_next_autoplay;

	if (this.isset(option)) {
		var toggle = document.querySelector('.ytp-autonav-toggle-button');

		if (toggle) {
			if (option !== (toggle.getAttribute('aria-checked') === 'true')) {
				toggle.click();
			}
		}
	}
};
/*------------------------------------------------------------------------------
ADS
------------------------------------------------------------------------------*/
ImprovedTube.playerAds = function (parent) {
	let button = parent.querySelector('.ytp-ad-skip-button.ytp-button') || parent;
	// TODO: Replace this with centralized video element pointer
	let video = document.querySelector('.video-stream.html5-main-video') || false;
	function skipAd() {
		if (video) video.currentTime = video.duration;
		if (button) button.click(); 
	}	
	if (this.storage.ads === 'block_all') {
		skipAd();
	} else if (this.storage.ads === 'subscribed_channels') {
		if (!parent.querySelector('#meta paper-button[subscribed]')) {
			skipAd();
		}
	} else if (this.storage.ads === 'block_music') {
		if (ImprovedTube.elements.category === 'music') {
			skipAd();
		}
	}
};
/*------------------------------------------------------------------------------
AUTO FULLSCREEN
------------------------------------------------------------------------------*/
ImprovedTube.playerAutofullscreen = function () {
	if (
		this.storage.player_autofullscreen === true &&
		document.documentElement.dataset.pageType === 'video' &&
		!document.fullscreenElement
	) {
		this.elements.player.toggleFullscreen();
	}
};
/*------------------------------------------------------------------------------
QUALITY
------------------------------------------------------------------------------*/
ImprovedTube.playerQuality = function () {
	function closest (num, arr) {
                let curr = arr[0];
                let diff = Math.abs (num - curr);
                for (let val = 0; val < arr.length; val++) {
                    let newdiff = Math.abs (num - arr[val]);
                    if (newdiff < diff) {
                        diff = newdiff;
                        curr = arr[val];
                    }
                }
                return curr;
            };

	var player = this.elements.player,
		quality = this.storage.player_quality;

	if (player && player.getAvailableQualityLevels && !player.dataset.defaultQuality) {
		var available_quality_levels = player.getAvailableQualityLevels();

		if (quality && quality !== 'auto') {
			if (available_quality_levels.includes(quality) === false) {
				let label = ['tiny', 'small', 'medium', 'large', 'hd720', 'hd1080', 'hd1440', 'hd2160', 'hd2880', 'highres'];
				let resolution = ['144', '240', '360', '480', '720', '1080', '1440', '2160', '2880', '4320'];
				let availableresolutions = available_quality_levels.reduce(function (array, elem) {
					array.push(resolution[label.indexOf(elem)]); return array;
					}, []);

				quality = closest (resolution[label.indexOf(quality)], availableresolutions);
				quality = label[resolution.indexOf(quality)];
			}

			player.setPlaybackQualityRange(quality);
			player.setPlaybackQuality(quality);
			player.dataset.defaultQuality = quality;
		}
	}
};
/*------------------------------------------------------------------------------
FORCED VOLUME
------------------------------------------------------------------------------*/
ImprovedTube.playerVolume = function () {
	if (this.storage.player_forced_volume === true) {
		var volume = this.storage.player_volume;

		if (!this.isset(volume)) {
			volume = 100;
		} else {
			volume = Number(volume);
		}

		this.elements.player.setVolume(volume);
	}
};
/*------------------------------------------------------------------------------
LOUDNESS NORMALIZATION
------------------------------------------------------------------------------*/
ImprovedTube.onvolumechange = function (event) {
	if (document.querySelector('.ytp-volume-panel') && ImprovedTube.storage.player_loudness_normalization === false) {
		var volume = Number(document.querySelector('.ytp-volume-panel').getAttribute('aria-valuenow'));

		this.volume = volume / 100;
	}
};

ImprovedTube.playerLoudnessNormalization = function () {
	var video = this.elements.video;

	if (video) {
		video.removeEventListener('volumechange', this.onvolumechange);
		video.addEventListener('volumechange', this.onvolumechange);
	}

	if (this.storage.player_loudness_normalization === false) {
		try {
			var local_storage = localStorage['yt-player-volume'];

			if (this.isset(Number(this.storage.player_volume)) && this.storage.player_forced_volume === true) {

			} else if (local_storage) {
				local_storage = JSON.parse(JSON.parse(local_storage).data);

				local_storage = Number(local_storage.volume);

				video.volume = local_storage / 100;
			} else {
				video.volume = 100;
			}
		} catch (err) {}
	}
};
/*------------------------------------------------------------------------------
SCREENSHOT
------------------------------------------------------------------------------*/
ImprovedTube.screenshot = function () {
	var video = ImprovedTube.elements.video,
		style = document.createElement('style'),
		cvs = document.createElement('canvas'),
		ctx = cvs.getContext('2d');

	style.textContent = 'video{width:' + video.videoWidth + 'px !important;height:' + video.videoHeight + 'px !important}';

	cvs.width = video.videoWidth;
	cvs.height = video.videoHeight;

	document.body.appendChild(style);

	setTimeout(function () {
		ctx.drawImage(video, 0, 0, cvs.width, cvs.height);

		cvs.toBlob(function (blob) {
			if (ImprovedTube.storage.player_screenshot_save_as !== 'clipboard') {
				var a = document.createElement('a');
				a.href = URL.createObjectURL(blob); console.log("screeeeeeenshot tada!");

				a.download = location.href.match(/(\?|\&)v=[^&]+/)[0].substr(3) || location.href.match(/()embed\/[^&]+/)[0].substr(3) || improvedTube.videoID || location.href.match + '-' + new Date(ImprovedTube.elements.player.getCurrentTime() * 1000).toISOString().substr(11, 8).replace(/:/g, '-') + '.png';

				a.click();
			} else {
				navigator.clipboard.write([
					new ClipboardItem({
						'image/png': blob
					})
				]);
			}
		});

		style.remove();
	});
};

ImprovedTube.playerScreenshotButton = function () {
	if (this.storage.player_screenshot_button === true) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z');

		svg.appendChild(path);

		this.createPlayerButton({
			id: 'it-screenshot-button',
			child: svg,
			opacity: 0.64,
			onclick: this.screenshot,
			title: 'Screenshot'
		});
	} else if (this.elements.buttons['it-screenshot-styles']) {
		this.elements.buttons['it-screenshot-styles'].remove();
	}
};
/*------------------------------------------------------------------------------
REPEAT
------------------------------------------------------------------------------*/
ImprovedTube.playerRepeatButton = function (node) {
	if (this.storage.player_repeat_button === true) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z');

		svg.appendChild(path);

		this.createPlayerButton({
			id: 'it-repeat-button',
			child: svg,
			onclick: function () {
				var video = ImprovedTube.elements.video;

				if (video.hasAttribute('loop')) {
					video.removeAttribute('loop');

					this.style.opacity = '.5';
				} else if (!/ad-showing/.test(ImprovedTube.elements.player.className)) {
					video.setAttribute('loop', '');

					this.style.opacity = '1';
				}
			},
			title: 'Repeat'
		});

		if (this.storage.player_always_repeat === true) {
			setTimeout(function () {
				ImprovedTube.elements.video.setAttribute('loop', '');

				ImprovedTube.elements.buttons['it-repeat-styles'].style.opacity = '1';
			}, 100);
		}
	} else if (this.elements.buttons['it-repeat-styles']) {
		this.elements.buttons['it-repeat-styles'].remove();
	}
};
/*------------------------------------------------------------------------------
ROTATE
------------------------------------------------------------------------------*/
ImprovedTube.playerRotateButton = function () {
	if (this.storage.player_rotate_button === true) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M15.55 5.55L11 1v3.07a8 8 0 0 0 0 15.86v-2.02a6 6 0 0 1 0-11.82V10l4.55-4.45zM19.93 11a7.9 7.9 0 0 0-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02a7.92 7.92 0 0 0 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41A7.9 7.9 0 0 0 19.93 13h-2.02a5.9 5.9 0 0 1-1.02 2.48z');

		svg.appendChild(path);

		this.createPlayerButton({
			id: 'it-rotate-button',
			child: svg,
			opacity: 0.85,
			onclick: function () {
				var player = ImprovedTube.elements.player,
					video = ImprovedTube.elements.video,
					rotate = Number(document.body.dataset.itRotate) || 0,
					transform = '';

				rotate += 90;

				if (rotate === 360) {
					rotate = 0;
				}

				document.body.dataset.itRotate = rotate;

				transform += 'rotate(' + rotate + 'deg)';

				if (rotate == 90 || rotate == 270) {
					var is_vertical_video = video.videoHeight > video.videoWidth;

					transform += ' scale(' + (is_vertical_video ? player.clientWidth : player.clientHeight) / (is_vertical_video ? player.clientHeight : player.clientWidth) + ')';
				}

				if (!ImprovedTube.elements.buttons['it-rotate-styles']) {
					var style = document.createElement('style');

					ImprovedTube.elements.buttons['it-rotate-styles'] = style;

					document.body.appendChild(style);
				}

				ImprovedTube.elements.buttons['it-rotate-styles'].textContent = 'video{transform:' + transform + '}';
			},
			title: 'Rotate'
		});
	} else if (this.elements.buttons['it-rotate-button']) {
		this.elements.buttons['it-rotate-button'].remove();
		this.elements.buttons['it-rotate-styles'].remove();
	}
};

/*------------------------------------------------------------------------------
FIT-TO-WIN BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.playerFitToWinButton = function () {
	if (this.storage.player_fit_to_win_button === true && (/watch\?/.test(location.href))) {
		const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="ftw-icon">
		<path d="M21 3 9 15"/><path d="M12 3H3v18h18v-9"/><path d="M16 3h5v5"/><path d="M14 15H9v-5"/></svg>`;

    let tempContainer = document.createElement("div");
    tempContainer.innerHTML = svgMarkup;
    const svg = tempContainer.firstChild;
		this.createPlayerButton({
			id: 'it-fit-to-win-player-button',
			child: svg,
			opacity: 0.85,
			position: "right",
			onclick: function () {
				let previousSize = ImprovedTube.storage.player_size === "fit_to_window" ? "do_not_change" : (ImprovedTube.storage.player_size ?? "do_not_change");
				let isFTW = document.querySelector("html").getAttribute("it-player-size") === "fit_to_window"
				if (isFTW) {
					document.querySelector("html").setAttribute("it-player-size", previousSize);
				} else {
					document.querySelector("html").setAttribute("it-player-size", "fit_to_window");
				}
				window.dispatchEvent(new Event("resize"));
			},
			title: 'Fit To Window'
		});
	} else if (!this.storage.player_fit_to_win_button && this.elements.buttons['it-fit-to-win-player-button']) {
		this.elements.buttons['it-fit-to-win-player-button'].remove();
		document.querySelector("html").setAttribute("it-player-size", ImprovedTube.storage.player_size ?? "do_not_change");
	}
};
/*------------------------------------------------------------------------------
POPUP PLAYER
------------------------------------------------------------------------------*/
ImprovedTube.playerPopupButton = function () {
	if (this.storage.player_popup_button === true) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z');

		svg.appendChild(path);

		this.createPlayerButton({
			id: 'it-popup-player-button',
			child: svg,
			opacity: 0.8,
			onclick: function () {
				var player = ImprovedTube.elements.player;

				player.pauseVideo();

				window.open('//www.youtube.com/embed/' + location.href.match(/watch\?v=([A-Za-z0-9\-\_]+)/g)[0].slice(8) + '?start=' + parseInt(player.getCurrentTime()) + '&autoplay=' + (ImprovedTube.storage.player_autoplay == false ? '0' : '1'), '_blank', 'directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=' + player.offsetWidth + ',height=' + player.offsetHeight);
			},
			title: 'Popup'
		});
	} else if (this.elements.buttons['it-popup-player-button']) {
		this.elements.buttons['it-popup-player-button'].remove();
	}
};
/*------------------------------------------------------------------------------
Force SDR
------------------------------------------------------------------------------*/
ImprovedTube.playerSDR = function () {
	if (this.storage.player_SDR === true) {
		Object.defineProperty(window.screen, 'pixelDepth', {
			enumerable: true,
			configurable: true,
			value: 24
		});
	}
};
/*------------------------------------------------------------------------------
Hide controls
------------------------------------------------------------------------------*/
ImprovedTube.playerControls = function (pause=false) {
    var player = this.elements.player;   if (player) {
		let hide = this.storage.player_hide_controls;
        if (hide === 'always') {
            player.hideControls();
        } else if(hide === 'off') {
            player.showControls();
        } else if(hide === 'when_paused') {
		   if(this.elements.video.paused){
	       player.hideControls( );

	  ImprovedTube.elements.player.parentNode.addEventListener('mouseenter', function () {
	  player.showControls();});
	  ImprovedTube.elements.player.parentNode.addEventListener('mouseleave', function () {
      player.hideControls( );});


		ImprovedTube.elements.player.parentNode.onmousemove = (function() {
			let onmousestop = function() {
				player.hideControls( );
			}, thread;

			return function() {
			  player.showControls();
			  clearTimeout(thread);
			  thread = setTimeout(onmousestop, 1000);
			};
		  })();
	   }} else { player.showControls();  }
}
};
/*------------------------------------------------------------------------------
CUSTOM MINI-PLAYER
------------------------------------------------------------------------------*/
ImprovedTube.mini_player__setSize = function (width, height, keep_ar, keep_area) {
    if (keep_ar) {
        const aspect_ratio = ImprovedTube.elements.video.style.width.replace('px', '') / ImprovedTube.elements.video.style.height.replace('px', '');
	    if (keep_area) {
	        height = Math.sqrt((width * height) / aspect_ratio);
	        width = height * aspect_ratio;
	    } else {
	        height = width / aspect_ratio;
	    }
    }

    ImprovedTube.elements.player.style.width = width + 'px';
    ImprovedTube.elements.player.style.height = height + 'px';
};

ImprovedTube.miniPlayer_scroll = function () {
	if (window.scrollY >= 256 && ImprovedTube.mini_player__mode === false && ImprovedTube.elements.player.classList.contains('ytp-player-minimized') === false) {
		ImprovedTube.mini_player__mode = true;

		ImprovedTube.mini_player__original_width = ImprovedTube.elements.player.offsetWidth;
		ImprovedTube.mini_player__original_height = ImprovedTube.elements.player.offsetHeight;

		ImprovedTube.elements.player.classList.add('it-mini-player');

		ImprovedTube.mini_player__x = Math.max(0, Math.min(ImprovedTube.mini_player__x, document.body.offsetWidth - ImprovedTube.mini_player__width));
		ImprovedTube.mini_player__y = Math.max(0, Math.min(ImprovedTube.mini_player__y, window.innerHeight - ImprovedTube.mini_player__height));

		ImprovedTube.mini_player__cursor = '';
		document.documentElement.removeAttribute('it-mini-player-cursor');

		ImprovedTube.elements.player.style.transform = 'translate(' + ImprovedTube.mini_player__x + 'px, ' + ImprovedTube.mini_player__y + 'px)';

		ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__width, ImprovedTube.mini_player__height, true, true);

		window.addEventListener('mousedown', ImprovedTube.miniPlayer_mouseDown);
		window.addEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);

		window.dispatchEvent(new Event('resize'));
	} else if (window.scrollY < 256 && ImprovedTube.mini_player__mode === true || ImprovedTube.elements.player.classList.contains('ytp-player-minimized') === true) {
		ImprovedTube.mini_player__mode = false;
		ImprovedTube.elements.player.classList.remove('it-mini-player');
		ImprovedTube.mini_player__move = false;
		ImprovedTube.elements.player.style.transform = 'translate(' + 0 + 'px, ' + 0 + 'px)';
		ImprovedTube.elements.player.style.width = '';
		ImprovedTube.elements.player.style.height = '';

		ImprovedTube.mini_player__cursor = '';
		document.documentElement.removeAttribute('it-mini-player-cursor');

		window.removeEventListener('mousedown', ImprovedTube.miniPlayer_mouseDown);
		window.removeEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);

		window.dispatchEvent(new Event('resize'));
	}
};

ImprovedTube.miniPlayer_mouseDown = function (event) {
	if (event.button !== 0) {
		return false;
	}

	if (ImprovedTube.miniPlayer_resize() === true) {
		return false;
	}

	var is_player = false,
		path = event.composedPath();

	for (var i = 0, l = path.length; i < l; i++) {
		if ((path[i].classList && path[i].classList.contains('it-mini-player')) === true) {
			is_player = true;
		}
	}

	if (is_player === false) {
		return false;
	}

	event.preventDefault();

	var bcr = ImprovedTube.elements.player.getBoundingClientRect();

	ImprovedTube.miniPlayer_mouseDown_x = event.clientX;
	ImprovedTube.miniPlayer_mouseDown_y = event.clientY;
	ImprovedTube.mini_player__width = bcr.width;
	ImprovedTube.mini_player__height = bcr.height;

	ImprovedTube.mini_player__player_offset_x = event.clientX - bcr.x;
	ImprovedTube.mini_player__player_offset_y = event.clientY - bcr.y;

	ImprovedTube.mini_player__max_x = document.body.offsetWidth - ImprovedTube.mini_player__width;
	ImprovedTube.mini_player__max_y = window.innerHeight - ImprovedTube.mini_player__height;

	window.addEventListener('mouseup', ImprovedTube.miniPlayer_mouseUp);
	window.addEventListener('mousemove', ImprovedTube.miniPlayer_mouseMove);
};

ImprovedTube.miniPlayer_mouseUp = function () {
	var strg = JSON.parse(localStorage.getItem('improvedtube-mini-player')) || {};

	strg.x = ImprovedTube.mini_player__x;
	strg.y = ImprovedTube.mini_player__y;

	localStorage.setItem('improvedtube-mini-player', JSON.stringify(strg));

	window.removeEventListener('mouseup', ImprovedTube.miniPlayer_mouseUp);
	window.removeEventListener('mousemove', ImprovedTube.miniPlayer_mouseMove);

	ImprovedTube.mini_player__move = false;

	setTimeout(function () {
		window.removeEventListener('click', ImprovedTube.miniPlayer_click, true);
	});
};

ImprovedTube.miniPlayer_click = function (event) {
	event.stopPropagation();
	event.preventDefault();
};

ImprovedTube.miniPlayer_mouseMove = function (event) {
	if (
		event.clientX < ImprovedTube.miniPlayer_mouseDown_x - 5 ||
		event.clientY < ImprovedTube.miniPlayer_mouseDown_y - 5 ||
		event.clientX > ImprovedTube.miniPlayer_mouseDown_x + 5 ||
		event.clientY > ImprovedTube.miniPlayer_mouseDown_y + 5
	) {
		var x = event.clientX - ImprovedTube.mini_player__player_offset_x,
			y = event.clientY - ImprovedTube.mini_player__player_offset_y;

		if (ImprovedTube.mini_player__move === false) {
			ImprovedTube.mini_player__move = true;

			window.addEventListener('click', ImprovedTube.miniPlayer_click, true);
		}

		if (x < 0) {
			x = 0;
		}

		if (y < 0) {
			y = 0;
		}

		if (x > ImprovedTube.mini_player__max_x) {
			x = ImprovedTube.mini_player__max_x;
		}

		if (y > ImprovedTube.mini_player__max_y) {
			y = ImprovedTube.mini_player__max_y;
		}

		ImprovedTube.mini_player__x = x;
		ImprovedTube.mini_player__y = y;

		ImprovedTube.elements.player.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
	}
};

ImprovedTube.miniPlayer_cursorUpdate = function (event) {
	var x = event.clientX,
		y = event.clientY,
		c = ImprovedTube.mini_player__cursor;

	if (
		x >= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - ImprovedTube.miniPlayer_resize_offset &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
		y >= ImprovedTube.mini_player__y &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.miniPlayer_resize_offset
	) {
		c = 'ne-resize';
	} else if (
		x >= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - ImprovedTube.miniPlayer_resize_offset &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
		y >= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - ImprovedTube.miniPlayer_resize_offset &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
	) {
		c = 'se-resize';
	} else if (
		x >= ImprovedTube.mini_player__x &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.miniPlayer_resize_offset &&
		y >= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - ImprovedTube.miniPlayer_resize_offset &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
	) {
		c = 'sw-resize';
	} else if (
		x >= ImprovedTube.mini_player__x &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.miniPlayer_resize_offset &&
		y >= ImprovedTube.mini_player__y &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.miniPlayer_resize_offset
	) {
		c = 'nw-resize';
	} else if (
		x >= ImprovedTube.mini_player__x &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
		y >= ImprovedTube.mini_player__y &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.miniPlayer_resize_offset
	) {
		c = 'n-resize';
	} else if (
		x >= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - ImprovedTube.miniPlayer_resize_offset &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
		y >= ImprovedTube.mini_player__y &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
	) {
		c = 'e-resize';
	} else if (
		x >= ImprovedTube.mini_player__x &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
		y >= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - ImprovedTube.miniPlayer_resize_offset &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
	) {
		c = 's-resize';
	} else if (
		x >= ImprovedTube.mini_player__x &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.miniPlayer_resize_offset &&
		y >= ImprovedTube.mini_player__y &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
	) {
		c = 'w-resize';
	} else {
		c = '';
	}

	if (ImprovedTube.mini_player__cursor !== c) {
		ImprovedTube.mini_player__cursor = c;

		document.documentElement.setAttribute('it-mini-player-cursor', ImprovedTube.mini_player__cursor);
	}
};

ImprovedTube.miniPlayer_resize = function (event) {
	if (ImprovedTube.mini_player__cursor !== '') {
		window.removeEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);
		window.addEventListener('mouseup', ImprovedTube.miniPlayer_resizeMouseUp);
		window.addEventListener('mousemove', ImprovedTube.miniPlayer_resizeMouseMove);

		return true;
	}
};

ImprovedTube.miniPlayer_resizeMouseMove = function (event) {
	if (ImprovedTube.mini_player__cursor === 'n-resize') {
		ImprovedTube.elements.player.style.transform = 'translate(' + ImprovedTube.mini_player__x + 'px, ' + event.clientY + 'px)';
		ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__width, ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - event.clientY);
	} else if (ImprovedTube.mini_player__cursor === 'e-resize') {
		ImprovedTube.mini_player__setSize(event.clientX - ImprovedTube.mini_player__x, ImprovedTube.mini_player__height);
	} else if (ImprovedTube.mini_player__cursor === 's-resize') {
		ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__width, event.clientY - ImprovedTube.mini_player__y);
	} else if (ImprovedTube.mini_player__cursor === 'w-resize') {
		ImprovedTube.elements.player.style.transform = 'translate(' + event.clientX + 'px, ' + ImprovedTube.mini_player__y + 'px)';
		ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - event.clientX, ImprovedTube.mini_player__height);
	} else if (ImprovedTube.mini_player__cursor === 'ne-resize') {
		ImprovedTube.elements.player.style.transform = 'translate(' + ImprovedTube.mini_player__x + 'px, ' + event.clientY + 'px)';
		ImprovedTube.mini_player__setSize(event.clientX - ImprovedTube.mini_player__x, ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - event.clientY, true);
	} else if (ImprovedTube.mini_player__cursor === 'se-resize') {
		ImprovedTube.mini_player__setSize(event.clientX - ImprovedTube.mini_player__x, event.clientY - ImprovedTube.mini_player__y, true);
	} else if (ImprovedTube.mini_player__cursor === 'sw-resize') {
		ImprovedTube.elements.player.style.transform = 'translate(' + event.clientX + 'px, ' + ImprovedTube.mini_player__y + 'px)';
		ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - event.clientX, event.clientY - ImprovedTube.mini_player__y, true);
	} else if (ImprovedTube.mini_player__cursor === 'nw-resize') {
		ImprovedTube.elements.player.style.transform = 'translate(' + event.clientX + 'px, ' + event.clientY + 'px)';
		ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - event.clientX, ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - event.clientY, true);
	}
};

ImprovedTube.miniPlayer_resizeMouseUp = function (event) {
	var bcr = ImprovedTube.elements.player.getBoundingClientRect();

	ImprovedTube.mini_player__x = bcr.left;
	ImprovedTube.mini_player__y = bcr.top;
	ImprovedTube.mini_player__width = bcr.width;
	ImprovedTube.mini_player__height = bcr.height;

	window.dispatchEvent(new Event('resize'));

	var strg = JSON.parse(localStorage.getItem('improvedtube-mini-player')) || {};

	strg.width = ImprovedTube.mini_player__width;
	strg.height = ImprovedTube.mini_player__height;

	localStorage.setItem('improvedtube-mini-player', JSON.stringify(strg));

	window.addEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);
	window.removeEventListener('mouseup', ImprovedTube.miniPlayer_resizeMouseUp);
	window.removeEventListener('mousemove', ImprovedTube.miniPlayer_resizeMouseMove);
};

ImprovedTube.miniPlayer = function () {
	if (this.storage.mini_player === true) {
		var data = localStorage.getItem('improvedtube-mini-player');

		try {
			if (this.isset(data)) {
				data = JSON.parse(data);
			} else {
				data = {};
			}
		} catch (error) {
			data = {};
		}

		data.x = data.x || 16;
		data.y = data.y || 16;
		data.width = data.width || 200;
		data.height = data.height || 150;

		this.mini_player__x = data.x;
		this.mini_player__y = data.y;
		this.mini_player__width = data.width;
		this.mini_player__height = data.height;

		window.removeEventListener('scroll', this.miniPlayer_scroll);
		window.addEventListener('scroll', this.miniPlayer_scroll);
	} else {
		this.mini_player__mode = false;
		this.elements.player.classList.remove('it-mini-player');
		this.mini_player__move = false;

		this.elements.player.style.width = '';
		this.elements.player.style.height = '';
		this.elements.player.style.transform = 'translate(' + 0 + 'px, ' + 0 + 'px)';

		this.elements.player.classList.remove('it-mini-player');

		this.mini_player__cursor = '';
		document.documentElement.removeAttribute('it-mini-player-cursor');

		window.dispatchEvent(new Event('resize'));

		window.removeEventListener('mousedown', this.miniPlayer_mouseDown);
		window.removeEventListener('mousemove', this.miniPlayer_mouseMove);
		window.removeEventListener('mouseup', this.miniPlayer_mouseUp);
		window.removeEventListener('click', this.miniPlayer_click);
		window.removeEventListener('scroll', this.miniPlayer_scroll);
		window.removeEventListener('mousemove', this.miniPlayer_cursorUpdate);
	}
};
