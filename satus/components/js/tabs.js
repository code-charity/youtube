'use strict';

/*------------------------------------------------------------------------------
>>> "TABS" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components.tabs = {
    name: 'Tabs',
    version: '0.1',
    status: 2,

    get: function(name, object) {
        var component_satus = this,
            component = document.createElement('div'),
            component_header = document.createElement('div'),
            component_main = document.createElement('div'),
            storage_name = (object || {}).storage_name || name,
            storage_data = this.storage.get(storage_name) || [],
            clipboard = '';

        console.log(storage_name, storage_data);

        component_header.classList.add('satus-tabs__header');
        component_main.classList.add('satus-tabs__main');

        function update() {
            var tabs = component.querySelectorAll('.satus-tabs__tab'),
                i = 0;

            for (var l = tabs.length; i < l; i++) {
                var tab = document.querySelector('.satus-tabs__tab[data-index="' + i + '"]:not([dragging])');

                if (tab && tab.offsetLeft != 140 * i) {
                    tab.style.left = 140 * i + 'px';
                }
            }

            if (object.readonly === false && component_header.querySelector('.satus-tabs__new-tab')) {
                component_header.querySelector('.satus-tabs__new-tab').style.left = 140 * i + 'px';
            }
        }

        function createTab(data, options = {}) {
            var tab = document.createElement('div'),
                index = data.id,
                content = data;

            tab.classList.add('satus-tabs__tab');
            tab.dataset.index = index;
            tab.innerHTML = (data || {}).label || ('Tab ' + index);
            tab.style.left = 140 * index + 'px';

            if (options.selected === true) {
                tab.setAttribute('selected', '');

                component_satus.constructors.render({
                    content: data
                }, component_main);
            }

            tab.addEventListener('mousedown', function(event) {
                var self = this,
                    offset = event.layerX;

                if (object.readonly === false && event.button === 0) {
                    self.setAttribute('dragging', '');

                    function preventSelect(event) {
                        event.preventDefault();
                    }

                    function drag(event) {
                        var x = event.clientX,
                            index = Number(self.dataset.index.replace(/[^0-9.]/g, ''));

                        component.setAttribute('dragging', '');

                        self.style.left = (x - offset) + 'px';

                        if (index > 0 && event.movementX < 0) {
                            var prev_elem = document.querySelector('.satus-tabs__tab[data-index="' + (index - 1) + '"]');

                            if (prev_elem && prev_elem.offsetLeft + prev_elem.offsetWidth / 2 > self.offsetLeft) {
                                self.dataset.index = prev_elem.dataset.index;
                                prev_elem.dataset.index = index;

                                for (var i in storage_data) {
                                    var j = JSON.parse(storage_data[i]);

                                    if (j.id == prev_elem.dataset.index) {
                                        j.id--;
                                        storage_data[i] = JSON.stringify(j);
                                    } else if (j.id == self.dataset.index) {
                                        j.id++;
                                        storage_data[i] = JSON.stringify(j);
                                    }
                                }

                                component_satus.storage.set(storage_name, storage_data);

                                update();
                            }
                        }

                        if (index < document.querySelectorAll('.satus-tabs__tab').length - 1 && event.movementX > 0) {
                            var next_elem = document.querySelector('.satus-tabs__tab[data-index="' + (index + 1) + '"]');

                            if (next_elem && self.offsetLeft + self.offsetWidth > next_elem.offsetLeft + next_elem.offsetWidth / 2) {
                                self.dataset.index = next_elem.dataset.index;
                                next_elem.dataset.index = index;

                                for (var i in storage_data) {
                                    var j = JSON.parse(storage_data[i]);

                                    if (j.id == next_elem.dataset.index) {
                                        j.id++;
                                        storage_data[i] = JSON.stringify(j);
                                    } else if (j.id == self.dataset.index) {
                                        j.id--;
                                        storage_data[i] = JSON.stringify(j);
                                    }
                                }

                                component_satus.storage.set(storage_name, storage_data);

                                update();
                            }
                        }
                    }

                    function mouseUp() {
                        window.removeEventListener('selectstart', preventSelect);
                        window.removeEventListener('mousemove', drag);
                        window.removeEventListener('mouseup', mouseUp);

                        self.removeAttribute('dragging');
                        component.removeAttribute('dragging', '');

                        if (component_header.querySelector('[selected]')) {
                            component_header.querySelector('[selected]').removeAttribute('selected');
                        }

                        self.setAttribute('selected', '');

                        component_satus.constructors.render({
                            content: content
                        }, component_main);

                        update();
                    }

                    window.addEventListener('selectstart', preventSelect);
                    window.addEventListener('mousemove', drag);
                    window.addEventListener('mouseup', mouseUp);
                }
            });

            Object.defineProperty(tab, 'open', {
                value: function() {
                    if (component_header.querySelector('[selected]')) {
                        component_header.querySelector('[selected]').removeAttribute('selected');
                    }

                    tab.setAttribute('selected', '');

                    component_satus.constructors.render({
                        content: data
                    }, component_main);
                }
            });

            Object.defineProperty(tab, 'cut', {
                value: function() {
                    var new_storage_data = [];

                    for (var i in storage_data) {
                        var j = JSON.parse(storage_data[i]);

                        if (j.id == this.dataset.index) {
                            clipboard = j;
                        } else {
                            new_storage_data.push(storage_data[i]);
                        }
                    }

                    storage_data = new_storage_data;

                    component_satus.storage.set(storage_name, storage_data);
                    console.log(clipboard);
                }
            });

            Object.defineProperty(tab, 'copy', {
                value: function() {
                    for (var i in storage_data) {
                        var j = JSON.parse(storage_data[i]);

                        if (j.id == this.dataset.index) {
                            clipboard = j;
                        }
                    }

                    console.log(clipboard);
                }
            });

            tab.removeTab = function() {
                var new_storage_data = [];

                for (var i = 0, l = storage_data.length; i < l; i++) {
                    if (this.dataset.index != i) {
                        new_storage_data.push(storage_data[i]);
                    }
                }

                storage_data = new_storage_data;
                component_satus.storage.set(storage_name, storage_data);

                for (var i = Number(this.dataset.index) + 1, l = component_header.querySelectorAll('.satus-tabs__tab').length; i < l; i++) {
                    //console.log(component_header.querySelectorAll('.satus-tabs__tab')[i]);

                    component_header.querySelectorAll('.satus-tabs__tab')[i].dataset.index = i - 1;
                }

                this.remove();
                component_main.innerHTML = '';
                setTimeout(update);
            };

            Object.defineProperty(tab, 'rename', {
                value: function(label) {
                    this.innerHTML = label;

                    for (var i in storage_data) {
                        var parsed = JSON.parse(storage_data[i]);

                        if (parsed.id == this.dataset.index) {
                            parsed.label = label;
                            storage_data[i] = JSON.stringify(parsed);
                            component_satus.storage.set(storage_name, storage_data);
                        }
                    }
                }
            });

            component_header.appendChild(tab);

            update();
        }

        if (object.tabs && storage_data.length === 0) {
            for (var i in object.tabs) {
                object.tabs[i].id = storage_data.length;
                object.tabs[i].label = 'Tab ' + storage_data.length;

                createTab(object.tabs[i], {
                    selected: true
                });

                component_satus.constructors.render({
                    content: object.tabs[i]
                }, component_main);

                storage_data.push(JSON.stringify(object.tabs[i]));

                component_satus.storage.set(storage_name, storage_data);
            }
        } else if (storage_data.length > 0) {
            for (var i = 0, l = storage_data.length; i < l; i++) {
                createTab(JSON.parse(storage_data[i]), {
                    selected: i == 0 ? true : false
                });
            }
        }

        if (object.readonly === false) {
            var new_tab = document.createElement('div');

            new_tab.innerText = '+';
            new_tab.classList.add('satus-tabs__new-tab');
            new_tab.onclick = function() {
                var created_tab = {
                    label: 'Tab ' + storage_data.length,
                    id: storage_data.length
                };

                createTab(created_tab);

                storage_data.push(JSON.stringify(created_tab));
                component_satus.storage.set(storage_name, storage_data);
            };

            component_header.appendChild(new_tab);
        }

        component.appendChild(component_header);
        component.appendChild(component_main);

        update();

        return component;
    }
};