/*-----------------------------------------------------------------------------
>>> MIGRATION
-------------------------------------------------------------------------------
1.0 General
	1.1 Legacy YouTube
	1.2 YouTube Home Page
	1.3 Add «Scroll to top»
	1.4 Hide animated thumbnails
	1.5 Confirmation before closing
2.0 Appearance
	2.1 Header
		2.1.1 Header style
		2.1.2 Improve logo
	2.2 Player
		2.2.1 Annotations
		2.2.2 Cards
		2.2.3 Player size
    2.3 Footer
        2.3.5 Hide footer
3.0 Themes
4.0 Player
	4.1 Quality
	4.2 Volume
	4.3 Playback speed
	4.4 Autoplay
	4.5 Allow 60fps
	4.6 Codec h.264
	4.7 Subtitles
	4.8 Loudness normalization
	4.9 Mini player
	4.10 Ads
	4.11 Autopause
	4.12 Auto-fullscreen
	4.13 Repeat button
	4.14 Screenshot button
	4.15 Rotate button
	4.16 Popup button
5.0 Playlist
	5.1 Repeat
	5.2 Shuffle
6.0 Channel
	6.1 Default tab
	6.2 Trailer autoplay
    6.3 Hide featured content
-----------------------------------------------------------------------------*/

chrome.storage.local.get(function(object) {
    if (object.migrated !== true) {
        for (var key in object) {
            var value = object[key];

            if (value === 'true') {
                object[key] = true;
            } else if (value === 'false') {
                object[key] = false;
            }

            /*---------------------------------------------------------------------
    		1.0 General
    		---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
    		1.2 YouTube Home Page
    		---------------------------------------------------------------------*/
            else if (key === 'youtube_home_page') {
                if (value === 'normal') {
                    object[key] = '/';
                } else if (value === 'trending') {
                    object[key] = '/feed/trending';
                } else if (value === 'subscriptions') {
                    object[key] = '/feed/subscriptions';
                } else if (value === 'history') {
                    object[key] = '/feed/history';
                } else if (value === 'watch_later') {
                    object[key] = '/playlist?list=WL';
                }
            }


            /*---------------------------------------------------------------------
            1.3 Add «Scroll to top»
            ---------------------------------------------------------------------*/
            else if (key === 'scroll_to_top') {
                if (value === 'true') {
                    object.add_scroll_to_top = true;
                } else {
                    object.add_scroll_to_top = false;
                }

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		1.4 Hide animated thumbnails
    		---------------------------------------------------------------------*/
            else if (key === 'play_videos_by_hovering_the_thumbnails') {
                if (value === 'false') {
                    object.hide_animated_thumbnails = true;
                } else {
                    object.hide_animated_thumbnails = false;
                }

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		1.5 Confirmation before closing
    		---------------------------------------------------------------------*/
            else if (key === 'youtube_prevent_closure') {
                if (value === 'true') {
                    object.confirmation_before_closing = true;
                }

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		2.0 Appearance
    		---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
    		2.1 Header
    		---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
    		2.1.1 Header style
    		---------------------------------------------------------------------*/
            else if (key === 'header') {
                if (value === 'top_of_page') {
                    object.header_position = 'static';
                } else {
                    object.header_position = value;
                }

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		2.1.2 Improve logo
    		---------------------------------------------------------------------*/
            else if (key === 'improve_youtube_logo') {
                object.header_improve_logo = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		2.2 Player
    		---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
    		2.2.1 Annotations
    		---------------------------------------------------------------------*/
            else if (key === 'annotations') {
                object.player_hide_annotations = value;

                delete object[key];
            }

            /*---------------------------------------------------------------------
    		2.2.2 Cards
    		---------------------------------------------------------------------*/
            else if (key === 'cards') {
                object.player_hide_cards = value;

                delete object[key];
            }

            /*---------------------------------------------------------------------
    		2.2.3 Transparent background
    		---------------------------------------------------------------------*/
            else if (key === 'transparent_background') {
                object.player_transparent_background = value;

                delete object[key];
            }

            /*---------------------------------------------------------------------
            2.2.4 Endscreen
            ---------------------------------------------------------------------*/
            else if (key === 'endscreen') {
                object.player_hide_endscreen = value;

                delete object[key];
            }

            /*---------------------------------------------------------------------
            2.3 Footer
            ---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
            2.3.5 Hide footer
            ---------------------------------------------------------------------*/
            else if (key === 'footer') {
                object.hide_footer = value === 'hidden' ? true : false;

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		3.0 Themes
    		---------------------------------------------------------------------*/
            else if (key === 'it_theme') {
                object.theme = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
    		4.0 Player
    		---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
            4.1 Quality
            ---------------------------------------------------------------------*/
            else if (key === 'video_quality') {
                object.player_quality = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.2 Volume
            ---------------------------------------------------------------------*/
            else if (key === 'video_volume') {
                object.player_volume = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.3 Playback speed
            ---------------------------------------------------------------------*/
            else if (key === 'video_playback_speed') {
                object.player_playback_speed = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.4 Autoplay
            ---------------------------------------------------------------------*/
            else if (key === 'video_autoplay') {
                object.player_autoplay = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.5 Allow 60fps
            ---------------------------------------------------------------------*/
            else if (key === 'allow_60fps') {
                object.player_60fps = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.6 Video codec h.264
            ---------------------------------------------------------------------*/
            else if (key === 'video_encode') {
                object.player_h264 = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.7 Allow subtitles
            ---------------------------------------------------------------------*/
            else if (key === 'allow_subtitles') {
                object.player_subtitles = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.8 Loudness normalization
            ---------------------------------------------------------------------*/
            else if (key === 'allow_loudness') {
                object.player_loudness_normalization = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.8 Mini player
            ---------------------------------------------------------------------*/
            else if (key === 'mini_player_b') {
                object.mini_player = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.9 Ads
            ---------------------------------------------------------------------*/
            else if (key === 'allow_video_ads') {
                object.player_ads = 'all_videos';

                delete object[key];
            } else if (key === 'subscribed_channel_player_ads' && value === true) {
                object.player_ads = 'subscribed_channels';

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.10 Autopause
            ---------------------------------------------------------------------*/
            else if (key === 'video_autopause') {
                object.player_autopause = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.11 Auto-fullscreen
            ---------------------------------------------------------------------*/
            else if (key === 'video_autofullscreen') {
                object.player_autofullscreen = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.12 Repeat button
            ---------------------------------------------------------------------*/
            else if (key === 'video_repeat_button') {
                object.player_repeat_button = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.13 Screenshot button
            ---------------------------------------------------------------------*/
            else if (key === 'screenshot_button') {
                object.player_screenshot_button = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.14 Rotate button
            ---------------------------------------------------------------------*/
            else if (key === 'video_rotate_button') {
                object.player_rotate_button = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            4.15 Popup button
            ---------------------------------------------------------------------*/
            else if (key === 'popup_player_button') {
                object.player_popup_button = value;

                delete object[key];
            }


            /*---------------------------------------------------------------------
            5.0 Playlist
            ---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
            5.1 Repeat
            ---------------------------------------------------------------------*/
            else if (key === 'playlist_repeat') {
                if (value === 'enabled') {
                    object.playlist_repeat = true;
                } else if (value === 'disabled') {
                    object.playlist_repeat = false;
                }
            }

            /*---------------------------------------------------------------------
            5.2 Shuffle
            ---------------------------------------------------------------------*/
            else if (key === 'playlist_shuffle') {
                if (value === 'enabled') {
                    object.playlist_repeat = true;
                } else if (value === 'disabled') {
                    object.playlist_repeat = false;
                }
            }


            /*---------------------------------------------------------------------
            6.0 Channel
            ---------------------------------------------------------------------*/

            /*---------------------------------------------------------------------
            6.1 Default tab
            ---------------------------------------------------------------------*/
            else if (key === 'channel_default_page') {
                if (value === 'normal') {
                    object.channel_default_tab = '/';
                } else {
                    object.channel_default_tab = '/' + value;
                }
            }

            /*---------------------------------------------------------------------
            6.2 Trailer autoplay
            ---------------------------------------------------------------------*/
            else if (key === 'channel_autoplay') {
                object.channel_trailer_autoplay = value;

                delete object[key];
            }

            /*---------------------------------------------------------------------
            6.3 Hide featured content
            ---------------------------------------------------------------------*/
            else if (key === 'channel_featured_content') {
                object.channel_hide_featured_content = value;

                delete object[key];
            }
        }

        object.migrated = true;

        chrome.storage.local.clear();
        chrome.storage.local.set(object);
    }

    if (object.bluelight_removed !== true && (object.bluelight || object.bluelight === 0)) {
        object.bluelight_removed = true;

        delete object.bluelight;

        chrome.storage.local.clear();
        chrome.storage.local.set(object);

        location.reload();
    }

    if (object.player_size_migrated !== true && object.player_size) {
        object.player_size_migrated = true;

        if (
            [
                'do_not_change',
                'full_window',
                'fit_to_window',
                '240p',
                '360p',
                '480p',
                '576p',
                '720p',
                '1080p',
                '1440p',
                '2160p'
            ].indexOf(object.player_size) === -1
        ) {
            if (object.player_size === 'fit_window') {
                object.player_size = 'fit_to_window';
            } else {
                object.player_size = 'do_not_change';
            }
        }

        chrome.storage.local.clear();
        chrome.storage.local.set(object);

        location.reload();
    }
});