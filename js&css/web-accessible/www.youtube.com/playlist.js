/*------------------------------------------------------------------------------
4.5.0 PLAYLIST
------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------
4.5.1 UP NEXT AUTOPLAY
------------------------------------------------------------------------------*/
ImprovedTube.playlistUpNextAutoplay = function () {
	if (this.storage.playlist_up_next_autoplay === false) {
		const playlistData = this.elements.ytd_watch?.playlistData;
		if (this.getParam(location.href, 'list') && playlistData
			&& playlistData.currentIndex
			&& playlistData.totalVideos
			&& playlistData.localCurrentIndex) {
			// Prevent autoplay by telling YouTube we're at the end of the playlist
			playlistData.currentIndex = playlistData.totalVideos;
		}
	}
};

// Playlist navigation handler for large playlists (400+ videos).
// YouTube loads playlist metadata in chunks (~200 videos), causing
// currentIndex and localCurrentIndex to desync at chunk boundaries.
// This handler keeps them in sync so autoplay continues working.
// Only runs when playlist_up_next_autoplay is NOT disabled.
// ⚠️ Skip queue-type playlists (WL=Watch Later, RD=Radio, OLAK5uy_=auto-mix)
// to prevent interference with YouTube's queue autoplay behavior.
ImprovedTube.playlistLargePlaylistHandler = function() {
	if (!this.getParam(location.href, 'list')) return;

	// Skip queue-type playlists — these are not regular user playlists
	// and the index sync logic can interfere with YouTube's queue autoplay
	var listId = this.getParam(location.href, 'list');
	if (listId === 'WL' || listId === 'RD' || listId.indexOf('RDAMVM') === 0 || listId.indexOf('OLAK5uy_') === 0) {
		this.cleanupPlaylistHandlers();
		return;
	}

	// Do not sync indices if the user has disabled playlist autoplay,
	// because playlistUpNextAutoplay intentionally sets currentIndex
	// to totalVideos to prevent the next video from playing.
	if (this.storage.playlist_up_next_autoplay === false) {
		this.cleanupPlaylistHandlers();
		return;
	}

	const playlistData = this.elements.ytd_watch?.playlistData;
	if (!playlistData) return;

	// Monitor video changes to handle large playlist navigation
	const videoElement = this.elements.player?.querySelector('video');
	if (videoElement && !this.playlistVideoChangeListener) {
		this.playlistVideoChangeListener = () => {
			// Re-check the setting in case it changed mid-session
			if (this.storage.playlist_up_next_autoplay === false) return;

			setTimeout(() => {
				const currentData = this.elements.ytd_watch?.playlistData;
				if (currentData && currentData.currentIndex !== currentData.localCurrentIndex) {
					// Sync indices when YouTube loads new playlist segments
					currentData.currentIndex = currentData.localCurrentIndex;

					// Update the player's playlist manager if available
					const playlistManager = document.querySelector('yt-playlist-manager');
					if (playlistManager && playlistManager.autoplayData) {
						playlistManager.autoplayData.currentIndex = currentData.localCurrentIndex;
					}
				}
			}, 100);
		};

		videoElement.addEventListener('loadedmetadata', this.playlistVideoChangeListener);
		videoElement.addEventListener('play', this.playlistVideoChangeListener);
	}
};

// Cleanup function for when navigating away from playlist pages
ImprovedTube.cleanupPlaylistHandlers = function() {
	if (this.playlistAutoplayObserver) {
		this.playlistAutoplayObserver.disconnect();
		this.playlistAutoplayObserver = null;
	}
	const videoElement = this.elements.player?.querySelector('video');
	if (this.playlistVideoChangeListener && videoElement) {
		videoElement.removeEventListener('loadedmetadata', this.playlistVideoChangeListener);
		videoElement.removeEventListener('play', this.playlistVideoChangeListener);
		this.playlistVideoChangeListener = null;
	}
};
/*------------------------------------------------------------------------------
4.5.2 REVERSE
------------------------------------------------------------------------------*/

