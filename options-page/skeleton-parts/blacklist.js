/*--------------------------------------------------------------
>>> BLACKLIST
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.blacklist = {
	component: 'button',
	variant: 'blacklist',
	category: true,
	on: {
		click: {
			blacklist_activate: {
				component: 'switch',
				variant: 'activation',
				text: 'activate'
			},
			section2: {
				component: 'section',
				variant: 'card',

				channels: {
					component: 'button',
					text: 'channels',
					on: {
						click: {
							component: 'section',
							variant: 'card',
							on: {
								render: function () {
									var skeleton = {},
										blacklist = satus.storage.get('blacklist');

									if (blacklist && blacklist.channels) {
										for (var key in blacklist.channels) {
											var channel = blacklist.channels[key];

											if (channel !== false) {
												skeleton[key] = {
													component: 'div',
													variant: 'blacklist',
													data: {
														id: key
													},

													title: {
														component: 'div',
														text: channel.title || ''
													},
													delete: {
														component: 'button',
														on: {
															click: function () {
																var blacklist = satus.storage.get('blacklist'),
																	component = this.parentNode;

																if (blacklist && blacklist.channels) {
																	delete blacklist.channels[component.dataset.id];

																	satus.storage.set('blacklist', blacklist, function () {
																		component.remove();
																	});
																}
															}
														},

														svg: {
															component: 'svg',
															attr: {
																'fill': 'currentColor',
																'viewBox': '0 0 24 24'
															},

															path: {
																component: 'path',
																attr: {
																	'd': 'M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10zM18 4h-2.5l-.7-.7A1 1 0 0 0 14 3H9.9a1 1 0 0 0-.7.3l-.7.7H6c-.6 0-1 .5-1 1s.5 1 1 1h12c.6 0 1-.5 1-1s-.5-1-1-1z'
																}
															}
														}
													}
												};
											}
										}
									}

									if (Object.keys(skeleton).length === 0) {
										satus.render({
											component: 'span',
											text: 'empty'
										}, this);
									} else {
										satus.render(skeleton, this);
									}
								}
							}
						}
					}
				},
				videos: {
					component: 'button',
					text: 'videos',
					on: {
						click: {
							component: 'section',
							variant: 'card',
							on: {
								render: function () {
									var skeleton = {},
										blacklist = satus.storage.get('blacklist');

									if (blacklist && blacklist.videos) {
										for (var key in blacklist.videos) {
											var video = blacklist.videos[key];

											if (video !== false) {
												skeleton[key] = {
													component: 'div',
													variant: 'blacklist',
													data: {
														id: key
													},

													title: {
														component: 'div',
														text: video.title || ''
													},
													delete: {
														component: 'button',
														on: {
															click: function () {
																var blacklist = satus.storage.get('blacklist'),
																	component = this.parentNode;

																if (blacklist && blacklist.videos) {
																	delete blacklist.videos[component.dataset.id];

																	satus.storage.set('blacklist', blacklist, function () {
																		component.remove();
																	});
																}
															}
														},

														svg: {
															component: 'svg',
															attr: {
																'fill': 'currentColor',
																'viewBox': '0 0 24 24'
															},

															path: {
																component: 'path',
																attr: {
																	'd': 'M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10zM18 4h-2.5l-.7-.7A1 1 0 0 0 14 3H9.9a1 1 0 0 0-.7.3l-.7.7H6c-.6 0-1 .5-1 1s.5 1 1 1h12c.6 0 1-.5 1-1s-.5-1-1-1z'
																}
															}
														}
													}
												};
											}
										}
									}

									if (Object.keys(skeleton).length === 0) {
										satus.render({
											component: 'span',
											text: 'empty'
										}, this);
									} else {
										satus.render(skeleton, this);
									}
								}
							}
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

			circle: {
				component: 'circle',
				attr: {
					'cx': '12',
					'cy': '12',
					'r': '10'
				}
			},
			path: {
				component: 'path',
				attr: {
					'd': 'M4.93 4.93l14.14 14.14'
				}
			}
		}
	},
	label: {
		component: 'span',
		text: 'blacklist'
	}
};