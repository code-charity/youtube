/*
 * VideoMetadata resolves metadata and marker inputs for YouTube videos.
 * Metadata is cached in memory per video id and can remain available across YouTube SPA navigation.
 * It does not persist across page reloads or browser sessions.
 * The in-memory cache may remove stale entries through GC.
 *
 * The default cache size is tuned for current-video workflows where a few features may reuse
 * the same video metadata. If list or thumbnail workflows start resolving metadata for many
 * visible videos, revisit the entry limit and raw payload retention policy.
 */

// Source names are grouped by where the data comes from. The field table declares
// which source groups each field can use, and source resolvers prepare source state when needed:
// - currentPlayerResponse: current movie_player.getPlayerResponse(), or current ytInitialPlayerResponse fallback.
// - currentYtInitialData: live window.ytInitialData, gated by its current video endpoint.
// - currentDom: live DOM metadata, only when the DOM can prove it belongs to the current video.
// - fetchedYtInitialPlayerResponse: ytInitialPlayerResponse parsed from a fetched watch page.
// - fetchedYtInitialData: ytInitialData parsed from a fetched watch page.
// - fetchedDom: metadata parsed from a fetched watch page.
const SOURCE = {
	CURRENT_PLAYER_RESPONSE: 'currentPlayerResponse',
	CURRENT_YT_INITIAL_DATA: 'currentYtInitialData',
	CURRENT_DOM: 'currentDom',
	FETCHED_PLAYER_RESPONSE: 'fetchedYtInitialPlayerResponse',
	FETCHED_YT_INITIAL_DATA: 'fetchedYtInitialData',
	FETCHED_DOM: 'fetchedDom',
};
// Common source groups used by the field table below.
const SOURCE_PRIORITY_PLAYER_AND_DOM = Object.freeze([SOURCE.CURRENT_PLAYER_RESPONSE, SOURCE.CURRENT_DOM, SOURCE.FETCHED_PLAYER_RESPONSE, SOURCE.FETCHED_DOM]);
const SOURCE_PRIORITY_PLAYER_RESPONSE_ONLY = Object.freeze([SOURCE.CURRENT_PLAYER_RESPONSE, SOURCE.FETCHED_PLAYER_RESPONSE]);
const SOURCE_PRIORITY_YT_INITIAL_DATA = Object.freeze([SOURCE.CURRENT_YT_INITIAL_DATA, SOURCE.FETCHED_YT_INITIAL_DATA]);

// Field-to-source mapping defines the current metadata schema.
const VIDEO_METADATA_SOURCE_PRIORITY = {
	title: SOURCE_PRIORITY_PLAYER_AND_DOM,
	genre: SOURCE_PRIORITY_PLAYER_AND_DOM, // Video category.
	lengthSeconds: SOURCE_PRIORITY_PLAYER_AND_DOM,
	duration: SOURCE_PRIORITY_PLAYER_AND_DOM,
	// keywords: Explicit video keywords from player responses. DOM meta keywords
	// are intentionally ignored because YouTube may auto-fill generic localized
	// defaults when explicit keywords are missing.
	keywords: SOURCE_PRIORITY_PLAYER_RESPONSE_ONLY,
	url: SOURCE_PRIORITY_PLAYER_RESPONSE_ONLY, // canonicalUrl -> url, exposed through player microformat.
	channelId: SOURCE_PRIORITY_PLAYER_RESPONSE_ONLY,
	channelName: SOURCE_PRIORITY_PLAYER_RESPONSE_ONLY, // ownerChannelName -> channelName, exposed through player microformat.
	handle: SOURCE_PRIORITY_PLAYER_RESPONSE_ONLY, // YouTube channel @handle, including the leading "@", extracted from ownerProfileUrl (already URI-decoded).
	author: SOURCE_PRIORITY_PLAYER_RESPONSE_ONLY,
	publishDate: SOURCE_PRIORITY_PLAYER_RESPONSE_ONLY,
	uploadDate: SOURCE_PRIORITY_PLAYER_RESPONSE_ONLY,
	// Marker data and song count are exposed through ytInitialData trees, not player metadata.
	mostReplayedMarkers: SOURCE_PRIORITY_YT_INITIAL_DATA,
	heatmapMarkers: SOURCE_PRIORITY_YT_INITIAL_DATA,
	amountOfSongs: SOURCE_PRIORITY_YT_INITIAL_DATA, // Heuristic song-count field.
};
const ALL_METADATA_KEYS = Object.keys(VIDEO_METADATA_SOURCE_PRIORITY);
// Fields resolved by getDataAsync() when options.keys is not provided.
// This is the default set for normal feature code, not the complete metadata schema.
const DEFAULT_METADATA_KEYS = ['title', 'keywords', 'genre', 'lengthSeconds', 'channelId', 'channelName', 'handle', 'url'];

