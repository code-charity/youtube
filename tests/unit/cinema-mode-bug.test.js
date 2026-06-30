// Test for Issue #4003: Cinema mode / auto cinema mode bugged
//
// Symptom: With "Auto cinema mode" enabled, clicking on a YouTube video shows
// a blank screen and the video doesn't load.
//
// Root cause analysis:
//  - createOverlay() paints an OPAQUE black overlay (rgba(0,0,0,1)) with
//    z-index 9999 BEFORE the player container's z-index is bumped to 10000.
//  - The overlay is appended as the LAST child of #full-bleed-container, which
//    means it stacks on top of the player element in DOM order.
//  - The overlay has `pointer-events: auto` by default — even if z-index
//    "works", the opaque overlay still swallows clicks meant for the player.
//  - In Firefox (and any browser where YouTube applies a transform/will-change
//    to #full-bleed-container), position:fixed children become positioned
//    relative to that container and can end up above the player, leaving the
//    user staring at a fully opaque black rectangle.
//
// Fix:
//  1. Make the overlay semi-transparent so the video shows through even if
//     it accidentally lands above the player.
//  2. Add `pointer-events: none` so the overlay can never swallow clicks
//     intended for the player controls.
//  3. Append the overlay to document.body (root stacking context) and keep
//     the player's z-index safely above it.

const fs = require('fs');
const path = require('path');

describe('Cinema mode bug (#4003)', () => {
	let playerContent;

	beforeAll(() => {
		const playerPath = path.join(
			__dirname,
			'../../js&css/web-accessible/www.youtube.com/player.js'
		);
		playerContent = fs.readFileSync(playerPath, 'utf8');
	});

	describe('createOverlay() — overlay should never black out the video', () => {
		test('overlay background must be semi-transparent, not fully opaque', () => {
			// The previous code used rgba(0, 0, 0, 1) — fully opaque. With the
			// overlay covering the player, the user saw a blank screen.
			const overlayMatch = playerContent.match(
				/function\s+createOverlay\s*\(\s*\)\s*\{[\s\S]*?\n\}/
			);
			expect(overlayMatch).not.toBeNull();
			expect(overlayMatch[0]).toMatch(/backgroundColor\s*=\s*['"]rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0?\.\d/);
			expect(overlayMatch[0]).not.toMatch(/backgroundColor\s*=\s*['"]rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*1\s*\)['"]/);
		});

		test('overlay must have pointer-events: none so it never blocks clicks', () => {
			const overlayMatch = playerContent.match(
				/function\s+createOverlay\s*\(\s*\)\s*\{[\s\S]*?\n\}/
			);
			expect(overlayMatch).not.toBeNull();
			expect(overlayMatch[0]).toMatch(/pointerEvents\s*=\s*['"]none['"]/);
		});

		test('overlay must be appended to document.body, not full-bleed-container', () => {
			// Appending to body keeps the overlay in the root stacking context
			// so its z-index can't be perturbed by ancestor transforms.
			const overlayMatch = playerContent.match(
				/function\s+createOverlay\s*\(\s*\)\s*\{[\s\S]*?\n\}/
			);
			expect(overlayMatch).not.toBeNull();
			expect(overlayMatch[0]).toMatch(/document\.body\.appendChild/);
			expect(overlayMatch[0]).not.toMatch(/getElementById\(['"]full-bleed-container['"]\)/);
		});

		test('overlay z-index must stay below the player (player at 10000)', () => {
			const overlayMatch = playerContent.match(
				/function\s+createOverlay\s*\(\s*\)\s*\{[\s\S]*?\n\}/
			);
			expect(overlayMatch).not.toBeNull();
			const zMatch = overlayMatch[0].match(/zIndex\s*=\s*['"](\d+)['"]/);
			expect(zMatch).not.toBeNull();
			expect(Number(zMatch[1])).toBeLessThan(10000);
		});
	});

	describe('playerCinemaModeEnable() — player must always render above overlay', () => {
		test('player z-index must be set before the overlay is created', () => {
			// Order matters: bring the player to the front first, then add the
			// overlay, so there's never a paint frame where the opaque overlay
			// sits on top of an unstyled player.
			const enableMatch = playerContent.match(
				/ImprovedTube\.playerCinemaModeEnable\s*=\s*function\s*\(\s*\)\s*\{[\s\S]*?\n\}/
			);
			expect(enableMatch).not.toBeNull();

			const enableBody = enableMatch[0];
			const playerZIndexPos = enableBody.indexOf("'player-full-bleed-container'");
			const createOverlayPos = enableBody.indexOf('createOverlay(');

			expect(playerZIndexPos).toBeGreaterThan(-1);
			expect(createOverlayPos).toBeGreaterThan(-1);
			expect(playerZIndexPos).toBeLessThan(createOverlayPos);
		});

		test('player z-index must be > overlay z-index in cinema mode enable', () => {
			const overlayZ = Number(
				playerContent
					.match(/function\s+createOverlay[\s\S]*?zIndex\s*=\s*['"](\d+)['"]/)[1]
			);
			const enableMatch = playerContent.match(
				/ImprovedTube\.playerCinemaModeEnable\s*=\s*function\s*\(\s*\)\s*\{[\s\S]*?\n\}/
			);
			expect(enableMatch).not.toBeNull();

			// All three player containers must be bumped to a higher z-index
			// than the overlay. 10000 is the long-standing value used here.
			expect(enableMatch[0]).toMatch(/player-full-bleed-container[\s\S]*?zIndex\s*=\s*10000/);
			expect(10000).toBeGreaterThan(overlayZ);
		});
	});

	describe('playerCinemaModeDisable() — cleanup must be symmetric', () => {
		test('disable must clear position to remove the inline stacking context', () => {
			// When cinema mode is turned off, player containers must lose both
			// the inline z-index AND the inline position so YouTube's CSS
			// stacking is restored.
			const disableMatch = playerContent.match(
				/ImprovedTube\.playerCinemaModeDisable\s*=\s*function\s*\(\s*\)\s*\{[\s\S]*?\n\}/
			);
			expect(disableMatch).not.toBeNull();
			expect(disableMatch[0]).toMatch(/playerContainer\.style\.position\s*=\s*['"]['"]/);
		});
	});
});
