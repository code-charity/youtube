/*--------------------------------------------------------------
>>> COOKIE:
----------------------------------------------------------------
1.0 getCookieValueByName
2.0 setCookie
--------------------------------------------------------------*/

/*--------------------------------------------------------------
1.0 getCookieValueByName
--------------------------------------------------------------*/

function getCookieValueByName(name) {
  const re    = new RegExp('([; ]' + name + '|^' + name + ')([^\\s;]*)', 'g'),
        match = document.cookie.match(re);

  if (match) {
    let cookie = match[0];

    cookie = cookie.replace(name + '=', '');
    cookie = cookie.replace(' ', '');

    return cookie;
  } else
    return '';
}


/*--------------------------------------------------------------
2.0 setCookie
--------------------------------------------------------------*/

function setCookie(name, value) {
  let date = new Date();

  date.setTime(date.getTime() + 31536000);

  document.cookie = name + '=' + value + '; path=/; domain=.youtube.com; expires=' + date.toGMTString();
}