ImprovedTube.VideoMetadata = {
	entries: new Map(),
	// Retains fetched watch-page HTML for development/debugging when enabled.
	debugKeepFetchedWatchPageHtml: false,

	/**
	 * Resolves selected metadata fields asynchronously, defaulting to the standard metadata keys.
	 * 
	 * @param {Object} [options] - Optional configuration object.
	 * @param {boolean} [options.force] - Whether to recreate the target-video cache entry before resolving.
	 * @param {string[]} [options.keys] - Optional custom array of metadata field keys to resolve.
	 * @param {string} [options.videoId] - Optional target video id; defaults to the current video.
	 * @returns {Promise<Object|null>} The resolved metadata data object, or null when no target video id is available.
	 */
	getDataAsync: async function (options) {
		let entry = null;
		try {
			const {
				force = false,
				keys = DEFAULT_METADATA_KEYS,
			} = options || {};

			const videoId = this._getTargetVideoId(options);
			if (!videoId) {
				return null;
			}

			entry = this._getEntry(videoId, force);
			if (!entry) {
				return null;
			}
			this._resetFailedSources(entry);

			// getDataAsync() eagerly resolves the selected metadata fields.
			// Leave expensive or feature-specific fields lazy and load them through focused getters.
			for (const key of keys) {
				await this._getEntryFieldAsync(entry, key, {force: false});
			}
		} catch (error) {
			this._log.warn('getDataAsync: failed', error);
		}
		return entry?.data || null;
	},

	// Public diagnostic helper that resolves all metadata fields.
	// Returns null when no target video id is available.
	// Some deferred fields, such as markers and song counts, may trigger extra work;
	// prefer focused getters or getDataAsync() for normal feature code.
	getAllDataAsync: async function (options) {
		try {
			return await this.getDataAsync({...(options || {}), keys: ALL_METADATA_KEYS});
		} catch (error) {
			this._log.warn('getAllDataAsync: failed', error);
		}
		return null;
	},

	// Public field getters accept options.force=true to recreate the target-video cache entry
	// and options.videoId to resolve a specific target video.
	getTitleAsync: async function (options) {
		return this._getFieldAsync('title', options);
	},
	getGenreAsync: async function (options) {
		return this._getFieldAsync('genre', options);
	},
	getLengthSecondsAsync: async function (options) {
		return this._getFieldAsync('lengthSeconds', options);
	},
	getDurationAsync: async function (options) {
		return this._getFieldAsync('duration', options);
	},
	getKeywordsAsync: async function (options) {
		return this._getFieldAsync('keywords', options);
	},
	getUrlAsync: async function (options) {
		return this._getFieldAsync('url', options);
	},
	getChannelIdAsync: async function (options) {
		return this._getFieldAsync('channelId', options);
	},
	getChannelNameAsync: async function (options) {
		return this._getFieldAsync('channelName', options);
	},
	getHandleAsync: async function (options) {
		return this._getFieldAsync('handle', options);
	},
	getAuthorAsync: async function (options) {
		return this._getFieldAsync('author', options);
	},
	getPublishDateAsync: async function (options) {
		return this._getFieldAsync('publishDate', options);
	},
	getUploadDateAsync: async function (options) {
		return this._getFieldAsync('uploadDate', options);
	},
	// Returns null when marker data is unknown or not found; it does not mean no markers.
	getMostReplayedMarkersAsync: async function (options) {
		return this._getFieldAsync('mostReplayedMarkers', options);
	},
	// Returns null when marker data is unknown or not found; it does not mean no markers.
	getHeatmapMarkersAsync: async function (options) {
		return this._getFieldAsync('heatmapMarkers', options);
	},
	// Returns null when the song count is unknown or not found; it does not mean zero songs.
	// The value is heuristic because YouTube does not expose a stable song-count field.
	getAmountOfSongsAsync: async function (options) {
		return this._getFieldAsync('amountOfSongs', options);
	},

	/**
	 * Removes stale metadata cache entries.
	 *
	 * @param {Object} [options] - Optional garbage-collection settings.
	 * @param {number|null} [options.maxEntries=50] - Target maximum entries after pruning removable entries; null disables count-based pruning, and invalid values fall back to the default.
	 * @param {number|null} [options.maxAgeMs=1800000] - Maximum idle time in milliseconds since lastAccessedAt; null disables age-based pruning, and invalid values fall back to the default.
	 * @param {boolean} [options.keepCurrent=true] - Whether to protect the current video entry from removal.
	 * @param {boolean} [options.dryRun=false] - Whether to report candidates without deleting entries.
	 * @returns {Object} Summary of removed or candidate cache entries and skipped entries.
	 */
	gc: function (options) {
		const defaultMaxEntries = 50;
		const defaultMaxAgeMs = 30 * 60 * 1000;
		const before = this.entries?.size || 0;
		const result = {
			before,
			after: before,
			removed: [],
			skipped: {
				current: [],
				pending: [],
			},
		};
		if (!this.entries || !before) {
			return result;
		}

		const now = Date.now();
		const {
			maxEntries: optionMaxEntries,
			maxAgeMs: optionMaxAgeMs,
			keepCurrent = true,
			dryRun = false,
		} = options || {};
		const normalizedMaxEntries = Math.floor(optionMaxEntries);
		const maxEntries = optionMaxEntries === null
			? null
			: (Number.isFinite(optionMaxEntries) && normalizedMaxEntries > 0)
				? normalizedMaxEntries
				: defaultMaxEntries;
		const maxAgeMs = optionMaxAgeMs === null
			? null
			: (Number.isFinite(optionMaxAgeMs) && optionMaxAgeMs > 0)
				? optionMaxAgeMs
				: defaultMaxAgeMs;
		const currentVideoId = keepCurrent ? this._getVideoId() : null;
		const removableEntries = [];

		for (const [videoId, entry] of this.entries) {
			const sourceStatuses = Object.values(entry?.state?.sourceStatus || {});
			const isPending = Boolean(entry?.fetchPromise)
				|| entry?.state?.fetchStatus === 'pending'
				|| sourceStatuses.includes('pending');
			if (isPending) {
				result.skipped.pending.push(videoId);
				continue;
			}
			if (currentVideoId && videoId === currentVideoId) {
				result.skipped.current.push(videoId);
				continue;
			}
			removableEntries.push({
				videoId,
				lastAccessedAt: entry?.state?.lastAccessedAt || 0,
			});
		}

		const removeIds = new Set();
		if (maxAgeMs !== null) {
			for (const entry of removableEntries) {
				if (now - entry.lastAccessedAt > maxAgeMs) {
					removeIds.add(entry.videoId);
				}
			}
		}

		if (maxEntries !== null && before - removeIds.size > maxEntries) {
			const excess = before - removeIds.size - maxEntries;
			const entriesByAccess = removableEntries
				.filter(entry => !removeIds.has(entry.videoId))
				.sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
			for (const entry of entriesByAccess.slice(0, excess)) {
				removeIds.add(entry.videoId);
			}
		}

		result.removed = Array.from(removeIds);
		if (!dryRun) {
			for (const videoId of removeIds) {
				this.entries.delete(videoId);
			}
		}
		result.after = dryRun ? before : this.entries.size;
		return result;
	},

	// Public diagnostic helper for listing cached metadata entry video ids during development.
	// Use the returned ids with dumpData({videoId}) to inspect a specific entry.
	dumpEntryVideoIds: function () {
		return this.entries ? Array.from(this.entries.keys()) : [];
	},

	// Public diagnostic helper for inspecting cached metadata entries during development.
	// Pass options.videoId to inspect a specific entry.
	// Pass options.raw=true to include raw fetched JSON payloads; fetched HTML stays length-only.
	dumpData: function (options) {
		try {
			const videoId = this._getTargetVideoId(options);
			if (!videoId) {
				return null;
			}

			const entry = this.entries?.get(videoId) || null;
			return this._dumpEntry(entry, {raw: Boolean(options?.raw)});
		} catch (error) {
			this._log.warn('dumpData: failed', error);
		}
		return null;
	},

	_dumpEntry: function (entry, options) {
		if (!entry) {
			return null;
		}

		const raw = Boolean(options?.raw);
		return structuredClone({
			data: entry.data,
			state: entry.state,
			rawFetchedYtInitialData: raw
				? entry.rawFetchedYtInitialData
				: (entry.rawFetchedYtInitialData ? '(object)' : null),
			rawFetchedYtInitialPlayerResponse: raw
				? entry.rawFetchedYtInitialPlayerResponse
				: (entry.rawFetchedYtInitialPlayerResponse ? '(object)' : null),
			rawFetchedWatchPageHtml: entry.rawFetchedWatchPageHtml
				? `(html length=${entry.rawFetchedWatchPageHtml.length})`
				: null,
			fetchPromise: entry.fetchPromise ? '(promise)' : null,
		});
	},

	_getFieldAsync: async function (key, options) {
		const { force = false } = options || {};
		const videoId = this._getTargetVideoId(options);
		if (!videoId) {
			return null;
		}
		const entry = this._getEntry(videoId, force);
		this._resetFailedSources(entry);
		return this._getEntryFieldAsync(entry, key, options);
	},

	_resetFailedSources: function (entry) {
		if (!entry?.state?.sourceStatus) {
			return;
		}

		const {state} = entry;
		if (state.sourceStatus.fetchedWatchPage === 'failed'
			|| (state.sourceStatus[SOURCE.FETCHED_DOM] === 'failed' && !entry.rawFetchedWatchPageHtml)) {
			state.fetchStatus = 'idle';
			state.sourceStatus.fetchedWatchPage = 'idle';
			state.sourceStatus[SOURCE.FETCHED_DOM] = 'idle';
			state.sources[SOURCE.FETCHED_PLAYER_RESPONSE] = null;
			state.sources[SOURCE.FETCHED_DOM] = null;
			entry.rawFetchedWatchPageHtml = null;
			entry.rawFetchedYtInitialData = null;
			entry.rawFetchedYtInitialPlayerResponse = null;
			return;
		}

		if (state.sourceStatus[SOURCE.FETCHED_DOM] === 'failed') {
			state.sourceStatus[SOURCE.FETCHED_DOM] = 'idle';
			state.sources[SOURCE.FETCHED_DOM] = null;
		}
	},

	_getEntry: function (videoId, force = false) {
		if (!videoId) {
			this._log.debug?.(`getEntry skipped ${this._formatDebugFields({reason: 'noVideoId'})}`);
			return null;
		}

		const now = Date.now();
		if (!this.entries) {
			this.entries = new Map();
		}
		const hadEntry = this.entries.has(videoId);
		const createdEntry = force || !hadEntry;
		if (createdEntry) {
			this.entries.set(videoId, this._createEntry(videoId, now));
			if (force && hadEntry) {
				this._log.debug?.(`getEntry recreated ${this._formatDebugFields({videoId, force: true})}`);
			}
		}
		const entry = this.entries.get(videoId);
		if (entry) {
			entry.state.lastAccessedAt = now;
		}
		if (createdEntry) {
			const gcResult = this.gc();
			if (gcResult.removed.length) {
				this._log.debug?.(`getEntry gc ${this._formatDebugFields({
					removed: gcResult.removed.length,
					skippedCurrent: gcResult.skipped.current.length,
					skippedPending: gcResult.skipped.pending.length,
					before: gcResult.before,
					after: gcResult.after,
				})}`);
			}
		}
		return entry;
	},

	_createEntry: function (videoId, now = Date.now()) {
		const data = {videoId};
		for (const key of ALL_METADATA_KEYS) {
			data[key] = null;
		}

		return {
			data,
			state: {
				fetchStatus: 'idle',
				lastFetchReason: null,
				lastAccessedAt: now,
				lastUpdate: 0,
				source: {},
				sources: {
					[SOURCE.CURRENT_PLAYER_RESPONSE]: null,
					[SOURCE.CURRENT_DOM]: null,
					[SOURCE.FETCHED_PLAYER_RESPONSE]: null,
					[SOURCE.FETCHED_DOM]: null,
				},
				// fetchedWatchPage prepares fetchedYtInitialPlayerResponse and fetchedYtInitialData.
				// fetchedDom is prepared alongside fetched player data.
				// currentYtInitialData and fetchedYtInitialData are read from live/raw payloads.
				sourceStatus: {
					[SOURCE.CURRENT_PLAYER_RESPONSE]: 'idle',
					[SOURCE.CURRENT_DOM]: 'idle',
					[SOURCE.FETCHED_DOM]: 'idle',
					fetchedWatchPage: 'idle',
				},
			},
			rawFetchedYtInitialData: null,
			rawFetchedYtInitialPlayerResponse: null,
			// Released after DOM metadata extraction unless debugKeepFetchedWatchPageHtml is enabled.
			rawFetchedWatchPageHtml: null,
			fetchPromise: null,
		};
	},

	_getEntryFieldAsync: async function (entry, key, options) {
		if (!entry) {
			this._log.warn(`getEntryFieldAsync: missing entry for key=${key}`);
			return null;
		}

		try {
			const { force = false } = options || {};
			const videoId = entry.data.videoId;
			if (!videoId) {
				this._log.debug?.(`getEntryFieldAsync noVideoId ${this._formatDebugFields({key, force: Boolean(force)})}`);
				this._setNotFound(entry, key);
				return entry.data[key];
			}
			if (!force && this._isFieldResolved(entry, key)) {
				this._log.debug?.(`getEntryFieldAsync cacheHit ${this._formatDebugFields({key, videoId, source: entry.state.source[key] || '', value: entry.data[key]})}`);
				return entry.data[key];
			}

			this._log.debug?.(`getEntryFieldAsync resolving ${this._formatDebugFields({key, videoId, force: Boolean(force)})}`);
			await this._resolveField(entry, key);
			if (!this._isFieldResolved(entry, key)) {
				this._setNotFound(entry, key);
			}
		} catch (error) {
			this._log.warn(`getEntryFieldAsync: failed for key=${key}`, error);
			this._setNotFound(entry, key);
		}
		this._log.debug?.(`getEntryFieldAsync done ${this._formatDebugFields({key, source: entry?.state?.source?.[key] || '', value: entry?.data?.[key]})}`);
		return entry.data[key];
	},

	_resolveField: async function (entry, key) {
		const videoId = entry.data.videoId;
		const priority = VIDEO_METADATA_SOURCE_PRIORITY[key];
		if (!priority) {
			this._log.warn(`resolveField priorityMissing ${this._formatDebugFields({key, videoId})}`);
			return;
		}

		this._log.debug?.(`resolveField resolving ${this._formatDebugFields({key, videoId, priority: priority.join(', ')})}`);
		for (const sourceName of priority) {
			const sourceReady = await this._ensureSource(entry, sourceName);
			if (!sourceReady) {
				continue;
			}
			const value = this._getFieldFromSource(entry, key, sourceName);
			this._log.debug?.(`resolveField tryingSource ${this._formatDebugFields({source: sourceName, key, value})}`);
			if (this._setValue(entry, key, value, sourceName)) {
				this._syncDurationFields(entry);
				this._log.debug?.(`resolveField filled ${this._formatDebugFields({key, source: sourceName})}`);
				return;
			}
		}

		this._syncDurationFields(entry);
		this._log.debug?.(`resolveField noValueSet ${this._formatDebugFields({
			key,
			videoId,
			resolved: this._isFieldResolved(entry, key),
			source: entry.state.source[key] || '',
			value: entry.data[key],
		})}`);
	},

	_getVideoId: function (url = document.URL) {
		if (!url || typeof url !== 'string') {
			return null;
		}
		return url.match(ImprovedTube.regex.video_id)?.[1] || null;
	},

	_getTargetVideoId: function (options) {
		if (!options || !Object.prototype.hasOwnProperty.call(options, 'videoId')) {
			return this._getVideoId();
		}
		if (typeof options.videoId !== 'string') {
			return null;
		}

		const videoId = options.videoId.trim();
		return /^[a-zA-Z0-9_-]{11}$/.test(videoId) ? videoId : null;
	},

	_isCurrentVideoId: function (videoId) {
		return Boolean(videoId) && videoId === this._getVideoId();
	},

	_isCurrentSource: function (sourceName) {
		return sourceName === SOURCE.CURRENT_PLAYER_RESPONSE
			|| sourceName === SOURCE.CURRENT_YT_INITIAL_DATA
			|| sourceName === SOURCE.CURRENT_DOM;
	},

	_sourceResolvers: {
		[SOURCE.CURRENT_PLAYER_RESPONSE]: async function (entry) {
			await this._ensureCurrentPlayerResponseSource(entry);
		},
		[SOURCE.CURRENT_YT_INITIAL_DATA]: function () {
			// window.ytInitialData is read live when the field is requested.
		},
		[SOURCE.CURRENT_DOM]: function (entry) {
			this._ensureCurrentDomSource(entry);
		},
		[SOURCE.FETCHED_PLAYER_RESPONSE]: async function (entry, sourceName) {
			await this._ensureFetchedWatchPage(entry, 'required:' + sourceName);
		},
		[SOURCE.FETCHED_YT_INITIAL_DATA]: async function (entry, sourceName) {
			await this._ensureFetchedWatchPage(entry, 'required:' + sourceName);
		},
		[SOURCE.FETCHED_DOM]: async function (entry, sourceName) {
			await this._ensureFetchedWatchPage(entry, 'required:' + sourceName);
		},
	},

	_ensureSource: async function (entry, sourceName) {
		const videoId = entry.data.videoId;
		this._log.debug?.(`ensureSource resolving ${this._formatDebugFields({source: sourceName, videoId})}`);
		if (this._isCurrentSource(sourceName) && !this._isCurrentVideoId(videoId)) {
			this._log.debug?.(`ensureSource skipped ${this._formatDebugFields({source: sourceName, videoId, reason: 'notCurrentVideo'})}`);
			return false;
		}

		const resolver = this._sourceResolvers[sourceName];
		if (!resolver) {
			this._log.warn(`ensureSource resolverMissing ${this._formatDebugFields({source: sourceName, videoId})}`);
			return false;
		}
		await resolver.call(this, entry, sourceName);
		return true;
	},

	_ensureCurrentPlayerResponseSource: async function (entry) {
		const videoId = entry.data.videoId;
		if (entry.state.sourceStatus[SOURCE.CURRENT_PLAYER_RESPONSE] === 'done') {
			this._log.debug?.(`ensureCurrentPlayerResponseSource cacheHit ${this._formatDebugFields({videoId, hasSource: Boolean(entry.state.sources[SOURCE.CURRENT_PLAYER_RESPONSE])})}`);
			return;
		}

		let playerResponseSource = this._readCurrentPlayerResponseSource(videoId);
		if (!playerResponseSource) {
			// A missing player response source is allowed; field resolution will continue with fallback sources.
			await this._waitForCurrentPlayerResponseSource(entry);
			playerResponseSource = this._readCurrentPlayerResponseSource(videoId);
		}

		entry.state.sources[SOURCE.CURRENT_PLAYER_RESPONSE] = playerResponseSource;
		entry.state.sourceStatus[SOURCE.CURRENT_PLAYER_RESPONSE] = 'done';
		entry.state.lastUpdate = Date.now();
		this._log.debug?.(
			`ensureCurrentPlayerResponseSource done ${this._formatDebugFields({videoId, hasSource: Boolean(playerResponseSource), keys: this._formatDebugKeys(playerResponseSource?.metadata)})}`,
			playerResponseSource?.metadata || null
		);
	},

	_ensureCurrentDomSource: function (entry) {
		const videoId = entry.data.videoId;
		if (entry.state.sourceStatus[SOURCE.CURRENT_DOM] === 'done') {
			this._log.debug?.(`ensureCurrentDomSource cacheHit ${this._formatDebugFields({videoId, hasSource: Boolean(entry.state.sources[SOURCE.CURRENT_DOM])})}`);
			return;
		}

		entry.state.sources[SOURCE.CURRENT_DOM] = this._readCurrentDomSource(videoId);
		entry.state.sourceStatus[SOURCE.CURRENT_DOM] = 'done';
		entry.state.lastUpdate = Date.now();
		this._log.debug?.(
			`ensureCurrentDomSource done ${this._formatDebugFields({videoId, hasSource: Boolean(entry.state.sources[SOURCE.CURRENT_DOM]), keys: this._formatDebugKeys(entry.state.sources[SOURCE.CURRENT_DOM]?.metadata)})}`,
			entry.state.sources[SOURCE.CURRENT_DOM]?.metadata || null
		);
	},

	_ensureFetchedWatchPage: async function (entry, reason) {
		const videoId = entry.data.videoId;
		if (entry.state.sourceStatus.fetchedWatchPage === 'done') {
			if (entry.state.sourceStatus[SOURCE.FETCHED_DOM] === 'idle' && entry.rawFetchedWatchPageHtml) {
				this._ensureFetchedDomSource(entry);
			}
			this._log.debug?.(`ensureFetchedWatchPage cacheHit ${this._formatDebugFields({videoId, status: 'done', reason: reason || ''})}`);
			return;
		}
		if (entry.state.sourceStatus.fetchedWatchPage === 'failed') {
			this._log.debug?.(`ensureFetchedWatchPage skippedAfterFailure ${this._formatDebugFields({videoId, reason: reason || '', lastFetchReason: entry.state.lastFetchReason || ''})}`);
			return;
		}

		if (!videoId) {
			this._log.debug?.(`ensureFetchedWatchPage skipped ${this._formatDebugFields({reason: 'noVideoId'})}`);
			return null;
		}
		// Reuse the in-flight watch-page fetch so concurrent field requests do not duplicate network work.
		if (entry.fetchPromise) {
			this._log.debug?.(`ensureFetchedWatchPage coalesced ${this._formatDebugFields({videoId, reason: reason || ''})}`);
			return entry.fetchPromise;
		}

		entry.state.fetchStatus = 'pending';
		entry.state.sourceStatus.fetchedWatchPage = 'pending';
		entry.state.lastFetchReason = reason;
		this._log.debug?.(`ensureFetchedWatchPage fetching ${this._formatDebugFields({videoId, reason: reason || ''})}`);

		// Use the watch URL as the metadata fetch path, including for Shorts video ids.
		const fetchPromise = fetch(`https://www.youtube.com/watch?v=${videoId}`, {credentials: 'same-origin'})
			.then(response => {
				// HTTP failures should ideally be classified by status (for example, retryable vs. permanent).
				// For now, all non-2xx responses are recorded as a failed fetch.
				if (!response.ok) {
					throw new Error(`watch page fetch failed: HTTP ${response.status}`);
				}
				return response.text();
			})
			.then(html => {
				const fetchedYtInitialPlayerResponse = this._extractInlineJsonByMarker(html, 'var ytInitialPlayerResponse = ');
				const fetchedYtInitialData = this._extractInlineJsonByMarker(html, 'var ytInitialData = ');

				entry.rawFetchedYtInitialPlayerResponse = this._isPlayerResponseCurrent(fetchedYtInitialPlayerResponse, videoId)
					? fetchedYtInitialPlayerResponse
					: null;
				entry.rawFetchedYtInitialData = fetchedYtInitialData || null;
				entry.state.sources[SOURCE.FETCHED_PLAYER_RESPONSE] = entry.rawFetchedYtInitialPlayerResponse
					? {
						metadata: this._buildPlayerMetadata(entry.rawFetchedYtInitialPlayerResponse, videoId),
					}
					: null;
				entry.rawFetchedWatchPageHtml = html;
				this._ensureFetchedDomSource(entry);
				if (!this.debugKeepFetchedWatchPageHtml) {
					entry.rawFetchedWatchPageHtml = null;
				}

				entry.state.fetchStatus = 'done';
				entry.state.sourceStatus.fetchedWatchPage = 'done';
				entry.state.lastUpdate = Date.now();
				const fetchDebugFields = {
					videoId,
					hasFetchedYtInitialPlayerResponse: Boolean(entry.state.sources[SOURCE.FETCHED_PLAYER_RESPONSE]),
					hasRetainedHtml: Boolean(entry.rawFetchedWatchPageHtml),
					fetchedDomStatus: entry.state.sourceStatus[SOURCE.FETCHED_DOM],
					hasFetchedYtInitialData: Boolean(entry.rawFetchedYtInitialData),
				};
				this._log.debug?.(
					`ensureFetchedWatchPage done ${this._formatDebugFields(fetchDebugFields)}`,
					{
						fetchedYtInitialPlayerResponseMetadata: entry.state.sources[SOURCE.FETCHED_PLAYER_RESPONSE]?.metadata || null,
						hasRetainedHtml: fetchDebugFields.hasRetainedHtml,
						hasFetchedYtInitialData: fetchDebugFields.hasFetchedYtInitialData,
					}
				);
				return entry.data;
			}).catch(error => {
				entry.state.fetchStatus = 'failed';
				entry.state.sourceStatus.fetchedWatchPage = 'failed';
				if (!this.debugKeepFetchedWatchPageHtml) {
					entry.rawFetchedWatchPageHtml = null;
				}
				this._log.warn('ensureFetchedWatchPage: failed', {error, videoId, reason});
				return entry.data;
			}).finally(() => {
				if (entry.fetchPromise === fetchPromise) {
					entry.fetchPromise = null;
				}
			});

		entry.fetchPromise = fetchPromise;
		return entry.fetchPromise;
	},

	_ensureFetchedDomSource: function (entry) {
		const videoId = entry.data.videoId;
		if (entry.state.sourceStatus[SOURCE.FETCHED_DOM] === 'done') {
			this._log.debug?.(`ensureFetchedDomSource cacheHit ${this._formatDebugFields({videoId, status: 'done', hasSource: Boolean(entry.state.sources[SOURCE.FETCHED_DOM])})}`);
			return;
		}
		if (entry.state.sourceStatus[SOURCE.FETCHED_DOM] === 'failed') {
			this._log.debug?.(`ensureFetchedDomSource skippedAfterFailure ${this._formatDebugFields({videoId, reason: 'previousFailure'})}`);
			return;
		}

		if (!entry.rawFetchedWatchPageHtml) {
			entry.state.sources[SOURCE.FETCHED_DOM] = null;
			entry.state.sourceStatus[SOURCE.FETCHED_DOM] = 'failed';
			this._log.debug?.(`ensureFetchedDomSource skipped ${this._formatDebugFields({videoId, reason: 'noFetchedHtml'})}`);
			entry.state.lastUpdate = Date.now();
			return;
		}

		try {
			const fetchedDocument = this._parseHtml(entry.rawFetchedWatchPageHtml);
			if (!fetchedDocument) {
				entry.state.sources[SOURCE.FETCHED_DOM] = null;
				entry.state.sourceStatus[SOURCE.FETCHED_DOM] = 'failed';
				this._log.debug?.(`ensureFetchedDomSource skipped ${this._formatDebugFields({videoId, reason: 'parseFailed'})}`);
				return;
			}

			const source = {metadata: this._buildDomMetadata(fetchedDocument, videoId, true)};
			entry.state.sources[SOURCE.FETCHED_DOM] = source;
			entry.state.sourceStatus[SOURCE.FETCHED_DOM] = 'done';
			this._log.debug?.(
				`ensureFetchedDomSource done ${this._formatDebugFields({videoId, hasSource: Boolean(source), keys: this._formatDebugKeys(source.metadata)})}`,
				source.metadata || null
			);
		} catch (error) {
			entry.state.sources[SOURCE.FETCHED_DOM] = null;
			entry.state.sourceStatus[SOURCE.FETCHED_DOM] = 'failed';
			this._log.warn('ensureFetchedDomSource: failed', {error, videoId});
		} finally {
			entry.state.lastUpdate = Date.now();
		}
	},

	_waitForCurrentPlayerResponseSource: async function (entry) {
		// YouTube can populate movie_player metadata after the page URL is already current.
		const videoId = entry.data.videoId;
		const startedAt = Date.now();
		this._log.debug?.(`waitForCurrentPlayerResponseSource waiting ${this._formatDebugFields({videoId})}`);
		while (Date.now() - startedAt < 600) {
			await new Promise(resolve => setTimeout(resolve, 50));
			if (!this._isCurrentVideoId(videoId)) {
				this._log.debug?.(`waitForCurrentPlayerResponseSource canceled ${this._formatDebugFields({videoId, currentVideoId: this._getVideoId() || ''})}`);
				return;
			}
			if (this._readCurrentPlayerResponseSource(videoId)) {
				this._log.debug?.(`waitForCurrentPlayerResponseSource found ${this._formatDebugFields({videoId, elapsedMs: Date.now() - startedAt})}`);
				return;
			}
		}
		this._log.debug?.(`waitForCurrentPlayerResponseSource timeout ${this._formatDebugFields({videoId, elapsedMs: Date.now() - startedAt})}`);
	},

	_readCurrentPlayerResponseSource: function (videoId) {
		const player = document.getElementById('movie_player') || window.movie_player;
		const playerResponse = this._readPlayerResponse(player);

		if (this._isPlayerResponseCurrent(playerResponse, videoId)) {
			this._log.debug?.(`readCurrentPlayerResponseSource found ${this._formatDebugFields({source: 'playerResponse', videoId})}`);
			return {
				metadata: this._buildPlayerMetadata(playerResponse, videoId),
			};
		}

		if (this._isPlayerResponseCurrent(window.ytInitialPlayerResponse, videoId)) {
			this._log.debug?.(`readCurrentPlayerResponseSource found ${this._formatDebugFields({source: 'window.ytInitialPlayerResponse', videoId})}`);
			return {
				metadata: this._buildPlayerMetadata(window.ytInitialPlayerResponse, videoId),
			};
		}

		this._log.debug?.(`readCurrentPlayerResponseSource notFound ${this._formatDebugFields({videoId, playerResponseVideoId: this._getPlayerResponseVideoId(playerResponse) || ''})}`);
		return null;
	},

	_readPlayerResponse: function (player) {
		try {
			return player?.getPlayerResponse?.() || null;
		} catch (error) {
			this._log.debug?.('readPlayerResponse failed', error);
			return null;
		}
	},

	_readCurrentDomSource: function (videoId) {
		const metadata = this._buildDomMetadata(document, videoId, false);
		this._log.debug?.(`readCurrentDomSource ${this._formatDebugFields({videoId, verified: Boolean(metadata), keys: this._formatDebugKeys(metadata)})}`);
		return metadata ? {metadata} : null;
	},

	_getFieldFromSource: function (entry, key, sourceName) {
		if (this._isCurrentSource(sourceName) && !this._isCurrentVideoId(entry.data.videoId)) {
			this._log.debug?.(`getFieldFromSource skipped ${this._formatDebugFields({source: sourceName, key, videoId: entry.data.videoId, reason: 'notCurrentVideo'})}`);
			return null;
		}

		if (sourceName === SOURCE.CURRENT_YT_INITIAL_DATA) {
			return this._getCurrentYtInitialDataField(entry, key);
		}
		if (sourceName === SOURCE.FETCHED_YT_INITIAL_DATA) {
			return this._getYtInitialDataField(key, entry.rawFetchedYtInitialData);
		}
		return entry.state.sources[sourceName]?.metadata?.[key];
	},

	_getCurrentYtInitialDataField: function (entry, key) {
		// window.ytInitialData may lag behind SPA navigation, so only use it when
		// the payload itself identifies the target video.
		const endpoint = window.ytInitialData?.currentVideoEndpoint;
		const endpointVideoId = this._normalizeText(endpoint?.watchEndpoint?.videoId);
		const endpointUrlVideoId = this._getVideoId(endpoint?.commandMetadata?.webCommandMetadata?.url || '');
		if (endpointVideoId !== entry.data.videoId && endpointUrlVideoId !== entry.data.videoId) {
			this._log.debug?.(`getCurrentYtInitialDataField unverified ${this._formatDebugFields({key, videoId: entry.data.videoId})}`);
			return null;
		}
		return this._getYtInitialDataField(key, window.ytInitialData);
	},

	_getYtInitialDataField: function (key, ytInitialDataRoot) {
		if (key === 'amountOfSongs') {
			return this._findSongCount(ytInitialDataRoot);
		}
		if (key === 'mostReplayedMarkers' || key === 'heatmapMarkers') {
			return this._extractMarkerData(ytInitialDataRoot)?.[key];
		}
		return null;
	},

	_buildPlayerMetadata: function (playerResponse, expectedVideoId) {
		if (!playerResponse) {
			return null;
		}

		const responseVideoId = this._getPlayerResponseVideoId(playerResponse);
		if (responseVideoId && expectedVideoId && responseVideoId !== expectedVideoId) {
			this._log.debug?.(`buildPlayerMetadata mismatch ${this._formatDebugFields({responseVideoId, expectedVideoId})}`);
			return null;
		}

		const lengthSeconds = this._normalizeLengthSeconds(
			playerResponse?.videoDetails?.lengthSeconds
			|| playerResponse?.microformat?.playerMicroformatRenderer?.lengthSeconds
		);

		let handle =this._normalizeText(playerResponse?.microformat?.playerMicroformatRenderer?.ownerProfileUrl)?.replace(/^https?:\/\/[^\/]+\//, '');
		try { handle = decodeURIComponent(handle); } catch {}
		const keywords = this._normalizeKeywords(playerResponse?.videoDetails?.keywords);

		return {
			title: this._normalizeText(playerResponse?.videoDetails?.title),
			keywords,
			genre: this._normalizeText(playerResponse?.microformat?.playerMicroformatRenderer?.category),
			duration: this._secondsToIsoDuration(lengthSeconds),
			lengthSeconds,
			author: this._normalizeText(playerResponse?.videoDetails?.author),
			url: this._normalizeText(playerResponse?.microformat?.playerMicroformatRenderer?.canonicalUrl),
			channelId: this._normalizeText(playerResponse?.videoDetails?.channelId),
			channelName: this._normalizeText(playerResponse?.microformat?.playerMicroformatRenderer?.ownerChannelName),
			handle,
			publishDate: this._normalizeText(playerResponse?.microformat?.playerMicroformatRenderer?.publishDate),
			uploadDate: this._normalizeText(playerResponse?.microformat?.playerMicroformatRenderer?.uploadDate),
		};
	},

	_buildDomMetadata: function (doc, expectedVideoId, trustedFetchedDocument) {
		if (!doc) {
			this._log.debug?.(`buildDomMetadata skipped ${this._formatDebugFields({doc})}`);
			return null;
		}

		const microformat = this._getDomMicroformat(doc);
		if (this._getVideoId(microformat?.['@id'] || '') === expectedVideoId || this._getVideoId(microformat?.embedUrl || '') === expectedVideoId) {
			return {
				title: this._normalizeText(microformat?.name),
				genre: this._normalizeText(microformat?.genre),
				duration: this._normalizeText(microformat?.duration),
				lengthSeconds: this._isoDurationToSeconds(this._normalizeText(microformat?.duration)),
			};
		}

		if (trustedFetchedDocument || this._isCurrentDomVerified(doc, expectedVideoId)) {
			// Do not read meta[name="keywords"]; YouTube may populate it with generic
			// defaults that are not reliable video-specific keywords.
			return {
				title: this._normalizeText(doc.querySelector('meta[name="title"]')?.getAttribute('content')),
				genre: this._normalizeText(doc.querySelector('meta[itemprop="genre"]')?.getAttribute('content')),
				duration: this._normalizeText(doc.querySelector('meta[itemprop="duration"]')?.getAttribute('content')),
				lengthSeconds: this._isoDurationToSeconds(this._normalizeText(doc.querySelector('meta[itemprop="duration"]')?.getAttribute('content'))),
			};
		}

		this._log.debug?.(`buildDomMetadata skipped ${this._formatDebugFields({expectedVideoId: expectedVideoId || '', trustedFetchedDocument: Boolean(trustedFetchedDocument)})}`);
		return null;
	},

	_getDomMicroformat: function (doc) {
		try {
			const text = doc.querySelector('#microformat script')?.textContent;
			return text ? JSON.parse(text) : null;
		} catch (error) {
			// Ignore malformed microformat JSON; other metadata sources remain available.
			return null;
		}
	},

	_isCurrentDomVerified: function (doc, expectedVideoId) {
		if (!doc || !expectedVideoId) {
			return false;
		}

		// Verify DOM metadata with identifiers from the metadata payload itself.
		// link[rel="canonical"] follows SPA navigation, so it cannot prove the rest of the DOM is current.
		// Missing identifiers are ignored because YouTube may omit some tags.
		// The DOM is verified only when at least one identifier is present and every present identifier
		// identifies the expected video id; otherwise mixed SPA state could make the DOM metadata unsafe.
		const candidates = [
			{name: 'meta[itemprop="videoId"]', value: doc.querySelector('meta[itemprop="videoId"]')?.getAttribute('content')},
			{name: 'meta[property="og:url"]', value: doc.querySelector('meta[property="og:url"]')?.getAttribute('content')},
			{name: 'link[itemprop="embedUrl"]', value: doc.querySelector('link[itemprop="embedUrl"]')?.getAttribute('href')},
		];
		const candidateResults = candidates
			.filter(candidate => candidate.value)
			.map(candidate => {
				const candidateVideoId = (candidate.value === expectedVideoId) ? candidate.value : this._getVideoId(candidate.value || '');
				return {
					name: candidate.name,
					value: candidate.value || '',
					videoId: candidateVideoId || '',
				};
			});
		const verified = candidateResults.length > 0 && candidateResults.every(candidate => candidate.videoId === expectedVideoId);
		if (!verified) {
			this._log.debug?.(`currentDomUnverified ${this._formatDebugFields({expectedVideoId})}`, candidateResults);
		}
		return verified;
	},

	_parseHtml: function (html) {
		if (!html || typeof html !== 'string') {
			return null;
		}
		try {
			return new DOMParser().parseFromString(this._createTrustedHtml(html), 'text/html');
		} catch (error) {
			this._log.warn('parseHtml: failed', error);
			return null;
		}
	},

	_createTrustedHtml: function (html) {
		if (!window.trustedTypes || typeof window.trustedTypes.createPolicy !== 'function') {
			return html;
		}
		if (!this._trustedTypesPolicy) {
			this._trustedTypesPolicy = window.trustedTypes.createPolicy('improvedtube-metadata-parser', {
				createHTML: value => value,
			});
		}
		return this._trustedTypesPolicy.createHTML(html);
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
			return null;
		}

		try {
			return JSON.parse(objectText);
		} catch (error) {
			this._log.warn(`extractInlineJsonByMarker: failed for marker=${marker}`, error);
			return null;
		}
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

			if (heatmapMarkers == null) {
				// Fallback: only heatmap markers are searched recursively outside the expected mutations path.
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
			this._log.warn('extractMarkerData: failed', error);
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

	_findSongCount: function (value) {
		// YouTube exposes the music section song count under the structured
		// description's horizontal card list. Use the path, then parse only the
		// leading number because the label is localized.
		const panels = Array.isArray(value?.engagementPanels) ? value.engagementPanels : [];
		for (const panel of panels) {
			const items = panel?.engagementPanelSectionListRenderer?.content?.structuredDescriptionContentRenderer?.items;
			if (!Array.isArray(items)) {
				continue;
			}

			for (const item of items) {
				const subtitle = item?.horizontalCardListRenderer?.header?.richListHeaderRenderer?.subtitle;
				const text = this._normalizeText(
					subtitle?.simpleText
					|| (Array.isArray(subtitle?.runs) ? subtitle.runs.map(run => run?.text || '').join('') : '')
				);
				const match = text.match(/^(\d+)/);
				if (match) {
					return Number(match[1]);
				}
			}
		}
		return null;
	},

	_findInObjectTree: function (value, matcher) {
		try {
			const stack = [value];
			while (stack.length) {
				const current = stack.pop();
				if (current === null || typeof current !== 'object') {
					continue;
				}

				const match = matcher(current);
				if (match !== null && match !== undefined) {
					return match;
				}

				if (Array.isArray(current)) {
					for (let index = current.length - 1; index >= 0; index--) {
						stack.push(current[index]);
					}
					continue;
				}

				for (const key in current) {
					if (Object.prototype.hasOwnProperty.call(current, key)) {
						stack.push(current[key]);
					}
				}
			}
		} catch (error) {
			this._log.warn('findInObjectTree: failed', error);
		}
		return null;
	},

	_getPlayerResponseVideoId: function (playerResponse) {
		return this._normalizeText(
			playerResponse?.videoDetails?.videoId
			|| playerResponse?.currentVideoEndpoint?.watchEndpoint?.videoId
		);
	},

	_isPlayerResponseCurrent: function (playerResponse, expectedVideoId) {
		if (!playerResponse || !expectedVideoId) {
			return false;
		}
		return this._getPlayerResponseVideoId(playerResponse) === expectedVideoId;
	},

	_isFieldResolved: function (entry, key) {
		if (entry.state?.source?.[key]) {
			return true;
		}

		return this._hasValue(entry.data?.[key]);
	},

	_setNotFound: function (entry, key) {
		const sourceStatusKey = sourceName => (
			sourceName === SOURCE.FETCHED_PLAYER_RESPONSE || sourceName === SOURCE.FETCHED_YT_INITIAL_DATA
				? 'fetchedWatchPage'
				: sourceName
		);
		const failedSource = (VIDEO_METADATA_SOURCE_PRIORITY[key] || []).find(sourceName => (
			entry.state.sourceStatus[sourceStatusKey(sourceName)] === 'failed'
		));
		if (failedSource) {
			this._log.debug?.(`setNotFound skipped ${this._formatDebugFields({key, reason: 'sourceFailed', source: failedSource})}`);
			return;
		}

		entry.data[key] = null;
		entry.state.source[key] = 'not-found';
		this._log.debug?.(`setNotFound ${this._formatDebugFields({key, value: entry.data[key]})}`);
	},

	_setValue: function (entry, key, value, sourceName) {
		// Keep the first resolved value because source priority already encodes trust order.
		if (!this._hasValue(value) || this._hasValue(entry.data[key])) {
			return false;
		}

		entry.data[key] = value;
		entry.state.source[key] = sourceName;
		this._log.debug?.(`setValue ${this._formatDebugFields({key, source: sourceName, value})}`);
		return true;
	},

	_hasValue: function (value) {
		if (Array.isArray(value)) {
			return value.length > 0;
		}
		return value !== null && value !== undefined && value !== '';
	},

	_normalizeText: function (value) {
		return (typeof value === 'string') ? value.replace(/\s+/g, ' ').trim() : '';
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
		return (Number.isFinite(lengthSeconds) && lengthSeconds > 0) ? lengthSeconds : null;
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

		const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
		if (!match) {
			return null;
		}

		const hours = Number(match[1] || 0);
		const minutes = Number(match[2] || 0);
		const seconds = Number(match[3] || 0);
		const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
		return (totalSeconds > 0) ? totalSeconds : null;
	},

	_syncDurationFields: function (entry) {
		if (!this._hasValue(entry.data.duration) && this._hasValue(entry.data.lengthSeconds)) {
			entry.data.duration = this._secondsToIsoDuration(entry.data.lengthSeconds);
			entry.state.source.duration = entry.state.source.duration || entry.state.source.lengthSeconds || 'derived';
			this._log.debug?.(`syncDurationFields derivedDuration ${this._formatDebugFields({source: entry.state.source.duration || '', value: entry.data.duration || ''})}`);
		}

		if (!this._hasValue(entry.data.lengthSeconds) && this._hasValue(entry.data.duration)) {
			entry.data.lengthSeconds = this._isoDurationToSeconds(entry.data.duration);
			entry.state.source.lengthSeconds = entry.state.source.lengthSeconds || entry.state.source.duration || 'derived';
			this._log.debug?.(`syncDurationFields derivedLengthSeconds ${this._formatDebugFields({source: entry.state.source.lengthSeconds || '', value: entry.data.lengthSeconds || ''})}`);
		}
	},

	// Use this._log.debug?.(message), this._log.info(message), or this._log.warn(message).
	// Keep debug formatting inside debug?.(...) so disabled logs do not evaluate it.
	// Debug output is controlled by "Video Metadata Debug Log" in "Settings > Developer options".
	_log: {
		_debug: console.debug.bind(console, '[ImprovedTube:Metadata]'),
		get debug() {
			return ImprovedTube.storage?.video_metadata_debug === true
				? this._debug
				: undefined;
		},
		info: console.info.bind(console, '[ImprovedTube:Metadata]'),
		warn: console.warn.bind(console, '[ImprovedTube:Metadata]'),
	},

	_formatDebugValue: function (value) {
		if (Array.isArray(value)) {
			return `array(length=${value.length})`;
		}
		if (value === null) {
			return 'null';
		}
		if (value === undefined) {
			return 'undefined';
		}
		if (typeof value === 'object') {
			return `object(keys=${Object.keys(value).slice(0, 8).join('|')})`;
		}

		const text = String(value).replace(/\s+/g, ' ').trim();
		return (text.length > 120) ? text.slice(0, 117) + '...' : text;
	},

	_formatDebugKeys: function (value) {
		if (!value || typeof value !== 'object') {
			return '';
		}
		return Object.keys(value)
			.filter(key => this._hasValue(value[key]))
			.join('|');
	},

	_formatDebugFields: function (fields) {
		return Object.entries(fields).map(([key, value]) => {
			let formattedValue;
			if (typeof value === 'string') {
				formattedValue = `[${value}]`;
			} else if (Array.isArray(value) || (value && typeof value === 'object')) {
				formattedValue = `[${this._formatDebugValue(value)}]`;
			} else {
				formattedValue = String(value);
			}
			return `${key}=${formattedValue}`;
		}).join(', ');
	},
};