// Fix #1836: Independent inject function for button
ImprovedTube.injectReverseButton = function() {
	if (document.querySelector('#it-reverse-playlist')) return;

	var container = ImprovedTube.elements.playlist.actions
		|| document.querySelector('ytd-playlist-panel-renderer #playlist-action-menu')
		|| document.querySelector('.ytd-playlist-panel-renderer #playlist-action-menu')
		|| document.querySelector('#playlist-action-menu')
		|| document.querySelector('ytd-playlist-panel-renderer #header-description')
		|| document.querySelector('ytd-menu-renderer.ytd-playlist-panel-renderer')
		|| document.querySelector('yt-formatted-string.title.style-scope.ytd-playlist-panel-renderer')?.parentElement
		|| document.querySelector('ytd-playlist-panel-renderer #top-level-buttons-computed')
		|| document.querySelector('ytd-playlist-header-renderer #playlist-action-menu');

	if (!container) return;

	var button = document.createElement('button'),
		svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
		path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

	button.id = 'it-reverse-playlist';
	button.className = 'style-scope yt-icon-button' + (ImprovedTube.playlistReversed ? ' active' : '');
	button.title = 'Reverse Playlist';

	button.addEventListener('click', function (event) {
		event.preventDefault();
		event.stopPropagation();

		this.classList.toggle('active');
		ImprovedTube.playlistReversed = !ImprovedTube.playlistReversed;

		// Persist via messaging (Fix #1836)
		ImprovedTube.messages.send({action: 'set', key: 'playlist_reversed_active', value: ImprovedTube.playlistReversed});

		ImprovedTube.playlistReverseUpdate(); ImprovedTube.expandDescription();

		return false;
	}, true);

	svg.setAttributeNS(null, 'width', '24');
	svg.setAttributeNS(null, 'height', '24');
	svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
	path.setAttributeNS(null, 'd', 'M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z');

	svg.appendChild(path);
	button.appendChild(svg);
	container.appendChild(button);
};

ImprovedTube.playlistReverseUpdate = function () {
	var results = ImprovedTube.elements.ytd_watch?.data?.contents?.twoColumnWatchNextResults,
		playlist = results?.playlist?.playlist,
		autoplay = results?.autoplay?.autoplay;

	if (!playlist || !autoplay) return;

	// Determine if currently reversed by checking YouTube's own index properties, which is 100% foolproof
	// against YouTube modifying the array in-place without triggering a new object allocation.
	var isCurrentlyReversed = false;
	if (playlist.contents && playlist.contents.length > 1) {
		var firstItem = playlist.contents[0].playlistPanelVideoRenderer || playlist.contents[0].playlistVideoRenderer;
		var lastItem = playlist.contents[playlist.contents.length - 1].playlistPanelVideoRenderer || playlist.contents[playlist.contents.length - 1].playlistVideoRenderer;

		var firstIndex = firstItem?.navigationEndpoint?.watchEndpoint?.index ?? 0;
		var lastIndex = lastItem?.navigationEndpoint?.watchEndpoint?.index ?? 0;

		if (firstIndex > lastIndex) {
			isCurrentlyReversed = true;
		}
	} else {
		isCurrentlyReversed = playlist.it_reversed === true;
	}

	var shouldBeReversed = ImprovedTube.playlistReversed === true;
	if (isCurrentlyReversed === shouldBeReversed) {
		return;
	}
	playlist.it_reversed = shouldBeReversed;

	playlist.contents.reverse();

	playlist.currentIndex = playlist.totalVideos - playlist.currentIndex - 1;
	playlist.localCurrentIndex = playlist.contents.length - playlist.localCurrentIndex - 1;

	for (var i = 0, l = autoplay.sets.length; i < l; i++) {
		var item = autoplay.sets[i];
		item.autoplayVideo = item.previousButtonVideo;
		item.previousButtonVideo = item.nextButtonVideo;
		item.nextButtonVideo = item.autoplayVideo;
	}

	ImprovedTube.elements.ytd_watch.updatePageData_(JSON.parse(JSON.stringify(ImprovedTube.elements.ytd_watch.data)));

	// On a fresh page load (e.g. refreshing while a playlist is already set
	// to reversed) #4353's player chrome - <ytd-player>, <yt-playlist-manager>
	// - can still be initializing when this fires. ImprovedTube.elements.ytd_player
	// in particular is populated by a separate, async DOM walk and isn't
	// guaranteed to be set yet. Previously that missing check meant
	// ytd_player.updatePlayerComponents() below could throw on undefined,
	// silently aborting the rest of this callback - including the direct
	// panel-data patch - so the panel and next-video order stayed
	// unreversed even though playlist.contents itself was already reversed
	// above, and the toggle button (which only reflects the setting, not
	// this update) still showed as active.
	var attempts = 0;
	function applyReversedPlaylistToPlayer() {
		attempts++;
		var playlist_manager = document.querySelector('yt-playlist-manager');
		var playlist_panel = document.querySelector('ytd-playlist-panel-renderer');
		var ytd_player = ImprovedTube.elements.ytd_player || document.querySelector('ytd-player');

		if (playlist_manager && ytd_player) {
			ytd_player.updatePlayerComponents(null, autoplay, null, playlist);
			playlist_manager.autoplayData = autoplay;
			playlist_manager.setPlaylistData(playlist);
			ytd_player.updatePlayerPlaylist_(playlist);
		}
		if (playlist_panel && playlist_panel.data) {
			// Update the panel directly to ensure Polymer re-renders it
			playlist_panel.data = playlist;
			if (typeof playlist_panel.updateData === 'function') playlist_panel.updateData(playlist);
		}

		if (!(playlist_manager && ytd_player && playlist_panel) && attempts < 5) {
			setTimeout(applyReversedPlaylistToPlayer, 200);
		}
	}
	setTimeout(applyReversedPlaylistToPlayer, 100);
};

