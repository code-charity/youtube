/*--------------------------------------------------------------
>>> COMMENTS TOOLS
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.appearance.on.click.comments_tools = {
	component: 'button',
	variant: 'comments',
	text: 'commentsTools',
	tags: 'comments,search,filter,sort,newest,replies,expand',
	on: {
		click: {
			component: 'section',
			variant: 'card',

			comments_search: {
				component: 'switch',
				text: 'searchLoadedComments'
			},

			comments_sort_newest: {
				component: 'switch',
				text: 'sortCommentsNewest'
			},

			comments_expand_all: {
				component: 'switch',
				text: 'expandAllComments'
			}
		}
	}
};
