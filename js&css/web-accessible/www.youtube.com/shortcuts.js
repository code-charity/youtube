/*------------------------------------------------------------------------------
4.7.0 SHORTCUTS
------------------------------------------------------------------------------*/

ImprovedTube.shortcuts = function () {
	var keyboard = {
			alt: false,
			ctrl: false,
			shift: false,
			keys: {}
		},
		mouse = {
			player: false,
			wheel: 0
		},
		storage = {};

	function handler() {
		var prevent = false;

		for (var key in storage) {
			var shortcut = storage[key],
				same_keys = true;

			if (
				typeof shortcut === 'object' &&
				(keyboard.alt === shortcut.alt || !ImprovedTube.isset(shortcut.alt)) &&
				(keyboard.ctrl === shortcut.ctrl || !ImprovedTube.isset(shortcut.ctrl)) &&
				(keyboard.shift === shortcut.shift || !ImprovedTube.isset(shortcut.shift)) &&
				(mouse.wheel === shortcut.wheel || !ImprovedTube.isset(shortcut.wheel))
			) {
				if (keyboard.keys && shortcut.keys) {
					for (var code in keyboard.keys) {
						if (!shortcut.keys[code]) {
							same_keys = false;
						}
					}
					for (var code in shortcut.keys) {
						if (!keyboard.keys[code]) {
							same_keys = false;
						}
					}
				}

				if (!ImprovedTube.isset(mouse.wheel) || mouse.wheel === 0 || mouse.player === true) {
					if (same_keys === true) {
						if ([
								'shortcutAuto',
								'shortcut144p',
								'shortcut240p',
								'shortcut360p',
								'shortcut480p',
								'shortcut720p',
								'shortcut1080p',
								'shortcut1440p',
								'shortcut2160p',
								'shortcut2880p',
								'shortcut4320p'
							].includes(key) === true) {
							ImprovedTube['shortcutQuality'](key);
						} else if (typeof ImprovedTube[key] === 'function') {
							ImprovedTube[key]();
						}

						prevent = true;
					}
				}
			}
		}

		return prevent;
	}

	window.addEventListener('keydown', function (event) {
		if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].includes(document.activeElement.tagName) === true || event.target.isContentEditable) {
			return false;
		}

		if (event.code === 'AltLeft' || event.code === 'AltRight') {
			keyboard.alt = true;
		} else if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
			keyboard.ctrl = true;
		} else if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
			keyboard.shift = true;
		} else {
			keyboard.keys[event.keyCode] = true;
		}

		mouse.wheel = 0;

		if (handler() === true) {
			event.preventDefault();
			event.stopPropagation();

			return false;
		}
	}, true);

	window.addEventListener('keyup', function (event) {
		if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].includes(document.activeElement.tagName) === true || event.target.isContentEditable) {
			return false;
		}

		if (event.code === 'AltLeft' || event.code === 'AltRight') {
			keyboard.alt = false;
		} else if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
			keyboard.ctrl = false;
		} else if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
			keyboard.shift = false;
		} else {
			delete keyboard.keys[event.keyCode];
		}

		mouse.wheel = 0;
	}, true);

	window.addEventListener('wheel', function (event) {
		if (event.deltaY > 0) {
			mouse.wheel = 1;
		} else {
			mouse.wheel = -1;
		}

		if (handler() === true) {
			event.preventDefault();
			event.stopPropagation();

			return false;
		}
	}, {
		passive: false,
		capture: true
	});

	document.addEventListener('improvedtube-player-loaded', function () {
	//Please Fix: November2023: this parentNode doesnt exist on youtube.com/shorts
	if (ImprovedTube.elements.player && ImprovedTube.elements.player.parentNode) {
		ImprovedTube.elements.player?.parentNode?.addEventListener('mouseover', function () {
			mouse.player = true;
			mouse.wheel = 0;
		}, true);

		ImprovedTube.elements.player?.parentNode?.addEventListener('mouseout', function () {
			mouse.player = false;
			mouse.wheel = 0;
		}, true);
	}
	});

	document.addEventListener('improvedtube-blur', function () {
		keyboard.alt = false;
		keyboard.ctrl = false;
		keyboard.shift = false;

		for (var key in keyboard.keys) {
			delete keyboard.keys[key];
		}

		mouse.player = false;
		mouse.wheel = 0;
	});

	for (var name in this.storage) {
		if (name.indexOf('shortcut_') === 0) {
			if (this.isset(this.storage[name]) && this.storage[name] !== false) {
				try {
					var key = 'shortcut' + (name.replace(/_?shortcut_?/g, '').replace(/\_/g, '-')).split('-').map(function (element, index) {
						return element[0].toUpperCase() + element.slice(1);
					}).join('');

					storage[key] = this.storage[name];
				} catch (error) {
					console.error(error);
				}
			}
		}
	}
};


