/*-----------------------------------------------------------------------------
>>> THEMES
-------------------------------------------------------------------------------
1.0 Bluelight
2.0 Dim
3.0 Themes
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Bluelight
-----------------------------------------------------------------------------*/

ImprovedTube.bluelight = function() {
    var value = this.storage.bluelight,
        times = {
            from: Number((this.storage.schedule_time_from || '00:00').substr(0, 2)),
            to: Number((this.storage.schedule_time_to || '00:00').substr(0, 2))
        },
        current_time = new Date().getHours();

    if (times.to < times.from && current_time > times.from && current_time < 24) {
        times.to += 24;
    } else if (times.to < times.from && current_time < times.to) {
        times.from = 0;
    }

    if (
        this.isset(value) && value !== 0 && value !== '0' &&
        (this.storage.schedule !== 'sunset_to_sunrise' || current_time >= times.from && current_time < times.to)
    ) {
        if (!document.querySelector('#it-bluelight')) {
            var container = document.createElement('div');

            container.id = 'it-bluelight';
            container.innerHTML = '<svg version=1.1 viewBox="0 0 1 1"><filter id=it-bluelight-filter><feColorMatrix type=matrix values="1 0 0 0 0 0 1 0 0 0 0 0 ' + (1 - parseFloat(value) / 100) + ' 0 0 0 0 0 1 0"></feColorMatrix></filter></svg>';

            document.documentElement.appendChild(container);
        } else {
            document.querySelector('#it-bluelight-filter feColorMatrix').setAttribute('values', '1 0 0 0 0 0 1 0 0 0 0 0 ' + (1 - parseFloat(value) / 100) + ' 0 0 0 0 0 1 0');
        }
    } else if (document.querySelector('#it-bluelight')) {
        document.querySelector('#it-bluelight').remove();
    }
};


/*-----------------------------------------------------------------------------
2.0 Dim
-----------------------------------------------------------------------------*/

ImprovedTube.dim = function() {
    var value = this.storage.dim,
        times = {
            from: Number((this.storage.schedule_time_from || '00:00').substr(0, 2)),
            to: Number((this.storage.schedule_time_to || '00:00').substr(0, 2))
        },
        current_time = new Date().getHours();

    if (times.to < times.from && current_time > times.from && current_time < 24) {
        times.to += 24;
    } else if (times.to < times.from && current_time < times.to) {
        times.from = 0;
    };

    if (
        this.isset(value) && value !== 0 && value !== '0' &&
        (this.storage.schedule !== 'sunset_to_sunrise' || current_time >= times.from && current_time < times.to)
    ) {
        if (!document.querySelector('#it-dim')) {
            var container = document.createElement('div');

            container.id = 'it-dim';
            container.style.opacity = parseInt(Number(value)) / 100 || 0;

            document.documentElement.appendChild(container);
        } else {
            document.querySelector('#it-dim').style.opacity = parseInt(Number(value)) / 100 || 0;
        }

        if (!document.querySelector('#it-dim-player')) {
            var container = document.createElement('div');

            container.id = 'it-dim-player';
            container.style.opacity = parseInt(Number(value)) / 100 || 0;

            if (document.querySelector('.html5-video-player')) {
                document.querySelector('.html5-video-player').appendChild(container);
            }
        } else {
            document.querySelector('#it-dim-player').style.opacity = parseInt(Number(value)) / 100 || 0;
        }
    } else {
        if (document.querySelector('#it-dim')) {
            document.querySelector('#it-dim').remove();
        }

        if (document.querySelector('#it-dim-player')) {
            document.querySelector('#it-dim-player').remove();
        }
    }
};


/*-----------------------------------------------------------------------------
3.0 Themes
-----------------------------------------------------------------------------*/

