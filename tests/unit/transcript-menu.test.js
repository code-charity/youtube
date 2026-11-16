global.extension = {
	skeleton: {
		main: {
			layers: {
				section: {}
			}
		}
	}
};

global.satus = {
	storage: {
		get: jest.fn(),
		set: jest.fn(),
		onchanged: jest.fn()
	}
};

require('../../menu/skeleton-parts/appearance.js');
require('../../menu/skeleton-parts/player.js');

const fs = require('fs');
const path = require('path');

const sections = extension.skeleton.main.layers.section;
const player = sections.player.on.click;
const sidebar = sections.appearance.on.click.sidebar.on.click;

describe('Transcript menu', () => {
	test('Player > Transcript has Always expanded and Compact spacing', () => {
		expect(player.section_3.title).toBe('Transcript');
		expect(player.section_3.transcript.text).toBe('transcriptAlwaysExpanded');
		expect(player.section_3.compact_spacing.storage).toBe('compactSpacing');
	});

	test('the transcript buttons sit in the Transcript card, under a "Buttons below the player" subheading', () => {
		const card = player.section_3;
		expect(player.section_4).toBeUndefined();
		const keys = Object.keys(card).filter((key) => card[key] && card[key].component);
		expect(keys).toEqual([
			'transcript',
			'compact_spacing',
			'buttons_below_player',
			'toggle_transcript_button',
			'copy_transcript',
			'copy_transcript_timestamps',
			'download_transcript'
		]);
		expect(card.buttons_below_player.component).toBe('span');
		expect(card.buttons_below_player.text).toBe('transcriptButtonsBelowPlayer');
		expect(fs.readFileSync(path.join(__dirname, '../../menu/styles/sub-options.css'), 'utf8'))
			.toContain('.satus-span--subheading');
	});

	test('Appearance > Sidebar keeps its copies of Transcript and Compact spacing, on the same settings', () => {
		expect(sidebar.transcript.component).toBe('switch');
		expect(sidebar.transcript.text).toBe('transcriptAlwaysExpandedSidebar'); // "Transcript: always expanded"
		expect(sidebar.transcript.storage).toBeUndefined(); // key "transcript", same as Player's switch
		expect(sidebar.compact_spacing.storage).toBe('compactSpacing');
	});

	test('Compact spacing is never hidden behind Transcript, in either menu', () => {
		// it works on any open transcript, also one opened with the Show / Hide button
		expect(sidebar.transcript.id).toBe('sidebar-transcript'); // unique: both switches can show up in search results
		expect(player.section_3.transcript.id).not.toBe(sidebar.transcript.id);
		const css = fs.readFileSync(path.join(__dirname, '../../menu/styles/sub-options.css'), 'utf8');
		expect(css).not.toMatch(/#sidebar-transcript/);
		expect(css).not.toMatch(/#transcript[:[]/);
	});

	test('new labels have English and Russian text', () => {
		for (const locale of ['en', 'ru']) {
			const messages = JSON.parse(fs.readFileSync(path.join(__dirname, '../../_locales', locale, 'messages.json'), 'utf8'));
			expect(messages.transcriptButtonsBelowPlayer.message).toBeTruthy();
			expect(messages.transcriptAlwaysExpandedSidebar.message).toBeTruthy();
		}
	});
});
