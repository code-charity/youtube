/*--------------------------------------------------------------
>>> PARAMS:
----------------------------------------------------------------
1.0 Get param
2.0 Get URL params
--------------------------------------------------------------*/


/*--------------------------------------------------------------
1.0 Get param
--------------------------------------------------------------*/

function getParam(query, name) {
  let params = query.split('&'),
    param = false;

  for (let i = 0; i < params.length; i++) {
    params[i] = params[i].split('=');

    if (params[i][0] == name)
      param = params[i][1];
  }

  if (param)
    return param;
  else
    return false;
}


/*--------------------------------------------------------------
2.0 Get URL params
--------------------------------------------------------------*/

function getUrlParams() {
  let params_arr = location.search.substr(1).split('&'),
    params_obj = {};

  for (let i = 0, l = params_arr.length; i < l; i++) {
    let param = params_arr[i],
      name = param.search('=') != -1 ? param.substr(0, param.search('=')) : param,
      value = param.search('=') != -1 ? param.substr(param.search('=') + 1) : null;

    if (param != '')
      params_obj[name] = value;
  }

  return params_obj;
}
