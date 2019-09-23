/*-----------------------------------------------------------------------------
>>> CORE
-------------------------------------------------------------------------------
1.0 Player update
2.0 Player connect
3.0 Init
-----------------------------------------------------------------------------*/

var ImprovedTube = {};


/*-----------------------------------------------------------------------------
1.0 Player update
-----------------------------------------------------------------------------*/

ImprovedTube.playerUpdate = function(node) {
    var player;

    if (node && node.type !== 'canplay') {
        player = node;
    } else if (this.hasOwnProperty('target')) {
        player = this.target.parentNode.parentNode;
    } else if (this.hasOwnProperty('parentNode')) {
        player = this.parentNode.parentNode;
    } else {
        player = document.querySelector('.html5-video-player');
    }

    ImprovedTube.player_quality(player);
    ImprovedTube.player_volume(player);
    ImprovedTube.player_playback_speed(player);
    ImprovedTube.up_next_autoplay();
    ImprovedTube.player_autofullscreen();
    ImprovedTube.player_repeat_button();
    ImprovedTube.player_screenshot_button();
    ImprovedTube.player_rotate_button();
    ImprovedTube.player_popup_button();
    ImprovedTube.player_autoplay(player);
    ImprovedTube.channel_trailer_autoplay(player);
};


/*-----------------------------------------------------------------------------
2.0 Player connect
-----------------------------------------------------------------------------*/

ImprovedTube.playerConnect = function() {
    if (document.querySelector('.html5-video-player:not([it-player-connected])')) {
        for (var i = 0, l = document.querySelectorAll('.html5-video-player:not([it-player-connected])').length; i < l; i++) {
            var player = document.querySelectorAll('.html5-video-player:not([it-player-connected])')[i];

            if (player.querySelector('video').src && player.querySelector('video').src !== '') {
                player.setAttribute('it-player-connected', '');

                ImprovedTube.playerUpdate(player);
                player.querySelector('video').addEventListener('canplay', ImprovedTube.playerUpdate);
            }
        }
    }
};


/*-----------------------------------------------------------------------------
3.0 Init
-----------------------------------------------------------------------------*/

ImprovedTube.init = function() {
    //this.legacy_youtube();
    this.JSONparse();
    this.objectDefineProperties();
    ImprovedTube.shortcuts();
    this.player_h264();
    this.theme();
    this.bluelight();
    this.dim();
    this.pageType();
    this.add_scroll_to_top();
    this.player_autopause();
    this.mini_player();
    this.forced_theater_mode();
    this.comments();
    this.livechat();
    this.related_videos();

    window.addEventListener('DOMContentLoaded', function() {
        ImprovedTube.youtube_home_page();
        ImprovedTube.hd_thumbnails();
        ImprovedTube.channel_default_tab();
        ImprovedTube.playerConnect();
        ImprovedTube.comments();
        ImprovedTube.livechat();
        ImprovedTube.related_videos();
    });

    window.addEventListener('yt-page-data-updated', function() {
        ImprovedTube.pageType();
        ImprovedTube.youtube_home_page();
        ImprovedTube.hd_thumbnails();
        ImprovedTube.channel_default_tab();
        ImprovedTube.playerConnect();
        ImprovedTube.comments();
        ImprovedTube.livechat();
        ImprovedTube.related_videos();
    });

    window.addEventListener('yt-visibility-refresh', function() {
        ImprovedTube.pageType();
        ImprovedTube.youtube_home_page();
        ImprovedTube.hd_thumbnails();
        ImprovedTube.channel_default_tab();
        ImprovedTube.channel_trailer_autoplay();
        ImprovedTube.playerConnect();
        ImprovedTube.comments();
        ImprovedTube.livechat();
        ImprovedTube.related_videos();
    });

    window.addEventListener('spf-done', function() {
        ImprovedTube.pageType();
        ImprovedTube.youtube_home_page();
        ImprovedTube.hd_thumbnails();
        ImprovedTube.channel_default_tab();
        ImprovedTube.playerConnect();
        ImprovedTube.comments();
        ImprovedTube.livechat();
        ImprovedTube.related_videos();
    });

    document.documentElement.addEventListener('load', function() {
        if (
            window.yt &&
            window.yt.player &&
            window.yt.player.Application &&
            window.yt.player.Application.create
        ) {
            window.yt.player.Application.create = ImprovedTube.ytPlayerApplicationCreateMod(window.yt.player.Application.create);
        }
    }, true);
};