/*------------------------------------------------------------------------------
4.7.1 QUALITY
------------------------------------------------------------------------------*/

ImprovedTube.shortcutQuality = function (key) {
	if (this.elements.player) {
		var value = key.replace('shortcut', '').toLowerCase();

		if (value === '144p') {
			value = 'tiny';
		}

		if (value === '240p') {
			value = 'small';
		}

		if (value === '360p') {
			value = 'medium';
		}

		if (value === '480p') {
			value = 'large';
		}

		if (value === '720p') {
			value = 'hd720';
		}

		if (value === '1080p') {
			value = 'hd1080';
		}

		if (value === '1440p') {
			value = 'hd1440';
		}

		if (value === '2160p') {
			value = 'hd2160';
		}

		if (value === '2880p') {
			value = 'hd2880';
		}

		if (value === '4320p') {
			value = 'highres';
		}

		this.elements.player.setPlaybackQualityRange(value);
		this.elements.player.setPlaybackQuality(value);
	}
};


/*------------------------------------------------------------------------------
4.7.2 PICTURE IN PICTURE
------------------------------------------------------------------------------*/

ImprovedTube.shortcutPictureInPicture = function () {
	if (this.elements.video) {
		this.elements.video.requestPictureInPicture();
	}
};


/*------------------------------------------------------------------------------
4.7.3 TOGGLE CONTROLS
------------------------------------------------------------------------------*/

ImprovedTube.shortcutToggleControls = function () {
	if (this.elements.player) {
		this.storage.player_hide_controls = !this.storage.player_hide_controls;

		if (this.storage.player_hide_controls) {
			this.elements.player.hideControls();
		} else {
			this.elements.player.showControls();
		}
	}
};


/*------------------------------------------------------------------------------
4.7.4 PLAY / PAUSE
------------------------------------------------------------------------------*/

ImprovedTube.shortcutPlayPause = function () {
	if (this.elements.player) {
		if (this.elements.video.paused) {
			this.elements.player.playVideo();
		} else {
			this.elements.player.pauseVideo();
		}
	}
};


/*------------------------------------------------------------------------------
4.7.5 STOP
------------------------------------------------------------------------------*/

ImprovedTube.shortcutStop = function () {
	if (this.elements.player) {
		this.elements.player.stopVideo();
	}
};


/*------------------------------------------------------------------------------
4.7.6 TOGGLE AUTOPLAY
------------------------------------------------------------------------------*/

ImprovedTube.shortcutToggleAutoplay = function () {
    var toggle = document.querySelector('#ytd-player .ytp-autonav-toggle-button'),
        attribute = toggle.getAttribute('aria-checked') === 'true';

    if (toggle) {
        toggle.click();
    }
};


/*------------------------------------------------------------------------------
4.7.7 NEXT VIDEO
------------------------------------------------------------------------------*/

ImprovedTube.shortcutNextVideo = function () {
	if (this.elements.player) {
		var playlist_loop_button = document.querySelector('[aria-label="Loop playlist"]');

		if (playlist_loop_button) {
			if (playlist_loop_button.ariaPressed === 'true') {
				this.elements.player.setLoop(true);
			} else {
				this.elements.player.setLoop(false)
			}
		}

		this.elements.player.nextVideo();
	}
};


/*------------------------------------------------------------------------------
4.7.8 PREVIOUS VIDEO
------------------------------------------------------------------------------*/

ImprovedTube.shortcutPrevVideo = function () {
	if (this.elements.player) {
		var playlist_loop_button = document.querySelector('[aria-label="Loop playlist"]');

		if (playlist_loop_button) {
			if (playlist_loop_button.ariaPressed === 'true') {
				this.elements.player.setLoop(true);
			} else {
				this.elements.player.setLoop(false)
			}
		}

		this.elements.player.previousVideo();
	}
};


