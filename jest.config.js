module.exports = {
	testEnvironment: 'jsdom',
	testPathIgnorePatterns: [
		"/node_modules/"
	],
	testMatch: [
		"**/tests/**/*.js"
	],
	collectCoverage: true,
	coverageDirectory: "coverage",
	coverageReporters: ["text", "lcov", "html"],
	collectCoverageFrom: [
		"js&css/**/*.js",
		"!js&css/**/node_modules/**",
		"!js&css/web-accessible/www.youtube.com/original-title.js" // We'll test this file
	]
};
