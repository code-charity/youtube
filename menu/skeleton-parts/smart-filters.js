/*--------------------------------------------------------------
>>> SMART FILTERS
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.general.on.click.section_smart_filters = {
	component: 'section',
	variant: 'card',
	title: 'smartFilters',

	smart_filters: {
		component: 'switch',
		text: 'smartFiltersEnable',
		tags: 'filter,keyword,duration,hide,rows,search'
	},

	smart_filter_keywords: {
		component: 'text-field',
		text: 'smartFilterKeywords',
		storage: 'smart_filter_keywords',
		placeholder: 'comma,separated,words',
		rows: 1,
		lineNumbers: false
	},

	smart_filter_duration: {
		component: 'select',
		text: 'smartFilterDuration',
		options: [
			{ text: 'anyDuration', value: 'any' },
			{ text: 'underFourMinutes', value: 'short' },
			{ text: 'fourToTwentyMinutes', value: 'medium' },
			{ text: 'overTwentyMinutes', value: 'long' }
		]
	}
};
