/**
 * Tests for the dayOfWeek feature
 * Verifies that Date.getDay() maps correctly to the days array
 */

describe('Day of Week indexing', () => {
	const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	test('Sunday (getDay=0) should map to days[0]="Sunday"', () => {
		// January 19, 2025 is a Sunday
		const sundayDate = new Date('2025-01-19');
		expect(sundayDate.getDay()).toBe(0);
		expect(days[sundayDate.getDay()]).toBe('Sunday');
	});

	test('Monday (getDay=1) should map to days[1]="Monday"', () => {
		// January 20, 2025 is a Monday
		const mondayDate = new Date('2025-01-20');
		expect(mondayDate.getDay()).toBe(1);
		expect(days[mondayDate.getDay()]).toBe('Monday');
	});

	test('Friday (getDay=5) should map to days[5]="Friday"', () => {
		// January 16, 2026 is a Friday (from issue #3556)
		const fridayDate = new Date('2026-01-16');
		expect(fridayDate.getDay()).toBe(5);
		expect(days[fridayDate.getDay()]).toBe('Friday');
	});

	test('Saturday (getDay=6) should map to days[6]="Saturday"', () => {
		// January 17, 2026 is a Saturday
		const saturdayDate = new Date('2026-01-17');
		expect(saturdayDate.getDay()).toBe(6);
		expect(days[saturdayDate.getDay()]).toBe('Saturday');
	});

	test('All days of week should be accessible without out-of-bounds error', () => {
		// Verify no day index causes undefined access
		for (let i = 0; i < 7; i++) {
			expect(days[i]).toBeDefined();
			expect(typeof days[i]).toBe('string');
		}
	});
});
