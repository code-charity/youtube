/*-----------------------------------------------------------------------------
>>> MUTATIONS
-------------------------------------------------------------------------------
1.0 Mutations
    1.1 JSON.parse
    1.2 HTMLMediaElement.play
3.0 Player vars
4.0 ytPlayerApplicationCreateMod
5.0 objectDefineProperties
-----------------------------------------------------------------------------*/

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
    /*HTMLMediaElement.prototype.play = (function(original) {
        return function() {
            var self = this;

            if (
                ImprovedTube.autoplay() === false &&
                ImprovedTube.allow_autoplay === false
            ) {
                setTimeout(function() {
                    self.parentNode.parentNode.stopVideo();
                });

                return;
            } else if (self.paused === true && self.parentNode.parentNode.getCurrentTime() < 1 || ImprovedTube.videoUrl !== location.href) {
                ImprovedTube.playerUpdate(self.parentNode.parentNode, true);
            }

            return original.apply(this, arguments);
        }
    })(HTMLMediaElement.prototype.play);*/
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

        // LOUDNESS NORMALIZATION
        if (ImprovedTube.storage.player_loudness_normalization === false) {
            delete args.loudness;
            delete args.relative_loudness;
        }

        // SUBTITLES
        if (ImprovedTube.storage.player_subtitles === false && args.caption_audio_tracks) {
            args.caption_audio_tracks = args.caption_audio_tracks.split(/&d=[0-9]|d=[0-9]&/).join('');
        }

        // AUTOPLAY
        if (!ImprovedTube.autoplay()) {
            args.autoplay = '0';
            args.suppress_autoplay_on_watch = true;
            args.fflags = args.fflags.replace(/html5_new_autoplay_redux=true/g, 'html5_new_autoplay_redux=false');
            args.fflags = args.fflags.replace(/allow_live_autoplay=true/g, 'allow_live_autoplay=false');
            args.fflags = args.fflags.replace(/mweb_muted_autoplay=true/g, 'mweb_muted_autoplay=false');
            args.fflags = args.fflags.replace(/web_player_kaios_autoplay=true/g, 'web_player_kaios_autoplay=false');
            args.fflags = args.fflags.replace(/autoplay_time=8000/g, 'autoplay_time=0');
            args.fflags = args.fflags.replace(/legacy_autoplay_flag=true/g, 'legacy_autoplay_flag=false');
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


/*-----------------------------------------------------------------------------
5.0 objectDefineProperties
-----------------------------------------------------------------------------*/

ImprovedTube.objectDefineProperties = function() {
    if (document.documentElement.hasAttribute('embed')) {
        return false;
    }

    Object.defineProperties(Object.prototype, {
        cueVideoByPlayerVars: {
            get: function() {
                return this._cueVideoByPlayerVars;
            },
            set: function(data) {
                this._cueVideoByPlayerVars = data;
            }
        },
        /*loadVideoByPlayerVars: {
            get: function() {
                if (!ImprovedTube.autoplay() && !(/\/(user|channel)\//.test(location.href))) {
                    return this.cueVideoByPlayerVars;
                }

                return ImprovedTube.playerVars(this._loadVideoByPlayerVars);
            },
            set: function(data) {
                this._loadVideoByPlayerVars = data;
            }
        },*/
        playVideo: {
            get: function() {
                return this._playVideo;
            },
            set: function(data) {
                this._playVideo = data;
            }
        },
        experiments: {
            set: function(data) {
                this._experiments = data;
            },
            get: function experimentsGetter() {
                var keys = Object.keys(this);

                if (!ImprovedTube.autoplay()) {
                    for (var i = 0, l = keys.length; i < l; i++) {
                        if (this[keys[i]] && this[keys[i]].eventid) {

                            var function_string = experimentsGetter['caller'].toString(),
                                matching = function_string.match(/this\.([a-z0-9$_]{1,3})=[^;]+\.autoplay/i);

                            if (matching && matching[1]) {
                                this[matching[1]] = false;
                            }

                            break;
                        }
                    }
                }

                return this._experiments;
            }
        }
    });
};