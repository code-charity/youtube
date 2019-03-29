/*--------------------------------------------------------------
>>> ELEMENTS:
----------------------------------------------------------------
 1.0 Folder
 2.0 Select
 3.0 Toggle
 4.0 Button
 5.0 Time
 6.0 Section
 7.0 Text
 8.0 Classic list (ImprovedTube Classic element)
 9.0 Shortcut
10.0 Slider
11.0 Custom
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

            if (this.innerText.length > 20)
                document.querySelector('.header__title').innerText = this.innerText.substring(0, 20) + '...';
            else
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
            if (this.innerText.length > 20)
                document.querySelector('.header__title').innerText = this.querySelector('.list__item__label').innerText.substring(0, 20) + '...';
            else
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

    if (
        obj[key].hasOwnProperty('value') && storage[key] == obj[key].value ||
        !obj[key].hasOwnProperty('value') && (storage[key] == 'true' || obj[key].default == 'true' && storage[key] != 'false')
    )
        elem.dataset.value = 'true';

    if (obj[key].hasOwnProperty('value'))
        elem.dataset.val = obj[key].value;

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

        if (obj[key].hasOwnProperty('value') && elem.dataset.value != 'false') {
            saveSettings(this.dataset.key, obj[key].value);

            for (let i = 0, l = document.querySelectorAll('.list__item.list__item_toggle:not([data-val="' + obj[key].value + '"])').length; i < l; i++) {
                document.querySelectorAll('.list__item.list__item_toggle:not([data-val="' + obj[key].value + '"])')[i].dataset.value = false;
            }

            return false;
        }

        saveSettings(this.dataset.key, this.dataset.value);
    };
}


/*--------------------------------------------------------------
4.0 Button
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
5.0 Time
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

        for (let i = 0, l = 24; i < l; i++) {
            let list_item = document.createElement('li'),
                list_item_radio = document.createElement('span'),
                list_item_label = document.createElement('span');

            list_item.classList.add('list__item');
            list_item.dataset.key = key;

            if (i == 0)
                list_item.dataset.value = 'disabled';
            else
                list_item.dataset.value = i;

            list_item.addEventListener('click', function() {
                saveSettings(this.dataset.key, this.dataset.value);

                closeDialog();
            });

            if (
                storage.hasOwnProperty(key) && storage[key] == i ||
                !storage.hasOwnProperty(key) && i == 0
            )
                list_item.dataset.active = true;


            list_item_radio.classList.add('list__item__radio');

            list_item_label.classList.add('list__item__label');

            if (i == 0)
                list_item_label.getMessage('disabled');
            else
                list_item_label.innerText = convert(i);

            list_item.appendChild(list_item_radio);
            list_item.appendChild(list_item_label);
            list.appendChild(list_item);
        }

        openDialog(list);
    });
}


/*--------------------------------------------------------------
6.0 Section
--------------------------------------------------------------*/

function section(elem, obj, key) {
    let label = document.createElement('span');

    label.classList.add('list__item__label');
    label.getMessage(obj[key].label);

    if (obj[key].classList)
        for (let i = 0, l = obj[key].classList.length; i < l; i++)
            elem.classList.add(obj[key].classList[i]);

    elem.classList.add('list__item_section');
    elem.appendChild(label);

    createList(obj[key], {
        parent: elem
    });
}


/*--------------------------------------------------------------
7.0 Text
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
8.0 Classic list
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

/*--------------------------------------------------------------
9.0 Shortcut
--------------------------------------------------------------*/

