const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');
const fixture = require('../fixtures/chapter-timestamps.json');

const root = path.join(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'js&css/web-accessible/www.youtube.com/shortcuts.js'), 'utf8');
const functions = fs.readFileSync(path.join(root, 'js&css/web-accessible/functions.js'), 'utf8');
const sessions = [];
const clone = value => JSON.parse(JSON.stringify(value));
const markerBar = data => data.playerOverlays.playerOverlayRenderer.decoratedPlayerBarRenderer.decoratedPlayerBarRenderer.playerBar.multiMarkersPlayerBarRenderer;

function load (data = clone(fixture.data), time = 0) {
	const dom = new JSDOM('<!doctype html><div id="movie_player"></div>', {
		url: fixture.source, runScripts: 'outside-only', virtualConsole: new VirtualConsole()
	});
	sessions.push(dom);
	const { window } = dom;
	const player = window.document.getElementById('movie_player');
	player.getCurrentTime = jest.fn(() => time);
	player.getDuration = jest.fn(() => 600);
	player.getVideoData = jest.fn(() => ({ video_id: 'Cto5R8p74kg' }));
	player.seekTo = jest.fn(value => { time = value; });
	window.ImprovedTube = { elements: { player }, storage: {}, regex: {} };
	const context = dom.getInternalVMContext();
	vm.runInContext(functions, context);
	vm.runInContext(source, context);
	window.ytInitialData = data;
	return { IT: window.ImprovedTube, window, player, setTime: value => { time = value; } };
}

afterEach(() => sessions.splice(0).forEach(dom => dom.window.close()));

