/*--------------------------------------------------------------
>>> PLAYLIST SERIES GAP
----------------------------------------------------------------
Reads episode numbers out of playlist titles and reports missing
and duplicate episodes, per season when a season is present. It is
a reading tool: nothing is changed on YouTube.
--------------------------------------------------------------*/
(function () {
	'use strict';

	var button = null,
		panel = null,
		items = [],
		observer = null,
		timer = null,
		navigating = false,
		lastReport = '';

	function enabled() {
		return ImprovedTube.storage.playlist_series_gap === true;
	}

	function parseEpisode(title) {
		var text = String(title || '').normalize('NFKC').trim(),
			match;

		// S1E2, S01 E02, Season 1 Episode 2
		match = text.match(/\bS(?:eason)?\s*0*(\d+)\s*[-_. ]*E(?:p(?:isode)?)?\s*[.#:-]?\s*0*(\d+)\b/i);
		if (match) {
			return { season: Number(match[1]), episode: Number(match[2]) };
		}

		// E2, Ep 2, Episode 2, EP.2
		match = text.match(/\bE(?:p(?:isode)?)?\s*[.#:-]?\s*0*(\d+)\b/i);
		if (match) {
			return { season: null, episode: Number(match[1]) };
		}

		// Part 2
		match = text.match(/\bPart\s*0*(\d+)\b/i);
		if (match) {
			return { season: null, episode: Number(match[1]) };
		}

		// 第3集 / 第3話
		match = text.match(/第\s*0*(\d+)\s*[集话話]/);
		if (match) {
			return { season: null, episode: Number(match[1]) };
		}

		// #7
		match = text.match(/#\s*0*(\d+)\b/);
		if (match) {
			return { season: null, episode: Number(match[1]) };
		}

		// "3. Title" / "3) Title"
		match = text.match(/^\s*0*(\d+)\s*[.)]\s+\S/);
		if (match) {
			return { season: null, episode: Number(match[1]) };
		}

		return null;
	}

	function report(list, minimum) {
		var min = Number.isFinite(Number(minimum)) ? Math.min(20, Math.max(2, Math.floor(Number(minimum) || 3))) : 3,
			numbered = [],
			unparsed = [],
			byKey = {},
			bySeason = {},
			duplicates = [],
			missing = [];

		list.forEach(function (item) {
			var parsed = parseEpisode(item && item.title);

			if (!parsed || !Number.isSafeInteger(parsed.episode) || parsed.episode < 0 ||
				(parsed.season !== null && (!Number.isSafeInteger(parsed.season) || parsed.season < 0))) {
				unparsed.push(item);
				return;
			}

			var entry = {
				title: item.title,
				episode: parsed.episode,
				season: parsed.season
			};

			numbered.push(entry);

			var key = (parsed.season == null ? '-' : parsed.season) + ':' + parsed.episode;

			(byKey[key] = byKey[key] || []).push(entry);

			var group = parsed.season == null ? 'all' : parsed.season;

			(bySeason[group] = bySeason[group] || []).push(entry);
		});

		Object.keys(byKey).forEach(function (key) {
			if (byKey[key].length > 1) {
				duplicates.push({
					season: byKey[key][0].season,
					episode: byKey[key][0].episode,
					titles: byKey[key].map(function (entry) { return entry.title; })
				});
			}
		});

		Object.keys(bySeason).forEach(function (group) {
			var entries = bySeason[group];

			// A "gap" report over two numbered titles is noise; wait for the minimum.
			if (entries.length < min) {
				return;
			}

			var numbers = Array.from(new Set(entries.map(function (entry) { return entry.episode; }))).sort(function (a, b) { return a - b; }),
				gaps = [],
				omitted = 0;

			// A title may contain a year or a very large episode number; bound both work and output.
			for (var i = 1; i < numbers.length; i++) {
				var gap = numbers[i] - numbers[i - 1] - 1,
					take = Math.min(gap, 100 - gaps.length);
				for (var n = 1; n <= take; n++) gaps.push(numbers[i - 1] + n);
				omitted += gap - take;
			}

			if (gaps.length) {
				var result = {
					season: group === 'all' ? null : Number(group),
					episodes: gaps
				};
				if (omitted) result.omitted = omitted;
				missing.push(result);
			}
		});

		duplicates.sort(function (a, b) { return a.episode - b.episode; });
		missing.sort(function (a, b) { return (a.season || 0) - (b.season || 0); });

		return {
			scanned: list.length,
			numbered: numbered.length,
			unparsed: unparsed,
			duplicates: duplicates,
			missing: missing
		};
	}

	function videoId(href) {
		var match = String(href || '').match(/[?&]v=([\w-]{11})(?:[&#]|$)/);

		return match ? match[1] : null;
	}

	function rows() {
		var root = listRoot(), list = [];
		if (!root) return list;
		root.querySelectorAll('ytd-playlist-video-renderer, ytd-playlist-panel-video-renderer, yt-lockup-view-model').forEach(function (row) {
			if (row.parentElement?.closest('ytd-playlist-video-renderer, ytd-playlist-panel-video-renderer')) return;
			var link = row.querySelector('a[href*="/watch?"]');

			if (!link || !videoId(link.getAttribute('href'))) {
				return;
			}

			var title = row.querySelector('#video-title, h3'),
				id = videoId(link.getAttribute('href'));

			list.push({
				id: id,
				title: title ? title.textContent.trim() : row.textContent.trim(),
				row: row
			});
		});

		return list;
	}

	function theme() {
		var dark = document.documentElement.hasAttribute('dark');

		return {
			bg: dark ? '#212121' : '#ffffff',
			fg: dark ? '#f1f1f1' : '#0f0f0f',
			border: dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)',
			chip: dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.05)'
		};
	}

	function line(text, options) {
		var el = document.createElement('div');
		el.textContent = text;
		el.style.cssText = 'padding:3px 0;opacity:' + (options && options.muted ? '.65' : '1') +
			';font-weight:' + (options && options.strong ? '600' : '400');
		return el;
	}

	function render() {
		if (!panel || !panel.isConnected || !enabled() || navigating) {
			return;
		}

		var body = panel.querySelector('#it-series-gap-body');
		items = rows();

		var data = report(items, Number(ImprovedTube.storage.playlist_series_gap_minimum) || 3);
		var signature = JSON.stringify(data, function (key, value) { return key === 'row' ? undefined : value; });
		if (signature === lastReport) return;
		lastReport = signature;
		body.textContent = '';

		body.appendChild(line(data.scanned + ' rows scanned, ' + data.numbered + ' numbered', { muted: true }));

		if (!data.numbered) {
			body.appendChild(line('No episode numbers found in these titles.'));
			return;
		}

		if (data.missing.length) {
			body.appendChild(line('Missing episodes', { strong: true }));
			data.missing.forEach(function (entry) {
				body.appendChild(line((entry.season == null ? 'All episodes' : 'Season ' + entry.season) + ': ' + entry.episodes.join(', ') +
					(entry.omitted ? ' …and ' + entry.omitted + ' more' : '')));
			});
		} else {
			body.appendChild(line('No gaps in the numbered range.'));
		}

		if (data.duplicates.length) {
			body.appendChild(line('Duplicate episodes', { strong: true }));
			data.duplicates.slice(0, 10).forEach(function (entry) {
				body.appendChild(line('#' + entry.episode + ' — ' + entry.titles.join(' / ')));
			});

			if (data.duplicates.length > 10) {
				body.appendChild(line('…and ' + (data.duplicates.length - 10) + ' more', { muted: true }));
			}
		}

		if (data.unparsed.length) {
			body.appendChild(line('Titles with no episode number (' + data.unparsed.length + ')', { strong: true }));
			data.unparsed.slice(0, 10).forEach(function (item) {
				body.appendChild(line('· ' + item.title, { muted: true }));
			});
		}
	}

	function close() {
		lastReport = '';
		if (panel) {
			panel.remove();
			panel = null;
		}
	}

	function open() {
		if (!enabled() || navigating || !isPlaylistPage() || !document.body) return;
		if (panel) {
			close();
			return;
		}

		var el = document.createElement('div'),
			head = document.createElement('div'),
			title = document.createElement('strong'),
			closeButton = document.createElement('button'),
			body = document.createElement('div'),
			footer = document.createElement('div');

		el.id = 'it-series-gap-panel';
		el.setAttribute('role', 'dialog');
		el.setAttribute('aria-label', 'Series gaps');
		el.style.cssText = 'position:fixed;left:16px;bottom:64px;z-index:2147483000;width:340px;max-height:60vh;overflow:auto;padding:12px;border-radius:12px;background:' +
			theme().bg + ';color:' + theme().fg + ';border:1px solid ' + theme().border +
			';box-shadow:0 8px 32px rgba(0,0,0,.35);font:13px/1.45 Roboto,Arial,sans-serif';

		head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px';
		title.textContent = 'Series gaps';
		closeButton.textContent = '×';
		closeButton.type = 'button';
		closeButton.setAttribute('aria-label', 'Close series gaps');
		closeButton.style.cssText = 'border:0;background:transparent;color:inherit;font-size:22px;line-height:1;cursor:pointer';
		closeButton.addEventListener('click', close);
		head.appendChild(title);
		head.appendChild(closeButton);

		body.id = 'it-series-gap-body';
		footer.id = 'it-series-gap-footer';
		footer.style.cssText = 'margin-top:8px;font-size:11px;opacity:.65';

		var refresh = document.createElement('button');
		refresh.textContent = 'Rescan';
		refresh.type = 'button';
		refresh.style.cssText = 'padding:4px 8px;border-radius:6px;border:1px solid ' + theme().border +
			';background:transparent;color:inherit;font:inherit;cursor:pointer';
		refresh.addEventListener('click', render);
		footer.appendChild(refresh);

		el.appendChild(head);
		el.appendChild(body);
		el.appendChild(footer);
		document.body.appendChild(el);
		panel = el;
		render();
	}

	function makeButton() {
		var el = document.createElement('button');

		el.id = 'it-series-gap-button';
		el.type = 'button';
		el.textContent = 'Series gaps';
		el.title = 'Find missing and duplicate episode numbers';
		el.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:2147483000;padding:8px 12px;border:1px solid ' +
			theme().border + ';border-radius:999px;background:' + theme().bg + ';color:' + theme().fg +
			';font:600 12px/1 Roboto,Arial,sans-serif;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.25)';
		el.addEventListener('click', open);

		return el;
	}

	function isPlaylistPage() {
		return (location.pathname === '/playlist' || location.pathname === '/watch') && /[?&]list=[^&]+/.test(location.search);
	}

	function listRoot() {
		return location.pathname === '/playlist'
			? document.querySelector('ytd-playlist-video-list-renderer, yt-item-section-renderer, ytd-item-section-renderer')
			: document.querySelector('ytd-watch-flexy ytd-playlist-panel-renderer, ytd-playlist-panel-renderer');
	}

	function apply() {
		clearTimeout(timer);
		timer = null;
		if (!enabled() || navigating || !isPlaylistPage() || !document.body) {
			if (observer) observer.disconnect();
			observer = null;
			if (button) {
				button.remove();
				button = null;
			}
			close();
			return;
		}
		observe();
		if (!button || !document.contains(button)) {
			button = makeButton();
			document.body.appendChild(button);
		}
		render();
	}

	function observe() {
		if (observer || !document.body) {
			return;
		}

		observer = new MutationObserver(function (mutations) {
			if (mutations.some(function (mutation) {
				var target = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
				return target && !target.closest('#it-series-gap-panel, #it-series-gap-button') &&
					(!button?.isConnected || target.closest('ytd-playlist-video-list-renderer, yt-item-section-renderer, ytd-item-section-renderer, ytd-playlist-panel-renderer') ||
						Array.from(mutation.addedNodes || []).some(function (node) {
							return node.nodeType === 1 && (node.matches('ytd-playlist-video-list-renderer, yt-item-section-renderer, ytd-item-section-renderer, ytd-playlist-panel-renderer') ||
								node.querySelector('ytd-playlist-video-renderer, ytd-playlist-panel-video-renderer, yt-lockup-view-model'));
						}));
			})) schedule();
		});
		observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['href', 'title'] });
	}

	function schedule() {
		if (timer === null) timer = setTimeout(apply, 150);
	}
	document.addEventListener('init_completed', apply);
	document.addEventListener('DOMContentLoaded', apply);
	document.addEventListener('yt-navigate-start', function () { navigating = true; apply(); });
	document.addEventListener('yt-navigate-finish', function () { navigating = false; schedule(); });
	document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
	ImprovedTube.playlistSeriesGap = apply;
	ImprovedTube.playlistSeriesGapMinimum = render;

	ImprovedTube.seriesGapParseEpisode = parseEpisode;
	ImprovedTube.seriesGapReport = report;
})();
