const featureDom = require('../helpers/feature-dom.cjs');
const file = 'js&css/web-accessible/www.youtube.com/features/time-limiter.js';
const today = '2026-11-20';
let app;
afterEach(() => app?.close());

function media(video, paused = false) {
	Object.defineProperties(video, {
		paused: { value: paused, writable: true, configurable: true },
		ended: { value: false, writable: true, configurable: true },
		seeking: { value: false, writable: true, configurable: true },
		readyState: { value: 4, writable: true, configurable: true }
	});
	video.pause = jest.fn(() => { video.paused = true; app.emit(video, 'pause'); });
	return video;
}

function load(settings = {}, html = '<div id="movie_player"><video></video></div>') {
	app = featureDom(file, { time_limiter: true, ...settings }, html);
	const video = app.document.querySelector('video');
	if (video) media(video);
	app.init();
	return video;
}

async function play(video, seconds) {
	for (let i = 0; i < seconds; i++) {
		video.currentTime += video.playbackRate;
		await app.advance(1000);
	}
}

test('real storage echoes and unrelated messages never restart the interval or persist no-op usage', async () => {
	const video = load();
	await app.advance(0);
	const interval = [...app.timers].find(([, timer]) => timer.interval)?.[0];
	expect(app.sent).toHaveLength(0);
	await play(video, 1);
	expect(app.persisted.time_limiter_data.seconds).toBe(1);
	expect(app.sent).toHaveLength(1);
	app.receive({ focus: true });
	app.storage('unrelated_setting', true);
	app.storage('time_limiter_data', { date: today, seconds: 1, bonus: 0 });
	await app.flush();
	expect([...app.timers].filter(([, timer]) => timer.interval).map(([id]) => id)).toEqual([interval]);
	expect(app.sent).toHaveLength(1);
	await play(video, 2);
	expect(app.persisted.time_limiter_data.seconds).toBe(3);
	expect(app.sent).toHaveLength(3);
	expect(app.errors).toEqual([]);
});

test('discovers late and replacement players, then detaches when disabled or off a video page', async () => {
	load({}, '');
	expect(app.timers.size).toBe(0);
	app.document.body.innerHTML = '<div id="movie_player"><video></video></div>';
	let video = media(app.document.querySelector('video'));
	await app.advance(0);
	await play(video, 1);
	const old = video;
	const replacement = media(app.document.createElement('video'));
	old.replaceWith(replacement);
	video = replacement;
	await app.advance(0);
	await play(video, 1);
	expect(app.persisted.time_limiter_data.seconds).toBe(2);
	app.storage('time_limiter', false);
	expect(app.timers.size).toBe(0);
	await play(video, 2);
	expect(app.persisted.time_limiter_data.seconds).toBe(2);
	app.storage('time_limiter', true);
	app.navigate('/feed/subscriptions');
	await app.advance(1000);
	expect(app.timers.size).toBe(0);
	expect(app.document.querySelector('#it-time-limit-overlay')).toBeNull();
	expect(app.errors).toEqual([]);
});

test('counts wall playback time at changed speeds and excludes pause, buffering, seek, hidden and ended time', async () => {
	const video = load();
	video.playbackRate = 2;
	app.emit(video, 'ratechange');
	await play(video, 2);
	expect(app.persisted.time_limiter_data.seconds).toBe(2);
	video.paused = true;
	app.emit(video, 'pause');
	await app.advance(5000);
	video.paused = false;
	video.readyState = 2;
	app.emit(video, 'waiting');
	await app.advance(5000);
	video.seeking = true;
	app.emit(video, 'seeking');
	video.currentTime += 100;
	await app.advance(1000);
	video.seeking = false;
	video.readyState = 4;
	app.emit(video, 'seeked');
	Object.defineProperty(app.document, 'hidden', { value: true, configurable: true });
	app.emit(app.document, 'visibilitychange');
	await play(video, 2);
	expect(app.persisted.time_limiter_data.seconds).toBe(2);
	Object.defineProperty(app.document, 'hidden', { value: false, configurable: true });
	app.emit(app.document, 'visibilitychange');
	app.emit(video, 'playing');
	await play(video, 1);
	expect(app.persisted.time_limiter_data.seconds).toBe(3);
	video.ended = true;
	app.emit(video, 'ended');
	await play(video, 1);
	expect(app.persisted.time_limiter_data.seconds).toBe(3);
	expect(app.errors).toEqual([]);
});

