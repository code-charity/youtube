const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(
	path.join(__dirname, '../../js&css/extension/www.youtube.com/night-mode/night-mode.js'),
	'utf8'
);

const start = source.indexOf('extension.features.schedule = function');
const end = source.indexOf('return false;\n};', start);

if (start < 0 || end < 0) {
	throw new Error('night-mode schedule source was not found');
}

const scheduleSource = source.slice(start, end + 'return false;\n};'.length);

function scheduleAt (hour, settings) {
	const extension = {
		features: {},
		storage: {
			get: (key) => Object.prototype.hasOwnProperty.call(settings, key) ? settings[key] : undefined
		}
	};

	const context = {
		extension,
		Date: function () {
			return { getHours: () => hour };
		}
	};

	vm.createContext(context);
	vm.runInContext(scheduleSource, context);

	return extension.features.schedule();
}

function sunsetToSunrise (from, to) {
	return { schedule: 'sunset_to_sunrise', schedule_time_from: from, schedule_time_to: to };
}

describe('Night mode schedule: time window', () => {
	test('the hour the window starts at is inside the window (wraps past midnight)', () => {
		expect(scheduleAt(22, sunsetToSunrise('22:00', '06:00'))).toBe(true);
	});

	test('a midnight-wrapping window covers its whole range', () => {
		const settings = sunsetToSunrise('22:00', '06:00');

		[22, 23, 0, 1, 5].forEach((hour) => {
			expect(scheduleAt(hour, settings)).toBe(true);
		});
	});

	test('a midnight-wrapping window excludes the hours outside it', () => {
		const settings = sunsetToSunrise('22:00', '06:00');

		[6, 7, 12, 21].forEach((hour) => {
			expect(scheduleAt(hour, settings)).toBe(false);
		});
	});

	test('the hour the window ends at is outside the window', () => {
		expect(scheduleAt(6, sunsetToSunrise('22:00', '06:00'))).toBe(false);
	});

	test('a same-day window is inclusive at its start and exclusive at its end', () => {
		const settings = sunsetToSunrise('09:00', '17:00');

		expect(scheduleAt(8, settings)).toBe(false);
		expect(scheduleAt(9, settings)).toBe(true);
		expect(scheduleAt(16, settings)).toBe(true);
		expect(scheduleAt(17, settings)).toBe(false);
	});

	test('every hour of a midnight-wrapping night is covered exactly once', () => {
		const settings = sunsetToSunrise('22:00', '06:00');
		const onHours = [];

		for (let hour = 0; hour < 24; hour++) {
			if (scheduleAt(hour, settings)) {
				onHours.push(hour);
			}
		}

		expect(onHours).toEqual([0, 1, 2, 3, 4, 5, 22, 23]);
	});
});
