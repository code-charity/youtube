/*------------------------------------------------------------------------------
4.10.0 SETTINGS
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.10.1 IMPROVEDTUBE ICON
------------------------------------------------------------------------------*/

ImprovedTube.improvedtubeYoutubeIcon = function () {
	var data = localStorage.getItem('improvedtube-button-position'),
		x = 0,
		y = 0,
		option = this.storage.improvedtube_youtube_icon,
		button = this.elements.improvedtube_button;

	if (data) {
		data = JSON.parse(data);

		x = Math.min(Math.max(data.x, 0), document.body.offsetWidth - 48);
		y = Math.min(Math.max(data.y, 0), window.innerHeight - 48);
	}

	if (!button) {
		var label = document.createElement('span');

		button = document.createElement('button');

		button.className = 'it-button';

		button.addEventListener('mousedown', function (event) {
			if (ImprovedTube.storage.improvedtube_youtube_icon === 'draggable') {
				var x2 = event.layerX,
					y2 = event.layerY;

				function mousemove(event) {
					if (button.className.indexOf('dragging') === -1) {
						button.classList.add('it-button--dragging');
					}

					x = Math.min(Math.max(event.clientX - x2, 0), document.body.offsetWidth - 48);
					y = Math.min(Math.max(event.clientY - y2, 0), window.innerHeight - 48);

					button.style.left = x + 'px';
					button.style.top = y + 'px';
				}

				function mouseup() {
					localStorage.setItem('improvedtube-button-position', JSON.stringify({
						x,
						y
					}));

					window.removeEventListener('mousemove', mousemove);
					window.removeEventListener('mouseup', mouseup);
				}

				function click() {
					button.classList.remove('it-button--dragging');

					window.removeEventListener('click', click);
				}

				window.addEventListener('mousemove', mousemove);
				window.addEventListener('mouseup', mouseup);
				window.addEventListener('click', click);

				event.preventDefault();
			}
		});

		button.addEventListener('click', function () {
			if (this.classList.contains('it-button--dragging') === false) {
				var rect = this.getBoundingClientRect(),
					left = rect.x,
					top = rect.y,
					scrim = document.createElement('div'),
					iframe = document.createElement('iframe');

				scrim.className = 'it-button__scrim';
				scrim.addEventListener('click', function () {
					scrim.remove();
					iframe.remove();
				});

				iframe.className = 'it-button__iframe';

				if (document.body.offsetWidth - left < 308) {
					left = document.body.offsetWidth - 308;
				}

				if (window.innerHeight - top < Math.min(500, window.innerHeight) + 8) {
					top = window.innerHeight - Math.min(500, window.innerHeight) - 8;
				}

				iframe.style.left = left + 'px';
				iframe.style.top = top + 'px';

				document.body.appendChild(scrim);
				document.body.appendChild(iframe);

				ImprovedTube.messages.send({
					requestOptionsUrl: true
				});
			}
		});

		label.textContent = 'ImprovedTube';

		button.appendChild(label);

		this.elements.improvedtube_button = button;
	}

	button.className = 'it-button';
	button.style.left = '';
	button.style.top = '';

	if (option === 'header_left') {
		if (this.storage.header_position === 'normal' && this.elements.masthead.start) {
			this.elements.masthead.start.appendChild(button);
		}
		else if (this.elements.app_drawer.start) {
			this.elements.app_drawer.start.appendChild(button);
		}
	} else if (option === 'header_right') {
		if (this.elements.masthead.end) {
			this.elements.masthead.end.appendChild(button);
		}
	} else if (option === 'below_player') {
		if (this.elements.video_title) {
			button.classList.add('it-button--below-player');

			this.elements.video_title.appendChild(button);
		}
	} else if (option === 'sidebar') {
		if (this.elements.sidebar_section) {
			this.elements.sidebar_section.appendChild(button);
		}
	} else if (option === 'draggable') {
		if (document.body) {
			button.style.left = x + 'px';
			button.style.top = y + 'px';

			button.classList.add('it-button--draggable');

			document.body.appendChild(button);
		}
	} else if (button) {
		button.remove();
	}
};

/*------------------------------------------------------------------------------
4.10.2 PLAYER BUTTONS
------------------------------------------------------------------------------*/

ImprovedTube.improvedtubeYoutubeButtonsUnderPlayer = function () {
	if (window.self !== window.top) {
		return false;
	}

	var section = document.querySelector('#flex.ytd-video-primary-info-renderer');
	if (this.storage.description === "normal" || this.storage.description === "expanded")
	   {var section = document.querySelector('#subscribe-button');}

	if (section && !document.querySelector('.improvedtube-player-button')) {


		if (this.storage.below_player_loop !== false) {
			var button = document.createElement('button'),
				svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
				path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

			button.className = 'improvedtube-player-button';
			button.dataset.tooltip = 'Loop';

			svg.style.opacity = '.5';

			svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
			path.setAttributeNS(null, 'd', 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z');

			button.onclick = function () {
				var video = ImprovedTube.elements.video,
					svg = this.children[0];

				if (video.hasAttribute('loop')) {
					video.removeAttribute('loop');

					svg.style.opacity = '.5';
				} else if (!/ad-showing/.test(ImprovedTube.elements.player.className)) {
					video.setAttribute('loop', '');

					svg.style.opacity = '1';
				}
			};

			svg.appendChild(path);
			button.appendChild(svg);

			section.insertAdjacentElement('afterend', button)
		}
				if (this.storage.below_player_pip !== false) {
			var button = document.createElement('button'),
				svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
				path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

			button.className = 'improvedtube-player-button';
			button.dataset.tooltip = 'Picture in picture';

			svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
			path.setAttributeNS(null, 'd', 'M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z');

			button.onclick = function () {
				var video = document.querySelector('#movie_player video');

				if (video) {
					video.requestPictureInPicture();
				}
			};

			svg.appendChild(path);
			button.appendChild(svg);

			section.insertAdjacentElement('afterend', button)
		}
		
				if (this.storage.below_player_screenshot !== false) {
			var button = document.createElement('button'),
				svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
				path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

			button.className = 'improvedtube-player-button';
			button.dataset.tooltip = 'Screenshot';

			svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
			path.setAttributeNS(null, 'd', 'M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z');

			button.onclick = ImprovedTube.screenshot;

			svg.appendChild(path);
			button.appendChild(svg);

			section.insertAdjacentElement('afterend', button)
		}
	}
};


/*-----------------------------------------------------------------------------
4.10.3 DELETE YOUTUBE COOKIES
-----------------------------------------------------------------------------*/

ImprovedTube.deleteYoutubeCookies = function () {
	var cookies = document.cookie.split(';');

	for (var i = 0, l = cookies.length; i < l; i++) {
		var cookie = cookies[i],
			eqPos = cookie.indexOf('='),
			name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

		document.cookie = name + '=; domain=.youtube.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
	}

	setTimeout(function () {
		location.reload();
	}, 100);
};


/*-----------------------------------------------------------------------------
4.10.4 YOUTUBE LANGUAGE
-----------------------------------------------------------------------------*/

ImprovedTube.youtubeLanguage = function () {
	var value = this.storage.youtube_language;

	if (this.isset(value)) {
		var pref = this.getCookieValueByName('PREF');

		if (value !== 'default') {
			var hl = this.getParam(pref, 'hl');

			if (hl) {
				this.setCookie('PREF', pref.replace('hl=' + hl, 'hl=' + value));
			} else {
				this.setCookie('PREF', pref + '&hl=' + value);
			}
		}
	}
};