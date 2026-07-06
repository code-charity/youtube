/*
 * VideoMetadata resolves metadata for the active YouTube video.
 * It ignores stale DOM payloads after SPA navigations, prefers current player
 * state, and falls back to fetching the watch page when required fields or
 * marker data are missing.
 */
let videoMetadataTrustedTypesPolicy = null;
const VIDEO_METADATA_BASE_KEYS = ['title', 'keywords', 'genre', 'duration', 'lengthSeconds'];
const VIDEO_METADATA_DEFERRED_KEYS = ['mostReplayedMarkers', 'heatmapMarkers', 'amountOfSongs'];
const VIDEO_METADATA_FIELD_KEYS = [...VIDEO_METADATA_BASE_KEYS, ...VIDEO_METADATA_DEFERRED_KEYS];
const VIDEO_METADATA_REQUIRED_KEYS = ['title', 'keywords', 'genre', 'duration'];

function createVideoMetadataData (videoId = null) {
	const data = {videoId};
	for (const key of VIDEO_METADATA_FIELD_KEYS) {
		data[key] = null;
	}
	return data;
}

ImprovedTube.VideoMetadata = {
	// Public async entry point for callers that want a stable basic metadata snapshot.
	getDataAsync: async function (force) {
		try {
			this._init(force);
			await this._waitForPendingWork();
		} catch (error) {
			console.warn('[improved:meta] getDataAsync: failed', error);
		}
		return this.data;
	},
	// Public async entry point for callers that also need Most Replayed and heatmap marker data.
	getDataWithHeatmapAsync: async function (force) {
		try {
			await this.getDataAsync(force);
			await this.getMostReplayedMarkersAsync();
			await this.getHeatmapMarkersAsync();
		} catch (error) {
			console.warn('[improved:meta] getDataWithHeatmapAsync: failed', error);
		}
		return this.data;
	},
	// Experimental API for querySelector-style access.
	// The returned DOM is not the complete DOM,
	// as it is only the parsed fetched HTML and no scripts have been executed.
	// Returns { videoId, document, source }.
	// - videoId : resolved target video id
	// - document: current page DOM, fetched watch page DOM, or null
	// - source  : 'current', 'fetched', or null
	getResolvedDocumentAsync: async function (force) {
		try {
			this._init(force);
			await this._waitForPendingWork();

			const videoId = this.data.videoId || this._getVideoId();
			if (!videoId) {
				return { videoId: null, document: null, source: null };
			}

			let fetchedDocument = this._getCachedFetchedDocument(videoId) || this._parseFetchedHtml(videoId);
			if (fetchedDocument) {
				return { videoId, document: fetchedDocument, source: 'fetched' };
			}

			const currentTitle = this._getCurrentTitle();
			const domStatus = this._getDomStatus(videoId, currentTitle);
			this.state.domStatus = domStatus;

			if (!force && domStatus === 'current') {
				return { videoId, document, source: 'current' };
			}

			if (force || domStatus !== 'current') {
				await this._fetchWatchPage(videoId, 'query-document');
				await this._waitForPendingWork();
				fetchedDocument = this._getCachedFetchedDocument(videoId) || this._parseFetchedHtml(videoId);
			}

			if (fetchedDocument) {
				return { videoId, document: fetchedDocument, source: 'fetched' };
			}

			if (domStatus === 'current') {
				return { videoId, document, source: 'current' };
			}

			return { videoId, document: null, source: null };
		} catch (error) {
			console.warn('[improved:meta] getResolvedDocumentAsync: failed', error);
			return { videoId: this.data?.videoId || null, document: null, source: null };
		}
	},
	// getter
	getVideoTitleAsync: async function (force) {
		return this._getFieldAsync('title', force);
	},
	getKeywordsAsync: async function (force) {
		return this._getFieldAsync('keywords', force);
	},
	getGenreAsync: async function (force) {
		return this._getFieldAsync('genre', force);
	},
	getDurationAsync: async function (force) {
		return this._getFieldAsync('duration', force);
	},
	getLengthSecondsAsync: async function (force) {
		return this._getFieldAsync('lengthSeconds', force);
	},
	getMostReplayedMarkersAsync: async function (force) {
		return this._getDeferredFieldAsync('mostReplayedMarkers', () => this._loadMarkerField('mostReplayedMarkers'), force);
	},
	getHeatmapMarkersAsync: async function (force) {
		return this._getDeferredFieldAsync('heatmapMarkers', () => this._loadMarkerField('heatmapMarkers'), force);
	},
	// Returns null when the song count is unknown or not found; it does not mean zero songs.
	getAmountOfSongsAsync: async function (force) {
		return this._getDeferredFieldAsync('amountOfSongs', () => this._loadAmountOfSongs(), force);
	},
	_getFieldAsync: async function (key, force) {
		await this.getDataAsync(force);
		return this.data[key];
	},
	_getDeferredFieldAsync: async function (key, loader, force) {
		try {
			this._init(force);
			loader();
			await this._waitForPendingWork();
			return this.data[key] != null ? this.data[key] : loader();
		} catch (error) {
			console.warn(`[improved:meta] getDeferredFieldAsync: failed key=${key}`, error);
			return this.data?.[key] ?? null;
		}
	},
	dumpData: function () {
		try {
			// Extract and handle `fetchedDocument` separately because `structuredClone()` fails on it.
			const {fetchedDocument, ...state} = this.state;
			const ret = {
				data: this.data,
				state: state,
				rawYtInitialData: this.rawYtInitialData,
				rawYtInitialPlayerResponse: this.rawYtInitialPlayerResponse,
				fetchPromise: this.fetchPromise === null ? 'null' : '(promise)',
			}
			ret.state.fetchedDocument = fetchedDocument?.documentElement?.outerHTML;
			return structuredClone(ret);
		} catch (e) {
			console.warn('[improved:meta] dumpData: structuredClone failed', e);
			return structuredClone(this.data);
		}
	},
	_reset: function (videoId = null) {
		this._clearRefreshRetry();
		this.data = createVideoMetadataData(videoId);
		this.state = {
			domStatus: 'unknown',
			fetchStatus: 'idle',
			fetchedDocument: null,
			fetchedDocumentVideoId: null,
			fetchedHtml: null,
			fetchedHtmlVideoId: null,
			lastFetchReason: null,
			lastUpdate: 0,
			retryCount: 0,
			retryTimer: null,
			retryVideoId: null,
			source: {},
		};
		this.rawYtInitialData = null;
		this.rawYtInitialPlayerResponse = null;
		this.fetchPromise = null;
		return this.data;
	},
	_init: function (force) {
		if (!this.data || !this.state) {
			this._reset();
		}

		const videoId = this._getVideoId();
		if (!videoId) {
			return this.data;
		}

		if (force || this.data.videoId !== videoId) {
			this._reset(videoId);
		} else if (this.data.videoId === videoId && this.state?.lastUpdate) {
			return this.data;
		}

		return this._refresh(force);
	},
	_refresh: function (force) {
		const videoId = this.data.videoId || this._getVideoId();
		if (!videoId) {
			return this.data;
		}

		const currentTitle = this._getCurrentTitle();
		this._setValue('title', currentTitle, 'currentTitle');
		const domStatus = this._getDomStatus(videoId, currentTitle);
		this.state.domStatus = domStatus;

		// Fill base metadata from current player/page first; fetched cache is only used for fields still missing.
		const playerResponse = this._getPlayerResponse();
		this._applyPartialData(this._buildPlayerPartial(playerResponse, videoId), 'playerResponse');

		if (domStatus !== 'stale') {
			this._applyPartialData(this._buildDomPartial(document, videoId, currentTitle), 'dom');
		}
		if (VIDEO_METADATA_BASE_KEYS.some(key => !this._hasValue(this.data[key]))) {
			const cachedFetchedDocument = this._getCachedFetchedDocument(videoId) || this._parseFetchedHtml(videoId);
			if (cachedFetchedDocument) {
				this._applyPartialData(this._buildDomPartial(cachedFetchedDocument, videoId, currentTitle || this.data.title), 'cachedFetchedDom');
			}
		}

		// Fetch only when required fields are still missing or the current DOM is stale.
		const fetchReason = this._getFetchReason(force);
		if (!fetchReason) {
			this._clearRefreshRetry();
			console.debug(`[improved:meta] refresh: no fetch needed videoId=${videoId}`);
		} else if (fetchReason === 'stale-dom') {
			// console.debug(`[improved:meta] refresh: stale DOM, fetching watch page videoId=${videoId}`, this.dumpData());
			this._clearRefreshRetry();
			this._fetchWatchPage(videoId, fetchReason);
		} else if (this._shouldRetryBeforeFetch(videoId, fetchReason, currentTitle, playerResponse)) {
			// console.debug(`[improved:meta] refresh: scheduling retry for videoId=${videoId} fetchReason=${fetchReason}`, this.dumpData());
			this._scheduleRefreshRetry(videoId, fetchReason);
		} else {
			// console.debug(`[improved:meta] refresh: fetching watch page videoId=${videoId}`, this.dumpData());
			this._clearRefreshRetry();
			this._fetchWatchPage(videoId, fetchReason);
		}

		if (!this._hasValue(this.data.duration) && this._hasValue(this.data.lengthSeconds)) {
			this.data.duration = this._secondsToIsoDuration(this.data.lengthSeconds);
			this.state.source.duration = this.state.source.duration || this.state.source.lengthSeconds || 'derived';
		}

		if (!this._hasValue(this.data.lengthSeconds) && this._hasValue(this.data.duration)) {
			this.data.lengthSeconds = this._isoDurationToSeconds(this.data.duration);
			this.state.source.lengthSeconds = this.state.source.lengthSeconds || this.state.source.duration || 'derived';
		}

		this.state.lastUpdate = Date.now();
		// console.debug(`[improved:meta] refresh: completed videoId=${videoId}`, this.dumpData());
		return this.data;
	},
	_waitForPendingWork: async function () {
		while (this.state?.retryTimer || this.fetchPromise) {
			if (this.fetchPromise) {
				await this.fetchPromise;
				continue;
			}
			await new Promise(resolve => setTimeout(resolve, 25));
		}
	},
	_loadMarkerField: function (fieldName) {
		if (this.data[fieldName] != null) {
			return this.data[fieldName];
		}
		const expectedVideoId = this.data.videoId;
		const playerResponse = this._getPlayerResponse();
		const currentPlayerResponse = this._isPlayerResponseCurrent(playerResponse, expectedVideoId) ? playerResponse : null;
		const currentWindowPlayerResponse = this._isPlayerResponseCurrent(window.ytInitialPlayerResponse, expectedVideoId) ? window.ytInitialPlayerResponse : null;
		const currentRawPlayerResponse = this._isPlayerResponseCurrent(this.rawYtInitialPlayerResponse, expectedVideoId) ? this.rawYtInitialPlayerResponse : null;
		// Prefer current player/page data, then fall back to fetched watch-page data kept in rawYtInitial*.
		const markerSources = [
			['playerResponse', currentPlayerResponse],
			['window.ytInitialData', this.state?.domStatus === 'current' ? window.ytInitialData : null],
			['window.ytInitialPlayerResponse', currentWindowPlayerResponse],
			['rawYtInitialData', this.rawYtInitialData],
			['rawYtInitialPlayerResponse', currentRawPlayerResponse],
		];

		for (const [sourceName, rootObject] of markerSources) {
			const markerData = this._extractMarkerData(rootObject);
			if (markerData) {
				this._setValue('mostReplayedMarkers', markerData.mostReplayedMarkers, sourceName);
				this._setValue('heatmapMarkers', markerData.heatmapMarkers, sourceName);
			}
			if (this.data[fieldName] != null) {
				return this.data[fieldName];
			}
		}
		if (this.data[fieldName] == null && this.data.videoId && this.state.fetchStatus === 'idle') {
			this._fetchWatchPage(this.data.videoId, 'missing:ytInitialData');
		}
		if (this.data[fieldName] == null && this.state.fetchStatus === 'done') {
			this.data[fieldName] = [];
			this.state.source[fieldName] = 'not-found';
		}

		return this.data[fieldName];
	},
	_loadAmountOfSongs: function () {
		if (this.data.amountOfSongs != null) {
			return this.data.amountOfSongs;
		}
		if (this.state.source.amountOfSongs === 'not-found') {
			return null;
		}

		// Use the same source order as marker loading; rawYtInitialData is only updated by watch-page fetches.
		const songCountSources = [
			['window.ytInitialData', this.state?.domStatus === 'current' ? window.ytInitialData : null],
			['rawYtInitialData', this.rawYtInitialData],
		];

		for (const [sourceName, rootObject] of songCountSources) {
			const count = this._findSongCount(rootObject);
			if (count) {
				this._setValue('amountOfSongs', count, sourceName);
				return this.data.amountOfSongs;
			}
		}

		if (this.data.amountOfSongs == null && this.data.videoId && this.state.fetchStatus === 'idle') {
			this._fetchWatchPage(this.data.videoId, 'missing:ytInitialData');
		}
		if (this.data.amountOfSongs == null && this.state.fetchStatus === 'done') {
			this.state.source.amountOfSongs = 'not-found';
		}

		return this.data.amountOfSongs;
	},
	_getFetchReason: function (force) {
		if (force) {
			return 'forced';
		}
		if (this.fetchPromise) {
			return null;
		}
		if (this.state.fetchStatus === 'done' || this.state.fetchStatus === 'failed') {
			return null;
		}

		const missingRequired = VIDEO_METADATA_REQUIRED_KEYS.filter(key => !this._hasValue(this.data[key]));
		if (missingRequired.length) {
			return 'missing:' + missingRequired.join(',');
		}
		if (this.state.domStatus === 'stale') {
			return 'stale-dom';
		}

		return null;
	},
	_shouldRetryBeforeFetch: function (videoId, fetchReason, currentTitle, playerResponse) {
		if (!videoId || !fetchReason?.startsWith('missing:')) {
			return false;
		}
		if (this.state.retryCount >= 10 || this.state.domStatus === 'stale') {
			return false;
		}

		const hasCurrentTitle = this._hasValue(currentTitle);
		const hasPlayerResponse = Boolean(playerResponse);
		return !hasCurrentTitle || !hasPlayerResponse || this.state.domStatus === 'unknown';
	},
	_scheduleRefreshRetry: function (videoId, fetchReason) {
		if (this.state.retryTimer && this.state.retryVideoId === videoId) {
			return;
		}

		this._clearRefreshRetry(false);
		this.state.retryVideoId = videoId;
		this.state.retryCount += 1;

		const delay = this.state.retryCount === 1 ? 150 : 300;
		console.debug(`[improved:meta] scheduleRefreshRetry: videoId=${videoId} reason=${fetchReason} retry=${this.state.retryCount} delay=${delay}`);
		this.state.retryTimer = setTimeout(() => {
			if (!this.state) {
				return;
			}
			this.state.retryTimer = null;

			if (this.data.videoId !== videoId) {
				console.debug(`[improved:meta] scheduleRefreshRetry: canceled stale retry videoId=${videoId} current=${this.data.videoId}`);
				return;
			}

			console.debug(`[improved:meta] scheduleRefreshRetry: retrying refresh videoId=${videoId} retry=${this.state.retryCount}`);
			try {
				this._refresh(false);
			} catch (error) {
				console.warn(`[improved:meta] scheduleRefreshRetry: refresh failed videoId=${videoId}`, error);
			}
		}, delay);
	},
	_clearRefreshRetry: function (resetCount = true) {
		if (this.state?.retryTimer) {
			clearTimeout(this.state.retryTimer);
		}
		if (!this.state) {
			return;
		}

		this.state.retryTimer = null;
		this.state.retryVideoId = null;
		if (resetCount) {
			this.state.retryCount = 0;
		}
	},
	_getVideoId: function (url = document.URL) {
		return ImprovedTube.videoId(url);
	},
	_getCurrentTitle: function () {
		const player = document.getElementById('movie_player');
		const playerTitle = this._normalizeText(player?.getVideoData?.().title);
		if (playerTitle) {
			console.debug(`[improved:meta] getCurrentTitle: playerTitle:${playerTitle}`);
			return playerTitle;
		}

		const headingTitle = this._normalizeText(document.querySelector('title')?.textContent?.replace(/\s*-\s*YouTube$/, ''));
		if (headingTitle) {
			console.debug(`[improved:meta] getCurrentTitle: headingTitle:${headingTitle}`);
			return headingTitle;
		}

		console.warn('[improved:meta] getCurrentTitle: failed to resolve current title from player and DOM heading');
		return '';
	},
	_getPlayerResponse: function () {
		try {
			return movie_player?.getPlayerResponse?.() || window.ytInitialPlayerResponse || null;
		} catch (error) {
			console.warn('[ImprovedTube:VideoMetadata] Failed to read player response.', error);
			return null;
		}
	},
	_getPlayerResponseVideoId: function (playerResponse) {
		return this._normalizeText(
			playerResponse?.videoDetails?.videoId
			|| playerResponse?.currentVideoEndpoint?.watchEndpoint?.videoId
		);
	},
	_isPlayerResponseCurrent: function (playerResponse, expectedVideoId) {
		if (!playerResponse) {
			return false;
		}
		const responseVideoId = this._getPlayerResponseVideoId(playerResponse);
		return Boolean(responseVideoId && expectedVideoId && responseVideoId === expectedVideoId);
	},
	_getDomStatus: function (currentVideoId, currentTitle) {
		const metaTitle = this._normalizeText(document.querySelector('meta[name="title"]')?.getAttribute('content'));
		if (metaTitle && currentTitle && metaTitle !== currentTitle) {
			console.log('[improved:meta] getDomStatus: title mismatch.', { currentTitle, metaTitle });
			return 'stale';
		}
		return 'current';
	},
	_storeFetchedHtml: function (videoId, html) {
		if (!videoId || typeof html !== 'string') {
			return;
		}
		this.state.fetchedHtml = html;
		this.state.fetchedHtmlVideoId = videoId;
		this.state.fetchedDocument = null;
		this.state.fetchedDocumentVideoId = null;
	},
	_getCachedFetchedHtml: function (videoId) {
		if (!videoId || this.state.fetchedHtmlVideoId !== videoId) {
			return null;
		}
		return this.state.fetchedHtml || null;
	},
	_storeFetchedDocument: function (videoId, doc) {
		if (!videoId || !doc) {
			return;
		}
		this.state.fetchedDocument = doc;
		this.state.fetchedDocumentVideoId = videoId;
	},
	_getCachedFetchedDocument: function (videoId) {
		if (!videoId || this.state.fetchedDocumentVideoId !== videoId) {
			return null;
		}
		return this.state.fetchedDocument || null;
	},
	_parseFetchedHtml: function (videoId) {
		const cachedDocument = this._getCachedFetchedDocument(videoId);
		if (cachedDocument) {
			return cachedDocument;
		}

		const html = this._getCachedFetchedHtml(videoId);
		if (!html) {
			return null;
		}

		try {
			const safeHtml = this._getSafeHtmlForParser(html);
			if (!safeHtml) {
				console.warn(`[improved:meta] parseFetchedHtml: skipped fetched DOM parse videoId=${videoId}`);
				return null;
			}

			const parser = new DOMParser();
			const doc = parser.parseFromString(safeHtml, 'text/html');
			this._storeFetchedDocument(videoId, doc);
			console.debug(`[improved:meta] parseFetchedHtml: parsed cached fetched DOM videoId=${videoId}`);
			return doc;
		} catch (error) {
			console.warn(`[improved:meta] parseFetchedHtml: failed to parse fetched DOM videoId=${videoId}`, error);
			return null;
		}
	},
	_fetchWatchPage: function (videoId, reason) {
		if (!videoId) {
			return null;
		}
		if (this.fetchPromise) {
			return this.fetchPromise;
		}

		this._clearRefreshRetry();
		this.state.fetchStatus = 'pending';
		this.state.lastFetchReason = reason;
		console.debug(`[improved:meta] fetchWatchPage: start videoId=${videoId} reason=${reason || 'unknown'}`);

		this.fetchPromise = fetch(`https://www.youtube.com/watch?v=${videoId}`, {credentials: 'same-origin'})
			.then(response => response.text())
			.then(html => {
				if (this.data.videoId !== videoId) {
					console.debug(`[improved:meta] fetchWatchPage: ignored stale response videoId=${videoId} current=${this.data.videoId}`);
					return this.data;
				}

				this._storeFetchedHtml(videoId, html);
				const fetchedYtInitialData = this._extractInlineJsonByMarker(html, 'var ytInitialData = ');
				const fetchedPlayerResponse = this._extractInlineJsonByMarker(html, 'var ytInitialPlayerResponse = ');
				// console.debug(`[improved:meta] fetchWatchPage: parsed videoId=${videoId} ytInitialData=${Boolean(fetchedYtInitialData)} ytInitialPlayerResponse=${Boolean(fetchedPlayerResponse)}`);
				if (!fetchedYtInitialData && !fetchedPlayerResponse) {
					console.warn(`[improved:meta] fetchWatchPage: fetched html did not contain ytInitialData or ytInitialPlayerResponse videoId=${videoId}`);
				}

				// Keep fetched inline payloads as the raw fallback source for deferred metadata loaders.
				this.rawYtInitialData = fetchedYtInitialData;
				this.rawYtInitialPlayerResponse = fetchedPlayerResponse;
				this._applyPartialData(this._buildPlayerPartial(fetchedPlayerResponse, videoId), 'fetchedPlayerResponse');

				if (VIDEO_METADATA_BASE_KEYS.some(key => !this._hasValue(this.data[key]))) {
					const doc = this._parseFetchedHtml(videoId);
					if (doc) {
						console.debug(`[improved:meta] fetchWatchPage: applying fetched DOM partial videoId=${videoId}`);
						this._applyPartialData(this._buildDomPartial(doc, videoId, this.data.title), 'fetchedDom');
					}
				} else {
					console.debug(`[improved:meta] fetchWatchPage: skipped fetched HTML parsing videoId=${videoId}`);
				}

				this.state.fetchStatus = 'done';
				this.state.lastUpdate = Date.now();
				// console.debug(`[improved:meta] fetchWatchPage: done videoId=${videoId}`);
				return this.data;
			}).catch(error => {
				this.state.fetchStatus = 'failed';
				console.error('[improved:meta] fetchWatchPage: failed', {error: error, dump: this.dumpData()});
				return this.data;
			}).finally(() => {
				// console.debug(`[improved:meta] fetchWatchPage: finalize videoId=${videoId} status=${this.state.fetchStatus}`, this.dumpData());
				console.debug(`[improved:meta] fetchWatchPage: finalize videoId=${videoId} status=${this.state.fetchStatus}`);
				this.fetchPromise = null;
			});

		return this.fetchPromise;
	},
	_readMicroformat: function (doc) {
		try {
			const text = doc.querySelector('#microformat script')?.textContent;
			return text ? JSON.parse(text) : null;
		} catch (error) {
			return null;
		}
	},
	_getSafeHtmlForParser: function (html) {
		if (!html || typeof html !== 'string') {
			return null;
		}
		if (!window.trustedTypes || typeof window.trustedTypes.createPolicy !== 'function') {
			return null;
		}
		if (!videoMetadataTrustedTypesPolicy) {
			try {
				videoMetadataTrustedTypesPolicy = window.trustedTypes.createPolicy('improvedtube-metadata-parser', {
					createHTML: value => value,
				});
			} catch (error) {
				console.warn('[improved:meta] getSafeHtmlForParser: failed to create Trusted Types policy', error);
				return null;
			}
		}
		try {
			const trustedHtml = videoMetadataTrustedTypesPolicy.createHTML(html);
			return trustedHtml;
		} catch (error) {
			console.warn('[improved:meta] getSafeHtmlForParser: failed to convert html to TrustedHTML', error);
			return null;
		}
	},
	_extractInlineJsonByMarker: function (text, marker) {
		if (!text) {
			return null;
		}

		const markerIndex = text.indexOf(marker);
		if (markerIndex === -1) {
			return null;
		}

		const objectText = this._extractInlineObjectLiteral(text, markerIndex + marker.length);
		if (!objectText) {
			console.warn(`[improved:meta] extractInlineJsonByMarker: failed to find object literal for marker=${marker}`);
			return null;
		}

		try {
			return JSON.parse(objectText);
		} catch (error) {
			console.warn(`[improved:meta] extractInlineJsonByMarker: failed to parse JSON for marker=${marker}`, error);
		}

		return null;
	},
	_extractInlineObjectLiteral: function (text, startIndex) {
		const objectStart = text.indexOf('{', startIndex);
		if (objectStart === -1) {
			return null;
		}
		// Extract the first balanced object literal after startIndex, ignoring braces inside quoted strings.
		let depth = 0;
		let quote = '';
		let escaped = false;
		for (let index = objectStart; index < text.length; index++) {
			const char = text[index];

			if (quote) {
				if (escaped) {
					escaped = false;
					continue;
				}
				if (char === '\\') {
					escaped = true;
					continue;
				}
				if (char === quote) {
					quote = '';
				}
				continue;
			}

			if (char === '"' || char === '\'') {
				quote = char;
				continue;
			}
			if (char === '{') {
				depth++;
				continue;
			}
			if (char === '}') {
				depth--;
				if (depth === 0) {
					return text.slice(objectStart, index + 1);
				}
			}
		}

		return null;
	},
	_buildPlayerPartial: function (playerResponse, expectedVideoId) {
		if (!playerResponse) {
			return null;
		}

		const responseVideoId = this._getPlayerResponseVideoId(playerResponse);
		if (responseVideoId && expectedVideoId && responseVideoId !== expectedVideoId) {
			console.warn(`[improved:meta] buildPlayerPartial: playerResponse videoId mismatch response=${responseVideoId} expected=${expectedVideoId}`);
			return null;
		}

		const lengthSeconds = this._normalizeLengthSeconds(
			playerResponse?.videoDetails?.lengthSeconds
			|| playerResponse?.microformat?.playerMicroformatRenderer?.lengthSeconds
		);

		return {
			title: this._normalizeText(playerResponse?.videoDetails?.title),
			keywords: this._normalizeKeywords(playerResponse?.videoDetails?.keywords),
			genre: this._normalizeText(playerResponse?.microformat?.playerMicroformatRenderer?.category),
			duration: this._secondsToIsoDuration(lengthSeconds),
			lengthSeconds,
		};
	},
	_buildDomPartial: function (doc, expectedVideoId, currentTitle) {
		const partial = {};
		const metaTitle = this._normalizeText(doc.querySelector('meta[name="title"]')?.getAttribute('content'));
		// Do not use link[rel="canonical"] here; YouTube may update it after SPA navigation.
		const metaVideoId = this._extractVideoIdFromUrl(doc.querySelector('meta[property="og:url"]')?.getAttribute('content') || '');
		const metaLooksCurrent = metaVideoId
			? metaVideoId === expectedVideoId
			: Boolean(metaTitle && currentTitle && metaTitle === currentTitle);

		if (metaLooksCurrent) {
			partial.title = metaTitle;
			partial.keywords = this._normalizeKeywords(doc.querySelector('meta[name="keywords"]')?.getAttribute('content'));
		}

		const microformat = this._readMicroformat(doc);
		const microformatVideoId = this._extractVideoIdFromUrl(microformat?.['@id'] || microformat?.embedUrl || '');
		const microformatTitle = this._normalizeText(microformat?.name);
		const microformatLooksCurrent = microformatVideoId
			? microformatVideoId === expectedVideoId
			: Boolean(microformatTitle && currentTitle && microformatTitle === currentTitle);

		if (microformatLooksCurrent) {
			partial.title = partial.title || microformatTitle;
			partial.genre = partial.genre || this._normalizeText(microformat?.genre);
			partial.duration = partial.duration || this._normalizeText(microformat?.duration);
			partial.lengthSeconds = partial.lengthSeconds || this._isoDurationToSeconds(partial.duration);
		}

		return partial;
	},
	_extractMarkerData: function (rootObject) {
		try {
			if (!rootObject || typeof rootObject !== 'object') {
				return null;
			}

			let mostReplayedMarkers = null;
			let heatmapMarkers = null;
			const mutations = rootObject?.frameworkUpdates?.entityBatchUpdate?.mutations || [];
			for (const mutation of mutations) {
				const markersList = mutation?.payload?.macroMarkersListEntity?.markersList;
				if (!markersList) {
					continue;
				}

				const decorations = markersList?.markersDecoration?.timedMarkerDecorations;
				if (mostReplayedMarkers == null && Array.isArray(decorations) && decorations.length) {
					mostReplayedMarkers = decorations;
				}
				if (
					heatmapMarkers == null
					&& markersList.markerType === 'MARKER_TYPE_HEATMAP'
					&& Array.isArray(markersList.markers)
					&& markersList.markers.length
				) {
					heatmapMarkers = markersList.markers;
				}
				if (mostReplayedMarkers && heatmapMarkers) {
					break;
				}
			}

			// Fallback: only heatmap markers are searched recursively outside the expected mutations path.
			if (heatmapMarkers == null) {
				heatmapMarkers = this._findHeatmapMarkers(rootObject);
			}

			if (mostReplayedMarkers == null && heatmapMarkers == null) {
				return null;
			}

			return {
				mostReplayedMarkers,
				heatmapMarkers: heatmapMarkers?.length ? heatmapMarkers : null,
			};
		} catch (error) {
			console.warn('[improved:meta] extractMarkerData: failed', error);
			return null;
		}
	},
	_findHeatmapMarkers: function (value) {
		return this._findInObjectTree(value, current => {
			if (current.markerType === 'MARKER_TYPE_HEATMAP' && Array.isArray(current.markers)) {
				return current.markers;
			}
			if (current.key === 'MARKER_TYPE_HEATMAP' && Array.isArray(current.value?.markers)) {
				return current.value.markers;
			}
			return null;
		});
	},
	// rawYtInitialData.engagementPanels[n].engagementPanelSectionListRenderer.content.structuredDescriptionContentRenderer.items[n].horizontalCardListRenderer.header.richListHeaderRenderer.subtitle.simpleText
	//  ....{"header":{"richListHeaderRenderer":{"title":{"simpleText":"Music"},"subtitle":{"simpleText":"6 songs"},...
	_findSongCount: function (value) {
		return this._findInObjectTree(value, current => {
			if (!Object.prototype.hasOwnProperty.call(current, 'richListHeaderRenderer')) {
				return null;
			}
			const match = current.richListHeaderRenderer.subtitle?.simpleText?.match(/(\d*)\s/);
			return match ? match[1] : null;
		});
	},
	_walkObjectTree: function (value, visitor, path = '') {
		if (value === null || typeof value !== 'object') {
			return true;
		}
		if (visitor(value, path) === false) {
			return false;
		}
		if (Array.isArray(value)) {
			for (let index = 0; index < value.length; index++) {
				if (this._walkObjectTree(value[index], visitor, `${path}[${index}]`) === false) {
					return false;
				}
			}
			return true;
		}
		for (const key in value) {
			if (!Object.prototype.hasOwnProperty.call(value, key)) {
				continue;
			}
			const currentPath = path ? `${path}.${key}` : key;
			if (this._walkObjectTree(value[key], visitor, currentPath) === false) {
				return false;
			}
		}
		return true;
	},
	_findInObjectTree: function (value, matcher) {
		try {
			let result = null;
			this._walkObjectTree(value, (current, path) => {
				const match = matcher(current, path);
				if (match !== null && match !== undefined) {
					result = match;
					return false;
				}
			});
			return result;
		} catch (error) {
			console.warn('[improved:meta] findInObjectTree: failed', error);
			return null;
		}
	},
	_applyPartialData: function (partialData, sourceName) {
		if (!partialData) {
			return;
		}

		for (const key of VIDEO_METADATA_BASE_KEYS) {
			this._setValue(key, partialData[key], sourceName);
		}
	},
	_setValue: function (key, value, sourceName) {
		if (!this._hasValue(value) || this._hasValue(this.data[key])) {
			return false;
		}
		// console.debug(`[improved:meta] _setValue: key=${key}, value=${value}, source=${sourceName}`);

		this.data[key] = value;
		this.state.source[key] = sourceName;
		return true;
	},
	_hasValue: function (value) {
		if (Array.isArray(value)) {
			return value.length > 0;
		}
		return value !== null && value !== undefined && value !== '';
	},
	_normalizeText: function (value) {
		return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
	},
	_normalizeKeywords: function (value) {
		if (Array.isArray(value)) {
			return value.map(keyword => this._normalizeText(keyword)).filter(Boolean);
		}
		if (typeof value === 'string') {
			return value.split(',').map(keyword => this._normalizeText(keyword)).filter(Boolean);
		}
		return null;
	},
	_normalizeLengthSeconds: function (value) {
		const lengthSeconds = Number(value);
		return Number.isFinite(lengthSeconds) && lengthSeconds > 0 ? lengthSeconds : null;
	},
	_secondsToIsoDuration: function (value) {
		const totalSeconds = this._normalizeLengthSeconds(value);
		if (!totalSeconds) {
			return null;
		}

		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		let iso = 'PT';
		if (hours) {
			iso += `${hours}H`;
		}
		if (minutes) {
			iso += `${minutes}M`;
		}
		if (seconds || iso === 'PT') {
			iso += `${seconds}S`;
		}
		return iso;
	},
	_isoDurationToSeconds: function (value) {
		if (!value || typeof value !== 'string') {
			return null;
		}

		const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
		if (!match) {
			return null;
		}

		const hours = Number(match[1] || 0);
		const minutes = Number(match[2] || 0);
		const seconds = Number(match[3] || 0);
		const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
		return totalSeconds > 0 ? totalSeconds : null;
	},
	_extractVideoIdFromUrl: function (value) {
		if (!value || typeof value !== 'string') {
			return null;
		}
		try {
			return this._getVideoId(value);
		} catch (error) {
			return value.match(/[?&]v=([a-zA-Z0-9_-]{11})/)?.[1]
				|| value.match(/\/embed\/([a-zA-Z0-9_-]{11})/)?.[1]
				|| null;
		}
	},
};
