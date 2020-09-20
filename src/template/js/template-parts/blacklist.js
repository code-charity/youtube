Menu.main.section.blacklist = {
    type: 'folder',
    before: '<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg>',
    label: 'blacklist',
    class: 'satus-folder--blacklist',
    appearanceKey: 'blacklist',

    section_activate: {
        type: 'section',

        blacklist_activate: {
            type: 'switch',
            label: 'activate'
        }
    },

    section: {
        type: 'section',

        channels: {
            type: 'folder',
            label: 'channels',
            onopen: function() {
                var self = this;

                if (Satus.storage.blacklist && Satus.storage.blacklist.channels) {
                    var list = {};

                    for (var item in Satus.storage.blacklist.channels) {
                        if (Satus.storage.blacklist.channels[item] !== false) {
                            var title = Satus.storage.blacklist.channels[item].title || '';

                            list[item] = {
                                type: 'section',
                                label: title.length > 20 ? title.substr(0, 20) + '...' : title,
                                class: 'satus-section--blacklist',
                                style: {
                                    'background-image': 'url(' + Satus.storage.blacklist.channels[item].preview + ')',
                                    'background-color': '#000'
                                },

                                section: {
                                    type: 'section',

                                    delete: {
                                        type: 'button',
                                        icon: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10zM18 4h-2.5l-.7-.7A1 1 0 0 0 14 3H9.9a1 1 0 0 0-.7.3l-.7.7H6c-.6 0-1 .5-1 1s.5 1 1 1h12c.6 0 1-.5 1-1s-.5-1-1-1z"></svg>',
                                        onclick: function() {
                                            delete Satus.storage.blacklist.channels[item];

                                            Satus.storage.set('blacklist', Satus.storage.blacklist);

                                            this.classList.add('removing');

                                            setTimeout(function() {
                                                self.remove();
                                            }, 250);
                                        }
                                    }
                                }
                            };
                        }
                    }

                    if (Object.keys(list).length === 0) {
                        list.section = {
                            type: 'section',
                            class: 'satus-section--message',

                            error: {
                                type: 'text',
                                label: 'empty'
                            }
                        };
                    }

                    Satus.render(list, this);
                } else {
                    Satus.render({
                        type: 'section',
                        class: 'satus-section--message',

                        error: {
                            type: 'text',
                            label: 'empty'
                        }
                    }, this);
                }
            }
        },
        videos: {
            type: 'folder',
            label: 'videos',
            onopen: function() {
                var self = this;

                if (Satus.storage.blacklist && Satus.storage.blacklist.videos) {
                    let list = {};

                    for (let item in Satus.storage.blacklist.videos) {
                        if (Satus.storage.blacklist.videos[item] !== false) {
                            let title = Satus.storage.blacklist.videos[item].title || '';

                            list[item] = {
                                type: 'section',
                                label: title.length > 20 ? title.substr(0, 20) + '...' : title,
                                class: 'satus-section--blacklist',
                                style: {
                                    'background-image': 'url(https://img.youtube.com/vi/' + item + '/0.jpg)'
                                },

                                section: {
                                    type: 'section',

                                    delete: {
                                        type: 'button',
                                        icon: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10zM18 4h-2.5l-.7-.7A1 1 0 0 0 14 3H9.9a1 1 0 0 0-.7.3l-.7.7H6c-.6 0-1 .5-1 1s.5 1 1 1h12c.6 0 1-.5 1-1s-.5-1-1-1z"></svg>',
                                        onclick: function() {
                                            delete Satus.storage.blacklist.videos[item];

                                            Satus.storage.set('blacklist', Satus.storage.blacklist);
                                            this.parentNode.parentNode.classList.add('removing');

                                            setTimeout(function() {
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
                            type: 'section',
                            class: 'satus-section--message',

                            error: {
                                type: 'text',
                                label: 'empty'
                            }
                        };
                    }

                    Satus.render(list, this);
                } else {
                    Satus.render({
                        type: 'section',
                        class: 'satus-section--message',

                        error: {
                            type: 'text',
                            label: 'empty'
                        }
                    }, this);
                }
            }
        }
    }
};
