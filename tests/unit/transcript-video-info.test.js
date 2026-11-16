// "Add video info at the top": Copy and Download put the video's details above the transcript
process.env.TZ = 'Europe/Tallinn';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js'), 'utf8');
const SEGMENTS = 'ytd-transcript-segment-renderer, transcript-segment-view-model';

const fakeLine = (time, text) => ({
	querySelector: (selector) => {
		if (selector.includes('segment-text')) return {textContent: text};
		if (selector.includes('segment-timestamp')) return {textContent: time};
		return null;
	}
});

const playerResponse = (overrides = {}) => ({
	videoDetails: {videoId: 'abc', title: 'A video', author: 'Some Channel', channelId: 'UC123', lengthSeconds: '3753', ...overrides.videoDetails},
	microformat: {playerMicroformatRenderer: {publishDate: '2009-10-24T23:57:33-07:00', ownerProfileUrl: 'http://www.youtube.com/@some', ...overrides.microformat}}
});

// A page with one open transcript panel
const load = ({storage = {}, response = playerResponse(), clipboard = []} = {}) => {
	const lines = [fakeLine('0:00', 'Hello'), fakeLine('0:04', 'second line')];
	const panel = {
		getAttribute: (name) => ({'target-id': 'engagement-panel-searchable-transcript', visibility: 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED'})[name] || null,
		querySelector: (selector) => {
			if (selector === SEGMENTS) return lines[0];
			return null;
		},
		querySelectorAll: (selector) => (selector === SEGMENTS ? lines : [])
	};
	const context = {
		ImprovedTube: {},
		navigator: {clipboard: {writeText: (text) => clipboard.push(text)}},
		document: {
			querySelector: (selector) => (selector === '#movie_player' ? {getPlayerResponse: () => response} : null),
			querySelectorAll: (selector) => (selector.startsWith('ytd-engagement-panel-section-list-renderer') ? [panel] : []),
			addEventListener: () => {},
			documentElement: {dataset: {}, setAttribute: () => {}, removeAttribute: () => {}},
			createElement: () => ({style: {}, setAttribute: () => {}, appendChild: () => {}, addEventListener: () => {}})
		},
		window: {addEventListener: () => {}},
		HTMLElement: function () {},
		console: {log: () => {}, error: () => {}, warn: () => {}},
		setTimeout: () => {},
		clearTimeout: () => {},
		setInterval: () => {},
		clearInterval: () => {}
	};
	vm.runInNewContext(source, context);
	context.ImprovedTube.storage = storage;
	context.ImprovedTube.videoId = () => 'abc';
	context.ImprovedTube.videoTitle = () => 'Title from the page';
	return {ImprovedTube: context.ImprovedTube, clipboard};
};

const INFO = [
	'Title: A video',
	'Channel: Some Channel',
	'Channel link: https://www.youtube.com/@some',
	'Uploaded: 2009-10-25 08:57 (UTC+02:00)',
	'Duration: 1:02:33',
	'Link: https://www.youtube.com/watch?v=abc'
].join('\n');

describe('transcript video info', () => {
	test('off by default: Copy gives only the transcript', () => {
		const {ImprovedTube, clipboard} = load();
		ImprovedTube.copyTranscript({style: {}}, {dataset: {}});
		expect(clipboard).toEqual(['Hello second line']);
	});

	test('Copy puts the video info, an empty line, then the transcript', () => {
		const {ImprovedTube, clipboard} = load({storage: {transcript_video_info: true}});
		ImprovedTube.copyTranscript({style: {}}, {dataset: {}});
		expect(clipboard).toEqual([INFO + '\n\nHello second line']);
	});

	test('works together with "With timestamps"', () => {
		const {ImprovedTube} = load({storage: {transcript_video_info: true, copy_transcript_timestamps: true}});
		expect(ImprovedTube.transcriptCopyText()).toBe(INFO + '\n\n[0:00] Hello\n[0:04] second line');
	});

	test('Download writes the same header', () => {
		const {ImprovedTube} = load({storage: {transcript_video_info: true}});
		expect(ImprovedTube.withTranscriptVideoInfo('[0:00] Hello')).toBe(INFO + '\n\n[0:00] Hello');
		expect(source).toContain('ImprovedTube.withTranscriptVideoInfo(ImprovedTube.transcriptSegmentsToText(segments))');
	});

	test('ignores player data of the previous video (after navigating without a page reload)', () => {
		const {ImprovedTube} = load({response: playerResponse({videoDetails: {videoId: 'previous'}})});
		expect(ImprovedTube.transcriptVideoInfoText()).toBe('Title: Title from the page\nLink: https://www.youtube.com/watch?v=abc');
	});

	test('falls back to the channel id when there is no profile link', () => {
		const {ImprovedTube} = load({response: playerResponse({microformat: {ownerProfileUrl: undefined}})});
		expect(ImprovedTube.transcriptVideoInfoText()).toContain('Channel link: https://www.youtube.com/channel/UC123');
	});

	test('formats dates and durations', () => {
		const {ImprovedTube} = load();
		expect(ImprovedTube.transcriptDateText('2024-03-05')).toBe('2024-03-05');
		expect(ImprovedTube.transcriptDateText('2024-01-15T10:00:00+00:00')).toBe('2024-01-15 12:00 (UTC+02:00)');
		expect(ImprovedTube.transcriptDateText('')).toBe('');
		expect(ImprovedTube.transcriptDurationText('213')).toBe('3:33');
		expect(ImprovedTube.transcriptDurationText('59')).toBe('0:59');
		expect(ImprovedTube.transcriptDurationText('0')).toBe('');
	});

	test('the option name does not call a function on every settings change', () => {
		// core.js calls ImprovedTube[camelizedKey]() after a setting changes
		const {ImprovedTube} = load();
		expect(ImprovedTube.transcriptVideoInfo).toBeUndefined();
	});
});
