const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '../../js&css/web-accessible/functions.js'), 'utf8');
const start = source.indexOf('ImprovedTube.playerSpeedAfterAd = function () {');
const end = source.indexOf('\n};', start) + 3;
const code = source.slice(start, end);

function setup(player) {
	let calls = 0;
	const ImprovedTube = { elements: { player }, playerPlaybackSpeed: () => { calls++; } };
	vm.runInNewContext(code, { ImprovedTube });
	return { ImprovedTube, calls: () => calls };
}

const makePlayer = () => {
	const classes = new Set();
	return { classes, classList: { contains: c => classes.has(c) } };
};

describe('playerSpeedAfterAd (#954)', () => {
	test('reapplies the forced speed once an ad has ended', () => {
		const player = makePlayer();
		const { ImprovedTube, calls } = setup(player);
		ImprovedTube.playerSpeedAfterAd();
		player.classes.add('ad-showing');
		ImprovedTube.playerSpeedAfterAd();
		expect(calls()).toBe(0);
		player.classes.delete('ad-showing');
		ImprovedTube.playerSpeedAfterAd();
		expect(calls()).toBe(1);
		ImprovedTube.playerSpeedAfterAd();
		expect(calls()).toBe(1);
	});

	test('does nothing without ads or without a player', () => {
		const { ImprovedTube, calls } = setup(makePlayer());
		ImprovedTube.playerSpeedAfterAd();
		ImprovedTube.playerSpeedAfterAd();
		expect(calls()).toBe(0);
		ImprovedTube.elements.player = null;
		expect(() => ImprovedTube.playerSpeedAfterAd()).not.toThrow();
	});
});
