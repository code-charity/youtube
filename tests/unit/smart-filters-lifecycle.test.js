const fs = require('fs');
const path = require('path');
const featureDom = require('../helpers/feature-dom.cjs');
const file = 'js&css/web-accessible/www.youtube.com/features/smart-filters.js';
const row = (title, duration = '10:00') => `<ytd-rich-item-renderer><yt-lockup-view-model><h3><a>${title}</a></h3><span class="badge-shape-wiz__text">${duration}</span></yt-lockup-view-model></ytd-rich-item-renderer>`;
let app;
afterEach(() => app?.close());

function load(settings = { smart_filters: true, smart_filter_keywords: 'hide' }) {
	app = featureDom(file, settings, '', window => window.history.replaceState({}, '', '/'));
	app.init();
}

test('late and recycled rows are filtered once and UI updates settle on an idle page', async () => {
	load();
	app.document.body.insertAdjacentHTML('beforeend', row('Hide me') + row('Keep me'));
	await app.advance(400);
	expect(app.document.querySelectorAll('.it-smart-hidden')).toHaveLength(1);
	const pill = app.document.querySelector('#it-smart-filter-pill');
	expect(pill.textContent).toBe('1 hidden by filters');
	let writes = 0;
	new app.window.MutationObserver(records => writes += records.length).observe(pill, { childList: true, subtree: true });
	await app.advance(2000);
	expect(writes).toBe(0);
	expect(app.timers.size).toBe(0);
	app.document.querySelector('h3 a').textContent = 'Now allowed';
	await app.advance(400);
	expect(app.document.querySelectorAll('.it-smart-hidden')).toHaveLength(0);
	expect(pill.style.display).toBe('none');
	expect(app.errors).toEqual([]);
});

test('reveal can be reversed, preserves row layout, and disabling clears reveal state', async () => {
	load();
	const style = app.document.createElement('style');
	style.textContent = fs.readFileSync(path.join(__dirname, '../../js&css/extension/www.youtube.com/features/smart-filters.css'), 'utf8');
	app.document.head.appendChild(style);
	app.document.body.insertAdjacentHTML('beforeend', row('Hide me'));
	await app.advance(400);
	const item = app.document.querySelector('ytd-rich-item-renderer');
	item.style.display = 'flex';
	const pill = app.document.querySelector('#it-smart-filter-pill');
	pill.click();
	expect(pill.style.display).toBe('block');
	expect(pill.getAttribute('aria-pressed')).toBe('true');
	expect(app.window.getComputedStyle(item).display).toBe('flex');
	pill.click();
	expect(app.document.body.classList.contains('it-smart-show')).toBe(false);
	pill.click();
	app.storage('smart_filters', false);
	await app.advance(400);
	expect(app.document.querySelector('.it-smart-hidden')).toBeNull();
	expect(app.document.body.classList.contains('it-smart-show')).toBe(false);
	expect(app.document.querySelector('#it-smart-filter-pill')).toBeNull();
	expect(item.style.display).toBe('flex');
	expect(app.timers.size).toBe(0);
	expect(app.sent).toHaveLength(0);
	expect(app.errors).toEqual([]);
});

test('live settings apply through core dispatch and navigation restores cached rows', async () => {
	load({});
	app.document.body.insertAdjacentHTML('beforeend', row('Title', '2:00'));
	await app.advance(400);
	expect(app.document.querySelector('#it-smart-filter-pill')).toBeNull();
	app.storage('smart_filter_duration', 'short');
	app.storage('smart_filters', true);
	expect(app.document.querySelector('.it-smart-hidden')).not.toBeNull();
	app.navigate('/watch?v=aaaaaaaaaaa');
	await app.advance(400);
	expect(app.document.querySelector('.it-smart-hidden')).toBeNull();
	expect(app.document.querySelector('#it-smart-filter-pill')).toBeNull();
	expect(app.IT.smartFiltersDurationSeconds('1:90')).toBeNull();
	expect(app.IT.smartFiltersDurationSeconds('9'.repeat(400) + ':00')).toBeNull();
	expect(app.errors).toEqual([]);
});

test('all feature resources in the manifest and page injection chain exist', () => {
	const root = path.join(__dirname, '../..');
	const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
	for (const group of manifest.web_accessible_resources) {
		for (const resource of group.resources) expect(fs.existsSync(path.join(root, resource))).toBe(true);
	}
	const source = fs.readFileSync(path.join(root, 'js&css/extension/init.js'), 'utf8');
	for (const match of source.matchAll(/['"]\/(js&css\/web-accessible\/[^'"]+)['"]/g)) {
		expect(fs.existsSync(path.join(root, match[1]))).toBe(true);
	}
});
