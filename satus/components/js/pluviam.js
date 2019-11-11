'use strict';

/*------------------------------------------------------------------------------
>>> "PLUVIAM" COMPONENT:
------------------------------------------------------------------------------*/

Satus.prototype.components.pluviam = {
  name: 'Pluviam',
  version: '0.1',
  status: 2,

  get: function(name, object) {
    var self = this,
      component = document.createElement('div'),
      component_inner = document.createElement('div'),
      block_size = 32;

    component.dataset.x = 0;
    component.dataset.y = 0;
    component.setAttribute('style', '--pluviam-size:' + block_size + 'px;');

    component_inner.classList.add('satus-pluviam__inner');

    component.appendChild(component_inner);

    component.addEventListener('mousedown', function(event) {
      var offset = {
        x: event.clientX - component_inner.offsetLeft,
        y: event.clientY - component_inner.offsetTop
      };

      function select(event) {
        event.preventDefault();
      }

      function update() {
        var component_event = new CustomEvent('pluviam-update', {
          detail: {
            x: component.dataset.x,
            y: component.dataset.y
          }
        });

        self.container.dispatchEvent(component_event);
      }

      function mousemove(event) {
        var x = event.clientX - offset.x,
          y = event.clientY - offset.y;

        if (x > 0) {
          x = -(component.offsetWidth / 10);
          offset.x += component.offsetWidth / 10;
          component.dataset.x--;
        } else if (x + component_inner.offsetWidth < component.offsetWidth) {
          x = -(component.offsetWidth / 10);
          offset.x -= component.offsetWidth / 10;
          component.dataset.x++;
        }

        if (y > 0) {
          y = -(component.offsetHeight / 10);
          offset.y += component.offsetHeight / 10;
          component.dataset.y--;
        } else if (y + component_inner.offsetHeight < component.offsetHeight) {
          y = -(component.offsetHeight / 10);
          offset.y -= component.offsetHeight / 10;
          component.dataset.y++;
        }

        component_inner.style.left = x + 'px';
        component_inner.style.top = y + 'px';

        update();
      }

      window.addEventListener('mousemove', mousemove);
      window.addEventListener('selectstart', select);

      function mouseup() {
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('selectstart', select);
        window.removeEventListener('mouseup', mouseup);
      }

      window.addEventListener('mouseup', mouseup);
    });

    component.create = function(options) {
      var block = document.createElement('div');

      block.classList.add('satus-pluviam__block');
      block.style.left = Math.floor(options.x / block_size) * block_size + 'px';
      block.style.top = Math.floor(options.y / block_size) * block_size + 'px';

      component_inner.appendChild(block);
    };

    return component;
  }
};
