/*--------------------------------------------------------------
>>> BACKGROUND:
----------------------------------------------------------------
1.0 Google Analytics
2.0 ImprovedTube in toolbar
3.0 Uninstall URL
4.0 Error tracker
--------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Google Analytics
-----------------------------------------------------------------------------*/

var _gaq = _gaq || [];

_gaq.push(['_setAccount', 'UA-88354155-1']);
_gaq.push(['_setSessionCookieTimeout', 14400000]);

(function() {
  let ga = document.createElement('script'),
    s = document.getElementsByTagName('script')[0];

  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  s.parentNode.insertBefore(ga, s);
})();


/*-----------------------------------------------------------------------------
2.0 ImprovedTube in toolbar
-----------------------------------------------------------------------------*/

chrome.contextMenus.removeAll();

chrome.contextMenus.create({
  id: '1111',
  title: '❤ Contribute',
  contexts: ['browser_action']
});

chrome.contextMenus.create({
  id: '1112',
  title: '★ Rate me',
  contexts: ['browser_action']
});

chrome.contextMenus.create({
  id: '1113',
  title: '◦ GitHub',
  contexts: ['browser_action']
});

chrome.contextMenus.onClicked.addListener(function(event) {
  if (event.menuItemId == '1111') {
    window.open('http://www.improvedtube.com/donate');
  } else if (event.menuItemId == '1112') {
    window.open('https://chrome.google.com/webstore/detail/improvedtube-for-youtube/bnomihfieiccainjcjblhegjgglakjdd');
  } else if (event.menuItemId == '1113') {
    window.open('https://github.com/ImprovedTube/ImprovedTube');
  }
});

chrome.storage.local.get(function(data) {
  if (data.improvedtube_browser_icon != 'youtube') {
    chrome.browserAction.setIcon({
      path: 'extension/img/16.png'
    });
  }

  chrome.runtime.onMessage.addListener(function(request, sender) {
    console.log(request, sender);
    if (sender && sender.tab && sender.tab.id) {
      if (request.enabled == true)
        chrome.browserAction.setIcon({
          path: 'extension/img/16.png',
          tabId: sender.tab.id
        });
    }

    _gaq.push(['_trackPageview', '/background-1.8.3', 'page-loaded']);
  });
});


chrome.runtime.onMessage.addListener(function(request) {
  chrome.storage.local.get(function(data) {
    if (data.improvedtube_browser_icon != 'youtube') {
      chrome.browserAction.setIcon({
        path: 'extension/img/16.png'
      });
    } else {
      chrome.browserAction.setIcon({
        path: 'extension/img/16g.png'
      });
    }
  });
});


/*-----------------------------------------------------------------------------
3.0 Uninstall URL
URL to be opened after the extension is uninstalled
-----------------------------------------------------------------------------*/

chrome.runtime.setUninstallURL('https://improvedtube.com/uninstalled');
