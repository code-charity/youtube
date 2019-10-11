'use strict';

/*------------------------------------------------------------------------------
>>> "CONTEXTMENU" MODULE:
------------------------------------------------------------------------------*/

Satus.prototype.modules.contextmenu = {
    name: 'Contextmenu',
    version: '0.1',
    status: 1,

    init: function(callback) {
        var self = this;


        this.constructors.onrendered = function(component, object) {
            function createMenu(object) {
                component.addEventListener('contextmenu', function(event) {
                    if (typeof object === 'object' && object.query && object.content) {
                        var hasElement = false;

                        for (var i = 0, l = event.path.length; i < l; i++) {
                            if (event.path[i].className && event.path[i].className.indexOf(object.query) != -1) {
                                hasElement = true;

                                break;
                            }
                        }

                        if (hasElement) {
                            event.preventDefault();

                            if (self.container.querySelector('.satus-contextmenu')) {
                                self.container.querySelector('.satus-contextmenu').remove();
                            }

                            var list = document.createElement('div');

                            list.classList.add('satus-contextmenu');

                            self.constructors.render(object.content, list, {
                                data: event
                            });

                            list.style.left = event.clientX + 'px';
                            list.style.top = event.clientY + 'px';

                            self.container.appendChild(list);

                            function removeContextMenu() {
                                if (self.container.querySelector('.satus-contextmenu')) {
                                    self.container.querySelector('.satus-contextmenu').remove();
                                    window.removeEventListener('click', removeContextMenu);
                                }
                            }

                            window.addEventListener('click', removeContextMenu);

                            return false;
                        }
                    }
                });
            }

            if (typeof object.contextmenu === 'object') {
                for (var i = 0, l = object.contextmenu.length; i < l; i++) {
                    createMenu(object.contextmenu[i]);
                }
            }
        };

        callback();
    }
};