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

	function formatBytes(bytes) {
		if (bytes >= 1024 * 1024 * 1024) {
			return Math.round(bytes / 1024 / 1024 / 1024 * 10) / 10 + ' GB';
		}

		return Math.round(bytes / 1024 / 1024 * 100) / 100 + ' MB';
	}

	function getDiary() {
		var store = storage();

		return library ? library.sanitizeDiaryIndex(store ? store.get('watching_diary') : null) : {};
	}

	function estimateUsage() {
		var store = storage(),
			bytes = 0;

		if (!store) {
			return 0;
		}

		var data = store.data || {};

		Object.keys(data).forEach(function (key) {
			if (key === 'transcript_archive' || key === 'viewing_log' || key === 'watching_diary'
				|| key.indexOf('watching_diary_') === 0) {
				bytes += library.byteLength(JSON.stringify(data[key]));
			}
		});

		return bytes;
	}

	function renderStorage(container) {
		var content = contentOf(container, 'storage'),
			archive = getArchive(),
			diary = getDiary(),
			videos = Object.keys(archive).length,
			frames = Object.keys(diary).reduce(function (total, id) {
				return total + diary[id].frames;
			}, 0);

		removeChildren(content);
		content.appendChild(createText(
			'div',
			'it-archive-empty',
			videos + ' ' + satus.locale.get('archivedVideos')
				+ ' · ' + satus.locale.get('watchingDiary')
				+ ': ' + Object.keys(diary).length + ' / ' + frames + ' ' + satus.locale.get('frames')
				+ ' · ' + satus.locale.get('storageUsed') + ': ' + formatBytes(estimateUsage())
		));
	}

	function renderFrames(grid, video_id, frames) {
		removeChildren(grid);

		frames.forEach(function (frame) {
			var link = document.createElement('a'),
				image = document.createElement('img'),
				time = createText('span', 'it-archive-frame-time', library.formatTime(frame.t));

			link.className = 'it-archive-frame';
			link.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(video_id) + '&t=' + Math.floor(frame.t || 0);
			link.target = '_blank';
			link.rel = 'noopener';

			image.src = frame.data;
			image.alt = '';
			image.loading = 'lazy';

			link.appendChild(image);
			link.appendChild(time);
			grid.appendChild(link);
		});
	}

	function renderDiary(container) {
		if (!container) {
			return;
		}

		var content = contentOf(container, 'diary'),
			diary = getDiary(),
			entries = Object.keys(diary).map(function (id) {
				return diary[id];
			}).sort(function (a, b) {
				return b.at - a.at;
			});

		removeChildren(content);

		if (!entries.length) {
			content.appendChild(createText('div', 'it-archive-empty', satus.locale.get('watchingDiaryIsEmpty')));

			return;
		}

		entries.forEach(function (entry) {
			var details = document.createElement('details'),
				summary = document.createElement('summary'),
				body = document.createElement('div'),
				title = createText('span', 'it-archive-result-title', entry.title || entry.id),
				meta = createText('span', 'it-archive-result-meta', ''),
				part = [];

			details.className = 'it-archive-diary';

			if (entry.channel) {
				part.push(entry.channel);
			}

			if (entry.frames) {
				part.push(entry.frames + ' ' + satus.locale.get('frames'));
			}

			if (entry.at) {
				part.push(new Date(entry.at).toLocaleString());
			}

			meta.textContent = part.join(' · ');

			if (entry.thumb) {
				var thumbnail = document.createElement('img');

				thumbnail.className = 'it-archive-result-thumbnail';
				thumbnail.src = entry.thumb;
				thumbnail.alt = '';
				thumbnail.loading = 'lazy';
				summary.appendChild(thumbnail);
			}

			body.className = 'it-archive-result-body';
			body.appendChild(title);
			body.appendChild(meta);
			summary.appendChild(body);
			details.appendChild(summary);

			var grid = document.createElement('div');

			grid.className = 'it-archive-frames';
			details.appendChild(grid);

			// Frames are data URLs, so only load a video when it is opened.
			details.addEventListener('toggle', function () {
				if (!details.open || details.dataset.loaded === 'true') {
					return;
				}

				details.dataset.loaded = 'true';

				var frames = library.sanitizeDiary(storage() && storage().get('watching_diary_' + entry.id)).frames;

				renderFrames(grid, entry.id, frames);
			});

			content.appendChild(details);
		});
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

			if (result.source === 'related') {
				details.push(satus.locale.get('relatedVideo'));
			} else if (result.source === 'subscription') {
				details.push(satus.locale.get('subscriptionVideo'));
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
					archive_related_videos: {
						component: 'switch',
						text: 'archiveRelatedVideos'
					},
					archive_subscription_videos: {
						component: 'switch',
						text: 'archiveSubscriptionVideos'
					},
					record_viewing_log: {
						component: 'switch',
						text: 'recordViewingLog'
					},
					auto_screenshot: {
						component: 'switch',
						text: 'autoScreenshot'
					},
					archive_storage_limit: {
						component: 'select',
						text: 'storageLimit',
						options: [{
							text: 'unlimited',
							value: '0'
						}, {
							text: 'videos100',
							value: '100'
						}, {
							text: 'videos1000',
							value: '1000'
						}, {
							text: 'videos10000',
							value: '10000'
						}]
					},
					archive_storage_budget: {
						component: 'select',
						text: 'storageBudget',
						options: [{
							text: 'unlimited',
							value: '0'
						}, {
							text: 'megabytes500',
							value: '500'
						}, {
							text: 'megabytes2000',
							value: '2000'
						}, {
							text: 'megabytes10000',
							value: '10000'
						}]
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

				diarySection: {
					component: 'section',
					variant: 'card',
					class: 'it-archive-diary-list',
					title: 'watchingDiary',
					on: {
						render: function () {
							renderDiary(this);
						}
					}
				},

				storageSection: {
					component: 'section',
					variant: 'card',
					class: 'it-archive-storage',
					title: 'storage',
					on: {
						render: function () {
							renderStorage(this);
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
					},

					clear_diary: {
						component: 'button',
						text: 'deleteWatchingDiary',
						on: {
							click: function () {
								if (!confirm(satus.locale.get('areYouSureYouWantToDeleteTheWatchingDiary'))) {
									return;
								}

								var index = getDiary();

								Object.keys(index).forEach(function (id) {
									satus.storage.remove('watching_diary_' + id);
								});

								satus.storage.remove('watching_diary');
								renderDiary(document.querySelector('.it-archive-diary-list'));
								renderStorage(document.querySelector('.it-archive-storage'));
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
		+ '.it-archive-empty{font-size:12px;opacity:.6;padding:6px 0}'
		+ '.it-archive-diary summary{display:flex;gap:10px;padding:8px 0;cursor:pointer;border-bottom:1px solid rgba(128,128,128,.2);list-style:none}'
		+ '.it-archive-diary summary::-webkit-details-marker{display:none}'
		+ '.it-archive-frames{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px;padding:4px 0 12px}'
		+ '.it-archive-frame{position:relative;display:block;text-decoration:none;color:#fff}'
		+ '.it-archive-frame img{width:100%;display:block;border-radius:4px}'
		+ '.it-archive-frame-time{position:absolute;right:4px;bottom:4px;font-size:10px;padding:1px 4px;border-radius:3px;background:rgba(0,0,0,.7)}';

	(document.head || document.documentElement).appendChild(style);

	// satus only imports storage once, so keep the archive views in sync with
	// writes from the content script or another menu instance.
	if (typeof satus !== 'undefined' && satus.storage && typeof satus.storage.onchanged === 'function') {
		satus.storage.onchanged(function (key, value) {
			if (key !== 'transcript_archive' && key !== 'viewing_log' && key !== 'watching_diary' && key.indexOf('watching_diary_') !== 0) {
				return;
			}

			satus.storage.data[key] = value;

			if (key === 'transcript_archive') {
				renderResults(
					document.getElementById('it-archive-results'),
					document.querySelector('.it-archive-search input')?.value || ''
				);
			} else if (key === 'viewing_log') {
				renderLog(document.querySelector('.it-archive-log'));
			} else if (key === 'watching_diary') {
				renderDiary(document.querySelector('.it-archive-diary-list'));
			}

			renderStorage(document.querySelector('.it-archive-storage'));
		});
	}
})();
