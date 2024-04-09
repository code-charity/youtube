/*------------------------------------------------------------------------------
4.3.0 THEMES
------------------------------------------------------------------------------*/
ImprovedTube.myColors = function () {
	// Video description has some hardcoded text color, remove it
	for (const styled of Array.from(document.querySelectorAll(".yt-core-attributed-string--link-inherit-color[style]"))) {
		styled.removeAttribute('style');
	}

	if ( this.storage.theme === 'custom' && Array.isArray(this.storage.theme_primary_color) && Array.isArray(this.storage.theme_text_color)) {
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
				style.textContent = 'html, [dark] {' +
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
					'--yt-spec-inverted-background: #fff;' +
					'--ytd-searchbox-background:' + primary_color + '!important;' +
					'--ytd-searchbox-legacy-button-color:' + 'var(--yt-spec-brand-background-primary)' + '!important;' +
					'}';

				this.elements.my_colors = style;
				document.documentElement.appendChild(style);
				if (document.getElementById("cinematics")) {
					document.getElementById("cinematics").style.visibility = 'hidden';
					document.getElementById("cinematics").style.display = 'none !important';
				} 
			} else {
				this.elements.my_colors?.remove();
			}
	}

ImprovedTube.setTheme = function () {
	// Video description has some hardcoded text color, remove it
	for (const styled of Array.from(document.querySelectorAll(".yt-core-attributed-string--link-inherit-color[style]"))) {
		styled.removeAttribute('style');
	}

	switch(this.storage.theme) {
		case 'black':
		case 'dark':
			if (document.getElementById("cinematics")) {
				document.getElementById('cinematics').style.visibility = 'visible';
				document.getElementById('cinematics').style.display = 'none !important';
			}
			this.elements.my_colors?.remove();
			break

		case 'default':
			return;
			break

		case 'dawn':
		case 'sunset':
		case 'night':
		case 'plain':
		case 'desert':
			document.getElementById('cinematics')?.removeAttribute('style');
			this.elements.my_colors?.remove();
			break
	}
};
