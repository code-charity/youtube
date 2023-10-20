/*--------------------------------------------------------------
>>> PLAYER
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.player = {
	component: 'button',
	variant: 'player',
	category: true,
	on: {
		click: {}
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

			path: {
				component: 'path',
				attr: {
					'd': 'M5 3l14 9-14 9V3z'
				}
			}
		}
	},
	label: {
		component: 'span',
		text: 'player'
	}
};

/*--------------------------------------------------------------
# SECTION
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.player.on.click = {
	section_1: {
		component: 'section',
		variant: 'card',

		autoplay: {
			component: 'switch',
			text: 'autoplay',
			value: true,
			storage: 'player_autoplay'
		},
		up_next_autoplay: {
			component: 'switch',
			text: 'upNextAutoplay',
			value: true
		},
		autopause_when_switching_tabs: {
			component: 'switch',
			text: 'autopauseWhenSwitchingTabs',
			storage: 'player_autopause_when_switching_tabs',
			id: 'autopause_when_switching_tabs',
			on: {
				click: function () {
					if (this.dataset.value === 'true' && satus.storage.get('only_one_player_instance_playing')) {
						document.getElementById('only_one_player_instance_playing').flip(false);
					}
					if (this.dataset.value === 'true' && satus.storage.get('player_autoPip')) {
						document.getElementById('player_autoPip').flip(false);
					}
				}
			}
		},
		only_one_player_instance_playing: {
			component: 'switch',
			text: 'onlyOnePlayerInstancePlaying',
			id: 'only_one_player_instance_playing',
			on: {
				click: function () {
					if (this.dataset.value === 'true' && satus.storage.get('player_autopause_when_switching_tabs')) {
						document.getElementById('autopause_when_switching_tabs').flip(false);
					}
				}
			}
		},
		player_autoPip: {
			component: 'switch',
			text: 'Auto-PiP (picture in picture)',
			id: 'player_autoPip',
			on: {
				click: function () {
					if (this.dataset.value === 'true' && satus.storage.get('player_autopause_when_switching_tabs')) {
						document.getElementById('only_one_player_instance_playing').flip(true);
						document.getElementById('autopause_when_switching_tabs').flip(false);
					}
				}
			}
		},
		player_forced_volume: {
			component: 'switch',
			text: 'forcedVolume',
			id: 'forced-volume'
		},
		player_volume: {
			component: 'slider',
			text: 'volume',
			step: 1,
			max: 400,
			value: 100
		},
		player_loudness_normalization: {
			component: 'switch',
			text: 'loudnessNormalization',
			value: true
		},
		player_forced_playback_speed: {
			component: 'switch',
			text: 'forcedPlaybackSpeed',
			id: 'forced-playback-speed'
		},
		player_force_speed_on_music: {
			component: 'switch',
			text: 'forcedPlaybackSpeedMusic'
		},	
		player_dont_speed_education: {
			component: 'switch',
			text: 'Don\'t speed up the (rare) category: Education',
		},
		player_playback_speed: {
			component: 'slider',
			text: 'playbackSpeed',
			textarea: true,
			value: 1,
			min: .1,
			max: 4,
			step: .05
		},
		forced_play_video_from_the_beginning: {
			component: 'switch',
			text: 'forcedPlayVideoFromTheBeginning'
		},
		autofullscreen: {
			component: 'switch',
			text: 'autoFullscreen',
			storage: 'player_autofullscreen'
		},
		subtitles: {
			component: 'button',
			text: 'subtitles',
			on: {
				click: {
					component: 'section',
					variant: 'card',

					player_subtitles: {
						component: 'switch',
						text: 'subtitles'
					},
					subtitles_language: {
						component: 'select',
						text: 'language',
						id: 'subtitles-language',
						options: [{
							value: 'default',
							text: 'default'
						}, {
							value: 'af',
							text: 'Afrikaans'
						}, {
							value: 'sq',
							text: 'Albanian'
						}, {
							value: 'am',
							text: 'Amharic'
						}, {
							value: 'ar',
							text: 'Arabic'
						}, {
							value: 'hy',
							text: 'Armenian'
						}, {
							value: 'az',
							text: 'Azerbaijani'
						}, {
							value: 'bn',
							text: 'Bangla'
						}, {
							value: 'eu',
							text: 'Basque'
						}, {
							value: 'be',
							text: 'Belarusian'
						}, {
							value: 'bs',
							text: 'Bosnian'
						}, {
							value: 'bg',
							text: 'Bulgarian'
						}, {
							value: 'my',
							text: 'Burmese'
						}, {
							value: 'ca',
							text: 'Catalan'
						}, {
							value: 'ceb',
							text: 'Cebuano'
						}, {
							value: 'zh-Hans',
							text: 'Chinese (Simplified)'
						}, {
							value: 'zh-Hant',
							text: 'Chinese (Traditional)'
						}, {
							value: 'co',
							text: 'Corsican'
						}, {
							value: 'hr',
							text: 'Croatian'
						}, {
							value: 'cs',
							text: 'Czech'
						}, {
							value: 'da',
							text: 'Danish'
						}, {
							value: 'nl',
							text: 'Dutch'
						}, {
							value: 'en',
							text: 'English'
						}, {
							value: 'eo',
							text: 'Esperanto'
						}, {
							value: 'et',
							text: 'Estonian'
						}, {
							value: 'fil',
							text: 'Filipino'
						}, {
							value: 'fi',
							text: 'Finnish'
						}, {
							value: 'fr',
							text: 'French'
						}, {
							value: 'gl',
							text: 'Galician'
						}, {
							value: 'ka',
							text: 'Georgian'
						}, {
							value: 'de',
							text: 'German'
						}, {
							value: 'el',
							text: 'Greek'
						}, {
							value: 'gu',
							text: 'Gujarati'
						}, {
							value: 'ht',
							text: 'Haitian Creole'
						}, {
							value: 'ha',
							text: 'Hausa'
						}, {
							value: 'haw',
							text: 'Hawaiian'
						}, {
							value: 'iw',
							text: 'Hebrew'
						}, {
							value: 'hi',
							text: 'Hindi'
						}, {
							value: 'hmn',
							text: 'Hmong'
						}, {
							value: 'hu',
							text: 'Hungarian'
						}, {
							value: 'is',
							text: 'Icelandic'
						}, {
							value: 'ig',
							text: 'Igbo'
						}, {
							value: 'id',
							text: 'Indonesian'
						}, {
							value: 'ga',
							text: 'Irish'
						}, {
							value: 'it',
							text: 'Italian'
						}, {
							value: 'ja',
							text: 'Japanese'
						}, {
							value: 'jv',
							text: 'Javanese'
						}, {
							value: 'kn',
							text: 'Kannada'
						}, {
							value: 'kk',
							text: 'Kazakh'
						}, {
							value: 'km',
							text: 'Khmer'
						}, {
							value: 'rw',
							text: 'Kinyarwanda'
						}, {
							value: 'ko',
							text: 'Korean'
						}, {
							value: 'ku',
							text: 'Kurdish'
						}, {
							value: 'ky',
							text: 'Kyrgyz'
						}, {
							value: 'lo',
							text: 'Lao'
						}, {
							value: 'la',
							text: 'Latin'
						}, {
							value: 'lv',
							text: 'Latvian'
						}, {
							value: 'lt',
							text: 'Lithuanian'
						}, {
							value: 'lb',
							text: 'Luxembourgish'
						}, {
							value: 'mk',
							text: 'Macedonian'
						}, {
							value: 'mg',
							text: 'Malagasy'
						}, {
							value: 'ms',
							text: 'Malay'
						}, {
							value: 'ml',
							text: 'Malayalam'
						}, {
							value: 'mt',
							text: 'Maltese'
						}, {
							value: 'mi',
							text: 'Maori'
						}, {
							value: 'mr',
							text: 'Marathi'
						}, {
							value: 'mn',
							text: 'Mongolian'
						}, {
							value: 'ne',
							text: 'Nepali'
						}, {
							value: 'no',
							text: 'Norwegian'
						}, {
							value: 'ny',
							text: 'Nyanja'
						}, {
							value: 'or',
							text: 'Odia'
						}, {
							value: 'ps',
							text: 'Pashto'
						}, {
							value: 'fa',
							text: 'Persian'
						}, {
							value: 'pl',
							text: 'Polish'
						}, {
							value: 'pt',
							text: 'Portuguese'
						}, {
							value: 'pa',
							text: 'Punjabi'
						}, {
							value: 'ro',
							text: 'Romanian'
						}, {
							value: 'ru',
							text: 'Russian'
						}, {
							value: 'sm',
							text: 'Samoan'
						}, {
							value: 'gd',
							text: 'Scottish Gaelic'
						}, {
							value: 'sr',
							text: 'Serbian'
						}, {
							value: 'sn',
							text: 'Shona'
						}, {
							value: 'sd',
							text: 'Sindhi'
						}, {
							value: 'si',
							text: 'Sinhala'
						}, {
							value: 'sk',
							text: 'Slovak'
						}, {
							value: 'sl',
							text: 'Slovenian'
						}, {
							value: 'so',
							text: 'Somali'
						}, {
							value: 'st',
							text: 'Southern Sotho'
						}, {
							value: 'es',
							text: 'Spanish'
						}, {
							value: 'su',
							text: 'Sundanese'
						}, {
							value: 'sw',
							text: 'Swahili'
						}, {
							value: 'sv',
							text: 'Swedish'
						}, {
							value: 'tg',
							text: 'Tajik'
						}, {
							value: 'ta',
							text: 'Tamil'
						}, {
							value: 'tt',
							text: 'Tatar'
						}, {
							value: 'te',
							text: 'Telugu'
						}, {
							value: 'th',
							text: 'Thai'
						}, {
							value: 'tr',
							text: 'Turkish'
						}, {
							value: 'tk',
							text: 'Turkmen'
						}, {
							value: 'uk',
							text: 'Ukrainian'
						}, {
							value: 'ur',
							text: 'Urdu'
						}, {
							value: 'ug',
							text: 'Uyghur'
						}, {
							value: 'uz',
							text: 'Uzbek'
						}, {
							value: 'vi',
							text: 'Vietnamese'
						}, {
							value: 'cy',
							text: 'Welsh'
						}, {
							value: 'fy',
							text: 'Western Frisian'
						}, {
							value: 'xh',
							text: 'Xhosa'
						}, {
							value: 'yi',
							text: 'Yiddish'
						}, {
							value: 'yo',
							text: 'Yoruba'
						}, {
							value: 'zu',
							text: 'Zulu'
						}]
					},
					auto_generate: {
						component: 'switch',
						text: 'Allow auto generate'
					},
					subtitles_font_family: {
						component: 'select',
						text: 'fontFamily',
						options: [{
							text: 'Monospaced Serif',
							value: 1
						}, {
							text: 'Proportional Serif',
							value: 2
						}, {
							text: 'Monospaced Sans-Serif',
							value: 3
						}, {
							text: 'Proportional Sans-Serif',
							value: 4
						}, {
							text: 'Casual',
							value: 5
						}, {
							text: 'Cursive',
							value: 6
						}, {
							text: 'Small Capitals',
							value: 7
						}]
					},
					subtitles_font_color: {
						component: 'select',
						text: 'fontColor',
						options: [{
							text: 'white',
							value: '#fff'
						}, {
							text: 'yellow',
							value: '#ff0'
						}, {
							text: 'green',
							value: '#0f0'
						}, {
							text: 'cyan',
							value: '#0ff'
						}, {
							text: 'blue',
							value: '#00f'
						}, {
							text: 'magenta',
							value: '#f0f'
						}, {
							text: 'red',
							value: '#f00'
						}, {
							text: 'black',
							value: '#000'
						}]
					},
					subtitles_font_size: {
						component: 'select',
						text: 'fontSize',
						options: [{
							text: '50%',
							value: -2
						}, {
							text: '75%',
							value: -1
						}, {
							text: '100%',
							value: 0
						}, {
							text: '150%',
							value: 1
						}, {
							text: '200%',
							value: 2
						}, {
							text: '300%',
							value: 3
						}, {
							text: '400%',
							value: 4
						}]
					},
					subtitles_background_color: {
						component: 'select',
						text: 'backgroundColor',
						options: [{
							text: 'white',
							value: '#fff'
						}, {
							text: 'yellow',
							value: '#ff0'
						}, {
							text: 'green',
							value: '#0f0'
						}, {
							text: 'cyan',
							value: '#0ff'
						}, {
							text: 'blue',
							value: '#00f'
						}, {
							text: 'magenta',
							value: '#f0f'
						}, {
							text: 'red',
							value: '#f00'
						}, {
							text: 'black',
							value: '#000'
						}]
					},
					subtitles_background_opacity: {
						component: 'slider',
						text: 'backgroundOpacity',
						value: 75,
						min: 0,
						max: 100,
						step: 1
					},
					subtitles_window_color: {
						component: 'select',
						text: 'windowColor',
						options: [{
							text: 'white',
							value: '#fff'
						}, {
							text: 'yellow',
							value: '#ff0'
						}, {
							text: 'green',
							value: '#0f0'
						}, {
							text: 'cyan',
							value: '#0ff'
						}, {
							text: 'blue',
							value: '#00f'
						}, {
							text: 'magenta',
							value: '#f0f'
						}, {
							text: 'red',
							value: '#f00'
						}, {
							text: 'black',
							value: '#000'
						}]
					},
					subtitles_window_opacity: {
						component: 'slider',
						text: 'windowOpacity',
						value: 0,
						min: 0,
						max: 100,
						step: 1
					},
					subtitles_character_edge_style: {
						component: 'select',
						text: 'characterEdgeStyle',
						options: [{
							text: 'none',
							value: 0
						}, {
							text: 'dropShadow',
							value: 4
						}, {
							text: 'raised',
							value: 1
						}, {
							text: 'depressed',
							value: 2
						}, {
							text: 'outline',
							value: 3
						}]
					},
					subtitles_font_opacity: {
						component: 'slider',
						text: 'fontOpacity',
						value: 100,
						min: 0,
						max: 100,
						step: 1
					}
				}
			}
		},
		player_crop_chapter_titles: {
			component: 'switch',
			text: 'cropChapterTitles',
			value: true
		},
		mini_player: {
			component: 'switch',
			text: 'customMiniPlayer'
		},
		player_quality: {
			component: 'select',
			text: 'quality',
			id: 'player_quality',
			options: [{
				text: 'auto',
				value: 'auto'
			}, {
				text: '144p',
				value: 'tiny'
			}, {
				text: '240p',
				value: 'small'
			}, {
				text: '360p',
				value: 'medium'
			}, {
				text: '480p',
				value: 'large'
			}, {
				text: '720p',
				value: 'hd720'
			}, {
				text: '1080p',
				value: 'hd1080'
			}, {
				text: '1440p',
				value: 'hd1440'
			}, {
				text: '2160p',
				value: 'hd2160'
			}, {
				text: '2880p',
				value: 'hd2880'
			}, {
				text: '4320p',
				value: 'highres'
			}],
			on: {
				render: function () {
					if (satus.storage.get('player_h264')) {
						if (this.childNodes[2].selectedIndex >6) {
							this.childNodes[1].style = 'color: red!important; font-weight: bold;';
							this.childNodes[1].textContent = '1080p';
						} else {
							this.childNodes[1].style = '';
							this.childNodes[1].textContent = this.childNodes[2].options[this.childNodes[2].selectedIndex].text;
						}
						for (let index =7; index <= 10; index++) {
							this.childNodes[2].childNodes[index].style = 'color: red!important; font-weight: bold;';
						}
					} else if (satus.storage.get('block_vp9') && satus.storage.get('block_h264')) {
						this.childNodes[1].style = 'color: red!important; font-weight: bold;';
						this.childNodes[1].textContent = 'Video disabled';
					} else {
						this.childNodes[1].style = '';
						this.childNodes[1].textContent = this.childNodes[2].options[this.childNodes[2].selectedIndex].text;
						for (let index =7; index <= 10; index++) {
							this.childNodes[2].childNodes[index].style = '';
						}
					}
				}
			}
		},
		player_codecs: {
			component: 'button',
			text: 'codecs',
			style: {
				justifyContent: 'space-between'
			},
			on: {
				click: {
					section: {
						component: 'section',
						variant: 'card',
						block_av1: {
							component: 'switch',
							text: 'blockAv1',
							on: {
								click: function () {
									this.parentElement.skeleton.sanitize();
								}
							}
						},
						block_vp9: {
							component: 'switch',
							text: 'blockVp9',
							value: false,
							custom: true,
							on: {
								click: function () {
									if (this.dataset.value === 'false') {
										if (satus.storage.get('block_h264')) {
											let where = this;
											satus.render({
												component: 'modal',
												variant: 'confirm',
												content: 'You need either VP9 or H.264 enabled for Youtube to work. Disabling both will break Video.',
												ok: function () {
													where.flip(true);
													where.parentElement.skeleton.sanitize();
												},
												cancel: function () {
												}
											}, extension.skeleton.rendered);
										} else {
											this.flip(true);
											this.parentElement.skeleton.sanitize();
										}
									} else {
										this.flip(false);
										this.parentElement.skeleton.sanitize();
									}
								}
							}
						},
						block_h264: {
							component: 'switch',
							text: 'blockH264',
							value: false,
							custom: true,
							on: {
								click: function () {
									if (this.dataset.value === 'false') {
										if (satus.storage.get('block_vp9')) {
											let where = this;
											satus.render({
												component: 'modal',
												variant: 'confirm',
												content: 'You need either VP9 or H.264 enabled for Youtube to work. Disabling both will break Video.',
												ok: function () {
													where.flip(true);
													where.parentElement.skeleton.sanitize();
												},
												cancel: function () {
												}
											}, extension.skeleton.rendered);
										} else {
											this.flip(true);
											this.parentElement.skeleton.sanitize();
										}
									} else {
										this.flip(false);
										this.parentElement.skeleton.sanitize();
									}
								}
							}
						},
						sanitize: function () {
							if (satus.storage.get('player_h264')) {
								if ((!satus.storage.get('block_vp9') || !satus.storage.get('block_av1') && satus.storage.get('block_h264')) ||
									(satus.storage.get('block_vp9') && satus.storage.get('block_av1') && satus.storage.get('block_h264'))) {
									satus.storage.set('player_h264', false);
								}
							} else if (satus.storage.get('block_vp9') && satus.storage.get('block_av1') && !satus.storage.get('block_h264')) {
								satus.storage.set('player_h264', true);
							}
						}
					}
				}
			},
			list: {
				component: 'span',
				id: 'player_codecs',
				style: {
					opacity: .64
				},
				on: {
					render: function () {
						var codecs = (satus.storage.get('block_h264') ? '' : 'h.264 ') + (satus.storage.get('block_vp9') ? '' : 'vp9 ') + (satus.storage.get('block_av1') ? '' : 'av1');

						if (codecs.includes('h.264') || codecs.includes('vp9')) {
							this.style = '';
							this.textContent = codecs;
						} else if (codecs) {
							this.style = 'color: red!important; font-weight: bold;';
							this.textContent = codecs;
						} else {
							this.style = 'color: red!important; font-weight: bold;';
							this.textContent = 'none';
						}
					}
				}
			}
		},
		h264: {
			component: 'switch',
			text: 'codecH264',
			storage: 'player_h264',
			value: false,
			custom: true,
			on: {
				click: function () {
					let skeleton = this.parentNode.skeleton;
					// refresh player_codecs/optimize_codec_for_hardware_acceleration elements when we change codecs
					refresh = function () {
						document.getElementById('player_quality').dispatchEvent(new CustomEvent('render'));
						document.getElementById('player_codecs').dispatchEvent(new CustomEvent('render'));
						document.getElementById('optimize_codec_for_hardware_acceleration').dispatchEvent(new CustomEvent('render'));
					}
					if (this.dataset.value === 'false') {
						let where = this;
						satus.render({
							component: 'modal',
							variant: 'confirm',
							content: 'youtubeLimitsVideoQualityTo1080pForH264Codec',
							ok: function () {
								// manually turn switch ON
								where.flip(true);
								satus.storage.set('block_vp9', true);
								satus.storage.set('block_av1', true);
								satus.storage.set('block_h264', false);
								refresh();
							},
							cancel: function () {
								// nothing happens when we cancel
							}
						}, extension.skeleton.rendered);
					} else {
						// manually turn switch OFF
						this.flip(false);
						// reset all codecs to unlocked state
						satus.storage.set('block_vp9', false);
						satus.storage.set('block_av1', false);
						satus.storage.set('block_h264', false);
						refresh();
					}
				}
			}
		},
		optimize_codec_for_hardware_acceleration: {
			component: 'button',
			text: 'Optimize Codec for hardware acceleration',
			style: {
				justifyContent: 'space-between'
			},
			on: {
				click: function () {
					//put some code here
				}
			},
			list: {
				component: 'span',
				id: 'optimize_codec_for_hardware_acceleration',
				style: {
					opacity: .64
				},
				on: {
					render: function () {
						// put some code here looking up GPU  capabilities and comparing to currrent codec selection
						var codecs = (satus.storage.get('block_h264') ? '' : 'h.264 ') + (satus.storage.get('block_vp9') ? '' : 'vp9 ') + (satus.storage.get('block_av1') ? '' : 'av1');

						if (1) { // todo
							this.style = '';
							this.textContent = 'Feature not yet available';
						} else if (2) { // todo
							this.style = '';
							this.textContent = 'GPU not in database';
						} else if (codecs) {
							this.style = 'color: green!important; font-weight: bold;';
							this.textContent = 'Optimal';
						} else {
							this.style = 'color: red!important; font-weight: bold;';
							this.textContent = 'Not optimal';
						}
					}
				}
			}
		},
		player_60fps: {
			component: 'switch',
			text: 'allow60fps',
			value: true
		},
		sdr: {
			component: 'switch',
			text: 'forceSDR',
			storage: 'player_SDR'
		}
	},
	section_2: {
		component: 'section',
		variant: 'card',
		title: 'buttons',

		player_screenshot: {
			component: 'button',
			text: 'screenshot',
			on: {
				click: {
					component: 'section',
					variant: 'card',

					player_screenshot_button: {
						component: 'switch',
						text: 'activate'
					},
					player_screenshot_save_as: {
						component: 'select',
						text: 'saveAs',
						options: [{
							text: 'file',
							value: 'file'
						}, {
							text: 'clipboard',
							value: 'clipboard'
						}]
					}
				}
			}
		},
		player_repeat: {
			component: 'button',
			text: 'repeat',
			on: {
				click: {
					component: 'section',
					variant: 'card',

					player_repeat_button: {
						component: 'switch',
						text: 'activate'
					},
					player_always_repeat: {
						component: 'switch',
						text: 'alwaysActive'
					}
				}
			}
		},
		player_rotate_button: {
			component: 'switch',
			text: 'rotate'
		},
		player_fit_to_win_button: {
			component: 'switch',
			text: 'fitToWindow'
		},
		player_popup_button: {
			component: 'switch',
			text: 'popupPlayer'
		}
	}
};
