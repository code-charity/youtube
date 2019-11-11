if (location.pathname === '/improvedtube') {
    document.documentElement.setAttribute('improvedtube-page', '');
    document.documentElement.style.setProperty('display', 'none', 'important');

    document.addEventListener('DOMContentLoaded', function() {
        document.documentElement.innerHTML = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ImprovedTube</title><link href="https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap&subset=cyrillic" rel="stylesheet"></head><body><div class="satus"></div></body></html>';

        document.documentElement.style.setProperty('display', '');
    });
}