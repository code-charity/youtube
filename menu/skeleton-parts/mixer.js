/*--------------------------------------------------------------
>>> MIXER
--------------------------------------------------------------*/

extension.skeleton.header.sectionEnd.menu.on.click.mixer = {
	component: 'button',
	on: {
		click: {
			component: 'section',
			variant: 'card',
			on: {
				render: function () {
					var component = this,
						parent = component.parentNode;

					if (chrome && chrome.tabs) {
						chrome.tabs.query({}, function (tabs) {
							satus.render({
								component: 'span',
								text: 'noOpenVideoTabs'
							}, component);

							for (var i = 0, l = tabs.length; i < l; i++) {
								var tab = tabs[i];

								chrome.tabs.sendMessage(tab.id, {
									action: 'mixer'
								}, function (response) {
									if (response) {
										console.log(response);
										if (component) {
											component.remove();

											component = undefined;
										}

										satus.render({
											component: 'section',
											class: 'satus-section--mixer',
											style: {
												'backgroundImage': 'url(https://img.youtube.com/vi/' + response.url + '/0.jpg)',
											},

											title: {
												component: 'h1',
												text: response.title
											},
											section: {
												component: 'section',
												data: {
													'noConnectionLabel': satus.locale.get('tryToReloadThePage') || 'tryToReloadThePage'
												},

												mixer_volume: {
													component: 'slider',
													variant: 'row',
													text: 'volume',
													data: {
														id: response.tabId
													},
													storage: false,
													step: 1,
													min: 0,
													max: 100,
													value: response.volume,
													on: {
														change: function () {
															chrome.tabs.sendMessage(Number(this.dataset.id), {
																action: 'set-volume',
																value: this.storage.value
															});
														}
													}
												},
												mixer_playback_speed: {
													component: 'slider',
													variant: 'row',
													text: 'playbackSpeed',
													data: {
														id: response.tabId
													},
													storage: false,
													min: .1,
													max: 8,
													step: .05,
													value: response.playbackRate,
													on: {
														change: function () {
															chrome.tabs.sendMessage(Number(this.dataset.id), {
																action: 'set-playback-speed',
																value: this.storage.value
															});
														}
													}
												}
											}
										}, parent);
									}
								});
							}
						});
					}
				}
			}
		}
	},

	svg: {
		component: 'svg',
		attr: {
			'viewBox': '0 0 24 24',
			'fill': 'none',
			'stroke-width': '1.75'
		},

		path: {
			component: 'path',
			attr: {
				'd': 'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07'
			}
		}
	},
	label: {
		component: 'span',
		text: 'mixer'
	}
};