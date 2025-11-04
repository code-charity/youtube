/*------------------------------------------------------------------------------
>>> ORIGINAL TITLE TOGGLE
------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------
This feature allows users to toggle between the translated video title
and the original title without refreshing the page.
------------------------------------------------------------------------------*/

ImprovedTube.originalTitleToggle = function() {
	// Check if required functions exist
	if (typeof ImprovedTube.videoId !== 'function') {
		console.log('ImprovedTube.videoId function not available, skipping original title toggle');
		return;
	}

	// Check if feature is enabled - default to TRUE unless explicitly disabled
	const storageValue = this.storage?.original_title_toggle ?? 
	                     ImprovedTube.storage?.original_title_toggle;
	
	// If storage value is explicitly false, disable the feature
	if (storageValue === false) {
		console.log('Original title toggle is disabled');
		// Remove any existing toggle functionality
		const titleElement = document.querySelector('h1.style-scope.ytd-watch-metadata yt-formatted-string');
		if (titleElement) {
			titleElement.style.cursor = 'default';
			titleElement.onclick = null;
			titleElement.title = '';
			// Clean up data attributes
			delete titleElement.dataset.itOriginalTitle;
			delete titleElement.dataset.itTranslatedTitle;
			delete titleElement.dataset.itShowingOriginal;
			delete titleElement.dataset.itVideoId;
			// Remove indicator
			const indicator = titleElement.querySelector('.it-title-toggle-indicator');
			if (indicator) {
				indicator.remove();
			}
		}
		return;
	}

	console.log('Original title toggle is enabled (value:', storageValue, '), proceeding...');

	const titleElement = document.querySelector('h1.style-scope.ytd-watch-metadata yt-formatted-string');
	if (!titleElement) {
		return;
	}

	const currentVideoId = ImprovedTube.videoId();
	if (!currentVideoId) {
		return;
	}

	// FORCE cleanup if this is a new video - even if dataset hasn't updated yet
	const storedVideoId = titleElement.dataset.itVideoId;
	if (storedVideoId && storedVideoId !== currentVideoId) {
		console.log('New video detected! Cleaning up old data. Old:', storedVideoId, 'New:', currentVideoId);
		
		// New video detected, FORCE clean up old data
		titleElement.style.cursor = 'default';
		titleElement.onclick = null;
		titleElement.title = '';
		delete titleElement.dataset.itOriginalTitle;
		delete titleElement.dataset.itTranslatedTitle;
		delete titleElement.dataset.itShowingOriginal;
		delete titleElement.dataset.itVideoId;
		
		// Remove old indicator
		const oldIndicator = titleElement.querySelector('.it-title-toggle-indicator');
		if (oldIndicator) {
			oldIndicator.remove();
		}
	}

	// Check if already initialized for this video
	if (titleElement.dataset.itVideoId === currentVideoId && titleElement.dataset.itOriginalTitle) {
		console.log('Already initialized for this video, skipping');
		return;
	}

	const currentTitle = titleElement.textContent?.trim();
	if (!currentTitle) {
		return;
	}

	// Store the video ID to track which video this title belongs to
	titleElement.dataset.itVideoId = currentVideoId;
	titleElement.dataset.itTranslatedTitle = currentTitle;
	titleElement.dataset.itShowingOriginal = 'false';
	
	console.log('Current displayed title:', currentTitle);
	
	// Fetch the original title from the video's metadata
	ImprovedTube.fetchOriginalTitle(currentVideoId, function(originalTitle) {
		// Double-check we're still on the same video
		const currentVidId = ImprovedTube.videoId();
		if (currentVidId !== currentVideoId) {
			console.log('Video changed, aborting title toggle setup');
			return; // Video changed, abort
		}

		console.log('Original title fetched:', originalTitle);
		console.log('Current title:', currentTitle);

		// Check if titles are different (accounting for whitespace differences)
		const normalizedOriginal = originalTitle?.trim().replace(/\s+/g, ' ');
		const normalizedCurrent = currentTitle?.trim().replace(/\s+/g, ' ');

		if (!originalTitle || normalizedOriginal === normalizedCurrent) {
			// No translation detected, disable the toggle
			console.log('No translation detected - titles are the same');
			return;
		}

		console.log('Translation detected! Setting up toggle...');

		// Store the original title
		titleElement.dataset.itOriginalTitle = originalTitle;
		
		// Make the title clickable
		titleElement.style.cursor = 'pointer';
		titleElement.title = 'Click to toggle between original and translated title';
		
		// Remove any existing indicator first
		const existingIndicator = titleElement.querySelector('.it-title-toggle-indicator');
		if (existingIndicator) {
			existingIndicator.remove();
		}
		
		// Add visual indicator (small icon)
		const indicator = document.createElement('span');
		indicator.className = 'it-title-toggle-indicator';
		indicator.textContent = ' 🌐';
		indicator.style.fontSize = '0.7em';
		indicator.style.opacity = '0.6';
		indicator.style.marginLeft = '4px';
		indicator.title = 'Click to see original title';
		
		titleElement.appendChild(indicator);

		// Add click handler
		titleElement.onclick = function(e) {
			e.preventDefault();
			e.stopPropagation();
			
			const isShowingOriginal = this.dataset.itShowingOriginal === 'true';
			const originalTitle = this.dataset.itOriginalTitle;
			const translatedTitle = this.dataset.itTranslatedTitle;
			const indicatorEl = this.querySelector('.it-title-toggle-indicator');
			
			if (isShowingOriginal) {
				// Switch to translated
				this.childNodes[0].textContent = translatedTitle;
				this.dataset.itShowingOriginal = 'false';
				if (indicatorEl) {
					indicatorEl.title = 'Click to see original title';
					indicatorEl.style.opacity = '0.6';
				}
			} else {
				// Switch to original
				this.childNodes[0].textContent = originalTitle;
				this.dataset.itShowingOriginal = 'true';
				if (indicatorEl) {
					indicatorEl.title = 'Click to see translated title';
					indicatorEl.style.opacity = '1';
				}
			}
		};
	});
};

