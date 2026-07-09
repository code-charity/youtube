ImprovedTube.playerAutopauseWhenSwitchingTabs = function () {
	const player = this.elements.player,
		video = this.elements.video,
		isVisibleTab = document.visibilityState === 'visible' && document.hasFocus();

	if (this.storage.player_autopause_when_switching_tabs && player && video) {
		try {
			if (this.focus && isVisibleTab && this.played_before_blur && video.paused) {
				player.playVideo();
			} else {
				this.played_before_blur = !video.paused;
				if (!video.paused) {
					player.pauseVideo();
				}
			}
		} catch (e) {
			console.log('[ImprovedTube] Error en autopause:', e);
		}
	}
};