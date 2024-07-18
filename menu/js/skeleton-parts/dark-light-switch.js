const isDark = () => {
	const themeElement = satus.storage.get('theme')
	const lightThemes = ['desert', 'dawn', 'plain', 'default']
	const darkThemes = ['sunset', 'night', 'dark', 'black']
	return darkThemes.includes(themeElement)
}

extension.skeleton.header.sectionEnd.darkLightSwitch.svgSun.on = {
	render: function () {
		console.log(satus.storage.get('lastLightTheme') + " " + satus.storage.get('lastDarkTheme'))
		if (isDark()) {
			this.style.display = 'none'
		}
	}
}

extension.skeleton.header.sectionEnd.darkLightSwitch.svgMoon.on = {
	render: function () {
		if (!isDark()) {
			this.style.display = 'none'
		}
	}
}

extension.skeleton.header.sectionEnd.darkLightSwitch.on = {
	click: function () {
		if (isDark()) {
			if (satus.storage.get('lastLightTheme')) {
				satus.storage.set('theme', satus.storage.get("lastLightTheme"))
			} else {
				satus.storage.set('theme', 'default')
			}
			document.getElementById('dark-light-switch-icon-sun').style.display = ''
			document.getElementById('dark-light-switch-icon-moon').style.display = 'none'
		} else {
			if (satus.storage.get('lastDarkTheme')) {
				satus.storage.set('theme', satus.storage.get("lastDarkTheme"))
			} else {
				satus.storage.set('theme', 'black')
			}
			document.getElementById('dark-light-switch-icon-sun').style.display = 'none'
			document.getElementById('dark-light-switch-icon-moon').style.display = ''
		}
	}
}

satus.storage.onchanged(() => {
	if (isDark()) {
		document.getElementById('dark-light-switch-icon-sun').style.display = 'none'
		document.getElementById('dark-light-switch-icon-moon').style.display = ''
		satus.storage.set('lastDarkTheme', satus.storage.get('theme'))
	} else {
		document.getElementById('dark-light-switch-icon-sun').style.display = ''
		document.getElementById('dark-light-switch-icon-moon').style.display = 'none'
		satus.storage.set('lastLightTheme', satus.storage.get('theme'))
	}
})
