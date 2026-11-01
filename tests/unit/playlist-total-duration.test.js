// Test for: Playlist total duration (feature request #4437)
// Verifies the duration parsing/formatting helpers, per-renderer duration
// extraction (Polymer data first, overlay text fallback) and the wiring of
// the feature: settings switch, locale label and init call.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Playlist total duration (#4437)', () => {
	const filePath = path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/playlist.js');
	let ImprovedTube;

	beforeAll(() => {
		const sourceContent = fs.readFileSync(filePath, 'utf8');
		const sandbox = {
			ImprovedTube: {
				storage: {},
				elements: { buttons: {} },
				regex: {},
			},
			document: {
				querySelectorAll: () => [],
				querySelector: () => null,
				getElementById: () => null,
			},
			console,
			setTimeout,
			clearTimeout,
		};
		sandbox.window = sandbox;
		vm.createContext(sandbox);
		vm.runInContext(sourceContent, sandbox, { filename: filePath });
		ImprovedTube = sandbox.ImprovedTube;
	});

	test('parses mm:ss and h:mm:ss overlay text', () => {
		expect(ImprovedTube.playlistParseDuration('1:23')).toBe(83);
		expect(ImprovedTube.playlistParseDuration('12:05')).toBe(725);
		expect(ImprovedTube.playlistParseDuration('1:02:03')).toBe(3723);
		expect(ImprovedTube.playlistParseDuration('10:00:00')).toBe(36000);
	});

	test('extracts the first duration from duplicated or padded overlay text', () => {
		// YouTube overlays can carry the duration twice or with extra whitespace
		expect(ImprovedTube.playlistParseDuration('1:27:41\n    1:27:41')).toBe(5261);
		expect(ImprovedTube.playlistParseDuration('  8:30  ')).toBe(510);
	});

	test('rejects invalid or empty duration text', () => {
		expect(ImprovedTube.playlistParseDuration('')).toBeNull();
		expect(ImprovedTube.playlistParseDuration(null)).toBeNull();
		expect(ImprovedTube.playlistParseDuration('PREMIERE')).toBeNull();
		expect(ImprovedTube.playlistParseDuration('45')).toBeNull();
		expect(ImprovedTube.playlistParseDuration('0:00')).toBeNull();
		expect(ImprovedTube.playlistParseDuration('a:b')).toBeNull();
	});

	test('formats seconds like YouTube (h:mm:ss, mm:ss)', () => {
		expect(ImprovedTube.playlistFormatDuration(83)).toBe('1:23');
		expect(ImprovedTube.playlistFormatDuration(600)).toBe('10:00');
		expect(ImprovedTube.playlistFormatDuration(3723)).toBe('1:02:03');
		expect(ImprovedTube.playlistFormatDuration(36000)).toBe('10:00:00');
		expect(ImprovedTube.playlistFormatDuration(0)).toBe('0:00');
		expect(ImprovedTube.playlistFormatDuration('abc')).toBe('0:00');
	});

	test('prefers exact Polymer data.lengthSeconds over overlay text', () => {
		const renderer = {
			data: { lengthSeconds: 245 },
			querySelector: () => ({ textContent: '4:05' }),
		};
		expect(ImprovedTube.playlistVideoDurationSeconds(renderer)).toBe(245);
	});

	test('accepts numeric strings in data.lengthSeconds', () => {
		const renderer = { data: { lengthSeconds: '130' } };
		expect(ImprovedTube.playlistVideoDurationSeconds(renderer)).toBe(130);
	});

	test('falls back to the thumbnail overlay text', () => {
		const renderer = {
			data: {},
			querySelector: (selector) =>
				selector === 'ytd-thumbnail-overlay-time-status-renderer'
					? { textContent: '8:30' }
					: null,
		};
		expect(ImprovedTube.playlistVideoDurationSeconds(renderer)).toBe(510);
	});

	test('returns null when no duration is available (e.g. premieres)', () => {
		expect(ImprovedTube.playlistVideoDurationSeconds({ data: {}, querySelector: () => null })).toBeNull();
		expect(ImprovedTube.playlistVideoDurationSeconds(null)).toBeNull();
	});

	test('is wired into the playlist page lifecycle', () => {
		const initJs = fs.readFileSync(path.join(__dirname, '../../js&css/web-accessible/init.js'), 'utf8');
		expect(initJs).toContain('ImprovedTube.playlistTotalDuration();');
	});

	test('is exposed as a settings switch with an English label', () => {
		const menuJs = fs.readFileSync(path.join(__dirname, '../../menu/skeleton-parts/playlist.js'), 'utf8');
		expect(menuJs).toContain('playlist_total_duration');
		const messages = JSON.parse(fs.readFileSync(path.join(__dirname, '../../_locales/en/messages.json'), 'utf8'));
		expect(messages.playlistTotalDuration).toBeDefined();
		expect(messages.playlistTotalDuration.message.length).toBeGreaterThan(0);
	});

	test('labels partial sums honestly (available durations, not all videos)', () => {
		const sourceContent = fs.readFileSync(filePath, 'utf8');
		// private/deleted/not-yet-rendered videos have no duration, so the sum
		// only covers available durations and the label must say so
		expect(sourceContent).toContain('durations available');
		expect(sourceContent).not.toContain('videos loaded');
	});

	test('renders the badge on its own line so narrow hosts cannot clip it', () => {
		const sourceContent = fs.readFileSync(filePath, 'utf8');
		expect(sourceContent).toContain('display:block');
		expect(sourceContent).not.toContain('white-space:nowrap');
	});

	test('cleans up badge and observer when the switch is off', () => {
		const sourceContent = fs.readFileSync(filePath, 'utf8');
		expect(sourceContent).toContain('ImprovedTube.playlistTotalDurationCleanup');
		expect(sourceContent).toContain('it-playlist-total-duration');
		// the feature must stay opt-in, matching the other playlist switches
		expect(sourceContent).toContain("this.storage.playlist_total_duration !== true");
	});
});
