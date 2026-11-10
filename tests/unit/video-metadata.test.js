const fs = require('fs');
const path = require('path');
const vm = require('vm');

const VIDEO_ID = 'abcdefghijk';
const OTHER_VIDEO_ID = 'zyxwvutsrqp';
const SOURCE_PATH = path.join(
	__dirname,
	'../../js&css/web-accessible/www.youtube.com/video-metadata.js'
);

function formatTestLogArgs(args) {
	return args.map(value => {
		if (typeof value === 'string') {
			return value;
		}

		try {
			return JSON.stringify(value, (key, nestedValue) => {
				if (nestedValue && typeof nestedValue === 'object'
					&& typeof nestedValue.name === 'string'
					&& typeof nestedValue.message === 'string') {
					return `${nestedValue.name}: ${nestedValue.message}`;
				}
				return nestedValue;
			}) || String(value);
		} catch {
			return String(value).replace(/[\r\n]+/g, ' ');
		}
	}).join(' ').replace(/[\r\n]+/g, ' ');
}

function createVideoMetadata({
	fetchImpl = jest.fn(),
	parseDocument = () => null,
	keepHtml = false,
	currentVideoId = OTHER_VIDEO_ID,
	getCurrentVideoId = () => currentVideoId,
	playerResponse = null,
	getPlayerResponse = null,
	shortsPlayerResponse = null,
	getShortsPlayerResponse = null,
	currentDocument = null,
	pageUrl = null,
	windowYtInitialData = null,
	windowYtInitialPlayerResponse = null,
	now = () => Date.now(),
	setTimeoutImpl = setTimeout,
} = {}) {
	const source = fs.readFileSync(SOURCE_PATH, 'utf8');
	const getCurrentPageUrl = () => pageUrl || `https://www.youtube.com/watch?v=${getCurrentVideoId()}`;
	const debug = process.env.VIDEO_METADATA_DEBUG === '1';
	const consoleMock = {
		debug: jest.fn(),
		info: jest.fn(),
		log: jest.fn(),
		warn: jest.fn(),
	};
	if (debug) {
		consoleMock.debug.mockImplementation((...args) => process.stdout.write(`${formatTestLogArgs(args)}\n`));
		consoleMock.warn.mockImplementation((...args) => process.stdout.write(`${formatTestLogArgs(args)}\n`));
	}
	const context = vm.createContext({
		console: consoleMock,
		Date: {now},
		document: currentDocument || {
			get URL() {
				return getCurrentPageUrl();
			},
			getElementById: () => null,
		},
		DOMParser: class {
			parseFromString(html, type) {
				return parseDocument(html, type);
			}
		},
		fetch: fetchImpl,
		setTimeout: setTimeoutImpl,
		ImprovedTube: {
			regex: {video_id: /(?:[?&]v=|embed\/|shorts\/)([^&?]{11})/},
			storage: {video_metadata_debug: debug},
			elements: {
				player: playerResponse || getPlayerResponse
				? {getPlayerResponse: () => getPlayerResponse ? getPlayerResponse() : playerResponse}
				: null,
				shorts_player: shortsPlayerResponse || getShortsPlayerResponse
				? {getPlayerResponse: () => getShortsPlayerResponse ? getShortsPlayerResponse() : shortsPlayerResponse}
				: null,
			}
		},
		window: {
			ytInitialData: windowYtInitialData,
			ytInitialPlayerResponse: windowYtInitialPlayerResponse,
		},
		location: {
			get pathname() {
				return new URL(getCurrentPageUrl()).pathname;
			}
		}
	});

	vm.runInContext(source, context, {filename: SOURCE_PATH});

	const videoMetadata = context.ImprovedTube.VideoMetadata;
	videoMetadata.debugKeepFetchedWatchPageHtml = keepHtml;

	return {consoleMock, videoMetadata};
}

