Menu.main.section.channel = {
    type: 'folder',
    before: '<svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><path d="M17 2l-5 5-5-5"/></svg>',
    label: 'channel',
    class: 'satus-folder--channel',
    appearanceKey: 'channel',

    section: {
        type: 'section',

        channel_default_tab: {
            type: 'select',
            label: 'defaultChannelTab',
            options: [{
                label: 'home',
                value: '/home'
            }, {
                label: 'videos',
                value: '/videos'
            }, {
                label: 'playlists',
                value: '/playlists'
            }]
        },
        channel_trailer_autoplay: {
            type: 'switch',
            label: 'trailerAutoplay',
            value: true
        },
        channel_hide_featured_content: {
            type: 'switch',
            label: 'hideFeaturedContent'
        }
    }
};
