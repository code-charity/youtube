/*------------------------------------------------------------------------------
HIDE AI-LABELED CONTENT
Detect YouTube AI disclosures on watch/Shorts, remember video IDs, mark feeds.
------------------------------------------------------------------------------*/

ImprovedTube.aiContentLabelPattern = /made with ai|altered or synthetic|ai-generated|generated with ai|generative ai content|synthetic media/i;

ImprovedTube.aiContentExactLabelPattern = /^(ai|made with ai)$/i;

ImprovedTube.getCurrentVideoId = function () {
	const href = location.href;

	if (location.pathname.startsWith('/shorts/')) {
		return location.pathname.split('/')[2]?.slice(0, 11) || null;
	}

	return href.match(ImprovedTube.regex.video_id)?.[1]
		|| this.getParam(new URL(href).search.substr(1), 'v')
		|| null;
};

ImprovedTube.isAiLabeledDom = function (root) {
	if (!root) {
		return false;
	}

	const labeled = root.querySelectorAll('[aria-label], [title]');

	for (let i = 0, l = labeled.length; i < l; i++) {
		const text = (labeled[i].getAttribute('aria-label') || labeled[i].getAttribute('title') || '').trim();

		// Prefer explicit disclosure wording; bare "AI" only on compact badge-like controls
		if (ImprovedTube.aiContentLabelPattern.test(text)) {
			return true;
		}

		if (ImprovedTube.aiContentExactLabelPattern.test(text)) {
			const tag = labeled[i].tagName;

			if (tag === 'BUTTON' || tag === 'A' || labeled[i].closest('badge-shape, button, a, yt-button-shape')) {
				return true;
			}
		}
	}

	const candidates = root.querySelectorAll('badge-shape, button, a, yt-formatted-string');

	for (let i = 0, l = candidates.length; i < l; i++) {
		const el = candidates[i];
		const text = (el.textContent || '').replace(/\s+/g, ' ').trim();

		if (!text || text.length > 64) {
			continue;
		}

		if (ImprovedTube.aiContentLabelPattern.test(text)) {
			return true;
		}

		// Bare "AI" label under the player / Shorts overlay only
		if (ImprovedTube.aiContentExactLabelPattern.test(text)
			&& el.closest('ytd-watch-metadata, #below, #meta, ytd-reel-player-overlay-renderer, ytd-reel-video-renderer')) {
			return true;
		}
	}

	return false;
};

ImprovedTube.isAiLabeledPlayerResponse = function () {
	try {
		const currentId = ImprovedTube.getCurrentVideoId();
		const flexy = document.querySelector('ytd-watch-flexy');
		let payload = flexy?.playerData || flexy?.data?.playerResponse;

		// ytInitialPlayerResponse is only reliable on the first load of a watch page
		if (!payload && window.ytInitialPlayerResponse) {
			const initialId = window.ytInitialPlayerResponse?.videoDetails?.videoId;

			if (!currentId || initialId === currentId) {
				payload = window.ytInitialPlayerResponse;
			}
		}

		if (!payload && window.ytplayer?.config?.args?.player_response) {
			payload = window.ytplayer.config.args.player_response;
		}

		if (typeof payload === 'string') {
			payload = JSON.parse(payload);
		}

		if (!payload || typeof payload !== 'object') {
			return false;
		}

		const responseId = payload.videoDetails?.videoId;

		if (currentId && responseId && responseId !== currentId) {
			return false;
		}

		const haystack = JSON.stringify(payload);

		return /generativeAi|generatedWithAi|aiGenerated|syntheticContent|alteredOrSynthetic|madeWithAi|made with AI|Altered or synthetic/i.test(haystack);
	} catch (error) {
		return false;
	}
};

ImprovedTube.isAiLabeledPage = function () {
	if (ImprovedTube.isAiLabeledPlayerResponse()) {
		return true;
	}

	const roots = [
		document.querySelector('ytd-watch-metadata'),
		document.querySelector('#below'),
		document.querySelector('#meta'),
		document.querySelector('#info-container'),
		document.querySelector('ytd-reel-player-overlay-renderer'),
		document.querySelector('ytd-reel-video-renderer')
	];

	for (let i = 0, l = roots.length; i < l; i++) {
		if (ImprovedTube.isAiLabeledDom(roots[i])) {
			return true;
		}
	}

	return false;
};

ImprovedTube.rememberAiContent = function (videoId, title) {
	if (!videoId || !ImprovedTube.storage.hide_ai_content) {
		return;
	}

	if (!ImprovedTube.storage.ai_content || typeof ImprovedTube.storage.ai_content !== 'object') {
		ImprovedTube.storage.ai_content = {};
	}

	if (ImprovedTube.storage.ai_content[videoId]) {
		return;
	}

	ImprovedTube.storage.ai_content[videoId] = {
		title: title || document.title,
		when: Date.parse(new Date().toDateString()) / 100000
	};

	ImprovedTube.messages.send({
		action: 'ai_content',
		type: 'add',
		id: videoId,
		title: ImprovedTube.storage.ai_content[videoId].title,
		when: ImprovedTube.storage.ai_content[videoId].when
	});
};

