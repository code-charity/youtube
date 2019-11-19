/*-----------------------------------------------------------------------------
>>> «INDEX» TEMPLATE
-----------------------------------------------------------------------------*/

Satus.chromium_storage.sync(function() {
    for (var key in Satus.storage.get('')) {
        document.querySelector('.satus').setAttribute(key.replace(/_/g, '-'), Satus.storage.get('')[key]);
    }

    Satus.locale(function() {
        document.querySelector('.satus').innerHTML = '';

        Satus.render(document.querySelector('.satus'), Menu);
    });
});

chrome.storage.onChanged.addListener(function() {
    chrome.storage.local.get(function(items) {
        for (var key in items) {
            document.querySelector('.satus').setAttribute(key.replace(/_/g, '-'), items[key]);
        }
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.name === 'dialog-error') {
        Satus.components.dialog({
            options: {
                scrim_visibility: false,
                surface_style: {
                    position: 'absolute',
                    bottom: '16px',
                    boxShadow: 'none',
                    border: '1px solid rgba(255, 0, 0, .4)',
                    background: 'rgba(255,0,0,.2)'
                }
            },

            message: {
                type: 'text',
                label: request.value,
                style: {
                    'padding': '0 16px',
                    'width': '100%',
                    'opacity': '.8'
                }
            }
        });
    }
});