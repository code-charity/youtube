const fs = require('fs');
const path = require('path');
const vm = require('vm');

const read = (...parts) => fs.readFileSync(path.join(__dirname, '../..', ...parts), 'utf8');

const playerSource = read('js&css', 'web-accessible', 'www.youtube.com', 'player.js');
const menuSource = read('menu', 'skeleton-parts', 'player.js');
const messages = JSON.parse(read('_locales', 'en', 'messages.json'));

// YouTube's current transcript markup: .ytAttributedStringHost carries the text and
// .ytwTranscriptSegmentViewModelTimestamp the time; the older ytd- classes are the fallbacks.
const SEGMENTS = [
	{ text: 'Hello there', time: '0:00' },
	{ text: 'second line', time: '1:05' }
];

function transcriptNode (segment) {
	return {
		querySelector: (selector) => {
			const wanted = selector.split(',').map((part) => part.trim());
			if (wanted.includes('.segment-text') || wanted.includes('.ytAttributedStringHost')) {
				return { textContent: segment.text };
			}
			if (wanted.includes('.segment-timestamp') || wanted.includes('.ytwTranscriptSegmentViewModelTimestamp')) {
				return { textContent: segment.time };
			}
			return null;
		}
	};
}

function loadPlayer (storage, extra = {}) {
	const context = Object.assign({
		ImprovedTube: { storage: storage || {} },
		document: {
			querySelector: () => null,
			querySelectorAll: () => SEGMENTS.map(transcriptNode),
			addEventListener: () => {},
			createElement: () => ({ style: {}, dataset: {}, setAttribute: () => {}, appendChild: () => {}, addEventListener: () => {} })
		},
		console: { error: () => {}, log: () => {} },
		setTimeout: () => 0,
		setInterval: () => 0,
		clearInterval: () => {},
		navigator: { clipboard: { writeText: (text) => { context.__copied = text; } } }
	}, extra);

	vm.runInNewContext(playerSource, context);
	return context;
}

describe('#4427 - transcript timestamps option', () => {
	describe('transcriptUseTimestamps', () => {
		test('keeps each button current behaviour when nothing is chosen', () => {
			const { ImprovedTube } = loadPlayer({});

			expect(ImprovedTube.transcriptUseTimestamps(true)).toBe(true);   // download today
			expect(ImprovedTube.transcriptUseTimestamps(false)).toBe(false);  // copy today
		});

		test('the explicit choices win over both fallbacks', () => {
			expect(loadPlayer({ transcript_timestamps: 'with' }).ImprovedTube.transcriptUseTimestamps(false)).toBe(true);
			expect(loadPlayer({ transcript_timestamps: 'without' }).ImprovedTube.transcriptUseTimestamps(true)).toBe(false);
		});

		test('an unknown stored value falls back instead of throwing', () => {
			expect(loadPlayer({ transcript_timestamps: 'maybe' }).ImprovedTube.transcriptUseTimestamps(true)).toBe(true);
		});
	});

	describe('transcriptSegmentsToText', () => {
		const segments = [
			{ time: '0:00', text: 'Hello there' },
			{ time: '1:05', text: 'second line' }
		];

		test('still writes timestamps when the argument is omitted', () => {
			expect(loadPlayer({}).ImprovedTube.transcriptSegmentsToText(segments))
				.toBe('[0:00] Hello there\n[1:05] second line');
		});

		test('writes plain lines when asked to leave the times out', () => {
			expect(loadPlayer({}).ImprovedTube.transcriptSegmentsToText(segments, false))
				.toBe('Hello there\nsecond line');
		});
	});

	describe('the Download Transcript button', () => {
		function downloadedText (storage) {
			let written = null;

			class Blob {
				constructor (parts) { written = parts.join(''); }
			}
			const context = loadPlayer(storage, {
				Blob,
				URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
				document: {
					querySelector: () => null,
					querySelectorAll: () => SEGMENTS.map(transcriptNode),
					addEventListener: () => {},
					createElement: () => ({ style: {}, dataset: {}, click: () => {}, setAttribute: () => {}, appendChild: () => {}, addEventListener: () => {} })
				}
			});

			context.ImprovedTube.videoId = () => 'dQw4w9WgXcQ';
			context.ImprovedTube.videoTitle = () => 'Video';
			context.ImprovedTube.downloadTranscript({ style: {} }, { style: {}, dataset: {} });

			return written;
		}

		test('keeps timestamps by default', () => {
			expect(downloadedText({})).toBe('[0:00] Hello there\n[1:05] second line');
		});

		test('drops them when set to without', () => {
			expect(downloadedText({ transcript_timestamps: 'without' })).toBe('Hello there\nsecond line');
		});
	});

	describe('the Copy Transcript button', () => {
		function copiedText (storage) {
			// the copy loop polls on an interval, so run one tick of it immediately
			const context = loadPlayer(storage, { setInterval: (tick) => { tick(); return 0; } });

			context.ImprovedTube.waitForTranscriptAndCopy({ style: {} }, { dataset: {} });

			return context.__copied;
		}

		test('copies the paragraph without timestamps by default', () => {
			expect(copiedText({})).toBe('Hello there second line');
		});

		test('copies one line per segment when set to with', () => {
			expect(copiedText({ transcript_timestamps: 'with' })).toBe('[0:00] Hello there\n[1:05] second line');
		});
	});

	describe('menu + locale conventions', () => {
		test('the option is a searchable select with the three values', () => {
			expect(menuSource).toMatch(/transcript_timestamps:\s*\{\s*component: 'select',\s*text: 'transcriptTimestamps',\s*tags:/);
			['default', 'with', 'without'].forEach((value) => {
				expect(menuSource).toContain(`value: '${value}'`);
			});
		});

		test('every label used by the option is localized', () => {
			['transcriptTimestamps', 'transcriptTimestampsAsNow', 'transcriptTimestampsWith', 'transcriptTimestampsWithout']
				.forEach((key) => {
					expect(messages[key]).toBeDefined();
					expect(typeof messages[key].message).toBe('string');
				});
		});
	});
});
