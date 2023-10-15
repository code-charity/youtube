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
    function(request) {
      if (request.action === "copyTranscript" && request?.tab?.url.startsWith(YOUTUBE_WATCH_URL)){
        copyTranscript();
      }else if(request.action === "copyTranscript" && !request?.tab?.url.startsWith(YOUTUBE_WATCH_URL)){
        alert('This feature is only available on YouTube video pages.');
      }
    }
);

function copyTranscript(){
  const transcriptContainer = document.querySelector('#description-inline-expander span.yt-core-attributed-string');

  if (transcriptContainer) {
      const transcriptElements = transcriptContainer.children;

      const elementHTMLArray = [];
      for (const element of transcriptElements) {
          elementHTMLArray.push(element.textContent);
      }

      let fullTranscriptHTML = elementHTMLArray.join(' ');
      fullTranscriptHTML = fullTranscriptHTML.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');

      navigator.clipboard.writeText(fullTranscriptHTML).then(
        () => {
          alert('Transcript copied to clipboard!');
        }
      ).catch(() => {
        alert('Copying transcript failed!')
      })
  }
}