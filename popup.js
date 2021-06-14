/*--------------------------------------------------------------
>>> TABLE OF CONTENTS:
----------------------------------------------------------------
# Header
    # Mixer
    # Settings
    # Active features
# Main
    # General
    # Appearance
    # Themes
    # Player
    # Playlist
    # Channel
    # Shortcuts
    # Blacklist
    # Analyzer
# Export data
# Import data
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# HEADER
--------------------------------------------------------------*/

var skeleton = {
    header: {
        type: 'header',

        section_start: {
            type: 'section',
            class: 'satus-section--align-start',

            button_back: {
                type: 'button',
                class: 'satus-button--back',
                before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M14 18l-6-6 6-6"/></svg>',
                onclick: function () {
                    if (document.querySelector('.satus-dialog__scrim')) {
                        document.querySelector('.satus-dialog__scrim').click();
                    } else {
                        document.querySelector('.satus-main').back();
                    }
                }
            },
            title: {
                type: 'text',
                class: 'satus-text--title',
                innerText: 'ImprovedTube',
                dataset: {
                    version: chrome && chrome.runtime && chrome.runtime.getManifest ? chrome.runtime.getManifest().version : ''
                }
            }
        },
        section_end: {
            type: 'section',
            class: 'satus-section--align-end',

            search_field: {
                type: 'text-field',
                class: 'search-field',
                placeholder: 'search',
                autofocus: true,
                oninput: function (event) {
                    var value = this.value.trim();

                    if (value.length > 0) {
                        satus.search(value, skeleton, function (results) {
                            var parent = document.querySelector('.search-results .satus-scrollbar__content'),
                                skeleton = {
                                    type: 'dialog',
                                    class: 'search-results'
                                };

                            for (var key in results) {
                                results[key].type = 'section';

                                skeleton[key + '_label'] = {
                                    type: 'text',
                                    class: 'satus-section--label',
                                    label: key
                                };

                                skeleton[key] = results[key];
                            }

                            if (Object.keys(results).length === 0) {
                                if (parent) {
                                    document.querySelector('.search-results').remove();
                                }
                            } else {
                                if (parent) {
                                    while (parent.children[0]) {
                                        parent.children[0].remove();
                                    }

                                    satus.render(results, parent);
                                } else {
                                    satus.render(skeleton);

                                    document.querySelector('.search-results .satus-dialog__scrim').addEventListener('click', function () {
                                        document.body.dataset.search = false;
                                    });
                                }
                            }
                        }, true);
                    } else {
                        var results = document.querySelector('.search-results');

                        if (results) {
                            results.close();
                        }
                    }
                },
                onblur: function () {
                    if (this.value.length === 0) {
                        document.body.dataset.search = false;
                    }
                },
                onkeydown: function (event) {
                    var value = this.value,
                        key = event.key;

                    setTimeout(function () {
                        if (value.length === 0 && key === 'Backspace') {
                            var results = document.querySelector('.search-results');

                            if (results) {
                                results.close();
                            }

                            document.body.dataset.search = false;
                        }
                    });
                }
            },
            search_close: {
                type: 'button',
                class: 'satus-button--close-search',
                before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
                onclick: function () {
                    var results = document.querySelector('.search-results');

                    if (results) {
                        results.close();
                    }

                    document.body.dataset.search = false;
                }
            },
            button_search: {
                type: 'button',
                class: 'search-button',
                icon: '<svg stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" viewBox="0 0 24 24"><circle cx="11" cy="10.5" r="6" fill="none"/><path d="M20 20l-4-4"/></svg>',
                onclick: function () {
                    var search_field = document.querySelector('.search-field');

                    search_field.value = '';

                    document.body.dataset.search = true;

                    setTimeout(function () {
                        search_field.focus();
                    });
                }
            },
            button_vert: {
                type: 'button',
                class: 'vert-button',
                icon: '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="5.25" r="0.45"/><circle cx="12" cy="12" r="0.45"/><circle cx="12" cy="18.75" r="0.45"/></svg>',
                onClickRender: {
                    type: 'dialog',
                    class: 'satus-dialog--vertical-menu'
                }
            }
        }
    }
};

window.addEventListener('keypress', function (event) {
    if (
        document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 ||
        event.target.isContentEditable ||
        document.querySelector('.satus-dialog')
    ) {
        return false;
    }

    if (event.key === 'f' && document.body.dataset.search === 'false') {
        var search_field = document.querySelector('.search-field');

        search_field.value = '';

        document.body.dataset.search = true;

        setTimeout(function () {
            search_field.focus();
        });
    }
});


/*--------------------------------------------------------------
# ACTIVE FEATURES
--------------------------------------------------------------*/

skeleton.header.section_end.button_vert.onClickRender.active_features = {
    type: 'folder',
    before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
    label: 'activeFeatures',
    onclick: function () {
        document.querySelector('.satus-dialog__scrim').click();
    },

    section: {
        type: 'section',
        onrender: function () {
            var component = this,
                new_menu = {},
                storage = satus.storage;

            function search(string, object, parent) {
                var result = [],
                    label = parent || '';

                for (var i in object) {
                    if (object.type === 'folder') {
                        label = object.label;
                    }

                    if (object[i].type) {
                        if (object[i].type.match(/(button|select|shortcut|slider|switch)/)) {
                            if (string === i || (object[i].tags && object[i].tags.indexOf(string) !== -1)) {
                                if (object[i].type.indexOf('button') === -1 || !object[i].label) {
                                    if (!satus.isset(object[i].value) && satus.storage[string] !== false && object[i].type !== 'select' || satus.isset(object[i].value) && satus.storage[string] != object[i].value && (object[i].type === 'select' ? object[i].options[0].value !== satus.storage[i] : true)) {
                                        if (!new_menu[label]) {
                                            new_menu[label + '__label'] = {
                                                type: 'text',
                                                class: 'satus-section--label',
                                                label: label
                                            };

                                            new_menu[label] = {
                                                type: 'section'
                                            };
                                        }

                                        new_menu[label][i] = object[i];
                                    }
                                }
                            }

                        } else {
                            var response = search(string, object[i], label);

                            if (response.length > 0) {
                                for (var j = 0, l = response.length; j < l; j++) {
                                    result.push(response[i]);
                                }
                            }
                        }
                    }
                }

                return result;
            }

            for (var key in storage) {
                search(key, skeleton)
            }

            setTimeout(function () {
                if (Object.keys(new_menu).length > 0) {
                    satus.render(new_menu, component. parentNode);

                    component.remove();
                } else {
                    satus.render({
                        text: {
                            type: 'text',
                            label: 'noActiveFeatures'
                        }
                    }, component);
                }
            });
        }
    }
};


/*--------------------------------------------------------------
# SETTINGS
--------------------------------------------------------------*/

