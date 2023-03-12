/*--------------------------------------------------------------
>>> FUNCTIONS:
----------------------------------------------------------------
# Attributes
# Export settings
# Import settings
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# ATTRIBUTES
--------------------------------------------------------------*/

extension.attributes = function () {
	var attributes = {
		theme: true,
		improvedtube_home: true,
		title_version: true,
		it_general: true,
		it_appearance: true,
		it_themes: false,
		it_player: true,
		it_playlist: true,
		it_channel: true,
		it_shortcuts: true,
		it_blacklist: true,
		it_analyzer: true,
		layer_animation_scale: true
	};

	for (var attribute in attributes) {
		var value = satus.storage.get(attribute);

		if (attribute === 'improvedtube_home') {
			attribute = 'home-style';
		}

		if (satus.isset(value)) {
			extension.skeleton.rendered.setAttribute(attribute.replace('it_', '').replace(/_/g, '-'), value);
		}
	}
};


/*--------------------------------------------------------------
# EXPORT SETTINGS
--------------------------------------------------------------*/

extension.exportSettings = function () {
	if (location.href.indexOf('action=export-settings') !== -1) {
		satus.render({
			component: 'modal',
			variant: 'confirm',
			content: 'areYouSureYouWantToExportTheData',
			buttons: {
				cancel: {
					component: 'button',
					text: 'cancel',
					on: {
						click: function () {
							this.modalProvider.close();
						}
					}
				},
				ok: {
					component: 'button',
					text: 'ok',
					on: {
						click: function () {
							try {
								var blob = new Blob([JSON.stringify(satus.storage.data)], {
									type: 'application/json;charset=utf-8'
								});

								chrome.permissions.request({
									permissions: ['downloads']
								}, function (granted) {
									if (granted) {
										chrome.downloads.download({
											url: URL.createObjectURL(blob),
											filename: 'improvedtube.json',
											saveAs: true
										}, function () {
											setTimeout(function () {
												close();
											}, 1000);
										});
									}
								});
							} catch (error) {
								console.error(error);
							}
						}
					}
				}
			}
		}, extension.skeleton.rendered);
	}
};


/*--------------------------------------------------------------
# IMPORT SETTINGS
--------------------------------------------------------------*/

extension.importSettings = function () {
	if (location.href.indexOf('action=import-settings') !== -1) {
		satus.render({
			component: 'modal',
			variant: 'confirm',
			content: 'areYouSureYouWantToImportTheData',
			buttons: {
				cancel: {
					component: 'button',
					text: 'cancel',
					on: {
						click: function () {
							this.modalProvider.close();
						}
					}
				},
				ok: {
					component: 'button',
					text: 'ok',
					on: {
						click: function () {
							var input = document.createElement('input');

							input.type = 'file';

							input.addEventListener('change', function () {
								var file_reader = new FileReader();

								file_reader.onload = function () {
									var data = JSON.parse(this.result);

									for (var key in data) {
										satus.storage.set(key, data[key]);
									}

									setTimeout(function () {
										chrome.runtime.sendMessage({
											action: 'import-settings'
										});

										setTimeout(function () {
											close();
										}, 128);
									}, 256);
								};

								file_reader.readAsText(this.files[0]);
							});

							input.click();
						}
					}
				}
			}
		}, extension.skeleton.rendered);
	}
};