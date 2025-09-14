/*------------------------------------------------------------------------------
4.5.0 SHOW COMPLETE PLAYLIST PAGE
------------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------
Playlist Cleaner: remove videos from playlist by watched percentage
----------------------------------------------------------------------------*/

function parsePercentFromStyle(style) {
    if (!style) return 0;
    const m = String(style).match(/([0-9]+(?:\.[0-9]+)?)%/);
    return m ? Math.min(100, Math.max(0, parseFloat(m[1]))) : 0;
}

function getVideoIdFromRenderer(renderer) {
    try {
        // YouTube custom element often exposes internal data with .data
        if (renderer && renderer.data) {
            return renderer.data.videoId || renderer.data.setVideoId || null;
        }
    } catch (e) { }
    // Fallback: parse from anchor
    const a = renderer.querySelector('a#thumbnail[href], a.ytd-thumbnail[href]');
    if (a) {
        try { const m = a.href.match(ImprovedTube.regex.video_id); if (m) return m[1]; } catch (e) { }
    }
    return null;
}

function getSetVideoIdFromRenderer(renderer) {
    try {
        if (renderer && renderer.data && renderer.data.setVideoId) return renderer.data.setVideoId;
    } catch (e) { }
    return null;
}

function getWatchedPercentFromRenderer(renderer) {
    // Prefer explicit resume overlay progress
    const progress = renderer.querySelector('ytd-thumbnail-overlay-resume-playback-renderer #progress');
    if (progress && progress.style && progress.style.width) {
        const p = parsePercentFromStyle(progress.style.width);
        if (!Number.isNaN(p)) return p;
    }
    // Fully watched overlay exists on some items
    if (renderer.querySelector('ytd-thumbnail-overlay-watched-status-renderer')) return 100;
    return 0;
}

function removeFromPlaylist(videoId, setVideoId) {
    try {
        const app = document.querySelector('ytd-app');
        if (!app) return false;
        const idForSet = setVideoId || videoId;
        app.dispatchEvent(new CustomEvent('yt-action', {
            detail: {
                actionName: 'yt-playlist-remove-videos-action',
                args: [
                    { playlistRemoveVideosAction: { setVideoIds: [idForSet] } }
                ],
                returnValue: [],
            },
            bubbles: true,
            cancelable: true,
            composed: true,
        }));
        return true;
    } catch (e) { return false; }
}

async function sha1Hex(str) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-1', enc.encode(str));
    const bytes = Array.from(new Uint8Array(buf));
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function removeVideosPersistentlyModify(playlistId, videoIds) {
    if (!playlistId || !videoIds || videoIds.length === 0) return false;
    try {
        const cfg = (window.ytcfg && (window.ytcfg.data_ || (window.ytcfg.get && window.ytcfg.get()))) || {};
        const key = cfg.INNERTUBE_API_KEY || (window.ytcfg && window.ytcfg.get && window.ytcfg.get('INNERTUBE_API_KEY')) || '';
        const clientName = String(cfg.INNERTUBE_CONTEXT_CLIENT_NAME || '1');
        const clientVersion = cfg.INNERTUBE_CONTEXT_CLIENT_VERSION || '';
        const hl = cfg.HL || document.documentElement.lang || 'en';
        const gl = cfg.GL || 'US';
        const visitorData = cfg.VISITOR_DATA || '';
        const context = cfg.INNERTUBE_CONTEXT || {
            client: {
                clientName: 'WEB',
                clientVersion,
                hl,
                gl,
                visitorData,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                originalUrl: location.href,
                mainAppWebInfo: { graftUrl: location.pathname + location.search }
            },
            request: { internalExperimentFlags: [], sessionIndex: cfg.SESSION_INDEX ?? 0 }
        };
        const isWatchLater = playlistId === 'WL';
        const actionName = isWatchLater ? 'ACTION_REMOVE_VIDEO_FROM_WATCH_LATER' : 'ACTION_REMOVE_VIDEO_FROM_PLAYLIST';
        const actions = videoIds.map(id => ({ action: actionName, playlistId, removedVideoId: id }));
        const url = `${location.origin}/youtubei/v1/playlist/modify?key=${encodeURIComponent(key)}`;
        // Build SAPISIDHASH Authorization header
        const sapisid = (window.ImprovedTube?.getCookieValueByName && window.ImprovedTube.getCookieValueByName('SAPISID')) || (document.cookie.match(/(?:^|;\s*)SAPISID=([^;]+)/)?.[1] || '');
        const origin = location.origin;
        const timestamp = Math.floor(Date.now() / 1000);
        let authHeader = '';
        if (sapisid) {
            const toSign = `${timestamp} ${sapisid} ${origin}`;
            const hash = await sha1Hex(toSign);
            authHeader = `SAPISIDHASH ${timestamp}_${hash}`;
        }
        const headers = {
            'content-type': 'application/json',
            'X-YouTube-Client-Name': clientName,
            'X-YouTube-Client-Version': clientVersion,
            'X-YouTube-Device': cfg.DEVICE || '',
            'X-YouTube-Identity-Token': cfg.ID_TOKEN || '',
            'X-Goog-AuthUser': String(cfg.SESSION_INDEX ?? '0'),
            'X-Origin': origin,
            'Origin': origin,
            'Referer': location.href
        };
        if (cfg.PAGE_CL) headers['X-YouTube-Page-CL'] = String(cfg.PAGE_CL);
        if (cfg.PAGE_BUILD_LABEL) headers['X-YouTube-Page-Label'] = cfg.PAGE_BUILD_LABEL;
        if (visitorData) headers['X-Goog-Visitor-Id'] = visitorData;
        if (authHeader) headers['Authorization'] = authHeader;
        const pageId = cfg.PAGE_ID || cfg.DELEGATED_SESSION_ID;
        if (pageId) headers['X-Goog-PageId'] = pageId;
        headers['X-YouTube-Bootstrap-Logged-In'] = 'true';
        log('modify API call', { playlistId, n: videoIds.length });
        const res = await fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers,
            body: JSON.stringify({ context, actions })
        });
        if (!res.ok) {
            const txt = await res.text();
            console.warn('[PlaylistCleaner] modify failed', res.status, txt);
        }
        return res.ok;
    } catch (e) { console.warn('[PlaylistCleaner] Innertube removal failed', e); return false; }
}

