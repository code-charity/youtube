/*--------------------------------------------------------------
>>> PLAYLIST HEALTH
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.playlist.on.click.section_health = {
	component: 'section',
	variant: 'card',
	title: 'playlistHealth',

	playlist_health: {
		component: 'switch',
		text: 'playlistHealthButton',
		tags: 'duplicate,broken,unavailable,deleted,private,decay,cleanup,playlist'
	}
};
