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
    HTMLMediaElement.prototype.play = (function(original) {
        return function() {
            var self = this;

            if (
                ImprovedTube.autoplay() === false &&
                ImprovedTube.allow_autoplay === false
            ) {
                setTimeout(function() {
                    self.pause();
                });
            }

            return original.apply(this, arguments);
        }
    })(HTMLMediaElement.prototype.play);
};


/*-----------------------------------------------------------------------------
1.0 Change args
-----------------------------------------------------------------------------*/

ImprovedTube.changeArgs = function(args) {
    if (ImprovedTube.isset(args)) {
        args = ImprovedTube.player_60fps(args);
        args = ImprovedTube.player_loudness_normalization(args);
        args = ImprovedTube.player_subtitles(args);
        args = ImprovedTube.player_ads(args);
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
        loadVideoByPlayerVars: {
            get: function() {
                return ImprovedTube.playerVars(this._loadVideoByPlayerVars);
            },
            set: function(data) {
                this._loadVideoByPlayerVars = data;
            }
        },
        playVideo: {
            get: function() {
                return this._playVideo;
            },
            set: function(data) {
                this._playVideo = data;
            }
        }
    });
};