(() => {
    const STEP = 0.1;
    const MIN = 0.1,
    MAX = 16;
    const USE_ALT = true;
    const USE_CTRL = false;

    function clamp(n, a, b) {
    return Math.min(b, Math.max(a, n));
    }

    function showOverlay(text) {
    let el = document.getElementById("imyt-speed-overlay");
    if (!el) {
        el = document.createElement("div");
        el.id = "imyt-speed-overlay";
        Object.assign(el.style, {
        position: "fixed",
        top: "12px",
        right: "12px",
        zIndex: 2147483647,
        padding: "6px 10px",
        borderRadius: "8px",
        background: "rgba(0,0,0,.75)",
        color: "#fff",
        fontSize: "14px",
        fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        });
        document.documentElement.appendChild(el);
    }
    el.textContent = `Speed: ${text}×`;
    clearTimeout(showOverlay._t);
    showOverlay._t = setTimeout(() => el.remove(), 900);
    }

    function onWheel(e) {
    const overVideo =
        e.target && (e.target.tagName === "VIDEO" || e.target.closest("video"));
    if (!overVideo) return;

    const ok = (USE_ALT && e.altKey) || (USE_CTRL && e.ctrlKey);
    if (!ok) return;

    const video = document.querySelector("video");
    if (!video) return;

    e.preventDefault();

    const dir = e.deltaY < 0 ? 1 : -1;
    const next = clamp(
        Number((video.playbackRate + dir * STEP).toFixed(2)),
        MIN,
        MAX
    );
    if (next !== video.playbackRate) {
        video.playbackRate = next;
        showOverlay(next);
    }
    }

    window.addEventListener("wheel", onWheel, { passive: false });
})();
