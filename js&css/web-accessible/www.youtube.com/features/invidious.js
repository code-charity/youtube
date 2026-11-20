/*--------------------------------------------------------------
>>> INVIDIOUS / PIPED REDIRECT
----------------------------------------------------------------
One button under the player, and an optional automatic redirect.
Nothing is fetched: the chosen instance is opened in a new tab, or
the current tab is redirected. Off until an instance is picked.
--------------------------------------------------------------*/
(function () {
	'use strict';
	var observer = null,
		timer = null,
		navigating = false,
		lastRedirect = null;

	var INSTANCES = {
		'yewtu.be': 'Invidious — yewtu.be',
		'inv.nadeko.net': 'Invidious — inv.nadeko.net',
		'invidious.nerdvpn.de': 'Invidious — invidious.nerdvpn.de',
		'inv.tux.pizza': 'Invidious — inv.tux.pizza',
		'piped.video': 'Piped — piped.video'
	};

	function instance() {
		var value = ImprovedTube.storage.invidious_instance;

		return Object.prototype.hasOwnProperty.call(INSTANCES, value) ? value : null;
	}

	function videoId() {
		var match = location.search.match(/[?&]v=([\w-]{11})(?:&|$)/);

		return match ? match[1] : null;
	}

	function watchUrl(host, id) {
		return Object.prototype.hasOwnProperty.call(INSTANCES, host) && /^[\w-]{11}$/.test(id)
			? 'https://' + host + '/watch?v=' + id : null;
	}

	function auto() {
		return ImprovedTube.storage.invidious_auto_redirect === true;
	}

	function theme() {
		var dark = document.documentElement.hasAttribute('dark');

		return {
			fg: dark ? '#f1f1f1' : '#0f0f0f',
			chip: dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.05)'
		};
	}

	function button() {
		var id = videoId(),
			host = instance(),
			existing = document.querySelector('#it-invidious-button'),
			anchor,
			el,
			svg,
			path;

		if (!host || !id || location.pathname !== '/watch') {
			if (existing) {
				existing.remove();
			}
			return;
		}

		if (existing) {
			existing.dataset.tooltip = 'Open in ' + host;
			existing.setAttribute('aria-label', 'Open this video on ' + host);
			return;
		}

		anchor = document.querySelector('#subscribe-button');

		if (!anchor) {
			return;
		}

		el = document.createElement('button');
		svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		el.id = 'it-invidious-button';
		el.type = 'button';
		el.dataset.tooltip = 'Open in ' + host;
		el.setAttribute('aria-label', 'Open this video on ' + host);
		el.style.cssText = 'margin-left:8px;width:36px;height:36px;border:0;border-radius:50%;background:' + theme().chip +
			';color:' + theme().fg + ';cursor:pointer;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle';
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('width', '18');
		svg.setAttribute('height', '18');
		svg.style.fill = 'currentColor';
		path.setAttribute('d', 'M12 2a10 10 0 100 20 10 10 0 000-20zm6.93 6h-2.95a15.6 15.6 0 00-1.38-3.56A8.03 8.03 0 0118.93 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14a8.1 8.1 0 010-4h3.38a16.5 16.5 0 000 4H4.26zm.81 2h2.95c.32 1.25.78 2.45 1.38 3.56A8.03 8.03 0 015.07 16zm2.95-8H5.07a8.03 8.03 0 014.33-3.56A15.6 15.6 0 008.02 8zM12 19.96a13.9 13.9 0 01-1.91-3.96h3.82A13.9 13.9 0 0112 19.96zM14.34 14H9.66a14.6 14.6 0 010-4h4.68a14.6 14.6 0 010 4zm.26 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56zM16.36 14a16.5 16.5 0 000-4h3.38a8.1 8.1 0 010 4h-3.38z');
		svg.appendChild(path);
		el.appendChild(svg);
		el.addEventListener('click', function (event) {
			event.preventDefault();
			event.stopPropagation();
			var url = watchUrl(instance(), videoId());
			if (url && !navigating && location.pathname === '/watch') window.open(url, '_blank', 'noopener');
		});

		anchor.insertAdjacentElement('afterend', el);
	}

	function maybeRedirect() {
		var id = videoId(),
			host = instance(),
			marker;

		if (!host || !auto() || navigating || location.pathname !== '/watch' || !id) {
			return;
		}

		try {
			marker = sessionStorage.getItem('it-invidious-redirected');
		} catch (error) {
			marker = null;
		}

		// One redirect per video per tab, so going Back does not bounce forward again.
		if (marker === id || lastRedirect === id) {
			return;
		}

		try {
			sessionStorage.setItem('it-invidious-redirected', id);
		} catch (error) {
			// Private mode without storage still redirects once per page load.
		}

		lastRedirect = id;
		location.replace(watchUrl(host, id));
	}

	function apply() {
		clearTimeout(timer);
		timer = null;
		if (!instance() || navigating || location.pathname !== '/watch' || !videoId()) {
			if (observer) observer.disconnect();
			observer = null;
			var existing = document.querySelector('#it-invidious-button');

			if (existing) {
				existing.remove();
			}
			return;
		}

		button();
		maybeRedirect();
		if (!observer && document.body) {
			observer = new MutationObserver(function () {
				if (!document.querySelector('#it-invidious-button')) schedule();
			});
			observer.observe(document.body, { childList: true, subtree: true });
		}
	}

	function schedule() {
		if (timer === null) timer = setTimeout(apply, 100);
	}
	document.addEventListener('init_completed', apply);
	document.addEventListener('DOMContentLoaded', apply);
	document.addEventListener('yt-navigate-start', function () { navigating = true; apply(); });
	document.addEventListener('yt-navigate-finish', function () { navigating = false; schedule(); });
	ImprovedTube.invidiousInstance = apply;
	ImprovedTube.invidiousAutoRedirect = function () { apply(); return auto(); };

	ImprovedTube.invidiousInstances = INSTANCES;
	ImprovedTube.invidiousWatchUrl = watchUrl;
	ImprovedTube.invidiousMaybeRedirect = maybeRedirect;
})();
