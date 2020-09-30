Menu.main.section.general = {
    type: 'folder',
    before: '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>',
    label: 'general',
    class: 'satus-folder--general',
    appearanceKey: 'general',

    section: {
        type: 'section',

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
