/*--------------------------------------------------------------
>>> PLAYLIST
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.playlist = {
	component: 'button',
	variant: 'playlist',
	category: true,
	on: {
		click: {
			section: {
				component: 'section',
				variant: 'card',

				playlist_autoplay: {
					component: 'switch',
					text: 'autoplay',
					value: true
				},
				playlist_up_next_autoplay: {
					component: 'switch',
					text: 'upNextAutoplay',
					value: true
				}
			},
			section2: {
				component: 'section',
				variant: 'card',

				playlist_reverse: {
					component: 'switch',
					text: 'reverse'
				},
				playlist_repeat: {
					component: 'switch',
					text: 'repeat'
				},
				playlist_shuffle: {
					component: 'switch',
					text: 'shuffle'
				},
				playlist_popup: {
					component: 'switch',
					text: 'popupPlayer'
				},
				playlist_copy_video_id: {
					component: 'switch',
					id: 'playlist-copy-video-id',
					text: 'copyVideoId'
				},
				playlist_copy_video_url: {
					component: 'switch',
					text: 'copyVideoUrl',
					value: false
				}
			},
			section3: {
				component: 'section',
				variant: 'card',

				playlist_quick_delete_shortcut: {
					component: 'switch',
					text: 'quickDeleteShortcut'
				},
				playlist_bulk_delete_by_progress: {
					component: 'switch',
					text: 'bulkDeleteByProgress'
				}
			}
		}
	},

	icon: {
		component: 'span',

		svg: {
			component: 'svg',
			attr: {
				viewBox: '0 0 24 24',
				fill: 'transparent',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.75'
			},

			path: {
				component: 'path',
				attr: {
					d: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'
				}
			}
		}
	},
	label: {
		component: 'span',
		text: 'playlist'
	}
};