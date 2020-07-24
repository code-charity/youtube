Menu.header.section_end.button_vert.onClickRender.settings = {
    type: 'folder',
    before: '<svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    label: 'settings',
    parent: '.satus-main__container',
    onclick: function() {
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
                    onrender: function() {
                        this.value = Satus.storage.get('custom_js') || '';
                    },
                    oninput: function() {
                        Satus.storage.set('custom_js', this.value);
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
                    onrender: function() {
                        this.value = Satus.storage.get('custom_css') || '';
                    },
                    oninput: function() {
                        Satus.storage.set('custom_css', this.value);
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
                    Satus.search('language', Menu, function(result) {
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
                    onchange: function(name, value) {
                        Satus.memory.set('locale', {});

                        Satus.locale(function() {
                            document.querySelector('.satus-main__container').innerHTML = '';

                            document.querySelector('.satus-header__title').innerText = Satus.locale.getMessage('languages');
                            document.querySelector('#search').placeholder = Satus.locale.getMessage('search');

                            Satus.render(document.querySelector('.satus-main__container'), Menu.main.section.settings.section.languages);
                        });
                    },
                    options: [{
                        value: 'en',
                        label: 'English'
                    }, {
                        value: 'ar',
                        label: 'العربية'
                    }, {
                        value: 'de',
                        label: 'Deutsch'
                    }, {
                        value: 'es',
                        label: 'Español'
                    }, {
                        value: 'fr',
                        label: 'Français'
                    }, {
                        value: 'id',
                        label: 'Bahasa Indonesia'
                    }, {
                        value: 'it',
                        label: 'Italiano'
                    }, {
                        value: 'ja',
                        label: '日本語'
                    }, {
                        value: 'nl',
                        label: 'Dutch'
                    }, {
                        value: 'no',
                        label: 'Norwegian Bokmål'
                    }, {
                        value: 'pt_BR',
                        label: 'Português (Brasil)'
                    }, {
                        value: 'ru',
                        label: 'Русский'
                    }, {
                        value: 'tr',
                        label: 'Türkçe'
                    }, {
                        value: 'zh_CN',
                        label: '中文 (简体)'
                    }, {
                        value: 'zh_TW',
                        label: '中文 (繁體)'
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

                    onclick: function() {
                        try {
                            var input = document.createElement('input');

                            input.type = 'file';

                            input.addEventListener('change', function() {
                                var file_reader = new FileReader();

                                file_reader.onload = function() {
                                    var data = JSON.parse(this.result);

                                    for (var i in data) {
                                        Satus.storage.set(i, data[i]);
                                    }

                                    Satus.render({
                                        type: 'dialog',
                                        class: 'satus-dialog--confirm',

                                        message: {
                                            type: 'text',
                                            label: 'successfullyImportedSettings'
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
                                                onclick: function() {
                                                    var scrim = document.querySelectorAll('.satus-dialog__scrim');

                                                    scrim[scrim.length - 1].click();
                                                }
                                            },
                                            ok: {
                                                type: 'button',
                                                label: 'OK',
                                                onclick: function() {
                                                    var scrim = document.querySelectorAll('.satus-dialog__scrim');

                                                    scrim[scrim.length - 1].click();
                                                }
                                            }
                                        }
                                    });
                                };

                                file_reader.readAsText(this.files[0]);
                            });

                            input.click();
                        } catch (err) {
                            chrome.runtime.sendMessage({
                                name: 'dialog-error',
                                value: err
                            });
                        }
                    }
                },
                export_settings: {
                    type: 'button',
                    label: 'exportSettings',

                    onclick: function() {
                        chrome.runtime.sendMessage({
                            name: 'download',
                            filename: 'improvedtube-settings.json',
                            value: Satus.storage
                        });
                    }
                },
                reset_all_settings: {
                    type: 'button',
                    label: 'resetAllSettings',

                    onclick: function() {
                        Satus.render({
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
                                    onclick: function() {
                                        var scrim = document.querySelectorAll('.satus-dialog__scrim');

                                        scrim[scrim.length - 1].click();
                                    }
                                },
                                accept: {
                                    type: 'button',
                                    label: 'accept',
                                    onclick: function() {
                                        var scrim = document.querySelectorAll('.satus-dialog__scrim');

                                        Satus.storage.clear();

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

                    onclick: function() {
                        Satus.render({
                            type: 'dialog',

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
                                    onclick: function() {
                                        var scrim = document.querySelectorAll('.satus-dialog__scrim');

                                        scrim[scrim.length - 1].click();
                                    }
                                },
                                accept: {
                                    type: 'button',
                                    label: 'accept',
                                    onclick: function() {
                                        var scrim = document.querySelectorAll('.satus-dialog__scrim');

                                        chrome.tabs.query({}, function(tabs) {
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

                onrender: function() {
                    var component = this,
                        manifest = chrome.runtime.getManifest(),
                        user = Satus.modules.user(),
                        object = {
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
                                    value: user.browser.video
                                },
                                audio_formats: {
                                    type: 'text',
                                    label: 'audioFormats',
                                    value: user.browser.audio
                                },
                                flash: {
                                    type: 'text',
                                    label: 'flash',
                                    value: user.browser.flash ? true : false
                                }
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
                        };

                    setTimeout(function() {
                        Satus.render(object, component.parentNode);

                        component.remove();
                    });
                }
            }
        }
    }
};
