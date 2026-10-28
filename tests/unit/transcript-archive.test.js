// Tests for the transcript archive and viewing log (issue #4416).

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const read = (...parts) => fs.readFileSync(path.join(__dirname, '../..', ...parts), 'utf8');
const library = require('../../js&css/transcript-archive.js');

describe('Transcript archive data', () => {
	test('parses the timestamps used by the transcript panel', () => {
		expect(library.parseTime('0:05')).toBe(5);
		expect(library.parseTime('1:05')).toBe(65);
		expect(library.parseTime('1:02:03')).toBe(3723);
		expect(library.parseTime(12.5)).toBe(12.5);
		expect(library.parseTime('nope')).toBeNull();
	});

	test('normalizes both the current and the older segment shapes', () => {
		expect(library.sanitizeSegments([
			{time: '0:18', text: '  older   markup '},
			{t: 5, text: 'current'},
			[10, 'array'],
			{time: '0:05', text: 'current'},
			{time: 'bad', text: 'dropped'},
			{time: '0:30', text: '   '}
		])).toEqual([
			{t: 5, text: 'current'},
			{t: 10, text: 'array'},
			{t: 18, text: 'older markup'}
		]);
	});

	test('merges overlapping watched ranges and drops malformed ones', () => {
		expect(library.sanitizeWatched([[0, 30], [20, 40], [60, 90], [5, 4], ['x', 1], [30, 60]]))
			.toEqual([[0, 90]]);
	});

	test('merges pause points and counts repeated pauses', () => {
		expect(library.sanitizePauses([[10, 1], [10, 2], {t: 40}, 55])).toEqual([[10, 3], [40, 1], [55, 1]]);
	});

	test('normalizes heatmap markers', () => {
		expect(library.sanitizeHeatmap([
			{start: 10, duration: 5, score: 2},
			[30, 10, .5],
			{start: 50, duration: 0, score: 1}
		])).toEqual([
			{start: 10, duration: 5, score: 1},
			{start: 30, duration: 10, score: .5}
		]);
	});
});

describe('Recording archived views', () => {
	test('creates an entry and counts the first view', () => {
		const store = {};

		library.recordView(store, {
			videoId: 'abcdefghijk',
			title: 'A video',
			channel: 'A channel',
			duration: 120,
			watched: [[0, 30]],
			segments: [{time: '0:05', text: 'Hello world'}]
		}, 1000);

		expect(store.abcdefghijk).toMatchObject({
			id: 'abcdefghijk',
			title: 'A video',
			channel: 'A channel',
			duration: 120,
			views: 1,
			updated: 1000,
			watched: [[0, 30]],
			segments: [{t: 5, text: 'Hello world'}]
		});
	});

	test('merges new watched ranges, pauses and metadata on a later view', () => {
		const store = {};

		library.recordView(store, {
			videoId: 'abcdefghijk',
			title: 'A video',
			duration: 120,
			watched: [[0, 30]],
			pauses: [[15, 1]]
		}, 1000);
		library.recordView(store, {
			videoId: 'abcdefghijk',
			watched: [[20, 50]],
			pauses: [[15, 2], [45, 1]],
			increment_views: true
		}, 2000);

		expect(store.abcdefghijk.views).toBe(2);
		expect(store.abcdefghijk.updated).toBe(2000);
		expect(store.abcdefghijk.watched).toEqual([[0, 50]]);
		expect(store.abcdefghijk.pauses).toEqual([[15, 3], [45, 1]]);
		expect(store.abcdefghijk.title).toBe('A video');
	});

	test('keeps only the most recently updated videos', () => {
		const store = {};

		library.recordView(store, {videoId: 'old', updated: 1}, 1);
		library.recordView(store, {videoId: 'new', updated: 2}, 2);
		library.recordView(store, {videoId: 'newest', maxVideos: 2}, 3);

		expect(Object.keys(store).sort()).toEqual(['new', 'newest']);
	});

	test('sanitizes broken stored data instead of throwing', () => {
		expect(library.sanitizeStore({
			ok: {
				title: 'Ok',
				watched: [[1, 2], 'bad'],
				segments: [{t: 'x', text: 'bad'}, {t: 1, text: 'good'}]
			},
			bad: null
		})).toEqual({
			ok: expect.objectContaining({
				id: 'ok',
				title: 'Ok',
				watched: [[1, 2]],
				segments: [{t: 1, text: 'good'}]
			}),
			bad: expect.objectContaining({id: 'bad'})
		});
	});
});

