/*------------------------------------------------------------------------------
4.3.0 THEMES
------------------------------------------------------------------------------*/
ImprovedTube.myColors = function () {
	if (this.storage.theme === 'custom') {


		document.documentElement.setAttribute('it-theme', 'custom');

		let existingStyle = document.querySelector('.it-theme-editor');
		let style = existingStyle || document.createElement('style');

		let primary_color = this.storage.theme_primary_color;
		let secondary_color = this.storage.theme_secondary_color;
		let text_color = this.storage.theme_text_color;

		primary_color = primary_color ? 'rgb(' + primary_color.join(',') + ')' : 'rgb(200, 200, 200)';
		secondary_color = secondary_color ? 'rgb(' + secondary_color.join(',') + ')' : 'rgb(100, 0, 0)';
		text_color = text_color ? 'rgb(' + text_color.join(',') + ')' : 'rgb(25, 25, 25)';

		style.className = 'it-theme-editor';

		style.textContent = `
		:root {
			--yt-swatch-textbox-bg:rgba(19,19,19,1)!important;
			--yt-swatch-icon-color:rgba(136,136,136,1)!important;

			--yt-spec-brand-background-primary:rgba(0,0,0,0.1)!important;
			--yt-spec-brand-background-secondary:rgba(0,0,0,0.1)!important;

			--yt-spec-badge-chip-background:rgba(0,0,0,0.05)!important;
			--yt-spec-verified-badge-background:rgba(0,0,0,0.15)!important;

			--yt-spec-button-chip-background-hover:rgba(0,0,0,0.10)!important;
			--yt-spec-brand-button-background:rgba(136,136,136,1)!important;

			--yt-spec-filled-button-focus-outline:rgba(0,0,0,0.60)!important;
			--yt-spec-call-to-action-button-focus-outline:rgba(0,0,0,0.30)!important;

			--yt-spec-brand-text-button-focus-outline:rgba(204,0,0,0.30)!important;
			--yt-spec-10-percent-layer:rgba(136,136,136,1)!important;

			/* HEADER */
			--yt-swatch-header-primary:${secondary_color}!important;
			--ytd-masthead-background:${secondary_color}!important;
			--yt-spec-brand-background:${secondary_color}!important;
			--ytd-topbar-background-color:${secondary_color}!important;
			--yt-masthead-background:${secondary_color}!important;

			/* BACKGROUND */
			--yt-spec-general-background-a:${primary_color}!important;
			--yt-spec-general-background-b:${primary_color}!important;
			--yt-spec-general-background-c:${primary_color}!important;
			--yt-spec-base-background:${primary_color}!important;

			--yt-spec-raised-background:${primary_color}!important;
			--yt-spec-menu-background:${primary_color}!important;

			--ytd-searchbox-background:${primary_color}!important;

			/* TEXT */
			--yt-spec-text-primary:${text_color}!important;
			--yt-spec-text-secondary:${text_color}!important;
			--yt-spec-text-disabled:${text_color}!important;

			--yt-spec-icon-active-other:${text_color}!important;
			--yt-spec-icon-inactive:${text_color}!important;

			background-color: var(--yt-spec-base-background)!important;
		}

		ytd-masthead, #masthead, ytd-app #masthead {
			background-color: ${secondary_color} !important;
		}
		`;


		if (!existingStyle) {
			document.head.appendChild(style);
		}

		clearInterval(this.themeInterval);
		this.themeInterval = setInterval(() => {
			if (!document.querySelector('.it-theme-editor')) {
				document.head.appendChild(style);
			}
		}, 2000);

		document.documentElement.removeAttribute('dark');
		document.querySelector('ytd-masthead')?.removeAttribute('dark');
		document.getElementById('cinematics')?.style.setProperty("display", "none");

	} else {
		document.querySelector('.it-theme-editor')?.remove();
		clearInterval(this.themeInterval);
	}
};