/*-----------------------------------------------------------------------------
>>> EVENTS
-------------------------------------------------------------------------------
1.0 DOMContentLoaded
2.0 Load
3.0 YouTube page data updated
4.0 YouTube visibility refresh
5.0 SPF done
6.0 Keydown
7.0 Mousedown
-----------------------------------------------------------------------------*/

chrome.storage.local.get(function(items) {
    window.addEventListener('load', function() {
        if (!document.querySelector('.it-rate-notify') && Object.keys(items).length > 10 && items.rate_notify !== 5) {
            var popup = document.createElement('div');

            popup.className = 'it-rate-notify';

            popup.innerHTML = '<svg class=it-rate-notify__heart viewBox="0 0 24 24"><defs><linearGradient id="itHeartGradient"><stop offset="5%" stop-color="#ffb199 "/><stop offset="95%" stop-color="#ff0844"/></linearGradient></defs><path d="M13.35 20.13c-.76.69-1.93.69-2.69-.01l-.11-.1C5.3 15.27 1.87 12.16 2 8.28c.06-1.7.93-3.33 2.34-4.29 2.64-1.8 5.9-.96 7.66 1.1 1.76-2.06 5.02-2.91 7.66-1.1 1.41.96 2.28 2.59 2.34 4.29.14 3.88-3.3 6.99-8.55 11.76l-.1.09z"></svg>' +
                '<div class=it-rate-notify__title>Do you enjoy ImprovedTube?</div>' +
                '<div class=it-rate-notify__footer>' +
                '<button onclick="window.open(\'https://chrome.google.com/webstore/detail/improve-youtube-open-sour/bnomihfieiccainjcjblhegjgglakjdd/reviews\');document.querySelector(\'.it-rate-notify\').remove();">Yes</button>' +
                '<button onclick="document.querySelector(\'.it-rate-notify\').remove();">No</button>' +
                '</div>';

            document.body.appendChild(popup);

            setTimeout(function() {
                popup.classList.add('it-rate-notify--show');
            }, 1000);

            chrome.storage.local.set({
                rate_notify: 5
            });
        }
    });
});

ImprovedTube.events = function() {

    /*-------------------------------------------------------------------------
    1.0 DOMContentLoaded
    -------------------------------------------------------------------------*/

    window.addEventListener('DOMContentLoaded', ImprovedTube.pageUpdate);


    /*-------------------------------------------------------------------------
    2.0 Load
    -------------------------------------------------------------------------*/

    document.documentElement.addEventListener('load', function() {
        if (
            window.yt &&
            window.yt.player &&
            window.yt.player.Application &&
            window.yt.player.Application.create
        ) {
            window.yt.player.Application.create = ImprovedTube.ytPlayerApplicationCreateMod(window.yt.player.Application.create);
        }

        if (document.querySelector('#search')) {
            document.querySelector('#search').addEventListener('focus', function() {
                document.documentElement.setAttribute('it-search-focus', 'true');
            });

            document.querySelector('#search').addEventListener('blur', function() {
                document.documentElement.setAttribute('it-search-focus', 'false');
            });
        }
    }, true);

    window.addEventListener('resize', function() {
        ImprovedTube.fitToWindow();
        ImprovedTube.improvedtube_youtube_icon_resize();
    });

    window.addEventListener('scroll', function() {
        ImprovedTube.improvedtube_youtube_icon_resize();
    });


    /*-------------------------------------------------------------------------
    3.0 YouTube page data updated
    -------------------------------------------------------------------------*/

    window.addEventListener('yt-page-data-updated', ImprovedTube.pageUpdate);


    /*-------------------------------------------------------------------------
    4.0 YouTube visibility refresh
    -------------------------------------------------------------------------*/

    window.addEventListener('yt-visibility-refresh', ImprovedTube.pageUpdate);


    /*-------------------------------------------------------------------------
    5.0 SPF done
    -------------------------------------------------------------------------*/

    window.addEventListener('spfrequest', function() {
        ImprovedTube.allow_autoplay = false;
        ImprovedTube.pageUpdate();
    });
    window.addEventListener('spfdone', ImprovedTube.pageUpdate);


    /*-------------------------------------------------------------------------
    6.0 Keydown
    -------------------------------------------------------------------------*/

    window.addEventListener('keydown', function() {
        ImprovedTube.allow_autoplay = true;
        ImprovedTube.videoUrl = location.href;
    }, true);


    /*-------------------------------------------------------------------------
    7.0 Mousedown
    -------------------------------------------------------------------------*/

    window.addEventListener('mousedown', function() {
        ImprovedTube.allow_autoplay = true;
        ImprovedTube.videoUrl = location.href;
    }, true);

};

window.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(function(items) {
        chrome.storage.local.set(items);
    });
});