// Shared transcript panel helpers, used by "Transcript (always expanded)", the transcript
// shortcut, and the Copy / Download / Show-Hide Transcript buttons

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const read = (...parts) => fs.readFileSync(path.join(__dirname, '../..', ...parts), 'utf8');
const web = (...parts) => read('js&css', 'web-accessible', ...parts);
const sources = {
	player: web('www.youtube.com', 'player.js'),
	appearance: web('www.youtube.com', 'appearance.js'),
	shortcuts: web('www.youtube.com', 'shortcuts.js')
};

const EXPANDED_PANELS = 'ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]';
const SEGMENTS = 'ytd-transcript-segment-renderer, transcript-segment-view-model';
const DESCRIPTION_BUTTON = 'ytd-video-description-transcript-section-renderer button';
const TRANSCRIPT_PANEL = '[target-id*=transcript]';

const fakeButton = () => ({clicks: 0, click () { this.clicks++; }, hasAttribute: () => false});

// A side panel with an X button, optionally holding transcript lines
const fakePanel = (targetId, hasSegments) => {
	const closeButton = fakeButton();
	return {
		closeButton,
		removed: [],
		attributes: {},
		getAttribute: (name) => (name === 'target-id' ? targetId : null),
		setAttribute (name, value) { this.attributes[name] = value; },
		removeAttribute (name) { this.removed.push(name); },
		querySelector: (selector) => {
			if (selector === '#visibility-button button') return closeButton;
			if (selector === SEGMENTS) return hasSegments ? {} : null;
			return null;
		}
	};
};

// Runs the given files against a fake page: `elements` maps a selector to the element it finds,
// `expandedPanels` are the side panels that are open. Timers only run when flushTimers() is called.
const load = (files, {elements = {}, expandedPanels = [], storage = {}} = {}) => {
	const timers = [];
	const context = {
		ImprovedTube: {storage},
		document: {
			querySelector: (selector) => elements[selector] || null,
			querySelectorAll: (selector) => (selector === EXPANDED_PANELS ? expandedPanels : []),
			addEventListener: () => {},
			documentElement: {dataset: {}, setAttribute: () => {}, removeAttribute: () => {}},
			createElement: () => ({style: {}, setAttribute: () => {}, appendChild: () => {}, addEventListener: () => {}})
		},
		window: {addEventListener: () => {}},
		HTMLElement: function () {},
		console: {log: () => {}, error: () => {}, warn: () => {}},
		setTimeout: (fn) => { timers.push(fn); return timers.length; },
		clearTimeout: () => {},
		setInterval: () => {},
		clearInterval: () => {}
	};
	context.HTMLElement.prototype.focus = function () {};
	for (const file of files) {
		vm.runInNewContext(sources[file], context);
	}
	context.ImprovedTube.storage = storage;
	context.ImprovedTube.videoId = () => 'current';
	const flushTimers = () => {
		while (timers.length) {
			timers.shift()();
		}
	};
	const runOneTimer = () => { const fn = timers.shift(); if (fn) fn(); };
	return {ImprovedTube: context.ImprovedTube, flushTimers, runOneTimer, document: context.document, elements};
};

describe('closeTranscriptPanel', () => {
	test('closes a separate transcript panel', () => {
		const panel = fakePanel('engagement-panel-searchable-transcript', false);
		load(['player'], {expandedPanels: [panel]}).ImprovedTube.closeTranscriptPanel();
		expect(panel.closeButton.clicks).toBe(1);
	});

	test('closes the transcript tab of the "In this video" panel', () => {
		const panel = fakePanel('engagement-panel-macro-markers-auto-chapters', true);
		load(['player'], {expandedPanels: [panel]}).ImprovedTube.closeTranscriptPanel();
		expect(panel.closeButton.clicks).toBe(1);
	});

	test('leaves other panels (e.g. comments) alone', () => {
		const comments = fakePanel('engagement-panel-comments-section', false);
		load(['player'], {expandedPanels: [comments]}).ImprovedTube.closeTranscriptPanel();
		expect(comments.closeButton.clicks).toBe(0);
	});
});

