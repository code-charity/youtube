/*--------------------------------------------------------------
>>> GENERAL:
----------------------------------------------------------------
# YouTube home page
# Fold subscriptions' sections (collapsed accordion)
# Don't let a second video auto-start at once
# Add "Scroll to top"
# Confirmation before closing
# Default content country
# Add "Popup window" buttons
# Add "Watch Later" buttons
# Font
# Mark watched videos
# Track watched videos
# Thumbnails quality
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# YOUTUBE HOME PAGE
--------------------------------------------------------------*/

extension.features.youtubeHomePage = function (anything) {
	if (anything instanceof Event) {
		var event = anything;

		if (event.target) {
			var target = event.target;

			while (target.parentNode) {
				if (target.nodeName === 'A' && target.id === 'logo') {
					var option = extension.storage.get('youtube_home_page');

					if (option !== 'search') {
						event.preventDefault();
						event.stopPropagation();

						window.open(option, '_self');

						return false;
					}
				} else {
					target = target.parentNode;
				}
			}
		}
	} else if (anything === 'init') {
		extension.events.on('init', function (resolve) {
			if (/(www|m)\.youtube\.com\/?(\?|\#|$)/.test(location.href)) {
				chrome.storage.local.get('youtube_home_page', function (items) {
					var option = items.youtube_home_page;

					if (
						option === '/feed/trending' ||
						option === '/feed/subscriptions' ||
						option === '/feed/history' ||
						option === '/playlist?list=WL' ||
						option === '/playlist?list=LL' ||
						option === '/feed/library'
					) {
						location.replace(option);
					} else {
						resolve();
					}
				});
			} else {
				resolve();
			}
		}, {
			async: true,
			prepend: true
		});
	} else {
		var option = extension.storage.get('youtube_home_page');

		window.removeEventListener('click', this.youtubeHomePage);

		if (
			option === '/feed/trending' ||
			option === '/feed/subscriptions' ||
			option === '/feed/history' ||
			option === '/playlist?list=WL' ||
			option === '/playlist?list=LL' ||
			option === '/feed/library'
		) {
			window.addEventListener('click', this.youtubeHomePage, true);
		}
	}
};

/*--------------------------------------------------------------
# COLLAPSE OF SUBSCRIPTION SECTIONS
--------------------------------------------------------------*/

/**
 * Finds entries belonging to subscriptions in the sidebar.
 * @returns {Element[] | Error}
 */
function subscriptionEntries() {
	for (const section of document.querySelectorAll("ytd-guide-section-renderer")) {
		const headerLink = section.querySelector('a[href="/feed/channels"]');
		if (headerLink) { // Exists only in the subscriptions section
			const entries = Array.from(
				section.querySelectorAll("ytd-guide-entry-renderer")
			).filter(entry => entry.id !== "header-entry");
			return entries
		}
	};
	return new Error("Subscriptions section not found")
}

extension.features.collapseOfSubscriptionSections = function (event) {
	if (typeof event === "boolean") {
		subs = subscriptionEntries()
		if (subs instanceof Error) {
			console.error(subs.message)
			return
		}
		for (const sub of subs) {
			sub.style.display = event ? "none" : "block";
		}
		return
	}

