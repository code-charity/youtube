/*--------------------------------------------------------------
>>> THEMES
----------------------------------------------------------------
# Font
# Themes
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.themes = {
	component: 'button',
	variant: 'themes',
	category: true,
	on: {
		click: {
			section: {
				component: 'section',
				variant: 'card'
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
# THEMES
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.themes.on.click.section = {
	component: 'section',
	variant: 'transparent-card',

	custom: {
		component: 'label',
		variant: 'custom-theme',
		text: 'custom',

		radio: {
			component: 'radio',
			group: 'theme',
			value: 'custom',
			checked: true,
			on: {
				click: {
					section: {
						component: 'section',
						variant: 'card',
						group: 'theme',
						theme_primary_color: {
							component: 'color-picker',
							text: 'primaryColor',
							value: [200, 200, 200]
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
	default: {
		component: 'label',
		variant: 'default-theme',
		text: 'default_theme',
		radio: {
			component: 'radio',
			group: 'theme',
			value: 'default',
			checked: true
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
	},desert: {
		component: 'label',
		variant: 'desert-theme',
		text: 'desert',
		radio: {
			component: 'radio',
			group: 'theme',
			value: 'desert'
		}
	},
	dark: {
		component: 'label',
		variant: 'dark-theme',
		text: 'youtubesDark',
		radio: {
			component: 'radio',
			group: 'theme',
			value: 'dark'
		}
	},
};
