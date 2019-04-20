var menu = {
    general: {
        label: 'general',
        icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:36px;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0V0z"/><g><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm5 15h-2v-6H9v6H7v-7.81l5-4.5 5 4.5V18z"/><path d="M7 10.19V18h2v-6h6v6h2v-7.81l-5-4.5z" opacity=".3"/></g></svg>',
            style: {}
        },
        section: {
            type: 'section',
            night_mode: {
                label: 'nightMode',
                section: {
                    type: 'section',
                    it_theme: {
                        label: 'darkTheme',
                        type: 'toggle',
                        click: 'it_theme',
                        value: 'default_dark'
                    },
                    bluelight: {
                        label: 'bluelight',
                        type: 'slider',
                        min: 0,
                        max: 90,
                        default: 0,
                        step: 1
                    },
                    dim: {
                        label: 'dim',
                        type: 'slider',
                        min: 0,
                        max: 90,
                        default: 0,
                        step: 1
                    }
                },
                schedule_section: {
                    label: 'schedule',
                    type: 'section',
                    schedule_turn_on: {
                        label: 'turnOn',
                        type: 'time'
                    },
                    schedule_turn_off: {
                        label: 'turnOff',
                        type: 'time'
                    }
                }
            },
            youtube_home_page: {
                label: 'defaultYoutubeHomePage',
                type: 'select',
                options: [{
                    label: 'home',
                    value: 'normal',
                    default: 'true'
                }, {
                    label: 'trending',
                    value: 'trending'
                }, {
                    label: 'subscriptions',
                    value: 'subscriptions'
                }, {
                    label: 'history',
                    value: 'history'
                }, {
                    label: 'watchLater',
                    value: 'watch_later'
                }, {
                    label: 'searchBarOnly',
                    value: 'search'
                }]
            },
            youtube_version: {
                label: 'youtubeVersion',
                type: 'select',
                options: [{
                    label: 'doNotChange',
                    value: 'do_not_change',
                    default: 'true'
                }, {
                    label: 'old',
                    value: 'old'
                }, {
                    label: 'new',
                    value: 'new'
                }]
            }
        },
        section_1: {
            label: 'other',
            type: 'section',
            scroll_for_details: {
                label: 'scrollForDetails',
                type: 'toggle',
                default: 'true'
            },
            scroll_to_top: {
                label: 'scrollToTopButton',
                type: 'toggle'
            },
            youtube_prevent_closure: {
                label: 'preventClosingYoutube',
                type: 'toggle'
            },
            squared_user_images: {
                label: 'squaredUserImages',
                type: 'toggle'
            }
        },
        section_2: {
            label: 'thumbnails',
            type: 'section',
            play_videos_by_hovering_the_thumbnails: {
                label: 'hideMovingThumbnails',
                type: 'toggle'
            },
            hd_thumbnail: {
                label: 'hdThumbnail',
                type: 'toggle',
                default: 'false'
            }
        }
    },
    appearance: {
        label: 'appearance',
        icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:34px;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0V0z"/><g><path d="M8 17c0-.55-.45-1-1-1s-1 .45-1 1c0 .74-.19 1.4-.5 1.95.17.03.33.05.5.05a2 2 0 0 0 2-2z" opacity=".3"/><path d="M11.75 15l8.96-8.96a1 1 0 0 0 0-1.41l-1.34-1.34c-.2-.2-.45-.29-.7-.29s-.51.1-.71.29L9 12.25 11.75 15zM6 21a4 4 0 0 0 4-4 3 3 0 1 0-6 0c0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2zm0-4c0-.55.45-1 1-1s1 .45 1 1a2 2 0 0 1-2 2c-.17 0-.33-.02-.5-.05.31-.55.5-1.21.5-1.95z"/></g></svg>',
            style: {}
        },
        header_folder: {
            label: 'header',
            section: {
                type: 'section',
                header: {
                    label: 'header',
                    type: 'select',
                    options: [{
                        label: 'normal',
                        value: 'normal',
                        default: 'true'
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
                        label: 'topOfPage',
                        value: 'top_of_page'
                    }]
                },
                improve_youtube_logo: {
                    label: 'improveYoutubeLogo',
                    type: 'toggle'
                }
            }
        },
        player: {
            label: 'player',
            section: {
                type: 'section',
                annotations: {
                    label: 'annotations',
                    type: 'toggle',
                    default: 'true'
                },
                cards: {
                    label: 'cards',
                    type: 'toggle',
                    default: 'true'
                },
                player_size: {
                    label: 'playerSize',
                    type: 'select',
                    options: [{
                        label: 'normal',
                        value: 'normal',
                        default: 'true'
                    }, {
                        label: 'fitToWindow',
                        value: 'fit_window'
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
                    label: 'forcedTheaterMode',
                    type: 'toggle'
                },
                player_color: {
                    label: 'playerColor',
                    type: 'select',
                    options: [{
                        label: 'red',
                        value: 'red',
                        default: 'true'
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
                    }]
                },
                transparent_background: {
                    label: 'transparentBackground',
                    type: 'toggle'
                },
                endscreen: {
                    label: 'endscreen',
                    type: 'toggle',
                    default: 'true'
                }
            }
        },
        details: {
            label: 'details',
            section: {
                type: 'section',
                hide_details: {
                    label: 'hideDetails',
                    type: 'toggle'
                },
                views_count: {
                    label: 'viewsCount',
                    type: 'select',
                    options: [{
                        label: 'normal',
                        value: 'normal',
                        default: 'true'
                    }, {
                        label: 'hidden',
                        value: 'hidden'
                    }]
                },
                likes: {
                    label: 'likes',
                    type: 'select',
                    options: [{
                        label: 'normal',
                        value: 'normal',
                        default: 'true'
                    }, {
                        label: 'hidden',
                        value: 'hidden'
                    }, {
                        label: 'iconsOnly',
                        value: 'icons_only'
                    }]
                },
                how_long_ago_the_video_was_uploaded: {
                    label: 'howLongAgoTheVideoWasUploaded',
                    type: 'toggle'
                },
                channel_videos_count: {
                    label: 'showChannelVideosCount',
                    type: 'toggle'
                }
            }
        },
        description: {
            label: 'description',
            type: 'select',
            options: [{
                label: 'normal',
                value: 'normal',
                default: 'true'
            }, {
                label: 'expanded',
                value: 'expanded'
            }, {
                label: 'hidden',
                value: 'hidden'
            }]
        },
        comments: {
            label: 'comments',
            type: 'select',
            options: [{
                label: 'normal',
                value: 'normal',
                default: 'true'
            }, {
                label: 'collapsed',
                value: 'collapsed'
            }, {
                label: 'hidden',
                value: 'hidden'
            }]
        },
        sidebar: {
            label: 'sidebar',
            section: {
                type: 'section',
                hide_up_next_autoplay: {
                    label: 'hideUpNextAutoplay',
                    type: 'toggle'
                },
                livechat: {
                    label: 'liveChat',
                    type: 'select',
                    options: [{
                        label: 'normal',
                        value: 'normal',
                        default: 'true'
                    }, {
                        label: 'collapsed',
                        value: 'collapsed'
                    }, {
                        label: 'hidden',
                        value: 'hidden'
                    }]
                },
                playlist: {
                    label: 'playlist',
                    type: 'select',
                    options: [{
                        label: 'normal',
                        value: 'normal',
                        default: 'true'
                    }, {
                        label: 'hidden',
                        value: 'hidden'
                    }]
                },
                related_videos: {
                    label: 'relatedVideos',
                    type: 'select',
                    options: [{
                        label: 'normal',
                        value: 'normal',
                        default: 'true'
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
            label: 'footer',
            type: 'select',
            options: [{
                label: 'normal',
                value: 'normal',
                default: 'true'
            }, {
                label: 'hidden',
                value: 'hidden'
            }]
        }
    },
    themes: {
        label: 'themes',
        icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:36px;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0z"/><g><path d="M12 4a8.01 8.01 0 0 0 0 16 .5.5 0 0 0 .5-.5.54.54 0 0 0-.14-.35A2.5 2.5 0 0 1 14.23 15H16a4 4 0 0 0 4-4c0-3.86-3.59-7-8-7zm-5.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4.5 2.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" opacity=".3"/><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10a2.5 2.5 0 0 0 1.86-4.17.5.5 0 0 1 .37-.83H16a6 6 0 0 0 6-6c0-4.96-4.49-9-10-9zm4 13h-1.77a2.5 2.5 0 0 0-1.87 4.15c.06.07.14.19.14.35a.5.5 0 0 1-.5.5 8.01 8.01 0 0 1 0-16c4.41 0 8 3.14 8 7a4 4 0 0 1-4 4z"/><circle cx="6.5" cy="11.5" r="1.5"/><circle cx="9.5" cy="7.5" r="1.5"/><circle cx="14.5" cy="7.5" r="1.5"/><circle cx="17.5" cy="11.5" r="1.5"/></g></svg>',
            style: {}
        },
        section_0: {
            type: 'section',
            classList: ['list__item_theme', 'list__item_night-theme'],
            it_theme: {
                label: 'night',
                type: 'toggle',
                click: 'it_theme',
                value: 'night'
            }
        },
        section_1: {
            type: 'section',
            classList: ['list__item_theme', 'list__item_dawn-theme'],
            it_theme: {
                label: 'dawn',
                type: 'toggle',
                click: 'it_theme',
                value: 'dawn'
            }
        },
        section_2: {
            type: 'section',
            classList: ['list__item_theme', 'list__item_sunset-theme'],
            it_theme: {
                label: 'sunset',
                type: 'toggle',
                click: 'it_theme',
                value: 'sunset'
            }
        },
        section_3: {
            type: 'section',
            classList: ['list__item_theme', 'list__item_desert-theme'],
            it_theme: {
                label: 'desert',
                type: 'toggle',
                click: 'it_theme',
                value: 'desert'
            }
        },
        section_4: {
            type: 'section',
            classList: ['list__item_theme', 'list__item_plain-theme'],
            it_theme: {
                label: 'plain',
                type: 'toggle',
                click: 'it_theme',
                value: 'plain'
            }
        },
        section_5: {
            type: 'section',
            classList: ['list__item_theme', 'list__item_black-theme'],
            it_theme: {
                label: 'black',
                type: 'toggle',
                click: 'it_theme',
                value: 'black'
            }
        }
    },
    player: {
        label: 'player',
        icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:36px;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 20a8.01 8.01 0 0 0 0-16 8.01 8.01 0 0 0 0 16zM10 7.5l6 4.5-6 4.5v-9z" opacity=".3"/><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-18a8.01 8.01 0 0 1 0 16 8.01 8.01 0 0 1 0-16z"/><path d="M10 7.5v9l6-4.5z"/></svg>',
            style: {}
        },
        section: {
            type: 'section',
            video_quality: {
                label: 'videoQuality',
                type: 'select',
                options: [{
                    label: 'auto',
                    value: 'auto',
                    default: 'true'
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
            /*video_fullscreen_quality: {
              label: 'VideoFullscreenQuality',
              type: 'select',
              options: [{
                  label: 'Inherit',
                  value: 'inherit',
                  default: 'true'
                },
                {
                  label: '144p',
                  value: 'tiny'
                },
                {
                  label: '240p',
                  value: 'small'
                },
                {
                  label: '360p',
                  value: 'medium'
                },
                {
                  label: '480p',
                  value: 'large'
                },
                {
                  label: '720p',
                  value: 'hd720'
                },
                {
                  label: '1080p',
                  value: 'hd1080'
                },
                {
                  label: '1440p',
                  value: 'hd1440'
                },
                {
                  label: '2160p',
                  value: 'hd2160'
                }
              ]
            },*/
            forced_video_volume: {
                label: 'forcedVolume',
                type: 'toggle'
            },
            video_volume: {
                label: 'volume',
                type: 'slider',
                min: 0,
                max: 100,
                default: 100
            },
            video_autoplay: {
                label: 'videoAutoplay',
                type: 'toggle',
                default: 'true'
            },
            video_autofullscreen: {
                label: 'autoFullscreen',
                type: 'toggle'
            },
            allow_60fps: {
                label: 'allow60Fps',
                type: 'toggle',
                default: 'true'
            },
            allow_subtitles: {
                label: 'allowSubtitles',
                type: 'toggle',
                default: 'true'
            },
            allow_loudness: {
                label: 'allowLoudnessNormalization',
                type: 'toggle',
                default: 'true'
            },
            video_playback_speed: {
                label: 'playbackSpeed',
                type: 'slider',
                min: 0,
                max: 2,
                default: 1,
                step: .05
            },
            video_encode: {
                label: 'videoCodecH264',
                type: 'select',
                options: [{
                    label: 'h264',
                    value: 'h264'
                }, {
                    label: 'doNotChange',
                    value: 'do_not_change',
                    default: 'true'
                }]
            },
            up_next_autoplay: {
                label: 'upNextAutoplay',
                type: 'select',
                options: [{
                    label: 'doNotChange',
                    value: 'do_not_change',
                    default: 'true'
                }, {
                    label: 'enabled',
                    value: 'true'
                }, {
                    label: 'disabled',
                    value: 'false'
                }]
            },
            /*picture_in_picture: {
              label: 'pictureInPicture',
              type: 'select',
              options: [
                {label:'disabled',value:'disabled',default:'true'},
                {label:'whenTabIsChanged',value:'tabs'}
              ]
            },*/
            mini_player_b: {
                label: 'miniPlayer',
                type: 'toggle'
            },
            video_autopause: {
                label: 'videoAutopause',
                type: 'toggle'
            }
        },
        section_ads: {
            label: 'ads',
            type: 'section',
            allow_video_ads: {
                label: 'allowAdsOnVideos',
                type: 'toggle',
                default: 'true',
                auto_deactivation: 'subscribed_channel_player_ads'
            },
            subscribed_channel_player_ads: {
                label: 'allowAdsOnlyOnSubscribedChannels',
                type: 'toggle',
                default: 'false',
                auto_deactivation: 'allow_video_ads'
            }
        },
        section_buttons: {
            label: 'playerButtons',
            type: 'section',
            video_repeat_button: {
                label: 'repeat',
                type: 'toggle'
            },
            popup_player_button: {
                label: 'popupPlayer',
                type: 'toggle'
            },
            video_rotate_button: {
                label: 'rotateVideo',
                type: 'toggle'
            },
            screenshot_button: {
                label: 'screenshot',
                type: 'toggle'
            }
        }
    },
    playlists: {
        label: 'playlists',
        icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:42px;height:auto;fill:#fff6f6;margin:.3rem 0 0 .4rem"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M4 10h12v2H4zM4 6h12v2H4zM4 14h8v2H4zM14 20l5-3-5-3z"/></svg>',
            style: {}
        },
        section: {
            type: 'section',
            playlist_autoplay: {
                label: 'autoplay',
                type: 'toggle',
                default: 'true'
            },
            playlist_reverse: {
                label: 'reverse',
                type: 'toggle'
            },
            playlist_repeat: {
                label: 'repeat',
                type: 'select',
                options: [{
                    label: 'doNotChange',
                    value: 'do_not_change',
                    default: 'true'
                }, {
                    label: 'enabled',
                    value: 'enabled'
                }, {
                    label: 'disabled',
                    value: 'disabled'
                }]
            },
            playlist_shuffle: {
                label: 'shuffle',
                type: 'select',
                options: [{
                    label: 'doNotChange',
                    value: 'do_not_change',
                    default: 'true'
                }, {
                    label: 'enabled',
                    value: 'enabled'
                }, {
                    label: 'disabled',
                    value: 'disabled'
                }]
            }
        }
    },
    channels: {
        label: 'channels',
        icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:34px;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0V0z"/><g><path d="M3 20h18V8H3v12zm6-10l7 4-7 4v-8z" opacity=".3"/><path d="M9 10v8l7-4z"/><path d="M21 6h-7.58l3.29-3.29L16 2l-4 4h-.03l-4-4-.69.71L10.56 6H3a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm0 14H3V8h18v12z"/></g></svg>',
            style: {}
        },
        section: {
            type: 'section',
            channel_default_page: {
                label: 'defaultChannelTab',
                type: 'select',
                options: [{
                    label: 'home',
                    value: 'normal',
                    default: 'true'
                }, {
                    label: 'videos',
                    value: 'videos'
                }, {
                    label: 'playlists',
                    value: 'playlists'
                }]
            },
            channel_autoplay: {
                label: 'trailerAutoplay',
                type: 'toggle',
                default: 'true'
            },
            channel_featured_content: {
                label: 'featuredContent',
                type: 'toggle',
                default: 'true'
            }
        }
    },
    shortcuts: {
        label: 'shortcuts',
        icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:36px;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0V0zm0 0h24v24H0V0z"/><g><path d="M4 17h16V7H4v10zm13-9h2v2h-2V8zm0 3h2v2h-2v-2zm-3-3h2v2h-2V8zm0 3h2v2h-2v-2zm-3-3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm0 3h8v2H8v-2zM5 8h2v2H5V8zm0 3h2v2H5v-2z" opacity=".3"/><path d="M20 5H4a2 2 0 0 0-1.99 2L2 17c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 12H4V7h16v10z"/><path d="M11 8h2v2h-2zM11 11h2v2h-2zM8 8h2v2H8zM8 11h2v2H8zM5 11h2v2H5zM5 8h2v2H5zM8 14h8v2H8zM14 11h2v2h-2zM14 8h2v2h-2zM17 11h2v2h-2zM17 8h2v2h-2z"/></g></svg>',
            style: {}
        },
        section: {
            label: 'player',
            type: 'section',
            picture_in_picture_shortcut: {
                label: 'pictureInPicture',
                type: 'shortcut',
                default: 'none'
            },
            video_quality: {
                label: 'videoQuality',
                section_99: {
                  type: 'section',
                  shortcut_240p: {
                      label: '240p',
                      type: 'shortcut',
                      default: 'none'
                  },
                  shortcut_360p: {
                      label: '360p',
                      type: 'shortcut',
                      default: 'none'
                  },
                  shortcut_480p: {
                      label: '480p',
                      type: 'shortcut',
                      default: 'none'
                  },
                  shortcut_720p: {
                      label: '720p',
                      type: 'shortcut',
                      default: 'none'
                  },
                  shortcut_1080p: {
                      label: '1080p',
                      type: 'shortcut',
                      default: 'none'
                  }
                }
            },
            play_pause: {
                label: 'playPause',
                type: 'shortcut',
                default: 'spacebar'
            },
            stop: {
                label: 'stop',
                type: 'shortcut',
                default: 'none'
            },
            next_video: {
                label: 'nextVideo',
                type: 'shortcut',
                default: 'Shift+N'
            },
            prev_video: {
                label: 'previousVideo',
                type: 'shortcut',
                default: 'Shift+P'
            },
            seek_backward: {
                label: 'seekBackward10Seconds',
                type: 'shortcut',
                default: 'J'
            },
            seek_forward: {
                label: 'seekForward10Seconds',
                type: 'shortcut',
                default: 'I'
            },
            increase_volume: {
                label: 'increaseVolume5',
                type: 'shortcut',
                default: 'none'
            },
            decrease_volume: {
                label: 'decreaseVolume5',
                type: 'shortcut',
                default: 'none'
            },
            increase_playback_speed: {
                label: 'increasePlaybackSpeed',
                type: 'shortcut',
                default: 'none'
            },
            decrease_playback_speed: {
                label: 'decreasePlaybackSpeed',
                type: 'shortcut',
                default: 'none'
            },
            go_to_search_box: {
                label: 'goToSearchBox',
                type: 'shortcut',
                default: '/'
            },
            activate_fullscreen: {
                label: 'activateFullscreen',
                type: 'shortcut',
                default: 'F'
            },
            activate_captions: {
                label: 'activateCaptions',
                type: 'shortcut',
                default: 'C'
            },
            like_shortcut: {
                label: 'like',
                type: 'shortcut',
                default: 'none'
            },
            dislike_shortcut: {
                label: 'dislike',
                type: 'shortcut',
                default: 'none'
            }
        }
    },
    volume_mixer: {
        label: 'volume_mixer',
        icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:34px;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M5 13h2.83L10 15.17V8.83L7.83 11H5z" opacity=".3"/><path d="M3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83zm4-.86v8.05a4.47 4.47 0 0 0 0-8.05zm0-4.74v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"/></svg>',
            style: {}
        },
        volume_mixer_content: {
            type: 'custom',
            load: function(container) {
                if (chrome && chrome.tabs) {
                    chrome.tabs.query({}, function(tabs) {
                        for (let i = 0, l = tabs.length; i < l; i++) {
                            if (tabs[i].hasOwnProperty('url')) {
                                let tab = tabs[i],
                                    params = getUrlParams(tab.url);

                                if (params.hasOwnProperty('v')) {
                                    let item_container = document.createElement('div'),
                                        item = document.createElement('div'),
                                        item__label = document.createElement('div'),
                                        item__input = document.createElement('input');

                                    item_container.classList.add('list__item__mixer-item');
                                    item.classList.add('mixer-item__preview');
                                    item.style.backgroundImage = 'url(https://img.youtube.com/vi/' + params.v + '/0.jpg)';
                                    item__label.innerText = tab.title.length > 32 ? (tab.title.substring(0, 32) + '...') : tab.title;
                                    item__label.classList.add('mixer-item__label');
                                    item__input.classList.add('mixer-item__input');
                                    item__input.type = 'range';
                                    item__input.max = '100';
                                    item__input.min = '0';
                                    item__input.step = '1';
                                    item__input.dataset.id = tab.id;
                                    item__input.onchange = function() {
                                        chrome.tabs.sendMessage(Number(this.dataset.id), {
                                            name: 'changeVolume',
                                            volume: this.value
                                        })
                                    };

                                    item_container.appendChild(item);
                                    item_container.appendChild(item__label);
                                    item_container.appendChild(item__input);
                                    container.appendChild(item_container);

                                    chrome.tabs.query({}, function(tabs) {
                                        for (let i = 0, l = tabs.length; i < l; i++)
                                            if (tabs[i].hasOwnProperty('url')) {
                                                chrome.tabs.sendMessage(tabs[i].id, 'requestVolume', function(response) {
                                                    item__input.value = Number(response) * 100;
                                                });
                                            }
                                    });

                                    console.log(tab, params);
                                }
                            }
                        }


                        if (container.innerHTML == '') {
                            container.innerHTML = getMessage('noOpenVideoTabs');

                            return false;
                        }
                    });
                }
                container.style.cursor = 'default';
                container.style.background = 'transparent';
                container.style.height = 'auto';
                container.style.flexDirection = 'column';
            }
        }
    },
    settings: {
        label: 'settings',
        icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:34px;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M19.28 8.6l-.7-1.21-1.27.51-1.06.43-.91-.7a5.1 5.1 0 0 0-1.23-.71l-1.06-.43-.16-1.13L12.7 4h-1.4l-.19 1.35-.16 1.13-1.06.44c-.41.17-.82.41-1.25.73l-.9.68-1.05-.42-1.27-.52-.7 1.21 1.08.84.89.7-.14 1.13c-.03.3-.05.53-.05.73s.02.43.05.73l.14 1.13-.89.7-1.08.84.7 1.21 1.27-.51 1.06-.43.91.7c.39.3.8.54 1.23.71l1.06.43.16 1.13.19 1.36h1.39l.19-1.35.16-1.13 1.06-.43c.41-.17.82-.41 1.25-.73l.9-.68 1.04.42 1.27.51.7-1.21-1.08-.84-.89-.7.14-1.13a5.34 5.34 0 0 0 0-1.46l-.14-1.13.89-.7 1.1-.84zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" opacity=".3"/><path d="M19.43 12.98a7.8 7.8 0 0 0 0-1.96l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.3 7.3 0 0 0-1.69-.98l-.38-2.65A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1a.57.57 0 0 0-.18-.03.5.5 0 0 0-.43.25l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65a7.93 7.93 0 0 0 0 1.96l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65a7.68 7.68 0 0 0 1.69-.98l2.49 1 .18.03a.5.5 0 0 0 .43-.25l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65zm-1.98-1.71a5.34 5.34 0 0 1 0 1.46l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43a5.67 5.67 0 0 1-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13z"/><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
            style: {}
        },
        section_0: {
            type: 'section',
            appearance: {
                label: 'appearance',
                section: {
                    type: 'section',
                    improvedtube_youtube_icon: {
                        label: 'improvedtubeIconOnYoutube',
                        type: 'select',
                        options: [{
                            label: 'disabled',
                            value: 'disabled',
                            default: 'true'
                        }, {
                            label: 'youtubeHeaderLeft',
                            value: 'header_left'
                        }, {
                            label: 'youtubeHeaderRight',
                            value: 'header_right'
                        }, {
                            label: 'draggable',
                            value: 'draggable'
                        }, {
                            label: 'belowPlayer',
                            value: 'below_player'
                        }]
                    },
                    improvedtube_browser_icon: {
                        label: 'improvedtubeIconInBrowser',
                        type: 'select',
                        options: [{
                            label: 'alwaysActive',
                            value: 'always'
                        }, {
                            label: 'onlyActiveOnYoutube',
                            value: 'youtube',
                            default: 'true'
                        }]
                    },
                    classic_improvedtube: {
                        label: 'classicImprovedtube',
                        type: 'toggle'
                    }
                }
            },
            languages: {
                label: 'languages',
                section: {
                    type: 'section',
                    improvedtube_language: {
                        label: 'improvedtubeLanguage',
                        type: 'select',
                        options: [{
                            "value": "en",
                            "label": "English",
                            default: 'true'
                        }, {
                            "value": "es",
                            "label": "Español (España)"
                        }, {
                            "value": "ru",
                            "label": "Русский"
                        }, {
                            "value": "de",
                            "label": "Deutsch"
                        }, {
                            "value": "pt_PT",
                            "label": "Português"
                        }, {
                            "value": "pt_BR",
                            "label": "Português (Brasil)"
                        }, {
                            "value": "fr",
                            "label": "Français"
                        }, {
                            "value": "pl",
                            "label": "Polski"
                        }, {
                            "value": "id",
                            "label": "Bahasa Indonesia"
                        }, {
                            "value": "ms",
                            "label": "Bahasa Malaysia"
                        }, {
                            "value": "ca",
                            "label": "Català"
                        }, {
                            "value": "cs",
                            "label": "Čeština"
                        }, {
                            "value": "da",
                            "label": "Dansk"
                        }, {
                            "value": "et",
                            "label": "Eesti"
                        }, {
                            "value": "fil",
                            "label": "Filipino"
                        }, {
                            "value": "hr",
                            "label": "Hrvatski"
                        }, {
                            "value": "it",
                            "label": "Italiano"
                        }, {
                            "value": "sw",
                            "label": "Kiswahili"
                        }, {
                            "value": "lv",
                            "label": "Latviešu valoda"
                        }, {
                            "value": "lt",
                            "label": "Lietuvių"
                        }, {
                            "value": "hu",
                            "label": "Magyar"
                        }, {
                            "value": "nl",
                            "label": "Nederlands"
                        }, {
                            "value": "no",
                            "label": "Norsk"
                        }, {
                            "value": "ro",
                            "label": "Română"
                        }, {
                            "value": "sk",
                            "label": "Slovenčina"
                        }, {
                            "value": "sl",
                            "label": "Slovenščina"
                        }, {
                            "value": "fi",
                            "label": "Suomi"
                        }, {
                            "value": "sv",
                            "label": "Svenska"
                        }, {
                            "value": "vi",
                            "label": "Tiếng Việt"
                        }, {
                            "value": "tr",
                            "label": "Türkçe"
                        }, {
                            "value": "bg",
                            "label": "Български"
                        }, {
                            "value": "sr",
                            "label": "Српски"
                        }, {
                            "value": "uk",
                            "label": "Українська"
                        }, {
                            "value": "el",
                            "label": "Ελληνικά"
                        }, {
                            "value": "hy",
                            "label": "Հայերեն"
                        }, {
                            "value": "iw",
                            "label": "עברית"
                        }, {
                            "value": "ur",
                            "label": "اردو"
                        }, {
                            "value": "ar",
                            "label": "العربية"
                        }, {
                            "value": "fa",
                            "label": "فارسی"
                        }, {
                            "value": "ne",
                            "label": "नेपाली"
                        }, {
                            "value": "mr",
                            "label": "मराठी"
                        }, {
                            "value": "hi",
                            "label": "हिन्दी"
                        }, {
                            "value": "bn",
                            "label": "বাংলা"
                        }, {
                            "value": "pa",
                            "label": "ਪੰਜਾਬੀ"
                        }, {
                            "value": "gu",
                            "label": "ગુજરાતી"
                        }, {
                            "value": "ta",
                            "label": "தமிழ்"
                        }, {
                            "value": "te",
                            "label": "తెలుగు"
                        }, {
                            "value": "kn",
                            "label": "ಕನ್ನಡ"
                        }, {
                            "value": "ml",
                            "label": "മലയാളം"
                        }, {
                            "value": "si",
                            "label": "සිංහල"
                        }, {
                            "value": "th",
                            "label": "ภาษาไทย"
                        }, {
                            "value": "lo",
                            "label": "ລາວ"
                        }, {
                            "value": "my",
                            "label": "ဗမာ"
                        }, {
                            "value": "ka",
                            "label": "ქართული"
                        }, {
                            "value": "am",
                            "label": "አማርኛ"
                        }, {
                            "value": "km",
                            "label": "ខ្មែរ"
                        }, {
                            "value": "zh-CN",
                            "label": "中文 (简体)"
                        }, {
                            "value": "zh-TW",
                            "label": "中文 (繁體)"
                        }, {
                            "value": "zh-HK",
                            "label": "中文 (香港)"
                        }, {
                            "value": "ja",
                            "label": "日本語"
                        }, {
                            "value": "ko",
                            "label": "한국어"
                        }]
                    },
                    youtube_language: {
                        label: 'youtubeLanguage',
                        type: 'select',
                        options: [{
                            "value": "en",
                            "label": "English"
                        }, {
                            "value": "es",
                            "label": "Español (España)"
                        }, {
                            "value": "es-419",
                            "label": "Español (Latinoamérica)"
                        }, {
                            "value": "es-US",
                            "label": "Español (US)"
                        }, {
                            "value": "ru",
                            "label": "Русский"
                        }, {
                            "value": "de",
                            "label": "Deutsch"
                        }, {
                            "value": "pt-PT",
                            "label": "Português"
                        }, {
                            "value": "pt",
                            "label": "Português (Brasil)"
                        }, {
                            "value": "fr",
                            "label": "Français"
                        }, {
                            "value": "pl",
                            "label": "Polski"
                        }, {
                            "value": "ja",
                            "label": "日本語"
                        }, {
                            "value": "af",
                            "label": "Afrikaans"
                        }, {
                            "value": "az",
                            "label": "Azərbaycan"
                        }, {
                            "value": "id",
                            "label": "Bahasa Indonesia"
                        }, {
                            "value": "ms",
                            "label": "Bahasa Malaysia"
                        }, {
                            "value": "bs",
                            "label": "Bosanski"
                        }, {
                            "value": "ca",
                            "label": "Català"
                        }, {
                            "value": "cs",
                            "label": "Čeština"
                        }, {
                            "value": "da",
                            "label": "Dansk"
                        }, {
                            "value": "et",
                            "label": "Eesti"
                        }, {
                            "value": "eu",
                            "label": "Euskara"
                        }, {
                            "value": "fil",
                            "label": "Filipino"
                        }, {
                            "value": "fr-CA",
                            "label": "Français (Canada)"
                        }, {
                            "value": "gl",
                            "label": "Galego"
                        }, {
                            "value": "hr",
                            "label": "Hrvatski"
                        }, {
                            "value": "zu",
                            "label": "IsiZulu"
                        }, {
                            "value": "is",
                            "label": "Íslenska"
                        }, {
                            "value": "it",
                            "label": "Italiano"
                        }, {
                            "value": "sw",
                            "label": "Kiswahili"
                        }, {
                            "value": "lv",
                            "label": "Latviešu valoda"
                        }, {
                            "value": "lt",
                            "label": "Lietuvių"
                        }, {
                            "value": "hu",
                            "label": "Magyar"
                        }, {
                            "value": "nl",
                            "label": "Nederlands"
                        }, {
                            "value": "no",
                            "label": "Norsk"
                        }, {
                            "value": "uz",
                            "label": "O‘zbek"
                        }, {
                            "value": "ro",
                            "label": "Română"
                        }, {
                            "value": "sq",
                            "label": "Shqip"
                        }, {
                            "value": "sk",
                            "label": "Slovenčina"
                        }, {
                            "value": "sl",
                            "label": "Slovenščina"
                        }, {
                            "value": "sr-Latn",
                            "label": "Srpski"
                        }, {
                            "value": "fi",
                            "label": "Suomi"
                        }, {
                            "value": "sv",
                            "label": "Svenska"
                        }, {
                            "value": "vi",
                            "label": "Tiếng Việt"
                        }, {
                            "value": "tr",
                            "label": "Türkçe"
                        }, {
                            "value": "be",
                            "label": "Беларуская"
                        }, {
                            "value": "bg",
                            "label": "Български"
                        }, {
                            "value": "ky",
                            "label": "Кыргызча"
                        }, {
                            "value": "kk",
                            "label": "Қазақ Тілі"
                        }, {
                            "value": "mk",
                            "label": "Македонски"
                        }, {
                            "value": "mn",
                            "label": "Монгол"
                        }, {
                            "value": "sr",
                            "label": "Српски"
                        }, {
                            "value": "uk",
                            "label": "Українська"
                        }, {
                            "value": "el",
                            "label": "Ελληνικά"
                        }, {
                            "value": "hy",
                            "label": "Հայերեն"
                        }, {
                            "value": "iw",
                            "label": "עברית"
                        }, {
                            "value": "ur",
                            "label": "اردو"
                        }, {
                            "value": "ar",
                            "label": "العربية"
                        }, {
                            "value": "fa",
                            "label": "فارسی"
                        }, {
                            "value": "ne",
                            "label": "नेपाली"
                        }, {
                            "value": "mr",
                            "label": "मराठी"
                        }, {
                            "value": "hi",
                            "label": "हिन्दी"
                        }, {
                            "value": "bn",
                            "label": "বাংলা"
                        }, {
                            "value": "pa",
                            "label": "ਪੰਜਾਬੀ"
                        }, {
                            "value": "gu",
                            "label": "ગુજરાતી"
                        }, {
                            "value": "ta",
                            "label": "தமிழ்"
                        }, {
                            "value": "te",
                            "label": "తెలుగు"
                        }, {
                            "value": "kn",
                            "label": "ಕನ್ನಡ"
                        }, {
                            "value": "ml",
                            "label": "മലയാളം"
                        }, {
                            "value": "si",
                            "label": "සිංහල"
                        }, {
                            "value": "th",
                            "label": "ภาษาไทย"
                        }, {
                            "value": "lo",
                            "label": "ລາວ"
                        }, {
                            "value": "my",
                            "label": "ဗမာ"
                        }, {
                            "value": "ka",
                            "label": "ქართული"
                        }, {
                            "value": "am",
                            "label": "አማርኛ"
                        }, {
                            "value": "km",
                            "label": "ខ្មែរ"
                        }, {
                            "value": "zh-CN",
                            "label": "中文 (简体)"
                        }, {
                            "value": "zh-TW",
                            "label": "中文 (繁體)"
                        }, {
                            "value": "zh-HK",
                            "label": "中文 (香港)"
                        }, {
                            "value": "ko",
                            "label": "한국어"
                        }]
                    }
                }
            }
        },
        section_1: {
            type: 'section',
            backup_and_reset: {
                label: 'backupReset',
                backup_section: {
                    type: 'section',
                    export_settings: {
                        label: 'exportSettings',
                        type: 'button',
                        click: function() {
                            exportSettings();
                        }
                    },
                    import_settings: {
                        label: 'importSettings',
                        type: 'button',
                        click: function() {
                            importSettings();
                        }
                    },
                    reset_all_settings: {
                        label: 'resetAllSettings',
                        type: 'button',
                        click: function() {
                            dialogConfirm('thisWillResetAllSettings', function() {
                                resetSettings();
                            });
                        }
                    }
                },
                section_cookies: {
                    label: 'cookies',
                    type: 'section',
                    delete_youtube_cookies: {
                        label: 'deleteYoutubeCookies',
                        type: 'button',
                        click: function() {
                            dialogConfirm('thisWillRemoveAllCookies', function() {
                                chrome.tabs.query({}, function(tabs) {
                                    for (let i = 0, l = tabs.length; i < l; i++)
                                        if (tabs[i].hasOwnProperty('url'))
                                            chrome.tabs.sendMessage(tabs[i].id, 'delete_youtube_cookies');
                                });
                            });
                        }
                    }
                }
            },
            folder_time: {
                label: 'dateTime',
                section_time: {
                    type: 'section',
                    time_type: {
                        label: 'use24HourFormat',
                        type: 'toggle',
                        default: 'true'
                    }
                }
            },
            about: {
                label: 'about',
                section_1: {
                    type: 'section',
                    improvedtube_version: {
                        label: 'improvedtubeVersion',
                        type: 'text',
                        inner_text: function() {
                            return chrome.runtime.getManifest().version;
                        }
                    },
                    chrome_version: {
                        label: 'browserVersion',
                        type: 'text',
                        inner_text: function() {
                            return navigator.userAgent.match(/Chrom(e|ium)+\/[0-9.]+/g)[0].match(/[0-9.]+/g)[0];
                        }
                    }
                },
                section_2: {
                    type: 'section',
                    improvedtube_permissions: {
                        label: 'permissions',
                        type: 'text',
                        inner_text: function() {
                            return chrome.runtime.getManifest().permissions.join(', ').replace('https://www.youtube.com/', 'youtube');
                        }
                    }
                }
            }
        }
    }
};


