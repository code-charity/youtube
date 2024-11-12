// Function to add the playback speed button once the video element is ready
function addPlaybackSpeedButton() {
    const videoElement = document.querySelector('video');
    
    // Check if the video element is available
    if (!videoElement) {
        console.log("Video element not found, retrying...");
        setTimeout(addPlaybackSpeedButton, 1000); // Retry after 1 second
        return;
    }

    // Create a playback speed button and add it to the UI
    const speedButton = document.createElement('button');
    speedButton.innerText = 'Speed: 1x';
    speedButton.style.position = 'fixed';
    speedButton.style.bottom = '10px';
    speedButton.style.right = '10px';
    speedButton.style.zIndex = '1000'; // Ensures it appears above other elements

    // Function to toggle playback speed
    speedButton.onclick = () => {
        const currentSpeed = videoElement.playbackRate;
        videoElement.playbackRate = currentSpeed >= 2 ? 1 : currentSpeed + 0.5;
        speedButton.innerText = `Speed: ${videoElement.playbackRate}x`; // Update button text
    };

    // Append the button to the page
    document.body.appendChild(speedButton);
    console.log("Playback speed button added successfully.");
}

// Run the function when the script loads
addPlaybackSpeedButton();
