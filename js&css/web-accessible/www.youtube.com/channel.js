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
		try {clearInterval(compact.listener)} 
		catch (err) {console.log("ERR: We couldn't clear listener. Reload page")}
    if (compact.eventHandlerFns.length) removeListeners();
		if (compact.styles.length) removeStyles()
		compact = {}
	}
	function styleWithInterval() {
		compact.listener = setInterval(() => {
			let item = document.querySelector(`#sections ytd-guide-section-renderer:nth-child(4) #items`)
			if (item) {
				clearInterval(compact.listener);
				styleWithListeners();
			}
		}, 250)
	}

	function styleWithListeners() {
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
				}
				else {
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
	
	function removeListeners(){ // EventListeners 
		for (let i = 0; i <= 2; i++) {
			const parent = compact.parents[i]
			const sub = compact.subs[i]
			parent.removeEventListener("click", compact.eventHandlerFns[i]);
			sub.style.display = "";
		}
		compact.eventHandlerFns = []
	}

	function initialLoad() {
    for (let i = 0; i <= 2; i++) {
      let isCompact = localStorage.getItem(`ImprovedTube-compact-${i + 2}`) === "true"
			isCompact ? appendStyle(i) : (compact.styles[i] = null);
    }
  }

  function appendStyle(index) { // adds style tag
    const cssRules = `
			#sections > ytd-guide-section-renderer:nth-child(${index + 2}) > #items{
				display:none;
			};`;
    const style = document.createElement("style");
    style.appendChild(document.createTextNode(cssRules));
    compact.styles[index] = style;
    document.head.appendChild(compact.styles[index]);
  }

	function removeStyles(){ // styles tags
		for (let i = 0; i <= compact.styles.length; i++){
			if (compact.styles[i] && compact.styles[i].parentNode) { 
				document.head.removeChild(compact.styles[i]);
			}
		}
		compact.styles = []
	}
}