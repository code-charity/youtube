Menu.main.section.themes = {
    type: 'folder',
    icon: '<svg viewBox="0 0 24 24"><path d="M12 22a10 10 0 0 1 0-20c5.5 0 10 4 10 9a6 6 0 0 1-6 6h-1.8c-.2 0-.5.2-.5.5 0 .1 0 .2.2.3.4.5.6 1 .6 1.7 0 1.4-1.1 2.5-2.5 2.5zm0-18a8 8 0 0 0 0 16c.3 0 .5-.2.5-.5l-.1-.3c-.5-.5-.7-1.1-.7-1.7 0-1.4 1.1-2.5 2.5-2.5H16a4 4 0 0 0 4-4c0-3.9-3.6-7-8-7z"/><circle cx="6.5" cy="11.5" r="1.5"/><circle cx="9.5" cy="7.5" r="1.5"/><circle cx="14.5" cy="7.5" r="1.5"/><circle cx="17.5" cy="11.5" r="1.5"></svg>',

    filters: {
        type: 'section',

        filters: {
            type: 'folder',
            label: 'filters',

            section: {
                type: 'section',

                bluelight: {
                    type: 'slider',
                    step: 1,
                    max: 90,
                    value: 0
                },
                dim: {
                    type: 'slider',
                    step: 1,
                    max: 90,
                    value: 0
                }
            }
        },
        schedule: {
            type: 'folder',

            section: {
                type: 'section',
                
                schedule: {
                    type: 'select',

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
        }
    },

    default_dark_theme: {
        type: 'switch',
        label: 'darkTheme',
        class: ['satus-switch--dark'],

        onchange: function(name, value, component) {
            if (value == 'true') {
                let themes = component.parentNode.querySelectorAll('.satus-switch[data-value="true"]');

                for (let i = 0, l = themes.length; i < l; i++) {
                    if (themes[i] !== component) {
                        themes[i].click();
                    }
                }
            }
        }
    },
    night_theme: {
        type: 'switch',
        label: 'night',
        class: ['satus-switch--night'],

        onchange: function(name, value, component) {
            if (value == 'true') {
                let themes = component.parentNode.querySelectorAll('.satus-switch[data-value="true"]');

                for (let i = 0, l = themes.length; i < l; i++) {
                    if (themes[i] !== component) {
                        themes[i].click();
                    }
                }
            }
        }
    },
    dawn_theme: {
        type: 'switch',
        label: 'dawn',
        class: ['satus-switch--dawn'],

        onchange: function(name, value, component) {
            if (value == 'true') {
                let themes = component.parentNode.querySelectorAll('.satus-switch[data-value="true"]');

                for (let i = 0, l = themes.length; i < l; i++) {
                    if (themes[i] !== component) {
                        themes[i].click();
                    }
                }
            }
        }
    },
    sunset_theme: {
        type: 'switch',
        label: 'sunset',
        class: ['satus-switch--sunset'],

        onchange: function(name, value, component) {
            if (value == 'true') {
                let themes = component.parentNode.querySelectorAll('.satus-switch[data-value="true"]');

                for (let i = 0, l = themes.length; i < l; i++) {
                    if (themes[i] !== component) {
                        themes[i].click();
                    }
                }
            }
        }
    },
    desert_theme: {
        type: 'switch',
        label: 'desert',
        class: ['satus-switch--desert'],

        onchange: function(name, value, component) {
            if (value == 'true') {
                let themes = component.parentNode.querySelectorAll('.satus-switch[data-value="true"]');

                for (let i = 0, l = themes.length; i < l; i++) {
                    if (themes[i] !== component) {
                        themes[i].click();
                    }
                }
            }
        }
    },
    plain_theme: {
        type: 'switch',
        label: 'plain',
        class: ['satus-switch--plain'],

        onchange: function(name, value, component) {
            if (value == 'true') {
                let themes = component.parentNode.querySelectorAll('.satus-switch[data-value="true"]');

                for (let i = 0, l = themes.length; i < l; i++) {
                    if (themes[i] !== component) {
                        themes[i].click();
                    }
                }
            }
        }
    },
    black_theme: {
        type: 'switch',
        label: 'black',
        class: ['satus-switch--black'],

        onchange: function(name, value, component) {
            if (value == 'true') {
                let themes = component.parentNode.querySelectorAll('.satus-switch[data-value="true"]');

                for (let i = 0, l = themes.length; i < l; i++) {
                    if (themes[i] !== component) {
                        themes[i].click();
                    }
                }
            }
        }
    }
};