ImprovedTube.theme = function() {
    var times = {
            from: Number((this.storage.schedule_time_from || '00:00').substr(0, 2)),
            to: Number((this.storage.schedule_time_to || '00:00').substr(0, 2))
        },
        current_time = new Date().getHours();

    if (times.to < times.from && current_time > times.from && current_time < 24) {
        times.to += 24;
    } else if (times.to < times.from && current_time < times.to) {
        times.from = 0;
    }

    /*if (
        this.isset(ImprovedTube.storage.default_dark_theme) && ImprovedTube.storage.default_dark_theme !== false &&
        document.documentElement.getAttribute('it-youtube-version') !== 'old'
    ) {
        if (
            document.querySelector('ytd-app') &&
            typeof document.querySelector('ytd-app').toggleDarkThemeAttribute_ === 'function' &&
            document.querySelector('ytd-app').isAppDarkTheme_() === false
        ) {
            document.querySelector('ytd-app').toggleDarkThemeAttribute_(true);
        }
    } else {
        if (
            document.querySelector('ytd-app') &&
            typeof document.querySelector('ytd-app').toggleDarkThemeAttribute_ === 'function' &&
            document.querySelector('ytd-app').isAppDarkTheme_() === true
        ) {
            document.querySelector('ytd-app').toggleDarkThemeAttribute_(true);
        }
    }*/

    if (
        (this.storage.schedule !== 'sunset_to_sunrise' || current_time >= times.from && current_time < times.to) &&
        this.isset(ImprovedTube.storage.default_dark_theme) && ImprovedTube.storage.default_dark_theme !== false &&
        document.documentElement.getAttribute('it-youtube-version') !== 'old'
    ) {
        var PREF_OLD = this.getParams(this.getCookieValueByName('PREF')),
            PREF = this.getParams(this.getCookieValueByName('PREF')),
            result = '';

        if (!this.isset(PREF.f6) || this.isset(PREF.f6) && PREF.f6.length !== 3) {
            PREF.f6 = '400';
        } else if (PREF.f6.length === 3) {
            PREF.f6 = '4' + PREF.f6.substr(1);
        }

        for (var i in PREF) {
            result += i + '=' + PREF[i] + '&';
        }

        this.setCookie('PREF', result.slice(0, -1));

        setTimeout(function() {
            if (
                document.querySelector('ytd-app') &&
                typeof document.querySelector('ytd-app').toggleDarkThemeAttribute_ === 'function' &&
                document.querySelector('ytd-app').isAppDarkTheme_() === false
            ) {
                document.querySelector('ytd-app').toggleDarkThemeAttribute_(true);
            }
        }, 250);

        return false;
    }

    if (ImprovedTube.storage.default_dark_theme === false) {
        var PREF_OLD = this.getParams(this.getCookieValueByName('PREF')),
            PREF = this.getParams(this.getCookieValueByName('PREF')),
            result = '';

        if (!this.isset(PREF.f6) || this.isset(PREF.f6) && PREF.f6.length !== 3) {
            PREF.f6 = '800';
        } else if (PREF.f6.length === 3) {
            PREF.f6 = '8' + PREF.f6.substr(1);
        }

        for (var i in PREF) {
            result += i + '=' + PREF[i] + '&';
        }

        this.setCookie('PREF', result.slice(0, -1));
    }

    if (
        (this.storage.schedule !== 'sunset_to_sunrise' || current_time >= times.from && current_time < times.to) &&
        (this.isset(ImprovedTube.storage.default_dark_theme) && ImprovedTube.storage.default_dark_theme !== false ||
            this.isset(ImprovedTube.storage.night_theme) && ImprovedTube.storage.night_theme !== false ||
            this.isset(ImprovedTube.storage.dawn_theme) && ImprovedTube.storage.dawn_theme !== false ||
            this.isset(ImprovedTube.storage.sunset_theme) && ImprovedTube.storage.sunset_theme !== false ||
            this.isset(ImprovedTube.storage.desert_theme) && ImprovedTube.storage.desert_theme !== false ||
            this.isset(ImprovedTube.storage.plain_theme) && ImprovedTube.storage.plain_theme !== false ||
            this.isset(ImprovedTube.storage.black_theme) && ImprovedTube.storage.black_theme !== false)
    ) {
        document.documentElement.setAttribute('dark', '');

        if (ImprovedTube.storage.default_dark_theme === true) {
            var wait = setInterval(function() {
                if (document.body) {
                    clearInterval(wait);

                    document.body.setAttribute('dark', '');
                }
            });
        } else {
            var wait = setInterval(function() {
                if (document.body) {
                    clearInterval(wait);

                    document.body.removeAttribute('dark', '');
                }
            });
        }

        document.documentElement.setAttribute('it-theme', 'true');
    } else {
        document.documentElement.removeAttribute('it-theme', );
    }
};