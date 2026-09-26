const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Settings import persistence', () => {
	let context;
	let importedFile;
	let input;
	let modal;
	let storageCallback;
	let modalProvider;
	let fileReadError;

	beforeEach(() => {
		jest.useFakeTimers();
		importedFile = JSON.stringify({theme: 'dark', player_volume: 80});
		fileReadError = undefined;
		modalProvider = {
			close: jest.fn(),
			surface: {content: {textContent: '', setAttribute: jest.fn()}}
		};
		input = {
			files: [{}],
			addEventListener: jest.fn((event, listener) => {
				if (event === 'change') input.changeListener = listener;
			}),
			click: jest.fn()
		};

		context = {
			Blob,
			URL,
			console: {error: jest.fn()},
			close: jest.fn(),
			location: {href: 'moz-extension://test/menu/index.html?action=import-settings'},
			document: {createElement: jest.fn(() => input)},
			FileReader: class {
				readAsText() {
					if (fileReadError) {
						this.error = fileReadError;
						this.onerror();
						return;
					}
					this.result = importedFile;
					this.onload();
				}
			},
			setTimeout,
			clearTimeout,
			extension: {skeleton: {rendered: {}}},
			satus: {
				locale: {get: (key) => key},
				events: {trigger: jest.fn()},
				storage: {
					data: {},
					set(key, value) {
						this.data[key] = value;
						context.chrome.storage.local.set({[key]: value}, () => {});
					}
				},
				render: jest.fn((skeleton) => {
					modal = skeleton;
				})
			},
			chrome: {
				runtime: {sendMessage: jest.fn()},
				storage: {
					local: {
						set: jest.fn((settings, callback) => {
							storageCallback = callback;
						})
					},
					sync: {
						get: jest.fn((key, callback) => {
							callback({settings: importedFile});
						})
					}
				}
			}
		};
		vm.runInNewContext(
			fs.readFileSync(path.join(__dirname, '../../menu/functions.js'), 'utf8'),
			context
		);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	test('waits for the imported settings to persist before notifying and closing', () => {
		context.extension.importSettings();
		modal.buttons.ok.on.click.call({modalProvider});
		input.changeListener.call(input);

		expect(context.chrome.storage.local.set).toHaveBeenCalledTimes(1);
		expect(context.chrome.storage.local.set.mock.calls[0][0]).toEqual({
			theme: 'dark',
			player_volume: 80
		});
		jest.runAllTimers();
		expect(context.chrome.runtime.sendMessage).not.toHaveBeenCalled();
		expect(context.close).not.toHaveBeenCalled();
		expect(context.satus.storage.data).toEqual({});

		storageCallback();

		expect(context.satus.storage.data).toEqual({theme: 'dark', player_volume: 80});
		expect(context.chrome.runtime.sendMessage).toHaveBeenCalledWith({
			action: 'import-settings'
		});
		expect(context.close).toHaveBeenCalledTimes(1);
		expect(context.chrome.runtime.sendMessage.mock.invocationCallOrder[0])
			.toBeLessThan(context.close.mock.invocationCallOrder[0]);
	});

	test('updates menu attributes after a browser-account restore persists', () => {
		const listeners = {};
		const attributes = {};
		const modalProvider = {close: jest.fn()};
		context.extension.skeleton.rendered = {
			setAttribute: (key, value) => { attributes[key] = value; },
			removeAttribute: (key) => { delete attributes[key]; }
		};
		context.satus.storage.data = {theme: 'light'};
		context.satus.storage.get = (key) => context.satus.storage.data[key];
		context.satus.storage.import = (callback) => callback(context.satus.storage.data);
		context.satus.locale = {import: (language, callback) => callback()};
		context.satus.parentify = jest.fn();
		context.satus.isset = (value) => value !== undefined && value !== null;
		context.satus.events.on = (event, listener) => { listeners[event] = listener; };
		context.satus.events.trigger.mockImplementation((event) => {
			if (listeners[event]) listeners[event]();
		});
		context.location.href = 'moz-extension://test/menu/index.html';
		vm.runInNewContext(
			fs.readFileSync(path.join(__dirname, '../../menu/index.js'), 'utf8'),
			context
		);

		expect(attributes.theme).toBe('light');
		context.extension.pullSettings();
		modal.buttons.ok.on.click.call({modalProvider});
		expect(attributes.theme).toBe('light');
		expect(modalProvider.close).not.toHaveBeenCalled();

		storageCallback();

		expect(attributes.theme).toBe('dark');
		expect(modalProvider.close).toHaveBeenCalledTimes(1);
	});

	test('keeps browser-account restore open until the local write completes', () => {
		const modalProvider = {close: jest.fn()};

		context.extension.pullSettings();
		modal.buttons.ok.on.click.call({modalProvider});

		expect(modalProvider.close).not.toHaveBeenCalled();
		expect(context.satus.storage.data).toEqual({});

		storageCallback();

		expect(context.satus.storage.data).toEqual({theme: 'dark', player_volume: 80});
		expect(modalProvider.close).toHaveBeenCalledTimes(1);
	});
    test('returns storage errors without updating the cache or closing', () => {
        const failure = {message: 'storage unavailable'};
        context.chrome.runtime.lastError = failure;
        const callback = jest.fn();
        context.extension.applyImportedSettings({theme: 'dark'}, callback);
        storageCallback();
        expect(callback).toHaveBeenCalledWith(failure);
        expect(context.satus.storage.data).toEqual({});
        expect(context.satus.events.trigger).toHaveBeenCalledWith('storage-import-error', failure);
        expect(context.satus.events.trigger).not.toHaveBeenCalledWith('storage-import');
        expect(context.close).not.toHaveBeenCalled();
    });

    test('keeps file import open when persistence fails', () => {
        const log = jest.spyOn(console, 'error').mockImplementation(() => {});
        try {
            context.extension.importSettings();
            modal.buttons.ok.on.click.call({modalProvider});
            input.changeListener.call(input);
            context.chrome.runtime.lastError = {message: 'storage unavailable'};
            storageCallback();
            expect(context.close).not.toHaveBeenCalled();
            expect(context.chrome.runtime.sendMessage).not.toHaveBeenCalled();
            expect(modalProvider.surface.content.textContent).toBe('settingsImportFailed');
        } finally { log.mockRestore(); }
    });

	test('shows a browser-account write failure and keeps existing settings', () => {
		context.satus.storage.data = {theme: 'light', untouched: true};
		context.extension.pullSettings();
		modal.buttons.ok.on.click.call({modalProvider});
		context.chrome.runtime.lastError = {message: 'quota exceeded'};
		storageCallback();
		expect(modalProvider.surface.content.textContent).toBe('settingsImportFailed');
		expect(modalProvider.surface.content.setAttribute).toHaveBeenCalledWith('role', 'alert');
		expect(modalProvider.close).not.toHaveBeenCalled();
		expect(context.satus.storage.data).toEqual({theme: 'light', untouched: true});
		expect(context.satus.events.trigger).not.toHaveBeenCalledWith('storage-set');
	});

	test('reports sync read errors before parsing or writing', () => {
		const failure = {message: 'sync unavailable'};
		context.chrome.storage.sync.get.mockImplementation((key, callback) => {
			context.chrome.runtime.lastError = failure;
			callback(undefined);
		});
		context.extension.pullSettings();
		expect(() => modal.buttons.ok.on.click.call({modalProvider})).not.toThrow();
		expect(context.chrome.storage.local.set).not.toHaveBeenCalled();
		expect(context.satus.events.trigger).toHaveBeenCalledWith('storage-import-error', failure);
		expect(modalProvider.surface.content.textContent).toBe('settingsImportFailed');
		expect(modalProvider.close).not.toHaveBeenCalled();
	});

	test.each([undefined, {}, {settings: '{'}, {settings: 'null'}, {settings: '[]'}])(
		'reports invalid browser-account data without a write: %p', (result) => {
			context.chrome.storage.sync.get.mockImplementation((key, callback) => callback(result));
			context.extension.pullSettings();
			expect(() => modal.buttons.ok.on.click.call({modalProvider})).not.toThrow();
			expect(context.chrome.storage.local.set).not.toHaveBeenCalled();
			expect(modalProvider.surface.content.textContent).toBe('settingsImportFailed');
			expect(modalProvider.close).not.toHaveBeenCalled();
		});

	test('reports invalid file JSON without closing the importer', () => {
		importedFile = '{';
		context.extension.importSettings();
		modal.buttons.ok.on.click.call({modalProvider});
		expect(() => input.changeListener.call(input)).not.toThrow();
		expect(context.chrome.storage.local.set).not.toHaveBeenCalled();
		expect(modalProvider.surface.content.textContent).toBe('settingsImportFailed');
		expect(context.close).not.toHaveBeenCalled();
	});

	test('reports file read errors and allows a successful retry', () => {
		fileReadError = new Error('file unavailable');
		context.extension.importSettings();
		modal.buttons.ok.on.click.call({modalProvider});
		input.changeListener.call(input);
		expect(modalProvider.surface.content.textContent).toBe('settingsImportFailed');
		expect(context.chrome.storage.local.set).not.toHaveBeenCalled();
		fileReadError = undefined;
		input.changeListener.call(input);
		storageCallback();
		expect(context.close).toHaveBeenCalledTimes(1);
		expect(context.satus.storage.data.theme).toBe('dark');
	});

	test('merges partial settings and emits one notification pair per successful batch', () => {
		context.satus.storage.data = {theme: 'light', untouched: true};
		context.extension.applyImportedSettings({theme: 'dark'});
		expect(context.satus.events.trigger).not.toHaveBeenCalled();
		storageCallback();
		expect(context.satus.storage.data).toEqual({theme: 'dark', untouched: true});
		expect(context.satus.events.trigger.mock.calls).toEqual([['storage-set'], ['storage-import']]);
	});

});
