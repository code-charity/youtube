// Tests for #4209: the current playback speed should stay visible while watching.
//
// The increase/decrease speed buttons only flash a status message for about a
// second, so after changing the speed the user has no persistent readout. The
// speed readout button sits between the speed buttons and follows the video's
// `ratechange` events.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function extractFunction(file, signature) {
	const source = fs.readFileSync(path.join(__dirname, '../..', file), 'utf8');
	const start = source.indexOf(signature);
	const openingBrace = source.indexOf('{', start);
	let depth = 0;

	if (start < 0 || openingBrace < 0) {
		throw new Error(signature + ' was not found');
	}

	for (let index = openingBrace; index < source.length; index++) {
		if (source[index] === '{') depth++;
		if (source[index] === '}' && --depth === 0) {
			return source.slice(start, index + 2);
		}
	}

	throw new Error(signature + ' is not balanced');
}

const PLAYER_SRC = 'js&css/web-accessible/www.youtube.com/player.js';
const functions = [
	extractFunction(PLAYER_SRC, 'ImprovedTube.playerSpeedReadoutFormat = function (rate) {'),
	extractFunction(PLAYER_SRC, 'ImprovedTube.playerSpeedReadoutUpdate = function () {')
].join('\n');

function createText() {
	return { textContent: '1x' };
}

function setup({ playbackRate = 1, withButton = true, withVideo = true } = {}) {
	const text = createText();
	const button = {
		querySelector: selector => (selector === '.it-speed-readout-text' ? text : null)
	};
	const video = { playbackRate };
	const ImprovedTube = {
		elements: {
			buttons: withButton ? { 'it-speed-readout-button': button } : {},
			video: withVideo ? video : undefined
		}
	};

	vm.runInNewContext(functions, { ImprovedTube });

	return { ImprovedTube, text, video };
}

describe('playerSpeedReadoutFormat (#4209)', () => {
	test.each([
		[1, '1x'],
		[1.25, '1.25x'],
		[0.5, '0.5x'],
		[2, '2x'],
		[1.333, '1.33x']
	])('formats %s as %s', (rate, expected) => {
		const { ImprovedTube } = setup();

		expect(ImprovedTube.playerSpeedReadoutFormat(rate)).toBe(expected);
	});

	test.each([undefined, null, NaN, 0, -1, 'nope'])('falls back to 1x for %s', rate => {
		const { ImprovedTube } = setup();

		expect(ImprovedTube.playerSpeedReadoutFormat(rate)).toBe('1x');
	});
});

describe('playerSpeedReadoutUpdate (#4209)', () => {
	test('shows the current playback rate', () => {
		const { ImprovedTube, text } = setup({ playbackRate: 1.5 });

		ImprovedTube.playerSpeedReadoutUpdate();

		expect(text.textContent).toBe('1.5x');
	});

	test('follows a ratechange event', () => {
		const { ImprovedTube, text, video } = setup({ playbackRate: 1 });

		video.playbackRate = 1.75;
		ImprovedTube.playerSpeedReadoutUpdate();

		expect(text.textContent).toBe('1.75x');
	});

	test('keeps the last value when the readout button is missing', () => {
		const { ImprovedTube, text } = setup({ withButton: false, playbackRate: 2 });

		expect(() => ImprovedTube.playerSpeedReadoutUpdate()).not.toThrow();
		expect(text.textContent).toBe('1x');
	});

	test('keeps the last value when no video is available', () => {
		const { ImprovedTube, text } = setup({ withVideo: false });

		ImprovedTube.playerSpeedReadoutUpdate();

		expect(text.textContent).toBe('1x');
	});
});