function shortcut(elem, obj, key) {
    let text_elem = document.createElement('span'),
        label_elem = document.createElement('span'),
        value_elem0 = document.createElement('span'),
        replace_text = ['spacebar', 'none', 'ARROWUP', 'ARROWRIGHT', 'ARROWDOWN', 'ARROWLEFT'],
        value = '';

    text_elem.classList.add('list__item__text');

    label_elem.classList.add('list__item__label');
    label_elem.getMessage(obj[key].label);

    value_elem0.classList.add('list__item__select-value');

    if (storage.hasOwnProperty(key) && JSON.parse(storage[key]))
        value = JSON.parse(storage[key]).label;
    else
        value = obj[key].default;

    if (value)
        for (let i = 0, l = replace_text.length; i < l; i++)
            value = value.replace(replace_text[i], getMessage(replace_text[i]));

    value_elem0.value = value;

    value_elem0.getMessage(value);

    elem.setAttribute('data-key', key);

    text_elem.appendChild(label_elem);
    text_elem.appendChild(value_elem0);
    elem.appendChild(text_elem);

    elem.addEventListener('click', function() {
        let container = document.createElement('div'),
            title = document.createElement('div'),
            value_elem = document.createElement('input'),
            hover = document.createElement('div'),
            hover_checkbox = document.createElement('input'),
            hover_label = document.createElement('span'),
            buttons = document.createElement('div'),
            button_allow = document.createElement('div'),
            button_reset = document.createElement('div'),
            deny = document.createElement('div'),
            it_keys = storage[key] ? JSON.parse(storage[key]) : {
                label: ''
            };

        title.classList.add('list__item__label');
        title.getMessage('pressAnyKeyOrScroll');

        value_elem.classList.add('shortcut-input');

        if (value)
            for (let i = 0, l = replace_text.length; i < l; i++)
                value = value.replace(replace_text[i], getMessage(replace_text[i]));

        value_elem.value = value;

        button_reset.classList.add('dialog__surface__button');
        button_allow.classList.add('dialog__surface__button');
        button_reset.getMessage('reset');
        button_allow.getMessage('save');

        deny.classList.add('dialog__surface__button');
        deny.getMessage('cancel');

        container.style.padding = '1rem';
        container.appendChild(title);
        container.appendChild(value_elem);
        hover_checkbox.type = 'checkbox';
        hover.appendChild(hover_checkbox);
        hover.appendChild(hover_label);
        buttons.appendChild(deny);
        buttons.appendChild(button_reset);
        buttons.appendChild(button_allow);
        hover.setAttribute('style', 'display:flex;padding:10px 0 2px;font-size:14px;color:var(--it-item-label-color);align-items:center;');
        hover_label.innerHTML = 'Hover player (scroll only)';
        buttons.setAttribute('style', 'display:flex;justify-content:center;flex-wrap:wrap');
        container.style.padding = '1rem 1rem 0';
        container.appendChild(hover);
        container.appendChild(buttons);

        hover_checkbox.onchange = function() {
            if (/scroll\+/g.test(value_elem.value)) {
                value_elem.value = 'scroll+';
            } else if (/scroll\-/g.test(value_elem.value)) {
                value_elem.value = 'scroll-';
            } else {
                value_elem.value = '';
            }

            it_keys.label = value_elem.value;
            it_keys.altKey = null;
            it_keys.ctrlKey = null;
            it_keys.shiftKey = null;
            it_keys.key = null;
        };

        function mousewheel(event) {
            event.preventDefault();
            event.stopPropagation();

            if (/scroll\+|scroll\-/g.test(value_elem.value))
                value_elem.value = value_elem.value.replace(/scroll\+|scroll\-/g, event.deltaY > 0 ? 'scroll+' : 'scroll-');
            else {
                if (value_elem.value.length != 0 && value_elem.value[value_elem.value.length - 2] != '+')
                    value_elem.value += ' + ';

                value_elem.value += event.deltaY > 0 ? 'scroll+' : 'scroll-'
            }

            for (let i = 0, l = replace_text.length; i < l; i++)
                value_elem.value = value_elem.value.replace(replace_text[i], getMessage(replace_text[i]));

            it_keys.scroll = event.deltaY;
            it_keys.label = value_elem.value;
        }

        function keydown(event) {
            event.preventDefault();
            event.stopPropagation();

            if (!hover_checkbox.checked) {
                value_elem.value = (event.altKey == true ? 'Alt + ' : '') +
                    (event.ctrlKey == true ? 'Ctrl + ' : '') +
                    (event.shiftKey == true ? 'Shift + ' : '') +
                    (['Shift', 'Control', 'Alt'].indexOf(event.key) == -1 ? (event.key == ' ' ? 'Space' : event.key.toUpperCase()) : '');

                for (let i = 0, l = replace_text.length; i < l; i++)
                    value_elem.value = value_elem.value.replace(replace_text[i], getMessage(replace_text[i]));

                it_keys = {
                    altKey: event.altKey,
                    ctrlKey: event.ctrlKey,
                    key: event.key,
                    label: value_elem.value,
                    shiftKey: event.shiftKey
                };
            }

            return false;
        }

        window.addEventListener('mousewheel', mousewheel);
        document.body.addEventListener('keydown', keydown);

        button_allow.onclick = function() {
            saveSettings(key, JSON.stringify({
                altKey: it_keys.altKey,
                ctrlKey: it_keys.ctrlKey,
                key: it_keys.key,
                label: it_keys.label,
                shiftKey: it_keys.shiftKey,
                scroll: it_keys.scroll,
                hover: hover_checkbox.checked
            }));

            value_elem0.innerHTML = it_keys.label;

            window.removeEventListener('mousewheel', mousewheel);
            document.body.removeEventListener('keydown', keydown);

            closeDialog();
        };

        button_reset.onclick = function() {
            window.removeEventListener('mousewheel', mousewheel);
            document.body.removeEventListener('keydown', keydown);

            saveSettings(key, null);

            value_elem0.innerHTML = obj.default || 'None';

            closeDialog();
        };

        deny.onclick = function() {
            window.removeEventListener('mousewheel', mousewheel);
            document.body.removeEventListener('keydown', keydown);

            closeDialog();
        };

        document.querySelector('.dialog__backdrop').addEventListener('click', function() {
            window.removeEventListener('mousewheel', mousewheel);
            document.body.removeEventListener('keydown', keydown);
        });

        openDialog(container);
    });
}