skeleton.header.section_end.button_vert.onClickRender.settings = {
    type: 'folder',
    before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    label: 'settings',
    parent: '.satus-main__container',
    onclick: function () {
        document.querySelector('.satus-dialog__scrim').click();
    },

    section: {
        type: 'section',

        developer_options: {
            type: 'folder',
            before: '<svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
            label: 'developerOptions',

            custom_js_section_label: {
                type: 'text',
                class: 'satus-section--label',
                label: 'customJs'
            },

            custom_js_section: {
                type: 'section',
                custom_js: {
                    type: 'text-field',
                    onrender: function () {
                        this.value = satus.storage.get('custom_js') || '';
                    },
                    oninput: function () {
                        satus.storage.set('custom_js', this.value);
                    }
                }
            },

            custom_css_section_label: {
                type: 'text',
                class: 'satus-section--label',
                label: 'customCss'
            },

            custom_css_section: {
                type: 'section',
                custom_css: {
                    type: 'text-field',
                    onrender: function () {
                        this.value = satus.storage.get('custom_css') || '';
                    },
                    oninput: function () {
                        satus.storage.set('custom_css', this.value);
                    }
                }
            },

            /*translations_section_label: {
                type: 'text',
                class: 'satus-section--label',
                label: 'translations'
            },

            translations_section: {
                type: 'section',
                onrender: function() {
                    satus.search('language', skeleton, function(result) {
                        var languages = result.language.options;

                        for (var i = 0, l = languages.length; i < l; i++) {

                        }
                    })
                }
            }*/
        },
    },

    section0: {
        type: 'section',

        appearance: {
            type: 'folder',
            before: '<svg viewBox="0 0 24 24"><path d="M7 16c.6 0 1 .5 1 1a2 2 0 0 1-2 2h-.5a4 4 0 0 0 .5-2c0-.6.5-1 1-1M18.7 3a1 1 0 0 0-.7.3l-9 9 2.8 2.7 9-9c.3-.4.3-1 0-1.4l-1.4-1.3a1 1 0 0 0-.7-.3zM7 14a3 3 0 0 0-3 3c0 1.3-1.2 2-2 2 1 1.2 2.5 2 4 2a4 4 0 0 0 4-4 3 3 0 0 0-3-3z" /></svg>',
            label: 'appearance',

            general: {
                type: 'section',
                label: 'general',

                header: {
                    type: 'folder',
                    label: 'header',

                    section: {
                        type: 'section',

                        title_version: {
                            type: 'switch',
                            label: 'version'
                        }
                    }
                },
                home: {
                    type: 'folder',
                    label: 'home',

                    section: {
                        type: 'section',

                        improvedtube_home: {
                            type: 'select',
                            label: 'style',
                            options: [{
                                label: 'bubbles',
                                value: 'bubbles'
                            }, {
                                label: 'list',
                                value: 'list'
                            }]
                        }
                    },

                    categories: {
                        type: 'section',
                        label: 'categories',

                        it_general: {
                            type: 'switch',
                            label: 'general',
                            value: true
                        },
                        it_appearance: {
                            type: 'switch',
                            label: 'appearance',
                            value: true
                        },
                        it_themes: {
                            type: 'switch',
                            label: 'themes',
                            value: true
                        },
                        it_player: {
                            type: 'switch',
                            label: 'player',
                            value: true
                        },
                        it_playlist: {
                            type: 'switch',
                            label: 'playlist',
                            value: true
                        },
                        it_channel: {
                            type: 'switch',
                            label: 'channel',
                            value: true
                        },
                        it_shortcuts: {
                            type: 'switch',
                            label: 'shortcuts',
                            value: true
                        },
                        it_mixer: {
                            type: 'switch',
                            label: 'mixer',
                            value: true
                        },
                        it_analyzer: {
                            type: 'switch',
                            label: 'analyzer',
                            value: true
                        },
                        it_blacklist: {
                            type: 'switch',
                            label: 'blacklist',
                            value: true
                        }
                    }
                }
            },
            icons: {
                type: 'section',
                label: 'icons',

                improvedtube_youtube_icon: {
                    label: 'improvedtubeIconOnYoutube',
                    type: 'select',
                    options: [{
                        label: 'disabled',
                        value: 'disabled'
                    }, {
                        label: 'youtubeHeaderLeft',
                        value: 'header_left'
                    }, {
                        label: 'youtubeHeaderRight',
                        value: 'header_right'
                    }, {
                        label: 'draggable',
                        value: 'draggable'
                    }, {
                        label: 'belowPlayer',
                        value: 'below_player'
                    }]
                },
                improvedtube_browser_icon: {
                    label: 'improvedtubeIconInBrowser',
                    type: 'select',

                    options: [{
                        label: 'onlyActiveOnYoutube',
                        value: 'youtube'
                    }, {
                        label: 'alwaysActive',
                        value: 'always'
                    }]
                }
            }
        },
        languages: {
            type: 'folder',
            before: '<svg viewBox="0 0 24 24"><path d="M12.9 15l-2.6-2.4c1.8-2 3-4.2 3.8-6.6H17V4h-7V2H8v2H1v2h11.2c-.7 2-1.8 3.8-3.2 5.3-1-1-1.7-2.1-2.3-3.3h-2c.7 1.6 1.7 3.2 3 4.6l-5.1 5L4 19l5-5 3.1 3.1.8-2zm5.6-5h-2L12 22h2l1.1-3H20l1.1 3h2l-4.5-12zm-2.6 7l1.6-4.3 1.6 4.3H16z" /></svg>',
            label: 'languages',

            section: {
                type: 'section',

                language: {
                    label: 'improvedtubeLanguage',
                    type: 'select',
                    onchange: function (name, value) {
                        satus.memory.set('locale', {});

                        satus.locale(function () {
                            document.querySelector('.satus-main__container').innerHTML = '';

                            document.querySelector('.satus-header__title').innerText = satus.locale.getMessage('languages');
                            document.querySelector('#search').placeholder = satus.locale.getMessage('search');

                            satus.render(document.querySelector('.satus-main__container'), skeleton.main.section.settings.section.languages);
                        });
                    },
                    options: [{
                        value: 'en',
                        label: 'English'
                    }, {
                        value: 'ko',
                        label: '한국어'
                    }, {
                        value: 'es',
                        label: 'Español (España)'
                    }, {
                        value: 'ru',
                        label: 'Русский'
                    }, {
                        value: 'de',
                        label: 'Deutsch'
                    }, {
                        value: 'zh_TW',
                        label: '中文 (繁體)'
                    }, {
                        value: 'pt_PT',
                        label: 'Português'
                    }, {
                        value: 'pt_BR',
                        label: 'Português (Brasil)'
                    }, {
                        value: 'zh_CN',
                        label: '中文 (简体)'
                    }, {
                        value: 'fr',
                        label: 'Français'
                    }, {
                        value: 'ja',
                        label: '日本語'
                    }, {
                        value: 'tr',
                        label: 'Türkçe'
                    }, {
                        value: 'tr',
                        label: 'Italiano'
                    }, {
                        value: 'nl',
                        label: 'Nederlands'
                    }, {
                        value: 'ar',
                        label: 'العربية'
                    }, {
                        value: 'id',
                        label: 'Bahasa Indonesia'
                    }, {
                        value: 'nb',
                        label: 'Norsk'
                    }, {
                        value: 'nb_NO',
                        label: 'Norsk (Bokmål)'
                    }, {
                        value: 'el',
                        label: 'Ελληνικά'
                    }, {
                        value: 'bn',
                        label: 'বাংলা'
                    }, {
                        value: 'hin',
                        label: 'हिन्दी'
                    }, {
                        value: 'sk',
                        label: 'Slovenčina'
                    }, {
                        value: 'pl',
                        label: 'Polski'
                    }]
                },
                youtube_language: {
                    label: 'youtubeLanguage',
                    type: 'select',
                    options: [{
                        value: "en",
                        label: "English"
                    }, {
                        value: "es",
                        label: "Español (España)"
                    }, {
                        value: "es-419",
                        label: "Español (Latinoamérica)"
                    }, {
                        value: "es-US",
                        label: "Español (US)"
                    }, {
                        value: "ru",
                        label: "Русский"
                    }, {
                        value: "de",
                        label: "Deutsch"
                    }, {
                        value: "pt-PT",
                        label: "Português"
                    }, {
                        value: "pt",
                        label: "Português (Brasil)"
                    }, {
                        value: "fr",
                        label: "Français"
                    }, {
                        value: "pl",
                        label: "Polski"
                    }, {
                        value: "ja",
                        label: "日本語"
                    }, {
                        value: "af",
                        label: "Afrikaans"
                    }, {
                        value: "az",
                        label: "Azərbaycan"
                    }, {
                        value: "id",
                        label: "Bahasa Indonesia"
                    }, {
                        value: "ms",
                        label: "Bahasa Malaysia"
                    }, {
                        value: "bs",
                        label: "Bosanski"
                    }, {
                        value: "ca",
                        label: "Català"
                    }, {
                        value: "cs",
                        label: "Čeština"
                    }, {
                        value: "da",
                        label: "Dansk"
                    }, {
                        value: "et",
                        label: "Eesti"
                    }, {
                        value: "eu",
                        label: "Euskara"
                    }, {
                        value: "fil",
                        label: "Filipino"
                    }, {
                        value: "fr-CA",
                        label: "Français (Canada)"
                    }, {
                        value: "gl",
                        label: "Galego"
                    }, {
                        value: "hr",
                        label: "Hrvatski"
                    }, {
                        value: "zu",
                        label: "IsiZulu"
                    }, {
                        value: "is",
                        label: "Íslenska"
                    }, {
                        value: "it",
                        label: "Italiano"
                    }, {
                        value: "sw",
                        label: "Kiswahili"
                    }, {
                        value: "lv",
                        label: "Latviešu valoda"
                    }, {
                        value: "lt",
                        label: "Lietuvių"
                    }, {
                        value: "hu",
                        label: "Magyar"
                    }, {
                        value: "nl",
                        label: "Nederlands"
                    }, {
                        value: "no",
                        label: "Norsk"
                    }, {
                        value: "uz",
                        label: "O‘zbek"
                    }, {
                        value: "ro",
                        label: "Română"
                    }, {
                        value: "sq",
                        label: "Shqip"
                    }, {
                        value: "sk",
                        label: "Slovenčina"
                    }, {
                        value: "sl",
                        label: "Slovenščina"
                    }, {
                        value: "sr-Latn",
                        label: "Srpski"
                    }, {
                        value: "fi",
                        label: "Suomi"
                    }, {
                        value: "sv",
                        label: "Svenska"
                    }, {
                        value: "vi",
                        label: "Tiếng Việt"
                    }, {
                        value: "tr",
                        label: "Türkçe"
                    }, {
                        value: "be",
                        label: "Беларуская"
                    }, {
                        value: "bg",
                        label: "Български"
                    }, {
                        value: "ky",
                        label: "Кыргызча"
                    }, {
                        value: "kk",
                        label: "Қазақ Тілі"
                    }, {
                        value: "mk",
                        label: "Македонски"
                    }, {
                        value: "mn",
                        label: "Монгол"
                    }, {
                        value: "sr",
                        label: "Српски"
                    }, {
                        value: "uk",
                        label: "Українська"
                    }, {
                        value: "el",
                        label: "Ελληνικά"
                    }, {
                        value: "hy",
                        label: "Հայերեն"
                    }, {
                        value: "iw",
                        label: "עברית"
                    }, {
                        value: "ur",
                        label: "اردو"
                    }, {
                        value: "ar",
                        label: "العربية"
                    }, {
                        value: "fa",
                        label: "فارسی"
                    }, {
                        value: "ne",
                        label: "नेपाली"
                    }, {
                        value: "mr",
                        label: "मराठी"
                    }, {
                        value: "hi",
                        label: "हिन्दी"
                    }, {
                        value: "bn",
                        label: "বাংলা"
                    }, {
                        value: "pa",
                        label: "ਪੰਜਾਬੀ"
                    }, {
                        value: "gu",
                        label: "ગુજરાતી"
                    }, {
                        value: "ta",
                        label: "தமிழ்"
                    }, {
                        value: "te",
                        label: "తెలుగు"
                    }, {
                        value: "kn",
                        label: "ಕನ್ನಡ"
                    }, {
                        value: "ml",
                        label: "മലയാളം"
                    }, {
                        value: "si",
                        label: "සිංහල"
                    }, {
                        value: "th",
                        label: "ภาษาไทย"
                    }, {
                        value: "lo",
                        label: "ລາວ"
                    }, {
                        value: "my",
                        label: "ဗမာ"
                    }, {
                        value: "ka",
                        label: "ქართული"
                    }, {
                        value: "am",
                        label: "አማርኛ"
                    }, {
                        value: "km",
                        label: "ខ្មែរ"
                    }, {
                        value: "zh-CN",
                        label: "中文 (简体)"
                    }, {
                        value: "zh-TW",
                        label: "中文 (繁體)"
                    }, {
                        value: "zh-HK",
                        label: "中文 (香港)"
                    }, {
                        value: "ko",
                        label: "한국어"
                    }]
                }
            }
        },
        backup_and_reset: {
            type: 'folder',
            label: 'backupAndReset',
            before: '<svg viewBox="0 0 24 24"><path d="M13.3 3A9 9 0 0 0 4 12H2.2c-.5 0-.7.5-.3.8l2.7 2.8c.2.2.6.2.8 0L8 12.8c.4-.3.1-.8-.3-.8H6a7 7 0 1 1 2.7 5.5 1 1 0 0 0-1.3.1 1 1 0 0 0 0 1.5A9 9 0 0 0 22 11.7C22 7 18 3.1 13.4 3zm-.6 5c-.4 0-.7.3-.7.8v3.6c0 .4.2.7.5.9l3.1 1.8c.4.2.8.1 1-.2.2-.4.1-.8-.2-1l-3-1.8V8.7c0-.4-.2-.7-.7-.7z" /></svg>',

            section: {
                type: 'section',
                import_settings: {
                    type: 'button',
                    label: 'importSettings',

                    onclick: function () {
                        if (location.href.indexOf('/index.html?action=import') !== -1) {
                            importData();
                        } else {
                            chrome.tabs.create({
                                url: 'index.html?action=import'
                            });
                        }
                    }
                },
                export_settings: {
                    type: 'button',
                    label: 'exportSettings',

                    onclick: function () {
                        if (location.href.indexOf('/index.html?action=export') !== -1) {
                            exportData();
                        } else {
                            chrome.tabs.create({
                                url: 'index.html?action=export'
                            });
                        }
                    }
                },
                reset_all_settings: {
                    type: 'button',
                    label: 'resetAllSettings',

                    onclick: function () {
                        satus.render({
                            type: 'dialog',
                            class: 'satus-dialog--confirm',

                            message: {
                                type: 'text',
                                label: 'thisWillResetAllSettings'
                            },
                            section: {
                                type: 'section',
                                class: 'controls',
                                style: {
                                    'justify-content': 'flex-end',
                                    'display': 'flex'
                                },

                                cancel: {
                                    type: 'button',
                                    label: 'cancel',
                                    onclick: function () {
                                        var scrim = document.querySelectorAll('.satus-dialog__scrim');

                                        scrim[scrim.length - 1].click();
                                    }
                                },
                                accept: {
                                    type: 'button',
                                    label: 'accept',
                                    onclick: function () {
                                        var scrim = document.querySelectorAll('.satus-dialog__scrim');

                                        satus.storage.clear();

                                        location.reload();

                                        scrim[scrim.length - 1].click();
                                    }
                                }
                            }
                        });
                    }
                },
                delete_youtube_cookies: {
                    type: 'button',
                    label: 'deleteYoutubeCookies',

                    onclick: function () {
                        satus.render({
                            type: 'dialog',
                            class: 'satus-dialog--confirm',

                            message: {
                                type: 'text',
                                label: 'thisWillRemoveAllYouTubeCookies',
                                style: {
                                    'width': '100%',
                                    'opacity': '.8'
                                }
                            },
                            section: {
                                type: 'section',
                                class: 'controls',
                                style: {
                                    'justify-content': 'flex-end',
                                    'display': 'flex'
                                },

                                cancel: {
                                    type: 'button',
                                    label: 'cancel',
                                    onclick: function () {
                                        var scrim = document.querySelectorAll('.satus-dialog__scrim');

                                        scrim[scrim.length - 1].click();
                                    }
                                },
                                accept: {
                                    type: 'button',
                                    label: 'accept',
                                    onclick: function () {
                                        var scrim = document.querySelectorAll('.satus-dialog__scrim');

                                        chrome.tabs.query({}, function (tabs) {
                                            for (var i = 0, l = tabs.length; i < l; i++) {
                                                if (tabs[i].hasOwnProperty('url')) {
                                                    chrome.tabs.sendMessage(tabs[i].id, {
                                                        name: 'delete_youtube_cookies'
                                                    });
                                                }
                                            }
                                        });

                                        scrim[scrim.length - 1].click();
                                    }
                                }
                            }
                        });
                    }
                }
            }
        },
        date_and_time: {
            type: 'folder',
            label: 'dateAndTime',
            before: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-.2-13c-.5 0-.8.3-.8.7v4.7c0 .4.2.7.5.9l4.1 2.5c.4.2.8 0 1-.3.2-.3.1-.7-.2-1l-3.9-2.2V7.7c0-.4-.3-.7-.7-.7z" /></svg>',

            section: {
                type: 'section',

                use_24_hour_format: {
                    type: 'switch',
                    label: 'use24HourFormat',
                    value: true
                }
            }
        },
        about: {
            type: 'folder',
            before: '<svg viewBox="0 0 24 24"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" /></svg>',
            label: 'about',
            appearanceId: 'about',

            section: {
                type: 'section',

                onrender: function () {
                    var component = this,
                        manifest = chrome.runtime.getManifest(),
                        user = satus.modules.user(),
                        skeleton_about = {
                            extension_section_label: {
                                type: 'text',
                                class: 'satus-section--label',
                                label: 'extension'
                            },
                            extension_section: {
                                type: 'section',
                                label: 'extension',
                                style: {
                                    'flex-direction': 'column',
                                    'flex': '0'
                                },

                                version: {
                                    type: 'text',
                                    label: 'version',
                                    value: manifest.version
                                },
                                permissions: {
                                    type: 'text',
                                    label: 'permissions',
                                    value: manifest.permissions.join(', ').replace('https://www.youtube.com/', 'YouTube')
                                },
                            },
                            browser_section_label: {
                                type: 'text',
                                class: 'satus-section--label',
                                label: 'browser'
                            },
                            browser_section: {
                                type: 'section',
                                label: 'browser',
                                style: {
                                    'flex-direction': 'column',
                                    'flex': '0'
                                },

                                name: {
                                    type: 'text',
                                    label: 'name',
                                    value: user.browser.name
                                },
                                version: {
                                    type: 'text',
                                    label: 'version',
                                    value: user.browser.version
                                },
                                platform: {
                                    type: 'text',
                                    label: 'platform',
                                    value: user.browser.platform
                                },
                                video_formats: {
                                    type: 'text',
                                    label: 'videoFormats',
                                    value: ''
                                },
                                audio_formats: {
                                    type: 'text',
                                    label: 'audioFormats',
                                    value: ''
                                },
                                flash: {
                                    type: 'text',
                                    label: 'flash',
                                    value: !!user.browser.flash
                                }
                            },
                            os_section_label: {
                                type: 'text',
                                class: 'satus-section--label',
                                label: 'os'
                            },
                            os_section: {
                                type: 'section',
                                label: 'os',
                                style: {
                                    'flex-direction': 'column',
                                    'flex': '0'
                                },

                                os_name: {
                                    type: 'text',
                                    label: 'name',
                                    value: user.os.name
                                },

                                os_type: {
                                    type: 'text',
                                    label: 'type',
                                    value: user.os.type
                                }
                            },
                            device_section_label: {
                                type: 'text',
                                class: 'satus-section--label',
                                label: 'device'
                            },
                            device_section: {
                                type: 'section',
                                label: 'device',
                                style: {
                                    'flex-direction': 'column',
                                    'flex': '0'
                                },

                                screen: {
                                    type: 'text',
                                    label: 'screen',
                                    value: user.device.screen
                                },
                                cores: {
                                    type: 'text',
                                    label: 'cores',
                                    value: user.device.cores
                                },
                                gpu: {
                                    type: 'text',
                                    label: 'gpu',
                                    value: user.device.gpu
                                },
                                ram: {
                                    type: 'text',
                                    label: 'ram',
                                    value: user.device.ram
                                }
                            }
                        },
                        video_formats = [],
                        audio_formats = [];

                    for (var key in user.browser.video) {
                        if (user.browser.video[key] !== false) {
                            video_formats.push(key);
                        }
                    }

                    for (var key in user.browser.audio) {
                        if (user.browser.audio[key] !== false) {
                            audio_formats.push(key);
                        }
                    }

                    skeleton_about.browser_section.video_formats.value = video_formats.join(', ');
                    skeleton_about.browser_section.audio_formats.value = audio_formats.join(', ');

                    setTimeout(function () {
                        satus.render(skeleton_about, component.parentNode);

                        component.remove();
                    });
                }
            }
        }
    }
};


