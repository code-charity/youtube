chrome.storage.local.get(function(items) {
    document.addEventListener('ImprovedTubeAnalyzer', function() {
        if (items.analyzer_activation !== false) {
            if (document.querySelector('ytd-channel-name a') && chrome && chrome.runtime) {
                chrome.runtime.sendMessage({
                    name: 'improvedtube-analyzer',
                    value: document.querySelector('ytd-channel-name a').innerText
                });
            }
        }
    });
});
