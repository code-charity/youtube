/*--------------------------------------------------------------
>>> CHANNEL RSS
----------------------------------------------------------------
Adds a copy-to-clipboard RSS button next to Subscribe on channel
pages. YouTube still serves https://youtube.com/feeds/videos.xml
?channel_id=… for every channel; this exposes it without leaving
the page.
--------------------------------------------------------------*/
(function () {
	'use strict';

	function enabled() {
		return ImprovedTube.storage.channel_rss_button === true;
	}

	/** Channel id from the page, preferring the structured metadata. */
	function channelId() {
		var meta = document.querySelector('meta[itemprop="identifier"]'),
			canonical = document.querySelector('link[rel="canonical"]'),
			external = window.ytInitialData &&
				window.ytInitialData.metadata &&
				window.ytInitialData.metadata.channelMetadataRenderer &&
				window.ytInitialData.metadata.channelMetadataRenderer.externalId,
			match;

		// The head tags are rewritten on SPA navigation; ytInitialData is not.
		if (meta && /^UC[\w-]{22}$/.test(meta.content)) {
			return meta.content;
		}

		match = canonical && canonical.href.match(/\/channel\/(UC[\w-]{22})/);

		if (match) {
			return match[1];
		}

		return external && /^UC[\w-]{22}$/.test(external) ? external : null;
	}

	function feedUrl(id) {
		return 'https://www.youtube.com/feeds/videos.xml?channel_id=' + id;
	}

	function copy(text) {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			return navigator.clipboard.writeText(text);
		}

		return new Promise(function (resolve) {
			var area = document.createElement('textarea');

			area.value = text;
			area.style.cssText = 'position:fixed;top:-1000px;left:-1000px';
			document.body.appendChild(area);
			area.select();

			try {
				document.execCommand('copy');
			} catch (error) {
				console.warn('[ImprovedTube] RSS copy failed', error);
			}

			area.remove();
			resolve();
		});
	}

	/**
	 * Channel headers now render yt-subscribe-button-view-model; watch pages still use
	 * #subscribe-button. Several hidden copies of each exist for hover cards, so take the
	 * first one with a box.
	 */
	function subscribeAnchor() {
		var selectors = ['yt-subscribe-button-view-model', '#subscribe-button', '#subscribe-button button'];

		for (var s = 0; s < selectors.length; s++) {
			var candidates = document.querySelectorAll(selectors[s]);

			for (var i = 0; i < candidates.length; i++) {
				var rect = candidates[i].getBoundingClientRect();

				if (rect.width > 0 && rect.height > 0) {
					return candidates[i];
				}
			}
		}

		return null;
	}

	function theme() {
		var dark = document.documentElement.hasAttribute('dark');

		return {
			fg: dark ? '#f1f1f1' : '#0f0f0f',
			chip: dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.05)'
		};
	}

	function apply() {
		var existing = document.querySelector('#it-rss-button'),
			id = channelId(),
			anchor,
			button,
			svg,
			path;

		if (!enabled() || !id || !subscribeAnchor()) {
			if (existing) {
				existing.remove();
			}
			return;
		}

		if (existing) {
			if (existing.dataset.channel === id) {
				return;
			}

			existing.remove();
		}

		anchor = subscribeAnchor();
		button = document.createElement('button');
		svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		button.id = 'it-rss-button';
		button.dataset.channel = id;
		button.type = 'button';
		button.dataset.tooltip = 'RSS feed';
		button.setAttribute('aria-label', 'Copy this channel\'s RSS feed URL');
		button.style.cssText = 'margin-left:8px;width:36px;height:36px;border:0;border-radius:50%;background:' + theme().chip +
			';color:' + theme().fg + ';cursor:pointer;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle';
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('width', '18');
		svg.setAttribute('height', '18');
		svg.style.fill = 'currentColor';
		path.setAttribute('d', 'M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19 7.38 20 6.18 20 5 20 4 19 4 17.82a2.18 2.18 0 012.18-2.18M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z');
		svg.appendChild(path);
		button.appendChild(svg);

		button.addEventListener('click', function (event) {
			event.preventDefault();
			event.stopPropagation();

			copy(feedUrl(id)).then(function () {
				button.dataset.tooltip = 'Copied';

				setTimeout(function () {
					button.dataset.tooltip = 'RSS feed';
				}, 1600);
			});
		});

		var action = anchor.closest && anchor.closest('.ytFlexibleActionsViewModelAction');

		(action || anchor).insertAdjacentElement('afterend', button);
	}

	document.addEventListener('init_completed', apply);
	document.addEventListener('yt-navigate-finish', function () { setTimeout(apply, 50); });
	document.addEventListener('it-message-from-extension', apply);

	ImprovedTube.channelRssChannelId = channelId;
	ImprovedTube.channelRssFeedUrl = feedUrl;
})();
