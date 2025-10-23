/*--------------------------------------------------------------
>>> REFRESH CATEGORIES
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.refreshCategories = {
    component: 'button',
    variant: 'refresh-categories',
    category: true,
    on: {
        click: function() {
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'refresh-youtube-categories'
                        });
                    }
                });
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
            path1: {
                component: 'path',
                attr: {
                    'd': 'M1 4v6h6'
                }
            },
            path2: {
                component: 'path',
                attr: {
                    'd': 'M23 20v-6h-6'
                }
            },
            path3: {
                component: 'path',
                attr: {
                    'd': 'M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15'
                }
            }
        }
    },
    label: {
        component: 'span',
        text: 'Categories'
    }
};
