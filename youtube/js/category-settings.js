/*--------------------------------------------------------------
>>> SETTINGS:
----------------------------------------------------------------
1.0 ImprovedTube icon on YouTube
2.0 Delete YouTube cookies
--------------------------------------------------------------*/

/*--------------------------------------------------------------
1.0 ImprovedTube icon on YouTube
--------------------------------------------------------------*/

function improvedtubeIconOnYouTube() {
  setInterval(function() {
    if (
      settings.hasOwnProperty('improvedtube_youtube_icon') &&
      settings.improvedtube_youtube_icon != 'disabled' &&
      !document.documentElement.hasAttribute('embed') &&
      (
        (settings.improvedtube_youtube_icon == 'header_right' && (document.querySelector('#end #buttons') || document.querySelector('#yt-masthead-creation-menu'))) ||
        (settings.improvedtube_youtube_icon == 'header_left' && ((document.querySelector('#container.ytd-masthead') && document.querySelector('#guide-button.ytd-masthead')) || (document.querySelector('.yt-masthead-logo-container') && document.querySelector('#appbar-guide-button')))) ||
        settings.improvedtube_youtube_icon == 'bottom_left' ||
        settings.improvedtube_youtube_icon == 'bottom_right' ||
        (settings.improvedtube_youtube_icon == 'below_player' && (document.querySelector('.title.ytd-video-primary-info-renderer') || document.querySelector('#watch7-headline h1 .watch-title')))
      )
      && !document.querySelector('#improvedtube_settings_button')
    ) {
      let button = document.createElement('a'),
          parent,
          ref;

      if (settings.improvedtube_youtube_icon == 'header_left') {
        parent = document.querySelector('#container.ytd-masthead') || document.querySelector('.yt-masthead-logo-container');
        ref = document.querySelector('#guide-button.ytd-masthead') || document.querySelector('#appbar-guide-button');
        button.className = 'header_left';
      }
      else if (settings.improvedtube_youtube_icon == 'header_right') {
        parent = document.querySelector('#end #buttons') || document.querySelector('#yt-masthead-user');
      }
      else if (settings.improvedtube_youtube_icon == 'bottom_left') {
        parent = document.querySelector('body');
        button.className = 'bottom_left';
      }
      else if (settings.improvedtube_youtube_icon == 'bottom_right') {
        parent = document.querySelector('body');
        button.className = 'bottom_right';
      }
      else if (settings.improvedtube_youtube_icon == 'below_player') {
        parent = document.querySelector('.title.ytd-video-primary-info-renderer') || document.querySelector('#watch7-headline h1 .watch-title');
        button.className = 'below_player';
      }

      if (document.querySelector('#it-background-popup')) {
        document.querySelector('#it-background-popup').remove();
      }

      let background = document.createElement('div');
      background.id = 'improvedtube-popup-background';
      background.onclick = function () {
        document.getElementById('improvedtube-popup').classList.remove('show');
        document.getElementById('improvedtube-popup-background').classList.remove('show');
      };
      document.body.appendChild(background);

      button.id = 'improvedtube_settings_button';
      button.title = 'ImprovedTube Settings';
      button.onclick = function () {
        let popup = document.getElementById('improvedtube-popup');

        if (popup) {
          let bou = document.getElementById('improvedtube_settings_button').getBoundingClientRect();
          if (bou.x + 300 < window.innerWidth) {
            popup.style.left = '0px';
            popup.style.right = 'auto';
          } else {
            popup.style.right = '0px';
            popup.style.left = 'auto';
          }

          if (bou.y + 400 < window.innerHeight) {
            popup.style.top = document.getElementById('improvedtube_settings_button').offsetWidth + 'px';
            popup.style.bottom = 'auto';
          } else {
            popup.style.bottom = document.getElementById('improvedtube_settings_button').offsetWidth + 'px';
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

      if (settings.improvedtube_youtube_icon == 'header_left') {
        parent.insertBefore(button, ref);
        return;
      }

      parent.appendChild(button);
    }
  }, 1000);
}


/*--------------------------------------------------------------
2.0 Delete YouTube cookies
--------------------------------------------------------------*/

function delete_youtube_cookies() {
  let cookies = document.cookie.split(';');

  for (var i = 0; i < cookies.length; i++) {
    let cookie = cookies[i],
      eqPos = cookie.indexOf('='),
      name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

    document.cookie = name + '=; domain=.youtube.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  setTimeout(function() {
    location.reload();
  }, 50);
}
