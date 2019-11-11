'use strict';

/*------------------------------------------------------------------------------
>>> IMPROVEDTUBE TEMPLATE:
--------------------------------------------------------------------------------
1.0 Init
------------------------------------------------------------------------------*/

let App = new Satus('.satus', {
    debug: true,
    chromium_storage: {
        exclude: ['locale']
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.name === 'dialog-error') {
        App.components.dialog.create({
            type: 'dialog',

            message: {
                type: 'text',
                label: request.value,
                styles: {
                	'width': '100%',
                	'opacity': '.8'
                }
            },
            section: {
            	type: 'section',
            	class: 'controls',
            	styles: {
            		'justify-content': 'flex-end'
            	},

            	cancel: {
            		type: 'button',
            		label: 'cancel',
            		onclick: function() {
            			let scrim = document.querySelectorAll('.satus-dialog__scrim');

            			scrim[scrim.length - 1].click();
            		}
            	},
            	ok: {
            		type: 'button',
            		label: 'OK',
            		onclick: function() {
            			let scrim = document.querySelectorAll('.satus-dialog__scrim');

            			scrim[scrim.length - 1].click();
            		}
            	}
            }
        });
    }
});