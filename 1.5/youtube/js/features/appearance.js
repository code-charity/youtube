/*-----------------------------------------------------------------------------
>>> APPEARANCE
-------------------------------------------------------------------------------
1.0 Player
	1.1 Player size
	1.2 Forced theater mode
2.0 Details
3.0 Comments
4.0 Sidebar
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Player
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.1 Player size (todo)
-----------------------------------------------------------------------------*/

ImprovedTube.player_size = function() {};


/*-----------------------------------------------------------------------------
1.2 Forced theater mode
-----------------------------------------------------------------------------*/

ImprovedTube.forced_theater_mode = function() {
    if (this.storage.forced_theater_mode === 'true') {
        this.setCookie('wide', '1');
    }
};


/*-----------------------------------------------------------------------------
2.0 Details
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
2.1 How long ago the video was uploaded
-----------------------------------------------------------------------------*/

ImprovedTube.how_long_ago_the_video_was_uploaded = function() {
    if (ImprovedTube.storage.how_long_ago_the_video_was_uploaded === 'true') {
        function timeSince(date) {
            var seconds = Math.floor((new Date() - new Date(date)) / 1000),
                interval = Math.floor(seconds / 31536000);

            if (interval > 1) {
                return interval + ' years ago';
            }
            interval = Math.floor(seconds / 2592000);
            if (interval > 1) {
                return interval + ' months ago';
            }
            interval = Math.floor(seconds / 86400);
            if (interval > 1) {
                return interval + ' days ago';
            }
            interval = Math.floor(seconds / 3600);
            if (interval > 1) {
                return interval + ' hours ago';
            }
            interval = Math.floor(seconds / 60);
            if (interval > 1) {
                return interval + ' minutes ago';
            }

            return Math.floor(seconds) + ' seconds ago';
        }

        var waiting_channel_link = setInterval(function() {
            var youtube_version = document.documentElement.getAttribute('youtube-version') === 'new';

            if (document.querySelector(youtube_version ? '#meta-contents ytd-video-owner-renderer #owner-container a' : '.yt-user-info a')) {
                clearInterval(waiting_channel_link);

                if (document.querySelector('.itx-channel-video-uploaded'))
                    document.querySelector('.itx-channel-video-uploaded').remove();

                setTimeout(function() {
                    var youtube_version = document.documentElement.getAttribute('youtube-version') === 'new',
                        xhr = new XMLHttpRequest();

                    xhr.onreadystatechange = function() {
                        if (this.readyState === 4 && this.status === 200) {
                            var b = document.createElement(youtube_version ? 'yt-formatted-string' : 'a');

                            if (document.querySelector('.itx-channel-video-uploaded'))
                                document.querySelector('.itx-channel-video-uploaded').remove();

                            b.id = 'owner-name';
                            b.style.marginLeft = '.4rem';
                            b.className = (youtube_version ? 'style-scope ytd-video-owner-renderer itx-channel-video-uploaded' : 'yt-uix-sessionlink spf-link');
                            b.innerHTML = (youtube_version ? '<a class="yt-simple-endpoint style-scope yt-formatted-string"> · ' + timeSince(JSON.parse(this.responseText).items[0].snippet.publishedAt) + ' </a>' : timeSince(JSON.parse(this.responseText).items[0].snippet.publishedAt) + '');

                            document.querySelector(youtube_version ? '#meta-contents ytd-video-owner-renderer #owner-container' : '.yt-user-info').appendChild(b);
                        }
                    };

                    xhr.open('GET', 'https://www.googleapis.com/youtube/v3/videos?id=' + getParam(location.href.slice(location.href.indexOf('?') + 1), 'v') + '&key=AIzaSyCXRRCFwKAXOiF1JkUBmibzxJF1cPuKNwA&part=snippet', true);
                    xhr.send();
                }, 100);
            }
        }, 50);
    }
};


/*-----------------------------------------------------------------------------
2.2 Show channel videos count
-----------------------------------------------------------------------------*/

ImprovedTube.channel_videos_count = function() {
    if (document.querySelector('.itx-channel-videos-count')) {
        document.querySelector('.itx-channel-videos-count').remove();
    }

    if (ImprovedTube.storage.channel_videos_count === 'true') {
        var waiting_channel_link = setInterval(function() {
            let youtube_version = document.documentElement.getAttribute('youtube-version') === 'new';

            if (document.querySelector(youtube_version ? '#meta-contents ytd-video-owner-renderer #owner-container a' : '.yt-user-info a')) {
                clearInterval(waiting_channel_link);

                setTimeout(function() {
                    let youtube_version = document.documentElement.getAttribute('youtube-version') === 'new',
                        xhr = new XMLHttpRequest();

                    xhr.onreadystatechange = function() {
                        if (this.readyState === 4 && this.status === 200) {
                            var b = document.createElement(youtube_version ? 'yt-formatted-string' : 'a');

                            if (document.querySelector('.itx-channel-videos-count'))
                                document.querySelector('.itx-channel-videos-count').remove();

                            b.id = 'owner-name';
                            b.style.marginLeft = '.4rem';
                            b.className = (youtube_version ? 'style-scope ytd-video-owner-renderer itx-channel-videos-count' : 'yt-uix-sessionlink spf-link');
                            b.innerHTML = (youtube_version ? '<a class="yt-simple-endpoint style-scope yt-formatted-string">' + JSON.parse(this.responseText).items[0].statistics.videoCount + ' videos</a>' : JSON.parse(this.responseText).items[0].statistics.videoCount + ' videos');

                            document.querySelector(youtube_version ? '#meta-contents ytd-video-owner-renderer #owner-container' : '.yt-user-info').appendChild(b);
                        }
                    };

                    xhr.open('GET', 'https://www.googleapis.com/youtube/v3/channels?id=' + document.querySelector(youtube_version ? '#meta-contents ytd-video-owner-renderer #owner-container a' : '.yt-user-info a').href.replace('https://www.youtube.com/channel/', '') + '&key=AIzaSyCXRRCFwKAXOiF1JkUBmibzxJF1cPuKNwA&part=statistics', true);
                    xhr.send();
                }, 1000);
            }
        }, 50);
    }
};