describe('Search index', () => {
	function buildStore() {
		const store = {};

		library.recordView(store, {
			videoId: 'personal001',
			title: 'Personal favorite',
			channel: 'Channel A',
			duration: 100,
			watched: [[0, 100]],
			pauses: [[10, 3]],
			heatmap: [[8, 6, .1]],
			metrics: {views: 1000},
			segments: [
				{t: 10, text: 'a shared phrase about history'},
				{t: 70, text: 'another history point'}
			]
		}, 1000);

		library.recordView(store, {
			videoId: 'global0001',
			title: 'Globally popular',
			channel: 'Channel B',
			duration: 100,
			heatmap: [[8, 6, 1]],
			metrics: {views: 100000000},
			segments: [
				{t: 10, text: 'a shared phrase about history'}
			]
		}, 2000);

		return store;
	}

	test('finds every matching segment, including the video title', () => {
		const results = library.search(buildStore(), 'shared phrase', {limit: 10});

		expect(results).toHaveLength(2);
		expect(results.every(result => result.text.indexOf('history') !== -1)).toBe(true);
		expect(results[0].timeText).toBe('0:10');
	});

	test('requires all query words to match and ignores case and accents', () => {
		expect(library.search(buildStore(), 'SHARED missing', {limit: 10})).toEqual([]);
		expect(library.search(buildStore(), 'histor', {limit: 10}).length).toBe(3);
	});

	test('ranks repeated, watched and paused moments first for the personal ranking', () => {
		const results = library.search(buildStore(), 'history', {mode: 'personal', limit: 10});

		expect(results[0].videoId).toBe('personal001');
		expect(results[0].watched).toBe(true);
		expect(results[0].paused).toBe(3);
	});

	test('ranks by heatmap score multiplied by the video views for the global ranking', () => {
		const results = library.search(buildStore(), 'history', {mode: 'global', limit: 10});

		expect(results[0].videoId).toBe('global0001');
		expect(results[0].heat).toBe(1);
	});

	test('returns recent videos for an empty query', () => {
		const results = library.search(buildStore(), '', {limit: 10});

		expect(results.map(result => result.videoId)).toEqual(['global0001', 'personal001']);
	});

	test('limits the number of results', () => {
		expect(library.search(buildStore(), 'history', {limit: 1})).toHaveLength(1);
	});

	test('lists top videos without a query', () => {
		const videos = library.topVideos(buildStore(), 'global', 10);

		expect(videos[0].videoId).toBe('global0001');
	});

	test('can search an already sanitized store without copying it again', () => {
		const store = buildStore();

		expect(library.search(store, 'history', {limit: 10, sanitized: true})).toHaveLength(3);
	});
});

describe('Viewing log', () => {
	test('keeps the newest entries first and limits the history', () => {
		let log = [];

		log = library.appendLog(log, {v: 'old', at: 1, sec: 5}, 2);
		log = library.appendLog(log, {v: 'middle', at: 2, sec: 5}, 2);
		log = library.appendLog(log, {v: 'new', at: 3, sec: 5}, 2);

		expect(log.map(entry => entry.v)).toEqual(['new', 'middle']);
		expect(log[0]).toMatchObject({v: 'new', at: 3, sec: 5});
	});

	test('drops log events without a video id', () => {
		expect(library.appendLog([], {at: 1})).toEqual([]);
	});
});

