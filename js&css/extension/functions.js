/*--------------------------------------------------------------
>>> FUNCTIONS:
/*--------------------------------------------------------------
# GET URL PARAMETER
--------------------------------------------------------------*/
extension.functions.getUrlParameter = function (url, parameter) {
	var match = url.match(new RegExp('(\\?|\\&)' + parameter + '=[^&]+'));
	if (match) {return match[0].substr(3);}
};

/*--------------------------------------------------------------
# REFRESH YOUTUBE CATEGORIES 
--------------------------------------------------------------*/
console.log('Content script loaded!', window.location.href);

if (!window.improvedTubeListenerAdded && chrome && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'refresh-youtube-categories') {
            console.log('Refresh categories request received');

            let responded = false;

            function refreshChipBar(chipContainer) {
                const parent = chipContainer.parentNode;
                const nextSibling = chipContainer.nextSibling;
                
                parent.removeChild(chipContainer);
                
                void parent.offsetHeight;
                
                requestAnimationFrame(() => {
                    parent.insertBefore(chipContainer, nextSibling);
                    if (!responded) {
                        sendResponse({ success: true });
                        responded = true;
                    }
                });
            }

            let chipContainer = document.querySelector('ytd-feed-filter-chip-bar-renderer');
            if (chipContainer) {
                refreshChipBar(chipContainer);
            } else {
                console.log('Chip bar not found, observing DOM...');
                const observer = new MutationObserver((mutations, obs) => {
                    chipContainer = document.querySelector('ytd-feed-filter-chip-bar-renderer');
                    if (chipContainer) {
                        refreshChipBar(chipContainer);
                        obs.disconnect();
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });

                setTimeout(() => {
                    if (!responded) {
                        sendResponse({ success: false, error: 'Chip container not found in time' });
                        responded = true;
                        observer.disconnect();
                    }
                }, 5000);
            }

            return true; 
        }
    });

    window.improvedTubeListenerAdded = true;
}