function createDocument({title, genre, duration, videoId} = {}) {
	const values = {
		'meta[name="title"]': title,
		'meta[itemprop="genre"]': genre,
		'meta[itemprop="duration"]': duration,
		'meta[itemprop="videoId"]': videoId,
	};

	return {
		querySelector: selector => values[selector]
			? {getAttribute: () => values[selector]}
			: null,
	};
}

function createInitialData(videoId, {mostReplayedMarkers, heatmapMarkers, songCount}) {
	return {
		currentVideoEndpoint: {watchEndpoint: {videoId}},
		frameworkUpdates: {
			entityBatchUpdate: {
				mutations: [{
					payload: {
						macroMarkersListEntity: {
							markersList: {
								markerType: 'MARKER_TYPE_HEATMAP',
								markers: heatmapMarkers,
								markersDecoration: {timedMarkerDecorations: mostReplayedMarkers},
							},
						},
					},
				}],
			},
		},
		engagementPanels: [{
			engagementPanelSectionListRenderer: {
				content: {
					structuredDescriptionContentRenderer: {
						items: [{
							horizontalCardListRenderer: {
								header: {
									richListHeaderRenderer: {
										subtitle: {simpleText: `${songCount} songs`},
									},
								},
							},
						}],
					},
				},
			},
		}],
	};
}

function createPlayerResponse(videoId, title) {
	return {
		videoDetails: {
			videoId,
			title,
			keywords: ['first keyword', 'second keyword'],
			lengthSeconds: '125',
			author: 'Video author',
			channelId: 'UC1234567890',
		},
		microformat: {
			playerMicroformatRenderer: {
				category: 'Education',
				canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
				ownerChannelName: 'Channel name',
				ownerProfileUrl: 'https://www.youtube.com/@example%2Echannel',
				publishDate: '2026-01-02T14:37:52-00:00',
				uploadDate: '2026-01-01T08:24:16-00:00',
			},
		},
	};
}

