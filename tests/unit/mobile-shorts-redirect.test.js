// Regression test: m.youtube.com/shorts/ID should go to www.youtube.com/watch?v=ID
// when "redirect_shorts_to_watch" is enabled (issue #3175).

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const scriptPath = path.join(__dirname, '../../js&css/extension/m.youtube.com/shorts-redirect.js');
const source = fs.readFileSync(scriptPath, 'utf8');

function load({ href, enabled }) {
	const replace = jest.fn();
	const location = { href, replace };
	const listeners = {};
	const context = vm.createContext({
		URL,
		console,
		location,
		window: {
			addEventListener: (type, cb) => {
				listeners[type] = cb;
			},
		},
		chrome: {
			storage: {
				local: {
					get: (key, cb) => cb({ redirect_shorts_to_watch: enabled }),
				},
			},
		},
	});
	vm.runInContext(source, context);
	return { context, replace, location, listeners };
}

describe('mobileShortsWatchUrl', () => {
	test('maps a mobile Shorts URL to the www watch URL', () => {
		const { context } = load({ href: 'https://m.youtube.com/shorts/abcDEF12345', enabled: false });
		expect(context.mobileShortsWatchUrl('https://m.youtube.com/shorts/abcDEF12345'))
			.toBe('https://www.youtube.com/watch?v=abcDEF12345');
	});

	test('keeps the query string', () => {
		const { context } = load({ href: 'https://m.youtube.com/shorts/abcDEF12345', enabled: false });
		expect(context.mobileShortsWatchUrl('https://m.youtube.com/shorts/abcDEF12345?feature=share'))
			.toBe('https://www.youtube.com/watch?v=abcDEF12345&feature=share');
	});

	test('returns null for URLs without a Shorts id', () => {
		const { context } = load({ href: 'https://m.youtube.com/', enabled: false });
		expect(context.mobileShortsWatchUrl('https://m.youtube.com/')).toBeNull();
		expect(context.mobileShortsWatchUrl('https://m.youtube.com/shorts/')).toBeNull();
	});
});

describe('shorts redirect on m.youtube.com', () => {
	test('redirects to the watch page when the option is enabled', () => {
		const { replace } = load({ href: 'https://m.youtube.com/shorts/abcDEF12345', enabled: true });
		expect(replace).toHaveBeenCalledTimes(1);
		expect(replace).toHaveBeenCalledWith('https://www.youtube.com/watch?v=abcDEF12345');
	});

	test('does nothing when the option is disabled', () => {
		const { context, replace } = load({ href: 'https://m.youtube.com/shorts/abcDEF12345', enabled: false });
		// Guard: the script must be loaded, otherwise "not called" would pass trivially.
		expect(typeof context.mobileShortsWatchUrl).toBe('function');
		expect(replace).not.toHaveBeenCalled();
	});

	test('redirects after in-app navigation to a Short (no page reload)', () => {
		const { replace, location, listeners } = load({ href: 'https://m.youtube.com/', enabled: true });
		expect(replace).not.toHaveBeenCalled();

		// Tapping a Short inside the mobile SPA changes the URL and fires yt-navigate-finish.
		location.href = 'https://m.youtube.com/shorts/abcDEF12345';
		listeners['yt-navigate-finish']();

		expect(replace).toHaveBeenCalledTimes(1);
		expect(replace).toHaveBeenCalledWith('https://www.youtube.com/watch?v=abcDEF12345');
	});

	test('does not redirect on in-app navigation to a non-Shorts page', () => {
		const { replace, location, listeners } = load({ href: 'https://m.youtube.com/', enabled: true });

		location.href = 'https://m.youtube.com/feed/subscriptions';
		listeners['yt-navigate-finish']();

		expect(replace).not.toHaveBeenCalled();
	});
});