describe('Watch page integration', () => {
	let archive;
	let ImprovedTube;
	let sent;
	let video;
	let listeners;

	function createContext(overrides = {}) {
		sent = [];
		listeners = {};
		video = {
			currentTime: 10,
			duration: 600,
			paused: false,
			playbackRate: 1,
			seeking: false,
			addEventListener: function (type, listener) { listeners[type] = listener; },
			removeEventListener: function (type) { delete listeners[type]; }
		};
		ImprovedTube = {
			elements: {buttons: {}, player: null, video},
			messages: {send: message => sent.push(message)},
			regex: {video_id: /(?:[?&]v=|embed\/|shorts\/)([^&?]{11})/},
			storage: Object.assign({
				archive_transcripts: true,
				record_viewing_log: true
			}, overrides.storage),
			videoTitle: () => 'Example video'
		};

		const context = {
			ImprovedTube,
			ImprovedTubeTranscriptArchive: library,
			document: {
				addEventListener: function () {},
				documentElement: {dataset: {pageType: 'video'}},
				getElementById: () => null,
				querySelector: () => null,
				querySelectorAll: () => [],
				title: 'Example video - YouTube',
				visibilityState: 'visible'
			},
			window: {addEventListener: function () {}, ytInitialPlayerResponse: null},
			location: {
				href: 'https://www.youtube.com/watch?v=abcdefghijk',
				origin: 'https://www.youtube.com',
				protocol: 'https:'
			},
			console,
			setInterval: () => 1,
			clearInterval: () => {},
			setTimeout: () => 1,
			clearTimeout: () => {},
			fetch: () => Promise.reject(new Error('not used')),
			DOMParser: function () {
				return {parseFromString: () => ({querySelectorAll: () => []})};
			}
		};

		vm.runInNewContext(read('js&css', 'web-accessible', 'www.youtube.com', 'transcript-archive.js'), context);

		archive = ImprovedTube.transcriptArchive;
	}

	beforeEach(() => createContext());

	test('loads a video and saves counted views, watched ranges and pauses', () => {
		archive.load('abcdefghijk');
		archive.meta = {title: 'Example video', channel: 'Example channel', duration: 600};
		archive.pending_views = 1;
		archive.watched = [[10, 20]];
		archive.pauses = [[15, 1]];
		archive.dirty = true;
		archive.save();

		expect(sent).toHaveLength(1);
		expect(sent[0].action).toBe('set');
		expect(sent[0].key).toBe('transcript_archive');

		const entry = sent[0].value.abcdefghijk;

		expect(entry.views).toBe(1);
		expect(entry.watched).toEqual([[10, 20]]);
		expect(entry.pauses).toEqual([[15, 1]]);
		expect(entry.title).toBe('Example video');
	});

	test('tracks only the distance that was actually played', () => {
		archive.load('abcdefghijk');
		archive.attach(video);
		video.currentTime = 10;
		listeners.play();
		archive.last_time = 10;
		video.currentTime = 10.5;
		listeners.timeupdate();
		video.currentTime = 11;
		listeners.timeupdate();
		video.currentTime = 300;
		listeners.timeupdate();
		video.currentTime = 301;
		listeners.timeupdate();
		archive.save();

		expect(sent[0].value.abcdefghijk.watched).toEqual([[10, 11], [300, 301]]);
	});

	test('records pauses and writes a viewing log session', () => {
		archive.load('abcdefghijk');
		archive.meta = {title: 'Example video', channel: 'Example channel'};
		archive.session = {at: 1000, from: 0, to: 20, sec: 20, pauses: 0, video_id: 'abcdefghijk'};
		archive.attach(video);
		video.currentTime = 20;
		listeners.pause();

		expect(sent.some(message => message.key === 'transcript_archive')).toBe(true);

		archive.session = {at: 1000, from: 0, to: 20, sec: 20, pauses: 0, video_id: 'abcdefghijk'};
		archive.flushSession();

		const log = sent.filter(message => message.key === 'viewing_log').pop();

		expect(log.value[0]).toMatchObject({
			v: 'abcdefghijk',
			t: 'Example video',
			c: 'Example channel',
			sec: 20
		});
	});

	test('parses TimedText JSON and XML cues', () => {
		expect(archive.parseTimedText(JSON.stringify({
			events: [
				{tStartMs: 5000, dDurationMs: 2000, segs: [{utf8: ' Hello '}, {utf8: 'world '}]},
				{tStartMs: 9000, segs: [{utf8: 'again'}]}
			]
		}))).toEqual([
			{t: 5, text: 'Hello world'},
			{t: 9, text: 'again'}
		]);

		const xml_context = {
			library,
			DOMParser: function () {
				return {
					parseFromString: () => ({
						querySelectorAll: () => [{
							getAttribute: name => name === 'start' ? '12.5' : null,
							textContent: ' XML cue '
						}]
					})
				};
			}
		};
		const parse = vm.runInNewContext('(' + archive.parseTimedText.toString() + ')', xml_context);

		expect(parse('<xml/>')).toEqual([{t: 12.5, text: 'XML cue'}]);
	});

	test('records viewing-log time even when transcript archiving is off', () => {
		createContext({storage: {archive_transcripts: false, record_viewing_log: true}});

		archive.load('abcdefghijk');
		archive.meta = {title: 'Example video', channel: 'Example channel'};
		archive.attach(video);
		archive.last_time = 10;
		video.currentTime = 12;
		listeners.timeupdate();

		expect(archive.session.sec).toBe(2);
		expect(sent.some(message => message.key === 'transcript_archive')).toBe(false);

		archive.flushSession();

		const log = sent.filter(message => message.key === 'viewing_log').pop();

		expect(log.value[0]).toMatchObject({v: 'abcdefghijk', sec: 2});
	});

	test('does not write a viewing log when logging is off', () => {
		createContext({storage: {archive_transcripts: true, record_viewing_log: false}});

		archive.load('abcdefghijk');
		archive.meta = {title: 'Example video'};
		archive.attach(video);
		archive.last_time = 10;
		video.currentTime = 12;
		listeners.timeupdate();

		expect(archive.watched).toEqual([[10, 12]]);
		expect(archive.session).toBeNull();

		archive.flushSession();

		expect(sent.some(message => message.key === 'viewing_log')).toBe(false);
	});

	test('saves pending data for the previous video before switching videos', () => {
		archive.load('abcdefghijk');
		archive.meta = {title: 'First video'};
		archive.pending_views = 1;
		archive.watched = [[0, 5]];
		archive.dirty = true;

		archive.load('lmnopqrstuv');

		const saved = sent.filter(message => message.key === 'transcript_archive').pop();

		expect(saved.value.abcdefghijk).toMatchObject({
			title: 'First video',
			views: 1,
			watched: [[0, 5]]
		});
	});

	test('drops the local copy when the archive is deleted from the menu', () => {
		archive.load('abcdefghijk');
		archive.meta = {title: 'Example video'};
		archive.pending_views = 1;
		archive.dirty = true;
		archive.save();

		expect(archive.store.abcdefghijk).toBeDefined();

		archive.onStorageChanged('transcript_archive', undefined);

		expect(archive.store).toEqual({});
		expect(archive.entry).toMatchObject({id: 'abcdefghijk', segments: []});
	});

	test('stops when both settings are switched off', () => {
		ImprovedTube.storage.archive_transcripts = false;
		ImprovedTube.storage.record_viewing_log = false;

		archive.init();

		expect(archive.tick_timer).toBeNull();
	});
});