	if (event instanceof Event) {
		var section,
			content;

		if (event.target) {
			var target = event.target;

			while (target.parentNode) {
				if (target.nodeName === 'YTD-ITEM-SECTION-RENDERER') {
					section = target;
				} else if (target.className && target.className.indexOf && target.className.indexOf('grid-subheader') !== -1) {
					content = target.nextElementSibling;
				}

				target = target.parentNode;
			}
		}

		if (section && content) {
			event.preventDefault();
			event.stopPropagation();

			if (section.className.indexOf('it-section-collapsed') === -1) {
				content.style.height = content.offsetHeight + 'px';
				content.style.transition = 'height 200ms';
			}

			setTimeout(function () {
				section.classList.toggle('it-section-collapsed');
			});

			return false;
		}
	} else {
		window.removeEventListener('click', this.collapseOfSubscriptionSections);

		if (
			extension.storage.get('collapse_of_subscription_sections') === true &&
			location.href.indexOf('feed/subscriptions') !== -1
		) {
			window.addEventListener('click', this.collapseOfSubscriptionSections, true);
		}
	}
};

/*--------------------------------------------------------------
# ONLY ONE PLAYER INSTANCE PLAYING
--------------------------------------------------------------*/

extension.features.onlyOnePlayerInstancePlaying = function () {
	if (extension.storage.get('only_one_player_instance_playing') === true) {
		var videos = document.querySelectorAll('video');

		for (var i = 0, l = videos.length; i < l; i++) {
			videos[i].pause();
		}
	}
};
/*--------------------------------------------------------------
# ADD "SCROLL TO TOP"
--------------------------------------------------------------*/
extension.features.addScrollToTop = function (event) {
	if (event instanceof Event) {
		if (window.scrollY > window.innerHeight / 2) {
			document.documentElement.setAttribute('it-scroll-to-top', 'true');
		} else {
			document.documentElement.removeAttribute('it-scroll-to-top');
		}
	} else {
		if (extension.storage.get('add_scroll_to_top') === true) {
			this.addScrollToTop.button = document.createElement('div');
			this.addScrollToTop.button.id = 'it-scroll-to-top';
			this.addScrollToTop.button.className = 'satus-div';
			var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.setAttribute('viewBox', '0 0 24 24');
			var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', 'M13 19V7.8l4.9 5c.4.3 1 .3 1.4 0 .4-.5.4-1.1 0-1.5l-6.6-6.6a1 1 0 0 0-1.4 0l-6.6 6.6a1 1 0 1 0 1.4 1.4L11 7.8V19c0 .6.5 1 1 1s1-.5 1-1z');
			svg.appendChild(path);
			this.addScrollToTop.button.appendChild(svg);
			window.addEventListener('scroll', function () { document.body.appendChild(extension.features.addScrollToTop.button); });
			this.addScrollToTop.button.addEventListener('click', function () {
				window.scrollTo(0, 0);
				document.getElementById('it-scroll-to-top')?.remove();
			});
		}
		if (extension.storage.get('add_scroll_to_top') === true) {
			window.addEventListener('scroll', extension.features.addScrollToTop);
		} else if (this.addScrollToTop.button) {
			window.removeEventListener('scroll', extension.features.addScrollToTop);
			this.addScrollToTop.button.remove();
		}
	}
};
/*--------------------------------------------------------------
# CONFIRMATION BEFORE CLOSING
--------------------------------------------------------------*/

extension.features.confirmationBeforeClosing = function () {
	window.onbeforeunload = function () {
		if (extension.storage.get('confirmation_before_closing') === true) {
			return 'You have attempted to leave this page. Are you sure?';
		}
	};
};

/*--------------------------------------------------------------
# DEFAULT CONTENT COUNTRY
--------------------------------------------------------------*/

extension.features.defaultContentCountry = function (changed) {
	var value = extension.storage.get('default_content_country');

	if (value) {
		if (value !== 'default') {
			var date = new Date();

			date.setTime(date.getTime() + 3.154e+10);

			document.cookie = 's_gl=' + value + '; path=/; domain=.youtube.com; expires=' + date.toGMTString();
		} else {
			document.cookie = 's_gl=0; path=/; domain=.youtube.com; expires=Thu, 01 Jan 1970 00:00:01 GMT';
		}
	}

