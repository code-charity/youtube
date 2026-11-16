/*--------------------------------------------------------------
>>> ZEN MODE EXIT
----------------------------------------------------------------
The CSS does the hiding. This module adds one way back out: a
floating Exit button and Escape, both of which write zen_mode=off
through the same storage bridge the menu uses.
--------------------------------------------------------------*/
(function () {
	'use strict';

	function mode() {
		return ImprovedTube.storage.zen_mode;
	}

	function active() {
		var value = mode();
		return value === 'hide' || value === 'dim';
	}

	function exit() {
		ImprovedTube.storage.zen_mode = 'off';
		ImprovedTube.messages.send({ action: 'set', key: 'zen_mode', value: 'off' });
		apply();
	}

	function apply() {
		var button = document.querySelector('#it-zen-exit');

		if (!active()) {
			if (button) {
				button.remove();
			}
			return;
		}

		if (button) {
			return;
		}

		var dark = document.documentElement.hasAttribute('dark'),
			el = document.createElement('button');

		el.id = 'it-zen-exit';
		el.type = 'button';
		el.textContent = 'Exit Zen';
		el.title = 'Exit Zen mode (Esc)';
		el.style.cssText = 'position:fixed;right:16px;top:16px;z-index:2147483000;padding:8px 12px;border:0;border-radius:999px;cursor:pointer;font:600 12px/1 Roboto,Arial,sans-serif;background:' +
			(dark ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.08)') + ';color:' + (dark ? '#f1f1f1' : '#0f0f0f');
		el.style.backdropFilter = 'blur(8px)';
		el.addEventListener('click', exit);

		document.body.appendChild(el);
	}

	document.addEventListener('init_completed', apply);
	document.addEventListener('yt-navigate-finish', apply);
	document.addEventListener('it-message-from-extension', apply);
	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape' && active()) {
			exit();
		}
	});

	ImprovedTube.zenModeActive = active;
	ImprovedTube.zenModeExit = exit;
})();