/*------------------------------------------------------------------------------
Fetch the original title from the video metadata
Reuses existing DATA from fetchDOMData if available to avoid duplication
------------------------------------------------------------------------------*/
ImprovedTube.fetchOriginalTitle = function(videoId, callback) {
	if (!videoId) {
		callback(null);
		return;
	}

	let originalTitle = null;

	// Method 1: Try existing DATA object first (if fetchDOMData was already called)
	if (typeof DATA !== 'undefined' && DATA && DATA.title && DATA.videoID === videoId) {
		console.log('Found title in existing DATA:', DATA.title);
		callback(DATA.title);
		return;
	}

	// Method 2: Try from microformat (JSON-LD) - reuses existing pattern
	try {
		const microformatScript = document.querySelector('#microformat script, script[type="application/ld+json"]');
		if (microformatScript) {
			const data = JSON.parse(microformatScript.textContent);
			if (data && (data.name || data.title)) {
				originalTitle = data.name || data.title;
				console.log('Found title in microformat:', originalTitle);
				callback(originalTitle);
				return;
			}
		}
	} catch (e) {
		console.log('Could not parse microformat:', e);
	}

	// Method 3: Try from meta tags - consolidated approach
	try {
		const metaTitle = document.querySelector('meta[property="og:title"], meta[name="title"]')?.content;
		if (metaTitle) {
			originalTitle = metaTitle;
			console.log('Found title in meta tags:', originalTitle);
			callback(originalTitle);
			return;
		}
	} catch (e) {
		console.log('Could not get title from meta tags:', e);
	}

	// Method 4: Try from player API (if available)
	try {
		if (typeof movie_player !== 'undefined' && movie_player?.getVideoData) {
			const videoData = movie_player.getVideoData();
			if (videoData?.title) {
				originalTitle = videoData.title;
				console.log('Found title in player API:', originalTitle);
				callback(originalTitle);
				return;
			}
		}
	} catch (e) {
		console.log('Could not get title from player API:', e);
	}

	// Method 5: Try from ytplayer config (if available)
	try {
		if (typeof ytplayer !== 'undefined' && ytplayer?.config?.args?.title) {
			originalTitle = ytplayer.config.args.title;
			console.log('Found title in ytplayer.config:', originalTitle);
			callback(originalTitle);
			return;
		}
	} catch (e) {
		console.log('Could not get title from ytplayer.config:', e);
	}

	// If all methods fail
	console.log('Could not fetch original title for video:', videoId);
	callback(null);
};

