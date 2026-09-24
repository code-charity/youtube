/*------------------------------------------------------------------------------
FORCED PLAY VIDEO FROM THE BEGINNING
------------------------------------------------------------------------------*/
ImprovedTube.forcedPlayVideoFromTheBeginning = function () {
	const player = this.elements.player,		video = this.elements.video,		paused = video?.paused;
 const t = this.video_url.match(this.regex.video_time)?.[1];
	if (t) {
		if (/[#&]stop=|#t=/.test(this.video_url)) return;
		const r = document.referrer || ""; if (r && !r.includes("youtube.com")) return;
		const h = history || ""; if (h && (h.length === 1 || !h.state?.endpoint?.watchEndpoint)) return;
	}
	if (player && video && this.storage.forced_play_video_from_the_beginning && location.pathname == '/watch') {
		// Skip the seek when the video is effectively already at 0. When
		// YouTube's own playback starts at 0 (fresh video, never watched), a
		// seekTo(0) after page load produces an audible "double play" of the
		// opening moments. Only seek when YouTube has resumed from a saved
		// timestamp (currentTime > 0), which is the case this setting exists
		// to override.
		if (video.currentTime > 1.1) {  // video.currentTime = 0; #262
			player.seekTo(0);
			// restore previous paused state after the seek
			if (paused) { player.pauseVideo(); }
		}
	}
};
/*------------------------------------------------------------------------------
AUTOPAUSE WHEN SWITCHING TABS
------------------------------------------------------------------------------*/
ImprovedTube.playerAutopauseWhenSwitchingTabs = function () {
	const player = this.elements.player,
		video = this.elements.video,
		isVisibleTab = document.visibilityState === 'visible' && document.hasFocus();

	if (this.storage.player_autopause_when_switching_tabs && player && video) {
		if (this.focus && isVisibleTab && this.played_before_blur && video.paused) {
			player.playVideo();
		} else {
			this.played_before_blur = !video.paused;
			if (!video.paused) {
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
	const [player, video] = (document.documentElement.dataset.pageType === 'shorts')
		? [this.elements.shorts_player, this.elements.shorts_player?.querySelector('video')]
		: [this.elements.player, this.elements.video],
		speed = video?.playbackRate ? Number(video.playbackRate.toFixed(2)) : (player?.getPlaybackRate ? Number(player.getPlaybackRate().toFixed(2)) : null);

	if (!speed) {
		console.error('PlaybackSpeed: Cant establish playbackRate/getPlaybackRate');
		return false;
	}

	// called with no option or demanded speed already set, only provide readback
	if (!newSpeed || speed == newSpeed) return speed;

	if (video?.playbackRate) {
		video.playbackRate = newSpeed;
		newSpeed = Number(video.playbackRate.toFixed(2));
	} else if (player?.setPlaybackRate && player.getPlaybackRate) {
		player.setPlaybackRate(newSpeed);
		newSpeed = Number(player.getPlaybackRate().toFixed(2));
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
		 if (speed !== option && speed !== 1 && speed !== Number((Math.floor(option / 0.05) * 0.05).toFixed(2)))
		   { console.log("skipping permanent speed, since speed was manually set differently for this video to:" + video.playbackRate + ", was it?"); return; }
	}
	if (!(player.getVideoData() && player.getVideoData().isLive))
	{ player.setPlaybackRate(Number(option)); if (!video) { video = { playbackRate: 1 }; };	video.playbackRate = Number(option); // #1729 q2 // hi! @raszpl
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
					var musicIdentifiersTagsOnly = /^(lyrics|remix|song|music|AMV|theme song|full song)$|\(Musical Genre\)|^jazz|^reggae/i;
					var musicIdentifiersTags = new RegExp(musicIdentifiersTagsOnly.source + '|' + musicIdentifiers.source, "i");
				    var keywordList = (keywords || '').split(', ').map(keyword => keyword.trim()).filter(Boolean);
				    var musicKeywordCount = keywordList.filter(keyword => musicIdentifiersTags.test(keyword)).length;
					keywordsAmount = keywordList.length;
					if ( keywordsAmount && musicKeywordCount / keywordsAmount > 0.08) {
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
			|| (amountOfSongs && typeof testSongDuration(DATA.lengthSeconds, amountOfSongs ) !== 'undefined')
		 //	||  location.href.indexOf('music.') !== -1  // (=currently we are only running on www.youtube.com anyways)
				)	{ player.setPlaybackRate(1); video.playbackRate = 1; console.log ("...,thus must be music?"); }
				else { 	// Now this video might rarely be music
					// - however we can make extra-sure after waiting for the video descripion to load... (#1539)
					if (location.href.indexOf('/watch?') !== -1) {
						let tries = 0;
						const intervalMs = 210;
						const maxTries = 10;
						const waitForDescription = setInterval(() => {
							const subtitle = document.querySelector('#title + #subtitle:last-of-type');
							// console.log("[SPEED] checking for music keywords in the description... try " + tries + "// subtitle: " + subtitle?.innerHTML);
							const descriptionSongCount = Number((subtitle?.innerHTML?.match(/^\d+/) || [])[0]);
							if (subtitle && 1 <= descriptionSongCount && typeof testSongDuration(DATA.lengthSeconds, descriptionSongCount) !== 'undefined')
							{player.setPlaybackRate(1); video.playbackRate = 1; console.log("...but YouTube shows music below the description!"); clearInterval(waitForDescription); return; }
							if (++tries >= maxTries) {
								// console.log("[SPEED] max tries reached, stopping description check...");
								clearInterval(waitForDescription);
							}
						}, intervalMs);
					}
				}
			}
			//DATA  (TO-DO: make the Data available to more/all features? #1452  #1763  (Then can replace ImprovedTube.elements.category === 'music', VideoID is also used elsewhere)
			DATA = {};
			defaultKeywords = "video,sharing,camera,phone,video phone,free,upload";
			keywords = false; amountOfSongs = false;

			ImprovedTube.fetchDOMData = function () {
				try { DATA = JSON.parse(document.querySelector('#microformat script')?.textContent) ?? false; DATA.title = DATA.name;}
			 catch { DATA.genre = false; DATA.keywords = false; DATA.lengthSeconds = false;
					try {
						DATA.title = document.getElementsByTagName('meta')?.title?.content || false;
						DATA.genre = document.querySelector('meta[itemprop=genre]')?.content || false;
						DATA.duration = document.querySelector('meta[itemprop=duration]')?.content || false;
			 } catch {}}

let tries = 0; const maxTries = 11; let intervalMs = 200;
const waitForVideoTitle = setInterval(() => { const title = ImprovedTube.videoTitle?.();  tries++;

if (title && title !== 'YouTube') {
    clearInterval(waitForVideoTitle);
			 DATA.videoID = ImprovedTube.videoId() || false;     // console.log("SPEED: TITLE:" + ImprovedTube.videoTitle() + DATA.title);
			 if ( DATA.title && (DATA.title === ImprovedTube.videoTitle() || DATA.title.replace(/\s{2,}/g, ' ') === ImprovedTube.videoTitle()) )
				{ keywords = document.querySelector('meta[name="keywords"]')?.content || ''; ImprovedTube.speedException(); }
				else { keywords = ''; (async function () { try { const response = await fetch(`https://www.youtube.com/watch?v=${DATA.videoID}`);
					console.log("loading the html source:" + `https://www.youtube.com/watch?v=${DATA.videoID}`);
					const htmlContent = await response.text();
					const metaRegex = /<meta[^>]+(?:name|itemprop)=["'](keywords|genre|duration|title)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
					let match; while ((match = metaRegex.exec(htmlContent)) !== null) { // console.log(match);
						const [, property, value] = match;
						if (property === 'keywords') { keywords = value;} else {DATA[property] = value;}
					}
					amountOfSongs = (htmlContent.slice(-80000).match(/},"subtitle":{"simpleText":"(\d*)\s/) || [])[1] || false;
					if (keywords) { ImprovedTube.speedException(); }
				} catch (error) { console.error('Error: fetching from https://Youtube.com/watch?v=${DATA.videoID}', error); keywords = ''; }
				})();
				}
}

if (tries >= maxTries) {  clearInterval(waitForVideoTitle); } intervalMs *= 1.11; }, intervalMs);
window.addEventListener('load', () => {  setTimeout(() => { clearInterval(waitForVideoTitle) }, 5000);});
			};
			ImprovedTube.fetchDOMData();
/*
			if ( (history && history.length === 1) || !history?.state?.endpoint?.watchEndpoint) { ImprovedTube.fetchDOMData(); }
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
*/
		}	// else { }
	}
}
}
/*------------------------------------------------------------------------------
SUBTITLES
------------------------------------------------------------------------------*/
ImprovedTube.playerSubtitles = function (attempt = 0) {
	const player = this.elements.player;

	if (player) {
		if (player.isSubtitlesOn && player.toggleSubtitles && player.toggleSubtitlesOn) {
			switch (this.storage.player_subtitles) {
				case true:
				case 'enabled':
					player.toggleSubtitlesOn();
					break

				case 'disabled':
					if (player.isSubtitlesOn()) { player.toggleSubtitles(); }
					break
			}
		} else if (attempt < 10) {
			setTimeout(() => {
				ImprovedTube.playerSubtitles(attempt + 1);
			}, 200 + 30 * attempt);
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
		if (video && Number.isFinite(video.duration)) video.currentTime = video.duration;
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
	if (this.storage.player_autofullscreen !== true) {
		return;
	}
	if (document.documentElement.dataset.pageType !== 'video') {
		return;
	}

	var player = this.elements.player;
	if (!player || typeof player.toggleFullscreen !== 'function') {
		return;
	}

	// Once per video URL after a successful enter (avoids re-toggling on pause/play).
	if (this._autofullscreenFor === location.href) {
		return;
	}

	var alreadyFullscreen = !!(
		document.fullscreenElement ||
		document.webkitFullscreenElement ||
		document.mozFullScreenElement ||
		player.classList.contains('ytp-fullscreen') ||
		(typeof player.isFullscreen === 'function' && player.isFullscreen())
	);

	if (alreadyFullscreen) {
		this._autofullscreenFor = location.href;
		return;
	}

	try {
		player.toggleFullscreen();
	} catch (error) {
		return;
	}

	// Firefox often rejects fullscreen without a user gesture (navigate-time call).
	// Only lock this video if fullscreen actually engaged; otherwise allow retry on play.
	setTimeout(function () {
		var playerNow = ImprovedTube.elements.player;
		var ok = !!(
			document.fullscreenElement ||
			document.webkitFullscreenElement ||
			document.mozFullScreenElement ||
			(playerNow && playerNow.classList.contains('ytp-fullscreen'))
		);
		if (ok) {
			ImprovedTube._autofullscreenFor = location.href;
		}
	}, 250);
};
/*------------------------------------------------------------------------------
QUALITY
------------------------------------------------------------------------------*/
ImprovedTube.playerQuality = function (quality = this.storage.player_quality) {
  var playlistQ = this.storage.player_quality_playlist;
  var isPlaylist = !!(
    new URLSearchParams(location.search).has('list') ||
    document.querySelector('ytd-playlist-panel-renderer')
  );
  if (isPlaylist && playlistQ && playlistQ !== 'disabled') {
    quality = playlistQ;
  }

  let player = this.elements.player;
	if (quality && quality !== 'disabled'
		&& player && player.getAvailableQualityLevels
		&& (!player.dataset.defaultQuality || player.dataset.defaultQuality != quality)) {
		let available_quality_levels = player.getAvailableQualityLevels();
		try {
			const hasTrue1080pOrHigher = available_quality_levels.some(q =>
				['hd1080', 'hd1440', 'hd2160', 'hd2880', 'highres'].includes(q)
			);
			if (
				!hasTrue1080pOrHigher &&
				['hd1080', 'hd1440', 'hd2160', 'hd2880', 'highres'].includes(quality)
			) {
				console.log('[ImprovedTube] Preventing AI-upscaled "Super Resolution" — capping to 720p.');
				quality = 'hd720';
			}
		} catch (e) {
			console.warn('[ImprovedTube] Error checking available quality levels', e);
		}
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
QUALITY FULL SCREEN
------------------------------------------------------------------------------*/
ImprovedTube.playerQualityFullScreen = function () {
   var isFs = !!(
     document.fullscreenElement ||
     document.webkitFullscreenElement ||
     document.mozFullScreenElement ||
     document.msFullscreenElement ||
     document.webkitIsFullScreen ||
     document.mozFullScreen
   );

   var fsq = ImprovedTube.storage.full_screen_quality;
	 var playlistQ = ImprovedTube.storage.player_quality_playlist;
	 var isPlaylist = !!(
    new URLSearchParams(location.search).has('list') ||
    document.querySelector('ytd-playlist-panel-renderer') ||
    document.querySelector('#playlist')
		);
	 var target = isFs ? fsq : (isPlaylist && playlistQ && playlistQ !== 'disabled') ? playlistQ : ImprovedTube.storage.player_quality;

   var map = {
     '144p':'tiny','240p':'small','360p':'medium','480p':'large',
     '720p':'hd720','1080p':'hd1080','1440p':'hd1440','2160p':'hd2160','4320p':'highres',
     'tiny':'tiny','small':'small','medium':'medium','large':'large',
     'hd720':'hd720','hd1080':'hd1080','hd1440':'hd1440','hd2160':'hd2160','highres':'highres'
   };
   var desired = map[target] || target;

   function applyQuality(){
    var isPlaylist = !!(
        new URLSearchParams(location.search).has('list') ||
        document.querySelector('ytd-playlist-panel-renderer')
    );
    var finalTarget = isFs ? fsq
        : (isPlaylist && playlistQ && playlistQ !== 'disabled') ? playlistQ
        : ImprovedTube.storage.player_quality;
    var desired = map[finalTarget] || finalTarget;

    var player = ImprovedTube.elements && ImprovedTube.elements.player;
    if (!player) return;
    if (typeof ImprovedTube.playerQuality === 'function') {
        ImprovedTube.playerQuality(desired);
        return;
    }
    try { if (typeof player.setPlaybackQualityRange === 'function') player.setPlaybackQualityRange(desired, desired); } catch(e) {console.log(e)}
    try { if (typeof player.setPlaybackQuality === 'function') player.setPlaybackQuality(desired); } catch(e) {console.log(e)}
}

  setTimeout(applyQuality, 300);
	setTimeout(applyQuality, 800);
	setTimeout(applyQuality, 1500);
	setTimeout(applyQuality, 3000);
   }


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
		// Fix: Explicitly handle mute state
		if (volume === 0) {
			if (!this.elements.player.isMuted()) {
				this.elements.player.mute();
			}
		} else {
			if (this.elements.player.isMuted()) {
				this.elements.player.unMute();
			}
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
			const channelNameEl = document.querySelector('.ytd-channel-name a') || document.querySelector('#upload-info .ytd-channel-name');
			const channelName = channelNameEl ? channelNameEl.textContent.trim() : '';
			a.download = (ImprovedTube.videoId() || location.href.match) + ' ' + new Date(ImprovedTube.elements.player.getCurrentTime() * 1000).toISOString().substr(11, 8).replace(/:/g, '-') + (channelName ? ' ' + channelName : '') + ' ' + ImprovedTube.videoTitle() + (subText ? ' - ' + subText.trim() : '') + '.png';
			a.click();
			console.log("ImprovedTube: Screeeeeeenshot tada!");
		}
	});
};

ImprovedTube.copyTranscript = function (svg, button) {
	try {
		svg.style.opacity = '1';
		button.dataset.tooltip = 'FetchingTranscript';

		var existingTranscriptSegments = document.querySelectorAll('ytd-transcript-segment-renderer');
		if (existingTranscriptSegments.length > 0) {
			var transcriptText = '';
			existingTranscriptSegments.forEach(function (segment) {
				var textElement = segment.querySelector('.segment-text');
				if (textElement) {
					transcriptText += textElement.textContent.trim() + ' ';
				}
			});

			transcriptText = transcriptText.trim();
			if (transcriptText) {
				navigator.clipboard.writeText(transcriptText);
				button.dataset.tooltip = 'Copied!';
				setTimeout(function () {
					button.dataset.tooltip = 'CopyTranscript';
					svg.style.opacity = '.5';
				}, 1000);
				return;
			}
		}
		var transcriptButtonSelector = 'button[aria-label*="scrip"], button[aria-label*="skrip"], button[aria-label*="скрипт"], button[aria-label*="스크립"], button[aria-label*="スクリ"],'
										+ 'button[aria-label*="guion"], button[aria-label*="naskah"], button[aria-label*="脚本"], button[aria-label*="文字"], button[aria-label*="نص"], button[aria-label*="نقل"],'
										+ 'button[aria-label*="प्रतिलि"], button[aria-label*="प्रत"], button[aria-label*="লিপি"], button[aria-label*="bản ghi"], button[aria-label*="steno"],'
										+ 'button[aria-label*="γραφ"], button[aria-label*="přep"], button[aria-label*="átir"], button[aria-label*="avsk"]';
		var transcriptButton = document.querySelector(transcriptButtonSelector) || document.querySelector('ytd-video-description-transcript-section-renderer button');

		if (!transcriptButton) {
			var moreActionsButton = document.querySelector('#description ytd-text-inline-expander #expand, #description tp-yt-paper-button#expand');
			if (moreActionsButton && !moreActionsButton.hasAttribute('hidden')) {
				moreActionsButton.click();
				setTimeout(function () {
					transcriptButton = document.querySelector(transcriptButtonSelector) || 	document.querySelector('ytd-video-description-transcript-section-renderer button');
					if (transcriptButton) {
						transcriptButton.click();
						ImprovedTube.waitForTranscriptAndCopy(svg, button);
					} else {
						throw new Error('Transcript button not found');
					}
				}, 500);
				return;
			} else {
				throw new Error('Transcript not available for this video');
			}
		}

		transcriptButton.click();
		ImprovedTube.waitForTranscriptAndCopy(svg, button);

	} catch (error) {
		console.error('ImprovedTube: Failed to copy transcript:', error);
		button.dataset.tooltip = 'TranscriptError';
		setTimeout(function () {
			button.dataset.tooltip = 'CopyTranscript';
			svg.style.opacity = '.5';
		}, 2000);
	}
};

ImprovedTube.waitForTranscriptAndCopy = function (svg, button) {
	var attempts = 0;
	var maxAttempts = 20;

	var checkInterval = setInterval(function () {
		attempts++;

		var transcriptSegments = document.querySelectorAll('ytd-transcript-segment-renderer');

		if (transcriptSegments.length > 0) {
			clearInterval(checkInterval);

			var transcriptText = '';

			transcriptSegments.forEach(function (segment) {
				var textElement = segment.querySelector('.segment-text');
				if (textElement) {
					transcriptText += textElement.textContent.trim() + ' ';
				}
			});

			transcriptText = transcriptText.trim();

			if (transcriptText) {
				navigator.clipboard.writeText(transcriptText);
				button.dataset.tooltip = 'Copied!';
				setTimeout(function () {
					button.dataset.tooltip = 'CopyTranscript';
					svg.style.opacity = '.5';
					// Close transcript panel
					var closeButton = document.querySelector('ytd-engagement-panel-title-header-renderer button[aria-label*="lose"]') ||
						document.querySelector('ytd-engagement-panel-title-header-renderer button[aria-label*="акрыть"]');
					if (closeButton) {
						closeButton.click();
					}
				}, 1000);
			} else {
				throw new Error('Transcript is empty');
			}
		} else if (attempts >= maxAttempts) {
			clearInterval(checkInterval);
			console.error('ImprovedTube: Timeout waiting for transcript');
			button.dataset.tooltip = 'TranscriptError';
			setTimeout(function () {
				button.dataset.tooltip = 'CopyTranscript';
				svg.style.opacity = '.5';
			}, 2000);
		}
	}, 250);
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
VIDEO FILTERS BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.playerVideoFiltersButton = function () {
	if (this.storage.player_video_filters_button !== false) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z');

		svg.appendChild(path);

		const isActive = this.storage.video_filters_activate !== false && 
			(this.storage.video_filters_preset !== 'normal' || 
			 (Number(this.storage.video_filter_brightness) !== 100 && this.isset(this.storage.video_filter_brightness)) ||
			 (Number(this.storage.video_filter_contrast) !== 100 && this.isset(this.storage.video_filter_contrast)) ||
			 (Number(this.storage.video_filter_saturation) !== 100 && this.isset(this.storage.video_filter_saturation)) ||
			 (Number(this.storage.video_filter_hue) !== 0 && this.isset(this.storage.video_filter_hue)) ||
			 (Number(this.storage.video_filter_sharpness) > 0 && this.isset(this.storage.video_filter_sharpness)) ||
			 (Number(this.storage.video_filter_gamma) !== 1 && this.isset(this.storage.video_filter_gamma)));

		this.createPlayerButton({
			id: 'it-video-filters-button',
			child: svg,
			opacity: isActive ? 1 : 0.55,
			onclick: function (e) {
				if (e.shiftKey) {
					const presets = ['normal', 'vivid', 'cinema', 'warm', 'cool'];
					let current = ImprovedTube.storage.video_filters_preset || 'normal';
					let nextIdx = (presets.indexOf(current) + 1) % presets.length;
					let nextPreset = presets[nextIdx];
					ImprovedTube.storage.video_filters_preset = nextPreset;
					ImprovedTube.storage.video_filters_activate = true;
					ImprovedTube.messages.send({ action: 'set', key: 'video_filters_preset', value: nextPreset });
					ImprovedTube.messages.send({ action: 'set', key: 'video_filters_activate', value: true });
					ImprovedTube.videoFilters();
					ImprovedTube.showStatus('Filter: ' + nextPreset.toUpperCase());
				} else {
					ImprovedTube.storage.video_filters_activate = ImprovedTube.storage.video_filters_activate === false ? true : false;
					ImprovedTube.messages.send({ action: 'set', key: 'video_filters_activate', value: ImprovedTube.storage.video_filters_activate });
					ImprovedTube.videoFilters();
					ImprovedTube.showStatus('Filters: ' + (ImprovedTube.storage.video_filters_activate ? 'ON' : 'OFF'));
				}
			},
			title: 'Video Filters (Click: Toggle, Shift+Click: Cycle Presets)'
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
			onclick: function (e) {
				var player = ImprovedTube.elements.player,
					video = ImprovedTube.elements.video,
					rotate = Number(document.body.dataset.itRotate) || 0,
					transform = '';
				if(!e.ctrlKey){
					rotate += 90;
				} else {
					rotate -= 90;
				}

				if (rotate === 360) {
					rotate = 0;
				} else if (rotate < 0){
					rotate = 270;
				}

				document.body.dataset.itRotate = rotate;

				transform += 'rotate(' + rotate + 'deg)';

				if (rotate == 90 || rotate == 270) {
					var is_vertical_video = video.videoHeight > video.videoWidth;
										if (
										//		( this.storage.player_cinema_mode_button === true ||  this.storage.player_auto_hide_cinema_mode_when_paused === true ||  this.storage.player_auto_cinema_mode === true 	)
											//  && document.querySelector('#overlay_cinema')
											document.querySelector("ytd-watch-flexy[theater]") && document.querySelector('ytd-app:not([player-fullscreen_]) ytd-watch-flexy:not([fullscreen])')
											) { transform += ' scale(' + (is_vertical_video ? video.clientWidth : video.clientHeight) / (is_vertical_video ? video.clientHeight : video.clientWidth) + ')';
													} else {
											transform += ' scale(' + (is_vertical_video ? player.clientWidth : player.clientHeight) / (is_vertical_video ? player.clientHeight : player.clientWidth) + ')';
										}
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
VOLUME BOOST BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.playerVolumeBoostButton = function () {
	if (this.storage.player_volume_boost_button === true) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z');

		svg.appendChild(path);

		var button = this.createPlayerButton({
			id: 'it-volume-boost-button',
			child: svg,
			opacity: 0.5,
			onclick: function () {
				// ponytail: Web Audio API gain node. Ceiling: clipping at very high gain (>4x). Upgrade: add compressor node.
				var video = ImprovedTube.elements.video;
				if (!video) return;

				if (!ImprovedTube.volumeBoostContext) {
					var AudioContext = window.AudioContext || window.webkitAudioContext;
					ImprovedTube.volumeBoostContext = new AudioContext();
					ImprovedTube.volumeBoostSource = ImprovedTube.volumeBoostContext.createMediaElementSource(video);
					ImprovedTube.volumeBoostGain = ImprovedTube.volumeBoostContext.createGain();
					ImprovedTube.volumeBoostSource.connect(ImprovedTube.volumeBoostGain);
					ImprovedTube.volumeBoostGain.connect(ImprovedTube.volumeBoostContext.destination);
				}

				var gain = ImprovedTube.volumeBoostGain.gain;
				var current = gain.value;

				// Cycle: 1x → 2x → 3x → 1x
				var next = current >= 3 ? 1 : current + 1;
				gain.value = next;

				var btn = ImprovedTube.elements.buttons['it-volume-boost-button'];
				if (btn) {
					btn.style.opacity = next > 1 ? '1' : '0.5';
					btn.dataset.title = 'Volume Boost (' + next + 'x)';
				}
			},
			title: 'Volume Boost (1x)'
		});
	}
};

/*------------------------------------------------------------------------------
PLAYBACK SPEED BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.playerPlaybackSpeedButton = function () {
	if (this.storage.player_playback_speed_button === true) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z');

		svg.appendChild(path);

		var button = this.createPlayerButton({
			id: 'it-playback-speed-button',
			child: svg,
			opacity: 0.7,
			onclick: function (e) {
				// Left click: set to custom speed from settings
				if (e.button === 0) {
					var customSpeed = ImprovedTube.storage.player_playback_speed || 1.25;
					ImprovedTube.playbackSpeed(customSpeed);
					ImprovedTube.showStatus(customSpeed + 'x');
				}
			},
			title: 'Playback Speed (Scroll: adjust, Left: custom, Right: 1.0x)'
		});

		// Add right-click handler
		button.addEventListener('contextmenu', function (e) {
			e.preventDefault();
			e.stopPropagation();
			ImprovedTube.playbackSpeed(1.0);
			ImprovedTube.showStatus('1.0x');
		});

		// Add wheel handler
		button.addEventListener('wheel', function (e) {
			e.preventDefault();
			e.stopPropagation();
			var step = Number(ImprovedTube.storage.shortcuts_playback_speed_step) || 0.1;
			var currentSpeed = ImprovedTube.playbackSpeed();
			var newSpeed;

			if (e.deltaY < 0) {
				// Scroll up: increase speed
				newSpeed = Math.min(currentSpeed + step, 16);
			} else {
				// Scroll down: decrease speed
				newSpeed = Math.max(currentSpeed - step, 0.0625);
			}

			ImprovedTube.playbackSpeed(newSpeed);
			ImprovedTube.showStatus(newSpeed.toFixed(2) + 'x');
		});
	}
};

ImprovedTube.playerPlaybackSpeedButtonB = function () {
  if (this.storage.player_playback_speed_button_b === true) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

    svg.setAttribute("viewBox", "0 0 36 36");
    svg.style.width = "100%";
    svg.style.height = "100%";

    // Simple speedometer icon
    path.setAttribute(
      "d",
      "M25.9,13.1A8.2,8.2,0,0,0,18,10a8.2,8.2,0,0,0-7.9,3.1L8,12.2V22h9.8l-1-2H10v-2h3.3l1.1-2.2a6.1,6.1,0,0,1,11.2,0L26.7,18H30v2H21.8l-1-2h4.1A8.2,8.2,0,0,0,25.9,13.1Z"
    );
    path.setAttribute("fill", "#fff");

    // Text element to show current speed
    text.setAttribute("x", "18");
    text.setAttribute("y", "23");
    text.setAttribute("font-size", "8px");
    text.setAttribute("font-weight", "bold");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#fff");
    text.setAttribute("class", "it-speed-text");
    text.textContent = (this.elements.video?.playbackRate || 1.0).toFixed(2);

    svg.appendChild(path);
    svg.appendChild(text);

    const button = this.createPlayerButton({
      id: "it-playback-speed-button",
      child: svg,
      opacity: 0.85,
      title: "Playback Speed Control",
    });

    const updateSpeedText = () => {
      const currentSpeed = (this.elements.video?.playbackRate || 1.0).toFixed(
        2
      );
      if (button) {
        const textElement = button.querySelector(".it-speed-text");
        if (textElement) textElement.textContent = currentSpeed;
      }
    };

    // --- Event Listeners ---
    button.onclick = () => {
      const customSpeed = this.storage.player_custom_playback_speed || 1.25;
      this.playbackSpeed(customSpeed);
    };

    button.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.playbackSpeed(1.0);
      return false;
    };

    button.onwheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const currentSpeed = this.playbackSpeed();
      const direction = e.deltaY < 0 ? 1 : -1;
      let newSpeed = Math.round((currentSpeed + direction * 0.05) * 100) / 100;

      if (newSpeed > 4) newSpeed = 4;
      if (newSpeed < 0.1) newSpeed = 0.1;

      this.playbackSpeed(newSpeed);
    };

    this.elements.video.addEventListener("ratechange", updateSpeedText);
    updateSpeedText(); // Set initial value
  }
};


/*------------------------------------------------------------------------------
FIT-TO-WIN BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.playerFitToWinButton = function () {
	if (this.storage.player_fit_to_win_button === true && (/watch\?/.test(location.href))) {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		svg.setAttribute('width', '24');
		svg.setAttribute('height', '24');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('fill', 'none');
		svg.setAttribute('stroke', 'currentColor');
		svg.setAttribute('stroke-width', '2');
		svg.setAttribute('id', 'ftw-icon');
		path.setAttribute('d', 'M21 3 9 15 M12 3H3v18h18v-9 M16 3h5v5 M14 15H9v-5');
		svg.appendChild(path);
		this.createPlayerButton({
			id: 'it-fit-to-win-player-button',
			child: svg,
			opacity: 0.85,
			position: "right",
			onclick: ImprovedTube.toggleFitToWindow,
			title: 'Fit To Window'
		});
	}
};

ImprovedTube.toggleFitToWindow = function() {
	let previousSize = ImprovedTube.storage.player_size === "fit_to_window" ? "do_not_change" : (ImprovedTube.storage.player_size ?? "do_not_change");
	let isFTW = document.querySelector("html").getAttribute("it-player-size") === "fit_to_window"
	if (isFTW) {
		document.querySelector("html").setAttribute("it-player-size", previousSize);
	} else {
		document.querySelector("html").setAttribute("it-player-size", "fit_to_window");
	}
	window.dispatchEvent(new Event("resize"));
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

// Darkens everything outside the player via a box-shadow "spotlight" on
// #ytd-player, instead of a full-page overlay element paired with a
// manually elevated z-index on the player containers. YouTube's player DOM
// nesting has changed enough that raising z-index on player-container /
// player-full-bleed-container / ytd-player no longer outranks a page-level
// fixed overlay (they end up compared across different stacking contexts),
// so the overlay ended up covering the whole page - video, controls and
// all - with no way back short of a refresh. #ytd-player's own box tracks
// the real player size in both the default and theater layouts, so drawing
// the darkening as its own box-shadow keeps it correctly stacked
// automatically, with no z-index/stacking-context guesswork involved. #4353
ImprovedTube.cinemaModeSetVisible = function (visible) {
	var ytdPlayer = document.getElementById('ytd-player');
	if (!ytdPlayer) return false;
	ytdPlayer.style.boxShadow = visible ? '0 0 0 9999px rgba(0, 0, 0, 1)' : '';
	return true;
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
			opacity: 0.64,
			onclick: function () {
				ImprovedTube.cinemaModeActive = !ImprovedTube.cinemaModeActive;
				ImprovedTube.cinemaModeSetVisible(ImprovedTube.cinemaModeActive);
			},
			title: 'Cinema Mode'
		});
	}
}

ImprovedTube.playerCinemaModeDisable = function () {
	if (this.storage.player_auto_hide_cinema_mode_when_paused && ImprovedTube.cinemaModeActive) {
		ImprovedTube.cinemaModeSetVisible(false);
		var cinemaModeButton = xpath('//*[@id="it-cinema-mode-button"]')[0]
		if (cinemaModeButton) cinemaModeButton.style.opacity = 0.64
	}
}

ImprovedTube.playerCinemaModeEnable = function () {
	if (this.storage.player_auto_cinema_mode || this.storage.player_auto_hide_cinema_mode_when_paused) {

		if ((/watch\?/.test(location.href))) {
			if (this.storage.player_auto_cinema_mode === true) {
				ImprovedTube.cinemaModeActive = true;
			}

			if (ImprovedTube.cinemaModeActive) {
				ImprovedTube.cinemaModeSetVisible(true);

				var cinemaModeButton = xpath('//*[@id="it-cinema-mode-button"]')[0]
				if (cinemaModeButton) cinemaModeButton.style.opacity = 1
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
			hamburgerMenu.style.zIndex = 9999;

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

			controlsContainer.style.display = 'none';
			hamburgerMenu.style.opacity = '0.65';

			hamburgerMenu.addEventListener('click', function () {
				const isHidden = controlsContainer.style.display === 'none';
				controlsContainer.style.display = isHidden ? 'flex' : 'none';
				hamburgerMenu.style.opacity = isHidden ? '0.85' : '0.65';
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

		// Re-apply disableAutoDubbing when entering mini player mode
		// (YouTube may reset audio track when switching to mini player)
		if (ImprovedTube.storage.disable_auto_dubbing === true) {
			ImprovedTube.disableAutoDubbing();
		}

		window.addEventListener('mousedown', ImprovedTube.miniPlayer_mouseDown);
		window.addEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);
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

		// Re-apply disableAutoDubbing when exiting mini player mode
		// (YouTube may reset audio track when switching back to normal player)
		if (ImprovedTube.storage.disable_auto_dubbing === true) {
			ImprovedTube.disableAutoDubbing();
		}

		window.removeEventListener('mousedown', ImprovedTube.miniPlayer_mouseDown);
		window.removeEventListener('mousemove', ImprovedTube.miniPlayer_mouseMove);
		window.removeEventListener('mouseup', ImprovedTube.miniPlayer_mouseUp);
		window.removeEventListener('click', ImprovedTube.miniPlayer_click);
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
				( document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "DIV"
				 ||	((document.activeElement && ImprovedTube.input.ignoreElements.includes(document.activeElement.tagName)) || event.target.isContentEditable)
				)) {
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


/*------------------------------------------------------------------------------
Rewind and Forward Buttons
------------------------------------------------------------------------------*/
ImprovedTube.playerRewindAndForwardButtons = function(){
	if(this.storage.player_rewind_and_forward_buttons===true){
	 const svgNamespace = "http://www.w3.org/2000/svg";
	 const svgBackward = document.createElementNS(svgNamespace, "svg");
	 const path1 = document.createElementNS(svgNamespace, "path");
	 const path2 = document.createElementNS(svgNamespace, "path");
	 svgBackward.setAttribute("t", "1742599438764");
	 svgBackward.setAttribute("class", "icon");
	 svgBackward.setAttribute("viewBox", "0 0 1024 1024");
	 svgBackward.setAttribute("version", "1.1");
	 svgBackward.setAttribute("xmlns", svgNamespace);
	 svgBackward.setAttribute("p-id", "1636");
	 svgBackward.setAttribute("width", "50%");
	 svgBackward.setAttribute("height", "50%");
	 svgBackward.style.display = "block";
	 svgBackward.style.margin = "0 auto";
	 path1.setAttribute("d", "M508.50205 146.714035c221.770057 0.399766 401.364825 180.194417 401.364825 402.064415 0 222.069881-179.994534 402.064415-402.064416 402.064416-222.069881 0-402.064415-179.994534-402.064415-402.064416-0.099941-80.852625 24.185829-159.806363 69.759126-226.467304 11.393324-16.690221 7.095842-39.376928-9.594379-50.770252-16.690221-11.393324-39.376928-7.095842-50.770251 9.594378-53.468671 78.254148-82.55163 170.899863-82.55163 267.74312 0 262.446223 212.675386 475.121608 475.121608 475.121608 262.446223 0 475.121608-212.675386 475.121608-475.121608 0-262.146399-212.375561-474.821784-474.521959-475.121609V22.386883c0-8.095257-4.497365-15.490923-11.593207-19.288698-7.095842-3.797775-15.790748-3.398009-22.486825 1.099356L316.514542 109.335936c-6.096428 4.097599-9.794261 10.893617-9.794261 18.289284 0 7.295725 3.697833 14.191685 9.794261 18.289283l157.807535 105.238337c6.696077 4.497365 15.390982 4.897131 22.486824 1.099356 7.095842-3.797775 11.593207-11.293383 11.593207-19.288698v-86.249463h0.099942zM497.008784 700.989264");
	 path1.setAttribute("fill", "#ffffff");
	 path2.setAttribute("d", "M638.026157 359.889127v59.964865H439.442514l-11.693148 114.133125h1.699004c12.792504-12.792504 27.383955-22.087058 44.274058-27.983603 15.091158-5.796604 31.981261-8.694905 50.670311-8.694906 38.977162 0 71.058364 12.792504 95.444075 38.477455 24.485653 25.585009 37.278157 61.164162 37.278158 105.937927 0 43.074761-16.290455 78.054265-48.871365 105.338278-30.282256 24.485653-65.761468 36.678509-107.137224 36.678509-37.877806 0-70.458716-10.493851-97.243022-30.881905-30.282256-22.686707-46.572711-53.568612-49.471013-91.946126h66.960765c2.898302 22.686707 11.693149 39.57681 26.784306 50.670311 12.792504 9.294554 30.881905 14.59145 53.568613 14.59145 24.485653 0 45.373414-7.595549 62.263517-22.686707 16.290455-15.091158 25.085302-35.479211 25.085302-61.164162 0-27.983603-7.595549-50.070662-21.587351-65.761467-13.991802-16.290455-34.979504-23.886004-61.763811-23.886005-18.089401 0-33.780207 2.898302-46.572711 9.294554-14.59145 6.995901-25.585009 17.489752-33.780207 31.981261h-63.462815l22.686707-234.062854h253.451494z");
	 path2.setAttribute("fill", "#ffffff");
	 svgBackward.appendChild(path1);
	 svgBackward.appendChild(path2);
	 const svgForward = document.createElementNS(svgNamespace, "svg");
	 const path3 = document.createElementNS(svgNamespace, "path");
	 const path4 = document.createElementNS(svgNamespace, "path");
	 svgForward.setAttribute("t", "1742599438764");
	 svgForward.setAttribute("class", "icon");
	 svgForward.setAttribute("viewBox", "0 0 1024 1024");
	 svgForward.setAttribute("version", "1.1");
	 svgForward.setAttribute("xmlns", svgNamespace);
	 svgForward.setAttribute("p-id", "1636");
	 svgForward.setAttribute("width", "50%");
	 svgForward.setAttribute("height", "50%");
	 svgForward.style.display = "block";
	 svgForward.style.margin = "0 auto";
	 path3.setAttribute("d", "M507.101913 146.742679V232.90902c0 8.096837 4.498243 15.493948 11.595471 19.292464 7.097228 3.798516 15.793831 3.398672 22.491214-1.099571l157.838345-105.258883c6.097618-4.098399 9.796173-10.895744 9.796173-18.292854 0-7.29715-3.698555-14.194455-9.796173-18.292855L541.288559 4.19836c-6.697384-4.498243-15.393987-4.898087-22.491214-1.09957-7.097228 3.798516-11.595471 11.195627-11.595471 19.292463v51.180008C245.004295 73.971105 32.587271 286.588052 32.587271 548.785631c0 262.497462 212.716907 475.214369 475.214369 475.214369 262.497462 0 475.214369-212.716907 475.214369-475.214369 0-96.862163-29.088637-189.426005-82.567747-267.795393-11.395549-16.693479-34.186646-20.9918-50.780164-9.596251-16.693479 11.395549-20.9918 34.186646-9.596251 50.780164 45.582194 66.673955 69.972667 145.743069 69.772745 226.511519 0 222.113237-180.029676 402.142913-402.142913 402.142913-222.113237 0-402.142913-180.029676-402.142913-402.142913 0.099961-221.713393 179.829754-401.643108 401.543147-401.942991z m11.595471 554.383444");
	 path3.setAttribute("fill", "#ffffff");
	 path4.setAttribute("d", "M638.050761 359.959391v59.976572H439.428348l-11.695431 114.155408h1.699336c12.795002-12.795002 27.389301-22.091371 44.282702-27.989067 15.094104-5.797735 31.987505-8.696603 50.680203-8.696603 38.984772 0 71.072237 12.795002 95.46271 38.484967 24.490433 25.590004 37.285435 61.176103 37.285435 105.95861 0 43.083171-16.293635 78.069504-48.880905 105.358844-30.288169 24.490433-65.774307 36.68567-107.158142 36.685669-37.885201 0-70.472472-10.4959-97.262007-30.887934-30.288169-22.691136-46.581804-53.579071-49.480671-91.964076h66.973838c2.898868 22.691136 11.695431 39.584537 26.789535 50.680203 12.795002 9.296369 30.887934 14.594299 53.579071 14.594299 24.490433 0 45.382273-7.597032 62.275673-22.691137 16.293635-15.094104 25.090199-35.486138 25.0902-61.176103 0-27.989067-7.597032-50.080437-21.591566-65.774307-13.994533-16.293635-34.986333-23.890668-61.775869-23.890667-18.092932 0-33.786802 2.898868-46.581804 9.296368-14.594299 6.997267-25.590004 17.493167-33.786802 31.987505h-63.475205l22.691136-234.108551h253.500976z");
	 path4.setAttribute("fill", "#ffffff");
	 svgForward.appendChild(path3);
	 svgForward.appendChild(path4);


	 this.createPlayerButton({
	  id: 'it-forward-player-button',
	  opacity: 0.85,
	  position: "right",
	  child: svgForward,

	  onclick: function () {
	   ImprovedTube.elements.player.seekTo(ImprovedTube.elements.player.getCurrentTime() + 5);
	  },
	  title: 'forward 5 seconds',
	 }).classList.remove('it-player-button');
	 this.createPlayerButton({
	  id: 'it-rewind-player-button',
	  opacity: 0.85,
	  position: "right",
	  child: svgBackward,

	  onclick: function () {
	   ImprovedTube.elements.player.seekTo(ImprovedTube.elements.player.getCurrentTime() - 5);
	  },
	  title: 'rewind 5 seconds',
	 }).classList.remove('it-player-button');
	}
   }

/*------------------------------------------------------------------------------
Increase and Decrease Playback Speed Buttons
------------------------------------------------------------------------------*/
ImprovedTube.playerIncreaseDecreaseSpeedButtons = function () {
    if (this.storage.player_increase_decrease_speed_buttons === true) {
        const svgNamespace = "http://www.w3.org/2000/svg";

        const svgDecrease = document.createElementNS(svgNamespace, "svg");
        const path1 = document.createElementNS(svgNamespace, "path");
        svgDecrease.setAttribute("class", "icon");
        svgDecrease.setAttribute("viewBox", "0 0 1024 1024");
        svgDecrease.setAttribute("version", "1.1");
        svgDecrease.setAttribute("xmlns", svgNamespace);
        svgDecrease.setAttribute("width", "90%");
        svgDecrease.setAttribute("height", "90%");
        svgDecrease.style.display = "block";
        svgDecrease.style.margin = "0 auto";
        path1.setAttribute("d", `M188.5,270.3c-24.4,28.1-23.2,71.7,2.6,98.6c14.4,15.1,33.7,22.6,52.9,22.6c18.8,0,37.5-7.2,51.8-21.5
                c6.5-6.5,11.6-14,15.1-21.9l0,0l94.5-183.2c2.5-5.2-2.9-10.6-8.1-8.1l-183.2,94.5l0,0C204.6,255.5,195.9,261.9,188.5,270.3z
                M221.9,296.1c6.1-6.1,14.1-9.2,22.1-9.2s16,3.1,22.2,9.2c12.2,12.2,12.2,32.1,0,44.3c-6.1,6.1-14.1,9.2-22.2,9.2
                c-8,0-16-3.1-22.1-9.2C209.6,328.1,209.6,308.3,221.9,296.1z M440.2,341.4c0-34.6-9.1-68.6-26.4-98.3c-6.7-11.6-2.8-26.4,8.8-33.1
                c11.6-6.7,26.4-2.8,33.1,8.8c21.5,37.1,32.9,79.5,32.9,122.6c0,13.4-10.8,24.2-24.2,24.2C451.1,365.6,440.2,354.8,440.2,341.4z
                M0,341.4C0,206.7,109.6,97.1,244.3,97.1c31.3,0,61.8,5.8,90.6,17.4c12.4,5,18.4,19,13.5,31.4c-5,12.4-19,18.4-31.4,13.5
                c-23.1-9.2-47.6-13.9-72.7-13.9c-108,0-195.9,87.9-195.9,195.9c0,13.4-10.8,24.2-24.2,24.2C10.8,365.6,0,354.8,0,341.4z`);
        path1.setAttribute("fill", "#ffffff");

        path1.setAttribute("transform", "translate(520, 0)");

        svgDecrease.appendChild(path1);

        const svg1x = document.createElementNS(svgNamespace, "svg");
        svg1x.setAttribute("t", "1742599438764");
        svg1x.setAttribute("class", "icon");

        svg1x.setAttribute("viewBox", "0 0 1024 1024");
        svg1x.setAttribute("version", "1.1");
        svg1x.setAttribute("xmlns", svgNamespace);
        svg1x.setAttribute("p-id", "1636");

        const text1 = document.createElementNS(svgNamespace, "text");
        text1.setAttribute("x", "512");
        text1.setAttribute("y", "512");

        text1.setAttribute("fill", "#ffffff");
        text1.setAttribute("font-size", "550");

        text1.setAttribute("font-weight", "bold");
        text1.setAttribute("font-family", "Arial, sans-serif");
        text1.setAttribute("text-anchor", "middle");
        text1.setAttribute("dominant-baseline", "central");
        text1.textContent = "1x";
        svg1x.appendChild(text1);

        const svgIncrease = document.createElementNS(svgNamespace, "svg");
        const path2 = document.createElementNS(svgNamespace, "path");
        svgIncrease.setAttribute("class", "icon");
        svgIncrease.setAttribute("viewBox", "0 0 1024 1024");
        svgIncrease.setAttribute("version", "1.1");
        svgIncrease.setAttribute("xmlns", svgNamespace);
        svgIncrease.setAttribute("width", "90%");
        svgIncrease.setAttribute("height", "90%");
        svgIncrease.style.display = "block";
        svgIncrease.style.margin = "0 auto";

        svgDecrease.style.transform = "scaleX(-1)";

        path2.setAttribute("d", `M188.5,270.3c-24.4,28.1-23.2,71.7,2.6,98.6c14.4,15.1,33.7,22.6,52.9,22.6c18.8,0,37.5-7.2,51.8-21.5
                c6.5-6.5,11.6-14,15.1-21.9l0,0l94.5-183.2c2.5-5.2-2.9-10.6-8.1-8.1l-183.2,94.5l0,0C204.6,255.5,195.9,261.9,188.5,270.3z
                M221.9,296.1c6.1-6.1,14.1-9.2,22.1-9.2s16,3.1,22.2,9.2c12.2,12.2,12.2,32.1,0,44.3c-6.1,6.1-14.1,9.2-22.2,9.2
                c-8,0-16-3.1-22.1-9.2C209.6,328.1,209.6,308.3,221.9,296.1z M440.2,341.4c0-34.6-9.1-68.6-26.4-98.3c-6.7-11.6-2.8-26.4,8.8-33.1
                c11.6-6.7,26.4-2.8,33.1,8.8c21.5,37.1,32.9,79.5,32.9,122.6c0,13.4-10.8,24.2-24.2,24.2C451.1,365.6,440.2,354.8,440.2,341.4z
                M0,341.4C0,206.7,109.6,97.1,244.3,97.1c31.3,0,61.8,5.8,90.6,17.4c12.4,5,18.4,19,13.5,31.4c-5,12.4-19,18.4-31.4,13.5
                c-23.1-9.2-47.6-13.9-72.7-13.9c-108,0-195.9,87.9-195.9,195.9c0,13.4-10.8,24.2-24.2,24.2C10.8,365.6,0,354.8,0,341.4z`);
        path2.setAttribute("fill", "#ffffff");

        svgIncrease.appendChild(path2);
        path2.setAttribute("transform", "translate(-20, 0)");

        this.createPlayerButton({
            id: 'it-increase-speed-button',
            opacity: 0.85,
            position: "right",
            child: svgIncrease,
            onclick: function () {
                const step = ImprovedTube.storage.player_custom_playback_speed_step || 0.25;
                const currentSpeed = ImprovedTube.playbackSpeed();
                let newSpeed = Math.min(currentSpeed + step, 16);
                const appliedSpeed = ImprovedTube.playbackSpeed(newSpeed);
                ImprovedTube.showStatus(appliedSpeed + 'x');
            },
            title: `increase speed by ${ImprovedTube.storage.player_custom_playback_speed_step || 0.25}x`,
        }).classList.remove('it-player-button');

        this.createPlayerButton({
            id: 'it-1x-speed-button',
            opacity: 0.85,
            position: "right",
            child: svg1x,
            onclick: function () {
                ImprovedTube.playbackSpeed(1);
                ImprovedTube.showStatus('1x');
            },
            title: 'set speed to 1x',
        }).classList.remove('it-player-button');

        this.createPlayerButton({
            id: 'it-decrease-speed-button',
            opacity: 0.85,
            position: "right",
            child: svgDecrease,
            onclick: function () {
				const step = ImprovedTube.storage.player_custom_playback_speed_step || 0.25;
                const currentSpeed = ImprovedTube.playbackSpeed();
                let newSpeed = Math.max(currentSpeed - step, step);
                const appliedSpeed = ImprovedTube.playbackSpeed(newSpeed);
                ImprovedTube.showStatus(appliedSpeed + 'x');
            },
            title: `decrease speed by ${ImprovedTube.storage.player_custom_playback_speed_step || 0.25}x`,
        }).classList.remove('it-player-button');
    }
}

/*------------------------------------------------------------------------------
# DISABLE AUTO DUBBING
------------------------------------------------------------------------------*/
ImprovedTube.getAudioTrackInfo = function (track) {
	return track?.getLanguageInfo?.() || {};
};

ImprovedTube.normalizeAudioTrackText = function (value) {
	return String(value || '').trim().toLocaleLowerCase();
};

ImprovedTube.audioTrackIsAutoDubbed = function (track) {
	const info = this.getAudioTrackInfo(track);
	const metadata = [track, info, track?.audioTrack, track?.audioTrackData, info?.audioTrack];
	const autoFlags = [
		'isAutoDubbed',
		'isAutoDubbing',
		'isAutomaticallyDubbed',
		'autoDubbed',
		'autoDubbing',
		'isAutoGenerated',
		'isMachineGenerated',
		'isSynthetic'
	];

	for (const source of metadata) {
		if (!source || typeof source !== 'object') continue;
		if (autoFlags.some(flag => source[flag] === true)) return true;
	}

	const descriptor = metadata.flatMap(function (source) {
		if (!source || typeof source !== 'object') return [];
		return [source.id, source.name, source.languageCode, source.languageName, source.kind];
	}).join(' ').toLocaleLowerCase();

	if (/auto[\s_-]*dub|automatic[\s_-]*dub|machine[\s_-]*dub|synthetic[\s_-]*dub|generated[\s_-]*dub/.test(descriptor)) {
		return true;
	}

	const autoLabels = this.autoDubbedTrackLabels;
	const name = this.normalizeAudioTrackText(info.name || track?.languageName);
	if (autoLabels && autoLabels.url === location.href && name) {
		const labelMatchesTrack = label => label === name || label.startsWith(name + ' ') || label.includes(name + ' auto');
		const appearsInAutoSection = Array.from(autoLabels.values).some(labelMatchesTrack);
		const appearsInManualSection = Array.from(autoLabels.manualValues || []).some(labelMatchesTrack);

		// A human dub and an automatic dub can have exactly the same visible
		// language label. Menu text alone cannot identify which track object is
		// automatic in that case, so preserve the human track unless the metadata
		// checks above provided unambiguous auto-dub evidence.
		return appearsInAutoSection && !appearsInManualSection;
	}

	return false;
};

ImprovedTube.audioTrackMatchesLanguage = function (track, language) {
	const selected = this.normalizeAudioTrackText(language);
	if (!selected) return false;

	const info = this.getAudioTrackInfo(track);
	const codes = [info.id, info.languageCode, track?.id, track?.languageCode]
		.map(this.normalizeAudioTrackText)
		.filter(Boolean);
	const names = [info.name, info.languageName, track?.name, track?.languageName]
		.map(this.normalizeAudioTrackText)
		.filter(Boolean);

	return codes.some(code => code === selected || code.startsWith(selected + '.') || code.startsWith(selected + '-') || code.startsWith(selected + '_')) ||
		names.some(name => name === selected || name.includes(selected));
};

ImprovedTube.findOriginalAudioTrack = function (audioTracks) {
	if (!audioTracks?.length) return null;

	const originalWords = ['original', 'originale', 'originalny', 'originalaudio', 'origineel', 'orijinal', 'оригинал', 'оригинальная'];
	const isNamedOriginal = track => {
		const name = this.normalizeAudioTrackText(this.getAudioTrackInfo(track).name);
		return originalWords.some(word => name.includes(word));
	};
	const hasAsrCaption = track => Array.isArray(track?.captionTracks) && track.captionTracks.some(caption => caption.kind === 'asr');
	const isDefault = track => this.getAudioTrackInfo(track).isDefault === true || track?.isDefault === true;

	return audioTracks.find(track => track?.isOriginal === true || this.getAudioTrackInfo(track).isOriginal === true) ||
		audioTracks.find(isNamedOriginal) || audioTracks.find(hasAsrCaption) || audioTracks.find(isDefault) || audioTracks[0];
};

ImprovedTube.getPreferredAudioLanguage = function () {
	const selected = this.storage.player_default_dubbed_language;
	if (selected && selected !== 'disabled') return selected;

	return this.storage.preferred_dubbing_language || '';
};

ImprovedTube.audioTracksAreEqual = function (firstTrack, secondTrack) {
	if (firstTrack === secondTrack) return true;

	const firstInfo = this.getAudioTrackInfo(firstTrack);
	const secondInfo = this.getAudioTrackInfo(secondTrack);
	const firstId = firstInfo.id || firstTrack?.id;
	const secondId = secondInfo.id || secondTrack?.id;

	return Boolean(firstId && secondId && firstId === secondId);
};

ImprovedTube.selectPermittedAudioTrack = function (player, preferredLanguage) {
	const tracks = player?.getAvailableAudioTracks?.();
	if (!tracks?.length) return null;

	const blockAutoDubbing = this.storage.disable_auto_dubbing === true;
	const permittedTracks = blockAutoDubbing ? tracks.filter(track => !this.audioTrackIsAutoDubbed(track)) : tracks;
	const requestedLanguage = preferredLanguage || this.getPreferredAudioLanguage();
	let targetTrack = requestedLanguage ? permittedTracks.find(track => this.audioTrackMatchesLanguage(track, requestedLanguage)) : null;

	if (!targetTrack && blockAutoDubbing) {
		targetTrack = this.findOriginalAudioTrack(permittedTracks) || this.findOriginalAudioTrack(tracks);
	}

	const currentTrack = player.getAudioTrack?.();
	if (targetTrack && !this.audioTracksAreEqual(currentTrack, targetTrack)) {
		player.setAudioTrack(targetTrack);
	}
	return targetTrack || null;
};

ImprovedTube.disableAutoDubbing = function () {
	// These lifecycle helpers belong only to this feature. Define them lazily so
	// they do not exist when auto-dubbing protection has never been enabled.
	ImprovedTube.stopAutoDubbingGuard = function () {
		const guard = this.autoDubbingGuard;
		if (!guard) return;

		clearInterval(guard.interval);
		guard.video?.removeEventListener('loadedmetadata', guard.forceSelection);
		guard.video?.removeEventListener('playing', guard.enforce);
		this.autoDubbingGuard = null;
	};

	ImprovedTube.enforceAutoDubbingPolicy = function () {
		const player = this.elements.player;
		if (!player?.getAvailableAudioTracks) return;

		if (this.autoDubbingGuard?.player !== player) this.stopAutoDubbingGuard();

		if (!this.autoDubbingGuard) {
			const video = player.querySelector?.('video');
			const canReadCurrentTrack = typeof player.getAudioTrack === 'function';
			const guard = {
				player,
				video,
				enforce: function () {
					// The storage listener normally stops the guard synchronously. Keep
					// this check for a callback that was already queued before disabling.
					if (ImprovedTube.storage.disable_auto_dubbing !== true || !canReadCurrentTrack) return;

					const currentTrack = player.getAudioTrack();
					if (currentTrack && ImprovedTube.audioTrackIsAutoDubbed(currentTrack)) {
						ImprovedTube.selectPermittedAudioTrack(player);
					}
				},
				forceSelection: function () {
					setTimeout(function () {
						if (ImprovedTube.storage.disable_auto_dubbing === true) {
							ImprovedTube.selectPermittedAudioTrack(player);
						}
					}, 0);
				}
			};

			guard.interval = canReadCurrentTrack ? setInterval(guard.enforce, 1000) : null;
			video?.addEventListener('loadedmetadata', guard.forceSelection);
			video?.addEventListener('playing', guard.enforce);
			this.autoDubbingGuard = guard;
		}

		this.autoDubbingGuard.enforce();
	};

	this.selectPermittedAudioTrack(this.elements.player);
	this.enforceAutoDubbingPolicy();
};

/*------------------------------------------------------------------------------
# HIDE AUTO-DUBBED MENU ITEMS
------------------------------------------------------------------------------*/
ImprovedTube.observeAutoDubbedMenu = function () {
	const state = ImprovedTube.autoDubbedMenuObserver;
	if (ImprovedTube.storage.hide_auto_dubbed_options !== true) {
		state?.disconnect();
		ImprovedTube.autoDubbedMenuObserver = null;
		ImprovedTube.cancelAutoDubbedMenuLayoutRefresh();
		ImprovedTube.hideAutoDubbedMenuItems();
		return;
	}

	if (state) {
		ImprovedTube.hideAutoDubbedMenuItems();
		return;
	}

	const playerContainer = document.querySelector('#movie_player');
	if (!playerContainer) return;

	ImprovedTube.autoDubbedMenuObserver = new MutationObserver(function (records) {
		// YouTube reuses submenu nodes. A panel marked as leaving becomes eligible
		// again only when YouTube explicitly attaches it in a later mutation batch;
		// moving the same subtree within one update is still part of the old panel.
		const removedNodes = new Set();
		records?.forEach(function (record) {
			Array.from(record.removedNodes || []).forEach(node => removedNodes.add(node));
		});
		records?.forEach(function (record) {
			Array.from(record.addedNodes || []).forEach(function (node) {
				if (node?.nodeType !== 1 || removedNodes.has(node)) return;

				if (node.matches?.('.ytp-panel-menu')) delete node.itAutoDubbedMenuLeaving;
				node.querySelectorAll?.('.ytp-panel-menu').forEach(function (panel) {
					delete panel.itAutoDubbedMenuLeaving;
				});
			});
		});

		// Layout probes are mounted under the player briefly. They are not a
		// YouTube menu update and must not schedule another probe recursively.
		const relevantUpdate = records?.some(function (record) {
			if (record.type === 'attributes') {
				const target = record.target;
				return target?.dataset?.itAutoDubbedHidden === 'true' ||
					target?.classList?.contains('ytp-panel') ||
					target?.classList?.contains('ytp-panel-menu') ||
					target?.classList?.contains('ytp-settings-menu');
			}

			const nodes = Array.from(record.addedNodes || []).concat(Array.from(record.removedNodes || []));
			return nodes.length === 0 || !nodes.every(ImprovedTube.isAutoDubbedMenuLayoutProbe);
		});
		if (!relevantUpdate) return;

		ImprovedTube.hideAutoDubbedMenuItems();
	});
	ImprovedTube.autoDubbedMenuObserver.observe(playerContainer, {
		attributeFilter: ['class', 'style'],
		attributes: true,
		childList: true,
		subtree: true
	});
	ImprovedTube.hideAutoDubbedMenuItems();
};

ImprovedTube.isAutoDubbedMenuHeader = function (item) {
	const label = this.normalizeAudioTrackText(item?.textContent);
	return /auto[\s-]*dub|automatic[\s-]*dubb|automatically[\s-]*dub|авто(?:матическ(?:ое|ая|ий)?\s*)?(?:дубляж|дублирован)|дублировани[ея]\s+автоматически|dublagem\s+automática|doblaje\s+automático|synchronisation\s+automatique|automatische\s+(?:synchronisation|vertonung)/.test(label);
};

ImprovedTube.rememberAutoDubbedMenuItems = function (items) {
	if (!this.autoDubbedTrackLabels || this.autoDubbedTrackLabels.url !== location.href) {
		this.autoDubbedTrackLabels = {url: location.href, values: new Set(), manualValues: new Set()};
	}

	let inAutoDubbedSection = false;
	items.forEach(item => {
		if (item.classList.contains('ytp-menuitem-section-header')) {
			inAutoDubbedSection = this.isAutoDubbedMenuHeader(item);
		} else {
			const label = this.normalizeAudioTrackText(item.textContent);
			if (!label) return;

			if (inAutoDubbedSection) {
				this.autoDubbedTrackLabels.values.add(label);
			} else {
				this.autoDubbedTrackLabels.manualValues.add(label);
			}
		}
	});
};

ImprovedTube.isAutoDubbedMenuLayoutProbe = function (node) {
	return node?.nodeType === 1 && (
		node.dataset?.itAutoDubbedMenuLayoutProbe === 'true' ||
		node.closest?.('[data-it-auto-dubbed-menu-layout-probe="true"]')
	);
};

ImprovedTube.releaseAutoDubbedMenuLayout = function (panel) {
	if (!panel) return;

	// YouTube adds the outgoing animation class about 20 ms after Back. Mark the
	// audio panel immediately so observer callbacks in that gap cannot make it
	// reclaim the popup and constrain the root panel's native measurement.
	panel.itAutoDubbedMenuLeaving = true;
	ImprovedTube.cancelAutoDubbedMenuLayoutRefresh();
	ImprovedTube.restoreAutoDubbedMenuLayout(panel, {force: true});
	if (ImprovedTube.autoDubbedMenuPanel === panel) ImprovedTube.autoDubbedMenuPanel = null;
};

ImprovedTube.restoreAutoDubbedMenuBeforeBack = function (event) {
	const backControl = event.target?.closest?.('.ytp-panel-back-button, .ytp-panel-title');
	const panel = ImprovedTube.autoDubbedMenuPanel;
	const menuPanel = panel?.closest?.('.ytp-panel');
	if (!backControl || !menuPanel || backControl.closest?.('.ytp-panel') !== menuPanel) return;

	// Run in the capture phase so YouTube measures the root menu only after the
	// compact audio-menu constraints have been removed.
	ImprovedTube.releaseAutoDubbedMenuLayout(panel);
};

ImprovedTube.restoreAutoDubbedMenuBeforePanelFocus = function (event) {
	const focusedPanel = event.target?.closest?.('.ytp-panel');
	if (!focusedPanel) return;

	// The same audio panel object can be detached and reused on a later opening.
	// Focus is moved to it before YouTube measures it, so it is safe to release
	// the marker here even in variants that reparent rather than re-create nodes.
	const focusedMenu = focusedPanel.querySelector?.('.ytp-panel-menu');
	if (focusedMenu?.itAutoDubbedMenuLeaving === true) delete focusedMenu.itAutoDubbedMenuLeaving;

	const panel = ImprovedTube.autoDubbedMenuPanel;
	if (panel && panel.closest?.('.ytp-panel') !== focusedPanel) {
		ImprovedTube.releaseAutoDubbedMenuLayout(panel);
	}
};

ImprovedTube.restoreAutoDubbedMenuLayout = function (panel, options) {
	if (!panel) return;

	const force = options?.force === true;
	const menuPanel = panel.closest?.('.ytp-panel');
	const settingsMenu = menuPanel?.closest?.('.ytp-settings-menu');
	// YouTube detaches the old submenu at the end of its slide transition. Keep
	// the elements captured while it was connected, because closest() can no
	// longer reach the shared settings popup by the time the observer restores it.
	const elements = new Set(panel.itAutoDubbedMenuLayoutElements || []);
	[panel, menuPanel, settingsMenu].filter(Boolean).forEach(element => elements.add(element));
	elements.forEach(function (element) {
		const saved = element.dataset.itAutoDubbedMenuLayout;
		if (!saved) return;

		try {
			const styles = JSON.parse(saved);
			const applied = JSON.parse(element.dataset.itAutoDubbedMenuAppliedLayout || 'null');
			for (const property in styles) {
				const value = styles[property];
				const appliedValue = applied?.[property];
				// Late observer cleanup preserves dimensions YouTube has already set
				// for the root menu; capture cleanup runs before those values exist.
				if (!force && appliedValue && (
					element.style.getPropertyValue(property) !== appliedValue.value ||
					element.style.getPropertyPriority(property) !== appliedValue.priority
				)) continue;

				if (value.value) {
					element.style.setProperty(property, value.value, value.priority);
				} else {
					element.style.removeProperty(property);
				}
			}
		} catch (_) {
			for (const property of [
				'width', 'min-width', 'max-width',
				'height', 'min-height', 'max-height',
				'overflow', 'overflow-x', 'overflow-y'
			]) {
				element.style.removeProperty(property);
			}
		}

		delete element.dataset.itAutoDubbedMenuLayout;
		delete element.dataset.itAutoDubbedMenuAppliedLayout;
	});

	delete panel.itAutoDubbedMenuLayoutElements;
};

ImprovedTube.restoreAutoDubbedMenuLayoutProperties = function (element, properties) {
	const saved = element?.dataset?.itAutoDubbedMenuLayout;
	if (!saved) return;

	try {
		const styles = JSON.parse(saved);
		properties.forEach(function (property) {
			const value = styles[property];
			if (!value) return;

			const currentValue = element.style.getPropertyValue(property);
			const currentPriority = element.style.getPropertyPriority(property);
			if (currentValue === value.value && currentPriority === value.priority) return;

			if (value.value) {
				element.style.setProperty(property, value.value, value.priority);
			} else {
				element.style.removeProperty(property);
			}
		});
	} catch (_) { }
};

ImprovedTube.saveAutoDubbedMenuLayout = function (element) {
	if (!element || element.dataset.itAutoDubbedMenuLayout) return;

	const savedStyles = {};
	for (const property of [
		'width', 'min-width', 'max-width',
		'height', 'min-height', 'max-height',
		'overflow', 'overflow-x', 'overflow-y'
	]) {
		savedStyles[property] = {
			value: element.style.getPropertyValue(property),
			priority: element.style.getPropertyPriority(property)
		};
	}

	element.dataset.itAutoDubbedMenuLayout = JSON.stringify(savedStyles);
};

ImprovedTube.saveAutoDubbedMenuAppliedLayout = function (element) {
	if (!element) return;

	const appliedStyles = {};
	for (const property of [
		'width', 'min-width', 'max-width',
		'height', 'min-height', 'max-height',
		'overflow', 'overflow-x', 'overflow-y'
	]) {
		appliedStyles[property] = {
			value: element.style.getPropertyValue(property),
			priority: element.style.getPropertyPriority(property)
		};
	}

	element.dataset.itAutoDubbedMenuAppliedLayout = JSON.stringify(appliedStyles);
};

ImprovedTube.measureFilteredAudioMenuLayout = function (panel) {
	const player = panel?.closest?.('.html5-video-player, #movie_player');
	const menuPanel = panel?.closest?.('.ytp-panel');
	const popup = menuPanel?.closest?.('.ytp-popup') || menuPanel;
	if (!player || !popup?.cloneNode || !player.appendChild) return null;

	// A settings popup can contain more than one panel while YouTube animates
	// between menus. Mark the live audio panel so its exact clone can be found.
	panel.dataset.itAutoDubbedMenuSource = 'true';
	let probe;
	try {
		probe = popup.cloneNode(true);
	} catch (_) {
		return null;
	} finally {
		delete panel.dataset.itAutoDubbedMenuSource;
	}

	const probeMenu = probe.querySelector?.('[data-it-auto-dubbed-menu-source="true"]') ||
		(probe.matches?.('.ytp-panel-menu') ? probe : probe.querySelector?.('.ytp-panel-menu'));
	const probePanel = probeMenu?.closest?.('.ytp-panel') ||
		(probe.matches?.('.ytp-panel') ? probe : probe.querySelector?.('.ytp-panel'));
	if (!probePanel || !probeMenu) return null;
	if (probeMenu.dataset) delete probeMenu.dataset.itAutoDubbedMenuSource;

	probe.dataset.itAutoDubbedMenuLayoutProbe = 'true';
	probe.querySelectorAll?.('[data-it-auto-dubbed-hidden="true"]').forEach(function (item) {
		item.remove?.() || item.parentNode?.removeChild(item);
	});

	// This is a real copy of YouTube's panel, in the same player and with only
	// the hidden section removed. Its natural size is therefore the size YouTube
	// would calculate after the menu is closed and opened again.
	[probe, probePanel, probeMenu].forEach(function (element) {
		for (const property of [
			'width', 'min-width', 'max-width',
			'height', 'min-height', 'max-height',
			'left', 'right'
		]) {
			element.style.removeProperty(property);
		}
	});

	probe.style.setProperty('display', 'block', 'important');
	probe.style.setProperty('visibility', 'hidden', 'important');
	probe.style.setProperty('pointer-events', 'none', 'important');
	probe.style.setProperty('position', 'absolute', 'important');
	probe.style.setProperty('left', '-10000px', 'important');
	probe.style.setProperty('right', 'auto', 'important');
	probe.style.setProperty('bottom', 'auto', 'important');
	probe.style.setProperty('top', '0', 'important');
	probe.style.setProperty('transform', 'none', 'important');
	probe.style.setProperty('transition', 'none', 'important');
	probePanel.style.setProperty('display', 'block', 'important');
	probePanel.style.setProperty('transform', 'none', 'important');
	probePanel.style.setProperty('transition', 'none', 'important');
	probeMenu.style.setProperty('display', 'block', 'important');
	probeMenu.style.setProperty('transform', 'none', 'important');
	probeMenu.style.setProperty('transition', 'none', 'important');

	try {
		player.appendChild(probe);
		const probeRect = probe.getBoundingClientRect?.() || {};
		const panelRect = probePanel.getBoundingClientRect?.() || {};
		const width = probeRect.width || probe.offsetWidth || panelRect.width || probePanel.offsetWidth;
		const height = probeRect.height || probe.offsetHeight || probe.scrollHeight ||
			panelRect.height || probePanel.offsetHeight || probePanel.scrollHeight ||
			probeMenu.offsetHeight || probeMenu.scrollHeight;
		// .ytp-panel, not .ytp-panel-menu, is YouTube's actual overflow-y
		// container. Detect whether the remaining native panel really needs it.
		const menuClientHeight = probePanel.clientHeight || probePanel.offsetHeight || 0;
		const menuScrollHeight = probePanel.scrollHeight || menuClientHeight;

		return {
			height: Number.isFinite(height) && height > 0 ? Math.ceil(height) : 0,
			scrollable: menuClientHeight > 0 && menuScrollHeight > menuClientHeight + 1,
			width: Number.isFinite(width) && width > 0 ? Math.ceil(width) : 0
		};
	} catch (_) {
		return null;
	} finally {
		probe.remove?.() || probe.parentNode?.removeChild(probe);
	}
};

ImprovedTube.applyFilteredAudioMenuLayout = function (panel) {
	const menuPanel = panel?.closest?.('.ytp-panel');
	const settingsMenu = menuPanel?.closest?.('.ytp-settings-menu');
	// Clear YouTube's old offset while .ytp-panel is still scrollable. Once
	// overflow becomes `clip`, scrollTop can no longer be changed reliably.
	this.resetFilteredAudioMenuScroll(panel);
	const layout = this.measureFilteredAudioMenuLayout(panel);
	if (!menuPanel || !layout || (!layout.width && !layout.height)) return;

	const layoutElements = new Set(panel.itAutoDubbedMenuLayoutElements || []);
	[panel, menuPanel, settingsMenu].filter(Boolean).forEach(element => layoutElements.add(element));
	panel.itAutoDubbedMenuLayoutElements = Array.from(layoutElements);
	menuPanel.addEventListener?.('click', ImprovedTube.restoreAutoDubbedMenuBeforeBack, true);
	settingsMenu?.addEventListener?.('focusin', ImprovedTube.restoreAutoDubbedMenuBeforePanelFocus, true);

	// The inner table can retain the height and overflow of the unfiltered audio
	// list even after its rows are hidden. That stale box is what leaves the
	// first opening blank/scrolled; let the filtered rows define it naturally.
	ImprovedTube.saveAutoDubbedMenuLayout(panel);
	for (const [property, value] of [
		['height', 'auto'],
		['min-height', '0px'],
		['max-height', 'none'],
		['overflow', 'visible'],
		['overflow-x', 'visible'],
		['overflow-y', 'visible']
	]) {
		if (panel.style.getPropertyValue(property) !== value || panel.style.getPropertyPriority(property) !== 'important') {
			panel.style.setProperty(property, value, 'important');
		}
	}

	// YouTube writes the calculated dimensions to both elements. Updating only
	// .ytp-panel leaves the visible .ytp-settings-menu at its pre-filter size.
	[menuPanel, settingsMenu].filter(Boolean).forEach(function (element) {
		ImprovedTube.saveAutoDubbedMenuLayout(element);

		for (const property of ['width', 'min-width', 'max-width']) {
			const value = layout.width ? layout.width + 'px' : '';
			if (value && (element.style.getPropertyValue(property) !== value || element.style.getPropertyPriority(property) !== 'important')) {
				element.style.setProperty(property, value, 'important');
			}
		}
		for (const property of ['height', 'min-height', 'max-height']) {
			const value = layout.height ? layout.height + 'px' : '';
			if (value && (element.style.getPropertyValue(property) !== value || element.style.getPropertyPriority(property) !== 'important')) {
				element.style.setProperty(property, value, 'important');
			}
		}
	});

	// Disable scrolling on the actual .ytp-panel when all remaining manual
	// tracks fit. `clip` prevents both a scrollbar and YouTube's later
	// scrollIntoView() from restoring the offset of the hidden auto-dub track.
	if (layout.scrollable) {
		ImprovedTube.restoreAutoDubbedMenuLayoutProperties(menuPanel, ['overflow', 'overflow-x', 'overflow-y']);
	} else {
		for (const property of ['overflow', 'overflow-x', 'overflow-y']) {
			if (menuPanel.style.getPropertyValue(property) !== 'clip' || menuPanel.style.getPropertyPriority(property) !== 'important') {
				menuPanel.style.setProperty(property, 'clip', 'important');
			}
		}
	}

	[panel, menuPanel, settingsMenu].filter(Boolean).forEach(ImprovedTube.saveAutoDubbedMenuAppliedLayout);
};

ImprovedTube.cancelAutoDubbedMenuLayoutRefresh = function () {
	const job = this.autoDubbedMenuLayoutJob;
	if (!job) return;

	const cancelFrame = window.cancelAnimationFrame?.bind(window) || clearTimeout;
	if (job.frame) cancelFrame(job.frame);
	job.timers.forEach(clearTimeout);
	this.autoDubbedMenuLayoutJob = null;
};

ImprovedTube.resetFilteredAudioMenuScroll = function (panel) {
	const menuPanel = panel?.closest?.('.ytp-panel');
	const settingsMenu = menuPanel?.closest?.('.ytp-settings-menu');

	// On the first opening YouTube scrolls to the selected auto-dubbed item
	// before that section is hidden. The shortened menu then keeps this obsolete
	// scroll offset and appears blank until it is closed and opened again.
	[panel, menuPanel, settingsMenu].filter(Boolean).forEach(function (element) {
		if (typeof element.scrollTop === 'number' && element.scrollTop !== 0) {
			element.scrollTop = 0;
		}
	});
};

ImprovedTube.refreshAutoDubbedMenuLayout = function (panel) {
	if (!panel) return;

	const scheduleFrame = window.requestAnimationFrame?.bind(window) || function (callback) {
		return setTimeout(callback, 0);
	};
	const recalculate = function () {
		if (ImprovedTube.autoDubbedMenuPanel !== panel ||
			ImprovedTube.storage.hide_auto_dubbed_options !== true || panel.isConnected === false ||
			!panel.querySelector?.('[data-it-auto-dubbed-hidden="true"]') ||
			ImprovedTube.getAutoDubbedAudioMenuPanel() !== panel) {
			ImprovedTube.cancelAutoDubbedMenuLayoutRefresh();
			ImprovedTube.restoreAutoDubbedMenuLayout(panel);
			if (ImprovedTube.autoDubbedMenuPanel === panel) ImprovedTube.autoDubbedMenuPanel = null;
			return;
		}

		// YouTube measures the first audio panel before our filter runs and can
		// rewrite its inline dimensions during the opening transition. Re-measure
		// a filtered clone and keep both live containers at that native size.
		ImprovedTube.resetFilteredAudioMenuScroll(panel);
		ImprovedTube.applyFilteredAudioMenuLayout(panel);
		void panel.offsetWidth;
	};

	this.cancelAutoDubbedMenuLayoutRefresh();
	const job = {frame: null, timers: []};
	this.autoDubbedMenuLayoutJob = job;
	job.frame = scheduleFrame(recalculate);
	job.timers = [0, 50, 150, 350, 750].map(function (delay) {
		return setTimeout(recalculate, delay);
	});
};

ImprovedTube.getAutoDubbedAudioMenuPanel = function () {
	const panels = document.querySelectorAll?.('.ytp-settings-menu .ytp-panel-menu') || [];
	let activePanel = null;
	let activeIntersection = 0;
	let activeIntersectionRatio = 0;

	// Rank every settings panel before checking its contents. During Back,
	// YouTube can keep the old audio panel in the DOM after the root panel is
	// already visible; that stale panel must not reclaim the shared popup.
	for (const panel of panels) {
		if (panel.itAutoDubbedMenuLeaving === true) continue;

		const layoutPanel = panel.closest?.('.ytp-panel') || panel;
		// These classes make an outgoing panel transparent and translate it away.
		// It must release the shared popup immediately, before YouTube detaches it.
		if (layoutPanel.classList?.contains('ytp-panel-animate-back') ||
			layoutPanel.classList?.contains('ytp-panel-animate-forward')) continue;

		const settingsMenu = layoutPanel.closest?.('.ytp-settings-menu') || panel.closest?.('.ytp-settings-menu');
		const rect = layoutPanel.getBoundingClientRect?.();
		const menuRect = settingsMenu?.getBoundingClientRect?.();
		if (!rect || !menuRect || rect.width <= 0 || rect.height <= 0 || menuRect.width <= 0 || menuRect.height <= 0) continue;

		// YouTube keeps both submenu panels rendered during and after its slide
		// transition. offsetParent therefore also matches the old, translated panel.
		// Only the panel occupying the visible settings popup may own its layout.
		const intersectionWidth = Math.max(0, Math.min(rect.right, menuRect.right) - Math.max(rect.left, menuRect.left));
		const intersectionHeight = Math.max(0, Math.min(rect.bottom, menuRect.bottom) - Math.max(rect.top, menuRect.top));
		const intersection = intersectionWidth * intersectionHeight;
		const intersectionRatio = intersection / (rect.width * rect.height);
		if (intersectionRatio > activeIntersectionRatio ||
			(intersectionRatio === activeIntersectionRatio && intersection > activeIntersection)) {
			activeIntersection = intersection;
			activeIntersectionRatio = intersectionRatio;
			activePanel = panel;
		}
	}

	if (!activePanel) return null;

	const items = activePanel.querySelectorAll('.ytp-menuitem');
	const containsAutoDubbedSection = Array.from(items).some(function (item) {
		return item.classList.contains('ytp-menuitem-section-header') && ImprovedTube.isAutoDubbedMenuHeader(item);
	});

	return containsAutoDubbedSection ? activePanel : null;
};

ImprovedTube.hideAutoDubbedMenuItems = function () {
	const previousPanel = ImprovedTube.autoDubbedMenuPanel;
	const panel = ImprovedTube.getAutoDubbedAudioMenuPanel();
	if (!panel) {
		ImprovedTube.cancelAutoDubbedMenuLayoutRefresh();
		ImprovedTube.restoreAutoDubbedMenuLayout(previousPanel);
		ImprovedTube.autoDubbedMenuPanel = null;
		return;
	}
	if (previousPanel && previousPanel !== panel) ImprovedTube.restoreAutoDubbedMenuLayout(previousPanel);
	ImprovedTube.autoDubbedMenuPanel = panel;

	const shouldHide = ImprovedTube.storage.hide_auto_dubbed_options === true;
	const items = panel.querySelectorAll('.ytp-menuitem');
	ImprovedTube.rememberAutoDubbedMenuItems(items);

	let inAutoDubbedSection = false;
	let hiddenItemCount = 0;
	items.forEach(function (item) {
		if (item.classList.contains('ytp-menuitem-section-header')) {
			inAutoDubbedSection = ImprovedTube.isAutoDubbedMenuHeader(item);
		}

		if (shouldHide && inAutoDubbedSection) {
			item.dataset.itAutoDubbedHidden = 'true';
			if (item.style.getPropertyValue('display') !== 'none' || item.style.getPropertyPriority('display') !== 'important') {
				item.style.setProperty('display', 'none', 'important');
			}
			hiddenItemCount++;
		} else if (item.dataset.itAutoDubbedHidden === 'true') {
			delete item.dataset.itAutoDubbedHidden;
			item.style.removeProperty('display');
		}
	});

	if (shouldHide && hiddenItemCount > 0) {
		// Do the complete filtered layout synchronously. MutationObserver callbacks
		// run before paint, so the oversized/scrolled intermediate state is never
		// presented to the user.
		ImprovedTube.resetFilteredAudioMenuScroll(panel);
		ImprovedTube.applyFilteredAudioMenuLayout(panel);
		ImprovedTube.refreshAutoDubbedMenuLayout(panel);
	} else {
		ImprovedTube.cancelAutoDubbedMenuLayoutRefresh();
		ImprovedTube.restoreAutoDubbedMenuLayout(panel);
		ImprovedTube.autoDubbedMenuPanel = null;
	}
};

/*------------------------------------------------------------------------------
# AUTO-SELECT PREFERRED DUBBING LANGUAGE
------------------------------------------------------------------------------*/
/**
 * Automatically selects the audio track whose language code matches the user's
 * preferred dubbing language (storage.preferred_dubbing_language).
 * Falls back silently if no matching track is found.
 */
ImprovedTube.preferredDubbingLanguage = function () {
	const preferred = (ImprovedTube.storage.preferred_dubbing_language || '').trim().toLowerCase();
	if (!preferred) return;

	this.selectPermittedAudioTrack(this.elements.player, preferred);
	if (this.storage.disable_auto_dubbing === true) this.enforceAutoDubbingPolicy?.();
};
/*------------------------------------------------------------------------------
# SELECT DEFAULT DUBBED LANGUAGE
------------------------------------------------------------------------------*/
ImprovedTube.selectDubbedLanguage = function () {
	const self = this;
	const selectedLang = this.storage.player_default_dubbed_language;
	if (!selectedLang || selectedLang === 'disabled') return;

	var tries = 0;
	var maxTries = 10;
	var interval = setInterval(function () {
		tries++;
		const player = self.elements.player;
		if (!player || !player.getAvailableAudioTracks) {
			if (tries >= maxTries) clearInterval(interval);
			return;
		}

		const tracks = player.getAvailableAudioTracks();
		if (!tracks || !tracks.length) {
			if (tries >= maxTries) clearInterval(interval);
			return;
		}

		const targetTrack = self.selectPermittedAudioTrack(player, selectedLang);
		if (targetTrack || tries >= maxTries) {
			clearInterval(interval);
		}
	}, 300);
};
/*------------------------------------------------------------------------------
# JUMP TO THE NEXT KEY SCENE
------------------------------------------------------------------------------*/
ImprovedTube.jumpToKeyScene = function () {
	ImprovedTube.mostReplayed = function () {
	const player = document.querySelector('video');

	const data = extractYtInitialData();
	if (!data)
		return console.warn("Failed to extract ytInitialData.");

	const markers = getMostReplayedMarkers(data);
	if (!markers.length)
		return console.warn("No 'Most Replayed' markers found.");

	const currentMillis = player.currentTime * 1000;
	const sortedMarkers = markers.slice().sort((a, b) => a.decorationTimeMillis - b.decorationTimeMillis);
	const nextMarker = sortedMarkers.find(m => m.decorationTimeMillis > currentMillis) || sortedMarkers[0]; // fallback to first if none ahead
	const targetSeconds = nextMarker.decorationTimeMillis / 1000;

	player.currentTime = targetSeconds;
	player.play();
	console.log(`Jumped to Most Replayed @ ${Math.floor(targetSeconds / 60)}:${Math.floor(targetSeconds % 60).toString().padStart(2, "0")}`);

	function extractYtInitialData() {
		const scriptTags = document.querySelectorAll('script');

		for (let i = 0; i < scriptTags.length; i++) {
			if (DATA.ytInitialData) { var ytIData = DATA.ytInitialData; }
			else {
			const scriptContent = scriptTags[i].textContent;
			var ytIData = scriptContent.match(/var ytInitialData = ({.*?});/s);
			}

			if (ytIData) {
				try {
					return JSON.parse(ytIData[1]);
				} catch (e) {
					console.warn("Failed to parse ytInitialData JSON", e);
					return null;
				}
			}
		}

		return null;
	}

	function getMostReplayedMarkers(parsedJson) {
		const decorations = parsedJson?.['frameworkUpdates']?.['entityBatchUpdate']?.['mutations']?.[0]
			?.['payload']?.['macroMarkersListEntity']?.['markersList']?.['markersDecoration']?.['timedMarkerDecorations'];
		return decorations;
	}
	}

		DATA = {};
			ImprovedTube.fetchDOMData2 = function () {
				try { DATA = JSON.parse(document.querySelector('#microformat script')?.textContent) ?? false; DATA.title = DATA.name;}
			 catch { DATA.genre = false; DATA.keywords = false; DATA.lengthSeconds = false;
					try {
						DATA.title = document.getElementsByTagName('meta')?.title?.content || false;
						DATA.genre = document.querySelector('meta[itemprop=genre]')?.content || false;
						DATA.duration = document.querySelector('meta[itemprop=duration]')?.content || false;
			 } catch {}}

let tries = 0; const maxTries = 3; let intervalMs = 25;
const waitForVideoTitle = setInterval(() => { const title = ImprovedTube.videoTitle?.();  tries++;
if (title && title !== 'YouTube') {
    clearInterval(waitForVideoTitle);
			 DATA.videoID = ImprovedTube.videoId() || false;
			 console.log("MOST REPLAYED: TITLE:" + ImprovedTube.videoTitle() + DATA.title);
			 if ( (DATA.title === ImprovedTube.videoTitle() || DATA.title.replace(/\s{2,}/g, ' ') === ImprovedTube.videoTitle())
				   && ((history && history.length === 1) || !history?.state?.endpoint?.watchEndpoint))
				   { ImprovedTube.mostReplayed(); }
				else { keywords = ''; (async function () { try { const response = await fetch(`https://www.youtube.com/watch?v=${DATA.videoID}`);
					console.log("loading the html source:" + `https://www.youtube.com/watch?v=${DATA.videoID}`);
					const htmlContent = await response.text();
					DATA.ytInitialData = htmlContent.match(/var ytInitialData = ({.*?});/s);
					if (DATA.ytInitialData) { ImprovedTube.mostReplayed(); }
				} catch (error) {
const o = Object.assign(document.createElement('div'), { innerText: 'too few views' });
const keySceneButton = document.querySelector('button[data-tooltip="Key Scene"]');
		if (keySceneButton) {  keySceneButton.style.transition = 'opacity 0.4s';  keySceneButton.style.opacity = '0.3';
		setTimeout(() => {    keySceneButton.style.opacity = '0.8';    }, 5000);}
		console.error(`Error: fetching from https://Youtube.com/watch?v=${DATA.videoID}`, error);  }
				})();
				}
}

if (tries >= maxTries) {  clearInterval(waitForVideoTitle); } intervalMs *= 1.11; }, intervalMs);
window.addEventListener('load', () => {  setTimeout(() => { clearInterval(waitForVideoTitle) }, 5000);});
			};
			ImprovedTube.fetchDOMData2();




}

/*------------------------------------------------------------------------------
REDIRECT SHORTS TO WATCH URL
------------------------------------------------------------------------------*/
ImprovedTube.redirectShortsToWatch = function () {
    if (this.storage.redirect_shorts_to_watch !== true) {
        return;
    }
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/shorts/')) {
        const videoId = currentPath.substring('/shorts/'.length);
        if (videoId) {
            const newUrl = `${window.location.origin}/watch?v=${videoId}${window.location.search}`;
            if (window.location.href !== newUrl) {
                console.log(`ImprovedTube: Redirecting Shorts to Watch: ${window.location.href} -> ${newUrl}`);
                window.location.replace(newUrl);
            }
        }
    }
};

/*------------------------------------------------------------------------------
YOUTUBE RETURN BUTTON IN FULLSCREEN
------------------------------------------------------------------------------*/
ImprovedTube.addYouTubeReturnButton = function () {
    if (this.storage.fullscreen_return_button === true) {
        // Remove existing button if it exists
        const existingButton = document.querySelector('#it-youtube-return-button');
        if (existingButton) {
            existingButton.remove();
        }

        // Create the return button
        const returnButton = document.createElement('button');
        returnButton.id = 'it-youtube-return-button';
        returnButton.className = 'ytp-button it-youtube-return-btn';
        returnButton.title = 'Return to YouTube';
        returnButton.setAttribute('aria-label', 'Return to YouTube');

        // Create YouTube logo SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.style.fill = 'white';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z');

        svg.appendChild(path);
        returnButton.appendChild(svg);

        // Add click handler
        returnButton.addEventListener('click', function(e) {
			history.back();
            e.preventDefault();
            e.stopPropagation();
        });

        // Insert button into player controls
        const insertButton = () => {
            const player = document.querySelector('.html5-video-player');
            const titleContainer = document.querySelector('.ytp-title-text');

            if (player && titleContainer && player.classList.contains('ytp-fullscreen')) {
                // Position button in top-left corner of fullscreen player
                titleContainer.parentNode.insertBefore(returnButton, titleContainer);
            }
        };

        // Insert button when entering fullscreen
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const player = mutation.target;
                    if (player.classList.contains('ytp-fullscreen')) {
                        setTimeout(insertButton, 100); // Small delay to ensure DOM is ready
                    }
                }
            });
        });

        const player = document.querySelector('.html5-video-player');
        if (player) {
            observer.observe(player, { attributes: true, attributeFilter: ['class'] });
        }

        // Also check if already in fullscreen
        if (player && player.classList.contains('ytp-fullscreen')) {
            insertButton();
        }
    }
};

/*------------------------------------------------------------------------------
SHORTS AUTO SCROLL
------------------------------------------------------------------------------*/
ImprovedTube.shortsAutoScroll = function () {
    if (this.storage.shorts_auto_scroll) {
        if (!ImprovedTube.shortsAutoScrollInterval) {
            ImprovedTube.shortsAutoScrollInterval = setInterval(() => {
                if (!location.pathname.startsWith('/shorts/')) return;

                const activeRenderer = document.querySelector('ytd-reel-video-renderer[is-active]');
                const video = activeRenderer ? activeRenderer.querySelector('video') : null;

                if (video && !video.dataset.itShortsScrollAttached) {
                    video.dataset.itShortsScrollAttached = 'true';

                    const timeupdateHandler = function () {
                        if (!ImprovedTube.storage.shorts_auto_scroll) {
                            video.removeEventListener('timeupdate', timeupdateHandler);
                            delete video.dataset.itShortsScrollAttached;
                            return;
                        }
                        if (this.paused) return;

                        // Get fresh references to avoid stale DOM elements
                        const currentActiveRenderer = document.querySelector('ytd-reel-video-renderer[is-active]');
                        const isVideoStillActive = currentActiveRenderer && currentActiveRenderer.contains(this);

                        if (!isVideoStillActive) {
                            this.removeEventListener('timeupdate', timeupdateHandler);
                            delete this.dataset.itShortsScrollAttached;
                            return;
                        }

                        if (this.duration && this.currentTime >= this.duration - 0.25) {
                            try {
                                // Find next button with fresh reference
                                const nextButton = currentActiveRenderer.querySelector('#navigation-button-down button')
                                                || document.querySelector('#navigation-button-down button')
                                                || document.querySelector('button[aria-label="Next video"]');

                                if (nextButton) {
                                    this.pause();
                                    nextButton.click();
                                }
                            } catch (error) {
                                console.warn('[ImprovedTube] Shorts auto-scroll error:', error);
                                // Remove listener on error to prevent breaking
                                this.removeEventListener('timeupdate', timeupdateHandler);
                                delete this.dataset.itShortsScrollAttached;
                            }
                        }
                    };

                    video.addEventListener('timeupdate', timeupdateHandler);
                }
            }, 1000);
        }
    } else {
        if (ImprovedTube.shortsAutoScrollInterval) {
            clearInterval(ImprovedTube.shortsAutoScrollInterval);
            ImprovedTube.shortsAutoScrollInterval = null;
        }

        // Clean up all existing event listeners when disabled
        document.querySelectorAll('video[data-it-shorts-scroll-attached]').forEach(video => {
            delete video.dataset.itShortsScrollAttached;
        });
    }
};


/*==============================================================================
SMART SPEED ENGINE
================================================================================
*/

(function () {
    'use strict';
    if (typeof ImprovedTube === 'undefined') return;

    /*==========================================================================
    0. UTILITIES
       Shared helpers used across the modules below.
    ==========================================================================*/
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    const toNum = (v, fallback, lo = -Infinity, hi = Infinity) => {
        if (v === null || v === undefined || v === '') return fallback;
        const n = Number(v);
        return Number.isFinite(n) ? clamp(n, lo, hi) : fallback;
    };

    function debugLog(...args) {
        if (ImprovedTube.storage && ImprovedTube.storage.smart_speed_debug === true) {
            console.debug('[SmartSpeed]', ...args);
        }
    }

    /** Updates the key in memory and relays the change through the
     *  content-script bridge so it's persisted and other contexts stay in sync. */
    function setStorage(key, value) {
        ImprovedTube.storage[key] = value;
        if (ImprovedTube.messages && typeof ImprovedTube.messages.send === 'function') {
            ImprovedTube.messages.send({ action: 'storage-set', key, value });
        }
    }

    /** fetch() with a timeout, plus an optional external AbortSignal
     *  (e.g. to cancel when the user navigates away from a video). */
    async function fetchWithTimeout(url, { timeoutMs = 5000, signal, ...opts } = {}) {
        const ctrl = new AbortController();
        const onExternalAbort = () => ctrl.abort();
        if (signal) {
            if (signal.aborted) ctrl.abort();
            else signal.addEventListener('abort', onExternalAbort, { once: true });
        }
        const timer = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
            return await fetch(url, { ...opts, signal: ctrl.signal });
        } finally {
            clearTimeout(timer);
            if (signal) signal.removeEventListener('abort', onExternalAbort);
        }
    }

    async function sha256Hex(str) {
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            try {
                const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
                return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
            } catch (e) {
                debugLog('SHA-256 digest failed', e);
            }
        }
        return null;
    }


    /** Fixed-capacity cache that evicts the oldest entry once full. */
    class LRUCache {
        constructor(max) { this.max = max; this.map = new Map(); }
        get(key) { return this.map.get(key); }
        has(key) { return this.map.has(key); }
        set(key, value) {
            this.map.delete(key);
            this.map.set(key, value);
            if (this.map.size > this.max) this.map.delete(this.map.keys().next().value);
        }
        delete(key) { this.map.delete(key); }
    }

    const _entityTextarea = typeof document !== 'undefined' ? document.createElement('textarea') : null;
    const decodeEntities = (s) => {
        if (!s || !s.includes('&')) return s || '';
        if (_entityTextarea) { _entityTextarea.innerHTML = s; return _entityTextarea.value; }
        return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    };
    const normalizeText = (s) => decodeEntities(String(s ?? '')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    // Matches non-speech captions like "[music]" or "(applause)" so they're
    // excluded when building speech blocks.
    const NON_SPEECH_REGEX = /^[\(\[\{♪\s]*(music|applause|laughter|chuckle|gasp|cough|groan|sigh|cheering|crowd|noise|silence|singing|playing|instrumental|beep|static|screaming|cheers|unintelligible|indistinct)[\)\]\}♪\s]*$/i;
    const isNonSpeech = (text) => {
        if (!text) return true;
        if (NON_SPEECH_REGEX.test(text)) return true;
        if (/^[♪\s]+$/.test(text)) return true;
        if (/^[\[\(\{\s]*[\]\)\}\s]*$/.test(text)) return true;
        return false;
    };

    // Rough syllable-count heuristic for how long a caption cue takes to speak,
    // used when a cue has no reliable duration of its own.
    function estimateCueSpeechDuration(text) {
        const words = normalizeText(text).split(/\s+/).filter(Boolean);
        if (words.length === 0) return 1.0;
        let totalSyllables = 0, complexBonus = 0;
        for (const w of words) {
            const clean = w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
            if (!clean) continue;
            let syl = 1;
            if (/[a-z]/.test(clean)) {
                if (clean.length > 3) {
                    const matches = clean.replace(/(?:ing|ed|es|e)$/, '').match(/[aeiouy]{1,2}/g);
                    syl = matches ? matches.length : 1;
                }
            } else {
                syl = Math.max(1, Math.ceil(clean.length / 3.5));
            }
            totalSyllables += syl;
            if (syl >= 3) complexBonus += 0.25;
        }
        return clamp((totalSyllables / 3.8) + complexBonus, 1.0, 12.0);
    }

    // Padding added before/after each cue so playback slows down slightly
    // ahead of and after the spoken line, not just during it.
    const SPEECH_LEAD_IN = 2.0, SPEECH_TAIL = 1.0;
    function buildSpeechBlocksFromCues(rawCues) {
        const cues = rawCues
            .map(c => ({ ...c, text: normalizeText(c.text) }))
            .filter(c => c.text && !isNonSpeech(c.text) && Number.isFinite(c.start))
            .sort((a, b) => a.start - b.start);

        const blocks = [];
        cues.forEach((c, i) => {
            const dur = Math.max(c.dur || 0, estimateCueSpeechDuration(c.text));
            let end = c.start + dur + SPEECH_TAIL;
            if (cues[i + 1]) end = Math.min(end, cues[i + 1].start - SPEECH_LEAD_IN + SPEECH_TAIL);
            const start = Math.max(0, c.start - SPEECH_LEAD_IN);
            if (end > start) blocks.push({ start, end, confidence: 1 });
        });
        return blocks;
    }

    /*==========================================================================
    1. SPEECH MAP
       Sorted timeline of speech blocks with cosine-eased lead-in/release
       ramps, used to slow playback around dialogue.
    ==========================================================================*/
    const SPEECH_MERGE_MAX_GAP_SEC = 3.0;
    const SPEECH_MIN_BLOCK_DURATION_SEC = 0.5;

    class SpeechMap {
        constructor() { this.blocks = []; }
        reset() { this.blocks = []; }

        addBlocks(list) {
            if (!Array.isArray(list) || list.length === 0) return;
            const input = list
                .map(b => ({
                    start: Math.max(0, Number(b.start || 0)),
                    end: Math.max(0, Number(b.end || 0)),
                    confidence: typeof b.confidence === 'number' ? clamp(b.confidence, 0, 1) : 1.0
                }))
                .filter(b => b.end > b.start)
                .sort((a, b) => a.start - b.start);
            if (input.length === 0) return;

            const merged = [];
            let curr = { ...input[0] };
            for (let i = 1; i < input.length; i++) {
                const next = input[i];
                if (next.start <= curr.end || (next.start - curr.end) <= SPEECH_MERGE_MAX_GAP_SEC) {
                    curr.end = Math.max(curr.end, next.end);
                    curr.confidence = Math.max(curr.confidence, next.confidence);
                } else {
                    if ((curr.end - curr.start) >= SPEECH_MIN_BLOCK_DURATION_SEC) merged.push(curr);
                    curr = { ...next };
                }
            }
            if ((curr.end - curr.start) >= SPEECH_MIN_BLOCK_DURATION_SEC) merged.push(curr);
            this.blocks = merged;
        }

        // Binary search for the nearest blocks, then apply the cosine ease
        // in/out if `t` falls just before or after one.
        probabilityAt(t, leadSec = 5.0, releaseSec = 2.0) {
            if (this.blocks.length === 0) return 0;
            const lead = Math.max(0, leadSec), release = Math.max(0, releaseSec);

            let low = 0, high = this.blocks.length - 1, idx = -1;
            while (low <= high) {
                const mid = (low + high) >> 1;
                if (this.blocks[mid].start <= t) { idx = mid; low = mid + 1; } else { high = mid - 1; }
            }
            const candidates = new Set([idx, idx + 1, idx - 1].filter(i => i >= 0 && i < this.blocks.length));

            let maxProb = 0;
            for (const i of candidates) {
                const b = this.blocks[i];
                let p = 0;
                if (t >= b.start && t <= b.end) p = b.confidence;
                else if (t < b.start && (b.start - t) <= lead && lead > 0) {
                    p = b.confidence * (0.5 * (1 + Math.cos(Math.PI * ((b.start - t) / lead))));
                } else if (t > b.end && (t - b.end) <= release && release > 0) {
                    p = b.confidence * (0.5 * (1 + Math.cos(Math.PI * ((t - b.end) / release))));
                }
                if (p > maxProb) maxProb = p;
            }
            return maxProb;
        }
    }

    /*==========================================================================
    2. SPONSORBLOCK CLIENT
       Queries the SponsorBlock API using k-anonymity (hash-prefix) lookup,
       caching results per video with a result-dependent TTL.
    ==========================================================================*/
    const SponsorBlockClient = {
        _cache: new LRUCache(20),
        _inflight: new Map(),
        TTL: { ok: 6 * 36e5, empty: 30 * 6e4, error: 6e4 },

        isNeeded() {
            const s = ImprovedTube.storage || {};
            return s.smart_speed_sponsorblock_enabled !== false
                || s.smart_speed_introoutro_enabled !== false
                || s.smart_speed_skip_intro_button !== false
                || s.smart_speed_skip_sponsor_button !== false;
        },


        get(videoId, signal) {
            if (!videoId) return Promise.resolve([]);
            const hit = this._cache.get(videoId);
            if (hit && hit.expires > Date.now()) return Promise.resolve(hit.segments);
            if (this._inflight.has(videoId)) return this._inflight.get(videoId);

            const p = this._fetch(videoId, signal).finally(() => this._inflight.delete(videoId));
            this._inflight.set(videoId, p);
            return p;
        },

        async _fetch(videoId, signal) {
            let segments = [], ttl = this.TTL.error;
            try {
                const hash = await sha256Hex(videoId);
                if (!hash) return segments;
                const prefix = hash.slice(0, 4);

                const qs = new URLSearchParams({
                    categories: JSON.stringify(['sponsor', 'intro', 'outro', 'selfpromo', 'preview']),
                    service: 'YouTube'
                });
                const res = await fetchWithTimeout(`https://sponsor.ajay.app/api/skipSegments/${prefix}?${qs}`, {
                    credentials: 'omit', referrerPolicy: 'no-referrer', timeoutMs: 5000, signal
                });

                if (res.status === 404) {
                    ttl = this.TTL.empty;
                } else if (res.ok) {
                    const data = await res.json();
                    const entry = Array.isArray(data) ? data.find(e => e.videoID === videoId) : null;
                    segments = (entry?.segments || []).filter(s =>
                        Array.isArray(s.segment) && s.segment.length === 2 && s.segment.every(Number.isFinite)
                    );
                    ttl = segments.length ? this.TTL.ok : this.TTL.empty;
                }
            } catch (e) {
                debugLog('SponsorBlock fetch error', e);
            }
            this._cache.set(videoId, { segments, expires: Date.now() + ttl });
            return segments;
        }
    };

    /*==========================================================================
    3. HEATMAP SOURCE
       Acquires heatmap markers through a tiered fallback: active player,
       page globals, local cache, then a network fetch. `acquire()` returns
       the first hit and never touches playback state.
    ==========================================================================*/
    // Recursively searches a YouTube data object for the heatmap markers node.
    function findMarkersDeep(obj, depth = 0) {
        if (!obj || typeof obj !== 'object' || depth > 15) return null;
        if (obj.markerType === 'MARKER_TYPE_HEATMAP' && Array.isArray(obj.markers)) return obj.markers;
        if (obj.key === 'MARKER_TYPE_HEATMAP' && obj.value && Array.isArray(obj.value.markers)) return obj.value.markers;
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const found = findMarkersDeep(obj[key], depth + 1);
                if (found) return found;
            }
        }
        return null;
    }

    // Guards against reusing stale data left over from a previous video.
    function belongsToVideo(data, expectedVideoId) {
        if (!data || typeof data !== 'object' || !expectedVideoId) return false;
        const vidId = data.videoDetails?.videoId
            || data.currentVideoEndpoint?.watchEndpoint?.videoId
            || data.endpoint?.watchEndpoint?.videoId;
        return !vidId || vidId === expectedVideoId;
    }

    const HeatmapSource = {
        _cache: new LRUCache(50),

        rememberFor(videoId, markers) {
            if (!videoId || !Array.isArray(markers)) return;
            this._cache.set(videoId, markers.map(m => ({
                startMillis: Number(m.startMillis || 0),
                durationMillis: Number(m.durationMillis || 0),
                intensityScoreNormalized: Number(m.intensityScoreNormalized || 0)
            })));
        },

        /** Tier 1: the active YT player object already has it in memory. */
        fromActivePlayer(videoId) {
            try {
                const resp = document.getElementById('movie_player')?.getPlayerResponse?.();
                if (belongsToVideo(resp, videoId)) {
                    const markers = findMarkersDeep(resp);
                    if (markers?.length) return { markers, playerResponse: resp };
                }
            } catch (e) { debugLog('heatmap: active player tier failed', e); }
            return null;
        },

        /** Tier 2: page-global bootstrap data (present on first paint). */
        fromGlobals(videoId) {
            try {
                if (belongsToVideo(window.ytInitialData, videoId)) {
                    const markers = findMarkersDeep(window.ytInitialData);
                    if (markers?.length) return { markers, playerResponse: null };
                }
                if (belongsToVideo(window.ytInitialPlayerResponse, videoId)) {
                    const markers = findMarkersDeep(window.ytInitialPlayerResponse);
                    if (markers?.length) return { markers, playerResponse: window.ytInitialPlayerResponse };
                }
            } catch (e) { debugLog('heatmap: globals tier failed', e); }
            return null;
        },

        /** Tier 3: something we already fetched earlier this session. */
        fromLocalCache(videoId) {
            if (this._cache.has(videoId)) return { markers: this._cache.get(videoId), playerResponse: null };
            return null;
        },

        /** Tier 4 (network, last resort): raw watch-page HTML scrape. */
        async fromWatchPageFetch(videoId, signal) {
            try {
                const res = await fetchWithTimeout(`https://www.youtube.com/watch?v=${videoId}`, {
                    credentials: 'omit', timeoutMs: 8000, signal
                });
                const text = await res.text();
                const matchData = text.match(/var ytInitialData = ({.*?});<\/script>/s) || text.match(/var ytInitialData = ({.*?});/s);
                const matchResp = text.match(/var ytInitialPlayerResponse = ({.*?});<\/script>/s) || text.match(/var ytInitialPlayerResponse = ({.*?});/s);

                for (const match of [matchData, matchResp]) {
                    if (!match) continue;
                    try {
                        const parsed = JSON.parse(match[1]);
                        if (belongsToVideo(parsed, videoId)) {
                            const markers = findMarkersDeep(parsed);
                            if (markers?.length) return { markers, playerResponse: match === matchResp ? parsed : null };
                        }
                    } catch (e) { /* try the next candidate */ }
                }
            } catch (e) {
                debugLog('heatmap: watch-page fetch tier failed', e);
            }
            return null;
        },

        /** Walks all tiers in priority order; caches a hit; returns
         *  { markers, playerResponse } (markers === [] means "confirmed none"). */
        async acquire(videoId, signal) {
            const sync = this.fromActivePlayer(videoId) || this.fromGlobals(videoId) || this.fromLocalCache(videoId);
            if (sync) { this.rememberFor(videoId, sync.markers); return sync; }

            const remote = await this.fromWatchPageFetch(videoId, signal);
            if (remote) { this.rememberFor(videoId, remote.markers); return remote; }

            return { markers: [], playerResponse: null };
        }
    };

    /*==========================================================================
    4. CAPTION SOURCE
       Feeds the `transcript` signal. Tries the TimedText API first (fast,
       no DOM access), falling back to scraping the transcript panel.
    ==========================================================================*/
    const CaptionSource = {
        getPlayerResponseHint(session) { return session?.playerResponse || null; },

        async fromTimedTextApi(videoId, session, signal) {
            const playerResponse = this.getPlayerResponseHint(session) || HeatmapSource.fromActivePlayer(videoId)?.playerResponse;
            const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
            if (!Array.isArray(tracks) || tracks.length === 0) return null;

            const track = tracks.find(t => t.languageCode === 'en' && t.kind !== 'asr')
                || tracks.find(t => t.languageCode === 'en')
                || tracks.find(t => t.isTranslatable)
                || tracks[0];
            if (!track?.baseUrl) return null;

            try {
                const res = await fetchWithTimeout(track.baseUrl + '&fmt=json3', { timeoutMs: 6000, signal });
                if (!res.ok) return null;
                const text = await res.text();
                let rawCues = [];

                if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
                    try {
                        const data = JSON.parse(text);
                        for (const ev of data?.events || []) {
                            if (!ev.segs) continue;
                            const cueText = ev.segs.map(s => s.utf8 || '').join('').trim();
                            const cueStart = (ev.tStartMs || 0) / 1000;
                            if (cueText && Number.isFinite(cueStart)) {
                                rawCues.push({ start: cueStart, dur: (ev.dDurationMs || 0) / 1000, text: cueText });
                            }
                        }
                    } catch (e) { debugLog('timedtext json parse error', e); }
                }
                if (rawCues.length === 0) {
                    try {
                        const nodes = new DOMParser().parseFromString(text, 'text/xml').querySelectorAll('text');
                        for (const node of nodes) {
                            const cueStart = parseFloat(node.getAttribute('start') || '0');
                            const cueText = (node.textContent || '').trim();
                            if (cueText && Number.isFinite(cueStart)) {
                                rawCues.push({ start: cueStart, dur: parseFloat(node.getAttribute('dur') || '0'), text: cueText });
                            }
                        }
                    } catch (e) { debugLog('timedtext xml parse error', e); }
                }

                const blocks = buildSpeechBlocksFromCues(rawCues);
                return blocks.length ? blocks : null;
            } catch (e) {
                debugLog('timedtext fetch error', e);
                return null;
            }
        },

        async fromTranscriptPanel(isStale) {
            if (document.fullscreenElement) return { blocks: null, status: 'unavailable:fullscreen' };

            let button = null;
            const searchStart = Date.now();
            while (Date.now() - searchStart < 10000) {
                if (isStale()) return { blocks: null, status: null };
                for (const b of document.querySelectorAll('button, [role="button"]')) {
                    const label = (b.getAttribute('aria-label') || b.textContent || '').trim();
                    if (/show transcript|transcript/i.test(label)) { button = b; break; }
                }
                if (button) break;
                await new Promise(r => setTimeout(r, 500));
            }
            if (!button) return { blocks: null, status: 'unavailable:no_button' };

            const panelSelector = 'ytd-engagement-panel-section-list-renderer[target-id*="transcript"]';
            const alreadyExpanded = document.querySelector(panelSelector)?.getAttribute('visibility') === 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED';
            let openedByUs = false;
            if (!alreadyExpanded) {
                try { button.click(); openedByUs = true; }
                catch (e) { return { blocks: null, status: 'unavailable:click_error' }; }
            }

            let rows = [];
            const pollStart = Date.now();
            while (Date.now() - pollStart < 5000) {
                if (isStale()) return { blocks: null, status: null };
                rows = Array.from(document.querySelectorAll('transcript-segment-view-model, ytd-transcript-segment-renderer'));
                if (rows.length) break;
                await new Promise(r => setTimeout(r, 200));
            }

            // Close the panel again if we're the ones who opened it.
            const restore = async () => {
                if (!openedByUs) return;
                const panel = document.querySelector(panelSelector);
                const closeBtn = panel && (
                    panel.querySelector('#visibility-button button')
                    || Array.from(panel.querySelectorAll('button')).find(b => /close/i.test(b.getAttribute('aria-label') || ''))
                );
                if (closeBtn) { try { closeBtn.click(); } catch (e) { /* best-effort */ } }
            };

            if (rows.length === 0) { await restore(); return { blocks: null, status: 'unavailable:panel_empty' }; }

            const rawCues = [];
            for (const row of rows) {
                const rawText = (row.textContent || '').trim().replace(/\s+/g, ' ');
                const match = rawText.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)$/);
                let timeText = '', cueText = '';
                if (match) { [, timeText, cueText] = match; }
                else {
                    const timeEl = row.querySelector('.segment-timestamp, [class*="timestamp"], div[class*="time"]') || row.children[0];
                    const textEl = row.querySelector('.segment-text, [class*="segment-text"], yt-formatted-string, [class*="text"]') || row.children[1];
                    timeText = timeEl ? timeEl.textContent.trim() : '';
                    cueText = textEl ? textEl.textContent.trim() : rawText.replace(timeText, '').trim();
                }
                if (!timeText || !cueText) continue;
                const parts = timeText.split(':').map(p => parseInt(p, 10));
                let totalSec = null;
                if (parts.length === 2 && !parts.some(isNaN)) totalSec = parts[0] * 60 + parts[1];
                else if (parts.length === 3 && !parts.some(isNaN)) totalSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
                if (totalSec !== null) rawCues.push({ start: totalSec, text: cueText });
            }

            await restore();
            const blocks = buildSpeechBlocksFromCues(rawCues);
            return { blocks: blocks.length ? blocks : null, status: blocks.length ? null : 'unavailable:parse_error' };
        },

        /** Returns { blocks, status } never throws. `isStale()` lets the
         *  caller cut a slow DOM scrape short if the user has navigated away. */
        async acquire(videoId, session, signal, isStale) {
            if (ImprovedTube.storage.smart_speed_captions_enabled === false) {
                return { blocks: null, status: 'unavailable:disabled' };
            }
            const apiBlocks = await this.fromTimedTextApi(videoId, session, signal);
            if (apiBlocks) return { blocks: apiBlocks, status: `active (${apiBlocks.length} blocks)` };
            if (isStale()) return { blocks: null, status: null };

            const panelResult = await this.fromTranscriptPanel(isStale);
            if (panelResult.blocks) return { blocks: panelResult.blocks, status: `active (${panelResult.blocks.length} blocks)` };
            return { blocks: null, status: panelResult.status || 'unavailable:unknown' };
        }
    };

    /*==========================================================================
    5. PROFILE RESOLVER
       Resolves the effective speed settings {min, max, sens, weights, ...}
       from the channel/category/language profile hierarchy. Cached until
       `Profiles.invalidate()` is called.
    ==========================================================================*/
    /**
     * @typedef {Object} SpeedContext
     * @property {number} currentSec   - playback position being evaluated, in seconds
     * @property {number} duration     - total video duration, in seconds
     * @property {Object} profile      - resolved speed profile (see Profiles.resolve)
     * @property {HTMLVideoElement} video
     * @property {string|null} videoId
     * @property {Session} session
     * @property {Object|null} segment - heatmap segment being evaluated, or null
     * @property {number} bias         - target-duration speed bias, e.g. -0.5..+0.5
     */
    function makeContext({ currentSec = 0, duration = 0, profile = null, video = null, videoId = null, session = null, segment = null, bias = 0 } = {}) {
        return { currentSec, duration, profile, video, videoId, session, segment, bias };
    }

    /**
     * Returns the single canonical storage key for a channel identity.
     * Prefers `channel:<id>` when channel ID is available, falling back to
     * `name:<name>` when only display name is known.
     */
    function canonicalChannelKey(ident) {
        if (!ident) return null;
        if (ident.id) return 'channel:' + ident.id;
        if (ident.name) return 'name:' + ident.name;
        return null;
    }

    /**
     * Migrates any existing profile entry saved under the channel's display name
     * into the canonical ID-keyed slot once a channel ID becomes available.
     */
    function migrateLegacyChannelKey(profiles, ident, cKey) {
        if (!ident?.id || !ident?.name || !cKey) return;
        const oldNameKey = ident.name;
        const oldPrefixedKey = 'name:' + ident.name;
        if (profiles[oldNameKey] || profiles[oldPrefixedKey]) {
            const legacyData = profiles[oldNameKey] || profiles[oldPrefixedKey];
            profiles[cKey] = { ...legacyData, ...(profiles[cKey] || {}) };
            if (profiles[oldNameKey]) delete profiles[oldNameKey];
            if (profiles[oldPrefixedKey]) delete profiles[oldPrefixedKey];
            setStorage('smart_speed_profiles', profiles);
        }
    }

    const Profiles = {
        _cache: null,
        _dirty: true,
        invalidate() { this._dirty = true; },

        channelIdentity(playerResponse) {
            const details = playerResponse?.videoDetails;
            if (details?.channelId) return { id: details.channelId, name: details.author || '' };
            const el = document.querySelector('.ytd-channel-name a') || document.querySelector('#upload-info .ytd-channel-name');
            const name = el ? el.textContent.trim() : null;
            return name && name !== 'Unknown' ? { id: null, name } : null;
        },

        audioLanguage(playerResponse) {
            const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
            const code = (tracks.find(t => t.kind === 'asr') || tracks[0])?.languageCode;
            return code ? code.toLowerCase().split('-')[0] : null;
        },

        /** `ctxHint` = { playerResponse } — whatever the current session has
         *  handy, so we don't need to re-derive it from scratch every call. */
        resolve(ctxHint = {}) {
            if (!this._dirty && this._cache) return this._cache;

            const playerResponse = ctxHint.playerResponse || null;
            const ident = this.channelIdentity(playerResponse);
            const genre = playerResponse?.microformat?.playerMicroformatRenderer?.category
                || document.querySelector('meta[itemprop="genre"]')?.content
                || 'Unknown';
            const audioLang = this.audioLanguage(playerResponse);
            const profiles = ImprovedTube.storage.smart_speed_profiles || {};
            const priorityOrder = (ImprovedTube.storage.smart_speed_rule_priority || 'channel,category,language').split(',').map(s => s.trim());

            let resolved = null, tier = 'global';
            for (const ruleType of priorityOrder) {
                if (ruleType === 'channel' && ident) {
                    const cKey = canonicalChannelKey(ident);
                    if (cKey) {
                        migrateLegacyChannelKey(profiles, ident, cKey);
                        resolved = profiles[cKey] || (ident.name && profiles['name:' + ident.name]) || (ident.name && profiles[ident.name]);
                        if (resolved) { tier = 'channel'; break; }
                    }
                }
                if (ruleType === 'category') {
                    resolved = profiles['category:' + genre] || profiles[genre];
                    if (resolved) { tier = 'category'; break; }
                }
                if (ruleType === 'language' && audioLang && profiles['lang:' + audioLang]) {
                    resolved = profiles['lang:' + audioLang];
                    tier = 'language';
                    break;
                }
            }

            const s = ImprovedTube.storage || {};
            const min = toNum(resolved?.min ?? s.smart_speed_min, 1.0, 0.0625, 16);
            let max = toNum(resolved?.max ?? s.smart_speed_max, 2.0, 0.0625, 16);
            if (max < min) max = min;

            this._cache = {
                min, max,
                sens: toNum(resolved?.sens ?? s.smart_speed_sensitivity, 0.5, 0, 1),
                speechLead: toNum(s.smart_speed_speech_lead_seconds, 5, 0, 30),
                speechRelease: toNum(s.smart_speed_speech_release_seconds, 2, 0, 30),
                whitelist: !!resolved?.whitelist,
                signalWeights: Object.assign(
                    { heatmap: 1.0, transcript: toNum(s.smart_speed_caption_weight, 1.0, 0, 10) },
                    resolved?.signalWeights || {}
                ),
                introOutroSpeed: toNum(s.smart_speed_introoutro_max, 2.0, 0.0625, 16),
                tier,
                channelIdentity: ident
            };
            this._dirty = false;
            return this._cache;
        }
    };

    /** Storage keys that invalidate the resolved profile when changed. */
    const PROFILE_AFFECTING_KEYS = new Set([
        'smart_speed_profiles', 'smart_speed_rule_priority', 'smart_speed_min',
        'smart_speed_max', 'smart_speed_sensitivity', 'smart_speed_speech_lead_seconds',
        'smart_speed_speech_release_seconds', 'smart_speed_caption_weight', 'smart_speed_introoutro_max'
    ]);

    /*==========================================================================
    6. SIGNAL REGISTRY
       Weighted speed inputs. Each signal is
       `{ defaultWeight, enabledKey?, compute(ctx) }`, where compute(ctx)
       returns null (not applicable) or {value, confidence}.
       computeCompositeSpeed() below blends all active signals — add new
       signals here.
    ==========================================================================*/
    const Signals = {
        heatmap: {
            defaultWeight: 1.0,
            compute(ctx) {
                if (!ctx.segment) return null;
                const { sens, min, max } = ctx.profile;
                const intensity = clamp(ctx.segment.intensity, 0, 1);
                const saturation = Math.max(0.05, 1 - sens);
                const t = clamp(intensity / saturation, 0, 1);
                return { value: min + (max - min) * (1 - t), confidence: 1.0 };
            }
        },
        transcript: {
            defaultWeight: 1.0,
            enabledKey: 'smart_speed_captions_enabled',
            compute(ctx) {
                const speechMap = ctx.session?.speechMap;
                if (!speechMap || speechMap.blocks.length === 0) return null;
                const prob = speechMap.probabilityAt(ctx.currentSec, ctx.profile.speechLead, ctx.profile.speechRelease);
                if (prob <= 0) return null;
                return { value: ctx.profile.min, confidence: prob };
            }
        }
    };

    // Blends the active signals into one target speed, weighted by
    // (profile weight * signal confidence).
    function computeCompositeSpeed(ctx) {
        const profile = ctx.profile;
        const active = [];

        for (const name in Signals) {
            const sig = Signals[name];
            if (sig.enabledKey && ImprovedTube.storage[sig.enabledKey] === false) continue;
            const result = sig.compute(ctx);
            if (!result) continue;
            const baseWeight = profile.signalWeights?.[name] ?? sig.defaultWeight;
            const confidence = typeof result.confidence === 'number' ? result.confidence : 1.0;
            const effectiveWeight = baseWeight * confidence;
            if (effectiveWeight > 0) active.push({ name, value: result.value, weight: effectiveWeight });
        }

        if (ctx.session) ctx.session.lastActiveSignals = active;
        if (active.length === 0) return profile.max; // no usable signal means default to the ceiling

        const totalWeight = active.reduce((s, a) => s + a.weight, 0);
        const weighted = active.reduce((s, a) => s + a.value * (a.weight / totalWeight), 0);
        return clamp(weighted + (ctx.bias || 0), profile.min, profile.max);
    }

    // Target speed to use when no heatmap data is available for the video.
    function noHeatmapTargetSpeed(ctx) {
        const mode = ImprovedTube.storage.smart_speed_no_heatmap_fallback_mode || 'captions';
        if (mode === 'default_speed') return { speed: 1.0, source: 'Fallback (1.0x)' };
        if (mode === 'fixed_speed') {
            const fixed = toNum(ImprovedTube.storage.smart_speed_no_heatmap_fixed_speed, 1.5, 0.0625, 16);
            return { speed: fixed, source: `Fallback (${fixed.toFixed(1)}x)` };
        }
        const synthCtx = makeContext({ ...ctx, segment: ctx.segment || { intensity: 0.25 } });
        return { speed: computeCompositeSpeed(synthCtx), source: 'Captions Fallback (0.25 Heatmap)' };
    }

    /*==========================================================================
    7. OVERRIDE REGISTRY
       Absolute (non-blended) speeds, checked in order — first match wins.
       Each entry is `{ name, enabledKey, resolve(ctx) }`, returning null or
       {source, speed}.
    ==========================================================================*/
    const Overrides = [
        {
            name: 'sponsorBlock',
            enabledKey: 'smart_speed_sponsorblock_enabled',
            resolve(ctx) {
                const segs = ctx.session?.sponsorSegments || [];
                const match = segs.find(s => s.category === 'sponsor' && ctx.currentSec >= s.segment[0] && ctx.currentSec <= s.segment[1]);
                return match ? { source: 'SponsorBlock (sponsor)', speed: 3.0 } : null;
            }
        },
        {
            name: 'introOutro',
            enabledKey: 'smart_speed_introoutro_enabled',
            resolve(ctx) {
                const speed = ctx.profile.introOutroSpeed;
                const segs = ctx.session?.sponsorSegments || [];

                const intro = segs.find(s => s.category === 'intro' && ctx.currentSec >= s.segment[0] && ctx.currentSec <= s.segment[1]);
                if (intro) return { source: 'Intro (SponsorBlock)', speed };

                const outro = segs.find(s => s.category === 'outro' && ctx.currentSec >= s.segment[0] && ctx.currentSec <= s.segment[1]);
                if (outro) return { source: 'Outro (SponsorBlock)', speed };

                // No SponsorBlock outro data for this video — fall back to
                // treating the last few percent of the video as the outro.
                const hasOutroData = segs.some(s => s.category === 'outro');
                if (!hasOutroData && ctx.duration > 120 && isFinite(ctx.duration)) {
                    const outroDurationSec = Math.min(15, ctx.duration * 0.03);
                    if (ctx.currentSec >= ctx.duration - outroDurationSec && ctx.currentSec < ctx.duration) {
                        return { source: 'Outro (heuristic)', speed };
                    }
                }
                return null;
            }
        }
    ];

    function resolveOverride(ctx) {
        for (const ov of Overrides) {
            if (ImprovedTube.storage[ov.enabledKey] === false) continue;
            const result = ov.resolve(ctx);
            if (result) return result;
        }
        return null;
    }

    /*==========================================================================
    8. TARGET DURATION SOLVER
       Binary-searches a global speed bias so the predicted wall-clock watch
       time matches a user-requested target duration.
    ==========================================================================*/
    const DurationSolver = {
        predictWallClock(bias, ctxBase, segments, baseRate) {
            let total = 0;
            for (const seg of segments) {
                const ctx = makeContext({ ...ctxBase, bias, currentSec: (seg.start + seg.end) / 2, segment: seg });
                const override = resolveOverride(ctx);
                if (override) total += seg.duration / override.speed;
                else total += seg.duration / (baseRate * computeCompositeSpeed(ctx));
            }
            return total;
        },

        solve(targetSec, ctxBase, segments, baseRate) {
            const span = ctxBase.profile.max - ctxBase.profile.min;
            const fastest = this.predictWallClock(+span, ctxBase, segments, baseRate);
            const slowest = this.predictWallClock(-span, ctxBase, segments, baseRate);

            if (targetSec < fastest) return { ok: false, reason: 'too-short', bestSec: fastest };
            if (targetSec > slowest) return { ok: false, reason: 'too-long', bestSec: slowest };

            let lo = -span, hi = span;
            for (let i = 0; i < 30; i++) {
                const mid = (lo + hi) / 2;
                if (this.predictWallClock(mid, ctxBase, segments, baseRate) > targetSec) lo = mid; else hi = mid;
            }
            return { ok: true, bias: (lo + hi) / 2 };
        }
    };

    /*==========================================================================
    9. SESSION
       State scoped to the video currently being watched. Starting a new
       video creates a new Session rather than resetting fields on the old one.
    ==========================================================================*/
    class Session {
        constructor(videoId) {
            this.videoId = videoId;
            this.abort = typeof AbortController !== 'undefined' ? new AbortController() : null;
            this.playerResponse = null;
            this.markers = undefined;        // undefined = not fetched yet; [] = confirmed none
            this.segments = [];
            this.sponsorSegments = [];
            this.speechMap = new SpeechMap();
            this.processedDuration = null;
            this.lastSegIdx = -1;
            this.lastActiveSignals = [];
            this.captionStatus = 'pending';
            this.paused = false;             // user manually paused Smart Speed for this session
            this.targetBias = 0;
            this.targetDurationOverride = null;
        }
        get isCurrent() { return !Engine.session === false && Engine.session === this; }
        dispose() { try { this.abort?.abort(); } catch (e) { /* already aborted */ } }
    }

    /*==========================================================================
    10. ENGINE
        State machine driving the Smart Speed lifecycle.
    ==========================================================================*/
    const STATE = Object.freeze({
        IDLE: 'idle',               // extension/feature off, or no video
        LOADING: 'loading',         // session created, acquiring data
        ACTIVE: 'active',           // applying computed/override speed
        WHITELISTED: 'whitelisted', // resolved profile says "leave alone"
        EXCLUDED: 'excluded',       // shorts/live/too-short, base rate only
        PAUSED: 'paused',           // user manually paused this session
        AD: 'ad'                    // an ad is showing; base rate only
    });

    const TICK_MS = 100;
    const BOUNDARY_CROSSFADE_WINDOW_SEC = 2.5;
    const SEEK_SUPPRESS_MS = 1000;

    const Engine = {
        STATE,
        session: null,
        state: STATE.IDLE,
        video: null,
        loopTimer: null,
        uiTimer: null,
        adObserver: null,
        adShowing: false,
        expectedRate: null,
        lastInitializedVideoId: null,

        /*---------------------------- helpers ----------------------------*/
        _getVideo() {
            if (this.video?.isConnected) return this.video;
            return (this.video = document.querySelector('#movie_player video.html5-main-video') || document.querySelector('video'));
        },

        _getVideoId() {
            const loc = window.location;
            const path = loc.pathname || '';
            if (!path.startsWith('/watch') && !path.startsWith('/shorts/')) return null;
            if (typeof ImprovedTube.videoId === 'function') {
                const id = ImprovedTube.videoId();
                if (id) return id;
            }
            const searchId = new URLSearchParams(loc.search || '').get('v');
            if (searchId) return searchId;
            if (path.startsWith('/shorts/')) {
                const parts = path.split('/');
                const candidate = parts[parts.indexOf('shorts') + 1];
                if (candidate?.length === 11) return candidate;
            }
            return null;
        },

        _baseRate() { return toNum(ImprovedTube.storage.player_custom_playback_speed, 1, 0.0625, 16); },

        _setRate(rate) {
            const v = this._getVideo();
            if (!v || Math.abs(v.playbackRate - rate) < 0.01) return;
            this.expectedRate = rate;
            v.playbackRate = rate;
        },

        _setState(next) {
            this.state = next;
            UI.onStateChanged(this, next);
        },

        isCurrentlyLive(player) {
            player = player || document.querySelector('.html5-video-player');
            const badge = document.querySelector('.ytp-live-badge');
            const visible = badge && badge.offsetParent !== null && !badge.hasAttribute('disabled') && badge.getAttribute('aria-hidden') !== 'true';
            return (player?.getVideoData?.()?.isLive === true || visible === true) && player?.getVideoData?.()?.isEndedLive !== true;
        },

        shouldExcludeVideo(video, player) {
            const isShorts = location.pathname.startsWith('/shorts/');
            if (isShorts && ImprovedTube.storage.smart_speed_whitelist_shorts !== false) return true;

            const threshold = toNum(ImprovedTube.storage.smart_speed_short_video_threshold_seconds, 120, 1, 7200);
            if (!this.adShowing && ImprovedTube.storage.smart_speed_whitelist_shorts !== false
                && video && video.duration > 0 && video.duration < threshold) return true;

            if (ImprovedTube.storage.smart_speed_whitelist_live !== false && this.isCurrentlyLive(player)) return true;

            return false;
        },

        /*---------------------------- lifecycle ----------------------------*/
        init(video) {
            const enabled = ImprovedTube.storage.smart_speed === true;
            const videoId = this._getVideoId();

            if (!enabled || !videoId) {
                this._teardown();
                return;
            }

            const videoEl = video || this._getVideo();
            const player = document.querySelector('.html5-video-player');
            UI.inject(this);
            this._watchAds(player);
            this._attachVideoListeners(videoEl);

            const sameVideo = videoId === this.lastInitializedVideoId && this.session?.videoId === videoId;
            if (sameVideo) return; // already set up for this video; safe to call init() repeatedly

            this.lastInitializedVideoId = videoId;
            this._startSession(videoId);
        },

        _teardown() {
            this.stopLoop();
            if (this.uiTimer) { clearInterval(this.uiTimer); this.uiTimer = null; }
            UI.hide();
            this.lastInitializedVideoId = null;
            this.session = null;
            this.expectedRate = null;
            this._setState(STATE.IDLE);
        },

        _attachVideoListeners(videoEl) {
            if (!videoEl || videoEl.dataset.itSmartSpeedAttached) return;
            videoEl.dataset.itSmartSpeedAttached = 'true';

            videoEl.addEventListener('loadstart', () => {
                this.expectedRate = null;
            });
            videoEl.addEventListener('loadeddata', () => {
                if (ImprovedTube.storage.smart_speed !== true) return;
                const freshId = this._getVideoId();
                if (!freshId) return;
                if (freshId !== this.lastInitializedVideoId) { this.init(videoEl); return; }
                if (this.shouldExcludeVideo(videoEl, document.querySelector('.html5-video-player'))) this.stopLoop();
                else if (!this.loopTimer && !this.session?.paused) this.startLoop();
            });
            videoEl.addEventListener('durationchange', () => this._tryProcess());
            videoEl.addEventListener('play', () => {
                if (ImprovedTube.storage.smart_speed === true && !this.session?.paused && !this.loopTimer && this._getVideoId()) this.startLoop();
            });
            videoEl.addEventListener('seeked', () => {
                this._suppressUntil = Date.now() + SEEK_SUPPRESS_MS;
                if (ImprovedTube.storage.smart_speed === true && !this.session?.paused && !this.loopTimer && this._getVideoId()) this.startLoop();
            });
            videoEl.addEventListener('ended', () => {
                this.stopLoop();
                UI.setIndicator('⚡ Done', '', 0.5);
            });
        },

        _watchAds(player) {
            if (!player || this.adObserver) return;
            this.adObserver = new MutationObserver(() => {
                const showing = player.classList.contains('ad-showing') || !!player.querySelector('.ad-interrupting, .ytp-ad-player-overlay');
                if (showing === this.adShowing) return;
                this.adShowing = showing;
                if (showing) {
                    this._setState(STATE.AD);
                    this._setRate(this._baseRate());
                } else {
                    this.expectedRate = null;
                    if (this.session) this._tryProcess();
                }
            });
            this.adObserver.observe(player, { attributes: true, attributeFilter: ['class'] });
            this.adShowing = player.classList.contains('ad-showing') || !!player.querySelector('.ad-interrupting, .ytp-ad-player-overlay');
        },


        async _startSession(videoId) {
            this.session?.dispose();
            Profiles.invalidate();
            const session = new Session(videoId);
            this.session = session;
            this._setState(STATE.LOADING);

            const profile = Profiles.resolve();
            if (profile.whitelist) {
                this._setState(STATE.WHITELISTED);
                this._setRate(this._baseRate());
            } else {
                // Heatmap, captions, and SponsorBlock fetch in parallel; a slow
                // or failed source just resolves to "nothing found".
                const signal = session.abort?.signal;
                const heatmapPromise = HeatmapSource.acquire(videoId, signal);
                const sponsorPromise = SponsorBlockClient.isNeeded() ? SponsorBlockClient.get(videoId, signal) : Promise.resolve([]);
                const captionPromise = CaptionSource.acquire(videoId, session, signal, () => this.session !== session);

                heatmapPromise.then(({ markers, playerResponse }) => {
                    if (this.session !== session) return;
                    if (playerResponse) {
                        session.playerResponse = playerResponse;
                        Profiles.invalidate();
                    }
                    session.markers = markers;
                    this._tryProcess();
                });

                sponsorPromise.then(segments => {
                    if (this.session !== session) return;
                    session.sponsorSegments = segments || [];
                    UI.setSkipButtons(this, session);
                });
                captionPromise.then(({ blocks, status }) => {
                    if (this.session !== session) return;
                    if (blocks) session.speechMap.addBlocks(blocks);
                    session.captionStatus = status || 'unavailable';
                });
            }

            if (this.uiTimer) clearInterval(this.uiTimer);
            this.uiTimer = setInterval(() => UI.refreshContextual(this, this.session), 1000);
            this.startLoop();
        },

        _tryProcess() {
            const session = this.session;
            if (!session || session.markers === undefined) return;
            const v = this._getVideo();
            if (this.adShowing || !v || !Number.isFinite(v.duration) || v.duration <= 0) return;
            if (this.shouldExcludeVideo(v, document.querySelector('.html5-video-player'))) {
                this._setState(STATE.EXCLUDED);
                this.stopLoop();
                return;
            }
            if (session.processedDuration === v.duration) return;
            session.processedDuration = v.duration;
            this._processMarkers(session, v.duration);
        },

        _processMarkers(session, duration) {
            let rawMarkers = session.markers;
            if (!rawMarkers || rawMarkers.length === 0) {
                const mode = ImprovedTube.storage.smart_speed_no_heatmap_fallback_mode || 'captions';
                if (mode === 'default_speed' || mode === 'fixed_speed') {
                    session.segments = [];
                    this._setState(STATE.ACTIVE);
                    this.startLoop();
                    return;
                }
                // Captions-fallback mode: synthesize flat low-intensity markers
                // so the composite signal still has a heatmap value to blend.
                rawMarkers = Array.from({ length: 100 }, () => ({ intensityScoreNormalized: 0.25 }));
            }

            const chunkPct = 100 / rawMarkers.length;
            session.segments = rawMarkers.map((marker, index) => {
                const score = typeof marker.intensityScoreNormalized === 'number' ? marker.intensityScoreNormalized : 0;
                const start = ((index * chunkPct) / 100) * duration;
                const end = (((index + 1) * chunkPct) / 100) * duration;
                return { start, end, duration: end - start, intensity: score };
            });
            session.lastSegIdx = -1;
            this._setState(STATE.ACTIVE);
            this.startLoop();
        },

        _segmentAt(session, t) {
            const segs = session.segments;
            if (!segs?.length) return -1;
            const last = segs[session.lastSegIdx];
            if (last && t >= last.start && t < last.end) return session.lastSegIdx;
            let lo = 0, hi = segs.length - 1, idx = -1;
            while (lo <= hi) {
                const mid = (lo + hi) >> 1, s = segs[mid];
                if (t < s.start) hi = mid - 1; else if (t >= s.end) lo = mid + 1; else { idx = mid; break; }
            }
            return (session.lastSegIdx = idx);
        },

        /** Crossfades the speed across a boundary window so
         *  transitions don't feel like an abrupt jump cut. */
        _blendAcrossBoundary(session, ctx, idx, currentSpeed) {
            const seg = session.segments[idx];
            const timeRemaining = seg.end - ctx.currentSec;
            if (timeRemaining >= BOUNDARY_CROSSFADE_WINDOW_SEC || idx + 1 >= session.segments.length) return currentSpeed;
            const nextSeg = session.segments[idx + 1];
            const nextSpeed = computeCompositeSpeed(makeContext({ ...ctx, segment: nextSeg }));
            const progress = 1 - (timeRemaining / BOUNDARY_CROSSFADE_WINDOW_SEC);
            return currentSpeed - (currentSpeed - nextSpeed) * progress;
        },

        /*---------------------------- playback loop ----------------------------*/
        startLoop() {
            if (this.loopTimer) clearInterval(this.loopTimer);
            this.loopTimer = setInterval(() => {
                if (!this.session?.paused) this.tick();
            }, TICK_MS);
        },

        stopLoop() {
            if (this.loopTimer) { clearInterval(this.loopTimer); this.loopTimer = null; }
            this._setRate(this._baseRate());
            UI.setSkipButtons(this, this.session);
        },

        tick() {
            if (ImprovedTube.storage.smart_speed !== true) { this._teardown(); return; }
            const video = this._getVideo();
            if (!video || video.paused || video.ended || this.adShowing) return;

            // If the actual rate drifted from what we last set, the user (or
            // another extension) changed it manually back off instead of
            // fighting them.
            if (this.expectedRate != null && Math.abs(video.playbackRate - this.expectedRate) > 0.05) {
                this.session.paused = true;
                this.expectedRate = null;
                this._setState(STATE.PAUSED);
                UI.toast('⏸️ Smart Speed paused: speed changed manually. Click ⚡ to resume');
                return;
            }
            if (this._suppressUntil && Date.now() < this._suppressUntil) return;

            const session = this.session;
            const duration = video.duration || 0;
            const currentSec = video.currentTime;
            const profile = Profiles.resolve({ playerResponse: session?.playerResponse });

            if (profile.whitelist) {
                this._setState(STATE.WHITELISTED);
                const base = this._baseRate();
                this._setRate(base);
                UI.setIndicator(`🛡️ ${base.toFixed(2)}x`, `Whitelisted (${profile.tier})`, 1);
                return;
            }

            const videoId = this._getVideoId();
            const ctx = makeContext({ currentSec, duration, profile, video, videoId, session, segment: null, bias: session?.targetBias || 0 });

            const override = resolveOverride(ctx);
            let targetSpeed, source, isOverrideSpeed = false;

            if (override) {
                targetSpeed = override.speed; source = override.source; isOverrideSpeed = true;
            } else if (session?.segments?.length) {
                const idx = this._segmentAt(session, currentSec);
                if (idx !== -1) {
                    ctx.segment = session.segments[idx];
                    const speed = computeCompositeSpeed(ctx);
                    targetSpeed = this._blendAcrossBoundary(session, ctx, idx, speed);
                    source = 'Composite';
                } else {
                    const res = noHeatmapTargetSpeed(ctx);
                    targetSpeed = res.speed; source = res.source;
                }
            } else {
                const res = noHeatmapTargetSpeed(ctx);
                targetSpeed = res.speed; source = res.source;
            }

            const finalSpeed = isOverrideSpeed ? targetSpeed : this._baseRate() * targetSpeed;
            this._setRate(finalSpeed);
            this._setState(STATE.ACTIVE);
            UI.setIndicator(`⚡ ${targetSpeed.toFixed(2)}x`, `Source: ${source} | Tier: ${profile.tier}`, 1);
        },

        /*---------------------------- user actions (called by UI) ----------------------------*/
        toggleSessionPause() {
            if (!this.session) return;
            this.session.paused = !this.session.paused;
            if (this.session.paused) {
                this._setState(STATE.PAUSED);
                this._setRate(this._baseRate());
                UI.toast('⏸️ Smart Speed paused for this session');
            } else {
                this.expectedRate = null;
                if (!this.session.segments?.length) this.tick();
                UI.toast('▶️ Smart Speed resumed');
            }
        },

        toggleLiveWhitelist() {
            const updated = !(ImprovedTube.storage.smart_speed_whitelist_live !== false);
            setStorage('smart_speed_whitelist_live', updated);
            UI.toast(updated ? '📡 Live streams will stay at normal speed' : '📡 Smart Speed will now apply to this live stream');
            this.lastInitializedVideoId = null;
            this.init(this._getVideo());
        },

        toggleShortsWhitelist() {
            const updated = !(ImprovedTube.storage.smart_speed_whitelist_shorts !== false);
            setStorage('smart_speed_whitelist_shorts', updated);
            UI.toast(updated ? '🩳 Shorts will stay at normal speed' : '🩳 Smart Speed will now apply to Shorts');
            this.lastInitializedVideoId = null;
            this.init(this._getVideo());
        },

        toggleChannelWhitelist() {
            const ident = Profiles.channelIdentity(this.session?.playerResponse);
            if (!ident) { UI.toast('Channel name not loaded yet. Try again.'); return; }

            const cKey = canonicalChannelKey(ident);
            if (!cKey) { UI.toast('Channel identity missing. Try again.'); return; }

            const profiles = { ...(ImprovedTube.storage.smart_speed_profiles || {}) };
            const oldNameKey = ident.name;
            const oldPrefixedKey = ident.name ? 'name:' + ident.name : null;
            const existing = profiles[cKey] || (oldPrefixedKey && profiles[oldPrefixedKey]) || (oldNameKey && profiles[oldNameKey]) || {};

            const entry = { ...existing, ...(ident.name ? { name: ident.name } : {}) };
            if (entry.whitelist) delete entry.whitelist; else entry.whitelist = true;

            const { name, ...settings } = entry;
            if (Object.keys(settings).length > 0) {
                profiles[cKey] = entry;
                if (oldNameKey && oldNameKey !== cKey) delete profiles[oldNameKey];
                if (oldPrefixedKey && oldPrefixedKey !== cKey) delete profiles[oldPrefixedKey];
            } else {
                delete profiles[cKey];
                if (oldNameKey) delete profiles[oldNameKey];
                if (oldPrefixedKey) delete profiles[oldPrefixedKey];
            }
            setStorage('smart_speed_profiles', profiles);
            Profiles.invalidate();

            const displayName = ident.name || cKey;
            UI.toast(entry.whitelist ? `🛡️ Whitelisted ${displayName} (Speedup Disabled)` : `▶️ Removed ${displayName} from Whitelist`);
            this.lastInitializedVideoId = null;
            this.init(this._getVideo());
        },


        setTargetDuration(minutes) {
            const session = this.session;
            const video = this._getVideo();
            if (!session || !video?.duration || !isFinite(video.duration)) return { ok: false, reason: 'no-video' };

            const profile = Profiles.resolve({ playerResponse: session.playerResponse });
            if (profile.max <= profile.min) return { ok: false, reason: 'bad-range' };

            const targetSec = minutes * 60;
            const ctxBase = makeContext({ profile, duration: video.duration, video, videoId: this._getVideoId(), session, bias: session?.targetBias || 0 });
            const result = DurationSolver.solve(targetSec, ctxBase, session.segments, this._baseRate());

            if (result.ok) {
                session.targetBias = result.bias;
                session.targetDurationOverride = targetSec;
                UI.toast(`⏱️ Target duration bias applied: about ${minutes} minutes`);
            }
            return result;
        },

        jumpToNextPeak() {
            const video = this._getVideo();
            const player = document.querySelector('.html5-video-player');
            const session = this.session;

            if (ImprovedTube.storage.smart_speed !== true || session?.paused || this.shouldExcludeVideo(video, player)) {
                UI.toast('Smart Speed is disabled on this video');
                return;
            }
            const profile = Profiles.resolve({ playerResponse: session?.playerResponse });
            if (profile.whitelist) { UI.toast('Channel is whitelisted'); return; }
            if (!video || !session?.segments?.length) { UI.toast('❌ No heatmap peaks available'); return; }

            const duration = video.duration || 0;
            const peak = session.segments.find(s => {
                const targetTime = Math.max(0, s.start - 2.0);
                if (targetTime <= video.currentTime + 1.0) return false;
                if (typeof s.intensity === 'number' && s.intensity >= 0.5) return true;
                const ctx = makeContext({ currentSec: s.start + s.duration / 2, duration, profile, video, videoId: this._getVideoId(), segment: s, session, bias: session.targetBias || 0 });
                return computeCompositeSpeed(ctx) <= profile.min + 0.1;
            });

            if (peak) {
                this._suppressUntil = Date.now() + SEEK_SUPPRESS_MS;
                video.currentTime = Math.max(0, peak.start - 2.0);
                UI.toast('⏭️ Skipped ahead to next peak');
            } else {
                UI.toast('❌ No upcoming peaks detected');
            }
        },

        /*---------------------------- storage integration ----------------------------*/
        /** Routes a storage-changed key to the cheapest correct reaction
         *  instead of a full reinit. */
        onStorageChanged(key, value) {
            if (key === 'smart_speed') {
                if (value === true) this.init(this._getVideo());
                else this._teardown();
                return;
            }
            if (PROFILE_AFFECTING_KEYS.has(key)) Profiles.invalidate();
            if (key === 'smart_speed_indicator' || key === 'smart_speed_skip_intro_button' || key === 'smart_speed_skip_sponsor_button') {
                UI.refreshContextual(this, this.session);
            }
        }
    };

    /*==========================================================================
    11. UI
        DOM layer. The engine never touches the DOM directly — it calls
        these named methods instead.
    ==========================================================================*/
    const UI = {
        indicatorEl: null,
        toastTimeout: null,

        toast(message) {
            const player = document.querySelector('.html5-video-player');
            if (!player) return;
            let toastEl = document.getElementById('it-smart-speed-toast');
            if (!toastEl) {
                toastEl = document.createElement('div');
                toastEl.id = 'it-smart-speed-toast';
                Object.assign(toastEl.style, {
                    position: 'absolute', bottom: '70px', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '10px 20px', borderRadius: '4px',
                    zIndex: 9999, fontSize: '14px', fontWeight: 'bold', pointerEvents: 'none',
                    opacity: '0', transition: 'opacity 0.3s ease-in-out', border: '1px solid rgba(255,255,255,0.1)'
                });
                player.appendChild(toastEl);
            }
            toastEl.innerText = message;
            toastEl.style.opacity = '1';
            if (this.toastTimeout) clearTimeout(this.toastTimeout);
            this.toastTimeout = setTimeout(() => { toastEl.style.opacity = '0'; }, 2500);
        },

        setIndicator(text, title, opacity) {
            if (!this.indicatorEl) return;
            this.indicatorEl.innerText = text;
            if (title !== undefined) this.indicatorEl.title = title;
            if (opacity !== undefined) this.indicatorEl.style.opacity = String(opacity);
        },

        onStateChanged(engine, state) {
            const labels = {
                [STATE.WHITELISTED]: ['🛡️ Whitelisted', 0.5],
                [STATE.EXCLUDED]: ['⚡ Excluded', 0.5],
                [STATE.PAUSED]: ['⚡ Off', 0.5],
                [STATE.AD]: ['⚡ Ad', 0.5],
                [STATE.LOADING]: ['⚡ …', 1],
                [STATE.ACTIVE]: [null, 1] // left to tick()'s per-frame speed readout
            };
            const [text, opacity] = labels[state] || [null, 1];
            if (text) this.setIndicator(text, undefined, opacity);
            else if (this.indicatorEl) this.indicatorEl.style.opacity = String(opacity);
        },

        hide() { if (this.indicatorEl) this.indicatorEl.style.display = 'none'; },

        ensureSkipButtonStyles() {
            if (document.getElementById('it-smart-skip-style')) return;
            const style = document.createElement('style');
            style.id = 'it-smart-skip-style';
            style.textContent = `
                #it-smart-skip-container { position: absolute; bottom: 72px; right: 24px; z-index: 60; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
                .it-smart-skip-btn { pointer-events: auto; background: #ff0000; color: #0f0f0f; border: none; border-radius: 18px; font-family: "YouTube Sans", "Roboto", sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.5px; padding: 8px 18px; cursor: pointer; display: none; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.5); transition: background 0.15s, transform 0.15s, box-shadow 0.15s; user-select: none; text-transform: uppercase; }
                .it-smart-skip-btn:hover { background: #cc0000; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.6); }
                .it-smart-skip-btn:active { background: #aa0000; transform: translateY(0) scale(0.97); box-shadow: 0 1px 4px rgba(0,0,0,0.5); }
            `;
            document.head.appendChild(style);
        },

        inject(engine) {
            const player = document.querySelector('.html5-video-player');
            const controls = document.querySelector('.ytp-right-controls');
            if (!player || !controls) return;

            if (!document.getElementById('it-smart-speed-indicator')) {
                this.indicatorEl = document.createElement('button');
                this.indicatorEl.id = 'it-smart-speed-indicator';
                this.indicatorEl.className = 'ytp-button';
                this.indicatorEl.style.cssText = 'width:auto;padding:0 8px;font-weight:bold;font-size:13px;color:white;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:opacity .2s;';
                this.indicatorEl.innerText = '⚡ 1.0x';
                this.indicatorEl.title = 'Toggle Smart Speed';
                this.indicatorEl.addEventListener('click', () => engine.toggleSessionPause());
                controls.prepend(this.indicatorEl);
            } else {
                this.indicatorEl = document.getElementById('it-smart-speed-indicator');
            }
            this.indicatorEl.style.display = ImprovedTube.storage.smart_speed_indicator !== false ? 'inline-flex' : 'none';

            this._button(controls, 'it-smart-whitelist-btn', '🛡️', () => engine.toggleChannelWhitelist(), 'inline-flex');

            this._button(controls, 'it-smart-live-btn', '📡', () => engine.toggleLiveWhitelist(), 'none');
            this._button(controls, 'it-smart-shorts-btn', '🩳', () => engine.toggleShortsWhitelist(), 'none');
            this._button(controls, 'it-smart-peak-btn', '⏭️', () => engine.jumpToNextPeak(), 'inline-flex', 'Jump to next high-engagement scene');
            this._injectDurationModal(engine, player, controls);
            this._injectSkipButtons(player);
        },

        _button(controls, id, glyph, onClick, display = 'none', title = '') {
            if (document.getElementById(id)) return;
            const btn = document.createElement('button');
            btn.id = id;
            btn.className = 'ytp-button';
            btn.style.cssText = `font-size:16px;font-weight:bold;color:white;display:${display};align-items:center;justify-content:center;transition:.2s;`;
            btn.innerText = glyph;
            if (title) btn.title = title;
            btn.onclick = onClick;
            controls.prepend(btn);
        },

        _injectDurationModal(engine, player, controls) {
            if (document.getElementById('it-smart-duration-btn')) return;
            const durBtn = document.createElement('button');
            durBtn.id = 'it-smart-duration-btn';
            durBtn.className = 'ytp-button';
            durBtn.style.cssText = 'font-size:16px;font-weight:bold;color:white;display:inline-flex;align-items:center;justify-content:center;';
            durBtn.innerText = '⏱️';
            durBtn.title = 'Set Target Duration for this video';

            const modal = document.createElement('div');
            modal.id = 'it-smart-duration-modal';
            Object.assign(modal.style, {
                position: 'absolute', bottom: '50px', right: '10px', background: 'rgba(20,20,20,0.95)',
                padding: '10px', borderRadius: '8px', display: 'none', flexDirection: 'column',
                gap: '8px', zIndex: 9999, border: '1px solid #444', minWidth: '180px'
            });
            const title = document.createElement('div');
            title.style.cssText = 'color:white;font-size:12px;font-weight:bold;';
            title.innerText = 'Target Duration';
            const input = document.createElement('input');
            input.type = 'number';
            input.placeholder = 'Minutes';
            input.style.cssText = 'width:100%;padding:4px;background:#333;color:white;border:none;border-radius:4px;';
            input.onkeydown = (e) => e.stopPropagation();
            const apply = document.createElement('button');
            apply.style.cssText = 'background:#3ea6ff;color:white;border:none;padding:5px;border-radius:4px;cursor:pointer;';
            apply.innerText = 'Apply Target Duration';
            const msg = document.createElement('div');
            msg.style.cssText = 'color:#ff4e4e;font-size:11px;';

            modal.append(title, input, apply, msg);
            player.appendChild(modal);
            controls.prepend(durBtn);

            durBtn.onclick = () => { modal.style.display = modal.style.display === 'none' ? 'flex' : 'none'; };
            apply.onclick = () => {
                const minutes = Number(input.value);
                if (!minutes || minutes <= 0) return;
                const res = engine.setTargetDuration(minutes);
                if (!res.ok) {
                    const totalSec = Math.ceil(res.bestSec || 0);
                    const m = Math.floor(totalSec / 60), s = totalSec % 60;
                    msg.style.color = '#ff4e4e';
                    msg.innerText = res.reason === 'too-short' ? `Min possible: ${m}m ${s}s` : res.reason === 'bad-range' ? 'Max speed must be > Min speed' : `Max possible: ${m}m ${s}s`;
                } else {
                    msg.style.color = '#2ba640';
                    msg.innerText = 'Algorithm Applied!';
                    setTimeout(() => { modal.style.display = 'none'; }, 1500);
                }
            };
        },

        _injectSkipButtons(player) {
            if (document.getElementById('it-smart-skip-container')) return;
            this.ensureSkipButtonStyles();
            const container = document.createElement('div');
            container.id = 'it-smart-skip-container';
            const introBtn = document.createElement('button');
            introBtn.id = 'it-smart-skip-intro-btn';
            introBtn.className = 'it-smart-skip-btn';
            introBtn.innerText = 'Skip Intro';
            const sponsorBtn = document.createElement('button');
            sponsorBtn.id = 'it-smart-skip-sponsor-btn';
            sponsorBtn.className = 'it-smart-skip-btn';
            sponsorBtn.innerText = 'Skip Sponsor';
            container.append(introBtn, sponsorBtn);
            player.appendChild(container);
        },


        setSkipButtons(engine, session) {
            const video = engine._getVideo();
            if (!video || !session) return;
            const currentTime = video.currentTime;
            const segs = session.sponsorSegments || [];

            const introBtn = document.getElementById('it-smart-skip-intro-btn');
            if (introBtn) {
                const seg = segs.find(s => ['intro', 'selfpromo', 'preview'].includes(s.category)
                    && currentTime >= Math.max(0, s.segment[0] - 0.5) && currentTime < s.segment[1] - 0.5);
                if (seg && ImprovedTube.storage.smart_speed_skip_intro_button !== false) {
                    introBtn.style.display = 'inline-flex';
                    introBtn.onclick = () => { video.currentTime = seg.segment[1]; this.toast('⏭️ Skipped Intro'); this.setSkipButtons(engine, session); };
                } else introBtn.style.display = 'none';
            }

            const sponsorBtn = document.getElementById('it-smart-skip-sponsor-btn');
            if (sponsorBtn) {
                const seg = segs.find(s => s.category === 'sponsor'
                    && currentTime >= Math.max(0, s.segment[0] - 0.5) && currentTime < s.segment[1] - 0.5);
                if (seg && ImprovedTube.storage.smart_speed_skip_sponsor_button !== false) {
                    sponsorBtn.style.display = 'inline-flex';
                    sponsorBtn.onclick = () => { video.currentTime = seg.segment[1]; this.toast('⏩ Skip Sponsor'); this.setSkipButtons(engine, session); };
                } else sponsorBtn.style.display = 'none';
            }
        },

        refreshContextual(engine, session) {
            const profile = Profiles.resolve({ playerResponse: session?.playerResponse });
            const ident = Profiles.channelIdentity(session?.playerResponse);
            const name = ident ? ident.name : 'Unknown';

            const wlBtn = document.getElementById('it-smart-whitelist-btn');
            if (wlBtn) {
                wlBtn.style.opacity = profile.whitelist ? '1' : '0.5';
                wlBtn.title = profile.whitelist ? `Remove ${name} from Whitelist` : `Add ${name} to Whitelist`;
                wlBtn.style.textShadow = profile.whitelist ? '0 0 8px #2ba640' : 'none';
            }
            const liveBtn = document.getElementById('it-smart-live-btn');
            if (liveBtn) {
                const live = engine.isCurrentlyLive();
                liveBtn.style.display = live ? 'inline-flex' : 'none';
                if (live) {
                    const on = ImprovedTube.storage.smart_speed_whitelist_live !== false;
                    liveBtn.style.opacity = on ? '1' : '0.5';
                    liveBtn.title = on ? 'Smart Speed disabled for live streams (click to enable)' : 'Smart Speed enabled for live streams (click to disable)';
                }
            }
            const shortsBtn = document.getElementById('it-smart-shorts-btn');
            if (shortsBtn) {
                const isShorts = location.pathname.startsWith('/shorts/');
                shortsBtn.style.display = isShorts ? 'inline-flex' : 'none';
                if (isShorts) {
                    const on = ImprovedTube.storage.smart_speed_whitelist_shorts !== false;
                    shortsBtn.style.opacity = on ? '1' : '0.5';
                    shortsBtn.title = on ? 'Smart Speed disabled for Shorts (click to enable)' : 'Smart Speed enabled for Shorts (click to disable)';
                }
            }
            this.setSkipButtons(engine, session);
        }
    };

    /*==========================================================================
    12. PUBLIC EXPORTS
    ==========================================================================*/
    ImprovedTube.sponsorBlock = SponsorBlockClient;
    ImprovedTube.heatmap = Engine;      // legacy name, kept for the content-script bridge
    ImprovedTube.smartSpeed = Engine;   // friendlier alias for new integrations

    setTimeout(() => {
        if (ImprovedTube.storage && ImprovedTube.storage.smart_speed === true) {
            Engine.init();
        }
    }, 1000);
})();


