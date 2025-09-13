/*------------------------------------------------------------------------------
4.6.0 CHANNEL
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.6.1 DEFAULT CHANNEL TAB
------------------------------------------------------------------------------*/

ImprovedTube.channelDefaultTab = function (a) {
	var option = this.storage.channel_default_tab;

	if (option && option !== '/' && a && a.parentNode && a.parentNode.id !== 'contenteditable-root') {
		if (this.regex.channel_home_page.test(a.href) && !a.href.endsWith(option)) {
			a.href = a.href.replace(this.regex.channel_home_page_postfix, '') + option;

			a.addEventListener('click', function (event) {
				event.stopPropagation();
			}, true);
		}
	}
};

/*------------------------------------------------------------------------------
4.6.2 PLAY ALL BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.channelPlayAllButton = function () {
	if (ImprovedTube.regex.channel.test(location.pathname)) {
		if (this.storage.channel_play_all_button) {
			const container = document.querySelector('ytd-channel-sub-menu-renderer #primary-items')
				|| document.querySelector('ytd-two-column-browse-results-renderer #chips-content');
			const playlistUrl = document.querySelector('ytd-app')?.__data?.data?.response?.metadata?.channelMetadataRenderer?.externalId?.substring(2);
			const existingPlayAllButton = document.querySelector('.it-play-all-button')

			if (!container) return; // we only add button on /videos page
			if (!playlistUrl) {
				console.error('channelPlayAllButton: Cant fint Channel playlist');
				return;
			}
			if (existingPlayAllButton) return // prevent add duplicate button
			const button = this.createIconButton({
				type: 'playAll',
				className: 'it-play-all-button',
				text: 'Play all',
				href: '/playlist?list=UU' + playlistUrl
			});
			container.appendChild(button);
		} else {
			document.querySelector('.it-play-all-button')?.remove();
		}
	}
};
/*------------------------------------------------------------------------------
4.6.3 COMPACT THEME
------------------------------------------------------------------------------*/

var compact = compact || {}
ImprovedTube.channelCompactTheme = function () {
	compact.eventHandlerFns = compact.eventHandlerFns || []
	compact.styles = compact.styles || []
	if (this.storage.channel_compact_theme === true) {
		compact.hasApplied = true
		initialLoad();
		document.querySelector("#sections #items") ? styleWithListeners() : styleWithInterval();
	}
	else if (compact.hasApplied) { //cleanup
		try {clearInterval(compact.listener)
		} catch (err) {console.log("ERR: We couldn't clear listener. Reload page")}
		if (compact.eventHandlerFns.length) removeListeners();
		if (compact.styles.length) removeStyles()
		compact = {}
	}
	function styleWithInterval () {
		compact.listener = setInterval(() => {
			let item = document.querySelector(`#sections ytd-guide-section-renderer:nth-child(4) #items`)
			if (item) {
				clearInterval(compact.listener);
				styleWithListeners();
			}
		}, 250)
	}

	function styleWithListeners () {
		compact.parents = []
		compact.subs = []
		for (let i = 0; i <= 2; i++) {
			const parent = document.querySelector(`#sections > ytd-guide-section-renderer:nth-child(${i + 2}) > h3`);
			const sub = document.querySelector(`#sections ytd-guide-section-renderer:nth-child(${i + 2}) #items`);
			compact.parents[i] = parent;
			compact.subs[i] = sub;
			let isCompact = localStorage.getItem(`ImprovedTube-compact-${i}`) === "true";
			isCompact ? (sub.style.display = "none") : null;

			function eventHandlerFn () {
				if (!isCompact) {
					sub.style.display = "none"
					isCompact = true
				} else {
					sub.style.display = ""
					isCompact = false
				}
				localStorage.setItem(`ImprovedTube-compact-${i}`, isCompact)
			}

			compact.eventHandlerFns.push(eventHandlerFn)
			parent.addEventListener("click", eventHandlerFn)
		}
		removeStyles();
	}

	function removeListeners () { // EventListeners
		for (let i = 0; i <= 2; i++) {
			const parent = compact.parents[i]
			const sub = compact.subs[i]
			parent.removeEventListener("click", compact.eventHandlerFns[i]);
			sub.style.display = "";
		}
		compact.eventHandlerFns = []
	}

	function initialLoad () {
		for (let i = 0; i <= 2; i++) {
			let isCompact = localStorage.getItem(`ImprovedTube-compact-${i + 2}`) === "true"
			isCompact ? appendStyle(i) : (compact.styles[i] = null);
		}
	}

	function appendStyle (index) { // adds style tag
		const cssRules = `
			#sections > ytd-guide-section-renderer:nth-child(${index + 2}) > #items{
				display:none;
			};`;
		const style = document.createElement("style");
		style.appendChild(document.createTextNode(cssRules));
		compact.styles[index] = style;
		document.head.appendChild(compact.styles[index]);
	}

	function removeStyles () { // styles tags
		for (let i = 0; i <= compact.styles.length; i++) {
			if (compact.styles[i] && compact.styles[i].parentNode) {
				document.head.removeChild(compact.styles[i]);
			}
		}
		compact.styles = []
	}
}

