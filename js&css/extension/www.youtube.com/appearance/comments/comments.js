/*--------------------------------------------------------------
>>> COMMENTS:
----------------------------------------------------------------
# Collapsed
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# COLLAPSED
--------------------------------------------------------------*/

function handleCommentsClick(event) {
	if (event.type === 'click') {
		var target = event.target;

		if (target.nodeName === 'YTD-COMMENTS-HEADER-RENDERER') {
			var rect = target.getBoundingClientRect();

			if (
				event.clientX - rect.left >= 0 &&
				event.clientX - rect.left < rect.width &&
				event.clientY - rect.top + rect.height >= 0 &&
				rect.top + rect.height - event.clientY < 48
			) {
				target.parentNode.parentNode.parentNode.toggleAttribute('it-activated');
			}
		}
	}
}

extension.features.comments = function () {
	if (extension.storage.get('comments') === 'collapsed') {
		window.addEventListener('click', handleCommentsClick, true);
	}
};

extension.features.commentsDisable = function () {
	window.removeEventListener('click', handleCommentsClick, true);
};