/*------------------------------------------------------------------------------
  APPEARANCE
------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------
  PLAYER
------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------
 PLAYER SIZE
------------------------------------------------------------------------------*/
ImprovedTube.playerSize = function () {
	if (this.storage.player_size === "custom") {    
        var width = Number(this.storage.custom_player_size_width) || 1280,
            height = Number(this.storage.custom_player_size_height) || 720,
            style = this.elements.player_size_style || document.createElement("style");
			
        style.textContent = ':root {';
        style.textContent += "--it-player-width:" + width + "px;";
        style.textContent += "--it-player-height:" + height + "px;";
        style.textContent += "}";

        document.body.appendChild(style);
        window.dispatchEvent(new Event('resize'));
	}
};
/*------------------------------------------------------------------------------
 FORCED THEATER MODE
------------------------------------------------------------------------------*/
ImprovedTube.forcedTheaterMode = function () {
    if (ImprovedTube.storage.forced_theater_mode === true && ImprovedTube.elements.ytd_watch && ImprovedTube.elements.player) {
        var button = ImprovedTube.elements.player.querySelector("button.ytp-size-button");

        if (button && ImprovedTube.elements.ytd_watch.theater === false) {
            document.cookie = "wide=1;domain=.youtube.com";

            setTimeout(function () {
                button.click();
            }, 100);
        }
    }
};
/*------------------------------------------------------------------------------
 HD THUMBNAIL
------------------------------------------------------------------------------*/
ImprovedTube.playerHdThumbnail = function () {
    if (this.storage.player_hd_thumbnail === true) {
        var thumbnail = ImprovedTube.elements.player_thumbnail;

        if (thumbnail.style.backgroundImage.indexOf("/hqdefault.jpg") !== -1) {
            thumbnail.style.backgroundImage = thumbnail.style.backgroundImage.replace("/hqdefault.jpg", "/maxresdefault.jpg");
        }
    }
};
/*------------------------------------------------------------------------------
 ALWAYS SHOW PROGRESS BAR
------------------------------------------------------------------------------*/
ImprovedTube.alwaysShowProgressBar = function () {
    if (this.storage.always_show_progress_bar === true) {
        var player = ImprovedTube.elements.player;

        if (player && player.className.indexOf("ytp-autohide") !== -1) {
            var played = (player.getCurrentTime() * 100) / player.getDuration(),
                loaded = player.getVideoBytesLoaded() * 100,
                play_bars = player.querySelectorAll(".ytp-play-progress"),
                load_bars = player.querySelectorAll(".ytp-load-progress"),
                width = 0,
                progress_play = 0,
                progress_load = 0;

            for (var i = 0, l = play_bars.length; i < l; i++) {
                width += play_bars[i].offsetWidth;
            }

            var width_percent = width / 100;

            for (var i = 0, l = play_bars.length; i < l; i++) {
                var a = play_bars[i].offsetWidth / width_percent,
                    b = 0,
                    c = 0;

                if (played - progress_play >= a) {
                    b = 100;
                } else if (played > progress_play && played < a + progress_play) {
                    b = (100 * ((played - progress_play) * width_percent)) / play_bars[i].offsetWidth;
                }

                play_bars[i].style.transform = "scaleX(" + b / 100 + ")";

                if (loaded - progress_load >= a) {
                    c = 100;
                } else if (loaded > progress_load && loaded < a + progress_load) {
                    c = (100 * ((loaded - progress_load) * width_percent)) / play_bars[i].offsetWidth;
                }

                load_bars[i].style.transform = "scaleX(" + c / 100 + ")";

                progress_play += a;
                progress_load += a;
            }
        }
    }
};
/*------------------------------------------------------------------------------
 VIDEO REMAINING DURATION
------------------------------------------------------------------------------*/
ImprovedTube.formatSecond = function (rTime) {
    var time = new Date(null);
    if (this.storage.duration_with_speed === true) {
        var playbackRate = this.elements.video.playbackRate;
        time.setSeconds(rTime / playbackRate);
    } else {
        time.setSeconds(rTime);
    }

    if (rTime / 3600 < 1) {
        return time.toISOString().substr(14, 5);
    } else {
        return time.toISOString().substr(11, 8);
    }
};

