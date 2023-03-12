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

						theme_primary_color: {
							component: 'color-picker',
							text: 'primaryColor',
							value: [200, 200, 200]
						},

				scroll_bar: {
					component: 'select',
					text: 'scrollBar',
					options: [{
						text: 'default',
						value: 'default'
					}, {
						text: 'hidden',
						value: 'hidden'
					}]
				},
				font: {
					component: 'select',
					text: 'font',
					options: [{
						text: 'default',
						value: 'Default'
					}, {
						text: 'Comfortaa',
						value: 'Comfortaa'
					}, {
						text: 'Lato',
						value: 'Lato'
					}, {
						text: 'Marriweather',
						value: 'Marriweather'
					}, {
						text: 'Montserrat',
						value: 'Montserrat'
					}, {
						text: 'Noto Sans',
						value: 'Noto+Sans'
					}, {
						text: 'Open Sans',
						value: 'Open+Sans'
					}, {
						text: 'Oswald',
						value: 'Oswald'
					}, {
						text: 'Poppins',
						value: 'Poppins'
					}, {
						text: 'PT Sans',
						value: 'PT+Sans'
					}, {
						text: 'Raleway',
						value: 'Raleway'
					}, {
						text: 'Roboto Condensed',
						value: 'Roboto+Condensed'
					}, {
						text: 'Roboto Mono',
						value: 'Roboto+Mono'
					}, {
						text: 'Roboto Slab',
						value: 'Roboto+Slab'
					}, {
						text: 'Source Sans Pro',
						value: 'Source+Sans+Pro'
					}]
				},
				theme_text_color: {
							component: 'color-picker',
							text: 'textColor',
							value: [25, 25, 25]
						},


					}
				}
			}
		}
	},
	default: {
		component: 'label',
		variant: 'default-theme',
		text: 'default',

		radio: {
			component: 'radio',
			group: 'theme',
			value: 'default',
			checked: true
		}
	},
	dark: {
		component: 'label',
		variant: 'dark-theme',
		text: 'dark',

		radio: {
			component: 'radio',
			group: 'theme',
			value: 'dark'
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
	desert: {
		component: 'label',
		variant: 'desert-theme',
		text: 'desert',

		radio: {
			component: 'radio',
			group: 'theme',
			value: 'desert'
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
	black: {
		component: 'label',
		variant: 'black-theme',
		text: 'black',

		radio: {
			component: 'radio',
			group: 'theme',
			value: 'black'
		}
	}
};