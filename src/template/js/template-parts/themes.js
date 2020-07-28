function themePopupChange() {
    if (Satus.storage.get('red_popup_theme') === true) {
        document.documentElement.setAttribute('popup-theme', 'red');
    } else {
        document.documentElement.removeAttribute('popup-theme');
    }
}

function themeChange(event) {
    if (event.target.checked) {
        let themes = document.querySelectorAll('.satus-switch > input:checked:not([data-storage-key="red_popup_theme"])');

        for (let i = 0, l = themes.length; i < l; i++) {
            if (themes[i] !== event.target) {
                themes[i].click();
            }
        }
    }
    
    if (Satus.storage.get('default_dark_theme') === true) {
        document.documentElement.setAttribute('theme', 'dark');
    } else if (Satus.storage.get('night_theme') === true) {
        document.documentElement.setAttribute('theme', 'night');
    } else if (Satus.storage.get('dawn_theme') === true) {
        document.documentElement.setAttribute('theme', 'dawn');
    } else if (Satus.storage.get('sunset_theme') === true) {
        document.documentElement.setAttribute('theme', 'sunset');
    } else if (Satus.storage.get('desert_theme') === true) {
        document.documentElement.setAttribute('theme', 'desert');
    } else if (Satus.storage.get('plain_theme') === true) {
        document.documentElement.setAttribute('theme', 'plain');
    } else if (Satus.storage.get('black_theme') === true) {
        document.documentElement.setAttribute('theme', 'black');
    } else {
        document.documentElement.removeAttribute('theme');
    }
}