/*------------------------------------------------------------------------------
Initialize on page load and navigation
------------------------------------------------------------------------------*/
ImprovedTube.initOriginalTitleToggle = function() {
	// Check if required functions exist before proceeding
	if (typeof ImprovedTube.videoId !== 'function') {
		console.log('ImprovedTube.videoId function not available, skipping initialization');
		return;
	}

	// Clear any existing intervals
	if (this.originalTitleInterval) {
		clearInterval(this.originalTitleInterval);
	}

	const currentVideoId = ImprovedTube.videoId();
	if (!currentVideoId) {
		return;
	}

	console.log('Initializing original title toggle for video:', currentVideoId);

	let attempts = 0;
	const maxAttempts = 50; // 5 seconds max
	let lastTitleText = '';
	
	// Wait for the title element to be available with the CURRENT video's title
	this.originalTitleInterval = setInterval(() => {
		attempts++;
		
		const titleElement = document.querySelector('h1.style-scope.ytd-watch-metadata yt-formatted-string');
		const latestVideoId = ImprovedTube.videoId();
		
		// Make sure we're still on the same video we started with
		if (latestVideoId !== currentVideoId) {
			console.log('Video changed during initialization, aborting');
			clearInterval(ImprovedTube.originalTitleInterval);
			return;
		}
		
		if (titleElement && titleElement.textContent?.trim()) {
			const currentText = titleElement.textContent.trim();
			
			// If title changed from last check, wait a bit more to ensure it's stable
			if (currentText !== lastTitleText) {
				lastTitleText = currentText;
				console.log('Title text changed, waiting for stability:', currentText.substring(0, 50) + '...');
				return; // Wait for next iteration to see if it changes again
			}
			
			// Check if this title element is already processed for this video
			if (titleElement.dataset.itVideoId === currentVideoId) {
				console.log('Title already processed for this video, skipping');
				clearInterval(ImprovedTube.originalTitleInterval);
				return;
			}
			
			// Title is stable, proceed
			console.log('Title is stable, proceeding with toggle setup');
			clearInterval(ImprovedTube.originalTitleInterval);
			
			// Longer delay for navigation to ensure ytInitialData is updated
			setTimeout(() => {
				// Double check we're still on the same video
				if (ImprovedTube.videoId() === currentVideoId) {
					ImprovedTube.originalTitleToggle();
				}
			}, 500);
		}
		
		if (attempts >= maxAttempts) {
			console.log('Max attempts reached, stopping initialization');
			clearInterval(ImprovedTube.originalTitleInterval);
		}
	}, 100);
};

/*------------------------------------------------------------------------------
>>> ORIGINAL TITLE TOGGLE FOR THUMBNAILS (Home, Search, Sidebar)
------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------
This feature allows users to see original titles on video thumbnails
by Ctrl+Clicking on them throughout YouTube
------------------------------------------------------------------------------*/