async function removeVideosPersistentlyEdit(playlistId, setVideoIds) {
    if (!playlistId || !setVideoIds || setVideoIds.length === 0) return false;
    try {
        const cfg = (window.ytcfg && (window.ytcfg.data_ || (window.ytcfg.get && window.ytcfg.get()))) || {};
        const clientVersion = cfg.INNERTUBE_CONTEXT_CLIENT_VERSION || '';
        const hl = cfg.HL || document.documentElement.lang || 'en';
        const gl = cfg.GL || 'US';
        const visitorData = cfg.VISITOR_DATA || '';
        const context = cfg.INNERTUBE_CONTEXT || {
            client: {
                clientName: 'WEB',
                clientVersion,
                hl,
                gl,
                visitorData,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                originalUrl: location.href,
                mainAppWebInfo: { graftUrl: location.pathname + location.search }
            },
            request: { internalExperimentFlags: [], sessionIndex: cfg.SESSION_INDEX ?? 0 }
        };
        const actions = setVideoIds.map(id => ({ action: 'ACTION_REMOVE_VIDEO', setVideoId: id }));
        const body = { context, actions, playlistId, params: 'CAFAAQ==' };
        const url = `${location.origin}/youtubei/v1/browse/edit_playlist?prettyPrint=false`;
        // Build SAPISIDHASH Authorization header
        const sapisid = (window.ImprovedTube?.getCookieValueByName && window.ImprovedTube.getCookieValueByName('SAPISID')) || (document.cookie.match(/(?:^|;\s*)SAPISID=([^;]+)/)?.[1] || '');
        const origin = location.origin;
        const timestamp = Math.floor(Date.now() / 1000);
        let authHeader = '';
        if (sapisid) {
            const toSign = `${timestamp} ${sapisid} ${origin}`;
            const hash = await sha1Hex(toSign);
            authHeader = `SAPISIDHASH ${timestamp}_${hash}`;
        }
        const headers = {
            'content-type': 'application/json',
            'X-YouTube-Client-Name': String(cfg.INNERTUBE_CONTEXT_CLIENT_NAME || '1'),
            'X-YouTube-Client-Version': clientVersion,
            'X-Goog-AuthUser': String(cfg.SESSION_INDEX ?? '0'),
            'X-Goog-Visitor-Id': visitorData || undefined,
            'X-Origin': origin,
            'Origin': origin,
            'Referer': location.href,
            ...(authHeader ? { 'Authorization': authHeader } : {})
        };
        const pageId2 = cfg.PAGE_ID || cfg.DELEGATED_SESSION_ID;
        if (pageId2) headers['X-Goog-PageId'] = pageId2;
        headers['X-YouTube-Bootstrap-Logged-In'] = 'true';
        log('edit_playlist API call', { playlistId, n: setVideoIds.length });
        const res = await fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers,
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const txt = await res.text();
            console.warn('[PlaylistCleaner] edit_playlist failed', res.status, txt);
        }
        return res.ok;
    } catch (e) { console.warn('[PlaylistCleaner] edit_playlist error', e); return false; }
}

