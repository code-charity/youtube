var menu = {
  general: {
    label: 'General',
    icon: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:2.5rem;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0V0z"/><g><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm5 15h-2v-6H9v6H7v-7.81l5-4.5 5 4.5V18z"/><path d="M7 10.19V18h2v-6h6v6h2v-7.81l-5-4.5z" opacity=".3"/></g></svg>',
      style: {}
    },
    section: {
      type: 'section',
      night_mode: {
        label: 'NightMode',
        section: {
          type: 'section',
          default_dark_theme: {
            label: 'Dark Theme',
            type: 'toggle',
            click: 'default_dark_theme'
          },
          bluelight: {
            label: 'Bluelight',
            type: 'select',
            options: [{
                label: 'optDisabled',
                value: 'disabled',
                default: 'true'
              },
              {
                label: '10%',
                value: '10'
              },
              {
                label: '20%',
                value: '20'
              },
              {
                label: '30%',
                value: '30'
              },
              {
                label: '40%',
                value: '40'
              },
              {
                label: '50%',
                value: '50'
              },
              {
                label: '60%',
                value: '60'
              },
              {
                label: '70%',
                value: '70'
              },
              {
                label: '80%',
                value: '80'
              },
              {
                label: '90%',
                value: '90'
              }
            ]
          },
          dim: {
            label: 'Dim',
            type: 'select',
            options: [{
                label: 'optDisabled',
                value: 'disabled',
                default: 'true'
              },
              {
                label: '10%',
                value: '10'
              },
              {
                label: '20%',
                value: '20'
              },
              {
                label: '30%',
                value: '30'
              },
              {
                label: '40%',
                value: '40'
              },
              {
                label: '50%',
                value: '50'
              },
              {
                label: '60%',
                value: '60'
              },
              {
                label: '70%',
                value: '70'
              },
              {
                label: '80%',
                value: '80'
              },
              {
                label: '90%',
                value: '90'
              }
            ]
          }
        },
        schedule_section: {
          label: 'Schedule',
          type: 'section',
          schedule_turn_on: {
            label: 'TurnOn',
            type: 'time'
          },
          schedule_turn_off: {
            label: 'TurnOff',
            type: 'time'
          }
        }
      },
      youtube_home_page: {
        label: 'DefaultYoutubeHomePage',
        type: 'select',
        options: [{
            label: 'optNormal',
            value: 'normal',
            default: 'true'
          },
          {
            label: 'optTrending',
            value: 'trending'
          },
          {
            label: 'optSubscriptions',
            value: 'subscriptions'
          },
          {
            label: 'History',
            value: 'history'
          },
          {
            label: 'optWatchLater',
            value: 'watch_later'
          }
        ]
      },
      youtube_version: {
        label: 'YoutubeVersion',
        type: 'select',
        options: [{
            label: 'optDoNotChange',
            value: 'do_not_change',
            default: 'true'
          },
          {
            label: 'optOld',
            value: 'old'
          },
          {
            label: 'optNew',
            value: 'new'
          }
        ]
      }
    },
    section_1: {
      label: 'Other',
      type: 'section',
      scroll_for_details: {
        label: 'Scroll for details',
        type: 'toggle',
        default: 'true'
      },
      scroll_to_top: {
        label: 'ScrollToTopButton',
        type: 'toggle'
      },
      youtube_prevent_closure: {
        label: 'YoutubePreventClosure',
        type: 'toggle'
      },
      squared_user_images: {
        label: 'SquaredUserImages',
        type: 'toggle'
      }
    },
    section_2: {
      label: 'Thumbnails',
      type: 'section',
      play_videos_by_hovering_the_thumbnails: {
        label: 'PlayVideosByHoveringTheThumbnails',
        type: 'toggle'
      },
      hd_thumbnail: {
        label: 'HdThumbnail',
        type: 'toggle',
        default: 'false'
      }
    }
  },
  appearance: {
    label: 'Appearance',
    icon: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:2.5rem;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0V0z"/><g><path d="M8 17c0-.55-.45-1-1-1s-1 .45-1 1c0 .74-.19 1.4-.5 1.95.17.03.33.05.5.05a2 2 0 0 0 2-2z" opacity=".3"/><path d="M11.75 15l8.96-8.96a1 1 0 0 0 0-1.41l-1.34-1.34c-.2-.2-.45-.29-.7-.29s-.51.1-.71.29L9 12.25 11.75 15zM6 21a4 4 0 0 0 4-4 3 3 0 1 0-6 0c0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2zm0-4c0-.55.45-1 1-1s1 .45 1 1a2 2 0 0 1-2 2c-.17 0-.33-.02-.5-.05.31-.55.5-1.21.5-1.95z"/></g></svg>',
      style: {}
    },
    header_folder: {
      label: 'Header',
      section: {
        type: 'section',
        header: {
          label: 'Header',
          type: 'select',
          options: [{
              label: 'optNormal',
              value: 'normal',
              default: 'true'
            },
            {
              label: 'optHidden',
              value: 'hidden'
            },
            {
              label: 'optHover',
              value: 'hover'
            },
            {
              label: 'optHiddenOnVideoPage',
              value: 'hidden_on_video_page'
            },
            {
              label: 'optHoverOnVideoPage',
              value: 'hover_on_video_page'
            },
            {
              label: 'optTopOfPage',
              value: 'top_of_page'
            }
          ]
        },
        improve_youtube_logo: {
          label: 'ImproveYoutubeLogo',
          type: 'toggle'
        }
      }
    },
    player: {
      label: 'Player',
      section: {
        type: 'section',
        annotations: {
          label: 'Annotations',
          type: 'toggle',
          default: 'true'
        },
        cards: {
          label: 'Cards',
          type: 'toggle',
          default: 'true'
        },
        player_size: {
          label: 'PlayerSize',
          type: 'select',
          options: [{
              label: 'optNormal',
              value: 'normal',
              default: 'true'
            },
            {
              label: 'optFitToWindow',
              value: 'fit_window'
            },
            {
              label: 'optFullWindow',
              value: 'full_window'
            },
            {
              label: '240p',
              value: '240p'
            },
            {
              label: '360p',
              value: '360p'
            },
            {
              label: '480p',
              value: '480p'
            },
            {
              label: '576p',
              value: '576p'
            },
            {
              label: '720p',
              value: '720p'
            },
            {
              label: '1080p',
              value: '1080p'
            },
            {
              label: '1440p',
              value: '1440p'
            },
            {
              label: '2160p',
              value: '2160p'
            }
          ]
        },
        forced_theater_mode: {
          label: 'ForcedTheaterMode',
          type: 'toggle'
        },
        player_color: {
          label: 'Player color',
          type: 'select',
          options: [{
            label: 'Red',
            value: 'red',
            default: 'true'
          }, {
            label: 'Pink',
            value: 'pink'
          }, {
            label: 'Purple',
            value: 'purple'
          }, {
            label: 'Deep purple',
            value: 'deep_purple'
          }, {
            label: 'Indigo',
            value: 'indigo'
          }, {
            label: 'Blue',
            value: 'blue'
          }, {
            label: 'Light blue',
            value: 'light_blue'
          }, {
            label: 'Cyan',
            value: 'cyan'
          }, {
            label: 'Teal',
            value: 'teal'
          }, {
            label: 'Green',
            value: 'green'
          }, {
            label: 'Light green',
            value: 'light_green'
          }, {
            label: 'Lime',
            value: 'lime'
          }, {
            label: 'Yellow',
            value: 'yellow'
          }, {
            label: 'Amber',
            value: 'amber'
          }, {
            label: 'Orange',
            value: 'orange'
          }, {
            label: 'Deep orange',
            value: 'deep_orange'
          }, {
            label: 'Brown',
            value: 'brown'
          }, {
            label: 'Blue gray',
            value: 'blue_gray'
          }, {
            label: 'White',
            value: 'white'
          }]
        },
        transparent_background: {
          label: 'TransparentBackground',
          type: 'toggle'
        },
        endscreen: {
          label: 'EndScreen',
          type: 'toggle',
          default: 'true'
        }
      }
    },
    details: {
      label: 'Details',
      section: {
        type: 'section',
        views_count: {
          label: 'ViewsCount',
          type: 'select',
          options: [{
              label: 'optNormal',
              value: 'normal',
              default: 'true'
            },
            {
              label: 'optHidden',
              value: 'hidden'
            }
          ]
        },
        likes: {
          label: 'Likes',
          type: 'select',
          options: [{
              label: 'optNormal',
              value: 'normal',
              default: 'true'
            },
            {
              label: 'optHidden',
              value: 'hidden'
            },
            {
              label: 'optIconsOnly',
              value: 'icons_only'
            }
          ]
        },
        how_long_ago_the_video_was_uploaded: {
          label: 'HowLongAgoTheVideoWasUploaded',
          type: 'toggle'
        },
        channel_videos_count: {
          label: 'ShowChannelVideosCount',
          type: 'toggle'
        }
      }
    },
    description: {
      label: 'Description',
      type: 'select',
      options: [{
          label: 'optNormal',
          value: 'normal',
          default: 'true'
        },
        {
          label: 'optExpanded',
          value: 'expanded'
        },
        {
          label: 'optHidden',
          value: 'hidden'
        }
      ]
    },
    comments: {
      label: 'Comments',
      type: 'select',
      options: [{
          label: 'optNormal',
          value: 'normal',
          default: 'true'
        },
        {
          label: 'optCollapsed',
          value: 'collapsed'
        },
        {
          label: 'optHidden',
          value: 'hidden'
        }
      ]
    },
    sidebar: {
      label: 'Sidebar',
      section: {
        type: 'section',
        livechat: {
          label: 'Livechat',
          type: 'select',
          options: [{
              label: 'optNormal',
              value: 'normal',
              default: 'true'
            },
            {
              label: 'optCollapsed',
              value: 'collapsed'
            },
            {
              label: 'optHidden',
              value: 'hidden'
            }
          ]
        },
        playlist: {
          label: 'Playlist',
          type: 'select',
          options: [{
              label: 'optNormal',
              value: 'normal',
              default: 'true'
            },
            {
              label: 'optHidden',
              value: 'hidden'
            }
          ]
        },
        related_videos: {
          label: 'RelatedVideos',
          type: 'select',
          options: [{
              label: 'optNormal',
              value: 'normal',
              default: 'true'
            },
            {
              label: 'optCollapsed',
              value: 'collapsed'
            },
            {
              label: 'optHidden',
              value: 'hidden'
            }
          ]
        }
      }
    },
    footer: {
      label: 'Footer',
      type: 'select',
      options: [{
          label: 'optNormal',
          value: 'normal',
          default: 'true'
        },
        {
          label: 'optHidden',
          value: 'hidden'
        }
      ]
    }
  },
  themes: {
    label: 'Themes',
    disabled: 'true',
    icon: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:2.5rem;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0z"/><g><path d="M12 4a8.01 8.01 0 0 0 0 16 .5.5 0 0 0 .5-.5.54.54 0 0 0-.14-.35A2.5 2.5 0 0 1 14.23 15H16a4 4 0 0 0 4-4c0-3.86-3.59-7-8-7zm-5.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4.5 2.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" opacity=".3"/><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10a2.5 2.5 0 0 0 1.86-4.17.5.5 0 0 1 .37-.83H16a6 6 0 0 0 6-6c0-4.96-4.49-9-10-9zm4 13h-1.77a2.5 2.5 0 0 0-1.87 4.15c.06.07.14.19.14.35a.5.5 0 0 1-.5.5 8.01 8.01 0 0 1 0-16c4.41 0 8 3.14 8 7a4 4 0 0 1-4 4z"/><circle cx="6.5" cy="11.5" r="1.5"/><circle cx="9.5" cy="7.5" r="1.5"/><circle cx="14.5" cy="7.5" r="1.5"/><circle cx="17.5" cy="11.5" r="1.5"/></g></svg>',
      style: {}
    },
    section_0: {
      type: 'section',
      classic_improvedtube: {
        label: 'Classic ImprovedTube',
        type: 'toggle'
      }
    }
  },
  player: {
    label: 'Player',
    icon: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:2.5rem;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 20a8.01 8.01 0 0 0 0-16 8.01 8.01 0 0 0 0 16zM10 7.5l6 4.5-6 4.5v-9z" opacity=".3"/><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-18a8.01 8.01 0 0 1 0 16 8.01 8.01 0 0 1 0-16z"/><path d="M10 7.5v9l6-4.5z"/></svg>',
      style: {}
    },
    section: {
      type: 'section',
      video_quality: {
        label: 'VideoQuality',
        type: 'select',
        options: [{
            label: 'optAuto',
            value: 'auto',
            default: 'true'
          },
          {
            label: '144p',
            value: 'tiny'
          },
          {
            label: '240p',
            value: 'small'
          },
          {
            label: '360p',
            value: 'medium'
          },
          {
            label: '480p',
            value: 'large'
          },
          {
            label: '720p',
            value: 'hd720'
          },
          {
            label: '1080p',
            value: 'hd1080'
          },
          {
            label: '1440p',
            value: 'hd1440'
          },
          {
            label: '2160p',
            value: 'hd2160'
          },
          {
            label: '2880p',
            value: 'hd2880'
          },
          {
            label: '4320p',
            value: 'highres'
          }
        ]
      },
      /*video_fullscreen_quality: {
        label: 'VideoFullscreenQuality',
        type: 'select',
        options: [{
            label: 'optInherit',
            value: 'inherit',
            default: 'true'
          },
          {
            label: '144p',
            value: 'tiny'
          },
          {
            label: '240p',
            value: 'small'
          },
          {
            label: '360p',
            value: 'medium'
          },
          {
            label: '480p',
            value: 'large'
          },
          {
            label: '720p',
            value: 'hd720'
          },
          {
            label: '1080p',
            value: 'hd1080'
          },
          {
            label: '1440p',
            value: 'hd1440'
          },
          {
            label: '2160p',
            value: 'hd2160'
          }
        ]
      },*/
      video_volume: {
        label: 'Volume',
        type: 'select',
        options: [{
            label: 'optDoNotChange',
            value: 'do_not_change',
            default: 'true'
          },
          {
            label: '10',
            value: '10'
          },
          {
            label: '20',
            value: '20'
          },
          {
            label: '30',
            value: '30'
          },
          {
            label: '40',
            value: '40'
          },
          {
            label: '50',
            value: '50'
          },
          {
            label: '60',
            value: '60'
          },
          {
            label: '70',
            value: '70'
          },
          {
            label: '80',
            value: '80'
          },
          {
            label: '90',
            value: '90'
          },
          {
            label: '100',
            value: '100'
          }
        ]
      },
      video_autoplay: {
        label: 'VideoAutoplay',
        type: 'toggle',
        default: 'true'
      },
      allow_60fps: {
        label: 'Allow60Fps',
        type: 'toggle',
        default: 'true'
      },
      allow_subtitles: {
        label: 'AllowSubtitles',
        type: 'toggle',
        default: 'true'
      },
      allow_loudness: {
        label: 'AllowLoudnessNormalization',
        type: 'toggle'
      },
      video_playback_speed: {
        label: 'PlaybackSpeed',
        type: 'select',
        options: [{
            label: 'optDoNotChange',
            value: 'do_not_change',
            default: 'true'
          },
          {
            label: '25',
            value: '0.25'
          },
          {
            label: '50',
            value: '0.5'
          },
          {
            label: '75',
            value: '0.75'
          },
          {
            label: '100',
            value: '1'
          },
          {
            label: '125',
            value: '1.25'
          },
          {
            label: '150',
            value: '1.5'
          },
          {
            label: '175',
            value: '1.75'
          },
          {
            label: '200',
            value: '2'
          }
        ]
      },
      video_encode: {
        label: 'VideoEncode',
        type: 'select',
        options: [{
            label: 'optNormal',
            value: 'normal',
            default: 'true'
          },
          {
            label: 'h264',
            value: 'h264'
          }
        ]
      },
      up_next_autoplay: {
        label: 'UpNextAutoplay',
        type: 'select',
        options: [{
            label: 'optDoNotChange',
            value: 'do_not_change',
            default: 'true'
          },
          {
            label: 'optEnabled',
            value: 'enabled'
          },
          {
            label: 'optDisabled',
            value: 'disabled'
          }
        ]
      },
      mini_player_b: {
        label: 'Mini player (beta)',
        type: 'toggle'
      },
      video_autopause: {
        label: 'VideoAutopause',
        type: 'toggle'
      }
    },
    section_ads: {
      label: 'Ads',
      type: 'section',
      allow_video_ads: {
        label: 'AllowAdsOnVideos',
        type: 'toggle',
        default: 'true',
        auto_deactivation: 'subscribed_channel_player_ads'
      },
      subscribed_channel_player_ads: {
        label: 'AllowAdsOnlyOnSubscribedChannels',
        type: 'toggle',
        default: 'false',
        auto_deactivation: 'allow_video_ads'
      }
    },
    section_buttons: {
      label: 'PlayerButtons',
      type: 'section',
      video_repeat_button: {
        label: 'Repeat',
        type: 'toggle'
      },
      popup_player_button: {
        label: 'PopupPlayer',
        type: 'toggle'
      },
      video_rotate_button: {
        label: 'Rotate video',
        type: 'toggle'
      },
      screenshot_button: {
        label: 'Screenshot',
        type: 'toggle'
      }
    }
  },
  playlist: {
    label: 'Playlist',
    icon: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:3rem;height:auto;fill:#fff6f6;margin:.3rem 0 0 .4rem"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M4 10h12v2H4zM4 6h12v2H4zM4 14h8v2H4zM14 20l5-3-5-3z"/></svg>',
      style: {}
    },
    section: {
      type: 'section',
      playlist_autoplay: {
        label: 'Autoplay',
        type: 'toggle',
        default: 'true'
      },
      playlist_reverse: {
        label: 'Reverse',
        type: 'toggle'
      },
      playlist_repeat: {
        label: 'Repeat',
        type: 'select',
        options: [{
            label: 'optDoNotChange',
            value: 'do_not_change',
            default: 'true'
          },
          {
            label: 'optEnabled',
            value: 'enabled'
          },
          {
            label: 'optDisabled',
            value: 'disabled'
          }
        ]
      },
      playlist_shuffle: {
        label: 'Shuffle',
        type: 'select',
        options: [{
            label: 'optDoNotChange',
            value: 'do_not_change',
            default: 'true'
          },
          {
            label: 'optEnabled',
            value: 'enabled'
          },
          {
            label: 'optDisabled',
            value: 'disabled'
          }
        ]
      }
    }
  },
  channel: {
    label: 'Channel',
    icon: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:2.5rem;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0V0z"/><g><path d="M3 20h18V8H3v12zm6-10l7 4-7 4v-8z" opacity=".3"/><path d="M9 10v8l7-4z"/><path d="M21 6h-7.58l3.29-3.29L16 2l-4 4h-.03l-4-4-.69.71L10.56 6H3a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm0 14H3V8h18v12z"/></g></svg>',
      style: {}
    },
    section: {
      type: 'section',
      channel_default_page: {
        label: 'defaultChannelTab',
        type: 'select',
        options: [{
            label: 'optNormal',
            value: 'normal',
            default: 'true'
          },
          {
            label: 'optVideos',
            value: 'videos'
          },
          {
            label: 'optPlaylists',
            value: 'playlists'
          }
        ]
      },
      channel_autoplay: {
        label: 'TrailerAutoplay',
        type: 'toggle',
        default: 'true'
      },
      channel_featured_content: {
        label: 'FeaturedContent',
        type: 'toggle',
        default: 'true'
      }
    }
  },
  shortcuts: {
    label: 'Shortcuts',
    icon: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:2.5rem;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0V0zm0 0h24v24H0V0z"/><g><path d="M4 17h16V7H4v10zm13-9h2v2h-2V8zm0 3h2v2h-2v-2zm-3-3h2v2h-2V8zm0 3h2v2h-2v-2zm-3-3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm0 3h8v2H8v-2zM5 8h2v2H5V8zm0 3h2v2H5v-2z" opacity=".3"/><path d="M20 5H4a2 2 0 0 0-1.99 2L2 17c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 12H4V7h16v10z"/><path d="M11 8h2v2h-2zM11 11h2v2h-2zM8 8h2v2H8zM8 11h2v2H8zM5 11h2v2H5zM5 8h2v2H5zM8 14h8v2H8zM14 11h2v2h-2zM14 8h2v2h-2zM17 11h2v2h-2zM17 8h2v2h-2z"/></g></svg>',
      style: {}
    },
    section: {
      type: 'section',
      player_shurtcuts: {
        label: 'PlayerShortcutsAlwaysActive',
        type: 'toggle',
        default: 'true'
      },
    },
    section_0: {
      type: 'section',
      play_pause_video: {
        label: 'PlayPauseVideo',
        type: 'select',
        options: [{
            label: 'optSpacebar',
            value: 'normal',
            default: 'true'
          },
          {
            label: 'optDisabled',
            value: 'disabled'
          }
        ]
      },
      scroll_adjusts_volume: {
        label: 'ScrollAdjustsVolume',
        type: 'select',
        options: [{
            label: 'optDisabled',
            value: 'disabled',
            default: 'true'
          },
          {
            label: 'optWheelShift',
            value: 'shift'
          },
          {
            label: 'optWheelAlt',
            value: 'alt'
          },
          {
            label: 'optWheelHoverPlayer',
            value: 'hover_player'
          }
        ]
      },
      scroll_adjusts_playback_speed: {
        label: 'Adjusts playback speed',
        type: 'select',
        options: [{
            label: 'optDisabled',
            value: 'disabled',
            default: 'true'
          },
          {
            label: 'optWheelShift',
            value: 'shift'
          },
          {
            label: 'optWheelAlt',
            value: 'alt'
          },
          {
            label: 'optWheelHoverPlayer',
            value: 'hover_player'
          },
          {
            label: 'Ctrl + -/+',
            value: 'ctrl_plus_minus'
          }
        ]
      },
      play_prev_video: {
        label: 'PlayPrevVideo',
        type: 'select',
        options: [{
            label: 'optDisabled',
            value: 'disabled',
            default: 'true'
          },
          {
            label: 'optCtrlLeft',
            value: 'left'
          }
        ]
      },
      play_next_video: {
        label: 'PlayNextVideo',
        type: 'select',
        options: [{
            label: 'optDisabled',
            value: 'disabled',
            default: 'true'
          },
          {
            label: 'optCtrlRight',
            value: 'right'
          }
        ]
      }
    }
  },
  settings: {
    label: 'Settings',
    icon: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:2.5rem;height:auto;fill:#fff6f6"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M19.28 8.6l-.7-1.21-1.27.51-1.06.43-.91-.7a5.1 5.1 0 0 0-1.23-.71l-1.06-.43-.16-1.13L12.7 4h-1.4l-.19 1.35-.16 1.13-1.06.44c-.41.17-.82.41-1.25.73l-.9.68-1.05-.42-1.27-.52-.7 1.21 1.08.84.89.7-.14 1.13c-.03.3-.05.53-.05.73s.02.43.05.73l.14 1.13-.89.7-1.08.84.7 1.21 1.27-.51 1.06-.43.91.7c.39.3.8.54 1.23.71l1.06.43.16 1.13.19 1.36h1.39l.19-1.35.16-1.13 1.06-.43c.41-.17.82-.41 1.25-.73l.9-.68 1.04.42 1.27.51.7-1.21-1.08-.84-.89-.7.14-1.13a5.34 5.34 0 0 0 0-1.46l-.14-1.13.89-.7 1.1-.84zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" opacity=".3"/><path d="M19.43 12.98a7.8 7.8 0 0 0 0-1.96l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.3 7.3 0 0 0-1.69-.98l-.38-2.65A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1a.57.57 0 0 0-.18-.03.5.5 0 0 0-.43.25l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65a7.93 7.93 0 0 0 0 1.96l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65a7.68 7.68 0 0 0 1.69-.98l2.49 1 .18.03a.5.5 0 0 0 .43-.25l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65zm-1.98-1.71a5.34 5.34 0 0 1 0 1.46l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43a5.67 5.67 0 0 1-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13z"/><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
      style: {}
    },
    section_4: {
      type: 'section',
      improvedtube_youtube_icon: {
        label: 'ImprovedTube Icon on Youtube',
        type: 'select',
        options: [{
            label: 'Disabled',
            value: 'disabled',
            default: 'true'
          },
          {
            label: 'Youtube Header (left)',
            value: 'header_left'
          },
          {
            label: 'Youtube Header (right)',
            value: 'header_right'
          },
          {
            label: 'Bottom of screen (left)',
            value: 'bottom_left'
          },
          {
            label: 'Bottom of screen (right)',
            value: 'bottom_right'
          },
          {
            label: 'Below player',
            value: 'below_player'
          }
        ]
      },
      improvedtube_browser_icon: {
        label: 'ImprovedTube Icon in Browser:',
        type: 'select',
        options: [{
            label: 'Always active',
            value: 'always'
          },
          {
            label: 'Only active on YouTube',
            value: 'youtube',
            default: 'true'
          }
        ]
      }
    },
    section_0: {
      type: 'section',
      backup_and_reset: {
        label: 'Backup & reset',
        backup_section: {
          type: 'section',
          export_settings: {
            label: 'ExportSettings',
            type: 'button',
            click: function() {
              exportSettings();
            }
          },
          import_settings: {
            label: 'ImportSettings',
            type: 'button',
            click: function() {
              importSettings();
            }
          },
          reset_all_settings: {
            label: 'ResetAllSettings',
            type: 'button',
            click: function() {
              dialogConfirm('This will reset all settings.', function() {
                resetSettings();
              });
            }
          }
        },
        section_cookies: {
          label: 'Cookies',
          type: 'section',
          delete_youtube_cookies: {
            label: 'DeleteYoutubeCookies',
            type: 'button',
            click: function() {
              dialogConfirm('This will remove all cookies.', function() {
                chrome.tabs.query({}, function(tabs) {
                  for (let i = 0, l = tabs.length; i < l; i++)
                    if (tabs[i].hasOwnProperty('url'))
                      chrome.tabs.sendMessage(tabs[i].id, 'delete_youtube_cookies');
                });
              });
            }
          }
        }
      },
      folder_time: {
        label: 'Date & time',
        section_time: {
          type: 'section',
          time_type: {
            label: 'Use24HourFormat',
            type: 'toggle',
            default: 'true'
          }
        }
      },
      about: {
        label: 'About',
        section_1: {
          type: 'section',
          improvedtube_version: {
            label: 'ImprovedTube version',
            type: 'text',
            inner_text: function() {
              return chrome.runtime.getManifest().version;
            }
          },
          chrome_version: {
            label: 'Chrome version',
            type: 'text',
            inner_text: function() {
              return navigator.userAgent.match(/Chrom(e|ium)+\/[0-9.]+/g)[0].match(/[0-9.]+/g)[0];
            }
          }
        },
        section_2: {
          type: 'section',
          improvedtube_permissions: {
            label: 'Permissions',
            type: 'text',
            inner_text: function() {
              return chrome.runtime.getManifest().permissions.join(', ').replace('https://www.youtube.com/', 'youtube');
            }
          }
        },
        /*section_3: {
          type: 'section',
          changelog: {
            label: 'WhatIsNew',
            changelog: {
              type: 'textarea',
              inner_text: 'Hello World'
            }
          }
        }*/
      }
    },
    section_00: {
      type: 'section',
      classic_improvedtube: {
        label: 'Classic ImprovedTube',
        type: 'toggle'
      }
    }
  }
};


var header_menu = {
  active_features: {
    label: 'ListOfActiveFeatures',
    type: 'button',
    click: function() {
      var list = {};

      document.querySelector('body').setAttribute('data-path', '/active');

      function get(obj) {
        for (let key in obj) {
          if (obj[key].type && obj[key].type != 'section') {
            if (storage.hasOwnProperty(key)) {
              list[key] = obj[key];
            }
          } else if (typeof obj[key] == 'object')
            get(obj[key]);
        }
      }

      get(menu);

      createList(list);

      document.querySelector('.dialog__backdrop').click();
    }
  },
  contribute: {
    label: 'Contribute',
    type: 'button',
    click: function() {
      window.open('http://www.improvedtube.com/donate');
    }
  },
  rate_me: {
    label: 'Rate me',
    type: 'button',
    click: function() {
      window.open('https://chrome.google.com/webstore/detail/improvedtube-for-youtube/bnomihfieiccainjcjblhegjgglakjdd');
    }
  },
  github: {
    label: 'GitHub',
    type: 'button',
    click: function() {
      window.open('https://github.com/ImprovedTube/ImprovedTube');
    }
  }
};
