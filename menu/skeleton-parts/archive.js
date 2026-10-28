/*--------------------------------------------------------------
>>> ARCHIVE
----------------------------------------------------------------
	Search the archived transcripts of watched videos and browse
	the viewing log. The matching/ranking logic lives in
	js&css/transcript-archive.js so the content script and this
	menu stay in sync.
--------------------------------------------------------------*/

(function () {
	var library = typeof ImprovedTubeTranscriptArchive !== 'undefined' ? ImprovedTubeTranscriptArchive : null;
	var search_timer = null;
	var archive_cache = {
		raw: null,
		store: null
	};

	function storage() {
		return typeof satus !== 'undefined' ? satus.storage : null;
	}

	function getRanking() {
		var store = storage();

		return store && store.get('transcript_search_ranking') === 'global' ? 'global' : 'personal';
	}

	// The content script sanitizes on write, so the menu only has to redo
	// that work when the stored object itself changes.
	function getArchive() {
		var store = storage(),
			raw = store ? store.get('transcript_archive') : null;

		if (archive_cache.store === null || archive_cache.raw !== raw) {
			archive_cache.raw = raw;
			archive_cache.store = library ? library.sanitizeStore(raw) : {};
		}

		return archive_cache.store;
	}

	function removeChildren(element) {
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
	}

	// The satus section owns its title/header, so the generated rows live in
	// their own child instead of replacing the whole section.
	function contentOf(section, name) {
		var content = section.querySelector('[data-it-archive-content="' + name + '"]');

		if (!content) {
			content = document.createElement('div');
			content.className = 'it-archive-content';
			content.setAttribute('data-it-archive-content', name);
			section.appendChild(content);
		}

		return content;
	}

	function createText(tag, className, text) {
		var element = document.createElement(tag);

		if (className) {
			element.className = className;
		}

		element.textContent = text;

		return element;
	}

	function renderResults(container, query) {
		if (!container || !library) {
			return;
		}

		var mode = getRanking(),
			results = library.search(getArchive(), query, {
				mode: mode,
				limit: 50,
				sanitized: true
			}),
			content = contentOf(container, 'results');

		removeChildren(content);

		if (!results.length) {
			content.appendChild(createText('div', 'it-archive-empty', satus.locale.get('archiveIsEmpty')));

			return;
		}

		var heading = createText('div', 'it-archive-heading', satus.locale.get(query ? 'searchResults' : 'recentlyArchived'));

		content.appendChild(heading);

		results.forEach(function (result) {
			var link = document.createElement('a'),
				body = document.createElement('span'),
				title = createText('span', 'it-archive-result-title', result.title || result.videoId),
				meta = createText('span', 'it-archive-result-meta', ''),
				snippet = createText('span', 'it-archive-result-snippet', result.text || ''),
				thumbnail = document.createElement('img');

			link.className = 'it-archive-result';
			link.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(result.videoId) + '&t=' + Math.floor(result.time || 0);
			link.target = '_blank';
			link.rel = 'noopener';

			thumbnail.className = 'it-archive-result-thumbnail';
			thumbnail.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(result.videoId) + '/default.jpg';
			thumbnail.alt = '';

			body.className = 'it-archive-result-body';
			body.appendChild(title);

			var details = [];

			if (result.channel) {
				details.push(result.channel);
			}

			if (result.timeText) {
				details.push(result.timeText);
			}

			if (result.watched) {
				details.push(satus.locale.get('watched'));
			}

			if (result.paused) {
				details.push(satus.locale.get('paused') + ' ' + result.paused + '×');
			}

			if (result.views > 1) {
				details.push(result.views + '× ' + satus.locale.get('watched'));
			}

			meta.textContent = details.join(' · ');
			body.appendChild(meta);

			if (result.text) {
				body.appendChild(snippet);
			}

			link.appendChild(thumbnail);
			link.appendChild(body);
			content.appendChild(link);
		});
	}

	function renderLog(container) {
		if (!container) {
			return;
		}

		var store = storage(),
			log = store ? store.get('viewing_log') : null,
			entries = Array.isArray(log) ? log.slice(0, 20) : [],
			content = contentOf(container, 'log');

		removeChildren(content);

		if (!entries.length) {
			content.appendChild(createText('div', 'it-archive-empty', satus.locale.get('viewingLogIsEmpty')));

			return;
		}

		entries.forEach(function (entry) {
			var link = document.createElement('a'),
				title = createText('span', 'it-archive-result-title', entry.t || entry.v),
				meta = createText('span', 'it-archive-result-meta', ''),
				details = [];

			link.className = 'it-archive-result it-archive-result--log';
			link.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(entry.v) + '&t=' + Math.floor(entry.from || 0);
			link.target = '_blank';
			link.rel = 'noopener';

			if (entry.c) {
				details.push(entry.c);
			}

			if (entry.at) {
				details.push(new Date(entry.at).toLocaleString());
			}

			if (entry.sec) {
				details.push(library.formatTime(entry.sec) + ' ' + satus.locale.get('watched'));
			}

			if (entry.pauses) {
				details.push(entry.pauses + '× ' + satus.locale.get('paused'));
			}

			meta.textContent = details.join(' · ');

			link.appendChild(title);
			link.appendChild(meta);
			content.appendChild(link);
		});
	}

	extension.skeleton.main.layers.section.archive = {
		component: 'button',
		variant: 'archive',
		category: true,
		on: {
			click: {
				settings: {
					component: 'section',
					variant: 'card',
					title: 'archiveSettings',

					archive_transcripts: {
						component: 'switch',
						text: 'archiveTranscripts'
					},
					record_viewing_log: {
						component: 'switch',
						text: 'recordViewingLog'
					}
				},

				searchSection: {
					component: 'section',
					variant: 'card',
					title: 'searchTranscripts',

					query: {
						component: 'text-field',
						variant: 'search',
						class: 'it-archive-search',
						storage: false,
						placeholder: 'searchTranscripts',
						lineNumbers: false,
						rows: 1,
						on: {
							input: function () {
								var value = this.value,
									container = document.getElementById('it-archive-results');

								clearTimeout(search_timer);
								search_timer = setTimeout(function () {
									renderResults(container, value);
								}, 200);
							}
						}
					},

					ranking: {
						component: 'select',
						text: 'ranking',
						storage: 'transcript_search_ranking',
						options: [{
							text: 'personalRanking',
							value: 'personal'
						}, {
							text: 'globalRanking',
							value: 'global'
						}],
						on: {
							change: function () {
								renderResults(document.getElementById('it-archive-results'), document.querySelector('.it-archive-search input')?.value || '');
							}
						}
					}
				},

				results: {
					component: 'section',
					variant: 'card',
					id: 'it-archive-results',
					on: {
						render: function () {
							renderResults(this, '');
						}
					}
				},

				logSection: {
					component: 'section',
					variant: 'card',
					class: 'it-archive-log',
					title: 'viewingLog',
					on: {
						render: function () {
							renderLog(this);
						}
					}
				},

				clearSection: {
					component: 'section',
					variant: 'card',

					clear_archive: {
						component: 'button',
						text: 'deleteArchive',
						on: {
							click: function () {
								if (!confirm(satus.locale.get('areYouSureYouWantToDeleteTheArchive'))) {
									return;
								}

								satus.storage.remove('transcript_archive');
								renderResults(document.getElementById('it-archive-results'), '');
							}
						}
					},

					clear_log: {
						component: 'button',
						text: 'deleteViewingLog',
						on: {
							click: function () {
								if (!confirm(satus.locale.get('areYouSureYouWantToDeleteTheViewingLog'))) {
									return;
								}

								satus.storage.remove('viewing_log');
								renderLog(document.querySelector('.it-archive-log'));
							}
						}
					}
				}
			}
		},

		icon: {
			component: 'span',

			svg: {
				component: 'svg',
				attr: {
					'viewBox': '0 0 24 24',
					'fill': 'transparent',
					'stroke': 'currentColor',
					'stroke-linecap': 'round',
					'stroke-linejoin': 'round',
					'stroke-width': '1.75'
				},

				path: {
					component: 'path',
					attr: {
						'd': 'M4 7h16M6 7v12a2 2 0 002 2h8a2 2 0 002-2V7M9 7V4h6v3M10 12h4'
					}
				}
			}
		},

		label: {
			component: 'span',
			text: 'archive'
		}
	};

	// A small helper class keeps the custom rows styleable without
	// depending on satus internals.
	var style = document.createElement('style');

	style.textContent = '.it-archive-result{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid rgba(128,128,128,.2);text-decoration:none;color:inherit}'
		+ '.it-archive-result:last-child{border-bottom:0}'
		+ '.it-archive-result--log{flex-direction:column;gap:2px}'
		+ '.it-archive-result-thumbnail{width:72px;height:40px;object-fit:cover;border-radius:4px;flex:none}'
		+ '.it-archive-result-body{display:flex;flex-direction:column;min-width:0;flex:1}'
		+ '.it-archive-result-title{font-weight:500;font-size:13px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
		+ '.it-archive-result-meta{font-size:11px;opacity:.65;margin-top:2px}'
		+ '.it-archive-result-snippet{font-size:12px;line-height:1.35;margin-top:4px;opacity:.85;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'
		+ '.it-archive-heading{font-size:11px;text-transform:uppercase;letter-spacing:.04em;opacity:.6;padding:2px 0 6px}'
		+ '.it-archive-empty{font-size:12px;opacity:.6;padding:6px 0}';

	(document.head || document.documentElement).appendChild(style);

	// satus only imports storage once, so keep the archive views in sync with
	// writes from the content script or another menu instance.
	if (typeof satus !== 'undefined' && satus.storage && typeof satus.storage.onchanged === 'function') {
		satus.storage.onchanged(function (key, value) {
			if (key !== 'transcript_archive' && key !== 'viewing_log') {
				return;
			}

			satus.storage.data[key] = value;

			if (key === 'transcript_archive') {
				renderResults(
					document.getElementById('it-archive-results'),
					document.querySelector('.it-archive-search input')?.value || ''
				);
			} else {
				renderLog(document.querySelector('.it-archive-log'));
			}
		});
	}
})();
