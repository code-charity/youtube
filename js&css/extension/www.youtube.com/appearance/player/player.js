/*--------------------------------------------------------------
>>> PLAYER
----------------------------------------------------------------
#
--------------------------------------------------------------*/

/*--------------------------------------------------------------
#
--------------------------------------------------------------*/


/*--------------------------------------------------------------
#  HIDE VIDEO TITLE IN FULLSCREEN
--------------------------------------------------------------*/

extension.features.hideVideoTitleFullScreen = function (){
    document.addEventListener('fullscreenchange', function (){
        if(document.fullscreenElement){
            const youtubeTitle = document.querySelector(".ytp-title-text > a");
    
            if(youtubeTitle){
                if (extension.storage.get("hide_video_title_fullScreen") === true) {
                    youtubeTitle.style.display = "none";
                }else{
                    youtubeTitle.style.display = "block";
                }
            }
        }
    });
}