// Function to get the video ID from the URL
function getVideoIdFromUrl() {
    const url = window.location.href;
    const urlObj = new URL(url);
    return urlObj.searchParams.get("v");
}

// Send the video ID to the background script
function sendVideoIdToBackground() {
    const videoId = getVideoIdFromUrl();
    if (videoId) {
        //console.log('Sending video ID to background:', videoId); 
        chrome.runtime.sendMessage({ action: 'store-video-id', videoId: videoId }, function(response) {
            //console.log('Response from background:', response); 
        });
    }
}

function createChannelInfo(channelName, uploadTime, videoCount, customUrl) {
    //console.log('Creating channel info:', channelName, uploadTime, videoCount, customUrl); // Debugging log
	const container = document.createElement('div');
	container.className = 'channel-info';

    const channelInfoContainer = document.createElement('div');

	if (uploadTime) {
		const uploadTimeElement = document.createElement('span');
		uploadTimeElement.className = 'upload-time';
		uploadTimeElement.textContent = `${uploadTime}`;
        channelInfoContainer.appendChild(uploadTimeElement);
		container.appendChild(channelInfoContainer);
	}
    if (videoCount) {
		const videoCountElement = document.createElement('span');
		videoCountElement.className = 'video-count';
		videoCountElement.textContent = ` (${videoCount} videos)`;
        channelInfoContainer.appendChild(videoCountElement);
		container.appendChild(channelInfoContainer);
	}

    const allVideosLink = document.createElement('a');
    allVideosLink.className = 'all-videos-link';
    allVideosLink.href = `https://www.youtube.com/${customUrl}/videos`;
    allVideosLink.title = 'All Videos';

    // Inline SVG
    allVideosLink.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill="gray">
        <path d="M4 4h6v6H4V4zm0 10h6v6H4v-6zm10-10h6v6h-6V4zm0 10h6v6h-6v-6z"/>
    </svg>
    `;
    container.appendChild(allVideosLink);

    const viewDataLink = document.createElement('a');
    viewDataLink.className = 'view-data-link';
    viewDataLink.href = 'https://ytlarge.com/youtube/video-data-viewer/';
    // Tooltip text using `title`
    viewDataLink.title = 'View detailed video data';

    // Information SVG Icon
    viewDataLink.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill="gray">
        <path d="M11 7h2V5h-2v2zm1 14c-5.52 0-10-4.48-10-10S6.48 1 12 1s10 4.48 10 10-4.48 10-10 10zm-1-5h2v-6h-2v6z"/>
    </svg>
    `;
    container.appendChild(viewDataLink);

    // Add custom CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .channel-info {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            gap: 2px;
            align-items: center;
            margin-right: 2px;
        }
        .channel-info .channel-name {
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
        }
        .channel-info .upload-time, .channel-info .video-count {
            color: #555;
            display: block;
            margin-bottom: 5px;
            width: 80px;
            font-size: 13px;
            font-weight: bold;
        }
        .channel-info .all-videos-link,
        .channel-info .view-data-link {
            font-family: 'Roboto', Arial, sans-serif;
            font-size: 13px;
            font-weight: bold;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            padding: 8px 8px;
            transition: background-color 0.3s ease, transform 0.2s ease;
        }
        .channel-info .all-videos-link:hover,
        .channel-info .view-data-link:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
	
	return container;
}

// Check if the switch is on and fetch new data. Otherwise, remove the details block
function checkSwitchStateAndFetchData() {
    chrome.runtime.sendMessage({ action: 'check-switch-state' }, function(response) {
        if (response.isSwitchOn) {
            chrome.runtime.sendMessage({ action: 'fetch-new-data' });
        } else {
            // Remove existing video details if the switch is off
            const targetElement = document.querySelector('.channel-info')
            if (targetElement) {
                targetElement.remove();
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    sendVideoIdToBackground()
    //console.log('Content script loaded');

    let previousVideoId = getVideoIdFromUrl();

    // Listen for changes in the video URL and send the updated video ID
    const observer = new MutationObserver(() => {
        const currentVideoId = getVideoIdFromUrl();
        if (currentVideoId !== previousVideoId) {
            previousVideoId = currentVideoId;

            sendVideoIdToBackground();

            checkSwitchStateAndFetchData();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Listen for visibility changes to handle page navigation
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            checkSwitchStateAndFetchData();
        }
    });

    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        //console.log('Received message from background:', message); // Debugging log
        if (message.action === 'append-channel-info') {
            //console.log('Switch on Details mode'); 
            const {channelName, uploadTime, videoCount, customUrl} = message;
            const channelInfo = createChannelInfo(channelName, uploadTime, videoCount, customUrl);
            const targetElement = document.querySelector('ytd-video-owner-renderer.style-scope.ytd-watch-metadata');
            if (targetElement) {
                // Removing existing channel info if present
                const existingChannelInfo = targetElement.querySelector('.channel-info');
                if(existingChannelInfo) {
                    existingChannelInfo.remove();
                }
                targetElement.appendChild(channelInfo);
            } else {
                console.error('Target element not found');
            }
        } else if (message.action === 'remove-channel-info') {
            //console.log('Switch off Details mode');
            const targetElement = document.querySelector('.channel-info');

            if(targetElement) {
                targetElement.remove();
            } else {
                console.error('Channel info element not found');
            }
        }
    });
})