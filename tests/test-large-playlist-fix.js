// Test script to verify the large playlist autoplay fix
// This script can be run in the browser console on a YouTube playlist page

function testLargePlaylistFix() {
    console.log('🧪 Testing Large Playlist Autoplay Fix');
    
    // Check if we're on a playlist page
    const playlistId = new URLSearchParams(window.location.search).get('list');
    if (!playlistId) {
        console.error('❌ Not on a playlist page. Please navigate to a YouTube playlist first.');
        return false;
    }
    
    console.log('✅ Found playlist ID:', playlistId);
    
    // Check if ImprovedTube is loaded
    if (typeof ImprovedTube === 'undefined') {
        console.error('❌ ImprovedTube not loaded. Please ensure the extension is active.');
        return false;
    }
    
    console.log('✅ ImprovedTube loaded');
    
    // Check if our new functions exist
    if (typeof ImprovedTube.playlistLargePlaylistHandler !== 'function') {
        console.error('❌ playlistLargePlaylistHandler function not found');
        return false;
    }
    
    if (typeof ImprovedTube.cleanupPlaylistHandlers !== 'function') {
        console.error('❌ cleanupPlaylistHandlers function not found');
        return false;
    }
    
    console.log('✅ New playlist functions are available');
    
    // Test playlist data access
    const playlistData = ImprovedTube.elements.ytd_watch?.playlistData;
    if (!playlistData) {
        console.error('❌ Playlist data not available. Try playing a video from the playlist first.');
        return false;
    }
    
    console.log('✅ Playlist data found:', {
        currentIndex: playlistData.currentIndex,
        localCurrentIndex: playlistData.localCurrentIndex,
        totalVideos: playlistData.totalVideos
    });
    
    // Test the fix by calling our handler
    try {
        ImprovedTube.playlistLargePlaylistHandler();
        console.log('✅ playlistLargePlaylistHandler executed successfully');
    } catch (error) {
        console.error('❌ Error in playlistLargePlaylistHandler:', error);
        return false;
    }
    
    // Check if observer is created
    if (ImprovedTube.playlistAutoplayObserver) {
        console.log('✅ Playlist autoplay observer created');
    } else {
        console.log('ℹ️ Playlist autoplay observer not created (may be normal if playlist_up_next_autoplay is enabled)');
    }
    
    // Test synchronization logic
    const testData = ImprovedTube.elements.ytd_watch?.playlistData;
    if (testData && testData.currentIndex === testData.localCurrentIndex) {
        console.log('✅ Playlist indices are synchronized');
    } else {
        console.log('ℹ️ Playlist indices:', {
            currentIndex: testData?.currentIndex,
            localCurrentIndex: testData?.localCurrentIndex
        });
    }
    
    console.log('🎉 Large playlist autoplay fix test completed successfully!');
    console.log('📝 To test with a large playlist:');
    console.log('   1. Find a playlist with 400+ videos');
    console.log('   2. Start playing from video #200 or later');
    console.log('   3. Let videos autoplay to verify the fix works');
    
    return true;
}

// Auto-run test if on a playlist page
if (typeof window !== 'undefined' && window.location && new URLSearchParams(window.location.search).get('list')) {
    setTimeout(testLargePlaylistFix, 2000);
} else if (typeof window !== 'undefined') {
    console.log('ℹ️ Navigate to a YouTube playlist to test the large playlist fix');
}

// Export for manual testing
if (typeof window !== 'undefined') {
    window.testLargePlaylistFix = testLargePlaylistFix;
}
