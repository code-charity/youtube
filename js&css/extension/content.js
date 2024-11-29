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
        console.log('Sending video ID to background:', videoId); 
        chrome.runtime.sendMessage({ action: 'store-video-id', videoId: videoId }, function(response) {
            console.log('Response from background:', response); 
        });
    }
}

function createChannelInfo(channelName, uploadTime, videoCount, customUrl) {
    console.log('Creating channel info:', channelName, uploadTime, videoCount, customUrl); // Debugging log
	const container = document.createElement('div');
	container.className = 'channel-info';

    // Add a line break after the upload time
    const lineBreak = document.createElement('br');

	if (uploadTime) {
		const uploadTimeElement = document.createElement('span');
		uploadTimeElement.className = 'upload-time';
		uploadTimeElement.textContent = `${uploadTime}`;
		container.appendChild(uploadTimeElement);
        container.appendChild(lineBreak);
	}

	const allVideosLink = document.createElement('a');
	allVideosLink.className = 'all-videos-link';
	allVideosLink.href = `https://www.youtube.com/${customUrl}/videos`;
	allVideosLink.textContent = 'All videos';
	container.appendChild(allVideosLink);

	if (videoCount) {
		const videoCountElement = document.createElement('span');
		videoCountElement.className = 'video-count';
		videoCountElement.textContent = ` (${videoCount} videos)`;
		container.appendChild(videoCountElement);
        container.appendChild(lineBreak);
	}

	const viewDataLink = document.createElement('a');
	viewDataLink.className = 'view-data-link';
	viewDataLink.href = 'https://ytlarge.com/youtube/video-data-viewer/';
	viewDataLink.textContent = 'View video data';
	container.appendChild(viewDataLink);

    // Add custom CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .channel-info {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            padding: 10px;
            margin-top: 10px;
            margin-left: 10px;
            margin-right: 10px;
            border-radius: 5px;
        }
        .channel-info .channel-name {
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
        }
        .channel-info .upload-time {
            color: #555;
            display: block;
            margin-bottom: 5px;
        }
        .channel-info .all-videos-link,
        .channel-info .view-data-link {
            color: #1a73e8;
            text-decoration: none;
            margin-right: 10px;
        }
        .channel-info .all-videos-link:hover,
        .channel-info .view-data-link:hover {
            text-decoration: underline;
        }
        .channel-info .video-count {
            color: #333;
            display: block;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(style);
	
	return container;
}

document.addEventListener('DOMContentLoaded', function() {
    sendVideoIdToBackground()
    let previousVideoId = getVideoIdFromUrl();

    // Listen for changes in the video URL and send the updated video ID
    const observer = new MutationObserver(() => {
        const currentVideoId = getVideoIdFromUrl();
        if (currentVideoId !== previousVideoId) {
            previousVideoId = currentVideoId;
            sendVideoIdToBackground();

            // Check if the switch is on and fetch new-data
            chrome.runtime.sendMessage({ action: 'fetch-new-data' });
        }
    })
    observer.observe(document.body, { childList: true, subtree: true });

    // Listen for visibility changes to handle page navigation
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            // Check if the switch is on and re-fetch data if the user returns to the video page
            chrome.runtime.sendMessage({ action: 'fetch-new-data' });
        }
    });

    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        console.log('Received message from background:', message); // Debugging log
        if (message.action === 'append-channel-info') {
            console.log('Switch on Details mode'); 
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
            console.log('Switch off Details mode');
            const targetElement = document.querySelector('.channel-info');
            console.log(targetElement)
            if(targetElement) {
                targetElement.remove();
            } else {
                console.error('Channel info element not found');
            }
        }
    });
})