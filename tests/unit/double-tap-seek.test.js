// double-tap seek tests

global.ImprovedTube = {
    storage: {},
    elements: { player: null, video: null },
    input: {},
    showStatus: jest.fn(),
    doubleTapSeek: null
};

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Extract doubleTapSeek from shortcuts.js (it's not exported as a module)
const shortcutsCode = fs.readFileSync(
    path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/shortcuts.js'),
    'utf-8'
);
const fnMatch = shortcutsCode.match(/ImprovedTube\.doubleTapSeek\s*=\s*function[\s\S]*?\n};/);
if (!fnMatch) throw new Error('doubleTapSeek not found in shortcuts.js');
vm.runInThisContext(fnMatch[0]);

describe('Double-tap seek', () => {
    let mockPlayer;

    beforeEach(() => {
        mockPlayer = {
            getCurrentTime: jest.fn(() => 100),
            getDuration: jest.fn(() => 300),
            seekTo: jest.fn(),
            classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() },
            querySelector: jest.fn(() => null)
        };
        ImprovedTube.elements.player = mockPlayer;
        ImprovedTube.showStatus.mockClear();
    });

    test('fixed mode seeks by configured distance', () => {
        ImprovedTube.storage.player_double_tap_seek_mode = 'fixed';
        ImprovedTube.storage.player_double_tap_seek_fixed_distance = 5;
        ImprovedTube.doubleTapSeek(1, 2);
        expect(mockPlayer.seekTo).toHaveBeenCalledWith(105, true);
        expect(mockPlayer.classList.add).toHaveBeenCalledWith('ytp-seek-forward-bump');
    });

    test('backward seek clamps and adds correct class', () => {
        ImprovedTube.storage.player_double_tap_seek_mode = 'fixed';
        ImprovedTube.storage.player_double_tap_seek_fixed_distance = 5;
        ImprovedTube.doubleTapSeek(-1, 2);
        expect(mockPlayer.seekTo).toHaveBeenCalledWith(95, true);
        expect(mockPlayer.classList.add).toHaveBeenCalledWith('ytp-seek-backward-bump');
    });

    test('progressive mode uses escalating distances', () => {
        ImprovedTube.storage.player_double_tap_seek_mode = 'progressive';
        ImprovedTube.storage.player_double_tap_seek_distance_2 = 10;
        ImprovedTube.storage.player_double_tap_seek_distance_3 = 30;
        ImprovedTube.storage.player_double_tap_seek_distance_4 = 60;
        ImprovedTube.doubleTapSeek(1, 2);
        expect(mockPlayer.seekTo).toHaveBeenCalledWith(110, true);
        mockPlayer.getCurrentTime.mockReturnValue(100);
        ImprovedTube.doubleTapSeek(1, 3);
        expect(mockPlayer.seekTo).toHaveBeenCalledWith(130, true);
        mockPlayer.getCurrentTime.mockReturnValue(100);
        ImprovedTube.doubleTapSeek(1, 4);
        expect(mockPlayer.seekTo).toHaveBeenCalledWith(160, true);
    });

    test('default mode is a no-op', () => {
        ImprovedTube.storage.player_double_tap_seek_mode = 'default';
        ImprovedTube.doubleTapSeek(1, 2);
        expect(mockPlayer.seekTo).not.toHaveBeenCalled();
    });

    test('clamps to 0 when seeking before start', () => {
        ImprovedTube.storage.player_double_tap_seek_mode = 'fixed';
        ImprovedTube.storage.player_double_tap_seek_fixed_distance = 200;
        mockPlayer.getCurrentTime.mockReturnValue(50);
        ImprovedTube.doubleTapSeek(-1, 2);
        expect(mockPlayer.seekTo).toHaveBeenCalledWith(0, true);
    });

    test('clamps to duration when seeking past end', () => {
        ImprovedTube.storage.player_double_tap_seek_mode = 'fixed';
        ImprovedTube.storage.player_double_tap_seek_fixed_distance = 200;
        mockPlayer.getCurrentTime.mockReturnValue(250);
        ImprovedTube.doubleTapSeek(1, 2);
        expect(mockPlayer.seekTo).toHaveBeenCalledWith(300, true);
    });

    test('toggles ytp-seek visual feedback classes', () => {
        ImprovedTube.storage.player_double_tap_seek_mode = 'fixed';
        ImprovedTube.storage.player_double_tap_seek_fixed_distance = 10;
        ImprovedTube.doubleTapSeek(1, 2);
        expect(mockPlayer.classList.add).toHaveBeenCalledWith('ytp-seek-forward-bump');
    });
});
