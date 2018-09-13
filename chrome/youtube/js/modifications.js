/*--------------------------------------------------------------
>>> MODIFICATIONS:
----------------------------------------------------------------
1.0 changeArgs
2.0 "JSON.parse()" modification
3.0 playerVars
4.0 "window.yt.player.Application.create()" modification
5.0 "DOMParser.prototype.parseFromString()" modification
6.0 YouTube player functions
  6.1 "cueVideoByPlayerVars()" modification
  6.2 "loadVideoByPlayerVars()" modification
  6.3 "playVideo()" modification
  6.4 "experiments()" modification
7.0 HD video thumbnails (changeArgs)
--------------------------------------------------------------*/

/*--------------------------------------------------------------
1.0 changeArgs
--------------------------------------------------------------*/

function changeArgs(args) {
  if (args) {
    if (!video_autoplay()) {
      args.autoplay = '0';
      args.suppress_autoplay_on_watch = true;
      args.fflags = args.fflags.replace(/html5_new_autoplay_redux=true/g, 'html5_new_autoplay_redux=false');
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
  }
}


/*--------------------------------------------------------------
2.0 JSONparse
--------------------------------------------------------------*/

function JSONparse(original) {
  return function(text, reviver, bypass) {
    var temp = original.apply(this, arguments);

    if (!bypass && temp && temp.player && temp.player.args) {
      temp.player.args = changeArgs(temp.player.args);
    }

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
  let ctx = this;

  return function(api_name, config) {
    config.args = changeArgs(config.args);

    let temp = original.apply(this, arguments);

    return temp;
  };
}


/*--------------------------------------------------------------
5.0 parseFromStringMod
--------------------------------------------------------------*/

function parseFromStringMod(original) {
  return function() {
    if (settings.allow_60fps == 'false') {
      let result = original.apply(this, arguments),
        streams = result.getElementsByTagName('Representation'),
        i = streams.length;

      while (i--) {
        let fps = streams[i].getAttribute('frameRate');

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
        if (!video_autoplay())
          return this.cueVideoByPlayerVars;

        return playerVars(this._loadVideoByPlayerVars);
      }
    },
    playVideo: {
      set: function(data) {
        this._playVideo = data;
      },
      get: function() {

        if (!video_autoplay())
          return function() {};

        return this._playVideo;
      }
    },
    experiments: {
      set: function(data) {
        this._experiments = data;
      },
      get: function experimentsGetter() {
        let keys = Object.keys(this);

        if (!video_autoplay())
          for (let i = 0; i < keys.length; i++) {
            if (this[keys[i]] && this[keys[i]].eventid) {

              let function_string = experimentsGetter['caller'].toString(),
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
  let style_element,
    thumbnail_container;

  if (event.target.width < 121 && (thumbnail_container = document.querySelector('.ytp-cued-thumbnail-overlay-image'))) {
    if (!(style_element = document.getElementById('style-thumbnail'))) {

      style_element = document.createElement('style');
      style_element.id = 'style-thumbnail';

      thumbnail_container.parentNode.insertBefore(style_element, thumbnail_container);
    }

    style_element.textContent = '.ytp-cued-thumbnail-overlay-image {background-image:url("' + thumbnail_url.replace('maxresdefault', 'mqdefault') + '") !important;}';

  } else if ((style_element = document.getElementById('style-thumbnail')))
    style_element.textContent = '';
}
