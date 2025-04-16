/*--------------------------------------------------------------
>>> THEMES
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.themes = {
	component: 'button',
	variant: 'themes',
	category: true,
	on: {
		click: {}
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

			path: {
				component: 'path',
				attr: {
					'd': 'M12 2.69l5.66 5.66a8 8 0 11-11.31 0z'
				}
			}
		}
	},
	label: {
		component: 'span',
		text: 'themes'
	}
};

/*--------------------------------------------------------------
# SECTION
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.themes.on.click.section = {
	component: 'section',
	variant: 'transparent-card',

	default: function () {
		return {
			component: 'label',
			variant: satus.storage.get('theme') == 'dark' ? 'dark-theme' : 'default-theme',
			text: satus.storage.get('theme') == 'dark' ? 'youtubesDark' : 'youtubesLight',
			radio: {
				component: 'radio',
				group: 'theme',
				value: satus.storage.get('theme') == 'dark' ? 'dark' : 'light',
				...(!satus.storage.get('theme') && { checked: true })
			}
		}
	},
	opposite: function () {
		return {
			component: 'label',
			variant: satus.storage.get('theme') == 'dark' ? 'default-theme' : 'dark-theme',
			text: satus.storage.get('theme') == 'dark' ? 'youtubesLight' : 'youtubesDark',
			radio: {
				component: 'radio',
				group: 'theme',
				value: satus.storage.get('theme') == 'dark' ? 'light' : 'dark',
				...(satus.storage.get('theme') == 'dark' && { checked: true })
			}
		}
	},
	custom: {
		component: 'label',
		variant: 'custom-theme',
		text: 'custom',
		radio: {
			component: 'radio',
			group: 'theme',
			value: 'custom',
			on: {
				click: {
					section: {
						component: 'section',
						variant: 'card',
						theme_primary_color: {
							component: 'color-picker',
							text: 'primaryColor',
							value: [200, 200, 200]
						},
						theme_secondary_color: {
							component: 'color-picker',
							text: 'secondaryColor',
							value: [100, 0, 0]
						},
						theme_text_color: {
							component: 'color-picker',
							text: 'textColor',
							value: [25, 25, 25]
						}
					}
				}
			}
		}
	},
	black: {
		component: 'label',
		variant: 'black-theme',
		text: 'black',
		radio: {
			component: 'radio',
			group: 'theme',
			value: 'black'
		}
	},
	plain: {
		component: 'label',
		variant: 'plain-theme',
		text: 'plain',
		radio: {
			component: 'radio',
			group: 'theme',
			value: 'plain'
		}
	},
	sunset: {
		component: 'label',
		variant: 'sunset-theme',
		text: 'sunset',
		radio: {
			component: 'radio',
			group: 'theme',
			value: 'sunset'
		}
	},
	night: {
		component: 'label',
		variant: 'night-theme',
		text: 'night',
		radio: {
			component: 'radio',
			group: 'theme',
			value: 'night'
		}
	},
	dawn: {
		component: 'label',
		variant: 'dawn-theme',
		text: 'dawn',
		radio: {
			component: 'radio',
			group: 'theme',
			value: 'dawn'
		}
	},
	desert: {
		component: 'label',
		variant: 'desert-theme',
		text: 'desert',
		radio: {
			component: 'radio',
			group: 'theme',
			value: 'desert'
		}
	}
};
