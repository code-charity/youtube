/*--------------------------------------------------------------
>>> CHANNEL:
----------------------------------------------------------------
1.0 Channel default page
2.0 Channel featured content
--------------------------------------------------------------*/

/*--------------------------------------------------------------
1.0 Channel default page
--------------------------------------------------------------*/

function channel_default_page(current_url = location.pathname) {
  const data = settings.channel_default_page || 'normal',
        channel_url = current_url.match(/\/(channel\/|user\/)[a-zA-Z0-9\_\-]{1,}/);

  if (current_url.charAt(current_url.length - 1) == '/')
    current_url = current_url.slice(0, -1);

  if (channel_url && channel_url[0] == current_url && data != 'normal') {
    let url = channel_url[0];

    if (data == 'videos')
      url += '/videos';
    else if (data == 'playlists')
      url += '/playlists';

    location.replace(url);
  }
}


/*--------------------------------------------------------------
2.0 Channel featured content
--------------------------------------------------------------*/

function channel_featured_content() {
  document.documentElement.setAttribute('channel-featured-content', settings.channel_featured_content);
}
