/*-----------------------------------------------------------------------------
>>> PLAYLIST
-------------------------------------------------------------------------------
1.0 Reverse
2.0 Repeat
3.0 Shuffle
-----------------------------------------------------------------------------*/


/*-----------------------------------------------------------------------------
1.0 Reverse (todo)
-----------------------------------------------------------------------------*/

ImprovedTube.playlist_reverse_wait = false;

ImprovedTube.playlist_reverse_activated = false;

ImprovedTube.playlist_reverse = function() {
    if (this.storage.playlist_reverse === true) {
        ImprovedTube.playlist_reverse_wait = setInterval(function() {
            if (
                (
                    document.querySelector('.playlist-nav-controls') ||
                    document.querySelector('ytd-watch-flexy ytd-playlist-panel-renderer #header-contents #playlist-actions ytd-menu-renderer #top-level-buttons')
                ) &&
                (document.querySelector('.playlist-nav-controls .toggle-loop') || document.querySelectorAll('#playlist-actions #top-level-buttons ytd-toggle-button-renderer')[0]) &&
                !document.querySelector('#it-playlist-reverse')
            ) {
                clearInterval(ImprovedTube.playlist_reverse_wait);

                ImprovedTube.playlist_reverse_wait = false;

                var button = document.createElement('div');

                button.id = 'it-playlist-reverse';
                button.innerHTML = '<svg width=24 height=24 viewBox="0 0 24 24"><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"></svg>';
                button.onclick = function() {
                    if (this.classList.contains('yt-uix-button-toggled')) {
                        ImprovedTube.playlist_reverse_activated = false;

                        this.classList.remove('yt-uix-button-toggled');
                    } else {
                        ImprovedTube.playlist_reverse_activated = true;

                        this.classList.add('yt-uix-button-toggled');
                    }

                    if (document.documentElement.getAttribute('it-youtube-version') === 'old') {
                        ImprovedTube.legacyPlaylistReverse();
                    } else {
                        ImprovedTube.newPlaylistReverse();
                    }
                };

                (document.querySelector('ytd-watch-flexy ytd-playlist-panel-renderer #header-contents #playlist-actions ytd-menu-renderer #top-level-buttons') || document.querySelector('.playlist-nav-controls')).appendChild(button);

                if ((ImprovedTube.playlist_reverse_activated === true || location.href.indexOf('it-playlist-reverse=true') !== -1) && document.querySelector('#it-playlist-reverse')) {
                    ImprovedTube.playlist_reverse_activated = true;

                    document.querySelector('#it-playlist-reverse').classList.add('yt-uix-button-toggled');

                    if (document.documentElement.getAttribute('it-youtube-version') === 'old') {
                        ImprovedTube.legacyPlaylistReverse();
                    } else {
                        ImprovedTube.newPlaylistReverse();
                    }
                }
            }
        }, 250);
    }
};

