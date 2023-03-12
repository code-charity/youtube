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

extension.features.collapseOfSubscriptionSections = function (event) {
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
			this.addScrollToTop.button = satus.render({
				component: 'div',
				id: 'it-scroll-to-top',
				on: {
					click: function () {
						window.scrollTo(0, 0);
					}
				},

				svg: {
					component: 'svg',
					attr: {
						'viewBox': '0 0 24 24'
					},

					path: {
						component: 'path',
						attr: {
							'd': 'M13 19V7.8l4.9 5c.4.3 1 .3 1.4 0 .4-.5.4-1.1 0-1.5l-6.6-6.6a1 1 0 0 0-1.4 0l-6.6 6.6a1 1 0 1 0 1.4 1.4L11 7.8V19c0 .6.5 1 1 1s1-.5 1-1z'
						}
					}
				}
			});

			window.addEventListener('scroll', this.addScrollToTop);
		} else if (this.addScrollToTop.button) {
			window.removeEventListener('scroll', this.addScrollToTop);

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

	if (satus.isset(value)) {
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
					if (
						target.id === 'thumbnail' && target.className.indexOf('ytd-thumbnail') !== -1 ||
						target.className.indexOf('thumb-link') !== -1
					) {
						if (!target.itPopupWindowButton) {
							target.itPopupWindowButton = satus.render({
								component: 'button',
								class: 'it-popup-window',
								data: {
									id: extension.functions.getUrlParameter(target.href, 'v')
								},
								on: {
									click: function (event) {
										event.preventDefault();
										event.stopPropagation();

										window.open('https://www.youtube.com/embed/' + this.dataset.id + '?autoplay=' + (extension.storage.get('player_autoplay') == false ? '0' : '1'), '_blank', 'directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no');
									}
								},

								svg: {
									component: 'svg',
									attr: {
										'viewBox': '0 0 24 24'
									},

									path: {
										component: 'path',
										attr: {
											'd': 'M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z'
										}
									}
								}
							}, target);
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


/*--------------------------------------------------------------
# FONT
--------------------------------------------------------------*/

extension.features.font = function (changed) {
	var option = extension.storage.get('font');

	if (satus.isString(option) && option !== 'Default') {
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
							target.itMarkWatchedVideosButton = satus.render({
								component: 'button',
								class: 'it-mark-watched-videos',
								data: {
									id: extension.functions.getUrlParameter(target.href, 'v')
								},
								on: {
									click: function (event) {
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

										chrome.storage.local.set({
											watched: extension.storage.get('watched')
										});
									},
									render: function () {
										if (extension.storage.get('watched') && extension.storage.get('watched')[this.dataset.id]) {
											this.setAttribute('watched', '');
										}
									}
								},

								svg: {
									component: 'svg',
									attr: {
										'viewBox': '0 0 24 24'
									},

									path: {
										component: 'path',
										attr: {
											'd': 'M12 15.15q1.525 0 2.588-1.063 1.062-1.062 1.062-2.587 0-1.525-1.062-2.588Q13.525 7.85 12 7.85q-1.525 0-2.587 1.062Q8.35 9.975 8.35 11.5q0 1.525 1.063 2.587Q10.475 15.15 12 15.15Zm0-.95q-1.125 0-1.912-.788Q9.3 12.625 9.3 11.5t.788-1.913Q10.875 8.8 12 8.8t1.913.787q.787.788.787 1.913t-.787 1.912q-.788.788-1.913.788Zm0 3.8q-3.1 0-5.688-1.613Q3.725 14.775 2.325 12q-.05-.1-.075-.225-.025-.125-.025-.275 0-.15.025-.275.025-.125.075-.225 1.4-2.775 3.987-4.388Q8.9 5 12 5q3.1 0 5.688 1.612Q20.275 8.225 21.675 11q.05.1.075.225.025.125.025.275 0 .15-.025.275-.025.125-.075.225-1.4 2.775-3.987 4.387Q15.1 18 12 18Zm0-6.5Zm0 5.5q2.825 0 5.188-1.488Q19.55 14.025 20.8 11.5q-1.25-2.525-3.612-4.013Q14.825 6 12 6 9.175 6 6.812 7.487 4.45 8.975 3.2 11.5q1.25 2.525 3.612 4.012Q9.175 17 12 17Z'
										}
									}
								},
								svg2: {
									component: 'svg',
									attr: {
										'viewBox': '0 0 24 24'
									},

									path: {
										component: 'path',
										attr: {
											'd': 'M12 15.15q1.525 0 2.588-1.063 1.062-1.062 1.062-2.587 0-1.525-1.062-2.588Q13.525 7.85 12 7.85q-1.525 0-2.587 1.062Q8.35 9.975 8.35 11.5q0 1.525 1.063 2.587Q10.475 15.15 12 15.15Zm0-.95q-1.125 0-1.912-.788Q9.3 12.625 9.3 11.5t.788-1.913Q10.875 8.8 12 8.8t1.913.787q.787.788.787 1.913t-.787 1.912q-.788.788-1.913.788Zm0 3.8q-3.1 0-5.688-1.613Q3.725 14.775 2.325 12q-.05-.1-.075-.225-.025-.125-.025-.275 0-.15.025-.275.025-.125.075-.225 1.4-2.775 3.987-4.388Q8.9 5 12 5q3.1 0 5.688 1.612Q20.275 8.225 21.675 11q.05.1.075.225.025.125.025.275 0 .15-.025.275-.025.125-.075.225-1.4 2.775-3.987 4.387Q15.1 18 12 18Z'
										}
									}
								}
							}, target);
						} else {
							var button = target.itMarkWatchedVideosButton;

							if (extension.storage.get('watched') && extension.storage.get('watched')[button.dataset.id]) {
								button.setAttribute('watched', '');
							} else {
								button.removeAttribute('watched');
							}
						}

						detected = true;
					}

					target = target.parentNode;
				}
			}
		}
	} else if (anything === true) {
		var buttons = document.querySelectorAll('.it-mark-watched-videos');

		for (var i = 0, l = buttons.length; i < l; i++) {
			var button = buttons[i];

			button.remove();
		}
	} else {
		window.removeEventListener('mouseover', this.markWatchedVideos, true);

		if (extension.storage.get('mark_watched_videos') === true) {
			window.addEventListener('mouseover', this.markWatchedVideos, true);
		}
	}
};


