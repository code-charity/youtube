/*--------------------------------------------------------------
>>> SETTINGS:
----------------------------------------------------------------
# Button
# Appearance
# Language
# Date & time
# Backup & reset
# Developer options
# About
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# BUTTON
--------------------------------------------------------------*/

extension.skeleton.header.sectionEnd.menu.on.click.settings = {
	component: 'button',
	category: true,
	on: {
		click: {
			firstSection: {
				component: 'section',
				variant: 'card'
			},
			secondSection: {
				component: 'section',
				variant: 'card'
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

		circle: {
			component: 'circle',
			attr: {
				'cx': '12',
				'cy': '12',
				'r': '3'
			}
		},
		path: {
			component: 'path',
			attr: {
				'd': 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z'
			}
		}
	},
	label: {
		component: 'span',
		text: 'settings'
	}
};


/*--------------------------------------------------------------
# APPEARANCE
--------------------------------------------------------------*/

extension.skeleton.header.sectionEnd.menu.on.click.settings.on.click.firstSection.appearance = {
	component: 'button',
	text: 'appearance',
	before: {
		svg: {
			component: 'svg',
			attr: {
				'viewBox': '0 0 24 24',
				'fill': 'currentColor'
			},

			path: {
				component: 'path',
				attr: {
					'd': 'M7 16c.6 0 1 .5 1 1a2 2 0 0 1-2 2h-.5a4 4 0 0 0 .5-2c0-.6.5-1 1-1M18.7 3a1 1 0 0 0-.7.3l-9 9 2.8 2.7 9-9c.3-.4.3-1 0-1.4l-1.4-1.3a1 1 0 0 0-.7-.3zM7 14a3 3 0 0 0-3 3c0 1.3-1.2 2-2 2 1 1.2 2.5 2 4 2a4 4 0 0 0 4-4 3 3 0 0 0-3-3z'
				}
			}
		}
	},
	on: {
		click: {
			header: {
				component: 'section',
				variant: 'card',
				title: 'header',

				title_version: {
					component: 'switch',
					text: 'showVersion'
				}
			},
			home: {
				component: 'section',
				variant: 'card',
				title: 'homeScreen',

				layout: {
					component: 'select',
					text: 'layout',
					storage: 'improvedtube_home',
					options: [{
						text: 'bubbles',
						value: 'bubbles'
					}, {
						text: 'list',
						value: 'list'
					}]
				},
				hideCategories: {
					component: 'button',
					text: 'hideCategories',
					on: {
						click: {
							section: {
								component: 'section',
								variant: 'card',

								it_general: {
									component: 'checkbox',
									text: 'general'
								},
								it_appearance: {
									component: 'checkbox',
									text: 'appearance'
								},
								it_themes: {
									component: 'checkbox',
									text: 'themes'
								},
								it_player: {
									component: 'checkbox',
									text: 'player'
								},
								it_playlist: {
									component: 'checkbox',
									text: 'playlist'
								},
								it_channel: {
									component: 'checkbox',
									text: 'channel'
								},
								it_shortcuts: {
									component: 'checkbox',
									text: 'shortcuts'
								},
								it_mixer: {
									component: 'checkbox',
									text: 'mixer'
								},
								it_analyzer: {
									component: 'checkbox',
									text: 'analyzer'
								},
								it_blacklist: {
									component: 'checkbox',
									text: 'blacklist'
								}
							}
						}
					}
				},
				improvedtube_youtube_icon: {
					text: 'improvedtubeIconOnYoutube',
					component: 'select',
					options: [{
						text: 'disabled',
						value: 'disabled'
					}, {
						text: 'youtubeHeaderLeft',
						value: 'header_left'
					}, {
						text: 'youtubeHeaderRight',
						value: 'header_right'
					}, {
						text: 'sidebar',
						value: 'sidebar'
					}, {
						text: 'draggable',
						value: 'draggable'
					}, {
						text: 'belowPlayer',
						value: 'below_player'
					}]
				}
			},
			animations: {
				component: 'section',
				variant: 'card',
				title: 'animations',

				layer_animation_scale: {
					component: 'select',
					text: 'layerAnimationScale',
					value: 0,
					options: [{
						text: '0x',
						value: 0
					}, {
						text: '1x',
						value: 1
					}]
				}
			}
		}
	}
};


/*--------------------------------------------------------------
# LANGUAGE
--------------------------------------------------------------*/

extension.skeleton.header.sectionEnd.menu.on.click.settings.on.click.secondSection.language = {
	component: 'button',
	text: 'language',
	before: {
		svg: {
			component: 'svg',
			attr: {
				'viewBox': '0 0 24 24',
				'fill': 'none',
				'stroke': 'currentColor',
				'troke-linecap': 'round',
				'stroke-linejoin': 'round',
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
					'd': 'M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'
				}
			}
		}
	},
	on: {
		click: {
			section: {
				component: 'section',
				variant: 'card',
				languages: [{
						value: 'default',
						text: 'default'
					},
					{
						value: "en",
						text: "English"
					}, {
						value: "es",
						text: "Español (España)"
					}, {
						value: "es-419",
						text: "Español (Latinoamérica)"
					}, {
						value: "es-US",
						text: "Español (US)"
					}, {
						value: "ru",
						text: "Русский"
					}, {
						value: "de",
						text: "Deutsch"
					}, {
						value: "pt-PT",
						text: "Português"
					}, {
						value: "pt",
						text: "Português (Brasil)"
					}, {
						value: "fr",
						text: "Français"
					}, {
						value: "pl",
						text: "Polski"
					}, {
						value: "ja",
						text: "日本語"
					}, {
						value: "af",
						text: "Afrikaans"
					}, {
						value: "az",
						text: "Azərbaycan"
					}, {
						value: "id",
						text: "Bahasa Indonesia"
					}, {
						value: "ms",
						text: "Bahasa Malaysia"
					}, {
						value: "bs",
						text: "Bosanski"
					}, {
						value: "ca",
						text: "Català"
					}, {
						value: "cs",
						text: "Čeština"
					}, {
						value: "da",
						text: "Dansk"
					}, {
						value: "et",
						text: "Eesti"
					}, {
						value: "eu",
						text: "Euskara"
					}, {
						value: "fil",
						text: "Filipino"
					}, {
						value: "fr-CA",
						text: "Français (Canada)"
					}, {
						value: "gl",
						text: "Galego"
					}, {
						value: "hr",
						text: "Hrvatski"
					}, {
						value: "zu",
						text: "IsiZulu"
					}, {
						value: "is",
						text: "Íslenska"
					}, {
						value: "it",
						text: "Italiano"
					}, {
						value: "sw",
						text: "Kiswahili"
					}, {
						value: "lv",
						text: "Latviešu valoda"
					}, {
						value: "lt",
						text: "Lietuvių"
					}, {
						value: "hu",
						text: "Magyar"
					}, {
						value: "nl",
						text: "Nederlands"
					}, {
						value: "no",
						text: "Norsk"
					}, {
						value: "uz",
						text: "O‘zbek"
					}, {
						value: "ro",
						text: "Română"
					}, {
						value: "sq",
						text: "Shqip"
					}, {
						value: "sk",
						text: "Slovenčina"
					}, {
						value: "sl",
						text: "Slovenščina"
					}, {
						value: "sr-Latn",
						text: "Srpski"
					}, {
						value: "fi",
						text: "Suomi"
					}, {
						value: "sv",
						text: "Svenska"
					}, {
						value: "vi",
						text: "Tiếng Việt"
					}, {
						value: "tr",
						text: "Türkçe"
					}, {
						value: "be",
						text: "Беларуская"
					}, {
						value: "bg",
						text: "Български"
					}, {
						value: "ky",
						text: "Кыргызча"
					}, {
						value: "kk",
						text: "Қазақ Тілі"
					}, {
						value: "mk",
						text: "Македонски"
					}, {
						value: "mn",
						text: "Монгол"
					}, {
						value: "sr",
						text: "Српски"
					}, {
						value: "uk",
						text: "Українська"
					}, {
						value: "el",
						text: "Ελληνικά"
					}, {
						value: "hy",
						text: "Հայերեն"
					}, {
						value: "iw",
						text: "עברית"
					}, {
						value: "ur",
						text: "اردو"
					}, {
						value: "ar",
						text: "العربية"
					}, {
						value: "fa",
						text: "فارسی"
					}, {
						value: "ne",
						text: "नेपाली"
					}, {
						value: "mr",
						text: "मराठी"
					}, {
						value: "hi",
						text: "हिन्दी"
					}, {
						value: "bn",
						text: "বাংলা"
					}, {
						value: "pa",
						text: "ਪੰਜਾਬੀ"
					}, {
						value: "gu",
						text: "ગુજરાતી"
					}, {
						value: "ta",
						text: "தமிழ்"
					}, {
						value: "te",
						text: "తెలుగు"
					}, {
						value: "kn",
						text: "ಕನ್ನಡ"
					}, {
						value: "ml",
						text: "മലയാളം"
					}, {
						value: "si",
						text: "සිංහල"
					}, {
						value: "th",
						text: "ภาษาไทย"
					}, {
						value: "lo",
						text: "ລາວ"
					}, {
						value: "my",
						text: "ဗမာ"
					}, {
						value: "ka",
						text: "ქართული"
					}, {
						value: "am",
						text: "አማርኛ"
					}, {
						value: "km",
						text: "ខ្មែរ"
					}, {
						value: "zh-CN",
						text: "中文 (简体)"
					}, {
						value: "zh-TW",
						text: "中文 (繁體)"
					}, {
						value: "zh-HK",
						text: "中文 (香港)"
					}, {
						value: "ko",
						text: "한국어"
					}
				],

				improvedtube: {
					component: 'select',
					text: 'ImprovedTube',
					storage: 'language',
					options: function () {
						return extension.skeleton.header.sectionEnd.menu.on.click.settings.on.click.secondSection.language.on.click.section.languages;
					}
				},
				youtube: {
					component: 'select',
					text: 'YouTube',
					storage: 'youtube_language',
					options: function () {
						return extension.skeleton.header.sectionEnd.menu.on.click.settings.on.click.secondSection.language.on.click.section.languages;
					}
				}
			}
		}
	}
};


/*--------------------------------------------------------------
# DATE & TIME
--------------------------------------------------------------*/

extension.skeleton.header.sectionEnd.menu.on.click.settings.on.click.secondSection.dateAndTime = {
	component: 'button',
	text: 'dateAndTime',
	before: {
		svg: {
			component: 'svg',
			attr: {
				'viewBox': '0 0 24 24',
				'fill': 'currentColor'
			},

			path: {
				component: 'path',
				attr: {
					'd': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-.2-13c-.5 0-.8.3-.8.7v4.7c0 .4.2.7.5.9l4.1 2.5c.4.2.8 0 1-.3.2-.3.1-.7-.2-1l-3.9-2.2V7.7c0-.4-.3-.7-.7-.7z'
				}
			}
		}
	},
	on: {
		click: {
			component: 'section',
			variant: 'card',

			use_24_hour_format: {
				component: 'switch',
				text: 'use24HourFormat',
				value: true
			}
		}
	}
};


/*--------------------------------------------------------------
# BACKUP & RESET
--------------------------------------------------------------*/

extension.skeleton.header.sectionEnd.menu.on.click.settings.on.click.secondSection.backupAndReset = {
	component: 'button',
	text: 'backupAndReset',
	before: {
		svg: {
			component: 'svg',
			attr: {
				'viewBox': '0 0 24 24',
				'fill': 'currentColor'
			},

			path: {
				component: 'path',
				attr: {
					'd': 'M13.3 3A9 9 0 0 0 4 12H2.2c-.5 0-.7.5-.3.8l2.7 2.8c.2.2.6.2.8 0L8 12.8c.4-.3.1-.8-.3-.8H6a7 7 0 1 1 2.7 5.5 1 1 0 0 0-1.3.1 1 1 0 0 0 0 1.5A9 9 0 0 0 22 11.7C22 7 18 3.1 13.4 3zm-.6 5c-.4 0-.7.3-.7.8v3.6c0 .4.2.7.5.9l3.1 1.8c.4.2.8.1 1-.2.2-.4.1-.8-.2-1l-3-1.8V8.7c0-.4-.2-.7-.7-.7z'
				}
			}
		}
	},
	on: {
		click: {
			section: {
				component: 'section',
				variant: 'card',

				importSettings: {
					component: 'button',
					text: 'importSettings',
					on: {
						click: function () {
							if (location.href.indexOf('/index.html?action=import-settings') !== -1) {
								extension.importSettings();
							} else {
								window.open(chrome.runtime.getURL('options-page/index.html?action=import-settings'), '_blank');
							}
						}
					}
				},
				exportSettings: {
					component: 'button',
					text: 'exportSettings',
					on: {
						click: function () {
							if (location.href.indexOf('/index.html?action=export-settings') !== -1) {
								extension.exportSettings();
							} else {
								window.open(chrome.runtime.getURL('options-page/index.html?action=export-settings'), '_blank');
							}
						}
					}
				}
			},
			reset: {
				component: 'section',
				variant: 'card',

				resetAllSettings: {
					component: 'button',
					text: 'resetAllSettings',
					on: {
						click: {
							component: 'modal',
							variant: 'confirm',
							content: 'allYourSettingsWillBeErasedAndCanTBeRecovered',
							buttons: {
								cancel: {
									component: 'button',
									text: 'cancel',
									on: {
										click: function () {
											this.modalProvider.close();
										}
									}
								},
								reset: {
									component: 'button',
									text: 'reset',
									on: {
										click: function () {
											satus.storage.clear(function () {
												window.close();
											});
										}
									}
								}
							}
						}
					}
				},
				resetAllShortcuts: {
					component: 'button',
					text: 'resetAllShortcuts',
					on: {
						click: {
							component: 'modal',
							variant: 'confirm',
							content: 'allYourShortcutsWillBeErasedAndCanTBeRecovered',
							buttons: {
								cancel: {
									component: 'button',
									text: 'cancel',
									on: {
										click: function () {
											this.modalProvider.close();
										}
									}
								},
								reset: {
									component: 'button',
									text: 'reset',
									on: {
										click: function () {
											for (var key in satus.storage.data) {
												if (key.indexOf('shortcut_') === 0) {
													satus.storage.remove(key);
												}
											}

											this.modalProvider.close();
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};


/*--------------------------------------------------------------
# DEVELOPER OPTIONS
--------------------------------------------------------------*/

extension.skeleton.header.sectionEnd.menu.on.click.settings.on.click.secondSection.developerOptions = {
	component: 'button',
	text: 'developerOptions',
	before: {
		svg: {
			component: 'svg',
			attr: {
				'viewBox': '0 0 24 24',
				'fill': 'currentColor'
			},

			path: {
				component: 'path',
				attr: {
					'd': 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z'
				}
			}
		}
	},
	on: {
		click: {
			component: 'section',
			variant: 'card',

			api: {
				component: 'button',
				text: 'API',
				on: {
					click: {
						component: 'section',
						variant: 'transparent-card',
						title: 'YouTube API',

						textField: {
							component: 'text-field',
							storage: 'google-api-key',
							value: 'AIzaSyCXRRCFwKAXOiF1JkUBmibzxJF1cPuKNwA',
							rows: 1,
							lineNumbers: false
						}
					}
				}
			},
			css: {
				component: 'button',
				text: 'CSS',
				on: {
					click: {
						component: 'text-field',
						storage: 'custom_css',
						style: {
							height: '100%'
						}
					}
				}
			},
			js: {
				component: 'button',
				text: 'JavaScript',
				on: {
					click: {
						component: 'text-field',
						storage: 'custom_js',
						style: {
							height: '100%'
						}
					}
				}
			}
		}
	}
};


/*--------------------------------------------------------------
# ABOUT
--------------------------------------------------------------*/

extension.skeleton.header.sectionEnd.menu.on.click.settings.on.click.secondSection.about = {
	component: 'button',
	text: 'about',
	before: {
		svg: {
			component: 'svg',
			attr: {
				'viewBox': '0 0 24 24',
				'fill': 'currentColor'
			},

			path: {
				component: 'path',
				attr: {
					'd': 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z'
				}
			}
		}
	},
	on: {
		click: {
			extensionSection: {
				component: 'section',
				variant: 'card',

				list: {
					component: 'list',
					items: [
						['name', satus.user.browser.manifest().name],
						['version', satus.user.browser.manifest().version_name || satus.user.browser.manifest().version],
						['permissions', satus.user.browser.manifest().permissions.join(', ').replace('https://www.youtube.com/', 'YouTube')]
					]
				}
			},
			otherSection: {
				component: 'section',
				variant: 'card',

				softwareInformation: {
					component: 'button',
					text: 'softwareInformation',
					on: {
						click: {
							osSection: {
								component: 'section',
								variant: 'card',
								title: 'os',

								list: {
									component: 'list',
									items: [
										['name', satus.user.os.name()],
										['bitness', satus.user.os.bitness()]
									]
								}
							},
							browserSection: {
								component: 'section',
								variant: 'card',
								title: 'browser',

								list: {
									component: 'list',
									items: [
										['name', satus.user.browser.name()],
										['version', satus.user.browser.version()],
										['platform', satus.user.browser.platform()],
										['audioFormats', satus.user.browser.audio().join(', ')],
										['videoFormats', satus.user.browser.video().join(', ')],
										['Flash', satus.user.browser.flash()],
										['Java', satus.user.browser.java()],
										['Cookies', satus.user.browser.cookies()]
									]
								}
							}
						}
					}
				},
				hardwareInformation: {
					component: 'button',
					text: 'hardwareInformation',
					on: {
						click: {
							component: 'section',
							variant: 'card',

							list: {
								component: 'list',
								items: [
									['screen', satus.user.device.screen()],
									['cores', satus.user.device.cores()],
									['gpu', satus.user.device.gpu()],
									['ram', satus.user.device.ram()]
								]
							}
						}
					}
				}
			}
		}
	}
};