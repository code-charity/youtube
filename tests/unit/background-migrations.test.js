const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '../../background.js'), 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));
const clone = value => JSON.parse(JSON.stringify(value));

async function loadBackground (initial = {}, options = {}) {
	const data = clone(initial);
	const pending = [];
	const event = () => {
		const listeners = [];
		return {
			addListener: jest.fn(listener => listeners.push(listener)),
			emit: (...args) => listeners.forEach(listener => listener(...args))
		};
	};
	const chrome = {
		runtime: { onInstalled: event(), onMessage: event(), setUninstallURL: jest.fn() },
		storage: { onChanged: event(), local: {} },
		contextMenus: { onClicked: event(), removeAll: jest.fn(), create: jest.fn() },
		tabs: { onActivated: event() },
		windows: { onFocusChanged: event() },
		i18n: { getUILanguage: () => 'en' }
	};
	const complete = (callback, error) => {
		if (error) chrome.runtime.lastError = { message: error };
		try {
			if (callback) callback();
		} finally {
			delete chrome.runtime.lastError;
		}
	};
	chrome.storage.local.get = jest.fn((keys, callback) => {
		if (typeof keys === 'function') { callback = keys; keys = null; }
		const result = {};
		for (const key of keys === null ? Object.keys(data) : [].concat(keys)) {
			if (Object.prototype.hasOwnProperty.call(data, key)) result[key] = clone(data[key]);
		}
		pending.push(() => {
			if (options.readError && keys !== null) {
				chrome.runtime.lastError = { message: 'Storage read failed' };
				try { callback(undefined); } finally { delete chrome.runtime.lastError; }
			} else callback(result);
		});
	});
	chrome.storage.local.set = jest.fn((values, callback) => {
		const saved = clone(values);
		pending.push(() => {
			if (options.writeError) complete(callback, 'Storage write failed');
			else { Object.assign(data, saved); complete(callback); }
		});
	});
	chrome.storage.local.remove = jest.fn((keys, callback) => {
		pending.push(() => {
			if (options.removeError) complete(callback, 'Storage removal failed');
			else {
				for (const key of [].concat(keys)) delete data[key];
				complete(callback);
			}
		});
	});
	const context = {
		chrome,
		console: { error: jest.fn(), log: jest.fn() },
		navigator: { userAgent: 'Chrome' },
		fetch: jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
	};
	vm.runInNewContext(source, context, { filename: 'background.js' });
	await flush();
	const drain = async () => {
		while (pending.length) { pending.shift()(); await flush(); }
	};
	return {
		...context, data, pending, drain,
		update: async () => { chrome.runtime.onInstalled.emit({ reason: 'update' }); await drain(); }
	};
}

