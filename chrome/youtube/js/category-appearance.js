/*--------------------------------------------------------------
>>> APPEARANCE:
----------------------------------------------------------------
1.0 Header
  1.1 Improve YouTube logo
2.0 Player
  2.1 Annotations
  2.2 Cards
  2.3 Player size
    2.3.1 Fit window
  2.4 Player color
  2.5 Endscreen
  2.6 Transparent background
  2.7 Forced theater mode
3.0 Video info
  3.1 Views count
  3.2 Likes
  3.3 How long ago the video was uploaded
  3.4 Channel videos count
4.0 Description
5.0 Sidebar
  5.1 Livechat
  5.2 Playlist
  5.3 Related videos
6.0 Comments
7.0 Footer
--------------------------------------------------------------*/


/*--------------------------------------------------------------
1.0 Header
--------------------------------------------------------------*/

function header() {
  document.documentElement.setAttribute('header', settings.header);
}

function improve_youtube_logo() {
    document.documentElement.setAttribute('improve-youtube-logo', settings.improve_youtube_logo);
}


/*--------------------------------------------------------------
2.0 Player
--------------------------------------------------------------*/

function annotations() {
  document.documentElement.setAttribute('player-annotations', settings.annotations);
}

function cards() {
  document.documentElement.setAttribute('player-cards', settings.cards);
}

function player_size() {
  document.documentElement.setAttribute('improvedtube-player-size', settings.player_size);
}

function fit_window(resize) {
  if (!document.documentElement.hasAttribute('embed') && document.querySelector('#movie_player video') && document.documentElement.getAttribute('youtube-version') == 'old' && settings.player_size == 'fit_window') {
    var video = document.querySelector('#movie_player video'),
      header = document.documentElement.getAttribute('header'),
      header_height = header == 'hidden' || header == 'hidden_on_video_page' || header == 'hover' || header == 'hover_on_video_page' ? 0 : 50,
      videoW = video.videoWidth / 100,
      videoH = video.videoHeight / 100,
      windowW = window.innerWidth / 100,
      windowH = window.innerHeight / 100,
      videoWdif = ((video.videoWidth - window.innerWidth) / video.videoWidth * -100) + 100,
      videoHdif = ((video.videoHeight - window.innerHeight + header_height) / video.videoHeight * -100) + 100;

    if (videoH * videoWdif > window.innerHeight - header_height) {
      video.style.setProperty('max-width', videoW * videoHdif + 'px');
      video.style.setProperty('max-height', videoH * videoHdif + 'px');
    } else {
      video.style.setProperty('max-width', videoW * videoWdif + 'px');
      video.style.setProperty('max-height', videoH * videoWdif + 'px');
    }

    if (!resize)
      window.dispatchEvent(new Event('resize'));
  }
}

function player_color() {
  document.documentElement.setAttribute('player-color', settings.player_color);
}

function endscreen() {
  document.documentElement.setAttribute('player-endscreen', settings.endscreen);
}

function scroll_for_details() {
  document.documentElement.setAttribute('scroll-for-details', settings.scroll_for_details);
}

function transparent_background() {
  document.documentElement.setAttribute('transparent-player-background', settings.transparent_background);
}

function forced_theater_mode() {
  if (
    settings.forced_theater_mode == 'true' ||
    settings.player_size == 'fit_window'
  ) {
    setCookie('wide', '1');

    if (!document.querySelector('.watch-stage-mode') && !document.querySelector('ytd-watch-flexy[theater]') && document.querySelector('.html5-video-player .ytp-size-button.ytp-button'))
      document.querySelector('.html5-video-player .ytp-size-button.ytp-button').click();
  }
}



/*--------------------------------------------------------------
3.0 Video info
--------------------------------------------------------------*/

function views_count() {
  document.documentElement.setAttribute('views-count', settings.views_count);
}

function likes() {
  document.documentElement.setAttribute('likes', settings.likes);
}