test('limit pause is reentrant-safe, dismissal stays closed until playback and bonus writes once', async () => {
	const video = load({ time_limiter_minutes: 1, time_limiter_data: { date: today, seconds: 59, bonus: 0 } });
	await play(video, 1);
	expect(video.pause).toHaveBeenCalledTimes(1);
	expect(app.document.querySelectorAll('#it-time-limit-overlay')).toHaveLength(1);
	app.document.querySelectorAll('#it-time-limit-overlay button')[1].click();
	await app.advance(2000);
	expect(app.document.querySelector('#it-time-limit-overlay')).toBeNull();
	video.paused = false;
	app.emit(video, 'play');
	expect(app.document.querySelectorAll('#it-time-limit-overlay')).toHaveLength(1);
	const more = app.document.querySelector('#it-time-limit-overlay button');
	more.click();
	await app.flush();
	expect(app.persisted.time_limiter_data.bonus).toBe(300);
	expect(app.sent).toHaveLength(2);
	more.click();
	expect(app.sent).toHaveLength(2);
	expect(app.document.querySelector('#it-time-limit-overlay')).toBeNull();
	expect(app.errors).toEqual([]);
});

test('reminders work without the daily stop and are cleared when their setting is disabled', async () => {
	const video = load({ time_limiter: false, break_reminder_minutes: 1 });
	await play(video, 60);
	expect(app.document.querySelectorAll('#it-break-toast')).toHaveLength(1);
	expect(video.pause).not.toHaveBeenCalled();
	app.storage('time_limiter_data', { date: today, seconds: 60, bonus: 0 });
	await app.flush();
	expect(app.sent).toHaveLength(60);
	app.storage('break_reminder_minutes', 0);
	expect(app.document.querySelector('#it-break-toast')).toBeNull();
	expect(app.timers.size).toBe(0);
	expect(app.errors).toEqual([]);
});

test('midnight clears a paused limit and bonus and assigns only post-midnight playback to the new day', async () => {
	load({ time_limiter_minutes: 1, time_limiter_data: { date: today, seconds: 500, bonus: 300 } });
	expect(app.document.querySelector('#it-time-limit-overlay')).not.toBeNull();
	app.setTime(new Date(2026, 10, 21, 0, 0, 0).getTime());
	app.storage('time_limiter_data', { date: today, seconds: 500, bonus: 300 });
	await app.flush();
	expect(app.document.querySelector('#it-time-limit-overlay')).toBeNull();
	expect(app.persisted.time_limiter_data).toEqual({ date: '2026-11-21', seconds: 0, bonus: 0 });
	app.close();
	app = featureDom(file, { time_limiter: true }, '<div id="movie_player"><video></video></div>');
	app.setTime(new Date(2026, 10, 20, 23, 59, 59, 500).getTime());
	const video = media(app.document.querySelector('video'));
	app.init();
	await play(video, 1);
	expect(app.persisted.time_limiter_data).toEqual({ date: '2026-11-21', seconds: 0.5, bonus: 0 });
	expect(app.errors).toEqual([]);
});

test('invalid persisted numeric values cannot yield NaN, negative usage or infinite allowances', () => {
	load();
	const day = new Date(2026, 10, 20, 12);
	expect(app.IT.timeLimiterAddUsage({ date: today, seconds: -8, bonus: Infinity }, NaN, day))
		.toEqual({ date: today, seconds: 0, bonus: 0 });
	expect(app.IT.timeLimiterStatus({ date: today, seconds: 'not-a-number', bonus: -50 }, 60, day))
		.toEqual({ used: 0, allowed: 60, remaining: 60, over: false });
	expect(app.IT.timeLimiterFormat(Infinity)).toBe('0m');
	expect(app.IT.timeLimiterAddUsage({ date: today, seconds: { toString: null }, bonus: [] }, {}, day))
		.toEqual({ date: today, seconds: 0, bonus: 0 });
	app.storage('time_limiter_minutes', { toString: null });
	app.storage('break_reminder_minutes', { toString: null });
	expect(app.errors).toEqual([]);
});