describe('Background rename migrations (#4067, related #1209)', () => {
	const legacy = {
		player_autoplay: false,
		Hide_Pause_Overlay: true,
		hideSubscribe: true,
		limit_page_width: false,
		volume_step: 5,
		playback_speed_step: 0.25,
		shortcut_720p: { keys: { 65: { key: 'a' } }, alt: true }
	};

	test('preserves explicit target preferences when old and new keys coexist', async () => {
		const preferences = {
			player_autoplay_disable: false,
			player_auto_continue_watching: false,
			subscribe: 'normal',
			no_page_margin: false,
			shortcuts_volume_step: 0,
			shortcuts_playback_speed_step: 0.1,
			shortcut_quality_720p: {}
		};
		const bg = await loadBackground({ ...legacy, ...preferences });
		await bg.update();
		expect(bg.data).toEqual(preferences);
		expect(bg.chrome.storage.local.set).not.toHaveBeenCalled();
	});

	test.each([false, 0, '', null, {}])('treats a stored shortcut target %j as present', async target => {
		const bg = await loadBackground({ shortcut_720p: legacy.shortcut_720p, shortcut_quality_720p: target });
		await bg.update();
		expect(bg.data).toEqual({ shortcut_quality_720p: target });
		expect(bg.chrome.storage.local.set).not.toHaveBeenCalled();
	});

	test('still migrates valid legacy preferences when target keys are absent', async () => {
		const bg = await loadBackground(legacy);
		await bg.update();
		expect(bg.data).toEqual({
			player_autoplay_disable: true,
			player_auto_continue_watching: true,
			subscribe: 'hidden',
			no_page_margin: true,
			shortcuts_volume_step: 5,
			shortcuts_playback_speed_step: 0.25,
			shortcut_quality_720p: { keys: { 65: { key: 'a' } }, alt: true }
		});
	});

	test('waits for successful writes before removing the corresponding legacy keys', async () => {
		const bg = await loadBackground({ Hide_Pause_Overlay: true });
		bg.chrome.runtime.onInstalled.emit({ reason: 'update' });
		while (!bg.chrome.storage.local.set.mock.calls.length && bg.pending.length) {
			bg.pending.shift()();
			await flush();
		}
		expect(bg.chrome.storage.local.set).toHaveBeenCalledWith({ player_auto_continue_watching: true }, expect.any(Function));
		expect(bg.chrome.storage.local.remove.mock.calls.flatMap(([keys]) => [].concat(keys))).not.toContain('Hide_Pause_Overlay');
		await bg.drain();
		expect(bg.data).toEqual({ player_auto_continue_watching: true });
	});

	test('keeps all legacy values for retry when saving replacements fails', async () => {
		const bg = await loadBackground(legacy, { writeError: true });
		await bg.update();
		expect(bg.data).toEqual(legacy);
		expect(bg.console.error).toHaveBeenCalled();
	});

	test('does not mutate preferences after a failed storage read', async () => {
		const bg = await loadBackground(legacy, { readError: true });
		await bg.update();
		expect(bg.data).toEqual(legacy);
		expect(bg.chrome.storage.local.set).not.toHaveBeenCalled();
		expect(bg.chrome.storage.local.remove).not.toHaveBeenCalled();
		expect(bg.console.error).toHaveBeenCalled();
	});

	test('reports failed cleanup without losing the replacement or overwriting a later preference', async () => {
		const options = { removeError: true };
		const bg = await loadBackground({ Hide_Pause_Overlay: true }, options);
		await bg.update();
		expect(bg.data).toEqual({ Hide_Pause_Overlay: true, player_auto_continue_watching: true });
		expect(bg.console.error).toHaveBeenCalled();
		bg.data.player_auto_continue_watching = false;
		options.removeError = false;
		await bg.update();
		expect(bg.data).toEqual({ player_auto_continue_watching: false });
	});

	test('does not repeat migrations or restore old preferences on another update', async () => {
		const bg = await loadBackground(legacy);
		await bg.update();
		bg.data.player_auto_continue_watching = false;
		bg.chrome.storage.local.set.mockClear();
		bg.chrome.storage.local.remove.mockClear();
		await bg.update();
		expect(bg.data.player_auto_continue_watching).toBe(false);
		expect(bg.chrome.storage.local.set).not.toHaveBeenCalled();
		expect(bg.chrome.storage.local.remove).not.toHaveBeenCalled();
	});

	test('does not migrate rename keys on a browser update', async () => {
		const bg = await loadBackground(legacy);
		bg.chrome.runtime.onInstalled.emit({ reason: 'browser_update' });
		await bg.drain();
		expect(bg.data).toEqual(legacy);
		expect(bg.chrome.storage.local.set).not.toHaveBeenCalled();
	});

	test('keeps a current player size when the new margin preference already exists', async () => {
		const bg = await loadBackground({ limit_page_width: false, no_page_margin: false, player_size: 'fit_to_window' });
		await bg.update();
		expect(bg.data).toEqual({ no_page_margin: false, player_size: 'fit_to_window' });
	});

	test('still converts legacy player size together with an absent margin preference', async () => {
		const bg = await loadBackground({ limit_page_width: false, player_size: 'full_window' });
		await bg.update();
		expect(bg.data).toEqual({ no_page_margin: true, player_size: 'max_width' });
	});

	test('keeps the existing same-key value migrations and stores the quality marker with its replacement', async () => {
		const bg = await loadBackground({ description: 'classic_expanded', channel_default_tab: '/home', player_quality: 'auto' });
		await bg.update();
		expect(bg.data).toEqual({ description: 'expanded', channel_default_tab: '/', player_quality: 'disabled', player_quality_auto: 'migrated' });
		expect(bg.chrome.storage.local.set).toHaveBeenCalledTimes(1);
		expect(bg.chrome.storage.local.set.mock.calls[0][0]).toMatchObject({ player_quality: 'disabled', player_quality_auto: 'migrated' });
	});

	test('leaves current values and a previously migrated auto-quality preference alone', async () => {
		const current = { description: 'normal', channel_default_tab: '/videos', player_quality: 'auto', player_quality_auto: 'migrated', player_size: 'max_width' };
		const bg = await loadBackground(current);
		await bg.update();
		expect(bg.data).toEqual(current);
		expect(bg.chrome.storage.local.set).not.toHaveBeenCalled();
		expect(bg.chrome.storage.local.remove).not.toHaveBeenCalled();
	});

	test('preserves unconvertible shortcut data rather than silently deleting it', async () => {
		const invalid = { shortcut_auto: null, shortcut_144p: [], shortcut_240p: 'bad import', shortcut_360p: { keys: 'bad import' } };
		const bg = await loadBackground(invalid);
		await bg.update();
		expect(bg.data).toEqual(invalid);
		expect(bg.chrome.storage.local.set).not.toHaveBeenCalled();
		expect(bg.chrome.storage.local.remove).not.toHaveBeenCalled();
	});
});
