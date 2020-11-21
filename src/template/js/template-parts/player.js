Menu.main.section.player = {
    type: 'button',
    before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>',
    label: 'player',
    class: 'satus-button--player',
    appearanceKey: 'player',

    general: {
        type: 'section',
        variant: 'card',

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
                this.dataset.value = satus.storage.player_forced_playback_speed;
            },
            onchange: function() {
                this.dataset.value = satus.storage.player_forced_playback_speed;
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
        player_crop_chapter_titles: {
            type: 'switch',
            label: 'cropChapterTitles',
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
                label: 'blockAll',
                value: 'block_all'
            }]
        },
        mini_player: {
            type: 'switch',
            label: 'customMiniPlayer'
        },
        player_autofullscreen: {
            type: 'switch',
            label: 'autoFullscreen'
        }
    },

    section_label__videos: {
        type: 'text',
        variant: 'section-label',
        label: 'videos'
    },

    video: {
        type: 'section',
        variant: 'card',

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
                if (this.querySelector('input').checked === true) {
                    satus.render({
                        type: 'dialog',
                        class: 'satus-dialog--confirm',

                        message: {
                            type: 'text',
                            class: 'satus-dialog__message',
                            label: 'youtubeLimitsVideoQualityTo1080pForH264Codec'
                        },
                        section: {
                            type: 'section',
                            class: 'satus-section--actions',

                            cancel: {
                                type: 'button',
                                variant: 'text',
                                label: 'cancel',
                                onclick: function() {
                                    let scrim = document.querySelectorAll('.satus-dialog__scrim');

                                    scrim[scrim.length - 1].click();
                                }
                            },
                            ok: {
                                type: 'button',
                                variant: 'text',
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
            value: true,
            onclick: function() {
                if (this.querySelector('input').checked === true) {
                    satus.render({
                        type: 'dialog',
                        class: 'satus-dialog--confirm',

                        message: {
                            type: 'text',
                            class: 'satus-dialog__message',
                            label: 'youtubeLimitsVideoQualityTo1080pForH264Codec'
                        },
                        section: {
                            type: 'section',
                            class: 'satus-section--actions',

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
    },

    section_label__audio: {
        type: 'text',
        variant: 'section-label',
        label: 'audio'
    },

    audio: {
        type: 'section',
        variant: 'card',
        label: 'audio',

        player_forced_volume: {
            type: 'switch',
            label: 'forcedVolume',
            id: 'forced-volume',
            onrender: function() {
                this.dataset.value = satus.storage.player_forced_volume;
            },
            onchange: function() {
                this.dataset.value = satus.storage.player_forced_volume;
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
        variant: 'section-label',
        label: 'buttons'
    },

    buttons: {
        type: 'section',
        variant: 'card',

        player_screenshot: {
            type: 'button',
            variant: 'list-item',
            label: 'screenshot',

            section: {
                type: 'section',
                variant: 'card',

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
            type: 'button',
            variant: 'list-item',
            label: 'repeat',

            section: {
                type: 'section',
                variant: 'card',

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