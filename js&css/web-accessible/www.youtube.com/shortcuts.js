let isProcessingScreenshot = false;

window.addEventListener('keydown', (event) => {
    // ... existing shortcut logic ...

    // Screenshot shortcut logic
    if (event.key === 's' && !isProcessingScreenshot) {
        isProcessingScreenshot = true;
        
        // Perform the screenshot capture logic
        // ... (existing code to take screenshot) ...

        // Reset flag after a short delay (e.g., 500ms) 
        // to prevent unintentional rapid-fire screenshots
        setTimeout(() => {
            isProcessingScreenshot = false;
        }, 500);
    }

    // ... rest of the existing code ...
});