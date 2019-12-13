document.addEventListener('ImprovedTubeBlacklist', function(event) {
    chrome.runtime.sendMessage({
        name: 'improvedtube-blacklist',
        data: {
            type: event.detail.type,
            id: event.detail.id,
            title: event.detail.title,
            preview: event.detail.preview
        }
    });
});

ImprovedTube.blacklist = function() {
    if (ImprovedTube.storage.blacklist_activate !== true) {
        return false;
    }

    if (typeof ImprovedTube.storage.blacklist === 'boolean') {
        ImprovedTube.storage.blacklist = {};
    }

    // channel button
    if (Object.keys(ImprovedTube.storage.blacklist.channels).indexOf(location.href.replace(/https:\/\/www.youtube.com\/(channel|user)\//g, '').replace(/\/(.)+/g, '')) === -1) {
        let channel_items = document.querySelectorAll('#inner-header-container #subscribe-button, .primary-header-upper-section .yt-uix-subscription-button');

        for (let i = 0, l = channel_items.length; i < l; i++) {
            if (!channel_items[i].parentNode.querySelector('.improvedtube-add-to-blacklist')) {
                let button = document.createElement('div');

                button.addEventListener('click', function(event) {
                    let video_id;

                    event.preventDefault();
                    event.stopPropagation();

                    try {
                        video_id = location.href.replace(/https:\/\/www.youtube.com\/(channel|user)\//g, '').replace(/\/(.)+/g, '');

                        document.dispatchEvent(new CustomEvent('ImprovedTubeBlacklist', {
                            detail: {
                                type: 'channel',
                                id: video_id,
                                title: document.querySelector('#channel-container yt-formatted-string.ytd-channel-name, a.branded-page-header-title-link').innerText,
                                preview: document.querySelector('#channel-container #avatar #img, .channel-header-profile-image').src
                            }
                        }));

                        if (!ImprovedTube.storage.blacklist || typeof ImprovedTube.storage.blacklist !== 'object') {
                            ImprovedTube.storage.blacklist = {};
                        }

                        if (!ImprovedTube.storage.blacklist.channels) {
                            ImprovedTube.storage.blacklist.channels = {};
                        }

                        ImprovedTube.storage.blacklist.channels[video_id] = {
                            title: document.querySelector('yt-formatted-string.ytd-channel-name, a.branded-page-header-title-link').innerText,
                            preview: document.querySelector('#channel-container #avatar #img, .channel-header-profile-image').src
                        };

                        ImprovedTube.blacklist();

                        location.reload();
                    } catch (err) {}
                }, true);

                button.className = 'improvedtube-add-to-blacklist';
                button.innerText = 'Add to blacklist';
                button.style.position = 'static';
                button.style.transform = 'unset';
                button.style.opacity = '1';
                button.style.visibility = 'visible';
                button.style.pointerEvents = 'all';
                button.style.width = 'auto';
                button.style.fontSize = '16px';
                button.style.lineHeight = '28px';
                button.style.height = 'auto';
                button.style.padding = '6px 12px';
                button.style.borderRadius = '2px';
                button.style.boxSizing = 'border-box';

                channel_items[i].parentNode.insertBefore(button, channel_items[i]);
            }
        }
    }

    // video button
    let video_items = document.querySelectorAll('a#thumbnail.ytd-thumbnail, div.yt-lockup-thumbnail a, a.thumb-link');

    for (let i = 0, l = video_items.length; i < l; i++) {
        if (!video_items[i].querySelector('.improvedtube-add-to-blacklist')) {
            let button = document.createElement('div');

            button.addEventListener('click', function(event) {
                let video_id;

                event.preventDefault();
                event.stopPropagation();

                try {
                    video_id = ImprovedTube.getParam(new URL(this.parentNode.href).search.substr(1), 'v')

                    let item = this.parentNode;

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

                    document.dispatchEvent(new CustomEvent('ImprovedTubeBlacklist', {
                        detail: {
                            type: 'video',
                            id: video_id,
                            title: item.querySelector('a#video-title, .title, .yt-lockup-title > a').innerText
                        }
                    }));

                    if (!ImprovedTube.storage.blacklist || typeof ImprovedTube.storage.blacklist !== 'object') {
                        ImprovedTube.storage.blacklist = {};
                    }

                    if (!ImprovedTube.storage.blacklist.videos) {
                        ImprovedTube.storage.blacklist.videos = {};
                    }

                    ImprovedTube.storage.blacklist.videos[video_id] = {
                        title: item.querySelector('a#video-title, .title, .yt-lockup-title > a').innerText
                    };

                    ImprovedTube.blacklist();
                } catch (err) {}
            }, true);
            button.className = 'improvedtube-add-to-blacklist';
            button.innerText = 'x';

            video_items[i].appendChild(button);
        }
    }

    // remove channels
    if (ImprovedTube.storage.blacklist && ImprovedTube.storage.blacklist.channels) {
        let videos = document.querySelectorAll('a#thumbnail, div.yt-lockup-thumbnail a, a.thumb-link');

        for (let i = 0, l = videos.length; i < l; i++) {
            let item = videos[i];

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

            if (item.querySelector('.ytd-channel-name a, a.spf-link[href*="/user/"], a.spf-link[href*="/channel/"]')) {
                let channel_href = item.querySelector('.ytd-channel-name a, a.spf-link[href*="/user/"], a.spf-link[href*="/channel/"]').href;

                for (var key in ImprovedTube.storage.blacklist.channels) {
                    if (channel_href.indexOf(key) !== -1) {
                        item.style.display = 'none';
                    }
                }
            }
        }
    }

    // remove videos
    if (ImprovedTube.storage.blacklist && ImprovedTube.storage.blacklist.videos) {
        let videos = document.querySelectorAll('a#thumbnail, div.yt-lockup-thumbnail a, a.thumb-link');

        for (let i = 0, l = videos.length; i < l; i++) {
            if (videos[i].href && videos[i].href != '' && ImprovedTube.getParam(new URL(videos[i].href).search.substr(1), 'v') in ImprovedTube.storage.blacklist.videos) {
                let item = videos[i];

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

                item.style.display = 'none';
            }
        }
    }
};