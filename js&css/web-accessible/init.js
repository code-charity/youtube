/*--------------------------------------------------------------
>>> INITIALIZATION
--------------------------------------------------------------*/
ImprovedTube.messages.create();
ImprovedTube.messages.listener();

/*
//document.body.removeChild(document.body.getElementsByTagName("script")[1]);
 var scriptElement = document.body.getElementsByTagName("script")[1] || false;
 if (scriptElement && scriptElement.textContent) {
    // Use regex to modify the JSON content while preserving the rest
    var updatedContent = scriptElement.textContent.replace(/(^[^{]*)(\{.*?})([^}]*$)/gs, function(match, before, json, after) {
      var parsedJSON = JSON.parse(json);
      delete parsedJSON.playerAds;
      delete parsedJSON.adPlacements;
      delete parsedJSON.adSlots;
	  console.log(parsedJSON.videoDetails);
      var updatedJSON = JSON.stringify(parsedJSON);
      return before + updatedJSON + after;
    });
    scriptElement.textContent = updatedContent;
}
*/

if (document.body) {
	ImprovedTube.childHandler(document.body);
}

ImprovedTube.observer = new MutationObserver(function (mutationList) {
	for (var i = 0, l = mutationList.length; i < l; i++) {
		var mutation = mutationList[i];

		if (mutation.type === 'childList') {
			for (var j = 0, k = mutation.addedNodes.length; j < k; j++) {
				ImprovedTube.childHandler(mutation.addedNodes[j]);
			}
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
});

document.addEventListener('yt-page-data-updated', function (event) {
	if (document.documentElement.dataset.pageType === 'video' && /[?&]list=([^&]+).*$/.test(location.href)) {
		ImprovedTube.playlistRepeat();
		ImprovedTube.playlistShuffle();
		ImprovedTube.playlistReverse();
	}
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
});