describe('Wiring', () => {
	test('the shared library is injected into the page and exposed to the menu', () => {
		const manifest = JSON.parse(read('manifest.json'));
		const resources = manifest.web_accessible_resources[0].resources;

		expect(resources).toContain('js&css/transcript-archive.js');
		expect(resources).toContain('js&css/web-accessible/www.youtube.com/transcript-archive.js');

		const init = read('js&css', 'extension', 'init.js');

		expect(init).toContain("'/js&css/transcript-archive.js'");
		expect(init).toContain("'/js&css/web-accessible/www.youtube.com/transcript-archive.js'");

		const menu = read('menu', 'index.html');

		expect(menu).toContain('../js&css/transcript-archive.js');
		expect(menu).toContain('skeleton-parts/archive.js');
	});

	test('the feature is initialised with the player and reacts to its switches', () => {
		const functions = read('js&css', 'web-accessible', 'functions.js');
		const core = read('js&css', 'web-accessible', 'core.js');

		expect(functions).toContain('ImprovedTube.transcriptArchive?.init()');
		expect(core).toContain("case 'archiveTranscripts':");
		expect(core).toContain("case 'recordViewingLog':");
		expect(core).toContain("case 'transcriptArchive':");
	});

	test('the menu exposes the switches, search and ranking', () => {
		const menu = read('menu', 'skeleton-parts', 'archive.js');

		expect(menu).toContain('archive_transcripts');
		expect(menu).toContain('record_viewing_log');
		expect(menu).toContain("storage: 'transcript_search_ranking'");
		expect(menu).toContain('renderResults');
		expect(menu).toContain('renderLog');

		const home = read('menu', 'styles', 'home.css');

		expect(home).toContain('.satus-button--archive');
	});

	test('the labels are translated', () => {
		const messages = JSON.parse(read('_locales', 'en', 'messages.json'));

		['archive', 'archiveTranscripts', 'recordViewingLog', 'searchTranscripts', 'personalRanking', 'globalRanking', 'viewingLog'].forEach(key => {
			expect(messages[key]).toBeDefined();
		});
	});
});
