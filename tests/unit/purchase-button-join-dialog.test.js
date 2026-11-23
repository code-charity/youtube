// Test for Issue #2906: the Join button inside the channel membership dialog was
// hidden whenever "Purchase" detail button was set to "Hidden" or "Remove name".
//
// YouTube's Polymer templates render the dialog's Join button as
//   ytd-sponsorships-offer-renderer > ytd-sponsorships-tier-renderer > #purchase-button
// inside ytd-popup-container, while the watch-page purchase button the feature
// targets lives in ytd-video-owner-renderer. An unscoped #purchase-button
// selector therefore also hid the membership checkout button.

const fs = require('fs');
const path = require('path');

// Split a selector list on top-level commas (ignores commas inside :not()/:has()).
function splitSelectorList(list) {
	const parts = [];
	let depth = 0, start = 0;
	for (let i = 0; i < list.length; i++) {
		if (list[i] === '(') depth++;
		else if (list[i] === ')') depth--;
		else if (list[i] === ',' && depth === 0) {
			parts.push(list.slice(start, i).trim());
			start = i + 1;
		}
	}
	parts.push(list.slice(start).trim());
	return parts.filter(Boolean);
}

// Remove :not(...) clauses so a guarded selector can be checked for positive targets.
function positivePart(selector) {
	return selector.replace(/:not\([^)]*\)/g, '');
}

describe('Purchase Button Hiding vs Membership Dialog (#2906)', () => {
	let selectors;

	beforeAll(() => {
		const filePath = path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/details/details.css');
		const css = fs.readFileSync(filePath, 'utf8');
		const block = css.match(/([\s\S]*?)\{display:\s*none\s*!important;?\s*\}/);
		expect(block).not.toBeNull();
		selectors = splitSelectorList(block[1]);
	});

	test('hiding selectors for #purchase-button still exist (feature preserved)', () => {
		const purchase = selectors.filter(s => positivePart(s).includes('#purchase-button'));
		expect(purchase.length).toBeGreaterThanOrEqual(2); // hidden + remove_label modes
	});

	test('every #purchase-button selector is excluded from dialogs and membership UI', () => {
		const purchase = selectors.filter(s => positivePart(s).includes('#purchase-button'));
		for (const sel of purchase) {
			expect(sel).toContain(':not(');
			expect(sel).toContain('ytd-popup-container');
			expect(sel).toContain('ytd-sponsorships-offer-renderer');
			expect(sel).toContain('ytd-sponsorships-tier-renderer');
		}
	});

	test('no hiding selector targets elements of the membership dialog', () => {
		const dialogTargets = selectors.filter(s =>
			/(ytd-sponsorships-offer-renderer|ytd-sponsorships-tier-renderer|tp-yt-paper-dialog)/.test(positivePart(s))
		);
		expect(dialogTargets).toEqual([]);
	});
});
