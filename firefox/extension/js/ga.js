/*-----------------------------------------------------------------------------
  Google Analytics
-----------------------------------------------------------------------------*/

if (chrome.runtime.getManifest().version == chrome.runtime.getManifest().version_name) {
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-88354155-1']);
  _gaq.push(['_setSessionCookieTimeout', 86400000]);

  (function() {
    let ga = document.createElement('script'),
        s = document.getElementsByTagName('script')[0];

    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    s.parentNode.insertBefore(ga, s);
  })();

  let version = chrome.runtime.getManifest().version;

  _gaq.push(['_trackPageview', '/popup-' + version, 'started']);
}
