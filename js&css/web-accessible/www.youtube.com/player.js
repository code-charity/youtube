/*------------------------------------------------------------------------------
AUTOPLAY DISABLE
------------------------------------------------------------------------------*/
ImprovedTube.autoplayDisable = function (videoElement) {
	if (this.storage.player_autoplay_disable
		|| this.storage.playlist_autoplay === false
		|| this.storage.channel_trailer_autoplay === false) {
		const player = this.elements.player || videoElement.closest('.html5-video-player') || videoElement.closest('#movie_player'); // #movie_player: outdated since 2024?

		if (this.video_url !== location.href) {	this.user_interacted = false; }

		//if (there is a player) and (no user clicks) and (no ads playing) 
		// and( ((auto play is off and it is not in a playlist)
		//   	 or (playlist auto play is off and in a playlist))
		//   	 or (we are in a channel and the channel trailer autoplay is off)  )

		if (player && !this.user_interacted // (=user didnt click or type)
			&& !player.classList.contains('ad-showing') // (=no ads playing, needs an update?)
			&& ((location.href.includes('/watch?') // #1703 // (=video page)
				// player_autoplay_disable & not playlist
				&& (this.storage.player_autoplay_disable && !location.href.includes('list='))
				// !playlist_autoplay & playlist
				|| (this.storage.playlist_autoplay === false && location.href.includes('list=')))
				// channel homepage & !channel_trailer_autoplay
				|| (this.storage.channel_trailer_autoplay === false && this.regex.channel.test(location.href)))) {

			setTimeout(function () {
				try { player.pauseVideo(); } catch (error) { console.log("autoplayDisable: Pausing"); videoElement.pause(); }
			});
		} else {
			document.dispatchEvent(new CustomEvent('it-play'));
		}
	} else {
		document.dispatchEvent(new CustomEvent('it-play'));
	}
};
/*------------------------------------------------------------------------------
FORCED PLAY VIDEO FROM THE BEGINNING
------------------------------------------------------------------------------*/
ImprovedTube.forcedPlayVideoFromTheBeginning = function () {
	const player = this.elements.player,
		video = this.elements.video,
		paused = video?.paused;

	if (player && video && this.storage.forced_play_video_from_the_beginning && location.pathname == '/watch') {
		player.seekTo(0);
		// restore previous paused state
		if (paused) { player.pauseVideo(); }
	}
};
/*------------------------------------------------------------------------------
AUTOPAUSE WHEN SWITCHING TABS
------------------------------------------------------------------------------*/
ImprovedTube.playerAutopauseWhenSwitchingTabs = function () {
	const player = this.elements.player;

	if (this.storage.player_autopause_when_switching_tabs && player) {
		if (this.focus && this.played_before_blur && this.elements.video.paused) {
			player.playVideo();
		} else {
			this.played_before_blur = !this.elements.video.paused;
			if (!this.elements.video.paused) {
				player.pauseVideo();
			}
		}
	}
};
/*------------------------------------------------------------------------------
PICTURE IN PICTURE (PIP)
------------------------------------------------------------------------------*/
ImprovedTube.enterPip = function (disable) {
	const video = this.elements.video;

	if (!disable
		&& video
		&& document.pictureInPictureEnabled
		&& typeof video.requestPictureInPicture == 'function') {

		video.requestPictureInPicture().then(() => {
			if (video.paused) {
				// manually send Play message to "Auto-pause while I'm not in the tab", paused PiP wont do it automatically.
				document.dispatchEvent(new CustomEvent('it-play'));
			}
			return true;
		}).catch((err) => console.error('playerAutoPip: Failed to enter Picture-in-Picture mode', err));
	} else if (document.pictureInPictureElement && typeof document.exitPictureInPicture == 'function') {
		document.exitPictureInPicture();
		return false;
	}
};
/*------------------------------------------------------------------------------
AUTO PIP WHEN SWITCHING TABS
------------------------------------------------------------------------------*/
ImprovedTube.playerAutoPip = function () {
	const video = this.elements.video;

	if (this.storage.player_autoPip && this.storage.player_autoPip_outside && this.focus) {
		this.enterPip(true);
	} else if (this.storage.player_autoPip && !this.focus && !video?.paused) {
		this.enterPip();
	}
};
/*------------------------------------------------------------------------------
PLAYBACK SPEED
------------------------------------------------------------------------------*/
ImprovedTube.playbackSpeed = function (newSpeed) {
	const video = this.elements.video,
		player = this.elements.player,
		speed = video?.playbackRate ? Number(video.playbackRate.toFixed(2)) : (player?.getPlaybackRate ? Number(player.getPlaybackRate().toFixed(2)) : null);

	if (!speed) {
		console.error('PlaybackSpeed: Cant establish playbackRate/getPlaybackRate');
		return false;
	}

	// called with no option or demanded speed already set, only provide readback
	if (!newSpeed || speed == newSpeed) return speed;

	if (video?.playbackRate) {
		video.playbackRate = newSpeed;
		newSpeed = video.playbackRate;
	} else if (player?.setPlaybackRate && player.getPlaybackRate) {
		player.setPlaybackRate(newSpeed);
		newSpeed = player.getPlaybackRate();
	} else newSpeed = false;

	return newSpeed;
};
/*------------------------------------------------------------------------------
PERMANENT PLAYBACK SPEED
------------------------------------------------------------------------------*/
ImprovedTube.playerPlaybackSpeed = function () { if (this.storage.player_forced_playback_speed === true) {
	var player = this.elements.player; if (!player) return;
	var video = this.elements.video || player.querySelector('video'); 
	option = this.storage.player_playback_speed;	
	if (this.isset(option) === false) { option = 1; }
	else if ( option !== 1 ) { 
		const speed = video?.playbackRate ? Number(video.playbackRate.toFixed(2)) : (player?.getPlaybackRate ? Number(player.getPlaybackRate().toFixed(2)) : null);
		 if ( speed !== option && (speed > 1 || speed < 1) )
		   { console.log("skipping permanent speed, since speed was manually set differently for this video to:" + video.playbackRate); return; }
	}
	if (!(player.getVideoData() && player.getVideoData().isLive))
	{ player.setPlaybackRate(Number(option)); if (!video) { video = { playbackRate: 1 }; };	video.playbackRate = Number(option); // #1729 q2	// hi! @raszpl
		if ( (this.storage.player_force_speed_on_music !== true || this.storage.player_dont_speed_education === true)
		 	&& option !== 1) {
			ImprovedTube.speedException = function () {
				if (this.storage.player_dont_speed_education === true && DATA.genre === 'Education')
				{player.setPlaybackRate(Number(1));	video.playbackRate = Number(1); return;}
				if (this.storage.player_force_speed_on_music === true)
				{ //player.setPlaybackRate(Number(option));	video.playbackRate = Number(option);
	 return;}
				if (DATA.keywords && !keywords) { keywords = DATA.keywords.join(', ') || ''; }
				if (keywords === 'video, sharing, camera phone, video phone, free, upload') { keywords = ''; }
				var musicIdentifiers = /(official|music|lyrics?)[ -]video|(cover|studio|radio|album|alternate)[- ]version|soundtrack|unplugged|\bmedley\b|\blo-fi\b|\blofi\b|a(lla)? cappella|feat\.|(piano|guitar|jazz|ukulele|violin|reggae)[- ](version|cover)|karaok|backing[- ]track|instrumental|(sing|play)[- ]?along|卡拉OK|卡拉OK|الكاريوكي|караоке|カラオケ|노래방|bootleg|mashup|Radio edit|Guest (vocals|musician)|(title|opening|closing|bonus|hidden)[ -]track|live acoustic|interlude|featuring|recorded (at|live)/i;
				var musicIdentifiersTitleOnly = /lyrics|theme song|\bremix|\bAMV ?[^a-z0-9]|[^a-z0-9] ?AMV\b|\bfull song\b|\bsong:|\bsong[\!$]|^song\b|( - .*\bSong\b|\bSong\b.* - )|cover ?[^a-z0-9]|[^a-z0-9] ?cover|\bconcert\b/i;
				var musicIdentifiersTitle = new RegExp(musicIdentifiersTitleOnly.source + '|' + musicIdentifiers.source, "i");
				var musicRegexMatch = musicIdentifiersTitle.test(DATA.title);
				if (!musicRegexMatch) {
					var musicIdentifiersTagsOnly = /, (lyrics|remix|song|music|AMV|theme song|full song),|\(Musical Genre\)|, jazz|, reggae/i;
					var musicIdentifiersTags = new RegExp(musicIdentifiersTagsOnly.source + '|' + musicIdentifiers.source, "i");
				  keywordsAmount = 1 + ((keywords || '').match(/,/) || []).length;
					if ( ((keywords || '').match(musicIdentifiersTags) || []).length / keywordsAmount > 0.08) {
						musicRegexMatch = true}}
				notMusicRegexMatch = /\bdo[ck]u|interv[iyj]|back[- ]?stage|インタビュー|entrevista|面试|面試|회견|wawancara|مقابلة|интервью|entretien|기록한 것|记录|記錄|ドキュメンタリ|وثائقي|документальный/i.test(DATA.title + " " + keywords);
				// (Tags/keywords shouldnt lie & very few songs titles might have these words)
				if (DATA.duration) {
					function parseDuration (duration) {	const [_, h = 0, m = 0, s = 0] = duration.match(/PT(?:(\d+)?H)?(?:(\d+)?M)?(\d+)?S?/).map(part => parseInt(part) || 0);
						return h * 3600 + m * 60 + s; }
					DATA.lengthSeconds = parseDuration(DATA.duration); 	}
				function testSongDuration (s, ytMusic) {
					if (135 <= s && s <= 260) {return 'veryCommon';}
					if (105 <= s && s <= 420) {return 'common';}
					if (420 <= s && s <= 720) {return 'long';}
					if (45 <= s && s <= 105) {return 'short';}
					if (ytMusic && ytMusic > 1 && (85 <= s / ytMusic && (s / ytMusic <= 375 || ytMusic == 10))) {return 'multiple';}
				//does Youtube ever show more than 10 songs below the description?
				}
				var songDurationType = testSongDuration(DATA.lengthSeconds);
				console.log("genre: " + DATA.genre + "//title: " + DATA.title + "//keywords: " + keywords + "//music word match: " + musicRegexMatch + "// not music word match:" + notMusicRegexMatch + "//duration: " + DATA.lengthSeconds + "//song duration type: " + songDurationType);
				// check if the video is PROBABLY MUSIC:
				if ( 		( DATA.genre === 'Music' && (!notMusicRegexMatch || songDurationType === 'veryCommon'))
			|| ( musicRegexMatch && !notMusicRegexMatch && (typeof songDurationType !== 'undefined'
						|| (/album|Álbum|专辑|專輯|एलबम|البوم|アルバム|альбом|앨범|mixtape|concert|playlist|\b(live|cd|vinyl|lp|ep|compilation|collection|symphony|suite|medley)\b/i.test(DATA.title + " " + keywords)
							&& 1000 <= DATA.lengthSeconds )) ) // && 1150 <= DATA.lengthSeconds <= 5000
			||	( DATA.genre === 'Music' && musicRegexMatch && (typeof songDurationType !== 'undefined'
						|| (/album|Álbum|专辑|專輯|एलबम|البوم|アルバム|альбом|앨범|mixtape|concert|playlist|\b(live|cd|vinyl|lp|ep|compilation|collection|symphony|suite|medley)\b/i.test(DATA.title + " " + keywords)
							&& 1000 <= DATA.lengthSeconds )) ) // && DATA.lengthSeconds <= 5000
			|| (amountOfSongs && testSongDuration(DATA.lengthSeconds, amountOfSongs ) !== 'undefined')
		 //	||  location.href.indexOf('music.') !== -1  // (=currently we are only running on www.youtube.com anyways)
				)	{ player.setPlaybackRate(1); video.playbackRate = 1; console.log ("...,thus must be music?"); }
				else { 	// Now this video might rarely be music
					// - however we can make extra-sure after waiting for the video descripion to load... (#1539)
					var tries = 0; 	var intervalMs = 210; if (location.href.indexOf('/watch?') !== -1) {var maxTries = 10;} else {var maxTries = 0;}
					// ...except when it is an embedded player?
					var waitForDescription = setInterval(() => {
						if (++tries >= maxTries) {
							subtitle = document.querySelector('#title + #subtitle:last-of-type')
							if ( subtitle && 1 <= Number((subtitle?.innerHTML?.match(/^\d+/) || [])[0])	// indicates buyable/registered music (amount of songs)
						 && typeof testSongDuration(DATA.lengthSeconds, Number((subtitle?.innerHTML?.match(/^\d+/) || [])[0]) ) !== 'undefined' ) // resonable duration
							{player.setPlaybackRate(1); video.playbackRate = 1; console.log("...but YouTube shows music below the description!"); clearInterval(waitForDescription); }
							intervalMs *= 1.11;	}}, intervalMs);
					window.addEventListener('load', () => { setTimeout(() => { clearInterval(waitForDescription); }, 1234); });
				}
			}
			//DATA  (TO-DO: make the Data available to more/all features? #1452  #1763  (Then can replace ImprovedTube.elements.category === 'music', VideoID is also used elsewhere)
			DATA = {};
			defaultKeywords = "video,sharing,camera,phone,video phone,free,upload";
			DATA.keywords = false; keywords = false; amountOfSongs = false;
			DATA.videoID = ImprovedTube.videoId() || false;
			ImprovedTube.fetchDOMData = function () {
			// if (history.length > 1 &&  history.state.endpoint.watchEndpoint) {
				try { DATA = JSON.parse(document.querySelector('#microformat script')?.textContent) ?? false; DATA.title = DATA.name;}
			 catch { DATA.genre = false; DATA.keywords = false; DATA.lengthSeconds = false;
					try {
						DATA.title = document.getElementsByTagName('meta')?.title?.content || false;
						DATA.genre = document.querySelector('meta[itemprop=genre]')?.content || false;
						DATA.duration = document.querySelector('meta[itemprop=duration]')?.content || false;
			 } catch {}} if ( DATA.title === ImprovedTube.videoTitle() )
				{ keywords = document.getElementsByTagName('meta')?.keywords?.content || false; if (!keywords) {keyword=''} ImprovedTube.speedException(); }
				else { keywords = ''; (async function () { try { const response = await fetch(`https://www.youtube.com/watch?v=${DATA.videoID}`);

					const htmlContent = await response.text();
					const metaRegex = /<meta[^>]+name=["'](keywords|genre|duration)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
					let match; while ((match = metaRegex.exec(htmlContent)) !== null) {
						const [, property, value] = match;
						if (property === 'keywords') { keywords = value;} else {DATA[property] = value;}
					}
					amountOfSongs = (htmlContent.slice(-80000).match(/},"subtitle":{"simpleText":"(\d*)\s/) || [])[1] || false;
					if (keywords) { ImprovedTube.speedException(); }
				} catch (error) { console.error('Error: fetching from https://Youtube.com/watch?v=${DATA.videoID}', error); keywords = ''; }
				})();
				}
			};
			if ( (history && history.length === 1) || !history?.state?.endpoint?.watchEndpoint) { ImprovedTube.fetchDOMData();}
			else {
				//Invidious instances. Should be updated automatically!...
				const invidiousInstances = ['invidious.fdn.fr', 'inv.tux.pizza', 'invidious.flokinet.to', 'invidious.protokolla.fi', 'invidious.private.coffee', 'yt.artemislena.eu', 'invidious.materialio.us', 'iv.datura.network'];
				function getRandomInvidiousInstance () { return invidiousInstances[Math.floor(Math.random() * invidiousInstances.length)];}

				(async function () {	 let retries = 4;	let invidiousFetched = false;
					async function fetchInvidiousData () {
						try {const response = await fetch(`https://${getRandomInvidiousInstance()}/api/v1/videos/${DATA.videoID}?fields=genre,title,lengthSeconds,keywords`);
			 DATA = await response.json();
			 if (DATA.genre && DATA.title && DATA.keywords && DATA.lengthSeconds) { if (DATA.keywords.toString() === defaultKeywords ) {DATA.keywords = ''}
				 ImprovedTube.speedException(); invidiousFetched = true;	}
						} catch (error) { console.error('Error: Invidious API: ', error); }
					}
					while (retries > 0 && !invidiousFetched) { await fetchInvidiousData();
						if (!invidiousFetched) { await new Promise(resolve => setTimeout(resolve, retries === 4 ? 1500 : 876)); retries--; }	}
					if (!invidiousFetched) { if (document.readyState === 'loading') {document.addEventListener('DOMContentLoaded', ImprovedTube.fetchDOMData())}
					else { ImprovedTube.fetchDOMData();} }
				})();
			}
		}	// else { }
	}
}
}
/*------------------------------------------------------------------------------
SUBTITLES
------------------------------------------------------------------------------*/
ImprovedTube.playerSubtitles = function () {
	const player = this.elements.player;

	if (player && player.isSubtitlesOn && player.toggleSubtitles && player.toggleSubtitlesOn) {
		switch (this.storage.player_subtitles) {
			case true:
			case 'enabled':
				player.toggleSubtitlesOn();
				break

			case 'disabled':
				if (player.isSubtitlesOn()) { player.toggleSubtitles(); }
				break
		}
	}
};
/*------------------------------------------------------------------------------
SUBTITLES LANGUAGE
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesLanguage = function () {
	const option = this.storage.subtitles_language,
		player = this.elements.player;
	let subtitlesState;

	if (option && player && player.getOption && player.setOption && player.isSubtitlesOn && player.toggleSubtitles) {
		const matchedTrack = player.getOption('captions', 'tracklist', {includeAsr: true})?.find(track => track.languageCode.includes(option) && (!track.vss_id.includes("a.") || this.storage.auto_generate));

		if (matchedTrack) {
			subtitlesState = player.isSubtitlesOn();
			player.setOption('captions', 'track', matchedTrack);
			// setOption forces Subtitles ON, restore state from before calling it.
			if (!subtitlesState) { player.toggleSubtitles(); }
		}
	}
};
/*------------------------------------------------------------------------------
SUBTITLES FONT FAMILY
SUBTITLES FONT COLOR
SUBTITLES FONT SIZE
SUBTITLES BACKGROUND COLOR
SUBTITLES BACKGROUND OPACITY
SUBTITLES WINDOW COLOR
SUBTITLES WINDOW OPACITY
SUBTITLES CHARACTER EDGE STYLE
SUBTITLES FONT OPACITY
default = {
	"fontFamily": 4,
	"color": "#fff",
	"fontSizeIncrement": 0,
	"background": "#080808",
	"backgroundOpacity": 0.75,
	"windowColor": "#080808",
	"windowOpacity": 0,
	"charEdgeStyle": 0,
	"textOpacity": 1,
},
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesUserSettings = function () {
	const ourSettings = {
			fontFamily: this.storage.subtitles_font_family,
			color: this.storage.subtitles_font_color,
			fontSizeIncrement: this.storage.subtitles_font_size,
			background: this.storage.subtitles_background_color,
			backgroundOpacity: this.storage.subtitles_background_opacity,
			windowColor: this.storage.subtitles_window_color,
			windowOpacity: this.storage.subtitles_window_opacity,
			charEdgeStyle: this.storage.subtitles_character_edge_style,
			textOpacity: this.storage.subtitles_font_opacity
		},
		userSettings = Object.keys(ourSettings).filter(e => ourSettings[e]),
		player = this.elements.player;

	if (userSettings.length && player && player.getSubtitlesUserSettings && player.updateSubtitlesUserSettings) {
		let ytSettings = player.getSubtitlesUserSettings(),
			setting;

		if (!ytSettings) return; //null SubtitlesUserSettings seem to mean subtitles not available

		for (const value of userSettings) {
			setting = null;
			switch (value) {
				case 'fontFamily':
				case 'fontSizeIncrement':
				case 'charEdgeStyle':
					setting = Number(ourSettings[value]);
					break;

				case 'color':
				case 'background':
				case 'windowColor':
					setting = ourSettings[value];
					break;

				case 'backgroundOpacity':
				case 'windowOpacity':
				case 'textOpacity':
					setting = Number(ourSettings[value]) / 100;
					break;
			}

			if (Object.keys(ytSettings).includes(value)) {
				ytSettings[value] = setting;
			} else {
				console.error('subtitlesUserSettings failed at: ', value, setting);
			}
		}
		player.updateSubtitlesUserSettings(ytSettings);
	}
};
/*------------------------------------------------------------------------------
SUBTITLES DISABLE SUBTILES FOR LYRICS
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesDisableLyrics = function () {
	if (this.storage.subtitles_disable_lyrics) {
		const player = this.elements.player;

		if (player && player.isSubtitlesOn && player.isSubtitlesOn() && player.toggleSubtitles) {
			// Music detection only uses 3 identifiers for Lyrics: lyrics, sing-along, karaoke.
			// Easier to simply use those here. Can replace with music detection later.
			const terms = ["sing along", "sing-along", "karaoke", "lyric", "卡拉OK", "卡拉OK", "الكاريوكي", "караоке", "カラオケ", "노래방"];
			if (terms.some(term => this.videoTitle().toLowerCase().includes(term))) {
				player.toggleSubtitles();
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

	let button = parent.querySelector('.ytp-ad-skip-button-modern.ytp-button,[class*="ytp-ad-skip-button"].ytp-button') || parent;
	// TODO: Replace this with centralized video element pointer
	let video = document.querySelector('.video-stream.html5-main-video') || false;
	function skipAd () {
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
	} else if (this.storage.ads === 'small_creators') {
		let userDefiniedLimit = this.storage.smallCreatorsCount * parseInt(this.storage.smallCreatorsUnit);
		let subscribersNumber = ImprovedTube.subscriberCount;
		if (subscribersNumber > userDefiniedLimit) {
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
ImprovedTube.playerQuality = function (quality = this.storage.player_quality) {
	let player = this.elements.player;
	if (quality && quality !== 'disabled'
		&& player && player.getAvailableQualityLevels
		&& (!player.dataset.defaultQuality || player.dataset.defaultQuality != quality)) {
		let available_quality_levels = player.getAvailableQualityLevels();
		function closest (num, arr) {
			let curr = arr[0];
			let diff = Math.abs(num - curr);
			for (let val = 1; val < arr.length; val++) {
				let newdiff = Math.abs(num - arr[val]);
				if (newdiff < diff) {
					diff = newdiff;
					curr = arr[val];
				}
			}
			return curr;
		};

		if (!available_quality_levels.includes(quality)) {
			let label = ['tiny', 'small', 'medium', 'large', 'hd720', 'hd1080', 'hd1440', 'hd2160', 'hd2880', 'highres'];
			let resolution = ['144', '240', '360', '480', '720', '1080', '1440', '2160', '2880', '4320'];
			let availableresolutions = available_quality_levels.map(q => resolution[label.indexOf(q)]);
			quality = label[resolution.indexOf(closest(resolution[label.indexOf(quality)], availableresolutions))];
		}
		player.setPlaybackQualityRange(quality);
		player.setPlaybackQuality(quality);
		player.dataset.defaultQuality = quality;
	}
};
/*------------------------------------------------------------------------------
QUALITY WITHOUT FOCUS
------------------------------------------------------------------------------*/
ImprovedTube.playerQualityWithoutFocus = function () {
	let player = this.elements.player,
		qualityWithoutFocus = this.storage.player_quality_without_focus;
	if (qualityWithoutFocus && qualityWithoutFocus !== 'auto' && player && player.getPlaybackQuality) {
		if (this.focus) {
			if (ImprovedTube.qualityBeforeBlur) {
				ImprovedTube.playerQuality(ImprovedTube.qualityBeforeBlur);
				ImprovedTube.qualityBeforeBlur = undefined;
			}
		} else {
			if (!ImprovedTube.elements.video.paused) {
				if (!ImprovedTube.qualityBeforeBlur) {
					ImprovedTube.qualityBeforeBlur = player.getPlaybackQuality();
				}
				ImprovedTube.playerQuality(qualityWithoutFocus);
			}
		}
	}
};
/*------------------------------------------------------------------------------
BATTERY FEATURES;   PLAYER QUALITY BASED ON POWER STATUS
------------------------------------------------------------------------------*/
ImprovedTube.batteryFeatures = async function () {
	if (ImprovedTube.storage.qualityWhenRunningOnBattery
		  || ImprovedTube.storage.pauseWhileIUnplugTheCharger
		  || ImprovedTube.storage.whenBatteryIslowDecreaseQuality) {
		  const updateQuality = async (battery, charging) => {
			  if (battery) {
				if (!battery.charging) {
					if (ImprovedTube.storage.pauseWhileIUnplugTheCharger && charging) {
						ImprovedTube.elements.player.pauseVideo();
						ImprovedTube.paused = true;
					}
					if (ImprovedTube.storage.qualityWhenRunningOnBattery) {
						ImprovedTube.playerQuality(ImprovedTube.storage.qualityWhenRunningOnBattery);
					}
					if (ImprovedTube.storage.whenBatteryIslowDecreaseQuality) {
						let quality;
						if (battery.level > 0.11 || battery.dischargingTime > 900) {
							quality = "large";
						} else if (battery.level > 0.08 || battery.dischargingTime > 600) {
							quality = "medium";
						} else if (battery.level > 0.04 || battery.dischargingTime > 360) {
							quality = "small";
						} else {
							quality = "tiny";
						}
						ImprovedTube.playerQuality(quality);
					}
				} else if (charging && ImprovedTube.paused && ImprovedTube.storage.pauseWhileIUnplugTheCharger) {
					ImprovedTube.elements.player.playVideo();
					delete ImprovedTube.paused;
				}
			}
		};
		const battery = await navigator.getBattery();
		battery.addEventListener("levelchange", () => updateQuality(battery));
		battery.addEventListener("chargingchange", () => updateQuality(battery, true));
		await updateQuality(battery);
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

		if (!this.audioContextGain && volume <= 100) {
			if (this.audioContext) {
				this.audioContext.close();
			}

			this.elements.player.setVolume(volume);
		} else {
			if (!this.audioContext) {
				this.audioContext = new AudioContext();

				this.audioContextSource = this.audioContext.createMediaElementSource(document.querySelector('video'));
				this.audioContextGain = this.audioContext.createGain();

				this.audioContextGain.gain.value = 1;
				this.audioContextSource.connect(this.audioContextGain);
				this.audioContextGain.connect(this.audioContext.destination)
			}
			if (this.elements.player.getVolume() !== 100) { this.elements.player.setVolume(100);}
			this.audioContextGain.gain.value = volume / 100;
		}
	}
};
/*------------------------------------------------------------------------------
LOUDNESS NORMALIZATION
------------------------------------------------------------------------------*/
ImprovedTube.onvolumechange = function () {
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
				return;
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
	const video = ImprovedTube.elements.video,
		cvs = document.createElement('canvas'),
		ctx = cvs.getContext('2d');
	let subText = '';

	cvs.width = video.videoWidth;
	cvs.height = video.videoHeight;

	ctx.drawImage(video, 0, 0, cvs.width, cvs.height);

	if (ImprovedTube.storage.embed_subtitle != false) {
		let captionElements = document.querySelectorAll('.captions-text .ytp-caption-segment');
		captionElements.forEach(function (caption) {subText += caption.textContent.trim() + ' ';});

		ImprovedTube.renderSubtitle(ctx, captionElements);
	}

	cvs.toBlob(function (blob) {
		if (ImprovedTube.storage.player_screenshot_save_as == 'clipboard') {
			window.focus();
			navigator.clipboard.write([
				new ClipboardItem({
					'image/png': blob
				})
			])
				.then(function () { console.log("ImprovedTube: Screeeeeeenshot tada!"); })
				.catch(function (error) {
					console.log('ImprovedTube screenshot: ', error);
					alert('ImprovedTube Screenshot to Clipboard error. Details in Debug Console.');
				});
		} else {
			let a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = (ImprovedTube.videoId() || location.href.match) + ' ' + new Date(ImprovedTube.elements.player.getCurrentTime() * 1000).toISOString().substr(11, 8).replace(/:/g, '-') + ' ' + ImprovedTube.videoTitle() + (subText ? ' - ' + subText.trim() : '') + '.png';
			a.click();
			console.log("ImprovedTube: Screeeeeeenshot tada!");
		}
	});
};

ImprovedTube.renderSubtitle = function (ctx, captionElements) {
	if (ctx && captionElements) {
		captionElements.forEach(function (captionElement, index) {
			var captionText = captionElement.textContent.trim();
			var captionStyles = window.getComputedStyle(captionElement);

			ctx.fillStyle = captionStyles.color;
			ctx.font = captionStyles.font;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'bottom';
			var txtWidth = ctx.measureText(captionText).width;
			var txtHeight = parseFloat(captionStyles.fontSize);

			var xOfset = (ctx.canvas.width - txtWidth) / 2;

			var padding = 5; // Adjust the padding as needed
			var yofset = ctx.canvas.height - (captionElements.length - index) * (txtHeight + 2 * padding);

			ctx.fillStyle = captionStyles.backgroundColor;
			ctx.fillRect(xOfset - padding, yofset - txtHeight - padding, txtWidth + 2 * padding, txtHeight + 2 * padding);
			ctx.fillStyle = captionStyles.color;
			ctx.fillText(captionText, xOfset + txtWidth / 2, yofset);
		});
	}
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
	}
};
/*------------------------------------------------------------------------------
REPEAT
-------------------------------------------------------------------------------*/
ImprovedTube.playerRepeat = function () {
	setTimeout(function () {
		if (!/ad-showing/.test(ImprovedTube.elements.player.className)) {
			ImprovedTube.elements.video.setAttribute('loop', '');
		}
	   //ImprovedTube.elements.buttons['it-repeat-styles'].style.opacity = '1';   //old class from version 3.x? that both repeat buttons could have
		 	}, 200);
}
/*------------------------------------------------------------------------------
REPEAT BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.playerRepeatButton = function () {
	if (this.storage.player_repeat_button === true) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z');
		svg.appendChild(path);
		var transparentOrOn = 0.5; if (this.storage.player_always_repeat === true ) { transparentOrOn = 1; }
		this.createPlayerButton({
			id: 'it-repeat-button',
			child: svg,
			opacity: transparentOrOn,
			onclick: function () {
				var video = ImprovedTube.elements.video;
				function matchLoopState (opacity) {
					var thisButton = document.querySelector('#it-repeat-button');
					thisButton.style.opacity = opacity;
					if (ImprovedTube.storage.below_player_loop !== false) {
						var otherButton = document.querySelector('#it-below-player-loop');
						otherButton.children[0].style.opacity = opacity;
					}
				}		if (video.hasAttribute('loop')) {
					video.removeAttribute('loop');
					matchLoopState('.5')
				} else if (!/ad-showing/.test(ImprovedTube.elements.player.className)) {
					video.setAttribute('loop', '');
					matchLoopState('1')
				}
			},
			title: 'Repeat',
		});
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
	}
};

/*------------------------------------------------------------------------------
FIT-TO-WIN BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.playerFitToWinButton = function () {
	if (this.storage.player_fit_to_win_button === true && (/watch\?/.test(location.href))) {
	let tempContainer = document.createElement("div");
	let svg;
	if (typeof trustedTypes !== 'undefined' && typeof trustedTypes.createPolicy === 'function') {
		// Create a Trusted Type policy
		const policy = trustedTypes.createPolicy('default', {
			createHTML: (string) => string,
		});

		// Use the policy to set innerHTML
		tempContainer.innerHTML = policy.createHTML(`
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="ftw-icon">
		<path d="M21 3 9 15"/><path d="M12 3H3v18h18v-9"/><path d="M16 3h5v5"/><path d="M14 15H9v-5"/></svg>`);

		// Ensure the SVG element is correctly parsed
        	svg = tempContainer.querySelector('svg');
	} else {tempContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="ftw-icon">
 		<path d="M21 3 9 15"/><path d="M12 3H3v18h18v-9"/><path d="M16 3h5v5"/><path d="M14 15H9v-5"/></svg>`;
		svg = tempContainer.firstChild;}
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
	}
};

/*------------------------------------------------------------------------------
CINEMA MODE BUTTON
------------------------------------------------------------------------------*/
var xpath = function (xpathToExecute) {
	var result = [];
	var nodesSnapshot = document.evaluate(xpathToExecute, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
	for ( var i=0; i < nodesSnapshot.snapshotLength; i++ ) {
	  result.push( nodesSnapshot.snapshotItem(i) );
	}
	return result;
}

function createOverlay () {
	var overlay = document.createElement('div');
	overlay.id = 'overlay_cinema';
	overlay.style.position = 'fixed';
	overlay.style.top = '0';
	overlay.style.left = '0';
	overlay.style.width = '100%';
	overlay.style.height = '100%';
	overlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
	overlay.style.zIndex = '9999';
	overlay.style.display = 'block';
	document.body.appendChild(overlay);
}

ImprovedTube.playerCinemaModeButton = function () {
	if (this.storage.player_cinema_mode_button && (/watch\?/.test(location.href))) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		// TODO: change path such that cinema mode has its own unique icon
		path.setAttributeNS(null, 'd', 'm 2.1852 2.2 h 3.7188 h 5.2974 h 5.184 h 3.5478 c 0.6012 0 1.1484 0.2737 1.5444 0.7113 c 0.396 0.4396 0.6408 1.047 0.6408 1.7143 v 1.4246 v 11.4386 v 1.4166 c 0 0.6673 -0.2466 1.2747 -0.6408 1.7143 c -0.396 0.4396 -0.9432 0.7113 -1.5444 0.7113 h -3.456 c -0.0288 0.006 -0.0594 0.008 -0.0918 0.008 c -0.0306 0 -0.0612 -0.002 -0.0918 -0.008 h -5.0004 c -0.0288 0.006 -0.0594 0.008 -0.0918 0.008 c -0.0306 0 -0.0612 -0.002 -0.0918 -0.008 h -5.1138 c -0.0288 0.006 -0.0594 0.008 -0.0918 0.008 c -0.0306 0 -0.0612 -0.002 -0.0918 -0.008 h -3.627 c -0.6012 0 -1.1484 -0.2737 -1.5444 -0.7113 s -0.6408 -1.047 -0.6408 -1.7143 v -1.4166 v -11.4386 v -1.4246 c 0 -0.6673 0.2466 -1.2747 0.6408 -1.7143 c 0.396 -0.4376 0.9432 -0.7113 1.5444 -0.7113 l 0 0 z m 7.749 6.2418 l 3.6954 2.8611 c 0.0576 0.04 0.1098 0.0959 0.1512 0.1618 c 0.1656 0.2657 0.1044 0.6274 -0.1332 0.8112 l -3.681 2.8252 c -0.09 0.0819 -0.207 0.1319 -0.333 0.1319 c -0.2916 0 -0.5274 -0.2617 -0.5274 -0.5854 v -5.7283 h 0.0018 c 0 -0.1159 0.0306 -0.2318 0.0936 -0.3337 c 0.1674 -0.2637 0.495 -0.3277 0.7326 -0.1439 l 0 0 z m 6.9768 9.6324 v 2.0879 h 3.0204 c 0.3114 0 0.594 -0.1419 0.7992 -0.3696 c 0.2052 -0.2278 0.333 -0.5415 0.333 -0.8871 v -0.8312 h -4.1526 l 0 0 z m -1.053 2.0879 v -2.0879 h -4.1292 v 2.0879 h 4.1292 l 0 0 z m -5.1822 0 v -2.0879 h -4.2444 v 2.0879 h 4.2444 l 0 0 z m -5.2992 0 v -2.0879 h -4.3236 v 0.8312 c 0 0.3457 0.1278 0.6593 0.333 0.8871 c 0.2052 0.2278 0.4878 0.3696 0.7992 0.3696 h 3.1914 l 0 0 z m -4.3236 -3.2567 h 4.851 h 5.2974 h 5.184 h 4.68 v -10.2697 h -4.68 h -5.184 h -5.2974 h -4.851 v 10.2697 l 0 0 z m 14.805 -11.4386 v -2.0979 h -4.1292 v 2.0959 h 4.1292 l 0 0.002 z m 1.053 -2.0979 v 2.0959 h 4.1526 v -0.8392 c 0 -0.3457 -0.1278 -0.6593 -0.333 -0.8871 c -0.2052 -0.2278 -0.4878 -0.3696 -0.7992 -0.3696 h -3.0204 l 0 0 z m -6.2352 2.0979 v -2.0979 h -4.2444 v 2.0959 h 4.2444 l 0 0.002 z m -5.2992 0 v -2.0979 h -3.1914 c -0.3114 0 -0.594 0.1419 -0.7992 0.3696 c -0.2052 0.2278 -0.333 0.5415 -0.333 0.8871 v 0.8392 h 4.3236 l 0 0.002 z');

		svg.appendChild(path);

		this.createPlayerButton({
			id: 'it-cinema-mode-button',
			child: svg,
			// position: "right", // using right only works when we also have fit to window button enabled for some reason
			opacity: 0.64,
			onclick: function () {
				var player = xpath('//*[@id="movie_player"]/div[1]/video')[0].parentNode.parentNode
				// console.log(player)
				if (player.style.zIndex == 10000) {
					player.style.zIndex = 1;
					svg.parentNode.style.opacity = 0.64;
					svg.parentNode.style.zIndex = 1;
				} else {
					player.style.zIndex = 10000;
					svg.parentNode.style.opacity = 1;
				}

				var overlay = document.getElementById('overlay_cinema');
				if (!overlay) {
					createOverlay();
				} else {
					overlay.style.display = overlay.style.display === 'none' || overlay.style.display === '' ? 'block' : 'none';
				}
				//console.log(overlay)
			},
			title: 'Cinema Mode'
		});
	}
}

ImprovedTube.playerCinemaModeDisable = function () {
	if (this.storage.player_auto_hide_cinema_mode_when_paused) {
		var overlay = document.getElementById('overlay_cinema');
		if (overlay) {
			overlay.style.display = 'none'
			var player = xpath('//*[@id="movie_player"]/div[1]/video')[0].parentNode.parentNode
			player.style.zIndex = 1;
			var cinemaModeButton = xpath('//*[@id="it-cinema-mode-button"]')[0]
			cinemaModeButton.style.opacity = 0.64
		}
	}
}

ImprovedTube.playerCinemaModeEnable = function () {
	if (this.storage.player_auto_cinema_mode || this.storage.player_auto_hide_cinema_mode_when_paused) {

		if ((/watch\?/.test(location.href))) {
			var overlay = document.getElementById('overlay_cinema');

			if (this.storage.player_auto_cinema_mode === true && !overlay) {
				createOverlay();
				overlay = document.getElementById('overlay_cinema');
			}

			// console.log(overlay && this.storage.player_auto_hide_cinema_mode_when_paused === true || this.storage.player_auto_cinema_mode === true && overlay)
			if (overlay) {
				overlay.style.display = 'block'
				var player = xpath('//*[@id="movie_player"]/div[1]/video')[0].parentNode.parentNode
				player.style.zIndex = 10000;
				// console.log(player)
				var cinemaModeButton = xpath('//*[@id="it-cinema-mode-button"]')[0]
				cinemaModeButton.style.opacity = 1
			}
		}
	}
}

/*------------------------------------------------------------------------------
HAMBURGER MENU
------------------------------------------------------------------------------*/
ImprovedTube.playerHamburgerButton = function () {
	if (this.storage.player_hamburger_button === true) {
		const videoPlayer = document.querySelector('.html5-video-player');

		if (!videoPlayer) {
			return;
		}

		const controlsContainer = videoPlayer.querySelector('.ytp-right-controls');

		if (!controlsContainer) {
			return;
		}

		let hamburgerMenu = document.querySelector('.custom-hamburger-menu');
		if (!hamburgerMenu) {
			hamburgerMenu = document.createElement('div');
			hamburgerMenu.className = 'custom-hamburger-menu';
			hamburgerMenu.style.position = 'absolute';
			hamburgerMenu.style.right = '0';
			hamburgerMenu.style.marginTop = '8px';
			hamburgerMenu.style.cursor = 'pointer';

			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
			svg.setAttribute('style', 'width: 32px; height: 32px;');

			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttributeNS(null, 'd', 'M3 18h18v-2H3v2zM3 13h18v-2H3v2zM3 6v2h18V6H3z');
			path.setAttributeNS(null, 'fill', 'white');

			svg.appendChild(path);
			hamburgerMenu.appendChild(svg);

			controlsContainer.style.paddingRight = '40px';
			controlsContainer.parentNode.appendChild(hamburgerMenu);

			let controlsVisible = true;
			controlsContainer.style.display = controlsVisible ? 'none' : 'flex';
			controlsVisible = false;

			hamburgerMenu.addEventListener('click', function () {
				controlsContainer.style.display = controlsVisible ? 'none' : 'flex';
				controlsVisible = !controlsVisible;

				// Change the opacity of hamburgerMenu based on controls visibility
				hamburgerMenu.style.opacity = controlsVisible ? '0.85' : '0.65';
			});
		}
	}
};
/*------------------------------------------------------------------------------
POPUP PLAYER
------------------------------------------------------------------------------*/
ImprovedTube.playerPopupButton = function () {
	if (this.storage.player_popup_button === true && location.href.indexOf('youtube.com/embed') === -1 ) {
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
				"use strict";
				const ytPlayer = ImprovedTube.elements.player;
				ytPlayer.pauseVideo();
				const videoID = location.search.match(ImprovedTube.regex.video_id)[1],
					listMatch = location.search.match(ImprovedTube.regex.playlist_id),
					popup = window.open(
						`${location.protocol}//www.youtube.com/embed/${videoID}?start=${parseInt(ytPlayer.getCurrentTime())}&autoplay=${ImprovedTube.storage.player_autoplay_disable ? '0' : '1'}${listMatch?`&list=${listMatch[1]}`:''}`,
						'_blank',
						`directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=${ytPlayer.offsetWidth / 3},height=${ytPlayer.offsetHeight / 3}`
					);
				if (popup && listMatch) {
					//! If the video is not in the playlist or not within the first 200 entries, then it automatically selects the first video in the list.
					popup.addEventListener('load', function () {
						"use strict";
						//~ check if the video ID in the link of the video title matches the original video ID in the URL and if not remove the playlist from the URL (reloads the page).
						const videoLink = this.document.querySelector('div#player div.ytp-title-text>a[href]');
						if (videoLink && videoLink.href.match(ImprovedTube.regex.video_id)[1] !== videoID) this.location.search = this.location.search.replace(/(\?)list=[^&]+&|&list=[^&]+/, '$1');
					}, {passive: true, once: true});
				}
				//~ change focused tab to URL-less popup
				ImprovedTube.messages.send({
					action: 'fixPopup',
					width: ytPlayer.offsetWidth * 0.75,
					height: ytPlayer.offsetHeight * 0.75,
					title: document.title
				});
			},
			title: 'Popup'
		});
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
ImprovedTube.playerControls = function () {
	const player = this.elements.player,
		hide = this.storage.player_hide_controls;

	if (player && player.hideControls && player.showControls) {

		if (hide === 'when_paused' && this.elements.video.paused) {
			player.hideControls();

			player.onmouseenter = player.showControls;
			player.onmouseleave = player.hideControls;
			player.onmousemove = (function () {
				let thread,
					onmousestop = function () {
						if (document.querySelector(".ytp-progress-bar:hover")) {
							thread = setTimeout(onmousestop, 1000);
						} else {
							player.hideControls();
						}
					};

				return function () {
					player.showControls();
					clearTimeout(thread);
					thread = setTimeout(onmousestop, 1000);
				};
			})();
			return;
		} else if (hide === 'always') {
			player.hideControls();
		} else {
			player.showControls();
		}
		player.onmouseenter = null;
		player.onmouseleave = null;
		player.onmousemove = null;
	}
};
/*#  HIDE VIDEO TITLE IN FULLSCREEN	*/ // Easier with CSS only (see player.css)
//ImprovedTube.hideVideoTitleFullScreen = function (){ if (ImprovedTube.storage.hide_video_title_fullScreen === true) {
//document.addEventListener('fullscreenchange', function (){ document.querySelector(".ytp-title-text > a")?.style.setProperty('display', 'none');   }) }};

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

		window.addEventListener('resize', ImprovedTube.miniPlayer_scroll);
	} else if (window.scrollY < 256 && ImprovedTube.mini_player__mode === true || ImprovedTube.elements.player.classList.contains('ytp-player-minimized') === true) {
		ImprovedTube.mini_player__mode = false;
		ImprovedTube.elements.player.classList.remove('it-mini-player');
		ImprovedTube.mini_player__move = false;
		ImprovedTube.elements.player.style.transform = 'translate(' + 0 + 'px, ' + 0 + 'px)';
		ImprovedTube.elements.player.style.width = '';
		ImprovedTube.elements.player.style.height = '';

		ImprovedTube.mini_player__cursor = '';
		document.documentElement.removeAttribute('it-mini-player-cursor');

		window.dispatchEvent(new Event('resize'));

		window.removeEventListener('mousedown', ImprovedTube.miniPlayer_mouseDown);
		window.removeEventListener('mousemove', ImprovedTube.miniPlayer_mouseMove);
		window.removeEventListener('mouseup', ImprovedTube.miniPlayer_mouseUp);
		window.removeEventListener('click', ImprovedTube.miniPlayer_click);
		window.removeEventListener('scroll', ImprovedTube.miniPlayer_scroll);
		window.removeEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);
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

