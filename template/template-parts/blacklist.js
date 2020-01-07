Menu.main.section.blacklist = {
    type: 'folder',
    label: 'blacklist',
    icon: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM4 12a8 8 0 0 1 12.9-6.3L5.7 16.9c-1-1.3-1.7-3-1.7-4.9zm8 8c-1.9 0-3.5-.6-4.9-1.7L18.3 7.1A8 8 0 0 1 12 20z"></svg>',

    section: {
        type: 'section',

        blacklist_activate: {
            type: 'switch',
            label: 'blacklist'
        },
    },

    section__data: {
        type: 'section',
        label: 'items',

        channels: {
            type: 'folder',
            label: 'channels',

            section: {
                type: 'section',
                style: {
                    'flex-direction': 'column'
                },

                on: {
                    render: function(component) {
                        let storage = Satus.storage.get('');

                        if (storage.blacklist && storage.blacklist.channels) {
                            let list = {};

                            for (let item in storage.blacklist.channels) {
                                if (storage.blacklist.channels[item] !== false) {
                                    let title = storage.blacklist.channels[item].title || '';

                                    list[item] = {
                                        type: 'section',
                                        label: title.length > 20 ? title.substr(0, 20) + '...' : title,
                                        class: ['satus-section--blacklist'],
                                        style: {
                                            'background-image': 'url(' + storage.blacklist.channels[item].preview + ')',
                                            'background-color': '#000'
                                        },

                                        section: {
                                            type: 'section',

                                            delete: {
                                                type: 'button',
                                                icon: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10zM18 4h-2.5l-.7-.7A1 1 0 0 0 14 3H9.9a1 1 0 0 0-.7.3l-.7.7H6c-.6 0-1 .5-1 1s.5 1 1 1h12c.6 0 1-.5 1-1s-.5-1-1-1z"></svg>',
                                                onclick: function() {
                                                    Satus.storage.set('/blacklist/channels/' + item, false);
                                                    component.classList.add('removing');

                                                    setTimeout(function() {
                                                        component.remove();
                                                    }, 250);
                                                }
                                            }
                                        }
                                    };
                                }
                            }

                            if (Object.keys(list).length === 0) {
                                list.error = {
                                    type: 'text',
                                    label: 'empty'
                                };
                            }

                            Satus.render(component, list);
                        } else {
                            Satus.render(component, {
                                error: {
                                    type: 'text',
                                    label: 'empty'
                                }
                            });
                        }
                    }
                }
            }
        },
        videos: {
            type: 'folder',
            label: 'videos',

            section: {
                type: 'section',
                style: {
                    'display': 'block'
                },

                on: {
                    render: function(component) {
                        let storage = Satus.storage.get('');

                        if (storage.blacklist && storage.blacklist.videos) {
                            let list = {};

                            for (let item in storage.blacklist.videos) {
                                if (storage.blacklist.videos[item] !== false) {
                                    let title = storage.blacklist.videos[item].title || '';

                                    list[item] = {
                                        type: 'section',
                                        label: title.length > 20 ? title.substr(0, 20) + '...' : title,
                                        class: ['satus-section--blacklist'],
                                        style: {
                                            'background-image': 'url(https://img.youtube.com/vi/' + item + '/0.jpg)'
                                        },

                                        section: {
                                            type: 'section',

                                            delete: {
                                                type: 'button',
                                                icon: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10zM18 4h-2.5l-.7-.7A1 1 0 0 0 14 3H9.9a1 1 0 0 0-.7.3l-.7.7H6c-.6 0-1 .5-1 1s.5 1 1 1h12c.6 0 1-.5 1-1s-.5-1-1-1z"></svg>',
                                                onclick: function() {
                                                    Satus.storage.set(item, false, '/blacklist/videos/');
                                                    component.parentNode.parentNode.classList.add('removing');

                                                    setTimeout(function() {
                                                        component.parentNode.parentNode.remove();
                                                    }, 250);
                                                }
                                            }
                                        }
                                    };
                                }
                            }

                            if (Object.keys(list).length === 0) {
                                list.error = {
                                    type: 'text',
                                    label: 'empty'
                                };
                            }

                            Satus.render(component, list);
                        } else {
                            Satus.render(component, {
                                error: {
                                    type: 'text',
                                    label: 'empty'
                                }
                            });
                        }
                    }
                }
            }
        }
    }
};