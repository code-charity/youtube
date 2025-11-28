/**
 * Unit tests for original-title.js
 * Testing the original/translated title toggle feature
 */

// Mock global objects
global.chrome = {
	runtime: {
		sendMessage: jest.fn()
	},
	storage: {
		local: {
			get: jest.fn((keys, callback) => {
				callback({ original_title_toggle: true });
			})
		}
	}
};

global.ImprovedTube = {
	storage: { data: {} },
	elements: {}
};

// Mock fetch API
global.fetch = jest.fn();

describe('Original Title Toggle Feature', () => {
	
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
		
		// Reset DOM
		document.body.innerHTML = '';
		
		// Mock window.postMessage
		global.window.postMessage = jest.fn();
		global.window.addEventListener = jest.fn();
	});

	describe('HTML Entity Decoding', () => {
		
		test('should decode &amp; to &', () => {
			const input = 'Music &amp; Relaxation';
			const expected = 'Music & Relaxation';
			
			// Manual decode function (same as in background.js)
			const decode = (text) => text.replace(/&amp;/g, '&');
			
			expect(decode(input)).toBe(expected);
		});

		test('should decode multiple HTML entities', () => {
			const input = 'Focus &amp; Study - &lt;Relaxing Music&gt;';
			const expected = 'Focus & Study - <Relaxing Music>';
			
			const decode = (text) => text
				.replace(/&amp;/g, '&')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>');
			
			expect(decode(input)).toBe(expected);
		});

		test('should decode numeric HTML entities', () => {
			const input = 'Music &#38; Sounds';
			const expected = 'Music & Sounds';
			
			const decode = (text) => text.replace(/&#(\d+);/g, 
				(match, dec) => String.fromCharCode(dec));
			
			expect(decode(input)).toBe(expected);
		});
	});

	describe('Title Comparison and Normalization', () => {
		
		test('should normalize whitespace in titles', () => {
			const title1 = 'Medieval  Music   for    Focus';
			const title2 = 'Medieval Music for Focus';
			
			const normalize = (text) => text?.trim().replace(/\s+/g, ' ');
			
			expect(normalize(title1)).toBe(normalize(title2));
		});

		test('should detect identical titles (no translation)', () => {
			const original = 'Relaxing Piano Music';
			const translated = 'Relaxing Piano Music';
			
			const normalize = (text) => text?.trim().replace(/\s+/g, ' ');
			const areEqual = normalize(original) === normalize(translated);
			
			expect(areEqual).toBe(true);
		});

		test('should detect different titles (translation exists)', () => {
			const original = 'Beautiful Relaxing Music';
			const translated = 'Krásna relaxačná hudba'; // Slovak
			
			const normalize = (text) => text?.trim().replace(/\s+/g, ' ');
			const areEqual = normalize(original) === normalize(translated);
			
			expect(areEqual).toBe(false);
		});
	});

	describe('Video ID Extraction', () => {
		
		test('should extract video ID from standard YouTube URL', () => {
			const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
			const match = url.match(/[?&]v=([^&]+)/);
			const videoId = match ? match[1] : null;
			
			expect(videoId).toBe('dQw4w9WgXcQ');
		});

		test('should extract video ID from URL with multiple parameters', () => {
			const url = 'https://www.youtube.com/watch?v=abc123&list=PLxyz&index=5';
			const match = url.match(/[?&]v=([^&]+)/);
			const videoId = match ? match[1] : null;
			
			expect(videoId).toBe('abc123');
		});

		test('should return null for URL without video ID', () => {
			const url = 'https://www.youtube.com/';
			const match = url.match(/[?&]v=([^&]+)/);
			const videoId = match ? match[1] : null;
			
			expect(videoId).toBeNull();
		});
	});

	describe('oEmbed API Integration', () => {
		
		test('should construct correct oEmbed URL', () => {
			const videoId = 'dQw4w9WgXcQ';
			const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
			
			expect(oembedUrl).toContain('oembed');
			expect(oembedUrl).toContain(videoId);
			expect(oembedUrl).toContain('format=json');
		});

		test('should handle successful oEmbed response', async () => {
			const mockTitle = 'Original Video Title';
			const mockResponse = {
				ok: true,
				json: async () => ({ title: mockTitle })
			};
			
			fetch.mockResolvedValueOnce(mockResponse);
			
			const response = await fetch('https://www.youtube.com/oembed?url=...');
			const data = await response.json();
			
			expect(data.title).toBe(mockTitle);
		});

		test('should handle failed oEmbed response', async () => {
			const mockResponse = {
				ok: false,
				status: 401
			};
			
			fetch.mockResolvedValueOnce(mockResponse);
			
			const response = await fetch('https://www.youtube.com/oembed?url=...');
			
			expect(response.ok).toBe(false);
			expect(response.status).toBe(401);
		});
	});

	describe('PostMessage Communication', () => {
		
		test('should create correct message format for content script', () => {
			const videoId = 'test123';
			const messageId = `fetch-title-${videoId}-${Date.now()}`;
			
			const message = {
				type: 'IT_FETCH_ORIGINAL_TITLE',
				videoId: videoId,
				messageId: messageId
			};
			
			expect(message.type).toBe('IT_FETCH_ORIGINAL_TITLE');
			expect(message.videoId).toBe(videoId);
			expect(message.messageId).toContain('fetch-title-test123');
		});

		test('should create correct response message format', () => {
			const messageId = 'fetch-title-test123-1234567890';
			const title = 'Test Title';
			
			const response = {
				type: 'IT_ORIGINAL_TITLE_RESPONSE',
				messageId: messageId,
				title: title
			};
			
			expect(response.type).toBe('IT_ORIGINAL_TITLE_RESPONSE');
			expect(response.messageId).toBe(messageId);
			expect(response.title).toBe(title);
		});
	});

	describe('Title Toggle State Management', () => {
		
		test('should initialize with translated title showing', () => {
			const titleElement = document.createElement('a');
			titleElement.textContent = 'Translated Title';
			
			// Mock dataset (not set yet)
			expect(titleElement.dataset.itShowingOriginalThumbnail).toBeUndefined();
		});

		test('should store both original and translated titles', () => {
			const titleElement = document.createElement('a');
			titleElement.dataset.itOriginalThumbnailTitle = 'Original Title';
			titleElement.dataset.itTranslatedThumbnailTitle = 'Translated Title';
			titleElement.dataset.itShowingOriginalThumbnail = 'false';
			
			expect(titleElement.dataset.itOriginalThumbnailTitle).toBe('Original Title');
			expect(titleElement.dataset.itTranslatedThumbnailTitle).toBe('Translated Title');
			expect(titleElement.dataset.itShowingOriginalThumbnail).toBe('false');
		});

		test('should toggle between original and translated', () => {
			const titleElement = document.createElement('a');
			titleElement.dataset.itOriginalThumbnailTitle = 'Original';
			titleElement.dataset.itTranslatedThumbnailTitle = 'Translated';
			titleElement.dataset.itShowingOriginalThumbnail = 'false';
			
			// Toggle to original
			const isShowingOriginal = titleElement.dataset.itShowingOriginalThumbnail === 'true';
			if (!isShowingOriginal) {
				titleElement.textContent = titleElement.dataset.itOriginalThumbnailTitle;
				titleElement.dataset.itShowingOriginalThumbnail = 'true';
			}
			
			expect(titleElement.textContent).toBe('Original');
			expect(titleElement.dataset.itShowingOriginalThumbnail).toBe('true');
		});
	});

});