ImprovedTube.playlistReverseObserver = null;

ImprovedTube.playlistReverse = function () {
	if (this.storage.playlist_reverse === true) {
		ImprovedTube.injectReverseButton();

		if (ImprovedTube.playlistReversed === true) {
			ImprovedTube.playlistReverseUpdate();
		}

		if (!ImprovedTube.playlistReverseObserver) {
			var targetNode = document.querySelector('ytd-playlist-panel-renderer')
				|| document.querySelector('ytd-watch-flexy')
				|| document.body;

			if (targetNode) {
				ImprovedTube.playlistReverseObserver = new MutationObserver(function(mutations) {
					if (!document.querySelector('#it-reverse-playlist')) {
						ImprovedTube.injectReverseButton();
					}
				});

				ImprovedTube.playlistReverseObserver.observe(targetNode, {
					childList: true,
					subtree: true
				});
			}
		}
	}
};

/*------------------------------------------------------------------------------
4.5.3 REPEAT
------------------------------------------------------------------------------*/
ImprovedTube.playlistRepeat = function () {
	if ( ImprovedTube.storage.playlist_repeat === true ) {
	    setTimeout(function () {
			var option = ImprovedTube.storage.playlist_repeat,
				button = document.querySelector("#button.ytd-playlist-loop-button-renderer") || document.querySelector("ytd-playlist-loop-button-renderer button") || document.querySelector("ytd-playlist-loop-button-renderer");
			if (button && (option === true && button.querySelector("path").attributes.d.textContent.split(" ")[0].startsWith('M21')
			) && button.querySelector("#tooltip")?.textContent !== 'Loop video'
	  && button.firstElementChild?.firstElementChild?.attributes[2]?.textContent !== 'Loop video'
	  && button.querySelector("#tooltip")?.textContent !== 'Turn off loop'
	  && button.firstElementChild?.firstElementChild?.attributes[2]?.textContent !== 'Turn off loop'
			)
			{ button.click(); }
		}, 10000);
	}
};

/* https://github.com/code-charity/youtube/issues/1768#issuecomment-1720423923 */