function how_long_ago_the_video_was_uploaded() {
  if (settings.how_long_ago_the_video_was_uploaded == 'true') {
    function timeSince(date) {
      let seconds = Math.floor((new Date() - new Date(date)) / 1000),
        interval = Math.floor(seconds / 31536000);

      if (interval > 1) {
        return interval + " years ago";
      }
      interval = Math.floor(seconds / 2592000);
      if (interval > 1) {
        return interval + " months ago";
      }
      interval = Math.floor(seconds / 86400);
      if (interval > 1) {
        return interval + " days ago";
      }
      interval = Math.floor(seconds / 3600);
      if (interval > 1) {
        return interval + " hours ago";
      }
      interval = Math.floor(seconds / 60);
      if (interval > 1) {
        return interval + " minutes ago";
      }
    }

    var waiting_channel_link = setInterval(function() {
      let youtube_version = document.documentElement.getAttribute('youtube-version') == 'new';

      if (document.querySelector(youtube_version ? '#meta-contents ytd-video-owner-renderer #owner-container a' : '.yt-user-info a')) {
        clearInterval(waiting_channel_link);

        setTimeout(function() {
          let youtube_version = document.documentElement.getAttribute('youtube-version') == 'new',
            xhr = new XMLHttpRequest();

          xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
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
}

function channel_videos_count() {
  if (document.querySelector('.itx-channel-videos-count')) {
    document.querySelector('.itx-channel-videos-count').remove();
  }

  if (settings.channel_videos_count == 'true') {
    var waiting_channel_link = setInterval(function () {
      let youtube_version = document.documentElement.getAttribute('youtube-version') == 'new';

      if (document.querySelector(youtube_version ? '#meta-contents ytd-video-owner-renderer #owner-container a' : '.yt-user-info a')) {
        clearInterval(waiting_channel_link);

        setTimeout(function () {
          let youtube_version = document.documentElement.getAttribute('youtube-version') == 'new',
              xhr = new XMLHttpRequest();

          xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
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
}


/*--------------------------------------------------------------
4.0 Description
--------------------------------------------------------------*/

function description() {
  document.documentElement.setAttribute('description', settings.description);
}

function description_expanded() {
  clearInterval(globalDescriptionWait);

  globalDescriptionWait = setInterval(function() {
    if (
      document.querySelector('ytd-expander.ytd-video-secondary-info-renderer') ||
      document.querySelector('#action-panel-details')
    ) {
      clearInterval(globalDescriptionWait);
      const data = settings.description;

      if (data == 'expanded') {
        if (document.documentElement.getAttribute('youtube-version') == 'new')
          document.querySelector('ytd-expander.ytd-video-secondary-info-renderer').removeAttribute('collapsed');
        else
          document.querySelector('#action-panel-details').classList.remove('yt-uix-expander-collapsed');
      }
    }
  });
}


/*--------------------------------------------------------------
5.0 Sidebar
--------------------------------------------------------------*/

function livechat() {
  document.documentElement.setAttribute('livechat', settings.livechat);
}

function livechat_collapsed() {
  clearInterval(globalLivechatWait);

  globalLivechatWait = setInterval(function() {
    if (
      document.querySelector('ytd-live-chat-frame') ||
      document.querySelector('#watch-sidebar-live-chat .yt-uix-expander')
    ) {
      clearInterval(globalLivechatWait);
      const data = settings.livechat;

      if (data == 'collapsed') {
        if (document.documentElement.getAttribute('youtube-version') == 'new') {
          document.querySelector('ytd-live-chat-frame').setAttribute('collapsed', '');
          setTimeout(function() {
            document.querySelector('ytd-live-chat-frame #show-hide-button paper-button').click();
          }, 50);
        } else {
          document.querySelector('#watch-sidebar-live-chat .yt-uix-expander').classList.add('yt-uix-expander-collapsed');
        }
      }
    }
  });
}

function playlist() {
  document.documentElement.setAttribute('improvedtube-playlist', settings.playlist);
}

function related_videos() {
  document.documentElement.setAttribute('related-videos', settings.related_videos);
}

function related_videos_collapsed() {
  clearInterval(globalRelatedVideosWait);

  globalRelatedVideosWait = setInterval(function() {
    if (
      (document.querySelector('#related.ytd-watch-flexy')) ||
      (document.querySelector('#watch7-sidebar-contents'))
    ) {
      clearInterval(globalRelatedVideosWait);
      const data = settings.related_videos;

      if (data == 'collapsed') {
        var button = document.createElement('div');

        document.documentElement.setAttribute('related-videos-collapsed', 'true');

        if (document.getElementById('improvedtube-related-videos-collapsed'))
          document.getElementById('improvedtube-related-videos-collapsed').remove();

        button.id = 'improvedtube-related-videos-collapsed';
        button.innerText = 'SHOW MORE';

        button.addEventListener('click', function() {
          if (document.documentElement.getAttribute('related-videos-collapsed') == 'true') {
            document.documentElement.setAttribute('related-videos-collapsed', 'false');
            button.innerText = 'SHOW LESS';
          } else {
            document.documentElement.setAttribute('related-videos-collapsed', 'true');
            button.innerText = 'SHOW MORE';
          }
        });

        if (document.documentElement.getAttribute('youtube-version') == 'new') {
          document.querySelector('#related.ytd-watch-flexy').insertBefore(button, document.querySelector('#related > *'));
        } else {
          document.querySelector('#watch7-sidebar-contents').insertBefore(button, document.querySelector('#watch7-sidebar-contents > *'));
        }
      } else if (document.getElementById('improvedtube-related-videos-collapsed')) {
        document.documentElement.removeAttribute('related-videos-collapsed');
        document.getElementById('improvedtube-related-videos-collapsed').remove();
      }
    }
  });
}


/*--------------------------------------------------------------
6.0 Comments
--------------------------------------------------------------*/

function comments() {
  document.documentElement.setAttribute('comments', settings.comments);
}

function comments_collapsed() {
  clearInterval(globalCommentsWait);

  globalCommentsWait = setInterval(function() {
    if (
      (document.querySelector('#comments #header') && document.querySelector('#comments #header').innerHTML != '' && document.querySelector('#comments #contents ytd-comment-thread-renderer')) ||
      (document.querySelector('#watch-discussion .comments-header-renderer'))
    ) {
      clearInterval(globalCommentsWait);
      const data = settings.comments;

      if (data == 'collapsed') {
        var button = document.createElement('div');

        document.documentElement.setAttribute('comments-collapsed', 'true');

        if (document.getElementById('improvedtube-comments-collapsed'))
          document.getElementById('improvedtube-comments-collapsed').remove();

        button.id = 'improvedtube-comments-collapsed';
        button.innerText = 'SHOW MORE';

        button.addEventListener('click', function() {
          if (document.documentElement.getAttribute('comments-collapsed') == 'true') {
            document.documentElement.setAttribute('comments-collapsed', 'false');
            button.innerText = 'SHOW LESS';
          } else {
            document.documentElement.setAttribute('comments-collapsed', 'true');
            button.innerText = 'SHOW MORE';
          }
        });

        if (document.documentElement.getAttribute('youtube-version') == 'new') {
          document.querySelector('#comments #header').appendChild(button);
        } else {
          document.querySelector('#watch-discussion .comments-header-renderer').appendChild(button);
        }
      } else if (document.getElementById('improvedtube-comments-collapsed')) {
        document.documentElement.removeAttribute('comments-collapsed');
        document.getElementById('improvedtube-comments-collapsed').remove();
      }
    }
  });
}


/*--------------------------------------------------------------
7.0 Footer
--------------------------------------------------------------*/

function footer() {
  document.documentElement.setAttribute('footer', settings.footer);
}
