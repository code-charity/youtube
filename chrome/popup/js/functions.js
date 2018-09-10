/*--------------------------------------------------------------
>>> FUNCTIONS:
----------------------------------------------------------------
1.0 Get accept languages (i18n)
2.0 Remove element
--------------------------------------------------------------*/


/*--------------------------------------------------------------
1.0 Get accept languages (i18n)
--------------------------------------------------------------*/

HTMLElement.prototype.getMessage = function (string, clear) {
  var self = this,
      name = string || this.id;

  if (clear)
    self.innerHTML = '';

  chrome.i18n.getAcceptLanguages(function (languageList) {
    var new_name = chrome.i18n.getMessage(name, languageList.join(','));

    if (new_name === '')
      self.innerHTML += name;
    else
      self.innerHTML += new_name;
  });
};


/*--------------------------------------------------------------
1.0 Remove element
--------------------------------------------------------------*/

HTMLElement.prototype.remove = function() {
  this.parentElement.removeChild(this);
};
