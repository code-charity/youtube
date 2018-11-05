/*--------------------------------------------------------------
>>> CORE:
----------------------------------------------------------------
1.0 Retrieving data from local storage
2.0 Activating themes for Popup
3.0 Creating first menu
--------------------------------------------------------------*/

// Retrieving data from local storage
chrome.storage.local.get(function(data) {
  storage = data;

  // Activating themes for Popup
  themes();

  // Creating first menu
  createList();
});
