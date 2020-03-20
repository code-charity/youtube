Menu.main.section.channel = {
    type: 'folder',
    icon: '<svg viewBox="0 0 24 24"><path d="M10.5 17.1l4-2.2a1 1 0 0 0 0-1.8l-4-2.3a1 1 0 0 0-1.5 1v4.5a1 1 0 0 0 1.5.8zM21 6h-7.6l3-3c.2-.1.2-.4 0-.6s-.6-.2-.8 0L12 6 8.4 2.4c-.2-.2-.6-.2-.8 0s-.2.5 0 .7l3 2.9H3a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 14H4a1 1 0 0 1-1-1V9c0-.6.5-1 1-1h16c.6 0 1 .5 1 1v10c0 .6-.5 1-1 1z"></svg>',

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