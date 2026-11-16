/*--------------------------------------------------------------
>>> TIME LIMITER
----------------------------------------------------------------
Counts real playback seconds per local day, pauses at the daily
limit and can nudge with a break reminder. The counter belongs to
this feature only; it does not read or write the Analyzer data.
--------------------------------------------------------------*/
(function () {
	'use strict';

	var KEY = 'time_limiter_data',
		tickTimer = null,
		lastTick = 0,
		reminderAt = 0,
		overlay = null,
		video = null;

	function enabled() {
		return ImprovedTube.storage.time_limiter === true;
	}

	function limitSeconds() {
		var minutes = Number(ImprovedTube.storage.time_limiter_minutes) || 60;

		return minutes * 60;
	}

	function reminderMinutes() {
		return Number(ImprovedTube.storage.break_reminder_minutes) || 0;
	}

	function dayKey(date) {
		var d = date || new Date(),
			month = String(d.getMonth() + 1),
			day = String(d.getDate());

		if (month.length < 2) {
			month = '0' + month;
		}

		if (day.length < 2) {
			day = '0' + day;
		}

		return d.getFullYear() + '-' + month + '-' + day;
	}

	function addUsage(data, seconds, now) {
		var next = {
			date: dayKey(now),
			seconds: 0,
			bonus: 0
		};

		if (data && data.date === next.date) {
			next.seconds = Number(data.seconds) || 0;
			next.bonus = Number(data.bonus) || 0;
		}

		next.seconds = Math.max(0, next.seconds + (Number(seconds) || 0));

		return next;
	}

	function formatDuration(seconds) {
		var total = Math.max(0, Math.round(Number(seconds) || 0)),
			minutes = Math.floor(total / 60),
			rest = total % 60,
			hours = Math.floor(minutes / 60);

		if (hours > 0) {
			return hours + 'h ' + (minutes % 60) + 'm';
		}

		return minutes + 'm' + (rest ? ' ' + rest + 's' : '');
	}

	function status(data, limit, now) {
		var today = data && data.date === dayKey(now) ? data : { date: dayKey(now), seconds: 0, bonus: 0 },
			used = Number(today.seconds) || 0,
			allowed = limit + (Number(today.bonus) || 0),
			remaining = Math.max(0, allowed - used);

		return {
			used: used,
			allowed: allowed,
			remaining: remaining,
			over: used >= allowed
		};
	}

	function read() {
		return ImprovedTube.storage[KEY] || null;
	}

	function write(data) {
		ImprovedTube.storage[KEY] = data;
		ImprovedTube.messages.send({ action: 'set', key: KEY, value: data });
	}

	function theme() {
		var dark = document.documentElement.hasAttribute('dark');

		return {
			bg: dark ? '#181818' : '#ffffff',
			fg: dark ? '#f1f1f1' : '#0f0f0f',
			muted: dark ? 'rgba(255,255,255,.65)' : 'rgba(0,0,0,.6)',
			button: dark ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.06)',
			primary: '#3ea6ff'
		};
	}

	function makeOverlay(state) {
		var t = theme(),
			box = document.createElement('div'),
			title = document.createElement('div'),
			line = document.createElement('div'),
			row = document.createElement('div'),
			more = document.createElement('button'),
			close = document.createElement('button');

		box.id = 'it-time-limit-overlay';
		box.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;background:rgba(0,0,0,.72);font-family:Roboto,Arial,sans-serif';

		title.textContent = 'Daily watch limit reached';
		title.style.cssText = 'color:' + t.fg + ';font-size:24px;font-weight:500;margin-bottom:8px';

		line.textContent = 'You have watched ' + formatDuration(state.used) + ' today. The limit is ' + formatDuration(state.allowed) + '.';
		line.style.cssText = 'color:' + t.muted + ';font-size:14px;margin-bottom:18px;max-width:460px';

		row.style.cssText = 'display:flex;gap:8px;justify-content:center';
		more.textContent = 'Watch 5 more minutes';
		more.type = 'button';
		more.style.cssText = 'padding:9px 14px;border:0;border-radius:18px;background:' + t.primary + ';color:#0f0f0f;font:500 14px Roboto,Arial,sans-serif;cursor:pointer';
		more.addEventListener('click', function () {
			var data = addUsage(read(), 0),
				fresh = { date: dayKey(), seconds: data.seconds, bonus: data.bonus + 300 };

			write(fresh);
			removeOverlay();
		});

		close.textContent = 'Not now';
		close.type = 'button';
		close.style.cssText = 'padding:9px 14px;border:0;border-radius:18px;background:' + t.button + ';color:' + t.fg + ';font:500 14px Roboto,Arial,sans-serif;cursor:pointer';
		close.addEventListener('click', removeOverlay);

		row.appendChild(more);
		row.appendChild(close);
		box.appendChild(title);
		box.appendChild(line);
		box.appendChild(row);
		document.body.appendChild(box);

		return box;
	}

	function removeOverlay() {
		if (overlay) {
			overlay.remove();
			overlay = null;
		}
	}

	function showOverlay(state) {
		if (!overlay || !document.contains(overlay)) {
			removeOverlay();
			overlay = makeOverlay(state);
		}
	}

	function hideOverlay() {
		removeOverlay();
	}

	function toast(message) {
		var t = theme(),
			el = document.createElement('div');

		el.id = 'it-break-toast';
		el.textContent = message;
		el.style.cssText = 'position:fixed;right:16px;bottom:80px;z-index:2147483000;max-width:280px;padding:10px 12px;border-radius:10px;background:' +
			t.bg + ';color:' + t.fg + ';border:1px solid ' + t.muted + ';box-shadow:0 6px 24px rgba(0,0,0,.35);font:13px/1.4 Roboto,Arial,sans-serif;cursor:pointer';
		el.title = 'Click to dismiss';
		el.addEventListener('click', function () { el.remove(); });
		document.body.appendChild(el);
		setTimeout(function () { el.remove(); }, 12000);
	}

	function player() {
		var el = document.querySelector('video.html5-main-video, #movie_player video');

		return el || null;
	}

	function tick(seconds) {
		if (!enabled()) {
			hideOverlay();
			return null;
		}

		var data = addUsage(read(), seconds),
			state = status(data, limitSeconds());

		write(data);

		if (state.over) {
			if (video && !video.paused) {
				video.pause();
			}
			showOverlay(state);
		} else {
			hideOverlay();
		}

		var reminder = reminderMinutes() * 60;

		if (reminder && data.seconds - reminderAt >= reminder) {
			reminderAt = data.seconds;
			toast('You have watched ' + formatDuration(data.seconds) + '. Time for a short break?');
		}

		return state;
	}

	function start() {
		stop();
		video = player();

		if (!video) {
			return;
		}

		lastTick = Date.now();
		tickTimer = setInterval(function () {
			var now = Date.now(),
				delta = (now - lastTick) / 1000;

			lastTick = now;

			// Background tabs do not count; a long gap (sleep, tab discard) is capped.
			if (document.hidden || video.paused || video.ended || !enabled()) {
				return;
			}

			tick(Math.min(delta, 5));
		}, 1000);
	}

	function stop() {
		if (tickTimer) {
			clearInterval(tickTimer);
			tickTimer = null;
		}
	}

	function apply() {
		video = player();

		if (!enabled()) {
			stop();
			hideOverlay();
			return;
		}

		if (video) {
			start();
			tick(0);
		}
	}

	document.addEventListener('init_completed', apply);
	document.addEventListener('yt-navigate-finish', function () { setTimeout(apply, 400); });
	document.addEventListener('it-message-from-extension', apply);
	document.addEventListener('visibilitychange', function () { lastTick = Date.now(); });

	ImprovedTube.timeLimiterDayKey = dayKey;
	ImprovedTube.timeLimiterAddUsage = addUsage;
	ImprovedTube.timeLimiterFormat = formatDuration;
	ImprovedTube.timeLimiterStatus = status;
	ImprovedTube.timeLimiterTick = tick;
})();