	if (changed) {
		location.reload();
	}
};

/*--------------------------------------------------------------
# ADD "POPUP WINDOW" BUTTONS
--------------------------------------------------------------*/
extension.features.popupWindowButtons = function (event) {
	if (event instanceof Event) {
		if (event.type === 'mouseover') {
			if (event.target) {
				var target = event.target,
					detected = false;
				while (detected === false && target.parentNode) {
					if (target.className && typeof target.className === 'string' && ((
						target.id === 'thumbnail' && target.className.indexOf('ytd-thumbnail') !== -1 || target.className.indexOf('thumb-link') !== -1)
						|| (target.className.indexOf('video-preview') !== -1 || target.className.indexOf('ytp-inline-preview-scrim') !== -1 || target.className.indexOf('ytp-inline-preview-ui') !== -1)
					)) {
						if (!target.itPopupWindowButton) {
							target.itPopupWindowButton = document.createElement('button');
							target.itPopupWindowButton.className = 'it-popup-window';

							var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
							svg.setAttribute('viewBox', '0 0 24 24');
							var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
							path.setAttribute('d', 'M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z');
							svg.appendChild(path);
							target.itPopupWindowButton.appendChild(svg);
							target.appendChild(target.itPopupWindowButton);

							target.itPopupWindowButton.addEventListener('click', function (event) {
								event.preventDefault();
								event.stopPropagation();
							var videoLink = extension.features.popupWindowButtons.findVideoLink(this.parentElement);
							if (!videoLink) return;
							try { this.dataset.id = videoLink.href.match(/(?:[?&]v=|embed\/|shorts\/)([^&?]{11})/)[1] } catch (error) { console.log(error); return; };
							ytPlayer = document.querySelector("#movie_player");
							if (ytPlayer) { width = ytPlayer.offsetWidth * 0.65; height = ytPlayer.offsetHeight * 0.65 } else { width = innerWidth * 0.4; height = innerHeight * 0.4; }
							if (!ytPlayer) {
								let shorts = /short/.test(videoLink.href);
								let vertical = width / height < 1;
								if (!vertical && shorts) { width = height * 0.6 }
								if (vertical && !shorts) { height = width * 0.6 }
							}

							window.open('https://www.youtube.com/embed/' + this.dataset.id + '?autoplay=' + (extension.storage.get('player_autoplay_disable') ? '0' : '1'), '_blank', `directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=${width / 3},height=${height / 3}`);
							chrome.runtime.sendMessage({
								action: 'fixPopup',
								width: width,
								height: height,
								title: (videoLink.closest('ytd-rich-grid-media, ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer')?.querySelector('#video-title')?.textContent || videoLink.getAttribute('title') || document.title) + " - Youtube"
							});
						});
					}
					detected = true;
				}
				target = target.parentNode;
				}
			}
		}
	} else {
		if (extension.storage.get('popup_window_buttons') === true) {
			window.addEventListener('mouseover', this.popupWindowButtons, true);
		} else {
			window.removeEventListener('mouseover', this.popupWindowButtons, true);
		}
	}
};

extension.features.popupWindowButtons.findVideoLink = function (element) {
	if (!element) return null;

	if (element.href && /(?:[?&]v=|embed\/|shorts\/)([^&?]{11})/.test(element.href)) {
		return element;
	}

	return element.closest('a[href*="/watch"], a[href*="/shorts/"]')
		|| element.querySelector('a#thumbnail[href], a[href*="/watch"], a[href*="/shorts/"]')
		|| element.closest('ytd-rich-grid-media, ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer')?.querySelector('a#thumbnail[href], a[href*="/watch"], a[href*="/shorts/"]')
		|| null;
};
/*--------------------------------------------------------------
# ADD "WATCH LATER" BUTTONS
--------------------------------------------------------------*/
extension.features.watchLaterButtons = function (event) {
	function getVideoId(url) {
		if (!url) {
			return null;
		}

		var watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/),
			shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);

