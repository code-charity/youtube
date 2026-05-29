describe('initial autoplay guard', () => {
	let originalPlay;
	let video;

	function loadCore() {
		jest.resetModules();

		const storage = {};
		storage.removeItem = key => {
			delete storage[key];
		};

		global.localStorage = storage;
		global.location = {
			href: 'https://www.youtube.com/watch?v=abcdefghijk'
		};
		global.window = {};
		global.CustomEvent = function CustomEvent(type) {
			this.type = type;
		};
		global.document = {
			addEventListener: jest.fn(),
			createElement: jest.fn(() => ({style: {}})),
			dispatchEvent: jest.fn(),
			documentElement: {
				appendChild: jest.fn()
			},
			querySelector: jest.fn()
		};

		originalPlay = jest.fn(() => 'played');
		global.HTMLMediaElement = function HTMLMediaElement() {};
		global.HTMLMediaElement.prototype.play = originalPlay;

		require('../../js&css/web-accessible/core.js');

		video = {
			closest: jest.fn(() => ({
				classList: {
					contains: jest.fn(() => false)
				}
			})),
			pause: jest.fn()
		};
	}

	beforeEach(() => {
		loadCore();
	});

	afterEach(() => {
		delete global.CustomEvent;
		delete global.document;
		delete global.HTMLMediaElement;
		delete global.localStorage;
		delete global.location;
		delete global.window;
	});

	test('prevents the first direct watch-page play when autoplay is disabled', async () => {
		localStorage['it-player-autoplay-disable'] = 'true';

		await expect(HTMLMediaElement.prototype.play.call(video)).resolves.toBeUndefined();

		expect(video.pause).toHaveBeenCalledTimes(1);
		expect(originalPlay).not.toHaveBeenCalled();
	});

	test('allows playback when autoplay is not disabled', () => {
		expect(HTMLMediaElement.prototype.play.call(video)).toBe('played');

		expect(video.pause).not.toHaveBeenCalled();
		expect(originalPlay).toHaveBeenCalledTimes(1);
	});
});
