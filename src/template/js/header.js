var Menu = {
    header: {
        type: 'header',

        section_start: {
            type: 'section',
            class: 'satus-section--align-start',

            button_back: {
                type: 'button',
                class: 'satus-button--back',
                before: '<svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M14 18l-6-6 6-6"/></svg>',
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
                innerText: 'ImprovedTube'
            }
        },
        section_end: {
            type: 'section',
            class: 'satus-section--align-end',

            button_search: {
                type: 'button',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" viewBox="0 0 24 24"><circle cx="11" cy="10.5" r="6" fill="none"/><path d="M20 20l-4-4"/></svg>',
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
                                placeholder: 'Search...',
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
                            /*,
                                                    close: {
                                                        type: 'button',
                                                        before: '<svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>',
                                                        onclick: function() {
                                                            document.querySelector('.satus-dialog__scrim').click();

                                                            document.querySelector('.satus-main').back();
                                                        }
                                                    }*/
                        });
                    });
                }
            },
            button_vert: {
                type: 'button',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="5.25" r="0.45"/><circle cx="12" cy="12" r="0.45"/><circle cx="12" cy="18.75" r="0.45"/></svg>',
                onClickRender: {
                    type: 'dialog',
                    class: 'satus-dialog--vertical-menu'
                }
            }
        }
    }
};





/*
button_github: {
    type: 'button',
    class: 'satus-button--github',
    before: '<svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>',
    label: 'GitHub',
    onclick: function() {
        window.open('https://github.com/ImprovedTube/ImprovedTube/');
    }
},
button_rate_us: {
    type: 'button',
    before: '<svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>',
    label: 'rateUs',
    onclick: function() {
        window.open('https://chrome.google.com/webstore/detail/improve-youtube-open-sour/bnomihfieiccainjcjblhegjgglakjdd');
    }
},
button_email: {
    type: 'button',
    before: '<svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>',
    label: 'email',
    onclick: function() {
        window.open('https://chrome.google.com/webstore/detail/improve-youtube-open-sour/bnomihfieiccainjcjblhegjgglakjdd');
    }
}*/