/*------------------------------------------------------------------------------
4.7.9 SEEK BACKWARD
------------------------------------------------------------------------------*/

ImprovedTube.shortcutSeekBackward = function () {
	if (this.elements.player) {
		this.elements.player.seekBy(-10);
	}
};


/*------------------------------------------------------------------------------
4.7.10 SEEK FORWARD
------------------------------------------------------------------------------*/

ImprovedTube.shortcutSeekForward = function () {
	if (this.elements.player) {
		this.elements.player.seekBy(10);
	}
};


/*------------------------------------------------------------------------------
4.7.11 SEEK NEXT CHAPTER
------------------------------------------------------------------------------*/

ImprovedTube.shortcutSeekNextChapter = function () {
	if (this.elements.player) {
		var player = this.elements.player,
			chapters_container = player.querySelector('.ytp-chapters-container'),
			progress_bar = player.querySelector('.ytp-progress-bar');

		if (chapters_container && chapters_container.children && progress_bar) {
			var chapters = chapters_container.children,
				duration = player.getDuration(),
				current_width = player.getCurrentTime() / (duration / 100) * (progress_bar.offsetWidth / 100);

			for (var i = 0, l = chapters.length; i < l; i++) {
				var left = chapters[i].offsetLeft;

				if (current_width < left) {
					player.seekTo(left / (progress_bar.offsetWidth / 100) * (duration / 100));

					return false;
				}
			}
		}
	}
};


/*------------------------------------------------------------------------------
4.7.12 SEEK PREVIOUS CHAPTER
------------------------------------------------------------------------------*/
ImprovedTube.shortcutSeekPreviousChapter = function () {
	if (this.elements.player) {
		var player = this.elements.player,
			chapters_container = player.querySelector('.ytp-chapters-container'),
			progress_bar = player.querySelector('.ytp-progress-bar');

		if (chapters_container && chapters_container.children && progress_bar) {
			var chapters = chapters_container.children,
				duration = player.getDuration(),
				current_width = player.getCurrentTime() / (duration / 100) * (progress_bar.offsetWidth / 100);

			for (var i = chapters.length - 1; i > 0; i--) {
				if (current_width > chapters[i].offsetLeft) {
					var left = 0;

					if (i > 0) {
						left = chapters[i - 1].offsetLeft;
					}

					player.seekTo(left / (progress_bar.offsetWidth / 100) * (duration / 100));

					return false;
				}
			}
		}
	}
};


/*------------------------------------------------------------------------------
4.7.13 INCREASE VOLUME
------------------------------------------------------------------------------*/
ImprovedTube.shortcutIncreaseVolume = function () {
	var player = this.elements.player,
		value = Number(this.storage.shortcut_volume_step) || 5;

	if (player) {
		player.setVolume(player.getVolume() + value);

		localStorage['yt-player-volume'] = JSON.stringify({
			data: JSON.stringify({
				volume: player.getVolume(),
				muted: player.isMuted(),
				expiration: Date.now(),
				creation: Date.now()
			})
		});

		sessionStorage['yt-player-volume'] = localStorage['yt-player-volume'];

		this.showStatus(player.getVolume());
	}
};
/*------------------------------------------------------------------------------
4.7.14 DECREASE VOLUME
------------------------------------------------------------------------------*/
ImprovedTube.shortcutDecreaseVolume = function () {
	var player = this.elements.player,
		value = Number(this.storage.shortcut_volume_step) || 5;

	if (player) {
		player.setVolume(player.getVolume() - value);

		localStorage['yt-player-volume'] = JSON.stringify({
			data: JSON.stringify({
				volume: player.getVolume(),
				muted: player.isMuted(),
				expiration: Date.now(),
				creation: Date.now()
			})
		});

		sessionStorage['yt-player-volume'] = localStorage['yt-player-volume'];

		this.showStatus(player.getVolume());
	}
};

/*------------------------------------------------------------------------------
4.7.15 SCREENSHOT
------------------------------------------------------------------------------*/
ImprovedTube.shortcutScreenshot = function () {	this.screenshot();};

