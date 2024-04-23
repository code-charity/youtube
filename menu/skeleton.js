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

extension.skeleton = {
    component: 'base'
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
            text: 'ImprovedTube' // Static title
        }
    },
    sectionEnd: {
        component: 'section',
        variant: 'align-end',

        darkLightSwitch: {
            component: 'button',
            variant: 'icon',
            // Dummy function for click event
            on: {
                click: function() {
                    console.log('Toggle dark/light mode');
                }
            },

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
                }
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

                path0: {
                    component: 'path',
                    attr: {
                        d: 'M23,15 A11,11 0 0,1 9,1'
                    }
                },
                path1: {
                    component: 'path',
                    attr: {
                        d: 'M9,1 A11,11 0 1,0 23,15'
                    }
                }
            }
        },
        search: {
            component: 'button',
            variant: 'icon',
            // Dummy function for click event
            on: {
                click: function() {
                    console.log('Search clicked');
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
            // Dummy function for click event
            on: {
                click: function() {
                    console.log('Menu clicked');
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
            open: function() {
                // Dummy function
                console.log('Layer opened');
            }
        },

        section: {
            component: 'section',
            variant: function() {
                // Dummy logic for variant
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
                'src': 'https://improvedtube.com/wishes',
                'style': 'border: none; bottom: 0px; overflow: hidden; width:100%; height:100%;'
            }
        }
    }
};
