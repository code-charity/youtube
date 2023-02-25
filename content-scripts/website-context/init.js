/*--------------------------------------------------------------
>>> INITIALIZATION
--------------------------------------------------------------*/

ImprovedTube.messages.create();
ImprovedTube.messages.listener();

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
	ImprovedTube.pageType();
	ImprovedTube.myColors();

	var yt_player_updated = function () {
		document.dispatchEvent(new CustomEvent('improvedtube-player-loaded'));

		window.removeEventListener('yt-player-updated', yt_player_updated);
	};

	window.addEventListener('yt-player-updated', yt_player_updated);

	this.playerH264();
	this.player60fps();
	this.playerSDR();
	this.shortcuts();
	this.playerOnPlay();
	this.onkeydown();
	this.onmousedown();
	this.youtubeLanguage();


	if (window.matchMedia) {
		document.documentElement.dataset.systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
};

document.addEventListener('yt-navigate-finish', function () {
	ImprovedTube.pageType();

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
ImprovedTube.whenPaused=()=>{
		ImprovedTube.elements.player.parentNode.addEventListener('mouseenter', function () {
			ImprovedTube.playerControls(true);
		});
		ImprovedTube.elements.player.parentNode.addEventListener('click', function () {
			ImprovedTube.playerControls(true);
		});
		ImprovedTube.elements.player.parentNode.onmousemove = (function() {
			let onmousestop = function() {
				ImprovedTube.playerControls(false);
			}, thread;
			
			return function() {
			  ImprovedTube.playerControls(true);
			  clearTimeout(thread);
			  thread = setTimeout(onmousestop, 1000);
			};
		  })();
		ImprovedTube.elements.player.parentNode.addEventListener('mouseleave', function () {
			ImprovedTube.playerControls(false);
		});
}
