/*--------------------------------------------------------------
>>> APPEARANCE
----------------------------------------------------------------
# Header
# Player
# Details
# Comments
# Footer
# Sidebar
--------------------------------------------------------------*/
extension.skeleton.main.layers.section.appearance = {
    component: "button",
    variant: "appearance",
    category: true,
    on: {
        click: {
            component: "section",
            variant: "appearance",
        },
    },

    icon: {
        component: "span",

        svg: {
            component: "svg",
            attr: {
                viewBox: "0 0 24 24",
                fill: "transparent",
                stroke: "currentColor",
                "stroke-linecap": "round",
                "stroke-width": "1.75",
            },

            path: {
                component: "path",
                attr: {
                    d: "M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z",
                },
            },
        },
    },
    label: {
        component: "span",
        text: "appearance",
    },
};

/*--------------------------------------------------------------
# HEADER
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.appearance.on.click.header = {
    component: "button",
    variant: "header",
    text: "header",
    on: {
        click: {
            component: "section",
            variant: "card",

            header_position: {
                component: "select",
                text: "position",
                options: [
                    {
                        text: "normal",
                        value: "normal",
                    },
                    {
                        text: "hidden",
                        value: "hidden",
                    },
                    {
                        text: "hover",
                        value: "hover",
                    },
                    {
                        text: "hiddenOnVideoPage",
                        value: "hidden_on_video_page",
                    },
                    {
                        text: "hoverOnVideoPage",
                        value: "hover_on_video_page",
                    },
                    {
                        text: "static",
                        value: "static",
                    },
                ],
                tags: "hide,hover,static,top",
            },
            header_improve_logo: {
                component: "switch",
                text: "improveLogo",
                tags: "youtube",
            },
            header_hide_right_buttons: {
                component: "switch",
                text: "hideRightButtons",
                tags: "user",
            },
            header_hide_country_code: {
                component: "switch",
                text: "hideCountryCode",
                tags: "country,code",
            },
            hide_voice_search_button: {
                component: "switch",
                text: "hideVoiceSearchButton",
            },
        },
    },
};

/*--------------------------------------------------------------
# PLAYER
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.appearance.on.click.player = {
    component: "button",
    variant: "player",
    text: "player",
    on: {
        click: {
            component: "section",
            variant: "card",

            player_size: {
                component: "select",
                variant: "player-size",
                text: "playerSize",
                options: [
                    {
                        text: "doNotChange",
                        value: "do_not_change",
                    },
                    {
                        text: "fullWindow",
                        value: "full_window",
                    },
					{
                        text: "Max. width within the page",
                        value: "max_width",
                    },
                    {
                        text: "fitToWindow",
                        value: "fit_to_window",
                    },
                    {
                        text: "240p",
                        value: "240p",
                    },
                    {
                        text: "360p",
                        value: "360p",
                    },
                    {
                        text: "480p",
                        value: "480p",
                    },
                    {
                        text: "576p",
                        value: "576p",
                    },
                    {
                        text: "720p",
                        value: "720p",
                    },
                    {
                        text: "1080p",
                        value: "1080p",
                    },
                    {
                        text: "1440p",
                        value: "1440p",
                    },
                    {
                        text: "2160p",
                        value: "2160p",
                    },
                    {
                        text: "custom",
                        value: "custom",
                    },
                ],
            },
            customPlayerSizeSection: {
                component: "section",
                variant: "custom-player-size",

                custom_player_size_width: {
                    component: "text-field",
                    placeholder: "1280",
                    storage: "custom_player_size_width",
                },
                x: {
                    component: "span",
                    text: "x",
                },
                custom_player_size_height: {
                    component: "text-field",
                    placeholder: "720",
                    storage: "custom_player_size_height",
                },
            },
            hide_controls: {
                component: "select",
                text: "hidePlayerControlsBar",
                options: [
                    {
                        text: "off",
                        value: "off",
                        default: "true",
                    },
                    {
                        text: "whenPaused",
                        value: "when_paused",
                    },
                    {
                        text: "always",
                        value: "always",
                    },
                ],
                storage: "player_hide_controls",
            },
            player_hide_controls_options: {
                component: "button",
                text: "hidePlayerControlsBarButtons",
                on: {
                    click: {
                        component: "section",
                        variant: "card",

                        player_play_button: {
                            component: "switch",
                            text: "playPause",
                        },
                        player_previous_button: {
                            component: "switch",
                            text: "previousVideo",
                        },
                        player_next_button: {
                            component: "switch",
                            text: "nextVideo",
                        },
                        player_volume_button: {
                            component: "switch",
                            text: "volume",
                        },
                        player_autoplay_button: {
                            component: "switch",
                            text: "autoplay",
                        },
                        player_settings_button: {
                            component: "switch",
                            text: "settings",
                        },
                        player_subtitles_button: {
                            component: "switch",
                            text: "subtitles",
                        },
                        player_miniplayer_button: {
                            component: "switch",
                            text: "nativeMiniPlayer",
                        },
                        player_view_button: {
                            component: "switch",
                            text: "viewMode",
                        },
                        player_screen_button: {
                            component: "switch",
                            text: "screen",
                        },
                        player_remote_button: {
                            component: "switch",
                            text: "remote",
                        },
                    },
                },
            },
            forced_theater_mode: {
                component: "switch",
                text: "forcedTheaterMode",
                tags: "wide",
            },
            hide_gradient_bottom: {
                component: "switch",
                text: "hideGradientBottom",
            },
            player_hide_skip_overlay: {
                component: "switch",
                text: "hideSkipOverlay",
                value: false,
                tags: "remove,hide",
            },
            player_remaining_duration: {
                component: "switch",
                text: "showRemainingDuration",
                id: "show-remaining-duration",
                value: false,
            },
            duration_with_speed: {
                component: "switch",
                text: "durationWithSpeed",
                value: false,
            },
            always_show_progress_bar: {
                component: "switch",
                text: "alwaysShowProgressBar",
            },
            player_color: {
                component: "select",
                text: "playerColor",
                options: [
                    {
                        text: "red",
                        value: "red",
                    },
                    {
                        text: "pink",
                        value: "pink",
                    },
                    {
                        text: "purple",
                        value: "purple",
                    },
                    {
                        text: "deepPurple",
                        value: "deep_purple",
                    },
                    {
                        text: "indigo",
                        value: "indigo",
                    },
                    {
                        text: "blue",
                        value: "blue",
                    },
                    {
                        text: "lightBlue",
                        value: "light_blue",
                    },
                    {
                        text: "cyan",
                        value: "cyan",
                    },
                    {
                        text: "teal",
                        value: "teal",
                    },
                    {
                        text: "green",
                        value: "green",
                    },
                    {
                        text: "lightGreen",
                        value: "light_green",
                    },
                    {
                        text: "lime",
                        value: "lime",
                    },
                    {
                        text: "yellow",
                        value: "yellow",
                    },
                    {
                        text: "amber",
                        value: "amber",
                    },
                    {
                        text: "orange",
                        value: "orange",
                    },
                    {
                        text: "deepOrange",
                        value: "deep_orange",
                    },
                    {
                        text: "brown",
                        value: "brown",
                    },
                    {
                        text: "blueGray",
                        value: "blue_gray",
                    },
                    {
                        text: "white",
                        value: "white",
                    },
                ],
                tags: "style",
            },
            player_transparent_background: {
                component: "switch",
                text: "transparentBackground",
            },
            player_hide_annotations: {
                component: "switch",
                text: "hideAnnotations",
                tags: "hide,remove,elements",
            },
            player_hide_cards: {
                component: "switch",
                text: "hideCards",
                tags: "hide,remove,elements",
            },
            player_show_cards_on_mouse_hover: {
                component: "switch",
                text: "showCardsOnMouseHover",
                tags: "hide,remove,elements",
            },
            player_hide_endscreen: {
                component: "switch",
                text: "hideEndscreen",
            },
            player_hd_thumbnail: {
                component: "switch",
                text: "hdThumbnail",
                tags: "preview",
            },
            hide_scroll_for_details: {
                component: "switch",
                text: "hideScrollForDetails",
                tags: "remove,hide",
            },
            comments_sidebar_position: {
                component: "switch",
                text: "commentsSidebarPosition",
            },
        },
    },
};

/*--------------------------------------------------------------
# DETAIL
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.appearance.on.click.details = {
    component: "button",
    variant: "details",
    text: "details",
    on: {
        click: {
            component: "section",
            variant: "card",
			description: {
                component: "select",
                text: "description",

                options: [
                    {
                        text: "normal",
                        value: "normal",
                    },
                    {
                        text: "expanded",
                        value: "expanded",
                    },
                    {
                        text: "hidden",
                        value: "hidden",
                    },
                ],
                tags: "hide,remove",
            },
			hide_details_button: {
                component: "button",
                text: "hideDetailButton",
                on: {
                    click: {
                        component: "section",
                        variant: "card",
						youtubesdetailbuttons: {
                            component: "select",
                            text: "YouTube's detail buttons",
                            options: [
                                {
                                    text: "normal",
                                    value: "normal",
                                },
								  {
                                    text: "Remove names",
                                    value: "remove_labels",
                                },
                                {
                                    text: "Faint/transparent",
                                    value: "faint_transparent",
                                },
								 {
                                    text: "Remove",
                                    value: "remove",
                                },
							    {
                                    text: "Hide names",
                                    value: "hide_labels",
                                },
								 {
                                    text: "Remove icons",
                                    value: "remove_icons",
								 },
                            ],
                            tags: "hide,remove",
                        },    			
		                 likes: {
                            component: "select",
                            text: "'like'",
                            options: [
                                {
                                    text: "normal",
                                    value: "normal",
                                },
                                {
                                    text: "iconsOnly",
                                    value: "icons_only",
                                },
                                {
                                    text: "hidden",
                                    value: "hidden",
                                },
                            ],
                            tags: "hide,remove",
                        },
                        hide_dislike_button: {
                            component: "select",
                            text: "'dislike'",
                            options: [
                                {
                                    text: "normal",
                                    value: "normal",
                                },
                                {
                                    text: "iconsOnly",
                                    value: "icons_only",
                                },
                                {
                                    text: "hidden",
                                    value: "hidden",
                                },
                            ],
                            tags: "hide,remove",
                        },
						red_dislike_button: {
						component: "switch",
						text: "redDislikeButton",
						},
                        hide_share_button: {
                            component: "select",
                            text: "'share'",
                            options: [
                                {
                                    text: "normal",
                                    value: "normal",
                                },
                                {
                                    text: "iconsOnly",
                                    value: "icons_only",
                                },
                                {
                                    text: "hidden",
                                    value: "hidden",
                                },
                            ],
                            tags: "hide,remove",
                        },
                        hide_download_button: {
                            component: "select",
                            text: "'download'",
                            options: [
                                {
                                    text: "normal",
                                    value: "normal",
                                },
                                {
                                    text: "iconsOnly",
                                    value: "icons_only",
                                },
                                {
                                    text: "hidden",
                                    value: "hidden",
                                },
                            ],
                            tags: "hide,remove",
                        },
                        hide_thanks_button: {
                            component: "select",
                            text: "'thanks'",
                            options: [
                                {
                                    text: "normal",
                                    value: "normal",
                                },
                                {
                                    text: "iconsOnly",
                                    value: "icons_only",
                                },
                                {
                                    text: "hidden",
                                    value: "hidden",
                                },
                            ],
                            tags: "hide,remove",
                        },
                        hide_clip_button: {
                            component: "select",
                            text: "'clip'",
                            options: [
                                {
                                    text: "normal",
                                    value: "normal",
                                },
                                {
                                    text: "iconsOnly",
                                    value: "icons_only",
                                },
                                {
                                    text: "hidden",
                                    value: "hidden",
                                },
                            ],
                            tags: "hide,remove",
                        },
                        hide_save_button: {
                            component: "select",
                            text: "'save'",
                            options: [
                                {
                                    text: "normal",
                                    value: "normal",
                                },
                                {
                                    text: "iconsOnly",
                                    value: "icons_only",
                                },
                                {
                                    text: "hidden",
                                    value: "hidden",
                                },
                            ],
                            tags: "hide,remove",
                        },
                        hide_report_button: {
                            component: "switch",
                            text: "hide 'report'",
                            tags: "hide,remove",
                        },
                        hide_more_button: {
                            component: "switch",
                            text: "hide 'more'",
                            tags: "hide,remove",
                        },
                    },
                },
            },  
			hide_views_count: {
                component: "switch",
                text: "hideViewsCount",
                tags: "hide,remove",
            },
			hide_details: {
                component: "switch",
                text: "hideDetails",
                tags: "hide,remove",
            },
            day_of_week: {
                component: "switch",
                text: "displayDayOfTheWeak",
            },
            hide_date: {
                component: "switch",
                text: "hideDate",
                tags: "hide,remove",
            },
	       api: {component: 'section',
			variant: 'card',
			title: "(Currently requiring a YouTube-API-key: )",
				
            how_long_ago_the_video_was_uploaded: {
                component: "switch",
                text: "howLongAgoTheVideoWasUploaded",
            },
            channel_videos_count: {
                component: "switch",
                text: "showChannelVideosCount",
            },
        },},
    },
};

/*--------------------------------------------------------------
# COMMENTS
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.appearance.on.click.comments = {
    component: "button",
    variant: "comments",
    text: "comments",
    on: {
        click: {
            component: "section",
            variant: "card",

            comments: {
                component: "select",
                text: "comments",

                options: [
                    {
                        text: "normal",
                        value: "normal",
                    },
                    {
                        text: "collapsed",
                        value: "collapsed",
                    },
                    {
                        text: "hidden",
                        value: "hidden",
                    },
                ],
            },
			squared_user_images: {
				component: 'switch',
				text: 'squaredUserImages',
				tags: 'avatar'
				},
            hide_author_avatars: {
                component: "switch",
                text: "Hide avatars",
            },
            hide_comments_count: {
                component: "switch",
                text: "hideCommentsCount",
                tags: "hide,remove",
            },
        },
    },
};

/*--------------------------------------------------------------
# FOOTER
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.appearance.on.click.footer = {
    component: "button",
    variant: "footer",
    text: "footer",
    on: {
        click: {
            component: "section",
            variant: "card",

            hide_footer: {
                component: "switch",
                text: "hideFooter",
                tags: "bottom",
            },
        },
    },
};

/*--------------------------------------------------------------
# SIDEBAR
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.appearance.on.click.sidebar = {
    component: "button",
    variant: "sidebar",
    text: "sidebar",
    on: {
        click: {
            component: "section",
            variant: "card",

            related_videos: {
                component: "select",
                text: "relatedVideos",
                options: [
                    {
                        text: "normal",
                        value: "normal",
                    },
                    {
                        text: "collapsed",
                        value: "collapsed",
                    },
                    {
                        text: "hidden",
                        value: "hidden",
                    },
                ],
                tags: "right",
            },
			no_page_margin: {
					component: 'switch',
					text: 'To the side! (No page margin)',
					value: false
			},
            sidebar_left: {
                component: "switch",
                text: "moveSidebarLeft",
            },
            thumbnails_right: {
                component: "switch",
                text: "moveThumbnailsRight",
            },
            thumbnails_hide: {
                component: "switch",
                text: "hideThumbnails",
            },
            livechat: {
                component: "select",
                text: "liveChat",

                options: [
                    {
                        text: "normal",
                        value: "normal",
                    },
                    {
                        text: "collapsed",
                        value: "collapsed",
                    },
                    {
                        text: "hidden",
                        value: "hidden",
                    },
                ],
            },
            hide_playlist: {
                component: "switch",
                text: "hidePlaylist",
            },			
        },
    },
};
