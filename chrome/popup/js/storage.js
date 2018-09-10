/*--------------------------------------------------------------
>>> STORAGE:
----------------------------------------------------------------
1.0 Save settings
2.0 Export settings
3.0 Import settings
4.0 Reset settings
--------------------------------------------------------------*/


/*--------------------------------------------------------------
1.0 Save settings
--------------------------------------------------------------*/

var storage = {};

function saveSettings(name, value) {
  storage[name] = value;

  chrome.storage.local.set(storage);

  themes();

  chrome.tabs.query({}, function (tabs) {
    for (let i = 0, l = tabs.length; i < l; i++)
      if (tabs[i].hasOwnProperty('url')) {
        chrome.tabs.sendMessage(tabs[i].id, name);
      }
  });

  chrome.runtime.sendMessage(name);
}


/*--------------------------------------------------------------
1.0 Export settings
--------------------------------------------------------------*/

function exportSettings() {
  chrome.permissions.request({
    permissions: ['downloads'],
    origins: ['https://www.youtube.com/']
  }, function (granted) {
    if (granted) {
      let blob = new Blob([JSON.stringify(storage)], {
          type: 'application/octet-stream'
        }),
        date = new Date();

      chrome.downloads.download({
        url: URL.createObjectURL(blob),
        filename: 'improvedtube_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getFullYear() + '.json',
        saveAs: true
      });
    }
  });
}


/*--------------------------------------------------------------
1.0 Import settings
--------------------------------------------------------------*/

function importSettings() {
  var input = document.getElementById('import-settings');

  input.addEventListener('change', function () {
    var b = new FileReader();

    if (this.files[0].type.match('application/json')) {
      b.onload = function () {
        var c = JSON.parse(this.result);

        storage = c;

        saveSettings();
      };

      b.readAsText(this.files[0]);
    } else
      alert('Unknown file');
  });

  input.click();
}


/*--------------------------------------------------------------
1.0 Reset settings
--------------------------------------------------------------*/

function resetSettings() {
  storage = {};

  chrome.storage.local.clear();
}
