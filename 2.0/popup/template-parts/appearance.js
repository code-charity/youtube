Satus.prototype.menu.main.appearance = {
    type: 'directory',
    icon: '<svg xmlns=//www.w3.org/2000/svg viewBox="0 0 24 24"><path d="M7 16c.6 0 1 .5 1 1a2 2 0 0 1-2 2h-.5a4 4 0 0 0 .5-2c0-.6.5-1 1-1M18.7 3a1 1 0 0 0-.7.3l-9 9 2.8 2.7 9-9c.3-.4.3-1 0-1.4l-1.4-1.3a1 1 0 0 0-.7-.3zM7 14a3 3 0 0 0-3 3c0 1.3-1.2 2-2 2 1 1.2 2.5 2 4 2a4 4 0 0 0 4-4 3 3 0 0 0-3-3z"></svg>',

    header: {
        type: 'button',
        label: 'header',
        class: 'header',

        onclick: function(satus, component) {
            satus.components.dialog.create({
                type: 'dialog',

                header_position: {
                    type: 'select',
                    label: 'position',
                    options: [{
                        label: 'normal',
                        value: 'normal'
                    }, {
                        label: 'hidden',
                        value: 'hidden'
                    }, {
                        label: 'hover',
                        value: 'hover'
                    }, {
                        label: 'hiddenOnVideoPage',
                        value: 'hidden_on_video_page'
                    }, {
                        label: 'hoverOnVideoPage',
                        value: 'hover_on_video_page'
                    }, {
                        label: 'static',
                        value: 'static'
                    }],
                    tags: 'hover,static,top'
                },
                header_improve_logo: {
                    type: 'switch',
                    label: 'improveLogo',
                    tags: 'youtube'
                },
                header_hide_right_buttons: {
                    type: 'switch',
                    label: 'hideRightButtons',
                    tags: 'user'
                }
            });
        }
    },
    player: {
        type: 'button',
        label: 'player',
        class: 'player',

        onclick: function(satus, component) {
            satus.components.dialog.create({
                type: 'dialog',

                player_hide_annotations: {
                    type: 'switch',
                    label: 'hideAnnotations',
                    tags: 'hide,remove,elements'
                },
                player_hide_cards: {
                    type: 'switch',
                    label: 'hideCards',
                    tags: 'hide,remove,elements'
                },
                player_size: {
                    type: 'select',
                    label: 'playerSize',
                    options: [{
                        label: 'doNotChange',
                        value: 'do_not_change'
                    }, {
                        label: 'fullWindow',
                        value: 'full_window'
                    }, {
                        label: '240p',
                        value: '240p'
                    }, {
                        label: '360p',
                        value: '360p'
                    }, {
                        label: '480p',
                        value: '480p'
                    }, {
                        label: '576p',
                        value: '576p'
                    }, {
                        label: '720p',
                        value: '720p'
                    }, {
                        label: '1080p',
                        value: '1080p'
                    }, {
                        label: '1440p',
                        value: '1440p'
                    }, {
                        label: '2160p',
                        value: '2160p'
                    }]
                },
                forced_theater_mode: {
                    type: 'switch',
                    label: 'forcedTheaterMode',
                    tags: 'wide'
                },
                player_color: {
                    label: 'playerColor',
                    type: 'select',
                    options: [{
                        label: 'red',
                        value: 'red'
                    }, {
                        label: 'pink',
                        value: 'pink'
                    }, {
                        label: 'purple',
                        value: 'purple'
                    }, {
                        label: 'deepPurple',
                        value: 'deep_purple'
                    }, {
                        label: 'indigo',
                        value: 'indigo'
                    }, {
                        label: 'blue',
                        value: 'blue'
                    }, {
                        label: 'lightBlue',
                        value: 'light_blue'
                    }, {
                        label: 'cyan',
                        value: 'cyan'
                    }, {
                        label: 'teal',
                        value: 'teal'
                    }, {
                        label: 'green',
                        value: 'green'
                    }, {
                        label: 'lightGreen',
                        value: 'light_green'
                    }, {
                        label: 'lime',
                        value: 'lime'
                    }, {
                        label: 'yellow',
                        value: 'yellow'
                    }, {
                        label: 'amber',
                        value: 'amber'
                    }, {
                        label: 'orange',
                        value: 'orange'
                    }, {
                        label: 'deepOrange',
                        value: 'deep_orange'
                    }, {
                        label: 'brown',
                        value: 'brown'
                    }, {
                        label: 'blueGray',
                        value: 'blue_gray'
                    }, {
                        label: 'white',
                        value: 'white'
                    }],
                    tags: 'style'
                },
                player_transparent_background: {
                    type: 'switch',
                    label: 'transparentBackground'
                },
                player_hide_endscreen: {
                    type: 'switch',
                    label: 'hideEndscreen'
                },
                player_hd_thumbnail: {
                    type: 'switch',
                    label: 'hdThumbnail',
                    tags: 'preview'
                },
                hide_scroll_for_details: {
                    type: 'switch',
                    label: 'hideScrollForDetails',
                    tags: 'remove,hide'
                }
            });
        }
    },
    details: {
        type: 'button',
        label: 'details',
        class: 'details',

        onclick: function(satus, component) {
            satus.components.dialog.create({
                type: 'dialog',

                hide_details: {
                    type: 'switch',
                    label: 'hideDetails',
                    tags: 'hide,remove'
                },
                hide_views_count: {
                    type: 'switch',
                    label: 'hideViewsCount',
                    tags: 'hide,remove'
                },
                likes: {
                    type: 'select',
                    label: 'likes',

                    options: [{
                        label: 'normal',
                        value: 'normal'
                    }, {
                        label: 'iconsOnly',
                        value: 'icons_only'
                    }, {
                        label: 'hidden',
                        value: 'hidden'
                    }],
                    tags: 'hide,remove'
                },
                how_long_ago_the_video_was_uploaded: {
                    type: 'switch',
                    label: 'howLongAgoTheVideoWasUploaded'
                },
                channel_videos_count: {
                    type: 'switch',
                    label: 'showChannelVideosCount'
                },
                description: {
                    type: 'select',

                    options: [{
                        label: 'normal',
                        value: 'normal'
                    }, {
                        label: 'expanded',
                        value: 'expanded'
                    }, {
                        label: 'hidden',
                        value: 'hidden'
                    }],
                    tags: 'hide,remove'
                }
            });
        }
    },
    comments: {
        type: 'button',
        label: 'comments',
        class: 'comments',

        onclick: function(satus, component) {
            satus.components.dialog.create({
                type: 'dialog',

                comments: {
                    type: 'select',

                    options: [{
                        label: 'normal',
                        value: 'normal'
                    }, {
                        label: 'collapsed',
                        value: 'collapsed'
                    }, {
                        label: 'hidden',
                        value: 'hidden'
                    }]
                }
            });
        }
    },
    footer: {
        type: 'button',
        label: 'footer',
        class: 'footer',

        onclick: function(satus, component) {
            satus.components.dialog.create({
                type: 'dialog',

                hide_footer: {
                    type: 'switch',
                    label: 'hideFooter',
                    tags: 'bottom'
                }
            });
        }
    },
    sidebar: {
        type: 'button',
        label: 'sidebar',
        class: 'sidebar',

        onclick: function(satus, component) {
            satus.components.dialog.create({
                type: 'dialog',

                livechat: {
                    type: 'select',
                    label: 'liveChat',

                    options: [{
                        label: 'normal',
                        value: 'normal'
                    }, {
                        label: 'collapsed',
                        value: 'collapsed'
                    }, {
                        label: 'hidden',
                        value: 'hidden'
                    }]
                },
                hide_playlist: {
                    type: 'switch',
                    label: 'hidePlaylist'
                },
                related_videos: {
                    type: 'select',
                    label: 'relatedVideos',
                    options: [{
                        label: 'normal',
                        value: 'normal'
                    }, {
                        label: 'collapsed',
                        value: 'collapsed'
                    }, {
                        label: 'hidden',
                        value: 'hidden'
                    }],
                    tags: 'right'
                }
            });
        }
    }
};