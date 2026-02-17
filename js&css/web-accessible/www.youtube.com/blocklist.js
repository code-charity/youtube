/*------------------------------------------------------------------------------
4.8.0 BLOCKLIST
------------------------------------------------------------------------------*/
ImprovedTube.blocklistNode = function (node) {
	if (!this.storage.blocklist_activate || !node) return;

	const video = node.href?.match(ImprovedTube.regex.video_id)?.[1] || (node.classList?.contains('ytd-video-preview') ? 'video-preview' : null);
	const container = node.closest('ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-video-renderer, ytd-video-preview');

	const channel = container?.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.match(ImprovedTube.regex.channel)?.groups?.name;

	const blockedElement = this.blocklistElementTypeHelper(node);

	if (!video) return; // not interested in nodes without one

	// YT reuses Thumbnail cells dynamically
	if (!this.elements.observerList.includes(node)) {
		this.blocklistObserver.observe(node, {
			attributes: true,
			attributeFilter: ['href']
		});
		this.elements.observerList.push(node);
	}

	if (!blockedElement) return; // unknown thumbnail cell type

	// Video blocklist
	if (ImprovedTube.storage.blocklist?.videos[video]) {
		blockedElement.classList.add('it-blocklisted-video');
	} else {
		blockedElement.classList.remove('it-blocklisted-video');
	}

	// Channel blocklist
	if (channel) {
		if (ImprovedTube.storage.blocklist?.channels[channel]) {
			blockedElement.classList.add('it-blocklisted-channel');
		} else {
			blockedElement.classList.remove('it-blocklisted-channel');
		}
	}

	// Skip if button already exists
	if (node.querySelector("button.it-add-to-blocklist")) return;

	const button = this.createIconButton({
		type: 'blocklist',
		className: 'it-add-to-blocklist',
		onclick: function () {
			if (!this.parentNode?.href) return;

			const video = this.parentNode.href?.match(ImprovedTube.regex.video_id)?.[1];
			const container = this.closest('ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-video-renderer, ytd-video-preview');

			const fallbackNode = (video && this.closest('ytd-video-preview')) 
				? ImprovedTube.elements.observerList.find(a => a.href?.match(ImprovedTube.regex.video_id)?.[1] === video)
				: null;

			const channel = container?.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.match(ImprovedTube.regex.channel)?.groups?.name
				|| fallbackNode?.closest('ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-video-renderer, ytd-video-preview')?.__dataHost?.__data?.data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.match(ImprovedTube.regex.channel)?.groups?.name;

			const title = this.parentNode?.__dataHost?.__data?.data?.title?.runs?.[0]?.text
				|| this.parentNode?.__dataHost?.__data?.data?.title?.simpleText
				|| this.parentNode?.__dataHost?.__data?.videoPreviewData?.accessibilityText
				|| (blockedElement?.querySelector('[title]')?.title);

			if (!video || !blockedElement || !title) {
				console.error('blocklist button: need video ID, blockedElement and title');
				return;
			}

			let added = false, type = 'video';

			if (channel && blockedElement.classList.contains('it-blocklisted-channel')) {
				type = 'channel';
			} else if (blockedElement.classList.contains('it-blocklisted-video')) {
				// unblocking video
			} else {
				added = true;
			}

			ImprovedTube.messages.send({
				action: 'blocklist',
				added: added,
				type: type,
				id: type === 'channel' ? channel : video,
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

	if (this.blocklistChannelObserver) {
		this.blocklistChannelObserver.disconnect();
	}

	let button = node.parentNode?.parentNode?.querySelector("button.it-add-channel-to-blocklist");

	if (!id) return;

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

		const id = location.pathname.match(ImprovedTube.regex.channel)?.groups?.name;
		const title = this.parentNode?.__dataHost?.__data?.data?.title
				|| ytInitialData?.metadata?.channelMetadataRenderer?.title
				|| document.querySelector('yt-dynamic-text-view-model .yt-core-attributed-string')?.innerText;
		const preview = document.querySelector('yt-decorated-avatar-view-model img')?.src
				|| document.querySelector('#channel-header-container #avatar img#img')?.src
				|| this.parentNode?.__dataHost?.__data?.data?.avatar?.thumbnails?.[0]?.url;

		if (!id || !title) {
			console.error('blocklist click: no channel ID or metadata');
			return;
		}

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

	if (node.parentNode?.parentNode) {
		node.parentNode.parentNode.appendChild(button);
		this.elements.blocklist_buttons.push(button);

		this.blocklistChannelObserver = new MutationObserver(function () {
			if (!button.isConnected) {
				if (node.parentNode?.parentNode) {
					node.parentNode.parentNode.appendChild(button);
				} else {
					this.disconnect();
				}
			}
		});
		this.blocklistChannelObserver.observe(node.parentNode.parentNode, { childList: true, subtree: true });
	}
};

ImprovedTube.handleDislikeButton = function() {
	const findButton = () => document.querySelector('dislike-button-view-model button');

	const attach = (dislikeButton) => {
		if (!dislikeButton) return;

		const observer = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.type === 'attributes' && m.attributeName === 'aria-pressed') {
					const aria = dislikeButton.getAttribute('aria-pressed');
					const isDisliked = aria === 'true';
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
	if (!this.storage.blocklist_activate) {
		// disable blocklist
		this.elements.blocklist_buttons.forEach(b => b.remove());
		this.elements.blocklist_buttons = [];
		if (this.elements.observerList) this.elements.observerList = [];
		if (ImprovedTube.blocklistObserver) ImprovedTube.blocklistObserver.disconnect();
		if (ImprovedTube.blocklistChannelObserver) ImprovedTube.blocklistChannelObserver.disconnect();
		document.querySelectorAll('.it-blocklisted-video, .it-blocklisted-channel').forEach(el => el.classList.remove('it-blocklisted-video', 'it-blocklisted-channel'));
		return;
	}

	// ensure storage exists
	this.storage.blocklist = this.storage.blocklist || {videos: {}, channels: {}};
	this.storage.blocklist.videos = this.storage.blocklist.videos || {};
	this.storage.blocklist.channels = this.storage.blocklist.channels || {};

	for (const thumbnail of document.querySelectorAll('a.ytd-thumbnail[href], a.ytd-video-preview')) {
		this.blocklistNode(thumbnail);
	}

	const channelBtn = document.querySelector('YTD-SUBSCRIBE-BUTTON-RENDERER, YT-SUBSCRIBE-BUTTON-VIEW-MODEL, YTD-BUTTON-RENDERER.ytd-c4-tabbed-header-renderer');
	if (channelBtn) this.blocklistChannel(channelBtn);

	if (location.pathname === '/watch' && this.storage.blocklist_dislike_trigger) {
		this.handleDislikeButton();
	}
};

ImprovedTube.blocklistObserver = new MutationObserver(function (mutationList) {
	for (const mutation of mutationList) {
		const blockedElement = ImprovedTube.blocklistElementTypeHelper(mutation.target);
		if (!blockedElement) return;

		const video = mutation.target.href?.match(ImprovedTube.regex.video_id)?.[1];
		const channel = (() => {
    // normal path
    const parentData = mutation.target.parentNode?.__dataHost?.__data?.data;
    const runs = parentData?.shortBylineText?.runs;
    if (runs && runs.length > 0) {
        const url = runs[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url;
        const match = url?.match(ImprovedTube.regex.channel);
        if (match?.groups?.name) return match.groups.name;
    }

    // fallback for ytd-video-preview
    if (video && mutation.target?.classList.contains('ytd-video-preview')) {
        const found = ImprovedTube.elements.observerList.find(a =>
            a.href?.match(ImprovedTube.regex.video_id)?.[1] === video
        );
        if (!found?.parentNode) return null; // prevent error

        const fallbackData = found.parentNode.__dataHost?.__data?.data;
        const fallbackRuns = fallbackData?.shortBylineText?.runs;
        const fallbackUrl = fallbackRuns?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url;
        const fallbackMatch = fallbackUrl?.match(ImprovedTube.regex.channel);
        return fallbackMatch?.groups?.name || null;
    }

    return null;
})();


		if (!video) {
			blockedElement.classList.remove('it-blocklisted-video');
			blockedElement.classList.remove('it-blocklisted-channel');
			return;
		}

		if (ImprovedTube.storage.blocklist?.videos[video]) {
			blockedElement.classList.add('it-blocklisted-video');
		} else {
			blockedElement.classList.remove('it-blocklisted-video');
		}

		if (channel && ImprovedTube.storage.blocklist?.channels[channel]) {
			blockedElement.classList.add('it-blocklisted-channel');
		} else {
			blockedElement.classList.remove('it-blocklisted-channel');
		}
	}
});

ImprovedTube.blocklistElementTypeHelper = function (node) {
	if (!node?.parentNode) return null;

	const cls = node.parentNode.className?.replace('style-scope ', '');
	switch (cls) {
		case 'ytd-compact-video-renderer':
		case 'ytd-rich-item-renderer':
		case 'ytd-rich-grid-media':
		case 'ytd-rich-grid-slim-media':
		case 'ytd-playlist-video-renderer':
		case 'ytd-playlist-panel-video-renderer':
		case 'ytd-structured-description-video-lockup-renderer':
		case 'ytd-video-renderer':
		case 'ytd-video-preview':
			return node.parentNode?.parentNode?.parentNode || null;

		case 'ytd-grid-video-renderer':
		case 'ytd-reel-item-renderer':
			return node.parentNode?.parentNode || null;

		default:
			return null;
	}
};