/*--------------------------------------------------------------
# MIXER
--------------------------------------------------------------*/

skeleton.header.section_end.button_vert.onClickRender.mixer = {
    type: 'folder',
    before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>',
    label: 'mixer',
    class: 'satus-folder--mixer',
    appearanceId: 'mixer',
    onopen: function () {
        var self = this;

        if (chrome && chrome.tabs) {
            chrome.tabs.query({}, function (tabs) {
                var mixer = {};

                for (var i = 0, l = tabs.length; i < l; i++) {
                    if (tabs[i].hasOwnProperty('url')) {
                        var tab = tabs[i];

                        if (/(\?|\&)v=/.test(tab.url)) {
                            mixer[i] = {
                                type: 'section',
                                class: 'satus-section--mixer',
                                style: {
                                    'background': 'url(https://img.youtube.com/vi/' + tab.url.match(/(\?|\&)v=[^&]+/)[0].substr(3) + '/0.jpg) center center / cover no-repeat #000',
                                },

                                section: {
                                    type: 'section',
                                    dataset: {
                                        'noConnectionLabel': satus.locale.getMessage('tryToReloadThePage') || 'tryToReloadThePage'
                                    },

                                    mixer_volume: {
                                        type: 'slider',
                                        label: 'volume',
                                        dataset: {
                                            id: tab.id,
                                            element: 'audio'
                                        },
                                        max: 100,
                                        onrender: function () {
                                            var self = this;

                                            chrome.tabs.sendMessage(Number(this.dataset.id), {
                                                name: 'request_volume'
                                            }, function (response) {
                                                if (response) {
                                                    document.querySelector('div[data-element="audio"][data-id="' + Number(self.dataset.id) + '"]').change(response.value);
                                                } else {
                                                    self.parentNode.parentNode.classList.add('noconnection');
                                                }
                                            });
                                        },
                                        onchange: function (value) {
                                            chrome.tabs.sendMessage(Number(this.dataset.id), {
                                                name: 'change_volume',
                                                volume: value
                                            });
                                        }
                                    },
                                    mixer_playback_speed: {
                                        type: 'slider',
                                        label: 'playbackSpeed',
                                        dataset: {
                                            id: tab.id,
                                            element: 'playback_speed'
                                        },
                                        min: .1,
                                        max: 8,
                                        step: .05,
                                        onrender: function () {
                                            var self = this;

                                            chrome.tabs.sendMessage(Number(this.dataset.id), {
                                                name: 'request_playback_speed'
                                            }, function (response) {
                                                if (response) {
                                                    document.querySelector('div[data-element="playback_speed"][data-id="' + Number(self.dataset.id) + '"]').change(Number(response.value));
                                                } else {
                                                    self.parentNode.parentNode.classList.add('noconnection');
                                                }
                                            });
                                        },
                                        onchange: function (value) {
                                            chrome.tabs.sendMessage(Number(this.dataset.id), {
                                                name: 'change_playback_speed',
                                                playback_speed: value
                                            });
                                        }
                                    }
                                }
                            };
                        }
                    }
                }

                if (Object.entries(mixer).length === 0) {
                    mixer.section = {
                        type: 'section',

                        message: {
                            type: 'text',
                            class: 'satus-section--message',
                            label: 'noOpenVideoTabs'
                        }
                    };
                }

                document.querySelector('.satus-dialog__scrim').click();

                satus.render(mixer, self);
            });
        }
    }
};


