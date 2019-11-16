/*-----------------------------------------------------------------------------
>>> FUNCTIONS
-------------------------------------------------------------------------------
1.0 
-----------------------------------------------------------------------------*/

function injectScript(string) {
    var script = document.createElement('script');

    script.textContent = string;

    document.documentElement.appendChild(script);

    script.remove();
}

ImprovedTube.isset = function(variable) {
    if (typeof variable === 'undefined' || variable === null) {
        return false;
    }

    return true;
};

ImprovedTube.getCookieValueByName = function(name) {
    var match = document.cookie.match(new RegExp('([; ]' + name + '|^' + name + ')([^\\s;]*)', 'g'));

    if (match) {
        var cookie = match[0];

        return cookie.replace(name + '=', '').replace(' ', '');
    } else
        return '';
};

ImprovedTube.getParam = function(query, name) {
    var params = query.split('&'),
        param = false;

    for (var i = 0; i < params.length; i++) {
        params[i] = params[i].split('=');

        if (params[i][0] == name) {
            param = params[i][1];
        }
    }

    if (param) {
        return param;
    } else {
        return false;
    }
};

ImprovedTube.getParams = function(query) {
    var params = query.split('&'),
        result = {};

    for (var i = 0, l = params.length; i < l; i++) {
        params[i] = params[i].split('=');

        result[params[i][0]] = params[i][1];
    }

    return result;
};

ImprovedTube.setCookie = function(name, value) {
    var date = new Date();

    date.setTime(date.getTime() + 3.154e+10);

    document.cookie = name + '=' + value + '; path=/; domain=.youtube.com; expires=' + date.toGMTString();
};

ImprovedTube.pageType = function() {
    var href = location.href,
        type = '';

    if (location.pathname == '/') {
        type = 'home';
    } else if (/\/watch\?/.test(href)) {
        type = 'video';
    } else if (/\/channel|user\//.test(href)) {
        type = 'channel';
    }

    document.documentElement.setAttribute('it-page-type', type);
};


chrome.runtime.sendMessage({
    enabled: true
});