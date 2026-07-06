// ==UserScript==
// @name         YouTube Custom Seek
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Customizable seek distances on double-tap
// @author       You
// @match        *://www.youtube.com/watch*
// @match        *://youtube.com/watch*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    // Default settings
    const defaultSettings = {
        mode: 'default',
        fixedDistance: 5,
        progDouble: 5,
        progTriple: 15,
        progQuadruple: 30,
        progAdditional: 30
    };

    let settings = {};

    // Load settings from storage (with GM_getValue, or chrome.storage if extension)
    function loadSettings() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.sync.get(defaultSettings, function(items) {
                settings = items;
            });
        } else {
            // Fallback to GM_getValue for userscript
            settings.mode = GM_getValue('seek_mode', defaultSettings.mode);
            settings.fixedDistance = GM_getValue('seek_fixedDistance', defaultSettings.fixedDistance);
            settings.progDouble = GM_getValue('seek_progDouble', defaultSettings.progDouble);
            settings.progTriple = GM_getValue('seek_progTriple', defaultSettings.progTriple);
            settings.progQuadruple = GM_getValue('seek_progQuadruple', defaultSettings.progQuadruple);
            settings.progAdditional = GM_getValue('seek_progAdditional', defaultSettings.progAdditional);
        }
    }

    // Listen for changes in storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.onChanged.addListener(function(changes, area) {
            if (area === 'sync') {
                for (let key in changes) {
                    settings[key] = changes[key].newValue;
                }
            }
        });
    }

    // Tap detection
    let tapCount = 0;
    let lastTapTime = 0;
    const TAP_INTERVAL = 500; // ms between taps to consider same sequence
    let tapTimeout = null;

    function resetTapCount() {
        tapCount = 0;
    }

    function handleTap(e) {
        const now = Date.now();
        if (now - lastTapTime > TAP_INTERVAL) {
            tapCount = 1;
        } else {
            tapCount++;
        }
        lastTapTime = now;

        // Clear previous timeout
        if (tapTimeout) clearTimeout(tapTimeout);

        // Wait a bit to see if more taps come, then execute seek
        tapTimeout = setTimeout(function() {
            if (tapCount >= 2) {
                executeSeek(tapCount, e);
            }
            tapCount = 0;
        }, TAP_INTERVAL);
    }

    function executeSeek(taps, e) {
        const video = document.querySelector('video.video-stream.html5-main-video');
        if (!video) return;

        let seekAmount = 0;
        const direction = (e.clientX < window.innerWidth / 2) ? -1 : 1; // Left side = backward, right side = forward

        switch (settings.mode) {
            case 'default':
                // Progressive: 10, 30, 60, 90, etc.
                if (taps === 2) seekAmount = 10;
                else if (taps === 3) seekAmount = 30;
                else if (taps === 4) seekAmount = 60;
                else seekAmount = 60 + (taps - 4) * 30;
                break;
            case 'fixed':
                seekAmount = settings.fixedDistance;
                break;
            case 'progressive':
                if (taps === 2) seekAmount = settings.progDouble;
                else if (taps === 3) seekAmount = settings.progTriple;
                else if (taps === 4) seekAmount = settings.progQuadruple;
                else seekAmount = settings.progQuadruple + (taps - 4) * settings.progAdditional;
                break;
            default:
                seekAmount = 10;
        }

        // Ensure seeking to correct direction
        const newTime = video.currentTime + direction * seekAmount;
        video.currentTime = Math.max(0, Math.min(video.duration, newTime));
    }

    // Listen for click/tap on the video player
    function init() {
        loadSettings();
        const player = document.querySelector('#movie_player');
        if (!player) {
            setTimeout(init, 1000);
            return;
        }
        player.addEventListener('click', function(e) {
            // Ignore clicks on controls
            if (e.target.closest('.ytp-chrome-controls, .ytp-progress-bar')) return;
            handleTap(e);
        });
    }

    init();
})();