/*--------------------------------------------------------------
>>> GENERAL
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.general = {
	component: 'button',
	variant: 'general',
	category: true,
	on: {
		click: {
			section_1: {
				component: 'section',
				variant: 'card',
default_content_country: {
					component: 'select',
					text: 'defaultContentCountry',
					options: [{
							text: "default",
							value: "default"
						},
						{
							text: "Afghanistan",
							value: "AF"
						},
						{
							text: "Albania",
							value: "AL"
						},
						{
							text: "Algeria",
							value: "DZ"
						},
						{
							text: "American Samoa",
							value: "AS"
						},
						{
							text: "Andorra",
							value: "AD"
						},
						{
							text: "Angola",
							value: "AO"
						},
						{
							text: "Anguilla",
							value: "AI"
						},
						{
							text: "Antarctica",
							value: "AQ"
						},
						{
							text: "Antigua and Barbuda",
							value: "AG"
						},
						{
							text: "Argentina",
							value: "AR"
						},
						{
							text: "Armenia",
							value: "AM"
						},
						{
							text: "Aruba",
							value: "AW"
						},
						{
							text: "Australia",
							value: "AU"
						},
						{
							text: "Austria",
							value: "AT"
						},
						{
							text: "Azerbaijan",
							value: "AZ"
						},
						{
							text: "Bahrain",
							value: "BH"
						},
						{
							text: "Bailiwick of Guernsey",
							value: "GG"
						},
						{
							text: "Bangladesh",
							value: "BD"
						},
						{
							text: "Barbados",
							value: "BB"
						},
						{
							text: "Belarus",
							value: "BY"
						},
						{
							text: "Belgium",
							value: "BE"
						},
						{
							text: "Belize",
							value: "BZ"
						},
						{
							text: "Benin",
							value: "BJ"
						},
						{
							text: "Bermuda",
							value: "BM"
						},
						{
							text: "Bhutan",
							value: "BT"
						},
						{
							text: "Bolivia",
							value: "BO"
						},
						{
							text: "Bonaire",
							value: "BQ"
						},
						{
							text: "Bosnia and Herzegovina",
							value: "BA"
						},
						{
							text: "Botswana",
							value: "BW"
						},
						{
							text: "Bouvet Island",
							value: "BV"
						},
						{
							text: "Brazil",
							value: "BR"
						},
						{
							text: "British Indian Ocean Territory",
							value: "IO"
						},
						{
							text: "British Virgin Islands",
							value: "VG"
						},
						{
							text: "Brunei",
							value: "BN"
						},
						{
							text: "Bulgaria",
							value: "BG"
						},
						{
							text: "Burkina Faso",
							value: "BF"
						},
						{
							text: "Burundi",
							value: "BI"
						},
						{
							text: "Cambodia",
							value: "KH"
						},
						{
							text: "Cameroon",
							value: "CM"
						},
						{
							text: "Canada",
							value: "CA"
						},
						{
							text: "Cape Verde",
							value: "CV"
						},
						{
							text: "Cayman Islands",
							value: "KY"
						},
						{
							text: "Central African Republic",
							value: "CF"
						},
						{
							text: "Chad",
							value: "TD"
						},
						{
							text: "Chile",
							value: "CL"
						},
						{
							text: "China",
							value: "CN"
						},
						{
							text: "Christmas Island",
							value: "CX"
						},
						{
							text: "Cocos (Keeling) Islands",
							value: "CC"
						},
						{
							text: "Collectivity of Saint Martin",
							value: "MF"
						},
						{
							text: "Colombia",
							value: "CO"
						},
						{
							text: "Comoros",
							value: "KM"
						},
						{
							text: "Cook Islands",
							value: "CK"
						},
						{
							text: "Costa Rica",
							value: "CR"
						},
						{
							text: "Croatia",
							value: "HR"
						},
						{
							text: "Cuba",
							value: "CU"
						},
						{
							text: "Curaçao",
							value: "CW"
						},
						{
							text: "Cyprus",
							value: "CY"
						},
						{
							text: "Czech Republic",
							value: "CZ"
						},
						{
							text: "Democratic Republic of the Congo",
							value: "CD"
						},
						{
							text: "Denmark",
							value: "DK"
						},
						{
							text: "Djibouti",
							value: "DJ"
						},
						{
							text: "Dominica",
							value: "DM"
						},
						{
							text: "Dominican Republic",
							value: "DO"
						},
						{
							text: "East Timor",
							value: "TL"
						},
						{
							text: "Ecuador",
							value: "EC"
						},
						{
							text: "Egypt",
							value: "EG"
						},
						{
							text: "El Salvador",
							value: "SV"
						},
						{
							text: "Equatorial Guinea",
							value: "GQ"
						},
						{
							text: "Eritrea",
							value: "ER"
						},
						{
							text: "Estonia",
							value: "EE"
						},
						{
							text: "Eswatini",
							value: "SZ"
						},
						{
							text: "Ethiopia",
							value: "ET"
						},
						{
							text: "Falkland Islands",
							value: "FK"
						},
						{
							text: "Faroe Islands",
							value: "FO"
						},
						{
							text: "Federated States of Micronesia",
							value: "FM"
						},
						{
							text: "Fiji",
							value: "FJ"
						},
						{
							text: "Finland",
							value: "FI"
						},
						{
							text: "France",
							value: "FR"
						},
						{
							text: "French Guiana",
							value: "GF"
						},
						{
							text: "French Polynesia",
							value: "PF"
						},
						{
							text: "French Southern and Antarctic Lands",
							value: "TF"
						},
						{
							text: "Gabon",
							value: "GA"
						},
						{
							text: "Georgia (country)",
							value: "GE"
						},
						{
							text: "Germany",
							value: "DE"
						},
						{
							text: "Ghana",
							value: "GH"
						},
						{
							text: "Gibraltar",
							value: "GI"
						},
						{
							text: "Greece",
							value: "GR"
						},
						{
							text: "Greenland",
							value: "GL"
						},
						{
							text: "Grenada",
							value: "GD"
						},
						{
							text: "Guadeloupe",
							value: "GP"
						},
						{
							text: "Guam",
							value: "GU"
						},
						{
							text: "Guatemala",
							value: "GT"
						},
						{
							text: "Guinea",
							value: "GN"
						},
						{
							text: "Guinea-Bissau",
							value: "GW"
						},
						{
							text: "Guyana",
							value: "GY"
						},
						{
							text: "Haiti",
							value: "HT"
						},
						{
							text: "Heard Island and McDonald Islands",
							value: "HM"
						},
						{
							text: "Holy See",
							value: "VA"
						},
						{
							text: "Honduras",
							value: "HN"
						},
						{
							text: "Hong Kong",
							value: "HK"
						},
						{
							text: "Hungary",
							value: "HU"
						},
						{
							text: "Iceland",
							value: "IS"
						},
						{
							text: "India",
							value: "IN"
						},
						{
							text: "Indonesia",
							value: "ID"
						},
						{
							text: "Iran",
							value: "IR"
						},
						{
							text: "Iraq",
							value: "IQ"
						},
						{
							text: "Isle of Man",
							value: "IM"
						},
						{
							text: "Israel",
							value: "IL"
						},
						{
							text: "Italy",
							value: "IT"
						},
						{
							text: "Ivory Coast",
							value: "CI"
						},
						{
							text: "Jamaica",
							value: "JM"
						},
						{
							text: "Japan",
							value: "JP"
						},
						{
							text: "Jersey",
							value: "JE"
						},
						{
							text: "Jordan",
							value: "JO"
						},
						{
							text: "Kazakhstan",
							value: "KZ"
						},
						{
							text: "Kenya",
							value: "KE"
						},
						{
							text: "Kiribati",
							value: "KI"
						},
						{
							text: "Kuwait",
							value: "KW"
						},
						{
							text: "Kyrgyzstan",
							value: "KG"
						},
						{
							text: "Laos",
							value: "LA"
						},
						{
							text: "Latvia",
							value: "LV"
						},
						{
							text: "Lebanon",
							value: "LB"
						},
						{
							text: "Lesotho",
							value: "LS"
						},
						{
							text: "Liberia",
							value: "LR"
						},
						{
							text: "Libya",
							value: "LY"
						},
						{
							text: "Liechtenstein",
							value: "LI"
						},
						{
							text: "Lithuania",
							value: "LT"
						},
						{
							text: "Luxembourg",
							value: "LU"
						},
						{
							text: "Macau",
							value: "MO"
						},
						{
							text: "Madagascar",
							value: "MG"
						},
						{
							text: "Malawi",
							value: "MW"
						},
						{
							text: "Malaysia",
							value: "MY"
						},
						{
							text: "Maldives",
							value: "MV"
						},
						{
							text: "Mali",
							value: "ML"
						},
						{
							text: "Malta",
							value: "MT"
						},
						{
							text: "Marshall Islands",
							value: "MH"
						},
						{
							text: "Martinique",
							value: "MQ"
						},
						{
							text: "Mauritania",
							value: "MR"
						},
						{
							text: "Mauritius",
							value: "MU"
						},
						{
							text: "Mayotte",
							value: "YT"
						},
						{
							text: "Mexico",
							value: "MX"
						},
						{
							text: "Moldova",
							value: "MD"
						},
						{
							text: "Monaco",
							value: "MC"
						},
						{
							text: "Mongolia",
							value: "MN"
						},
						{
							text: "Montenegro",
							value: "ME"
						},
						{
							text: "Montserrat",
							value: "MS"
						},
						{
							text: "Morocco",
							value: "MA"
						},
						{
							text: "Mozambique",
							value: "MZ"
						},
						{
							text: "Myanmar",
							value: "MM"
						},
						{
							text: "Namibia",
							value: "NA"
						},
						{
							text: "Nauru",
							value: "NR"
						},
						{
							text: "Nepal",
							value: "NP"
						},
						{
							text: "Netherlands",
							value: "NL"
						},
						{
							text: "New Caledonia",
							value: "NC"
						},
						{
							text: "New Zealand",
							value: "NZ"
						},
						{
							text: "Nicaragua",
							value: "NI"
						},
						{
							text: "Niger",
							value: "NE"
						},
						{
							text: "Nigeria",
							value: "NG"
						},
						{
							text: "Niue",
							value: "NU"
						},
						{
							text: "Norfolk Island",
							value: "NF"
						},
						{
							text: "North Korea",
							value: "KP"
						},
						{
							text: "North Macedonia",
							value: "MK"
						},
						{
							text: "Northern Mariana Islands",
							value: "MP"
						},
						{
							text: "Norway",
							value: "NO"
						},
						{
							text: "Oman",
							value: "OM"
						},
						{
							text: "Pakistan",
							value: "PK"
						},
						{
							text: "Palau",
							value: "PW"
						},
						{
							text: "Panama",
							value: "PA"
						},
						{
							text: "Papua New Guinea",
							value: "PG"
						},
						{
							text: "Paraguay",
							value: "PY"
						},
						{
							text: "Peru",
							value: "PE"
						},
						{
							text: "Philippines",
							value: "PH"
						},
						{
							text: "Pitcairn Islands",
							value: "PN"
						},
						{
							text: "Poland",
							value: "PL"
						},
						{
							text: "Portugal",
							value: "PT"
						},
						{
							text: "Puerto Rico",
							value: "PR"
						},
						{
							text: "Qatar",
							value: "QA"
						},
						{
							text: "Republic of Ireland",
							value: "IE"
						},
						{
							text: "Republic of the Congo",
							value: "CG"
						},
						{
							text: "Romania",
							value: "RO"
						},
						{
							text: "Russia",
							value: "RU"
						},
						{
							text: "Rwanda",
							value: "RW"
						},
						{
							text: "Réunion",
							value: "RE"
						},
						{
							text: "Saint Barthélemy",
							value: "BL"
						},
						{
							text: "Saint Helena",
							value: "SH"
						},
						{
							text: "Saint Kitts and Nevis",
							value: "KN"
						},
						{
							text: "Saint Lucia",
							value: "LC"
						},
						{
							text: "Saint Pierre and Miquelon",
							value: "PM"
						},
						{
							text: "Saint Vincent and the Grenadines",
							value: "VC"
						},
						{
							text: "Samoa",
							value: "WS"
						},
						{
							text: "San Marino",
							value: "SM"
						},
						{
							text: "Saudi Arabia",
							value: "SA"
						},
						{
							text: "Senegal",
							value: "SN"
						},
						{
							text: "Serbia",
							value: "RS"
						},
						{
							text: "Seychelles",
							value: "SC"
						},
						{
							text: "Sierra Leone",
							value: "SL"
						},
						{
							text: "Singapore",
							value: "SG"
						},
						{
							text: "Sint Maarten",
							value: "SX"
						},
						{
							text: "Slovakia",
							value: "SK"
						},
						{
							text: "Slovenia",
							value: "SI"
						},
						{
							text: "Solomon Islands",
							value: "SB"
						},
						{
							text: "Somalia",
							value: "SO"
						},
						{
							text: "South Africa",
							value: "ZA"
						},
						{
							text: "South Georgia and the South Sandwich Islands",
							value: "GS"
						},
						{
							text: "South Korea",
							value: "KR"
						},
						{
							text: "South Sudan",
							value: "SS"
						},
						{
							text: "Spain",
							value: "ES"
						},
						{
							text: "Sri Lanka",
							value: "LK"
						},
						{
							text: "State of Palestine",
							value: "PS"
						},
						{
							text: "Sudan",
							value: "SD"
						},
						{
							text: "Suriname",
							value: "SR"
						},
						{
							text: "Svalbard",
							value: "SJ"
						},
						{
							text: "Sweden",
							value: "SE"
						},
						{
							text: "Switzerland",
							value: "CH"
						},
						{
							text: "Syria",
							value: "SY"
						},
						{
							text: "São Tomé and Príncipe",
							value: "ST"
						},
						{
							text: "Taiwan",
							value: "TW"
						},
						{
							text: "Tajikistan",
							value: "TJ"
						},
						{
							text: "Tanzania",
							value: "TZ"
						},
						{
							text: "Thailand",
							value: "TH"
						},
						{
							text: "The Bahamas",
							value: "BS"
						},
						{
							text: "The Gambia",
							value: "GM"
						},
						{
							text: "Togo",
							value: "TG"
						},
						{
							text: "Tokelau",
							value: "TK"
						},
						{
							text: "Tonga",
							value: "TO"
						},
						{
							text: "Trinidad and Tobago",
							value: "TT"
						},
						{
							text: "Tunisia",
							value: "TN"
						},
						{
							text: "Turkey",
							value: "TR"
						},
						{
							text: "Turkmenistan",
							value: "TM"
						},
						{
							text: "Turks and Caicos Islands",
							value: "TC"
						},
						{
							text: "Tuvalu",
							value: "TV"
						},
						{
							text: "Uganda",
							value: "UG"
						},
						{
							text: "Ukraine",
							value: "UA"
						},
						{
							text: "United Arab Emirates",
							value: "AE"
						},
						{
							text: "United Kingdom",
							value: "GB"
						},
						{
							text: "United States Virgin Islands",
							value: "VI"
						},
						{
							text: "United States",
							value: "UM"
						},
						{
							text: "United States",
							value: "US"
						},
						{
							text: "Uruguay",
							value: "UY"
						},
						{
							text: "Uzbekistan",
							value: "UZ"
						},
						{
							text: "Vanuatu",
							value: "VU"
						},
						{
							text: "Venezuela",
							value: "VE"
						},
						{
							text: "Vietnam",
							value: "VN"
						},
						{
							text: "Wallis and Futuna",
							value: "WF"
						},
						{
							text: "Western Sahara",
							value: "EH"
						},
						{
							text: "Yemen",
							value: "YE"
						},
						{
							text: "Zambia",
							value: "ZM"
						},
						{
							text: "Zimbabwe",
							value: "ZW"
						},
						{
							text: "Åland Islands",
							value: "AX"
						}
					]
				},			
				youtube_home_page: {
					component: 'select',
					text: 'youtubeHomePage',
					options: [{
						text: 'home',
						value: '/'
					}, {
						text: 'trending',
						value: '/feed/trending'
					}, {
						text: 'subscriptions',
						value: '/feed/subscriptions'
					}, {
						text: 'history',
						value: '/feed/history'
					}, {
						text: 'watchLater',
						value: '/playlist?list=WL'
					}, {
						text: 'search',
						value: 'search'
					}, {
						text: 'liked',
						value: '/playlist?list=LL'
					}, {
						text: 'library',
						value: '/feed/library'
					}],
					tags: 'trending,subscriptions,history,watch,search'
				},			
				collapse_of_subscription_sections: {
					component: 'switch',
					text: 'collapseOfSubscriptionSections'
				},
				remove_related_search_results: {
					component: 'switch',
					text: 'removeRelatedSearchResults'
				},	
			},				
			section_2: {
				component: 'section',
				variant: 'card',
				title: 'watchedVideos',

				mark_watched_videos: {
					component: 'switch',
					text: 'markWatchedVideos',
					on: {
						click: function () {
							if (satus.storage.get('mark_watched_videos')) {
								if (!satus.storage.get('track_watched_videos')) {
									this.nextSibling.click();
								}
							}
						}
					}
				},
				track_watched_videos: {
					component: 'switch',
					text: 'trackWatchedVideos'
				},
				delete_watched_videos: {
					component: 'button',
					text: 'deleteWatchedVideos',
					style: {
						justifyContent: 'space-between'
					},
					on: {
						click: {
							component: 'modal',
							variant: 'confirm',
							content: 'thisWillRemoveAllWatchedVideos',
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
									text: 'accept',
									on: {
										click: function () {
											var modal = this.parentNode.parentNode.parentNode;

											satus.storage.remove('watched');

											modal.skeleton.parentSkeleton.counter.rendered.textContent = '0';

											modal.close();
										}
									}
								}
							}
						}
					},

					counter: {
						component: 'span',
						style: {
							opacity: .64
						},
						on: {
							render: function () {
								var watched = satus.storage.get('watched');

								if (watched) {
									this.textContent = Object.keys(watched).length;
								} else {
									this.textContent = '0';
								}
							}
						}
					}
				}
			},
			section_3: {
				component: 'section',
				variant: 'card',
				title: 'thumbnails',
				hide_animated_thumbnails: {
					component: 'switch',
					text: 'hideAnimatedThumbnails',
					tags: 'preview'
				},
				popup_window_buttons: {
					component: 'switch',
					text: 'popupWindowButtons',
				},
				hide_thumbnail_overlay: {
					component: 'switch',
					text: 'hideThumbnailOverlay',
					tags: 'preview'
				},
				thumbnails_quality: {
					component: 'select',
					text: 'thumbnailsQuality',
					options: [{
						text: 'default',
						value: 'null'
					}, {
						text: 'low',
						value: 'default'
					}, {
						text: 'medium',
						value: 'mqdefault'
					}, {
						text: 'high',
						value: 'hqdefault'
					}, {
						text: 'sd',
						value: 'sddefault'
					}, {
						text: 'hd',
						value: 'maxresdefault'
					}],
					tags: 'preview quality'
				}
			},
			section_4: {
				component: 'section',
				variant: 'card',
				title: 'more',
				add_scroll_to_top: {
					component: 'switch',
					text: 'addScrollToTop',
					tags: 'up'
				},
				confirmation_before_closing: {
					component: 'switch',
					text: 'confirmationBeforeClosing',
					tags: 'random prevent close exit'
				},
			}
		}
	},

	icon: {
		component: 'span',

		svg: {
			component: 'svg',
			attr: {
				'viewBox': '0 0 24 24',
				'fill': 'none',
				'stroke': 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.75'
			},

			path: {
				component: 'path',
				attr: {
					'd': 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7'
				}
			}
		}
	},
	label: {
		component: 'span',
		text: 'general'
	}
};