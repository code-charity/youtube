/*--------------------------------------------------------------
>>> IMPROVEDTUBE UI (WEBSITE MODE)
--------------------------------------------------------------*/

document.addEventListener('DOMContentLoaded', function () {
    var charset = document.createElement('meta'),
        viewport = document.createElement('meta'),
        title = document.createElement('title'),
        style = document.createElement('style');

    charset.setAttribute('charset', 'utf-8');
    viewport.setAttribute('name', 'viewport');
    viewport.setAttribute('content', 'width=device-width,initial-scale=1');

    title.textContent = 'ImprovedTube';
    style.textContent = 'body{width:100vw;height:100vh}';

    for (var i = document.head.childNodes.length - 1; i > -1; i--) {
        document.head.childNodes[i].remove();
    }

    document.head.appendChild(charset);
    document.head.appendChild(viewport);
    document.head.appendChild(title);
    document.head.appendChild(style);

    document.documentElement.setAttribute('page', true);

    for (var i = document.body.childNodes.length - 1; i > -1; i--) {
        document.body.childNodes[i].remove();
    }
});