/*--------------------------------------------------------------
# MAIN
--------------------------------------------------------------*/

skeleton.main = {
    type: 'main',
    appearanceId: 'home',
    on: {
        change: function (container) {
            var item = this.history[this.history.length - 1],
                id = item.appearanceId;

            if (!satus.isset(document.body.dataset.search)) {
                document.body.dataset.search = true;
            } else {
                document.body.dataset.search = false;
            }

            document.body.dataset.appearance = id;
            container.dataset.appearance = id;

            document.querySelector('.satus-text--title').innerText = satus.locale.getMessage(item.label) || 'ImprovedTube';
        }
    },

    section: {
        type: 'section'
    },

    info: {
        type: 'section',
        class: 'satus-section--info',

        frame_by_frame: {
            type: 'button',
            innerHTML: 'Frame By Frame <span style="margin:0 0 0 4px;font-weight:400"> by ImprovedTube team<span>',
            style: {
                'margin': '0 0 8px',
                'width': '100%',
                'textAlign': 'center',
                'background': '#4b4abf'
            },
            onclick: function () {
                window.open('https://chrome.google.com/webstore/detail/frame-by-frame/cclnaabdfgnehogonpeddbgejclcjneh', '_blank');
            }
        },
        email: {
            type: 'button',
            label: 'Email',
            title: 'bugs@improvedtube.com',
            onclick: function () {
                window.open('mailto:bugs@improvedtube.com', '_blank');
            }
        },
        github: {
            type: 'button',
            label: 'GitHub',
            title: '/ImprovedTube/ImprovedTube',
            onclick: function () {
                window.open('https://github.com/ImprovedTube/ImprovedTube/', '_blank');
            }
        },
        website: {
            type: 'button',
            label: 'Website',
            title: 'improvedtube.com',
            onclick: function () {
                window.open('http://www.improvedtube.com/', '_blank');
            }
        },
        firefox: {
            type: 'button',
            label: 'Firefox',
            onclick: function () {
                window.open('https://addons.mozilla.org/en-US/firefox/addon/youtube-addon/', '_blank');
            }
        }
    }
};


/*--------------------------------------------------------------
# GENERAL
--------------------------------------------------------------*/

skeleton.main.section.general = {
    type: 'folder',
    before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>',
    label: 'general',
    class: 'satus-folder--general',
    appearanceId: 'general',

    section: {
        type: 'section',

        /*legacy_youtube: {
            type: 'switch',
            label: 'legacyYoutube',
            tags: 'old'
        },*/
        youtube_home_page: {
            type: 'select',
            label: 'youtubeHomePage',
            options: [{
                label: 'home',
                value: '/'
            }, {
                label: 'trending',
                value: '/feed/trending'
            }, {
                label: 'subscriptions',
                value: '/feed/subscriptions'
            }, {
                label: 'history',
                value: '/feed/history'
            }, {
                label: 'watchLater',
                value: '/playlist?list=WL'
            }, {
                label: 'search',
                value: 'search'
            }, {
                label: '👍 liked',
                value: '/playlist?list=LL'
            }, {
                label: 'library',
                value: '/feed/library'
            }],
            tags: 'trending,subscriptions,history,watch,search'
        },
        collapse_of_subscription_sections: {
            type: 'switch',
            label: 'collapseOfSubscriptionSections'
        },
        remove_related_search_results: {
            type: 'switch',
            label: 'removeRelatedSearchResults'
        },
        mark_watched_videos: {
            type: 'switch',
            label: 'markWatchedVideos'
        },
        only_one_player_instance_playing: {
            type: 'switch',
            label: 'onlyOnePlayerInstancePlaying'
        },
        confirmation_before_closing: {
            type: 'switch',
            label: 'confirmationBeforeClosing',
            tags: 'random prevent close exit'
        },
        add_scroll_to_top: {
            type: 'switch',
            label: 'addScrollToTop',
            tags: 'up'
        }
    },

    section_label__thumbnails: {
        type: 'text',
        class: 'satus-section--label',
        label: 'thumbnails'
    },

    thumbnails_section: {
        type: 'section',

        squared_user_images: {
            type: 'switch',
            label: 'squaredUserImages',
            tags: 'avatar'
        },
        hd_thumbnails: {
            type: 'switch',
            label: 'hdThumbnails',
            tags: 'preview quality'
        },
        hide_animated_thumbnails: {
            type: 'switch',
            label: 'hideAnimatedThumbnails',
            tags: 'preview'
        },
        hide_thumbnail_overlay: {
            type: 'switch',
            label: 'hideThumbnailOverlay',
            tags: 'preview'
        }
    }
};


