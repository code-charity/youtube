Menu.header.section_end.button_vert.onclick.active_features = {
    type: 'button',
    variant: 'list-item',
    before: '<svg fill="none" stroke="var(--satus-theme-primary)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
    label: 'activeFeatures',
    onclick: function() {
        document.querySelector('.satus-dialog__scrim').click();
    },

    section: {
        type: 'section',
        onrender: function() {
            var component = this,
                new_menu = {},
                storage = satus.storage;

            function search(string, object) {
                var result = [];

                for (var i in object) {
                    if (object[i].type) {
                        if (/(button|select|shortcut|slider|switch)/.test(object[i].type)) {
                            if (i.indexOf(string) !== -1 || (object[i].tags && object[i].tags.indexOf(string) !== -1)) {
                                if (object[i].type.indexOf('button') === -1 || !object[i].label) {
                                    new_menu[i] = object[i];
                                }
                            }
                        } else {
                            var response = search(string, object[i]);

                            if (response.length > 0) {
                                for (var j = 0, l = response.length; j < l; j++) {
                                    result.push(response[i]);
                                }
                            }
                        }
                    }
                }

                return result;
            }

            for (var key in storage) {
                search(key, Menu)
            }

            setTimeout(function() {
                if (Object.keys(new_menu).length > 0) {
                    satus.render(new_menu, component);
                } else {
                    satus.render({
                        text: {
                            type: 'text',
                            label: 'noActiveFeatures'
                        }
                    }, component);
                }
            });
        }
    }
};