/*-----------------------------------------------------------------------------
3.0 Comments
-----------------------------------------------------------------------------*/

ImprovedTube.comments_wait = false;

ImprovedTube.comments = function() {
    if (ImprovedTube.comments_wait === false) {
        if (this.storage.comments === 'collapsed') {
            ImprovedTube.comments_wait = setInterval(function() {
                if (
                    (document.getElementById('comment-section-renderer-items') ||
                        document.querySelector('#comments #sections #contents')) &&
                    !document.getElementById('improvedtube-collapsed-comments')
                ) {
                    clearInterval(ImprovedTube.comments_wait);

                    ImprovedTube.comments_wait = false;

                    var button = document.createElement('button'),
                        parent = document.getElementById('comment-section-renderer') || document.querySelector('#comments #sections'),
                        reference = document.getElementById('comment-section-renderer-items') || document.querySelector('#comments #sections #contents');

                    button.id = 'improvedtube-collapsed-comments';
                    button.className = 'yt-uix-button yt-uix-button-size-default yt-uix-button-default comment-section-renderer-paginator yt-uix-sessionlink';
                    button.innerHTML = '<span class=yt-uix-button-content><span class=show-more-text>Show more</span><span class=show-less-text>Show less</span></span>';

                    button.onclick = function() {
                        document.documentElement.classList.toggle('comments-collapsed');
                    };

                    document.documentElement.classList.toggle('comments-collapsed');
                    parent.insertBefore(button, reference);
                }
            }, 250);
        } else if (document.getElementById('improvedtube-collapsed-comments')) {
            document.getElementById('improvedtube-collapsed-comments').remove();
        }
    }
};


/*-----------------------------------------------------------------------------
4.0 Sidebar
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
4.1 Live chat
-----------------------------------------------------------------------------*/

ImprovedTube.livechat_wait = false;

ImprovedTube.livechat = function() {
    if (this.storage.livechat === 'collapsed' && ImprovedTube.livechat_wait === false) {
        ImprovedTube.livechat_wait = setInterval(function() {
            if (document.querySelector('ytd-live-chat-frame #show-hide-button paper-button')) {
                clearInterval(ImprovedTube.livechat_wait);

                ImprovedTube.livechat_wait = false;

                setTimeout(function() {
                    document.querySelector('ytd-live-chat-frame #show-hide-button paper-button').click();
                }, 500);
            } else if (document.querySelector('#watch-sidebar-live-chat .yt-uix-expander')) {
                clearInterval(ImprovedTube.livechat_wait);

                ImprovedTube.livechat_wait = false;

                document.querySelector('#watch-sidebar-live-chat .yt-uix-expander').classList.add('yt-uix-expander-collapsed');
            }
        });
    }
};


/*-----------------------------------------------------------------------------
4.2 Related videos
-----------------------------------------------------------------------------*/

ImprovedTube.related_videos_wait = false;

ImprovedTube.related_videos = function() {
    if (ImprovedTube.related_videos_wait === false) {
        if (this.storage.related_videos === 'collapsed') {
            setInterval(function() {
                if (
                    (
                        document.querySelector('#related.ytd-watch-flexy') ||
                        document.querySelector('#watch7-sidebar-contents')
                    ) &&
                    !document.getElementById('improvedtube-collapsed-related-videos')
                ) {
                    clearInterval(ImprovedTube.related_videos_wait);

                    ImprovedTube.related_videos_wait = false;

                    var button = document.createElement('button'),
                        parent = document.querySelector('#related.ytd-watch-flexy') || document.querySelector('#watch7-sidebar-contents'),
                        reference = document.querySelector('#related > *') || document.querySelector('#watch7-sidebar-contents > *');

                    button.id = 'improvedtube-collapsed-related-videos';
                    button.className = 'yt-uix-button yt-uix-button-size-default yt-uix-button-default comment-section-renderer-paginator yt-uix-sessionlink';
                    button.innerHTML = '<span class=yt-uix-button-content><span class=show-more-text>Show more</span><span class=show-less-text>Show less</span></span>';

                    button.onclick = function() {
                        document.documentElement.classList.toggle('related-videos-collapsed');
                    };

                    document.documentElement.classList.toggle('related-videos-collapsed');
                    parent.insertBefore(button, reference);
                }
            }, 250);
        } else if (document.getElementById('improvedtube-collapsed-related-videos')) {
            document.getElementById('improvedtube-collapsed-related-videos').remove();
        }
    }
};