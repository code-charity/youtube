/*--------------------------------------------------------------
>>> THEMES:
----------------------------------------------------------------
1.0 Classic ImprovedTube
2.0 Dark theme
--------------------------------------------------------------*/

function themes() {
	if (storage.classic_improvedtube != 'true') {
		if (storage.default_dark_theme == 'true')
    		document.body.setAttribute('theme', 'default_dark');
	} else {
		document.body.setAttribute('theme', '');
	}

  if (storage.classic_improvedtube == 'true')
    document.body.setAttribute('classic-improvedtube', '');
  else
    document.body.removeAttribute('classic-improvedtube');
}
