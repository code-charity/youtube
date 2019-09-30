/*--------------------------------------------------------------
>>> SETTINGS:
----------------------------------------------------------------
1.0 ImprovedTube icon on YouTube
2.0 Delete YouTube cookies
3.0 YouTube language
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
        settings.improvedtube_youtube_icon == 'draggable' ||
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
      else if (settings.improvedtube_youtube_icon == 'draggable') {
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
        button.onmousedown = function (event) {
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
          setTimeout(function () {
            button.classList.remove('dragging');
          }, 100);
          window.removeEventListener('selectstart', disableSelect);
          window.removeEventListener('mouseup', up);
          window.removeEventListener('mousemove', move);
        }
        // MOUSE MOVE
        function move(event) {
          console.log('--move', event);
          if (button.className.indexOf('dragging') == -1)
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
        if (button.className.indexOf('dragging') != -1)
          return false;

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

          if (bou.y < window.innerHeight / 2) {
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


/*--------------------------------------------------------------
3.0 YouTube language
--------------------------------------------------------------*/

function youtube_language() {
  let data = settings.youtube_language,
      pref = getCookieValueByName('PREF'),
      hl = getParam(pref, 'hl');

  if (hl)
    setCookie('PREF', pref.replace('hl=' + hl, 'hl=' + data));
  else
    setCookie('PREF', pref + '&hl=' + data);

  setTimeout(function () {
    location.reload();
  }, 50);
}