/*------------------------------------------------------------------------------
4.7.16 INCREASE PLAYBACK SPEED
------------------------------------------------------------------------------*/
ImprovedTube.shortcutIncreasePlaybackSpeed = function () {
	value = Number(ImprovedTube.storage.shortcut_playback_speed_step) || .05;
// original:	
	var video = this.elements.video;
	if (video) {if ( video.playbackRate){
				if ( video.playbackRate < 1 && video.playbackRate > 1-ImprovedTube.storage.shortcut_playback_speed_step ) {  
                 video.playbackRate =  1 } // aligning at 1.0 independent of minimum
		  else { video.playbackRate = Math.max(Number((video.playbackRate + Number(ImprovedTube.storage.shortcut_playback_speed_step || .05)).toFixed(2)), .1);
					  }        	        
		ImprovedTube.showStatus(video.playbackRate);
	} else {// alternative:
	var player = this.elements.player;
		if (player) {
				if (  player.getPlaybackRate() < 1 &&  player.getPlaybackRate() > 1-ImprovedTube.storage.shortcut_playback_speed_step ) {  
                  player.setPlaybackRate(1) } // aligning at 1.0 independent of minimum
		  else { player.setPlaybackRate(Math.max(Number((player.getPlaybackRate() + Number(ImprovedTube.storage.shortcut_playback_speed_step || .05)).toFixed(2)), .1))
					  }        	        
		ImprovedTube.showStatus(player.getPlaybackRate());
}}}};
/*------------------------------------------------------------------------------
4.7.17 DECREASE PLAYBACK SPEED
------------------------------------------------------------------------------*/
ImprovedTube.shortcutDecreasePlaybackSpeed = function () {
	value = Number(ImprovedTube.storage.shortcut_playback_speed_step) || .05;
// original:
	var video = this.elements.video;
	if (video) {
		if (video.playbackRate){
			if ( video.playbackRate < 0.1+ImprovedTube.storage.shortcut_playback_speed_step ) {  
		    video.playbackRate =  video.playbackRate*0.7 } // slow down near minimum
	  else { video.playbackRate = Math.max(Number((video.playbackRate - Number(ImprovedTube.storage.shortcut_playback_speed_step || .05)).toFixed(2)), .1);
		    }
		ImprovedTube.showStatus(video.playbackRate);
	}		
	else {
	// alternative:
	var player = this.elements.player;
	if (player) {
			if ( player.getPlaybackRate() < 0.1+ImprovedTube.storage.shortcut_playback_speed_step ) {  
		    player.setPlaybackRate(player.getPlaybackRate()*0.7) } // slow down near minimum
	  else { player.setPlaybackRate(Math.max(Number((player.getPlaybackRate()  - Number(ImprovedTube.storage.shortcut_playback_speed_step || .05)).toFixed(2)), .1))
		    }
		ImprovedTube.showStatus(player.getPlaybackRate());
}}}};
/*------------------------------------------------------------------------------
4.7.18 RESET PLAYBACK SPEED
------------------------------------------------------------------------------*/
ImprovedTube.shortcutResetPlaybackSpeed = function () {
	var video = this.elements.video;

	if (video) {
		video.playbackRate = 1;

		ImprovedTube.showStatus(video.playbackRate);
	}
};

