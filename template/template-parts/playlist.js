Menu.main.section.playlist = {
    type: 'folder',
    icon: '<svg viewBox="0 0 24 24"><path d="M8 7h12c.6 0 1-.5 1-1s-.5-1-1-1H8c-.6 0-1 .5-1 1s.5 1 1 1zm12 10H8c-.6 0-1 .5-1 1s.5 1 1 1h12c.6 0 1-.5 1-1s-.5-1-1-1zm0-6H8c-.6 0-1 .5-1 1s.5 1 1 1h12c.6 0 1-.5 1-1s-.5-1-1-1zM4.5 16h-2c-.3 0-.5.2-.5.5s.2.5.5.5H4v.5h-.5c-.3 0-.5.2-.5.5s.2.5.5.5H4v.5H2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2c.3 0 .5-.2.5-.5v-3c0-.3-.2-.5-.5-.5zm-2-11H3v2.5c0 .3.2.5.5.5s.5-.2.5-.5v-3c0-.3-.2-.5-.5-.5h-1c-.3 0-.5.2-.5.5s.2.5.5.5zm2 5h-2c-.3 0-.5.2-.5.5s.2.5.5.5h1.3l-1.7 2-.1.3v.2c0 .3.2.5.5.5h2c.3 0 .5-.2.5-.5s-.2-.5-.5-.5H3.2l1.7-2 .1-.3v-.2c0-.3-.2-.5-.5-.5z"></svg>',

    section: {
        type: 'section',

        playlist_autoplay: {
            type: 'switch',
            label: 'autoplay',
            value: true
        },
        playlist_reverse: {
            type: 'switch',
            label: 'reverse'
        },
        playlist_repeat: {
            type: 'switch',
            label: 'repeat'
        },
        playlist_shuffle: {
            type: 'switch',
            label: 'shuffle'
        }
    }
};