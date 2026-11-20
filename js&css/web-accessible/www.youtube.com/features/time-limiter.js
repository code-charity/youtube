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
		lastPosition = 0,
		lastRate = 1,
		wasPlaying = false,
		buffering = false,
		navigating = false,
		observer = null,
		listening = false,
		reminderAt = 0,
		reminderDay = '',
		reminderInterval = 0,
		overlay = null,
		overlayLine = null,
		dismissed = false,
		toastElement = null,
		toastTimer = null,
		video = null;
	var mediaEvents = ['play', 'playing', 'pause', 'ended', 'waiting', 'stalled', 'seeking', 'seeked', 'emptied', 'loadedmetadata', 'ratechange'];

	function nonnegative(value) {
		if (typeof value !== 'number' && typeof value !== 'string') return 0;
		var number = Number(value);
		return Number.isFinite(number) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, number)) : 0;
	}

	function enabled() {
		return ImprovedTube.storage.time_limiter === true;
	}

	function limitSeconds() {
		var minutes = nonnegative(ImprovedTube.storage.time_limiter_minutes);
		if (!Number.isFinite(minutes) || minutes <= 0) minutes = 60;

		return Math.min(minutes, 1440) * 60;
	}

	function reminderMinutes() {
		return Math.min(120, nonnegative(ImprovedTube.storage.break_reminder_minutes));
	}

	function tracking() {
		return enabled() || reminderMinutes() > 0;
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
			next.seconds = nonnegative(data.seconds);
			next.bonus = nonnegative(data.bonus);
		}

		next.seconds = nonnegative(next.seconds + nonnegative(seconds));

		return next;
	}

	function formatDuration(seconds) {
		var total = Math.round(nonnegative(seconds)),
			minutes = Math.floor(total / 60),
			rest = total % 60,
			hours = Math.floor(minutes / 60);

		if (hours > 0) {
			return hours + 'h ' + (minutes % 60) + 'm';
		}

		return minutes + 'm' + (rest ? ' ' + rest + 's' : '');
	}

	function status(data, limit, now) {
		var today = addUsage(data, 0, now),
			used = today.seconds,
			allowed = nonnegative(nonnegative(limit) + today.bonus),
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
		var previous = read();
		if (previous && previous.date === data.date && previous.seconds === data.seconds && previous.bonus === data.bonus) return;
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
			card = document.createElement('div'),
			title = document.createElement('div'),
			line = document.createElement('div'),
			row = document.createElement('div'),
			more = document.createElement('button'),
			close = document.createElement('button');

		box.id = 'it-time-limit-overlay';
		box.setAttribute('role', 'dialog');
		box.setAttribute('aria-modal', 'true');
		box.setAttribute('aria-labelledby', 'it-time-limit-title');
		box.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;background:rgba(0,0,0,.72);font-family:Roboto,Arial,sans-serif';
		card.style.cssText = 'padding:24px;border-radius:16px;max-width:460px;background:' + t.bg;

		title.id = 'it-time-limit-title';
		title.textContent = 'Daily watch limit reached';
		title.style.cssText = 'color:' + t.fg + ';font-size:24px;font-weight:500;margin-bottom:8px';

		line.textContent = 'You have watched ' + formatDuration(state.used) + ' today. The limit is ' + formatDuration(state.allowed) + '.';
		overlayLine = line;
		line.style.cssText = 'color:' + t.muted + ';font-size:14px;margin-bottom:18px;max-width:460px';

		row.style.cssText = 'display:flex;gap:8px;justify-content:center';
		more.textContent = 'Watch 5 more minutes';
		more.type = 'button';
		more.style.cssText = 'padding:9px 14px;border:0;border-radius:18px;background:' + t.primary + ';color:#0f0f0f;font:500 14px Roboto,Arial,sans-serif;cursor:pointer';
		more.addEventListener('click', function () {
			if (!enabled() || !box.isConnected) return;
			var data = addUsage(read(), 0),
				fresh = { date: dayKey(), seconds: data.seconds, bonus: nonnegative(data.bonus + 300) };

			write(fresh);
			dismissed = false;
			removeOverlay();
		});

		close.textContent = 'Not now';
		close.type = 'button';
		close.style.cssText = 'padding:9px 14px;border:0;border-radius:18px;background:' + t.button + ';color:' + t.fg + ';font:500 14px Roboto,Arial,sans-serif;cursor:pointer';
		close.addEventListener('click', function () { dismissed = true; removeOverlay(); });

		row.appendChild(more);
		row.appendChild(close);
		card.appendChild(title);
		card.appendChild(line);
		card.appendChild(row);
		box.appendChild(card);
		(document.fullscreenElement || document.body).appendChild(box);
		more.focus();
		box.addEventListener('keydown', function (event) {
			if (event.key === 'Escape') { event.preventDefault(); dismissed = true; removeOverlay(); }
			if (event.key === 'Tab') {
				event.preventDefault();
				(document.activeElement === more ? close : more).focus();
			}
		});

		return box;
	}

	function removeOverlay() {
		if (overlay) {
			overlay.remove();
			overlay = null;
			overlayLine = null;
		}
	}

	function showOverlay(state) {
		if (!document.body) return;
		if (!overlay || !document.contains(overlay)) {
			removeOverlay();
			overlay = makeOverlay(state);
		}
		var text = 'You have watched ' + formatDuration(state.used) + ' today. The limit is ' + formatDuration(state.allowed) + '.';
		if (overlayLine && overlayLine.textContent !== text) overlayLine.textContent = text;
	}

	function hideOverlay() {
		removeOverlay();
	}

	function toast(message) {
		removeToast();
		if (!document.body) return;
		var t = theme(),
			el = document.createElement('button');

		el.id = 'it-break-toast';
		el.type = 'button';
		el.setAttribute('aria-live', 'polite');
		el.textContent = message;
		el.style.cssText = 'position:fixed;right:16px;bottom:80px;z-index:2147483000;max-width:280px;padding:10px 12px;border-radius:10px;background:' +
			t.bg + ';color:' + t.fg + ';border:1px solid ' + t.muted + ';box-shadow:0 6px 24px rgba(0,0,0,.35);font:13px/1.4 Roboto,Arial,sans-serif;cursor:pointer';
		el.title = 'Click to dismiss';
		el.addEventListener('click', removeToast);
		(document.fullscreenElement || document.body).appendChild(el);
		toastElement = el;
		toastTimer = setTimeout(removeToast, 12000);
	}

	function removeToast() {
		if (toastElement) toastElement.remove();
		toastElement = null;
		clearTimeout(toastTimer);
		toastTimer = null;
	}

	function player() {
		if (location.pathname.startsWith('/shorts/')) {
			return document.querySelector('ytd-reel-video-renderer[is-active] video') || document.querySelector('#shorts-player video');
		}
		if (!/^\/(watch$|live\/|embed\/)/.test(location.pathname)) return null;
		return document.querySelector('#movie_player video');
	}

	function tick(seconds) {
		if (!tracking()) {
			hideOverlay();
			return null;
		}

		var previous = read(),
			data = addUsage(previous, seconds),
			state = status(data, limitSeconds());

		// Configuration and storage echoes are reads. Persist only usage or a real day change.
		if (nonnegative(seconds) > 0 || (previous && previous.date !== data.date)) write(data);
		if (reminderDay !== data.date || data.seconds < reminderAt) {
			reminderDay = data.date;
			reminderAt = 0;
			dismissed = false;
			removeToast();
		}

		if (enabled() && state.over && video && !navigating) {
			if (video && !video.paused) {
				dismissed = false;
				wasPlaying = false;
				video.pause();
			}
			if (!dismissed) showOverlay(state);
		} else {
			dismissed = false;
			hideOverlay();
		}

		var reminder = reminderMinutes() * 60;
		if (reminder !== reminderInterval) {
			reminderInterval = reminder;
			reminderAt = reminder ? Math.floor((data.seconds - nonnegative(seconds)) / reminder) * reminder : 0;
			removeToast();
		}
		if (reminder && nonnegative(seconds) > 0 && data.seconds - reminderAt >= reminder) {
			reminderAt = Math.floor(data.seconds / reminder) * reminder;
			toast('You have watched ' + formatDuration(data.seconds) + '. Time for a short break?');
		}

		return state;
	}

	function playing() {
		return tracking() && !navigating && !document.hidden && video && video.isConnected &&
			!video.paused && !video.ended && !video.seeking && !buffering && video.readyState >= 3;
	}

	function resetClock() {
		lastTick = Date.now();
		lastPosition = video ? nonnegative(video.currentTime) : 0;
		lastRate = video && Number.isFinite(video.playbackRate) && video.playbackRate > 0 ? video.playbackRate : 1;
		wasPlaying = !!playing();
	}

	function sample() {
		if (!video || video !== player() || !video.isConnected) { apply(); return; }
		var now = Date.now(),
			position = nonnegative(video.currentTime),
			seconds = wasPlaying && !video.seeking && position > lastPosition && now > lastTick
				? Math.min(5, (now - lastTick) / 1000, (position - lastPosition) / lastRate) : 0;
		if (dayKey(new Date(lastTick)) !== dayKey(new Date(now))) {
			var midnight = new Date(now);
			midnight.setHours(0, 0, 0, 0);
			seconds = Math.min(seconds, (now - midnight.getTime()) / 1000);
		}
		// Update before pause() can synchronously re-enter through the media listener.
		lastTick = now;
		lastPosition = position;
		lastRate = Number.isFinite(video.playbackRate) && video.playbackRate > 0 ? video.playbackRate : 1;
		wasPlaying = !!playing();
		tick(seconds);
	}

	function onMedia(event) {
		if (!tracking() || navigating) return;
		if (event.target !== video) { if (event.target === player()) apply(); return; }
		if (event.type === 'seeking' || event.type === 'emptied') {
			buffering = event.type === 'emptied';
			resetClock();
			return;
		}
		sample();
		if (event.type === 'waiting' || event.type === 'stalled') buffering = true;
		if (event.type === 'playing' || event.type === 'loadedmetadata' || event.type === 'seeked') buffering = false;
		resetClock();
	}

	function onVisibility() {
		resetClock();
	}

	function onFullscreen() {
		if (overlay) (document.fullscreenElement || document.body)?.appendChild(overlay);
		if (toastElement) (document.fullscreenElement || document.body)?.appendChild(toastElement);
	}

	function stop() {
		if (tickTimer !== null) {
			clearInterval(tickTimer);
			tickTimer = null;
		}
	}

	function apply() {
		if (!tracking() || navigating || !/^\/(watch$|live\/|embed\/|shorts\/)/.test(location.pathname)) {
			stop();
			hideOverlay();
			removeToast();
			if (observer) observer.disconnect();
			observer = null;
			if (listening) {
				mediaEvents.forEach(function (type) { document.removeEventListener(type, onMedia, true); });
				document.removeEventListener('visibilitychange', onVisibility);
				document.removeEventListener('fullscreenchange', onFullscreen);
				listening = false;
			}
			video = null;
			wasPlaying = false;
			return;
		}
		if (!listening) {
			mediaEvents.forEach(function (type) { document.addEventListener(type, onMedia, true); });
			document.addEventListener('visibilitychange', onVisibility);
			document.addEventListener('fullscreenchange', onFullscreen);
			listening = true;
		}
		if (!observer) {
			observer = new MutationObserver(function () {
				if (video !== player() || (video && !video.isConnected)) apply();
			});
			observer.observe(document.documentElement, { childList: true, subtree: true });
		}
		var current = player();
		if (current !== video) {
			stop();
			video = current;
			buffering = false;
			resetClock();
		}
		if (!video) {
			stop();
			hideOverlay();
			removeToast();
			return;
		}
		if (tickTimer === null) {
			resetClock();
			tickTimer = setInterval(sample, 1000);
		}
		tick(0);
	}

	document.addEventListener('init_completed', apply);
	document.addEventListener('DOMContentLoaded', apply);
	document.addEventListener('yt-navigate-start', function () { if (video) sample(); navigating = true; apply(); });
	document.addEventListener('yt-navigate-finish', function () { navigating = false; apply(); });
	ImprovedTube.timeLimiter = apply;
	ImprovedTube.timeLimiterMinutes = apply;
	ImprovedTube.breakReminderMinutes = apply;
	ImprovedTube.timeLimiterData = function () { if (tracking()) tick(0); };

	ImprovedTube.timeLimiterDayKey = dayKey;
	ImprovedTube.timeLimiterAddUsage = addUsage;
	ImprovedTube.timeLimiterFormat = formatDuration;
	ImprovedTube.timeLimiterStatus = status;
	ImprovedTube.timeLimiterTick = tick;
})();
