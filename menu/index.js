/*--------------------------------------------------------------
>>> INDEX:
/*--------------------------------------------------------------
----------------------------------------------------------------
# Global variable  //moved to skeleton.js: (var extension = {skeleton:{} };
# INITIALIZATION
--------------------------------------------------------------*/
satus.storage.import(function (items) {
	var language = items.language;
	if (!language || language === 'default') { language = false; }
	satus.locale.import(language, function () {
		// Place normal skeleton into seperate function to only render if password is disabled or not required
		const renderSkeleton = () => {
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
		}

		// Shows login page if password exists and is required
		if (satus.storage.get("require_password") === true && satus.storage.get("password")) {
			satus.render({
				component: 'modal',
				textField: {
					component: "text-field",
					id: "login-input",
					placeholder: "Enter password",
					lineNumbers: false,
					rows: 1,

					// Focuses text box when extension is opened
					function() {
						document.getElementById('login-input').focus();
					},

					on: {
						input: function () {
							// Grabs password from storage for comparison
							const password = satus.storage.get("password");

							// If correct password is inputted, render regular menu
							if (this.value == password) {
								var modal = this.skeleton.parentSkeleton;
								modal.rendered.close();
								renderSkeleton();
							}
						},

						// Refocuses on password input box if clicked away
						blur: function () {
							const loginInput = document.getElementById('login-input');
							if (loginInput) loginInput.focus();
						}
					}
				}
			}, extension.skeleton.rendered);
		}
		else renderSkeleton(); // Render regular menu if password is not required
	}, '_locales/');
});

chrome.runtime.sendMessage({
	action: 'options-page-connected'
}, function (response) {
	if (response.isTab) {
		document.body.setAttribute('tab', '');
	}
});
