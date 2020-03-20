/*-----------------------------------------------------------------------------
>>> «HEADER» TEMPLATE
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
                icon: '<svg viewBox="0 0 24 24" style=width:20px;height:20px><path d="M16.6 3c-.5-.5-1.3-.5-1.8 0l-8.3 8.3a1 1 0 0 0 0 1.4l8.3 8.3a1.2 1.2 0 1 0 1.8-1.7L9.4 12l7.2-7.3c.5-.4.5-1.2 0-1.7z"></path></svg>',
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
                type: 'button',
                icon: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l4.3 4.3a1 1 0 0 0 1.4-1.5L15.5 14zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"></svg>',
                onclick: function() {
                    var offset = this.offsetLeft - this.offsetWidth / 2;

                    document.querySelector('.satus').appendChild(Satus.components.dialog({
                        type: 'dialog',
                        surface: {
                            'display': 'flex',
                            'flex-direction': 'row',
                            'align-items': 'center',
                            'position': 'absolute',
                            'left': '0',
                            'top': '0',
                            'max-width': '100%',
                            'min-width': '0px',
                            'height': '56px',
                            'padding': '8px',
                            'box-sizing': 'border-box',
                            'box-shadow': 'unset',
                            'transform-origin': offset + 'px 28px',
                            'z-index': '1',
                            'overflow': 'hidden',
                            'width': '100%',
                            'border-radius': '0'
                        },

                        text_field: {
                            type: 'textarea',
                            placeholder: Satus.memory.get('locale/search'),
                            rows: 1,
                            on: {
                                render: function(component, name) {
                                    setTimeout(function() {
                                        let backspace = 0,
                                            list = {};

                                        component.addEventListener('keydown', function() {
                                            setTimeout(function() {
                                                if (component.value.length === 0) {
                                                    backspace++;

                                                    if (backspace == 2) {
                                                        component.parentNode.parentNode.querySelector('.satus-dialog__scrim').click();
                                                    }
                                                }
                                            }, 50);
                                        });

                                        component.addEventListener('input', function() {
                                            list = {};

                                            if (document.querySelector('.satus').querySelector('#search-results')) {
                                                document.querySelector('.satus').querySelector('#search-results').remove();
                                            }

                                            if (component.value.length >= 1) {
                                                backspace = 0;

                                                setTimeout(function() {
                                                    function search(string, object) {
                                                        let result = [];

                                                        for (let i in object) {
                                                            if (object[i].type) {
                                                                if (/(button|select|shortcut|slider|switch)/.test(object[i].type)) {
                                                                    if (i.indexOf(string) !== -1 || (object[i].tags && object[i].tags.indexOf(string) !== -1)) {
                                                                        if (object[i].type.indexOf('button') === -1 || !object[i].label) {
                                                                            list[i] = object[i];
                                                                        }
                                                                        //result.push(object[i]);
                                                                    }
                                                                } else {
                                                                    let response = search(string, object[i]);

                                                                    if (response.length > 0) {
                                                                        for (let j = 0, l = response.length; j < l; j++) {
                                                                            result.push(response[i]);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }

                                                        return result;
                                                    }

                                                    search(component.value, Menu);

                                                    let results = document.createElement('div');

                                                    results.id = 'search-results';

                                                    Satus.render(results, list);

                                                    component.parentNode.parentNode.appendChild(results);
                                                });
                                            }
                                        });

                                        component.focus();
                                    });
                                }
                            }
                        }
                    }));
                }
            },
            vert: {
                type: 'button',
                icon: '<svg viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></svg>',

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

                        bug: {
                            type: 'button',
                            label: 'bug',
                            icon: '<svg viewBox="0 0 24 24" style=width:22px;height:22px;margin-right:10px><path d="M20 8h-2.81a5.985 5.985 0 00-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z"></svg>',
                            onclick: function() {
                                document.querySelector('.satus-dialog__scrim').click();

                                self.components.dialog.create({
                                    type: 'dialog',

                                    section: {
                                        type: 'section',
                                        style: {
                                            'flex-direction': 'column',
                                            'flex': '0',
                                            'width': '100%'
                                        },

                                        email: {
                                            type: 'text',
                                            label: 'E-mail:',
                                            value: 'bugs@improvedtube.com',
                                            style: {
                                                'width': '100%'
                                            }
                                        }
                                    }
                                });
                            }
                        },
                        github: {
                            type: 'button',
                            label: 'github',
                            icon: '<svg viewBox="0 0 16 16" style=width:16px;height:16px;margin-right:10px><path fill-rule=evenodd d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></svg>',
                            onclick: function() {
                                window.open('https://github.com/ImprovedTube/ImprovedTube/');
                            }
                        },
                        rate: {
                            type: 'button',
                            label: 'rateUs',
                            icon: '<svg viewBox="0 0 24 24" style=width:16px;height:16px;margin-right:10px><path fill=none d="M0 0h24v24H0V0zm0 0h24v24H0V0z"/><path d="M13 2L8 8 7 9v10l2 2h9l2-1 3-8c1-2-1-4-3-4h-5l1-5-1-1h-2zM3 21l2-2v-8L3 9l-2 2v8l2 2z"></svg>',
                            onclick: function() {
                                window.open('https://chrome.google.com/webstore/detail/improve-youtube-open-sour/bnomihfieiccainjcjblhegjgglakjdd');
                            }
                        }
                    }));
                }
            }
        }
    }
};