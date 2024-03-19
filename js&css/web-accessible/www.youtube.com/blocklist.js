/*------------------------------------------------------------------------------
4.8.0 BLOCKLIST
------------------------------------------------------------------------------*/
// usage:
// () called only to turn On (rescans all elements on page)/Off
// ('video', node) called only for 'a#thumbnail.ytd-thumbnail[href]'
// ('channel', node) called only for 'ytd-subscribe-button-renderer.ytd-c4-tabbed-header-renderer'

ImprovedTube.blocklist = function (type, node) {
	if (this.storage.blocklist_activate) {
		if (type === 'video') {
			if (node.nodeName !== 'A' || !node.href) { alert(1) };
			const video = node.href.match(ImprovedTube.regex.video_id)?.[1],
				  channel = node.parentNode.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url ? node.parentNode.__dataHost.__data.data.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url.match(ImprovedTube.regex.channel).groups.name : undefined;
			let mode = 'video',
				blockedElement;
			if (!video) return; // no video ID, something went horribly wrong, bail

			// YT reuses VIDEO elements dynamically, need to monitor and also dynamically readjust BLOCK style
			if (!this.elements.observerList.includes(node)) {
				// YT reuses VIDEO elements dynamically, need to monitor and also dynamically readjust BLOCK style whenever href is modified
				this.blocklistObserver.observe(node, {attributes: true,
													  attributeFilter: ['href']});
				// keep track to only attach one observer per element
				this.elements.observerList.push(node);
			}

			switch(node.parentNode.className.replace('style-scope ','')) {
				case 'ytd-compact-video-renderer':
					// list next to player
					// node.parentNode.__dataHost.$.dismissible;
				case 'ytd-rich-item-renderer':
					// short reel
				case 'ytd-rich-grid-media':
					// grid reel
				case 'ytd-rich-grid-slim-media':
					// short grid reel
				case 'ytd-playlist-video-renderer':
					// playlist page
				case 'ytd-playlist-panel-video-renderer':
					// playlist next to player
					// node.parentNode.closest('ytd-playlist-panel-video-renderer')
				case 'ytd-structured-description-video-lockup-renderer':
					// list under the player
					// node.parentNode.closest('ytd-structured-description-video-lockup-renderer')
					// or even node.parentNode.closest('ytd-compact-infocard-renderer') === node.parentNode.parentNode.parentNode.parentNode
					blockedElement = node.parentNode.parentNode.parentNode;
					break;
				case 'ytd-grid-video-renderer':
					// channel home screen grid
				case 'ytd-reel-item-renderer':
					// reel
					blockedElement = node.parentNode.parentNode;
					break;
			}

			if (!blockedElement) return; // couldnt find valid enveloping element, bail

			node.blockedElement = blockedElement;

			if (this.storage.blocklist.videos[video] && !blockedElement.classList.contains('it-blocklisted-video')) {
				// blocklisted video
				blockedElement.classList.add('it-blocklisted-video');
			} else if (!this.storage.blocklist.videos[video] && blockedElement.classList.contains('it-blocklisted-video')) {
				// video not blocklisted, show it
				blockedElement.classList.remove('it-blocklisted-video');
			}

			if (channel) {
				// this thumbnail has channel information, can try channel blocklist
				if (this.storage.blocklist.channels[channel] && !blockedElement.classList.contains('it-blocklisted-channel')) {
					// blocked channel? = block all videos from that channel
					blockedElement.classList.add('it-blocklisted-channel');
				} else if (!this.storage.blocklist.channels[channel] && blockedElement.classList.contains('it-blocklisted-channel')) {
					// channel not blocked, show it
					blockedElement.classList.remove('it-blocklisted-channel');
				}
			}

			if (node.querySelector("button.it-add-to-blocklist")) return; // skip blocklist button creation if one already exists

			let button = document.createElement('button'),
				svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
				path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

			button.className = 'it-add-to-blocklist';
			button.addEventListener('click', function (event) {
				if (this.parentNode.href) {

					const video = node.href.match(ImprovedTube.regex.video_id)?.[1],
						  channel = node.parentNode.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url ? node.parentNode.__dataHost.__data.data.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url.match(ImprovedTube.regex.channel).groups.name : undefined,
						  data = this.parentNode.__dataHost.__data?.data,
						  blockedElement = node.blockedElement;
					let title,
						added = false,
						type = 'video';

					if (!video || !blockedElement) return; // need both video ID and blockedElement, otherwise bail

					if (data?.title?.runs?.[0]?.text) {
						title = data.title.runs[0].text;
					} else if (data?.title?.simpleText) {
						title = data.title.simpleText;
					} else if (data?.headline?.simpleText) {
						title = data.headline.simpleText;
					}

					if (channel && blockedElement.classList.contains('it-blocklisted-channel')) {
						// unblocking channel
						type = 'channel';
					} else if (blockedElement.classList.contains('it-blocklisted-video')) {
						// unblocking blocklisted video
					} else {
						// nothing blocked, clicking should block this video
						added = true;
					}
					ImprovedTube.messages.send({action: 'blocklist',
												added: added,
												type: type,
												id: type == 'channel' ? channel : video,
												title: title});
					event.preventDefault();
					event.stopPropagation();
				}
			}, true);

			svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
			path.setAttributeNS(null, 'd', 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18A8 8 0 015.69 7.1L16.9 18.31A7.9 7.9 0 0112 20zm6.31-3.1L7.1 5.69A8 8 0 0118.31 16.9z');

			svg.appendChild(path);
			button.appendChild(svg);

			node.appendChild(button);
			this.elements.blocklist_buttons.push(button);
		} else if (type === 'channel') {
			let button = node.parentNode.parentNode.querySelector("button.it-add-channel-to-blocklist"),
				id = location.href.match(ImprovedTube.regex.channel).groups.name;

			// skip channel blocklist button creation if one already exists
			if (button) {
				if (this.storage.blocklist.channels[id] && button.added) {
					button.innerText = 'Remove from blocklist';
					button.added = false;
				} else if (!this.storage.blocklist.channels[id] && !button.added) {
					button.innerText = 'Add to blocklist';
					button.added = true;
				}
				return;
			}

			button = document.createElement('button');
			button.className = 'it-add-channel-to-blocklist';

			if (this.storage.blocklist.channels[id]) {
				button.innerText = 'Remove from blocklist';
				button.added = false;
			} else {
				button.innerText = 'Add to blocklist';
				button.added = true;
			}

			button.addEventListener('click', function (event) {
				let data = this.parentNode.__dataHost.__data.data,
					id = location.href.match(ImprovedTube.regex.channel).groups.name;

				if (this.added) { // adding
					ImprovedTube.storage.blocklist.channels[id] = {title: data.title,
																   preview: data.avatar.thumbnails[0].url};
					button.innerText = 'Remove from blocklist';
				} else { // removing
					delete ImprovedTube.storage.blocklist.channels[id];
					button.innerText = 'Add to blocklist';
				}
				ImprovedTube.messages.send({action: 'blocklist',
											added: this.added,
											type: 'channel',
											id: id,
											title: data.title,
											preview: data.avatar.thumbnails[0].url});
				this.added = !this.added;

				event.preventDefault();
				event.stopPropagation();
			}, true);

			node.parentNode.parentNode.appendChild(button);
			this.elements.blocklist_buttons.push(button);
		} else if (arguments.length == 0) {
			// scan whole page
			for (let thumbnails of document.querySelectorAll('a.ytd-thumbnail[href]')) {
				this.blocklist('video', thumbnails);
			}
			if (document.querySelector('ytd-subscribe-button-renderer.ytd-c4-tabbed-header-renderer')) {
				this.blocklist('channel', document.querySelector('ytd-subscribe-button-renderer.ytd-c4-tabbed-header-renderer'));
			}
		}
	} else {
		// remove blocklist buttons
		for (let blocked of this.elements.blocklist_buttons) {
			blocked.remove();
		}
		this.elements.blocklist_buttons = [];
		// clear observers list
		if (this.elements.observerList) {
			this.elements.observerList = [];
			// release observer
			ImprovedTube.blocklistObserver.disconnect();
		}
		// remove all blocks from videos\channels
		for (let blocked of document.querySelectorAll('.it-blocklisted-video, .it-blocklisted-channel')) {
			blocked.classList.remove('it-blocklisted-video');
			blocked.classList.remove('it-blocklisted-channel');
		}
	}
};

ImprovedTube.blocklistObserver = new MutationObserver(function (mutationList) {
	for (var mutation of mutationList) {
		const video = mutation.target.href.match(ImprovedTube.regex.video_id)?.[1],
			  channel = mutation.target.parentNode.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url ? mutation.target.parentNode.__dataHost.__data.data.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url.match(ImprovedTube.regex.channel).groups.name : undefined,
			  blockedElement = mutation.target.blockedElement;

		if (!video || !blockedElement) return; // need both video ID and blockedElement, otherwise bail

		if (ImprovedTube.storage.blocklist.videos[video]) {
			if (!blockedElement.classList.contains('it-blocklisted-video')) {
				blockedElement.classList.add('it-blocklisted-video');
			}
		} else {
			if (blockedElement.classList.contains('it-blocklisted-video')) {
				blockedElement.classList.remove('it-blocklisted-video');
			}
		}


		if (channel && ImprovedTube.storage.blocklist.channels[channel] && !blockedElement.classList.contains('it-blocklisted-channel')) {
			// blocked channel? = block all videos from that channel
			blockedElement.classList.add('it-blocklisted-channel');
		} else if ((!channel || !ImprovedTube.storage.blocklist.channels[channel]) && blockedElement.classList.contains('it-blocklisted-channel')) {
			// channel not blocked, show it
			blockedElement.classList.remove('it-blocklisted-channel');
		}

	}
});
