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

                player.querySelector('video').addEventListener('canplay', function() {
                    ImprovedTube.videoUrl = location.href;
                });
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

    ImprovedTube.pageType();
    ImprovedTube.youtube_home_page();
    ImprovedTube.hd_thumbnails();
    ImprovedTube.channel_default_tab();
    ImprovedTube.comments();
    ImprovedTube.livechat();
    ImprovedTube.livechat_type();
    ImprovedTube.related_videos();
    ImprovedTube.improvedtube_youtube_icon();
    ImprovedTube.blacklist();
    ImprovedTube.player_hd_thumbnail();
    ImprovedTube.how_long_ago_the_video_was_uploaded();
    ImprovedTube.channel_videos_count();
    ImprovedTube.collapse_of_subscription_sections();
    ImprovedTube.mark_watched_videos();
};


/*-----------------------------------------------------------------------------
2.0 Player update
-----------------------------------------------------------------------------*/

ImprovedTube.playerUpdate = function(node, hard) {
    var player;
    
    console.log(node, hard);

    if (node && node.type !== 'canplay') {
        player = node;
    } else if (this.hasOwnProperty('target')) {
        player = this.target.parentNode.parentNode;
    } else if (this.hasOwnProperty('parentNode')) {
        player = this.parentNode.parentNode;
    } else {
        player = document.querySelector('.html5-video-player');
    }

    if (this.videoUrl !== location.href) {
        this.videoUrl = location.href;
        this.playingTime = 0;
        this.allow_autoplay = false;

        document.dispatchEvent(new CustomEvent('ImprovedTubePlayVideo'));

        this.fitToWindow();
        this.always_show_progress_bar();
        this.playlist_reverse();
        this.player_hd_thumbnail();
        this.player_quality(player);
        this.player_volume(player);
        this.player_playback_speed(player);
        this.up_next_autoplay();
        this.player_autofullscreen();
        this.player_repeat_button();
        this.player_screenshot_button();
        this.player_rotate_button();
        this.player_popup_button();
        this.playlist_up_next_autoplay(player);

        this.playlist_repeat();
        this.playlist_shuffle();

        this.dim();

        var video_id = this.getParam(new URL(location.href).search.substr(1), 'v');

        if (video_id) {
            document.dispatchEvent(new CustomEvent('ImprovedTubeWatched', {
                detail: {
                    action: 'set',
                    id: video_id,
                    title: document.title
                }
            }));
        }
    } else if (hard) {
        this.videoUrl = location.href;
        this.allow_autoplay = true;

        this.fitToWindow();
        this.playlist_reverse();
        this.player_hd_thumbnail();
        this.player_quality(player);
        this.player_volume(player);
        this.player_playback_speed(player);
        this.up_next_autoplay();
        this.player_autofullscreen();
        this.player_repeat_button();
        this.player_screenshot_button();
        this.player_rotate_button();
        this.player_popup_button();

        this.playlist_repeat();
        this.playlist_shuffle();

        this.dim();
    }
};


/*-----------------------------------------------------------------------------
3.0 Init
-----------------------------------------------------------------------------*/

ImprovedTube.init = function() {
    this.player_h264();
    this.player_60fps();
    //this.objectDefineProperties();
    this.confirmation_before_closing();
    this.shortcuts();
    this.themeEditor();
    this.theme();
    this.font();
    this.bluelight();
    this.dim();
    this.pageType();
    this.improvedtube_youtube_icon();
    this.add_scroll_to_top();
    this.player_autopause_when_switching_tabs();
    this.mini_player();
    this.forced_theater_mode();
    this.comments();
    this.livechat();
    this.related_videos();
    this.mutations();
    this.events();
};

function withoutInjection(object) {
    youtubeHomePage__documentStart(object.youtube_home_page);
}
