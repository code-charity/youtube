Menu.main.section.shortcuts = {
    type: 'folder',
    icon: '<svg viewBox="0 0 24 24"><path d="M20 5H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm8 7H9c-.6 0-1-.5-1-1s.5-1 1-1h6c.6 0 1 .5 1 1s-.5 1-1 1zm1-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"></svg>',

    section__player: {
        type: 'section',
        label: 'player',

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
        shortcut_increase_volume: {
            type: 'shortcut',
            label: 'increaseVolume5'
        },
        shortcut_decrease_volume: {
            type: 'shortcut',
            label: 'decreaseVolume5'
        },
        shortcut_increase_playback_speed: {
            type: 'shortcut',
            label: 'increasePlaybackSpeed'
        },
        shortcut_decrease_playback_speed: {
            type: 'shortcut',
            label: 'decreasePlaybackSpeed'
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
        shortcut_qualuty: {
            type: 'folder',
            label: 'quality',

            section: {
                type: 'section',

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
        }
    },

    section: {
        type: 'section',
        label: 'other',

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
        }
    }
};