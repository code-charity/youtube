/*--------------------------------------------------------------
>>> SKELETON:
----------------------------------------------------------------
# Base
# Header
# Main
--------------------------------------------------------------*/
/*--------------------------------------------------------------
# BASE
--------------------------------------------------------------*/
let extension = {
	skeleton: {
		component: 'base'
	}
};
/*--------------------------------------------------------------
# HEADER
--------------------------------------------------------------*/
extension.skeleton.header = {
	component: 'header',

	sectionStart: {
		component: 'section',
		variant: 'align-start',

		back: {
			component: 'button',
			variant: 'icon',
			attr: {
				'hidden': 'true'
			},
			on: {
				click: 'main.layers.back'
			},

			svg: {
				component: 'svg',
				attr: {
					'viewBox': '0 0 24 24',
					'stroke-width': '1.5',
					'stroke': 'currentColor',
					'fill': 'none'
				},

				path: {
					component: 'path',
					attr: {
						'd': 'M14 18l-6-6 6-6'
					}
				}
			}
		},
		title: {
			component: 'span',
			variant: 'title',
			data: {
				version: chrome.runtime.getManifest().version
			}
		}
	},
	sectionEnd: {
		component: 'section',
		variant: 'align-end',

		darkLightSwitch: {
			component: 'button',
			variant: 'icon',

			svgSun: {
				component: "svg",
				attr: {
					'viewBox': '0 0 24 24',
					'stroke': 'currentcolor',
					'stroke-linecap': 'round',
					'stroke-linejoin': 'round',
					'stroke-width': '1.25',
					'fill': 'none'
				},
				id: 'dark-light-switch-icon-sun',

				circle: {
					component: 'circle',
					attr: {
						'cx': '12',
						'cy': '12',
						'r': '5'
					}
				},
				path0: { component: 'path', attr: { d: 'M12.00 17.00 L12.00 21.00' } },
				path1: { component: 'path', attr: { d: 'M8.46 15.54 L5.64 18.36' } },
				path2: { component: 'path', attr: { d: 'M7.00 12.00 L3.00 12.00' } },
				path3: { component: 'path', attr: { d: 'M8.46 8.46 L5.64 5.64' } },
				path4: { component: 'path', attr: { d: 'M12.00 7.00 L12.00 3.00' } },
				path5: { component: 'path', attr: { d: 'M15.54 8.46 L18.36 5.64' } },
				path6: { component: 'path', attr: { d: 'M17.00 12.00 L21.00 12.00' } },
				path7: { component: 'path', attr: { d: 'M15.54 15.54 L18.36 18.36' } }
			},
			svgMoon: {
				component: "svg",
				attr: {
					'viewBox': '0 0 24 24',
					'stroke': 'currentcolor',
					'stroke-linecap': 'round',
					'stroke-linejoin': 'round',
					'stroke-width': '1.25',
					'fill': 'none'
				},
				id: 'dark-light-switch-icon-moon',

				path0: {component: 'path', attr: {d: 'M23,15 A11,11 0 0,1 9,1'}},
				path1: {component: 'path', attr: {d: 'M9,1 A11,11 0 1,0 23,15'}}

			}
		},
		search: {
			component: 'button',
			variant: 'icon',
			on: {
				render: function () {
					this.click();
				}
			},

			svg: {
				component: 'svg',
				attr: {
					'viewBox': '0 0 24 24',
					'stroke': 'currentcolor',
					'stroke-linecap': 'round',
					'stroke-linejoin': 'round',
					'stroke-width': '1.25',
					'fill': 'none'
				},

				circle: {
					component: 'circle',
					attr: {
						'cx': '11',
						'cy': '10.5',
						'r': '6'
					}
				},
				path: {
					component: 'path',
					attr: {
						'd': 'M20 20l-4-4'
					}
				}
			}
		},
		menu: {
			component: 'button',
			variant: 'icon',
			on: {
				click: {
					component: 'modal',
					variant: 'vertical-menu'
				}
			},

			svg: {
				component: 'svg',
				attr: {
					'viewBox': '0 0 24 24',
					'stroke-width': '2',
					'stroke': 'currentColor',
					'fill': 'none'
				},

				circle1: {
					component: 'circle',
					attr: {
						'cx': '12',
						'cy': '5.25',
						'r': '0.45'
					}
				},
				circle2: {
					component: 'circle',
					attr: {
						'cx': '12',
						'cy': '12',
						'r': '0.45'
					}
				},
				circle3: {
					component: 'circle',
					attr: {
						'cx': '12',
						'cy': '18.75',
						'r': '0.45'
					}
				}
			}
		}
	}
};

/*--------------------------------------------------------------
# MAIN
--------------------------------------------------------------*/
extension.skeleton.main = {
	component: 'main',

	layers: {
		component: 'layers',
		on: {
			open: function () {
				var skeleton = satus.last(this.path),
					section = this.baseProvider.skeleton.header.sectionStart,
					title = 'ImprovedTube';

				if (skeleton.parentSkeleton) {
					if (skeleton.parentSkeleton.label) {
						title = skeleton.parentSkeleton.label.text;
					} else if (skeleton.parentSkeleton.text) {
						title = skeleton.parentSkeleton.text;
					}
				}

				section.back.rendered.hidden = this.path.length <= 1;
				section.title.rendered.innerText = satus.locale.get(title);

				var vertical_menu = document.querySelector('.satus-modal--vertical-menu');

				if (vertical_menu) {
					vertical_menu.close();
				}
			}
		},

		section: {
			component: 'section',
			variant: function () {
				if (satus.storage.get('improvedtube_home') === 'list') {
					return 'card';
				}

				return 'home';
			}
		},
		frame: {
			component: 'iframe',
			class: 'frame',
			attr: {
				'src': 'https://improvedtube.com/wishes?'+ Date.now(),
				'style': 'border: none; bottom: 0px; overflow: hidden; width:326px; position: absolute; height:212px; left:-6px !important'
			}
		}
	}
};