/*------------------------------------------------------------------------------
4.5.4 SHUFFLE
------------------------------------------------------------------------------*/
ImprovedTube.playlistShuffle = function () {
	if ( ImprovedTube.storage.playlist_shuffle === true ) {
		setTimeout(function () {
			var button = ImprovedTube.elements.playlist.shuffle_button,
				option = ImprovedTube.storage.playlist_shuffle;
			button = document.querySelector('#playlist-actions #playlist-action-menu ytd-toggle-button-renderer');
			if (button && (option === true && button.querySelector("path").attributes.d.textContent.split(" ")[0].startsWith('M18.1')
			) 	)
			{ button.click(); }
		}, 10000);
	}
};

/*------------------------------------------------------------------------------
4.5.5 POPUP
------------------------------------------------------------------------------*/
/**
 * ## Creates a playlist popup button (with ID `it-popup-playlist-button`)
 * - used by/in {@linkcode ImprovedTube.playlistPopup}
 * - checks {@linkcode ImprovedTube.storage.player_autoplay_disable} if to autoplay the popuped playlist/video
 * - checks {@linkcode ImprovedTube.elements.player} to get video ID and current time, if available, otherwise starts first video of playlist
 * - popup has video players width/height or window (inner) width/height when video player is not available
 * - the button has the playlist ID as `list` in its dataset and reads from it to open the popup
 * @param {string | null} playlistID - the playlist ID or `null`
 * @param {boolean} [altButtonStyle] - [optional] changes styling of the playlist popup button - `true` for minplayer and playlist panel and `false` for the playlist page - default `false`
 * @param {boolean} [checkVideo] - [optional] if `true` checks the {@linkcode ImprovedTube.elements.player} to get the video ID, time, and size, if available, otherwise starts first video of playlist - default `false` (starts first video of playlist)
 * @returns {HTMLButtonElement | null} the playlist popup button to insert into the DOM or `null` if the {@linkcode playlistID} is `null`
 */
ImprovedTube.playlistPopupCreateButton = function (playlistID, altButtonStyle, checkVideo) {
	"use strict";
	if (playlistID == null) return null;
	const button = document.createElement('button'),
		svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
		path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

	button.id = 'it-popup-playlist-button';
	button.className = `yt-spec-button-shape-next yt-spec-button-shape-next--${(altButtonStyle ?? false) ? 'text' : 'tonal'} yt-spec-button-shape-next--overlay yt-spec-button-shape-next--size-m yt-spec-button-shape-next--icon-button style-scope ytd-playlist-header-renderer`;
	button.title = 'Popup playlist';
	button.dataset.list = playlistID;
	button.style.opacity = '0.8';
	button.addEventListener(
		'click',
		(checkVideo ?? false) ? function () {
			const videoURL = ImprovedTube.elements.player?.getVideoUrl();
			let width = ImprovedTube.elements.player.offsetWidth * 0.7 ?? innerWidth * 0.4;
			let height = ImprovedTube.elements.player.offsetHeight * 0.7 ?? innerHeight * 0.4;

			"use strict";
			if (videoURL != null && ImprovedTube.regex.video_id.test(videoURL)) {
				ImprovedTube.elements.player.pauseVideo();
				const listID = this.dataset.list,
					videoID = videoURL.match(ImprovedTube.regex.video_id)[1],
					popup = window.open(`${location.protocol}//www.youtube.com/embed/${videoID}?autoplay=${ImprovedTube.storage.player_autoplay_disable ? '0' : '1'}&start=${videoURL.match(ImprovedTube.regex.video_time)?.[1] ?? '0'}&list=${listID}`, '_blank', `directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=${width / 3},height=${height / 3}`);
				//! If the video is not in the playlist or not within the first 200 entries, then it automatically selects the first video in the list.
				//! But this is okay since this button is mainly for the playlist, not the video (see the video popup button in player.js).
				popup.addEventListener('load', function () {
					"use strict";
					//~ check if the video ID in the link of the video title matches the original video ID in the URL and if not reload as a videoseries/playlist (without the videoID and start-time).
					const videoLink = this.document.querySelector('div#player div.ytp-title-text>a[href]');
					if (videoLink && videoLink.href.match(ImprovedTube.regex.video_id)[1] !== videoID) this.location.href = `${location.protocol}//www.youtube.com/embed/videoseries?autoplay=${ImprovedTube.storage.player_autoplay_disable ? '0' : '1'}&list=${listID}`;
				}, {passive: true, once: true});
			} else window.open(`${location.protocol}//www.youtube.com/embed/videoseries?autoplay=${ImprovedTube.storage.player_autoplay_disable ? '0' : '1'}&list=${this.dataset.list}`, '_blank', `directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=${width / 3},height=${height / 3}`);
			//~ change focused tab to URL-less popup
			ImprovedTube.messages.send({
				action: 'fixPopup',
				width: width,
				height: height,
				title: document.title
			});
		} : function () {
			let width = ImprovedTube.elements.player.offsetWidth * 0.7 ?? innerWidth * 0.45;
			let height = ImprovedTube.elements.player.offsetHeight * 0.7 ?? innerHeight * 0.45;
				if (!ImprovedTube.elements.player) {
					shorts = /short/.test(this.parentElement.href);
					if ( width / height < 1 ) { vertical = true } else { vertical = false }
					if ( !vertical && shorts ) { width = height * 0.6}
					if ( vertical && !shorts ) { height = width * 0.6}
				}
			"use strict";
			window.open(`${location.protocol}//www.youtube.com/embed/videoseries?autoplay=${ImprovedTube.storage.player_autoplay_disable ? '0' : '1'}&list=${this.dataset.list}`, '_blank', `directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=${width / 3},height=${height / 3}`);
			//~ change focused tab to URL-less popup
			ImprovedTube.messages.send({
				action: 'fixPopup',
				width: width,
				height: height,
				title: document.title
			});
		},
		true
	);

	svg.style.width = '24px';
	svg.style.height = '24px';
	svg.style.pointerEvents = 'none';
	svg.style.fill = 'currentColor';
	svg.setAttribute('viewBox', '0 0 24 24');
	path.setAttribute('d', 'M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z');

	svg.append(path);
	button.append(svg);

	return button;
};

