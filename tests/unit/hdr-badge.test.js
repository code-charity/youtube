const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadHdrBadge(context) {
	const source = fs.readFileSync(
		path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/appearance.js'),
		'utf8'
	);
	const start = source.indexOf('ImprovedTube.hdrBadge = function');
	const end = source.indexOf('if (ImprovedTube.storage.header_transparent2', start);

	if (start < 0 || end < 0) {
		throw new Error('HDR badge source was not found');
	}

	vm.createContext(context);
	vm.runInContext(source.slice(start, end), context);
}

function adaptiveFormat(overrides = {}) {
	return Object.assign({
		mimeType: 'video/webm; codecs="vp9"',
		qualityLabel: '2160p',
		colorInfo: {transferCharacteristics: 'BT709', primaries: 'BT709'}
	}, overrides);
}

function playerResponse(videoId, formats) {
	return {videoDetails: {videoId}, streamingData: {adaptiveFormats: formats}};
}

function createHarness({setting = true, response = null, pageType = 'video', staleBadges = []} = {}) {
	const appended = [];
	const removed = [];
	staleBadges.forEach(badge => {
		badge.remove = () => { removed.push(badge); };
	});
	const title = {
		querySelector: () => null,
		appendChild: el => { appended.push(el); }
	};
	const moviePlayer = response ? {getPlayerResponse: () => response} : null;
	const context = {
		Array,
		Object,
		String,
		RegExp,
		console,
		setTimeout: () => 0,
		document: {
			documentElement: {dataset: {pageType}},
			getElementById: id => (id === 'movie_player' ? moviePlayer : null),
			querySelector: sel => (/#title/.test(sel) ? title : null),
			querySelectorAll: sel => (sel === '.it-hdr-badge' ? staleBadges : []),
			createElement: () => ({className: '', textContent: '', title: ''})
		},
		window: {},
		location: {href: 'https://www.youtube.com/watch?v=abc123abc12'},
		ImprovedTube: {
			storage: {hdr_badge: setting},
			getParam: (query, name) => (name === 'v' ? 'abc123abc12' : null)
		}
	};
	loadHdrBadge(context);
	return {context, appended, removed};
}

describe('HDR badge (ImprovedTube.hdrBadge)', () => {
	test('shows badge for PQ / SMPTE 2084 transfer', () => {
		const {context, appended} = createHarness({
			response: playerResponse('abc123abc12', [
				adaptiveFormat({colorInfo: {transferCharacteristics: 'SMPTE2084', primaries: 'BT2020'}})
			])
		});
		context.ImprovedTube.hdrBadge();
		expect(appended.length).toBe(1);
		expect(appended[0].className).toBe('it-hdr-badge');
		expect(appended[0].textContent).toBe('HDR');
	});

	test('shows badge for HLG (ARIB STD-B67) transfer', () => {
		const {context, appended} = createHarness({
			response: playerResponse('abc123abc12', [
				adaptiveFormat({colorInfo: {transferCharacteristics: 'ARIB_STD_B67', primaries: 'BT2020'}})
			])
		});
		context.ImprovedTube.hdrBadge();
		expect(appended.length).toBe(1);
	});

	test('shows badge for BT.2020 primaries', () => {
		const {context, appended} = createHarness({
			response: playerResponse('abc123abc12', [
				adaptiveFormat({colorInfo: {transferCharacteristics: 'BT2020-10', primaries: 'BT2020'}})
			])
		});
		context.ImprovedTube.hdrBadge();
		expect(appended.length).toBe(1);
	});

	test('shows badge when quality label contains HDR', () => {
		const {context, appended} = createHarness({
			response: playerResponse('abc123abc12', [
				adaptiveFormat({qualityLabel: '2160p60 HDR'})
			])
		});
		context.ImprovedTube.hdrBadge();
		expect(appended.length).toBe(1);
	});

	test('shows badge for VP9 Profile 2 codec string', () => {
		const {context, appended} = createHarness({
			response: playerResponse('abc123abc12', [
				adaptiveFormat({mimeType: 'video/webm; codecs="vp09.02.51.10.01.09.18.09.00"'})
			])
		});
		context.ImprovedTube.hdrBadge();
		expect(appended.length).toBe(1);
	});

	test('shows no badge for plain SDR (BT.709) streams', () => {
		const {context, appended} = createHarness({
			response: playerResponse('abc123abc12', [adaptiveFormat(), adaptiveFormat()])
		});
		context.ImprovedTube.hdrBadge();
		expect(appended.length).toBe(0);
	});

	test('shows no badge when the setting is off, but clears stale badges', () => {
		const stale = [{}];
		const {context, appended, removed} = createHarness({setting: false, staleBadges: stale,
			response: playerResponse('abc123abc12', [
				adaptiveFormat({colorInfo: {transferCharacteristics: 'SMPTE2084'}})
			])
		});
		context.ImprovedTube.hdrBadge();
		expect(appended.length).toBe(0);
		expect(removed.length).toBe(1);
	});

	test('ignores a player response that belongs to another video (SPA staleness)', () => {
		const {context, appended} = createHarness({
			response: playerResponse('otherVideoId', [
				adaptiveFormat({colorInfo: {transferCharacteristics: 'SMPTE2084'}})
			])
		});
		context.ImprovedTube.hdrBadge();
		expect(appended.length).toBe(0);
	});

	test('shows no badge outside video pages', () => {
		const {context, appended} = createHarness({pageType: 'home',
			response: playerResponse('abc123abc12', [
				adaptiveFormat({colorInfo: {transferCharacteristics: 'SMPTE2084'}})
			])
		});
		context.ImprovedTube.hdrBadge();
		expect(appended.length).toBe(0);
	});
});
