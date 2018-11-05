/*--------------------------------------------------------------
>>> ELEMENTS:
----------------------------------------------------------------
1.0 Folder
2.0 Select
3.0 Toggle
4.0 Button
5.0 Section
6.0 Text
7.0 Classic list (ImprovedTube Classic element)
--------------------------------------------------------------*/

/*--------------------------------------------------------------
1.0 Folder
--------------------------------------------------------------*/
function folder(elem, obj, key) {
  if (storage.classic_improvedtube == 'true') {
    let button = document.createElement('button'),
        label = document.createElement('span');

    label.classList.add('list__item__label');
    label.getMessage(obj[key].label);
    elem.appendChild(label);

    button.classList.add('list__item_classic_folder');
    button.setAttribute('data-key', key);
    if (key == 'appearance' || key == 'channel' || key == 'general' || key == 'player' || key == 'playlist' || key == 'settings' || key == 'shortcuts' || key == 'themes')
      button.getMessage(obj[key].label);
    else
      button.innerHTML = 'Open';

    button.onclick = function() {
      let path = document.body.getAttribute('data-path'),
        key = this.getAttribute('data-key');

      if (path == '/')
        path += key;
      else
        path += '/' + key;

      document.body.setAttribute('data-path', path);
      document.querySelector('.header__title').innerText = this.innerText;

      createListByPath();
    };

    elem.appendChild(button);

    return;
  }

  let container = document.createElement('div'),
    label = document.createElement('span');

  label.classList.add('list__item__label');

  label.getMessage(obj[key].label);

  elem.setAttribute('data-key', key);
  elem.classList.add('list__item_folder');

  if (obj[key].disabled == 'true')
    elem.setAttribute('disabled', '');

  if (obj[key].disabled != 'true')
    elem.onclick = function() {
      let path = document.body.getAttribute('data-path'),
        key = this.getAttribute('data-key');

      if (path == '/')
        path += key;
      else
        path += '/' + key;

      document.body.setAttribute('data-path', path);
      document.querySelector('.header__title').innerText = this.querySelector('.list__item__label').innerText;

      createListByPath();
    };

  container.appendChild(label);

  elem.appendChild(container);
}


/*--------------------------------------------------------------
2.0 Select
--------------------------------------------------------------*/

function select(elem, obj, key) {
  let text_elem = document.createElement('span'),
    label_elem = document.createElement('span'),
    value_elem = document.createElement('span'),
    value = '';

  text_elem.classList.add('list__item__text');

  label_elem.classList.add('list__item__label');
  label_elem.getMessage(obj[key].label);

  value_elem.classList.add('list__item__select-value');

  if (storage.hasOwnProperty(key)) {
    for (let i = 0; i < obj[key].options.length; i++)
      if (obj[key].options[i].value == storage[key])
        value = obj[key].options[i].label;
  } else {
    for (let i = 0; i < obj[key].options.length; i++)
      if (obj[key].options[i].default == 'true')
        value = obj[key].options[i].label;
  }

  value_elem.getMessage(value);

  elem.setAttribute('data-key', key);

  text_elem.appendChild(label_elem);
  text_elem.appendChild(value_elem);
  elem.appendChild(text_elem);

  elem.addEventListener('click', function() {
    let list = document.createElement('ul');

    list.classList.add('list');

    for (let i = 0, l = obj[key].options.length; i < l; i++) {
      let option_obj = obj[key].options[i],
        list_item = document.createElement('li'),
        list_item_radio = document.createElement('span'),
        list_item_label = document.createElement('span');

      list_item.classList.add('list__item');
      list_item.dataset.key = key;
      list_item.dataset.value = option_obj.value;
      list_item.addEventListener('click', function() {
        saveSettings(this.dataset.key, this.dataset.value);

        for (let i = 0; i < obj[key].options.length; i++)
          if (obj[key].options[i].value == this.dataset.value) {
            document.querySelector('.list__item[data-key=' + this.dataset.key + '] .list__item__select-value').innerHTML = '';
            document.querySelector('.list__item[data-key=' + this.dataset.key + '] .list__item__select-value').getMessage(obj[key].options[i].label);
          }

        closeDialog();
      });

      if (
        storage.hasOwnProperty(key) && storage[key] == option_obj.value ||
        !storage.hasOwnProperty(key) && option_obj.default == 'true'
      )
        list_item.dataset.active = true;


      list_item_radio.classList.add('list__item__radio');

      list_item_label.classList.add('list__item__label');
      list_item_label.getMessage(option_obj.label);

      list_item.appendChild(list_item_radio);
      list_item.appendChild(list_item_label);
      list.appendChild(list_item);
    }

    openDialog(list);
  });
}


/*--------------------------------------------------------------
3.0 Toggle
--------------------------------------------------------------*/

function toggle(elem, obj, key) {
  let label = document.createElement('span'),
    status = document.createElement('span');

  elem.classList.add('list__item_toggle');
  elem.dataset.key = key;

  if (obj[key].hasOwnProperty('auto_deactivation'))
    elem.dataset.auto_deactivation = obj[key].auto_deactivation;

  if (storage[key] == 'true' || obj[key].default == 'true' && storage[key] != 'false')
    elem.dataset.value = 'true';

  // label
  label.classList.add('list__item__label');
  label.getMessage(obj[key].label);
  elem.appendChild(label);

  // status
  status.classList.add('list__item_toggle__status');
  elem.appendChild(status);

  elem.onclick = function() {
    if (document.querySelector('.list__item_toggle[data-key="' + this.getAttribute('data-auto_deactivation') + '"][data-value=true]'))
      document.querySelector('.list__item_toggle[data-key="' + this.getAttribute('data-auto_deactivation') + '"][data-value=true]').click();

    if (elem.dataset.value == 'true')
      elem.dataset.value = 'false';
    else
      elem.dataset.value = 'true';

    saveSettings(this.dataset.key, this.dataset.value);
  };
}


