Menu.main.section.shortcuts = {
    type: 'button',
    before: '<svg stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z"/></svg>',
    label: 'shortcuts',
    class: 'satus-button--shortcut',
    appearanceKey: 'shortcuts',

    player_section_label: {
        type: 'text',
        variant: 'section-label',
        label: 'player'
    },

    player_section: {
        type: 'section',
        variant: 'card',

        shortcut_picture_in_picture: {
            type: 'shortcut',
            label: 'pictureInPicture'
        },
        shortcut_play_pause: {
            type: 'shortcut',
            label: 'playPause',
            value: {
                key: ' '
            }
        },
        shortcut_stop: {
            type: 'shortcut',
            label: 'stop'
        },
        shortcut_next_video: {
            type: 'shortcut',
            label: 'nextVideo',
            value: {
                key: 'N',
                shiftKey: true
            }
        },
        shortcut_prev_video: {
            type: 'shortcut',
            label: 'previousVideo',
            value: {
                key: 'P',
                shiftKey: true
            }
        },
        shortcut_seek_backward: {
            type: 'shortcut',
            label: 'seekBackward10Seconds',
            value: {
                key: 'J'
            }
        },
        shortcut_seek_forward: {
            type: 'shortcut',
            label: 'seekForward10Seconds',
            value: {
                key: 'I'
            }
        },
        shortcut_volume: {
            type: 'button',
            label: 'volume',

            section_step: {
                type: 'section',
                variant: 'card',

                shortcut_volume_step: {
                    type: 'slider',
                    label: 'step',
                    min: 1,
                    max: 10,
                    step: 1,
                    value: 5
                }
            },

            section: {
                type: 'section',
                variant: 'card',

                shortcut_increase_volume: {
                    type: 'shortcut',
                    label: 'increaseVolume',
                    custom_data: {
                        on_top_of_player: {
                            type: 'switch',
                            label: 'onTopOfPlayer',
                            storage: false
                        }
                    }
                },
                shortcut_decrease_volume: {
                    type: 'shortcut',
                    label: 'decreaseVolume',
                    custom_data: {
                        on_top_of_player: {
                            type: 'switch',
                            label: 'onTopOfPlayer',
                            storage: false
                        }
                    }
                }
            }
        },
        shortcut_playback_speed: {
            type: 'button',
            label: 'playbackSpeed',

            section_step: {
                type: 'section',
                variant: 'card',

                shortcut_playback_speed_step: {
                    type: 'slider',
                    label: 'step',
                    min: .05,
                    max: .5,
                    step: .05,
                    value: .05
                }
            },

            section: {
                type: 'section',
                variant: 'card',

                shortcut_increase_playback_speed: {
                    type: 'shortcut',
                    label: 'increasePlaybackSpeed'
                },
                shortcut_decrease_playback_speed: {
                    type: 'shortcut',
                    label: 'decreasePlaybackSpeed'
                }
            }
        },
        shortcut_activate_fullscreen: {
            type: 'shortcut',
            label: 'activateFullscreen',
            value: {
                key: 'F'
            }
        },
        shortcut_activate_captions: {
            type: 'shortcut',
            label: 'activateCaptions',
            value: {
                key: 'C'
            }
        },
        shortcut_quality: {
            type: 'button',
            label: 'quality',

            section: {
                type: 'section',
                variant: 'card',

                shortcut_240p: {
                    type: 'shortcut',
                    label: '240p'
                },
                shortcut_360p: {
                    type: 'shortcut',
                    label: '360p'
                },
                shortcut_480p: {
                    type: 'shortcut',
                    label: '480p'
                },
                shortcut_720p: {
                    type: 'shortcut',
                    label: '720p'
                },
                shortcut_1080p: {
                    type: 'shortcut',
                    label: '1080p'
                },
                shortcut_1440p: {
                    type: 'shortcut',
                    label: '1440p'
                },
                shortcut_2160p: {
                    type: 'shortcut',
                    label: '2160p'
                },
                shortcut_2880p: {
                    type: 'shortcut',
                    label: '2880p'
                },
                shortcut_4320p: {
                    type: 'shortcut',
                    label: '4320p'
                }
            }
        },
        shortcut_custom_mini_player: {
            type: 'shortcut',
            label: 'customMiniPlayer'
        },
        shortcut_screenshot: {
            type: 'shortcut',
            label: 'screenshot'
        },
        shortcut_stats_for_nerds: {
            type: 'shortcut',
            label: 'statsForNerds'
        },
        shortcut_toggle_cards: {
            type: 'shortcut',
            label: 'toggleCards'
        }
    },

    appearance_section_label: {
        type: 'text',
        variant: 'section-label',
        label: 'appearance'
    },

    appearance_section: {
        type: 'section',
        variant: 'card',

        shortcut_go_to_search_box: {
            type: 'shortcut',
            label: 'goToSearchBox',
            value: {
                key: '/'
            }
        },
        shortcut_like_shortcut: {
            type: 'shortcut',
            label: 'like'
        },
        shortcut_dislike_shortcut: {
            type: 'shortcut',
            label: 'dislike'
        },
        shortcut_dark_theme: {
            type: 'shortcut',
            label: 'darkTheme'
        }
    }
};
