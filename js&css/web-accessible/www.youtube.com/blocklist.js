/*------------------------------------------------------------------------------
4.8.0 BLOCKLIST
------------------------------------------------------------------------------*/
ImprovedTube.blocklistNode = function (node) {
	if (!this.storage.blocklist_activate || !node) return;

	const video = node.href?.match(ImprovedTube.regex.video_id)?.[1] || (node.classList?.contains('ytd-video-preview') ? 'video-preview' : null),
		channel = node.parentNode?.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.match(ImprovedTube.regex.channel)?.groups?.name,
		blockedElement = node.blockedElement || this.blockedElementTypeHelper(node);

	if (!video) return; // not interested in nodes without one

	// YT reuses Thumbnail cells dynamically, need to monitor all created Thumbnail links and dynamically apply/remove 'it-blocklisted-*' classes
	if (!this.elements.observerList.includes(node)) {
		this.blocklistObserver.observe(node, {attributes: true,
											attributeFilter: ['href']});
		// keeping a list to attach only one observer per tracked element
		this.elements.observerList.push(node);
	}

	if (!blockedElement) return; // unknown thumbnail cell type, bail out

	if (this.storage.blocklist) {
		if (this.storage.blocklist.videos && ImprovedTube.storage.blocklist.videos[video]) {
			// blocklisted video
			blockedElement.classList.add('it-blocklisted-video');
		} else {
			// video not blocklisted, show it. classList.remove() directly as there is no speed benefit to .has() before
			blockedElement.classList.remove('it-blocklisted-video');
		}
		if (this.storage.blocklist.channels && channel && ImprovedTube.storage.blocklist.channels[channel]) {
			// blocked channel
			blockedElement.classList.add('it-blocklisted-channel');
		} else {
			// channel not blocked, show it.
			blockedElement.classList.remove('it-blocklisted-channel');
		}
	}

	// skip blocklist button creation if one already exists, in theory this never happens due to check in functions.js
	if (node.querySelector("button.it-add-to-blocklist")) return;

	node.blockedElement = blockedElement;

	const button = this.createIconButton({
		type: 'blocklist',
		className: 'it-add-to-blocklist',
		onclick: function (event) {
			if (!this.parentNode.href) return; // no href no action
			const video = this.parentNode.href?.match(ImprovedTube.regex.video_id)?.[1],
				channel = this.parentNode.parentNode?.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.match(ImprovedTube.regex.channel)?.groups?.name,
				blockedElement = node.blockedElement,

				// Yes, this is horrible. Cant find better way of extracting title :(
				title = this.parentNode?.__dataHost?.__data?.data?.title?.runs?.[0]?.text
					|| this.parentNode.__dataHost?.__data?.data?.title?.simpleText
					|| this.parentNode.__dataHost?.__data?.videoPreviewData?.accessibilityText
					|| this.parentNode.blockedElement?.querySelector('[title]')?.title;
			let added = false,
				type = 'video';

			if (!video || !blockedElement || !title) {
				console.error('blocklist: need video ID, blockedElement and title');
				return;
			}

			// this button can perform three functions:
			if (channel && blockedElement.classList.contains('it-blocklisted-channel')) {
				// unblocking whole channel
				type = 'channel';
			} else if (blockedElement.classList.contains('it-blocklisted-video')) {
				// unblocking blocklisted video
			} else {
				// block this video
				added = true;
			}

			// this message will trigger 'storage-changed' event and eventually blocklistInit() full rescan
			ImprovedTube.messages.send({action: 'blocklist',
										added: added,
										type: type,
										id: type == 'channel' ? channel : video,
										title: title,
										when: Date.parse(new Date().toDateString()) / 100000
										});
		}
	});

	node.appendChild(button);
	this.elements.blocklist_buttons.push(button);
};