describe('Transcript (always expanded)', () => {
	const expand = (options, el) => {
		const page = load(['player', 'appearance'], {storage: {transcript: true}, ...options});
		page.ImprovedTube.transcript(el);
		return page;
	};

	test('opens a separate transcript panel with the description\'s button', () => {
		const descriptionButton = fakeButton();
		const panel = fakePanel('engagement-panel-searchable-transcript', false);
		const panels = {querySelector: (selector) => (selector === TRANSCRIPT_PANEL ? panel : null)};

		expand({elements: {[DESCRIPTION_BUTTON]: descriptionButton}}, panels);

		expect(descriptionButton.clicks).toBe(1);
		expect(panel.removed).toEqual([]);
	});

	test('opens the transcript when it is a tab of the "In this video" panel', () => {
		const descriptionButton = fakeButton();
		const panels = {querySelector: () => null};

		expand({elements: {[DESCRIPTION_BUTTON]: descriptionButton}}, panels);

		expect(descriptionButton.clicks).toBe(1);
	});

	test('ignores the wide aria-label fallback, which also matches buttons like "Description"', () => {
		const otherButton = fakeButton();
		const selector = load(['player']).ImprovedTube.transcriptButtonSelector;

		expand({elements: {[selector]: otherButton}}, {querySelector: () => null});

		expect(otherButton.clicks).toBe(0);
	});

	test('falls back to unhiding the panel when the description has no button', () => {
		const panel = fakePanel('engagement-panel-searchable-transcript', false);
		const panels = {querySelector: (selector) => (selector === TRANSCRIPT_PANEL ? panel : null)};

		expand({}, panels);

		expect(panel.removed).toEqual(['visibility']);
	});

	test('does nothing when the transcript is already open', () => {
		const descriptionButton = fakeButton();
		const open = fakePanel('engagement-panel-macro-markers-auto-chapters', true);

		expand({elements: {[DESCRIPTION_BUTTON]: descriptionButton}, expandedPanels: [open]}, {querySelector: () => null});

		expect(descriptionButton.clicks).toBe(0);
		expect(open.closeButton.clicks).toBe(0);
	});

	test('retries a few times, then gives up when the video has no transcript', () => {
		const panels = {querySelector: jest.fn(() => null)};
		const page = expand({}, panels);
		page.flushTimers();
		expect(panels.querySelector).toHaveBeenCalledTimes(10);
	});

	test('keeps waiting while the tab is in the background', () => {
		const panels = {querySelector: jest.fn(() => null)};
		const page = load(['player', 'appearance'], {storage: {transcript: true}});
		page.document.hidden = true;
		page.ImprovedTube.transcript(panels);
		for (let i = 0; i < 20; i++) page.runOneTimer();
		// more tries than the visible-tab limit of 10
		expect(panels.querySelector.mock.calls.length).toBeGreaterThan(10);

		const descriptionButton = fakeButton();
		page.elements[DESCRIPTION_BUTTON] = descriptionButton;
		page.document.hidden = false;
		page.flushTimers();
		expect(descriptionButton.clicks).toBe(1);
	});

	test('opens the transcript once the button shows up late', () => {
		const elements = {};
		const page = expand({elements}, {querySelector: () => null});
		const descriptionButton = fakeButton();
		elements[DESCRIPTION_BUTTON] = descriptionButton;

		page.flushTimers();

		expect(descriptionButton.clicks).toBe(1);
	});

	test('waits while the description still belongs to the previous video (SPA navigation)', () => {
		const descriptionButton = fakeButton();
		const metadata = {videoId: 'previous', getAttribute () { return this.videoId; }};
		const page = expand({elements: {[DESCRIPTION_BUTTON]: descriptionButton, 'ytd-watch-metadata': metadata}}, {querySelector: () => null});

		expect(descriptionButton.clicks).toBe(0);
		metadata.videoId = 'current';
		page.flushTimers();
		expect(descriptionButton.clicks).toBe(1);
	});

	test('leaves a stale "Show transcript" button alone when the new video has no captions', () => {
		const descriptionButton = fakeButton();
		const player = {getPlayerResponse: () => ({videoDetails: {videoId: 'current'}})};

		expand({elements: {[DESCRIPTION_BUTTON]: descriptionButton, '#movie_player': player}}, {querySelector: () => null});

		expect(descriptionButton.clicks).toBe(0);
	});

	test('opens the transcript when the player lists captions', () => {
		const descriptionButton = fakeButton();
		const player = {getPlayerResponse: () => ({videoDetails: {videoId: 'current'}, captions: {}})};

		expand({elements: {[DESCRIPTION_BUTTON]: descriptionButton, '#movie_player': player}}, {querySelector: () => null});

		expect(descriptionButton.clicks).toBe(1);
	});

	test('works when core.js calls it without the panels element', () => {
		const descriptionButton = fakeButton();
		expect(() => expand({elements: {[DESCRIPTION_BUTTON]: descriptionButton}})).not.toThrow();
		expect(descriptionButton.clicks).toBe(1);
	});

	test('does nothing when the option is off', () => {
		const descriptionButton = fakeButton();
		const page = load(['player', 'appearance'], {elements: {[DESCRIPTION_BUTTON]: descriptionButton}, storage: {transcript: false}});

		page.ImprovedTube.transcript({querySelector: () => null});

		expect(descriptionButton.clicks).toBe(0);
	});

	test('"Chapters (always expanded)" does not switch away from an open transcript', () => {
		const chapters = fakePanel('engagement-panel-macro-markers-auto-chapters', true);
		const page = load(['player', 'appearance'], {expandedPanels: [chapters], storage: {transcript: true, chapters: true}});
		const el = {querySelector: jest.fn(() => null)};

		page.ImprovedTube.chapters(el);

		expect(el.querySelector).not.toHaveBeenCalled();
	});

	describe('wiring', () => {
		test('chapters run before the transcript, so the transcript tab wins', () => {
			const functions = web('functions.js');
			expect(functions).toContain('ImprovedTube.chapters(node); ImprovedTube.transcript(node);');
			expect(functions).toContain('ImprovedTube.chapters(ImprovedTube.elements.panels); ImprovedTube.transcript(ImprovedTube.elements.panels);');
		});

		test('switching the option off closes the transcript wherever it is', () => {
			const core = web('core.js');
			const transcriptCase = core.slice(core.indexOf("case 'transcript':"), core.indexOf("case 'chapters':"));
			expect(transcriptCase).toContain('ImprovedTube.closeTranscriptPanel()');
		});
	});
});

describe('Transcript shortcut', () => {
	test('opens the transcript', () => {
		const descriptionButton = fakeButton();
		load(['player', 'shortcuts'], {elements: {[DESCRIPTION_BUTTON]: descriptionButton}}).ImprovedTube.shortcutTranscript();
		expect(descriptionButton.clicks).toBe(1);
	});

	test('closes an open transcript', () => {
		const descriptionButton = fakeButton();
		const panel = fakePanel('engagement-panel-macro-markers-auto-chapters', true);

		load(['player', 'shortcuts'], {elements: {[DESCRIPTION_BUTTON]: descriptionButton}, expandedPanels: [panel]}).ImprovedTube.shortcutTranscript();

		expect(panel.closeButton.clicks).toBe(1);
		expect(descriptionButton.clicks).toBe(0);
	});

	test('does not throw when the video has no transcript', () => {
		expect(() => load(['player', 'shortcuts']).ImprovedTube.shortcutTranscript()).not.toThrow();
	});
});
