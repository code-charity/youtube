// Test for Issue #3316: Download the transcript as a text file

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const read = (...parts) => fs.readFileSync(path.join(__dirname, '../..', ...parts), 'utf8');

describe('Download Transcript (#3316)', () => {
	let ImprovedTube;

	beforeAll(() => {
		const noop = () => {};
		const context = {
			ImprovedTube: {},
			document: {
				querySelector: () => null,
				querySelectorAll: () => [],
				addEventListener: noop,
				createElement: () => ({style: {}, setAttribute: noop, appendChild: noop, addEventListener: noop})
			},
			console,
			setTimeout: noop,
			setInterval: noop,
			clearInterval: noop
		};
		vm.runInNewContext(read('js&css', 'web-accessible', 'www.youtube.com', 'player.js'), context);
		ImprovedTube = context.ImprovedTube;
	});

	describe('transcriptSegmentsToText', () => {
		test('writes one line per segment with the timestamp in brackets', () => {
			const text = ImprovedTube.transcriptSegmentsToText([
				{time: '0:00', text: 'Hello'},
				{time: '1:05', text: 'second line'}
			]);
			expect(text).toBe('[0:00] Hello\n[1:05] second line');
		});

		test('omits the brackets when a segment has no timestamp', () => {
			expect(ImprovedTube.transcriptSegmentsToText([{time: '', text: 'No time'}])).toBe('No time');
		});

		test('returns an empty string for no segments', () => {
			expect(ImprovedTube.transcriptSegmentsToText([])).toBe('');
		});
	});

	describe('readTranscriptSegments', () => {
		// A fake transcript line: querySelector answers by class name, the way the real selectors do
		const fakeSegment = (classes) => ({
			querySelector: (selector) => {
				const wanted = selector.split(',').map((s) => s.trim());
				const hit = Object.keys(classes).find((name) => wanted.includes(name));
				return hit ? {textContent: classes[hit]} : null;
			}
		});
		const withSegments = (segments) => {
			const context = {ImprovedTube: {}, document: {querySelectorAll: () => segments}};
			vm.runInNewContext(
				'ImprovedTube.readTranscriptSegments = ' + ImprovedTube.readTranscriptSegments.toString(),
				context
			);
			return context.ImprovedTube.readTranscriptSegments();
		};

		test('reads lines from YouTube\'s current transcript panel', () => {
			expect(withSegments([
				fakeSegment({'.ytwTranscriptSegmentViewModelTimestamp': ' 0:18 ', '.ytAttributedStringHost': ' We\'re no strangers '})
			])).toEqual([{time: '0:18', text: 'We\'re no strangers'}]);
		});

		test('still reads lines from the older panel markup', () => {
			expect(withSegments([
				fakeSegment({'.segment-timestamp': '1:05', '.segment-text': 'older markup'})
			])).toEqual([{time: '1:05', text: 'older markup'}]);
		});

		test('skips lines without text and tolerates a missing timestamp', () => {
			expect(withSegments([
				fakeSegment({'.segment-text': '   '}),
				fakeSegment({'.segment-text': 'no time'})
			])).toEqual([{time: '', text: 'no time'}]);
		});

		test('queries both the current and the older segment element', () => {
			const player = read('js&css', 'web-accessible', 'www.youtube.com', 'player.js');
			expect(player).toContain("querySelectorAll('ytd-transcript-segment-renderer, transcript-segment-view-model')");
		});
	});

	describe('transcriptFileName', () => {
		test('joins the video id and title and ends in .txt', () => {
			expect(ImprovedTube.transcriptFileName('jNQXAC9IVRw', 'Me at the zoo')).toBe('jNQXAC9IVRw Me at the zoo.txt');
		});

		test('replaces characters that are not allowed in file names', () => {
			expect(ImprovedTube.transcriptFileName('abc', 'What? A "test" / 1:2 <b>')).toBe('abc What A test 1 2 b.txt');
		});

		test('falls back to "transcript" when the title is missing', () => {
			expect(ImprovedTube.transcriptFileName('abc', '')).toBe('abc transcript.txt');
			expect(ImprovedTube.transcriptFileName('', '')).toBe('transcript.txt');
		});

		test('keeps very long titles to a sane length', () => {
			expect(ImprovedTube.transcriptFileName('abc', 'x'.repeat(500)).length).toBeLessThanOrEqual(124);
		});
	});

	describe('wiring', () => {
		test('adds a menu switch that is off by default', () => {
			const menu = read('menu', 'skeleton-parts', 'player.js');
			expect(menu).toMatch(/download_transcript:\s*\{\s*component: 'switch',\s*text: 'downloadTranscript',\s*value: false/);
		});

		test('has an English label', () => {
			const messages = JSON.parse(read('_locales', 'en', 'messages.json'));
			expect(messages.downloadTranscript.message).toContain('Download Transcript');
		});

		test('only shows the button when the option is on', () => {
			const appearance = read('js&css', 'web-accessible', 'www.youtube.com', 'appearance.js');
			expect(appearance).toContain("this.storage.download_transcript === true && !document.querySelector('#it-below-player-download-transcript')");
			expect(appearance).toContain('ImprovedTube.downloadTranscript(svg, button)');
		});

		test('adds or removes the button when the option is toggled', () => {
			const core = read('js&css', 'web-accessible', 'core.js');
			expect(core).toContain("case 'downloadTranscript':");
			expect(core).toContain('.improvedtube-player-button[data-tooltip="DownloadTranscript"]');
		});

		test('copy and download share one transcript button selector', () => {
			expect(typeof ImprovedTube.transcriptButtonSelector).toBe('string');
			const player = read('js&css', 'web-accessible', 'www.youtube.com', 'player.js');
			expect(player).toContain('var transcriptButtonSelector = ImprovedTube.transcriptButtonSelector;');
		});
	});
});
