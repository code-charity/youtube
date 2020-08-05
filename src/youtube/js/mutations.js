/*-----------------------------------------------------------------------------
>>> MUTATIONS
-------------------------------------------------------------------------------
1.0 Mutations
    1.1 JSON.parse
    1.2 HTMLMediaElement.play
3.0 Player vars
4.0 ytPlayerApplicationCreateMod
-----------------------------------------------------------------------------*/

document.addEventListener('ImprovedTubePlayVideo', function(event) {
    if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage({
            name: 'improvedtube-play',
            id: new URL(location.href).searchParams.get('v')
        });
    }
});

/*-----------------------------------------------------------------------------
1.0 Mutations
-----------------------------------------------------------------------------*/

ImprovedTube.mutations = function() {
    /*-------------------------------------------------------------------------
    1.1 JSON.parse
    -------------------------------------------------------------------------*/
    JSON.parse = (function(original) {
        return function(text, reviver, bypass) {
            var temp = original.apply(this, arguments);

            if (!bypass && temp && temp.player && temp.player.args) {
                temp.player.args = ImprovedTube.changeArgs(temp.player.args);
            }

            return temp;
        };
    }(JSON.parse));

    /*-------------------------------------------------------------------------
    1.2 HTMLMediaElement.play
    -------------------------------------------------------------------------*/
    HTMLMediaElement.prototype.play = (function(original) {
        return function() {
            var self = this;

            if (
                ImprovedTube.autoplay() === false &&
                ImprovedTube.allow_autoplay === false &&
                this.parentNode.parentNode.classList.contains('ad-showing') === false
            ) {
                setTimeout(function() {
                    //console.log('PAUSE');
                    self.parentNode.parentNode.pauseVideo();
                });

                return;
            } else if (self.paused === true && ImprovedTube.videoUrl !== location.href) {
                ImprovedTube.playerUpdate(self.parentNode.parentNode, true);
            }

            ImprovedTube.player_loudness_normalization();

            return original.apply(this, arguments);
        }
    })(HTMLMediaElement.prototype.play);
};


/*-----------------------------------------------------------------------------
1.0 Change args
-----------------------------------------------------------------------------*/

ImprovedTube.changeArgs = function(args) {
    if (ImprovedTube.isset(args)) {
        // Ads
        if (
            ImprovedTube.storage.player_ads === 'block_all' ||
            ImprovedTube.storage.player_ads === 'subscribed_channels' && (args.player_response || '').indexOf('subscribed=1') === -1
        ) {
            delete args.ad3_module;

            if (args.player_response) {
                var player_response = JSON.parse(args.player_response);

                if (player_response && player_response.adPlacements) {
                    delete player_response.adPlacements;
                    delete player_response.playerAds;
                    
                    args.player_response = JSON.stringify(player_response);
                }
            }
        }

        // 60 fps
        if (ImprovedTube.storage.player_60fps === false && args.adaptive_fmts) {
            var key_type = args.adaptive_fmts.indexOf(',') > -1 ? ',' : '%2C',
                list = args.adaptive_fmts.split(key_type);

            for (var i = 0; i < list.length; i++) {
                var fps = list[i].split(/fps(?:=|%3D)([0-9]{2})/);

                fps = fps && fps[1];

                if (fps > 30)
                    list.splice(i--, 1);
            }

            args.adaptive_fmts = list.join(key_type);
        }

        // SUBTITLES
        if (ImprovedTube.storage.player_subtitles === false && args.caption_audio_tracks) {
            args.caption_audio_tracks = args.caption_audio_tracks.split(/&d=[0-9]|d=[0-9]&/).join('');
        }
    }

    return args;
};


/*-----------------------------------------------------------------------------
3.0 Player vars
-----------------------------------------------------------------------------*/

ImprovedTube.playerVars = function(original) {
    var context = this;

    return function(args) {
        var temp;

        args = ImprovedTube.changeArgs(args);

        temp = original.apply(this, arguments);

        return temp;
    };
};


/*-----------------------------------------------------------------------------
4.0 ytPlayerApplicationCreateMod
-----------------------------------------------------------------------------*/

ImprovedTube.ytPlayerApplicationCreateMod = function(original) {
    return function(api_name, config) {
        config.args = ImprovedTube.changeArgs(config.args);

        return original.apply(this, arguments);
    };
};