/*--------------------------------------------------------------
# APPEARANCE
--------------------------------------------------------------*/

skeleton.main.section.appearance = {
    type: 'folder',
    before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
    label: 'appearance',
    class: 'satus-folder--appearance',
    appearanceId: 'appearance',

    header: {
        type: 'folder',
        label: 'header',
        class: 'satus-folder--header',

        section: {
            type: 'section',

            header_position: {
                type: 'select',
                label: 'position',
                options: [{
                    label: 'normal',
                    value: 'normal'
                }, {
                    label: 'hidden',
                    value: 'hidden'
                }, {
                    label: 'hover',
                    value: 'hover'
                }, {
                    label: 'hiddenOnVideoPage',
                    value: 'hidden_on_video_page'
                }, {
                    label: 'hoverOnVideoPage',
                    value: 'hover_on_video_page'
                }, {
                    label: 'static',
                    value: 'static'
                }],
                tags: 'hide,hover,static,top'
            },
            header_improve_logo: {
                type: 'switch',
                label: 'improveLogo',
                tags: 'youtube'
            },
            header_hide_right_buttons: {
                type: 'switch',
                label: 'hideRightButtons',
                tags: 'user'
            },
            header_hide_country_code: {
                type: 'switch',
                label: 'hideCountryCode',
                tags: 'country,code'
            }
        }
    },
    player: {
        type: 'folder',
        label: 'player',
        class: 'satus-folder--player',

        section: {
            type: 'section',

            player_hide_annotations: {
                type: 'switch',
                label: 'hideAnnotations',
                tags: 'hide,remove,elements'
            },
            player_hide_cards: {
                type: 'switch',
                label: 'hideCards',
                tags: 'hide,remove,elements'
            },
            player_show_cards_on_mouse_hover: {
                type: 'switch',
                label: 'showCardsOnMouseHover',
                tags: 'hide,remove,elements'
            },
            player_size: {
                type: 'select',
                label: 'playerSize',
                options: [{
                    label: 'doNotChange',
                    value: 'do_not_change'
                }, {
                    label: 'fullWindow',
                    value: 'full_window'
                }, {
                    label: 'fitToWindow',
                    value: 'fit_to_window'
                }, {
                    label: '240p',
                    value: '240p'
                }, {
                    label: '360p',
                    value: '360p'
                }, {
                    label: '480p',
                    value: '480p'
                }, {
                    label: '576p',
                    value: '576p'
                }, {
                    label: '720p',
                    value: '720p'
                }, {
                    label: '1080p',
                    value: '1080p'
                }, {
                    label: '1440p',
                    value: '1440p'
                }, {
                    label: '2160p',
                    value: '2160p'
                }]
            },
            forced_theater_mode: {
                type: 'switch',
                label: 'forcedTheaterMode',
                tags: 'wide'
            },
            player_color: {
                label: 'playerColor',
                type: 'select',
                options: [{
                    label: 'red',
                    value: 'red'
                }, {
                    label: 'pink',
                    value: 'pink'
                }, {
                    label: 'purple',
                    value: 'purple'
                }, {
                    label: 'deepPurple',
                    value: 'deep_purple'
                }, {
                    label: 'indigo',
                    value: 'indigo'
                }, {
                    label: 'blue',
                    value: 'blue'
                }, {
                    label: 'lightBlue',
                    value: 'light_blue'
                }, {
                    label: 'cyan',
                    value: 'cyan'
                }, {
                    label: 'teal',
                    value: 'teal'
                }, {
                    label: 'green',
                    value: 'green'
                }, {
                    label: 'lightGreen',
                    value: 'light_green'
                }, {
                    label: 'lime',
                    value: 'lime'
                }, {
                    label: 'yellow',
                    value: 'yellow'
                }, {
                    label: 'amber',
                    value: 'amber'
                }, {
                    label: 'orange',
                    value: 'orange'
                }, {
                    label: 'deepOrange',
                    value: 'deep_orange'
                }, {
                    label: 'brown',
                    value: 'brown'
                }, {
                    label: 'blueGray',
                    value: 'blue_gray'
                }, {
                    label: 'white',
                    value: 'white'
                }],
                tags: 'style'
            },
            player_transparent_background: {
                type: 'switch',
                label: 'transparentBackground'
            },
            player_hide_endscreen: {
                type: 'switch',
                label: 'hideEndscreen'
            },
            player_hd_thumbnail: {
                type: 'switch',
                label: 'hdThumbnail',
                tags: 'preview'
            },
            hide_scroll_for_details: {
                type: 'switch',
                label: 'hideScrollForDetails',
                tags: 'remove,hide'
            },
            always_show_progress_bar: {
                type: 'switch',
                label: 'alwaysShowProgressBar'
            },
            hide_gradient_bottom: {
                type: 'switch',
                label: 'hideGradientBottom'
            }
        }
    },
    details: {
        type: 'folder',
        label: 'details',
        class: 'satus-folder--details',

        section: {
            type: 'section',

            hide_details: {
                type: 'switch',
                label: 'hideDetails',
                tags: 'hide,remove'
            },
            description: {
                type: 'select',
                label: 'description',

                options: [{
                    label: 'normal',
                    value: 'normal'
                }, {
                    label: 'expanded',
                    value: 'expanded'
                }, {
                    label: 'hidden',
                    value: 'hidden'
                }],
                tags: 'hide,remove'
            },
            hide_views_count: {
                type: 'switch',
                label: 'hideViewsCount',
                tags: 'hide,remove'
            },
            likes: {
                type: 'select',
                label: 'likes',

                options: [{
                    label: 'normal',
                    value: 'normal'
                }, {
                    label: 'iconsOnly',
                    value: 'icons_only'
                }, {
                    label: 'hidden',
                    value: 'hidden'
                }],
                tags: 'hide,remove'
            },
            how_long_ago_the_video_was_uploaded: {
                type: 'switch',
                label: 'howLongAgoTheVideoWasUploaded'
            },
            channel_videos_count: {
                type: 'switch',
                label: 'showChannelVideosCount'
            },
            red_dislike_button: {
                type: 'switch',
                label: 'redDislikeButton'
            }
        }
    },
    sidebar: {
        type: 'folder',
        label: 'sidebar',
        class: 'satus-folder--sidebar',

        section: {
            type: 'section',


            related_videos: {
                type: 'select',
                label: 'relatedVideos',
                options: [{
                    label: 'normal',
                    value: 'normal'
                }, {
                    label: 'collapsed',
                    value: 'collapsed'
                }, {
                    label: 'hidden',
                    value: 'hidden'
                }],
                tags: 'right'
            },

            livechat: {
                type: 'select',
                label: 'liveChat',

                options: [{
                    label: 'normal',
                    value: 'normal'
                }, {
                    label: 'collapsed',
                    value: 'collapsed'
                }, {
                    label: 'hidden',
                    value: 'hidden'
                }]
            },
            hide_playlist: {
                type: 'switch',
                label: 'hidePlaylist'
            },
            sidebar_left: {
                type: 'switch',
                label: 'Sidebar to the Left'
            },
            thumbnails_right: {
                type: 'switch',
                label: 'Thumbnails to the Right'
            },
            thumbnails_hide: {
                type: 'switch',
                label: 'Hide Thumbnails'
            }
        }
    },
    comments: {
        type: 'folder',
        label: 'comments',
        class: 'satus-folder--comments',

        section: {
            type: 'section',

            comments: {
                type: 'select',
                label: 'comments',

                options: [{
                    label: 'normal',
                    value: 'normal'
                }, {
                    label: 'collapsed',
                    value: 'collapsed'
                }, {
                    label: 'hidden',
                    value: 'hidden'
                }]
            }
        }
    },
    footer: {
        type: 'folder',
        label: 'footer',
        class: 'satus-folder--footer',

        section: {
            type: 'section',

            hide_footer: {
                type: 'switch',
                label: 'hideFooter',
                tags: 'bottom'
            }
        }
    }
};


/*--------------------------------------------------------------
# THEMES
--------------------------------------------------------------*/

