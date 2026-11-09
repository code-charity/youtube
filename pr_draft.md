# Add Playlist Blocking Support

## Summary
Adds support for blocking entire playlist types (Mixes, Podcasts, etc.) in the blocklist settings. Currently, playlists couldn't be blocked because the detection logic required video IDs and exited early. This PR extends the blocklist to handle playlists as a third blocking type alongside channels and videos.

## Changes
- **Storage**: Added `blocklist.playlists` object to store blocked playlist IDs
- **Detection**: Extract playlist IDs before video ID check to process playlist tiles
- **UI**: Added "Playlists" section to blocklist settings menu
- **Blocking**: Apply `it-blocklisted-playlist` CSS class to hide blocked playlists
- **Message Handler**: Added `case 'playlist'` to save blocked playlists to storage
- **Mutation Observer**: Updated to track and apply/remove playlist blocking
- **Cleanup**: Remove playlist CSS classes when blocklist is disabled
- **Styling**: Added CSS rule to hide blocked playlists

## Files Modified
- `js&css/extension/init.js`: Message handler for playlist blocks
- `js&css/web-accessible/www.youtube.com/blocklist.js`: Core blocking logic
- `menu/skeleton-parts/blocklist.js`: UI menu section
- `js&css/extension/www.youtube.com/styles.css`: CSS styling

## What AI Helped With
Claude Haiku 4.5 assisted with: architectural analysis of the existing blocklist system, mapping of required code changes across files, implementation of consistent patterns for playlist blocking (mirroring video/channel logic), and rapid iteration through implementation steps.

Fixes #4348
