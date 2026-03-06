// Test for Issue #3611: Time display hidden when remaining duration enabled

const fs = require('fs');
const path = require('path');

describe('Player Remaining Duration Fix (#3611)', () => {
	describe('appearance.js - playerRemainingDuration', () => {
		let appearanceContent;

		beforeAll(() => {
			const filePath = path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/appearance.js');
			appearanceContent = fs.readFileSync(filePath, 'utf8');
		});

		test('should create a separate span element instead of overwriting textContent', () => {
			expect(appearanceContent).toContain("remainingEl = document.createElement('span')");
			expect(appearanceContent).toContain("remainingEl.className = 'ytp-time-remaining-duration'");
		});

		test('should use insertAdjacentElement to append remaining duration', () => {
			expect(appearanceContent).toContain("durationEl.insertAdjacentElement('afterend', remainingEl)");
		});

		test('should not overwrite durationEl.textContent with original + remaining', () => {
			expect(appearanceContent).not.toContain("durationEl.textContent =\n\t\tdurationEl.dataset.itOriginal");
		});

		test('should reuse existing remaining element to avoid duplicates', () => {
			expect(appearanceContent).toContain("document.querySelector('.ytp-time-remaining-duration')");
		});
	});

	describe('core.js - cleanup on disable', () => {
		let coreContent;

		beforeAll(() => {
			const filePath = path.join(__dirname, '../../js&css/web-accessible/core.js');
			coreContent = fs.readFileSync(filePath, 'utf8');
		});

		test('should remove the remaining duration element on disable', () => {
			expect(coreContent).toContain(".ytp-time-remaining-duration")
			expect(coreContent).toContain("?.remove()");
		});

		test('should not force display styles on ytp-time-contents', () => {
			expect(coreContent).not.toContain("setProperty('display', 'block', 'important')");
		});
	});
});
