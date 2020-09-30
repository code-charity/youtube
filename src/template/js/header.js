var Menu = {
    header: {
        type: 'header',

        section_start: {
            type: 'section',
            class: 'satus-section--align-start',

            button_back: {
                type: 'button',
                class: 'satus-button--back',
                before: '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M14 18l-6-6 6-6"/></svg>',
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
                before: '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" viewBox="0 0 24 24"><circle cx="11" cy="10.5" r="6" fill="none"/><path d="M20 20l-4-4"/></svg>',
                onclick: function() {
                    document.querySelector('.satus-main').open({
                        appearanceKey: 'search'
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
                                            var sorted_results = [];

                                            document.querySelector('.satus-main__container').innerHTML = '';

                                            for (var key in results) {
                                                results[key].type = 'section';

                                                sorted_results.push({
                                                    type: 'text',
                                                    label: key,
                                                    class: 'satus-section--label'
                                                });
                                                sorted_results.push(results[key]);
                                            }

                                            var scroll = Satus.components.scrollbar(document.querySelector('.satus-main__container'));

                                            Satus.render(sorted_results, scroll);
                                        }, true);
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
                before: '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="5.25" r="0.45"/><circle cx="12" cy="12" r="0.45"/><circle cx="12" cy="18.75" r="0.45"/></svg>',
                onclick: {
                    type: 'dialog',
                    class: 'satus-dialog--vertical-menu',

                    email: {
                        type: 'button',
                        label: 'Email',
                        title: 'bugs@improvedtube.com',
                        before: '<svg fill="none" stroke="var(--satus-theme-primary)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>',
                        onclick: function() {
                            window.open('mailto:bugs@improvedtube.com', '_blank');
                        }
                    },
                    github: {
                        type: 'button',
                        label: 'GitHub',
                        title: '/ImprovedTube/ImprovedTube',
                        before: '<svg fill="none" stroke="var(--satus-theme-primary)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>',
                        onclick: function() {
                            window.open('https://github.com/ImprovedTube/ImprovedTube/', '_blank');
                        }
                    },
                    website: {
                        type: 'button',
                        label: 'Website',
                        title: 'improvedtube.com',
                        before: '<svg fill="none" stroke="var(--satus-theme-primary)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
                        onclick: function() {
                            window.open('http://www.improvedtube.com/', '_blank');
                        }
                    }
                }
            }
        }
    }
};
