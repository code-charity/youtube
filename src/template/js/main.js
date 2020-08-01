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
    },
    
    footer: {
        type: 'section',
        class: 'satus-section--footer',
        
        found_a_bug: {
            type: 'button',
            class: 'satus-button--found-a-bug',
            label: 'found a bug?',
            title: '/ImprovedTube/ImprovedTube',
            onclick: function(){
                window.open('https://github.com/ImprovedTube/ImprovedTube/issues/new', '_blank');
            }
        },
        email: {
            type: 'button',
            label: 'Email',
            title: 'bugs@improvedtube.com',
            onclick: function(){
                window.open('mailto:bugs@improvedtube.com', '_blank');
            }
        },
        github: {
            type: 'button',
            label: 'GitHub',
            title: '/ImprovedTube/ImprovedTube',
            onclick: function(){
                window.open('https://github.com/ImprovedTube/ImprovedTube/', '_blank');
            }
        },
        website: {
            type: 'button',
            label: 'Website',
            title: 'improvedtube.com',
            onclick: function(){
                window.open('http://www.improvedtube.com/', '_blank');
            }
        }
    }
};