/*------------------------------------------------------------------------------
4.5.6 PLAYLIST COPY VIDEO ID BUTTON
------------------------------------------------------------------------------*/
/**
*/
ImprovedTube.playlistCopyVideoIdButton = function () {
	if (this.storage.playlist_copy_video_id === true) {
    const playlistItems = document.querySelectorAll('ytd-playlist-panel-video-renderer');
		playlistItems.forEach(item => {
			if (!item.querySelector('.it-playlist-copy-video-id')) {
				const button = document.createElement('button');
				svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				button.className = ('it-playlist-copy-video-id');
				button.dataset.tooltip = 'CopyVideoId';
				svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
				path.setAttributeNS(null, 'd', 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z');
				svg.append(path);
				button.append(svg);
				button.addEventListener('click', () => {
					const playlistLink = item.querySelector('a#wc-endpoint');
					if (playlistLink) {
						if (this.storage.playlist_copy_video_url === true) {
							const playlistURL = playlistLink.href.split('&')[0];
							navigator.clipboard.writeText(playlistURL);
						} else {
							const playlistURL = playlistLink.href.match(ImprovedTube.regex.video_id)?.[1];
							navigator.clipboard.writeText(playlistURL);
						}
					}
					button.dataset.tooltip = 'Copied!';
					setTimeout(function() {
						button.dataset.tooltip = 'CopyVideoID';
					}, 500);
				});
				const menuElement = item.querySelector('#menu');
				if (menuElement) {
					menuElement.parentNode.insertBefore(button, menuElement);
				}
			}
		});
	}
}

/**
 * ## Adds a playlist popup button to each playlist panel found or update the links of existing popup buttons
 * - buttons will be added on the playlist page (next to the share button), in the playlist panel (after the loop and shuffle buttons), and/or the mini playlist section of the mini player (after the loop and shuffle buttons)
 * - uses {@linkcode ImprovedTube.playlistPopupCreateButton} to create each button
 * - saves each button in {@linkcode ImprovedTube.elements.buttons} as `it-popup-playlist-button-playlist`, `it-popup-playlist-button-mini`, and `it-popup-playlist-button-panel`
 * - called from {@linkcode ImprovedTube.ytElementsHandler} and {@linkcode ImprovedTube.hrefObserver} when DOM changes (somewhat related to playlist renderers)
 */
ImprovedTube.playlistPopup = function () {
	"use strict";
	if (this.storage.playlist_popup === true) {

		const playlistID = location.search.match(this.regex.playlist_id)?.[1],
			playlistIDMini = this.elements.player?.getPlaylistId?.();

		if (!document.contains(this.elements.buttons['it-popup-playlist-button-playlist'])) {
			const playlistShareButton = document.body.querySelector('ytd-app>div#content>ytd-page-manager>ytd-browse>ytd-playlist-header-renderer ytd-button-renderer.ytd-playlist-header-renderer:has(button[title])');
			if (playlistShareButton == null) this.elements.buttons['it-popup-playlist-button-playlist'] = null;
			else playlistShareButton.insertAdjacentElement('afterend', this.elements.buttons['it-popup-playlist-button-playlist'] = this.playlistPopupCreateButton(playlistID));
		} else if (playlistID != null && this.elements.buttons['it-popup-playlist-button-playlist'].dataset.list !== playlistID) this.elements.buttons['it-popup-playlist-button-playlist'].dataset.list = playlistID;

		if (!document.contains(this.elements.buttons['it-popup-playlist-button-mini'])) {
			const miniItemButtons = document.body.querySelector('ytd-app>ytd-miniplayer ytd-playlist-panel-renderer div#top-level-buttons-computed');
			if (miniItemButtons == null) this.elements.buttons['it-popup-playlist-button-mini'] = null;
			else miniItemButtons.appendChild(this.elements.buttons['it-popup-playlist-button-mini'] = this.playlistPopupCreateButton(playlistIDMini, true, true));
		} else if (playlistIDMini != null && this.elements.buttons['it-popup-playlist-button-mini'].dataset.list !== playlistIDMini) this.elements.buttons['it-popup-playlist-button-mini'].dataset.list = playlistIDMini;
		try {
			if (!document.contains(this.elements.buttons['it-popup-playlist-button-panel'])) {
				const panelItemButtons = document.body.querySelector('ytd-app>div#content>ytd-page-manager>ytd-watch-flexy ytd-playlist-panel-renderer div#top-level-buttons-computed');
				if (panelItemButtons == null) this.elements.buttons['it-popup-playlist-button-panel'] = null;
				else panelItemButtons.appendChild(this.elements.buttons['it-popup-playlist-button-panel'] = this.playlistPopupCreateButton(playlistID, true, true));
			} else if (playlistID != null && this.elements.buttons['it-popup-playlist-button-panel'].dataset.list !== playlistID) this.elements.buttons['it-popup-playlist-button-panel'].dataset.list = playlistID;
		} catch (error) { console.error("Error appending playlist button panel:", error);}
	}
};
/*------------------------------------------------------------------------------
4.5.7 TOTAL DURATION
------------------------------------------------------------------------------*/
// Shows the combined length of the videos in a playlist (feature request #4437):
// - on the playlist page (/playlist?list=...), next to the header stats
// - on the watch page, inside the playlist panel header
// YouTube renders long playlists in chunks (~100 items), so the sum covers the
// currently rendered items and updates live as more load. While not every
// video is rendered, the label shows "loaded/total" so a partial sum is never
// mistaken for the full playlist length.
// Supports both YouTube playlist layouts: the legacy one
// (ytd-playlist-video-renderer + .metadata-stats) and the current one
// (yt-lockup-view-model items + ytd-playlist-sidebar-primary-info-renderer #stats).

ImprovedTube.playlistParseDuration = function (text) {
	if (!text) return null;

	// Extract the first time pattern: some overlays carry the duration twice
	// (e.g. "1:27:41\n    1:27:41") or with surrounding text
	var match = String(text).match(/(\d{1,3}:)?\d{1,2}:\d{2}/);
	if (!match) return null;

	var parts = match[0].split(':'),
		seconds = 0;
	for (var i = 0; i < parts.length; i++) {
		seconds = seconds * 60 + parseInt(parts[i], 10);
	}
	return seconds > 0 ? seconds : null;
};

ImprovedTube.playlistFormatDuration = function (totalSeconds) {
	totalSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));

	var hours = Math.floor(totalSeconds / 3600),
		minutes = Math.floor((totalSeconds % 3600) / 60),
		seconds = totalSeconds % 60,
		mm = hours ? String(minutes).padStart(2, '0') : String(minutes),
		ss = String(seconds).padStart(2, '0');

	return (hours ? hours + ':' : '') + mm + ':' + ss;
};

