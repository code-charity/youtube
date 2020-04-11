Menu.header.section_end.button_vert.onClickRender.active_features = {
    type: 'folder',
    before: '<svg xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
    label: 'Active features',
    onclick: function() {
        document.querySelector('.satus-dialog__scrim').click();
    },

    section: {
        type: 'section',
        onrender: function() {
            var component = this,
                new_menu = {},
                storage = Satus.storage;

            function search(string, object) {
                let result = [];

                for (let i in object) {
                    if (object[i].type) {
                        if (/(button|select|shortcut|slider|switch)/.test(object[i].type)) {
                            if (i.indexOf(string) !== -1 || (object[i].tags && object[i].tags.indexOf(string) !== -1)) {
                                if (object[i].type.indexOf('button') === -1 || !object[i].label) {
                                    new_menu[i] = object[i];
                                }
                            }
                        } else {
                            let response = search(string, object[i]);

                            if (response.length > 0) {
                                for (let j = 0, l = response.length; j < l; j++) {
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
                    Satus.render(new_menu, component);
                } else {
                    Satus.render({
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