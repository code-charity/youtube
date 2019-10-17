/*-----------------------------------------------------------------------------
>>> SETTINGS
-------------------------------------------------------------------------------
1.0 ImprovedTube icon on YouTube
2.0 Delete YouTube cookies
3.0 YouTube Language
-----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 ImprovedTube icon on YouTube
-----------------------------------------------------------------------------*/

ImprovedTube.improvedtube_youtube_icon_wait = false;

ImprovedTube.improvedtube_youtube_icon = function() {
    if (
        ImprovedTube.storage.improvedtube_youtube_icon === 'disabled' &&
        document.querySelector('.it-btn')
    ) {
        document.querySelector('.it-btn').remove();
    }

    if (this.improvedtube_youtube_icon_wait === false) {
        this.improvedtube_youtube_icon_wait = setInterval(function() {
            var option = ImprovedTube.storage.improvedtube_youtube_icon,
                parentNode,
                referenceNode;

            if (option === 'header_left') {
                parentNode = (
                    document.querySelector('#container.ytd-masthead') ||
                    document.querySelector('.yt-masthead-logo-container')
                );
                referenceNode = (
                    document.querySelector('#guide-button.ytd-masthead') ||
                    document.querySelector('#appbar-guide-button')
                );
            } else if (option === 'header_right') {
                parentNode = (
                    document.querySelector('#end #buttons') ||
                    document.querySelector('#yt-masthead-user')
                );
            } else if (option === 'draggable') {
                parentNode = document.body || document.querySelector('body');
            } else if (option === 'below_player') {
                parentNode = (
                    document.querySelector('.title.ytd-video-primary-info-renderer') ||
                    document.querySelector('#watch-headline-title')
                );
            }

            if (document.querySelector('.it-btn')) {
                if (!parentNode.querySelector(':scope > .it-btn')) {
                    document.querySelector('.it-btn').remove();
                } else {
                    clearInterval(ImprovedTube.improvedtube_youtube_icon_wait);

                    ImprovedTube.improvedtube_youtube_icon_wait = false;

                    return false;
                }
            }

            if (
                ImprovedTube.isset(option) &&
                option !== 'disabled' &&
                parentNode && (option === 'header_left' ? referenceNode : true)
            ) {
                clearInterval(ImprovedTube.improvedtube_youtube_icon_wait);

                ImprovedTube.improvedtube_youtube_icon_wait = false;

                var button = document.createElement('div');

                button.className = 'it-btn';
                button.innerHTML = '<div class=it-btn__scrim></div><div class=it-btn__icon><iframe class=it-btn__iframe src=//www.youtube.com/improvedtube></iframe></div>';
                button.addEventListener('click', function() {
                    event.preventDefault();
                    event.stopPropagation();

                    this.classList.toggle('it-btn--active');

                    return false;
                }, true);

                if (option === 'draggable') {
                    button.addEventListener('mousedown', function() {});
                }

                if (option === 'header_left') {
                    parentNode.insertBefore(button, referenceNode);
                } else {
                    parentNode.appendChild(button);
                }
            }
        }, 250);
    }
};

