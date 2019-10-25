'use strict';

/*------------------------------------------------------------------------------
>>> "DIALOG" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components.dialog = {
    name: 'Dialog',
    version: '1.0',
    status: 2,

    get: function(name, object) {
        var self = this,
            dialog = document.createElement('div'),
            dialog_scrim = document.createElement('div'),
            dialog_surface = document.createElement('div');

        dialog.className = 'satus-dialog';
        dialog_scrim.className = 'satus-dialog__scrim';
        dialog_surface.className = 'satus-dialog__surface';

        function close() {
            dialog.classList.remove('satus-dialog_open');

            setTimeout(function() {
                dialog.remove();
            }, Number(document.defaultView.getComputedStyle(dialog, '').getPropertyValue('animation-duration').replace(/[^0-9.]/g, '') * 1000));
        }

        dialog_scrim.onclick = close;

        for (let i in object) {
            if (typeof object[i] === 'object' && object[i].hasOwnProperty('type')) {
                if (typeof object[i].onchange === 'object') {
                    object[i].onchange.push(close);
                } else {
                    object[i].onchange = [close];
                }
            }
        }

        this.constructors.render(object, dialog_surface);

        if (typeof object.options === 'object') {
            if (object.options.padding === false) {
                dialog_surface.classList.add('satus-dialog__scrim_no-padding');
            }

            if (object.options.scrim_visibility === false) {
                dialog_scrim.classList.add('satus-dialog__scrim_unvisible');
            }

            if (typeof object.options.surface_styles === 'object') {
                var origin = ['center', 'center'];

                if (typeof object.options.surface_styles.left === 'string') {
                    origin[0] = 'left';
                }

                if (typeof object.options.surface_styles.right === 'string') {
                    origin[0] = 'right';
                }

                if (typeof object.options.surface_styles.top === 'string') {
                    origin[1] = 'top';
                }

                if (typeof object.options.surface_styles.bottom === 'string') {
                    origin[1] = 'bottom';
                }

                dialog_surface.style.transformOrigin = origin[0] + ' ' + origin[1];

                if (typeof object.options.surface_styles === 'object') {
                    for (var style in object.options.surface_styles) {
                        dialog_surface.style[style] = object.options.surface_styles[style];
                    }
                }
            }
        }

        dialog.appendChild(dialog_scrim);
        dialog.appendChild(dialog_surface);

        dialog.classList.add('satus-dialog_open');

        return dialog;
    },

    create: function(object) {
        this.container.appendChild(this.components.dialog.get('', object));
    }
};