/*--------------------------------------------------------------
10.0 Slider
--------------------------------------------------------------*/

function slider(elem, obj, key) {
    let label = document.createElement('span'),
        input_container = document.createElement('div'),
        input = document.createElement('input'),
        input_status = document.createElement('input'),
        value = 0;

    elem.classList.add('list__item_slider');
    elem.dataset.key = key;

    if (storage[key] == 'true' || obj[key].default == 'true' && storage[key] != 'false')
        elem.dataset.value = 'true';

    // label
    label.classList.add('list__item__label');
    label.getMessage(obj[key].label);
    elem.appendChild(label);

    if (storage.hasOwnProperty(key))
        value = storage[key];
    else
        value = obj[key].default;

    // status
    input_container.style.display = 'flex';
    input_container.style.justifyContent = 'space-between';
    input_container.style.alignItems = 'center';
    input_container.style.width = '100%';
    elem.appendChild(input_container);

    input_status.type = 'text';
    input_status.value = value;
    input_status.classList.add('list__item_slider__input-status');
    input_container.appendChild(input_status);

    input.type = 'range';
    input.min = obj[key].min || 0;
    input.max = obj[key].max || 1;
    input.step = obj[key].step || 1;
    input.value = value || 1;
    input.classList.add('list__item_slider__input');
    input_container.appendChild(input);

    input.oninput = function() {
        saveSettings(this.parentNode.parentNode.dataset.key, this.value);

        input_status.value = this.value;
    };

    input_status.oninput = function() {
        saveSettings(this.parentNode.parentNode.dataset.key, this.value);

        input.value = this.value;
    };
}


/*--------------------------------------------------------------
11.0 Custom
--------------------------------------------------------------*/

function custom(elem, obj, key) {
    let item = obj[key];

    if (item.hasOwnProperty('load'))
        item.load(elem);
}