ImprovedTube.detectAiContent = function () {
	if (!ImprovedTube.storage.hide_ai_content) {
		return;
	}

	const pageType = document.documentElement.dataset.pageType;
	const onWatch = pageType === 'video' || location.pathname === '/watch';
	const onShorts = pageType === 'shorts' || location.pathname.startsWith('/shorts/');

	if (!onWatch && !onShorts) {
		return;
	}

	const videoId = ImprovedTube.getCurrentVideoId();

	if (!videoId) {
		return;
	}

	if (ImprovedTube.storage.ai_content?.[videoId]) {
		return;
	}

	const markIfLabeled = function () {
		const id = ImprovedTube.getCurrentVideoId();

		if (!id || !ImprovedTube.storage.hide_ai_content) {
			return false;
		}

		if (ImprovedTube.storage.ai_content?.[id]) {
			return true;
		}

		if (ImprovedTube.isAiLabeledPage()) {
			ImprovedTube.rememberAiContent(id, document.title);
			ImprovedTube.aiContentMarkFeeds();
			if (ImprovedTube.aiContentDetectObserver) {
				ImprovedTube.aiContentDetectObserver.disconnect();
			}
			return true;
		}

		return false;
	};

	if (markIfLabeled()) {
		return;
	}

	// Label can appear after metadata loads
	if (!ImprovedTube.aiContentDetectObserver) {
		ImprovedTube.aiContentDetectObserver = new MutationObserver(function () {
			clearTimeout(ImprovedTube.aiContentDetectTimer);
			ImprovedTube.aiContentDetectTimer = setTimeout(markIfLabeled, 300);
		});
	}

	const observeRoot = document.querySelector('ytd-watch-metadata')
		|| document.querySelector('#below')
		|| document.querySelector('ytd-reel-player-overlay-renderer')
		|| document.querySelector('ytd-watch-flexy')
		|| document.querySelector('ytd-shorts')
		|| document.documentElement;

	ImprovedTube.aiContentDetectObserver.disconnect();
	ImprovedTube.aiContentDetectObserver.observe(observeRoot, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ['aria-label', 'title', 'hidden']
	});
};

ImprovedTube.aiContentMarkFeeds = function () {
	if (!this.storage.hide_ai_content) {
		return;
	}

	const links = document.querySelectorAll('a.ytd-thumbnail[href], a.ytd-video-preview[href], ytd-video-preview');

	for (let i = 0, l = links.length; i < l; i++) {
		this.aiContentNode(links[i]);
	}
};

ImprovedTube.aiContentNode = function (node) {
	if (!this.storage.hide_ai_content || !node) {
		return;
	}

	if (typeof this.blocklistElementTypeHelper !== 'function') {
		return;
	}

	const video = node.href?.match(ImprovedTube.regex.video_id)?.[1];
	const blockedElement = this.blocklistElementTypeHelper(node);

	if (!video || !blockedElement) {
		return;
	}

	if (!this.elements.aiContentObserverList) {
		this.elements.aiContentObserverList = [];
	}

	if (!this.elements.aiContentObserverList.includes(node)) {
		this.aiContentObserver.observe(node, {
			attributes: true,
			attributeFilter: ['href']
		});
		this.elements.aiContentObserverList.push(node);
	}

	if (ImprovedTube.storage.ai_content?.[video]) {
		blockedElement.classList.add('it-ai-content');
	} else {
		blockedElement.classList.remove('it-ai-content');
	}
};

ImprovedTube.aiContentObserver = new MutationObserver(function (mutationList) {
	for (const mutation of mutationList) {
		if (typeof ImprovedTube.blocklistElementTypeHelper !== 'function') {
			continue;
		}

		const video = mutation.target.href?.match(ImprovedTube.regex.video_id)?.[1];
		const blockedElement = ImprovedTube.blocklistElementTypeHelper(mutation.target);

		if (!blockedElement) {
			continue;
		}

		if (!video) {
			blockedElement.classList.remove('it-ai-content');
			continue;
		}

		if (ImprovedTube.storage.ai_content?.[video]) {
			blockedElement.classList.add('it-ai-content');
		} else {
			blockedElement.classList.remove('it-ai-content');
		}
	}
});

ImprovedTube.aiContentInit = function () {
	if (this.storage.hide_ai_content) {
		if (!this.storage.ai_content || typeof this.storage.ai_content !== 'object') {
			this.storage.ai_content = {};
		}

		this.aiContentMarkFeeds();
		this.detectAiContent();
	} else {
		if (this.elements.aiContentObserverList) {
			this.elements.aiContentObserverList = [];
			this.aiContentObserver.disconnect();
		}

		if (this.aiContentDetectObserver) {
			this.aiContentDetectObserver.disconnect();
		}

		clearTimeout(this.aiContentDetectTimer);

		for (const blocked of document.querySelectorAll('.it-ai-content')) {
			blocked.classList.remove('it-ai-content');
		}
	}
};
