/*-----------------------------------------------------------------------------
>>> CHANNEL
-------------------------------------------------------------------------------
1.0 Channel tab
2.0 Trailer autoplay
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Channel tab
-----------------------------------------------------------------------------*/

ImprovedTube.channel_default_tab = function() {
    if (this.storage.channel_default_tab && this.storage.channel_default_tab !== '/') {
        var value = this.storage.channel_default_tab,
            node_list = document.querySelectorAll('a[href*="user"], a[href*="channel"]');

        for (var i = 0, l = node_list.length; i < l; i++) {
            var node = node_list[i],
                pathname = new URL((node.getAttribute('it-origin') || node.href)).pathname;

            if (!node.getAttribute('it-origin')) {
                node.setAttribute('it-origin', node.href);
            }

            node.href = node.getAttribute('it-origin') + value;

            function click() {
                if (
                    this.data &&
                    this.data.commandMetadata &&
                    this.data.commandMetadata.webCommandMetadata &&
                    this.data.commandMetadata.webCommandMetadata.url
                ) {
                    this.data.commandMetadata.webCommandMetadata.url = (this.querySelector('a') || this).href.replace('https://www.youtube.com', '');
                }
            }

            node.addEventListener('click', click, true);
            node.parentNode.addEventListener('click', click, true);
            node.parentNode.parentNode.addEventListener('click', click, true);
        }
    } else if (this.storage.channel_default_tab) {
        var node_list = document.querySelectorAll('a[href*="user"], a[href*="channel"]');

        for (var i = 0, l = node_list.length; i < l; i++) {
            node_list[i].href = node_list[i].getAttribute('it-origin');
        }
    }
};


/*-----------------------------------------------------------------------------
2.0 Trailer autoplay
-----------------------------------------------------------------------------*/

ImprovedTube.channel_trailer_autoplay = function() {
    if (
        document.querySelector('.html5-video-player video') &&
        ImprovedTube.storage.channel_trailer_autoplay == false && /\/(channel|user)\//.test(location.href)
    ) {
        document.querySelector('.html5-video-player video').pause();
    }
};