function saveLocalWatchHistory() {
    try {
        const key = 'it_watch_history';
        const data = ImprovedTube.storage.watch_history || {};
        if (typeof chrome !== 'undefined' && chrome.storage?.local?.set) {
            chrome.storage.local.set({ [key]: data });
        } else {
            localStorage.setItem(key, JSON.stringify(data));
        }
    } catch (e) { }
}

function resetWatchForVideo(videoId, renderer) {
    // Remove local overlay info and UI traces
    if (ImprovedTube.storage.watch_history && ImprovedTube.storage.watch_history[videoId]) {
        delete ImprovedTube.storage.watch_history[videoId];
        saveLocalWatchHistory();
    }
    try {
        // Remove progress and watched overlays on the item
        const target = renderer || document.querySelector(`ytd-playlist-video-renderer a[href*="v=${videoId}"]`)?.closest('ytd-playlist-video-renderer');
        if (target) {
            target.querySelector('ytd-thumbnail-overlay-resume-playback-renderer')?.remove();
            target.querySelector('ytd-thumbnail-overlay-watched-status-renderer')?.remove();
        }
    } catch (e) { }
    // Inform extension watched store (best-effort)
    try { ImprovedTube.messages.send({ action: 'watched', type: 'remove', id: videoId }); } catch (e) { }
}

function ensureQuickButtons(renderer) {
    if (!renderer || renderer.dataset.itQuickActions === '1') return;
    const videoId = getVideoIdFromRenderer(renderer);
    if (!videoId) return;
    const menu = renderer.querySelector('#menu');
    if (!menu) return;

    const wrap = document.createElement('span');
    wrap.className = 'it-quick-actions';
    wrap.style.display = 'inline-flex';
    wrap.style.gap = '6px';
    wrap.style.alignItems = 'center';
    wrap.style.marginRight = '8px';

    const btnReset = document.createElement('button');
    btnReset.textContent = 'Reset';
    btnReset.title = 'Reset watch progress for this video';
    btnReset.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--text yt-spec-button-shape-next--size-s';
    btnReset.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        resetWatchForVideo(videoId, renderer);
    }, true);

    const btnDelete = document.createElement('button');
    btnDelete.textContent = 'Delete';
    btnDelete.title = 'Remove this video from playlist';
    btnDelete.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--text yt-spec-button-shape-next--size-s';
    btnDelete.addEventListener('click', async function (e) {
        e.preventDefault(); e.stopPropagation();
        const playlistId = new URLSearchParams(location.search).get('list');
        const setId = getSetVideoIdFromRenderer(renderer);
        let ok = await removeVideosPersistentlyEdit(playlistId, setId ? [setId] : []);
        if (!ok) ok = await removeVideosPersistentlyModify(playlistId, [videoId]);
        if (!ok) {
            ok = await clickMenuRemove(renderer);
            if (!ok) ok = removeFromPlaylist(videoId, setId);
        }
        if (ok) {
            try { renderer.remove(); } catch (err) { }
            decrementPlaylistCount(1);
        }
    }, true);

    wrap.appendChild(btnReset);
    wrap.appendChild(btnDelete);
    menu.prepend(wrap);
    renderer.dataset.itQuickActions = '1';
}

