/*-----------------------------------------------------------------------------
>>> GENERAL
-------------------------------------------------------------------------------
1.0 Legacy YouTube
2.0 YouTube Home Page
3.0 Add «Scroll to top»
4.0 HD thumbnails
5.0 Confirmation before closing
6.0 Collapse of subscription sections
7.0 Mark watched videos
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Legacy YouTube
-----------------------------------------------------------------------------*/

ImprovedTube.youtubeVersion = function() {
    var pref = ImprovedTube.getCookieValueByName('PREF'),
        f6 = ImprovedTube.getParam(pref, 'f6') || '0004',
        last = f6.slice(-1),
        disable_polymer = Boolean(ImprovedTube.getParam(location.search.substr(1), 'disable_polymer')),
        version = (last == '8' || last == '9') || disable_polymer ? 'old' : 'new',
        option = ImprovedTube.storage.legacy_youtube === true ? 'old' : 'new';

    if (
        navigator &&
        navigator.userAgent &&
        navigator.userAgent.match(/Chrom(e|ium)+\/[0-9.]+/g)[0] &&
        Number(navigator.userAgent.match(/Chrom(e|ium)+\/[0-9.]+/g)[0].match(/[0-9.]+/g)[0].match(/[0-9]+/g)[0]) <= 49
    ) {
        version = 'old';
    }

    if (version !== option) {
        ImprovedTube.legacy_youtube();
    }

    document.documentElement.setAttribute('it-youtube-version', version);
};