/*------------------------------------------------------------------------------
AUTO-ACCEPT "CONTINUE WATCHING?"
------------------------------------------------------------------------------*/
ImprovedTube.playerAutoContinueWatching = function () {
	const enabled = this.storage.player_auto_continue_watching !== false
		|| this.storage.Hide_Pause_Overlay === true;

	if (!enabled) {
		if (this._autoContinueWatchingObserver) {
			this._autoContinueWatchingObserver.disconnect();
			this._autoContinueWatchingObserver = null;
		}
		return;
	}

	const continueWatchingPattern = /continue watching|video paused|still watching|are you still watching/i;

	const acceptDialog = function () {
		document.querySelectorAll('tp-yt-paper-dialog[role="dialog"], ytd-modal-with-title-and-button-renderer').forEach(function (dialog) {
			const text = dialog.textContent || '';

			if (!continueWatchingPattern.test(text)) {
				return;
			}

			let button = dialog.querySelector('#confirm-button button, #confirm-button tp-yt-paper-button, ytd-button-renderer#confirm-button button, tp-yt-paper-button#button');

			if (!button) {
				dialog.querySelectorAll('button, tp-yt-paper-button, ytd-button-renderer button').forEach(function (candidate) {
					const label = (candidate.textContent || candidate.getAttribute('aria-label') || '').trim();

					if (!button && /^(yes|continue|ok)$/i.test(label)) {
						button = candidate;
					}
				});
			}

			if (button) {
				button.click();

				const player = ImprovedTube.elements.player;

				if (player && typeof player.playVideo === 'function' && player.getPlayerState() !== 1) {
					try {
						player.playVideo();
					} catch (error) { }
				}
			}
		});
	};

	acceptDialog();

	if (!this._autoContinueWatchingObserver) {
		this._autoContinueWatchingObserver = new MutationObserver(acceptDialog);
		this._autoContinueWatchingObserver.observe(document.documentElement, {
			childList: true,
			subtree: true
		});
	}
};
