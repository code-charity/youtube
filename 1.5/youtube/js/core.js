/*-----------------------------------------------------------------------------
>>> CORE
-------------------------------------------------------------------------------
1.0 Page update
2.0 Player update
3.0 Init
-----------------------------------------------------------------------------*/

var ImprovedTube = {
    allow_autoplay: false
};


/*-----------------------------------------------------------------------------
1.0 Page update
-----------------------------------------------------------------------------*/

ImprovedTube.pageUpdate = function() {
    this.allow_autoplay = false;
    
    this.pageType();
    this.youtube_home_page();
    this.hd_thumbnails();
    this.channel_default_tab();
    this.comments();
    this.livechat();
    this.related_videos();
    this.improvedtube_youtube_icon();

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
2.0 Player update
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
};


/*-----------------------------------------------------------------------------
3.0 Init
-----------------------------------------------------------------------------*/

ImprovedTube.init = function() {
    this.JSONparse();
    this.objectDefineProperties();
    this.shortcuts();
    this.player_h264();
    this.theme();
    this.bluelight();
    this.dim();
    this.pageType();
    this.improvedtube_youtube_icon();
    this.add_scroll_to_top();
    this.player_autopause();
    this.mini_player();
    this.forced_theater_mode();
    this.comments();
    this.livechat();
    this.related_videos();

    HTMLMediaElement.prototype.play = (function(original) {
        return function() {
            var self = this;

            if (ImprovedTube.autoplay() === false && ImprovedTube.allow_autoplay === false) {
                setTimeout(function() {
                    self.pause();
                });
            }

            return original.apply(this, arguments);
        }
    })(HTMLMediaElement.prototype.play);

    window.addEventListener('keydown', function() {
        ImprovedTube.allow_autoplay = true;
    }, true);

    window.addEventListener('mousedown', function() {
        ImprovedTube.allow_autoplay = true;
    }, true);

    window.addEventListener('DOMContentLoaded', function() {
        ImprovedTube.pageUpdate();
    });

    window.addEventListener('yt-page-data-updated', function() {

    });

    window.addEventListener('yt-visibility-refresh', function() {
        ImprovedTube.pageUpdate();
    });

    window.addEventListener('spf-done', function() {
        ImprovedTube.pageUpdate();
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