const featureDom = require('../helpers/feature-dom.cjs');
const file = 'js&css/web-accessible/www.youtube.com/features/comments-tools.js';
const thread = (text, extra = '') => '<ytd-comment-thread-renderer>' + text + extra + '</ytd-comment-thread-renderer>';
let app;
afterEach(() => app?.close());

function load(settings) {
	app = featureDom(file, settings, '', window => {
		Object.defineProperty(window.HTMLElement.prototype, 'offsetParent', { get() { return this.closest('[hidden]') ? null : this.parentElement; } });
	});
	app.init();
}

test('late comments and pagination are filtered without observing the search bar output', async () => {
	load({ comments_search: true });
	app.document.body.innerHTML = '<ytd-comments><ytd-comments-header-renderer></ytd-comments-header-renderer>' + thread('Keep') + thread('Other') + '</ytd-comments>';
	await app.advance(300);
	const input = app.document.querySelector('#it-comments-search-bar input');
	input.value = 'keep';
	app.emit(input, 'input');
	await app.advance(200);
	app.document.querySelector('ytd-comments').insertAdjacentHTML('beforeend', thread('New other'));
	await app.advance(300);
	expect(app.document.querySelector('#it-comments-search-bar').textContent).toContain('1 / 3');
	expect([...app.document.querySelectorAll('ytd-comment-thread-renderer')].filter(item => item.style.display === 'none')).toHaveLength(2);
	await app.advance(2000);
	expect(app.timers.size).toBe(0);
	app.emit(input, 'input');
	app.storage('comments_search', false);
	await app.advance(500);
	expect(app.document.querySelector('#it-comments-search-bar')).toBeNull();
	expect([...app.document.querySelectorAll('ytd-comment-thread-renderer')].every(item => item.style.display === '')).toBe(true);
	expect(app.errors).toEqual([]);
});

test('newest sorting waits for its own menu and never clicks an unrelated menu', async () => {
	load({ comments_sort_newest: true });
	app.document.body.innerHTML = '<tp-yt-paper-item id="unrelated">Newest</tp-yt-paper-item><ytd-comments-header-renderer><div id="sort-menu"><button>Sort</button></div></ytd-comments-header-renderer>';
	const unrelated = jest.fn();
	app.document.querySelector('#unrelated').addEventListener('click', unrelated);
	let openings = 0;
	app.document.querySelector('#sort-menu button').addEventListener('click', () => { openings++; });
	await app.advance(400);
	const menu = app.document.querySelector('#sort-menu');
	menu.insertAdjacentHTML('beforeend', '<tp-yt-paper-item>Top comments</tp-yt-paper-item><tp-yt-paper-item id="newest">Newest first</tp-yt-paper-item>');
	const sorted = jest.fn();
	app.document.querySelector('#newest').addEventListener('click', sorted);
	await app.advance(2000);
	expect(openings).toBe(1);
	expect(sorted).toHaveBeenCalledTimes(1);
	expect(unrelated).not.toHaveBeenCalled();
	expect(app.errors).toEqual([]);
});

test('disable or navigation cancels pending sorting and paced reply expansion', async () => {
	load({ comments_sort_newest: true, comments_expand_all: true });
	app.document.body.innerHTML = '<ytd-comments><ytd-comments-header-renderer><div id="sort-menu"><button>Sort</button><tp-yt-paper-item>Newest first</tp-yt-paper-item></div></ytd-comments-header-renderer>' + thread('One', '<div id="more-replies"><button>2 replies</button></div>') + '</ytd-comments>';
	const clicked = jest.fn();
	app.document.querySelector('#more-replies button').addEventListener('click', clicked);
	app.document.querySelector('tp-yt-paper-item').addEventListener('click', clicked);
	await app.advance(100);
	app.storage('comments_sort_newest', false);
	app.storage('comments_expand_all', false);
	await app.advance(1500);
	expect(clicked).not.toHaveBeenCalled();
	app.storage('comments_expand_all', true);
	app.navigate('/watch?v=bbbbbbbbbbb');
	app.document.querySelector('ytd-comments').remove();
	await app.advance(1500);
	expect(clicked).not.toHaveBeenCalled();
	expect(app.errors).toEqual([]);
});

test('new reply controls are expanded once and unrelated mutations cannot toggle them closed', async () => {
	load({ comments_expand_all: true });
	app.document.body.innerHTML = '<ytd-comments>' + thread('One', '<div id="more-replies"><button>2 replies</button></div>') + '</ytd-comments>';
	const clicked = jest.fn();
	app.document.querySelector('#more-replies button').addEventListener('click', clicked);
	await app.advance(1200);
	app.document.querySelector('ytd-comments').appendChild(app.document.createElement('div'));
	await app.advance(1200);
	expect(clicked).toHaveBeenCalledTimes(1);
	expect(app.timers.size).toBe(0);
	expect(app.sent).toHaveLength(0);
	expect(app.errors).toEqual([]);
});

test('a replaced comments header can initialize sorting again on the same video', async () => {
	load({ comments_sort_newest: true });
	const header = '<ytd-comments-header-renderer><div id="sort-menu"><button>Sort</button><tp-yt-paper-item>Newest first</tp-yt-paper-item></div></ytd-comments-header-renderer>';
	app.document.body.innerHTML = '<ytd-comments>' + header + '</ytd-comments>';
	const first = jest.fn();
	app.document.querySelector('tp-yt-paper-item').addEventListener('click', first);
	await app.advance(500);
	expect(first).toHaveBeenCalledTimes(1);
	app.document.querySelector('ytd-comments').innerHTML = header;
	const second = jest.fn();
	app.document.querySelector('tp-yt-paper-item').addEventListener('click', second);
	await app.advance(500);
	expect(second).toHaveBeenCalledTimes(1);
	expect(app.errors).toEqual([]);
});
