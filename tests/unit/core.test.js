// Mock extension object directly within the jest.mock call
jest.mock('../../js&css/extension/core', () => ({
	domReady: false,
	features: {},
	functions: {},
	messages: {
		queue: [],
		create: jest.fn(),
		listener: jest.fn(),
		send: jest.fn(),
	},
	ready: false,
	storage: {
		data: {},
		get: jest.fn(),
		listener: jest.fn(),
		load: jest.fn(),
	},
	camelize: jest.fn((string) => {
		// Mock implementation of the camelize function
		var result = '';
		for (var i = 0, l = string.length; i < l; i++) {
			var character = string[i];
			if (character === '_' || character === '-') {
				i++;
				result += string[i].toUpperCase();
			} else {
				result += character;
			}
		}
		return result;
	}),

	events: {
		// Mock implementation of the events function
		listeners: {},
		on: jest.fn(),
		trigger: async function (type, data) {
			const listeners = this.listeners[type];

			if (listeners) {
				for (let i = 0, l = listeners.length; i < l; i++) {
					const listener = listeners[i];

					if (typeof listener === 'function') {
						if (listener instanceof (async function () { }).constructor ) {
							await listener(data);
						} else {
							listener(data);
						}
					}
				}
			}
		},
	},

}));

// Mock extension object
const extensionMock = require('../../js&css/extension/core');

// Unit tests for the camelize function
test('Convert snake_case to camelCase', () => {
	const input = 'snake_case_example';
	const expectedOutput = 'snakeCaseExample';

	const mockInput = extensionMock.camelize(input);

	expect(mockInput).toBe(expectedOutput);
});

test('Convert kebab-case to camelCase', () => {
	// Define input and expected output
	const input = 'kebab-case-example';
	const expectedOutput = 'kebabCaseExample';

	// Call the camelize function with the input
	const mockInput = extensionMock.camelize(input);

	// Check if the result matches the expected output
	expect(mockInput).toBe(expectedOutput);
});

// Unit test for the events method
test('Trigger method should correctly retrieve and invoke listeners', () => {
	// Mock event listeners
	const listener1 = jest.fn();
	const listener2 = jest.fn();
	const listener3 = jest.fn();

	// Register listeners for a specific event type
	extensionMock.events.listeners['eventType'] = [listener1, listener2, listener3];

	// Call the trigger method with the event type and data
	extensionMock.events.trigger('eventType', { data: 'example' });

	// Verify that each listener is invoked with the provided data
	expect(listener1).toHaveBeenCalledWith({ data: 'example' });
	expect(listener2).toHaveBeenCalledWith({ data: 'example' });
	expect(listener3).toHaveBeenCalledWith({ data: 'example' });
});

test('Trigger method should handle asynchronous listeners', async () => {
	// Mock asynchronous event listeners
	const asyncListener = jest.fn().mockImplementation(async () => {
		// Simulate asynchronous behavior
		await new Promise(resolve => setTimeout(resolve, 100));
	});

	// Register the asynchronous listener for a specific event type
	extensionMock.events.listeners['eventType'] = [asyncListener];

	// Call the trigger method with the event type and data
	await extensionMock.events.trigger('eventType', { data: 'example' });

	// Verify that the asynchronous listener is invoked with the provided data
	expect(asyncListener).toHaveBeenCalledWith({ data: 'example' });
});