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

const liveHeadSpeedReset = extractFunction(
	'js&css/web-accessible/www.youtube.com/player.js',
	'ImprovedTube.playerLiveHeadSpeedReset = function (event) {'
);

function setup({ rate = 5, isLive = true, isAtLiveHead = true } = {}) {
	const player = {
		getVideoData: () => ({ isLive }),
		getProgressState: () => ({ isAtLiveHead })
	};
	const video = {
		playbackRate: rate,
		closest: selector => (selector === '.html5-video-player' ? player : null)
	};
	const statuses = [];
	const ImprovedTube = {
		elements: {},
		showStatus: value => statuses.push(value)
	};

	vm.runInNewContext(liveHeadSpeedReset, { ImprovedTube });

	return { ImprovedTube, video, statuses };
}

describe('playerLiveHeadSpeedReset (#4346)', () => {
	test('resets a sped-up livestream to 1x when it stalls at the live head', () => {
		const { ImprovedTube, video, statuses } = setup();

		ImprovedTube.playerLiveHeadSpeedReset({ target: video });

		expect(video.playbackRate).toBe(1);
		expect(statuses).toEqual([1]);
	});

	test('keeps the speed while catching up behind the live head (DVR)', () => {
		const { ImprovedTube, video, statuses } = setup({ isAtLiveHead: false });

		ImprovedTube.playerLiveHeadSpeedReset({ target: video });

		expect(video.playbackRate).toBe(5);
		expect(statuses).toEqual([]);
	});

	test('ignores regular (non-live) videos', () => {
		const { ImprovedTube, video, statuses } = setup({ isLive: false });

		ImprovedTube.playerLiveHeadSpeedReset({ target: video });

		expect(video.playbackRate).toBe(5);
		expect(statuses).toEqual([]);
	});

	test.each([1, 0.75])('leaves %sx untouched at the live head', rate => {
		const { ImprovedTube, video, statuses } = setup({ rate });

		ImprovedTube.playerLiveHeadSpeedReset({ target: video });

		expect(video.playbackRate).toBe(rate);
		expect(statuses).toEqual([]);
	});

	test('does nothing when the player API is unavailable', () => {
		const { ImprovedTube, statuses } = setup();
		const video = { playbackRate: 5, closest: () => ({}) };

		expect(() => ImprovedTube.playerLiveHeadSpeedReset({ target: video })).not.toThrow();
		expect(video.playbackRate).toBe(5);
		expect(statuses).toEqual([]);
	});
});
