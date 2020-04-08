Menu.header.section_end.button_vert.onClickRender.mixer = {
    type: 'folder',
    before: '<svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>',
    label: 'mixer',
    class: 'satus-folder--mixer',
    appearanceId: 'mixer',
    onopen: function() {
        var self = this;

        if (chrome && chrome.tabs) {
            chrome.tabs.query({}, function(tabs) {
                var mixer = {};

                for (var i = 0, l = tabs.length; i < l; i++) {
                    if (tabs[i].hasOwnProperty('url')) {
                        var tab = tabs[i];

                        if (/(\?|\&)v=/.test(tab.url)) {
                            mixer[i] = {
                                type: 'section',
                                class: 'satus-section--mixer',
                                style: {
                                    'background': 'url(https://img.youtube.com/vi/' + tab.url.match(/(\?|\&)v=[^&]+/)[0].substr(3) + '/0.jpg) center center / cover no-repeat #000',
                                },

                                section: {
                                    type: 'section',
                                    dataset: {
                                        'noConnectionLabel': Satus.locale.getMessage('tryToReloadThePage') || 'tryToReloadThePage'
                                    },

                                    mixer_volume: {
                                        type: 'slider',
                                        label: 'volume',
                                        dataset: {
                                            id: tab.id,
                                            element: 'audio'
                                        },
                                        max: 100,
                                        onrender: function() {
                                            var self = this;

                                            chrome.tabs.sendMessage(Number(this.dataset.id), {
                                                name: 'request_volume'
                                            }, function(response) {
                                                if (response) {
                                                    document.querySelector('div[data-element="audio"][data-id="' + Number(self.dataset.id) + '"]').change(response.value);
                                                } else {
                                                    self.parentNode.parentNode.classList.add('noconnection');
                                                }
                                            });
                                        },
                                        onchange: function(value) {
                                            chrome.tabs.sendMessage(Number(this.dataset.id), {
                                                name: 'change_volume',
                                                volume: value
                                            });
                                        }
                                    },
                                    mixer_playback_speed: {
                                        type: 'slider',
                                        label: 'playbackSpeed',
                                        dataset: {
                                            id: tab.id,
                                            element: 'playback_speed'
                                        },
                                        min: .1,
                                        max: 8,
                                        step: .05,
                                        onrender: function() {
                                            var self = this;

                                            chrome.tabs.sendMessage(Number(this.dataset.id), {
                                                name: 'request_playback_speed'
                                            }, function(response) {
                                                if (response) {
                                                    document.querySelector('div[data-element="playback_speed"][data-id="' + Number(self.dataset.id) + '"]').change(Number(response.value));
                                                } else {
                                                    self.parentNode.parentNode.classList.add('noconnection');
                                                }
                                            });
                                        },
                                        onchange: function(value) {
                                            chrome.tabs.sendMessage(Number(this.dataset.id), {
                                                name: 'change_playback_speed',
                                                playback_speed: value
                                            });
                                        }
                                    }
                                }
                            };
                        }
                    }
                }

                if (Object.entries(mixer).length === 0) {
                    mixer.section = {
                        type: 'section',

                        message: {
                            type: 'text',
                            class: 'satus-section--message',
                            label: 'noOpenVideoTabs'
                        }
                    };
                }

                document.querySelector('.satus-dialog__scrim').click();

                Satus.render(mixer, self);
            });
        }
    }
};