describe('VideoMetadata in a vm context', () => {

	/*
	 * Public API
	 * Covers URL parsing, default/custom keys, explicit IDs, and aggregate retrieval.
	 */
	test('_getVideoId extracts supported URLs without logging when no id is present', () => {
		const {consoleMock, videoMetadata} = createVideoMetadata();

		expect(videoMetadata._getVideoId(`https://www.youtube.com/watch?v=${VIDEO_ID}`)).toBe(VIDEO_ID);
		expect(videoMetadata._getVideoId(`https://www.youtube.com/embed/${VIDEO_ID}`)).toBe(VIDEO_ID);
		expect(videoMetadata._getVideoId(`https://www.youtube.com/shorts/${VIDEO_ID}`)).toBe(VIDEO_ID);
		expect(videoMetadata._getVideoId('https://www.youtube.com/feed/subscriptions')).toBeNull();
		expect(consoleMock.log).not.toHaveBeenCalled();
	});

	test('getDataAsync resolves the default metadata fields', async () => {
		const fetchImpl = jest.fn();
		const {videoMetadata} = createVideoMetadata({
			fetchImpl,
			currentVideoId: VIDEO_ID,
			playerResponse: createPlayerResponse(VIDEO_ID, 'Current title'),
		});

		const data = await videoMetadata.getDataAsync({videoId: VIDEO_ID});
		const entry = videoMetadata.entries.get(VIDEO_ID);

		expect(data.videoId).toBe(VIDEO_ID);
		expect(data.title).toBe('Current title');
		expect(data.keywords).toEqual(['first keyword', 'second keyword']);
		expect(data.genre).toBe('Education');
		expect(data.lengthSeconds).toBe(125);
		expect(data.duration).toBe('PT2M5S');
		expect(data.channelId).toBe('UC1234567890');
		expect(data.channelName).toBe('Channel name');
		expect(data.handle).toBe('@example.channel');
		expect(data.url).toBe(`https://www.youtube.com/watch?v=${VIDEO_ID}`);
		expect(data.author).toBeNull();
		expect(data.publishDate).toBeNull();
		expect(entry.state.source.title).toBe('currentPlayerResponse');
		expect(fetchImpl).not.toHaveBeenCalled();
	});

	test('uses the Shorts player first on a Shorts page', async () => {
		const {videoMetadata} = createVideoMetadata({
			currentVideoId: VIDEO_ID,
			pageUrl: `https://www.youtube.com/shorts/${VIDEO_ID}`,
			playerResponse: createPlayerResponse(VIDEO_ID, 'Watch player title'),
			shortsPlayerResponse: createPlayerResponse(VIDEO_ID, 'Shorts player title'),
		});

		const title = await videoMetadata.getTitleAsync();
		const entry = videoMetadata.entries.get(VIDEO_ID);

		expect(title).toBe('Shorts player title');
		expect(entry.state.source.title).toBe('currentPlayerResponse');
	});

	test('falls back to the movie player when the Shorts player has no response', async () => {
		const {videoMetadata} = createVideoMetadata({
			currentVideoId: VIDEO_ID,
			pageUrl: `https://www.youtube.com/shorts/${VIDEO_ID}`,
			playerResponse: createPlayerResponse(VIDEO_ID, 'Movie player title'),
		});

		const title = await videoMetadata.getTitleAsync();

		expect(title).toBe('Movie player title');
	});

	test('ignores player responses for a different video on a Shorts page', async () => {
		let now = 0;
		const {videoMetadata} = createVideoMetadata({
			currentVideoId: VIDEO_ID,
			pageUrl: `https://www.youtube.com/shorts/${VIDEO_ID}`,
			playerResponse: createPlayerResponse(OTHER_VIDEO_ID, 'Stale movie title'),
			shortsPlayerResponse: createPlayerResponse(OTHER_VIDEO_ID, 'Stale Shorts title'),
			now: () => now,
			setTimeoutImpl: (callback, delay) => {
				now += delay;
				callback();
			},
		});

		const title = await videoMetadata.getTitleAsync();

		expect(title).toBeNull();
		expect(videoMetadata.entries.get(VIDEO_ID).state.source.title).toBe('not-found');
	});

	test('uses ytInitialPlayerResponse as a current Shorts metadata fallback', async () => {
		const {videoMetadata} = createVideoMetadata({
			currentVideoId: VIDEO_ID,
			pageUrl: `https://www.youtube.com/shorts/${VIDEO_ID}`,
			windowYtInitialPlayerResponse: createPlayerResponse(VIDEO_ID, 'Initial response title'),
		});

		const title = await videoMetadata.getTitleAsync();

		expect(title).toBe('Initial response title');
	});

	test('gets the current video id from a Shorts page URL', () => {
		const {videoMetadata} = createVideoMetadata({
			currentVideoId: VIDEO_ID,
			pageUrl: `https://www.youtube.com/shorts/${VIDEO_ID}`,
		});

		expect(videoMetadata._getVideoId()).toBe(VIDEO_ID);
	});

	test('getDataAsync fetches metadata for an explicitly specified videoId', async () => {
		const html = `var ytInitialPlayerResponse = {"videoDetails":{"videoId":"${VIDEO_ID}","title":"Fetched title","lengthSeconds":"90"}};`;
		const fetchImpl = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve(html),
		});
		const {videoMetadata} = createVideoMetadata({
			fetchImpl,
			parseDocument: () => null,
		});

		const data = await videoMetadata.getDataAsync({videoId: VIDEO_ID});
		const entry = videoMetadata.entries.get(VIDEO_ID);

		expect(fetchImpl).toHaveBeenCalledTimes(1);
		expect(fetchImpl).toHaveBeenCalledWith(
			`https://www.youtube.com/watch?v=${VIDEO_ID}`,
			{credentials: 'same-origin'}
		);
		expect(data.videoId).toBe(VIDEO_ID);
		expect(data.title).toBe('Fetched title');
		expect(data.lengthSeconds).toBe(90);
		expect(data.duration).toBe('PT1M30S');
		expect(entry.state.source.title).toBe('fetchedYtInitialPlayerResponse');
		expect(entry.state.fetchStatus).toBe('done');
	});

	test('getDataAsync resolves only the keys requested by the caller', async () => {
		const {videoMetadata} = createVideoMetadata({
			currentVideoId: VIDEO_ID,
			playerResponse: createPlayerResponse(VIDEO_ID, 'Selected title'),
		});

		const data = await videoMetadata.getDataAsync({videoId: VIDEO_ID, keys: ['title']});
		const entry = videoMetadata.entries.get(VIDEO_ID);

		expect(data.title).toBe('Selected title');
		expect(data.genre).toBeNull();
		expect(data.channelName).toBeNull();
		expect(entry.state.source.title).toBe('currentPlayerResponse');
		expect(entry.state.source.genre).toBeUndefined();
	});


	/*
	 * Source resolution
	 * Covers current/fetched ytInitialData, DOM fallback, and source priority.
	 */
	test('getAllDataAsync resolves replay markers, heatmap markers, and song count', async () => {
		const mostReplayedMarkers = [{
			decorationTimeMillis: 5000,
			visibleTimeRangeStartMillis: 0,
			visibleTimeRangeEndMillis: 10000,
		}];
		const heatmapMarkers = [{
			startMillis: '495000',
			durationMillis: '5000',
			intensityScoreNormalized: 0.017270571960626566,
		}];
		const {videoMetadata} = createVideoMetadata({
			currentVideoId: VIDEO_ID,
			playerResponse: createPlayerResponse(VIDEO_ID, 'Current title'),
			windowYtInitialData: createInitialData(VIDEO_ID, {
				mostReplayedMarkers,
				heatmapMarkers,
				songCount: 8,
			}),
		});

		const data = await videoMetadata.getAllDataAsync({videoId: VIDEO_ID});

		expect(data.mostReplayedMarkers).toEqual(mostReplayedMarkers);
		expect(data.heatmapMarkers).toEqual(heatmapMarkers);
		expect(data.amountOfSongs).toBe(8);
	});

	test('focused getters resolve markers and song count from fetched ytInitialData', async () => {
		const mostReplayedMarkers = [{
			decorationTimeMillis: 5000,
			visibleTimeRangeStartMillis: 0,
			visibleTimeRangeEndMillis: 10000,
		}];
		const heatmapMarkers = [{
			startMillis: '495000',
			durationMillis: '5000',
			intensityScoreNormalized: 0.017270571960626566,
		}];
		const html = `var ytInitialData = ${JSON.stringify(createInitialData(VIDEO_ID, {
			mostReplayedMarkers,
			heatmapMarkers,
			songCount: 8,
		}))};`;
		const fetchImpl = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve(html),
		});
		const {videoMetadata} = createVideoMetadata({
			fetchImpl,
			parseDocument: () => createDocument({title: 'Unused DOM title'}),
		});

		await expect(videoMetadata.getMostReplayedMarkersAsync({videoId: VIDEO_ID})).resolves.toEqual(mostReplayedMarkers);
		await expect(videoMetadata.getHeatmapMarkersAsync({videoId: VIDEO_ID})).resolves.toEqual(heatmapMarkers);
		await expect(videoMetadata.getAmountOfSongsAsync({videoId: VIDEO_ID})).resolves.toBe(8);

		const entry = videoMetadata.entries.get(VIDEO_ID);
		expect(fetchImpl).toHaveBeenCalledTimes(1);
		expect(entry.state.source.mostReplayedMarkers).toBe('fetchedYtInitialData');
		expect(entry.state.source.heatmapMarkers).toBe('fetchedYtInitialData');
		expect(entry.state.source.amountOfSongs).toBe('fetchedYtInitialData');
	});

	test('falls back to DOM for a missing field and prefers the player response when both have a value', async () => {
		const currentDocument = createDocument({
			title: 'DOM title',
			genre: 'DOM genre',
			videoId: VIDEO_ID,
		});
		currentDocument.URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
		currentDocument.getElementById = () => null;
		const {videoMetadata} = createVideoMetadata({
			currentVideoId: VIDEO_ID,
			playerResponse: createPlayerResponse(VIDEO_ID, ''),
			currentDocument,
		});

		const data = await videoMetadata.getDataAsync({videoId: VIDEO_ID, keys: ['title', 'genre']});
		const entry = videoMetadata.entries.get(VIDEO_ID);

		expect(data.title).toBe('DOM title');
		expect(entry.state.source.title).toBe('currentDom');
		expect(data.genre).toBe('Education');
		expect(entry.state.source.genre).toBe('currentPlayerResponse');
	});

	/*
	 * Current Player Response wait
	 * Uses a virtual clock to verify late arrival, timeout, and SPA navigation cancellation.
	 */
	test('waits for a matching Player Response that arrives during polling', async () => {
		let now = 0;
		let playerResponse = null;
		const delays = [];
		const {videoMetadata} = createVideoMetadata({
			currentVideoId: VIDEO_ID,
			getPlayerResponse: () => playerResponse,
			now: () => now,
			setTimeoutImpl: (callback, delay) => {
				delays.push(delay);
				now += delay;
				if (now === 100) {
					playerResponse = createPlayerResponse(VIDEO_ID, 'Late title');
				}
				callback();
			},
		});
		const entry = videoMetadata._getEntry(VIDEO_ID);

		await videoMetadata._ensureCurrentPlayerResponseSource(entry);

		expect(delays).toEqual([50, 50]);
		expect(entry.state.sources.currentPlayerResponse.metadata.title).toBe('Late title');
		expect(entry.state.sourceStatus.currentPlayerResponse).toBe('done');
	});

	test('times out after 600ms when no matching Player Response appears', async () => {
		let now = 0;
		const delays = [];
		const {videoMetadata} = createVideoMetadata({
			currentVideoId: VIDEO_ID,
			getPlayerResponse: () => null,
			now: () => now,
			setTimeoutImpl: (callback, delay) => {
				delays.push(delay);
				now += delay;
				callback();
			},
		});
		const entry = videoMetadata._getEntry(VIDEO_ID);

		await videoMetadata._ensureCurrentPlayerResponseSource(entry);

		expect(now).toBe(600);
		expect(delays).toHaveLength(12);
		expect(delays.every(delay => delay === 50)).toBe(true);
		expect(entry.state.sources.currentPlayerResponse).toBeNull();
		expect(entry.state.sourceStatus.currentPlayerResponse).toBe('done');
	});

	test('cancels polling when SPA navigation changes the current video', async () => {
		let now = 0;
		let currentVideoId = VIDEO_ID;
		const delays = [];
		const {videoMetadata} = createVideoMetadata({
			currentVideoId,
			getCurrentVideoId: () => currentVideoId,
			getPlayerResponse: () => null,
			now: () => now,
			setTimeoutImpl: (callback, delay) => {
				delays.push(delay);
				now += delay;
				currentVideoId = OTHER_VIDEO_ID;
				callback();
			},
		});
		const entry = videoMetadata._getEntry(VIDEO_ID);

		await videoMetadata._ensureCurrentPlayerResponseSource(entry);

		expect(delays).toEqual([50]);
		expect(now).toBe(50);
		expect(entry.state.sources.currentPlayerResponse).toBeNull();
		expect(entry.state.sourceStatus.currentPlayerResponse).toBe('done');
	});


	/*
	 * Cache and garbage collection
	 * Covers reuse, forced refresh, pruning limits, and protected entries.
	 */
	test('a focused getter returns its field and force refreshes its cache entry', async () => {
		const playerResponse = createPlayerResponse(VIDEO_ID, 'Original title');
		const {videoMetadata} = createVideoMetadata({
			currentVideoId: VIDEO_ID,
			playerResponse,
		});

		await expect(videoMetadata.getTitleAsync({videoId: VIDEO_ID})).resolves.toBe('Original title');
		playerResponse.videoDetails.title = 'Updated title';
		await expect(videoMetadata.getTitleAsync({videoId: VIDEO_ID})).resolves.toBe('Original title');
		await expect(videoMetadata.getTitleAsync({videoId: VIDEO_ID, force: true})).resolves.toBe('Updated title');
	});

	test('reuses resolved fields from the same cache entry', async () => {
		const {videoMetadata} = createVideoMetadata({
			currentVideoId: VIDEO_ID,
			playerResponse: createPlayerResponse(VIDEO_ID, 'Cached title'),
		});
		const readCurrentPlayerResponse = videoMetadata._readCurrentPlayerResponseSource.bind(videoMetadata);
		videoMetadata._readCurrentPlayerResponseSource = jest.fn(readCurrentPlayerResponse);

		const firstResult = await videoMetadata.getDataAsync({videoId: VIDEO_ID});
		const entry = videoMetadata.entries.get(VIDEO_ID);
		const secondResult = await videoMetadata.getDataAsync({videoId: VIDEO_ID});

		expect(videoMetadata.entries.get(VIDEO_ID)).toBe(entry);
		expect(firstResult.title).toBe('Cached title');
		expect(secondResult.title).toBe('Cached title');
		expect(videoMetadata._readCurrentPlayerResponseSource).toHaveBeenCalledTimes(1);
	});

	test('gc removes old entries over the size limit and preserves current and pending entries', () => {
		const pendingVideoId = 'mnopqrstuvw';
		const staleVideoId = 'abcdefghijk';
		const {videoMetadata} = createVideoMetadata({currentVideoId: OTHER_VIDEO_ID});
		const currentEntry = videoMetadata._getEntry(OTHER_VIDEO_ID);
		const pendingEntry = videoMetadata._getEntry(pendingVideoId);
		const staleEntry = videoMetadata._getEntry(staleVideoId);
		currentEntry.state.lastAccessedAt = 3;
		pendingEntry.state.lastAccessedAt = 2;
		pendingEntry.state.fetchStatus = 'pending';
		staleEntry.state.lastAccessedAt = 1;

		const result = videoMetadata.gc({maxEntries: 1, maxAgeMs: null});

		expect(result.removed).toEqual([staleVideoId]);
		expect(result.skipped.current).toEqual([OTHER_VIDEO_ID]);
		expect(result.skipped.pending).toEqual([pendingVideoId]);
		expect(result.after).toBe(2);
		expect(videoMetadata.entries.has(OTHER_VIDEO_ID)).toBe(true);
		expect(videoMetadata.entries.has(pendingVideoId)).toBe(true);
		expect(videoMetadata.entries.has(staleVideoId)).toBe(false);
	});

	test('gc dryRun reports entries older than maxAgeMs without deleting them', () => {
		const oldVideoId = 'abcdefghijk';
		const recentVideoId = 'mnopqrstuvw';
		const {videoMetadata} = createVideoMetadata();
		const oldEntry = videoMetadata._getEntry(oldVideoId);
		const recentEntry = videoMetadata._getEntry(recentVideoId);
		oldEntry.state.lastAccessedAt = 1;
		recentEntry.state.lastAccessedAt = Date.now();

		const dryRunResult = videoMetadata.gc({
			maxEntries: null,
			maxAgeMs: 1000,
			keepCurrent: false,
			dryRun: true,
		});

		expect(dryRunResult.removed).toEqual([oldVideoId]);
		expect(dryRunResult.before).toBe(2);
		expect(dryRunResult.after).toBe(2);
		expect(videoMetadata.entries.has(oldVideoId)).toBe(true);

		const gcResult = videoMetadata.gc({
			maxEntries: null,
			maxAgeMs: 1000,
			keepCurrent: false,
		});
		expect(gcResult.removed).toEqual([oldVideoId]);
		expect(gcResult.after).toBe(1);
		expect(videoMetadata.entries.has(oldVideoId)).toBe(false);
	});


	/*
	 * Fetch and DOM lifecycle
	 * Covers failure states, retries, eager parsing, and HTML retention.
	 */
	test('records a non-2xx watch-page response as failed, not not-found', async () => {
		const response = {ok: false, status: 503, text: jest.fn()};
		const fetchImpl = jest.fn().mockResolvedValue(response);
		const {videoMetadata} = createVideoMetadata({
			fetchImpl,
			parseDocument: jest.fn(),
		});

		const title = await videoMetadata.getTitleAsync({videoId: VIDEO_ID});
		const entry = videoMetadata.entries.get(VIDEO_ID);

		expect(title).toBeNull();
		expect(fetchImpl).toHaveBeenCalledTimes(1);
		expect(response.text).not.toHaveBeenCalled();
		expect(entry.state.fetchStatus).toBe('failed');
		expect(entry.state.sourceStatus.fetchedWatchPage).toBe('failed');
		expect(entry.state.source.title).toBeUndefined();
	});

	test('retries a failed fetch on the next public getter call', async () => {
		const html = `var ytInitialPlayerResponse = {"videoDetails":{"videoId":"${VIDEO_ID}","title":"Fetched title"}};`;
		const fetchImpl = jest.fn()
			.mockResolvedValueOnce({ok: false, status: 503})
			.mockResolvedValueOnce({ok: true, status: 200, text: () => Promise.resolve(html)});
		const {videoMetadata} = createVideoMetadata({
			fetchImpl,
			parseDocument: () => null,
		});

		await expect(videoMetadata.getTitleAsync({videoId: VIDEO_ID})).resolves.toBeNull();
		await expect(videoMetadata.getTitleAsync({videoId: VIDEO_ID})).resolves.toBe('Fetched title');

		const entry = videoMetadata.entries.get(VIDEO_ID);
		expect(fetchImpl).toHaveBeenCalledTimes(2);
		expect(entry.state.fetchStatus).toBe('done');
		expect(entry.state.sourceStatus.fetchedWatchPage).toBe('done');
	});

	test('extracts DOM metadata during fetch and releases the HTML by default', async () => {
		const html = '<html>watch page</html>';
		const parseDocument = jest.fn(() => createDocument({
			title: 'DOM title',
			genre: 'Music',
			duration: 'PT1M2S',
		}));
		const fetchImpl = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve(html),
		});
		const {videoMetadata} = createVideoMetadata({fetchImpl, parseDocument});

		await expect(videoMetadata.getTitleAsync({videoId: VIDEO_ID})).resolves.toBe('DOM title');

		const entry = videoMetadata.entries.get(VIDEO_ID);
		expect(parseDocument).toHaveBeenCalledTimes(1);
		expect(entry.state.fetchStatus).toBe('done');
		expect(entry.state.sourceStatus.fetchedDom).toBe('done');
		expect(entry.state.sources.fetchedDom.metadata.lengthSeconds).toBe(62);
		expect(entry.rawFetchedWatchPageHtml).toBeNull();
	});

	test('keeps fetched HTML when the development retention flag is enabled', async () => {
		const html = '<html>keep this source</html>';
		const fetchImpl = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve(html),
		});
		const {videoMetadata} = createVideoMetadata({
			fetchImpl,
			parseDocument: () => createDocument({title: 'DOM title'}),
			keepHtml: true,
		});

		await expect(videoMetadata.getTitleAsync({videoId: VIDEO_ID})).resolves.toBe('DOM title');

		expect(videoMetadata.entries.get(VIDEO_ID).rawFetchedWatchPageHtml).toBe(html);
	});

	test('records DOM parsing failure without marking fields not-found', async () => {
		const fetchImpl = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve('<html>malformed</html>'),
		});
		const {videoMetadata} = createVideoMetadata({
			fetchImpl,
			parseDocument: () => {
				throw new Error('DOM parse failed');
			},
		});

		const title = await videoMetadata.getTitleAsync({videoId: VIDEO_ID});
		const entry = videoMetadata.entries.get(VIDEO_ID);

		expect(title).toBeNull();
		expect(entry.state.fetchStatus).toBe('done');
		expect(entry.state.sourceStatus.fetchedDom).toBe('failed');
		expect(entry.state.source.title).toBeUndefined();
	});
});