ImprovedTube.playlistVideoDurationSeconds = function (renderer) {
	if (!renderer) return null;

	// Polymer renderers usually carry the exact length in their data object
	var lengthSeconds = renderer.data && renderer.data.lengthSeconds;
	if (typeof lengthSeconds === 'number' && lengthSeconds > 0) return lengthSeconds;
	var parsed = parseInt(lengthSeconds, 10);
	if (!isNaN(parsed) && parsed > 0) return parsed;

	// Fallbacks: the duration overlay rendered on the thumbnail
	// (legacy layout and watch panel, then the current lockup layout)
	if (typeof renderer.querySelector !== 'function') return null;

	var overlay = renderer.querySelector('ytd-thumbnail-overlay-time-status-renderer');
	if (overlay) {
		var fromOverlay = this.playlistParseDuration(overlay.textContent);
		if (fromOverlay) return fromOverlay;
	}

	var badge = renderer.querySelector('yt-thumbnail-badge-view-model');
	if (badge) {
		var fromBadge = this.playlistParseDuration(badge.textContent);
		if (fromBadge) return fromBadge;
	}

	return null;
};

// The rendered playlist items relevant on the current page.
ImprovedTube.playlistTotalDurationItems = function () {
	if (location.pathname === '/playlist') {
		// The current layout renders items as yt-lockup-view-model; only count
		// the ones that actually belong to this playlist (their link carries
		// the list parameter), so unrelated sections can never skew the sum.
		var listId = (location.search.match(this.regex.playlist_id) || [])[1];
		return Array.prototype.filter.call(
			document.querySelectorAll('ytd-playlist-video-renderer, yt-lockup-view-model'),
			function (renderer) {
				if (renderer.tagName !== 'YT-LOCKUP-VIEW-MODEL') return true;
				var link = renderer.querySelector('a[href*="watch"]');
				return !!(link && listId && link.href.indexOf('list=' + listId) !== -1);
			}
		);
	}

	// Watch page: only items inside the playlist panel
	return Array.prototype.slice.call(
		document.querySelectorAll('ytd-playlist-panel-renderer ytd-playlist-panel-video-renderer, ytd-playlist-panel-renderer yt-lockup-view-model')
	);
};

