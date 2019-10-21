Satus.prototype.menu.main.player = {
    type: 'directory',
    icon: '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24"><path d="M8 6.8v10.4a1 1 0 0 0 1.5.8l8.2-5.2a1 1 0 0 0 0-1.7L9.5 6a1 1 0 0 0-1.5.8z"></svg>',

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
            min: .25,
            max: 2,
            step: .25
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
            label: 'codecH264'
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
        player_autopause: {
            type: 'switch',
            label: 'autopause'
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