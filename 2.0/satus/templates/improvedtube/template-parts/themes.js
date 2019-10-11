Satus.prototype.menu.main.themes = {
    type: 'directory',
    icon: '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24"><path d="M12 22a10 10 0 0 1 0-20c5.5 0 10 4 10 9a6 6 0 0 1-6 6h-1.8c-.2 0-.5.2-.5.5 0 .1 0 .2.2.3.4.5.6 1 .6 1.7 0 1.4-1.1 2.5-2.5 2.5zm0-18a8 8 0 0 0 0 16c.3 0 .5-.2.5-.5l-.1-.3c-.5-.5-.7-1.1-.7-1.7 0-1.4 1.1-2.5 2.5-2.5H16a4 4 0 0 0 4-4c0-3.9-3.6-7-8-7z"/><circle cx="6.5" cy="11.5" r="1.5"/><circle cx="9.5" cy="7.5" r="1.5"/><circle cx="14.5" cy="7.5" r="1.5"/><circle cx="17.5" cy="11.5" r="1.5"></svg>',

    night_theme: {
        type: 'switch',
        label: 'night',
        class: 'night',

        onchange: function(event) {
            if (event.target.dataset.value == 'true') {
                let themes = event.target.parentNode.querySelectorAll('.satus-switch[data-value="true"]');

                for (let i = 0, l = themes.length; i < l; i++) {
                    if (themes[i] !== event.target) {
                        themes[i].click();
                    }
                }
            }
        }
    },
    dawn_theme: {
        type: 'switch',
        label: 'dawn',
        class: 'dawn',

        onchange: function(event) {
            if (event.target.dataset.value == 'true') {
                let themes = event.target.parentNode.querySelectorAll('.satus-switch[data-value="true"]');

                for (let i = 0, l = themes.length; i < l; i++) {
                    if (themes[i] !== event.target) {
                        themes[i].click();
                    }
                }
            }
        }
    },
    sunset_theme: {
        type: 'switch',
        label: 'sunset',
        class: 'sunset',

        onchange: function(event) {
            if (event.target.dataset.value == 'true') {
                let themes = event.target.parentNode.querySelectorAll('.satus-switch[data-value="true"]');

                for (let i = 0, l = themes.length; i < l; i++) {
                    if (themes[i] !== event.target) {
                        themes[i].click();
                    }
                }
            }
        }
    },
    desert_theme: {
        type: 'switch',
        label: 'desert',
        class: 'desert',

        onchange: function(event) {
            if (event.target.dataset.value == 'true') {
                let themes = event.target.parentNode.querySelectorAll('.satus-switch[data-value="true"]');

                for (let i = 0, l = themes.length; i < l; i++) {
                    if (themes[i] !== event.target) {
                        themes[i].click();
                    }
                }
            }
        }
    },
    plain_theme: {
        type: 'switch',
        label: 'plain',
        class: 'plain',

        onchange: function(event) {
            if (event.target.dataset.value == 'true') {
                let themes = event.target.parentNode.querySelectorAll('.satus-switch[data-value="true"]');

                for (let i = 0, l = themes.length; i < l; i++) {
                    if (themes[i] !== event.target) {
                        themes[i].click();
                    }
                }
            }
        }
    },
    black_theme: {
        type: 'switch',
        label: 'black',
        class: 'black',

        onchange: function(event) {
            if (event.target.dataset.value == 'true') {
                let themes = event.target.parentNode.querySelectorAll('.satus-switch[data-value="true"]');

                for (let i = 0, l = themes.length; i < l; i++) {
                    if (themes[i] !== event.target) {
                        themes[i].click();
                    }
                }
            }
        }
    }
};