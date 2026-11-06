const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadPlayerSettings (context) {
	const source = fs.readFileSync(
		path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js'),
		'utf8'
	);
	const retryStart = source.indexOf('ImprovedTube.retryPlayerAction = function');
	const retryEnd = source.indexOf('ImprovedTube.subtitlesLanguage = function', retryStart);
	const subtitlesStart = source.indexOf('ImprovedTube.subtitlesUserSettings = function');
	const subtitlesEnd = source.indexOf('ImprovedTube.subtitlesDisableLyrics = function', subtitlesStart);
	const audioStart = source.indexOf('ImprovedTube.preferredDubbingLanguage = function');
	const audioEnd = source.indexOf('ImprovedTube.jumpToKeyScene = function', audioStart);

	if ([retryStart, retryEnd, subtitlesStart, subtitlesEnd, audioStart, audioEnd].some(index => index < 0)) {
		throw new Error('Player settings source was not found');
	}

	vm.createContext(context);
	vm.runInContext(source.slice(retryStart, retryEnd), context);
	vm.runInContext(source.slice(subtitlesStart, subtitlesEnd), context);
	vm.runInContext(source.slice(audioStart, audioEnd), context);
}

function createContext (storage, player) {
	const pendingRetries = [];
	const context = {
		ImprovedTube: {
			elements: {player},
			storage
		},
		location: {href: 'https://www.youtube.com/watch?v=test-video'},
		setTimeout: callback => {
			pendingRetries.push(callback);
			return pendingRetries.length;
		}
	};

	loadPlayerSettings(context);
	return {context, pendingRetries};
}

describe('SPA player settings retry', () => {
	test('retries subtitle user settings until YouTube exposes them', () => {
		let settings = null;
		let updateCalls = 0;
		const player = {
			getSubtitlesUserSettings: () => settings,
			updateSubtitlesUserSettings: () => updateCalls++
		};
		const {context, pendingRetries} = createContext({subtitles_font_size: 25}, player);

		context.ImprovedTube.subtitlesUserSettings();
		expect(updateCalls).toBe(0);
		expect(pendingRetries).toHaveLength(1);

		settings = {fontSizeIncrement: 0};
		pendingRetries.shift()();

		expect(settings.fontSizeIncrement).toBe(25);
		expect(updateCalls).toBe(1);
		expect(pendingRetries).toHaveLength(0);
	});

	test('does not retry subtitle settings when no custom values are configured', () => {
		const player = {
			getSubtitlesUserSettings: () => null,
			updateSubtitlesUserSettings: jest.fn()
		};
		const {context, pendingRetries} = createContext({}, player);

		context.ImprovedTube.subtitlesUserSettings();

		expect(player.updateSubtitlesUserSettings).not.toHaveBeenCalled();
		expect(pendingRetries).toHaveLength(0);
	});

	test('retries preferred dubbing language until audio tracks are available', () => {
		let tracks;
		const selected = [];
		let policyCalls = 0;
		const player = {getAvailableAudioTracks: () => tracks};
		const {context, pendingRetries} = createContext({
			preferred_dubbing_language: 'fr',
			disable_auto_dubbing: true
		}, player);
		context.ImprovedTube.selectPermittedAudioTrack = (receivedPlayer, language) => {
			selected.push([receivedPlayer, language]);
			return tracks[0];
		};
		context.ImprovedTube.enforceAutoDubbingPolicy = () => policyCalls++;

		context.ImprovedTube.preferredDubbingLanguage();
		expect(selected).toHaveLength(0);
		expect(pendingRetries).toHaveLength(1);

		tracks = [{id: 'fr'}];
		pendingRetries.shift()();

		expect(selected).toEqual([[player, 'fr']]);
		expect(policyCalls).toBe(1);
		expect(pendingRetries).toHaveLength(0);
	});

	test('uses the shared bounded retry for the default dubbed language', () => {
		let tracks = [];
		const selected = [];
		const player = {getAvailableAudioTracks: () => tracks};
		const {context, pendingRetries} = createContext({
			player_default_dubbed_language: 'ja'
		}, player);
		context.ImprovedTube.selectPermittedAudioTrack = (receivedPlayer, language) => {
			selected.push([receivedPlayer, language]);
			return tracks.find(track => track.language === language) || null;
		};

		context.ImprovedTube.selectDubbedLanguage();
		expect(selected).toHaveLength(0);
		expect(pendingRetries).toHaveLength(1);

		tracks = [{language: 'ja'}];
		pendingRetries.shift()();

		expect(selected).toEqual([[player, 'ja']]);
		expect(pendingRetries).toHaveLength(0);
	});

	test('does not retry a player setting for the next video after navigation', () => {
		let tracks = [];
		const player = {getAvailableAudioTracks: () => tracks};
		const {context, pendingRetries} = createContext({
			player_default_dubbed_language: 'ja'
		}, player);
		const selection = jest.fn(() => tracks[0] || null);
		context.ImprovedTube.selectPermittedAudioTrack = selection;

		context.ImprovedTube.selectDubbedLanguage();
		context.location.href = 'https://www.youtube.com/watch?v=next-video';
		tracks = [{language: 'ja'}];
		pendingRetries.shift()();

		expect(selection).not.toHaveBeenCalled();
		expect(pendingRetries).toHaveLength(0);
	});

	test('stops retrying after the shared retry window expires', () => {
		let trackChecks = 0;
		const player = {
			getAvailableAudioTracks: () => {
				trackChecks++;
				return [];
			}
		};
		const {context, pendingRetries} = createContext({
			player_default_dubbed_language: 'ja'
		}, player);
		context.ImprovedTube.selectPermittedAudioTrack = jest.fn();

		context.ImprovedTube.selectDubbedLanguage();
		while (pendingRetries.length) pendingRetries.shift()();

		expect(trackChecks).toBe(6);
		expect(context.ImprovedTube.selectPermittedAudioTrack).not.toHaveBeenCalled();
		expect(pendingRetries).toHaveLength(0);
	});
});
