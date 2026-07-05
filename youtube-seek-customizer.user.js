// ==UserScript==
// @name         YouTube Seek Customizer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Customize seek distances on double-tap / multi-tap on YouTube
// @author       You
// @match        *://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Default settings
    const DEFAULT_SETTINGS = {
        mode: 'default', // 'default', 'fixed', 'progressive'
        fixedSeconds: 5,
        doubleTapSeconds: 3,
        tripleTapTotal: 10,
        quadrupleTapTotal: 20,
        additionalTapIncrement: 15
    };

    let settings = loadSettings();
    let tapCount = 0;
    let tapTimer = null;
    let lastTapTime = 0;
    let tapEvent = null; // store the last tap event to use for seek direction

    // Load settings from localStorage
    function loadSettings() {
        try {
            const stored = localStorage.getItem('ytSeekCustomizer');
            if (stored) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
        } catch (e) {}
        return { ...DEFAULT_SETTINGS };
    }

    // Save settings to localStorage
    function saveSettings() {
        localStorage.setItem('ytSeekCustomizer', JSON.stringify(settings));
    }

    // Wait for video element to be ready
    function waitForVideo() {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                const video = document.querySelector('video');
                if (video) {
                    clearInterval(interval);
                    resolve(video);
                }
            }, 500);
        });
    }

    // Determine seek direction based on tap position
    function getSeekDirection(event) {
        const video = event.currentTarget;
        const rect = video.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const mid = rect.width / 2;
        return x < mid ? -1 : 1; // -1: backward, +1: forward
    }

    // Perform seek based on settings and tap count
    function performSeek(event, count) {
        const video = event.currentTarget;
        const direction = getSeekDirection(event);
        let seekAmount = 0;

        if (settings.mode === 'fixed') {
            seekAmount = settings.fixedSeconds;
        } else if (settings.mode === 'progressive') {
            switch (count) {
                case 2:
                    seekAmount = settings.doubleTapSeconds;
                    break;
                case 3:
                    seekAmount = settings.tripleTapTotal;
                    break;
                case 4:
                    seekAmount = settings.quadrupleTapTotal;
                    break;
                default:
                    seekAmount = (count - 4) * settings.additionalTapIncrement + settings.quadrupleTapTotal;
                    break;
            }
        } else {
            // default: do nothing (YouTube handles)
            return;
        }

        video.currentTime += direction * seekAmount;
    }

    // Handle tap (click) event
    function handleTap(event) {
        const now = Date.now();
        // Ignore if it's not a double-tap or more (we'll handle all taps)
        if (now - lastTapTime > 500) {
            tapCount = 0;
        }
        tapCount++;
        lastTapTime = now;
        tapEvent = event;

        // Clear previous timer
        if (tapTimer) {
            clearTimeout(tapTimer);
        }

        // Set timer to trigger seek after tap sequence ends
        tapTimer = setTimeout(() => {
            if (tapCount >= 2) {
                performSeek(tapEvent, tapCount);
            }
            tapCount = 0;
            tapTimer = null;
        }, 300); // Wait 300ms after last tap
    }

    // Hook into video element
    function setupVideo(video) {
        video.addEventListener('click', handleTap);
        // Prevent default YouTube double-tap seek when mode is not 'default'
        video.addEventListener('dblclick', (e) => {
            if (settings.mode !== 'default') {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }

    // UI - Settings panel
    function createSettingsUI() {
        const container = document.createElement('div');
        container.id = 'ytSeekCustomizerPanel';
        container.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: #222;
            color: #eee;
            padding: 15px;
            border-radius: 8px;
            z-index: 9999;
            display: none;
            font-family: Arial, sans-serif;
            min-width: 300px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        `;

        const title = document.createElement('h3');
        title.textContent = 'Seek Customizer';
        title.style.marginTop = '0';
        container.appendChild(title);

        // Mode radio buttons
        const modes = ['default', 'fixed', 'progressive'];
        const modeLabels = {
            'default': 'Default behavior (YouTube default)',
            'fixed': 'Fixed seek distance',
            'progressive': 'Custom progressive jump lengths'
        };

        for (const mode of modes) {
            const label = document.createElement('label');
            label.style.display = 'block';
            label.style.marginBottom = '5px';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'seekMode';
            radio.value = mode;
            radio.checked = settings.mode === mode;
            radio.addEventListener('change', (e) => {
                settings.mode = e.target.value;
                updateVisibility();
                saveSettings();
            });
            label.appendChild(radio);
            label.appendChild(document.createTextNode(' ' + modeLabels[mode]));
            container.appendChild(label);
        }

        // Fixed seek settings
        const fixedDiv = document.createElement('div');
        fixedDiv.id = 'fixedSettings';
        fixedDiv.style.marginTop = '10px';
        if (settings.mode !== 'fixed') fixedDiv.style.display = 'none';

        const fixedLabel = document.createElement('label');
        fixedLabel.textContent = 'Seek seconds: ';
        const fixedInput = document.createElement('input');
        fixedInput.type = 'number';
        fixedInput.min = '1';
        fixedInput.max = '120';
        fixedInput.value = settings.fixedSeconds;
        fixedInput.style.width = '60px';
        fixedInput.addEventListener('change', (e) => {
            settings.fixedSeconds = parseInt(e.target.value) || 5;
            saveSettings();
        });
        fixedLabel.appendChild(fixedInput);
        fixedDiv.appendChild(fixedLabel);
        container.appendChild(fixedDiv);

        // Progressive settings
        const progDiv = document.createElement('div');
        progDiv.id = 'progressiveSettings';
        progDiv.style.marginTop = '10px';
        if (settings.mode !== 'progressive') progDiv.style.display = 'none';

        const tapLabels = ['Double-tap:', 'Triple-tap (total):', 'Quadruple-tap (total):', 'Additional tap (increment):'];
        const tapKeys = ['doubleTapSeconds', 'tripleTapTotal', 'quadrupleTapTotal', 'additionalTapIncrement'];

        for (let i = 0; i < tapLabels.length; i++) {
            const label = document.createElement('label');
            label.style.display = 'block';
            label.style.marginBottom = '5px';
            label.textContent = tapLabels[i] + ' ';
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.max = '999';
            input.value = settings[tapKeys[i]];
            input.style.width = '60px';
            input.dataset.key = tapKeys[i];
            input.addEventListener('change', (e) => {
                settings[e.target.dataset.key] = parseInt(e.target.value) || 1;
                saveSettings();
            });
            label.appendChild(input);
            progDiv.appendChild(label);
        }

        // Add note about additional taps
        const note = document.createElement('p');
        note.textContent = 'Note: For 5+ taps, total = quadruple total + (additional taps - 4) * increment.';
        note.style.fontSize = '12px';
        note.style.color = '#aaa';
        progDiv.appendChild(note);

        container.appendChild(progDiv);

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = `
            margin-top: 10px;
            background: #555;
            color: #eee;
            border: none;
            padding: 5px 15px;
            border-radius: 4px;
            cursor: pointer;
            float: right;
        `;
        closeBtn.addEventListener('click', () => {
            container.style.display = 'none';
        });
        container.appendChild(closeBtn);

        document.body.appendChild(container);

        // Function to update visibility of sub-settings
        function updateVisibility() {
            fixedDiv.style.display = settings.mode === 'fixed' ? 'block' : 'none';
            progDiv.style.display = settings.mode === 'progressive' ? 'block' : 'none';
        }

        // Toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'ytSeekToggle';
        toggleBtn.textContent = 'Seek Settings';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: #333;
            color: #eee;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 12px;
        `;
        toggleBtn.addEventListener('click', () => {
            const panel = document.getElementById('ytSeekCustomizerPanel');
            if (panel.style.display === 'none' || panel.style.display === '') {
                panel.style.display = 'block';
                toggleBtn.style.right = '350px';
            } else {
                panel.style.display = 'none';
                toggleBtn.style.right = '20px';
            }
        });
        document.body.appendChild(toggleBtn);
    }

    // Initialize
    async function init() {
        const video = await waitForVideo();
        setupVideo(video);
        createSettingsUI();
    }

    init();
})();