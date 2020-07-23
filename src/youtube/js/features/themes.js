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


ImprovedTube.font = function() {
    if (this.storage.font) {
        if (!document.querySelector('.it-font-family')) {
            var link = document.createElement('link');

            link.rel = 'stylesheet';

            document.documentElement.appendChild(link);
        } else {
            var link = document.querySelector('.it-font-family');
        }

        link.href = '//fonts.googleapis.com/css2?family=' + this.storage.font;

        document.documentElement.style.fontFamily = this.storage.font.replace(/\+/g, ' ');
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

    if (
        (this.storage.schedule !== 'sunset_to_sunrise' || current_time >= times.from && current_time < times.to) &&
        (
            this.isset(ImprovedTube.storage.default_dark_theme) && ImprovedTube.storage.default_dark_theme !== false
            ||
            this.isset(ImprovedTube.storage.night_theme) && ImprovedTube.storage.night_theme !== false
            ||
            this.isset(ImprovedTube.storage.dawn_theme) && ImprovedTube.storage.dawn_theme !== false
            ||
            this.isset(ImprovedTube.storage.sunset_theme) && ImprovedTube.storage.sunset_theme !== false
            ||
            this.isset(ImprovedTube.storage.desert_theme) && ImprovedTube.storage.desert_theme !== false
            ||
            this.isset(ImprovedTube.storage.plain_theme) && ImprovedTube.storage.plain_theme !== false
            ||
            this.isset(ImprovedTube.storage.black_theme) && ImprovedTube.storage.black_theme !== false
        )
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

                    document.body.removeAttribute('dark');
                }
            });
        }
        
        var wait2 = setInterval(function() {
            if (
                document.querySelector('ytd-app') &&
                typeof document.querySelector('ytd-app').toggleDarkThemeAttribute_ === 'function' &&
                document.querySelector('ytd-app').isAppDarkTheme_() === false
            ) {
                clearInterval(wait2);
                    
                document.querySelector('ytd-app').toggleDarkThemeAttribute_(true);
            }
        });

        document.documentElement.setAttribute('it-theme', 'true');
    } else {
        document.documentElement.removeAttribute('it-theme');
        document.documentElement.removeAttribute('dark');
        
        var wait = setInterval(function() {
            if (document.body) {
                clearInterval(wait);

                document.body.removeAttribute('dark');
            }
        });
        
        var wait2 = setInterval(function() {
            if (
                document.querySelector('ytd-app') &&
                typeof document.querySelector('ytd-app').toggleDarkThemeAttribute_ === 'function' &&
                document.querySelector('ytd-app').isAppDarkTheme_() === true
            ) {
                clearInterval(wait2);
                    
                document.querySelector('ytd-app').toggleDarkThemeAttribute_(true);
            }
        });
    }
};


ImprovedTube.themeEditor = function() {
    if (this.storage.theme_my_colors !== true) {
        if (document.querySelector('.it-theme-editor')) {
            document.querySelector('.it-theme-editor').remove();
        }

        return false;
    }

    var style = document.querySelector('.it-theme-editor') || document.createElement('style');

    style.className = 'it-theme-editor';
    style.innerText = 'html{' +
        '--yt-swatch-textbox-bg:rgba(19,19,19,1)!important;' +
        '--yt-swatch-icon-color:rgba(136,136,136,1)!important;' +
        '--yt-spec-brand-background-primary:rgba(0,0,0, 0.1) !important;' +
        '--yt-spec-brand-background-secondary:rgba(0,0,0, 0.1) !important;' +
        '--yt-spec-badge-chip-background:rgba(0, 0, 0, 0.05) !important;' +
        '--yt-spec-verified-badge-background:rgba(0, 0, 0, 0.15) !important;' +
        '--yt-spec-button-chip-background-hover:rgba(0, 0, 0, 0.10) !important;' +
        '--yt-spec-brand-button-background:rgba(136,136,136,1) !important;' +
        '--yt-spec-filled-button-focus-outline:rgba(0, 0, 0, 0.60) !important;' +
        '--yt-spec-call-to-action-button-focus-outline:rgba(0,0,0, 0.30) !important;' +
        '--yt-spec-brand-text-button-focus-outline:rgba(204, 0, 0, 0.30) !important;' +
        '--yt-spec-10-percent-layer:rgba(136,136,136,1) !important;' +
        '--yt-swatch-primary:' + (this.storage.theme_primary_color || '') + '!important;' +
        '--yt-swatch-primary-darker:' + (this.storage.theme_primary_color || '') + '!important;' +
        '--yt-spec-brand-background-solid:' + (this.storage.theme_primary_color || '') + '!important;' +
        '--yt-spec-general-background-a:' + (this.storage.theme_primary_color || '') + '!important;' +
        '--yt-spec-general-background-b:' + (this.storage.theme_primary_color || '') + '!important;' +
        '--yt-spec-general-background-c:' + (this.storage.theme_primary_color || '') + '!important;' +
        '--yt-spec-touch-response:' + (this.storage.theme_primary_color || '') + '!important;' +
        '--yt-swatch-text: ' + (this.storage.theme_text_color || '') + '!important;' +
        '--yt-swatch-important-text: ' + (this.storage.theme_text_color || '') + '!important;' +
        '--yt-swatch-input-text: ' + (this.storage.theme_text_color || '') + '!important;' +
        '--yt-swatch-logo-override: ' + (this.storage.theme_text_color || '') + '!important;' +
        '--yt-spec-text-primary:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-text-primary-inverse:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-text-secondary:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-text-disabled:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-icon-active-other:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-icon-inactive:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-icon-disabled:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-filled-button-text:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-call-to-action-inverse:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-brand-icon-active:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-brand-icon-inactive:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-brand-link-text:' + (this.storage.theme_text_color || '') + '!important;' +
        '--yt-spec-brand-subscribe-button-background:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-wordmark-text:' + (this.storage.theme_text_color || '') + ' !important;' +
        '--yt-spec-selected-nav-text:' + (this.storage.theme_text_color || '') + ' !important;' +
        '}';

    document.documentElement.appendChild(style);
}
