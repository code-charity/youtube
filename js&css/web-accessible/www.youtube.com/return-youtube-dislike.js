/*--------------------------------------------------------------
>>> RETURN YOUTUBE DISLIKE
--------------------------------------------------------------*/

ImprovedTube.RYD_SELECTORS = {
    video: [
        'segmented-like-dislike-button-view-model dislike-button-view-model button',
        'ytd-segmented-like-dislike-button-renderer #segmented-dislike-button button',
        '#top-level-buttons-computed button[aria-label*="islike"]:not([aria-label*="Like this"])'
    ],
    shorts: [
        'ytd-reel-video-renderer[is-active] #dislike-button button',
        '#dislike-button button[aria-label]'
    ]
};

ImprovedTube.rydUserState = new Map();
ImprovedTube.rydShortsObserver = null;

ImprovedTube.returnYoutubeDislike = function () {
    if (this.storage.return_youtube_dislike !== true) {
        this.rydRemoveCount();
        return;
    }

    const videoId = this.rydGetVideoId();
    if (!videoId) return;

    const lastVideoId = document.documentElement.getAttribute('it-ryd-video-id');
    if (lastVideoId === videoId && document.querySelector('.it-ryd-dislike-count')) {
        return;
    }

    document.documentElement.setAttribute('it-ryd-video-id', videoId);
    this.rydFetchCount(videoId);
};

ImprovedTube.rydGetVideoId = function () {
    // URL example: https://www.youtube.com/watch?v={videoId}
    const urlParams = new URLSearchParams(window.location.search);
    let videoId = urlParams.get('v');

    // URL example: https://www.youtube.com/shorts/{videoId}
    if (!videoId && window.location.pathname.startsWith('/shorts/')) {
        const match = window.location.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
        if (match) videoId = match[1];
    }

    return videoId;
};

/**
 * Fetch dislike count from API
 */
ImprovedTube.rydFetchCount = function (videoId) {
    fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`)
        .then(response => {
            if (!response.ok) throw new Error('API request failed');
            return response.json();
        })
        .then(data => this.rydDisplayCount(data))
        .catch(err => console.log('[ImprovedTube] RYD:', err.message));
};

/**
 * Format number to compact notation (1K, 1M, etc.)
 */
ImprovedTube.rydFormatNumber = function (num) {
    if (num == null) return '0';

    try {
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(num);
    } catch {
        // Fallback for older browsers
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return String(num);
    }
};

/**
 * Find the dislike button element
 */
ImprovedTube.rydFindButton = function () {
    const isShorts = window.location.pathname.startsWith('/shorts/');
    const selectors = isShorts ? this.RYD_SELECTORS.shorts : this.RYD_SELECTORS.video;

    for (const selector of selectors) {
        const button = document.querySelector(selector);
        if (button) return button;
    }

    // Fallback: search by aria-label
    if (!isShorts) {
        const buttons = document.querySelectorAll('#top-level-buttons-computed button[aria-label]');
        for (const btn of buttons) {
            const label = (btn.getAttribute('aria-label') || '').toLowerCase();
            if (label.includes('dislike') && !label.includes('like this')) {
                return btn;
            }
        }
    }

    return null;
};

/**
 * Display dislike count in the UI
 */
ImprovedTube.rydDisplayCount = function (data) {
    if (!data || data.dislikes === undefined) return;

    this.rydRemoveCount();

    const button = this.rydFindButton();
    if (!button) {
        // Retry once after DOM settles
        setTimeout(() => {
            if (!document.querySelector('.it-ryd-dislike-count')) {
                this.rydDisplayCount(data);
            }
        }, 1000);
        return;
    }

    const isShorts = window.location.pathname.startsWith('/shorts/');
    const countEl = document.createElement('span');
    countEl.className = 'it-ryd-dislike-count';
    countEl.textContent = this.rydFormatNumber(data.dislikes);
    countEl.dataset.count = data.dislikes;

    if (isShorts) {
        button.parentElement?.appendChild(countEl);
    } else {
        let container = button.querySelector('.yt-spec-button-shape-next__button-text-content');
        if (!container) {
            container = document.createElement('span');
            container.className = 'yt-spec-button-shape-next__button-text-content';
            button.appendChild(container);
        }
        container.textContent = '';
        container.appendChild(countEl);
    }

    this.rydAttachClickHandler(button, data.dislikes);
};

ImprovedTube.rydRemoveCount = function () {
    const el = document.querySelector('.it-ryd-dislike-count');
    if (el) el.remove();
};

ImprovedTube.rydAttachClickHandler = function (button, originalCount) {
    if (!button || button.dataset.rydListener) return;
    button.dataset.rydListener = 'true';

    const videoId = this.rydGetVideoId();
    if (!videoId) return;

    button.addEventListener('click', () => {
        setTimeout(() => this.rydUpdateCount(videoId, originalCount), 100);
    });
};

/**
 * Update count when user clicks dislike button
 */
ImprovedTube.rydUpdateCount = function (videoId, originalCount) {
    const countEl = document.querySelector('.it-ryd-dislike-count');
    const button = this.rydFindButton();
    if (!countEl || !button) return;

    const isDisliked = button.getAttribute('aria-pressed') === 'true';
    const wasDisliked = this.rydUserState.get(videoId) || false;
    let count = parseInt(countEl.dataset.count) || originalCount;

    if (isDisliked && !wasDisliked) {
        count++;
        this.rydUserState.set(videoId, true);
    } else if (!isDisliked && wasDisliked) {
        count = Math.max(0, count - 1);
        this.rydUserState.set(videoId, false);
    }

    countEl.textContent = this.rydFormatNumber(count);
    countEl.dataset.count = count;
};

/**
 * Initialize Shorts observer for video changes
 */
ImprovedTube.rydInitShortsObserver = function () {
    if (this.storage.return_youtube_dislike !== true) {
        this.rydShortsObserver?.disconnect();
        this.rydShortsObserver = null;
        return;
    }

    if (!window.location.pathname.startsWith('/shorts/') || this.rydShortsObserver) {
        return;
    }

    const container = document.querySelector('ytd-shorts');
    if (!container) return;

    this.rydShortsObserver = new MutationObserver(() => {
        if (document.querySelector('ytd-reel-video-renderer[is-active]')) {
            setTimeout(() => this.returnYoutubeDislike(), 500);
        }
    });

    this.rydShortsObserver.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['is-active']
    });
};