/*------------------------------------------------------------------------------
4.6.4 Details
------------------------------------------------------------------------------*/
ImprovedTube.channelDetails = function () {
	function createChannelInfo(channelName, uploadTime, videoCount, customUrl) {
		//console.log('Creating channel info:', channelName, uploadTime, videoCount, customUrl); // Debugging log
		const container = document.createElement('div');
		container.className = 'channel-info';

		const channelInfoContainer = document.createElement('div');

		if (uploadTime) {
			const uploadTimeElement = document.createElement('span');
			uploadTimeElement.className = 'upload-time';
			uploadTimeElement.textContent = `${uploadTime}`;
			channelInfoContainer.appendChild(uploadTimeElement);
			container.appendChild(channelInfoContainer);
		}
		if (videoCount) {
			const videoCountElement = document.createElement('span');
			videoCountElement.className = 'video-count';
			videoCountElement.textContent = ` (${videoCount} videos)`;
			channelInfoContainer.appendChild(videoCountElement);
			container.appendChild(channelInfoContainer);
		}

		// All Videos Link
		const allVideosLink = document.createElement('a');
		allVideosLink.className = 'all-videos-link';
		allVideosLink.href = `https://www.youtube.com/${customUrl}/videos`;
		allVideosLink.title = 'All Videos';

		const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgElement.setAttribute('viewBox', '0 0 24 24');
        svgElement.setAttribute('width', '24px');
        svgElement.setAttribute('height', '24px');
        svgElement.setAttribute('fill', 'gray');
		container.appendChild(allVideosLink);

		const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', 'M4 4h6v6H4V4zm0 10h6v6H4v-6zm10-10h6v6h-6V4zm0 10h6v6h-6v-6z');
        svgElement.appendChild(pathElement);

		allVideosLink.appendChild(svgElement);
        container.appendChild(allVideosLink);

		// View Data Link 
		const viewDataLink = document.createElement('a');
		viewDataLink.className = 'view-data-link';
		viewDataLink.href = 'https://ytlarge.com/youtube/video-data-viewer/';
		// Tooltip text using `title`
		viewDataLink.title = 'View detailed video data';

		const svgElement2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement2.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgElement2.setAttribute('viewBox', '0 0 24 24');
        svgElement2.setAttribute('width', '24px');
        svgElement2.setAttribute('height', '24px');
        svgElement2.setAttribute('fill', 'gray');
		container.appendChild(viewDataLink);

		const pathElement2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement2.setAttribute('d', 'M11 7h2V5h-2v2zm1 14c-5.52 0-10-4.48-10-10S6.48 1 12 1s10 4.48 10 10-4.48 10-10 10zm-1-5h2v-6h-2v6z');
        svgElement2.appendChild(pathElement2);

		viewDataLink.appendChild(svgElement2);
        container.appendChild(viewDataLink);	
		
		// CSS for this Detail area is added in extension/styles.css
		return container;
	}

	document.addEventListener('DOMContentLoaded', function() {
		// Listen for messages from the content.js script
		window.addEventListener('message', (event) => {
			// Only process messages with the expected type
			if (event.source === window && event.data.type === 'CHANNEL_INFO') {
				const { channelName, uploadTime, videoCount, customUrl, switchState } = event.data;
				
				const observer = new MutationObserver((mutationsList, observer) => {
					const targetElement = document.querySelector('ytd-video-owner-renderer.style-scope.ytd-watch-metadata');
	
					if (targetElement) {
						// Stop observing once the target is found
						observer.disconnect();
	
						if(switchState) {
							const channelInfo = createChannelInfo(channelName, uploadTime, videoCount, customUrl);

							// Removing existing channel info if present
							const existingChannelInfo = targetElement.querySelector('.channel-info');
							if (existingChannelInfo) {
								existingChannelInfo.remove();
							}
							targetElement.appendChild(channelInfo);
						} else {
							targetElement.remove();
						}
					} else {
						console.log('Target element not found');
					}
				});
	
				// Start observing the body for child node changes
				observer.observe(document.body, { childList: true, subtree: true });
			}
		});
	});
}