ImprovedTube.miniPlayer_resize = function () {
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

ImprovedTube.miniPlayer_resizeMouseUp = function () {
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

		data.x = data.x || 300;
		data.y = data.y || 35;
		data.width = data.width || 300;
		data.height = data.height || 225;

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

/*------------------------------------------------------------------------------
CUSTOM PAUSE FUNCTIONS
------------------------------------------------------------------------------*/
ImprovedTube.pauseWhileTypingOnYoutube = function () {
	if (ImprovedTube.storage.pause_while_typing_on_youtube === true) {
		var timeoutId; // Declare a variable to hold the timeout ID

		// Add event listener to the whole document
		document.addEventListener('keydown', function (e) {
		// Check on the storage for pause_while_typing_on_youtube_storage is false

			// If player is NOT in the viewport, return
			if (!isPlayerInViewport()) {
				return;
			}

			var player = ImprovedTube.elements.player;

			if (player) {
				if (
					(/^[a-z0-9]$/i.test(e.key) || e.key === "Backspace") &&
				!(e.ctrlKey && (e.key === "c" || e.key === "x" || e.key === "a")) &&
				( document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "DIV" )) {
				// Pause the video
				// Check if player is paused
					if (!player.paused) {
						player.pauseVideo();
					}

					// Clear any existing timeout
					if (timeoutId) {
						clearTimeout(timeoutId);
					}

					// Set a new timeout to play the video after 1 second
					timeoutId = setTimeout(function () {
						player.playVideo();
					}, 2000); // 2000 milliseconds = 2 seconds
				}
			}
		});

		function isPlayerInViewport () {
			var player = ImprovedTube.elements.player;
			if (player) {
				var rect = player.getBoundingClientRect();
				var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
				var windowWidth = (window.innerWidth || document.documentElement.clientWidth);

				// Check if the player is in the viewport
				return (
					rect.top != 0 &&
				rect.left != 0 &&
				rect.bottom <= windowHeight &&
				rect.right <= windowWidth
				);
			}
			return false;
		}

	}
};

/*------------------------------------------------------------------------------
HIDE PROGRESS BAR PREVIEW
------------------------------------------------------------------------------*/
ImprovedTube.playerHideProgressPreview = function () {
	if (this.storage.player_hide_progress_preview === true) {
		document.documentElement.setAttribute('it-hide-progress-preview', 'true');
	} else {
		document.documentElement.removeAttribute('it-hide-progress-preview');
	}
};
