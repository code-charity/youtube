/*------------------------------------------------------------------------------
4.6.0 CHANNEL
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.6.1 DEFAULT CHANNEL TAB
------------------------------------------------------------------------------*/

ImprovedTube.channelDefaultTab = function (a) {
	var option = this.storage.channel_default_tab;

	if (option && option !== '/' && a && a.parentNode && a.parentNode.id !== 'contenteditable-root') {
		if (this.regex.channel_home_page.test(a.href) && !a.href.endsWith(option)) {
			a.href = a.href.replace(this.regex.channel_home_page_postfix, '') + option;

			a.addEventListener('click', function (event) {
				event.stopPropagation();
			}, true);
		}
	}
};

/*------------------------------------------------------------------------------
4.6.2 PLAY ALL BUTTON (Exclude Shorts)
------------------------------------------------------------------------------*/

function itIsShorts(node) {
	if (!node) return false;
	const a = node.querySelector('a#thumbnail, a.yt-simple-endpoint[href]');
	const href = (a && a.getAttribute('href')) || '';
	if (href.startsWith('/shorts/') || /\/shorts\//.test(href)) return true;
  
	const tn = (node.tagName || '').toLowerCase();
	if (tn === 'ytd-reel-video-renderer' || tn.includes('reel')) return true;
  
	const badgeText = Array.from(
	  node.querySelectorAll('ytd-badge-supported-renderer, .badge, .shorts-badge')
	).map(b => (b.textContent || '').toLowerCase()).join(' ');
	if (badgeText.includes('shorts')) return true;
  
	const dataHref = (a && a.dataset && a.dataset.href) || '';
	if (/\/shorts\//.test(dataHref)) return true;
  
	return false;
  }
  
  function itCollectVideoIds(opts) {
	const excludeShorts = !!(opts && opts.excludeShorts);
	const limit = (opts && opts.limit) || 50;
	const selectors = [
	  'ytd-rich-item-renderer',
	  'ytd-grid-video-renderer',
	  'ytd-video-renderer',
	  'ytd-compact-video-renderer'
	];
	const nodes = document.querySelectorAll(selectors.join(','));
	const ids = [];
  
	for (const node of nodes) {
	  if (excludeShorts && itIsShorts(node)) continue;
  
	  const a = node.querySelector('a#thumbnail, a.yt-simple-endpoint[href*="/watch"]');
	  if (!a) continue;
  
	  let id = '';
	  try {
		const url = new URL(a.href, location.origin);
		id = url.searchParams.get('v') || '';
	  } catch (_) {
		const href = a.getAttribute('href') || '';
		const m = href.match(/[?&]v=([^&]+)/);
		id = (m && m[1]) || '';
	  }
  
	  if (id) ids.push(id);
	  if (ids.length >= limit) break;
	}
	return ids;
  }

/*------------------------------------------------------------------------------
4.6.3 PLAY ALL BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.channelPlayAllButton = function () {
	if (ImprovedTube.regex.channel.test(location.pathname)) {
		if (this.storage.channel_play_all_button) {
			const container = document.querySelector('ytd-channel-sub-menu-renderer #primary-items')
				|| document.querySelector('ytd-two-column-browse-results-renderer #chips-content');
			const playlistUrl = document.querySelector('ytd-app')?.__data?.data?.response?.metadata?.channelMetadataRenderer?.externalId?.substring(2);
			const existingPlayAllButton = document.querySelector('.it-play-all-button');

			//if (!container) return; // we only add button on /videos page
			if (!playlistUrl) {
				console.error('channelPlayAllButton: Cant find Channel playlist');
				return;
			}
			if (existingPlayAllButton) return; // prevent add duplicate button
			const button = this.createIconButton({
				type: 'playAll',
				className: 'it-play-all-button',
				text: 'Play all',
				href: '/playlist?list=UU' + playlistUrl
			});
			container.appendChild(button);

			button.addEventListener('click', (e) => {
				const isMetaOpen = e.metaKey || e.ctrlKey || e.button === 1;
				if (isMetaOpen) return; 
				const defaultFlag = true;
				const go = (excludeShorts) => {
				if (!excludeShorts) return;
			
				const ids = itCollectVideoIds({ excludeShorts: true, limit: 50 });
				if (ids.length) {
					e.preventDefault();
					location.href = '/watch_videos?video_ids=' + ids.join(',');
				}
				};
			
				if (this?.storage && Object.prototype.hasOwnProperty.call(this.storage, 'exclude_shorts_in_play_all')) {
					go(!!this.storage.exclude_shorts_in_play_all);
				  } else if (chrome?.storage?.sync) {
					e.preventDefault();
					chrome.storage.sync.get({ exclude_shorts_in_play_all: defaultFlag }, (cfg) => {
					  if (cfg.exclude_shorts_in_play_all) {
						const ids = itCollectVideoIds({ excludeShorts: true, limit: 50 });
						if (ids.length) {
						  location.href = '/watch_videos?video_ids=' + ids.join(',');
						  return;
						}
					  }
					  location.href = button.href;
					});
				} else {
				go(defaultFlag);
				}
			});
  
		} else {
			document.querySelector('.it-play-all-button')?.remove();
		}
	}
};
/*------------------------------------------------------------------------------
4.6.4 DISABLE CHANNEL TAB SWIPE
------------------------------------------------------------------------------*/
ImprovedTube.channelDisableTabSwipe = function () {
	const listenerOptions = {capture: true, passive: false};
	const previousHandlers = this.channelDisableTabSwipeHandlers;

	if (previousHandlers) {
		window.removeEventListener('touchstart', previousHandlers.touchstart, true);
		window.removeEventListener('touchmove', previousHandlers.touchmove, true);
		window.removeEventListener('touchend', previousHandlers.touchend, true);
		window.removeEventListener('touchcancel', previousHandlers.touchcancel, true);
		window.removeEventListener('pointerdown', previousHandlers.pointerdown, true);
		window.removeEventListener('pointermove', previousHandlers.pointermove, true);
		window.removeEventListener('pointerup', previousHandlers.pointerup, true);
		window.removeEventListener('pointercancel', previousHandlers.pointercancel, true);
		document.removeEventListener('touchstart', previousHandlers.touchstart, true);
		document.removeEventListener('touchmove', previousHandlers.touchmove, true);
		document.removeEventListener('touchend', previousHandlers.touchend, true);
		document.removeEventListener('touchcancel', previousHandlers.touchcancel, true);
		document.removeEventListener('pointerdown', previousHandlers.pointerdown, true);
		document.removeEventListener('pointermove', previousHandlers.pointermove, true);
		document.removeEventListener('pointerup', previousHandlers.pointerup, true);
		document.removeEventListener('pointercancel', previousHandlers.pointercancel, true);
		window.removeEventListener('scroll', previousHandlers.refreshOverlay, true);
		window.removeEventListener('resize', previousHandlers.refreshOverlay, true);
		this.channelDisableTabSwipeHandlers = null;
	}

	if (!this.storage.channel_disable_tab_swipe || document.documentElement.dataset.pageType !== 'channel') {
		document.documentElement?.removeAttribute?.('it-channel-disable-tab-swipe');
		this.channelDisableTabSwipeState = null;
		return;
	}

	document.documentElement?.setAttribute?.('it-channel-disable-tab-swipe', 'true');

	const stopEvent = function (event) {
		if (event.cancelable) event.preventDefault();
		event.stopPropagation();
		if (typeof event.stopImmediatePropagation === 'function') {
			event.stopImmediatePropagation();
		}
	};

	const stopPropagationOnly = function (event) {
		if (typeof event.stopPropagation === 'function') {
			event.stopPropagation();
		}
		if (typeof event.stopImmediatePropagation === 'function') {
			event.stopImmediatePropagation();
		}
	};

	const getEventPath = function (event) {
		if (typeof event.composedPath === 'function') {
			return event.composedPath();
		}

		const path = [];
		let node = event.target;

		while (node) {
			path.push(node);
			node = node.parentNode || node.parentElement || node.host || null;
		}

		path.push(window, document);

		return path;
	};

	const pathIncludesSelector = function (path, selector) {
		return path.some((node) => node?.matches && node.matches(selector));
	};

	const pathFindSelector = function (path, selector) {
		return path.find((node) => node?.matches && node.matches(selector)) || null;
	};

	const triggerSyntheticTap = function (target) {
		if (!target || typeof target.click !== 'function') {
			return;
		}

		target.click();
	};

	const getChannelGestureSurface = function (path) {
		return pathFindSelector(
			path,
			[
				'#contents.ytd-rich-grid-renderer',
				'ytd-rich-grid-renderer',
				'ytd-rich-grid-row',
				'ytd-rich-item-renderer',
				'ytd-rich-grid-media',
				'ytd-two-column-browse-results-renderer #contents',
				'#content.ytd-browse #contents'
			].join(', ')
		);
	};

	const getChannelTabSurface = function (path) {
		return pathFindSelector(
			path,
			[
				'ytd-c4-tabbed-header-renderer',
				'ytd-channel-sub-menu-renderer',
				'tp-yt-paper-tabs',
				'yt-tab-group-shape',
				'yt-tab-group-shape .yt-tab-group-shape-wiz__tabs',
				'#tabs-content',
				'[role="tab"]',
				'[role="tablist"]'
			].join(', ')
		);
	};

	const getVideoLinkTarget = function (path) {
		return pathFindSelector(
			path,
			[
				'a#thumbnail',
				'a[href*="/watch"]',
				'a[href*="/shorts/"]',
				'ytd-thumbnail a'
			].join(', ')
		);
	};

	const getTouchContext = function (event) {
		const touch = event.touches?.[0] || event.changedTouches?.[0];
		const path = getEventPath(event);
		const gestureSurface = getChannelGestureSurface(path);
		const tabSurface = getChannelTabSurface(path);
		const videoLinkTarget = getVideoLinkTarget(path);
		const tapTarget = videoLinkTarget || pathFindSelector(path, '[role="tab"], a, button');

		if (!gestureSurface || !touch) {
			return null;
		}

		if (tabSurface) {
			return null;
		}

		if (!videoLinkTarget && pathIncludesSelector(path, 'button, input, textarea, select, [role="button"]')) {
			return null;
		}

		return {touch, gestureSurface, tabSurface, tapTarget, videoLinkTarget, path};
	};

	const getPointerContext = function (event) {
		const path = getEventPath(event);
		const gestureSurface = getChannelGestureSurface(path);
		const tabSurface = getChannelTabSurface(path);
		const videoLinkTarget = getVideoLinkTarget(path);
		const tapTarget = videoLinkTarget || pathFindSelector(path, '[role="tab"], a, button');

		if (!gestureSurface) {
			return null;
		}

		if (event.pointerType && event.pointerType !== 'touch') {
			return null;
		}

		if (tabSurface) {
			return null;
		}

		if (!videoLinkTarget && pathIncludesSelector(path, 'button, input, textarea, select, [role="button"]')) {
			return null;
		}

		return {pointer: event, gestureSurface, tabSurface, tapTarget, videoLinkTarget, path};
	};

	const resetState = function () {
		ImprovedTube.channelDisableTabSwipeState = null;
	};

	const touchstart = function (event) {
		const context = getTouchContext(event);

		if (!context) {
			resetState();
			return;
		}

		ImprovedTube.channelDisableTabSwipeState = {
			startX: context.touch.clientX,
			startY: context.touch.clientY,
			blocked: false,
			pointerId: null,
			startedInTabs: true,
			startedOnTabSurface: Boolean(context.tabSurface),
			tapTarget: context.tapTarget
		};
		if (context.tabSurface && event.cancelable) {
			event.preventDefault();
		}
		stopPropagationOnly(event);
	};

	const touchmove = function (event) {
		const state = ImprovedTube.channelDisableTabSwipeState;
		const touch = event.touches?.[0] || event.changedTouches?.[0];

		if (!state?.startedInTabs || !touch) return;

		const deltaX = touch.clientX - state.startX;
		const deltaY = Math.abs(touch.clientY - state.startY);

		if (state.startedOnTabSurface || state.blocked || (Math.abs(deltaX) > 12 && Math.abs(deltaX) > deltaY * 1.2)) {
			state.blocked = true;
			stopEvent(event);
		}
	};

	const touchend = function (event) {
		const state = ImprovedTube.channelDisableTabSwipeState;

		if (state?.blocked) {
			stopPropagationOnly(event);
			stopEvent(event);
			const deltaX = Math.abs((event.changedTouches?.[0]?.clientX ?? state.startX) - state.startX);
			const deltaY = Math.abs((event.changedTouches?.[0]?.clientY ?? state.startY) - state.startY);

			if (deltaX < 10 && deltaY < 10) {
				triggerSyntheticTap(state.tapTarget);
			}
		}

		resetState();
	};

	const touchcancel = function (event) {
		const state = ImprovedTube.channelDisableTabSwipeState;

		if (state?.blocked) {
			stopPropagationOnly(event);
			stopEvent(event);
		}

		resetState();
	};

	const pointerdown = function (event) {
		const context = getPointerContext(event);

		if (!context) {
			resetState();
			return;
		}

		ImprovedTube.channelDisableTabSwipeState = {
			startX: context.pointer.clientX,
			startY: context.pointer.clientY,
			blocked: false,
			pointerId: context.pointer.pointerId,
			startedInTabs: true,
			startedOnTabSurface: Boolean(context.tabSurface),
			tapTarget: context.tapTarget
		};
		if (context.tabSurface && event.cancelable) {
			event.preventDefault();
		}
		stopPropagationOnly(event);
	};

	const pointermove = function (event) {
		const state = ImprovedTube.channelDisableTabSwipeState;
		if (!state?.startedInTabs || state.pointerId !== event.pointerId) return;

		const deltaX = event.clientX - state.startX;
		const deltaY = Math.abs(event.clientY - state.startY);

		if (state.startedOnTabSurface || state.blocked || (Math.abs(deltaX) > 12 && Math.abs(deltaX) > deltaY * 1.2)) {
			state.blocked = true;
			stopEvent(event);
		}
	};

	const pointerup = function (event) {
		const state = ImprovedTube.channelDisableTabSwipeState;

		if (state?.blocked && state.pointerId === event.pointerId) {
			stopPropagationOnly(event);
			stopEvent(event);
			const deltaX = Math.abs(event.clientX - state.startX);
			const deltaY = Math.abs(event.clientY - state.startY);

			if (deltaX < 10 && deltaY < 10) {
				triggerSyntheticTap(state.tapTarget);
			}
		}

		resetState();
	};

	const pointercancel = function (event) {
		const state = ImprovedTube.channelDisableTabSwipeState;

		if (state?.blocked && state.pointerId === event.pointerId) {
			stopPropagationOnly(event);
			stopEvent(event);
		}

		resetState();
	};

	this.channelDisableTabSwipeHandlers = {
		touchstart,
		touchmove,
		touchend,
		touchcancel,
		pointerdown,
		pointermove,
		pointerup,
		pointercancel
	};

	document.addEventListener('touchstart', touchstart, listenerOptions);
	document.addEventListener('touchmove', touchmove, listenerOptions);
	document.addEventListener('touchend', touchend, listenerOptions);
	document.addEventListener('touchcancel', touchcancel, listenerOptions);
	document.addEventListener('pointerdown', pointerdown, listenerOptions);
	document.addEventListener('pointermove', pointermove, listenerOptions);
	document.addEventListener('pointerup', pointerup, listenerOptions);
	document.addEventListener('pointercancel', pointercancel, listenerOptions);
	window.addEventListener('touchstart', touchstart, listenerOptions);
	window.addEventListener('touchmove', touchmove, listenerOptions);
	window.addEventListener('touchend', touchend, listenerOptions);
	window.addEventListener('touchcancel', touchcancel, listenerOptions);
	window.addEventListener('pointerdown', pointerdown, listenerOptions);
	window.addEventListener('pointermove', pointermove, listenerOptions);
	window.addEventListener('pointerup', pointerup, listenerOptions);
	window.addEventListener('pointercancel', pointercancel, listenerOptions);
};
/*------------------------------------------------------------------------------
4.6.5 COMPACT THEME
------------------------------------------------------------------------------*/

var compact = compact || {}
ImprovedTube.channelCompactTheme = function () {
	compact.eventHandlerFns = compact.eventHandlerFns || []
	compact.styles = compact.styles || []
	if (this.storage.channel_compact_theme === true) {
		compact.hasApplied = true
		initialLoad();
		document.querySelector("#sections #items") ? styleWithListeners() : styleWithInterval();
	}
	else if (compact.hasApplied) { //cleanup
		try {clearInterval(compact.listener)
		} catch (err) {console.log("ERR: We couldn't clear listener. Reload page")}
		if (compact.eventHandlerFns.length) removeListeners();
		if (compact.styles.length) removeStyles()
		compact = {}
	}
	function styleWithInterval () {
		compact.listener = setInterval(() => {
			let item = document.querySelector(`#sections ytd-guide-section-renderer:nth-child(4) #items`)
			if (item) {
				clearInterval(compact.listener);
				styleWithListeners();
			}
		}, 250)
	}

	function styleWithListeners () {
		compact.parents = []
		compact.subs = []
		for (let i = 0; i <= 2; i++) {
			const parent = document.querySelector(`#sections > ytd-guide-section-renderer:nth-child(${i + 2}) > h3`);
			const sub = document.querySelector(`#sections ytd-guide-section-renderer:nth-child(${i + 2}) #items`);
			compact.parents[i] = parent;
			compact.subs[i] = sub;
			let isCompact = localStorage.getItem(`ImprovedTube-compact-${i}`) === "true";
			isCompact ? (sub.style.display = "none") : null;

			function eventHandlerFn () {
				if (!isCompact) {
					sub.style.display = "none"
					isCompact = true
				} else {
					sub.style.display = ""
					isCompact = false
				}
				localStorage.setItem(`ImprovedTube-compact-${i}`, isCompact)
			}

			compact.eventHandlerFns.push(eventHandlerFn)
			parent.addEventListener("click", eventHandlerFn)
		}
		removeStyles();
	}

	function removeListeners () { // EventListeners
		for (let i = 0; i <= 2; i++) {
			const parent = compact.parents[i]
			const sub = compact.subs[i]
			parent.removeEventListener("click", compact.eventHandlerFns[i]);
			sub.style.display = "";
		}
		compact.eventHandlerFns = []
	}

	function initialLoad () {
		for (let i = 0; i <= 2; i++) {
			let isCompact = localStorage.getItem(`ImprovedTube-compact-${i + 2}`) === "true"
			isCompact ? appendStyle(i) : (compact.styles[i] = null);
		}
	}

	function appendStyle (index) { // adds style tag
		const cssRules = `
			#sections > ytd-guide-section-renderer:nth-child(${index + 2}) > #items{
				display:none;
			};`;
		const style = document.createElement("style");
		style.appendChild(document.createTextNode(cssRules));
		compact.styles[index] = style;
		document.head.appendChild(compact.styles[index]);
	}

	function removeStyles () { // styles tags
		for (let i = 0; i <= compact.styles.length; i++) {
			if (compact.styles[i] && compact.styles[i].parentNode) {
				document.head.removeChild(compact.styles[i]);
			}
		}
		compact.styles = []
	}
}
