Satus.storage.import(function() {
    var language = Satus.storage.get('language') || 'en';

    if (!Satus.storage.get('language')) {
        var dialog = {
            type: 'dialog',
            class: 'satus-dialog--setup satus-dialog--setup-language',

            en: {
                type: 'button',
                label: 'English'
            },
            ar: {
                type: 'button',
                label: 'العربية'
            },
            de: {
                type: 'button',
                label: 'Deutsch'
            },
            es: {
                type: 'button',
                label: 'Español'
            },
            fr: {
                type: 'button',
                label: 'Français'
            },
            id: {
                type: 'button',
                label: 'Bahasa Indonesia'
            },
            it: {
                type: 'button',
                label: 'Italiano'
            },
            ja: {
                type: 'button',
                label: '日本語'
            },
            nl: {
                type: 'button',
                label: 'Dutch'
            },
            no: {
                type: 'button',
                label: 'Norwegian Bokmål'
            },
            pt_BR: {
                type: 'button',
                label: 'Português (Brasil)'
            },
            ru: {
                type: 'button',
                label: 'Русский'
            },
            tr: {
                type: 'button',
                label: 'Türkçe'
            },
            zh_CN: {
                type: 'button',
                label: '中文 (简体)'
            },
            zh_TW: {
                type: 'button',
                label: '中文 (繁體)'
            }
        };

        for (var key in dialog) {
            if (typeof dialog[key] === 'object') {
                dialog[key].dataset = {
                    key: key
                };

                dialog[key].onclick = function() {
                    Satus.storage.set('language', this.dataset.key);

                    document.querySelector('.satus-dialog--setup .satus-dialog__scrim').click();
                };
            }
        }

        Satus.render(dialog);
    }
    
    if (Satus.storage.get('red_popup_theme') === true) {
        document.documentElement.setAttribute('popup-theme', 'red');
    }
    
    if (Satus.storage.get('default_dark_theme') === true) {
        document.documentElement.setAttribute('theme', 'dark');
    }
    
    if (Satus.storage.get('night_theme') === true) {
        document.documentElement.setAttribute('theme', 'night');
    }
    
    if (Satus.storage.get('dawn_theme') === true) {
        document.documentElement.setAttribute('theme', 'dawn');
    }
    
    if (Satus.storage.get('sunset_theme') === true) {
        document.documentElement.setAttribute('theme', 'sunset');
    }
    
    if (Satus.storage.get('desert_theme') === true) {
        document.documentElement.setAttribute('theme', 'desert');
    }
    
    if (Satus.storage.get('plain_theme') === true) {
        document.documentElement.setAttribute('theme', 'plain');
    }
    
    if (Satus.storage.get('black_theme') === true) {
        document.documentElement.setAttribute('theme', 'black');
    }

    Satus.locale.import('_locales/' + language + '/messages.json', function() {
        Satus.modules.updateStorageKeys(Menu, function() {
            Satus.render(Menu, document.body);
        });
    });
});