ImprovedTube.playlistTotalDurationUpdate = function () {
	var renderers = this.playlistTotalDurationItems();
	if (!renderers.length) return;

	var sum = 0, counted = 0;
	for (var i = 0; i < renderers.length; i++) {
		var seconds = this.playlistVideoDurationSeconds(renderers[i]);
		if (seconds) {
			sum += seconds;
			counted++;
		}
	}
	if (!counted) return;

	// Where the total belongs: playlist header stats (legacy or current
	// layout) or the watch page playlist panel header. YouTube keeps retired
	// containers around hidden, so only accept a host that is actually visible.
	var hostSelectors = [
		'ytd-playlist-header-renderer .metadata-stats',
		'.ytPageHeaderViewModelHeadlineInfo yt-content-metadata-view-model .ytContentMetadataViewModelMetadataRow:last-child',
		'ytd-playlist-panel-renderer #header-description'
	];
	var host = null, hostMode = null;
	for (var h = 0; h < hostSelectors.length && !host; h++) {
		// YouTube can render the same metadata twice (e.g. retired + current
		// layout), so scan every match and take the visible one
		var candidates = document.querySelectorAll(hostSelectors[h]);
		for (var c = 0; c < candidates.length; c++) {
			if (candidates[c].getClientRects().length) {
				host = candidates[c];
				hostMode = h === 2 ? 'inside' : 'after';
				break;
			}
		}
	}
	if (!host) return;

	var label = 'Total duration: ' + this.playlistFormatDuration(sum);
	var totalVideos = this.elements.ytd_watch && this.elements.ytd_watch.playlistData
		? this.elements.ytd_watch.playlistData.totalVideos
		: null;
	if (!totalVideos) {
		// Playlist page: the sidebar's first stat is always the video count
		var stats = document.querySelector('ytd-playlist-sidebar-primary-info-renderer');
		var firstStat = stats && stats.data && stats.data.stats && stats.data.stats[0];
		var firstStatText = firstStat
			? String(firstStat.simpleText || (firstStat.runs || []).map(function (r) { return r.text; }).join(''))
			: '';
		var countMatch = firstStatText.match(/[\d.,]+/);
		if (countMatch) totalVideos = parseInt(countMatch[0].replace(/\D/g, ''), 10) || null;
	}
	// 'counted' covers only items with an available duration: videos that are
	// private, deleted or not yet lazy-rendered have none, so the sum is over
	// the available durations and the label says exactly that
	if (totalVideos && counted < totalVideos) {
		label += ' (' + counted + '/' + totalVideos + ' durations available)';
	}

	var badge = document.getElementById('it-playlist-total-duration');
	if (!badge) {
		badge = document.createElement('span');
		badge.id = 'it-playlist-total-duration';
		// own line under the stats (or inside the panel header), so the text
		// can never be clipped by YouTube's narrow flex rows
		badge.style.cssText = 'display:block;margin-top:2px;color:var(--yt-spec-text-secondary);';
	}
	var expectedParent = hostMode === 'after' ? host.parentElement : host;
	if (badge.parentElement !== expectedParent) {
		expectedParent.appendChild(badge);
	}
	if (badge.textContent !== label) badge.textContent = label;

	// YouTube re-renders the stats and list containers on its own (which would
	// drop our badge), so watch them and re-apply when that happens
	this.playlistTotalDurationObserve();
};

