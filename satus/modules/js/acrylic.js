'use strict';

/*------------------------------------------------------------------------------
>>> "ACRYLIC" MODULE:
------------------------------------------------------------------------------*/

Satus.prototype.modules.acrylic = {
    name: 'Acrylic',
    version: '0.1',
    status: 1,

    init: function(callback) {
        this.constructors.onrendered = function(component, object) {
            if (object.acrylic === true || typeof object.acrylic === 'object') {
                var options = object.acrylic === 'object' ? object.acrylic : {},
                    acrylic = document.createElement('div'),
                    acrylic_effects = {
                        'blur': document.createElement('div'),
                        'color-burn': document.createElement('div'),
                        'color-overlay': document.createElement('div'),
                        'noise': document.createElement('div')
                    };

                acrylic.classList.add('satus-acrylic');

                if (options.theme === 'dark') {
                    acrylic.classList.add('satus-acrylic_dark');
                } else {
                    acrylic.classList.add('satus-acrylic_light');
                }

                for (var i in acrylic_effects) {
                    acrylic_effects[i].classList.add('satus-acrylic__' + i);

                    acrylic.appendChild(acrylic_effects[i]);
                }

                for (var i = 0, l = component.childNodes.length; i < l; i++) {
                    component.childNodes[i].style.zIndex = i + 4;
                }

                component.appendChild(acrylic);
            }
        };

        callback();
    }
};