describe('Chapter shortcuts use exact timestamps (#4060, related #4056)', () => {
	test('seeks the issue video to exact automatic chapter boundaries, independent of the progress bar width', () => {
		const page = load();
		page.player.innerHTML = '<div class="ytp-progress-bar" style="width:0"><div class="ytp-chapters-container"><div></div></div></div>';
		expect(page.IT.shortcutSeekNextChapter()).toBe(false);
		expect(page.player.seekTo).toHaveBeenLastCalledWith(23.599);
		expect(page.player.querySelector('#it-status').textContent).toBe('Marketing fundamentals');
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).toHaveBeenLastCalledWith(86.119);
	});

	test('previous selects the immediately preceding timestamp and handles an exact boundary and the first chapter', () => {
		const page = load(undefined, 100);
		page.IT.shortcutSeekPreviousChapter();
		expect(page.player.seekTo).toHaveBeenLastCalledWith(86.119);
		page.IT.shortcutSeekPreviousChapter();
		expect(page.player.seekTo).toHaveBeenLastCalledWith(23.599);
		page.IT.shortcutSeekPreviousChapter();
		expect(page.player.seekTo).toHaveBeenLastCalledWith(0);
		page.IT.shortcutSeekPreviousChapter();
		expect(page.player.seekTo).toHaveBeenCalledTimes(3);
	});

	test('does not wrap or invent a forward seek at the last chapter', () => {
		const page = load(undefined, 500);
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).not.toHaveBeenCalled();
	});

	test('does not select the same boundary after sub-millisecond floating-point rounding', () => {
		const page = load(undefined, 86.118999);
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).toHaveBeenLastCalledWith(185.56);
		page.setTime(86.119001);
		page.IT.shortcutSeekPreviousChapter();
		expect(page.player.seekTo).toHaveBeenLastCalledWith(23.599);
	});

	test('prefers creator chapters over automatic chapters and ignores heatmap markers', () => {
		const data = clone(fixture.data);
		markerBar(data).markersMap.unshift({ key: 'HEATMAP', value: { chapters: [{ chapterRenderer: { timeRangeStartMillis: 5000 } }] } });
		markerBar(data).markersMap.push({ key: 'DESCRIPTION_CHAPTERS', value: { chapters: [
			{ chapterRenderer: { timeRangeStartMillis: 0, title: { simpleText: 'Intro' } } },
			{ chapterRenderer: { timeRangeStartMillis: 60000, title: { runs: [{ text: 'Creator ' }, { text: 'chapter' }] } } }
		] } });
		const page = load(data);
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).toHaveBeenCalledWith(60);
		expect(page.player.querySelector('#it-status').textContent).toBe('Creator chapter');
	});

	test('uses the captured chapter panel endpoints when the progress-bar metadata is absent', () => {
		const data = clone(fixture.data);
		delete data.playerOverlays;
		const page = load(data);
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).toHaveBeenCalledWith(23.599001);
	});

	test('prefers a creator chapter panel over automatic progress-bar chapters', () => {
		const data = clone(fixture.data);
		const panel = data.engagementPanels[0].engagementPanelSectionListRenderer;
		panel.targetId = 'engagement-panel-macro-markers-description-chapters';
		panel.content.macroMarkersListRenderer.contents[1].macroMarkersListItemRenderer.onTap.watchEndpoint.startTimeSeconds = 60;
		const page = load(data);
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).toHaveBeenCalledWith(60);
	});

	test('does not accept unowned or stale bootstrap chapter data after SPA navigation', () => {
		const page = load();
		page.window.history.replaceState({}, '', '/watch?v=abcdefghijk');
		page.player.getVideoData.mockReturnValue({ video_id: 'abcdefghijk' });
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).not.toHaveBeenCalled();
		delete page.window.ytInitialData.currentVideoEndpoint;
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).not.toHaveBeenCalled();
	});

	test('reads fresh watch-page data on each SPA navigation instead of retaining a cached chapter list', () => {
		const page = load();
		const data = clone(fixture.data);
		data.currentVideoEndpoint.watchEndpoint.videoId = 'abcdefghijk';
		markerBar(data).markersMap[0].value.chapters[1].chapterRenderer.timeRangeStartMillis = 45000;
		page.IT.elements.ytd_watch = { data };
		page.window.history.replaceState({}, '', '/watch?v=abcdefghijk');
		page.player.getVideoData.mockReturnValue({ video_id: 'abcdefghijk' });
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).toHaveBeenLastCalledWith(45);
		page.setTime(0);
		markerBar(data).markersMap[0].value.chapters[1].chapterRenderer.timeRangeStartMillis = 47000;
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).toHaveBeenLastCalledWith(47);
	});

	test('does not seek an outgoing player when its video differs from the URL', () => {
		const page = load();
		page.player.getVideoData.mockReturnValue({ video_id: 'abcdefghijk' });
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).not.toHaveBeenCalled();
	});

	test('skips malformed, duplicate, negative and beyond-duration timestamps without altering source data', () => {
		const data = clone(fixture.data);
		markerBar(data).markersMap.unshift(null);
		markerBar(data).markersMap[1].value.chapters = [
			null, {}, { chapterRenderer: { timeRangeStartMillis: null } }, { chapterRenderer: { timeRangeStartMillis: '' } },
			{ chapterRenderer: { timeRangeStartMillis: -1 } }, { chapterRenderer: { timeRangeStartMillis: 'bad' } },
			{ chapterRenderer: { timeRangeStartMillis: 700000 } }, { chapterRenderer: { timeRangeStartMillis: 20000 } },
			{ chapterRenderer: { timeRangeStartMillis: '10000' } }, { chapterRenderer: { timeRangeStartMillis: 10000 } }
		];
		const before = clone(data);
		const page = load(data);
		page.IT.shortcutSeekNextChapter();
		page.IT.shortcutSeekNextChapter();
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo.mock.calls).toEqual([[10], [20]]);
		expect(data).toEqual(before);
	});

	test('ignores mismatched video IDs and non-chapter entries in panel endpoint metadata', () => {
		const data = clone(fixture.data);
		delete data.playerOverlays;
		data.engagementPanels[0].engagementPanelSectionListRenderer.content.macroMarkersListRenderer.contents[1].macroMarkersListItemRenderer.onTap.watchEndpoint.videoId = 'abcdefghijk';
		data.engagementPanels.unshift(null);
		const page = load(data);
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).not.toHaveBeenCalled();
	});

	test('uses loaded same-video chapter timestamp links when data is unavailable, never comments or other videos', () => {
		const page = load(null);
		page.window.document.body.insertAdjacentHTML('beforeend', '<a href="/watch?v=Cto5R8p74kg&t=1s">Comment timestamp</a>' +
			'<div target-id="engagement-panel-macro-markers-description-chapters">' +
			'<a href="/watch?v=other-video&t=2s">Other video</a><a href="https://example.org/watch?v=Cto5R8p74kg&t=3s">Other host</a>' +
			'<a href="/watch?v=Cto5R8p74kg&t=bad">Invalid</a><a href="/watch?v=Cto5R8p74kg&t=0s">Intro</a>' +
			'<a href="/watch?v=Cto5R8p74kg&t=1m30s">Chapter</a></div>');
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).toHaveBeenCalledWith(90);
		page.IT.shortcutSeekPreviousChapter();
		expect(page.player.seekTo).toHaveBeenLastCalledWith(0);
	});

	test.each([['90', 90], ['90.5s', 90.5], ['2m', 120], ['1h', 3600], ['1h2m3s', 3723]])('parses a loaded chapter link timestamp %s', (timestamp, seconds) => {
		const page = load(null);
		page.player.getDuration.mockReturnValue(4000);
		const panel = page.window.document.createElement('div');
		panel.setAttribute('target-id', 'engagement-panel-macro-markers-description-chapters');
		const anchor = page.window.document.createElement('a');
		anchor.href = '/watch?v=Cto5R8p74kg&t=' + timestamp;
		panel.appendChild(anchor);
		page.window.document.body.appendChild(panel);
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).toHaveBeenCalledWith(seconds);
	});

	test('renders chapter title feedback as text rather than markup', () => {
		const data = clone(fixture.data);
		markerBar(data).markersMap[0].value.chapters[1].chapterRenderer.title.simpleText = '<img src=x onerror=alert(1)>';
		const page = load(data);
		page.IT.shortcutSeekNextChapter();
		expect(page.player.querySelector('#it-status').textContent).toBe('<img src=x onerror=alert(1)>');
		expect(page.player.querySelector('#it-status img')).toBeNull();
	});

	test.each([NaN, Infinity, -1])('does not seek an invalid current time %s', time => {
		const page = load(undefined, time);
		page.IT.shortcutSeekNextChapter();
		page.IT.shortcutSeekPreviousChapter();
		expect(page.player.seekTo).not.toHaveBeenCalled();
	});

	test('is a safe no-op without a player, chapter data, or during an advertisement', () => {
		const page = load(null);
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).not.toHaveBeenCalled();
		page.window.ytInitialData = clone(fixture.data);
		page.player.classList.add('ad-showing');
		page.IT.shortcutSeekNextChapter();
		expect(page.player.seekTo).not.toHaveBeenCalled();
		page.IT.elements.player = null;
		expect(() => page.IT.shortcutSeekPreviousChapter()).not.toThrow();
	});
});
