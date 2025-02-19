/** @type {import('jest').Config} */
module.exports = {
	testPathIgnorePatterns: ['/node_modules/'],
	testMatch: ['**/tests/**/*.js'],
	coverageReporters: ['lcov', 'text'],
	setupFiles: ['<rootDir>/mock-extension-apis.js'],
};
