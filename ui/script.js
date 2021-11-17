/*--------------------------------------------------------------
>>> POPUP:
----------------------------------------------------------------
# Skeleton
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# SKELETON
--------------------------------------------------------------*/

var skeleton = {
    component: 'base',
    class: 'search-mode',
    attr: {
        'theme': 'default'
    },

    header: {
        component: 'header',

        section_start: {
            component: 'section',
            variant: 'align-start',

            back: {
                component: 'button',
                attr: {
                    'hidden': 'true'
                },
                on: {
                    click: 'layers.back'
                },

                svg: {
                    component: 'svg',
                    attr: {
                        'viewBox': '0 0 24 24',
                        'stroke-width': '1.5'
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
        section_end: {
            component: 'section',
            variant: 'align-end',

            search_field: {
                component: 'input',
                class: 'satus-input--search',
                storage: false,
                attr: {
                    'type': 'text',
                    'placeholder': 'search',
                    'autofocus': true
                },
                on: {
                    render: function () {
                        this.focus();
                    },
                    blur: function () {
                        if (this.value.length === 0) {
                            var results = document.querySelector('.search-results');

                            if (results) {
                                results.close();
                            }

                            this.base.classList.remove('search-mode');
                        }
                    },
                    keydown: function (event) {
                        var value = this.value,
                            key = event.key;

                        setTimeout(function () {
                            if (value.length === 0 && key === 'Backspace') {
                                var results = document.querySelector('.search-results');

                                if (results) {
                                    results.close();
                                }

                                this.base.classList.remove('search-mode');
                            }
                        });
                    },
                    input: function (event) {
                        var self = this,
                            value = this.value.trim();

                        if (value.length > 0) {
                            satus.search(value, skeleton, function (results) {
                                var search_results = document.querySelector('.search-results'),
                                    skeleton = {
                                        component: 'modal',
                                        class: 'search-results'
                                    };

                                for (var key in results) {
                                    var result = results[key],
                                        parent = result;

                                    while (
                                        parent.parent &&
                                        !parent.parent.category
                                    ) {
                                        parent = parent.parent;
                                    }

                                    var category = '';

                                    if (parent.parent && parent.parent.label && parent.parent.label.text) {
                                        category = parent.parent.label.text;
                                    }

                                    parent = result;

                                    while (
                                        parent.parent &&
                                        parent.parent.component !== 'button'
                                    ) {
                                        parent = parent.parent;
                                    }

                                    parent = parent.parent;

                                    if (parent) {
                                        if (parent.label) {
                                            var subcategory = parent.label.text;
                                        } else {
                                            var subcategory = parent.text;
                                        }

                                        skeleton[category+subcategory + '_label'] = {
                                            component: 'span',
                                            class: 'satus-section--label',
                                            text: satus.locale.get(category) + ' -> ' + satus.locale.get(subcategory)
                                        };

                                        if (!skeleton[category+subcategory]) {
                                            skeleton[category+subcategory] = {
                                                component: 'section',
                                                variant: 'card'
                                            };
                                        }

                                        skeleton[category+subcategory][key] = result;
                                    } else {
                                        skeleton[category + '_label'] = {
                                            component: 'span',
                                            class: 'satus-section--label',
                                            text: category
                                        };

                                        if (!skeleton[category]) {
                                            skeleton[category] = {
                                                component: 'section',
                                                variant: 'card'
                                            };
                                        }

                                        skeleton[category][key] = result;
                                    }
                                }

                                if (Object.keys(results).length === 0) {
                                    if (search_results) {
                                        search_results.remove();
                                    }
                                } else {
                                    if (search_results) {
                                        var parent = document.querySelector('.search-results .satus-modal__surface');

                                        while (parent.children[0]) {
                                            parent.children[0].remove();
                                        }

                                        delete skeleton.component;

                                        satus.render(skeleton, parent);
                                    } else {
                                        satus.render(skeleton, self.base);

                                        document.querySelector('.search-results .satus-modal__scrim').addEventListener('click', function () {
                                            var results = document.querySelector('.search-results');

                                            if (results) {
                                                results.close();
                                            }

                                            document.querySelector('.satus-input--search').value = '';
                                            document.querySelector('.search-mode').classList.remove('search-mode');
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
                    }
                }
            },
            search_close: {
                component: 'button',
                class: 'satus-button--close-search',
                on: {
                    click: function () {
                        var results = document.querySelector('.search-results');

                        if (results) {
                            results.close();
                        }

                        this.base.classList.remove('search-mode');
                    }
                },

                svg: {
                    component: 'svg',
                    attr: {
                        'viewBox': '0 0 24 24',
                        'stroke-width': '1.75'
                    },

                    path: {
                        component: 'path',
                        attr: {
                            'd': 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
                        }
                    }
                }
            },
            search: {
                component: 'button',
                on: {
                    click: function () {
                        this.base.classList.toggle('search-mode');

                        this.base.skeleton.header.section_end.search_field.rendered.focus();
                    }
                },

                svg: {
                    component: 'svg',
                    attr: {
                        'viewBox': '0 0 24 24',
                        'stroke': 'currentcolor',
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        'stroke-width': '1.25'
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
                on: {
                    click: {
                        component: 'modal',
                        variant: 'vertical',

                        active_features: {
                            component: 'button',
                            on: {
                                click: {
                                    component: 'section',
                                    variant: 'card',
                                    on: {
                                        render: function () {
                                            var component = this;

                                            this.skeleton.parent.parent.rendered.close();

                                            satus.search('', skeleton, function (results) {
                                                var skeleton = {};

                                                for (var key in results) {
                                                    var result = results[key],
                                                        default_value = result.value || false,
                                                        value = satus.storage.get(key),
                                                        parent = result;

                                                    if (result.component === 'select') {
                                                        if (satus.isset(result.value) === false) {
                                                            default_value = result.options[0].value;
                                                        }
                                                    }

                                                    if (satus.isset(value) && value !== default_value) {
                                                        while (
                                                            parent.parent &&
                                                            !parent.parent.category
                                                        ) {
                                                            parent = parent.parent;
                                                        }

                                                        var category = parent.parent.label.text;

                                                        parent = result;

                                                        while (
                                                            parent.parent &&
                                                            parent.parent.component !== 'button'
                                                        ) {
                                                            parent = parent.parent;
                                                        }

                                                        parent = parent.parent;

                                                        console.log(result, category, parent);

                                                        if (parent) {
                                                            if (parent.label) {
                                                                var subcategory = parent.label.text;
                                                            } else {
                                                                var subcategory = parent.text;
                                                            }

                                                            skeleton[category+subcategory + '_label'] = {
                                                                component: 'span',
                                                                class: 'satus-section--label',
                                                                text: satus.locale.get(category) + ' -> ' + satus.locale.get(subcategory)
                                                            };

                                                            if (!skeleton[category+subcategory]) {
                                                                skeleton[category+subcategory] = {
                                                                    component: 'section',
                                                                    variant: 'card'
                                                                };
                                                            }

                                                            skeleton[category+subcategory][key] = result;
                                                        } else {
                                                            skeleton[category + '_label'] = {
                                                                component: 'span',
                                                                class: 'satus-section--label',
                                                                text: category
                                                            };

                                                            if (!skeleton[category]) {
                                                                skeleton[category] = {
                                                                    component: 'section',
                                                                    variant: 'card'
                                                                };
                                                            }

                                                            skeleton[category][key] = result;
                                                        }
                                                    }
                                                }

                                                if (Object.keys(skeleton).length === 0) {
                                                    skeleton = {
                                                        component: 'section',
                                                        variant: 'card',

                                                        span: {
                                                            component: 'span',
                                                            text: 'noActiveFeatures'
                                                        }
                                                    };
                                                }

                                                satus.render(skeleton, component.parentNode);

                                                component.remove();
                                            });
                                        }
                                    }
                                }
                            },

                            svg: {
                                component: 'svg',
                                attr: {
                                    'viewBox': '0 0 24 24',
                                    'stroke-width': 1.75
                                },

                                path1: {
                                    component: 'path',
                                    attr: {
                                        'd': 'M22 11.08V12a10 10 0 11-5.93-9.14'
                                    }
                                },
                                path2: {
                                    component: 'path',
                                    attr: {
                                        'd': 'M22 4L12 14.01l-3-3'
                                    }
                                }
                            },
                            label: {
                                component: 'span',
                                text: 'activeFeatures'
                            }
                        },
                        settings: {
                            component: 'button',
                            category: true,
                            on: {
                                click: {
                                    section_1: {
                                        component: 'section',
                                        variant: 'card',
                                        on: {
                                            render: function () {
                                                this.skeleton.parent.parent.parent.rendered.close();
                                            }
                                        },

                                        developer_options: {
                                            component: 'button',
                                            on: {
                                                click: {
                                                    custom_js_section_label: {
                                                        component: 'span',
                                                        class: 'satus-section--label',
                                                        text: 'customJs'
                                                    },
                                                    custom_js: {
                                                        component: 'input',
                                                        attr: {
                                                            'type': 'text'
                                                        },
                                                        on: {
                                                            render: function () {
                                                                this.value = satus.storage.get('custom_js') || '';
                                                            },
                                                            input: function () {
                                                                satus.storage.set('custom_js', this.value);
                                                            }
                                                        }
                                                    },
                                                    custom_css_section_label: {
                                                        component: 'span',
                                                        class: 'satus-section--label',
                                                        text: 'customCss'
                                                    },
                                                    custom_css: {
                                                        component: 'input',
                                                        attr: {
                                                            'type': 'text'
                                                        },
                                                        on: {
                                                            render: function () {
                                                                this.value = satus.storage.get('custom_css') || '';
                                                            },
                                                            input: function () {
                                                                satus.storage.set('custom_css', this.value);
                                                            }
                                                        }
                                                    },
                                                    google_api_key_section_label: {
                                                        component: 'span',
                                                        class: 'satus-section--label',
                                                        text: 'googleApiKey'
                                                    },
                                                    google_api_key: {
                                                        component: 'input',
                                                        attr: {
                                                            type: 'text'
                                                        },
                                                        on: {
                                                            render: function () {
                                                                this.value = satus.storage.get('google-api-key') || 'AIzaSyCXRRCFwKAXOiF1JkUBmibzxJF1cPuKNwA';
                                                            },
                                                            input: function () {
                                                                var value = this.value;

                                                                if (value.length === 0) {
                                                                    value = 'AIzaSyCXRRCFwKAXOiF1JkUBmibzxJF1cPuKNwA';
                                                                }

                                                                satus.storage.set('google-api-key', value);
                                                            }
                                                        }
                                                    }
                                                }
                                            },

                                            svg: {
                                                component: 'svg',
                                                attr: {
                                                    'viewBox': '0 0 24 24',
                                                    'fill': 'currentColor'
                                                },

                                                path: {
                                                    component: 'path',
                                                    attr: {
                                                        'd': 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z'
                                                    }
                                                }
                                            },
                                            label: {
                                                component: 'span',
                                                text: 'developerOptions'
                                            }
                                        },
                                    },
                                    section_2: {
                                        component: 'section',
                                        variant: 'card',

                                        appearance: {
                                            component: 'button',
                                            on: {
                                                click: {
                                                    section_label_1: {
                                                        component: 'span',
                                                        class: 'satus-section--label',
                                                        text: 'general'
                                                    },
                                                    section_1: {
                                                        component: 'section',
                                                        variant: 'card',
                                                        header: {
                                                            component: 'button',
                                                            text: 'header',
                                                            on: {
                                                                click: {
                                                                    section: {
                                                                        component: 'section',
                                                                        variant: 'card',

                                                                        title_version: {
                                                                            component: 'switch',
                                                                            text: 'version'
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        home: {
                                                            component: 'button',
                                                            text: 'home',
                                                            on: {
                                                                click: {
                                                                    section_1: {
                                                                        component: 'section',
                                                                        variant: 'card',

                                                                        improvedtube_home: {
                                                                            component: 'select',
                                                                            text: 'style',
                                                                            options: [{
                                                                                text: 'bubbles',
                                                                                value: 'bubbles'
                                                                            }, {
                                                                                text: 'list',
                                                                                value: 'list'
                                                                            }]
                                                                        }
                                                                    },
                                                                    section_label_2: {
                                                                        component: 'span',
                                                                        class: 'satus-section--label',
                                                                        text: 'categories'
                                                                    },
                                                                    section_2: {
                                                                        component: 'section',
                                                                        variant: 'card',

                                                                        it_general: {
                                                                            component: 'switch',
                                                                            text: 'general',
                                                                            value: true
                                                                        },
                                                                        it_appearance: {
                                                                            component: 'switch',
                                                                            text: 'appearance',
                                                                            value: true
                                                                        },
                                                                        it_themes: {
                                                                            component: 'switch',
                                                                            text: 'themes',
                                                                            value: true
                                                                        },
                                                                        it_player: {
                                                                            component: 'switch',
                                                                            text: 'player',
                                                                            value: true
                                                                        },
                                                                        it_playlist: {
                                                                            component: 'switch',
                                                                            text: 'playlist',
                                                                            value: true
                                                                        },
                                                                        it_channel: {
                                                                            component: 'switch',
                                                                            text: 'channel',
                                                                            value: true
                                                                        },
                                                                        it_shortcuts: {
                                                                            component: 'switch',
                                                                            text: 'shortcuts',
                                                                            value: true
                                                                        },
                                                                        it_mixer: {
                                                                            component: 'switch',
                                                                            text: 'mixer',
                                                                            value: true
                                                                        },
                                                                        it_analyzer: {
                                                                            component: 'switch',
                                                                            text: 'analyzer',
                                                                            value: true
                                                                        },
                                                                        it_blacklist: {
                                                                            component: 'switch',
                                                                            text: 'blacklist',
                                                                            value: true
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    section_label_2: {
                                                        component: 'span',
                                                        class: 'satus-section--label',
                                                        text: 'icons'
                                                    },
                                                    section_2: {
                                                        component: 'section',
                                                        variant: 'card',

                                                        improvedtube_youtube_icon: {
                                                            text: 'improvedtubeIconOnYoutube',
                                                            component: 'select',
                                                            options: [{
                                                                text: 'disabled',
                                                                value: 'disabled'
                                                            }, {
                                                                text: 'youtubeHeaderLeft',
                                                                value: 'header_left'
                                                            }, {
                                                                text: 'youtubeHeaderRight',
                                                                value: 'header_right'
                                                            }, {
                                                                text: 'sidebar',
                                                                value: 'sidebar'
                                                            }, {
                                                                text: 'draggable',
                                                                value: 'draggable'
                                                            }, {
                                                                text: 'belowPlayer',
                                                                value: 'below_player'
                                                            }]
                                                        }
                                                    }
                                                }
                                            },

                                            svg: {
                                                component: 'svg',
                                                attr: {
                                                    'viewBox': '0 0 24 24',
                                                    'fill': 'currentColor'
                                                },

                                                path: {
                                                    component: 'path',
                                                    attr: {
                                                        'd': 'M7 16c.6 0 1 .5 1 1a2 2 0 0 1-2 2h-.5a4 4 0 0 0 .5-2c0-.6.5-1 1-1M18.7 3a1 1 0 0 0-.7.3l-9 9 2.8 2.7 9-9c.3-.4.3-1 0-1.4l-1.4-1.3a1 1 0 0 0-.7-.3zM7 14a3 3 0 0 0-3 3c0 1.3-1.2 2-2 2 1 1.2 2.5 2 4 2a4 4 0 0 0 4-4 3 3 0 0 0-3-3z'
                                                    }
                                                }
                                            },
                                            label: {
                                                component: 'span',
                                                text: 'appearance'
                                            }
                                        },
                                        languages: {
                                            component: 'button',
                                            on: {
                                                click: {
                                                    section: {
                                                        component: 'section',
                                                        variant: 'card',

                                                        language: {
                                                            text: 'improvedtubeLanguage',
                                                            component: 'select',
                                                            on: {
                                                                change: function (name, value) {
                                                                    satus.memory.set('locale', {});

                                                                    satus.locale(function () {
                                                                        document.querySelector('.satus-main__container').innerHTML = '';

                                                                        document.querySelector('.satus-header__title').innerText = satus.locale.getMessage('languages');
                                                                        document.querySelector('#search').placeholder = satus.locale.getMessage('search');

                                                                        satus.render(document.querySelector('.satus-main__container'), skeleton.main.section.settings.section.languages);
                                                                    });
                                                                }
                                                            },
                                                            options: [{
                                                                value: 'en',
                                                                text: 'English'
                                                            }, {
                                                                value: 'ko',
                                                                text: '한국어'
                                                            }, {
                                                                value: 'es',
                                                                text: 'Español (España)'
                                                            }, {
                                                                value: 'ru',
                                                                text: 'Русский'
                                                            }, {
                                                                value: 'de',
                                                                text: 'Deutsch'
                                                            }, {
                                                                value: 'zh_TW',
                                                                text: '中文 (繁體)'
                                                            }, {
                                                                value: 'pt_PT',
                                                                text: 'Português'
                                                            }, {
                                                                value: 'pt_BR',
                                                                text: 'Português (Brasil)'
                                                            }, {
                                                                value: 'zh_CN',
                                                                text: '中文 (简体)'
                                                            }, {
                                                                value: 'fr',
                                                                text: 'Français'
                                                            }, {
                                                                value: 'ja',
                                                                text: '日本語'
                                                            }, {
                                                                value: 'tr',
                                                                text: 'Türkçe'
                                                            }, {
                                                                value: 'tr',
                                                                text: 'Italiano'
                                                            }, {
                                                                value: 'nl',
                                                                text: 'Nederlands'
                                                            }, {
                                                                value: 'ar',
                                                                text: 'العربية'
                                                            }, {
                                                                value: 'id',
                                                                text: 'Bahasa Indonesia'
                                                            }, {
                                                                value: 'nb',
                                                                text: 'Norsk'
                                                            }, {
                                                                value: 'nb_NO',
                                                                text: 'Norsk (Bokmål)'
                                                            }, {
                                                                value: 'el',
                                                                text: 'Ελληνικά'
                                                            }, {
                                                                value: 'bn',
                                                                text: 'বাংলা'
                                                            }, {
                                                                value: 'hin',
                                                                text: 'हिन्दी'
                                                            }, {
                                                                value: 'sk',
                                                                text: 'Slovenčina'
                                                            }, {
                                                                value: 'pl',
                                                                text: 'Polski'
                                                            }]
                                                        },
                                                        youtube_language: {
                                                            text: 'youtubeLanguage',
                                                            component: 'select',
                                                            options: [{
                                                                    value: 'default',
                                                                    text: 'default'
                                                                },
                                                                {
                                                                    value: "en",
                                                                    text: "English"
                                                                }, {
                                                                    value: "es",
                                                                    text: "Español (España)"
                                                                }, {
                                                                    value: "es-419",
                                                                    text: "Español (Latinoamérica)"
                                                                }, {
                                                                    value: "es-US",
                                                                    text: "Español (US)"
                                                                }, {
                                                                    value: "ru",
                                                                    text: "Русский"
                                                                }, {
                                                                    value: "de",
                                                                    text: "Deutsch"
                                                                }, {
                                                                    value: "pt-PT",
                                                                    text: "Português"
                                                                }, {
                                                                    value: "pt",
                                                                    text: "Português (Brasil)"
                                                                }, {
                                                                    value: "fr",
                                                                    text: "Français"
                                                                }, {
                                                                    value: "pl",
                                                                    text: "Polski"
                                                                }, {
                                                                    value: "ja",
                                                                    text: "日本語"
                                                                }, {
                                                                    value: "af",
                                                                    text: "Afrikaans"
                                                                }, {
                                                                    value: "az",
                                                                    text: "Azərbaycan"
                                                                }, {
                                                                    value: "id",
                                                                    text: "Bahasa Indonesia"
                                                                }, {
                                                                    value: "ms",
                                                                    text: "Bahasa Malaysia"
                                                                }, {
                                                                    value: "bs",
                                                                    text: "Bosanski"
                                                                }, {
                                                                    value: "ca",
                                                                    text: "Català"
                                                                }, {
                                                                    value: "cs",
                                                                    text: "Čeština"
                                                                }, {
                                                                    value: "da",
                                                                    text: "Dansk"
                                                                }, {
                                                                    value: "et",
                                                                    text: "Eesti"
                                                                }, {
                                                                    value: "eu",
                                                                    text: "Euskara"
                                                                }, {
                                                                    value: "fil",
                                                                    text: "Filipino"
                                                                }, {
                                                                    value: "fr-CA",
                                                                    text: "Français (Canada)"
                                                                }, {
                                                                    value: "gl",
                                                                    text: "Galego"
                                                                }, {
                                                                    value: "hr",
                                                                    text: "Hrvatski"
                                                                }, {
                                                                    value: "zu",
                                                                    text: "IsiZulu"
                                                                }, {
                                                                    value: "is",
                                                                    text: "Íslenska"
                                                                }, {
                                                                    value: "it",
                                                                    text: "Italiano"
                                                                }, {
                                                                    value: "sw",
                                                                    text: "Kiswahili"
                                                                }, {
                                                                    value: "lv",
                                                                    text: "Latviešu valoda"
                                                                }, {
                                                                    value: "lt",
                                                                    text: "Lietuvių"
                                                                }, {
                                                                    value: "hu",
                                                                    text: "Magyar"
                                                                }, {
                                                                    value: "nl",
                                                                    text: "Nederlands"
                                                                }, {
                                                                    value: "no",
                                                                    text: "Norsk"
                                                                }, {
                                                                    value: "uz",
                                                                    text: "O‘zbek"
                                                                }, {
                                                                    value: "ro",
                                                                    text: "Română"
                                                                }, {
                                                                    value: "sq",
                                                                    text: "Shqip"
                                                                }, {
                                                                    value: "sk",
                                                                    text: "Slovenčina"
                                                                }, {
                                                                    value: "sl",
                                                                    text: "Slovenščina"
                                                                }, {
                                                                    value: "sr-Latn",
                                                                    text: "Srpski"
                                                                }, {
                                                                    value: "fi",
                                                                    text: "Suomi"
                                                                }, {
                                                                    value: "sv",
                                                                    text: "Svenska"
                                                                }, {
                                                                    value: "vi",
                                                                    text: "Tiếng Việt"
                                                                }, {
                                                                    value: "tr",
                                                                    text: "Türkçe"
                                                                }, {
                                                                    value: "be",
                                                                    text: "Беларуская"
                                                                }, {
                                                                    value: "bg",
                                                                    text: "Български"
                                                                }, {
                                                                    value: "ky",
                                                                    text: "Кыргызча"
                                                                }, {
                                                                    value: "kk",
                                                                    text: "Қазақ Тілі"
                                                                }, {
                                                                    value: "mk",
                                                                    text: "Македонски"
                                                                }, {
                                                                    value: "mn",
                                                                    text: "Монгол"
                                                                }, {
                                                                    value: "sr",
                                                                    text: "Српски"
                                                                }, {
                                                                    value: "uk",
                                                                    text: "Українська"
                                                                }, {
                                                                    value: "el",
                                                                    text: "Ελληνικά"
                                                                }, {
                                                                    value: "hy",
                                                                    text: "Հայերեն"
                                                                }, {
                                                                    value: "iw",
                                                                    text: "עברית"
                                                                }, {
                                                                    value: "ur",
                                                                    text: "اردو"
                                                                }, {
                                                                    value: "ar",
                                                                    text: "العربية"
                                                                }, {
                                                                    value: "fa",
                                                                    text: "فارسی"
                                                                }, {
                                                                    value: "ne",
                                                                    text: "नेपाली"
                                                                }, {
                                                                    value: "mr",
                                                                    text: "मराठी"
                                                                }, {
                                                                    value: "hi",
                                                                    text: "हिन्दी"
                                                                }, {
                                                                    value: "bn",
                                                                    text: "বাংলা"
                                                                }, {
                                                                    value: "pa",
                                                                    text: "ਪੰਜਾਬੀ"
                                                                }, {
                                                                    value: "gu",
                                                                    text: "ગુજરાતી"
                                                                }, {
                                                                    value: "ta",
                                                                    text: "தமிழ்"
                                                                }, {
                                                                    value: "te",
                                                                    text: "తెలుగు"
                                                                }, {
                                                                    value: "kn",
                                                                    text: "ಕನ್ನಡ"
                                                                }, {
                                                                    value: "ml",
                                                                    text: "മലയാളം"
                                                                }, {
                                                                    value: "si",
                                                                    text: "සිංහල"
                                                                }, {
                                                                    value: "th",
                                                                    text: "ภาษาไทย"
                                                                }, {
                                                                    value: "lo",
                                                                    text: "ລາວ"
                                                                }, {
                                                                    value: "my",
                                                                    text: "ဗမာ"
                                                                }, {
                                                                    value: "ka",
                                                                    text: "ქართული"
                                                                }, {
                                                                    value: "am",
                                                                    text: "አማርኛ"
                                                                }, {
                                                                    value: "km",
                                                                    text: "ខ្មែរ"
                                                                }, {
                                                                    value: "zh-CN",
                                                                    text: "中文 (简体)"
                                                                }, {
                                                                    value: "zh-TW",
                                                                    text: "中文 (繁體)"
                                                                }, {
                                                                    value: "zh-HK",
                                                                    text: "中文 (香港)"
                                                                }, {
                                                                    value: "ko",
                                                                    text: "한국어"
                                                                }
                                                            ]
                                                        }
                                                    }
                                                }
                                            },

                                            svg: {
                                                component: 'svg',
                                                attr: {
                                                    'viewBox': '0 0 24 24',
                                                    'fill': 'currentColor'
                                                },

                                                path: {
                                                    component: 'path',
                                                    attr: {
                                                        'd': 'M12.9 15l-2.6-2.4c1.8-2 3-4.2 3.8-6.6H17V4h-7V2H8v2H1v2h11.2c-.7 2-1.8 3.8-3.2 5.3-1-1-1.7-2.1-2.3-3.3h-2c.7 1.6 1.7 3.2 3 4.6l-5.1 5L4 19l5-5 3.1 3.1.8-2zm5.6-5h-2L12 22h2l1.1-3H20l1.1 3h2l-4.5-12zm-2.6 7l1.6-4.3 1.6 4.3H16z'
                                                    }
                                                }
                                            },
                                            label: {
                                                component: 'span',
                                                text: 'languages'
                                            }
                                        },
                                        backup_and_reset: {
                                            component: 'button',
                                            on: {
                                                click: {
                                                    section: {
                                                        component: 'section',
                                                        variant: 'card',

                                                        import_settings: {
                                                            component: 'button',
                                                            text: 'importSettings',
                                                            on: {
                                                                click: function () {
                                                                    if (location.href.indexOf('/options.html?action=import') !== -1) {
                                                                        importData();
                                                                    } else {
                                                                        chrome.tabs.create({
                                                                            url: 'ui/options.html?action=import'
                                                                        });
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        export_settings: {
                                                            component: 'button',
                                                            text: 'exportSettings',
                                                            on: {
                                                                click: function () {
                                                                    if (location.href.indexOf('/options.html?action=export') !== -1) {
                                                                        exportData();
                                                                    } else {
                                                                        chrome.tabs.create({
                                                                            url: 'ui/options.html?action=export'
                                                                        });
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        reset_all_settings: {
                                                            component: 'button',
                                                            text: 'resetAllSettings',
                                                            on: {
                                                                click: {
                                                                    component: 'modal',

                                                                    message: {
                                                                        component: 'span',
                                                                        text: 'thisWillResetAllSettings'
                                                                    },
                                                                    section: {
                                                                        component: 'section',
                                                                        variant: 'actions',

                                                                        cancel: {
                                                                            component: 'button',
                                                                            text: 'cancel',
                                                                            on: {
                                                                                click: function () {
                                                                                    this.parentNode.parentNode.parentNode.close();
                                                                                }
                                                                            }
                                                                        },
                                                                        accept: {
                                                                            component: 'button',
                                                                            text: 'accept',
                                                                            on: {
                                                                                click: function () {
                                                                                    satus.storage.clear();

                                                                                    this.parentNode.parentNode.parentNode.close();
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        delete_youtube_cookies: {
                                                            component: 'button',
                                                            text: 'deleteYoutubeCookies',

                                                            on: {
                                                                click: {
                                                                    component: 'modal',

                                                                    message: {
                                                                        component: 'span',
                                                                        text: 'thisWillRemoveAllYouTubeCookies'
                                                                    },
                                                                    section: {
                                                                        component: 'section',
                                                                        variant: 'actions',

                                                                        cancel: {
                                                                            component: 'button',
                                                                            text: 'cancel',
                                                                            on: {
                                                                                click: function () {
                                                                                    this.parentNode.parentNode.parentNode.close();
                                                                                }
                                                                            }
                                                                        },
                                                                        accept: {
                                                                            component: 'button',
                                                                            text: 'accept',
                                                                            on: {
                                                                                click: function () {
                                                                                    chrome.tabs.query({}, function (tabs) {
                                                                                        for (var i = 0, l = tabs.length; i < l; i++) {
                                                                                            if (tabs[i].hasOwnProperty('url')) {
                                                                                                chrome.tabs.sendMessage(tabs[i].id, {
                                                                                                    action: 'delete-youtube-cookies'
                                                                                                });
                                                                                            }
                                                                                        }
                                                                                    });

                                                                                    this.parentNode.parentNode.parentNode.close();
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            },

                                            svg: {
                                                component: 'svg',
                                                attr: {
                                                    'viewBox': '0 0 24 24',
                                                    'fill': 'currentColor'
                                                },

                                                path: {
                                                    component: 'path',
                                                    attr: {
                                                        'd': 'M13.3 3A9 9 0 0 0 4 12H2.2c-.5 0-.7.5-.3.8l2.7 2.8c.2.2.6.2.8 0L8 12.8c.4-.3.1-.8-.3-.8H6a7 7 0 1 1 2.7 5.5 1 1 0 0 0-1.3.1 1 1 0 0 0 0 1.5A9 9 0 0 0 22 11.7C22 7 18 3.1 13.4 3zm-.6 5c-.4 0-.7.3-.7.8v3.6c0 .4.2.7.5.9l3.1 1.8c.4.2.8.1 1-.2.2-.4.1-.8-.2-1l-3-1.8V8.7c0-.4-.2-.7-.7-.7z'
                                                    }
                                                }
                                            },
                                            label: {
                                                component: 'span',
                                                text: 'backupAndReset'
                                            }
                                        },
                                        date_and_time: {
                                            component: 'button',
                                            on: {
                                                click: {
                                                    section: {
                                                        component: 'section',
                                                        variant: 'card',

                                                        use_24_hour_format: {
                                                            component: 'switch',
                                                            text: 'use24HourFormat',
                                                            value: true
                                                        }
                                                    }
                                                }
                                            },

                                            svg: {
                                                component: 'svg',
                                                attr: {
                                                    'viewBox': '0 0 24 24',
                                                    'fill': 'currentColor'
                                                },

                                                path: {
                                                    component: 'path',
                                                    attr: {
                                                        'd': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-.2-13c-.5 0-.8.3-.8.7v4.7c0 .4.2.7.5.9l4.1 2.5c.4.2.8 0 1-.3.2-.3.1-.7-.2-1l-3.9-2.2V7.7c0-.4-.3-.7-.7-.7z'
                                                    }
                                                }
                                            },
                                            label: {
                                                component: 'span',
                                                text: 'dateAndTime'
                                            }
                                        },
                                        location: {
                                            component: 'button',
                                            on: {
                                                click: {
                                                    section: {
                                                        component: 'section',
                                                        variant: 'card',

                                                        default_content_country: {
                                                            component: 'select',
                                                            text: 'defaultContentCountry',

                                                            options: [{
                                                                    text: "default",
                                                                    value: "default"
                                                                },
                                                                {
                                                                    text: "Afghanistan",
                                                                    value: "AF"
                                                                },
                                                                {
                                                                    text: "Albania",
                                                                    value: "AL"
                                                                },
                                                                {
                                                                    text: "Algeria",
                                                                    value: "DZ"
                                                                },
                                                                {
                                                                    text: "American Samoa",
                                                                    value: "AS"
                                                                },
                                                                {
                                                                    text: "Andorra",
                                                                    value: "AD"
                                                                },
                                                                {
                                                                    text: "Angola",
                                                                    value: "AO"
                                                                },
                                                                {
                                                                    text: "Anguilla",
                                                                    value: "AI"
                                                                },
                                                                {
                                                                    text: "Antarctica",
                                                                    value: "AQ"
                                                                },
                                                                {
                                                                    text: "Antigua and Barbuda",
                                                                    value: "AG"
                                                                },
                                                                {
                                                                    text: "Argentina",
                                                                    value: "AR"
                                                                },
                                                                {
                                                                    text: "Armenia",
                                                                    value: "AM"
                                                                },
                                                                {
                                                                    text: "Aruba",
                                                                    value: "AW"
                                                                },
                                                                {
                                                                    text: "Australia",
                                                                    value: "AU"
                                                                },
                                                                {
                                                                    text: "Austria",
                                                                    value: "AT"
                                                                },
                                                                {
                                                                    text: "Azerbaijan",
                                                                    value: "AZ"
                                                                },
                                                                {
                                                                    text: "Bahrain",
                                                                    value: "BH"
                                                                },
                                                                {
                                                                    text: "Bailiwick of Guernsey",
                                                                    value: "GG"
                                                                },
                                                                {
                                                                    text: "Bangladesh",
                                                                    value: "BD"
                                                                },
                                                                {
                                                                    text: "Barbados",
                                                                    value: "BB"
                                                                },
                                                                {
                                                                    text: "Belarus",
                                                                    value: "BY"
                                                                },
                                                                {
                                                                    text: "Belgium",
                                                                    value: "BE"
                                                                },
                                                                {
                                                                    text: "Belize",
                                                                    value: "BZ"
                                                                },
                                                                {
                                                                    text: "Benin",
                                                                    value: "BJ"
                                                                },
                                                                {
                                                                    text: "Bermuda",
                                                                    value: "BM"
                                                                },
                                                                {
                                                                    text: "Bhutan",
                                                                    value: "BT"
                                                                },
                                                                {
                                                                    text: "Bolivia",
                                                                    value: "BO"
                                                                },
                                                                {
                                                                    text: "Bonaire",
                                                                    value: "BQ"
                                                                },
                                                                {
                                                                    text: "Bosnia and Herzegovina",
                                                                    value: "BA"
                                                                },
                                                                {
                                                                    text: "Botswana",
                                                                    value: "BW"
                                                                },
                                                                {
                                                                    text: "Bouvet Island",
                                                                    value: "BV"
                                                                },
                                                                {
                                                                    text: "Brazil",
                                                                    value: "BR"
                                                                },
                                                                {
                                                                    text: "British Indian Ocean Territory",
                                                                    value: "IO"
                                                                },
                                                                {
                                                                    text: "British Virgin Islands",
                                                                    value: "VG"
                                                                },
                                                                {
                                                                    text: "Brunei",
                                                                    value: "BN"
                                                                },
                                                                {
                                                                    text: "Bulgaria",
                                                                    value: "BG"
                                                                },
                                                                {
                                                                    text: "Burkina Faso",
                                                                    value: "BF"
                                                                },
                                                                {
                                                                    text: "Burundi",
                                                                    value: "BI"
                                                                },
                                                                {
                                                                    text: "Cambodia",
                                                                    value: "KH"
                                                                },
                                                                {
                                                                    text: "Cameroon",
                                                                    value: "CM"
                                                                },
                                                                {
                                                                    text: "Canada",
                                                                    value: "CA"
                                                                },
                                                                {
                                                                    text: "Cape Verde",
                                                                    value: "CV"
                                                                },
                                                                {
                                                                    text: "Cayman Islands",
                                                                    value: "KY"
                                                                },
                                                                {
                                                                    text: "Central African Republic",
                                                                    value: "CF"
                                                                },
                                                                {
                                                                    text: "Chad",
                                                                    value: "TD"
                                                                },
                                                                {
                                                                    text: "Chile",
                                                                    value: "CL"
                                                                },
                                                                {
                                                                    text: "China",
                                                                    value: "CN"
                                                                },
                                                                {
                                                                    text: "Christmas Island",
                                                                    value: "CX"
                                                                },
                                                                {
                                                                    text: "Cocos (Keeling) Islands",
                                                                    value: "CC"
                                                                },
                                                                {
                                                                    text: "Collectivity of Saint Martin",
                                                                    value: "MF"
                                                                },
                                                                {
                                                                    text: "Colombia",
                                                                    value: "CO"
                                                                },
                                                                {
                                                                    text: "Comoros",
                                                                    value: "KM"
                                                                },
                                                                {
                                                                    text: "Cook Islands",
                                                                    value: "CK"
                                                                },
                                                                {
                                                                    text: "Costa Rica",
                                                                    value: "CR"
                                                                },
                                                                {
                                                                    text: "Croatia",
                                                                    value: "HR"
                                                                },
                                                                {
                                                                    text: "Cuba",
                                                                    value: "CU"
                                                                },
                                                                {
                                                                    text: "Curaçao",
                                                                    value: "CW"
                                                                },
                                                                {
                                                                    text: "Cyprus",
                                                                    value: "CY"
                                                                },
                                                                {
                                                                    text: "Czech Republic",
                                                                    value: "CZ"
                                                                },
                                                                {
                                                                    text: "Democratic Republic of the Congo",
                                                                    value: "CD"
                                                                },
                                                                {
                                                                    text: "Denmark",
                                                                    value: "DK"
                                                                },
                                                                {
                                                                    text: "Djibouti",
                                                                    value: "DJ"
                                                                },
                                                                {
                                                                    text: "Dominica",
                                                                    value: "DM"
                                                                },
                                                                {
                                                                    text: "Dominican Republic",
                                                                    value: "DO"
                                                                },
                                                                {
                                                                    text: "East Timor",
                                                                    value: "TL"
                                                                },
                                                                {
                                                                    text: "Ecuador",
                                                                    value: "EC"
                                                                },
                                                                {
                                                                    text: "Egypt",
                                                                    value: "EG"
                                                                },
                                                                {
                                                                    text: "El Salvador",
                                                                    value: "SV"
                                                                },
                                                                {
                                                                    text: "Equatorial Guinea",
                                                                    value: "GQ"
                                                                },
                                                                {
                                                                    text: "Eritrea",
                                                                    value: "ER"
                                                                },
                                                                {
                                                                    text: "Estonia",
                                                                    value: "EE"
                                                                },
                                                                {
                                                                    text: "Eswatini",
                                                                    value: "SZ"
                                                                },
                                                                {
                                                                    text: "Ethiopia",
                                                                    value: "ET"
                                                                },
                                                                {
                                                                    text: "Falkland Islands",
                                                                    value: "FK"
                                                                },
                                                                {
                                                                    text: "Faroe Islands",
                                                                    value: "FO"
                                                                },
                                                                {
                                                                    text: "Federated States of Micronesia",
                                                                    value: "FM"
                                                                },
                                                                {
                                                                    text: "Fiji",
                                                                    value: "FJ"
                                                                },
                                                                {
                                                                    text: "Finland",
                                                                    value: "FI"
                                                                },
                                                                {
                                                                    text: "France",
                                                                    value: "FR"
                                                                },
                                                                {
                                                                    text: "French Guiana",
                                                                    value: "GF"
                                                                },
                                                                {
                                                                    text: "French Polynesia",
                                                                    value: "PF"
                                                                },
                                                                {
                                                                    text: "French Southern and Antarctic Lands",
                                                                    value: "TF"
                                                                },
                                                                {
                                                                    text: "Gabon",
                                                                    value: "GA"
                                                                },
                                                                {
                                                                    text: "Georgia (country)",
                                                                    value: "GE"
                                                                },
                                                                {
                                                                    text: "Germany",
                                                                    value: "DE"
                                                                },
                                                                {
                                                                    text: "Ghana",
                                                                    value: "GH"
                                                                },
                                                                {
                                                                    text: "Gibraltar",
                                                                    value: "GI"
                                                                },
                                                                {
                                                                    text: "Greece",
                                                                    value: "GR"
                                                                },
                                                                {
                                                                    text: "Greenland",
                                                                    value: "GL"
                                                                },
                                                                {
                                                                    text: "Grenada",
                                                                    value: "GD"
                                                                },
                                                                {
                                                                    text: "Guadeloupe",
                                                                    value: "GP"
                                                                },
                                                                {
                                                                    text: "Guam",
                                                                    value: "GU"
                                                                },
                                                                {
                                                                    text: "Guatemala",
                                                                    value: "GT"
                                                                },
                                                                {
                                                                    text: "Guinea",
                                                                    value: "GN"
                                                                },
                                                                {
                                                                    text: "Guinea-Bissau",
                                                                    value: "GW"
                                                                },
                                                                {
                                                                    text: "Guyana",
                                                                    value: "GY"
                                                                },
                                                                {
                                                                    text: "Haiti",
                                                                    value: "HT"
                                                                },
                                                                {
                                                                    text: "Heard Island and McDonald Islands",
                                                                    value: "HM"
                                                                },
                                                                {
                                                                    text: "Holy See",
                                                                    value: "VA"
                                                                },
                                                                {
                                                                    text: "Honduras",
                                                                    value: "HN"
                                                                },
                                                                {
                                                                    text: "Hong Kong",
                                                                    value: "HK"
                                                                },
                                                                {
                                                                    text: "Hungary",
                                                                    value: "HU"
                                                                },
                                                                {
                                                                    text: "Iceland",
                                                                    value: "IS"
                                                                },
                                                                {
                                                                    text: "India",
                                                                    value: "IN"
                                                                },
                                                                {
                                                                    text: "Indonesia",
                                                                    value: "ID"
                                                                },
                                                                {
                                                                    text: "Iran",
                                                                    value: "IR"
                                                                },
                                                                {
                                                                    text: "Iraq",
                                                                    value: "IQ"
                                                                },
                                                                {
                                                                    text: "Isle of Man",
                                                                    value: "IM"
                                                                },
                                                                {
                                                                    text: "Israel",
                                                                    value: "IL"
                                                                },
                                                                {
                                                                    text: "Italy",
                                                                    value: "IT"
                                                                },
                                                                {
                                                                    text: "Ivory Coast",
                                                                    value: "CI"
                                                                },
                                                                {
                                                                    text: "Jamaica",
                                                                    value: "JM"
                                                                },
                                                                {
                                                                    text: "Japan",
                                                                    value: "JP"
                                                                },
                                                                {
                                                                    text: "Jersey",
                                                                    value: "JE"
                                                                },
                                                                {
                                                                    text: "Jordan",
                                                                    value: "JO"
                                                                },
                                                                {
                                                                    text: "Kazakhstan",
                                                                    value: "KZ"
                                                                },
                                                                {
                                                                    text: "Kenya",
                                                                    value: "KE"
                                                                },
                                                                {
                                                                    text: "Kiribati",
                                                                    value: "KI"
                                                                },
                                                                {
                                                                    text: "Kuwait",
                                                                    value: "KW"
                                                                },
                                                                {
                                                                    text: "Kyrgyzstan",
                                                                    value: "KG"
                                                                },
                                                                {
                                                                    text: "Laos",
                                                                    value: "LA"
                                                                },
                                                                {
                                                                    text: "Latvia",
                                                                    value: "LV"
                                                                },
                                                                {
                                                                    text: "Lebanon",
                                                                    value: "LB"
                                                                },
                                                                {
                                                                    text: "Lesotho",
                                                                    value: "LS"
                                                                },
                                                                {
                                                                    text: "Liberia",
                                                                    value: "LR"
                                                                },
                                                                {
                                                                    text: "Libya",
                                                                    value: "LY"
                                                                },
                                                                {
                                                                    text: "Liechtenstein",
                                                                    value: "LI"
                                                                },
                                                                {
                                                                    text: "Lithuania",
                                                                    value: "LT"
                                                                },
                                                                {
                                                                    text: "Luxembourg",
                                                                    value: "LU"
                                                                },
                                                                {
                                                                    text: "Macau",
                                                                    value: "MO"
                                                                },
                                                                {
                                                                    text: "Madagascar",
                                                                    value: "MG"
                                                                },
                                                                {
                                                                    text: "Malawi",
                                                                    value: "MW"
                                                                },
                                                                {
                                                                    text: "Malaysia",
                                                                    value: "MY"
                                                                },
                                                                {
                                                                    text: "Maldives",
                                                                    value: "MV"
                                                                },
                                                                {
                                                                    text: "Mali",
                                                                    value: "ML"
                                                                },
                                                                {
                                                                    text: "Malta",
                                                                    value: "MT"
                                                                },
                                                                {
                                                                    text: "Marshall Islands",
                                                                    value: "MH"
                                                                },
                                                                {
                                                                    text: "Martinique",
                                                                    value: "MQ"
                                                                },
                                                                {
                                                                    text: "Mauritania",
                                                                    value: "MR"
                                                                },
                                                                {
                                                                    text: "Mauritius",
                                                                    value: "MU"
                                                                },
                                                                {
                                                                    text: "Mayotte",
                                                                    value: "YT"
                                                                },
                                                                {
                                                                    text: "Mexico",
                                                                    value: "MX"
                                                                },
                                                                {
                                                                    text: "Moldova",
                                                                    value: "MD"
                                                                },
                                                                {
                                                                    text: "Monaco",
                                                                    value: "MC"
                                                                },
                                                                {
                                                                    text: "Mongolia",
                                                                    value: "MN"
                                                                },
                                                                {
                                                                    text: "Montenegro",
                                                                    value: "ME"
                                                                },
                                                                {
                                                                    text: "Montserrat",
                                                                    value: "MS"
                                                                },
                                                                {
                                                                    text: "Morocco",
                                                                    value: "MA"
                                                                },
                                                                {
                                                                    text: "Mozambique",
                                                                    value: "MZ"
                                                                },
                                                                {
                                                                    text: "Myanmar",
                                                                    value: "MM"
                                                                },
                                                                {
                                                                    text: "Namibia",
                                                                    value: "NA"
                                                                },
                                                                {
                                                                    text: "Nauru",
                                                                    value: "NR"
                                                                },
                                                                {
                                                                    text: "Nepal",
                                                                    value: "NP"
                                                                },
                                                                {
                                                                    text: "Netherlands",
                                                                    value: "NL"
                                                                },
                                                                {
                                                                    text: "New Caledonia",
                                                                    value: "NC"
                                                                },
                                                                {
                                                                    text: "New Zealand",
                                                                    value: "NZ"
                                                                },
                                                                {
                                                                    text: "Nicaragua",
                                                                    value: "NI"
                                                                },
                                                                {
                                                                    text: "Niger",
                                                                    value: "NE"
                                                                },
                                                                {
                                                                    text: "Nigeria",
                                                                    value: "NG"
                                                                },
                                                                {
                                                                    text: "Niue",
                                                                    value: "NU"
                                                                },
                                                                {
                                                                    text: "Norfolk Island",
                                                                    value: "NF"
                                                                },
                                                                {
                                                                    text: "North Korea",
                                                                    value: "KP"
                                                                },
                                                                {
                                                                    text: "North Macedonia",
                                                                    value: "MK"
                                                                },
                                                                {
                                                                    text: "Northern Mariana Islands",
                                                                    value: "MP"
                                                                },
                                                                {
                                                                    text: "Norway",
                                                                    value: "NO"
                                                                },
                                                                {
                                                                    text: "Oman",
                                                                    value: "OM"
                                                                },
                                                                {
                                                                    text: "Pakistan",
                                                                    value: "PK"
                                                                },
                                                                {
                                                                    text: "Palau",
                                                                    value: "PW"
                                                                },
                                                                {
                                                                    text: "Panama",
                                                                    value: "PA"
                                                                },
                                                                {
                                                                    text: "Papua New Guinea",
                                                                    value: "PG"
                                                                },
                                                                {
                                                                    text: "Paraguay",
                                                                    value: "PY"
                                                                },
                                                                {
                                                                    text: "Peru",
                                                                    value: "PE"
                                                                },
                                                                {
                                                                    text: "Philippines",
                                                                    value: "PH"
                                                                },
                                                                {
                                                                    text: "Pitcairn Islands",
                                                                    value: "PN"
                                                                },
                                                                {
                                                                    text: "Poland",
                                                                    value: "PL"
                                                                },
                                                                {
                                                                    text: "Portugal",
                                                                    value: "PT"
                                                                },
                                                                {
                                                                    text: "Puerto Rico",
                                                                    value: "PR"
                                                                },
                                                                {
                                                                    text: "Qatar",
                                                                    value: "QA"
                                                                },
                                                                {
                                                                    text: "Republic of Ireland",
                                                                    value: "IE"
                                                                },
                                                                {
                                                                    text: "Republic of the Congo",
                                                                    value: "CG"
                                                                },
                                                                {
                                                                    text: "Romania",
                                                                    value: "RO"
                                                                },
                                                                {
                                                                    text: "Russia",
                                                                    value: "RU"
                                                                },
                                                                {
                                                                    text: "Rwanda",
                                                                    value: "RW"
                                                                },
                                                                {
                                                                    text: "Réunion",
                                                                    value: "RE"
                                                                },
                                                                {
                                                                    text: "Saint Barthélemy",
                                                                    value: "BL"
                                                                },
                                                                {
                                                                    text: "Saint Helena",
                                                                    value: "SH"
                                                                },
                                                                {
                                                                    text: "Saint Kitts and Nevis",
                                                                    value: "KN"
                                                                },
                                                                {
                                                                    text: "Saint Lucia",
                                                                    value: "LC"
                                                                },
                                                                {
                                                                    text: "Saint Pierre and Miquelon",
                                                                    value: "PM"
                                                                },
                                                                {
                                                                    text: "Saint Vincent and the Grenadines",
                                                                    value: "VC"
                                                                },
                                                                {
                                                                    text: "Samoa",
                                                                    value: "WS"
                                                                },
                                                                {
                                                                    text: "San Marino",
                                                                    value: "SM"
                                                                },
                                                                {
                                                                    text: "Saudi Arabia",
                                                                    value: "SA"
                                                                },
                                                                {
                                                                    text: "Senegal",
                                                                    value: "SN"
                                                                },
                                                                {
                                                                    text: "Serbia",
                                                                    value: "RS"
                                                                },
                                                                {
                                                                    text: "Seychelles",
                                                                    value: "SC"
                                                                },
                                                                {
                                                                    text: "Sierra Leone",
                                                                    value: "SL"
                                                                },
                                                                {
                                                                    text: "Singapore",
                                                                    value: "SG"
                                                                },
                                                                {
                                                                    text: "Sint Maarten",
                                                                    value: "SX"
                                                                },
                                                                {
                                                                    text: "Slovakia",
                                                                    value: "SK"
                                                                },
                                                                {
                                                                    text: "Slovenia",
                                                                    value: "SI"
                                                                },
                                                                {
                                                                    text: "Solomon Islands",
                                                                    value: "SB"
                                                                },
                                                                {
                                                                    text: "Somalia",
                                                                    value: "SO"
                                                                },
                                                                {
                                                                    text: "South Africa",
                                                                    value: "ZA"
                                                                },
                                                                {
                                                                    text: "South Georgia and the South Sandwich Islands",
                                                                    value: "GS"
                                                                },
                                                                {
                                                                    text: "South Korea",
                                                                    value: "KR"
                                                                },
                                                                {
                                                                    text: "South Sudan",
                                                                    value: "SS"
                                                                },
                                                                {
                                                                    text: "Spain",
                                                                    value: "ES"
                                                                },
                                                                {
                                                                    text: "Sri Lanka",
                                                                    value: "LK"
                                                                },
                                                                {
                                                                    text: "State of Palestine",
                                                                    value: "PS"
                                                                },
                                                                {
                                                                    text: "Sudan",
                                                                    value: "SD"
                                                                },
                                                                {
                                                                    text: "Suriname",
                                                                    value: "SR"
                                                                },
                                                                {
                                                                    text: "Svalbard",
                                                                    value: "SJ"
                                                                },
                                                                {
                                                                    text: "Sweden",
                                                                    value: "SE"
                                                                },
                                                                {
                                                                    text: "Switzerland",
                                                                    value: "CH"
                                                                },
                                                                {
                                                                    text: "Syria",
                                                                    value: "SY"
                                                                },
                                                                {
                                                                    text: "São Tomé and Príncipe",
                                                                    value: "ST"
                                                                },
                                                                {
                                                                    text: "Taiwan",
                                                                    value: "TW"
                                                                },
                                                                {
                                                                    text: "Tajikistan",
                                                                    value: "TJ"
                                                                },
                                                                {
                                                                    text: "Tanzania",
                                                                    value: "TZ"
                                                                },
                                                                {
                                                                    text: "Thailand",
                                                                    value: "TH"
                                                                },
                                                                {
                                                                    text: "The Bahamas",
                                                                    value: "BS"
                                                                },
                                                                {
                                                                    text: "The Gambia",
                                                                    value: "GM"
                                                                },
                                                                {
                                                                    text: "Togo",
                                                                    value: "TG"
                                                                },
                                                                {
                                                                    text: "Tokelau",
                                                                    value: "TK"
                                                                },
                                                                {
                                                                    text: "Tonga",
                                                                    value: "TO"
                                                                },
                                                                {
                                                                    text: "Trinidad and Tobago",
                                                                    value: "TT"
                                                                },
                                                                {
                                                                    text: "Tunisia",
                                                                    value: "TN"
                                                                },
                                                                {
                                                                    text: "Turkey",
                                                                    value: "TR"
                                                                },
                                                                {
                                                                    text: "Turkmenistan",
                                                                    value: "TM"
                                                                },
                                                                {
                                                                    text: "Turks and Caicos Islands",
                                                                    value: "TC"
                                                                },
                                                                {
                                                                    text: "Tuvalu",
                                                                    value: "TV"
                                                                },
                                                                {
                                                                    text: "Uganda",
                                                                    value: "UG"
                                                                },
                                                                {
                                                                    text: "Ukraine",
                                                                    value: "UA"
                                                                },
                                                                {
                                                                    text: "United Arab Emirates",
                                                                    value: "AE"
                                                                },
                                                                {
                                                                    text: "United Kingdom",
                                                                    value: "GB"
                                                                },
                                                                {
                                                                    text: "United States Virgin Islands",
                                                                    value: "VI"
                                                                },
                                                                {
                                                                    text: "United States",
                                                                    value: "UM"
                                                                },
                                                                {
                                                                    text: "United States",
                                                                    value: "US"
                                                                },
                                                                {
                                                                    text: "Uruguay",
                                                                    value: "UY"
                                                                },
                                                                {
                                                                    text: "Uzbekistan",
                                                                    value: "UZ"
                                                                },
                                                                {
                                                                    text: "Vanuatu",
                                                                    value: "VU"
                                                                },
                                                                {
                                                                    text: "Venezuela",
                                                                    value: "VE"
                                                                },
                                                                {
                                                                    text: "Vietnam",
                                                                    value: "VN"
                                                                },
                                                                {
                                                                    text: "Wallis and Futuna",
                                                                    value: "WF"
                                                                },
                                                                {
                                                                    text: "Western Sahara",
                                                                    value: "EH"
                                                                },
                                                                {
                                                                    text: "Yemen",
                                                                    value: "YE"
                                                                },
                                                                {
                                                                    text: "Zambia",
                                                                    value: "ZM"
                                                                },
                                                                {
                                                                    text: "Zimbabwe",
                                                                    value: "ZW"
                                                                },
                                                                {
                                                                    text: "Åland Islands",
                                                                    value: "AX"
                                                                }
                                                            ]
                                                        }
                                                    }
                                                }
                                            },

                                            svg: {
                                                component: 'svg',
                                                attr: {
                                                    'viewBox': '0 0 24 24',
                                                    'fill': 'currentColor'
                                                },

                                                circle: {
                                                    component: 'circle',
                                                    attr: {
                                                        'cx': '12',
                                                        'cy': '9',
                                                        'r': '2.5'
                                                    }
                                                },
                                                path: {
                                                    component: 'path',
                                                    attr: {
                                                        'd': 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z'
                                                    }
                                                }
                                            },
                                            label: {
                                                component: 'span',
                                                text: 'location'
                                            }
                                        },
                                        about: {
                                            component: 'button',
                                            on: {
                                                click: {
                                                    component: 'span',

                                                    on: {
                                                        render: function () {
                                                            var component = this,
                                                                manifest = chrome.runtime.getManifest(),
                                                                user = satus.user(),
                                                                skeleton_about = {
                                                                    extension_section_label: {
                                                                        component: 'span',
                                                                        class: 'satus-section--label',
                                                                        text: 'extension'
                                                                    },
                                                                    extension_section: {
                                                                        component: 'section',
                                                                        variant: 'card',

                                                                        list: {
                                                                            component: 'list',
                                                                            items: [
                                                                                ['version', manifest.version],
                                                                                ['permissions', manifest.permissions.join(', ').replace('https://www.youtube.com/', 'YouTube')]
                                                                            ]
                                                                        }
                                                                    },
                                                                    browser_section_label: {
                                                                        component: 'span',
                                                                        class: 'satus-section--label',
                                                                        text: 'browser'
                                                                    },
                                                                    browser_section: {
                                                                        component: 'section',
                                                                        variant: 'card',

                                                                        list: {
                                                                            component: 'list',
                                                                            items: [
                                                                                ['name', user.browser.name],
                                                                                ['version', user.browser.version],
                                                                                ['platform', user.browser.platform],
                                                                                ['videoFormats', {
                                                                                    component: 'span',
                                                                                    on: {
                                                                                        render: function () {
                                                                                            var formats = [];

                                                                                            for (var key in user.browser.video) {
                                                                                                if (user.browser.video[key] !== false) {
                                                                                                    formats.push(key);
                                                                                                }
                                                                                            }

                                                                                            this.textContent = formats.join(', ');
                                                                                        }
                                                                                    }
                                                                                }],
                                                                                ['audioFormats', {
                                                                                    component: 'span',
                                                                                    on: {
                                                                                        render: function () {
                                                                                            var formats = [];

                                                                                            for (var key in user.browser.audio) {
                                                                                                if (user.browser.audio[key] !== false) {
                                                                                                    formats.push(key);
                                                                                                }
                                                                                            }

                                                                                            this.textContent = formats.join(', ');
                                                                                        }
                                                                                    }
                                                                                }],
                                                                                ['flash', !!user.browser.flash ? 'true' : 'false']
                                                                            ]
                                                                        }
                                                                    },
                                                                    os_section_label: {
                                                                        component: 'span',
                                                                        class: 'satus-section--label',
                                                                        text: 'os'
                                                                    },
                                                                    os_section: {
                                                                        component: 'section',
                                                                        variant: 'card',

                                                                        list: {
                                                                            component: 'list',
                                                                            items: [
                                                                                ['name', user.os.name],
                                                                                ['type', user.os.type]
                                                                            ]
                                                                        }
                                                                    },
                                                                    device_section_label: {
                                                                        component: 'span',
                                                                        class: 'satus-section--label',
                                                                        text: 'device'
                                                                    },
                                                                    device_section: {
                                                                        component: 'section',
                                                                        variant: 'card',

                                                                        list: {
                                                                            component: 'list',
                                                                            items: [
                                                                                ['screen', user.device.screen],
                                                                                ['cores', user.device.cores],
                                                                                ['gpu', user.device.gpu],
                                                                                ['ram', user.device.ram]
                                                                            ]
                                                                        }
                                                                    }
                                                                };

                                                            setTimeout(function () {
                                                                satus.render(skeleton_about, component.parentNode);

                                                                component.remove();
                                                            });
                                                        }
                                                    }
                                                }
                                            },

                                            svg: {
                                                component: 'svg',
                                                attr: {
                                                    'viewBox': '0 0 24 24',
                                                    'fill': 'currentColor'
                                                },

                                                path: {
                                                    component: 'path',
                                                    attr: {
                                                        'd': 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z'
                                                    }
                                                }
                                            },
                                            label: {
                                                component: 'span',
                                                text: 'about'
                                            }
                                        }
                                    }
                                }
                            },

                            svg: {
                                component: 'svg',
                                attr: {
                                    'viewBox': '0 0 24 24',
                                    'stroke-width': '1.75'
                                },

                                circle: {
                                    component: 'circle',
                                    attr: {
                                        'cx': '12',
                                        'cy': '12',
                                        'r': '3'
                                    }
                                },
                                path: {
                                    component: 'path',
                                    attr: {
                                        'd': 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z'
                                    }
                                }
                            },
                            label: {
                                component: 'span',
                                text: 'settings'
                            }
                        },
                        mixer: {
                            component: 'button',
                            on: {
                                click: {
                                    component: 'section',
                                    on: {
                                        render: function () {
                                            var component = this;

                                            this.skeleton.parent.parent.rendered.close();

                                            if (chrome && chrome.tabs) {
                                                chrome.tabs.query({}, function (tabs) {
                                                    var mixer = {};

                                                    for (var i = 0, l = tabs.length; i < l; i++) {
                                                        if (tabs[i].hasOwnProperty('url')) {
                                                            var tab = tabs[i];

                                                            if (/(\?|\&)v=/.test(tab.url)) {
                                                                mixer[i] = {
                                                                    component: 'section',
                                                                    class: 'satus-section--mixer',
                                                                    style: {
                                                                        'background': 'url(https://img.youtube.com/vi/' + tab.url.match(/(\?|\&)v=[^&]+/)[0].substr(3) + '/0.jpg) center center / cover no-repeat #000',
                                                                    },

                                                                    title: {
                                                                        component: 'h1',
                                                                        text: tab.title
                                                                    },
                                                                    section: {
                                                                        component: 'section',
                                                                        data: {
                                                                            'noConnectionLabel': satus.locale.get('tryToReloadThePage') || 'tryToReloadThePage'
                                                                        },

                                                                        mixer_volume: {
                                                                            component: 'slider',
                                                                            text: 'volume',
                                                                            data: {
                                                                                id: tab.id
                                                                            },
                                                                            max: 100,
                                                                            on: {
                                                                                render: function () {
                                                                                    var self = this;

                                                                                    chrome.tabs.sendMessage(Number(this.dataset.id), {
                                                                                        action: 'request-volume'
                                                                                    }, function (response) {
                                                                                        if (response) {
                                                                                            self.value = response;
                                                                                        } else {
                                                                                            self.parentNode.parentNode.classList.add('noconnection');
                                                                                        }
                                                                                    });
                                                                                },
                                                                                change: function () {
                                                                                    console.log(this.value);
                                                                                    chrome.tabs.sendMessage(Number(this.dataset.id), {
                                                                                        action: 'set-volume',
                                                                                        value: this.value
                                                                                    });
                                                                                }
                                                                            }
                                                                        },
                                                                        mixer_playback_speed: {
                                                                            component: 'slider',
                                                                            text: 'playbackSpeed',
                                                                            data: {
                                                                                id: tab.id
                                                                            },
                                                                            min: .1,
                                                                            max: 8,
                                                                            step: .05,
                                                                            on: {
                                                                                render: function () {
                                                                                    var self = this;

                                                                                    chrome.tabs.sendMessage(Number(this.dataset.id), {
                                                                                        action: 'request-playback-speed'
                                                                                    }, function (response) {
                                                                                        if (response) {
                                                                                            self.value = response;
                                                                                        } else {
                                                                                            self.parentNode.parentNode.classList.add('noconnection');
                                                                                        }
                                                                                    });
                                                                                },
                                                                                change: function () {
                                                                                    chrome.tabs.sendMessage(Number(this.dataset.id), {
                                                                                        action: 'set-playback-speed',
                                                                                        value: this.value
                                                                                    });
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                };
                                                            }
                                                        }
                                                    }

                                                    if (Object.entries(mixer).length === 0) {
                                                        mixer = {
                                                            component: 'section',
                                                            variant: 'card',
                                                            parent: component.skeleton,

                                                            message: {
                                                                component: 'span',
                                                                text: 'noOpenVideoTabs'
                                                            }
                                                        };
                                                    }

                                                    satus.render(mixer, component.parentNode);
                                                });
                                            }
                                        }
                                    }
                                }
                            },

                            svg: {
                                component: 'svg',
                                attr: {
                                    'viewBox': '0 0 24 24',
                                    'stroke-width': '1.75'
                                },

                                path: {
                                    component: 'path',
                                    attr: {
                                        'd': 'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07'
                                    }
                                }
                            },
                            label: {
                                component: 'span',
                                text: 'mixer'
                            }
                        }
                    }
                },

                svg: {
                    component: 'svg',
                    attr: {
                        'viewBox': '0 0 24 24',
                        'stroke-width': '2'
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
    },
    layers: {
        component: 'layers',
        on: {
            open: function () {
                var skeleton = this.path[this.path.length - 1],
                    parent = skeleton.parent,
                    section = this.base.skeleton.header.section_start,
                    title = 'ImprovedTube';

                if (parent) {
                    if (parent.label) {
                        title = parent.label.text;
                    } else if (parent.text) {
                        title = parent.text;
                    }
                }

                section.back.rendered.hidden = this.path.length <= 1;
                section.title.rendered.innerText = satus.locale.get(title);
            }
        },

        section: {
            component: 'section',
            variant: 'home',

            general: {
                component: 'button',
                variant: 'general',
                category: true,
                on: {
                    click: {
                        component: 'section',
                        variant: 'card',

                        youtube_home_page: {
                            component: 'select',
                            text: 'youtubeHomePage',
                            options: [{
                                text: 'home',
                                value: '/'
                            }, {
                                text: 'trending',
                                value: '/feed/trending'
                            }, {
                                text: 'subscriptions',
                                value: '/feed/subscriptions'
                            }, {
                                text: 'history',
                                value: '/feed/history'
                            }, {
                                text: 'watchLater',
                                value: '/playlist?list=WL'
                            }, {
                                text: 'search',
                                value: 'search'
                            }, {
                                text: 'liked',
                                value: '/playlist?list=LL'
                            }, {
                                text: 'library',
                                value: '/feed/library'
                            }],
                            tags: 'trending,subscriptions,history,watch,search'
                        },
                        collapse_of_subscription_sections: {
                            component: 'switch',
                            text: 'collapseOfSubscriptionSections'
                        },
                        remove_related_search_results: {
                            component: 'switch',
                            text: 'removeRelatedSearchResults'
                        },
                        mark_watched_videos: {
                            component: 'switch',
                            text: 'markWatchedVideos',
                            on: {
                                click: function () {
                                    if (satus.storage.get('mark_watched_videos')) {
                                        if (!satus.storage.get('track_watched_videos')) {
                                            this.nextSibling.click();
                                        }
                                    }
                                }
                            }
                        },
                        track_watched_videos: {
                            component: 'switch',
                            text: 'trackWatchedVideos'
                        },
                        delete_watched_videos: {
                            component: 'button',
                            style: {
                                'justifyContent': 'space-between'
                            },
                            on: {
                                click: {
                                    component: 'modal',
                                    variant: 'confirm',

                                    message: {
                                        component: 'span',
                                        text: 'thisWillRemoveAllWatchedVideos',
                                        style: {
                                            'width': '100%',
                                            'opacity': '.8'
                                        }
                                    },
                                    section: {
                                        component: 'section',
                                        variant: 'actions',

                                        cancel: {
                                            component: 'button',
                                            text: 'cancel',
                                            on: {
                                                click: function () {
                                                    this.parentNode.parentNode.parentNode.close();
                                                }
                                            }
                                        },
                                        accept: {
                                            component: 'button',
                                            text: 'accept',
                                            on: {
                                                click: function () {
                                                    var modal = this.parentNode.parentNode.parentNode;

                                                    satus.storage.set('watched', {});

                                                    console.log(modal.skeleton);

                                                    modal.skeleton.parent.counter.rendered.textContent = '0';

                                                    modal.close();
                                                }
                                            }
                                        }
                                    }
                                }
                            },

                            label: {
                                component: 'span',
                                text: 'deleteWatchedVideos'
                            },
                            counter: {
                                component: 'span',
                                style: {
                                    opacity: .75
                                },
                                on: {
                                    render: function () {
                                        var watched = satus.storage.get('watched');

                                        if (watched) {
                                            this.textContent = Object.keys(watched).length;
                                        } else {
                                            this.textContent = '0';
                                        }
                                    }
                                }
                            }
                        },
                        only_one_player_instance_playing: {
                            component: 'switch',
                            text: 'onlyOnePlayerInstancePlaying'
                        },
                        confirmation_before_closing: {
                            component: 'switch',
                            text: 'confirmationBeforeClosing',
                            tags: 'random prevent close exit'
                        },
                        add_scroll_to_top: {
                            component: 'switch',
                            text: 'addScrollToTop',
                            tags: 'up'
                        },
                        limit_page_width: {
                            component: 'switch',
                            text: 'limitPageWidth',
                            value: true
                        },
                        squared_user_images: {
                            component: 'switch',
                            text: 'squaredUserImages',
                            tags: 'avatar'
                        },
                        thumbnails_quality: {
                            component: 'select',
                            text: 'thumbnailsQuality',
                            options: [{
                                text: 'default',
                                value: 'null'
                            }, {
                                text: 'low',
                                value: 'default'
                            }, {
                                text: 'medium',
                                value: 'mqdefault'
                            }, {
                                text: 'high',
                                value: 'hqdefault'
                            }, {
                                text: 'sd',
                                value: 'sddefault'
                            }, {
                                text: 'hd',
                                value: 'maxresdefault'
                            }],
                            tags: 'preview quality'
                        },
                        hide_animated_thumbnails: {
                            component: 'switch',
                            text: 'hideAnimatedThumbnails',
                            tags: 'preview'
                        },
                        hide_thumbnail_overlay: {
                            component: 'switch',
                            text: 'hideThumbnailOverlay',
                            tags: 'preview'
                        }
                    }
                },

                icon: {
                    component: 'span',

                    svg: {
                        component: 'svg',
                        attr: {
                            'viewBox': '0 0 24 24',
                            'fill': 'none',
                            'stroke': 'currentColor',
                            'stroke-linecap': 'round',
                            'stroke-width': '1.75'
                        },

                        path: {
                            component: 'path',
                            attr: {
                                'd': 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7'
                            }
                        }
                    }
                },
                label: {
                    component: 'span',
                    text: 'general'
                }
            },
            appearance: {
                component: 'button',
                variant: 'appearance',
                category: true,
                on: {
                    click: {
                        component: 'section',
                        class: 'satus-section--appearance',

                        header: {
                            component: 'button',
                            text: 'header',
                            class: 'satus-button--header',
                            on: {
                                click: {
                                    component: 'section',
                                    variant: 'card',

                                    header_position: {
                                        component: 'select',
                                        text: 'position',
                                        options: [{
                                            text: 'normal',
                                            value: 'normal'
                                        }, {
                                            text: 'hidden',
                                            value: 'hidden'
                                        }, {
                                            text: 'hover',
                                            value: 'hover'
                                        }, {
                                            text: 'hiddenOnVideoPage',
                                            value: 'hidden_on_video_page'
                                        }, {
                                            text: 'hoverOnVideoPage',
                                            value: 'hover_on_video_page'
                                        }, {
                                            text: 'static',
                                            value: 'static'
                                        }],
                                        tags: 'hide,hover,static,top'
                                    },
                                    header_improve_logo: {
                                        component: 'switch',
                                        text: 'improveLogo',
                                        tags: 'youtube'
                                    },
                                    header_hide_right_buttons: {
                                        component: 'switch',
                                        text: 'hideRightButtons',
                                        tags: 'user'
                                    },
                                    header_hide_country_code: {
                                        component: 'switch',
                                        text: 'hideCountryCode',
                                        tags: 'country,code'
                                    },
                                    hide_voice_search_button: {
                                        component: 'switch',
                                        text: 'hideVoiceSearchButton'
                                    }
                                }
                            }
                        },
                        player: {
                            component: 'button',
                            text: 'player',
                            class: 'satus-button--player',
                            on: {
                                click: {
                                    component: 'section',
                                    variant: 'card',

                                    player_size: {
                                        component: 'select',
                                        text: 'playerSize',
                                        options: [{
                                            text: 'doNotChange',
                                            value: 'do_not_change'
                                        }, {
                                            text: 'fullWindow',
                                            value: 'full_window'
                                        }, {
                                            text: 'fitToWindow',
                                            value: 'fit_to_window'
                                        }, {
                                            text: '144p',
                                            value: '144p'
                                        }, {
                                            text: '240p',
                                            value: '240p'
                                        }, {
                                            text: '360p',
                                            value: '360p'
                                        }, {
                                            text: '480p',
                                            value: '480p'
                                        }, {
                                            text: '576p',
                                            value: '576p'
                                        }, {
                                            text: '720p',
                                            value: '720p'
                                        }, {
                                            text: '1080p',
                                            value: '1080p'
                                        }, {
                                            text: '1440p',
                                            value: '1440p'
                                        }, {
                                            text: '2160p',
                                            value: '2160p'
                                        }]
                                    },
                                    forced_theater_mode: {
                                        component: 'switch',
                                        text: 'forcedTheaterMode',
                                        tags: 'wide'
                                    },
                                    hide_gradient_bottom: {
                                        component: 'switch',
                                        text: 'hideGradientBottom'
                                    },
                                    player_hide_skip_overlay: {
                                        component: 'switch',
                                        text: 'hideSkipOverlay',
                                        value: false,
                                        tags: 'remove,hide'
                                    },
                                    player_remaining_duration: {
                                        component: 'switch',
                                        text: 'showRemainingDuration',
                                        value: false
                                    },
                                    always_show_progress_bar: {
                                        component: 'switch',
                                        text: 'alwaysShowProgressBar'
                                    },
                                    player_color: {
                                        component: 'select',
                                        text: 'playerColor',
                                        options: [{
                                            text: 'red',
                                            value: 'red'
                                        }, {
                                            text: 'pink',
                                            value: 'pink'
                                        }, {
                                            text: 'purple',
                                            value: 'purple'
                                        }, {
                                            text: 'deepPurple',
                                            value: 'deep_purple'
                                        }, {
                                            text: 'indigo',
                                            value: 'indigo'
                                        }, {
                                            text: 'blue',
                                            value: 'blue'
                                        }, {
                                            text: 'lightBlue',
                                            value: 'light_blue'
                                        }, {
                                            text: 'cyan',
                                            value: 'cyan'
                                        }, {
                                            text: 'teal',
                                            value: 'teal'
                                        }, {
                                            text: 'green',
                                            value: 'green'
                                        }, {
                                            text: 'lightGreen',
                                            value: 'light_green'
                                        }, {
                                            text: 'lime',
                                            value: 'lime'
                                        }, {
                                            text: 'yellow',
                                            value: 'yellow'
                                        }, {
                                            text: 'amber',
                                            value: 'amber'
                                        }, {
                                            text: 'orange',
                                            value: 'orange'
                                        }, {
                                            text: 'deepOrange',
                                            value: 'deep_orange'
                                        }, {
                                            text: 'brown',
                                            value: 'brown'
                                        }, {
                                            text: 'blueGray',
                                            value: 'blue_gray'
                                        }, {
                                            text: 'white',
                                            value: 'white'
                                        }],
                                        tags: 'style'
                                    },
                                    player_transparent_background: {
                                        component: 'switch',
                                        text: 'transparentBackground'
                                    },
                                    player_hide_annotations: {
                                        component: 'switch',
                                        text: 'hideAnnotations',
                                        tags: 'hide,remove,elements'
                                    },
                                    player_hide_cards: {
                                        component: 'switch',
                                        text: 'hideCards',
                                        tags: 'hide,remove,elements'
                                    },
                                    player_show_cards_on_mouse_hover: {
                                        component: 'switch',
                                        text: 'showCardsOnMouseHover',
                                        tags: 'hide,remove,elements'
                                    },
                                    player_hide_endscreen: {
                                        component: 'switch',
                                        text: 'hideEndscreen'
                                    },
                                    player_hd_thumbnail: {
                                        component: 'switch',
                                        text: 'hdThumbnail',
                                        tags: 'preview'
                                    },
                                    hide_scroll_for_details: {
                                        component: 'switch',
                                        text: 'hideScrollForDetails',
                                        tags: 'remove,hide'
                                    }
                                }
                            }
                        },
                        details: {
                            component: 'button',
                            text: 'details',
                            class: 'satus-button--details',
                            on: {
                                click: {
                                    component: 'section',
                                    variant: 'card',

                                    hide_details: {
                                        component: 'switch',
                                        text: 'hideDetails',
                                        tags: 'hide,remove'
                                    },
                                    hide_views_count: {
                                        component: 'switch',
                                        text: 'hideViewsCount',
                                        tags: 'hide,remove'
                                    },
                                    hide_date: {
                                        component: 'switch',
                                        text: 'hideDate',
                                        tags: 'hide,remove'
                                    },
                                    likes: {
                                        component: 'select',
                                        text: 'likes',

                                        options: [{
                                            text: 'normal',
                                            value: 'normal'
                                        }, {
                                            text: 'iconsOnly',
                                            value: 'icons_only'
                                        }, {
                                            text: 'hidden',
                                            value: 'hidden'
                                        }],
                                        tags: 'hide,remove'
                                    },
                                    hide_share_button: {
                                        component: 'switch',
                                        text: 'hideShareButton',
                                        tags: 'hide,remove'
                                    },
                                    hide_save_button: {
                                        component: 'switch',
                                        text: 'hideSaveButton',
                                        tags: 'hide,remove'
                                    },
                                    hide_more_button: {
                                        component: 'switch',
                                        text: 'hideMoreButton',
                                        tags: 'hide,remove'
                                    },
                                    description: {
                                        component: 'select',
                                        text: 'description',

                                        options: [{
                                            text: 'normal',
                                            value: 'normal'
                                        }, {
                                            text: 'expanded',
                                            value: 'expanded'
                                        }, {
                                            text: 'hidden',
                                            value: 'hidden'
                                        }],
                                        tags: 'hide,remove'
                                    },
                                    how_long_ago_the_video_was_uploaded: {
                                        component: 'switch',
                                        text: 'howLongAgoTheVideoWasUploaded'
                                    },
                                    channel_videos_count: {
                                        component: 'switch',
                                        text: 'showChannelVideosCount'
                                    },
                                    red_dislike_button: {
                                        component: 'switch',
                                        text: 'redDislikeButton'
                                    }
                                }
                            }
                        },
                        sidebar: {
                            component: 'button',
                            text: 'sidebar',
                            class: 'satus-button--sidebar',
                            on: {
                                click: {
                                    component: 'section',
                                    variant: 'card',

                                    related_videos: {
                                        component: 'select',
                                        text: 'relatedVideos',
                                        options: [{
                                            text: 'normal',
                                            value: 'normal'
                                        }, {
                                            text: 'collapsed',
                                            value: 'collapsed'
                                        }, {
                                            text: 'hidden',
                                            value: 'hidden'
                                        }],
                                        tags: 'right'
                                    },
                                    livechat: {
                                        component: 'select',
                                        text: 'liveChat',

                                        options: [{
                                            text: 'normal',
                                            value: 'normal'
                                        }, {
                                            text: 'collapsed',
                                            value: 'collapsed'
                                        }, {
                                            text: 'hidden',
                                            value: 'hidden'
                                        }]
                                    },
                                    hide_playlist: {
                                        component: 'switch',
                                        text: 'hidePlaylist'
                                    },
                                    sidebar_left: {
                                        component: 'switch',
                                        text: 'moveSidebarLeft'
                                    },
                                    thumbnails_right: {
                                        component: 'switch',
                                        text: 'moveThumbnailsRight'
                                    },
                                    thumbnails_hide: {
                                        component: 'switch',
                                        text: 'hideThumbnails'
                                    }
                                }
                            }
                        },
                        comments: {
                            component: 'button',
                            text: 'comments',
                            class: 'satus-button--comments',
                            on: {
                                click: {
                                    component: 'section',
                                    variant: 'card',

                                    comments: {
                                        component: 'select',
                                        text: 'comments',

                                        options: [{
                                            text: 'normal',
                                            value: 'normal'
                                        }, {
                                            text: 'collapsed',
                                            value: 'collapsed'
                                        }, {
                                            text: 'hidden',
                                            value: 'hidden'
                                        }]
                                    }
                                }
                            }
                        },
                        footer: {
                            component: 'button',
                            text: 'footer',
                            class: 'satus-button--footer',
                            on: {
                                click: {
                                    component: 'section',
                                    variant: 'card',

                                    hide_footer: {
                                        component: 'switch',
                                        text: 'hideFooter',
                                        tags: 'bottom'
                                    }
                                }
                            }
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
                                'd': 'M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z'
                            }
                        }
                    }
                },
                label: {
                    component: 'span',
                    text: 'appearance'
                }
            },
            themes: {
                component: 'button',
                class: 'satus-button--themes',
                category: true,
                on: {
                    click: {
                        section: {
                            component: 'section',
                            variant: 'card',

                            my_colors: {
                                component: 'button',
                                text: 'myColors',
                                on: {
                                    click: {
                                        section: {
                                            component: 'section',
                                            variant: 'card',

                                            theme_my_colors: {
                                                component: 'switch',
                                                text: 'activate',
                                                storage: false,
                                                on: {
                                                    render: function () {
                                                        this.dataset.value = satus.storage.get('theme') === 'my-colors';
                                                    },
                                                    click: function () {
                                                        var value = 'default';

                                                        if (this.dataset.value === 'true') {
                                                            value = 'my-colors';
                                                        }

                                                        satus.storage.set('theme', value);
                                                    }
                                                }
                                            }
                                        },

                                        section2: {
                                            component: 'section',
                                            variant: 'card',

                                            theme_primary_color: {
                                                component: 'color-picker',
                                                text: 'primaryColor',
                                                value: [200, 200, 200]
                                            },
                                            theme_text_color: {
                                                component: 'color-picker',
                                                text: 'textColor',
                                                value: [25, 25, 25]
                                            }
                                        }
                                    }
                                }
                            },
                            filters: {
                                component: 'button',
                                text: 'filters',
                                on: {
                                    click: {
                                        component: 'section',
                                        variant: 'card',

                                        bluelight: {
                                            component: 'slider',
                                            text: 'bluelight',
                                            step: 1,
                                            max: 90,
                                            value: 0
                                        },
                                        dim: {
                                            component: 'slider',
                                            text: 'dim',
                                            step: 1,
                                            max: 90,
                                            value: 0
                                        }
                                    }
                                }
                            },
                            schedule: {
                                component: 'button',
                                text: 'schedule',
                                on: {
                                    click: {
                                        component: 'section',
                                        variant: 'card',

                                        schedule: {
                                            component: 'select',
                                            text: 'schedule',

                                            options: [{
                                                text: 'disabled',
                                                value: 'disabled'
                                            }, {
                                                text: 'sunsetToSunrise',
                                                value: 'sunset_to_sunrise'
                                            }, {
                                                text: 'systemPeferenceDark',
                                                value: 'system_peference_dark'
                                            }, {
                                                text: 'systemPeferenceLight',
                                                value: 'system_peference_light'
                                            }]
                                        },
                                        schedule_time_from: {
                                            component: 'select',
                                            text: 'timeFrom',
                                            options: [{
                                                text: '00:00',
                                                value: '00:00'
                                            }, {
                                                text: '01:00',
                                                value: '01:00'
                                            }, {
                                                text: '02:00',
                                                value: '02:00'
                                            }, {
                                                text: '03:00',
                                                value: '03:00'
                                            }, {
                                                text: '04:00',
                                                value: '04:00'
                                            }, {
                                                text: '05:00',
                                                value: '05:00'
                                            }, {
                                                text: '06:00',
                                                value: '06:00'
                                            }, {
                                                text: '07:00',
                                                value: '07:00'
                                            }, {
                                                text: '08:00',
                                                value: '08:00'
                                            }, {
                                                text: '09:00',
                                                value: '09:00'
                                            }, {
                                                text: '10:00',
                                                value: '10:00'
                                            }, {
                                                text: '11:00',
                                                value: '11:00'
                                            }, {
                                                text: '12:00',
                                                value: '12:00'
                                            }, {
                                                text: '13:00',
                                                value: '13:00'
                                            }, {
                                                text: '14:00',
                                                value: '14:00'
                                            }, {
                                                text: '15:00',
                                                value: '15:00'
                                            }, {
                                                text: '16:00',
                                                value: '16:00'
                                            }, {
                                                text: '17:00',
                                                value: '17:00'
                                            }, {
                                                text: '18:00',
                                                value: '18:00'
                                            }, {
                                                text: '19:00',
                                                value: '19:00'
                                            }, {
                                                text: '20:00',
                                                value: '20:00'
                                            }, {
                                                text: '21:00',
                                                value: '21:00'
                                            }, {
                                                text: '22:00',
                                                value: '22:00'
                                            }, {
                                                text: '23:00',
                                                value: '23:00'
                                            }]
                                        },
                                        schedule_time_to: {
                                            component: 'select',
                                            text: 'timeTo',
                                            options: [{
                                                text: '00:00',
                                                value: '00:00'
                                            }, {
                                                text: '01:00',
                                                value: '01:00'
                                            }, {
                                                text: '02:00',
                                                value: '02:00'
                                            }, {
                                                text: '03:00',
                                                value: '03:00'
                                            }, {
                                                text: '04:00',
                                                value: '04:00'
                                            }, {
                                                text: '05:00',
                                                value: '05:00'
                                            }, {
                                                text: '06:00',
                                                value: '06:00'
                                            }, {
                                                text: '07:00',
                                                value: '07:00'
                                            }, {
                                                text: '08:00',
                                                value: '08:00'
                                            }, {
                                                text: '09:00',
                                                value: '09:00'
                                            }, {
                                                text: '10:00',
                                                value: '10:00'
                                            }, {
                                                text: '11:00',
                                                value: '11:00'
                                            }, {
                                                text: '12:00',
                                                value: '12:00'
                                            }, {
                                                text: '13:00',
                                                value: '13:00'
                                            }, {
                                                text: '14:00',
                                                value: '14:00'
                                            }, {
                                                text: '15:00',
                                                value: '15:00'
                                            }, {
                                                text: '16:00',
                                                value: '16:00'
                                            }, {
                                                text: '17:00',
                                                value: '17:00'
                                            }, {
                                                text: '18:00',
                                                value: '18:00'
                                            }, {
                                                text: '19:00',
                                                value: '19:00'
                                            }, {
                                                text: '20:00',
                                                value: '20:00'
                                            }, {
                                                text: '21:00',
                                                value: '21:00'
                                            }, {
                                                text: '22:00',
                                                value: '22:00'
                                            }, {
                                                text: '23:00',
                                                value: '23:00'
                                            }]
                                        }
                                    }
                                }
                            },
                            font: {
                                component: 'select',
                                text: 'font',
                                options: [{
                                    text: 'Youtube standard (Roboto)',
                                    value: 'Default'
                                }, {
                                    text: 'Open Sans',
                                    value: 'Open+Sans'
                                }, {
                                    text: 'Lato',
                                    value: 'Lato'
                                }, {
                                    text: 'Montserrat',
                                    value: 'Montserrat'
                                }, {
                                    text: 'Source Sans Pro',
                                    value: 'Source+Sans+Pro'
                                }, {
                                    text: 'Roboto Condensed',
                                    value: 'Roboto+Condensed'
                                }, {
                                    text: 'Oswald',
                                    value: 'Oswald'
                                }, {
                                    text: 'Comfortaa',
                                    value: 'Comfortaa'
                                }, {
                                    text: 'Roboto Mono',
                                    value: 'Roboto+Mono'
                                }, {
                                    text: 'Raleway',
                                    value: 'Raleway'
                                }, {
                                    text: 'Poppins',
                                    value: 'Poppins'
                                }, {
                                    text: 'Noto Sans',
                                    value: 'Noto+Sans'
                                }, {
                                    text: 'Roboto Slab',
                                    value: 'Roboto+Slab'
                                }, {
                                    text: 'Marriweather',
                                    value: 'Marriweather'
                                }, {
                                    text: 'PT Sans',
                                    value: 'PT+Sans'
                                }]
                            }
                        },
                        section_2: {
                            component: 'section',
                            variant: 'card',

                            default: {
                                component: 'label',
                                class: 'satus-label--default-theme',
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
                                class: 'satus-label--dark-theme',
                                text: 'dark',

                                radio: {
                                    component: 'radio',
                                    group: 'theme',
                                    value: 'dark'
                                }
                            },
                            night: {
                                component: 'label',
                                class: 'satus-label--night-theme',
                                text: 'night',

                                radio: {
                                    component: 'radio',
                                    group: 'theme',
                                    value: 'night'
                                }
                            },
                            dawn: {
                                component: 'label',
                                class: 'satus-label--dawn-theme',
                                text: 'dawn',

                                radio: {
                                    component: 'radio',
                                    group: 'theme',
                                    value: 'dawn'
                                }
                            },
                            sunset: {
                                component: 'label',
                                class: 'satus-label--sunset-theme',
                                text: 'sunset',

                                radio: {
                                    component: 'radio',
                                    group: 'theme',
                                    value: 'sunset'
                                }
                            },
                            desert: {
                                component: 'label',
                                class: 'satus-label--desert-theme',
                                text: 'desert',

                                radio: {
                                    component: 'radio',
                                    group: 'theme',
                                    value: 'desert'
                                }
                            },
                            plain: {
                                component: 'label',
                                class: 'satus-label--plain-theme',
                                text: 'plain',

                                radio: {
                                    component: 'radio',
                                    group: 'theme',
                                    value: 'plain'
                                }
                            },
                            black: {
                                component: 'label',
                                class: 'satus-label--black-theme',
                                text: 'black',

                                radio: {
                                    component: 'radio',
                                    group: 'theme',
                                    value: 'black'
                                }
                            }
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
            },
            player: {
                component: 'button',
                class: 'satus-button--player',
                category: true,
                on: {
                    click: {
                        section_1: {
                            component: 'section',
                            variant: 'card',

                            autoplay: {
                                component: 'switch',
                                text: 'autoplay',
                                value: true,
                                storage: 'player_autoplay'
                            },
                            forced_play_video_from_the_beginning: {
                                component: 'switch',
                                text: 'forcedPlayVideoFromTheBeginning'
                            },
                            ads: {
                                text: 'ads',
                                component: 'select',
                                options: [{
                                    text: 'onAllVideos',
                                    value: 'all_videos',
                                    default: 'true'
                                }, {
                                    text: 'onSubscribedChannels',
                                    value: 'subscribed_channels'
                                }, {
                                    text: 'blockMusic',
                                    value: 'block_music'
                                }, {
                                    text: 'blockAll',
                                    value: 'block_all'
                                }],
                                storage: 'player_ads'
                            },
                            quality: {
                                component: 'select',
                                text: 'quality',
                                options: [{
                                    text: 'auto',
                                    value: 'auto'
                                }, {
                                    text: '144p',
                                    value: 'tiny'
                                }, {
                                    text: '240p',
                                    value: 'small'
                                }, {
                                    text: '360p',
                                    value: 'medium'
                                }, {
                                    text: '480p',
                                    value: 'large'
                                }, {
                                    text: '720p',
                                    value: 'hd720'
                                }, {
                                    text: '1080p',
                                    value: 'hd1080'
                                }, {
                                    text: '1440p',
                                    value: 'hd1440'
                                }, {
                                    text: '2160p',
                                    value: 'hd2160'
                                }, {
                                    text: '2880p',
                                    value: 'hd2880'
                                }, {
                                    text: '4320p',
                                    value: 'highres'
                                }],
                                storage: 'player_quality'
                            },
                            autofullscreen: {
                                component: 'switch',
                                text: 'autoFullscreen',
                                storage: 'player_autofullscreen'
                            },
                            autopause_when_switching_tabs: {
                                component: 'switch',
                                text: 'autopauseWhenSwitchingTabs',
                                storage: 'player_autopause_when_switching_tabs'
                            },
                            player_forced_playback_speed: {
                                component: 'switch',
                                text: 'forcedPlaybackSpeed',
                                id: 'forced-playback-speed',
                                onrender: function () {
                                    this.dataset.value = satus.storage.player_forced_playback_speed;
                                },
                                onchange: function () {
                                    this.dataset.value = satus.storage.player_forced_playback_speed;
                                }
                            },
                            player_playback_speed: {
                                component: 'slider',
                                text: 'playbackSpeed',
                                textarea: true,
                                value: 1,
                                min: .1,
                                max: 8,
                                step: .05
                            },
                            subtitles: {
                                component: 'button',
                                text: 'subtitles',
                                on: {
                                    click: {
                                        component: 'section',
                                        variant: 'card',

                                        player_subtitles: {
                                            component: 'switch',
                                            text: 'subtitles'
                                        },
                                        subtitles_language: {
                                            component: 'select',
                                            text: 'language',
                                            options: [{
                                                    value: 'default',
                                                    text: 'default'
                                                },
                                                {
                                                    value: 'af',
                                                    text: 'Afrikaans'
                                                },
                                                {
                                                    value: 'am',
                                                    text: 'Amharic'
                                                },
                                                {
                                                    value: 'ar',
                                                    text: 'Arabic'
                                                },
                                                {
                                                    value: 'az',
                                                    text: 'Azerbaijani'
                                                },
                                                {
                                                    value: 'be',
                                                    text: 'Belarusian'
                                                },
                                                {
                                                    value: 'bg',
                                                    text: 'Bulgarian'
                                                },
                                                {
                                                    value: 'bn',
                                                    text: 'Bangla'
                                                },
                                                {
                                                    value: 'bs',
                                                    text: 'Bosnian'
                                                },
                                                {
                                                    value: 'ca',
                                                    text: 'Catalan'
                                                },
                                                {
                                                    value: 'ceb',
                                                    text: 'Cebuano'
                                                },
                                                {
                                                    value: 'co',
                                                    text: 'Corsican'
                                                },
                                                {
                                                    value: 'cs',
                                                    text: 'Czech'
                                                },
                                                {
                                                    value: 'cy',
                                                    text: 'Welsh'
                                                },
                                                {
                                                    value: 'da',
                                                    text: 'Danish'
                                                },
                                                {
                                                    value: 'de',
                                                    text: 'German'
                                                },
                                                {
                                                    value: 'el',
                                                    text: 'Greek'
                                                },
                                                {
                                                    value: 'en',
                                                    text: 'English'
                                                },
                                                {
                                                    value: 'eo',
                                                    text: 'Esperanto'
                                                },
                                                {
                                                    value: 'es',
                                                    text: 'Spanish'
                                                },
                                                {
                                                    value: 'et',
                                                    text: 'Estonian'
                                                },
                                                {
                                                    value: 'eu',
                                                    text: 'Basque'
                                                },
                                                {
                                                    value: 'fa',
                                                    text: 'Persian'
                                                },
                                                {
                                                    value: 'fi',
                                                    text: 'Finnish'
                                                },
                                                {
                                                    value: 'fil',
                                                    text: 'Filipino'
                                                },
                                                {
                                                    value: 'fr',
                                                    text: 'French'
                                                },
                                                {
                                                    value: 'fy',
                                                    text: 'Western Frisian'
                                                },
                                                {
                                                    value: 'ga',
                                                    text: 'Irish'
                                                },
                                                {
                                                    value: 'gd',
                                                    text: 'Scottish Gaelic'
                                                },
                                                {
                                                    value: 'gl',
                                                    text: 'Galician'
                                                },
                                                {
                                                    value: 'gu',
                                                    text: 'Gujarati'
                                                },
                                                {
                                                    value: 'ha',
                                                    text: 'Hausa'
                                                },
                                                {
                                                    value: 'haw',
                                                    text: 'Hawaiian'
                                                },
                                                {
                                                    value: 'hi',
                                                    text: 'Hindi'
                                                },
                                                {
                                                    value: 'hmn',
                                                    text: 'Hmong'
                                                },
                                                {
                                                    value: 'hr',
                                                    text: 'Croatian'
                                                },
                                                {
                                                    value: 'ht',
                                                    text: 'Haitian Creole'
                                                },
                                                {
                                                    value: 'hu',
                                                    text: 'Hungarian'
                                                },
                                                {
                                                    value: 'hy',
                                                    text: 'Armenian'
                                                },
                                                {
                                                    value: 'id',
                                                    text: 'Indonesian'
                                                },
                                                {
                                                    value: 'ig',
                                                    text: 'Igbo'
                                                },
                                                {
                                                    value: 'is',
                                                    text: 'Icelandic'
                                                },
                                                {
                                                    value: 'it',
                                                    text: 'Italian'
                                                },
                                                {
                                                    value: 'iw',
                                                    text: 'Hebrew'
                                                },
                                                {
                                                    value: 'ja',
                                                    text: 'Japanese'
                                                },
                                                {
                                                    value: 'jv',
                                                    text: 'Javanese'
                                                },
                                                {
                                                    value: 'ka',
                                                    text: 'Georgian'
                                                },
                                                {
                                                    value: 'kk',
                                                    text: 'Kazakh'
                                                },
                                                {
                                                    value: 'km',
                                                    text: 'Khmer'
                                                },
                                                {
                                                    value: 'kn',
                                                    text: 'Kannada'
                                                },
                                                {
                                                    value: 'ko',
                                                    text: 'Korean'
                                                },
                                                {
                                                    value: 'ku',
                                                    text: 'Kurdish'
                                                },
                                                {
                                                    value: 'ky',
                                                    text: 'Kyrgyz'
                                                },
                                                {
                                                    value: 'la',
                                                    text: 'Latin'
                                                },
                                                {
                                                    value: 'lb',
                                                    text: 'Luxembourgish'
                                                },
                                                {
                                                    value: 'lo',
                                                    text: 'Lao'
                                                },
                                                {
                                                    value: 'lt',
                                                    text: 'Lithuanian'
                                                },
                                                {
                                                    value: 'lv',
                                                    text: 'Latvian'
                                                },
                                                {
                                                    value: 'mg',
                                                    text: 'Malagasy'
                                                },
                                                {
                                                    value: 'mi',
                                                    text: 'Maori'
                                                },
                                                {
                                                    value: 'mk',
                                                    text: 'Macedonian'
                                                },
                                                {
                                                    value: 'ml',
                                                    text: 'Malayalam'
                                                },
                                                {
                                                    value: 'mn',
                                                    text: 'Mongolian'
                                                },
                                                {
                                                    value: 'mr',
                                                    text: 'Marathi'
                                                },
                                                {
                                                    value: 'ms',
                                                    text: 'Malay'
                                                },
                                                {
                                                    value: 'mt',
                                                    text: 'Maltese'
                                                },
                                                {
                                                    value: 'my',
                                                    text: 'Burmese'
                                                },
                                                {
                                                    value: 'ne',
                                                    text: 'Nepali'
                                                },
                                                {
                                                    value: 'nl',
                                                    text: 'Dutch'
                                                },
                                                {
                                                    value: 'no',
                                                    text: 'Norwegian'
                                                },
                                                {
                                                    value: 'ny',
                                                    text: 'Nyanja'
                                                },
                                                {
                                                    value: 'or',
                                                    text: 'Odia'
                                                },
                                                {
                                                    value: 'pa',
                                                    text: 'Punjabi'
                                                },
                                                {
                                                    value: 'pl',
                                                    text: 'Polish'
                                                },
                                                {
                                                    value: 'ps',
                                                    text: 'Pashto'
                                                },
                                                {
                                                    value: 'pt',
                                                    text: 'Portuguese'
                                                },
                                                {
                                                    value: 'ro',
                                                    text: 'Romanian'
                                                },
                                                {
                                                    value: 'ru',
                                                    text: 'Russian'
                                                },
                                                {
                                                    value: 'rw',
                                                    text: 'Kinyarwanda'
                                                },
                                                {
                                                    value: 'sd',
                                                    text: 'Sindhi'
                                                },
                                                {
                                                    value: 'si',
                                                    text: 'Sinhala'
                                                },
                                                {
                                                    value: 'sk',
                                                    text: 'Slovak'
                                                },
                                                {
                                                    value: 'sl',
                                                    text: 'Slovenian'
                                                },
                                                {
                                                    value: 'sm',
                                                    text: 'Samoan'
                                                },
                                                {
                                                    value: 'sn',
                                                    text: 'Shona'
                                                },
                                                {
                                                    value: 'so',
                                                    text: 'Somali'
                                                },
                                                {
                                                    value: 'sq',
                                                    text: 'Albanian'
                                                },
                                                {
                                                    value: 'sr',
                                                    text: 'Serbian'
                                                },
                                                {
                                                    value: 'st',
                                                    text: 'Southern Sotho'
                                                },
                                                {
                                                    value: 'su',
                                                    text: 'Sundanese'
                                                },
                                                {
                                                    value: 'sv',
                                                    text: 'Swedish'
                                                },
                                                {
                                                    value: 'sw',
                                                    text: 'Swahili'
                                                },
                                                {
                                                    value: 'ta',
                                                    text: 'Tamil'
                                                },
                                                {
                                                    value: 'te',
                                                    text: 'Telugu'
                                                },
                                                {
                                                    value: 'tg',
                                                    text: 'Tajik'
                                                },
                                                {
                                                    value: 'th',
                                                    text: 'Thai'
                                                },
                                                {
                                                    value: 'tk',
                                                    text: 'Turkmen'
                                                },
                                                {
                                                    value: 'tr',
                                                    text: 'Turkish'
                                                },
                                                {
                                                    value: 'tt',
                                                    text: 'Tatar'
                                                },
                                                {
                                                    value: 'ug',
                                                    text: 'Uyghur'
                                                },
                                                {
                                                    value: 'uk',
                                                    text: 'Ukrainian'
                                                },
                                                {
                                                    value: 'ur',
                                                    text: 'Urdu'
                                                },
                                                {
                                                    value: 'uz',
                                                    text: 'Uzbek'
                                                },
                                                {
                                                    value: 'vi',
                                                    text: 'Vietnamese'
                                                },
                                                {
                                                    value: 'xh',
                                                    text: 'Xhosa'
                                                },
                                                {
                                                    value: 'yi',
                                                    text: 'Yiddish'
                                                },
                                                {
                                                    value: 'yo',
                                                    text: 'Yoruba'
                                                },
                                                {
                                                    value: 'zh-Hans',
                                                    text: 'Chinese (Simplified)'
                                                },
                                                {
                                                    value: 'zh-Hant',
                                                    text: 'Chinese (Traditional)'
                                                },
                                                {
                                                    value: 'zu',
                                                    text: 'Zulu'
                                                }
                                            ]
                                        },
                                        subtitles_font_family: {
                                            component: 'select',
                                            text: 'fontFamily',
                                            options: [{
                                                text: 'Monospaced Serif',
                                                value: 1
                                            }, {
                                                text: 'Proportional Serif',
                                                value: 2
                                            }, {
                                                text: 'Monospaced Sans-Serif',
                                                value: 3
                                            }, {
                                                text: 'Proportional Sans-Serif',
                                                value: 4
                                            }, {
                                                text: 'Casual',
                                                value: 5
                                            }, {
                                                text: 'Cursive',
                                                value: 6
                                            }, {
                                                text: 'Small Capitals',
                                                value: 7
                                            }]
                                        },
                                        subtitles_font_color: {
                                            component: 'select',
                                            text: 'fontColor',
                                            options: [{
                                                text: 'white',
                                                value: '#fff'
                                            }, {
                                                text: 'yellow',
                                                value: '#ff0'
                                            }, {
                                                text: 'green',
                                                value: '#0f0'
                                            }, {
                                                text: 'cyan',
                                                value: '#0ff'
                                            }, {
                                                text: 'blue',
                                                value: '#00f'
                                            }, {
                                                text: 'magenta',
                                                value: '#f0f'
                                            }, {
                                                text: 'red',
                                                value: '#f00'
                                            }, {
                                                text: 'black',
                                                value: '#000'
                                            }]
                                        },
                                        subtitles_font_size: {
                                            component: 'select',
                                            text: 'fontSize',
                                            options: [{
                                                text: '50%',
                                                value: -2
                                            }, {
                                                text: '75%',
                                                value: -1
                                            }, {
                                                text: '100%',
                                                value: 1
                                            }, {
                                                text: '150%',
                                                value: 1
                                            }, {
                                                text: '200%',
                                                value: 2
                                            }, {
                                                text: '300%',
                                                value: 3
                                            }, {
                                                text: '400%',
                                                value: 4
                                            }]
                                        },
                                        subtitles_background_color: {
                                            component: 'select',
                                            text: 'backgroundColor',
                                            options: [{
                                                text: 'white',
                                                value: '#fff'
                                            }, {
                                                text: 'yellow',
                                                value: '#ff0'
                                            }, {
                                                text: 'green',
                                                value: '#0f0'
                                            }, {
                                                text: 'cyan',
                                                value: '#0ff'
                                            }, {
                                                text: 'blue',
                                                value: '#00f'
                                            }, {
                                                text: 'magenta',
                                                value: '#f0f'
                                            }, {
                                                text: 'red',
                                                value: '#f00'
                                            }, {
                                                text: 'black',
                                                value: '#000'
                                            }]
                                        },
                                        subtitles_background_opacity: {
                                            component: 'slider',
                                            text: 'backgroundOpacity',
                                            value: 75,
                                            min: 0,
                                            max: 100,
                                            step: 1
                                        },
                                        subtitles_window_color: {
                                            component: 'select',
                                            text: 'windowColor',
                                            options: [{
                                                text: 'white',
                                                value: '#fff'
                                            }, {
                                                text: 'yellow',
                                                value: '#ff0'
                                            }, {
                                                text: 'green',
                                                value: '#0f0'
                                            }, {
                                                text: 'cyan',
                                                value: '#0ff'
                                            }, {
                                                text: 'blue',
                                                value: '#00f'
                                            }, {
                                                text: 'magenta',
                                                value: '#f0f'
                                            }, {
                                                text: 'red',
                                                value: '#f00'
                                            }, {
                                                text: 'black',
                                                value: '#000'
                                            }]
                                        },
                                        subtitles_window_opacity: {
                                            component: 'slider',
                                            text: 'windowOpacity',
                                            value: 0,
                                            min: 0,
                                            max: 100,
                                            step: 1
                                        },
                                        subtitles_character_edge_style: {
                                            component: 'select',
                                            text: 'characterEdgeStyle',
                                            options: [{
                                                text: 'none',
                                                value: 0
                                            }, {
                                                text: 'dropShadow',
                                                value: 4
                                            }, {
                                                text: 'raised',
                                                value: 1
                                            }, {
                                                text: 'depressed',
                                                value: 2
                                            }, {
                                                text: 'outline',
                                                value: 3
                                            }]
                                        },
                                        subtitles_font_opacity: {
                                            component: 'slider',
                                            text: 'fontOpacity',
                                            value: 100,
                                            min: 0,
                                            max: 100,
                                            step: 1
                                        }
                                    }
                                }
                            },
                            crop_chapter_titles: {
                                component: 'switch',
                                text: 'cropChapterTitles',
                                value: true,
                                storage: 'player_crop_chapter_titles'
                            },
                            up_next_autoplay: {
                                component: 'switch',
                                text: 'upNextAutoplay',
                                value: true
                            },
                            mini_player: {
                                component: 'switch',
                                text: 'customMiniPlayer'
                            },
                            h264: {
                                component: 'switch',
                                text: 'codecH264',
                                storage: 'player_h264',
                                on: {
                                    click: function () {
                                        console.log(this.dataset.value);
                                        if (this.dataset.value === 'true') {
                                            satus.render({
                                                component: 'modal',

                                                message: {
                                                    component: 'text',
                                                    text: 'youtubeLimitsVideoQualityTo1080pForH264Codec'
                                                },
                                                actions: {
                                                    component: 'section',
                                                    variant: 'actions',

                                                    cancel: {
                                                        component: 'button',
                                                        text: 'cancel',
                                                        on: {
                                                            click: function () {
                                                                this.parentNode.parentNode.parentNode.click();
                                                            }
                                                        }
                                                    },
                                                    ok: {
                                                        component: 'button',
                                                        text: 'OK',
                                                        onclick: function () {
                                                            
                                                            this.parentNode.parentNode.parentNode.click();
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            },
                            player_60fps: {
                                component: 'switch',
                                text: 'allow60fps',
                                value: true
                            },
                            sdr: {
                                component: 'switch',
                                text: 'forceSDR',
                                value: false,
                                storage: 'player_SDR'
                            },
                            player_forced_volume: {
                                component: 'switch',
                                text: 'forcedVolume',
                                id: 'forced-volume',
                                onrender: function () {
                                    this.dataset.value = satus.storage.player_forced_volume;
                                },
                                onchange: function () {
                                    this.dataset.value = satus.storage.player_forced_volume;
                                }
                            },
                            player_volume: {
                                component: 'slider',
                                text: 'volume',
                                step: 1,
                                max: 100,
                                value: 100
                            },
                            player_loudness_normalization: {
                                component: 'switch',
                                text: 'loudnessNormalization',
                                value: true
                            },
                            player_hide_controls: {
                                component: 'switch',
                                text: 'hidePlayerControlsBar'
                            },
                            player_hide_controls_options: {
                                component: 'button',
                                text: 'hidePlayerControlsBarButtons',
                                on: {
                                    click: {
                                        component: 'section',
                                        variant: 'card',

                                        player_play_button: {
                                            component: 'switch',
                                            text: 'playPause'
                                        },
                                        player_previous_button: {
                                            component: 'switch',
                                            text: 'previousVideo'
                                        },
                                        player_next_button: {
                                            component: 'switch',
                                            text: 'nextVideo'
                                        },
                                        player_volume_button: {
                                            component: 'switch',
                                            text: 'volume'
                                        },
                                        player_autoplay_button: {
                                            component: 'switch',
                                            text: 'autoplay'
                                        },
                                        player_settings_button: {
                                            component: 'switch',
                                            text: 'settings'
                                        },
                                        player_subtitles_button: {
                                            component: 'switch',
                                            text: 'subtitles'
                                        },
                                        player_miniplayer_button: {
                                            component: 'switch',
                                            text: 'nativeMiniPlayer'
                                        },
                                        player_view_button: {
                                            component: 'switch',
                                            text: 'viewMode'
                                        },
                                        player_screen_button: {
                                            component: 'switch',
                                            text: 'screen'
                                        },
                                        player_remote_button: {
                                            component: 'switch',
                                            text: 'remote'
                                        }
                                    }
                                }
                            }
                        },
                        section_2: {
                            component: 'section',
                            variant: 'card',

                            player_screenshot: {
                                component: 'button',
                                text: 'screenshot',
                                on: {
                                    click: {
                                        component: 'section',
                                        variant: 'card',

                                        player_screenshot_button: {
                                            component: 'switch',
                                            text: 'activate'
                                        },
                                        player_screenshot_save_as: {
                                            component: 'select',
                                            text: 'saveAs',
                                            options: [{
                                                text: 'file',
                                                value: 'file'
                                            }, {
                                                text: 'clipboard',
                                                value: 'clipboard'
                                            }]
                                        }
                                    }
                                }
                            },
                            player_repeat: {
                                component: 'button',
                                text: 'repeat',
                                on: {
                                    click: {
                                        component: 'section',
                                        variant: 'card',

                                        player_repeat_button: {
                                            component: 'switch',
                                            text: 'activate'
                                        },
                                        player_always_repeat: {
                                            component: 'switch',
                                            text: 'alwaysActive'
                                        }
                                    }
                                }
                            },
                            player_rotate_button: {
                                component: 'switch',
                                text: 'rotate'
                            },
                            player_popup_button: {
                                component: 'switch',
                                text: 'popupPlayer'
                            }
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
                                'd': 'M5 3l14 9-14 9V3z'
                            }
                        }
                    }
                },
                label: {
                    component: 'span',
                    text: 'player'
                }
            },
            playlist: {
                component: 'button',
                class: 'satus-button--playlist',
                category: true,
                on: {
                    click: {
                        component: 'section',
                        variant: 'card',

                        playlist_autoplay: {
                            component: 'switch',
                            text: 'autoplay',
                            value: true
                        },
                        playlist_up_next_autoplay: {
                            component: 'switch',
                            text: 'upNextAutoplay',
                            value: true
                        },
                        playlist_reverse: {
                            component: 'switch',
                            text: 'reverse'
                        },
                        playlist_repeat: {
                            component: 'switch',
                            text: 'repeat'
                        },
                        playlist_shuffle: {
                            component: 'switch',
                            text: 'shuffle'
                        }
                    }
                },

                icon: {
                    component: 'span',

                    svg: {
                        component: 'svg',
                        attr: {
                            viewBox: '0 0 24 24',
                            fill: 'transparent',
                            stroke: 'currentColor',
                            'stroke-linecap': 'round',
                            'stroke-width': 1.75
                        },

                        path: {
                            component: 'path',
                            attr: {
                                d: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'
                            }
                        }
                    }
                },
                label: {
                    component: 'span',
                    text: 'playlist'
                }
            },
            channel: {
                component: 'button',
                class: 'satus-button--channel',
                category: true,
                on: {
                    click: {
                        component: 'section',
                        variant: 'card',

                        channel_default_tab: {
                            component: 'select',
                            text: 'defaultChannelTab',
                            options: [{
                                text: 'home',
                                value: '/home'
                            }, {
                                text: 'videos',
                                value: '/videos'
                            }, {
                                text: 'playlists',
                                value: '/playlists'
                            }]
                        },
                        channel_trailer_autoplay: {
                            component: 'switch',
                            text: 'trailerAutoplay',
                            value: true
                        },
                        channel_hide_featured_content: {
                            component: 'switch',
                            text: 'hideFeaturedContent'
                        }
                    }
                },

                icon: {
                    component: 'span',

                    svg: {
                        component: 'svg',
                        attr: {
                            viewBox: '0 0 24 24',
                            fill: 'transparent',
                            stroke: 'currentColor',
                            'stroke-linecap': 'round',
                            'stroke-width': 1.75
                        },

                        rect: {
                            component: 'rect',
                            attr: {
                                width: 20,
                                height: 15,
                                x: 2,
                                y: 7,
                                rx: 2,
                                ry: 2
                            }
                        },
                        path: {
                            component: 'path',
                            attr: {
                                d: 'M17 2l-5 5-5-5'
                            }
                        }
                    }
                },
                label: {
                    component: 'span',
                    text: 'channel'
                }
            },
            shortcuts: {
                component: 'button',
                class: 'satus-button--shortcuts',
                category: true,
                on: {
                    click: {
                        section: {
                            component: 'section',
                            variant: 'card',

                            picture_in_picture: {
                                component: 'shortcut',
                                text: 'pictureInPicture',
                                storage: 'shortcut_picture_in_picture'
                            },
                            volume: {
                                component: 'button',
                                text: 'volume',
                                on: {
                                    click: {
                                        section_1: {
                                            component: 'section',
                                            variant: 'card',

                                            volume_step: {
                                                component: 'slider',
                                                text: 'step',
                                                min: 1,
                                                max: 10,
                                                step: 1,
                                                value: 5,
                                                storage: 'shortcut_volume_step'
                                            }
                                        },

                                        section_2: {
                                            component: 'section',
                                            variant: 'card',

                                            increase_volume: {
                                                component: 'shortcut',
                                                text: 'increaseVolume',
                                                storage: 'shortcut_increase_volume',
                                                value: {
                                                    keys: {
                                                        38: {
                                                            key: 'ArrowUp'
                                                        }
                                                    }
                                                }
                                            },
                                            decrease_volume: {
                                                component: 'shortcut',
                                                text: 'decreaseVolume',
                                                storage: 'shortcut_decrease_volume',
                                                value: {
                                                    keys: {
                                                        40: {
                                                            key: 'ArrowDown'
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            shortcut_screenshot: {
                                component: 'shortcut',
                                text: 'screenshot'
                            },
                            playback_speed: {
                                component: 'button',
                                text: 'playbackSpeed',
                                on: {
                                    click: {
                                        section_step: {
                                            component: 'section',
                                            variant: 'card',

                                            playback_speed_step: {
                                                component: 'slider',
                                                text: 'step',
                                                min: .05,
                                                max: .5,
                                                step: .05,
                                                value: .05,
                                                storage: 'shortcut_playback_speed_step'
                                            }
                                        },

                                        section: {
                                            component: 'section',
                                            variant: 'card',

                                            increase_playback_speed: {
                                                component: 'shortcut',
                                                text: 'increasePlaybackSpeed',
                                                storage: 'shortcut_increase_playback_speed',
                                                value: {
                                                    keys: {
                                                        188: {
                                                            key: '<'
                                                        }
                                                    }
                                                }
                                            },
                                            decrease_playback_speed: {
                                                component: 'shortcut',
                                                text: 'decreasePlaybackSpeed',
                                                storage: 'shortcut_decrease_playback_speed',
                                                value: {
                                                    keys: {
                                                        190: {
                                                            key: '>'
                                                        }
                                                    }
                                                }
                                            },
                                            reset_playback_speed: {
                                                component: 'shortcut',
                                                text: 'reset',
                                                storage: 'shortcut_reset_playback_speed'
                                            }
                                        }
                                    }
                                }
                            },
                            shortcut_toggle_controls: {
                                component: 'shortcut',
                                text: 'toggleControls'
                            },
                            shortcut_next_video: {
                                component: 'shortcut',
                                text: 'nextVideo',
                                value: {
                                    shift: true,
                                    keys: {
                                        78: {
                                            key: 'n'
                                        }
                                    }
                                }
                            },
                            shortcut_prev_video: {
                                component: 'shortcut',
                                text: 'previousVideo',
                                value: {
                                    shift: true,
                                    keys: {
                                        80: {
                                            key: 'p'
                                        }
                                    }
                                }
                            },
                            shortcut_play_pause: {
                                component: 'shortcut',
                                text: 'playPause',
                                value: {
                                    keys: {
                                        32: {
                                            code: 'space'
                                        }
                                    }
                                }
                            },
                            shortcut_stop: {
                                component: 'shortcut',
                                text: 'stop'
                            },
                            shortcut_toggle_autoplay: {
                                component: 'shortcut',
                                text: 'toggleAutoplay'
                            },
                            shortcut_seek_backward: {
                                component: 'shortcut',
                                text: 'seekBackward10Seconds',
                                value: {
                                    keys: {
                                        74: {
                                            key: 'j'
                                        }
                                    }
                                }
                            },
                            shortcut_seek_forward: {
                                component: 'shortcut',
                                text: 'seekForward10Seconds',
                                value: {
                                    keys: {
                                        76: {
                                            key: 'l'
                                        }
                                    }
                                }
                            },
                            shortcut_seek_next_chapter: {
                                component: 'shortcut',
                                text: 'seekNextChapter'
                            },
                            shortcut_seek_previous_chapter: {
                                component: 'shortcut',
                                text: 'seekPreviousChapter'
                            },
                            shortcut_activate_fullscreen: {
                                component: 'shortcut',
                                text: 'activateFullscreen',
                                value: {
                                    keys: {
                                        70: {
                                            key: 'f'
                                        }
                                    }
                                }
                            },
                            shortcut_activate_captions: {
                                component: 'shortcut',
                                text: 'activateCaptions',
                                value: {
                                    keys: {
                                        67: {
                                            key: 'c'
                                        }
                                    }
                                }
                            },
                            shortcut_quality: {
                                component: 'button',
                                text: 'quality',
                                on: {
                                    click: {
                                        component: 'section',
                                        variant: 'card',

                                        shortcut_auto: {
                                            component: 'shortcut',
                                            text: 'auto'
                                        },
                                        shortcut_144p: {
                                            component: 'shortcut',
                                            text: '144p'
                                        },
                                        shortcut_240p: {
                                            component: 'shortcut',
                                            text: '240p'
                                        },
                                        shortcut_360p: {
                                            component: 'shortcut',
                                            text: '360p'
                                        },
                                        shortcut_480p: {
                                            component: 'shortcut',
                                            text: '480p'
                                        },
                                        shortcut_720p: {
                                            component: 'shortcut',
                                            text: '720p'
                                        },
                                        shortcut_1080p: {
                                            component: 'shortcut',
                                            text: '1080p'
                                        },
                                        shortcut_1440p: {
                                            component: 'shortcut',
                                            text: '1440p'
                                        },
                                        shortcut_2160p: {
                                            component: 'shortcut',
                                            text: '2160p'
                                        },
                                        shortcut_2880p: {
                                            component: 'shortcut',
                                            text: '2880p'
                                        },
                                        shortcut_4320p: {
                                            component: 'shortcut',
                                            text: '4320p'
                                        }
                                    }
                                }
                            },
                            shortcut_custom_mini_player: {
                                component: 'shortcut',
                                text: 'customMiniPlayer',
                                value: {
                                    keys: {
                                        73: {
                                            key: 'i'
                                        }
                                    }
                                }
                            },
                            shortcut_stats_for_nerds: {
                                component: 'shortcut',
                                text: 'statsForNerds'
                            },
                            shortcut_toggle_cards: {
                                component: 'shortcut',
                                text: 'toggleCards'
                            },
                            shortcut_popup_player: {
                                component: 'shortcut',
                                text: 'popupPlayer'
                            },
                            shortcut_go_to_search_box: {
                                component: 'shortcut',
                                text: 'goToSearchBox',
                                value: {
                                    keys: {
                                        191: {
                                            key: '/'
                                        }
                                    }
                                }
                            },
                            shortcut_like_shortcut: {
                                component: 'shortcut',
                                text: 'like'
                            },
                            shortcut_dislike_shortcut: {
                                component: 'shortcut',
                                text: 'dislike'
                            },
                            shortcut_subscribe: {
                                component: 'shortcut',
                                text: 'subscribe'
                            },
                            shortcut_dark_theme: {
                                component: 'shortcut',
                                text: 'darkTheme'
                            }
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
                                'd': 'M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z'
                            }
                        }
                    }
                },
                label: {
                    component: 'span',
                    text: 'shortcuts'
                }
            },
            blacklist: {
                component: 'button',
                class: 'satus-button--blacklist',
                category: true,
                on: {
                    click: {
                        section: {
                            component: 'section',
                            variant: 'card',

                            blacklist_activate: {
                                component: 'switch',
                                text: 'activate'
                            }
                        },

                        section2: {
                            component: 'section',
                            variant: 'card',

                            channels: {
                                component: 'button',
                                text: 'channels',
                                on: {
                                    click: {
                                        component: 'section',
                                        variant: 'card',
                                        on: {
                                            render: function () {
                                                var self = this,
                                                    blacklist = satus.storage.get('blacklist');

                                                if (blacklist && blacklist.channels) {
                                                    var list = {};

                                                    for (var item in blacklist.channels) {
                                                        if (blacklist.channels[item] !== false) {
                                                            var title = blacklist.channels[item].title || '';

                                                            list[item] = {
                                                                type: 'section',
                                                                text: title.length > 20 ? title.substr(0, 20) + '...' : title,
                                                                class: 'satus-section--blacklist',
                                                                style: {
                                                                    'background-image': 'url(' + blacklist.channels[item].preview + ')',
                                                                    'background-color': '#000'
                                                                },

                                                                section: {
                                                                    type: 'section',

                                                                    delete: {
                                                                        type: 'button',
                                                                        icon: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10zM18 4h-2.5l-.7-.7A1 1 0 0 0 14 3H9.9a1 1 0 0 0-.7.3l-.7.7H6c-.6 0-1 .5-1 1s.5 1 1 1h12c.6 0 1-.5 1-1s-.5-1-1-1z"></svg>',
                                                                        onclick: function () {
                                                                            delete blacklist.channels[item];

                                                                            satus.storage.set('blacklist', blacklist);

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
                                                        list.error = {
                                                            type: 'span',
                                                            text: 'empty'
                                                        };
                                                    }

                                                    satus.render(list, this);
                                                } else {
                                                    satus.render({
                                                        component: 'span',
                                                        text: 'empty'
                                                    }, this);
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            videos: {
                                component: 'button',
                                text: 'videos',
                                on: {
                                    click: {
                                        component: 'section',
                                        variant: 'card',
                                        on: {
                                            render: function () {
                                                var self = this,
                                                    blacklist = satus.storage.get('blacklist');

                                                if (blacklist && blacklist.videos) {
                                                    let list = {};

                                                    for (let item in blacklist.videos) {
                                                        if (blacklist.videos[item] !== false) {
                                                            let title = blacklist.videos[item].title || '';

                                                            list[item] = {
                                                                type: 'section',
                                                                text: title.length > 20 ? title.substr(0, 20) + '...' : title,
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
                                                                            delete blacklist.videos[item];

                                                                            satus.storage.set('blacklist', blacklist);
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
                                                            component: 'span',
                                                            text: 'empty'
                                                        };
                                                    }

                                                    satus.render(list, this);
                                                } else {
                                                    satus.render({
                                                        component: 'span',
                                                        text: 'empty'
                                                    }, this);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
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
                            'stroke-width': 1.75
                        },

                        circle: {
                            component: 'circle',
                            attr: {
                                'cx': 12,
                                'cy': 12,
                                'r': 10
                            }
                        },
                        path: {
                            component: 'path',
                            attr: {
                                'd': 'M4.93 4.93l14.14 14.14'
                            }
                        }
                    }
                },
                label: {
                    component: 'span',
                    text: 'blacklist'
                }
            },
            analyzer: {
                component: 'button',
                class: 'satus-button--analyzer',
                category: true,
                on: {
                    click: {
                        section: {
                            component: 'section',
                            variant: 'card',

                            analyzer_activation: {
                                component: 'switch',
                                text: 'activate'
                            }
                        },
                        section_2: {
                            component: 'section',
                            variant: 'card',
                            on: {
                                render: function () {
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

                                    watch_time.innerText = satus.locale.get('watchTime');
                                    today_at.innerText = satus.locale.get('todayAt') + ' ' + (new Date().getHours() + ':' + (now_minutes < 10 ? '0' + now_minutes : now_minutes));
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
                        }
                    }
                },

                icon: {
                    component: 'span',

                    svg: {
                        component: 'svg',
                        attr: {
                            viewBox: '0 0 24 24',
                            fill: 'transparent',
                            stroke: 'currentColor',
                            'stroke-linecap': 'round',
                            'stroke-width': 1.75
                        },

                        path: {
                            component: 'path',
                            attr: {
                                d: 'M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z'
                            }
                        }
                    }
                },
                label: {
                    component: 'span',
                    text: 'analyzer'
                }
            }
        }
    }
};


function exportData() {
    if (location.href.indexOf('action=export') !== -1) {
        var blob;

        try {
            blob = new Blob([JSON.stringify(satus.storage.data)], {
                type: 'application/json;charset=utf-8'
            });
        } catch (error) {
            return modalError(error);
        }

        satus.render({
            component: 'modal',

            label: {
                component: 'span',
                text: 'areYouSureYouWantToExportTheData'
            },
            actions: {
                component: 'section',
                variant: 'actions',

                ok: {
                    component: 'button',
                    text: 'ok',
                    on: {
                        click: function () {
                            try {
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
                                                close();
                                            }, 1000);
                                        });
                                    }
                                });
                            } catch (error) {
                                return modalError(error);
                            }

                            this.parentNode.parentNode.parentNode.close();
                        }
                    }
                },
                cancel: {
                    component: 'button',
                    text: 'cancel',
                    on: {
                        click: function () {
                            this.parentNode.parentNode.parentNode.close();
                        }
                    }
                }
            }
        });
    }
}

function importData() {
    if (location.href.indexOf('action=import') !== -1) {
        satus.render({
            component: 'modal',

            label: {
                component: 'span',
                text: 'areYouSureYouWantToImportTheData'
            },
            actions: {
                component: 'section',
                variant: 'actions',

                ok: {
                    component: 'button',
                    text: 'ok',
                    on: {
                        click: function () {
                            var input = document.createElement('input');

                            input.type = 'file';

                            input.addEventListener('change', function () {
                                var file_reader = new FileReader();

                                file_reader.onload = function () {
                                    var data = JSON.parse(this.result);

                                    for (var key in data) {
                                        satus.storage.set(key, data[key]);
                                    }

                                    close();
                                };

                                file_reader.readAsText(this.files[0]);
                            });

                            input.click();

                            this.parentNode.parentNode.parentNode.close();
                        }
                    }
                },
                cancel: {
                    component: 'button',
                    text: 'cancel',
                    on: {
                        click: function () {
                            this.parentNode.parentNode.parentNode.close();
                        }
                    }
                }
            }
        });
    }
}


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

satus.parents(skeleton, false);

satus.storage.attributes = {
    theme: true,
    improvedtube_home: true,
    title_version: true,
    it_general: true,
    it_appearance: true,
    it_themes: true,
    it_player: true,
    it_playlist: true,
    it_channel: true,
    it_shortcuts: true,
    it_blacklist: true,
    it_analyzer: true
};

satus.storage.import(function (items) {
    if (document.documentElement.hasAttribute('page')) {
        var language = items.language || window.navigator.language;

        if (language.indexOf('en') === 0) {
            language = 'en';
        }

        chrome.runtime.sendMessage({
            name: 'get-localization',
            code: language
        }, function (response) {
            satus.locale.strings = response;

            satus.render(skeleton);
        });
    } else {
        satus.locale.import(items.language, '../_locales/', function () {
            satus.render(skeleton);

            exportData();
            importData();
        });
    }
});

chrome.runtime.sendMessage({
    name: 'migration'
}, function () {
    satus.storage.import(function (items) {
        
    });
});