/*--------------------------------------------------------------
>>> INITIALIZATION
--------------------------------------------------------------*/
ImprovedTube.messages.create();
ImprovedTube.messages.listener();

if (document.body) {
	console.log("start..");
	ImprovedTube.childHandler(document.body);
}

ImprovedTube.observer = new MutationObserver(function (mutationList) {
	console.log("the doc element changed")
	for (var i = 0, l = mutationList.length; i < l; i++) {
		var mutation = mutationList[i];

		if (mutation.type === 'childList') {
			for (var j = 0, k = mutation.addedNodes.length; j < k; j++) {
				ImprovedTube.childHandler(mutation.addedNodes[j]);
			}
			for (const node of mutation.removedNodes){
				if(node.nodeName === 'BUTTON' && node.id === 'it-popup-playlist-button') ImprovedTube.playlistPopupUpdate();
			}
		}
		if (mutation.target && mutation.target.id === 'owner-sub-count') {
			// Extract and store the subscriber count
			ImprovedTube.extractAndStoreSubscribers();
		}
	}
}).observe(document.documentElement, {
	attributes: false,
	childList: true,
	subtree: true
});

new MutationObserver(function (mutationList) {
	for (var i = 0, l = mutationList.length; i < l; i++) {
		var mutation = mutationList[i];

		if (mutation.type === 'attributes') {
			ImprovedTube.channelDefaultTab(mutation.target);
		}
	}
}).observe(document.documentElement, {
	attributeFilter: ['href'],
	attributes: true,
	childList: true,
	subtree: true
});

ImprovedTube.init = function () {
	window.addEventListener('yt-page-data-updated', function () {
		ImprovedTube.pageType();
	});
	ImprovedTube.pageType();
	var yt_player_updated = function () {
		document.dispatchEvent(new CustomEvent('improvedtube-player-loaded'));

		window.removeEventListener('yt-player-updated', yt_player_updated);
	};

	window.addEventListener('yt-player-updated', yt_player_updated);
	this.channelCompactTheme();
	this.playerOnPlay();
	this.playerSDR();
	this.shortcuts();
	this.onkeydown();
	this.onmousedown();
	this.youtubeLanguage();

	if (ImprovedTube.elements.player && ImprovedTube.elements.player.setPlaybackRate) {
		ImprovedTube.videoPageUpdate();
		ImprovedTube.initPlayer();
	}
	
	if (window.matchMedia) {
		document.documentElement.dataset.systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}  ImprovedTube.myColors();
};

document.addEventListener('yt-navigate-finish', function () {
	ImprovedTube.pageType();
	ImprovedTube.commentsSidebar();
	
	if (ImprovedTube.elements.player && ImprovedTube.elements.player.setPlaybackRate) {
		ImprovedTube.videoPageUpdate();
		ImprovedTube.initPlayer();
	}

	ImprovedTube.channelPlayAllButton();
	if (document.documentElement.dataset.pageType === 'home' &&  ImprovedTube.storage.youtube_home_page === 'search' )
		{ document.querySelector('body').style.setProperty('visibility', 'visible', 'important');ImprovedTube.shortcutGoToSearchBox(); document.querySelector('#search').click(); }
});

document.addEventListener('yt-page-data-updated', function (event) {
	if (document.documentElement.dataset.pageType === 'video' && /[?&]list=([^&]+).*$/.test(location.href)) {
		ImprovedTube.playlistRepeat();
		ImprovedTube.playlistShuffle();
		ImprovedTube.playlistReverse();
	}
	ImprovedTube.playlistPopupUpdate();
	
});

window.addEventListener('load', function () {
	ImprovedTube.elements.masthead = {
		start: document.querySelector('ytd-masthead #start'),
		end: document.querySelector('ytd-masthead #end'),
		logo: document.querySelector('ytd-masthead a#logo')
	};

	ImprovedTube.elements.app_drawer = {
		start: document.querySelector('tp-yt-app-drawer #header'),
		logo: document.querySelector('tp-yt-app-drawer a#logo')
	};
	ImprovedTube.improvedtubeYoutubeIcon(); 	
		if (document.documentElement.dataset.pageType === 'home' &&  ImprovedTube.storage.youtube_home_page === 'search' )
		{ document.querySelector('body').style.setProperty('visibility', 'visible', 'important');ImprovedTube.shortcutGoToSearchBox(); document.querySelector('#search').click(); }
		//document.querySelector('#content, #guide[opened]').remove() } 	
});

// Function to extract and store the number of subscribers
ImprovedTube.extractAndStoreSubscribers = function () {
    var subscriberCountNode = document.getElementById('owner-sub-count');

	if (subscriberCountNode) {
		console.log("from extracting the sub num");
	
		// Extract the subscriber count and store it for further use
		var subscriberCountText = subscriberCountNode.textContent.trim();
		var subscriberCount = parseFloat(subscriberCountText.replace(/[^0-9.]/g, ''));
	
		if (subscriberCountText.includes('K')) {
			subscriberCount *= 1000;
		} else if (subscriberCountText.includes('M')) {
			subscriberCount *= 1000000;
		} 

		ImprovedTube.subscriberCount = subscriberCount;

		console.log('Subscriber Count:', subscriberCount);
	}
};