Menu.main.section.themes = {
    type: 'folder',
    before: '<svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>',
    label: 'themes',
    class: 'satus-folder--themes',
    appearanceId: 'themes',

    section: {
        type: 'section',

        my_colors: {
            type: 'folder',
            label: 'myColors',

            section: {
                type: 'section',

                theme_my_colors: {
                    type: 'switch',
                    label: 'activate'
                }
            },

            section2: {
                type: 'section',

                theme_primary_color: {
                    type: 'color-picker',
                    label: 'primaryColor',
                    value: 'rgba(200,200,200)'
                },
                theme_text_color: {
                    type: 'color-picker',
                    label: 'textColor',
                    value: 'rgba(25,25,25)'
                }
            }
        },
        filters: {
            type: 'folder',
            label: 'filters',

            section: {
                type: 'section',

                bluelight: {
                    type: 'slider',
                    label: 'bluelight',
                    step: 1,
                    max: 90,
                    value: 0
                },
                dim: {
                    type: 'slider',
                    label: 'dim',
                    step: 1,
                    max: 90,
                    value: 0
                }
            }
        },
        schedule: {
            type: 'folder',
            label: 'schedule',

            section: {
                type: 'section',

                schedule: {
                    type: 'select',
                    label: 'schedule',

                    options: [{
                        label: 'disabled',
                        value: 'disabled'
                    }, {
                        label: 'sunsetToSunrise',
                        value: 'sunset_to_sunrise'
                    }, {
                        label: 'systemPeferenceDark',
                        value: 'system_peference_dark'
                    }, {
                        label: 'systemPeferenceLight',
                        value: 'system_peference_light'
                    }]
                },
                schedule_time_from: {
                    type: 'select',
                    label: 'timeFrom',
                    options: [{
                        label: '00:00',
                        value: '00:00'
                    }, {
                        label: '01:00',
                        value: '01:00'
                    }, {
                        label: '02:00',
                        value: '02:00'
                    }, {
                        label: '03:00',
                        value: '03:00'
                    }, {
                        label: '04:00',
                        value: '04:00'
                    }, {
                        label: '05:00',
                        value: '05:00'
                    }, {
                        label: '06:00',
                        value: '06:00'
                    }, {
                        label: '07:00',
                        value: '07:00'
                    }, {
                        label: '08:00',
                        value: '08:00'
                    }, {
                        label: '09:00',
                        value: '09:00'
                    }, {
                        label: '10:00',
                        value: '10:00'
                    }, {
                        label: '11:00',
                        value: '11:00'
                    }, {
                        label: '12:00',
                        value: '12:00'
                    }, {
                        label: '13:00',
                        value: '13:00'
                    }, {
                        label: '14:00',
                        value: '14:00'
                    }, {
                        label: '15:00',
                        value: '15:00'
                    }, {
                        label: '16:00',
                        value: '16:00'
                    }, {
                        label: '17:00',
                        value: '17:00'
                    }, {
                        label: '18:00',
                        value: '18:00'
                    }, {
                        label: '19:00',
                        value: '19:00'
                    }, {
                        label: '20:00',
                        value: '20:00'
                    }, {
                        label: '21:00',
                        value: '21:00'
                    }, {
                        label: '22:00',
                        value: '22:00'
                    }, {
                        label: '23:00',
                        value: '23:00'
                    }]
                },
                schedule_time_to: {
                    type: 'select',
                    label: 'timeTo',
                    options: [{
                        label: '00:00',
                        value: '00:00'
                    }, {
                        label: '01:00',
                        value: '01:00'
                    }, {
                        label: '02:00',
                        value: '02:00'
                    }, {
                        label: '03:00',
                        value: '03:00'
                    }, {
                        label: '04:00',
                        value: '04:00'
                    }, {
                        label: '05:00',
                        value: '05:00'
                    }, {
                        label: '06:00',
                        value: '06:00'
                    }, {
                        label: '07:00',
                        value: '07:00'
                    }, {
                        label: '08:00',
                        value: '08:00'
                    }, {
                        label: '09:00',
                        value: '09:00'
                    }, {
                        label: '10:00',
                        value: '10:00'
                    }, {
                        label: '11:00',
                        value: '11:00'
                    }, {
                        label: '12:00',
                        value: '12:00'
                    }, {
                        label: '13:00',
                        value: '13:00'
                    }, {
                        label: '14:00',
                        value: '14:00'
                    }, {
                        label: '15:00',
                        value: '15:00'
                    }, {
                        label: '16:00',
                        value: '16:00'
                    }, {
                        label: '17:00',
                        value: '17:00'
                    }, {
                        label: '18:00',
                        value: '18:00'
                    }, {
                        label: '19:00',
                        value: '19:00'
                    }, {
                        label: '20:00',
                        value: '20:00'
                    }, {
                        label: '21:00',
                        value: '21:00'
                    }, {
                        label: '22:00',
                        value: '22:00'
                    }, {
                        label: '23:00',
                        value: '23:00'
                    }]
                }
            }
        },
        font: {
            type: 'select',
            label: 'font',
            options: [{
                label: 'Roboto',
                value: 'Roboto'
            }, {
                label: 'Open Sans',
                value: 'Open+Sans'
            }, {
                label: 'Lato',
                value: 'Lato'
            }, {
                label: 'Montserrat',
                value: 'Montserrat'
            }, {
                label: 'Source Sans Pro',
                value: 'Source+Sans+Pro'
            }, {
                label: 'Roboto Condensed',
                value: 'Roboto+Condensed'
            }, {
                label: 'Oswald',
                value: 'Oswald'
            }, {
                label: 'Comfortaa',
                value: 'Comfortaa'
            }, {
                label: 'Roboto Mono',
                value: 'Roboto+Mono'
            }, {
                label: 'Raleway',
                value: 'Raleway'
            }, {
                label: 'Poppins',
                value: 'Poppins'
            }, {
                label: 'Noto Sans',
                value: 'Noto+Sans'
            }, {
                label: 'Roboto Slab',
                value: 'Roboto+Slab'
            }, {
                label: 'Marriweather',
                value: 'Marriweather'
            }, {
                label: 'PT Sans',
                value: 'PT+Sans'
            }]
        }
    },
    
    popup_title: {
        type: 'text',
        label: 'ImprovedTube',
        style: {
            margin: '0 12px',
            fontWeight: '700'
        }
    },
    red_popup_theme: {
        type: 'switch',
        label: 'Red',
        value: true,
        class: 'satus-switch--red',
        style: {
            background: '#bb1a1a'
        },

        onchange: themePopupChange
    },
    
    youtube_title: {
        type: 'text',
        label: 'YouTube',
        style: {
            margin: '0 12px',
            fontWeight: '700'
        }
    },
    default_dark_theme: {
        type: 'switch',
        label: 'dark',
        class: 'satus-switch--dark',

        onchange: themeChange
    },
    night_theme: {
        type: 'switch',
        label: 'night',
        class: 'satus-switch--night',

        onchange: themeChange
    },
    dawn_theme: {
        type: 'switch',
        label: 'dawn',
        class: 'satus-switch--dawn',

        onchange: themeChange
    },
    sunset_theme: {
        type: 'switch',
        label: 'sunset',
        class: 'satus-switch--sunset',

        onchange: themeChange
    },
    desert_theme: {
        type: 'switch',
        label: 'desert',
        class: 'satus-switch--desert',

        onchange: themeChange
    },
    plain_theme: {
        type: 'switch',
        label: 'plain',
        class: 'satus-switch--plain',

        onchange: themeChange
    },
    black_theme: {
        type: 'switch',
        label: 'black',
        class: 'satus-switch--black',

        onchange: themeChange
    }
};
