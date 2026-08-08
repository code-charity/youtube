const fs = require('fs');
const path = require('path');

describe('Playlist Sort by Duration Fix (#4212)', () => {
	let ImprovedTube;

	beforeAll(() => {
		const filePath = path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/playlist.js');
		const playlistContent = fs.readFileSync(filePath, 'utf8');

		ImprovedTube = {
			storage: {},
			elements: {}
		};

		// Execute playlist content within context
		const fn = new Function('ImprovedTube', playlistContent);
		fn(ImprovedTube);
	});

	describe('ImprovedTube.parseDuration', () => {
		test('should parse HH:MM:SS format correctly', () => {
			expect(ImprovedTube.parseDuration('1:02:15')).toBe(3735);
		});

		test('should parse MM:SS format correctly', () => {
			expect(ImprovedTube.parseDuration('3:45')).toBe(225);
		});

		test('should parse single SS format or number correctly', () => {
			expect(ImprovedTube.parseDuration('45')).toBe(45);
			expect(ImprovedTube.parseDuration(120)).toBe(120);
		});

		test('should handle invalid or empty input gracefully', () => {
			expect(ImprovedTube.parseDuration('')).toBe(0);
			expect(ImprovedTube.parseDuration(null)).toBe(0);
			expect(ImprovedTube.parseDuration('invalid')).toBe(0);
		});
	});

	describe('ImprovedTube.getVideoDuration', () => {
		test('should extract duration from lengthSeconds', () => {
			const item = {
				playlistVideoRenderer: {
					lengthSeconds: '180'
				}
			};
			expect(ImprovedTube.getVideoDuration(item)).toBe(180);
		});

		test('should fallback to lengthText simpleText', () => {
			const item = {
				playlistPanelVideoRenderer: {
					lengthText: { simpleText: '10:00' }
				}
			};
			expect(ImprovedTube.getVideoDuration(item)).toBe(600);
		});
	});

	describe('ImprovedTube.playlistSortByDuration', () => {
		test('should sort playlist contents from shortest to longest', () => {
			const mockPlaylist = {
				contents: [
					{ playlistVideoRenderer: { lengthSeconds: '600' } },
					{ playlistVideoRenderer: { lengthSeconds: '60' } },
					{ playlistVideoRenderer: { lengthSeconds: '300' } }
				]
			};

			ImprovedTube.elements.ytd_watch = {
				data: {
					contents: {
						twoColumnWatchNextResults: {
							playlist: {
								playlist: mockPlaylist
							}
						}
					}
				},
				updatePageData_: jest.fn()
			};

			ImprovedTube.playlistSortByDuration(true);

			const sortedDurations = mockPlaylist.contents.map(item =>
				parseInt(item.playlistVideoRenderer.lengthSeconds, 10)
			);
			expect(sortedDurations).toEqual([60, 300, 600]);
		});
	});
});
