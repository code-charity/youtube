/*--------------------------------------------------------------
>>> BLOCKLIST
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.blocklist = {
	component: 'button',
	variant: 'blocklist',
	category: true,
	on: {
		click: {
			section1: {
				component: 'section',
				variant: 'card',
				
				blocklist_activate: {
					component: 'switch',
					variant: 'activation',
					text: 'activate'
				},
			},
			
			section2: {
				component: 'section',
				variant: 'card',
				blocklist_dislike_trigger: {
					component: 'switch',
					text: 'dislikingAVideoAddsItToBlocklist',
					storage: 'blocklist_dislike_trigger',
					id: 'blocklist_dislike_trigger'
					
				}
			},

			section3: {
				component: 'section',
				variant: 'card',

				channels: {
					component: 'button',
					text: 'channels',
					style: {
						justifyContent: 'space-between'
					},
					on: {
						click: {
							component: 'section',
							variant: 'card',
							on: {
								render: function () {
									let skeleton = {},
										blocklist = satus.storage.get('blocklist');

									if (blocklist && blocklist.channels) {
										for (let key in blocklist.channels) {
											let channel = blocklist.channels[key];

											if (channel !== false) {
												skeleton[key] = {
													component: 'div',
													variant: 'blocklist',
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
																let blocklist = satus.storage.get('blocklist'),
																	component = this.parentNode;

																if (blocklist && blocklist.channels) {
																	delete blocklist.channels[component.dataset.id];

																	satus.storage.set('blocklist', blocklist, function () {
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
					},
					list: {
						component: 'span',
						style: {
							opacity: .64
						},
						on: {
							render: function () {
								let blocklist = satus.storage.get('blocklist');

								if (blocklist && blocklist.channels && Object.keys(blocklist.channels).length) {
									this.textContent = '('+Object.keys(blocklist.channels).length+')';
								} else {
									this.textContent = '(empty)';
								}
							}
						}
					}
				},
				videos: {
					component: 'button',
					text: 'videos',
					style: {
						justifyContent: 'space-between'
					},
					on: {
						click: {
							component: 'section',
							variant: 'card',
							on: {
								render: function () {
									let skeleton = {},
										blocklist = satus.storage.get('blocklist');

									if (blocklist && blocklist.videos) {
										for (let key in blocklist.videos) {
											let video = blocklist.videos[key];

											if (video !== false) {
												skeleton[key] = {
													component: 'div',
													variant: 'blocklist',
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
																let blocklist = satus.storage.get('blocklist'),
																	component = this.parentNode;

																if (blocklist && blocklist.videos) {
																	delete blocklist.videos[component.dataset.id];

																	satus.storage.set('blocklist', blocklist, function () {
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
					},
					list: {
						component: 'span',
						style: {
							opacity: .64
						},
						on: {
							render: function () {
								let blocklist = satus.storage.get('blocklist');

								if (blocklist && blocklist.videos && Object.keys(blocklist.videos).length) {
									this.textContent = '('+Object.keys(blocklist.videos).length+')';
								} else {
									this.textContent = '(empty)';
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
		text: 'blocklist'
	}
};