ImprovedTube.playerRemainingDuration = function () {
    var element = document.querySelector(".ytp-time-remaining-duration");
    if (this.storage.player_remaining_duration === true) {
        var player = ImprovedTube.elements.player;
        var rTime = ImprovedTube.formatSecond((player.getDuration() - player.getCurrentTime()).toFixed(0));
        if (!element) {
            var label = document.createElement("span");
            label.textContent = " (-" + rTime + ")";
            label.className = "ytp-time-remaining-duration";
            document.querySelector(".ytp-time-display").appendChild(label);
        } else {
            element.textContent = " (-" + rTime + ")";
        }
    } else if (element) {
        element.remove();
    }
};
/*------------------------------------------------------------------------------
 Comments Sidebar
------------------------------------------------------------------------------*/
ImprovedTube.commentsSidebar = function() {
    const video = document.querySelector("#player .ytp-chrome-bottom") || document.querySelector("#container .ytp-chrome-bottom");
	let hasApplied = 0;
	if(ImprovedTube.storage.comments_sidebar === true){
        sidebar();
        setGrid();
        applyObserver();
        window.addEventListener("resize", sidebar)
    }
	function sidebar(){
        resizePlayer();
		if(window.matchMedia("(min-width: 1984px)").matches) {
			if (!hasApplied) {
                initialSetup()
                setTimeout(() => {document.getElementById("columns").appendChild(document.getElementById("related"))})
			}
			else if (hasApplied == 2){ //from medium to big size
                setTimeout(() => {document.getElementById("columns").appendChild(document.getElementById("related"))})
			} 
			hasApplied = 1
		}
		else if(window.matchMedia("(min-width: 1000px)").matches) {	  
			if (!hasApplied) {
				initialSetup();
			}
			else if (hasApplied == 1){ //from big to medium
                document.getElementById("primary-inner").appendChild(document.getElementById("related"));
			}
			hasApplied = 2
		}
		else { /// <1000 
			if(hasApplied == 1){
                document.getElementById("primary-inner").appendChild(document.getElementById("related"));
                let comments = document.querySelector("#comments");
                let below = document.getElementById("below");
                below.appendChild(comments);
			}
			else if (hasApplied == 2){
                let comments = document.querySelector("#comments");
                let below = document.getElementById("below");
                below.appendChild(comments);
			}
			hasApplied = 0;
		}
	}
	function setGrid(){
		let checkParentInterval = setInterval(() => {
			container = document.querySelector("#related ytd-compact-video-renderer.style-scope")?.parentElement;
			if (container) {
					clearInterval(checkParentInterval);
					container.style.display = "flex";
					container.style.flexWrap = "wrap";
			}
		}, 250);
	}
    function initialSetup() {
        let secondaryInner = document.getElementById("secondary-inner");
        let primaryInner = document.getElementById("primary-inner");
        let comments = document.querySelector("#comments");
        setTimeout(() => {
            primaryInner.appendChild(document.getElementById("panels"));
            primaryInner.appendChild(document.getElementById("related"))
            secondaryInner.appendChild(document.getElementById("chat-template"));
            secondaryInner.appendChild(comments);
        })
    }
    function resizePlayer() {
        const width = video.offsetWidth + 24;
        const player = document.querySelector("#player.style-scope.ytd-watch-flexy");
        document.getElementById("primary").style.width = `${width}px`;
        player.style.width = `${width}px`;
    }
    function applyObserver(){
        const debouncedResizePlayer = debounce(resizePlayer, 200);
        const resizeObserver = new ResizeObserver(debouncedResizePlayer);
        resizeObserver.observe(video);
    }
    function debounce(callback, delay) {
        let timerId;
        return function (...args) {
            clearTimeout(timerId);
            timerId = setTimeout(() => {
            callback.apply(this, args);
            }, delay);
        };
    }
      
}
/*------------------------------------------------------------------------------
 SIDEBAR
------------------------------------------------------------------------------*/
/*----------------------------------------------------------------
 TRANSCRIPT
--------------------------------------------------------------*/
ImprovedTube.transcript = function (el){ if (ImprovedTube.storage.transcript === true){
try{el.querySelector('*[target-id*=transcript]').removeAttribute('visibility');}
catch{}}}
/*----------------------------------------------------------------
 CHAPTERS
--------------------------------------------------------------*/
ImprovedTube.chapters = function (el){ if (ImprovedTube.storage.chapters === true){
try{el.querySelector('*[target-id*=chapters]').removeAttribute('visibility');} 
catch{}}
}
/*------------------------------------------------------------------------------
 LIVECHAT
------------------------------------------------------------------------------*/
let isCollapsed = false
ImprovedTube.livechat = function () {
    if (this.storage.livechat === "collapsed") {
        if(ImprovedTube.elements.livechat && !isCollapsed){
            ImprovedTube.elements.livechat.button.click();
            isCollapsed = true 
        }
    }else{
        if(isCollapsed){
            ImprovedTube.elements.livechat.button.click();
            isCollapsed = false
        }
    }
};
/*------------------------------------------------------------------------------
  DETAILS
------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------
  PLAYER BUTTONS
------------------------------------------------------------------------------*/
ImprovedTube.improvedtubeYoutubeButtonsUnderPlayer = function () {
	if (window.self !== window.top) {
		return false;
	}
	if (document.documentElement.dataset.pageType === 'video') {

	var section = document.querySelector('#subscribe-button');  
	   if (this.storage.description == "classic" 
		||  this.storage.description == "classic_expanded" || this.storage.description == "classic_hidden"  )
	   {var section = document.querySelector('#flex.ytd-video-primary-info-renderer');}

	if (section && !document.querySelector('.improvedtube-player-button')) {


		if (this.storage.below_player_loop !== false) {
			var button = document.createElement('button'),
				svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
				path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

			button.className = 'improvedtube-player-button';
			button.dataset.tooltip = 'Loop';

			svg.style.opacity = '.5';

			svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
			path.setAttributeNS(null, 'd', 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z');

			button.onclick = function () {
				var video = ImprovedTube.elements.video,
					svg = this.children[0];

				if (video.hasAttribute('loop')) {
					video.removeAttribute('loop');

					svg.style.opacity = '.5';
				} else if (!/ad-showing/.test(ImprovedTube.elements.player.className)) {
					video.setAttribute('loop', '');

					svg.style.opacity = '1';
				}
			};

			svg.appendChild(path);
			button.appendChild(svg);

			section.insertAdjacentElement('afterend', button)
		}
				if (this.storage.below_player_pip !== false) {
			var button = document.createElement('button'),
				svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
				path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

			button.className = 'improvedtube-player-button';
			button.dataset.tooltip = 'PiP';
			svg.style.opacity = '.64';
			svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
			path.setAttributeNS(null, 'd', 'M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z');

			button.onclick = function () {
				var video = document.querySelector('#movie_player video');

				if (video) {
					video.requestPictureInPicture();
				}
			};

			svg.appendChild(path);
			button.appendChild(svg);

			section.insertAdjacentElement('afterend', button)
		}
		
				if (this.storage.below_player_screenshot !== false) {
			var button = document.createElement('button'),
				svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
				path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

			button.className = 'improvedtube-player-button';
			button.dataset.tooltip = 'Screenshot';
			svg.style.opacity = '.55';
			svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
			path.setAttributeNS(null, 'd', 'M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z');
			button.onclick = ImprovedTube.screenshot;

			svg.appendChild(path);
			button.appendChild(svg);

			section.insertAdjacentElement('afterend', button)
		}
	  }
   }
};
/*------------------------------------------------------------------------------
 EXPAND DESCRIPTION
------------------------------------------------------------------------------*/
ImprovedTube.expandDescription = function (el) {
    if (this.storage.description === "expanded" || this.storage.description === "classic_expanded" ) 
	   if(el)try{el.click()}catch{setTimeout(function(){el.click();},1000);}
    };	
/*------------------------------------------------------------------------------
 HIDE DETAIL BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.hideDetailButton = function (el) {
    if (el.length === 4) {
        el[3].setAttribute("id", "Save-button");
        el[2].setAttribute("id", "Clip-button");
        el[1].setAttribute("id", "Thanks-button");
    }
    else if (el.length === 3) {
        el[2].setAttribute("id", "Save-button");
        el[1].setAttribute("id", "Clip-button");
    }
};
/*--------------------------------------------------------------
 DAY OF WEEK
--------------------------------------------------------------*/
ImprovedTube.dayOfWeek = function () {
    var element = document.querySelector(".ytd-day-of-week");
    if (this.storage.day_of_week === true) {
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        setTimeout(function () {
            var videoDate = document.querySelector("[itemprop=datePublished]").content;
            var tempDate = new Date(videoDate);
            if (!element) {
                var label = document.createElement("span");
                label.textContent = " , " + days[tempDate.getDay() + 1];
                label.className = "ytd-day-of-week";
                document.querySelector("ytd-video-primary-info-renderer #info #info-strings yt-formatted-string").append(label);
            } else {
                element.textContent = days[tempDate.getDay() + 1] + ", ";
            }
        }, 25);
    } else if (element) {
        element.remove();
    }
};
/*------------------------------------------------------------------------------
 HOW LONG AGO THE VIDEO WAS UPLOADED
------------------------------------------------------------------------------*/
ImprovedTube.howLongAgoTheVideoWasUploaded = function () {
    if (this.storage.how_long_ago_the_video_was_uploaded === true && this.elements.yt_channel_name) {
        var xhr = new XMLHttpRequest(),
            key = this.storage["google-api-key"] || ImprovedTube.defaultApiKey,
            id = this.getParam(location.href.slice(location.href.indexOf("?") + 1), "v");

        function timeSince(date) {
            var seconds = Math.floor((new Date() - new Date(date)) / 1000),
                interval = Math.floor(seconds / 31536000);

            if (interval > 1) {
                return interval + " years ago";
            }
            interval = Math.floor(seconds / 2592000);
            if (interval > 1) {
                return interval + " months ago";
            }
            interval = Math.floor(seconds / 86400);
            if (interval > 1) {
                return interval + " days ago";
            }
            interval = Math.floor(seconds / 3600);
            if (interval > 1) {
                return interval + " hours ago";
            }
            interval = Math.floor(seconds / 60);
            if (interval > 1) {
                return interval + " minutes ago";
            }

            return Math.floor(seconds) + " seconds ago";
        }

        xhr.addEventListener("load", function () {
            var response = JSON.parse(this.responseText),
                element = ImprovedTube.elements.how_long_ago_the_video_was_uploaded || document.createElement("div");

            ImprovedTube.empty(element);

            if (response.error) {
                element.appendChild(document.createTextNode("• Error: " + response.error.code));
            } else {
                element.appendChild(document.createTextNode("• " + timeSince(response.items[0].snippet.publishedAt)));
            }

            element.className = "it-how-long-ago-the-video-was-uploaded";

            ImprovedTube.elements.how_long_ago_the_video_was_uploaded = element;

            document.querySelector("#info #info-text").appendChild(element);
        });

        xhr.open("GET", "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + id + "&key=" + key, true);
        xhr.send();
    }
};
/*------------------------------------------------------------------------------
 SHOW CHANNEL VIDEOS COUNT
------------------------------------------------------------------------------*/
ImprovedTube.channelVideosCount = function () {
    if (this.storage.channel_videos_count === true && this.elements.yt_channel_link) {
        var key = this.storage["google-api-key"] || ImprovedTube.defaultApiKey;
        if (this.elements.yt_channel_link.href.indexOf("/channel/") == -1) {
            var xhr = new XMLHttpRequest(),
                id = this.getParam(location.href.slice(location.href.indexOf("?") + 1), "v");
            xhr.open("GET", "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + id + "&key=" + key, false);
            xhr.send();
            if (xhr.readyState === xhr.DONE && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                id = response.items[0].snippet.channelId;
            }
        } else {
            id = this.elements.yt_channel_link.href.slice(this.elements.yt_channel_link.href.indexOf("/channel/") + "/channel/".length);
            if (id.indexOf("/") !== -1) {
                id = id.match(/.+?(?=\/)/)[0];
            }
        }

        xhr = new XMLHttpRequest();

        xhr.addEventListener("load", function () {
            var response = JSON.parse(this.responseText),
                parent = document.querySelector("#meta ytd-channel-name + yt-formatted-string"),
                element = ImprovedTube.elements.channel_videos_count || document.createElement("div");

            ImprovedTube.empty(element);

            if (response.error) {
                element.appendChild(document.createTextNode("• Error: " + response.error.code));
            } else {
                element.appendChild(document.createTextNode("• " + response.items[0].statistics.videoCount + " videos"));
            }

            element.className = "it-channel-videos-count";

            ImprovedTube.elements.channel_videos_count = element;

            parent.appendChild(element);

            ImprovedTube.elements.channel_videos_count = element;
        });

        xhr.open("GET", "https://www.googleapis.com/youtube/v3/channels?part=statistics&id=" + id + "&key=" + key, true);
        xhr.send();
    }
};
