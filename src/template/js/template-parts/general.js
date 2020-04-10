Menu.main.section.general = {
    type: 'folder',
    before: '<svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>',
    label: 'general',
    class: 'satus-folder--general',
    appearanceId: 'general',

    section: {
        type: 'section',

        legacy_youtube: {
            type: 'switch',
            label: 'legacyYoutube',
            tags: 'old'
        },
        youtube_home_page: {
            type: 'select',
            label: 'youtubeHomePage',
            options: [{
                label: 'home',
                value: '/'
            }, {
                label: 'trending',
                value: '/feed/trending'
            }, {
                label: 'subscriptions',
                value: '/feed/subscriptions'
            }, {
                label: 'history',
                value: '/feed/history'
            }, {
                label: 'watchLater',
                value: '/playlist?list=WL'
            }, {
                label: 'search',
                value: 'search'
            }],
            tags: 'trending,subscriptions,history,watch,search'
        },
        collapse_of_subscription_sections: {
            type: 'switch',
            label: 'collapseOfSubscriptionSections'
        },
        add_scroll_to_top: {
            type: 'switch',
            label: 'addScrollToTop',
            tags: 'up'
        },
        remove_related_search_results: {
            type: 'switch',
            label: 'removeRelatedSearchResults'
        },
        confirmation_before_closing: {
            type: 'switch',
            label: 'confirmationBeforeClosing',
            tags: 'random prevent close exit'
        },
        mark_watched_videos: {
            type: 'switch',
            label: 'markWatchedVideos'
        },
        only_one_player_instance_playing: {
            type: 'switch',
            label: 'onlyOnePlayerInstancePlaying'
        }
    },

    filters: {
        type: 'section',

        filters: {
            type: 'folder',
            label: 'filters',

            section: {
                type: 'section',

                bluelight: {
                    type: 'slider',
                    label: 'bluelight',
                    step: 1,
                    max: 90,
                    value: 0
                },
                dim: {
                    type: 'slider',
                    label: 'dim',
                    step: 1,
                    max: 90,
                    value: 0
                }
            }
        },
        schedule: {
            type: 'folder',
            label: 'schedule',

            section: {
                type: 'section',

                schedule: {
                    type: 'select',
                    label: 'schedule',

                    options: [{
                        label: 'disabled',
                        value: 'disabled'
                    }, {
                        label: 'sunsetToSunrise',
                        value: 'sunset_to_sunrise'
                    }, {
                        label: 'systemPeferenceDark',
                        value: 'system_peference_dark'
                    }, {
                        label: 'systemPeferenceLight',
                        value: 'system_peference_light'
                    }]
                },
                schedule_time_from: {
                    type: 'select',
                    label: 'timeFrom',
                    options: [{
                        label: '00:00',
                        value: '00:00'
                    }, {
                        label: '01:00',
                        value: '01:00'
                    }, {
                        label: '02:00',
                        value: '02:00'
                    }, {
                        label: '03:00',
                        value: '03:00'
                    }, {
                        label: '04:00',
                        value: '04:00'
                    }, {
                        label: '05:00',
                        value: '05:00'
                    }, {
                        label: '06:00',
                        value: '06:00'
                    }, {
                        label: '07:00',
                        value: '07:00'
                    }, {
                        label: '08:00',
                        value: '08:00'
                    }, {
                        label: '09:00',
                        value: '09:00'
                    }, {
                        label: '10:00',
                        value: '10:00'
                    }, {
                        label: '11:00',
                        value: '11:00'
                    }, {
                        label: '12:00',
                        value: '12:00'
                    }, {
                        label: '13:00',
                        value: '13:00'
                    }, {
                        label: '14:00',
                        value: '14:00'
                    }, {
                        label: '15:00',
                        value: '15:00'
                    }, {
                        label: '16:00',
                        value: '16:00'
                    }, {
                        label: '17:00',
                        value: '17:00'
                    }, {
                        label: '18:00',
                        value: '18:00'
                    }, {
                        label: '19:00',
                        value: '19:00'
                    }, {
                        label: '20:00',
                        value: '20:00'
                    }, {
                        label: '21:00',
                        value: '21:00'
                    }, {
                        label: '22:00',
                        value: '22:00'
                    }, {
                        label: '23:00',
                        value: '23:00'
                    }]
                },
                schedule_time_to: {
                    type: 'select',
                    label: 'timeTo',
                    options: [{
                        label: '00:00',
                        value: '00:00'
                    }, {
                        label: '01:00',
                        value: '01:00'
                    }, {
                        label: '02:00',
                        value: '02:00'
                    }, {
                        label: '03:00',
                        value: '03:00'
                    }, {
                        label: '04:00',
                        value: '04:00'
                    }, {
                        label: '05:00',
                        value: '05:00'
                    }, {
                        label: '06:00',
                        value: '06:00'
                    }, {
                        label: '07:00',
                        value: '07:00'
                    }, {
                        label: '08:00',
                        value: '08:00'
                    }, {
                        label: '09:00',
                        value: '09:00'
                    }, {
                        label: '10:00',
                        value: '10:00'
                    }, {
                        label: '11:00',
                        value: '11:00'
                    }, {
                        label: '12:00',
                        value: '12:00'
                    }, {
                        label: '13:00',
                        value: '13:00'
                    }, {
                        label: '14:00',
                        value: '14:00'
                    }, {
                        label: '15:00',
                        value: '15:00'
                    }, {
                        label: '16:00',
                        value: '16:00'
                    }, {
                        label: '17:00',
                        value: '17:00'
                    }, {
                        label: '18:00',
                        value: '18:00'
                    }, {
                        label: '19:00',
                        value: '19:00'
                    }, {
                        label: '20:00',
                        value: '20:00'
                    }, {
                        label: '21:00',
                        value: '21:00'
                    }, {
                        label: '22:00',
                        value: '22:00'
                    }, {
                        label: '23:00',
                        value: '23:00'
                    }]
                }
            }
        }
    },

    fonts: {
        type: 'section',

        font: {
            type: 'select',
            label: 'font',
            options: [{
                label: 'Roboto',
                value: 'Roboto'
            }, {
                label: 'Open Sans',
                value: 'Open+Sans'
            }, {
                label: 'Lato',
                value: 'Lato'
            }, {
                label: 'Montserrat',
                value: 'Montserrat'
            }, {
                label: 'Source Sans Pro',
                value: 'Source+Sans+Pro'
            }, {
                label: 'Roboto Condensed',
                value: 'Roboto+Condensed'
            }, {
                label: 'Oswald',
                value: 'Oswald'
            }, {
                label: 'Comfortaa',
                value: 'Comfortaa'
            }, {
                label: 'Roboto Mono',
                value: 'Roboto+Mono'
            }, {
                label: 'Raleway',
                value: 'Raleway'
            }, {
                label: 'Poppins',
                value: 'Poppins'
            }, {
                label: 'Noto Sans',
                value: 'Noto+Sans'
            }, {
                label: 'Roboto Slab',
                value: 'Roboto+Slab'
            }, {
                label: 'Marriweather',
                value: 'Marriweather'
            }, {
                label: 'PT Sans',
                value: 'PT+Sans'
            }]
        }
    },

    section_label__thumbnails: {
        type: 'text',
        class: 'satus-section--label',
        label: 'thumbnails'
    },

    thumbnails_section: {
        type: 'section',

        squared_user_images: {
            type: 'switch',
            label: 'squaredUserImages',
            tags: 'avatar'
        },
        hd_thumbnails: {
            type: 'switch',
            label: 'hdThumbnails',
            tags: 'preview quality'
        },
        hide_animated_thumbnails: {
            type: 'switch',
            label: 'hideAnimatedThumbnails',
            tags: 'preview'
        }
    }
};