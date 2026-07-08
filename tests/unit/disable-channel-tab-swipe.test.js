// Test for Issue #4127 follow-up: disable horizontal channel tab swipe

const fs = require('fs');
const path = require('path');

describe('Disable channel tab swipe follow-up (#4127)', () => {
	let channelMenuContent;
	let stylesContent;
	let messages;

	beforeAll(() => {
		channelMenuContent = fs.readFileSync(path.join(__dirname, '../../menu/skeleton-parts/channel.js'), 'utf8');
		stylesContent = fs.readFileSync(path.join(__dirname, '../../js&css/extension/www.youtube.com/styles.css'), 'utf8');
		messages = JSON.parse(fs.readFileSync(path.join(__dirname, '../../_locales/en/messages.json'), 'utf8'));
	});

	test('adds a dedicated channel toggle to settings', () => {
		expect(channelMenuContent).toContain('channel_disable_tab_swipe');
		expect(channelMenuContent).toContain("text: 'disableChannelTabSwipe'");
		expect(channelMenuContent).toContain("storage: 'channel_disable_tab_swipe'");
	});

	test('limits touch gestures on channel tab containers to vertical pan and pinch zoom', () => {
		expect(stylesContent).toContain('html[it-channel-disable-tab-swipe=true] ytd-c4-tabbed-header-renderer');
		expect(stylesContent).toContain('html[it-channel-disable-tab-swipe=true] ytd-channel-sub-menu-renderer');
		expect(stylesContent).toContain('html[it-channel-disable-tab-swipe=true] tp-yt-paper-tabs');
		expect(stylesContent).toContain('html[it-channel-disable-tab-swipe=true] yt-tab-group-shape');
		expect(stylesContent).toContain('touch-action: pan-y pinch-zoom !important;');
		expect(stylesContent).toContain('overscroll-behavior-x: none !important;');
	});

	test('includes an English label for the new toggle', () => {
		expect(messages.disableChannelTabSwipe).toBeDefined();
		expect(messages.disableChannelTabSwipe.message).toBe('Disable channel tab swipe');
	});
});
