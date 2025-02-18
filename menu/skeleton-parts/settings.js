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
					text: 'showVersion',
					value: true
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
								it_blocklist: {
									component: 'checkbox',
									text: 'blocklist'
								}
							}
						}
					}
				},
			},
			animations: {
				component: 'section',
				variant: 'card',
				title: 'animations',

				layer_animation_scale: {
					component: 'select',
					text: 'layerAnimationScale',
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
				languages: [
					{value: 'default', text: 'default'},
					{value: "ko", text: "한국어"},
					{value: "en", text: "English"},
					{value: "en-IN", text: "English (India)"},
					{value: "en-GB", text: "English (UK)"},
					{value: "en-US", text: "English (US)"},
					{value: "ja", text: "日本語"},
					{value: "ru", text: "Русский"},
					{value: "pt", text: "Português (Brasil)"},
					{value: "pt-PT", text: "Português"},
					{value: "es-419", text: "Español (Latinoamérica)"},
					{value: "es", text: "Español (España)"},
					{value: "es-US", text: "Español (US)"},
					{value: "fr", text: "Français"},
					{value: "fr-CA", text: "Français (Canada)"},
					{value: "de", text: "Deutsch"},
					{value: "pl", text: "Polski"},
					{value: "zh-CN", text: "中文 (简体)"},
					{value: "zh-TW", text: "中文 (繁體)"},
					{value: "zh-HK", text: "中文 (香港)"},
					{value: "fil", text: "Filipino"},
					{value: "af", text: "Afrikaans"},
					{value: "az", text: "Azərbaycan"},
					{value: "id", text: "Bahasa Indonesia"},
					{value: "ms", text: "Bahasa Malaysia"},
					{value: "bs", text: "Bosanski"},
					{value: "ca", text: "Català"},
					{value: "cs", text: "Čeština"},
					{value: "da", text: "Dansk"},
					{value: "et", text: "Eesti"},
					{value: "eu", text: "Euskara"},
					{value: "gl", text: "Galego"},
					{value: "hr", text: "Hrvatski"},
					{value: "zu", text: "IsiZulu"},
					{value: "is", text: "Íslenska"},
					{value: "it", text: "Italiano"},
					{value: "sw", text: "Kiswahili"},
					{value: "lv", text: "Latviešu valoda"},
					{value: "lt", text: "Lietuvių"},
					{value: "hu", text: "Magyar"},
					{value: "nl", text: "Nederlands"},
					{value: "no", text: "Norsk"},
					{value: "nb-NO", text: "Norwegian Bokmål (not yet selectable on YouTube)"},
					{value: "uz", text: "O‘zbek"},
					{value: "ro", text: "Română"},
					{value: "sq", text: "Shqip"},
					{value: "sk", text: "Slovenčina"},
					{value: "sl", text: "Slovenščina"},
					{value: "sr-Latn", text: "Srpski"},
					{value: "fi", text: "Suomi"},
					{value: "sv", text: "Svenska"},
					{value: "vi", text: "Tiếng Việt"},
					{value: "tr", text: "Türkçe"},
					{value: "be", text: "Беларуская"},
					{value: "bg", text: "Български"},
					{value: "ky", text: "Кыргызча"},
					{value: "kk", text: "Қазақ Тілі"},
					{value: "mk", text: "Македонски"},
					{value: "mn", text: "Монгол"},
					{value: "sr", text: "Српски"},
					{value: "uk", text: "Українська"},
					{value: "el", text: "Ελληνικά"},
					{value: "hy", text: "Հայերեն"},
					{value: "iw", text: "עברית"},
					{value: "ur", text: "اردو"},
					{value: "ar", text: "العربية"},
					{value: "fa", text: "فارسی"},
					{value: "fa-IR", text: "Iranian Persian (not yet selectable on YouTube)"},
					{value: "ne", text: "नेपाली"},
					{value: "mr", text: "मराठी"},
					{value: "hi", text: "हिन्दी"},
					{value: "bn", text: "বাংলা"},
					{value: "pa", text: "ਪੰਜਾਬੀ"},
					{value: "gu", text: "ગુજરાતી"},
					{value: "ta", text: "தமிழ்"},
					{value: "te", text: "తెలుగు"},
					{value: "kn", text: "ಕನ್ನಡ"},
					{value: "ml", text: "മലയാളം"},
					{value: "si", text: "සිංහල"},
					{value: "th", text: "ภาษาไทย"},
					{value: "lo", text: "ລາວ"},
					{value: "my", text: "ဗမာ"},
					{value: "ka", text: "ქართული"},
					{value: "am", text: "አማርኛ"},
					{value: "km", text: "ខ្មែរ"},
					{value: "zh-CN", text: "中文 (简体)"},
					{value: "zh-TW", text: "中文 (繁體)"},
					{value: "zh-HK", text: "中文 (香港)"},
					{value: "ko", text: "한국어"}
				],
				improvedtube: {
					component: 'select',
					text: 'improvedtubeLanguage',
					storage: 'language',
					options: function () {
						return extension.skeleton.header.sectionEnd.menu.on.click.settings.on.click.secondSection.language.on.click.section.languages;
					}
				},
				youtube: {
					component: 'select',
					text: 'youtubeLanguage',
					storage: 'youtube_language',
					options: function () {
						return [{value: 'disabled', text: "Disabled"}].concat(extension.skeleton.header.sectionEnd.menu.on.click.settings.on.click.secondSection.language.on.click.section.languages);
					},
					on: {
						change: function (event) {
							if (event.target.value === 'default') {
								satus.storage.remove('youtube_language');
							}
						}
					}
				}
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
								window.open(chrome.runtime.getURL('menu/index.html?action=import-settings'), '_blank');
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
								window.open(chrome.runtime.getURL('menu/index.html?action=export-settings'), '_blank');
							}
						}
					}
				}
			},
			sync: {
				component: 'section',
				variant: 'card',
				title: 'browserAccountSync',

				pushSyncSettings: {
					component: 'button',
					text: 'pushSyncSettings',
					on: {
						click: function () {
							extension.pushSettings();
						}
					}
				},
				pullSyncSettings: {
					component: 'button',
					text: 'pullSyncSettings',
					on: {
						click: function () {
							extension.pullSettings();
						}
					}
				}
			},
			reset: {
				component: 'section',
				variant: 'card',
				delete_youtube_cookies: {
					component: 'button',
					text: 'deleteYoutubeCookies',

					on: {
						click: {
							component: 'modal',

							message: {
								component: 'span',
								text: 'thisWillRemoveAllYouTubeCookies'
							},
							section: {
								component: 'section',
								variant: 'actions',

								cancel: {
									component: 'button',
									text: 'cancel',
									on: {
										click: function () {
											this.parentNode.parentNode.parentNode.close();
										}
									}
								},
								accept: {
									component: 'button',
									text: 'accept',
									on: {
										click: function () {
											chrome.tabs.query({}, function (tabs) {
												for (var i = 0, l = tabs.length; i < l; i++) {
													if (tabs[i].hasOwnProperty('url')) {
														chrome.tabs.sendMessage(tabs[i].id, {
															action: 'delete-youtube-cookies'
														});
													}
												}
											});

											this.parentNode.parentNode.parentNode.close();
										}
									}
								}
							}
						}
					}
				},
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
	text: 'My_specs',
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
						['name', satus.user.browser.manifest().short_name],
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
# PASSWORD OPTIONS
--------------------------------------------------------------*/

function togglePasswordInput() {
	// Sets the visibility of the password input field depending on the state of the requirement switch
	let requirePassword = satus.storage.get("require_password");
	const display = satus.storage.get("require_password") ? "" : "none";
	document.getElementById('password-input-card').style.display = display;

	// Avoids changing input field if input is not visible
	if (!requirePassword) return;

	// Sets input field to display current password
	const passwordInput = document.getElementById('password-input');
	passwordInput.placeholder = "Enter password";

	// If no password exists (undefined), set input value to empty string instead
	passwordInput.value = satus.storage.get("password") || '';
}

extension.skeleton.header.sectionEnd.menu.on.click.settings.on.click.secondSection.usePassword = {
	component: 'button',
	text: 'passwordOptions',
	before: {
		svg: {
			component: 'svg',
			attr: {
				'viewBox': '0 0 24 24',
				'fill': 'currentColor',
			},
			path: {
				component: 'path',
				attr: {
					'd': 'M 7 5 C 3.1545455 5 0 8.1545455 0 12 C 0 15.845455 3.1545455 19 7 19 C 9.7749912 19 12.089412 17.314701 13.271484 15 L 16 15 L 16 18 L 22 18 L 22 15 L 24 15 L 24 9 L 23 9 L 13.287109 9 C 12.172597 6.6755615 9.8391582 5 7 5 z M 7 7 C 9.2802469 7 11.092512 8.4210017 11.755859 10.328125 L 11.988281 11 L 22 11 L 22 13 L 20 13 L 20 16 L 18 16 L 18 13 L 12.017578 13 L 11.769531 13.634766 C 11.010114 15.575499 9.1641026 17 7 17 C 4.2454545 17 2 14.754545 2 12 C 2 9.2454545 4.2454545 7 7 7 z M 7 9 C 5.3549904 9 4 10.35499 4 12 C 4 13.64501 5.3549904 15 7 15 C 8.6450096 15 10 13.64501 10 12 C 10 10.35499 8.6450096 9 7 9 z M 7 11 C 7.5641294 11 8 11.435871 8 12 C 8 12.564129 7.5641294 13 7 13 C 6.4358706 13 6 12.564129 6 12 C 6 11.435871 6.4358706 11 7 11 z'
				}
			}
		}
	},
	on: {
		click: {
			component: 'section',
			variant: 'card',

			require_password: {
				component: 'switch',
				text: 'requirePassword',
				value: false,

				on: {
					click: function (event) {
						// Prevents clicking the toggle switch does not load another section
						event.preventDefault();

						// Toggle the visibility of password input field
						togglePasswordInput();
					}
				}
			},

			password_input: {
				component: 'section',
				variant: 'card',
				id: "password-input-card",
				style: {
					"padding": "0"
				},
				children: {
					component: 'input',
					id: "password-input",
					type: 'text',
					style: {
						"padding": "0 10px 0 10px"
					},

					// Sets password field's visibility when modal menu is rendered
					function() {
						togglePasswordInput();
					},

					// Updates the stored password value on keyboard input
					on: {
						input: function (event) {
							satus.storage.set("password", event.target.value);
						}
					}
				}
			}
		}
	}
};
