/*--------------------------------------------------------------
>>> INVIDIOUS / PIPED
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.general.on.click.invidious_section = {
	component: 'section',
	variant: 'card',
	title: 'invidious',

	invidious_instance: {
		component: 'select',
		text: 'invidiousInstance',
		tags: 'privacy,frontend,alternative,piped,invidious,redirect',
		options: [{
			text: 'disabled',
			value: 'off'
		}, {
			text: 'Invidious — yewtu.be',
			value: 'yewtu.be'
		}, {
			text: 'Invidious — inv.nadeko.net',
			value: 'inv.nadeko.net'
		}, {
			text: 'Invidious — invidious.nerdvpn.de',
			value: 'invidious.nerdvpn.de'
		}, {
			text: 'Invidious — inv.tux.pizza',
			value: 'inv.tux.pizza'
		}, {
			text: 'Piped — piped.video',
			value: 'piped.video'
		}]
	},

	invidious_auto_redirect: {
		component: 'switch',
		text: 'automaticRedirect'
	}
};
