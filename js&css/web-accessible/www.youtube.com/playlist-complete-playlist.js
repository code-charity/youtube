/*------------------------------------------------------------------------------
4.5.7 PLAYLIST COMPLETE FUNCTIONALITY
------------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------
Playlist management: delete videos and reset progress based on watch status
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

        const res = await fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers,
            body: JSON.stringify({ context, actions })
        });
        if (!res.ok) {
            const txt = await res.text();
            console.warn('[ImprovedTube] Playlist modify failed', res.status, txt);
        }
        return res.ok;
    } catch (e) {
        console.warn('[ImprovedTube] Innertube removal failed', e);
        return false;
    }
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

        const res = await fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers,
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const txt = await res.text();
            console.warn('[ImprovedTube] edit_playlist failed', res.status, txt);
        }
        return res.ok;
    } catch (e) {
        console.warn('[ImprovedTube] edit_playlist error', e);
        return false;
    }
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
    try {
        ImprovedTube.messages.send({ action: 'watched', type: 'remove', id: videoId });
    } catch (e) { }
}

ImprovedTube.playlistEnsureQuickButtons = function (renderer) {
    console.log('[ImprovedTube] playlistEnsureQuickButtons called', {
        delete_enabled: this.storage.playlist_quick_delete_shortcut,
        renderer: !!renderer
    });

    if (!this.storage.playlist_quick_delete_shortcut) {
        console.log('[ImprovedTube] Quick delete feature disabled, skipping');
        return;
    }

    if (!renderer || renderer.dataset.itQuickActions === '1') {
        console.log('[ImprovedTube] Renderer invalid or already processed');
        return;
    }

    const videoId = getVideoIdFromRenderer(renderer);
    if (!videoId) {
        console.log('[ImprovedTube] No video ID found for renderer');
        return;
    }

    const menu = renderer.querySelector('#menu');
    if (!menu) {
        console.log('[ImprovedTube] No menu found for renderer');
        return;
    }

    // Find the dropdown trigger button to insert before it
    const dropdownTrigger = menu.querySelector('.dropdown-trigger, #button');
    if (!dropdownTrigger) {
        console.log('[ImprovedTube] No dropdown trigger found for renderer');
        return;
    }

    console.log('[ImprovedTube] Adding quick delete button for video:', videoId);

    // Create icon button for delete
    const btnDelete = document.createElement('button');
    btnDelete.title = 'Remove this video from playlist';
    btnDelete.className = 'style-scope yt-icon-button';
    btnDelete.style.height = 'auto';
    btnDelete.style.width = 'auto';

    // Create icon span
    const iconSpan = document.createElement('span');
    iconSpan.className = 'yt-icon-shape style-scope yt-icon ytSpecIconShapeHost';

    // Create icon container div
    const iconDiv = document.createElement('div');
    iconDiv.style.width = '100%';
    iconDiv.style.height = '100%';
    iconDiv.style.display = 'block';
    iconDiv.style.fill = 'currentcolor';

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('enable-background', 'new 0 0 24 24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.pointerEvents = 'none';
    svg.style.display = 'inherit';
    svg.style.width = '100%';
    svg.style.height = '100%';

    // Create path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M11 17H9V8h2v9zm4-9h-2v9h2V8zm4-4v1h-1v16H6V5H5V4h4V3h6v1h4zm-2 1H7v15h10V5z');

    // Assemble the icon
    svg.appendChild(path);
    iconDiv.appendChild(svg);
    iconSpan.appendChild(iconDiv);
    btnDelete.appendChild(iconSpan);

    // Add click handler
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

    // Insert before the dropdown trigger button
    dropdownTrigger.parentNode.insertBefore(btnDelete, dropdownTrigger);
    renderer.dataset.itQuickActions = '1';
};

ImprovedTube.playlistAttachQuickButtons = function () {
    if (!this.storage.playlist_quick_delete_shortcut) return;
    const list = document.querySelectorAll('ytd-playlist-video-renderer');
    for (const renderer of list) {
        this.playlistEnsureQuickButtons(renderer);
    }
};

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

ImprovedTube.playlistCreateBulkControls = function () {
    console.log('[ImprovedTube] playlistCreateBulkControls called', {
        bulk_enabled: this.storage.playlist_bulk_delete_by_progress,
        existing_controls: !!document.getElementById('it-playlist-cleaner-controls')
    });

    if (!this.storage.playlist_bulk_delete_by_progress) {
        console.log('[ImprovedTube] Bulk delete feature disabled, skipping');
        return;
    }

    // Avoid duplicating controls
    if (document.getElementById('it-playlist-cleaner-controls')) {
        console.log('[ImprovedTube] Bulk controls already exist, skipping');
        return;
    }

    // Try modern header first (M3 view-model layout) - prioritize visible elements
    const vmRow = document.querySelector('yt-flexible-actions-view-model .ytFlexibleActionsViewModelActionRow');
    const mounts = [
        vmRow,
        // Classic header actions
        document.querySelector('ytd-playlist-header-renderer #top-row #actions'),
        document.querySelector('ytd-playlist-header-renderer #actions'),
        document.querySelector('ytd-playlist-header-renderer .immersive-header-content'),
        document.querySelector('ytd-playlist-header-renderer #header #actions'),
        document.querySelector('ytd-playlist-header-renderer #header ytd-playlist-byline-renderer'),
        // Sidebar fallbacks (older layouts) - only use visible sidebars
        document.querySelector('ytd-playlist-sidebar-primary-info-renderer:not([hidden]) #actions'),
        document.querySelector('ytd-playlist-sidebar-primary-info-renderer:not([hidden])'),
        document.querySelector('ytd-playlist-byline-renderer')
    ];
    // Find the first visible mount point
    let parent = null;
    for (const mount of mounts) {
        if (mount) {
            const style = window.getComputedStyle(mount);
            const rect = mount.getBoundingClientRect();
            if (style.display !== 'none' && style.visibility !== 'hidden' &&
                !mount.hasAttribute('hidden') && rect.width > 0 && rect.height > 0) {
                parent = mount;
                break;
            }
        }
    }

    if (!parent) {
        console.log('[ImprovedTube] No suitable visible parent found for bulk controls, retrying in 500ms');
        setTimeout(() => this.playlistCreateBulkControls(), 500);
        return;
    }

    console.log('[ImprovedTube] Found visible parent for bulk controls:', parent.tagName, parent.className);

    const wrapper = document.createElement('div');
    wrapper.id = 'it-playlist-cleaner-controls';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '8px';
    wrapper.style.marginTop = '8px';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.zIndex = '2';
    wrapper.style.position = 'relative';

    // If we found the flexible actions row, create our own row
    if (vmRow && parent === vmRow) {
        // Create a new action row for our controls
        const newActionRow = document.createElement('div');
        newActionRow.className = 'ytFlexibleActionsViewModelActionRow';
        newActionRow.style.marginTop = '8px';

        wrapper.className = 'ytFlexibleActionsViewModelAction ytFlexibleActionsViewModelActionRowAction';
        wrapper.style.marginTop = '0';

        // Create the control elements first
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
        button.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--overlay yt-spec-button-shape-next--size-m';
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
                status.textContent = 'Loading…';
                await loadAllPlaylistItems(count => {
                    status.textContent = `Loaded ${count}…`;
                    ImprovedTube.playlistAttachQuickButtons();
                });
                status.textContent = 'Removing…';
                const removed = await runRemoval(threshold);
                status.textContent = removed ? `Removed ${removed}` : 'No matches';
            } catch (err) {
                status.textContent = 'Error';
                console.error('[ImprovedTube] Bulk removal error', err);
            } finally {
                setTimeout(() => { button.disabled = false; }, 200);
            }
        }, true);

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        wrapper.appendChild(value);
        wrapper.appendChild(button);
        wrapper.appendChild(status);

        newActionRow.appendChild(wrapper);

        // Add our new row after the existing actions row
        const flexibleActionsContainer = vmRow.parentElement;
        if (flexibleActionsContainer) {
            flexibleActionsContainer.appendChild(newActionRow);
            console.log('[ImprovedTube] Created new action row for bulk controls');
            // Ensure current items have quick buttons
            this.playlistAttachQuickButtons();
            return; // Exit early since we handled the mounting differently
        }
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
    button.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--overlay yt-spec-button-shape-next--size-m';
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
            status.textContent = 'Loading…';
            await loadAllPlaylistItems(count => {
                status.textContent = `Loaded ${count}…`;
                ImprovedTube.playlistAttachQuickButtons();
            });
            status.textContent = 'Removing…';
            const removed = await runRemoval(threshold);
            status.textContent = removed ? `Removed ${removed}` : 'No matches';
        } catch (err) {
            status.textContent = 'Error';
            console.error('[ImprovedTube] Bulk removal error', err);
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

    // Since we already checked visibility above, no need for relocation logic

    // Ensure current items have quick buttons
    this.playlistAttachQuickButtons();
};

// Initialize functions for playlist pages
ImprovedTube.playlistCompleteInit = function () {
    console.log('[ImprovedTube] playlistCompleteInit called');
    console.log('[ImprovedTube] Storage check:', {
        quick_delete: this.storage.playlist_quick_delete_shortcut,
        bulk_delete: this.storage.playlist_bulk_delete_by_progress,
        storage_keys: Object.keys(this.storage).filter(k => k.includes('playlist'))
    });

    // If storage isn't loaded yet, retry after a short delay
    if (typeof this.storage.playlist_quick_delete_shortcut === 'undefined' &&
        typeof this.storage.playlist_bulk_delete_by_progress === 'undefined') {
        console.log('[ImprovedTube] Settings not loaded yet, retrying in 100ms');
        setTimeout(() => this.playlistCompleteInit(), 100);
        return;
    }

    // Set defaults if settings don't exist
    if (typeof this.storage.playlist_quick_delete_shortcut === 'undefined') {
        this.storage.playlist_quick_delete_shortcut = false;
    }
    if (typeof this.storage.playlist_bulk_delete_by_progress === 'undefined') {
        this.storage.playlist_bulk_delete_by_progress = false;
    }

    if (location.search.match(ImprovedTube.regex.playlist_id)) {
        console.log('[ImprovedTube] On playlist page, initializing features');
        this.playlistCreateBulkControls();
        this.playlistAttachQuickButtons();
    } else {
        console.log('[ImprovedTube] Not on playlist page, skipping initialization');
    }
};

// Settings change handlers for real-time updates
ImprovedTube.playlistQuickDeleteShortcut = function () {
    console.log('[ImprovedTube] playlistQuickDeleteShortcut setting changed:', this.storage.playlist_quick_delete_shortcut);
    if (location.search.match(ImprovedTube.regex.playlist_id)) {
        // Remove existing buttons first
        document.querySelectorAll('ytd-playlist-video-renderer').forEach(renderer => {
            const existingButton = renderer.querySelector('button[title*="Remove this video from playlist"]');
            if (existingButton) {
                existingButton.remove();
            }
            delete renderer.dataset.itQuickActions;
        });
        // Re-attach with new settings
        this.playlistAttachQuickButtons();
    }
};


ImprovedTube.playlistBulkDeleteByProgress = function () {
    console.log('[ImprovedTube] playlistBulkDeleteByProgress setting changed:', this.storage.playlist_bulk_delete_by_progress);
    if (location.search.match(ImprovedTube.regex.playlist_id)) {
        // Remove existing controls
        const existingControls = document.getElementById('it-playlist-cleaner-controls');
        if (existingControls) {
            existingControls.remove();
        }
        // Re-create with new settings
        this.playlistCreateBulkControls();
    }
};

// Debug function for manual testing
ImprovedTube.debugPlaylistComplete = function () {
    console.log('=== DEBUG PLAYLIST COMPLETE ===');
    console.log('Current URL:', location.href);
    console.log('Location search:', location.search);
    console.log('Playlist regex test:', location.search.match(ImprovedTube.regex.playlist_id));
    console.log('Settings:', {
        quick_delete: this.storage.playlist_quick_delete_shortcut,
        bulk_delete: this.storage.playlist_bulk_delete_by_progress
    });

    // Test DOM elements
    const mounts = [
        document.querySelector('yt-flexible-actions-view-model .ytFlexibleActionsViewModelActionRow'),
        document.querySelector('ytd-playlist-header-renderer #top-row #actions'),
        document.querySelector('ytd-playlist-header-renderer #actions'),
        document.querySelector('ytd-playlist-header-renderer .immersive-header-content'),
        document.querySelector('ytd-playlist-header-renderer #header #actions'),
        document.querySelector('ytd-playlist-header-renderer #header ytd-playlist-byline-renderer'),
        document.querySelector('ytd-playlist-sidebar-primary-info-renderer #actions'),
        document.querySelector('ytd-playlist-sidebar-primary-info-renderer'),
        document.querySelector('ytd-playlist-byline-renderer')
    ];

    console.log('Available mount points:');
    mounts.forEach((mount, i) => {
        console.log(`  ${i}: ${mount ? `${mount.tagName} (${mount.className})` : 'null'}`);
    });

    console.log('Existing controls:', document.getElementById('it-playlist-cleaner-controls'));
    console.log('Playlist video renderers:', document.querySelectorAll('ytd-playlist-video-renderer').length);

    // Manual trigger
    console.log('Manually triggering initialization...');
    this.playlistCompleteInit();
};

// Manual settings test
ImprovedTube.testPlaylistSettings = function () {
    console.log('=== MANUAL SETTINGS TEST ===');
    console.log('Enable quick delete...');
    this.storage.playlist_quick_delete_shortcut = true;
    this.playlistQuickDeleteShortcut();

    console.log('Enable bulk delete...');
    this.storage.playlist_bulk_delete_by_progress = true;
    this.playlistBulkDeleteByProgress();
};
