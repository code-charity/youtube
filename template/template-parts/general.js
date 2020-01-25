/*-----------------------------------------------------------------------------
>>> «GENERAL» TEMPLATE PART
-----------------------------------------------------------------------------*/

Menu.main.all.main.section.general = {
    type: 'folder',
    icon: '<svg viewBox="0 0 24 24"><path d="M3 18c0 .6.5 1 1 1h5v-2H4a1 1 0 0 0-1 1zM3 6c0 .6.5 1 1 1h9V5H4a1 1 0 0 0-1 1zm10 14v-1h7c.6 0 1-.5 1-1s-.5-1-1-1h-7v-1c0-.6-.5-1-1-1s-1 .5-1 1v4c0 .6.5 1 1 1s1-.5 1-1zM7 10v1H4c-.6 0-1 .5-1 1s.5 1 1 1h3v1c0 .6.5 1 1 1s1-.5 1-1v-4c0-.6-.5-1-1-1s-1 .5-1 1zm14 2c0-.6-.5-1-1-1h-9v2h9c.6 0 1-.5 1-1zm-5-3c.6 0 1-.5 1-1V7h3c.6 0 1-.5 1-1s-.5-1-1-1h-3V4c0-.6-.5-1-1-1s-1 .5-1 1v4c0 .6.5 1 1 1z"></path></svg>',

    ad_section: {
        type: 'section',
        id: 'night-mode-ad',

        try_our_night_mode_extension: {
            type: 'button',
            label: 'Try our Night Mode extension',
            onclick: function() {
                window.open('https://chrome.google.com/webstore/detail/night-mode/declgfomkjdohhjbcfemjklfebflhefl');
            }
        }
    },

    section: {
        type: 'section',
        label: 'general',

        legacy_youtube: {
            type: 'select',
            label: 'legacyYoutube',
            options: [{
                label: 'disabled',
                value: 'disabled'
            }, {
                label: 'enabled',
                value: 'enabled'
            }, {
                label: 'enabledForced',
                value: 'enabledForced'
            }],
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
        add_scroll_to_top: {
            type: 'switch',
            label: 'addScrollToTop',
            tags: 'up'
        },
        confirmation_before_closing: {
            type: 'switch',
            label: 'confirmationBeforeClosing',
            tags: 'random prevent close exit'
        }
    },

    thumbnails_section: {
        type: 'section',
        label: 'thumbnails',

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