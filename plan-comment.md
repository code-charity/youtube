# Plan Comment: Block Playlists Feature

## Summary

I'm working on #4348 to add playlist blocking support. The blocklist currently handles only videos and channels because:
1. The detection logic requires a video ID and exits early if none is found
2. The message handler only saves `type: 'channel'` and `type: 'video'` to storage

Playlists don't have video IDs (they use hrefs like `/podcasts`), so they're never processed or saved.

## The Fix

**Storage:** Add `blocklist.playlists` object (both in init.js initialization and blocklist.js)

**Detection:** Extract playlist ID before video ID check; allow processing nodes with playlists but no video IDs

**Persistence:** Add `case 'playlist':` to message handler in init.js so blocks are saved to storage

**UI:** Add third list button "Playlists" to settings menu (mirrors channels/videos pattern)

**Blocking:** Apply `it-blocklisted-playlist` CSS class to playlist tiles

**Testing:** Jest tests for storage init, ID extraction, message handling, add/remove, and persistence

**Files:** 4 files, ~250 lines of changes
- `js&css/extension/init.js` (add message handler case)
- `js&css/web-accessible/www.youtube.com/blocklist.js` (core logic)
- `menu/skeleton-parts/blocklist.js` (UI)
- `js&css/extension/www.youtube.com/styles.css` (styling)

## Open Questions

1. **Playlist ID extraction:** Different playlist types may have different URL structures. Will verify and refine during implementation.

2. **Blocking scope:** Should playlists hide from home feed only, or everywhere they appear? Will clarify if implementation reveals ambiguity.

## AI Disclosure

This plan was developed with AI assistance (Claude Haiku 4.5) during the CodePath AI301 course. The code analysis, architecture review, implementation steps, and testing strategy are AI-generated. The plan has been reviewed for correctness and will be verified during implementation.