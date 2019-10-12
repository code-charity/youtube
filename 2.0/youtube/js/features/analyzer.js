ImprovedTube.videoUrl = '"null"';
ImprovedTube.playingTime = 0;

document.addEventListener('ImprovedTubeAnalyzer', function() {
    let category = '';

    if (!document.querySelector('ytd-metadata-row-renderer yt-formatted-string a') && document.querySelector('#meta-contents ytd-expander[collapsed] paper-button#more')) {
        document.querySelector('#meta-contents ytd-expander[collapsed] paper-button#more').click();

        setTimeout(function() {
            if (document.querySelector('ytd-metadata-row-renderer yt-formatted-string a')) {
                chrome.runtime.sendMessage({
                    name: 'improvedtube-analyzer',
                    value: '{name:"' + document.querySelector('ytd-metadata-row-renderer yt-formatted-string a').innerText + '",value:1}'
                });
            }
        }, 100);

        return false;
    }

    if (document.querySelector('ytd-metadata-row-renderer yt-formatted-string a')) {
        category = document.querySelector('ytd-metadata-row-renderer yt-formatted-string a').innerText;
    }

    if (document.querySelector('#watch-description-extras .watch-info-tag-list a')) {
        category = document.querySelector('#watch-description-extras .watch-info-tag-list a').innerText;
    }

    chrome.runtime.sendMessage({
        name: 'improvedtube-analyzer',
        value: category
    });
});