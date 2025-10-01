/*--------------------------------------------------------------
>>> CHANNEL
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.channel = {
	component: 'button',
	variant: 'channel',
	category: true,
	on: {
		click: {
			component: 'section',
			variant: 'card',

			channel_default_tab: {
				component: 'select',
				text: 'defaultChannelTab',
				options: [{
					text: 'home',
					value: '/'
				}, {
					text: 'videos',
					value: '/videos'
				}, {
					text: 'shorts',
					value: '/shorts'
				}, {
					text: 'playlists',
					value: '/playlists'
				}, {
					text: 'community',
					value: '/community'
				}, {
					text: 'channels',
					value: '/channels'
				}, {
					text: 'about',
					value: '/about'
				}]
			},
			channel_trailer_autoplay: {
				component: 'switch',
				text: 'trailerAutoplay',
				value: true
			},
			channel_play_all_button: {
				component: 'switch',
				text: 'playAllButton'
			},
			exclude_shorts_in_play_all: {
				component: 'switch',
				text: 'excludeShortsInPlayAll',
				value: true
			  },
			channel_hide_featured_content: {
				component: 'switch',
				text: 'hideFeaturedContent'
			},
			channel_compact_theme: {
				component: 'switch',
				text: 'compactTheme'
			}
		}
	},

	icon: {
		component: 'span',

		svg: {
			component: 'svg',
			attr: {
				'viewBox': '0 0 24 24',
				'fill': 'transparent',
				'stroke': 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.75'
			},

			rect: {
				component: 'rect',
				attr: {
					'width': '20',
					'height': '15',
					'x': '2',
					'y': '7',
					'rx': '2',
					'ry': '2'
				}
			},
			path: {
				component: 'path',
				attr: {
					'd': 'M17 2l-5 5-5-5'
				}
			}
		}
	},
	label: {
		component: 'span',
		text: 'channel'
	}
};