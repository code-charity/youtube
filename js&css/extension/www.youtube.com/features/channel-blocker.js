(function () {
    console.log(">>> Channel Blocker: UI PRO (TOGGLE SWITCH) <<<");

    const STORAGE_KEY = "yt-blocker-header-aggressive"; 
    let channelsMap = {};
    let isFilterEnabled = false;
    let safetyInterval = null;

    //  STORAGE 
    function loadSettings() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) channelsMap = JSON.parse(stored);
        } catch (e) {
            console.error("Settings error", e);
            channelsMap = {};
        }
    }

    function saveSettings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(channelsMap));
    }

    //  DATA FETCHING 
    function findAllChannelRenderers(obj, results = []) {
        if (!obj || typeof obj !== 'object') return results;
        if (obj.channelRenderer) results.push(obj.channelRenderer);
        Object.values(obj).forEach(value => {
            if (typeof value === 'object') findAllChannelRenderers(value, results);
        });
        return results;
    }

    async function fetchOfficialSubs() {
        const statusBtn = document.getElementById("cb-rescan");
        if(statusBtn) statusBtn.innerText = "⏳ ...";

        try {
            const response = await fetch("https://www.youtube.com/feed/channels");
            const text = await response.text();
            let foundChannels = [];

            const jsonMatch = text.match(/var ytInitialData = ({.*?});/);
            if (jsonMatch) {
                try {
                    const data = JSON.parse(jsonMatch[1]);
                    const renderers = findAllChannelRenderers(data);
                    renderers.forEach(c => {
                        const name = c.title?.simpleText || c.title?.runs?.[0]?.text;
                        let url = c.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url;
                        if (name && url) foundChannels.push({ name: name, url: url });
                    });
                } catch (e) { console.error("JSON error", e); }
            }

            if (foundChannels.length === 0) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, "text/html");
                const items = doc.querySelectorAll("ytd-channel-renderer");
                items.forEach(item => {
                    const link = item.querySelector("a#main-link");
                    const textEl = item.querySelector("#text");
                    if (link && textEl) {
                        foundChannels.push({ name: textEl.innerText.trim(), url: link.getAttribute("href") });
                    }
                });
            }

            let count = 0;
            let newMap = {};
            foundChannels.forEach(item => {
                if (item.url.includes("/feed/") || item.url.includes("UC-9-kyTW8ZkZNDHQJ6FgpwQ")) return; 
                let cleanUrl = item.url;
                if (!cleanUrl.startsWith("/")) cleanUrl = "/" + cleanUrl;
                
                const existing = channelsMap[cleanUrl];
                newMap[cleanUrl] = { 
                    name: item.name, 
                    allowed: existing ? existing.allowed : false 
                };
                count++;
            });

            if (count > 0) {
                channelsMap = newMap;
                saveSettings();
                renderList();
                if(statusBtn) statusBtn.innerText = `✅ ${count}`;
                setTimeout(() => { if(statusBtn) statusBtn.innerText = "↻ Refresh"; }, 2000);
            } else {
                if(statusBtn) statusBtn.innerText = "⚠️ 0";
            }

        } catch (e) {
            console.error(e);
            if(statusBtn) statusBtn.innerText = "❌";
        }
    }

    //  UI GENERATION (TOGGLE STYLE) 
    function createUI() {
        if (document.getElementById("cb-container")) return;

        const headerEnd = document.querySelector("ytd-masthead #end");
        if (!headerEnd) return;

        const container = document.createElement("div");
        container.id = "cb-container";
        // Aligned nicely in header
        Object.assign(container.style, {
            display: "flex", alignItems: "center", marginRight: "8px", position: "relative"
        });

        // The Main "Pill" Container (The gray box)
        const mainPill = document.createElement("div");
        Object.assign(mainPill.style, {
            display: "flex", 
            alignItems: "center",
            height: "36px", 
            borderRadius: "18px", 
            overflow: "hidden",
            // NATIVE YOUTUBE COLORS
            backgroundColor: "var(--yt-spec-badge-chip-background, rgba(0, 0, 0, 0.05))",
            border: "1px solid var(--yt-spec-10-percent-layer, transparent)",
            cursor: "pointer"
        });

        // The Clickable Toggle Section 
        const toggleSection = document.createElement("div");
        toggleSection.id = "cb-toggle-section";
        Object.assign(toggleSection.style, {
            display: "flex", alignItems: "center", padding: "0 12px", height: "100%",
            gap: "10px"
        });

        // Text Label
        const labelText = document.createElement("span");
        labelText.innerText = "Block";
        Object.assign(labelText.style, {
            fontSize: "14px", 
            fontWeight: "500",
            fontFamily: "Roboto, Arial, sans-serif",
            color: "var(--yt-spec-text-primary, #0f0f0f)"
        });

        // The Visual Toggle Switch
        const toggleSwitch = document.createElement("div");
        Object.assign(toggleSwitch.style, {
            position: "relative",
            width: "34px",
            height: "18px",
            borderRadius: "10px",
            backgroundColor: "#909090", // Default Gray (OFF)
            transition: "background-color 0.2s ease"
        });

        const toggleKnob = document.createElement("div");
        Object.assign(toggleKnob.style, {
            position: "absolute",
            top: "2px",
            left: "2px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
            transition: "transform 0.2s ease"
        });
        
        toggleSwitch.appendChild(toggleKnob);
        toggleSection.appendChild(labelText);
        toggleSection.appendChild(toggleSwitch);

        // Toggle Logic
        toggleSection.onclick = () => {
            isFilterEnabled = !isFilterEnabled;
            updateToggleVisuals(toggleSwitch, toggleKnob);
            if (isFilterEnabled) {
                startAggressiveLoop();
            } else {
                stopAggressiveLoop();
                showAllVideos();
            }
        };

        // The Arrow Button (Divider) 
        const divider = document.createElement("div");
        Object.assign(divider.style, {
            width: "1px", height: "20px", 
            backgroundColor: "var(--yt-spec-text-secondary, #ccc)", 
            opacity: "0.3"
        });

        const arrowBtn = document.createElement("div");
        arrowBtn.innerText = "▼";
        Object.assign(arrowBtn.style, {
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 8px", height: "100%", cursor: "pointer",
            fontSize: "10px", color: "var(--yt-spec-text-secondary, #606060)"
        });

        arrowBtn.onmouseover = () => arrowBtn.style.backgroundColor = "rgba(0,0,0,0.05)";
        arrowBtn.onmouseout = () => arrowBtn.style.backgroundColor = "transparent";
        
        arrowBtn.onclick = (e) => {
            e.stopPropagation();
            const list = document.getElementById("cb-list-container");
            const isHidden = list.style.display === "none";
            list.style.display = isHidden ? "block" : "none";
            if (isHidden) {
                renderList();
                if (Object.keys(channelsMap).length === 0) fetchOfficialSubs();
            }
        };

        // Assemble Pill
        mainPill.appendChild(toggleSection);
        mainPill.appendChild(divider);
        mainPill.appendChild(arrowBtn);

        // The Dropdown List 
        const listContainer = document.createElement("div");
        listContainer.id = "cb-list-container";
        Object.assign(listContainer.style, {
            display: "none", position: "absolute", top: "45px", right: "0px",
            width: "300px", maxHeight: "400px", overflowY: "auto",
            borderRadius: "12px", padding: "10px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)", zIndex: "9999",
            backgroundColor: "var(--yt-spec-menu-background, #fff)", 
            border: "1px solid var(--yt-spec-10-percent-layer, #ccc)", 
            color: "var(--yt-spec-text-primary, #000)"
        });

        listContainer.innerHTML = `
            <div style="display:flex; gap:5px; margin-bottom:10px;">
                <button id="cb-rescan" style="
                    flex:1; padding:8px; cursor:pointer; border-radius:18px; font-weight:500;
                    border: 1px solid var(--yt-spec-10-percent-layer, #ccc);
                    background: var(--yt-spec-badge-chip-background, #f0f0f0);
                    color: var(--yt-spec-text-primary, #000);
                ">↻ Refresh</button>
            </div>
            <div id="cb-list-items"></div>
        `;

        container.appendChild(mainPill);
        container.appendChild(listContainer);
        headerEnd.prepend(container);

        document.getElementById("cb-rescan").onclick = fetchOfficialSubs;

        window.addEventListener('click', (e) => {
            if (!container.contains(e.target)) listContainer.style.display = "none";
        });
    }

    function updateToggleVisuals(switchEl, knobEl) {
        if (isFilterEnabled) {
            // ON STATE: Blue Background, Knob to the right
            switchEl.style.backgroundColor = "#3ea6ff"; // YouTube Blue
            knobEl.style.transform = "translateX(16px)";
        } else {
            // OFF STATE: Gray Background, Knob to the left
            switchEl.style.backgroundColor = "#909090"; // YouTube Gray
            knobEl.style.transform = "translateX(0px)";
        }
    }

    function renderList() {
        const list = document.getElementById("cb-list-items");
        if (!list) return;
        list.innerHTML = "";

        const keys = Object.keys(channelsMap).sort((a,b) => 
            (channelsMap[a].name || "").localeCompare(channelsMap[b].name || "")
        );

        if (keys.length === 0) {
            list.innerHTML = "<div style='text-align:center; padding:10px; color:var(--yt-spec-text-secondary, #666);'>No data.<br>Click Refresh.</div>";
            return;
        }

        keys.forEach(href => {
            const data = channelsMap[href];
            const row = document.createElement("div");
            row.style.cssText = `
                display:flex; align-items:center; padding:8px 0; 
                border-bottom: 1px solid var(--yt-spec-10-percent-layer, #eee);
                color: var(--yt-spec-text-primary, #000);
                font-size: 13px;
            `;
            
            const chk = document.createElement("input");
            chk.type = "checkbox";
            chk.checked = data.allowed;
            chk.style.marginRight = "10px";
            chk.onchange = (e) => {
                channelsMap[href].allowed = e.target.checked;
                saveSettings();
                if (isFilterEnabled) processPage();
            };

            const lbl = document.createElement("span");
            lbl.innerText = data.name;
            lbl.title = href;
            lbl.style.cssText = "white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:230px;";

            row.appendChild(chk);
            row.appendChild(lbl);
            list.appendChild(row);
        });
    }

    // FILTER LOGIC 
    function getChannelHref(video) {
        if (video.tagName === "YTD-CHANNEL-RENDERER") {
            const link = video.querySelector("a#main-link");
            return link ? link.getAttribute("href") : null;
        }
        const sels = ['ytd-channel-name a', '#channel-name a', 'a[href^="/@"]', 'a[href^="/channel/"]'];
        for (let s of sels) {
            const el = video.querySelector(s);
            if (el) return el.getAttribute("href");
        }
        return null;
    }

    function processPage() {
        if (!isFilterEnabled) return;

        const junk = document.querySelectorAll(
            "ytd-rich-section-renderer, ytd-reel-shelf-renderer, ytd-radio-renderer, ytd-horizontal-card-list-renderer, ytd-shelf-renderer"
        );
        for (let i = 0; i < junk.length; i++) {
            if (junk[i].style.display !== "none") junk[i].style.display = "none";
        }

        const items = document.querySelectorAll(
            "ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-playlist-panel-video-renderer"
        );

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            if (item.innerHTML.includes("/shorts/")) {
                if (item.style.display !== "none") item.style.display = "none";
                continue;
            }

            if (item.querySelector("ytd-radio-renderer")) {
                if (item.style.display !== "none") item.style.display = "none";
                continue;
            }

            const href = getChannelHref(item);
            
            if (!href) {
                if (item.style.display !== "none") item.style.display = "none";
                continue;
            }

            let cleanHref = href;
            if (cleanHref.includes("youtube.com")) cleanHref = new URL(cleanHref).pathname;

            const data = channelsMap[cleanHref];
            if (data && data.allowed) {
                if (item.style.display === "none") item.style.display = "";
            } else {
                if (item.style.display !== "none") item.style.display = "none";
            }
        }
    }

    function showAllVideos() {
        const all = document.querySelectorAll("*");
        for (let i = 0; i < all.length; i++) {
            if (all[i].style.display === "none") all[i].style.display = "";
        }
    }

    //  EXECUTION 
    function startAggressiveLoop() {
        processPage(); 
        if (safetyInterval) clearInterval(safetyInterval);
        safetyInterval = setInterval(processPage, 600);
    }

    function stopAggressiveLoop() {
        if (safetyInterval) clearInterval(safetyInterval);
    }

    function init() {
        loadSettings();
        
        setInterval(() => {
            if (document.querySelector("ytd-masthead #end") && !document.getElementById("cb-container")) {
                createUI();
            }
        }, 1000);

        if (Object.keys(channelsMap).length === 0) fetchOfficialSubs();

        const obs = new MutationObserver((mutations) => {
            if (!isFilterEnabled) return;
            let hasNewNodes = false;
            for (let m of mutations) {
                if (m.addedNodes.length > 0) {
                    hasNewNodes = true;
                    break;
                }
            }
            if (hasNewNodes) processPage();
        });

        const root = document.querySelector("ytd-app") || document.body;
        if (root) obs.observe(root, { childList: true, subtree: true });

        window.addEventListener("yt-navigate-finish", () => {
             if (isFilterEnabled) setTimeout(processPage, 500);
             const toggleSwitch = document.querySelector("#cb-toggle-section > div");
             const toggleKnob = toggleSwitch ? toggleSwitch.firstChild : null;
             if (toggleSwitch && toggleKnob) updateToggleVisuals(toggleSwitch, toggleKnob);
        });
    }

    init();
})();