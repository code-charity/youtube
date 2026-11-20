/*--------------------------------------------------------------
>>> SERIES GAPS
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.playlist.on.click.section_series_gap = {
	component: 'section',
	variant: 'card',
	title: 'seriesGap',

	playlist_series_gap: {
		component: 'switch',
		text: 'seriesGapButton',
		tags: 'series,episode,gap,missing,duplicate,playlist,season'
	},

	playlist_series_gap_minimum: {
		component: 'slider',
		variant: 'row',
		text: 'minimumNumberedTitles',
		min: 2,
		max: 20,
		step: 1,
		value: 3
	}
};
