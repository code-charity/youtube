const fs = require('fs');
const path = require('path');
const vm = require('vm');

test('feature menu parts execute after their categories in the popup script order', () => {
	const root = path.join(__dirname, '../..');
	const html = fs.readFileSync(path.join(root, 'menu/index.html'), 'utf8');
	const context = vm.createContext({
		chrome: { runtime: { getManifest: () => ({ version: '4' }) } },
		satus: {
			storage: { onchanged() {}, get() {} },
			events: { on() {} },
			user: { browser: { name: () => 'Chrome' } }
		}
	});
	const dependencies = new Set(['skeleton.js', 'skeleton-parts/general.js', 'skeleton-parts/appearance.js', 'skeleton-parts/playlist.js']);
	const featureParts = ['bookmarks', 'zen', 'channel-rss', 'invidious', 'playlist-filter', 'series-gap', 'playlist-health', 'comments-tools', 'smart-filters', 'time-limiter'];
	let loaded = 0;
	for (const match of html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*>/g)) {
		const file = match[1];
		const feature = featureParts.some(name => file === `skeleton-parts/${name}.js`);
		if (!feature && !dependencies.has(file)) continue;
		vm.runInContext(fs.readFileSync(path.join(root, 'menu', file), 'utf8'), context, { filename: file });
		if (feature) loaded++;
	}
	expect(loaded).toBeGreaterThan(0);
});
