Satus.prototype.menu.header = {
    type: 'header',

    section_start: {
        type: 'section',

        back: {
            type: 'button',
            class: 'back',
            icon: '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24" style=width:20px;height:20px><path d="M16.6 3c-.5-.5-1.3-.5-1.8 0l-8.3 8.3a1 1 0 0 0 0 1.4l8.3 8.3a1.2 1.2 0 1 0 1.8-1.7L9.4 12l7.2-7.3c.5-.4.5-1.2 0-1.7z"></svg>',
            onclick: function(satus, component) {
                let status = satus.container.querySelector('main').goBack();

                if (!status) {
                    component.classList.remove('show');
                }
            }
        },
        title: {
            type: 'text',
            label: 'ImprovedTube',
            class: 'title',
            styles: {
                'margin': '0 0 0 6px',
                'font-size': '16px',
                'font-weight': '500',
                'letter-spacing': '.25px'
            }
        }
    },
    section_end: {
        type: 'section',
        styles: {
            'justify-content': 'flex-end'
        },

        search: {
            type: 'button',
            icon: '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24"><path d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l4.3 4.3a1 1 0 0 0 1.4-1.5L15.5 14zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"></svg>',
            onclick: function(satus, component) {
                let offset = component.offsetLeft - component.offsetWidth / 2;

                satus.components.dialog.create({
                    type: 'dialog',
                    options: {
                        surface_styles: {
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
                            'z-index': '1'
                        }
                    },

                    /*back: {
                        type: 'button',
                        icon: '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24" style=width:20px;height:20px><path d="M16.6 3c-.5-.5-1.3-.5-1.8 0l-8.3 8.3a1 1 0 0 0 0 1.4l8.3 8.3a1.2 1.2 0 1 0 1.8-1.7L9.4 12l7.2-7.3c.5-.4.5-1.2 0-1.7z"></svg>',
                        onclick: function(satus, component) {
                            component.parentNode.parentNode.querySelector('.satus-dialog__scrim').click();
                        }
                    },*/
                    text_field: {
                        type: 'text-field',
                        placeholder: 'search',
                        onload: function(satus, component) {
                            setTimeout(function() {
                                let input = component.querySelector('input'),
                                    backspace = 0,
                                    list = {};

                                input.addEventListener('keydown', function() {
                                    setTimeout(function() {
                                        if (input.value.length === 0) {
                                            backspace++;

                                            if (backspace == 2) {
                                                component.parentNode.parentNode.querySelector('.satus-dialog__scrim').click();
                                            }
                                        }
                                    }, 50);
                                });

                                input.addEventListener('input', function() {
                                    list = {};

                                    if (satus.container.querySelector('#search-results')) {
                                        satus.container.querySelector('#search-results').remove();
                                    }

                                    if (input.value.length >= 1) {
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

                                            search(input.value, Satus.prototype.menu);

                                            let results = document.createElement('div');

                                            results.id = 'search-results';

                                            satus.constructors.render(list, results);

                                            component.parentNode.parentNode.appendChild(results);
                                        });
                                    }
                                });

                                input.focus();
                            });
                        }
                    }
                });
            }
        },
        vert: {
            type: 'button',
            icon: '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></svg>',

            onclick: function(self, component) {
                if (self.container.querySelector('main').dataset.path === '/settings/about') {
                    self.components.dialog.create({
                        type: 'dialog',
                        options: {
                            surface_styles: {
                                'position': 'absolute',
                                'right': '8px',
                                'top': '4px',
                                'max-width': '200px',
                                'min-width': '0px'
                            }
                        },

                        save_as: {
                            type: 'button',
                            label: 'saveAs',
                            icon: '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24" style=width:16px;height:16px;margin-right:10px;margin-top:2px><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
                            onclick: function(satus, component) {
                                chrome.runtime.sendMessage({
                                    name: 'download',
                                    filename: 'improvedtube-report',
                                    value: satus.modules.user.get()
                                });
                            }
                        }
                    });
                } else {
                    self.components.dialog.create({
                        type: 'dialog',
                        options: {
                            surface_styles: {
                                'position': 'absolute',
                                'right': '8px',
                                'top': '4px',
                                'max-width': '200px',
                                'min-width': '0px'
                            }
                        },

                        github: {
                            type: 'button',
                            label: 'github',
                            icon: '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 16 16" style=width:16px;height:16px;margin-right:10px><path fill-rule=evenodd d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></svg>'
                        },
                        rate: {
                            type: 'button',
                            label: 'rateUs',
                            icon: '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24" style=width:16px;height:16px;margin-right:10px><path fill=none d="M0 0h24v24H0V0zm0 0h24v24H0V0z"/><path d="M13 2L8 8 7 9v10l2 2h9l2-1 3-8c1-2-1-4-3-4h-5l1-5-1-1h-2zM3 21l2-2v-8L3 9l-2 2v8l2 2z"></svg>'
                        }
                    });
                }
            }
        }
    }
};