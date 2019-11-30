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

ImprovedTube.improvedtube_youtube_icon_resize = function() {
    var iframe = document.querySelector('.it-btn__iframe'),
        icon = document.querySelector('.it-btn__icon');
    
    if (iframe && icon) {
        var x = icon.getBoundingClientRect().x,
            y = icon.getBoundingClientRect().y;

        if (x < window.innerWidth / 2) {
            iframe.style.right = 'auto';
            iframe.style.left = '0px';
        } else {
            iframe.style.right = '0px';
            iframe.style.left = 'auto';
        }

        if (y < window.innerHeight / 2) {
            iframe.style.top = '50px';
            iframe.style.bottom = 'auto';

            iframe.style.height = Math.min(500, window.innerHeight - Math.max(0, iframe.getBoundingClientRect().top) - 16) + 'px';
        } else {
            iframe.style.top = 'auto';
            iframe.style.bottom = '50px';

            iframe.style.height = Math.min(500, window.innerHeight - Math.max(0, window.innerHeight - iframe.getBoundingClientRect().y - iframe.getBoundingClientRect().height) - 16) + 'px';
        }
    }
};

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
                    ImprovedTube.improvedtube_youtube_icon_resize();

                    return false;
                }, true);

                if (option === 'draggable') {
                    var position = localStorage.getItem('IT_ICON');

                    if (ImprovedTube.isset(position)) {
                        position = JSON.parse(position);

                        button.style.left = position.x + 'px';
                        button.style.top = position.y + 'px';
                    }

                    function move(event) {
                        button.classList.add('it-btn--dragging');

                        if (event.clientX < window.innerWidth / 2) {
                            if (event.clientX - Number(button.dataset.x) >= 16) {
                                button.style.left = event.clientX - Number(button.dataset.x) + 'px';
                            } else {
                                button.style.left = '16px';
                            }
                        } else {
                            if (event.clientX + (48 + window.innerWidth - document.querySelector('body').offsetWidth) - Number(button.dataset.x) <= window.innerWidth) {
                                button.style.left = event.clientX - Number(button.dataset.x) + 'px';
                            } else {
                                button.style.left = 'calc(100vw - ' + (48 + window.innerWidth - document.querySelector('body').offsetWidth) + 'px)';
                            }
                        }

                        if (event.clientY < window.innerHeight / 2) {
                            if (event.clientY - Number(button.dataset.y) >= 16) {
                                button.style.top = event.clientY - Number(button.dataset.y) + 'px';
                            } else {
                                button.style.top = '16px';
                            }
                        } else {
                            if (event.clientY + 48 - Number(button.dataset.y) <= window.innerHeight) {
                                button.style.top = event.clientY - Number(button.dataset.y) + 'px';
                            } else {
                                button.style.top = 'calc(100vh - 48px)';
                            }
                        }

                        ImprovedTube.improvedtube_youtube_icon_resize();
                    }

                    button.addEventListener('mousedown', function(event) {
                        this.dataset.x = event.layerX;
                        this.dataset.y = event.layerY;

                        window.addEventListener('mousemove', move);
                    });

                    window.addEventListener('mouseup', function() {
                        button.classList.remove('it-btn--dragging');

                        window.removeEventListener('mousemove', move);

                        localStorage.setItem('IT_ICON', JSON.stringify({
                            x: button.offsetLeft,
                            y: button.offsetTop
                        }));

                        setTimeout(function() {
                            button.style.pointerEvents = '';
                        });
                    });
                }

                if (option === 'header_left') {
                    parentNode.insertBefore(button, referenceNode);
                } else {
                    parentNode.appendChild(button);
                }

                ImprovedTube.improvedtube_youtube_icon_resize();
            }
        }, 250);
    }
};


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