/*------------------------------------------------------------------------------
4.7.19 GO TO SEARCH BOX
------------------------------------------------------------------------------*/
ImprovedTube.shortcutGoToSearchBox = function () {
	var search = document.querySelector('input#search');
	if (search) {
		search.focus();
	}
};
/*------------------------------------------------------------------------------
4.7.20 ACTIVATE FULLSCREEN
------------------------------------------------------------------------------*/
ImprovedTube.shortcutActivateFullscreen = function () {
	if (this.elements.player) {
		this.elements.player.toggleFullscreen();
	}
};
/*------------------------------------------------------------------------------
4.7.21 ACTIVATE CAPTIONS
------------------------------------------------------------------------------*/
ImprovedTube.shortcutActivateCaptions = function () {
	var player = this.elements.player;

	if (player && player.toggleSubtitlesOn) {
		player.toggleSubtitlesOn();
	}
};
/*------Chapters------*/
ImprovedTube.shortcutChapters = function () {	
          try{var height = document.querySelector('*[target-id*=chapters]').clientHeight;}catch{}
          if (height) {try{document.querySelector('*[target-id*=chapters] #visibility-button button').click();   console.log("chapters shortcut close")} catch{}}	
		  else   { try{document.querySelector('*[target-id*=chapters]').removeAttribute('visibility');   console.log("chapters shortcut open")} catch{} }
};		
/*------Transcript------*/
ImprovedTube.shortcutTranscript = function () {	
          try{var height = document.querySelector('*[target-id*=transcript]').clientHeight;}catch{}
          if (height) {try{document.querySelector('*[target-id*=transcript] #visibility-button button').click();  console.log("transcriptshortcut close")} catch{}}	
		  else   { try{document.querySelector('*[target-id*=transcript]').removeAttribute('visibility');   console.log("transcriptshortcut open")} catch{} }
};
/*------------------------------------------------------------------------------
4.7.22 LIKE
------------------------------------------------------------------------------*/
ImprovedTube.shortcutLike = function () {
	var like = document.querySelector('like-button-view-model * * *');
	if (like) {like.click();} 
};
/*------------------------------------------------------------------------------
4.7.23 DISLIKE
------------------------------------------------------------------------------*/
ImprovedTube.shortcutDislike = function () {
	var dislike = document.querySelector('dislike-button-view-model * * *');
	if (dislike) {	dislike.click();}
};
/*------Report------*/
ImprovedTube.shortcutReport = function () {
try{document.querySelectorAll("tp-yt-iron-dropdown").forEach(el => el.style.opacity = 0); 
    document.querySelector('svg path[d^="M7.5,12c0,0.83-0.67,1.5-1.5"]').closest("button").click();document.querySelectorAll("tp-yt-iron-dropdown").forEach(el => el.style.opacity = 0)}
	catch{console.log("'...' failed"); setTimeout(function(){try{document.querySelector('svg path[d^="M7.5,12c0,0.83-0.67,1.5-1.5"]').closest("button").click();document.querySelectorAll("tp-yt-iron-dropdown").forEach(el => el.style.opacity = 0)}
catch{console.log("'...' failed2")}},100) }
	
setTimeout(function(){try{document.querySelectorAll("tp-yt-iron-dropdown").forEach(el => el.style.opacity = 0); document.querySelector('tp-yt-iron-dropdown svg path[d^="M13.18,4l0.24,1.2L13.58,6h0.82H19v7h-5.18l-0"]').closest("tp-yt-paper-item").click();}
	catch{console.log("report failed");setTimeout(function()	{try{document.querySelector('tp-yt-iron-dropdown svg path[d^="M13.18,4l0.24,1.2L13.58,6h0.82H19v7h-5.18l-0"]').closest("tp-yt-paper-item").click();}
		catch{console.log("report failed2");document.querySelector('svg path[d^="M7.5,12c0,0.83-0.67,1.5-1.5"]').closest("button").click();}},800);
		}
},200); 

setTimeout(function(){try{document.querySelectorAll("tp-yt-iron-dropdown").forEach(el => el.style.opacity = 1)}catch{console.log("dropdown visible failed");
  setTimeout(function(){try{document.querySelectorAll("tp-yt-iron-dropdown").forEach(el => el.style.opacity = 1)}catch{console.log("dropdown visible failed2");}},1700)}},700)
}

/*------------------------------------------------------------------------------
4.7.24 SUBSCRIBE
------------------------------------------------------------------------------*/
ImprovedTube.shortcutSubscribe = function () {
	if (this.elements.subscribe_button) {
		this.elements.subscribe_button.click();
	}
};

