/*-----------------------------------------------------------------------------
>>> «MAIN» TEMPLATE PART
-----------------------------------------------------------------------------*/

Menu.main = {
    type: 'tabs',

    all: {
        type: 'tab',
        label: 'all',

        main: {
            type: 'main',

            section: {
                type: 'section'
            },
            links: {
                type: 'section',

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
            }
        }
    },
    activated: {
        type: 'tab',
        label: 'activated',

        main: {
            type: 'main',

            section: {
                type: 'section',
                style: {
                    'flex-direction': 'column',
                    'flex': '0',
                    'width': '100%'
                },
                on: {
                    render: function(component) {
                        var new_menu = {},
                            storage = Satus.storage.get('');

                        function search(string, object) {
                            let result = [];

                            for (let i in object) {
                                if (object[i].type) {
                                    if (/(button|select|shortcut|slider|switch)/.test(object[i].type)) {
                                        if (i.indexOf(string) !== -1 || (object[i].tags && object[i].tags.indexOf(string) !== -1)) {
                                            if (object[i].type.indexOf('button') === -1 || !object[i].label) {
                                                new_menu[i] = object[i];
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

                        for (var key in storage) {
                            search(key, Menu)
                        }

                        setTimeout(function() {
                            Satus.render(component, new_menu);
                        });
                    }
                }
            }
        }
    }
};