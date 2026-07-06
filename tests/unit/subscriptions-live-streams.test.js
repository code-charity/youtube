const fs = require('fs');
const path = require('path');

describe('Subscription live stream hiding (#1584)', () => {
	let generalCssContent;
	let generalSkeletonContent;
	let englishMessages;

	beforeAll(() => {
		generalCssContent = fs.readFileSync(
			path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.css'),
			'utf8'
		);
		generalSkeletonContent = fs.readFileSync(
			path.join(__dirname, '../../menu/skeleton-parts/general.js'),
			'utf8'
		);
		englishMessages = fs.readFileSync(
			path.join(__dirname, '../../_locales/en/messages.json'),
			'utf8'
		);
	});

	test('adds a dedicated subscriptions live stream setting', () => {
		expect(generalSkeletonContent).toContain('remove_subscriptions_live_streams');
		expect(generalSkeletonContent).toContain("text: 'removeSubscriptionsLiveStreams'");
		expect(englishMessages).toContain('"removeSubscriptionsLiveStreams"');
	});

	test('hides current and upcoming subscription live stream cards', () => {
		expect(generalCssContent).toContain(
			'html[it-pathname=\'/feed/subscriptions\'][it-remove-subscriptions-live-streams="true"] ytd-rich-item-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="LIVE"])'
		);
		expect(generalCssContent).toContain(
			'html[it-pathname=\'/feed/subscriptions\'][it-remove-subscriptions-live-streams="true"] ytd-rich-item-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="UPCOMING"])'
		);
		expect(generalCssContent).toContain(
			'html[it-pathname=\'/feed/subscriptions\'][it-remove-subscriptions-live-streams="true"] ytd-rich-item-renderer:has(badge-shape.yt-badge-shape--live-now)'
		);
		expect(generalCssContent).toContain(
			'html[it-pathname=\'/feed/subscriptions\'][it-remove-subscriptions-live-streams="true"] ytd-video-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="LIVE"])'
		);
		expect(generalCssContent).toContain(
			'html[it-pathname=\'/feed/subscriptions\'][it-remove-subscriptions-live-streams="true"] yt-lockup-view-model:has(badge-shape.yt-badge-shape--live-now)'
		);
	});
});
