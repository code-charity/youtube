/*--------------------------------------------------------------
>>> DETAILS:
----------------------------------------------------------------
# 
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# 
--------------------------------------------------------------*/

const YOUTUBE_WATCH_URL = "https://www.youtube.com/watch?v";
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action === "copyTranscript" && request?.tab?.url.startsWith(YOUTUBE_WATCH_URL)){
        copyTranscript();
      }
    }
);

function copyTranscript(){
    const transcriptContainer = document.querySelector('#description-inline-expander span.yt-core-attributed-string');

    if (transcriptContainer) {
        const transcriptElements = transcriptContainer.children;

        const elementHTMLArray = [];
        for (const element of transcriptElements) {
            const anchorElement = element.querySelector('a');

            if (anchorElement) {
                elementHTMLArray.push(anchorElement.textContent);
            } else {
                elementHTMLArray.push(element.outerHTML);
            }
        }

        let fullTranscriptHTML = elementHTMLArray.join(' ');
        fullTranscriptHTML = fullTranscriptHTML.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');

        const tempInput = document.createElement('input');
        tempInput.setAttribute('value', fullTranscriptHTML);
        document.body.appendChild(tempInput);
      
        // Select the text in the input
        tempInput.select();

        document.execCommand('copy');

        document.body.removeChild(tempInput);
    }
}