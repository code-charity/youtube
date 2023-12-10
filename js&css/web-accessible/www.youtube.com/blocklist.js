/*------------------------------------------------------------------------------
4.8.0 BLOCKLIST
------------------------------------------------------------------------------*/

ImprovedTube.blocklist = function (type, node) {

	if (this.storage.blocklist_activate !== true) {
		// for (var i = 0, l = this.elements.blocklist_buttons.length; i < l; i++) {
		//	this.elements.blocklist_buttons[i].remove();		
		return;
	} else if (!node) {
		var a = document.querySelectorAll('a.ytd-thumbnail'),
			a2 = document.querySelectorAll('a[href*="/channel/"],a[href*="/user/"],a[href*="/c/"],a[href*="/@"]'),
			subscribe_buttons = document.querySelectorAll('ytd-subscribe-button-renderer.ytd-c4-tabbed-header-renderer');

		for (var i = 0, l = a.length; i < l; i++) {
			this.blocklist('video', a[i]);
		}

		for (var i = 0, l = subscribe_buttons.length; i < l; i++) {
			this.blocklist('channel', subscribe_buttons[i]);
		}

		for (var i = 0, l = a2.length; i < l; i++) {
			this.blocklist('channel', a2[i]);
		}
	}

	if (!this.storage.blocklist || typeof this.storage.blocklist !== 'object') {
		this.storage.blocklist = {
			channels: {},
			videos: {}
		};
	}

	if (!this.storage.blocklist.channels || typeof this.storage.blocklist.channels !== 'object') {
		this.storage.blocklist.channels = {};
	}

	if (!this.storage.blocklist.videos || typeof this.storage.blocklist.videos !== 'object') {
		this.storage.blocklist.videos = {};
	}

	if (type === 'video') {
		var id = node.href.match(ImprovedTube.regex.video_id);
		// Hide blocklisted videos:
		if (id && id[1] && ImprovedTube.storage.blocklist.videos[id[1]]) {
			//node.__dataHost.classList.add('it-blocklisted-video'); // this only affects the thumbnail
			const dismissibleElement = node.parentNode.__dataHost.$.dismissible;
			if (dismissibleElement) { dismissibleElement.classList.add('it-blocklisted-video'); } // this affects the title and co. as well
		//	node.parentNode.parentNode.__dataHost.$.ytd-compact-video-renderer.classList.add('it-blocklisted-video');
		}

		// skip blocklist button creation, if it exists already:
		if(node.getElementsByClassName("it-add-to-blocklist").length > 0){
			return
		}
		
		var button = document.createElement('button'),
			svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		button.className = 'it-add-to-blocklist';
		button.addEventListener('click', function (event) {
			if (this.parentNode.href) {
				var data = this.parentNode.__dataHost.__data,
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
						action: 'blocklist',
						type: 'video',
						id: id[1],
						title: title
					});

					ImprovedTube.storage.blocklist.videos[id[1]] = {
						title: title
					};

					this.parentNode.parentNode.__dataHost.className += ' it-blocklisted-video';

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

		if (this.elements && this.elements.blocklist_buttons && Array.isArray(this.elements.blocklist_buttons)){  
				this.elements.blocklist_buttons.push(button); 
		}
	} else if (type === 'channel') {
		if (node.nodeName === 'A') {
			try {
				var id = node.href.match(ImprovedTube.regex.channel).groups.name;

				if (this.storage.blocklist.channels[id]) {
					var parent = node.parentNode//.__dataHost.__dataHost;

					if ( parent.__dataHost.$.dismissible
						//parent.nodeName === 'YTD-GRID-VIDEO-RENDERER' ||
						//parent.nodeName === 'YTD-VIDEO-META-BLOCK'
					) {
						parent.__dataHost.$.dismissible.classList.add('it-blocklisted-video'); // this affects the title and co. as well
					//	parent.__dataHost.$.ytd-compact-video-renderer.classList.add('it-blocklisted-video');
					}
				}
			} catch (err) {}
		} else {
			var button = this.elements.blocklistChannel || document.createElement('button'),
				id = location.href.match(ImprovedTube.regex.channel).groups.name;

			button.className = 'it-add-channel-to-blocklist';

			if (this.storage.blocklist.channels[id]) {
				button.innerText = 'Remove from blocklist';
				button.added = true;
			} else {
				button.innerText = 'Add to blocklist';
				button.added = false;
			}

			button.addEventListener('click', function (event) {
				var data = this.parentNode.__dataHost.__data.data,
					id = location.href.match(ImprovedTube.regex.channel).groups.name;

				this.added = !this.added;

				ImprovedTube.messages.send({
					action: 'blocklist',
					type: 'channel',
					id: id,
					title: data.title,
					prevent: data.avatar.thumbnails[0].url
				});

				ImprovedTube.storage.blocklist.channels[id] = {
					title: data.title,
					prevent: data.avatar.thumbnails[0].url
				};

				if (this.added) {
					button.innerText = 'Remove from blocklist';
				} else {
					button.innerText = 'Add to blocklist';
				}

				event.preventDefault();
				event.stopPropagation();

				return false;
			}, true);

			this.elements.blocklist_buttons.push(button);

			node.parentNode.parentNode.appendChild(button);

			this.elements.blocklistChannel = button;
		}
	}
};
