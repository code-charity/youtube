const fs = require('fs');
const path = require('path');

describe('Watch Later thumbnail buttons', () => {
	let generalJs;
	let generalCss;
	let generalSkeleton;

	beforeAll(() => {
		generalJs = fs.readFileSync(path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.js'), 'utf8');
		generalCss = fs.readFileSync(path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.css'), 'utf8');
		generalSkeleton = fs.readFileSync(path.join(__dirname, '../../menu/skeleton-parts/general.js'), 'utf8');
	});

	test('registers the feature with init', () => {
		const initJs = fs.readFileSync(path.join(__dirname, '../../js&css/extension/init.js'), 'utf8');

		expect(initJs).toContain('extension.features.watchLaterButtons();');
		expect(generalJs).toContain('extension.features.watchLaterButtons');
	});

	test('adds a hover and always menu option', () => {
		expect(generalSkeleton).toContain('watch_later_buttons');
		expect(generalSkeleton).toContain("value: 'hover'");
		expect(generalSkeleton).toContain("value: 'always'");
	});

	test('uses the native Watch Later control before the Innertube fallback', () => {
		expect(generalJs).toContain('findNativeWatchLaterButton');
		expect(generalJs).toContain('nativeButton.click();');
		expect(generalJs).toContain('ACTION_ADD_VIDEO');
		expect(generalJs).toContain("playlistId: 'WL'");
	});

	test('styles hover and always visibility states', () => {
		expect(generalCss).toContain(".it-watch-later-button");
		expect(generalCss).toContain("html[it-watch-later-buttons='hover']");
		expect(generalCss).toContain("html[it-watch-later-buttons='always']");
	});
});
