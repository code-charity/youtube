Satus.prototype.menu.main.player = {
    type: 'directory',
    icon: '<svg viewBox="0 0 24 24"><path d="M8 6.8v10.4a1 1 0 0 0 1.5.8l8.2-5.2a1 1 0 0 0 0-1.7L9.5 6a1 1 0 0 0-1.5.8z"></svg>',

    section: {
        type: 'section',
        styles: {
            'flex-direction': 'column'
        },

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
        player_playback_speed: {
            type: 'slider',
            label: 'playbackSpeed',
            value: 1,
            min: .1,
            max: 16,
            step: .05
        },
        player_autoplay: {
            type: 'switch',
            label: 'autoplay',
            value: true
        },
        player_60fps: {
            type: 'switch',
            label: 'allow60fps',
            value: true
        },
        player_h264: {
            type: 'switch',
            label: 'codecH264',

            onclick: function(satus, component) {
                if (component.dataset.value === 'true') {
                    satus.components.dialog.create({
                        type: 'dialog',

                        message: {
                            type: 'text',
                            label: 'youtubeLimitsVideoQualityTo1080pForH264Codec',
                            styles: {
                                'width': '100%',
                                'opacity': '.8'
                            }
                        },
                        section: {
                            type: 'section',
                            class: 'controls',
                            styles: {
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
        player_subtitles: {
            type: 'switch',
            label: 'subtitles',
            value: true
        },
        player_loudness_normalization: {
            type: 'switch',
            label: 'loudnessNormalization',
            value: true
        },
        up_next_autoplay: {
            type: 'switch',
            label: 'upNextAutoplay',
            value: true
        },
        mini_player: {
            type: 'switch',
            label: 'miniPlayer'
        },
        native_mini_player: {
            type: 'switch',
            label: 'nativeMiniPlayer',
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
        player_autopause_when_switching_tabs: {
            type: 'switch',
            label: 'autopauseWhenSwitchingTabs'
        },
        player_autofullscreen: {
            type: 'switch',
            label: 'autoFullscreen'
        }
    },

    custom_buttons_section: {
        type: 'section',
        styles: {
            'flex-direction': 'column'
        },

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