ImprovedTube.playlistTotalDurationObserve = function () {
	if (!this.playlistTotalDurationObserver) {
		var self = this;
		this.playlistTotalDurationObserver = new MutationObserver(function () {
			self.playlistTotalDuration();
		});
	}

	// (re-)attaching to an already observed node is harmless
	var containers = document.querySelectorAll('ytd-playlist-sidebar-renderer, ytd-playlist-header-renderer, ytd-page-header-renderer, ytd-playlist-panel-renderer, yt-item-section-renderer, ytd-playlist-video-list-renderer');
	for (var i = 0; i < containers.length; i++) {
		if (containers[i].getClientRects().length) {
			this.playlistTotalDurationObserver.observe(containers[i], { childList: true, subtree: true });
		}
	}
};

// Debounced entry point: safe to call for every relevant DOM addition
// (ytElementsHandler), every SPA page update and every settings change.
ImprovedTube.playlistTotalDuration = function () {
	if (this.storage.playlist_total_duration !== true) {
		this.playlistTotalDurationCleanup();
		return;
	}

	if (!location.search.match(this.regex.playlist_id)) return;

	var self = this;
	clearTimeout(this.playlistTotalDurationTimer);
	this.playlistTotalDurationTimer = setTimeout(function () {
		self.playlistTotalDurationUpdate();
	}, 250);
};

ImprovedTube.playlistTotalDurationCleanup = function () {
	clearTimeout(this.playlistTotalDurationTimer);

	if (this.playlistTotalDurationObserver) {
		this.playlistTotalDurationObserver.disconnect();
		this.playlistTotalDurationObserver = null;
	}

	var badge = document.getElementById('it-playlist-total-duration');
	if (badge) badge.remove();
};