/*--------------------------------------------------------------
# TRACK WATCHED VIDEOS
--------------------------------------------------------------*/

extension.features.trackWatchedVideos = function () {
	if (extension.storage.get('track_watched_videos') === true && document.documentElement.getAttribute('it-pathname').indexOf('/watch') === 0) {
		var id = extension.functions.getUrlParameter(location.href, 'v');

		if (!extension.storage.watched) {
			extension.storage.watched = {};
		}

		extension.storage.get('watched')[id] = {
			title: document.title
		};

		chrome.storage.local.set({
			watched: extension.storage.get('watched')
		});
	}
};


/*--------------------------------------------------------------
# THUMBNAILS QUALITY
--------------------------------------------------------------*/

extension.features.thumbnailsQuality = function (anything) {
	var option = extension.storage.get('thumbnails_quality');

	function handler(thumbnail) {
		if (!thumbnail.dataset.defaultSrc && extension.features.thumbnailsQuality.regex.test(thumbnail.src)) {
			thumbnail.dataset.defaultSrc = thumbnail.src;

			thumbnail.onload = function () {
				if (this.naturalHeight <= 90) {
					this.src = this.dataset.defaultSrc;
				}
			};

			thumbnail.onerror = function () {
				this.src = thumbnail.dataset.defaultSrc;
			};

			thumbnail.src = thumbnail.src.replace(extension.features.thumbnailsQuality.regex, extension.storage.get('thumbnails_quality') + '.jpg');
		}
	}

	if (['default', 'mqdefault', 'hqdefault', 'sddefault', 'maxresdefault'].includes(option) === true) {
		var thumbnails = document.querySelectorAll('img');

		this.thumbnailsQuality.regex = /(default\.jpg|mqdefault\.jpg|hqdefault\.jpg|hq720\.jpg|sddefault\.jpg|maxresdefault\.jpg)+/;

		for (var i = 0, l = thumbnails.length; i < l; i++) {
			handler(thumbnails[i]);
		}

		if (!this.thumbnailsQuality.observer) {
			this.thumbnailsQuality.observer = new MutationObserver(function (mutationList) {
				for (var i = 0, l = mutationList.length; i < l; i++) {
					var mutation = mutationList[i];

					if (mutation.type === 'attributes') {
						handler(mutation.target);
					}
				}
			});

			this.thumbnailsQuality.observer.observe(document.documentElement, {
				attributeFilter: ['src'],
				attributes: true,
				childList: true,
				subtree: true
			});
		}
	} else if (anything === true) {
		var thumbnails = document.querySelectorAll('img[data-default-src]');

		for (var i = 0, l = thumbnails.length; i < l; i++) {
			var thumbnail = thumbnails[i];

			thumbnail.src = thumbnail.dataset.defaultSrc;

			thumbnail.removeAttribute('data-default-src');
		}

		if (this.thumbnailsQuality.observer) {
			this.thumbnailsQuality.observer.disconnect();
		}
	}
};

/*--------------------------------------------------------------
# SHOW HEADER ON "SEARCH"
--------------------------------------------------------------*/

extension.features.showHeaderOnSearch = function (event) {
	var search = document.querySelector('input#search');
	if (search) {

		var headerPos = document.documentElement.getAttribute('it-header-position');
		document.documentElement.setAttribute('it-header-position-original', headerPos);
		if (headerPos !== 'normal' && headerPos !== 'static') {

			search.addEventListener('focusin', function (e) {
				document.documentElement.setAttribute('it-header-position', 'normal');
			});

			search.addEventListener('focusout', function (e) {
				var origHeaderPos = document.documentElement.getAttribute('it-header-position-original');
				origHeaderPos === 'null' ? 'normal' : origHeaderPos;
				document.documentElement.setAttribute('it-header-position', origHeaderPos);
			});

		}
	}
};
