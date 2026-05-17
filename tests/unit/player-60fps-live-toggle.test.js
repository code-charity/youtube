const fs = require('fs');
const path = require('path');
const vm = require('vm');

function getCodecHookSource () {
	const filePath = path.join(__dirname, '../../js&css/web-accessible/core.js');
	const coreContent = fs.readFileSync(filePath, 'utf8');
	const marker = 'CODEC || 30FPS';
	const markerIndex = coreContent.indexOf(marker);
	const start = coreContent.indexOf('(function () {', markerIndex);
	const end = coreContent.indexOf('})();', start) + '})();'.length;

	return coreContent.slice(start, end);
}

function createSandbox () {
	const localStorage = {};
	const mediaSourceOriginal = jest.fn(() => true);
	const canPlayTypeOriginal = jest.fn(() => 'probably');

	function HTMLMediaElement () {}
	HTMLMediaElement.prototype.canPlayType = canPlayTypeOriginal;

	return {
		localStorage,
		window: {
			MediaSource: {
				isTypeSupported: mediaSourceOriginal
			}
		},
		HTMLMediaElement,
		mediaSourceOriginal,
		canPlayTypeOriginal
	};
}

describe('Codec and 30fps page-world hook', () => {
	let codecHookSource;

	beforeAll(() => {
		codecHookSource = getCodecHookSource();
	});

	test('installs before cached settings exist and reacts when 30fps is enabled later', () => {
		const sandbox = createSandbox();

		vm.runInNewContext(codecHookSource, sandbox);

		const highFrameRateMime = 'video/mp4; codecs="avc1.640028"; framerate=60';

		expect(sandbox.window.MediaSource.isTypeSupported(highFrameRateMime)).toBe(true);
		expect(sandbox.HTMLMediaElement.prototype.canPlayType(highFrameRateMime)).toBe('probably');

		sandbox.localStorage['it-player30fps'] = true;

		expect(sandbox.window.MediaSource.isTypeSupported(highFrameRateMime)).toBe('');
		expect(sandbox.HTMLMediaElement.prototype.canPlayType(highFrameRateMime)).toBe('');

		delete sandbox.localStorage['it-player30fps'];

		expect(sandbox.window.MediaSource.isTypeSupported(highFrameRateMime)).toBe(true);
		expect(sandbox.HTMLMediaElement.prototype.canPlayType(highFrameRateMime)).toBe('probably');
	});

	test('keeps codec blocking dynamic without wrapping repeatedly', () => {
		const sandbox = createSandbox();
		const vp9Mime = 'video/webm; codecs="vp09.00.10.08"; framerate=30';

		vm.runInNewContext(codecHookSource, sandbox);
		vm.runInNewContext(codecHookSource, sandbox);

		sandbox.localStorage['it-codec'] = 'vp9|vp09';

		expect(sandbox.window.MediaSource.isTypeSupported(vp9Mime)).toBe('');
		expect(sandbox.HTMLMediaElement.prototype.canPlayType(vp9Mime)).toBe('');

		delete sandbox.localStorage['it-codec'];

		expect(sandbox.window.MediaSource.isTypeSupported(vp9Mime)).toBe(true);
		expect(sandbox.mediaSourceOriginal).toHaveBeenCalledTimes(1);
	});
});
