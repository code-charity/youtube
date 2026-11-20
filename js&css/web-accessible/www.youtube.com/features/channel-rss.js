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
	var observer = null,
		timer = null,
		initialPath = location.pathname,
		navigating = false;

	function enabled() {
		return ImprovedTube.storage.channel_rss_button === true;
	}

	/** Channel id from the page, preferring the structured metadata. */
	function channelId() {
		var direct = String(location.pathname || '').match(/^\/channel\/(UC[\w-]{22})(?:\/|$)/);
		if (direct) return direct[1];
		var live = document.querySelector('ytd-app')?.__data?.data?.response?.metadata?.channelMetadataRenderer;
		if (live?.externalId && /^UC[\w-]{22}$/.test(live.externalId)) {
			var url = live.vanityChannelUrl || live.channelUrl;
			try {
				if (url && new URL(url, location.href).pathname.replace(/\/$/, '') === String(location.pathname).replace(/\/(videos|shorts|streams|playlists|community|about|featured)\/?$/, '').replace(/\/$/, '')) {
					return live.externalId;
				}
			} catch { /* Ignore malformed metadata while YouTube replaces the header. */ }
		}
		var meta = document.querySelector('meta[itemprop="identifier"]'),
			canonical = document.querySelector('link[rel="canonical"]'),
			external = window.ytInitialData &&
				window.ytInitialData.metadata &&
				window.ytInitialData.metadata.channelMetadataRenderer &&
				window.ytInitialData.metadata.channelMetadataRenderer.externalId,
			match;

		// The head tags are rewritten on SPA navigation; ytInitialData is not.
		if (location.pathname === initialPath && meta && /^UC[\w-]{22}$/.test(meta.content)) {
			return meta.content;
		}

		match = canonical && canonical.href.match(/\/channel\/(UC[\w-]{22})/);

		if (match && location.pathname === initialPath) {
			return match[1];
		}

		return location.pathname === initialPath && external && /^UC[\w-]{22}$/.test(external) ? external : null;
	}

	function feedUrl(id) {
		return 'https://www.youtube.com/feeds/videos.xml?channel_id=' + id;
	}

	function copy(text) {
		function fallback() {
			var area = document.createElement('textarea');

			area.value = text;
			area.style.cssText = 'position:fixed;top:-1000px;left:-1000px';
			document.body.appendChild(area);
			area.select();

			try {
				if (!document.execCommand('copy')) throw new Error('Clipboard copy failed');
			} finally {
				area.remove();
			}
		}
		if (navigator.clipboard && navigator.clipboard.writeText) {
			return Promise.resolve().then(function () { return navigator.clipboard.writeText(text); }).catch(fallback);
		}
		return Promise.resolve().then(fallback);
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
		clearTimeout(timer);
		timer = null;
		if (!enabled() || navigating || !/^\/(?:@[^/]+|channel\/[^/]+|c\/[^/]+|user\/[^/]+)(?:\/|$)/.test(location.pathname || '')) {
			if (observer) observer.disconnect();
			observer = null;
			document.querySelector('#it-rss-button')?.remove();
			return;
		}
		if (!observer) {
			observer = new MutationObserver(function (mutations) {
				if (mutations.some(function (mutation) { return !mutation.target.closest?.('#it-rss-button'); })) schedule();
			});
			observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['content', 'href', 'hidden'] });
		}
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

			if (!enabled() || channelId() !== id || navigating) return;
			copy(feedUrl(id)).then(function () {
				if (!button.isConnected) return;
				button.dataset.tooltip = 'Copied';
				button.title = 'Copied';

				setTimeout(function () {
					button.dataset.tooltip = 'RSS feed';
					button.title = 'RSS feed';
				}, 1600);
			}).catch(function () {
				button.dataset.tooltip = 'Copy failed';
				button.title = 'Copy failed — try again';
			});
		});

		var action = anchor.closest && anchor.closest('.ytFlexibleActionsViewModelAction');

		(action || anchor).insertAdjacentElement('afterend', button);
	}

	function schedule() {
		if (timer === null) timer = setTimeout(apply, 50);
	}
	document.addEventListener('init_completed', apply);
	document.addEventListener('DOMContentLoaded', apply);
	document.addEventListener('yt-navigate-start', function () { navigating = true; apply(); });
	document.addEventListener('yt-navigate-finish', function () { navigating = false; schedule(); });
	document.addEventListener('yt-page-data-updated', schedule);
	ImprovedTube.channelRssButton = apply;

	ImprovedTube.channelRssChannelId = channelId;
	ImprovedTube.channelRssFeedUrl = feedUrl;
})();
