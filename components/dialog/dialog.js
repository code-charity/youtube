/*-----------------------------------------------------------------------------
>>> «DIALOG» COMPONENT
-----------------------------------------------------------------------------*/

Satus.components.dialog = function(item, name) {
    if (Satus.isset(name) === false) {
        var dialog = document.createElement('div'),
            scrim = document.createElement('div'),
            surface = document.createElement('div'),
            transform_origin = ['center', 'center'];

        dialog.className = 'satus-dialog';
        scrim.className = 'satus-dialog__scrim';
        surface.className = 'satus-dialog__surface';

        if (Array.isArray(item.class)) {
            for (let i = 0, l = item.class.length; i < l; i++) {
                dialog.classList.add(item.class[i]);
            }
        }

        if (item.top) {
            surface.style.top = item.top + 'px';
            transform_origin[1] = 'top';
        } else if (item.bottom) {
            surface.style.bottom = item.bottom + 'px';
            transform_origin[1] = 'bottom';
        }

        if (item.right) {
            surface.style.right = item.right + 'px';
            transform_origin[0] = 'right';
        } else if (item.left) {
            surface.style.left = item.left + 'px';
            transform_origin[0] = 'left';
        }

        if (transform_origin[0] !== 'center' && transform_origin[1] !== 'center') {
            surface.style.position = 'absolute';
            surface.style.transformOrigin = transform_origin[0] + ' ' + transform_origin[1];
        }

        if (Satus.isset(item.surface)) {
            for (var key in item.surface) {
                surface.style[key] = item.surface[key];
            }
        }

        scrim.addEventListener('click', function() {
            dialog.remove();
        });

        Satus.render(surface, item);

        dialog.appendChild(scrim);
        dialog.appendChild(surface);

        return dialog;
    } else {
        var button = Satus.components.button({
            type: 'button',
            icon: item.icon,
            label: item.label
        });

        button.classList.add('satus-button');

        button.addEventListener('click', function() {
            document.querySelector('.satus').appendChild(Satus.components.dialog(item));
        });

        return button;
    }
};