ImprovedTube.legacy_youtube = function() {
    var option = ImprovedTube.storage.legacy_youtube,
        PREF = this.getParams(this.getCookieValueByName('PREF')),
        result = '';

    if (!this.isset(PREF.f6)) {
        PREF.f6 = option === true ? '0008' : '';
    } else if (PREF.f6.length === 4) {
        PREF.f6 = PREF.f6.slice(0, -1) + (option === true ? '8' : '');
    } else if (PREF.f6.length === 3) {
        PREF.f6 += option === true ? '8' : '';
    } else {
        PREF.f6 = option === true ? '0008' : '';
    }

    for (var i in PREF) {
        result += i + '=' + PREF[i] + '&';
    }

    this.setCookie('PREF', result.slice(0, -1));

    setTimeout(function() {
        location.reload();
    }, 250);
};


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
    if (option && option !== '/' && option !== 'search' && location.hostname === 'www.youtube.com' && location.pathname === '/') {
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
            if (/(hqdefault\.jpg|hq720.jpg)+/.test(images[i].src) && !images[i].dataset.defaultSrc) {
                images[i].dataset.defaultSrc = images[i].src;

                images[i].onload = function() {
                    if (this.naturalHeight <= 90) {
                        this.src = this.dataset.defaultSrc;
                    }
                };

                images[i].src = images[i].src.replace(/(hqdefault\.jpg|hq720.jpg)+/, 'maxresdefault.jpg');
            }
        }
    } else {
        var images = document.querySelectorAll('img');

        for (var i = 0, l = images.length; i < l; i++) {
            if (images[i].dataset.defaultSrc) {
                images[i].src = images[i].dataset.defaultSrc;
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


/*-----------------------------------------------------------------------------
6.0 Collapse of subscription sections
-----------------------------------------------------------------------------*/

ImprovedTube.collapse_of_subscription_sections = function() {
    if (/\/feed\/subscriptions/.test(location.href)) {
        if (ImprovedTube.storage.collapse_of_subscription_sections === true) {
            var sections = document.querySelectorAll('ytd-page-manager ytd-section-list-renderer ytd-item-section-renderer, #browse-items-primary .section-list > li');

            for (var i = 0, l = sections.length; i < l; i++) {
                if (!sections[i].querySelector('.it-section-collapse')) {
                    var section_title = sections[i].querySelector('h2'),
                        button = document.createElement('div');

                    button.className = 'it-section-collapse';
                    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7.4 15.4l4.6-4.6 4.6 4.6L18 14l-6-6-6 6z"/></svg>';
                    button.section = sections[i];
                    button.addEventListener('click', function() {
                        var section = this.section,
                            content = section.querySelector('.grid-subheader + #contents, .shelf-title-table + .multirow-shelf');

                        if (section.classList.contains('it-section-collapsed') === false) {
                            content.style.height = content.offsetHeight + 'px';
                            content.style.transition = 'height 150ms';
                        }

                        setTimeout(function() {
                            section.classList.toggle('it-section-collapsed');
                        });
                    });

                    if (!sections[i].querySelector('.shelf-title-cell')) {
                        section_title.parentNode.insertBefore(button, section_title.nextSibling);
                    } else {
                        section_title.appendChild(button);
                    }
                }
            }
        } else {
            var sections = document.querySelectorAll('ytd-page-manager ytd-section-list-renderer ytd-item-section-renderer'),
                buttons = document.querySelectorAll('.it-section-collapse');

            for (var i = 0, l = sections.length; i < l; i++) {
                sections[i].classList.remove('it-section-collapsed');
                sections[i].style.height = '';
                sections[i].style.transition = '';
            }

            for (var i = 0, l = buttons.length; i < l; i++) {
                buttons[i].remove();
            }
        }
    }
};


/*-----------------------------------------------------------------------------
7.0 Mark watched videos
-----------------------------------------------------------------------------*/

document.addEventListener('ImprovedTubeWatched', function(event) {
    if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage({
            name: 'improvedtube-watched',
            data: {
                action: event.detail.action,
                id: event.detail.id,
                title: event.detail.title
            }
        });
    }
});

ImprovedTube.mark_watched_videos = function() {
    if (ImprovedTube.storage.mark_watched_videos === true) {
        var video_items = document.querySelectorAll('a#thumbnail.ytd-thumbnail, div.yt-lockup-thumbnail a, a.thumb-link');

        for (let i = 0, l = video_items.length; i < l; i++) {
            if (!video_items[i].querySelector('.it-mark-watched')) {
                var button = document.createElement('div');

                button.className = 'it-mark-watched' + (ImprovedTube.storage.watched && ImprovedTube.storage.watched[ImprovedTube.getParam(new URL(video_items[i].href || 'https://www.youtube.com/').search.substr(1), 'v')] ? ' watched' : '');
                button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.7 7.6 1 12a11.8 11.8 0 0022 0c-1.7-4.4-6-7.5-11-7.5zM12 17a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>';
                button.addEventListener('click', function(event) {
                    var watched = this.classList.contains('watched') ? false : true;

                    event.preventDefault();
                    event.stopPropagation();

                    this.classList.toggle('watched');

                    try {
                        var video_id = ImprovedTube.getParam(new URL(this.parentNode.href).search.substr(1), 'v'),
                            item = this.parentNode;

                        while (
                            item.nodeName &&
                            item.nodeName !== 'YTD-RICH-ITEM-RENDERER' &&
                            item.nodeName !== 'YTD-COMPACT-VIDEO-RENDERER' &&
                            item.nodeName !== 'YTD-GRID-VIDEO-RENDERER' &&
                            item.classList &&
                            !item.classList.contains('yt-shelf-grid-item') &&
                            !item.classList.contains('video-list-item')
                        ) {
                            item = item.parentNode;
                        }

                        if (!ImprovedTube.storage.watched || typeof ImprovedTube.storage.watched !== 'object') {
                            ImprovedTube.storage.watched = {};
                        }

                        if (watched === true) {
                            ImprovedTube.storage.watched[video_id] = {
                                title: item.querySelector('a#video-title, .title, .yt-lockup-title > a').innerText
                            };

                            document.dispatchEvent(new CustomEvent('ImprovedTubeWatched', {
                                detail: {
                                    action: 'set',
                                    id: video_id,
                                    title: item.querySelector('a#video-title, .title, .yt-lockup-title > a').innerText
                                }
                            }));
                        } else if (ImprovedTube.storage.watched[video_id]) {
                            delete ImprovedTube.storage.watched[video_id];

                            document.dispatchEvent(new CustomEvent('ImprovedTubeWatched', {
                                detail: {
                                    action: 'remove',
                                    id: video_id
                                }
                            }));
                        }
                    } catch (err) {}
                });

                video_items[i].appendChild(button);
            }
        }
    }
};