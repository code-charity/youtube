/*--------------------------------------------------------------
>>> SEARCH:
----------------------------------------------------------------
1.0 Search
2.0 Search by key
--------------------------------------------------------------*/


/*--------------------------------------------------------------
1.0 Search
--------------------------------------------------------------*/

function search(obj, query) {
  var list = {};

  query = query.split(' ');

  for (let i = 0, l = query.length; i < l; i++)
    if (['general', 'appearance', 'themes', 'player', 'playlist', 'channel', 'shortcuts', 'settings'].indexOf(query[i]) != -1)
      if (typeof obj[query[i]] == 'object')
        return obj[query[i]];

  function get(obj, query) {
    for (let key in obj) {
      let item = obj[key],
        label = (item.label || '').toLowerCase();

      for (let i = 0, l = query.length; i < l; i++) {
        /*console.log(
          label_key.indexOf(query[i]) != -1 ||
          query[i].indexOf(key.toLowerCase()) != -1 ||
          label.indexOf(query[i]) != -1
        );*/

        //console.log(label);

        if (item.type && item.type != 'section') {
          if (new RegExp(query[i]).test(label))
            list[key] = item;
        } else if (typeof item == 'object') {
          get(item, query);
        }
      }
    }
  }

  get(obj, query);

  let section_obj = {
      section: {
        type: 'section'
      }
    },
    check = 0;

  for (let i in list) {
    check++;
    section_obj['section'][i] = list[i];
  }

  if (check == 0)
    section_obj = {};

  return section_obj;
}


/*--------------------------------------------------------------
2.0 Search by key
--------------------------------------------------------------*/

function searchByKey(obj, query) {
  var list = {};

  function get(obj, query) {
    for (let key in obj) {
      if (key.search(query) != -1)
        list[key] = obj[key];
      else if (typeof obj[key] == 'object')
        get(obj[key], query);
    }
  }

  get(obj, query);

  return list[query] || obj;
}
