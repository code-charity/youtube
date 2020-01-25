/*-----------------------------------------------------------------------------
>>> «HEADER» TEMPLATE PART
-----------------------------------------------------------------------------*/

const Menu = {
    header: {
        type: 'header',

        section_start: {
            type: 'section',
            class: ['satus-section--align-start'],

            back: {
                type: 'button',
                class: ['satus-button--back'],
                icon: '<svg viewBox="0 0 24 24"><path d="M16.6 3c-.5-.5-1.3-.5-1.8 0l-8.3 8.3a1 1 0 0 0 0 1.4l8.3 8.3a1.2 1.2 0 1 0 1.8-1.7L9.4 12l7.2-7.3c.5-.4.5-1.2 0-1.7z"></path></svg>',
                on: {
                    click: function() {
                        document.querySelector('.satus-main__container').close();
                    }
                }
            },
            title: {
                type: 'text',
                class: ['satus-header__title'],
                innerText: 'ImprovedTube'
            }
        },
        section_end: {
            type: 'section',
            class: ['satus-section--align-end'],

            search: {
                type: 'section',
                class: ['satus-search-section'],

                searchField: {
                    type: 'text-field',
                    id: 'search',
                    placeholder: 'search',
                    on: {
                        render: function(component) {
                            setTimeout(function() {
                                component.focus();
                            }, 300);
                        },
                        blur: function() {
                            if (this.value.length === 0) {
                                this.parentNode.classList.add('satus-search-section--collapsed');
                            }
                        },
                        keydown: function() {
                            var self = this;

                            setTimeout(function() {
                                if (self.value.length > 1) {
                                    Satus.search(self.value, Menu, function(results) {
                                        var object = {
                                            main: {
                                                type: 'main',

                                                section: {
                                                    type: 'section'
                                                }
                                            }
                                        };

                                        for (var key in results) {
                                            if (results[key].type && results[key].type !== 'section') {
                                                object.main.section[key] = results[key];
                                            }
                                        }

                                        if (document.querySelector('.satus > *:not(.satus-header)')) {
                                            for (var i = 0, l = document.querySelectorAll('.satus > *:not(.satus-header)').length; i < l; i++) {
                                                document.querySelectorAll('.satus > *:not(.satus-header)')[i].remove();
                                            }
                                        }

                                        Satus.render(document.querySelector('.satus'), object);
                                    });
                                } else {
                                    if (document.querySelector('.satus > *:not(.satus-header)')) {
                                        for (var i = 0, l = document.querySelectorAll('.satus > *:not(.satus-header)').length; i < l; i++) {
                                            document.querySelectorAll('.satus > *:not(.satus-header)')[i].remove();
                                        }
                                    }

                                    Satus.render(document.querySelector('.satus'), {
                                        main: Menu.main
                                    });
                                }
                            });
                        }
                    }
                },
                searchButton: {
                    type: 'button',
                    icon: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l4.3 4.3a1 1 0 0 0 1.4-1.5L15.5 14zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"></path></svg>',
                    onclick: function() {
                        if (this.parentNode.classList.contains('satus-search-section--collapsed')) {
                            this.parentNode.classList.remove('satus-search-section--collapsed');

                            setTimeout(function() {
                                document.querySelector('#search').focus();
                            }, 200);
                        } else {
                            this.parentNode.classList.add('satus-search-section--collapsed');
                        }
                    }
                }
                /*searchCancel: {
                	type: 'button',
                	label: 'cancel',
                	class: ['satus-search__cancel']
                }*/
            },
            menu: {
                type: 'button',
                icon: '<svg viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>',
                onclick: function(event) {
                    event.stopPropagation();

                    document.querySelector('.satus').appendChild(Satus.components.dialog({
                        class: ['satus-dialog--vertical-menu'],
                        right: 8,
                        top: 8,
                        scrim: false,
                        surface: {
                            maxWidth: '200px',
                            minWidth: '200px'
                        },

                        settings: {
                            type: 'button',
                            label: 'settings',
                            icon: '<svg viewBox="0 0 24 24"><path d="M19.4 13l.1-1v-1l2-1.6c.2-.2.3-.5.2-.7l-2-3.4c-.2-.3-.4-.3-.6-.3l-2.5 1-1.7-1-.4-2.6c0-.2-.3-.4-.5-.4h-4c-.3 0-.5.2-.5.4l-.4 2.7c-.6.2-1.1.6-1.7 1L5 5c-.2-.1-.4 0-.6.2l-2 3.4c0 .3 0 .5.2.7l2 1.6a8 8 0 0 0 0 2l-2 1.6c-.2.2-.3.5-.2.7l2 3.4c.2.3.4.3.6.3l2.5-1 1.7 1 .4 2.6c0 .2.2.4.5.4h4c.3 0 .5-.2.5-.4l.4-2.7c.6-.2 1.1-.6 1.7-1l2.5 1c.2.1.4 0 .6-.2l2-3.4c0-.2 0-.5-.2-.7l-2-1.6zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" /></svg>',
                            onclick: function() {
                                document.querySelector('.satus-dialog__scrim').click();

                                setTimeout(function() {
                                    document.querySelector('#satus-folder--settings').click();
                                });
                            }
                        }
                    }));
                }
            }
        }
    }
};