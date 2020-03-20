Menu.main.section.player = {
    type: 'folder',
    icon: '<svg viewBox="0 0 24 24"><path d="M8 6.8v10.4a1 1 0 0 0 1.5.8l8.2-5.2a1 1 0 0 0 0-1.7L9.5 6a1 1 0 0 0-1.5.8z"></svg>',

    general: {
        type: 'section',
        label: 'general',

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
            id: 'forced-playback-speed'
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

    video: {
        type: 'section',
        label: 'video',

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

    audio: {
        type: 'section',
        label: 'audio',

        player_forced_volume: {
            type: 'switch',
            label: 'forcedVolume',
            id: 'forced-volume'
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

    buttons: {
        type: 'section',
        label: 'buttons',

        player_repeat_button: {
            type: 'switch',
            label: 'repeat'
        },
        player_screenshot_button: {
            type: 'switch',
            label: 'screenshot'
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