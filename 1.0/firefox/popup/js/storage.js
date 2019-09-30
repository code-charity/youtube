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

  if (name == 'improvedtube_language') {
    loadLocale((storage.improvedtube_language || 'en'), function(self, response) {
      locale = JSON.parse(response);

      // Activating themes for Popup
      themes();

      // Creating first menu
      createListByPath();

      if (document.querySelector('.beta-note div'))
        document.querySelector('.beta-note div').getMessage('foundABug', true);
    });

    return false;
  }

  themes();

  if (chrome && chrome.tabs)
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
  chrome.runtime.sendMessage({export: true});
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

        chrome.runtime.sendMessage({reload_youtube: true});
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
