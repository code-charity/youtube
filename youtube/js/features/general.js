/*-----------------------------------------------------------------------------
>>> GENERAL
-------------------------------------------------------------------------------
1.0 YouTube Home Page
2.0 Add «Scroll to top»
3.0 HD thumbnails
4.0 Confirmation before closing
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
2.0 YouTube Home Page
-----------------------------------------------------------------------------*/

ImprovedTube.youtube_home_page = function() {
    if (
        this.storage.youtube_home_page &&
        this.storage.youtube_home_page !== '/' &&
        this.storage.youtube_home_page !== 'search'
    ) {
        var value = this.storage.youtube_home_page,
            node_list = document.querySelectorAll('a[href="/"], a[href="//www.youtube.com"], a[href="//www.youtube.com/"], a[href="https://www.youtube.com"], a[href="https://www.youtube.com/"], a[it-origin="/"], a[it-origin="//www.youtube.com"], a[it-origin="//www.youtube.com/"], a[it-origin="https://www.youtube.com"], a[it-origin="https://www.youtube.com/"]');

        for (var i = 0, l = node_list.length; i < l; i++) {
            var node = node_list[i],
                pathname = new URL((node.getAttribute('it-origin') || node.href)).pathname;

            if (pathname === '/') {
                if (!node.getAttribute('it-origin')) {
                    node.setAttribute('it-origin', node.href);
                }
            }

            node.href = value;

            node.addEventListener('click', function() {
                if (
                    this.data &&
                    this.data.commandMetadata &&
                    this.data.commandMetadata.webCommandMetadata &&
                    this.data.commandMetadata.webCommandMetadata.url
                ) {
                    this.data.commandMetadata.webCommandMetadata.url = value;
                }
            }, true);
        }
    } else if (this.storage.youtube_home_page) {
        var node_list = document.querySelectorAll('a[href="/"], a[href="//www.youtube.com"], a[href="//www.youtube.com/"], a[href="https://www.youtube.com"], a[href="https://www.youtube.com/"], a[it-origin="/"], a[it-origin="//www.youtube.com"], a[it-origin="//www.youtube.com/"], a[it-origin="https://www.youtube.com"], a[it-origin="https://www.youtube.com/"]');

        for (var i = 0, l = node_list.length; i < l; i++) {
            node_list[i].href = node_list[i].getAttribute('it-origin') || '/';
        }
    }
};

function youtubeHomePage__documentStart(option) {
    if (option && option !== '/' && option !== 'search' && location.pathname === '/') {
        location.replace(option);
    }
};


/*-----------------------------------------------------------------------------
3.0 Add «Scroll to top»
-----------------------------------------------------------------------------*/

ImprovedTube.scroll = function() {
    if (window.scrollY > window.innerHeight / 2) {
        document.documentElement.setAttribute('it-show-scroll-to-top', true);
    } else {
        document.documentElement.setAttribute('it-show-scroll-to-top', false);
    }
};

ImprovedTube.add_scroll_to_top = function(is_update) {
    if (this.storage.add_scroll_to_top === true) {
        var button = document.createElement('div');

        button.id = 'it-scroll-to-top';
        button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M13 19V7.8l4.9 5c.4.3 1 .3 1.4 0 .4-.5.4-1.1 0-1.5l-6.6-6.6a1 1 0 0 0-1.4 0l-6.6 6.6a1 1 0 1 0 1.4 1.4L11 7.8V19c0 .6.5 1 1 1s1-.5 1-1z"></svg>';

        button.addEventListener('click', function() {
            window.scrollTo(0, 0);
        });

        document.documentElement.appendChild(button);

        window.addEventListener('scroll', ImprovedTube.scroll);
    } else {
        window.removeEventListener('scroll', ImprovedTube.scroll);

        if (document.querySelector('#it-scroll-to-top')) {
            document.querySelector('#it-scroll-to-top').remove();
        }
    }
};


/*-----------------------------------------------------------------------------
4.0 HD thumbnails
-----------------------------------------------------------------------------*/

ImprovedTube.hd_thumbnails = function() {
    if (this.storage.hd_thumbnails === true) {
        var images = document.querySelectorAll('img');

        for (var i = 0, l = images.length; i < l; i++) {
            if (images[i].src.indexOf('hqdefault.jpg') !== -1) {
                images[i].src = images[i].src.replace('hqdefault.jpg', 'maxresdefault.jpg');
            }
        }
    } else {
        var images = document.querySelectorAll('img');

        for (var i = 0, l = images.length; i < l; i++) {
            if (images[i].src.indexOf('maxresdefault.jpg') !== -1) {
                images[i].src = images[i].src.replace('maxresdefault.jpg', 'hqdefault.jpg');
            }
        }
    }
};


/*-----------------------------------------------------------------------------
5.0 Confirmation before closing
-----------------------------------------------------------------------------*/

ImprovedTube.confirmation_before_closing = function() {
    window.onbeforeunload = function() {
        if (ImprovedTube.storage.confirmation_before_closing === true) {
            return 'You have attempted to leave this page. Are you sure?';
        }
    };
};