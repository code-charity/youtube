Menu.main.section.player = {
    type: 'folder',
    before: '<svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>',
    label: 'player',
    class: 'satus-folder--player',
    appearanceId: 'player',

    general: {
        type: 'section',

        player_autoplay: {
            type: 'switch',
            label: 'autoplay',
            value: true
        },
        player_autopause_when_switching_tabs: {
            type: 'switch',
            label: 'autopauseWhenSwitchingTabs'
        },
        player_forced_playback_speed: {
            type: 'switch',
            label: 'forcedPlaybackSpeed',
            id: 'forced-playback-speed',
            onrender: function() {
                this.dataset.value = Satus.storage.player_forced_playback_speed;
            },
            onchange: function() {
                this.dataset.value = Satus.storage.player_forced_playback_speed;
            }
        },
        player_playback_speed: {
            type: 'slider',
            label: 'playbackSpeed',
            textarea: true,
            value: 1,
            min: .1,
            max: 8,
            step: .05
        },
        player_subtitles: {
            type: 'switch',
            label: 'subtitles',
            value: true
        },
        up_next_autoplay: {
            type: 'switch',
            label: 'upNextAutoplay',
            value: true
        },
        player_ads: {
            label: 'ads',
            type: 'select',
            options: [{
                label: 'onAllVideos',
                value: 'all_videos',
                default: 'true'
            }, {
                label: 'onSubscribedChannels',
                value: 'subscribed_channels'
            }, {
                label: 'Block all',
                value: 'block_all'
            }]
        },
        mini_player: {
            type: 'switch',
            label: 'miniPlayer'
        },
        player_autofullscreen: {
            type: 'switch',
            label: 'autoFullscreen'
        }
    },

    section_label__videos: {
        type: 'text',
        class: 'satus-section--label',
        label: 'videos'
    },

    video: {
        type: 'section',

        player_quality: {
            type: 'select',
            label: 'quality',
            options: [{
                label: 'auto',
                value: 'auto'
            }, {
                label: '144p',
                value: 'tiny'
            }, {
                label: '240p',
                value: 'small'
            }, {
                label: '360p',
                value: 'medium'
            }, {
                label: '480p',
                value: 'large'
            }, {
                label: '720p',
                value: 'hd720'
            }, {
                label: '1080p',
                value: 'hd1080'
            }, {
                label: '1440p',
                value: 'hd1440'
            }, {
                label: '2160p',
                value: 'hd2160'
            }, {
                label: '2880p',
                value: 'hd2880'
            }, {
                label: '4320p',
                value: 'highres'
            }]
        },
        player_h264: {
            type: 'switch',
            label: 'codecH264',

            onclick: function() {
                if (component.dataset.value === 'true') {
                    Satus.components.dialog.create({
                        type: 'dialog',

                        message: {
                            type: 'text',
                            label: 'youtubeLimitsVideoQualityTo1080pForH264Codec',
                            style: {
                                'width': '100%',
                                'opacity': '.8'
                            }
                        },
                        section: {
                            type: 'section',
                            class: 'controls',
                            style: {
                                'justify-content': 'flex-end'
                            },

                            cancel: {
                                type: 'button',
                                label: 'cancel',
                                onclick: function() {
                                    let scrim = document.querySelectorAll('.satus-dialog__scrim');

                                    scrim[scrim.length - 1].click();
                                }
                            },
                            ok: {
                                type: 'button',
                                label: 'OK',
                                onclick: function() {
                                    let scrim = document.querySelectorAll('.satus-dialog__scrim');

                                    scrim[scrim.length - 1].click();
                                }
                            }
                        }
                    });
                }
            }
        },
        player_60fps: {
            type: 'switch',
            label: 'allow60fps',
            value: true
        },
    },

    section_label__audio: {
        type: 'text',
        class: 'satus-section--label',
        label: 'audio'
    },

    audio: {
        type: 'section',
        label: 'audio',

        player_forced_volume: {
            type: 'switch',
            label: 'forcedVolume',
            id: 'forced-volume',
            onrender: function() {
                this.dataset.value = Satus.storage.player_forced_volume;
            },
            onchange: function() {
                this.dataset.value = Satus.storage.player_forced_volume;
            }
        },
        player_volume: {
            type: 'slider',
            label: 'volume',
            step: 1,
            max: 100,
            value: 100
        },
        player_loudness_normalization: {
            type: 'switch',
            label: 'loudnessNormalization',
            value: true
        }
    },

    section_label__buttons: {
        type: 'text',
        class: 'satus-section--label',
        label: 'buttons'
    },

    buttons: {
        type: 'section',

        player_screenshot: {
            type: 'folder',
            label: 'screenshot',

            section: {
                type: 'section',

                player_screenshot_button: {
                    type: 'switch',
                    label: 'activate'
                },
                player_screenshot_save_as: {
                    type: 'select',
                    label: 'saveAs',
                    options: [{
                        label: 'file',
                        value: 'file'
                    }, {
                        label: 'clipboard',
                        value: 'clipboard'
                    }]
                }
            }
        },
        player_repeat: {
            type: 'folder',
            label: 'repeat',

            section: {
                type: 'section',

                player_repeat_button: {
                    type: 'switch',
                    label: 'activate'
                },
                player_always_repeat: {
                    type: 'switch',
                    label: 'alwaysActive'
                }
            }
        },
        player_rotate_button: {
            type: 'switch',
            label: 'rotate'
        },
        player_popup_button: {
            type: 'switch',
            label: 'popupPlayer'
        }
    }
};