ImprovedTube.originalTitleThumbnails = function() {
	// Check if required functions exist
	if (typeof ImprovedTube.videoId !== 'function') {
		console.log('ImprovedTube.videoId function not available, skipping thumbnail toggle');
		return;
	}

	// Check if feature is enabled
	const storageValue = this.storage?.original_title_toggle ?? 
	                     ImprovedTube.storage?.original_title_toggle;
	
	if (storageValue === false) {
		return;
	}

	console.log('Original title thumbnails feature initialized');

	// Add event listener for Ctrl+Click on video titles
	document.addEventListener('click', function(event) {
		// Check if Ctrl key is pressed
		if (!event.ctrlKey) {
			return;
		}

		console.log('Ctrl+Click detected, target:', event.target);

		// IMPORTANT: Skip if we're on a video page and clicking the main title
		// The main video title has its own toggle feature
		if (document.documentElement.dataset.pageType === 'video') {
			const mainTitle = event.target.closest('h1.style-scope.ytd-watch-metadata yt-formatted-string');
			if (mainTitle) {
				console.log('Skipping - this is the main video page title');
				return; // Don't handle main video title here
			}
		}

		// Find the closest video title element
		let target = event.target;
		let titleElement = null;
		let videoId = null;
		let linkElement = null;

		// Method 1: Check if we clicked directly on a link with video ID
		if (target.tagName === 'A' && target.href) {
			const match = target.href.match(/[?&]v=([^&]+)/);
			if (match) {
				linkElement = target;
				videoId = match[1];
				titleElement = target; // The link itself is the title element
			}
		}

		// Method 2: Check if we clicked on or inside a link
		if (!titleElement) {
			linkElement = target.closest('a[href*="/watch?v="]');
			if (linkElement) {
				const match = linkElement.href.match(/[?&]v=([^&]+)/);
				if (match) {
					videoId = match[1];
					titleElement = target; // Use the clicked element as title
				}
			}
		}

		// Method 3: Check if clicked element is a title with ID
		if (!titleElement && (target.id === 'video-title' || target.closest('#video-title'))) {
			titleElement = target.id === 'video-title' ? target : target.closest('#video-title');
		}

		// Method 4: Check if clicked on attributed string (live streams, some grid layouts)
		if (!titleElement && (target.classList.contains('yt-core-attributed-string') || target.closest('.yt-core-attributed-string'))) {
			const attributedString = target.classList.contains('yt-core-attributed-string') ? target : target.closest('.yt-core-attributed-string');
			titleElement = attributedString;
		}

		// Method 5: Search upward for video renderer containers
		if (!titleElement) {
			const videoRenderer = target.closest(
				'ytd-video-renderer, ' +
				'ytd-grid-video-renderer, ' +
				'ytd-rich-grid-media, ' +
				'ytd-compact-video-renderer, ' +
				'ytd-playlist-video-renderer, ' +
				'ytd-rich-item-renderer, ' +
				'ytd-playlist-panel-video-renderer, ' +
				'ytd-reel-item-renderer'
			);
			if (videoRenderer) {
				titleElement = videoRenderer.querySelector('#video-title, .yt-core-attributed-string, #video-title-link, .title');
			}
		}

		// Try to find video ID if we haven't already
		if (titleElement && !videoId) {
			// First, try to find link from the clicked element upward
			if (!linkElement) {
				linkElement = target.closest('a[href*="/watch?v="]');
			}
			
			// If not found, search in the parent container
			if (!linkElement) {
				const container = titleElement.closest(
					'ytd-video-renderer, ' +
					'ytd-grid-video-renderer, ' +
					'ytd-rich-grid-media, ' +
					'ytd-compact-video-renderer, ' +
					'ytd-playlist-video-renderer, ' +
					'ytd-rich-item-renderer, ' +
					'ytd-playlist-panel-video-renderer, ' +
					'ytd-lockup-view-model, ' +
					'ytd-compact-link-renderer'
				);
				linkElement = container?.querySelector(
					'a[href*="/watch?v="], ' +
					'a#thumbnail, ' +
					'a#video-title, ' +
					'a#video-title-link, ' +
					'a.yt-simple-endpoint, ' +
					'a.yt-lockup-metadata-view-model__title'
				);
			}
			
			const url = linkElement?.href;
			if (url) {
				const match = url.match(/[?&]v=([^&]+)/);
				videoId = match ? match[1] : null;
			}
		}

		console.log('Found title element:', titleElement, 'Video ID:', videoId);

		if (!titleElement || !videoId) {
			console.log('No title element or video ID found');
			return;
		}

		// Prevent navigation - do this EARLY once we know it's a valid video link
		event.preventDefault();
		event.stopPropagation();

		console.log('Prevented navigation, processing title toggle');

		const currentTitle = titleElement.textContent?.trim();
		if (!currentTitle) {
			return;
		}

		// Check if we already have the original title stored
		if (titleElement.dataset.itOriginalThumbnailTitle) {
			// Toggle between original and translated
			const isShowingOriginal = titleElement.dataset.itShowingOriginalThumbnail === 'true';
			
			console.log('Toggling title, currently showing original:', isShowingOriginal);
			
			if (isShowingOriginal) {
				// Show translated
				titleElement.textContent = titleElement.dataset.itTranslatedThumbnailTitle;
				titleElement.dataset.itShowingOriginalThumbnail = 'false';
				titleElement.style.fontStyle = 'normal';
				titleElement.style.color = '';
			} else {
				// Show original
				titleElement.textContent = titleElement.dataset.itOriginalThumbnailTitle;
				titleElement.dataset.itShowingOriginalThumbnail = 'true';
				titleElement.style.fontStyle = 'italic';
				titleElement.style.color = '#3ea6ff';
			}
			return;
		}

		// Store the translated title
		titleElement.dataset.itTranslatedThumbnailTitle = currentTitle;
		titleElement.dataset.itShowingOriginalThumbnail = 'false';

		// Show loading indicator
		const originalText = titleElement.textContent;
		titleElement.textContent = '🌐 Loading...';
		titleElement.style.color = '#aaa';

		console.log('Fetching original title for video:', videoId);

		// Fetch original title - use the same method as video page (NOT ytInitialData)
		ImprovedTube.fetchOriginalTitleForThumbnail(videoId, function(originalTitle) {
			console.log('Received original title:', originalTitle);
			
			// Restore text if fetch failed
			if (!originalTitle) {
				titleElement.textContent = originalText + ' ❌';
				titleElement.style.color = '#f00';
				setTimeout(() => {
					titleElement.textContent = originalText;
					titleElement.style.color = '';
				}, 2000);
				return;
			}

			const normalizedOriginal = originalTitle?.trim().replace(/\s+/g, ' ');
			const normalizedCurrent = currentTitle?.trim().replace(/\s+/g, ' ');

			if (normalizedOriginal === normalizedCurrent) {
				// No translation detected
				titleElement.textContent = originalText + ' (✓ same)';
				titleElement.style.color = '#0a0';
				setTimeout(() => {
					titleElement.textContent = originalText;
					titleElement.style.color = '';
				}, 2000);
				return;
			}

			// Store and show original title
			titleElement.dataset.itOriginalThumbnailTitle = originalTitle;
			titleElement.textContent = originalTitle;
			titleElement.dataset.itShowingOriginalThumbnail = 'true';
			titleElement.style.fontStyle = 'italic';
			titleElement.style.color = '#3ea6ff';
			titleElement.title = 'Ctrl+Click again to see translated title';
			
			console.log('Successfully toggled to original title');
		});
	}, true);
};

