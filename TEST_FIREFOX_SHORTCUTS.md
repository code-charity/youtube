# Firefox Shortcuts Bug Fix - Test Guide

## What Was Fixed

**Problem:** Keyboard shortcuts didn't work when the video player wasn't in focus on Firefox.

**Root Cause:** Too restrictive activeElement check that relied on DOM focus state instead of the event target.

**Solution Applied:**
1. Changed event listener check to prioritize `event.target` over `document.activeElement`
2. Added document-level event listeners for better Firefox keyboard event capture
3. Improved conditional logic to only block shortcuts when actually typing

---

## How to Test

### Prerequisites
- Firefox or Floorp browser
- ImprovedTube extension loaded
- YouTube video open

### Test Steps

1. **Open Extension Settings**
   - Click ImprovedTube icon → Settings
   - Go to: **Shortcuts** section

2. **Configure Test Shortcuts**
   - Set "Increase Volume" to `UP ARROW` key
   - Set "Decrease Volume" to `DOWN ARROW` key
   - Click Save

3. **Test 1: Player Focused (Should work before and after fix)**
   - Click on the video player
   - Press `UP ARROW` → Volume should increase ✓
   - Press `DOWN ARROW` → Volume should decrease ✓

4. **Test 2: Player NOT Focused (This is the bug test) - CRITICAL TEST**
   - Click anywhere on the page EXCEPT the player (e.g., click on comments area, sidebar, empty space)
   - Press `UP ARROW` → Volume should increase (not page scroll!) ✓
   - Press `DOWN ARROW` → Volume should decrease (not page scroll!) ✓
   - The page should NOT scroll up/down

5. **Test 3: Safety Check - Shortcuts should NOT work in input fields**
   - Open the search box (click search field)
   - Press `UP ARROW` → Should just type in search, NOT change volume ✓

### Expected Results After Fix

| Scenario | Expected Behavior | Status |
|----------|------------------|--------|
| Player focused + shortcut key | Shortcut executes | ✓ Should work |
| Player NOT focused + shortcut key | Shortcut executes (BUG FIX) | ✓ Should work now |
| In input field + shortcut key | Input receives key, no shortcut | ✓ Should work |
| In search box + shortcut key | Search receives key, no shortcut | ✓ Should work |

---

## If It Still Doesn't Work

If shortcuts still don't work when player is unfocused, try:

1. **Clear Extension Cache**
   - Go to `about:debugging` in Firefox
   - Find ImprovedTube
   - Click "Reload"

2. **Hard Reload YouTube**
   - Go to YouTube
   - Press `Ctrl+Shift+R` (hard refresh)

3. **Check Browser Console for Errors**
   - Press `F12` to open Developer Tools
   - Go to "Console" tab
   - Look for any red error messages
   - Report any errors in the GitHub issue

---

## Advanced Debugging (Optional)

If you want to see if the fix is working, open Browser Console and run:

```javascript
// Check if keyboard listeners are attached
console.log("ImprovedTube listeners:", ImprovedTube.input.listeners);

// Check what shortcuts are active
console.log("Active shortcuts:", Object.keys(ImprovedTube.input.listening));
```

You should see something like:
```
ImprovedTube listeners: {keydown: true, keyup: true, wheel: true, improvedtube-blur: true}
Active shortcuts: ['shortcutIncreaseVolume', 'shortcutDecreaseVolume']
```

---

## Summary

This fix improves Firefox compatibility by:
- ✅ Using event.target instead of document.activeElement for key checking
- ✅ Adding document-level listeners for keyboard events
- ✅ Better handling of YouTube's shadow DOM and complex structure
- ✅ Preventing accidental focus-based shortcut blocking

**Browser Support:** Chrome ✓ | Firefox ✓ (after fix) | Firefox Variants (Floorp, Librewolf, etc.) ✓