		return watchMatch ? watchMatch[1] : shortsMatch ? shortsMatch[1] : null;
	}

	function findThumbnail(target) {
		while (target && target.parentNode) {
			if (
				target.nodeName === 'A' &&
				target.href &&
				(
					target.id === 'thumbnail' ||
					(target.className && typeof target.className === 'string' && target.className.indexOf('thumb-link') !== -1)
				)
			) {
				return target;
			}

			target = target.parentNode;
		}
	}

	function findNativeWatchLaterButton(thumbnail) {
		var container = thumbnail.closest('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-playlist-video-renderer, yt-lockup-view-model') || thumbnail,
			button = container.querySelector('button[aria-label*="Watch later" i], button[title*="Watch later" i]');

		if (button) {
			return button;
		}

		return thumbnail.querySelector('ytd-thumbnail-overlay-toggle-button-renderer button');
	}

	function getYtConfigValue(key) {
		var pattern = new RegExp('"' + key + '":"([^"]+)"'),
			scripts = document.scripts;

		for (var i = 0, l = scripts.length; i < l; i++) {
			var match = scripts[i].textContent.match(pattern);

			if (match) {
				return match[1];
			}
		}
	}

	function getYtConfigObject(key) {
		var pattern = new RegExp('"' + key + '":(\\{.*?\\}),"' + key.replace(/_CONTEXT$/, '') + '_'),
			scripts = document.scripts;

		for (var i = 0, l = scripts.length; i < l; i++) {
				var match = scripts[i].textContent.match(pattern);

				if (match) {
					try {
						return JSON.parse(match[1]);
					} catch (error) {
						console.warn('[ImprovedTube] Unable to parse YouTube config object:', key, error);
					}
				}
		}
	}

	function addWithInnertube(videoId, button) {
		var apiKey = getYtConfigValue('INNERTUBE_API_KEY'),
			context = getYtConfigObject('INNERTUBE_CONTEXT'),
			clientVersion = getYtConfigValue('INNERTUBE_CLIENT_VERSION');

		if (!context && clientVersion) {
			context = {
				client: {
					clientName: 'WEB',
					clientVersion: clientVersion
				}
			};
		}

		if (!apiKey || !context) {
			button.dataset.state = 'unavailable';
			return;
		}

		button.dataset.state = 'loading';

		fetch('/youtubei/v1/browse/edit_playlist?key=' + apiKey, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				context: context,
				playlistId: 'WL',
				actions: [{
					action: 'ACTION_ADD_VIDEO',
					addedVideoId: videoId
				}]
			})
		}).then(function (response) {
			button.dataset.state = response.ok ? 'added' : 'unavailable';
		}).catch(function () {
			button.dataset.state = 'unavailable';
		});
	}

	function addWatchLaterButton(thumbnail) {
		var videoId = thumbnail ? getVideoId(thumbnail.href) : null;

		if (thumbnail && thumbnail.itWatchLaterButton && !thumbnail.contains(thumbnail.itWatchLaterButton)) {
			thumbnail.itWatchLaterButton = null;
		}

		if (thumbnail && videoId && !thumbnail.itWatchLaterButton) {
			var button = document.createElement('button'),
				svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
				path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

			button.type = 'button';
			button.className = 'it-watch-later-button';
			button.dataset.id = videoId;
			button.title = 'Watch later';
			button.setAttribute('aria-label', 'Add to Watch Later');

			svg.setAttribute('viewBox', '0 0 24 24');
			path.setAttribute('d', 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18.2A8.2 8.2 0 1 1 20.2 12 8.2 8.2 0 0 1 12 20.2Zm.7-13.2h-1.8v5.8l5 3 .9-1.5-4.1-2.4Z');
			svg.appendChild(path);
			button.appendChild(svg);
			thumbnail.appendChild(button);
			thumbnail.itWatchLaterButton = button;

			button.addEventListener('click', function (clickEvent) {
				var nativeButton = findNativeWatchLaterButton(this.parentElement),
					id = this.dataset.id;

				clickEvent.preventDefault();
				clickEvent.stopPropagation();
				clickEvent.stopImmediatePropagation();

				if (nativeButton && nativeButton !== this) {
					nativeButton.click();
					this.dataset.state = 'added';
				} else {
					addWithInnertube(id, this);
				}
			});
		}
	}

	function addWatchLaterButtons(root) {
		var thumbnails = (root || document).querySelectorAll ? (root || document).querySelectorAll('a#thumbnail, a.thumb-link, a[href*="/watch"], a[href*="/shorts/"]') : [];

		for (var i = 0, l = thumbnails.length; i < l; i++) {
			addWatchLaterButton(thumbnails[i]);
		}
	}

	function removeWatchLaterButtons() {
		var buttons = document.querySelectorAll('.it-watch-later-button');

		for (var i = 0, l = buttons.length; i < l; i++) {
			if (buttons[i].parentElement) {
				buttons[i].parentElement.itWatchLaterButton = null;
			}

			buttons[i].remove();
		}
	}

	if (event instanceof Event) {
		if (event.type === 'mouseover' && event.target) {
			addWatchLaterButton(findThumbnail(event.target));
		}
	} else {
		var option = extension.storage.get('watch_later_buttons');

		window.removeEventListener('mouseover', this.watchLaterButtons, true);

		if (this.watchLaterButtons.observer) {
			this.watchLaterButtons.observer.disconnect();
			this.watchLaterButtons.observer = null;
		}

		if (!option || option === 'disabled') {
			removeWatchLaterButtons();
		} else if (option === 'hover' || option === 'always') {
			window.addEventListener('mouseover', this.watchLaterButtons, true);

			if (option === 'always') {
				if (document.body) {
					addWatchLaterButtons(document);
					this.watchLaterButtons.observer = new MutationObserver(function (mutationList) {
						for (var i = 0, l = mutationList.length; i < l; i++) {
							for (var j = 0, m = mutationList[i].addedNodes.length; j < m; j++) {
								addWatchLaterButtons(mutationList[i].addedNodes[j]);
							}
						}
					});
					this.watchLaterButtons.observer.observe(document.body, {
						childList: true,
						subtree: true
					});
				} else {
					setTimeout(function () {
						extension.features.watchLaterButtons();
					}, 100);
				}
			}
		}
	}
};
/*--------------------------------------------------------------
# FONT
--------------------------------------------------------------*/

