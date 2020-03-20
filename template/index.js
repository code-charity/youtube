/*-----------------------------------------------------------------------------
>>> «INDEX» TEMPLATE
-----------------------------------------------------------------------------*/

Satus.chromium_storage.sync(function() {
    for (var key in Satus.storage.get('')) {
        document.querySelector('.satus').setAttribute(key.replace(/_/g, '-'), Satus.storage.get('')[key]);
    }

    Satus.locale(function() {
        document.querySelector('.satus').innerHTML = '';

        document.querySelector('.satus').addEventListener('satus-navigate', function(event) {
            if (event.detail.name === 'main') {
                document.querySelector('.satus-header__title').innerText = 'ImprovedTube';
                document.querySelector('.satus-header__title').title = '';
            } else {
                var title = '',
                    description = [];

                for (var i = 0, l = event.detail.path.length; i < l; i++) {
                    var part = event.detail.path[i];

                    if (i === 0) {
                        part = 'home';
                    }

                    if (Satus.memory.get('locale/' + part)) {
                        description.push(Satus.memory.get('locale/' + part))
                    }
                }

                if (event.detail.item.hasOwnProperty('label')) {
                    title = Satus.memory.get('locale/' + event.detail.item.label);
                } else {
                    title = Satus.memory.get('locale/' + event.detail.name);
                }

                document.querySelector('.satus-header__title').innerText = title;
                document.querySelector('.satus-header__title').title = description.join(' > ');
            }
        });

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