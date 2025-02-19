global.chrome = {
	tabs: {
		query: jest.fn((options, callback) => callback([])),
	},
	storage: {
		local: {
			get: jest.fn((callback) => callback({})),
			set: jest.fn(),
		},
		onChanged: {
			addListener: jest.fn(),
		},
	},
};
