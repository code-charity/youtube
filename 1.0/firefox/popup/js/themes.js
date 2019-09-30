/*--------------------------------------------------------------
>>> THEMES:
----------------------------------------------------------------
1.0 Classic ImprovedTube
2.0 Dark theme
--------------------------------------------------------------*/

function themes() {
	if (storage.classic_improvedtube != 'true')
		document.documentElement.setAttribute('theme', storage.it_theme);
	else
		document.documentElement.setAttribute('theme', '');

  if (storage.classic_improvedtube == 'true')
    document.documentElement.setAttribute('classic-improvedtube', '');
  else
    document.documentElement.removeAttribute('classic-improvedtube');
}
