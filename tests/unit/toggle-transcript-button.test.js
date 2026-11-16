// A button below the player that opens or closes YouTube's transcript panel

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const read = (...parts) => fs.readFileSync(path.join(__dirname, '../..', ...parts), 'utf8');
const playerSource = read('js&css', 'web-accessible', 'www.youtube.com', 'player.js');

const EXPANDED_PANELS = 'ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]';
const SEGMENTS = 'ytd-transcript-segment-renderer, transcript-segment-view-model';
const DESCRIPTION_BUTTON = 'ytd-video-description-transcript-section-renderer button';
const EXPAND_DESCRIPTION = '#description ytd-text-inline-expander #expand, #description tp-yt-paper-button#expand';

const fakeButton = () => ({clicks: 0, click () { this.clicks++; }, hasAttribute: () => false});

// An expanded side panel with an X button, optionally holding transcript lines
const fakePanel = (targetId, hasSegments) => {
	const closeButton = fakeButton();
	return {
		closeButton,
		getAttribute: (name) => (name === 'target-id' ? targetId : null),
		querySelector: (selector) => {
			if (selector === '#visibility-button button') return closeButton;
			if (selector === SEGMENTS) return hasSegments ? {} : null;
			return null;
		}
	};
};

// Runs player.js against a fake page: `elements` maps a selector to the element it finds,
// `expandedPanels` are the side panels that are open
const loadPlayer = (elements, expandedPanels = []) => {
	const context = {
		ImprovedTube: {},
		document: {
			querySelector: (selector) => elements[selector] || null,
			querySelectorAll: (selector) => (selector === EXPANDED_PANELS ? expandedPanels : []),
			addEventListener: () => {},
			createElement: () => ({style: {}, setAttribute: () => {}, appendChild: () => {}, addEventListener: () => {}})
		},
		console,
		setTimeout: (fn) => fn(),
		setInterval: () => {},
		clearInterval: () => {}
	};
	vm.runInNewContext(playerSource, context);
	return context.ImprovedTube;
};

describe('Show / Hide Transcript button', () => {
	test('closes the transcript panel when it is open', () => {
		const panel = fakePanel('engagement-panel-searchable-transcript', false);
		const descriptionButton = fakeButton();
		const onError = jest.fn();

		loadPlayer({[DESCRIPTION_BUTTON]: descriptionButton}, [panel]).toggleTranscriptPanel(onError);

		expect(panel.closeButton.clicks).toBe(1);
		expect(descriptionButton.clicks).toBe(0);
		expect(onError).not.toHaveBeenCalled();
	});

	test('closes the transcript when it is a tab of the "In this video" panel', () => {
		const panel = fakePanel('engagement-panel-macro-markers-auto-chapters', true);
		const descriptionButton = fakeButton();

		loadPlayer({[DESCRIPTION_BUTTON]: descriptionButton}, [panel]).toggleTranscriptPanel(jest.fn());

		expect(panel.closeButton.clicks).toBe(1);
		expect(descriptionButton.clicks).toBe(0);
	});

	test('opens the transcript when another side panel (e.g. comments) is open', () => {
		const comments = fakePanel('engagement-panel-comments-section', false);
		const descriptionButton = fakeButton();

		loadPlayer({[DESCRIPTION_BUTTON]: descriptionButton}, [comments]).toggleTranscriptPanel(jest.fn());

		expect(comments.closeButton.clicks).toBe(0);
		expect(descriptionButton.clicks).toBe(1);
	});

	test('opens the panel with the description\'s "Show transcript" button', () => {
		const descriptionButton = fakeButton();
		const onError = jest.fn();

		loadPlayer({[DESCRIPTION_BUTTON]: descriptionButton}).toggleTranscriptPanel(onError);

		expect(descriptionButton.clicks).toBe(1);
		expect(onError).not.toHaveBeenCalled();
	});

	test('expands a collapsed description first', () => {
		const descriptionButton = fakeButton();
		const elements = {};
		const expand = fakeButton();
		expand.click = function () {
			this.clicks++;
			elements[DESCRIPTION_BUTTON] = descriptionButton;
		};
		elements[EXPAND_DESCRIPTION] = expand;
		const onError = jest.fn();

		loadPlayer(elements).toggleTranscriptPanel(onError);

		expect(expand.clicks).toBe(1);
		expect(descriptionButton.clicks).toBe(1);
		expect(onError).not.toHaveBeenCalled();
	});

	test('reports an error when the video has no transcript', () => {
		const onError = jest.fn();

		loadPlayer({}).toggleTranscriptPanel(onError);

		expect(onError).toHaveBeenCalledTimes(1);
	});

	describe('wiring', () => {
		test('adds a menu switch that is off by default', () => {
			const menu = read('menu', 'skeleton-parts', 'player.js');
			expect(menu).toMatch(/toggle_transcript_button:\s*\{\s*component: 'switch',\s*text: 'toggleTranscriptButton',\s*value: false/);
		});

		test('has an English label', () => {
			const messages = JSON.parse(read('_locales', 'en', 'messages.json'));
			expect(messages.toggleTranscriptButton.message).toContain('Transcript');
		});

		test('only shows the button when the option is on', () => {
			const appearance = read('js&css', 'web-accessible', 'www.youtube.com', 'appearance.js');
			expect(appearance).toContain("this.storage.toggle_transcript_button === true && !document.querySelector('#it-below-player-toggle-transcript')");
			expect(appearance).toContain('ImprovedTube.toggleTranscriptPanel(');
		});

		test('adds or removes the button when the option is toggled', () => {
			const core = read('js&css', 'web-accessible', 'core.js');
			expect(core).toContain("case 'toggleTranscriptButton':");
			expect(core).toContain("document.querySelector('#it-below-player-toggle-transcript')?.remove();");
		});

		test('the option name does not call the panel function on every settings change', () => {
			// core.js calls ImprovedTube[camelizedKey]() after a setting changes
			expect(loadPlayer({}).toggleTranscriptButton).toBeUndefined();
		});
	});
});
