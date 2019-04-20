/*--------------------------------------------------------------
>>> MODIFICATIONS:
----------------------------------------------------------------
1.0 
--------------------------------------------------------------*/

/*--------------------------------------------------------------
1.0 changeArgs
--------------------------------------------------------------*/

function changeArgs(args) {
    if (args && !document.documentElement.hasAttribute("embed")) {
        if (!video_autoplay()) {
            args.autoplay = '0';
            args.suppress_autoplay_on_watch = true;
            args.fflags = args.fflags.replace(/html5_new_autoplay_redux=true/g, 'html5_new_autoplay_redux=false');
            args.fflags = args.fflags.replace(/allow_live_autoplay=true/g, 'allow_live_autoplay=false');
            args.fflags = args.fflags.replace(/mweb_muted_autoplay=true/g, 'mweb_muted_autoplay=false');
            args.fflags = args.fflags.replace(/web_player_kaios_autoplay=true/g, 'web_player_kaios_autoplay=false');
            args.fflags = args.fflags.replace(/autoplay_time=8000/g, 'autoplay_time=0');
            args.fflags = args.fflags.replace(/legacy_autoplay_flag=true/g, 'legacy_autoplay_flag=false');
            gfcyrd657gyuv = args;
        }

        if (args.adaptive_fmts && settings.allow_60fps == 'false') {
            let key_type = args.adaptive_fmts.indexOf(',') > -1 ? ',' : '%2C',
                list = args.adaptive_fmts.split(key_type);

            for (let i = 0; i < list.length; i++) {
                let fps = list[i].split(/fps(?:=|%3D)([0-9]{2})/);

                fps = fps && fps[1];

                if (fps > 30)
                    list.splice(i--, 1);
            }

            args.adaptive_fmts = list.join(key_type);
        }

        if (settings.hd_thumbnail == 'true') {
            if (args.eventid && args.thumbnail_url) {

                args.iurlmaxres = args.thumbnail_url.replace(/\/[^\/]+$/, '/maxresdefault.jpg');

                let thumbnail_image = new Image();

                thumbnail_image.addEventListener('load', this.HDThumbnail.bind(this, args.iurlmaxres), false);

                thumbnail_image.src = args.iurlmaxres;
                thumbnail_image = null;

            }
        }

        if (settings.allow_loudness == 'false') {
            args.loudness = null;
            args.relative_loudness = null;

            delete args.loudness;
            delete args.relative_loudness;
        }

        if (settings.allow_subtitles == 'false') {
            try {
                window.localStorage.setItem('yt-html5-player-modules::subtitlesModuleData::module-enabled', 'false');
            } catch (ignore) {}

            if (args.caption_audio_tracks) {
                args.caption_audio_tracks = args.caption_audio_tracks.split(/&d=[0-9]|d=[0-9]&/).join("");
            }
        }

        if (settings.subscribed_channel_player_ads == 'true' ? args.subscribed != 1 : settings.allow_video_ads == 'false') {
            delete args.ad3_module;

            if (args.player_response) {
                let player_response = JSON.parse(args.player_response);
                if (player_response && player_response.adPlacements) {
                    delete player_response.adPlacements;
                    args.player_response = JSON.stringify(player_response);
                }
            }
        }

        if (settings.hasOwnProperty('video_quality') && settings.video_quality != 'auto') {
            args.markedForQuality = true;
            video_quality();
        }

        return args;
    } else
        return args;
}


/*--------------------------------------------------------------
2.0 Modified JSON.parse
--------------------------------------------------------------*/

function JSONparse(original) {
    return function(text, reviver, bypass) {
        var temp = original.apply(this, arguments);

        if (!bypass && temp && temp.player && temp.player.args)
            temp.player.args = changeArgs(temp.player.args);

        return temp;
    };
}


/*--------------------------------------------------------------
3.0 playerVars
--------------------------------------------------------------*/

function playerVars(original) {
    var context = this;

    return function(args) {
        var temp;

        args = changeArgs(args);

        temp = original.apply(this, arguments);

        return temp;
    };
}


/*--------------------------------------------------------------
4.0 ytPlayerApplicationCreateMod
--------------------------------------------------------------*/

function ytPlayerApplicationCreateMod(original) {
    return function(api_name, config) {
        config.args = changeArgs(config.args);

        return original.apply(this, arguments);
    };
}


/*--------------------------------------------------------------
5.0 parseFromStringMod
--------------------------------------------------------------*/

function parseFromStringMod(original) {
    return function() {
        if (settings.allow_60fps == 'false' && !document.documentElement.hasAttribute("embed")) {
            var result = original.apply(this, arguments),
                streams = result.getElementsByTagName('Representation'),
                i = streams.length;

            while (i--) {
                var fps = streams[i].getAttribute('frameRate');

                if (fps > 30)
                    streams[i].remove();
            }

            return result;
        }

        return original.apply(this, arguments);
    };
}


/*--------------------------------------------------------------
6.0 objectDefineProperties
--------------------------------------------------------------*/

function objectDefineProperties() {
    if (document.documentElement.hasAttribute("embed"))
        return false;

    Object.defineProperties(Object.prototype, {
        cueVideoByPlayerVars: {
            set: function(data) {
                this._cueVideoByPlayerVars = data;
            },
            get: function() {
                return this._cueVideoByPlayerVars;
            }
        },
        loadVideoByPlayerVars: {
            set: function(data) {
                this._loadVideoByPlayerVars = data;
            },
            get: function() {
                if (!video_autoplay() && !(/\/(user|channel)\//.test(location.href))) {
                    console.log('cue');
                    return this.cueVideoByPlayerVars;
                }

                return playerVars(this._loadVideoByPlayerVars);
            }
        },
        playVideo: {
            set: function(data) {
                this._playVideo = data;
            },
            get: function() {
                return this._playVideo;
            }
        },
        experiments: {
            set: function(data) {
                this._experiments = data;
            },
            get: function experimentsGetter() {
                var keys = Object.keys(this);

                if (!video_autoplay())
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

                return this._experiments;
            }
        }
    });
}


/*--------------------------------------------------------------
7.0 HD video thumbnails
--------------------------------------------------------------*/

function HDThumbnail(thumbnail_url, event) {
    if (document.documentElement.hasAttribute('embed'))
        return false;

    var style_element = document.getElementById('style-thumbnail'),
        thumbnail_container = document.querySelector('.ytp-cued-thumbnail-overlay-image');

    if (event.target.width < 121 && thumbnail_container) {
        if (!style_element) {
            style_element = document.createElement('style');
            style_element.id = 'style-thumbnail';

            thumbnail_container.parentNode.insertBefore(style_element, thumbnail_container);
        }

        style_element.textContent = '.ytp-cued-thumbnail-overlay-image {background-image:url("' + thumbnail_url.replace('maxresdefault', 'mqdefault') + '") !important;}';

    } else if (style_element)
        style_element.textContent = '';
}