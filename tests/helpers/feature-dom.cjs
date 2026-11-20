const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

module.exports = function featureDom(file, settings = {}, html = '', setup = () => {}) {
	const errors = [];
	const virtualConsole = new VirtualConsole();
	virtualConsole.on('jsdomError', error => errors.push(error));
	const dom = new JSDOM('<!doctype html><html><body>' + html + '</body></html>', {
		url: 'https://www.youtube.com/watch?v=aaaaaaaaaaa',
		runScripts: 'outside-only',
		pretendToBeVisual: true,
		virtualConsole
	});
	const { window } = dom;
	const { document } = window;
	const root = path.join(__dirname, '../..');
	const evaluate = relative => window.eval(fs.readFileSync(path.join(root, relative), 'utf8'));
	const timers = new Map();
	let nextTimer = 0;
	let now = new Date(2026, 10, 20, 12).getTime();
	window.setTimeout = (callback, delay = 0) => {
		const id = ++nextTimer;
		timers.set(id, { callback, at: now + delay });
		return id;
	};
	window.clearTimeout = id => timers.delete(id);
	window.setInterval = (callback, delay) => {
		const id = ++nextTimer;
		timers.set(id, { callback, at: now + delay, interval: delay });
		return id;
	};
	window.clearInterval = window.clearTimeout;
	const NativeDate = window.Date;
	window.Date = class extends NativeDate {
		constructor(...args) { super(...(args.length ? args : [now])); }
		static now() { return now; }
	};
	const emit = (target, type) => target.dispatchEvent(new window.Event(type, { bubbles: true }));
	const provider = document.createElement('div');
	provider.id = 'it-messages-from-extension';
	document.documentElement.appendChild(provider);
	evaluate('js&css/web-accessible/core.js');
	const IT = window.ImprovedTube;
	IT.init = () => {};
	IT.blocklistInit = () => {};
	const sent = [];
	const persisted = JSON.parse(JSON.stringify(settings));
	const pending = [];
	function receive(message) {
		provider.textContent = JSON.stringify(message);
		emit(document, 'it-message-from-extension');
	}
	function storage(key, value) {
		if (value === undefined) delete persisted[key];
		else persisted[key] = JSON.parse(JSON.stringify(value));
		receive({ action: 'storage-changed', key, value, camelizedKey: key.replace(/[_-](.)/g, (_, c) => c.toUpperCase()) });
	}
	setup(window);
	document.addEventListener('it-message-from-youtube', () => {
		const message = JSON.parse(document.getElementById('it-messages-from-youtube').textContent);
		emit(document, 'it-message-from-youtube--readed');
		sent.push(message);
		if (message.action === 'set') pending.push(() => {
			if (JSON.stringify(persisted[message.key]) !== JSON.stringify(message.value)) storage(message.key, message.value || undefined);
		});
	});
	evaluate(file);
	async function flush() {
		for (let i = 0; i < 20; i++) {
			await Promise.resolve();
			if (!pending.length) return;
			pending.splice(0).forEach(callback => callback());
		}
		throw new Error('Storage feedback did not settle');
	}
	async function advance(ms) {
		const end = now + ms;
		let iterations = 0;
		await flush();
		while (timers.size > 0) {
			const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
			if (!next) break;
			if (++iterations > 2000) throw new Error('Unbounded timer loop');
			const [id, timer] = next;
			now = timer.at;
			if (timer.interval) timer.at += timer.interval;
			else timers.delete(id);
			timer.callback();
			await flush();
		}
		now = end;
		await flush();
	}
	return {
		window, document, IT, sent, persisted, timers, errors, emit, receive, storage, flush, advance, evaluate,
		setTime(value) { now = value; },
		init() { receive({ action: 'storage-loaded', storage: JSON.parse(JSON.stringify(persisted)) }); },
		navigate(url) {
			emit(document, 'yt-navigate-start');
			window.history.pushState({}, '', url);
			emit(document, 'yt-navigate-finish');
		},
		close() { window.close(); }
	};
};
