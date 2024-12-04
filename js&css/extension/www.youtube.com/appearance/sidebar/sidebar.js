/*--------------------------------------------------------------
>>> SIDEBAR
----------------------------------------------------------------
# Related videos
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# RELATED VIDEOS
--------------------------------------------------------------*/

extension.features.relatedVideos = function (anything) {
	if (anything instanceof Event) {
		var event = anything;

		if (event.type === 'click') {
			var target = event.target;

			if (target.id === 'items' && target.parentNode.nodeName === 'YTD-WATCH-NEXT-SECONDARY-RESULTS-RENDERER') {
				var rect = target.getBoundingClientRect();

				if (
					event.clientX - rect.left >= 0 &&
					event.clientX - rect.left < rect.width &&
					event.clientY - rect.top >= 0 &&
					event.clientY - rect.top < 48
				) {
					target.toggleAttribute('it-activated');
				}
			}
		}
	} else {
		if (extension.storage.get('related_videos') === 'collapsed') {
			window.addEventListener('click', this.relatedVideos, true);
		} else {
			window.removeEventListener('click', this.relatedVideos, true);
		}
	}

	// Apply the duration filter to related videos
	var minDuration = extension.storage.get('recommended_videos_min_duration') || 0;

	function filterVideos() {
		var videos = document.querySelectorAll('ytd-compact-video-renderer, ytd-video-renderer, ytd-grid-video-renderer');

		for (var i = 0, l = videos.length; i < l; i++) {
			var video = videos[i],
				durationElement = video.querySelector('span.ytd-thumbnail-overlay-time-status-renderer');

			if (durationElement) {
				var durationText = durationElement.textContent.trim(),
					durationParts = durationText.split(':'),
					durationInSeconds = 0;

				for (var j = 0, k = durationParts.length; j < k; j++) {
					durationInSeconds = durationInSeconds * 60 + parseInt(durationParts[j]);
				}

				if (durationInSeconds < minDuration) {
					video.style.display = 'none';
				} else {
					video.style.display = '';
				}
			}
		}
	}

	filterVideos();

	var observer = new MutationObserver(filterVideos);

	observer.observe(document.documentElement, {
		childList: true,
		subtree: true
	});
};
