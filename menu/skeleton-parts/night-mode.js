/*--------------------------------------------------------------
>>> NIGHT MODE
--------------------------------------------------------------*/

extension.skeleton.header.sectionEnd.menu.on.click.nightMode = {
	component: 'button',
	category: true,
	on: {
		click: {
			filters: {
				component: 'section',
				variant: 'card',
				title: 'filters',

				dim: {
					component: 'slider',
					variant: 'row',
					text: 'dim',
					step: 1,
					max: 90,
					value: 0
				},
				bluelight: {
					component: 'slider',
					variant: 'row',
					text: 'bluelight',
					step: 1,
					max: 90,
					value: 0
				}
			},
			schedule: {
				component: 'section',
				variant: 'card',
				title: 'schedule',

				schedule: {
					component: 'select',
					text: 'activate',
					id: 'activate',

					options: [{
						text: 'disabled',
						value: 'disabled'
					}, {
						text: 'sunsetToSunrise',
						value: 'sunset_to_sunrise'
					}, {
						text: 'systemPeferenceDark',
						value: 'system_peference_dark'
					}, {
						text: 'systemPeferenceLight',
						value: 'system_peference_light'
					}],
					onchange: function () {
						setTimeout(() => {
						extension.features.bluelight();
						extension.features.dim();
						}, 100);
					},
				},
				schedule_time_from: {
					component: 'time',
					text: 'timeFrom',
					variant: 'from',
					hour12: function () {
						return satus.storage.get('use_24_hour_format') === false;
					},
					onchange: function () {
						setTimeout(() => {
						extension.features.bluelight();
						extension.features.dim();
						}, 100);
					},
				},
				schedule_time_to: {
					component: 'time',
					text: 'timeTo',
					variant: 'to',
					hour12: function () {
						return satus.storage.get('use_24_hour_format') === false;
					},
					onchange: function () {
						setTimeout(() => {
						extension.features.bluelight();
						extension.features.dim();
						}, 100);
					},
				}
			}
		}
	},

	svg: {
		component: 'svg',
		attr: {
			'viewBox': '0 0 24 24',
			'fill': 'none',
			'stroke-linecap': 'round',
			'stroke-linejoin': 'round',
			'stroke-width': '1.75'
		},

		path1: {
			component: 'path',
			attr: {
				'd': 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'
			}
		}
	},
	label: {
		component: 'span',
		text: 'nightMode'
	}
};