/*--------------------------------------------------------------
>>> INITIALIZATION
--------------------------------------------------------------*/
if (document.body) { ImprovedTube.childHandler(document.body); }

ImprovedTube.observer = new MutationObserver(function (mutationList) {

	for (var i = 0, l = mutationList.length; i < l; i++) {
		var mutation = mutationList[i];

		if (mutation.type === 'childList') {
			for (var j = 0, k = mutation.addedNodes.length; j < k; j++) {
				ImprovedTube.childHandler(mutation.addedNodes[j]);
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
				if(node.nodeName === 'BUTTON' && node.id === 'it-popup-playlist-button') ImprovedTube.playlistPopup();
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
		if (location.search.match(ImprovedTube.regex.playlist_id)) {
			ImprovedTube.playlistRepeat();
			ImprovedTube.playlistShuffle();
			ImprovedTube.playlistReverse();
			ImprovedTube.playlistPopup();
			ImprovedTube.playlistCopyVideoIdButton();
		}
	});
	this.pageType();
	this.playerOnPlay();
	this.playerSDR();
	this.shortcutsInit();
	this.onkeydown();
	this.onmousedown();
	this.youtubeLanguage();
	this.myColors();
	this.YouTubeExperiments();
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
/* 			if (name === 'META') {			   //<META> infos are not updated when clicking related videos...
			if(node.getAttribute('name')) {
			//if(node.getAttribute('name') === 'title')		 {ImprovedTube.title = node.content;}		//duplicate
			//if(node.getAttribute('name') === 'description')	   {ImprovedTube.description = node.content;}  //duplicate
			//if node.getAttribute('name') === 'themeColor')			{ImprovedTube.themeColor = node.content;}   //might help our darkmode/themes
//Do we need any of these here before the player starts?
			//if(node.getAttribute('name') === 'keywords')		  {ImprovedTube.keywords = node.content;}
			} else if (node.getAttribute('itemprop')) {
			//if(node.getAttribute('itemprop') === 'name')		  {ImprovedTube.title = node.content;}
			if(node.getAttribute('itemprop') === 'genre')		   {ImprovedTube.category  = node.content;}
			//if(node.getAttribute('itemprop') === 'channelId')	 {ImprovedTube.channelId = node.content;}
			//if(node.getAttribute('itemprop') === 'videoId')	   {ImprovedTube.videoId = node.content;}
//The following infos will enable awesome, smart features.  Some of which everyone should use.
			//if(node.getAttribute('itemprop') === 'description')   {ImprovedTube.description = node.content;}
			//if(node.getAttribute('itemprop') === 'duration')	  {ImprovedTube.duration = node.content;}
			//if(node.getAttribute('itemprop') === 'interactionCount'){ImprovedTube.views = node.content;}
			//if(node.getAttribute('itemprop') === 'isFamilyFriendly'){ImprovedTube.isFamilyFriendly = node.content;}
			//if(node.getAttribute('itemprop') === 'unlisted')	  {ImprovedTube.unlisted = node.content;}
			//if(node.getAttribute('itemprop') === 'regionsAllowed'){ImprovedTube.regionsAllowed = node.content;}
			//if(node.getAttribute('itemprop') === 'paid')		  {ImprovedTube.paid = node.content;}
			// if(node.getAttribute('itemprop') === 'datePublished' ){ImprovedTube.datePublished = node.content;}
					//to use in the "how long ago"-feature, not to fail without API key?  just like the "day-of-week"-feature above
			// if(node.getAttribute('itemprop') === 'uploadDate')   {ImprovedTube.uploadDate = node.content;}
*/
	ImprovedTube.pageType();
	ImprovedTube.YouTubeExperiments();
	ImprovedTube.commentsSidebar();

	if (ImprovedTube.elements.player && ImprovedTube.elements.player.setPlaybackRate) {
		ImprovedTube.videoPageUpdate();
		ImprovedTube.initPlayer();
	}

	if (document.documentElement.dataset.pageType === 'home' &&	 ImprovedTube.storage.youtube_home_page === 'search' ) {
		document.querySelector('body').style.setProperty('visibility', 'visible', 'important');
		ImprovedTube.shortcutGoToSearchBox();
		document.querySelector('#search').click();
	} else if (document.documentElement.dataset.pageType === 'channel') {
		ImprovedTube.channelPlayAllButton();
	}
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
