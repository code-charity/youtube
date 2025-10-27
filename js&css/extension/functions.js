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
if (!window.improvedTubeRefreshCategoriesAdded && typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'refresh-youtube-categories') {
            let chipContainer = document.querySelector('ytd-feed-filter-chip-bar-renderer');
            
            if (chipContainer) {
                chipContainer.style.display = '';
                chipContainer.style.visibility = 'visible';
                chipContainer.style.opacity = '1';
                chipContainer.hidden = false;
                
                let parent = chipContainer.parentElement;
                while (parent && parent !== document.body) {
                    parent.style.display = '';
                    parent.style.visibility = 'visible';
                    parent = parent.parentElement;
                }
                
                const allChips = chipContainer.querySelectorAll('yt-chip-cloud-chip-renderer button');
                if (allChips.length > 1) {
                    allChips[1].click();
                    setTimeout(function() {
                        allChips[0].click();
                    }, 200);
                }
                
                sendResponse({ success: true });
            } else {
                window.location.reload();
                sendResponse({ success: true });
            }
            
            return true;
        }
    });
    
    window.improvedTubeRefreshCategoriesAdded = true;
}