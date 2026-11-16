/*--------------------------------------------------------------
>>> TIME LIMITER
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.general.on.click.section_time_limiter = {
	component: 'section',
	variant: 'card',
	title: 'timeLimiter',

	time_limiter: {
		component: 'switch',
		text: 'timeLimiterEnable',
		tags: 'limit,time,break,reminder,daily,focus,wellbeing'
	},

	time_limiter_minutes: {
		component: 'slider',
		text: 'dailyLimitMinutes',
		min: 15,
		max: 240,
		step: 15,
		value: 60
	},

	break_reminder_minutes: {
		component: 'slider',
		text: 'breakReminderMinutes',
		min: 0,
		max: 120,
		step: 15,
		value: 0
	}
};
