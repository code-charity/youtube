/*------------------------------------------------------------------------------
4.8.0 BLACKLIST
------------------------------------------------------------------------------*/

ImprovedTube.blacklist = function (type, node) {
	if (this.storage.blacklist_activate !== true) {
		for (var i = 0, l = this.elements.blacklist_buttons.length; i < l; i++) {
			this.elements.blacklist_buttons[i].remove();
		}

		return;
	} else if (this.isset(node) === false) {
		var a = document.querySelectorAll('a.ytd-thumbnail'),
			a2 = document.querySelectorAll('a[href*="/channel/"],a[href*="/user/"],a[href*="/c/"],a[href*="/@"]'),
			subscribe_buttons = document.querySelectorAll('ytd-subscribe-button-renderer.ytd-c4-tabbed-header-renderer');

		for (var i = 0, l = a.length; i < l; i++) {
			this.blacklist('video', a[i]);
		}

		for (var i = 0, l = subscribe_buttons.length; i < l; i++) {
			this.blacklist('channel', subscribe_buttons[i]);
		}

		for (var i = 0, l = a2.length; i < l; i++) {
			this.blacklist('channel', a2[i]);
		}
	}

	if (!this.storage.blacklist || typeof this.storage.blacklist !== 'object') {
		this.storage.blacklist = {
			channels: {},
			videos: {}
		};
	}

	if (!this.storage.blacklist.channels || typeof this.storage.blacklist.channels !== 'object') {
		this.storage.blacklist.channels = {};
	}

	if (!this.storage.blacklist.videos || typeof this.storage.blacklist.videos !== 'object') {
		this.storage.blacklist.videos = {};
	}

	if (type === 'video') {
		var button = document.createElement('button'),
			svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path'),
			id = node.href.match(ImprovedTube.regex.video_id);

		button.className = 'it-add-to-blacklist';
		button.addEventListener('click', function (event) {
			if (this.parentNode.href) {
				var data = this.parentNode.parentNode.__data,
					id = this.parentNode.href.match(ImprovedTube.regex.video_id),
					title = '';

				if (
					data &&
					data.data &&
					data.data.title &&
					data.data.title.runs &&
					data.data.title.runs[0]
				) {
					title = data.data.title.runs[0].text;
				} else if (
					data &&
					data &&
					data.data &&
					data.data.title.simpleText
				) {
					title = data.data.title.simpleText;
				}

				if (id && id[1]) {
					ImprovedTube.messages.send({
						action: 'blacklist',
						type: 'video',
						id: id[1],
						title
					});

					ImprovedTube.storage.blacklist.videos[id[1]] = {
						title: title
					};

					this.parentNode.parentNode.__dataHost.className += ' it-blacklisted-video';

					event.preventDefault();
					event.stopPropagation();
				}
			}
		}, true);

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18A8 8 0 015.69 7.1L16.9 18.31A7.9 7.9 0 0112 20zm6.31-3.1L7.1 5.69A8 8 0 0118.31 16.9z');

		svg.appendChild(path);
		button.appendChild(svg);

		node.appendChild(button);

		this.elements.blacklist_buttons.push(button);

		if (id && id[1] && ImprovedTube.storage.blacklist.videos[id[1]]) {
			node.parentNode.__dataHost.classList.add('it-blacklisted-video');
		}
	} else if (type === 'channel') {
		if (node.nodeName === 'A') {
			try {
				var id = node.href.match(/@|c\/@?|channel\/|user\/([^/]+)/)[1]

				if (this.storage.blacklist.channels[id]) {
					var parent = node.parentNode.__dataHost.__dataHost;

					if (
						parent.nodeName === 'YTD-GRID-VIDEO-RENDERER' &&
						parent.nodeName === 'YTD-VIDEO-META-BLOCK'
					) {
						parent.classList.add('it-blacklisted-video');
					}
				}
			} catch (err) {}
		} else {
			var button = this.elements.blacklistChannel || document.createElement('button'),
				id = location.href.match(/@|c\/@?|channel\/|user\/([^/]+)/)[1];

			button.className = 'it-add-channel-to-blacklist';

			if (this.storage.blacklist.channels[id]) {
				button.innerText = 'Remove from blacklist';
				button.added = true;
			} else {
				button.innerText = 'Add to blacklist';
				button.added = false;
			}

			button.addEventListener('click', function (event) {
				var data = this.parentNode.__dataHost.__data.data,
					id = location.href.match(/@|c\/@?|channel\/|user\/([^/]+)/)[1];

				this.added = !this.added;

				ImprovedTube.messages.send({
					type: 'channel',
					id,
					title: data.title,
					prevent: data.avatar.thumbnails[0].url
				});

				ImprovedTube.storage.blacklist.channels[id] = {
					title: data.title,
					prevent: data.avatar.thumbnails[0].url
				};

				if (this.added) {
					button.innerText = 'Remove from blacklist';
				} else {
					button.innerText = 'Add to blacklist';
				}

				event.preventDefault();
				event.stopPropagation();

				return false;
			}, true);

			this.elements.blacklist_buttons.push(button);

			node.parentNode.parentNode.appendChild(button);

			this.elements.blacklistChannel = button;
		}
	}
};
