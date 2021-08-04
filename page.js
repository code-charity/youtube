document.addEventListener('DOMContentLoaded', function() {
    for (var i = document.head.childNodes.length - 1; i > -1; i--) {
        document.head.childNodes[i].remove();
    }

    for (var i = document.body.childNodes.length - 1; i > -1; i--) {
        document.body.childNodes[i].remove();
    }
});