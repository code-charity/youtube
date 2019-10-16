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
    var not_connected_players = document.querySelectorAll('.html5-video-player:not([it-player-connected])');

    if (not_connected_players.length > 0) {
        for (var i = 0, l = not_connected_players.length; i < l; i++) {
            var player = not_connected_players[i];

            if (
                player.querySelector('video').src &&
                player.querySelector('video').src !== ''
            ) {
                player.setAttribute('it-player-connected', '');

                ImprovedTube.playerUpdate(player);

                player.querySelector('video').addEventListener('canplay', ImprovedTube.playerUpdate);
                player.querySelector('video').addEventListener('timeupdate', function() {
                    ImprovedTube.playingTime++;

                    var time = Math.floor(ImprovedTube.playingTime * 250 / 1000) / 60;

                    if (time >= 1) {
                        ImprovedTube.playingTime = 0;

                        document.dispatchEvent(new CustomEvent('ImprovedTubeAnalyzer'));
                    }
                });
            }
        }
    }

    ImprovedTube.allow_autoplay = false;

    ImprovedTube.pageType();
    ImprovedTube.youtube_home_page();
    ImprovedTube.hd_thumbnails();
    ImprovedTube.channel_default_tab();
    ImprovedTube.comments();
    ImprovedTube.livechat();
    ImprovedTube.related_videos();
    ImprovedTube.improvedtube_youtube_icon();
    ImprovedTube.blacklist();
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

    if (ImprovedTube.videoUrl !== this.src) {
        ImprovedTube.videoUrl = this.src;
        ImprovedTube.playingTime = 0;
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

    ImprovedTube.playlist_repeat();
    ImprovedTube.playlist_shuffle();

    ImprovedTube.dim();
};


/*-----------------------------------------------------------------------------
3.0 Init
-----------------------------------------------------------------------------*/

ImprovedTube.init = function() {
    this.player_h264();
    this.objectDefineProperties();
    this.shortcuts();
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
    this.mutations();
    this.events();
};