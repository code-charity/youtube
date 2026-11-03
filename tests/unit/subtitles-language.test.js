const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadSubtitlesLanguage(context) {
	const source = fs.readFileSync(
		path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js'),
		'utf8'
	);
	const start = source.indexOf('ImprovedTube.retryPlayerAction = function');
	const end = source.indexOf('ImprovedTube.subtitlesUserSettings = function', start);

	if (start < 0 || end < 0) {
		throw new Error('Subtitles language source was not found');
	}

	vm.createContext(context);
	vm.runInContext(source.slice(start, end), context);
}

function createContext(tracklist) {
	let subtitlesOn = false;
	const selectedTracks = [];
	const pendingRetries = [];
	const player = {
		tracklist,
		getOption: (module, option) => module === 'captions' && option === 'tracklist' ? player.tracklist : undefined,
		setOption: (module, option, value) => {
			selectedTracks.push(value);
			// YouTube turns subtitles on whenever a caption track is set.
			subtitlesOn = true;
		},
		isSubtitlesOn: () => subtitlesOn,
		toggleSubtitles: () => {
			subtitlesOn = !subtitlesOn;
		}
	};
	const context = {
		ImprovedTube: {
			elements: {player},
			storage: {subtitles_language: 'en', auto_generate: false}
		},
		location: {href: 'https://www.youtube.com/watch?v=test-video'},
		setTimeout: callback => {
			pendingRetries.push(callback);
			return 1;
		}
	};

	loadSubtitlesLanguage(context);
	return {context, player, selectedTracks, pendingRetries, subtitlesOn: () => subtitlesOn};
}

const english = {languageCode: 'en', vss_id: '.en'};
const french = {languageCode: 'fr', vss_id: '.fr'};

describe('subtitles language', () => {
	test('retries until the caption tracklist loads after SPA navigation (#4407)', () => {
		const {context, player, selectedTracks, pendingRetries, subtitlesOn} = createContext([]);

		context.ImprovedTube.subtitlesLanguage();
		expect(selectedTracks).toEqual([]);
		expect(pendingRetries).toHaveLength(1);

		player.tracklist = [french, english];
		pendingRetries.shift()();

		expect(selectedTracks).toEqual([english]);
		// Subtitles were off before, so selecting the track must not leave them on.
		expect(subtitlesOn()).toBe(false);
		expect(pendingRetries).toHaveLength(0);
	});

	test('stops without retrying when no track matches the language', () => {
		const {context, selectedTracks, pendingRetries} = createContext([french]);

		context.ImprovedTube.subtitlesLanguage();

		expect(selectedTracks).toEqual([]);
		expect(pendingRetries).toHaveLength(0);
	});

	test('does not retry for a previous video after navigating away', () => {
		const {context, player, selectedTracks, pendingRetries} = createContext([]);

		context.ImprovedTube.subtitlesLanguage();
		context.location.href = 'https://www.youtube.com/watch?v=next-video';
		player.tracklist = [english];
		pendingRetries.shift()();

		expect(selectedTracks).toEqual([]);
		expect(pendingRetries).toHaveLength(0);
	});

	test('gives up after a bounded number of attempts', () => {
		const {context, pendingRetries} = createContext([]);
		let attempts = 1;

		context.ImprovedTube.subtitlesLanguage();
		while (pendingRetries.length) {
			pendingRetries.shift()();
			attempts++;
		}

		expect(attempts).toBe(6);
	});
});