ImprovedTube.legacyPlaylistReverse = function() {
    var list = document.querySelector('#player-playlist .playlist-videos-list'),
        videos = document.querySelectorAll('#player-playlist .playlist-videos-list > *'),
        clones = [];

    var prev_href_0 = document.querySelector('div.playlist-behavior-controls a.prev-playlist-list-item') ? document.querySelector('div.playlist-behavior-controls a.prev-playlist-list-item').getAttribute('href') : null,
        next_href_0 = document.querySelector('div.playlist-behavior-controls a.next-playlist-list-item') ? document.querySelector('div.playlist-behavior-controls a.next-playlist-list-item').getAttribute('href') : null,
        prev_href = document.querySelector('.currently-playing').previousElementSibling ? document.querySelector('.currently-playing').previousElementSibling.querySelector('a').href : document.querySelector('#player-playlist ol > li:last-child a').href,
        prev_title = document.querySelector('.currently-playing').previousElementSibling ? document.querySelector('.currently-playing').previousElementSibling.querySelector('h4').innerText : document.querySelector('#player-playlist ol > li:last-child h4').innerText,
        prev_preview = document.querySelector('.currently-playing').previousElementSibling ? document.querySelector('.currently-playing').previousElementSibling.querySelector('img').src : document.querySelector('#player-playlist ol > li:last-child img').src,
        next_href = document.querySelector('.ytp-left-controls > a:not(:first-child)').getAttribute('href'),
        next_title = document.querySelector('.ytp-left-controls > a:not(:first-child)').getAttribute('data-tooltip-text'),
        next_preview = document.querySelector('.ytp-left-controls > a:not(:first-child)').getAttribute('data-preview');

    document.querySelector('.ytp-left-controls > a:first-child').setAttribute('href', next_href);
    document.querySelector('.ytp-left-controls > a:first-child').setAttribute('data-tooltip-text', next_title);
    document.querySelector('.ytp-left-controls > a:first-child').setAttribute('data-preview', next_preview);
    document.querySelector('.ytp-left-controls > a:not(:first-child)').setAttribute('href', prev_href);
    document.querySelector('.ytp-left-controls > a:not(:first-child)').setAttribute('data-tooltip-text', prev_title);
    document.querySelector('.ytp-left-controls > a:not(:first-child)').setAttribute('data-preview', prev_preview);
    document.querySelector('div.playlist-behavior-controls a.prev-playlist-list-item').setAttribute('href', next_href_0);
    document.querySelector('div.playlist-behavior-controls a.next-playlist-list-item').setAttribute('href', prev_href_0);

    if (document.querySelector('.playlist-nav-controls .toggle-loop:not([aria-pressed="true"])')) {
        document.querySelector('.playlist-nav-controls .toggle-loop:not([aria-pressed="true"])').click();
    }

    if (videos) {
        for (var i = videos.length - 1; i >= 0; i--) {
            clones.push(videos[i].cloneNode(true));
        }

        list.innerHTML = '';

        for (var i = 0, l = clones.length; i < l; i++) {
            list.appendChild(clones[i]);
        }
    }
};

ImprovedTube.newPlaylistReverse = function() {
    var list = document.querySelector('#items.playlist-items'),
        videos = document.querySelectorAll('#items.playlist-items > *'),
        clones = [],
        thumbnails = [],
        titles = [],
        channels = [],
        hrefs = [];

    if (videos) {
        for (var i = videos.length - 1; i >= 0; i--) {
            thumbnails.push(videos[i].querySelector('#img').src);
            titles.push(videos[i].querySelector('#video-title').innerText);
            channels.push(videos[i].querySelector('#byline').innerText);
            hrefs.push(videos[i].querySelector('a').href + '&it-playlist-reverse=true');
            clones.push(videos[i].cloneNode(true));
        }

        list.innerHTML = '';

        for (var i = 0, l = clones.length; i < l; i++) {
            var clone = clones[i].cloneNode(true);

            list.appendChild(clone);
        }

        function next(event) {
            if (
                ImprovedTube.playlist_reverse_activated === true &&
                (
                    (document.querySelector('#items.playlist-items > [selected]').nextElementSibling ? document.querySelector('#items.playlist-items > [selected]').nextElementSibling.querySelector('a') : null) ||
                    document.querySelector('#items.playlist-items > * a')
                )
            ) {
                for (var i = 0, l = event.path.length; i < l; i++) {
                    if (event.path[i] === document.querySelector('.html5-video-player .ytp-next-button')) {
                        event.preventDefault();
                        event.stopPropagation();

                        location.replace(((document.querySelector('#items.playlist-items > [selected]').nextElementSibling ? document.querySelector('#items.playlist-items > [selected]').nextElementSibling.querySelector('a') : null) || document.querySelector('#items.playlist-items > * a')).href);

                        return false;
                    }
                }
            }
        }

        window.removeEventListener('click', next);
        window.addEventListener('click', next);

        function prev(event) {
            if (
                ImprovedTube.playlist_reverse_activated === true &&
                (
                    (document.querySelector('#items.playlist-items > [selected]').previousElementSibling ? document.querySelector('#items.playlist-items > [selected]').nextElementSibling.querySelector('a') : null) ||
                    document.querySelector('#items.playlist-items > *:last-child a')
                )
            ) {
                for (var i = 0, l = event.path.length; i < l; i++) {
                    if (event.path[i] === document.querySelector('.html5-video-player .ytp-prev-button')) {
                        event.preventDefault();
                        event.stopPropagation();

                        location.replace(((document.querySelector('#items.playlist-items > [selected]').previousElementSibling ? document.querySelector('#items.playlist-items > [selected]').nextElementSibling.querySelector('a') : null) || document.querySelector('#items.playlist-items > *:last-child a')).href);

                        return false;
                    }
                }
            }
        }

        window.removeEventListener('click', prev);
        window.addEventListener('click', prev);

        setTimeout(function() {
            for (var i = 0, l = clones.length; i < l; i++) {
                document.querySelectorAll('#items.playlist-items > *')[i].querySelector('a').href = hrefs[i];
                // index
                document.querySelectorAll('#items.playlist-items > *')[i].querySelector('#index').innerHTML = clones[i].querySelector('#index').innerHTML;
                // thumbnail
                document.querySelectorAll('#items.playlist-items > *')[i].querySelector('#img').src = thumbnails[i];
                document.querySelectorAll('#items.playlist-items > *')[i].querySelector('yt-img-shadow').classList.remove('empty');
                // title
                document.querySelectorAll('#items.playlist-items > *')[i].querySelector('#video-title').innerText = titles[i];
                // channel
                document.querySelectorAll('#items.playlist-items > *')[i].querySelector('#byline').innerText = channels[i];
            }

            //document.querySelector('.html5-video-player .ytp-next-button').parentNode.replaceChild(document.querySelector('.html5-video-player .ytp-next-button').cloneNode.true, document.querySelector('.html5-video-player .ytp-next-button'));
        }, 500);
    }
};


