/*--------------------------------------------------------------
>>> INDEX:
/*--------------------------------------------------------------
----------------------------------------------------------------
# Global variable  //moved to skeleton.js: (var extension = {skeleton:{} };
# INITIALIZATION
--------------------------------------------------------------*/
satus.storage.import(function (items) {
	var language = items.language;
	if (!language || language === 'default') { language = false;}
	satus.locale.import(language, function () {
		satus.render(extension.skeleton);

		extension.exportSettings();
		extension.importSettings();

		satus.parentify(extension.skeleton, [
			'attr',
			'baseProvider',
			'layersProvider',
			'rendered',
			'storage',
			'parentObject',
			'parentSkeleton',
			'childrenContainer',
			'value'
		]);

		extension.attributes();
		satus.events.on('storage-set', extension.attributes);
	}, '_locales/');
});

chrome.runtime.sendMessage({
	action: 'options-page-connected'
}, function (response) {
	if (response.isTab) {
		document.body.setAttribute('tab', '');
	}
});

// Add logic to store the user's preferred minimum video duration for recommendations
satus.storage.set('recommended_videos_min_duration', items.recommended_videos_min_duration || 0);