skeleton.main.section.themes = {
    type: 'folder',
    before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>',
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
                label: 'Youtube standard (Roboto)',
                value: 'Default'
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


/*--------------------------------------------------------------
# PLAYER
--------------------------------------------------------------*/

skeleton.main.section.player = {
    type: 'folder',
    before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>',
    label: 'player',
    class: 'satus-folder--player',
    appearanceId: 'player',

    general: {
        type: 'section',

        player_autoplay: {
            type: 'switch',
            label: 'autoplay',
            value: true
        },
        player_autofullscreen: {
            type: 'switch',
            label: 'autoFullscreen'
        },
        player_ads: {
            label: 'ads',
            type: 'select',
            options: [{
                label: 'onAllVideos',
                value: 'all_videos',
                default: 'true'
            }, {
                label: 'onSubscribedChannels',
                value: 'subscribed_channels'
            }, {
                label: 'blockAll',
                value: 'block_all'
            }]
        },
        player_autopause_when_switching_tabs: {
            type: 'switch',
            label: 'autopauseWhenSwitchingTabs'
        },
        player_forced_playback_speed: {
            type: 'switch',
            label: 'forcedPlaybackSpeed',
            id: 'forced-playback-speed',
            onrender: function () {
                this.dataset.value = satus.storage.player_forced_playback_speed;
            },
            onchange: function () {
                this.dataset.value = satus.storage.player_forced_playback_speed;
            }
        },
        player_playback_speed: {
            type: 'slider',
            label: 'playbackSpeed',
            textarea: true,
            value: 1,
            min: .1,
            max: 8,
            step: .05
        },
        player_subtitles: {
            type: 'switch',
            label: 'subtitles',
            value: true
        },
        player_crop_chapter_titles: {
            type: 'switch',
            label: 'cropChapterTitles',
            value: true
        },
        up_next_autoplay: {
            type: 'switch',
            label: 'upNextAutoplay',
            value: true
        },
        mini_player: {
            type: 'switch',
            label: 'customMiniPlayer'
        }
    },

    section_label__videos: {
        type: 'text',
        class: 'satus-section--label',
        label: 'videos'
    },

    video: {
        type: 'section',

        player_quality: {
            type: 'select',
            label: 'quality',
            options: [{
                label: 'auto',
                value: 'auto'
            }, {
                label: '144p',
                value: 'tiny'
            }, {
                label: '240p',
                value: 'small'
            }, {
                label: '360p',
                value: 'medium'
            }, {
                label: '480p',
                value: 'large'
            }, {
                label: '720p',
                value: 'hd720'
            }, {
                label: '1080p',
                value: 'hd1080'
            }, {
                label: '1440p',
                value: 'hd1440'
            }, {
                label: '2160p',
                value: 'hd2160'
            }, {
                label: '2880p',
                value: 'hd2880'
            }, {
                label: '4320p',
                value: 'highres'
            }]
        },
        player_h264: {
            type: 'switch',
            label: 'codecH264',

            onclick: function () {
                console.log(this.dataset.value);
                if (this.querySelector('input').checked === true) {
                    satus.render({
                        type: 'dialog',
                        class: 'satus-dialog--confirm',

                        message: {
                            type: 'text',
                            label: 'youtubeLimitsVideoQualityTo1080pForH264Codec',
                            style: {
                                'width': '100%',
                                'opacity': '.8'
                            }
                        },
                        section: {
                            type: 'section',
                            class: 'controls',
                            style: {
                                'justify-content': 'flex-end'
                            },

                            cancel: {
                                type: 'button',
                                label: 'cancel',
                                onclick: function () {
                                    let scrim = document.querySelectorAll('.satus-dialog__scrim');

                                    scrim[scrim.length - 1].click();
                                }
                            },
                            ok: {
                                type: 'button',
                                label: 'OK',
                                onclick: function () {
                                    let scrim = document.querySelectorAll('.satus-dialog__scrim');

                                    scrim[scrim.length - 1].click();
                                }
                            }
                        }
                    });
                }
            }
        },
        player_60fps: {
            type: 'switch',
            label: 'allow60fps',
            value: true
        },
        player_SDR: {
            type: 'switch',
            label: 'forceSDR',
            value: false
        },
    },

    section_label__audio: {
        type: 'text',
        class: 'satus-section--label',
        label: 'audio'
    },

    audio: {
        type: 'section',
        label: 'audio',

        player_forced_volume: {
            type: 'switch',
            label: 'forcedVolume',
            id: 'forced-volume',
            onrender: function () {
                this.dataset.value = satus.storage.player_forced_volume;
            },
            onchange: function () {
                this.dataset.value = satus.storage.player_forced_volume;
            }
        },
        player_volume: {
            type: 'slider',
            label: 'volume',
            step: 1,
            max: 100,
            value: 100
        },
        player_loudness_normalization: {
            type: 'switch',
            label: 'loudnessNormalization',
            value: true
        }
    },

    section_label__buttons: {
        type: 'text',
        class: 'satus-section--label',
        label: 'buttons'
    },

    buttons: {
        type: 'section',

        player_screenshot: {
            type: 'folder',
            label: 'screenshot',

            section: {
                type: 'section',

                player_screenshot_button: {
                    type: 'switch',
                    label: 'activate'
                },
                player_screenshot_save_as: {
                    type: 'select',
                    label: 'saveAs',
                    options: [{
                        label: 'file',
                        value: 'file'
                    }, {
                        label: 'clipboard',
                        value: 'clipboard'
                    }]
                }
            }
        },
        player_repeat: {
            type: 'folder',
            label: 'repeat',

            section: {
                type: 'section',

                player_repeat_button: {
                    type: 'switch',
                    label: 'activate'
                },
                player_always_repeat: {
                    type: 'switch',
                    label: 'alwaysActive'
                }
            }
        },
        player_rotate_button: {
            type: 'switch',
            label: 'rotate'
        },
        player_popup_button: {
            type: 'switch',
            label: 'popupPlayer'
        },
        player_hide_controls: {
            type: 'switch',
            label: 'hideControls',
            value: false
        }
    }
};


/*--------------------------------------------------------------
# PLAYLIST
--------------------------------------------------------------*/

skeleton.main.section.playlist = {
    type: 'folder',
    before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    label: 'playlist',
    class: 'satus-folder--playlist',
    appearanceId: 'playlist',

    section: {
        type: 'section',

        playlist_autoplay: {
            type: 'switch',
            label: 'autoplay',
            value: true
        },
        playlist_up_next_autoplay: {
            type: 'switch',
            label: 'upNextAutoplay',
            value: true
        },
        playlist_reverse: {
            type: 'switch',
            label: 'reverse'
        }
    },

    section2: {
        type: 'section',

        playlist_repeat: {
            type: 'switch',
            label: 'repeat'
        },
        playlist_shuffle: {
            type: 'switch',
            label: 'shuffle'
        }
    }
};


/*--------------------------------------------------------------
# CHANNEL
--------------------------------------------------------------*/

skeleton.main.section.channel = {
    type: 'folder',
    before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><path d="M17 2l-5 5-5-5"/></svg>',
    label: 'channel',
    class: 'satus-folder--channel',
    appearanceId: 'channel',

    section: {
        type: 'section',

        channel_default_tab: {
            type: 'select',
            label: 'defaultChannelTab',
            options: [{
                label: 'home',
                value: '/home'
            }, {
                label: 'videos',
                value: '/videos'
            }, {
                label: 'playlists',
                value: '/playlists'
            }]
        },
        channel_trailer_autoplay: {
            type: 'switch',
            label: 'trailerAutoplay',
            value: true
        },
        channel_hide_featured_content: {
            type: 'switch',
            label: 'hideFeaturedContent'
        }
    }
};


/*--------------------------------------------------------------
# SHORTCUTS
--------------------------------------------------------------*/

skeleton.main.section.shortcuts = {
    type: 'folder',
    before: '<svg stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z"/></svg>',
    label: 'shortcuts',
    class: 'satus-folder--shortcut',
    appearanceId: 'shortcuts',

    player_section_label: {
        type: 'text',
        class: 'satus-section--label',
        label: 'player'
    },

    player_section: {
        type: 'section',

        shortcut_picture_in_picture: {
            type: 'shortcut',
            label: 'pictureInPicture'
        },
        shortcut_volume: {
            type: 'folder',
            label: 'volume',

            section_step: {
                type: 'section',

                shortcut_volume_step: {
                    type: 'slider',
                    label: 'step',
                    min: 1,
                    max: 10,
                    step: 1,
                    value: 5
                }
            },

            section: {
                type: 'section',

                shortcut_increase_volume: {
                    type: 'shortcut',
                    label: 'increaseVolume'
                },
                shortcut_decrease_volume: {
                    type: 'shortcut',
                    label: 'decreaseVolume'
                }
            }
        },
        shortcut_screenshot: {
            type: 'shortcut',
            label: 'screenshot'
        },
        shortcut_playback_speed: {
            type: 'folder',
            label: 'playbackSpeed',

            section_step: {
                type: 'section',

                shortcut_playback_speed_step: {
                    type: 'slider',
                    label: 'step',
                    min: .05,
                    max: .5,
                    step: .05,
                    value: .05
                }
            },

            section: {
                type: 'section',

                shortcut_increase_playback_speed: {
                    type: 'shortcut',
                    label: 'increasePlaybackSpeed'
                },
                shortcut_decrease_playback_speed: {
                    type: 'shortcut',
                    label: 'decreasePlaybackSpeed'
                }
            }
        },
        shortcut_toggle_controls: {
            type: 'shortcut',
            label: 'toggleControls'
        },
        shortcut_next_video: {
            type: 'shortcut',
            label: 'nextVideo',
            value: {
                key: 'N',
                shiftKey: true
            }
        },
        shortcut_prev_video: {
            type: 'shortcut',
            label: 'previousVideo',
            value: {
                key: 'P',
                shiftKey: true
            }
        },
        shortcut_play_pause: {
            type: 'shortcut',
            label: 'playPause',
            value: {
                key: ' '
            }
        },
        shortcut_stop: {
            type: 'shortcut',
            label: 'stop'
        },
        shortcut_toggle_autoplay: {
            type: 'shortcut',
            label: 'toggleAutoplay'
        },
        shortcut_seek_backward: {
            type: 'shortcut',
            label: 'seekBackward10Seconds',
            value: {
                key: 'J'
            }
        },
        shortcut_seek_forward: {
            type: 'shortcut',
            label: 'seekForward10Seconds',
            value: {
                key: 'I'
            }
        },

        shortcut_activate_fullscreen: {
            type: 'shortcut',
            label: 'activateFullscreen',
            value: {
                key: 'F'
            }
        },
        shortcut_activate_captions: {
            type: 'shortcut',
            label: 'activateCaptions',
            value: {
                key: 'C'
            }
        },
        shortcut_quality: {
            type: 'folder',
            label: 'quality',

            section: {
                type: 'section',

                shortcut_auto: {
                    type: 'shortcut',
                    label: 'auto'
                },
                shortcut_240p: {
                    type: 'shortcut',
                    label: '240p'
                },
                shortcut_360p: {
                    type: 'shortcut',
                    label: '360p'
                },
                shortcut_480p: {
                    type: 'shortcut',
                    label: '480p'
                },
                shortcut_720p: {
                    type: 'shortcut',
                    label: '720p'
                },
                shortcut_1080p: {
                    type: 'shortcut',
                    label: '1080p'
                },
                shortcut_1440p: {
                    type: 'shortcut',
                    label: '1440p'
                },
                shortcut_2160p: {
                    type: 'shortcut',
                    label: '2160p'
                },
                shortcut_2880p: {
                    type: 'shortcut',
                    label: '2880p'
                },
                shortcut_4320p: {
                    type: 'shortcut',
                    label: '4320p'
                }
            }
        },
        shortcut_custom_mini_player: {
            type: 'shortcut',
            label: 'customMiniPlayer'
        },
        shortcut_stats_for_nerds: {
            type: 'shortcut',
            label: 'statsForNerds'
        },
        shortcut_toggle_cards: {
            type: 'shortcut',
            label: 'toggleCards'
        },
        shortcut_popup_player: {
            type: 'shortcut',
            label: 'openPopupPlayer'
        }
    },

    appearance_section_label: {
        type: 'text',
        class: 'satus-section--label',
        label: 'YouTube'
    },

    appearance_section: {
        type: 'section',

        shortcut_go_to_search_box: {
            type: 'shortcut',
            label: 'goToSearchBox',
            value: {
                key: '/'
            }
        },
        shortcut_like_shortcut: {
            type: 'shortcut',
            label: 'like'
        },
        shortcut_dislike_shortcut: {
            type: 'shortcut',
            label: 'dislike'
        },
        shortcut_subscribe: {
            type: 'shortcut',
            label: 'subscribe'
        },
        shortcut_dark_theme: {
            type: 'shortcut',
            label: 'darkTheme'
        }
    }
};


/*--------------------------------------------------------------
# BLACKLIST
--------------------------------------------------------------*/

skeleton.main.section.blacklist = {
    type: 'folder',
    before: '<svg stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg>',
    label: 'blacklist',
    class: 'satus-folder--blacklist',
    appearanceId: 'blacklist',

    section_activate: {
        type: 'section',

        blacklist_activate: {
            type: 'switch',
            label: 'activate'
        }
    },

    section: {
        type: 'section',

        channels: {
            type: 'folder',
            label: 'channels',
            onopen: function () {
                var self = this;

                if (satus.storage.blacklist && satus.storage.blacklist.channels) {
                    var list = {};

                    for (var item in satus.storage.blacklist.channels) {
                        if (satus.storage.blacklist.channels[item] !== false) {
                            var title = satus.storage.blacklist.channels[item].title || '';

                            list[item] = {
                                type: 'section',
                                label: title.length > 20 ? title.substr(0, 20) + '...' : title,
                                class: 'satus-section--blacklist',
                                style: {
                                    'background-image': 'url(' + satus.storage.blacklist.channels[item].preview + ')',
                                    'background-color': '#000'
                                },

                                section: {
                                    type: 'section',

                                    delete: {
                                        type: 'button',
                                        icon: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10zM18 4h-2.5l-.7-.7A1 1 0 0 0 14 3H9.9a1 1 0 0 0-.7.3l-.7.7H6c-.6 0-1 .5-1 1s.5 1 1 1h12c.6 0 1-.5 1-1s-.5-1-1-1z"></svg>',
                                        onclick: function () {
                                            delete satus.storage.blacklist.channels[item];

                                            satus.storage.set('blacklist', satus.storage.blacklist);

                                            this.classList.add('removing');

                                            setTimeout(function () {
                                                self.remove();
                                            }, 250);
                                        }
                                    }
                                }
                            };
                        }
                    }

                    if (Object.keys(list).length === 0) {
                        list.section = {
                            type: 'section',
                            class: 'satus-section--message',

                            error: {
                                type: 'text',
                                label: 'empty'
                            }
                        };
                    }

                    satus.render(list, this);
                } else {
                    satus.render({
                        type: 'section',
                        class: 'satus-section--message',

                        error: {
                            type: 'text',
                            label: 'empty'
                        }
                    }, this);
                }
            }
        },
        videos: {
            type: 'folder',
            label: 'videos',
            onopen: function () {
                var self = this;

                if (satus.storage.blacklist && satus.storage.blacklist.videos) {
                    let list = {};

                    for (let item in satus.storage.blacklist.videos) {
                        if (satus.storage.blacklist.videos[item] !== false) {
                            let title = satus.storage.blacklist.videos[item].title || '';

                            list[item] = {
                                type: 'section',
                                label: title.length > 20 ? title.substr(0, 20) + '...' : title,
                                class: 'satus-section--blacklist',
                                style: {
                                    'background-image': 'url(https://img.youtube.com/vi/' + item + '/0.jpg)'
                                },

                                section: {
                                    type: 'section',

                                    delete: {
                                        type: 'button',
                                        icon: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10zM18 4h-2.5l-.7-.7A1 1 0 0 0 14 3H9.9a1 1 0 0 0-.7.3l-.7.7H6c-.6 0-1 .5-1 1s.5 1 1 1h12c.6 0 1-.5 1-1s-.5-1-1-1z"></svg>',
                                        onclick: function () {
                                            delete satus.storage.blacklist.videos[item];

                                            satus.storage.set('blacklist', satus.storage.blacklist);
                                            this.parentNode.parentNode.classList.add('removing');

                                            setTimeout(function () {
                                                self.parentNode.parentNode.remove();
                                            }, 250);
                                        }
                                    }
                                }
                            };
                        }
                    }

                    if (Object.keys(list).length === 0) {
                        list.section = {
                            type: 'section',
                            class: 'satus-section--message',

                            error: {
                                type: 'text',
                                label: 'empty'
                            }
                        };
                    }

                    satus.render(list, this);
                } else {
                    satus.render({
                        type: 'section',
                        class: 'satus-section--message',

                        error: {
                            type: 'text',
                            label: 'empty'
                        }
                    }, this);
                }
            }
        }
    }
};


/*--------------------------------------------------------------
# ANALYZER
--------------------------------------------------------------*/

skeleton.main.section.analyzer = {
    type: 'folder',
    before: '<svg stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z"/></svg>',
    label: 'analyzer',
    class: 'satus-folder--analyzer',
    appearanceId: 'analyzer',

    activ_section: {
        type: 'section',

        analyzer_activation: {
            type: 'switch',
            label: 'activate'
        }
    },

    section: {
        type: 'section',
        style: {
            'flex-direction': 'column',
            'align-items': 'flex-start'
        },
        onrender: function () {
            var data = satus.storage.get('analyzer') || {},
                all_data = {},
                all_data_sort = [],
                all_time_value = 0,
                current_date = new Date().toDateString(),
                container = document.createElement('div'),
                top_text_container = document.createElement('div'),
                today_at = document.createElement('div'),
                watch_time = document.createElement('div'),
                all_time = document.createElement('div'),
                chart = document.createElement('div'),
                bottom_text_container = document.createElement('div');

            container.className = 'analyzer-container';
            top_text_container.className = 'analyzer-top-text';
            watch_time.className = 'analyzer-watch-time';
            today_at.className = 'analyzer-today-at';
            all_time.className = 'analyzer-all-time';
            chart.className = 'analyzer-chart';
            bottom_text_container.className = 'analyzer-bottom';

            let currentDateData = data[current_date];
            if (currentDateData) {
                for (let i in currentDateData) {
                    if (currentDateData[i]) {
                        for (let j in currentDateData[i]) {
                            if (!all_data[j]) {
                                all_data[j] = 0;
                            }

                            all_data[j] += currentDateData[i][j];
                        }
                    }
                }
            }

            for (let i in all_data) {
                all_data_sort.push([i, all_data[i]]);
                all_time_value += all_data[i];
            }

            all_data_sort.sort(function (a, b) {
                return b[1] - a[1];
            });

            var now_minutes = new Date().getMinutes();

            watch_time.innerText = satus.locale.getMessage('watchTime') || 'watchTime';
            today_at.innerText = satus.locale.getMessage('todayAt') + ' ' + (new Date().getHours() + ':' + (now_minutes < 10 ? '0' + now_minutes : now_minutes)) || 'todayAt';
            all_time.innerText = Math.floor(all_time_value / 60) + 'h ' + (all_time_value - Math.floor(all_time_value / 60) * 60) + 'm';

            let h = 0;

            for (let i = 0; i < 4; i++) {
                let column = document.createElement('div');

                column.className = 'analyzer-column';

                for (let j = 0; j < 6; j++) {
                    let hours = h + ':00';

                    h++;

                    let data_column = document.createElement('div');

                    data_column.className = 'analyzer-data-column';

                    if (currentDateData && currentDateData[hours]) {
                        for (let k in currentDateData[hours]) {
                            let block = document.createElement('div');

                            block.className = 'analyzer-data';

                            let height = data[current_date][hours][k] * 100 / 60;

                            block.title = k;
                            block.style.height = height + '%';

                            if (k === all_data_sort[0][0]) {
                                block.className += ' first';
                            } else if (k === all_data_sort[1][0]) {
                                block.className += ' second';
                            } else if (k === all_data_sort[2][0]) {
                                block.className += ' third';
                            }

                            data_column.appendChild(block);
                        }
                    }

                    column.appendChild(data_column);
                }

                chart.appendChild(column);
            }


            for (let i = 0; i < 3; i++) {
                if (all_data_sort[i]) {
                    let cont = document.createElement('div'),
                        label = document.createElement('div'),
                        value = document.createElement('div');

                    label.className = 'label';

                    label.innerText = all_data_sort[i][0];
                    value.innerText = Math.floor(all_data_sort[i][1] / 60) + 'h ' + (all_data_sort[i][1] - Math.floor(all_data_sort[i][1] / 60) * 60) + 'm';

                    cont.appendChild(label);
                    cont.appendChild(value);
                    bottom_text_container.appendChild(cont);
                }
            }

            container.appendChild(all_time);
            container.appendChild(chart);
            this.appendChild(top_text_container);
            top_text_container.appendChild(watch_time);
            top_text_container.appendChild(today_at);
            container.appendChild(bottom_text_container);
            this.appendChild(container);
        }
    }
};


/*--------------------------------------------------------------
# EXPORT DATA
--------------------------------------------------------------*/

function exportData() {
    var data = {};

    for (var key in satus.storage) {
        if (
            typeof satus.storage[key] !== 'function' &&
            key !== 'blacklist' &&
            key !== 'watched'
        ) {
            data[key] = satus.storage[key];
        }
    }

    var blob = new Blob([JSON.stringify(data)], {
        type: 'application/json;charset=utf-8'
    });

    satus.render({
        type: 'dialog',

        export: {
            type: 'button',
            label: 'export',
            onclick: function () {
                chrome.permissions.request({
                    permissions: ['downloads']
                }, function (granted) {
                    if (granted) {
                        chrome.downloads.download({
                            url: URL.createObjectURL(blob),
                            filename: 'improvedtube.json',
                            saveAs: true
                        }, function () {
                            setTimeout(function () {
                                if (location.href.indexOf('action=export') !== -1) {
                                    window.close();
                                } else {
                                    document.querySelector('.satus-dialog__scrim').click();

                                    satus.render({
                                        type: 'dialog',

                                        message: {
                                            type: 'text',
                                            label: 'dataExportedSuccessfully'
                                        },
                                        section: {
                                            type: 'section',
                                            class: 'controls',

                                            ok: {
                                                type: 'button',
                                                label: 'ok',
                                                onclick: function () {
                                                    document.querySelector('.satus-dialog__scrim').click();
                                                }
                                            }
                                        }
                                    });
                                }
                            }, 100);
                        });
                    }
                });
            }
        }
    });
}


/*--------------------------------------------------------------
# IMPORT DATA
--------------------------------------------------------------*/

function importData() {
    satus.render({
        type: 'dialog',

        select_file: {
            type: 'button',
            label: 'selectFile',
            onclick: function () {
                var input = document.createElement('input');

                input.type = 'file';

                input.addEventListener('change', function () {
                    var file_reader = new FileReader();

                    file_reader.onload = function () {
                        var data = JSON.parse(this.result);

                        for (var key in data) {
                            satus.storage.set(key, data[key]);
                        }

                        if (location.href.indexOf('action=import') !== -1) {
                            window.close();
                        } else {
                            document.querySelector('.satus-dialog__scrim').click();

                            satus.render({
                                type: 'dialog',

                                message: {
                                    type: 'text',
                                    label: 'dataImportedSuccessfully'
                                },
                                section: {
                                    type: 'section',
                                    class: 'controls',

                                    ok: {
                                        type: 'button',
                                        label: 'ok',
                                        onclick: function () {
                                            document.querySelector('.satus-dialog__scrim').click();
                                        }
                                    }
                                }
                            });
                        }
                    };

                    file_reader.readAsText(this.files[0]);
                });

                input.click();
            }
        }
    });
}


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

function themeChange(event) {
    if (event.target.checked) {
        let themes = document.querySelectorAll('.satus-switch > input:checked:not([data-storage-key="red_popup_theme"])');

        for (let i = 0, l = themes.length; i < l; i++) {
            if (themes[i] !== event.target) {
                themes[i].click();
            }
        }
    }

    if (satus.storage.get('default_dark_theme') === true) {
        document.documentElement.setAttribute('theme', 'dark');
    } else if (satus.storage.get('night_theme') === true) {
        document.documentElement.setAttribute('theme', 'night');
    } else if (satus.storage.get('dawn_theme') === true) {
        document.documentElement.setAttribute('theme', 'dawn');
    } else if (satus.storage.get('sunset_theme') === true) {
        document.documentElement.setAttribute('theme', 'sunset');
    } else if (satus.storage.get('desert_theme') === true) {
        document.documentElement.setAttribute('theme', 'desert');
    } else if (satus.storage.get('plain_theme') === true) {
        document.documentElement.setAttribute('theme', 'plain');
    } else if (satus.storage.get('black_theme') === true) {
        document.documentElement.setAttribute('theme', 'black');
    } else {
        document.documentElement.removeAttribute('theme');
    }
}

function updateAttributes() {
    var whitelist = {
            'improvedtube-home': true
        },
        items = satus.storage;

    for (var key in items) {
        var attribute = key.replace(/_/g, '-');

        if (whitelist.hasOwnProperty(attribute)) {
            document.documentElement.setAttribute('it-' + attribute, items[key]);
        }
    }
}

satus.storage.import(function (items) {
    updateAttributes();

    satus.locale.import(satus.storage.get('language'), function () {
        satus.modules.updateStorageKeys(skeleton, function () {
            if (location.href.indexOf('action=import') !== -1) {
                importData();
            } else if (location.href.indexOf('action=export') !== -1) {
                exportData();
            } else {
                satus.render(skeleton, document.body);
            }
        });
    });

    if (satus.isset(satus.storage.get('red_popup_theme')) === false || satus.storage.get('red_popup_theme') === true) {
        document.documentElement.setAttribute('popup-theme', 'red');
    }

    if (satus.storage.get('default_dark_theme') === true) {
        document.documentElement.setAttribute('theme', 'dark');
    }

    if (satus.storage.get('night_theme') === true) {
        document.documentElement.setAttribute('theme', 'night');
    }

    if (satus.storage.get('dawn_theme') === true) {
        document.documentElement.setAttribute('theme', 'dawn');
    }

    if (satus.storage.get('sunset_theme') === true) {
        document.documentElement.setAttribute('theme', 'sunset');
    }

    if (satus.storage.get('desert_theme') === true) {
        document.documentElement.setAttribute('theme', 'desert');
    }

    if (satus.storage.get('plain_theme') === true) {
        document.documentElement.setAttribute('theme', 'plain');
    }

    if (satus.storage.get('black_theme') === true) {
        document.documentElement.setAttribute('theme', 'black');
    }
});

chrome.storage.onChanged.addListener(function (changes) {
    for (var key in changes) {
        document.documentElement.setAttribute('it-' + key.replace(/_/g, '-'), changes[key].newValue);
    }
});