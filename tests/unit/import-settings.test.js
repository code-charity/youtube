const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Settings import persistence', () => {
	let context;
	let callback;

	beforeEach(() => {
		callback = undefined;
		context = {
			extension: {},
			location: {
				href: ''
			},
			navigator: {
				userAgent: 'Firefox'
			},
			console: {
				error: jest.fn()
			},
			chrome: {
				runtime: {},
				storage: {
					local: {
						set: jest.fn((_data, done) => {
							callback = done;
						})
					}
				}
			},
			satus: {
				storage: {
					data: {},
					get: jest.fn(),
					set: jest.fn()
				},
				events: {
					trigger: jest.fn()
				},
				render: jest.fn(),
				isset: jest.fn(value => value !== undefined && value !== null)
			}
		};

		const filePath = path.join(__dirname, '../../menu/functions.js');
		const source = fs.readFileSync(filePath, 'utf8');

		vm.runInNewContext(source, context);
	});

	test('writes imported settings in one storage transaction', () => {
		const imported = {
			watched: {
				video1: {
					title: 'First video'
				},
				video2: {
					title: 'Second video'
				}
			},
			shortcut_play_pause: {
				keys: {
					code: 'Numpad5'
				}
			}
		};
		const done = jest.fn();

		context.extension.applyImportedSettings(imported, done);

		expect(context.satus.storage.set).not.toHaveBeenCalled();
		expect(context.chrome.storage.local.set).toHaveBeenCalledTimes(1);
		expect(context.chrome.storage.local.set).toHaveBeenCalledWith(imported, expect.any(Function));
		expect(context.satus.storage.data).toEqual(imported);
		expect(done).not.toHaveBeenCalled();

		callback();

		expect(context.satus.events.trigger).toHaveBeenCalledWith('storage-set');
		expect(done).toHaveBeenCalledTimes(1);
	});

	test('does not write invalid import payloads', () => {
		context.extension.applyImportedSettings(null);
		context.extension.applyImportedSettings([]);

		expect(context.chrome.storage.local.set).not.toHaveBeenCalled();
		expect(context.satus.storage.data).toEqual({});
	});
});
