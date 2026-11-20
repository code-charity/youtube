// Daily watch-time limiter and break reminder (issue #4078)

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const read = (...parts) => fs.readFileSync(path.join(__dirname, '../..', ...parts), 'utf8');

function load() {
	const noop = () => {};
	const context = {
		ImprovedTube: { storage: {}, messages: { send: noop } },
		document: {
			querySelector: () => null,
			querySelectorAll: () => [],
			addEventListener: noop,
			documentElement: { hasAttribute: () => false },
			body: { appendChild: noop },
			hidden: false
		},
		location: { pathname: '/watch', search: '?v=dQw4w9WgXcQ' },
		console,
		setTimeout: noop,
		setInterval: noop,
		clearInterval: noop
	};
	vm.runInNewContext(read('js&css', 'web-accessible', 'www.youtube.com', 'features', 'time-limiter.js'), context);
	return context.ImprovedTube;
}

describe('Time limiter (#4078)', () => {
	const IT = load();
	const day = new Date(2026, 10, 16, 12, 0, 0);

	test('formats seconds as minutes and hours', () => {
		expect(IT.timeLimiterFormat(0)).toBe('0m');
		expect(IT.timeLimiterFormat(90)).toBe('1m 30s');
		expect(IT.timeLimiterFormat(3660)).toBe('1h 1m');
	});

	test('starts a fresh day when the stored date differs', () => {
		const yesterday = { date: '2026-11-15', seconds: 3599, bonus: 300 };
		const today = IT.timeLimiterAddUsage(yesterday, 10, day);

		expect(today).toEqual({ date: '2026-11-16', seconds: 10, bonus: 0 });
	});

	test('accumulates on the same day and keeps the bonus', () => {
		const same = { date: '2026-11-16', seconds: 100, bonus: 300 };
		const next = IT.timeLimiterAddUsage(same, 20, day);

		expect(next.seconds).toBe(120);
		expect(next.bonus).toBe(300);
	});

	test('reports remaining time and the over state', () => {
		const state = IT.timeLimiterStatus({ date: '2026-11-16', seconds: 1200, bonus: 0 }, 1800, day);

		expect(state.used).toBe(1200);
		expect(state.allowed).toBe(1800);
		expect(state.remaining).toBe(600);
		expect(state.over).toBe(false);

		const over = IT.timeLimiterStatus({ date: '2026-11-16', seconds: 1800, bonus: 0 }, 1800, day);
		expect(over.over).toBe(true);
	});

	test('a bonus extends the limit for the day', () => {
		const state = IT.timeLimiterStatus({ date: '2026-11-16', seconds: 1800, bonus: 300 }, 1800, day);

		expect(state.allowed).toBe(2100);
		expect(state.remaining).toBe(300);
		expect(state.over).toBe(false);
	});
});
