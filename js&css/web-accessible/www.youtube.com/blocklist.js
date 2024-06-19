/*------------------------------------------------------------------------------
4.8.0 BLOCKLIST
------------------------------------------------------------------------------*/
// usage:
// () called only to turn On (rescans all elements on page)/Off
// ('video', node) called only for 'a#thumbnail.ytd-thumbnail[href]'
// ('channel', node) called only for 'ytd-subscribe-button-renderer.ytd-c4-tabbed-header-renderer'

ImprovedTube.blocklist = function (type, node) {
	if (this.storage.blocklist_activate) {
		
		switch(type) {
			case 'video':
				const video = node?.href?.match(ImprovedTube.regex.video_id)?.[1] || (node?.classList?.contains('ytd-video-preview')?'video-preview':undefined),
					channel = node?.parentNode?.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.match(ImprovedTube.regex.channel)?.groups?.name;
				let blockedElement;
	
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
					case 'ytd-video-renderer':
						// search results
					case 'ytd-video-preview':
						// subscriptions/search thumbnail video-preview
						blockedElement = node.parentNode.parentNode.parentNode;
						break;
	
					case 'ytd-grid-video-renderer':
						// channel home screen grid
					case 'ytd-reel-item-renderer':
						// reel
						blockedElement = node.parentNode.parentNode;
						break;
	
					default:
						// unknown, bail out
						return;
						break;
				}
	
				node.blockedElement = blockedElement;
	
				if (this.storage.blocklist) {
					if (this.storage.blocklist.videos && ImprovedTube.storage.blocklist.videos[video]) {
						// blocklisted video
						blockedElement.classList.add('it-blocklisted-video');
					} else {
						// video not blocklisted, show it
						blockedElement.classList.remove('it-blocklisted-video');
					}
					if (this.storage.blocklist.channels && channel && ImprovedTube.storage.blocklist.channels[channel]) {
						// blocked channel
						blockedElement.classList.add('it-blocklisted-channel');
					} else {
						// channel not blocked, show it
						blockedElement.classList.remove('it-blocklisted-channel');
					}
				}
	
				if (node.querySelector("button.it-add-to-blocklist")) return; // skip blocklist button creation if one already exists
	
				let buttonV = document.createElement('button'),
					svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
					path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	
				buttonV.className = 'it-add-to-blocklist';
				buttonV.addEventListener('click', function (event) {
					event.preventDefault();
					event.stopPropagation();
					if (this.parentNode.href) {
						const video = this.parentNode.href?.match(ImprovedTube.regex.video_id)?.[1],
							channel = this.parentNode.parentNode?.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.match(ImprovedTube.regex.channel)?.groups?.name;
							
							// Yes, this is horrible. Cant find better way of extracting title :(
							title = this.parentNode?.__dataHost?.__data?.data?.title?.runs?.[0]?.text
								|| this.parentNode.__dataHost?.__data?.data?.title?.simpleText
								|| this.parentNode.__dataHost?.__data?.videoPreviewData?.accessibilityText,
							blockedElement = node.blockedElement;
						let added = false,
							type = 'video';
	
						if (!video || !blockedElement || !title) {
							console.error('blocklist: need video ID, blockedElement and title');	
							return; 
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
					}
				}, true);
	
				svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
				path.setAttributeNS(null, 'd', 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18A8 8 0 015.69 7.1L16.9 18.31A7.9 7.9 0 0112 20zm6.31-3.1L7.1 5.69A8 8 0 0118.31 16.9z');
	
				svg.appendChild(path);
				buttonV.appendChild(svg);
	
				node.appendChild(buttonV);
				this.elements.blocklist_buttons.push(buttonV);
				break;

			case 'channel':
				let buttonC = node?.parentNode?.parentNode?.querySelector("button.it-add-channel-to-blocklist"),
					id = location.href.match(ImprovedTube.regex.channel)?.groups?.name;

				if (!id) {
					console.error('blocklist: no channel ID');	
					return; 
				}

				// skip channel blocklist button creation if one already exists
				if (buttonC) {
					if (this.storage.blocklist.channels[id]) {
						buttonC.innerText = 'Remove from blocklist';
					} else if (!this.storage.blocklist.channels[id]) {
						buttonC.innerText = 'Add to blocklist';
					}
					return;
				}
	
				buttonC = document.createElement('button');
				buttonC.className = 'it-add-channel-to-blocklist';
	
				if (this.storage.blocklist.channels[id]) {
					buttonC.innerText = 'Remove from blocklist';
				} else {
					buttonC.innerText = 'Add to blocklist';
				}
	
				buttonC.addEventListener('click', function (event) {
					const data = ytInitialData?.metadata?.channelMetadataRenderer,
					//let data = this.parentNode.__dataHost.__data.data,
						id = location.href.match(ImprovedTube.regex.channel)?.groups?.name;
					let added = false;

					event.preventDefault();
					event.stopPropagation();
					
					if (!id || !data) {
						console.error('blocklist click: no channel ID or metadata');	
						return; 
					}

					if (ImprovedTube.storage.blocklist.channels[id]) {
						delete ImprovedTube.storage.blocklist.channels[id];
						buttonC.innerText = 'Add to blocklist';
					} else {
						ImprovedTube.storage.blocklist.channels[id] = {title: data.title,
																	preview: data.avatar?.thumbnails?.[0]?.url};
						buttonC.innerText = 'Remove from blocklist';
						added = true;
					}
					ImprovedTube.messages.send({action: 'blocklist',
												added: added,
												type: 'channel',
												id: id,
												title: data.title,
												preview: data.avatar?.thumbnails[0].url});
				}, true);
	
				node.parentNode.parentNode.appendChild(buttonC);
				this.elements.blocklist_buttons.push(buttonC);
				break;

			default:
				// initialize and scan whole page. Called only once on load after 'storage-loaded'.
				if (!this.storage.blocklist) {
					this.storage.blocklist = {videos: {}, channels: {}};
				}
				if (!this.storage.blocklist.videos) {
					this.storage.blocklist.videos = {};
				}
				if (!this.storage.blocklist.channels) {
					this.storage.blocklist.channels = {};
				}
				for (let thumbnails of document.querySelectorAll('a.ytd-thumbnail[href], a.ytd-video-preview')) {
					this.blocklist('video', thumbnails);
				}
				if (document.querySelector('YT-SUBSCRIBE-BUTTON-VIEW-MODEL')) {
					this.blocklist('channel', document.querySelector('YT-SUBSCRIBE-BUTTON-VIEW-MODEL'));
				}
				break;
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
		for (let blocked of document.querySelectorAll('.it-blocklisted-video')) {
			blocked.classList.remove('it-blocklisted-video');
		}
		for (let blocked of document.querySelectorAll('.it-blocklisted-channel')) {
			blocked.classList.remove('it-blocklisted-channel');
		}
	}
};

ImprovedTube.blocklistObserver = new MutationObserver(function (mutationList) {
	for (const mutation of mutationList) {
		const video = mutation.target.href?.match(ImprovedTube.regex.video_id)?.[1],
			  channel = mutation.target.parentNode?.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.match(ImprovedTube.regex.channel)?.groups?.name,
			  blockedElement = mutation.target.blockedElement;

		if (!blockedElement) return; // missing blockedElement? lets panic and run away!
		
		if (!video) {
			// nop video ID means most likely video-preview node went inactive
			blockedElement.classList.remove('it-blocklisted-video');
			blockedElement.classList.remove('it-blocklisted-channel');
			return;
		}

		if (ImprovedTube.storage.blocklist) {
			if (ImprovedTube.storage.blocklist.videos && ImprovedTube.storage.blocklist.videos[video]) {
				blockedElement.classList.add('it-blocklisted-video');
			} else {
				blockedElement.classList.remove('it-blocklisted-video');
			}
			if (ImprovedTube.storage.blocklist.channels && channel && ImprovedTube.storage.blocklist.channels[channel]) {
				blockedElement.classList.add('it-blocklisted-channel');
			} else {
				blockedElement.classList.remove('it-blocklisted-channel');
			}
		}
	}
});