/*------------------------------------------------------------------------------
4.7.25 DARK THEME
------------------------------------------------------------------------------*/
ImprovedTube.shortcutDarkTheme = function () {
let darkCookie; 
	if (document.documentElement.hasAttribute('dark')) {
		cookieValue = '80000';
		document.documentElement.removeAttribute('dark');
		document.querySelector('ytd-masthead').removeAttribute('dark');
		document.getElementById("cinematics").style.visibility = 'hidden';
		document.querySelector('ytd-masthead').style.backgroundColor ='#fff';	
		ImprovedTube.myColors(); ImprovedTube.setTheme();

	} else { darkCookie = true;
   	    document.documentElement.setAttribute('dark', '');  	 
		if (this.storage.theme === 'custom' ){ this.elements.my_colors.remove();  }
		if (this.storage.theme === 'dawn' ){ this.elements.dawn.remove();  }
			if (document.documentElement.hasAttribute('it-themes') !== null && document.documentElement.hasAttribute('it-themes') === true){													 
				document.documentElement.removeAttribute('it-themes');			
				document.documentElement.setAttribute('it-themes', 'false');			
				}
		document.querySelector('ytd-masthead').style.cssText = 'background-color: #000;';	
		document.getElementById("cinematics").style.visibility = 'visible';
		
}   
	let cookie = this.getPrefCookieValueByName('f6');
	// f6 stores more than Theme. Treat it like hex number, we are only allowed to add/remove 0x80000 (light theme) and 0x400 (dark theme).
	if (cookie && !isNaN(cookie)) {
		// valid f6
		let negation = parseInt(cookie, 16) & parseInt(80400, 16);
		cookie = (parseInt(cookie, 16) - negation); // remove 80000 and 400
		cookie = cookie ^ (darkCookie ? parseInt(400, 16) : 0); // apply optional darkCookie
		cookie = cookie ? cookie.toString(16) : null; // back to hex, 0 means we want null to remove f6 cookie instead
	} else {
		// missing or corrupted f6, fully overwrite
		cookie = darkCookie ? 400 : null;
	}

	this.setPrefCookieValueByName('f6', cookie);

	
};

/*------------------------------------------------------------------------------
4.7.26 CUSTOM MINI PLAYER
------------------------------------------------------------------------------*/

ImprovedTube.shortcutCustomMiniPlayer = function () {
	this.storage.mini_player = !this.storage.mini_player;
	
	this.miniPlayer();
};
/*------------------------------------------------------------------------------
Loop
------------------------------------------------------------------------------*/
ImprovedTube.shortcutToggleLoop = function (node) {
		var video = ImprovedTube.elements.video;
		function matchLoopState(opacity) {
		    svg.style.opacity = opacity;
                    if (ImprovedTube.storage.player_repeat_button === true) {
                   	 var playerButton = document.querySelector('#it-repeat-button');
                    	 playerButton.children[0].style.opacity = opacity;
          	        }
					if (ImprovedTube.storage.below_player_loop !== false) {
					var buttonBelowPlayer = document.querySelector('#it-below-player-loop');
					buttonBelowPlaye.children[0].style.opacity = opacity;
					}
	            }		
		if (video.hasAttribute('loop')) {
					video.removeAttribute('loop');
					matchLoopState('.5')
				} else if (!/ad-showing/.test(ImprovedTube.elements.player.className)) {
					video.setAttribute('loop', '');
					matchLoopState('1')
				}	
};
/*------------------------------------------------------------------------------
4.7.27 STATS FOR NERDS
------------------------------------------------------------------------------*/

ImprovedTube.shortcutStatsForNerds = function () {
	var player = this.elements.player;

	if (player.isVideoInfoVisible()) {
		player.hideVideoInfo();
	} else {
		player.showVideoInfo();
	}
};


/*------------------------------------------------------------------------------
4.7.28 TOGGLE CARDS
------------------------------------------------------------------------------*/

ImprovedTube.shortcutToggleCards = function () {  function toggleVideoOverlays() {
	document.documentElement.toggleAttribute('it-player-hide-cards');
	
	document.documentElement.toggleAttribute('it-player-hide-endcards');
	document.documentElement.toggleAttribute('it-hide-video-title-fullScreen');} 	
	
	toggleVideoOverlays(); window.removeEventListener('hashchange', toggleVideoOverlays);  window.addEventListener('hashchange', toggleVideoOverlays);
};

/*------------------------------------------------------------------------------
4.7.29 POPUP PLAYER
------------------------------------------------------------------------------*/

ImprovedTube.shortcutPopupPlayer = function () {
	var player = this.elements.player;

	if (document.documentElement.dataset.pageType === 'video' && player) {
		player.pauseVideo();

		window.open('//www.youtube.com/embed/' + location.href.match(/watch\?v=([A-Za-z0-9\-\_]+)/g)[0].slice(8) + '?start=' + parseInt(player.getCurrentTime()) + '&autoplay=' + (ImprovedTube.storage.player_autoplay == false ? '0' : '1'), '_blank', 'directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=' + player.offsetWidth + ',height=' + player.offsetHeight);
	}
};

