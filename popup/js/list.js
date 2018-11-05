/*--------------------------------------------------------------
>>> LIST:
----------------------------------------------------------------
1.0 Create List
2.0 Create List by Path
3.0 Create List Item
--------------------------------------------------------------*/


/*--------------------------------------------------------------
1.0 Create List
--------------------------------------------------------------*/

function createList(obj = menu, options = { parent: document.querySelector('.main__container') }) {
  var parent = options.parent,
      list = document.createElement('ul');

  list.classList.add('list');
  list.classList.add('list_fade-in');

  if (!document.documentElement.hasAttribute('improvedtube-page') && document.body.getAttribute('data-path') == '/' && parent == document.querySelector('.main__container'))
    list.classList.add('list_type_home');
  else if (document.body.getAttribute('data-path') == '/appearance' && parent == document.querySelector('.main__container'))
    list.classList.add('list_type_appearance');

  for (let key in obj)
    if (key != 'type' && key != 'disabled' && key != 'label' && key != 'label_description' && key != 'icon' && key != 'visibility' && obj[key].visibility != 'false')
      createListItem(list, obj, key);

  if (parent.firstChild && parent == document.querySelector('.main__container'))
    parent.firstChild.classList.add('list_fade-out');

  setTimeout(function () {
    while (parent.firstChild && parent == document.querySelector('.main__container'))
      parent.firstChild.remove();

    if (document.documentElement.hasAttribute('improvedtube-page') && document.body.getAttribute('data-path') == '/' && parent == document.querySelector('.main__container')) {
      let section = document.createElement('ul'),
          section_item = document.createElement('li');

      section.classList.add('list');

      section_item.classList.add('list__item');
      section_item.classList.add('list__item_section');

      section_item.appendChild(list);
      section.appendChild(section_item);

      parent.appendChild(section);
    } else {
      parent.appendChild(list);
    }

    setTimeout(function () {
      list.classList.remove('list_fade-in');
      let h = document.querySelector('body > .main').offsetHeight * (document.querySelector('body > .main').offsetHeight / document.querySelector('body > .main').scrollHeight);
      document.querySelector('.scrollbar').style.height = h + 'px';
      if (document.querySelector('body > .main').scrollHeight > document.querySelector('body > .main').offsetHeight)
        document.querySelector('.scrollbar').style.display = 'block';
      else
        document.querySelector('.scrollbar').style.display = 'none';
    }, 100);
  }, 100);
}

document.querySelector('.main').addEventListener('scroll', function (event) {
  document.querySelector('.scrollbar').style.top = (this.scrollTop / document.querySelector('.main__container').offsetHeight * 100) * ((window.innerHeight - document.querySelector('.header').offsetHeight) / 100) + 56 + 'px';
});

/*--------------------------------------------------------------
2.0 Create List by path
--------------------------------------------------------------*/

function createListByPath() {
  let path = document.body.getAttribute('data-path'),
      path_array = path.match(/[a-zA-Z_ .]+/g),
      new_menu = menu;

  closeDialog();

  if (path == '/')
    createList(menu);
  else {
    for (let i = 0; i < path_array.length; i++)
      if (new_menu[path_array[i]])
        new_menu = new_menu[path_array[i]];

    createList(searchByKey(new_menu, path_array[path_array.length - 1]));
  }
}


/*--------------------------------------------------------------
3.0 Create List Item
--------------------------------------------------------------*/

function createListItem(list, obj, key) {
  let item = document.createElement('li'),
      type = obj[key].type;

  item.className = 'list__item';

  if (obj[key].hasOwnProperty('icon')) {
    let icon = document.createElement('div');

    icon.classList.add('list__item__icon');

    icon.innerHTML = obj[key]['icon'].svg;

    for (let key_icon in obj[key]['icon'].style)
      icon.style[key_icon] = obj[key]['icon'].style[key_icon];

    item.appendChild(icon);
  }

  if (type == 'select') {
    if (storage.classic_improvedtube != 'true')
      select(item, obj, key);
    else
      classicList(item, obj, key);
  }
  else if (type == 'toggle') {
    if (storage.classic_improvedtube != 'true')
      toggle(item, obj, key);
    else
      classicList(item, obj, key, true);
  }
  else if (type == 'button')
    button(item, obj, key);
  else if (type == 'time')
    time(item, obj, key);
  else if (type == 'text')
    text(item, obj, key);
  else if (type == 'section')
    section(item, obj, key);
  else
    folder(item, obj, key);

  list.appendChild(item);
}
