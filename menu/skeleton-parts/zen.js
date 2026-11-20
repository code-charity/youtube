/*--------------------------------------------------------------
>>> ZEN MODE
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.appearance.on.click.zen = {
	component: 'button',
	variant: 'zen',
	text: 'zenMode',
	tags: 'focus,dim,distraction,study,presentation,clean,minimal,hide',
	on: {
		click: {
			component: 'section',
			variant: 'card',

			zen_mode: {
				component: 'select',
				text: 'zenMode',
				options: [{
					text: 'disabled',
					value: 'off'
				}, {
					text: 'dimEverythingElse',
					value: 'dim'
				}, {
					text: 'hideEverythingElse',
					value: 'hide'
				}]
			}
		}
	}
};
