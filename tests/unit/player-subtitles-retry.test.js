const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadPlayerSubtitles (context) {
	const source = fs.readFileSync(
		path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js'),
		'utf8'
	);
	const start = source.indexOf('ImprovedTube.playerSubtitles = function');
	const end = source.indexOf('ImprovedTube.subtitlesLanguage = function', start);

	if (start < 0 || end < 0) {
		throw new Error('playerSubtitles source was not found');
	}

	vm.createContext(context);
	vm.runInContext(source.slice(start, end), context);
}

function createContext (option, {subtitlesOn = false, withPlayer = true} = {}) {
	const state = {subtitlesOn, toggles: 0};
	const pendingRetries = [];
	const player = {
		isSubtitlesOn: () => state.subtitlesOn,
		toggleSubtitles: () => {
			state.toggles++;
			state.subtitlesOn = !state.subtitlesOn;
		},
		toggleSubtitlesOn: () => {
			state.toggles++;
			state.subtitlesOn = true;
		}
	};
	const context = {
		ImprovedTube: {
			elements: {player: withPlayer ? player : undefined},
			storage: {player_subtitles: option}
		},
		location: {href: 'https://www.youtube.com/watch?v=test-video'},
		setTimeout: callback => {
			pendingRetries.push(callback);
			return 1;
		}
	};

	loadPlayerSubtitles(context);
	return {context, player, state, pendingRetries};
}

function runRetries (pendingRetries) {
	let runs = 0;
	while (pendingRetries.length && runs < 20) {
		pendingRetries.shift()();
		runs++;
	}
}

describe('playerSubtitles SPA retry (#4455)', () => {
	test('disabled keeps checking when isSubtitlesOn() is a stale false and YouTube turns captions on later', () => {
		const {context, state, pendingRetries} = createContext('disabled');

		context.ImprovedTube.playerSubtitles();
		expect(state.toggles).toBe(0);
		expect(pendingRetries).toHaveLength(1);

		// YouTube re-applies its default caption setting after the first check.
		state.subtitlesOn = true;
		runRetries(pendingRetries);

		expect(state.subtitlesOn).toBe(false);
		expect(state.toggles).toBe(1);
	});

	test('disabled turns captions off and stops once they are observed off', () => {
		const {context, state, pendingRetries} = createContext('disabled', {subtitlesOn: true});

		context.ImprovedTube.playerSubtitles();

		expect(state.subtitlesOn).toBe(false);
		expect(state.toggles).toBe(1);
		expect(pendingRetries).toHaveLength(0);
	});

	test('enabled retries until captions are observed on', () => {
		const {context, player, state, pendingRetries} = createContext('enabled');
		let ignoredCalls = 1;
		player.toggleSubtitlesOn = () => {
			state.toggles++;
			if (ignoredCalls-- > 0) return;
			state.subtitlesOn = true;
		};

		context.ImprovedTube.playerSubtitles();
		expect(state.subtitlesOn).toBe(false);
		expect(pendingRetries).toHaveLength(1);

		runRetries(pendingRetries);
		expect(state.subtitlesOn).toBe(true);
		expect(pendingRetries).toHaveLength(0);
	});

	test('enabled stops after captions are on', () => {
		const {context, state, pendingRetries} = createContext(true);

		context.ImprovedTube.playerSubtitles();

		expect(state.subtitlesOn).toBe(true);
		expect(pendingRetries).toHaveLength(0);
	});

	test('retries while the player element or its subtitle API is missing', () => {
		const {context, player, state, pendingRetries} = createContext('disabled', {subtitlesOn: true, withPlayer: false});

		context.ImprovedTube.playerSubtitles();
		expect(pendingRetries).toHaveLength(1);

		context.ImprovedTube.elements.player = {isSubtitlesOn: player.isSubtitlesOn};
		pendingRetries.shift()();
		expect(state.toggles).toBe(0);
		expect(pendingRetries).toHaveLength(1);

		context.ImprovedTube.elements.player = player;
		runRetries(pendingRetries);
		expect(state.subtitlesOn).toBe(false);
	});

	test('auto and unset leave captions alone without retrying', () => {
		for (const option of ['auto', undefined, false]) {
			const {context, state, pendingRetries} = createContext(option, {subtitlesOn: true});

			context.ImprovedTube.playerSubtitles();

			expect(state.toggles).toBe(0);
			expect(state.subtitlesOn).toBe(true);
			expect(pendingRetries).toHaveLength(0);
		}
	});
});
