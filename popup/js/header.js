/*--------------------------------------------------------------
>>> HEADER:
----------------------------------------------------------------
1.0 "Back" Button
2.0 "Search" Button
3.0 "Clear search" Button
--------------------------------------------------------------*/
/*--------------------------------------------------------------
1.0 "Back" Button
--------------------------------------------------------------*/
document.querySelector('.header__button_back').onclick = function() {
  let old_path = document.querySelector('body').getAttribute('data-path').match(/[a-zA-Z_ .]+/g),
    new_path = '';

  for (let i = 0; i < old_path.length - 1; i++)
    new_path += '/' + old_path[i];

  if (new_path == '')
    new_path = '/';

  if (document.querySelector('body').getAttribute('data-path') == '/search')
    new_path = search_fix;

  document.querySelector('body').setAttribute('data-path', new_path);

  createListByPath();

  document.querySelector('#header__input-search').value = '';

  let path = document.body.getAttribute('data-path'),
    path_array = path.match(/[a-zA-Z_ .]+/g),
    new_menu = menu;

  if (path == '/')
    document.querySelector('.header__title').innerHTML = 'ImprovedTube';
  else {
    for (let i = 0; i < path_array.length; i++)
      if (new_menu[path_array[i]])
        new_menu = new_menu[path_array[i]];

    document.querySelector('.header__title').getMessage(searchByKey(new_menu, path_array[path_array.length - 1]).label, true);
  }
};


/*--------------------------------------------------------------
2.0 "Search" Button
--------------------------------------------------------------*/

var search_fix = '';

document.querySelector('#header__button-search').onclick = function() {
  search_fix = document.querySelector('body').getAttribute('data-path');
  document.querySelector('body').setAttribute('data-path', '/search');

  if (document.querySelector('.main__container').firstChild)
    document.querySelector('.main__container').firstChild.remove();

  document.querySelector('#header__input-search').focus();
};

document.querySelector('#header__input-search').addEventListener('keydown', function() {
  setTimeout(function() {
    createList(
      search(menu, document.querySelector('#header__input-search').value)
    ), 50;
  });
});


/*--------------------------------------------------------------
3.0 "Clear search" Button
--------------------------------------------------------------*/

document.querySelector('#header__button-search-clear').addEventListener('click', function() {
  document.querySelector('#header__input-search').value = '';

  setTimeout(function() {
    createList(
      search(menu, document.querySelector('#header__input-search').value)
    ), 50;
  });
});


/*--------------------------------------------------------------
4.0 "Menu" Button
--------------------------------------------------------------*/

document.querySelector('#header__button-menu')
  .addEventListener('click', function() {
    let dialog_surface = openDialog(0, {
      right: window.innerWidth - document.querySelector('#header__button-menu')
        .offsetLeft - 48 + 'px',
      left: 'auto',
      width: '170px',
      top: document.querySelector('#header__button-menu')
        .offsetTop + 'px',
      transform: 'none'
    });

    createList(header_menu, {
      parent: dialog_surface
    });
  });
