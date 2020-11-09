Menu.main.section.appearance = {
    type: 'folder',
    before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
    label: 'appearance',
    class: 'satus-folder--appearance',
    appearanceKey: 'appearance',

    header: {
        type: 'folder',
        label: 'header',
        class: 'satus-folder--header',

        section: {
            type: 'section',

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
                tags: 'hide,hover,static,top'
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
        }
    },
    player: {
        type: 'folder',
        label: 'player',
        class: 'satus-folder--player',

        section: {
            type: 'section',

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
            player_show_cards_on_mouse_hover: {
                type: 'switch',
                label: 'showCardsOnMouseHover',
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
                    label: 'fitToWindow',
                    value: 'fit_to_window'
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
            },
            always_show_progress_bar: {
                type: 'switch',
                label: 'alwaysShowProgressBar'
            },
            hide_gradient_bottom: {
                type: 'switch',
                label: 'hideGradientBottom'
            }
        }
    },
    details: {
        type: 'folder',
        label: 'details',
        class: 'satus-folder--details',

        section: {
            type: 'section',

            hide_details: {
                type: 'switch',
                label: 'hideDetails',
                tags: 'hide,remove'
            },
            description: {
                type: 'select',
                label: 'description',

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
            red_dislike_button: {
                type: 'switch',
                label: 'redDislikeButton'
            }
        }
    },
    sidebar: {
        type: 'folder',
        label: 'sidebar',
        class: 'satus-folder--sidebar',

        section: {
            type: 'section',
            sidebar_left: {
                type: 'switch',
                label: 'Sidebar on the Left'
            },
            thumbnails_right: {
                type: 'switch',
                label: 'Thumbnails on the Right'
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
            },

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
            }
        }
    },
    comments: {
        type: 'folder',
        label: 'comments',
        class: 'satus-folder--comments',

        section: {
            type: 'section',

            comments: {
                type: 'select',
                label: 'comments',

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
        }
    },
    footer: {
        type: 'folder',
        label: 'footer',
        class: 'satus-folder--footer',

        section: {
            type: 'section',

            hide_footer: {
                type: 'switch',
                label: 'hideFooter',
                tags: 'bottom'
            }
        }
    }
};
