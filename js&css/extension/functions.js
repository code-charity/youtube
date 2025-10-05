window.ImprovedTube = window.ImprovedTube || {};
/*--------------------------------------------------------------
>>> FUNCTIONS:
/*--------------------------------------------------------------
# GET URL PARAMETER
--------------------------------------------------------------*/
extension.functions.getUrlParameter = function (url, parameter) {
	var match = url.match(new RegExp('(\\?|\\&)' + parameter + '=[^&]+'));
	if (match) {return match[0].substr(3);}
};

/*------------------------------------------------------------------------------
DISABLE/ENABLE HOLD TO PLAY ON 2X SPEED (GLOBAL)
------------------------------------------------------------------------------*/
ImprovedTube._holdToPlayListener = null;

// DISABLE
ImprovedTube.disableHoldToPlay = function () {
	console.log('[ImprovedTube] disableHoldToPlay called');


	// REMOVE PREVIOUS LISTENERS
	if (this._holdToPlayListener) {
		document.removeEventListener('keydown', this._holdToPlayListener, true);
		document.removeEventListener('keyup', this._holdToPlayListener, true);
		document.removeEventListener('mousedown', this._holdToPlayListener, true);
		document.removeEventListener('mouseup', this._holdToPlayListener, true);
		this._holdToPlayListener = null;
		console.log('[ImprovedTube] Removed previous holdToPlay listeners');
	}


	this._holdToPlayListener = (e) => {
		// BLOCK SPACEBAR HOLD (block ALL keydown/keyup for Space)
		if ((e.type === 'keydown' && e.code === 'Space') ||
			(e.type === 'keyup' && e.code === 'Space')) {
			console.log('[ImprovedTube] Blocked spacebar event:', e.type, e);
			e.stopImmediatePropagation();
			e.preventDefault();
		}
		// BLOCK MOUSE HOLD
		if ((e.type === 'mousedown' || e.type === 'mouseup') && e.target.tagName === 'VIDEO') {
			console.log('[ImprovedTube] Blocked mouse event:', e.type, e);
			e.stopImmediatePropagation();
			e.preventDefault();
		}
	};


	document.addEventListener('keydown', this._holdToPlayListener, true);
	document.addEventListener('keyup', this._holdToPlayListener, true);
	document.addEventListener('mousedown', this._holdToPlayListener, true);
	document.addEventListener('mouseup', this._holdToPlayListener, true);
	console.log('[ImprovedTube] Attached holdToPlay listeners');

	// REATTACH LISTENERS IF VIDEO ELEMENT CHANGES (YOUTUBE SPA NAVIGATION)
	if (!this._holdToPlayVideoObserver) {
		this._holdToPlayVideoObserver = new MutationObserver(() => {
			// CHECK CHROME STORAGE FOR THE NEWEST VALUE
			chrome.storage.local.get('disable_hold_to_play_2x', (result) => {
				console.log('[ImprovedTube] MutationObserver: disable_hold_to_play_2x =', result.disable_hold_to_play_2x);
				if (result.disable_hold_to_play_2x) {
					ImprovedTube.disableHoldToPlay();
				} else {
					ImprovedTube.enableHoldToPlay();
				}
			});
		});
		const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
		if (player) {
			this._holdToPlayVideoObserver.observe(player, { childList: true, subtree: true });
			console.log('[ImprovedTube] MutationObserver attached to player');
		}
	}
};
// ENABLE
ImprovedTube.enableHoldToPlay = function () {
	console.log('[ImprovedTube] enableHoldToPlay called');
	if (this._holdToPlayListener) {
		document.removeEventListener('keydown', this._holdToPlayListener, true);
		document.removeEventListener('keyup', this._holdToPlayListener, true);
		document.removeEventListener('mousedown', this._holdToPlayListener, true);
		document.removeEventListener('mouseup', this._holdToPlayListener, true);
		this._holdToPlayListener = null;
		console.log('[ImprovedTube] Removed holdToPlay listeners (enable)');
	}
	if (this._holdToPlayVideoObserver) {
		this._holdToPlayVideoObserver.disconnect();
		this._holdToPlayVideoObserver = null;
		console.log('[ImprovedTube] MutationObserver disconnected (enable)');
	}
};

// LISTEN FOR STORAGE CHANGES TO UPDATE THE BEHAVIOR INSTANTLY
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
	chrome.storage.onChanged.addListener(function(changes, area) {
		if (area === 'local' && changes.disable_hold_to_play_2x) {
			console.log('[ImprovedTube] chrome.storage.onChanged: disable_hold_to_play_2x =', changes.disable_hold_to_play_2x.newValue);
			if (changes.disable_hold_to_play_2x.newValue) {
				ImprovedTube.disableHoldToPlay();
			} else {
				ImprovedTube.enableHoldToPlay();
			}
		}
	});
}

// CHECKS CHROME STORAGE ON CONTENT SCRIPT LOAD AND INITIALIZES
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
	chrome.storage.local.get('disable_hold_to_play_2x', (result) => {
		console.log('[ImprovedTube] Content script loaded. disable_hold_to_play_2x =', result.disable_hold_to_play_2x);
		if (result.disable_hold_to_play_2x) {
						// SCRIPT TAG INJECTION (TO CATCH EVENTS BEFORE YT DOES)
						const code = `
							(function() {
								function blockHoldToPlay(e) {
									if ((e.type === 'keydown' && e.code === 'Space') ||
										(e.type === 'keyup' && e.code === 'Space')) {
										console.log('[ImprovedTube injected] Blocked spacebar event:', e.type, e);
										e.stopImmediatePropagation();
										e.preventDefault();
									}
									if ((e.type === 'mousedown' || e.type === 'mouseup') && e.target.tagName === 'VIDEO') {
										console.log('[ImprovedTube injected] Blocked mouse event:', e.type, e);
										e.stopImmediatePropagation();
										e.preventDefault();
									}
								}
								window.addEventListener('keydown', blockHoldToPlay, true);
								window.addEventListener('keyup', blockHoldToPlay, true);
								window.addEventListener('mousedown', blockHoldToPlay, true);
								window.addEventListener('mouseup', blockHoldToPlay, true);
								console.log('[ImprovedTube injected] Hold-to-play block active');
							})();
						`;
			const script = document.createElement('script');
			script.textContent = code;
			(document.head || document.documentElement).appendChild(script);
			script.remove();
		}
		// RUN THE NORMAL CONTENT SCRIPT LOGIC
		if (result.disable_hold_to_play_2x) {
			ImprovedTube.disableHoldToPlay();
		} else {
			ImprovedTube.enableHoldToPlay();
		}
	});
}
/*------------------------------------------------------------------------------
END OF DISABLE/ENABLE HOLD TO PLAY ON 2X SPEED (GLOBAL)
------------------------------------------------------------------------------*/