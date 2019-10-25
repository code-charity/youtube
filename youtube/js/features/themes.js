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
    var value = this.storage.bluelight;

    if (this.isset(value) && value !== 0) {
        if (!document.querySelector('#it-bluelight')) {
            var container = document.createElement('div');

            container.id = 'it-bluelight';
            container.innerHTML = '<svg version=1.1 xmlns=//www.w3.org/2000/svg viewBox="0 0 1 1"><filter id=it-bluelight-filter><feColorMatrix type=matrix values="1 0 0 0 0 0 1 0 0 0 0 0 ' + (1 - parseFloat(value) / 100) + ' 0 0 0 0 0 1 0"></feColorMatrix></filter></svg>';

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
    var value = this.storage.dim;

    if (this.isset(value) && value !== 0) {
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
    if (
        this.isset(ImprovedTube.storage.default_dark_theme) && ImprovedTube.storage.default_dark_theme !== false ||
        this.isset(ImprovedTube.storage.night_theme) && ImprovedTube.storage.night_theme !== false ||
        this.isset(ImprovedTube.storage.dawn_theme) && ImprovedTube.storage.dawn_theme !== false ||
        this.isset(ImprovedTube.storage.sunset_theme) && ImprovedTube.storage.sunset_theme !== false ||
        this.isset(ImprovedTube.storage.desert_theme) && ImprovedTube.storage.desert_theme !== false ||
        this.isset(ImprovedTube.storage.plain_theme) && ImprovedTube.storage.plain_theme !== false ||
        this.isset(ImprovedTube.storage.black_theme) && ImprovedTube.storage.black_theme !== false
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