// Channel RSS button (issue #4089)

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const read = (...parts) => fs.readFileSync(path.join(__dirname, '../..', ...parts), 'utf8');

function load({ identifier, canonical, external, enabled = true } = {}) {
	const noop = () => {};
	const document = {
		querySelector(selector) {
			if (selector === 'meta[itemprop="identifier"]') return identifier ? { content: identifier } : null;
			if (selector === 'link[rel="canonical"]') return canonical ? { href: canonical } : null;
			if (selector === '#subscribe-button') return null;
			return null;
		},
		querySelectorAll: () => [],
		addEventListener: noop,
		createElement: () => ({ style: {}, setAttribute: noop, appendChild: noop, addEventListener: noop }),
		createElementNS: () => ({ setAttribute: noop, appendChild: noop, style: {} }),
		documentElement: { hasAttribute: () => false },
		body: { appendChild: noop }
	};
	const context = {
		ImprovedTube: { storage: { channel_rss_button: enabled }, messages: { send: noop } },
		document,
		window: { ytInitialData: external ? { metadata: { channelMetadataRenderer: { externalId: external } } } : {} },
		navigator: {},
		location: { href: 'https://www.youtube.com/@example' },
		console,
		setTimeout: noop,
		Promise
	};
	vm.runInNewContext(read('js&css', 'web-accessible', 'www.youtube.com', 'features', 'channel-rss.js'), context);
	return context.ImprovedTube;
}

describe('Channel RSS (#4089)', () => {
	test('builds the feed URL', () => {
		expect(load().channelRssFeedUrl('UCuAXFkgsw1L7xaCfnd5JJOw'))
			.toBe('https://www.youtube.com/feeds/videos.xml?channel_id=UCuAXFkgsw1L7xaCfnd5JJOw');
	});

	test('reads the id from ytInitialData first', () => {
		expect(load({ external: 'UCuAXFkgsw1L7xaCfnd5JJOw' }).channelRssChannelId())
			.toBe('UCuAXFkgsw1L7xaCfnd5JJOw');
	});

	test('falls back to the itemprop meta tag', () => {
		expect(load({ identifier: 'UCuAXFkgsw1L7xaCfnd5JJOw' }).channelRssChannelId())
			.toBe('UCuAXFkgsw1L7xaCfnd5JJOw');
	});

	test('falls back to the canonical channel link', () => {
		expect(load({ canonical: 'https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw' }).channelRssChannelId())
			.toBe('UCuAXFkgsw1L7xaCfnd5JJOw');
	});

	test('ignores a handle-only page with no id source', () => {
		expect(load({ canonical: 'https://www.youtube.com/@example' }).channelRssChannelId()).toBe(null);
	});
});
