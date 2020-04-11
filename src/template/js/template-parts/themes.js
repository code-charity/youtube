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
        }
    },

    default_dark_theme: {
        type: 'switch',
        label: 'dark',
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