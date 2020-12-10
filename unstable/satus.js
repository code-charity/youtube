
/*---------------------------------------------------------------
>>> CORE
-----------------------------------------------------------------
# SATUS
# COMPONENTS
# CAMELIZE
# RENDER 
---------------------------------------------------------------*/

/*---------------------------------------------------------------
# SATUS
---------------------------------------------------------------*/

var satus = {};


/*---------------------------------------------------------------
# COMPONENTS
---------------------------------------------------------------*/

satus.components = {};


/*---------------------------------------------------------------
# CAMELIZE
---------------------------------------------------------------*/

satus.camelize = function(string) {
    return string.replace(/-[a-z]/g, function(match) {
        return match[1].toUpperCase();
    });
};


/*---------------------------------------------------------------
# RENDER
---------------------------------------------------------------*/

satus.render = function(element, container) {
    if (element.type) {
        var type = this.camelize(element.type),
            component;

        if (satus.components[type]) {
            component = satus.components[type](element);
        } else {
            component = document.createElement(type);
        }

        if (container) {
            container.appendChild(component);
        }

        return component;
    } else {
        for (var key in element) {
            this.render(element[key], container);
        }
    }
};