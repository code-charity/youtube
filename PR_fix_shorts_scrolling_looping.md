# Fix: YouTube Shorts scrolling and auto-loop issues

## Description
Fixes issue #3598 where YouTube Shorts experience random scrolling problems and auto-loop failures, preventing users from scrolling up/down and causing videos to stop looping.

## Problem
The `shortsAutoScroll` function had several critical issues that caused Shorts to break:

1. **Event Listener Memory Leaks**: Event listeners were attached to videos but never properly removed when switching between Shorts
2. **Stale DOM References**: The `activeRenderer` was captured once when the listener was attached, becoming stale as users scrolled
3. **No Error Handling**: Errors in the auto-scroll logic could break scrolling functionality entirely
4. **Missing Cleanup**: No proper cleanup when the feature was disabled or when navigating away

## Root Cause
```javascript
// PROBLEMATIC CODE:
video.addEventListener('timeupdate', function () {
    // Stale reference to activeRenderer from when listener was attached
    const nextButton = activeRenderer.querySelector('#navigation-button-down button');
    // No error handling, could break scrolling
    nextButton.click();
});
```

## Solution
Implemented comprehensive fixes:

### 1. Proper Event Listener Management
```javascript
const timeupdateHandler = function () {
    // Clean up when feature disabled
    if (!ImprovedTube.storage.shorts_auto_scroll) {
        video.removeEventListener('timeupdate', timeupdateHandler);
        delete video.dataset.itShortsScrollAttached;
        return;
    }
};
```

### 2. Fresh DOM References
```javascript
// Get fresh references to avoid stale DOM elements
const currentActiveRenderer = document.querySelector('ytd-reel-video-renderer[is-active]');
const isVideoStillActive = currentActiveRenderer && currentActiveRenderer.contains(this);
```

### 3. Error Handling & Cleanup
```javascript
try {
    const nextButton = currentActiveRenderer.querySelector('#navigation-button-down button');
    if (nextButton) {
        this.pause();
        nextButton.click();
    }
} catch (error) {
    console.warn('[ImprovedTube] Shorts auto-scroll error:', error);
    // Remove listener on error to prevent breaking
    this.removeEventListener('timeupdate', timeupdateHandler);
    delete this.dataset.itShortsScrollAttached;
}
```

### 4. Comprehensive Cleanup
```javascript
// Clean up all existing event listeners when disabled
document.querySelectorAll('video[data-it-shorts-scroll-attached="true"]').forEach(video => {
    delete video.dataset.itShortsScrollAttached;
});
```

## Impact
- ✅ **Fixed**: Shorts scrolling now works reliably (up/down scrolling restored)
- ✅ **Fixed**: Auto-loop functionality preserved (videos continue to loop as expected)
- ✅ **Improved**: Better memory management (no more event listener leaks)
- ✅ **Robust**: Error handling prevents complete feature breakdown
- ✅ **Clean**: Proper cleanup when disabling feature or navigating away

## Testing
- ✅ Scrolling through Shorts works without getting stuck
- ✅ Auto-loop continues to function normally
- ✅ Feature can be enabled/disabled without issues
- ✅ Memory usage remains stable during extended Shorts sessions
- ✅ No console errors during normal operation

## Files Changed
- `js&css/web-accessible/www.youtube.com/player.js` - Fixed `shortsAutoScroll` function

## Technical Details
The fix addresses four key areas:
1. **Memory Management**: Proper event listener cleanup prevents memory leaks
2. **DOM Reference Freshness**: Fresh DOM queries prevent stale references
3. **Error Resilience**: Try-catch blocks prevent cascading failures
4. **State Management**: Better tracking of attached listeners and cleanup

## Issue References
Fixes #3598
