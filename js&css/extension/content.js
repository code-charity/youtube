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

    // After DOM is loaded, check the switch state and fetch data even if the video ID is the same
    checkSwitchStateAndFetchData();
    sendVideoIdToBackground()

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

    // Listen for messages from the background.js script
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.action === 'append-channel-info') {
            const {channelName, uploadTime, videoCount, customUrl} = message;

            // Forward the message to the web-accessible/www.youtube.com/channel.js script
            window.postMessage(
                {
                    type: 'CHANNEL_INFO',
                    channelName,
                    uploadTime,
                    videoCount,
                    customUrl,
                    switchState: true
                },
            );
        } else if (message.action === 'remove-channel-info') {
            // Forward the message to the web-accessible/www.youtube.com/channel.js script
            window.postMessage(
                {
                    type: 'CHANNEL_INFO',
                    switchState: false
                },
            );
        }
    });
})