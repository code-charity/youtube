Satus.components.textarea = function(object, key) {
    let component = object.rows === 1 ? document.createElement('input') : document.createElement('textarea');

    return component;
};