var header_menu = {
    active_features: {
        label: 'activeFeatures',
        icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16"><path fill-rule="evenodd" d="M2 13c0 .59 0 1-.59 1H.59C0 14 0 13.59 0 13c0-.59 0-1 .59-1h.81c.59 0 .59.41.59 1H2zm2.59-9h6.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1H4.59C4 2 4 2.41 4 3c0 .59 0 1 .59 1zM1.41 7H.59C0 7 0 7.41 0 8c0 .59 0 1 .59 1h.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1h.01zm0-5H.59C0 2 0 2.41 0 3c0 .59 0 1 .59 1h.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1h.01zm10 5H4.59C4 7 4 7.41 4 8c0 .59 0 1 .59 1h6.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1h.01zm0 5H4.59C4 12 4 12.41 4 13c0 .59 0 1 .59 1h6.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1h.01z"/></svg>'
        },
        type: 'button',
        click: function() {
            var list = {};

            document.querySelector('body').setAttribute('data-path', '/active');

            function get(obj) {
                for (let key in obj) {
                    if (obj[key].type && obj[key].type != 'section') {
                        if (storage.hasOwnProperty(key)) {
                            list[key] = obj[key];
                        }
                    } else if (typeof obj[key] == 'object')
                        get(obj[key]);
                }
            }

            get(menu);

            createList(list);

            document.querySelector('.dialog__backdrop').click();
        }
    },
    donate: {
        label: 'donate',
        icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16"><path fill-rule="evenodd" d="M9 2c-.97 0-1.69.42-2.2 1-.51.58-.78.92-.8 1-.02-.08-.28-.42-.8-1-.52-.58-1.17-1-2.2-1-1.632.086-2.954 1.333-3 3 0 .52.09 1.52.67 2.67C1.25 8.82 3.01 10.61 6 13c2.98-2.39 4.77-4.17 5.34-5.33C11.91 6.51 12 5.5 12 5c-.047-1.69-1.342-2.913-3-3z"/></svg>'
        },
        type: 'button',
        click: function() {
            window.open('http://www.improvedtube.com/donate');
        }
    },
    rate: {
        label: 'rate',
        icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M13.991 13.991c-.05.69-1.269 1-1.998 1H5.665l-1.669-1V7.995c1.36 0 2.11-.75 3.129-1.879 1.229-1.359 1.139-2.558.879-4.127-.08-.5.5-1 1-1 .829 0 1.998 2.729 1.998 3.998l-.02 1.03c0 .689.33.969 1.02.969H14c.63 0 .98.36 1 .999l-1 5.996-.01.01zm0-7.995h-2.018l.02-.98C11.992 3.719 10.822 0 8.993 0c-.58 0-1.169.3-1.559.77-.36.41-.5.909-.42 1.409.25 1.479.28 2.278-.629 3.278-1 1.089-1.48 1.549-2.389 1.549H2c-1.061-.01-2 .929-2 1.988v3.998c0 1.06.94 1.999 1.999 1.999h1.719l1.439.86c.16.089.33.139.52.139h6.325c1.13 0 2.839-.5 2.999-1.879l.979-5.946c.02-.08.02-.14.02-.2-.03-1.17-.84-1.969-1.999-1.969h-.01z"/></svg>'
        },
        type: 'button',
        click: function() {
            window.open('https://chrome.google.com/webstore/detail/improvedtube-for-youtube/bnomihfieiccainjcjblhegjgglakjdd');
        }
    },
    github: {
        label: 'GitHub',
        icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>'
        },
        type: 'button',
        click: function() {
            window.open('https://github.com/ImprovedTube/ImprovedTube');
        }
    }
};
