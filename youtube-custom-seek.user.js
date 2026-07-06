// ==UserScript==
// @name         YouTube Custom Seek Distances
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Customize seek distances for double/triple/quadruple taps on YouTube.
// @author       You
// @match        *://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ===== Settings defaults =====
    const DEFAULT_SETTINGS = {
        mode: 'default', // 'default', 'fixed', 'progressive'
        fixed_seek: 5, // seconds
        progressive_taps: [10, 30, 60], // first, second, third tap total seeks
        progressive_additional: 30 // additional taps each seek increment
    };

    // ===== Load/Save settings =====
    function loadSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem('yt_custom_seek_settings'));
            if (saved && typeof saved === 'object') {
                return { ...DEFAULT_SETTINGS, ...saved };
            }
        } catch(e) {}
        return { ...DEFAULT_SETTINGS };
    }

    function saveSettings(settings) {
        localStorage.setItem('yt_custom_seek_settings', JSON.stringify(settings));
    }

    // ===== UI Creation =====
    function createSettingsPanel() {
        const panel = document.createElement('div');
        panel.id = 'yt-custom-seek-panel';
        panel.style.cssText = '
            position: fixed;
            top: 100px;
            right: 20px;
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 16px;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            width: 300px;
            display: none;
            font-family: Arial, sans-serif;
        ';

        panel.innerHTML = `
            <h3 style="margin-top:0;">Custom Seek Settings</h3>
            <div id="seek-mode-group">
                <label><input type="radio" name="seek-mode" value="default"> Default behavior (10, 30, ...)</label><br>
                <label><input type="radio" name="seek-mode" value="fixed"> Set seek distance</label><br>
                <label><input type="radio" name="seek-mode" value="progressive"> Increasing seek distance</label>
            </div>
            <div id="fixed-options" style="display:none; margin-top:8px;">
                <label>Seek (seconds): <input type="number" id="fixed-seek" value="5" min="1" max="600"></label>
            </div>
            <div id="progressive-options" style="display:none; margin-top:8px;">
                <label>Double-tap (sec): <input type="number" id="prog-double" value="10" min="1" max="600"></label><br>
                <label>Triple-tap (sec): <input type="number" id="prog-triple" value="30" min="1" max="600"></label><br>
                <label>Quadruple-tap (sec): <input type="number" id="prog-quad" value="60" min="1" max="600"></label><br>
                <label>Additional taps (sec per tap): <input type="number" id="prog-additional" value="30" min="1" max="600"></label>
            </div>
            <button id="save-settings" style="margin-top:12px; padding:6px 12px;">Save</button>
            <button id="close-panel" style="margin-left:8px; padding:6px 12px;">Close</button>
        `;

        document.body.appendChild(panel);
        return panel;
    }

    // ===== Toggle panel visibility =====
    function togglePanel() {
        const panel = document.getElementById('yt-custom-seek-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    // ===== Add UI toggle button to YouTube's top bar =====
    function addToggleButton() {
        const button = document.createElement('button');
        button.id = 'yt-custom-seek-toggle';
        button.textContent = 'Seek Settings';
        button.style.cssText = '
            background: #065fd4;
            color: #fff;
            border: none;
            border-radius: 2px;
            padding: 6px 12px;
            margin: 0 8px;
            cursor: pointer;
            font-size: 14px;
        ';
        button.addEventListener('click', togglePanel);

        // Wait for YouTube's top bar to appear
        const observer = new MutationObserver(() => {
            const topbar = document.querySelector('#top-level-buttons-computed');
            if (topbar && !document.getElementById('yt-custom-seek-toggle')) {
                topbar.appendChild(button);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ===== Load settings into UI =====
    function populateUI(settings) {
        const modeRadios = document.getElementsByName('seek-mode');
        for (const radio of modeRadios) {
            radio.checked = (radio.value === settings.mode);
        }
        document.getElementById('fixed-seek').value = settings.fixed_seek;
        document.getElementById('prog-double').value = settings.progressive_taps[0];
        document.getElementById('prog-triple').value = settings.progressive_taps[1];
        document.getElementById('prog-quad').value = settings.progressive_taps[2];
        document.getElementById('prog-additional').value = settings.progressive_additional;

        updateOptionsVisibility(settings.mode);
    }

    function updateOptionsVisibility(mode) {
        document.getElementById('fixed-options').style.display = mode === 'fixed' ? 'block' : 'none';
        document.getElementById('progressive-options').style.display = mode === 'progressive' ? 'block' : 'none';
    }

    // ===== Save handler =====
    function handleSave() {
        const modeRadios = document.getElementsByName('seek-mode');
        let mode = 'default';
        for (const radio of modeRadios) {
            if (radio.checked) {
                mode = radio.value;
                break;
            }
        }

        const settings = {
            mode: mode,
            fixed_seek: parseInt(document.getElementById('fixed-seek').value) || 5,
            progressive_taps: [
                parseInt(document.getElementById('prog-double').value) || 10,
                parseInt(document.getElementById('prog-triple').value) || 30,
                parseInt(document.getElementById('prog-quad').value) || 60
            ],
            progressive_additional: parseInt(document.getElementById('prog-additional').value) || 30
        };
        saveSettings(settings);
        alert('Settings saved!');
        // Apply immediately
        applySettings(settings);
    }

    // ===== Apply settings globally =====
    let currentSettings = loadSettings();

    function applySettings(settings) {
        currentSettings = settings;
        // The actual seek logic will refer to currentSettings
    }

    // ===== Override seek behavior =====
    // We'll intercept touchstart events on the video player and implement custom seeking.
    // We disable YouTube's native double-tap by preventing default on touchend? 
    // Actually, YouTube uses pointer events. We'll add our own handler that stops propagation.
    // We need to detect tap count and side.

    let tapCount = 0;
    let tapTimer = null;
    const TAP_DELAY = 500; // ms between taps to count consecutive

    function handleTap(event) {
        // Only if settings mode is not default
        if (currentSettings.mode === 'default') return;

        const video = document.querySelector('video');
        if (!video) return;

        // Determine left or right side
        const rect = video.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const isRightSide = x > rect.width / 2;

        // Increment tap count
        tapCount++;
        clearTimeout(tapTimer);

        tapTimer = setTimeout(() => {
            // After delay, if tapCount > 0, perform seek based on count
            if (tapCount >= 2) {
                performSeek(tapCount, isRightSide, video);
            }
            tapCount = 0;
        }, TAP_DELAY);

        // Prevent YouTube's default double-tap behavior
        event.preventDefault();
        event.stopPropagation();
    }

    function performSeek(count, forward, video) {
        let seekTime = 0;
        const settings = currentSettings;

        if (settings.mode === 'fixed') {
            seekTime = settings.fixed_seek;
        } else if (settings.mode === 'progressive') {
            const taps = settings.progressive_taps;
            if (count === 2) {
                seekTime = taps[0];
            } else if (count === 3) {
                seekTime = taps[1];
            } else if (count >= 4) {
                // Use quadruple-tap value plus additional for extra taps
                seekTime = taps[2] + (count - 4) * settings.progressive_additional;
            }
        }
        if (seekTime <= 0) return;

        if (!forward) {
            seekTime = -seekTime;
        }
        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seekTime));
    }

    // ===== Attach listener to video =====
    function setupVideoListener() {
        const video = document.querySelector('video');
        if (video && !video.dataset.customSeekAttached) {
            video.addEventListener('touchstart', handleTap, { passive: false });
            // Also for mouse double-click? But we focus on touch.
            video.dataset.customSeekAttached = 'true';
        }
    }

    // ===== Initialize =====
    function init() {
        // Add UI
        addToggleButton();
        const panel = createSettingsPanel();
        populateUI(currentSettings);

        // Radio change visibility
        document.getElementsByName('seek-mode').forEach(radio => {
            radio.addEventListener('change', function() {
                updateOptionsVisibility(this.value);
            });
        });

        // Save button
        document.getElementById('save-settings').addEventListener('click', handleSave);

        // Close button
        document.getElementById('close-panel').addEventListener('click', togglePanel);

        // Watch for video element
        const observer = new MutationObserver(() => {
            setupVideoListener();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Also try immediate
        setupVideoListener();
    }

    // Wait for YouTube's page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
