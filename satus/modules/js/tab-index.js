'use strict';

/*------------------------------------------------------------------------------
>>> "TAB INDEX" MODULE:
------------------------------------------------------------------------------*/

Satus.prototype.modules.tab_index = {
    name: 'Tab Index',
    version: '0.1',
    status: 1,

    init: function(callback) {
        this.constructors.onrendered = function(component, object) {
            if (object.tabindex === true) {
                component.setAttribute('tabindex', '0');

                component.addEventListener('keypress', function(event) {
                    if (document.activeElement === this && (event.keyCode === 32 || event.keyCode === 13)) {
                        this.click();
                    }
                });
            }
        };

        callback();
    }
};