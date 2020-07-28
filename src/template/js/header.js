var Menu = {
    header: {
        type: 'header',

        section_start: {
            type: 'section',
            class: 'satus-section--align-start',

            button_back: {
                type: 'button',
                class: 'satus-button--back',
                before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M14 18l-6-6 6-6"/></svg>',
                onclick: function() {
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

            button_search: {
                type: 'button',
                icon: '<svg stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" viewBox="0 0 24 24"><circle cx="11" cy="10.5" r="6" fill="none"/><path d="M20 20l-4-4"/></svg>',
                onclick: function() {
                    document.querySelector('.satus-main').open({
                        appearance: 'search'
                    }, function() {
                        Satus.render({
                            type: 'dialog',
                            class: 'satus-dialog--search',
                            onclose: function() {
                                document.querySelector('.satus-main').back();
                            },

                            input: {
                                type: 'text-field',
                                placeholder: 'search',
                                oninput: function() {
                                    if (this.value.length > 0) {
                                        Satus.search(this.value, Menu, function(results) {
                                            document.querySelector('.satus-main__container').innerHTML = '';

                                            var scroll = Satus.components.scrollbar(document.querySelector('.satus-main__container'));

                                            results.type = 'section';

                                            Satus.render(results, scroll);
                                        });
                                    } else {
                                        document.querySelector('.satus-main__container').innerHTML = '';

                                        Satus.render({}, document.querySelector('.satus-main__container'));
                                    }
                                }
                            }
                        });
                    });
                }
            },
            button_vert: {
                type: 'button',
                icon: '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="5.25" r="0.45"/><circle cx="12" cy="12" r="0.45"/><circle cx="12" cy="18.75" r="0.45"/></svg>',
                onClickRender: {
                    type: 'dialog',
                    class: 'satus-dialog--vertical-menu'
                }
            }
        }
    }
};
