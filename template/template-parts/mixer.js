Menu.main.section.mixer = {
    type: 'folder',
    label: 'mixer',
    icon: '<svg viewBox="0 0 24 24"><path d="M3 10v4c0 .6.5 1 1 1h3l3.3 3.3a1 1 0 0 0 1.7-.7V6.4a1 1 0 0 0-1.7-.7L7 9H4a1 1 0 0 0-1 1zm13.5 2c0-1.8-1-3.3-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 4.5v.2c0 .3.3.7.6.8a7 7 0 0 1 0 13 1 1 0 0 0-.6.8v.3c0 .6.6 1 1.2.8a9 9 0 0 0 0-16.8c-.6-.2-1.2.2-1.2.8z"></svg>',

    section: {
        type: 'section',
        style: {
            'flex-direction': 'column'
        },

        on: {
            render: function(component, item) {
                if (chrome && chrome.tabs) {
                    chrome.tabs.query({}, function(tabs) {
                        var mixer = {};

                        for (var i = 0, l = tabs.length; i < l; i++) {
                            if (tabs[i].hasOwnProperty('url')) {
                                var tab = tabs[i];

                                if (/(\?|\&)v=/.test(tab.url)) {
                                    var title = tab.title.replace(' - YouTube', '');

                                    mixer[i] = {
                                        type: 'section',
                                        label: title.length > 20 ? title.substr(0, 20) + '...' : title,
                                        class: 'mixer',
                                        style: {
                                            'background': 'url(https://img.youtube.com/vi/' + tab.url.match(/(\?|\&)v=[^&]+/)[0].substr(3) + '/0.jpg) no-repeat center',
                                            'background-color': '#000',
                                            'background-size': 'cover'
                                        },

                                        section: {
                                            type: 'section',
                                            dataset: {
                                                'noConnectionLabel': Satus.memory.get('locale/tryToReloadThePage') || 'tryToReloadThePage'
                                            },

                                            mixer_volume: {
                                                type: 'slider',
                                                label: 'volume',
                                                dataset: {
                                                    id: tab.id,
                                                    type: 'audio'
                                                },
                                                max: 100,
                                                style: {
                                                    'width': '100%'
                                                },
                                                on: {
                                                    render: function(component, item) {
                                                        chrome.tabs.sendMessage(tab.id, 'request_volume', function(response) {
                                                            if (!response) {
                                                                component.parentNode.parentNode.classList.add('noconnection');
                                                            }

                                                            document.querySelector('div[data-type="audio"][data-id="' + tab.id + '"]').change(Number(response) * 100);
                                                        });
                                                    }
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
                                                    type: 'playback_speed'
                                                },
                                                min: .1,
                                                max: 8,
                                                step: .05,
                                                style: {
                                                    'width': '100%'
                                                },
                                                onload: function() {
                                                    chrome.tabs.sendMessage(tab.id, 'request_playback_speed', function(response) {
                                                        if (!response) {
                                                            component.parentNode.parentNode.classList.add('noconnection');
                                                        }

                                                        document.querySelector('div[data-type="playback_speed"][data-id="' + tab.id + '"]').change(Number(response));
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
                            mixer.message = {
                                type: 'text',
                                label: 'noOpenVideoTabs'
                            };
                        }

                        Satus.render(component, mixer);
                    });
                }
            }
        }
    }
};