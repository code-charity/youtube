/*------------------------------------------------------------------------------
LAST WATCHED OVERLAY ON THUMBNAILS (ROBUSTE VERSION)
------------------------------------------------------------------------------*/
ImprovedTube.lastWatchedOverlay = function () {
        if (ImprovedTube.storage.show_last_watched_overlay === true) {
        console.log("[LWO] Feature function called");

        (function addStyles() {
            if (document.getElementById('it-last-watched-overlay-style')) return;

            const style = document.createElement('style');
            style.id = 'it-last-watched-overlay-style';
            style.textContent = `
        .it-last-watched-overlay {
            position: absolute;
            background: rgba(0, 0, 0, 0.75);
            color: white;
            padding: 2px 5px;
            font-size: 11px;
            border-radius: 3px;
            z-index: 2147483647; /* Maximal nach vorne */
            pointer-events: none;
            opacity: 1 !important; /* Immer sichtbar */
            transition: none;
            white-space: nowrap;
        }
        /* Container-Kennzeichnung */
        .it-lwo-container { position: relative !important; }
    `;
            document.head.appendChild(style);
        })();

        // Track der Container (Element -> videoId) für Updates
        const overlayMap = new WeakMap();

        // Stelle sicher, dass wir einen Storage haben
        if (!ImprovedTube.storage.watch_history) {
            ImprovedTube.storage.watch_history = {};
        }

        console.log("[LWO] Videos in history:", Object.keys(ImprovedTube.storage.watch_history).length);

        // Persistenz: Laden aus chrome.storage.local oder localStorage
        let watchHistoryLoaded = false;
        let queuedInitialProcess = false;
        const PERSIST_KEY = 'it_watch_history';

        function mergeHistory(obj) {
            if (!obj || typeof obj !== 'object') return;
            const target = ImprovedTube.storage.watch_history;
            let added = 0;
            for (const [k, v] of Object.entries(obj)) {
                if (!target[k] || (typeof v === 'number' && v > target[k])) {
                    target[k] = v;
                    added++;
                }
            }
            if (added) {
                console.log(`[LWO] Merged ${added} persisted history entries`);
            }
        }

        function loadPersistedHistory() {
            if (watchHistoryLoaded) return;
            try {
                if (typeof chrome !== 'undefined' && chrome.storage?.local?.get) {
                    chrome.storage.local.get(PERSIST_KEY, res => {
                        try {
                            if (res && res[PERSIST_KEY]) mergeHistory(res[PERSIST_KEY]);
                            else {
                                const ls = localStorage.getItem(PERSIST_KEY);
                                if (ls) mergeHistory(JSON.parse(ls));
                            }
                        } catch (e) { console.warn('[LWO] merge error', e) }
                        watchHistoryLoaded = true;
                        if (queuedInitialProcess) processPage(); else processPage();
                    });
                } else {
                    const ls = localStorage.getItem(PERSIST_KEY);
                    if (ls) { try { mergeHistory(JSON.parse(ls)); } catch (e) { console.warn('[LWO] localStorage parse failed', e); } }
                    watchHistoryLoaded = true;
                    processPage();
                }
            } catch (e) { console.warn('[LWO] loadPersistedHistory error', e); watchHistoryLoaded = true; processPage(); }
        }

        // Debounced Speichern
        let saveTimeout;
        function scheduleSaveHistory() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveHistory, 600);
        }

        function saveHistory() {
            try {
                // Limitieren (älteste Einträge entfernen) – defensive Sortierung
                const h = ImprovedTube.storage.watch_history;
                const ids = Object.keys(h);
                const MAX = 1000;
                if (ids.length > MAX) {
                    ids.sort((a, b) => h[a] - h[b]);
                    for (let i = 0; i < ids.length - MAX; i++) delete h[ids[i]];
                }
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local && chrome.storage.local.set) {
                    chrome.storage.local.set({ [PERSIST_KEY]: h });
                } else {
                    localStorage.setItem(PERSIST_KEY, JSON.stringify(h));
                }
            } catch (e) {
                console.warn('[LWO] saveHistory error', e);
            }
        }

        loadPersistedHistory();

        function formatTimestamp(ts) {
            const mode = ImprovedTube.storage.last_watched_format || 'relative';
            if (mode === 'exact') {
                const d = new Date(ts);
                const pad = n => String(n).padStart(2, '0');
                // Format: YYYY.M.D / HH:MM  (Monat ohne führende Null laut Beispiel, Stunde mit führender Null)
                return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} / ${pad(d.getHours())}:${pad(d.getMinutes())}`;
            }
            const diff = Math.floor((Date.now() - ts) / 1000);
            if (diff < 60) return diff + 's ago';
            if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
            if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
            return Math.floor(diff / 86400) + 'd ago';
        }

        // Verbesserte Video-ID-Extraktion
        function getVideoId(href) {
            if (!href) return null;

            try {
                // Relative URLs verarbeiten
                const fullUrl = href.startsWith('/') ?
                    `https://www.youtube.com${href}` : href;

                const url = new URL(fullUrl);

                // Watch-URL
                if (url.pathname === '/watch') {
                    return url.searchParams.get('v');
                }

                // Shorts-URL
                if (url.pathname.startsWith('/shorts/')) {
                    return url.pathname.split('/shorts/')[1];
                }

                return null;
            } catch (e) {
                console.error("[LWO] URL parsing error:", e);
                return null;
            }
        }

        // Verbesserte Overlay-Funktion
        function addOrUpdateOverlay(thumbnail) {
            if (!thumbnail || !thumbnail.isConnected) return;
            let anchor = thumbnail;
            if (thumbnail.tagName !== 'A') {
                anchor = thumbnail.querySelector('a#thumbnail, a.ytd-thumbnail');
            }
            if (!anchor || !anchor.href) return;
            const videoId = getVideoId(anchor.href);
            if (!videoId) return;
            const ts = ImprovedTube.storage.watch_history[videoId];
            if (!ts) return; // nicht gesehen

            const container = thumbnail.closest('ytd-thumbnail') || thumbnail;
            if (!container) return;
            container.classList.add('it-lwo-container');
            let overlay = container.querySelector(':scope > .it-last-watched-overlay');
            const label = formatTimestamp(ts);
            const position = ImprovedTube.storage.last_watched_overlay_position || 'bottom-right';
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'it-last-watched-overlay';
                overlay.dataset.videoId = videoId;
                container.appendChild(overlay);
            }
            // Position (zurücksetzen zuerst)
            overlay.style.top = overlay.style.bottom = overlay.style.left = overlay.style.right = '';
            if (position.includes('bottom')) overlay.style.bottom = '5px'; else overlay.style.top = '5px';
            if (position.includes('right')) overlay.style.right = '5px'; else overlay.style.left = '5px';
            overlay.textContent = 'Watched (' + label + ')';
            overlayMap.set(container, videoId);
        }

        function collectThumbnailElements() {
            const set = new Set();
            document.querySelectorAll('ytd-thumbnail, a#thumbnail').forEach(el => set.add(el));
            return Array.from(set);
        }

        function processPage() {
            if (!watchHistoryLoaded) { queuedInitialProcess = true; return; }
            try {
                const thumbs = collectThumbnailElements();
                thumbs.forEach(addOrUpdateOverlay);
            } catch (e) { console.error('[LWO] processPage error', e); }
        }
        // Exponieren für andere Skripte / Listener
        ImprovedTube.lastWatchedOverlayProcess = processPage;

        // Tracking der angesehenen Videos (verbessert)
        function trackWatch() {
            if (location.pathname === '/watch') {
                const videoId = new URLSearchParams(location.search).get('v');
                if (videoId) {
                    console.log("[LWO] Tracking watched video:", videoId);

                    // Aktualisiere History
                    const history = ImprovedTube.storage.watch_history || {};
                    history[videoId] = Date.now();

                    // Begrenze History-Größe (max 1000 Einträge)
                    const ids = Object.keys(history);
                    if (ids.length > 1000) {
                        const oldestId = ids.sort((a, b) => history[a] - history[b])[0];
                        delete history[oldestId];
                    }

                    ImprovedTube.storage.watch_history = history;

                    // Persistieren (lokal, datenschutzfreundlich)
                    scheduleSaveHistory();
                    // Direkt aktualisieren (Overlay für aktuell offene Recommendations etc.)
                    if (watchHistoryLoaded) {
                        addOrUpdateOverlay(document.querySelector('ytd-watch-flexy ytd-thumbnail') || null);
                        processPage();
                    }
                }
            }
        }

        // Initialization mit Verzögerung (gibt YouTube Zeit zum Laden)
        // Laden der History und dann erstes Processing
        loadPersistedHistory();
        setTimeout(trackWatch, 1200);

        // Robuster MutationObserver mit Drosselung (verhindert zu viele Aufrufe)
        let processingTimeout;
        const observer = new MutationObserver(mutations => {
            let relevant = false;
            for (const m of mutations) {
                if (m.type === 'childList') {
                    for (const n of m.addedNodes) {
                        if (n.nodeType === 1 && (n.matches?.('ytd-thumbnail, a#thumbnail') || n.querySelector?.('ytd-thumbnail, a#thumbnail'))) {
                            relevant = true; break;
                        }
                    }
                }
                if (relevant) break;
            }
            if (relevant) {
                clearTimeout(processingTimeout);
                processingTimeout = setTimeout(processPage, 150);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });

        // YouTube-Navigations-Events (wichtig für SPA-Verhalten von YouTube)
        document.addEventListener('yt-navigate-start', () => {
            console.log("[LWO] Navigation started");
        });

        document.addEventListener('yt-navigate-finish', () => {
            trackWatch();
            setTimeout(processPage, 400);
        });

        // Regelmäßige Überprüfung für dynamisch geladene Inhalte
        setInterval(processPage, 5000);

// "AI hallucination"  // WICHTIG: Entferne alle alten Versionen oder Stubs   if (ImprovedTube.appearance && ImprovedTube.appearance.lastWatchedOverlay) {    delete ImprovedTube.appearance.lastWatchedOverlay; }
document.addEventListener('yt-page-data-updated', () => {
    setTimeout(() => {
        ImprovedTube.lastWatchedOverlay();
        if (ImprovedTube.lastWatchedOverlayProcess) {
            ImprovedTube.lastWatchedOverlayProcess();
        }
    }, 800);
});

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Verwendung in processPage:
const debouncedProcessPage = debounce(() => {
    if (ImprovedTube.lastWatchedOverlayProcess) {
        ImprovedTube.lastWatchedOverlayProcess();
    }
}, 300);

        return true; // Erfolgreiche Initialisierung
        }
};

// Sofort ausführen und initialisieren
ImprovedTube.lastWatchedOverlay();