ImprovedTube.blocklistChannel = function (node) {
	if (!this.storage.blocklist_activate || !node) return;

	const id = location.pathname.match(ImprovedTube.regex.channel)?.groups?.name;
	let button = node.parentNode?.parentNode?.querySelector("button.it-add-channel-to-blocklist");

	if (!id) return; // not on channel page

	// skip button.it-add-channel-to-blocklist creation if one already exists, adjust text only
	if (button) {
		button.innerText = this.storage.blocklist.channels[id] ? 'Remove from blocklist' : 'Add to blocklist';
		return;
	}

	button = document.createElement('button');

	button.className = 'it-add-channel-to-blocklist';
	button.innerText = this.storage.blocklist.channels[id] ? 'Remove from blocklist' : 'Add to blocklist';
	button.onclick = function (event) {
		event.preventDefault();
		event.stopPropagation();

		const data = ytInitialData?.metadata?.channelMetadataRenderer,
		// alternatives are:
		//this.parentNode.__dataHost.__data.data,
		// or directly scraping title and avatar from:
		//title = yt-dynamic-text-view-model.yt-core-attributed-string .innerText
		//avatar = <link itemprop="thumbnailUrl"<link itemprop="thumbnailUrl"
		//avatar = yt-decorated-avatar-view-model img.src
			id = location.pathname.match(ImprovedTube.regex.channel)?.groups?.name,
			title = data?.title,
			preview = data?.avatar?.thumbnails[0]?.url;
		let added = false;

		if (!id || !title) {
			console.error('blocklist click: no channel ID or metadata');
			return;
		}

		// this message will trigger 'storage-changed' event and eventually blocklistInit() full rescan
		ImprovedTube.messages.send({action: 'blocklist',
									added: !ImprovedTube.storage.blocklist.channels[id],
									type: 'channel',
									id: id,
									title: title,
									preview: preview,
									when: Date.parse(new Date().toDateString()) / 100000
									});
	};

	node.parentNode.parentNode.appendChild(button);
	this.elements.blocklist_buttons.push(button);
};

ImprovedTube.blocklistInit = function () {
	if (this.storage.blocklist_activate) {
		// initialize and (re)scan whole page. Called on load after 'storage-loaded'
		// and blocklist 'storage-changed' event (adding/removing blocks)
		if (!this.storage.blocklist || typeof this.storage.blocklist !== 'object') {
			this.storage.blocklist = {videos: {}, channels: {}};
		}
		if (!this.storage.blocklist.videos || typeof this.storage.blocklist.channels !== 'object') {
			this.storage.blocklist.videos = {};
		}
		if (!this.storage.blocklist.channels || typeof this.storage.blocklist.channels !== 'object') {
			this.storage.blocklist.channels = {};
		}
		for (const thumbnail of document.querySelectorAll('a.ytd-thumbnail[href], a.ytd-video-preview')) {
			this.blocklistNode(thumbnail);
		}
		if (document.querySelector('YT-SUBSCRIBE-BUTTON-VIEW-MODEL')) {
			this.blocklistChannel(document.querySelector('YT-SUBSCRIBE-BUTTON-VIEW-MODEL'));
		}
	} else {
		// Disable and unload Blocklist
		// remove all 'it-add-to-blocklist' buttons
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
		// remove all video/channel blocks from thumbnails on current page
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
			  channel = mutation.target.parentNode?.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.match(ImprovedTube.regex.channel)?.groups?.name
			  // video-preview doesnt have Channel info, extract from source thumbnail
			  || ((video && mutation.target?.classList.contains('ytd-video-preview')) ? ImprovedTube.elements.observerList.find(a => a.id == 'thumbnail' && a.href?.match(ImprovedTube.regex.video_id)?.[1] === video).parentNode?.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.match(ImprovedTube.regex.channel)?.groups?.name : null),
			  blockedElement = ImprovedTube.blockedElementTypeHelper(mutation.target);

		if (!blockedElement) return; // unknown thumbnail cell type, bail out
		mutation.target.blockedElement = blockedElement;

		if (!video) {
			// no video ID means monitored thumbnail/video-preview node went inactive
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

ImprovedTube.blockedElementTypeHelper = function (node) {
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
			return node.parentNode.parentNode.parentNode;
			break;

		case 'ytd-grid-video-renderer':
			// channel home screen grid
		case 'ytd-reel-item-renderer':
			// reel
			return node.parentNode.parentNode;
			break;

		default:
			// unknown ones land here
			break;
	}
};
