/*--------------------------------------------------------------
>>> INITIALIZATION
--------------------------------------------------------------*/
ImprovedTube.messages.create();
ImprovedTube.messages.listener();
if (document.body) { ImprovedTube.childHandler(document.body); }

ImprovedTube.observer = new MutationObserver(function (mutationList) {

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
			ImprovedTube.extractSubscriberCount();
		}

	}

	/*
	//console.log("--- p FOR PARENT, c FOR CHILD, r FOR REMOVED :");
	let i = 0; for (const mutated of mutationList) {

		if (mutated.type === 'childList') {
			// if (/^(SCRIPT|DOM-IF|DOM-REPEAT|svg|SPAN|yt-icon-shape)$/.test(mutated.target.nodeName)) {i++; continue; }
			// ImprovedTube.ytElementsHandler(mutated.target);
			// console.log("p"+i+":"+mutated.target.id+",class:"+mutated.target.className+","+mutated.target+"("+mutated.target.nodeName+")");
				let j = 0; for (const node of mutated.addedNodes) {
				ImprovedTube.childHandler(node);
//console.log("p"+i+"c"+j+":"+node.id+",class:"+node.className+","+node+"("+node.nodeName+")");
				j++;}
				let r = 0; for (const node of mutated.removedNodes){ //might fix our other playlist buttons equally?
				if(node.nodeName === 'BUTTON' && node.id === 'it-popup-playlist-button') ImprovedTube.playlistPopupUpdate();
//console.log("p"+i+"removed"+r+":"+node.id+",class:"+node.className+","+node+"("+node.nodeName+")"+"(from:"+mutated.target.id+",class:"+mutated.target.className+","+mutated.target+"("+mutated.target.nodeName+")");
				r++;}
						if(mutated.target.id === 'owner-sub-count')
						{if (ImprovedTube.storage.ads === 'small_creators')
						{ImprovedTube.extractSubscriberCount(mutated.target);}}
		}
//	if (mutated.type === 'characterData') { if (/#COMMENT/.test(mutated.target.nodeName)) {i++; continue; };	ImprovedTube.ytElementsHandler(mutated.target);
//console.log("changed characterData:"+mutated.target.nodeValue+"("+mutated.target.id+",class:"+mutated.target.className+","+mutated.target+"("+mutated.target.nodeName+")");
//	 } if (mutated.type === 'attributes')  {if (/^(caption-window-|ytp-progress-bar$|ytp-[a-z]*-progress$)/.test(mutated.target.nodeName)) return; ImprovedTube.ytElementsHandler(mutated.target);
//console.log("mutated attribute:"+mutated.attributeName+"("+mutated.target.id+",class:"+mutated.target.className+","+mutated.target+"("+mutated.target.nodeName+"))");
		}
	i++;}
	*/


}).observe(document.documentElement, {
	//	attributes: true,
	//	attributeOldValue: true,
	//	characterData: true,
	//	characterDataOldValue: true,
	childList: true,
	subtree: true
});

if (ImprovedTube.storage.channel_default_tab && ImprovedTube.storage.channel_default_tab !== '/' ) {
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
}

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
	this.playerOnPlay();
	this.playerSDR();
	this.shortcuts();
	this.onkeydown();
	this.onmousedown();
	this.youtubeLanguage();
	this.myColors();
	this.channelCompactTheme();
	
	if (ImprovedTube.elements.player && ImprovedTube.elements.player.setPlaybackRate) {
		ImprovedTube.videoPageUpdate();
		ImprovedTube.initPlayer();
	}

	if (window.matchMedia) {
		document.documentElement.dataset.systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
};

document.addEventListener('yt-navigate-finish', function () {
	ImprovedTube.pageType();
	ImprovedTube.commentsSidebar();

	if (ImprovedTube.elements.player && ImprovedTube.elements.player.setPlaybackRate) {
		ImprovedTube.videoPageUpdate();
		ImprovedTube.initPlayer();
	}

	ImprovedTube.channelPlayAllButton();
	if (document.documentElement.dataset.pageType === 'home' &&	 ImprovedTube.storage.youtube_home_page === 'search' ) {
		document.querySelector('body').style.setProperty('visibility', 'visible', 'important');
		ImprovedTube.shortcutGoToSearchBox();
		document.querySelector('#search').click();
	}
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
	}

	ImprovedTube.elements.app_drawer = {
		start: document.querySelector('tp-yt-app-drawer #header'),
		logo: document.querySelector('tp-yt-app-drawer a#logo')
	}
	ImprovedTube.improvedtubeYoutubeIcon();
	if (document.documentElement.dataset.pageType === 'video') { ImprovedTube.expandDescription(); }
	if (document.documentElement.dataset.pageType === 'home' && ImprovedTube.storage.youtube_home_page === 'search' ) {
		document.querySelector('body').style.setProperty('visibility', 'visible', 'important');
		ImprovedTube.shortcutGoToSearchBox();
		document.querySelector('#search').click();
	}
	//document.querySelector('#content, #guide[opened]').remove() }
});
