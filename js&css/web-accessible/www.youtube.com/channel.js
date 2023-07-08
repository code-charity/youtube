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
	if (this.storage.channel_play_all_button === true) {
		if (/\/(channel|user|c)\/[^/]+\/videos/.test(location.href)) {
			var container = document.querySelector('ytd-channel-sub-menu-renderer #primary-items');

			if (!this.elements.playAllButton) {
				var button = document.createElement('a'),
					svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
					path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

				button.className = 'it-play-all-button';

				svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
				path.setAttributeNS(null, 'd', 'M6,4l12,8L6,20V4z');

				svg.appendChild(path);
				button.appendChild(svg);
				button.appendChild(document.createTextNode('Play all'));

				this.elements.playAllButton = button;

				if (container) {
					container.appendChild(button);
				}
			} else if (container) {
				container.appendChild(this.elements.playAllButton);
			}
		} else if (this.elements.playAllButton) {
			this.elements.playAllButton.remove();
		}

		if (this.elements.playAllButton) {
			var app = document.querySelector('ytd-app');

			if (
				app &&
				app.__data &&
				app.__data.data &&
				app.__data.data.response &&
				app.__data.data.response.metadata &&
				app.__data.data.response.metadata.channelMetadataRenderer &&
				app.__data.data.response.metadata.channelMetadataRenderer.externalId
			) {
				this.elements.playAllButton.href = '/playlist?list=UU' + app.__data.data.response.metadata.channelMetadataRenderer.externalId.substring(2);
			}
		}
	}
};

/*------------------------------------------------------------------------------
4.6.3 COMPACT THEME
------------------------------------------------------------------------------*/
let eventHandlerFns = [];
ImprovedTube.channelCompactTheme = function () {
  if (this.storage.channel_compact_theme === true) {
    console.log("Hey its true");

		for (let i = 2; i <= 4; i++) {
			const parent = document.querySelector(`#sections > ytd-guide-section-renderer:nth-child(${i}) > h3`);
			const subs = document.querySelector(`ytd-guide-section-renderer.style-scope.ytd-guide-renderer:nth-child(${i}) #items`);
			let isCompact = localStorage.getItem(`ImprovedTube-compact-${i}`) ? localStorage.getItem(`ImprovedTube-compact-${i}`) === "true" : true;
			isCompact ? subs.style.display = "none" : null;
	
			const eventHandlerFn = () => {
				if (!isCompact) {
					subs.style.display = "none";
					isCompact = true;
				} else {
					isCompact = false;
					subs.style.display = "";
				}
				localStorage.setItem(`ImprovedTube-compact-${i}`, isCompact);
			};
	
			eventHandlerFns.push(eventHandlerFn);
    	parent.addEventListener("click", eventHandlerFn);
  	}
	} 
	else {
		console.log("It's deactivated :CC");

		for (let i = 0; i <= eventHandlerFns.length; i++) {
			const parent = document.querySelector(`#sections > ytd-guide-section-renderer:nth-child(${i+2}) > h3`);
			const subs = document.querySelector(`ytd-guide-section-renderer.style-scope.ytd-guide-renderer:nth-child(${i+2}) #items`);
			parent.removeEventListener("click", eventHandlerFns[i]);
			subs.style.display = "";
		}
	}
}