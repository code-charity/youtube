/*--------------------------------------------------------------
>>> CHANNEL
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.channel = {
	component: 'button',
	variant: 'channel',
	category: true,
	on: {
		click: {
			component: 'section',
			variant: 'card',

			channel_default_tab: {
				component: 'select',
				text: 'defaultChannelTab',
				options: [{
					text: 'home',
					value: '/'
				}, {
					text: 'videos',
					value: '/videos'
				}, {
					text: 'shorts',
					value: '/shorts'
				}, {
					text: 'playlists',
					value: '/playlists'
				}, {
					text: 'community',
					value: '/community'
				}, {
					text: 'channels',
					value: '/channels'
				}, {
					text: 'about',
					value: '/about'
				}]
			},
			channel_trailer_autoplay: {
				component: 'switch',
				text: 'trailerAutoplay',
				value: true
			},
			channel_play_all_button: {
				component: 'switch',
				text: 'playAllButton'
			},
			channel_hide_featured_content: {
				component: 'switch',
				text: 'hideFeaturedContent'
			},
			channel_compact_theme: {
				component: 'switch',
				text: 'compactTheme'
			},
			channel_details_button: {
				component: 'switch',
				text: 'Details',
				value: false, // Default state is off
				on: {
					change: async function (event) {
						const apiKey = YOUTUBE_API_KEY;
						const switchElement = event.target.closest('.satus-switch');
                        const isChecked = switchElement && switchElement.dataset.value === 'true';
						console.log(isChecked)
						try {
							const videoId = await getCurrentVideoId();
							const videoInfo = await getVideoInfo(apiKey, videoId);

							const channelId = videoInfo.snippet.channelId
							const channelInfo = await getChannelInfo(apiKey, channelId);
							
							chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
								console.log("Sending message to content.js");
								chrome.tabs.sendMessage(tabs[0].id, {
									action: isChecked ? 'append-channel-info' : 'remove-channel-info',
									channelName: channelInfo.channelName,
									uploadTime: new Date(videoInfo.snippet.publishedAt).toLocaleString(),
									videoCount: channelInfo.videoCount,
									customUrl: channelInfo.customUrl
								})
							});
						} catch (error){
							console.error(error);
						}
					}
				}
			}
		}
	},

	icon: {
		component: 'span',

		svg: {
			component: 'svg',
			attr: {
				'viewBox': '0 0 24 24',
				'fill': 'transparent',
				'stroke': 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.75'
			},

			rect: {
				component: 'rect',
				attr: {
					'width': '20',
					'height': '15',
					'x': '2',
					'y': '7',
					'rx': '2',
					'ry': '2'
				}
			},
			path: {
				component: 'path',
				attr: {
					'd': 'M17 2l-5 5-5-5'
				}
			}
		}
	},
	label: {
		component: 'span',
		text: 'channel'
	}
};

async function getCurrentVideoId() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('videoId', (result) => {
			console.log('Retrieved video ID from storage:', result.videoId); // Debugging log
            if (result.videoId) {
                resolve(result.videoId);
            } else {
                reject('Video ID not found');
            }
        });
    });
}

async function getVideoInfo(apiKey, videoId) {
	const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails,statistics,status`);
	const data = await response.json();
	const video = data?.items[0];
	console.log(video)
	
	return video;
}

async function getChannelInfo(apiKey, channelId) {
	const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?id=${channelId}&key=${apiKey}&part=snippet,contentDetails,statistics,status`);
	const data = await response.json();
	const channel = data.items[0];
	console.log(channel);
	const customUrl = channel.snippet.customUrl;
	const channelName = channel.snippet.title;
	// const uploadTime = new Date(channel.snippet.publishedAt).toLocaleString();
	const videoCount = channel.statistics.videoCount;

	return {channelName, videoCount, customUrl};
}