/*--------------------------------------------------------------
5.0 Button
--------------------------------------------------------------*/

function button(elem, obj, key) {
  if (storage.classic_improvedtube != 'true') {
    let label = document.createElement('span');

    label.classList.add('list__item__label');

    label.getMessage(obj[key].label);
    elem.setAttribute('data-key', key);

    elem.appendChild(label);

    elem.onclick = obj[key].click;
  } else {
    let label = document.createElement('span');

    label.classList.add('list__item__label');

    label.getMessage(obj[key].label);
    elem.appendChild(label);

    let button = document.createElement('button');

    elem.classList.add('list__item_button');

    button.getMessage('Just click');
    elem.setAttribute('data-key', key);

    elem.appendChild(button);

    elem.onclick = obj[key].click;
  }
}


/*--------------------------------------------------------------
6.0 Time
--------------------------------------------------------------*/

function time(elem, obj, key) {
  let label = document.createElement('span');

  label.classList.add('list__item__label');

  function convert(hour) {
    if (!storage.hasOwnProperty('time_type') || storage.time_type == true)
      hour = (hour < 10 ? '0' + hour : hour) + ':00';
    else if (hour < 13)
      hour = (hour < 10 ? '0' + hour : hour) + ':00 AM';
    else
      hour = (hour < 10 ? '0' + (hour - 12) : (hour - 12)) + ':00 PM';

    return hour;
  }

  if (storage.classic_improvedtube == 'true') {
    obj[key].options = [];

    for (let i = 0; i < 24; i++) {
      obj[key].options.push({
        label: convert(i),
        value: i
      });
    }

    classicList(elem, obj, key);
    return;
  }

  label.getMessage(obj[key].label);
  elem.setAttribute('data-key', key);
  elem.appendChild(label);

  elem.addEventListener('click', function() {
    let list = document.createElement('ul');

    list.classList.add('list');

    let list_item = document.createElement('li');

    list_item.classList.add('list__item');
    list_item.dataset.key = key;
    list_item.dataset.value = 'disabled';
    list_item.getMessage('optDisabled');
    list_item.addEventListener('click', function() {
      saveSettings(this.dataset.key, this.dataset.value);
      closeDialog();
    });

    list.appendChild(list_item);

    for (let i = 0, l = 24; i < l; i++) {
      let list_item = document.createElement('li'),
        list_item_radio = document.createElement('span'),
        list_item_label = document.createElement('span');

      list_item.classList.add('list__item');
      list_item.dataset.key = key;
      list_item.dataset.value = i;
      list_item.addEventListener('click', function() {
        saveSettings(this.dataset.key, this.dataset.value);

        closeDialog();
      });

      if (
        storage.hasOwnProperty(key) && storage[key] == i
      )
        list_item.dataset.active = true;


      list_item_radio.classList.add('list__item__radio');

      list_item_label.classList.add('list__item__label');
      list_item_label.innerText = convert(i);

      list_item.appendChild(list_item_radio);
      list_item.appendChild(list_item_label);
      list.appendChild(list_item);
    }

    openDialog(list);
  });
}


/*--------------------------------------------------------------
5.0 Section
--------------------------------------------------------------*/

function section(elem, obj, key) {
  let label = document.createElement('span');

  label.classList.add('list__item__label');
  label.getMessage(obj[key].label);

  elem.classList.add('list__item_section');
  elem.appendChild(label);

  createList(obj[key], {
    parent: elem
  });
}


/*--------------------------------------------------------------
6.0 Text
--------------------------------------------------------------*/

function text(elem, obj, key) {
  let label = document.createElement('span'),
    inner_text = document.createElement('span');

  elem.classList.add('list__item_text');

  label.classList.add('list__item__label');
  label.getMessage(obj[key].label);

  inner_text.classList.add('list__item__text');
  inner_text.innerHTML = obj[key].inner_text();

  elem.appendChild(label);
  elem.appendChild(inner_text);
}


/*--------------------------------------------------------------
7.0 Classic list
--------------------------------------------------------------*/

function classicList(elem, obj, key, toggle) {
  let label = document.createElement('span'),
    list = document.createElement('select');

  elem.classList.add('list__item_classic_list');
  elem.dataset.key = key;

  // label
  label.classList.add('list__item__label');
  label.getMessage(obj[key].label);
  elem.appendChild(label);

  // list
  list.classList.add('list__item_classic_list__list');

  // options
  if (toggle == true) {
    let option = document.createElement('option');
    option.value = 'false';
    option.innerHTML = 'Disabled';
    list.appendChild(option);
    option = document.createElement('option');
    option.value = 'true';
    option.innerHTML = 'Enabled';
    list.appendChild(option);
  } else {
    for (let i = 0; i < obj[key].options.length; i++) {
      let option = document.createElement('option');

      option.value = obj[key].options[i].value;
      option.getMessage(obj[key].options[i].label);
      list.appendChild(option);

      if (obj[key].options[i].default == 'true')
        list.value = obj[key].options[i].value;
    }
  }

  if (storage[key] == 'true' || obj[key].default == 'true' && storage[key] != 'false')
    list.value = 'true';
  else if (storage.hasOwnProperty(key))
    list.value = storage[key];

  elem.appendChild(list);

  list.onchange = function() {
    saveSettings(this.parentNode.dataset.key, this.value);
  };
}