/*------------------------------------------------------------------------------
Fetch original title for thumbnails using YouTube oEmbed API (no CORS)
------------------------------------------------------------------------------*/
ImprovedTube.fetchOriginalTitleForThumbnail = function(videoId, callback) {
	if (!videoId) {
		callback(null);
		return;
	}

	console.log('Fetching original title for thumbnail, video ID:', videoId);

	// Try method 1: YouTube's oEmbed API - it returns the original title and doesn't have CORS restrictions
	fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
		.then(response => {
			if (!response.ok) {
				throw new Error('oEmbed API failed');
			}
			return response.json();
		})
		.then(data => {
			if (data && data.title) {
				console.log('Found original title from oEmbed API:', data.title);
				callback(data.title);
			} else {
				console.log('No title in oEmbed response, trying fallback...');
				tryFallbackMethod();
			}
		})
		.catch(error => {
			console.error('Error fetching from oEmbed API:', error);
			console.log('Trying fallback method via content script...');
			tryFallbackMethod();
		});

	// Fallback: Use postMessage to ask content script to fetch via background
	function tryFallbackMethod() {
		const messageId = 'fetch-title-' + videoId + '-' + Date.now();
		let responseReceived = false;
		
		// Listen for response
		const listener = function(event) {
			if (event.data && event.data.type === 'IT_ORIGINAL_TITLE_RESPONSE' && event.data.messageId === messageId) {
				responseReceived = true;
				window.removeEventListener('message', listener);
				console.log('Received response from content script:', event.data);
				if (event.data.title) {
					console.log('Found original title from fallback method:', event.data.title);
					callback(event.data.title);
				} else {
					console.log('Fallback method also failed - no title in response');
					callback(null);
				}
			}
		};
		
		window.addEventListener('message', listener);
		
		console.log('Sending message to content script with messageId:', messageId);
		
		// Request via content script
		window.postMessage({
			type: 'IT_FETCH_ORIGINAL_TITLE',
			videoId: videoId,
			messageId: messageId
		}, '*');
		
		// Timeout after 5 seconds
		setTimeout(function() {
			if (!responseReceived) {
				console.log('Fallback method timeout - no response received');
				window.removeEventListener('message', listener);
				callback(null);
			}
		}, 5000);
	}
};
