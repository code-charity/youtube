const fs = require('fs');
const path = require('path');

describe('Member-only video hiding (#3862)', () => {
	let generalCssContent;
	let generalJsContent;

	beforeAll(() => {
		generalCssContent = fs.readFileSync(
			path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.css'),
			'utf8'
		);
		generalJsContent = fs.readFileSync(
			path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.js'),
			'utf8'
		);
	});

	test('static CSS targets current membership badge shapes on channel video cards', () => {
		expect(generalCssContent).toContain(
			"html[it-remove-member-only='true'] ytd-grid-video-renderer:has(badge-shape.yt-badge-shape--membership)"
		);
		expect(generalCssContent).toContain(
			"html[it-remove-member-only='true'] ytd-rich-item-renderer:has(badge-shape.yt-badge-shape--membership)"
		);
		expect(generalCssContent).toContain(
			"html[it-remove-member-only='true'] yt-lockup-view-model:has(badge-shape.yt-badge-shape--membership)"
		);
	});

	test('runtime injected CSS also hides lockup cards with membership badges', () => {
		expect(generalJsContent).toContain(
			'yt-lockup-view-model:has(badge-shape.yt-badge-shape--membership)'
		);
	});
});
