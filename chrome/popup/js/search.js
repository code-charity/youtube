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

  function get(obj, query) {
    for (let key in obj) {
      if (obj[key].type && obj[key].type != 'section') {
        if (key.search(query) != -1) {
          list[key] = obj[key];
        }
      } else if (typeof obj[key] == 'object')
        get(obj[key], query);
    }
  }

  get(obj, query);

  return list;
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