extension.features.font = function (changed) {
	var option = extension.storage.get('font');

	if (option && option !== 'Default') {
		var link = this.font.link || document.createElement('link'),
			style = this.font.style || document.createElement('style');

		link.rel = 'stylesheet';
		link.href = '//fonts.googleapis.com/css2?family=' + option;

		style.textContent = '*{font-family:"' + option.replace(/\+/g, ' ') + '" !important}';

		document.head.appendChild(link);
		document.head.appendChild(style);

		this.font.link = link;
		this.font.style = style;
	} else if (changed) {
		var link = this.font.link,
			style = this.font.style;

		if (link) {
			link.remove();
		}

		if (style) {
			style.remove();
		}
	}
};

/*--------------------------------------------------------------
# MARK WATCHED VIDEOS
--------------------------------------------------------------*/

extension.features.markWatchedVideos = function (anything) {
	if (anything instanceof Event) {
		var event = anything;

		if (event.type === 'mouseover') {
			if (event.target) {
				var target = event.target,
					detected = false;

				while (detected === false && target.parentNode) {
					if (
						target.className && target.className.indexOf &&
						(
							target.id === 'thumbnail' && target.className.indexOf('ytd-thumbnail') !== -1 ||
							target.className.indexOf('thumb-link') !== -1
						)
					) {
						if (!target.itMarkWatchedVideosButton) {
							target.itMarkWatchedVideosButton = document.createElement('button');
							target.itMarkWatchedVideosButton.className = 'it-mark-watched-videos';
							target.itMarkWatchedVideosButton.dataset.id = extension.functions.getUrlParameter(target.href, 'v');
							var id = target.itMarkWatchedVideosButton.dataset.id;
							var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 24 24');
							var pathData = 'M12 15.15q1.525 0 2.588-1.063 1.062-1.062 1.062-2.587 0-1.525-1.062-2.588Q13.525 7.85 12 7.85q-1.525 0-2.587 1.062Q8.35 9.975 8.35 11.5q0 1.525 1.063 2.587Q10.475 15.15 12 15.15Zm0-.95q-1.125 0-1.912-.788Q9.3 12.625 9.3 11.5t.788-1.913Q10.875 8.8 12 8.8t1.913.787q.787.788.787 1.913t-.787 1.912q-.788.788-1.913.788Zm0 3.8q-3.1 0-5.688-1.613Q3.725 14.775 2.325 12q-.05-.1-.075-.225-.025-.125-.025-.275 0-.15.025-.275.025-.125.075-.225 1.4-2.775 3.987-4.388Q8.9 5 12 5q3.1 0 5.688 1.612Q20.275 8.225 21.675 11q.05.1.075.225.025.125.025.275 0 .15-.025.275-.025.125-.075.225-1.4 2.775-3.987 4.387Q15.1 18 12 18Z';
							var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
							path.setAttribute('d', pathData + 'm0-6.5Zm0 5.5q2.825 0 5.188-1.488Q19.55 14.025 20.8 11.5q-1.25-2.525-3.612-4.013Q14.825 6 12 6 9.175 6 6.812 7.487 4.45 8.975 3.2 11.5q1.25 2.525 3.612 4.012Q9.175 17 12 17Z');
							svg.appendChild(path);
							var svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg2.setAttribute('viewBox', '0 0 24 24');
							var extraPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
							extraPath.setAttribute('d', pathData);
							svg2.appendChild(extraPath);
							target.itMarkWatchedVideosButton.appendChild(svg);
							target.itMarkWatchedVideosButton.appendChild(svg2);
							if (extension.storage.get('watched') && extension.storage.get('watched')[id]) {
								target.itMarkWatchedVideosButton.setAttribute('watched', '')
							};
							target.appendChild(target.itMarkWatchedVideosButton);
							target.itMarkWatchedVideosButton.addEventListener('click', function (event) {
								var id = this.dataset.id,
									value = this.toggleAttribute('watched');

								event.preventDefault();
								event.stopPropagation();

							if (!extension.storage.watched) {
									extension.storage.watched = {};
								}

								if (value) {
									extension.storage.get('watched')[id] = {
										title: ''
									};
								} else {
									delete extension.storage.get('watched')[id];
								}
							});
						}
					}
				}
		}
	}
};
