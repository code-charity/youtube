Menu.main = {
    type: 'main',
    appearanceId: 'home',
    on: {
        change: function(container) {
            var item = this.history[this.history.length - 1],
                id = item.appearanceId;

            document.body.dataset.appearance = id;
            container.dataset.appearance = id;

            document.querySelector('.satus-text--title').innerText = Satus.locale.getMessage(item.label) || 'ImprovedTube';
        }
    },

    section: {
        type: 'section'
    }
};