/*-----------------------------------------------------------------------------
2.0 Repeat
-----------------------------------------------------------------------------*/

ImprovedTube.playlist_repeat_wait = false;

ImprovedTube.playlist_repeat = function() {
    if (this.isset(this.storage.playlist_repeat) && /\/watch\?/.test(location.href) && /list=/.test(location.href)) {
        ImprovedTube.playlist_repeat_wait = setInterval(function() {
            if (
                document.querySelectorAll('#playlist-actions #top-level-buttons ytd-toggle-button-renderer')[0] ||
                document.querySelector('.playlist-nav-controls .toggle-loop')
            ) {
                clearInterval(ImprovedTube.playlist_repeat_wait);

                ImprovedTube.playlist_repeat_wait = false;

                var option = ImprovedTube.storage.playlist_repeat,
                    new_youtube_toggle = document.querySelectorAll('#playlist-actions #top-level-buttons ytd-toggle-button-renderer'),
                    old_youtube_toggle = document.querySelector('.playlist-nav-controls .toggle-loop');

                if (new_youtube_toggle[0] && (option === true && new_youtube_toggle[0].className.search('style-default-active') === -1 || option === 'disabled' && new_youtube_toggle[0].className.search('style-default-active') !== -1)) {
                    new_youtube_toggle[0].click();
                } else if (old_youtube_toggle && (option === true && old_youtube_toggle.className.search('yt-uix-button-toggled') === -1 || option === 'disabled' && old_youtube_toggle.className.search('yt-uix-button-toggled') !== -1)) {
                    old_youtube_toggle.click();
                }
            }
        }, 250);
    }
};


/*-----------------------------------------------------------------------------
3.0 Shuffle
-----------------------------------------------------------------------------*/

ImprovedTube.playlist_shuffle_wait = false;

ImprovedTube.playlist_shuffle = function() {
    if (this.isset(this.storage.playlist_shuffle) && /\/watch\?/.test(location.href) && /list=/.test(location.href)) {
        ImprovedTube.playlist_shuffle_wait = setInterval(function() {
            if (
                document.querySelectorAll('#playlist-actions #top-level-buttons ytd-toggle-button-renderer')[1] ||
                document.querySelector('.playlist-nav-controls .shuffle-playlist')
            ) {
                clearInterval(ImprovedTube.playlist_shuffle_wait);

                ImprovedTube.playlist_shuffle_wait = false;

                var option = ImprovedTube.storage.playlist_shuffle,
                    new_youtube_toggle = document.querySelectorAll('#playlist-actions #top-level-buttons ytd-toggle-button-renderer'),
                    old_youtube_toggle = document.querySelector('.playlist-nav-controls .shuffle-playlist');

                if (new_youtube_toggle[1] && (option === true && new_youtube_toggle[1].className.search('style-default-active') === -1 || option === 'disabled' && new_youtube_toggle[1].className.search('style-default-active') !== -1)) {
                    new_youtube_toggle[1].click();
                } else if (old_youtube_toggle && (option === true && old_youtube_toggle.className.search('yt-uix-button-toggled') === -1 || option === 'disabled' && old_youtube_toggle.className.search('yt-uix-button-toggled') !== -1)) {
                    old_youtube_toggle.click();
                }
            }
        }, 250);
    }
};