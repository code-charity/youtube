/*------------------------------------------------------------------------------
4.3.0 THEMES
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.3.1 MY COLORS
------------------------------------------------------------------------------*/

ImprovedTube.themes = function () {
	if (
		this.storage.theme === 'custom' &&
		Array.isArray(this.storage.theme_primary_color) &&
		Array.isArray(this.storage.theme_text_color)
	) {
		var style = this.elements.my_colors || document.createElement('style'),
			primary_color = this.storage.theme_primary_color,
			text_color = this.storage.theme_text_color;

		if (primary_color) {
			primary_color = 'rgb(' + primary_color.join(',') + ')';
		} else {
			primary_color = 'rgb(200, 200, 200)';
		}

		if (text_color) {
			text_color = 'rgb(' + text_color.join(',') + ')';
		} else {
			text_color = 'rgb(25, 25, 25)';
		}

		style.className = 'it-theme-editor';
		style.textContent = 'html{' +
			'--yt-swatch-textbox-bg:rgba(19,19,19,1)!important;' +
			'--yt-swatch-icon-color:rgba(136,136,136,1)!important;' +
			'--yt-spec-brand-background-primary:rgba(0,0,0, 0.1) !important;' +
			'--yt-spec-brand-background-secondary:rgba(0,0,0, 0.1) !important;' +
			'--yt-spec-badge-chip-background:rgba(0, 0, 0, 0.05) !important;' +
			'--yt-spec-verified-badge-background:rgba(0, 0, 0, 0.15) !important;' +
			'--yt-spec-button-chip-background-hover:rgba(0, 0, 0, 0.10) !important;' +
			'--yt-spec-brand-button-background:rgba(136,136,136,1) !important;' +
			'--yt-spec-filled-button-focus-outline:rgba(0, 0, 0, 0.60) !important;' +
			'--yt-spec-call-to-action-button-focus-outline:rgba(0,0,0, 0.30) !important;' +
			'--yt-spec-brand-text-button-focus-outline:rgba(204, 0, 0, 0.30) !important;' +
			'--yt-spec-10-percent-layer:rgba(136,136,136,1) !important;' +
			'--yt-swatch-primary:' + primary_color + '!important;' +
			'--yt-swatch-primary-darker:' + primary_color + '!important;' +
			'--yt-spec-brand-background-solid:' + primary_color + '!important;' +
			'--yt-spec-general-background-a:' + primary_color + '!important;' +
			'--yt-spec-general-background-b:' + primary_color + '!important;' +
			'--yt-spec-general-background-c:' + primary_color + '!important;' +
			'--yt-spec-touch-response:' + primary_color + '!important;' +
			'--yt-swatch-text: ' + text_color + '!important;' +
			'--yt-swatch-important-text: ' + text_color + '!important;' +
			'--yt-swatch-input-text: ' + text_color + '!important;' +
			'--yt-swatch-logo-override: ' + text_color + '!important;' +
			'--yt-spec-text-primary:' + text_color + ' !important;' +
			'--yt-spec-text-primary-inverse:' + text_color + ' !important;' +
			'--yt-spec-text-secondary:' + text_color + ' !important;' +
			'--yt-spec-text-disabled:' + text_color + ' !important;' +
			'--yt-spec-icon-active-other:' + text_color + ' !important;' +
			'--yt-spec-icon-inactive:' + text_color + ' !important;' +
			'--yt-spec-icon-disabled:' + text_color + ' !important;' +
			'--yt-spec-filled-button-text:' + text_color + ' !important;' +
			'--yt-spec-call-to-action-inverse:' + text_color + ' !important;' +
			'--yt-spec-brand-icon-active:' + text_color + ' !important;' +
			'--yt-spec-brand-icon-inactive:' + text_color + ' !important;' +
			'--yt-spec-brand-link-text:' + text_color + '!important;' +
			'--yt-spec-brand-subscribe-button-background:' + text_color + ' !important;' +
			'--yt-spec-wordmark-text:' + text_color + ' !important;' +
			'--yt-spec-selected-nav-text:' + text_color + ' !important;' +
			'--yt-spec-base-background:' + primary_color + '!important;' +
			'--yt-spec-raised-background:' + primary_color + '!important;' +
			'--yt-spec-menu-background:' + primary_color + '!important;' +
			'ytd-masthead { background-color:' + primary_color + '!important;}' +
			'--yt-spec-inverted-background: #fff;' +
			'}'; +
			'#cinematics { visibility: hidden !important;}' +
			'#cinematics { display: none !important;}' 
		this.elements.my_colors = style;
	document.documentElement.appendChild(style);
	    if (document.documentElement.hasAttribute('dark') !== null && document.documentElement.hasAttribute('dark')) { 
		cookieValue = '80000'; 	document.documentElement.removeAttribute('dark');
		document.querySelector('ytd-masthead').removeAttribute('dark');	
		document.getElementById("cinematics").style.visibility = 'hidden';
		document.getElementById("cinematics").style.display = 'none !important';}
		document.querySelector('ytd-masthead').style.backgroundColor = ''+primary_color+'';			
	} else if (this.elements.my_colors) {
			this.elements.my_colors.remove();
		 if (this.storage.theme) {	
	    	if (this.storage.theme === 'default'){
			if (document.documentElement.hasAttribute('it-themes') !== null && document.documentElement.hasAttribute('it-themes') === true){													 
				document.documentElement.removeAttribute('it-themes');			
				document.documentElement.setAttribute('it-themes', 'false');				
				}
					if( ( document.documentElement.hasAttribute('dark') !== null && document.documentElement.hasAttribute('dark') )	|| ( document.querySelector('ytd-masthead').hasAttribute('dark') !== null && document.querySelector('ytd-masthead').hasAttribute('dark')) 
						){
					cookieValue = '80000'; 	document.documentElement.removeAttribute('dark');
		document.querySelector('ytd-masthead').removeAttribute('dark');	
		document.getElementById("cinematics").style.visibility = 'hidden';
		document.getElementById("cinematics").style.display = 'none !important';}
		document.querySelector('ytd-masthead').style.backgroundColor ='#fffff7'	;
			}			
			else if (this.storage.theme === 'dark'){ c = '400'; document.documentElement.setAttribute('dark', '');
			document.querySelector('ytd-masthead').setAttribute('dark', '')	
			document.getElementById("cinematics").style.visibility = 'visible';
			document.querySelector('ytd-masthead').style.backgroundColor ='#000';			
						}		
		else if (this.storage.theme === 'dawn' || this.storage.theme === 'sunset' || this.storage.theme === 'night' ){
				document.querySelector('ytd-masthead').removeAttribute('dark');
				document.getElementById("cinematics").style.mixBlendMode = 'lighten';
				document.getElementById("cinematics").style.visibility = 'visible';
				document.getElementById("cinematics").style.filter = 'invert(0)';
		} else if (this.storage.theme === 'plain'){
				document.querySelector('ytd-masthead').removeAttribute('dark');
				document.getElementById("cinematics").style.visibility = 'visible';
				document.getElementById("cinematics").style.filter = 'invert(1)';
				document.getElementById("cinematics").style.mixBlendMode = 'darken'
		} else if (this.storage.theme === 'desert'){
				document.querySelector('ytd-masthead').removeAttribute('dark');
				document.getElementById("cinematics").style.visibility = 'hidden';
				document.getElementById("cinematics").style.display = 'none';					
        } else if (this.storage.theme === 'black') {
			   document.documentElement.setAttribute('it-themes', 'true');
			        document.getElementById("cinematics").style.visibility = 'hidden';
					document.getElementById("cinematics").style.display = 'none !important';
					document.querySelector('ytd-masthead').style.backgroundColor ='#000';
					cookieValue = '80000'; 
					document.querySelector('ytd-masthead').removeAttribute('dark');
					document.documentElement.removeAttribute('dark'); 
		} } else {if (document.documentElement.hasAttribute('it-themes') !== null && document.documentElement.hasAttribute('it-themes') === true){
					document.getElementById("cinematics").style.visibility = 'hidden';
					document.getElementById("cinematics").style.display = 'none !important';
			}
			if ( (document.documentElement.hasAttribute('dark') !== null && document.documentElement.hasAttribute('dark') )
			  || ( document.querySelector('ytd-masthead').hasAttribute('dark') !== null && document.querySelector('ytd-masthead').hasAttribute('dark') ) 
			  ){
			cookieValue = '400'; document.documentElement.setAttribute('dark', '');
			document.querySelector('ytd-masthead').setAttribute('dark', '');	
			document.getElementById("cinematics").style.visibility = 'visible';	}		
		}
}
	pref = '';
	if (typeof cookieValue !== 'undefined'){
	if (document.cookie.match(/PREF\=([^\s]*(?=\;)|[^\s]*$)/)) {
		pref = document.cookie.match(/PREF\=([^\s]*(?=\;)|[^\s]*$)/)[1];
	}	


	if (pref.match(/(f6=)[^\&]+/)){
		cookieValue = pref.replace(/(f6=)[^\&]+/, cookieValue);
	} else {
		cookieValue = pref + "&f6=" + cookieValue;
	}
	ImprovedTube.setCookie('PREF', cookieValue);
	}
};
