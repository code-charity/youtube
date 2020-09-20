Menu.main = {
    type: 'main',
    appearanceKey: 'home',
    onchange: function() {
        document.querySelector('.satus-text--title').innerText = satus.locale.getMessage(this.history[this.history.length - 1].label) || 'ImprovedTube';
    },

    section: {
        type: 'section'
    },

    footer: {
        type: 'button',
        class: 'satus-button--ad',
        label: 'DARK MODE',
        title: 'Dark Mode',
        onclick: function() {
            window.open('https://chrome.google.com/webstore/detail/dark-mode/declgfomkjdohhjbcfemjklfebflhefl', '_blank');
        }
    }
};