function attachQuickButtonsNow() {
    const list = document.querySelectorAll('ytd-playlist-video-renderer');
    log('attachQuickButtonsNow on', list.length, 'items');
    list.forEach(ensureQuickButtons);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function clickMenuRemove(renderer) {
    try {
        const menuButton = renderer.querySelector('#menu #button, #menu tp-yt-paper-icon-button, #menu ytd-button-renderer button');
        if (!menuButton) return false;
        menuButton.click();
        // Wait for popup items to render
        let tries = 0, item = null;
        while (tries++ < 20 && !item) {
            await sleep(100);
            const items = Array.from(document.querySelectorAll('ytd-menu-service-item-renderer'));
            item = items.find(el => {
                try {
                    const data = el.data || el.__data || {};
                    const json = JSON.stringify(data);
                    return /ACTION_REMOVE_VIDEO_FROM/.test(json);
                } catch (e) { return false; }
            }) || null;
        }
        if (!item) return false;
        item.click();
        await sleep(400);
        return true;
    } catch (e) { return false; }
}

async function loadAllPlaylistItems(statusCb) {
    const list = document.querySelector('ytd-playlist-video-list-renderer #contents') ||
        document.querySelector('ytd-playlist-video-list-renderer');
    if (!list) return;
    let lastCount = 0;
    let stable = 0;
    const maxStable = 3;
    for (let i = 0; i < 300; i++) {
        // Scroll to end
        try { list.scrollTop = list.scrollHeight; } catch (e) { }
        window.scrollTo(0, document.documentElement.scrollHeight);

        // Click continuation button if present
        const cont = list.querySelector('ytd-continuation-item-renderer');
        const btn = cont?.querySelector('button, tp-yt-paper-button, #button');
        if (btn && !btn.disabled) { try { btn.click(); } catch (e) { } }

        await sleep(700);
        const count = document.querySelectorAll('ytd-playlist-video-renderer').length;
        if (typeof statusCb === 'function') statusCb(count);
        log('loadAll iteration', i, 'count', count, 'stable', stable);
        if (count <= lastCount) { stable++; } else { stable = 0; lastCount = count; }
        if (stable >= maxStable && !list.querySelector('ytd-continuation-item-renderer')) break;
    }
}

function collectCandidates(threshold) {
    const nodes = Array.from(document.querySelectorAll('ytd-playlist-video-renderer'));
    const candidates = [];
    for (const node of nodes) {
        const id = getVideoIdFromRenderer(node);
        const setId = getSetVideoIdFromRenderer(node);
        if (!id && !setId) continue;
        const percent = getWatchedPercentFromRenderer(node);
        if (percent >= threshold) {
            candidates.push({ id, setId, node, percent });
        }
    }
    return candidates;
}

function decrementPlaylistCount(by) {
    try {
        const el = document.querySelector('ytd-playlist-byline-renderer yt-formatted-string span');
        if (!el) return;
        const current = parseInt(el.textContent.replace(/\D+/g, ''), 10);
        if (Number.isFinite(current)) el.textContent = String(Math.max(0, current - by));
    } catch (e) { }
}

async function runRemoval(threshold) {
    const items = collectCandidates(threshold);
    if (items.length === 0) return 0;
    const playlistId = new URLSearchParams(location.search).get('list');
    // Try edit_playlist with setVideoIds first (closer to native). Use single-action requests for reliability.
    let ok = true;
    const setIds = items.map(i => i.setId).filter(Boolean);
    if (setIds.length) {
        ok = true;
        for (const sid of setIds) {
            const okOne = await removeVideosPersistentlyEdit(playlistId, [sid]);
            ok = ok && okOne;
        }
    } else {
        ok = false;
    }
    // Fallback to modify with removedVideoId (batch)
    if (!ok) ok = await removeVideosPersistentlyModify(playlistId, items.map(i => i.id).filter(Boolean));
    if (!ok) {
        // Fallback to UI-driven removal (more reliable, slower)
        for (const { node, id, setId } of items) {
            const did = await clickMenuRemove(node);
            if (!did) removeFromPlaylist(id, setId);
        }
    }
    // Optimistically remove DOM nodes for immediate feedback
    for (const { node } of items) { try { node.remove(); } catch (e) { } }
    decrementPlaylistCount(items.length);
    return items.length;
}

function createControls() {
    // Avoid duplicating controls
    if (document.getElementById('it-playlist-cleaner-controls')) { log('controls already present'); return; }

    // Try modern header first (M3 view-model layout)
    const vmRow = document.querySelector('yt-flexible-actions-view-model .ytFlexibleActionsViewModelActionRow');
    const mounts = [
        vmRow,
        // Classic header actions
        document.querySelector('ytd-playlist-header-renderer #top-row #actions'),
        document.querySelector('ytd-playlist-header-renderer #actions'),
        document.querySelector('ytd-playlist-header-renderer .immersive-header-content'),
        document.querySelector('ytd-playlist-header-renderer #header #actions'),
        document.querySelector('ytd-playlist-header-renderer #header ytd-playlist-byline-renderer'),
        // Sidebar fallbacks (older layouts)
        document.querySelector('ytd-playlist-sidebar-primary-info-renderer #actions'),
        document.querySelector('ytd-playlist-sidebar-primary-info-renderer'),
        document.querySelector('ytd-playlist-byline-renderer')
    ];
    let parent = mounts.find(Boolean);
    if (!parent) {
        log('no mount parent found yet, retrying...');
        setTimeout(createControls, 500);
        return;
    }
    log('mount parent:', parent.tagName, parent.id || '(no id)', parent.className || '(no class)');

    const wrapper = document.createElement('div');
    wrapper.id = 'it-playlist-cleaner-controls';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '8px';
    wrapper.style.marginTop = '8px';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.zIndex = '2';
    wrapper.style.position = 'relative';

    // If mounting inside the modern actions row, match its child class for consistent spacing
    if (vmRow && parent === vmRow) {
        wrapper.className = 'ytFlexibleActionsViewModelAction ytFlexibleActionsViewModelActionRowAction';
        wrapper.style.marginTop = '0';
    }

    const label = document.createElement('span');
    label.textContent = 'Remove watched ≥';
    label.style.opacity = '0.85';

    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '100';
    input.step = '5';
    input.value = String(100);
    input.style.width = '180px';

    const value = document.createElement('span');
    value.textContent = input.value + '%';
    value.style.minWidth = '40px';

    input.addEventListener('input', function () {
        value.textContent = this.value + '%';
    }, { passive: true });

    const button = document.createElement('button');
    button.textContent = 'Remove';
    button.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--size-m';
    button.style.cursor = 'pointer';

    const status = document.createElement('span');
    status.style.opacity = '0.7';
    status.style.marginLeft = '4px';

    button.addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation();
        const threshold = Math.max(0, Math.min(100, parseInt(input.value, 10) || 0));
        button.disabled = true;
        try {
            status.textContent = 'Loading…'; log('bulk: start loadAll');
            await loadAllPlaylistItems(count => { status.textContent = `Loaded ${count}…`; attachQuickButtonsNow(); });
            status.textContent = 'Removing…'; log('bulk: start removal with threshold', threshold);
            const removed = await runRemoval(threshold); log('bulk: removed', removed);
            status.textContent = removed ? `Removed ${removed}` : 'No matches';
        } catch (err) {
            status.textContent = 'Error'; log('bulk removal error', err);
        } finally {
            setTimeout(() => { button.disabled = false; }, 200);
        }
    }, true);

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(value);
    wrapper.appendChild(button);
    wrapper.appendChild(status);

    // Insert near playlist metadata
    // If mounted into an actions bar, keep it compact
    if (parent.id === 'actions' || (parent.closest && parent.closest('#actions'))) {
        wrapper.style.marginTop = '0';
    }
    parent.appendChild(wrapper);

    // If appended into an invisible sidebar, relocate into header actions
    try {
        const cs = window.getComputedStyle(parent);
        const rect = wrapper.getBoundingClientRect();
        if (cs && (cs.display === 'none' || cs.visibility === 'hidden' || rect.width === 0 || rect.height === 0)) {
            const headerActions = document.querySelector('yt-flexible-actions-view-model .ytFlexibleActionsViewModelActionRow')
                || document.querySelector('ytd-playlist-header-renderer #top-row #actions')
                || document.querySelector('ytd-playlist-header-renderer #actions');
            if (headerActions) {
                headerActions.appendChild(wrapper);
                wrapper.style.marginTop = '0';
                log('relocated controls to header actions');
            } else {
                log('controls parent invisible and no header actions found');
            }
        }
    } catch (e) { log('visibility check failed', e); }
    // Ensure current items have quick buttons
    attachQuickButtonsNow();
}
// Expose hooks to reuse the global child handler instead of a new observer
ImprovedTube.playlistCleanerInitControls = function () { if (isOnPlaylistPage()) { log('initControls hook called'); createControls(); } };
ImprovedTube.playlistCleanerEnsureQuickButtons = function (node) { if (isOnPlaylistPage()) { ensureQuickButtons(node); } };

// Fallback: in case the child handler didn’t run yet
if (document.readyState !== 'loading') {
    log('DOMContentLoaded already passed, init now');
    ImprovedTube.playlistCleanerInitControls(); attachQuickButtonsNow();
} else {
    document.addEventListener('DOMContentLoaded', () => { log('DOMContentLoaded event, init now'); ImprovedTube.playlistCleanerInitControls(); attachQuickButtonsNow(); });
}
