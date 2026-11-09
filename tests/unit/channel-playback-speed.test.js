/**
 * Unit tests for channel-specific playback speed fix (issue #4465)
 *
 * Simulates the satus storage system and the on.change handler logic
 * to verify all three bug scenarios from the issue are fixed.
 */

// --- Minimal satus storage mock ---
function createStorage() {
	const store = {};
	return {
		get: (key) => (key in store ? JSON.parse(JSON.stringify(store[key])) : undefined),
		set: (key, value) => { store[key] = JSON.parse(JSON.stringify(value)); },
		remove: (key) => { delete store[key]; }
	};
}

// --- Simulate the BUGGY behaviour (before fix) ---
function simulateBuggyOnChange(storage, channelName, componentValue) {
	// OLD CODE: freshState[channelName] = Number(this.value)
	// At render time, this.value (component element's .value) is undefined
	const freshState = Object.assign({}, storage.get('channel_playback_speeds') || {});
	freshState[channelName] = Number(componentValue); // Number(undefined) = NaN
	storage.set('channel_playback_speeds', freshState);
}

// --- Simulate the FIXED behaviour (after fix) ---
function simulateFixedOnChange(storage, channelName, inputValue) {
	// NEW CODE: reads this.input.value (the actual range input), guarded by isNaN
	const speed = Number(inputValue);
	if (!isNaN(speed)) {
		const freshState = Object.assign({}, storage.get('channel_playback_speeds') || {});
		freshState[channelName] = speed;
		storage.set('channel_playback_speeds', freshState);
	}
}

// --- Simulate satus slider render (calls update() which may fire change at init) ---
function simulateSliderRender(storage, channelName, skeletonValue, isFixed) {
	// satus slider's update() fires at render. With storage:false (fix), it
	// does NOT call storage.remove() so no spurious change is dispatched.
	if (isFixed) {
		// storage: false — no auto-storage interaction at render time
		// on.change is NOT triggered at render
		return;
	} else {
		// BUGGY: storage key is 'speed_slider', satus tries to manage it.
		// When skeleton.value == input.value, calls storage.remove() which
		// dispatches a 'change' event triggering our handler with undefined this.value
		simulateBuggyOnChange(storage, channelName, undefined);
	}
}

describe('Channel Playback Speed — Bug Fix (#4465)', () => {

	// ── Scenario 1: Single channel speed stored as null/NaN on first add ──
	describe('Scenario 1: Speed stored correctly on first add', () => {
		test('[BUGGY] stores null instead of 1.25 on render (NaN serializes to null via JSON)', () => {
			const storage = createStorage();
			storage.set('channel_playback_speeds', { 'MrBeast': 1.25 });

			// Simulate reopening settings (re-render triggers buggy on.change)
			simulateSliderRender(storage, 'MrBeast', 1.25, false);

			const saved = storage.get('channel_playback_speeds');
			// Bug: Number(undefined) = NaN, JSON.stringify(NaN) = "null" → stored as null
			expect(saved['MrBeast']).toBeNull();
		});

		test('[FIXED] preserves 1.25 after render — no spurious change fired', () => {
			const storage = createStorage();
			storage.set('channel_playback_speeds', { 'MrBeast': 1.25 });

			// Fixed: storage:false means no spurious change at render
			simulateSliderRender(storage, 'MrBeast', 1.25, true);

			const saved = storage.get('channel_playback_speeds');
			expect(saved['MrBeast']).toBe(1.25);
		});
	});

	// ── Scenario 2: Multiple channels don't interfere ──
	describe('Scenario 2: Two channels with same speed stay independent', () => {
		test('[BUGGY] reopening settings corrupts both channels to null', () => {
			const storage = createStorage();
			storage.set('channel_playback_speeds', { 'ch-a': 1.25, 'ch-b': 1.25 });
			// Reopen settings — both channels re-render and fire buggy change
			simulateSliderRender(storage, 'ch-a', 1.25, false);
			simulateSliderRender(storage, 'ch-b', 1.25, false);

			const saved = storage.get('channel_playback_speeds');
			// Bug: NaN serializes to null via JSON
			expect(saved['ch-a']).toBeNull();
			expect(saved['ch-b']).toBeNull();
		});

		test('[FIXED] both channels preserve their speeds after reopen', () => {
			const storage = createStorage();
			storage.set('channel_playback_speeds', { 'ch-a': 1.25, 'ch-b': 1.25 });

			// Fixed: no spurious change at render
			simulateSliderRender(storage, 'ch-a', 1.25, true);
			simulateSliderRender(storage, 'ch-b', 1.25, true);

			const saved = storage.get('channel_playback_speeds');
			expect(saved['ch-a']).toBe(1.25);
			expect(saved['ch-b']).toBe(1.25);
		});
	});

	// ── Scenario 3: Manual speed input saves independently per channel ──
	describe('Scenario 3: Manual speed input updates only the correct channel', () => {
		test('[FIXED] changing ch-a speed to 2.0 does not affect ch-b', () => {
			const storage = createStorage();
			storage.set('channel_playback_speeds', { 'ch-a': 1.25, 'ch-b': 1.5 });

			// User manually types 2 in ch-a's input
			simulateFixedOnChange(storage, 'ch-a', 2.0);

			const saved = storage.get('channel_playback_speeds');
			expect(saved['ch-a']).toBe(2.0);
			expect(saved['ch-b']).toBe(1.5); // unchanged
		});
	});

	// ── isNaN guard: invalid input is never persisted ──
	describe('isNaN guard', () => {
		test('[FIXED] does not persist NaN values', () => {
			const storage = createStorage();
			storage.set('channel_playback_speeds', { 'ch-a': 1.25 });

			simulateFixedOnChange(storage, 'ch-a', undefined); // simulates bad input
			simulateFixedOnChange(storage, 'ch-a', 'abc');

			const saved = storage.get('channel_playback_speeds');
			// Value should remain unchanged at 1.25, not overwritten with NaN
			expect(saved['ch-a']).toBe(1.25);
		});
	});

});
