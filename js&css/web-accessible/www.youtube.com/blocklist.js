/*------------------------------------------------------------------------------
4.8.0 BLOCKLIST
------------------------------------------------------------------------------*/
ImprovedTube.blocklistNode = function (node) {
	if (!this.storage.blocklist_activate || !node) return;

	const video = node.href?.match(ImprovedTube.regex.video_id)?.[1] || (node.classList?.contains('ytd-video-preview') ? 'video-preview' : null),
		channel = node.parentNode?.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.match(ImprovedTube.regex.channel)?.groups?.name,
		blockedElement = this.blocklistElementTypeHelper(node);

	if (!video) return; // not interested in nodes without one

	// YT reuses Thumbnail cells dynamically, need to monitor all created Thumbnail links and dynamically apply/remove 'it-blocklisted-*' classes
	if (!this.elements.observerList.includes(node)) {
		this.blocklistObserver.observe(node, {
			attributes: true,
			attributeFilter: ['href']
		});
		// keeping a list to attach only one observer per tracked element
		this.elements.observerList.push(node);
	}

	if (!blockedElement) return; // unknown thumbnail cell type, bail out

	if (ImprovedTube.storage.blocklist?.videos[video]) {
		// blocklisted video
		blockedElement.classList.add('it-blocklisted-video');
	} else {
		// video not blocklisted, show it. classList.remove() directly as there is no speed benefit to .contains() before
		blockedElement.classList.remove('it-blocklisted-video');
	}
	if (channel) {
		if (ImprovedTube.storage.blocklist?.channels[channel]) {
			// blocked channel
			blockedElement.classList.add('it-blocklisted-channel');
		} else {
			// channel not blocked, show it.
			blockedElement.classList.remove('it-blocklisted-channel');
		}
	}

	// skip blocklist button creation if one already exists, in theory this never happens due to check in functions.js
	if (node.querySelector("button.it-add-to-blocklist")) return;

	const button = this.createIconButton({
		type: 'blocklist',
		className: 'it-add-to-blocklist',
		onclick: function () {
			if (!this.parentNode.href) return; // no href no action
			const video = this.parentNode.href?.match(ImprovedTube.regex.video_id)?.[1],
				channel = this.parentNode.parentNode?.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.match(ImprovedTube.regex.channel)?.groups?.name
					// video-preview doesnt have Channel info, extract from source thumbnail
					|| ((video && this.parentNode?.classList.contains('ytd-video-preview')) ? ImprovedTube.elements.observerList.find(a => a.id == 'thumbnail' && a.href?.match(ImprovedTube.regex.video_id)?.[1] === video).parentNode?.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.match(ImprovedTube.regex.channel)?.groups?.name : null),
				blockedElement = ImprovedTube.blocklistElementTypeHelper(node),

				// Yes, this is horrible. Cant find better way of extracting title :(
				title = this.parentNode?.__dataHost?.__data?.data?.title?.runs?.[0]?.text
					|| this.parentNode.__dataHost?.__data?.data?.title?.simpleText
					|| this.parentNode.__dataHost?.__data?.videoPreviewData?.accessibilityText
					|| blockedElement?.querySelector('[title]')?.title;
			let added = false,
				type = 'video';

			if (!video || !blockedElement || !title) {
				console.error('blocklist button: need video ID, blockedElement and title');
				return;
			}

			// this button can perform three functions in this particular order:
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
			ImprovedTube.messages.send({
				action: 'blocklist',
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

		const id = location.pathname.match(ImprovedTube.regex.channel)?.groups?.name,
			title = this.parentNode.__dataHost?.__data?.data?.title
				|| ytInitialData?.metadata?.channelMetadataRenderer?.title
				|| document.querySelector('yt-dynamic-text-view-model .yt-core-attributed-string')?.innerText,
			preview = document.querySelector('yt-decorated-avatar-view-model img')?.src
				|| document.querySelector('#channel-header-container #avatar img#img')?.src
				|| this.parentNode.__dataHost?.__data?.data?.avatar?.thumbnails?.[0]?.url;

		if (!id || !title) {
			console.error('blocklist click: no channel ID or metadata');
			return;
		}

		// this message will trigger 'storage-changed' event and eventually blocklistInit() full rescan
		ImprovedTube.messages.send({
			action: 'blocklist',
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
	// YT tries to remove all forein nodes from node.parentNode.parentNode some time after 'yt-navigate-finish'
	// Need to monitor for it and re-appendChild our button, otherwise if  gets deleted when switching to
	// channel subpages /playlists /featured /videos etc.
	this.blocklistChannelObserver = new MutationObserver(function () {
		if (!button.isConnected) {
			node.parentNode.parentNode.appendChild(button);
		}
	});
	this.blocklistChannelObserver.observe(node.parentNode.parentNode, {childList: true, subtree: true});
};

ImprovedTube.handleDislikeButton = function() {	
	// Wait for the dislike button to exist. YouTube may create/remove it dynamically.
	const findButton = () => document.querySelector('dislike-button-view-model button');

	const attach = (dislikeButton) => {
		if (!dislikeButton) return;

		// Also observe aria-pressed changes directly (more robust than relying on click)
		const observer = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.type === 'attributes' && m.attributeName === 'aria-pressed') {
					const aria = dislikeButton.getAttribute('aria-pressed');
					const isDisliked = aria === 'true';
					console.log('ImprovedTube: aria-pressed changed ->', aria);
					const videoId = location.href.match(ImprovedTube.regex.video_id)?.[1];
					const title = document.querySelector('h1.style-scope.ytd-watch-metadata yt-formatted-string')?.textContent;
					if (!videoId || !title) return;
					if (!this.storage.blocklist_activate || !this.storage.blocklist_dislike_trigger) return;
					ImprovedTube.messages.send({
						action: 'blocklist',
						added: isDisliked,
						type: 'video',
						id: videoId,
						title: title,
						when: Date.parse(new Date().toDateString()) / 100000
					});
				}
			}
		});
		observer.observe(dislikeButton, { attributes: true, attributeFilter: ['aria-pressed'] });
		dislikeButton._itDislikeObserver = observer;
	};

	const button = findButton();
	if (button) {
		attach(button);
		return;
	}

	// If button not present yet, watch DOM for it (one-time observer)
	const rootObserver = new MutationObserver((mutations, obs) => {
		const b = findButton();
		if (b) {
			attach(b);
			try { obs.disconnect(); } catch (e) {}
		}
	});
	rootObserver.observe(document.documentElement || document.body, { childList: true, subtree: true });
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
		if (document.querySelector('YTD-SUBSCRIBE-BUTTON-RENDERER, YT-SUBSCRIBE-BUTTON-VIEW-MODEL, YTD-BUTTON-RENDERER.ytd-c4-tabbed-header-renderer')) {
			this.blocklistChannel(document.querySelector('YTD-SUBSCRIBE-BUTTON-RENDERER, YT-SUBSCRIBE-BUTTON-VIEW-MODEL, YTD-BUTTON-RENDERER.ytd-c4-tabbed-header-renderer'));
		}

		// Initialize dislike button handler for video pages (if user enabled)
		if (location.pathname === '/watch' && this.storage.blocklist_dislike_trigger) {
			this.handleDislikeButton();
		}
	} else {
		// Disable and unload Blocklist
		// remove all 'it-add-to-blocklist' buttons
		for (const blocked of this.elements.blocklist_buttons) {
			blocked.remove();
		}
		this.elements.blocklist_buttons = [];
		// clear observers list
		if (this.elements.observerList) {
			this.elements.observerList = [];
			// release observer
			ImprovedTube.blocklistObserver.disconnect();
		}
		// clear optional Channel button Observer
		if (typeof ImprovedTube.blocklistChannelObserver === 'object') {
			ImprovedTube.blocklistChannelObserver.disconnect();
		}
		// remove all video/channel blocks from thumbnails on current page
		for (const blocked of document.querySelectorAll('.it-blocklisted-video')) {
			blocked.classList.remove('it-blocklisted-video');
		}
		for (const blocked of document.querySelectorAll('.it-blocklisted-channel')) {
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
			blockedElement = ImprovedTube.blocklistElementTypeHelper(mutation.target);

		if (!blockedElement) return; // unknown thumbnail cell type, bail out

		if (!video) {
			// no video ID means monitored thumbnail/video-preview node went inactive
			blockedElement.classList.remove('it-blocklisted-video');
			blockedElement.classList.remove('it-blocklisted-channel');
			return;
		}

		if (ImprovedTube.storage.blocklist?.videos[video]) {
			blockedElement.classList.add('it-blocklisted-video');
		} else {
			blockedElement.classList.remove('it-blocklisted-video');
		}
		if (!channel) return;
		if (ImprovedTube.storage.blocklist?.channels[channel]) {
			blockedElement.classList.add('it-blocklisted-channel');
		} else {
			blockedElement.classList.remove('it-blocklisted-channel');
		}
	}
});

ImprovedTube.blocklistElementTypeHelper = function (node) {
	switch (node.parentNode.className.replace('style-scope ', '')) {
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

		case 'ytd-grid-video-renderer':
			// channel home screen grid
		case 'ytd-reel-item-renderer':
			// reel
			return node.parentNode.parentNode;

		default:
			// unknown ones land here
			break;
	}
};
