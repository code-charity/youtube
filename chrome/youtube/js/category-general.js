/*--------------------------------------------------------------
>>> GENERAL:
----------------------------------------------------------------
1.0 Night mode
  1.1 Dark theme
  1.2 Bluelight
  1.3 Dim
2.0 Default home page
3.0 Prevent closing
4.0 Scroll to top
5.0 YouTube version
6.0 Squared user images
7.0 Moving thumbnails
--------------------------------------------------------------*/

/*--------------------------------------------------------------
1.0 Night mode
--------------------------------------------------------------*/

/*--------------------------------------------------------------
1.1 Dark theme
--------------------------------------------------------------*/

function default_dark_theme() {
	const hours = new Date().getHours(),
				data = settings.default_dark_theme;

	if (
		(settings.schedule_turn_on && settings.schedule_turn_off && settings.schedule_turn_on != 'disabled' && settings.schedule_turn_off != 'disabled') &&
		hours < (Number(settings.schedule_turn_on) || 21) &&
		hours >= (Number(settings.schedule_turn_off) || 7)
	)
		return false;

  if (data == 'true')
    document.documentElement.setAttribute('dark', '');
  else if (data) {
    document.documentElement.removeAttribute('dark');
  }
}

/*--------------------------------------------------------------
1.2 Bluelight
--------------------------------------------------------------*/

function bluelight() {
  const data = settings.bluelight,
    hours = new Date().getHours();

  if (
    (settings.schedule_turn_on && settings.schedule_turn_off && settings.schedule_turn_on != 'disabled' && settings.schedule_turn_off != 'disabled') &&
    hours < (Number(settings.schedule_turn_on) || 21) &&
    hours >= (Number(settings.schedule_turn_off) || 7)
  )
    return false;

  if (data && data != 'disabled') {
    if (!document.querySelector('#improvedtube-bluelight-filter feColorMatrix')) {
      let div = document.createElement('div');

      div.id = 'improvedtube-bluelight';
      div.innerHTML = '<svg version=1.1 xmlns=//www.w3.org/2000/svg viewBox="0 0 1 1"><filter id=improvedtube-bluelight-filter><feColorMatrix type=matrix values="1 0 0 0 0 0 1 0 0 0 0 0 ' + (1 - parseFloat(data) / 100) + ' 0 0 0 0 0 1 0"></feColorMatrix></filter></svg>';

      document.documentElement.appendChild(div);
      document.documentElement.setAttribute('bluelight-filter', '');
    } else {
      document.querySelector('#improvedtube-bluelight-filter feColorMatrix').setAttribute('values', '1 0 0 0 0 0 1 0 0 0 0 0 ' + (1 - parseFloat(data) / 100) + ' 0 0 0 0 0 1 0');
    }
  } else if (document.getElementById('improvedtube-bluelight')) {
    document.getElementById('improvedtube-bluelight').remove();
    document.documentElement.removeAttribute('bluelight-filter');
  }
}


/*--------------------------------------------------------------
1.3 Dim
--------------------------------------------------------------*/

function dim() {
  const data = settings.dim,
    hours = new Date().getHours();

  if (
    (settings.schedule_turn_on && settings.schedule_turn_off && settings.schedule_turn_on != 'disabled' && settings.schedule_turn_off != 'disabled') &&
    hours < (Number(settings.schedule_turn_on) || 21) &&
    hours >= (Number(settings.schedule_turn_off) || 7)
  )
    return false;

  if (data && data != 'disabled') {
    if (document.getElementById('improvedtube-dim')) {
      document.getElementById('improvedtube-dim').style.opacity = parseInt(Number(data)) / 100 || 0;
    } else {
      let div = document.createElement('div');

      div.id = 'improvedtube-dim';
      div.style.opacity = parseInt(Number(data)) / 100 || 0;

      document.documentElement.appendChild(div);
    }
  } else if (document.getElementById('improvedtube-dim')) {
    document.getElementById('improvedtube-dim').remove();
  }
}


/*--------------------------------------------------------------
2.0 Default home page
--------------------------------------------------------------*/

function youtube_home_page(current_url = location.pathname) {
  const data = settings.youtube_home_page || 'normal';

  if (current_url == '/' && data != 'normal') {
    let url = '';

    if (data == 'trending')
      url = '/feed/trending';
    else if (data == 'subscriptions')
      url = '/feed/subscriptions';
    else if (data == 'history')
      url = '/feed/history';
    else if (data == 'watch_later')
      url = '/playlist?list=WL';

    location.replace(url);
  }
}


/*--------------------------------------------------------------
3.0 Prevent closing
--------------------------------------------------------------*/

function youtube_prevent_closure() {
  window.onbeforeunload = function () {
    const data = settings.youtube_prevent_closure;

    if (data && data == 'true')
      return 'You have attempted to leave this page. Are you sure?';
  };
}


/*--------------------------------------------------------------
4.0 Scroll to top
--------------------------------------------------------------*/

function scroll_to_top() {
  const data = settings.scroll_to_top;

  if (data == 'true') {
    const button = document.createElement('div');

    button.classList.add('scroll-to-top');
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>';
    button.addEventListener('click', function () {
      window.scrollTo(0, 0);
    });

    document.body.appendChild(button);
  } else if (document.querySelector('.scroll-to-top')) {
    document.querySelector('.scroll-to-top').remove();
  }
}


/*--------------------------------------------------------------
5.0 YouTube version
--------------------------------------------------------------*/

function youtube_version() {
  if (settings.youtube_version == 'do_not_change')
  return;

  let data = settings.youtube_version == 'new' ? '4' : '8',
  pref = getCookieValueByName('PREF'),
  f6 = getParam(pref, 'f6');

  if (f6) {
    if (/[0-9]{4,4}/g.test(f6)) {
      let current = f6.match(/.$/)[0];

      if (data == '8' && current == '5')
      data = '9';
      else if (data == '4' && current == '9')
      data = '5';

      setCookie('PREF', pref.replace('f6=' + f6, 'f6=' + f6.replace(/.$/, data)));
    } else {
      setCookie('PREF', pref.replace('f6=' + f6, 'f6=100' + data));
    }
  } else {
    setCookie('PREF', pref + '&f6=100' + data);
  }

  setTimeout(function () {
    location.reload();
  }, 50);
}


/*--------------------------------------------------------------
6.0 Squared user images
--------------------------------------------------------------*/

function squared_user_images() {
    document.documentElement.setAttribute('squared-user-images', settings.squared_user_images);
}


/*--------------------------------------------------------------
7.0 Moving thumbnails
--------------------------------------------------------------*/

function play_videos_by_hovering_the_thumbnails() {
    document.documentElement.setAttribute('play-videos-by-hovering-the-thumbnails', settings.play_videos_by_hovering_the_thumbnails);
}
