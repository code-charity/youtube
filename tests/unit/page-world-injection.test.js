// Test for Issue #4448: Chrome refuses the DOM <script> injection of the
// page-world files ("Unsafe attempt to load URL chrome-extension://...
// js&css/web-accessible/core.js from frame with URL https://www.youtube.com/.
// Domains, protocols and ports must match.", reported from
// js&css/extension/core.js:142, extension.inject), even though every file is
// listed in manifest.json's web_accessible_resources. The page-world files
// must therefore be injected through the background service worker
// (chrome.scripting, MAIN world -- the 'inject-main-world' message that
// background.js already implements for Safari), with the DOM path kept only
// as a fallback when the scripting injection is unavailable.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.join(__dirname, '../..');
const initSource = fs.readFileSync(
	path.join(repoRoot, 'js&css/extension/init.js'),
	'utf8'
);

// The self-contained slice of init.js that decides how the page-world files
// are injected: finishPageWorldInit + pageWorldFiles + the browser branch.
function injectionSlice() {
	const start = initSource.indexOf('function finishPageWorldInit');
	const end = initSource.indexOf("document.addEventListener('DOMContentLoaded'");

	if (start < 0 || end < 0 || end <= start) {
		throw new Error('page-world injection slice was not found in init.js');
	}

	return initSource.slice(start, end);
}

function runInjection({userAgent, scriptingResponse}) {
	const calls = {
		sendMessage: [],
		domInject: []
	};

	const context = vm.createContext({
		console,
		navigator: {userAgent},
		chrome: {
			runtime: {
				sendMessage: (message, callback) => {
					calls.sendMessage.push(message);

					if (callback) {
						callback(scriptingResponse);
					}
				},
				lastError: undefined
			}
		},
		extension: {
			ready: false,
			events: {
				trigger: () => {}
			},
			inject: (paths, callback) => {
				calls.domInject.push(paths);
			}
		}
	});

	vm.runInContext(injectionSlice(), context);

	return {calls, context};
}

const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36';

describe('page-world injection (issue #4448)', () => {
	test('manifest.json grants the scripting permission the background MAIN-world injection requires', () => {
		const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'manifest.json'), 'utf8'));

		expect(manifest.permissions).toContain('scripting');
	});

	test('Chrome injects the page-world files via the background scripting path, not DOM <script> tags', () => {
		const {calls, context} = runInjection({
			userAgent: CHROME_UA,
			scriptingResponse: {ok: true}
		});

		expect(calls.sendMessage).toHaveLength(1);
		expect(calls.sendMessage[0].action).toBe('inject-main-world');
		expect(calls.sendMessage[0].files).toContain('/js&css/web-accessible/core.js');
		expect(calls.sendMessage[0].files).toContain('/js&css/web-accessible/init.js');
		expect(calls.domInject).toHaveLength(0);
		expect(context.extension.ready).toBe(true);
	});

	test('Chrome falls back to DOM injection only when the scripting injection is unavailable', () => {
		const {calls} = runInjection({
			userAgent: CHROME_UA,
			scriptingResponse: {ok: false, error: 'chrome.scripting main-world injection failed'}
		});

		expect(calls.sendMessage).toHaveLength(1);
		expect(calls.sendMessage[0].action).toBe('inject-main-world');
		expect(calls.domInject).toHaveLength(1);
		expect(calls.domInject[0]).toContain('/js&css/web-accessible/core.js');
	});

	test('background.js serves the inject-main-world message with chrome.scripting in the MAIN world', () => {
		const background = fs.readFileSync(path.join(repoRoot, 'background.js'), 'utf8');

		expect(background).toContain("'inject-main-world'");
		expect(background).toContain('chrome.scripting.executeScript');
		expect(background).toContain("world: 'MAIN'");
	});
});