/*ImprovedTube.improvedtube_youtube_icon___old = function() {
    if (this.improvedtube_youtube_icon_wait === false) {
        this.improvedtube_youtube_icon_wait = setInterval(function() {
            var option = ImprovedTube.storage.improvedtube_youtube_icon;

            if (
                ImprovedTube.isset(option) && option !== 'disabled' &&
                (
                    (option === 'header_right' && (document.querySelector('#end #buttons') || document.querySelector('#yt-masthead-creation-menu'))) ||
                    (option === 'header_left' && ((document.querySelector('#container.ytd-masthead') && document.querySelector('#guide-button.ytd-masthead')) || (document.querySelector('.yt-masthead-logo-container') && document.querySelector('#appbar-guide-button')))) ||
                    option === 'draggable' ||
                    (option === 'below_player' && (document.querySelector('.title.ytd-video-primary-info-renderer') || document.querySelector('#watch7-headline h1 .watch-title')))
                ) &&
                !document.querySelector('#improvedtube-button')
            ) {
                clearInterval(ImprovedTube.improvedtube_youtube_icon_wait);

                ImprovedTube.improvedtube_youtube_icon_wait = false;






                var button = document.createElement('a'),
                    parent,
                    ref;

                if (option === 'header_left') {
                    parent = document.querySelector('#container.ytd-masthead') || document.querySelector('.yt-masthead-logo-container');
                    ref = document.querySelector('#guide-button.ytd-masthead') || document.querySelector('#appbar-guide-button');
                    button.className = 'header_left';
                } else if (option === 'header_right') {
                    parent = document.querySelector('#end #buttons') || document.querySelector('#yt-masthead-user');

                    console.log(0);
                } else if (option === 'draggable') {
                    parent = document.querySelector('body');
                    button.className = 'bottom_left';
                    var draggable_data = {
                        x: localStorage.getItem('improvedtube-icon-x'),
                        y: localStorage.getItem('improvedtube-icon-y'),
                        offsetX: 0,
                        offsetY: 0
                    };
                    button.style.left = draggable_data.x + 'px';
                    button.style.top = draggable_data.y + 'px';
                    // MOUSE DOWN
                    button.onmousedown = function(event) {
                            console.log('--down', event);
                            draggable_data.offsetX = event.layerX;
                            draggable_data.offsetY = event.layerY;
                            window.addEventListener('selectstart', disableSelect);
                            window.addEventListener('mouseup', up);
                            window.addEventListener('mousemove', move);
                        }
                        // MOUSE UP
                    function up(event) {
                        console.log('--up', event);
                        draggable_data.offsetX = 0;
                        draggable_data.offsetY = 0;
                        localStorage.setItem('improvedtube-icon-x', draggable_data.x);
                        localStorage.setItem('improvedtube-icon-y', draggable_data.y);
                        setTimeout(function() {
                            button.classList.remove('dragging');
                        }, 100);
                        window.removeEventListener('selectstart', disableSelect);
                        window.removeEventListener('mouseup', up);
                        window.removeEventListener('mousemove', move);
                    }
                    // MOUSE MOVE
                    function move(event) {
                        console.log('--move', event);
                        if (button.className.indexOf('dragging') === -1)
                            button.classList.add('dragging');
                        draggable_data.x = event.clientX - draggable_data.offsetX;
                        draggable_data.y = event.clientY - draggable_data.offsetY;
                        button.style.left = draggable_data.x + 'px';
                        button.style.top = draggable_data.y + 'px';
                    }
                    // DISABLE SELECT
                    function disableSelect(event) {
                        event.preventDefault();
                    }
                } else if (option === 'below_player') {
                    parent = document.querySelector('.title.ytd-video-primary-info-renderer') || document.querySelector('#watch7-headline h1 .watch-title');
                    button.className = 'below_player';
                }

                if (document.querySelector('#it-background-popup')) {
                    document.querySelector('#it-background-popup').remove();
                }

                var background = document.createElement('div');
                background.id = 'improvedtube-popup-background';
                background.onclick = function() {
                    document.getElementById('improvedtube-popup').classList.remove('show');
                    document.getElementById('improvedtube-popup-background').classList.remove('show');
                };
                document.body.appendChild(background);

                button.id = 'improvedtube-button';
                button.title = 'ImprovedTube Settings';
                button.onclick = function() {
                    if (button.className.indexOf('dragging') != -1)
                        return false;

                    var popup = document.getElementById('improvedtube-popup');

                    if (popup) {
                        var bou = document.getElementById('improvedtube-button').getBoundingClientRect();
                        if (bou.x + 300 < window.innerWidth) {
                            popup.style.left = '0px';
                            popup.style.right = 'auto';
                        } else {
                            popup.style.right = '0px';
                            popup.style.left = 'auto';
                        }

                        if (bou.y < window.innerHeight / 2) {
                            popup.style.top = document.getElementById('improvedtube-button').offsetWidth + 'px';
                            popup.style.bottom = 'auto';
                        } else {
                            popup.style.bottom = document.getElementById('improvedtube-button').offsetWidth + 'px';
                            popup.style.top = 'auto';
                        }

                        popup.classList.add('show');
                        document.getElementById('improvedtube-popup-background').classList.add('show');
                    }
                };
                //button.href = '/improvedtube'
                button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
                    '<path d="M10 8.64v6.72L15.27 12z" opacity=".3"/>' +
                    '<path d="M8 19l11-7L8 5v14zm2-10.36L15.27 12 10 15.36V8.64z"/>' +
                    '</svg><iframe id="improvedtube-popup" src="https://www.youtube.com/improvedtube"></iframe>';

                if (option === 'header_left') {
                    parent.insertBefore(button, ref);
                    return;
                }

                parent.appendChild(button);






            }
        }, 250);
    }
};*/


/*-----------------------------------------------------------------------------
2.0 Delete YouTube cookies
-----------------------------------------------------------------------------*/

ImprovedTube.delete_youtube_cookies = function() {
    var cookies = document.cookie.split(';');

    for (var i = 0, l = cookies.length; i < l; i++) {
        var cookie = cookies[i],
            eqPos = cookie.indexOf('='),
            name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

        document.cookie = name + '=; domain=.youtube.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    setTimeout(function() {
        location.reload();
    }, 100);
};


/*-----------------------------------------------------------------------------
3.0 YouTube Language
-----------------------------------------------------------------------------*/

ImprovedTube.youtube_language = function() {
    var pref = ImprovedTube.getCookieValueByName('PREF'),
        hl = ImprovedTube.getParam(pref, 'hl');

    if (hl) {
        ImprovedTube.setCookie('PREF', pref.replace('hl=' + hl, 'hl=' + ImprovedTube.storage.youtube_language));
    } else {
        ImprovedTube.setCookie('PREF', pref + '&hl=' + ImprovedTube.storage.youtube_language);
    }

    setTimeout(function() {
        location.reload();
    }, 100);
};