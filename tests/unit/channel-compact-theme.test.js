const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(
	path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/channel.js'),
	'utf8'
);

const start = source.indexOf('var compact = compact || {}');
const fnStart = source.indexOf('ImprovedTube.channelCompactTheme = function', start);
const nextAssignment = source.indexOf('\nImprovedTube.', fnStart + 1);
const end = nextAssignment < 0 ? source.length : nextAssignment;

if (start < 0 || fnStart < 0) {
	throw new Error('channelCompactTheme source was not found');
}

const compactThemeSource = source.slice(start, end);

/* A channel guide is made of `ytd-guide-section-renderer` children of
   `#sections`; section i is reached as nth-child(i + 2). */
function createGuide (sectionCount, options = {}) {
	const missingHeading = options.missingHeading || [];
	const sections = [];

	for (let i = 0; i < sectionCount; i++) {
		const items = { style: { display: '' } };
		const heading = missingHeading.includes(i) ? null : {
			listeners: [],
			addEventListener (type, handler) { this.listeners.push(handler); },
			removeEventListener (type, handler) {
				const index = this.listeners.indexOf(handler);
				if (index > -1) { this.listeners.splice(index, 1); }
			},
			click () { this.listeners.slice().forEach((handler) => handler()); }
		};
		sections.push({ heading, items });
	}

	const head = {
		appended: [],
		appendChild (style) { style.parentNode = head; head.appended.push(style); },
		removeChild (style) {
			style.parentNode = null;
			const index = head.appended.indexOf(style);
			if (index > -1) { head.appended.splice(index, 1); }
		}
	};

	const document = {
		head,
		createElement: () => ({
			children: [],
			appendNode (node) { this.children.push(node); }
		}),
		createTextNode: (text) => ({ text }),
		querySelector (selector) {
			if (selector === '#sections #items') {
				return sectionCount ? { found: true } : null;
			}
			const match = selector.match(/nth-child\((\d+)\)/);
			if (!match) { return null; }
			const section = sections[Number(match[1]) - 2];
			if (!section) { return null; }
			return selector.includes('> h3') ? section.heading : section.items;
		}
	};

	return { sections, head, document };
}

function boot (sectionCount, options = {}) {
	const guide = createGuide(sectionCount, options);
	const ImprovedTube = { storage: { channel_compact_theme: true } };
	const store = Object.assign({}, options.localStorage);

	const context = {
		ImprovedTube,
		console: { log () {} },
		document: guide.document,
		localStorage: {
			getItem: (key) => Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
			setItem: (key, value) => { store[key] = String(value); }
		},
		setInterval: () => 1,
		clearInterval: () => {}
	};

	vm.createContext(context);
	vm.runInContext(compactThemeSource, context);

	return { ImprovedTube, guide, store, context };
}

function handlerCounts (sections) {
	return sections.map((section) => section.heading ? section.heading.listeners.length : 0);
}

describe('Channel "Compact theme" on guides that do not have three sections', () => {
	test('does not throw when the channel guide has two sections', () => {
		const { ImprovedTube } = boot(2);

		expect(() => ImprovedTube.channelCompactTheme()).not.toThrow();
	});

	test('does not throw when the channel guide has a single section', () => {
		const { ImprovedTube } = boot(1);

		expect(() => ImprovedTube.channelCompactTheme()).not.toThrow();
	});

	test('does not throw when a guide section has no heading', () => {
		const { ImprovedTube } = boot(3, { missingHeading: [1] });

		expect(() => ImprovedTube.channelCompactTheme()).not.toThrow();
	});

	test('still attaches a click handler to every section that was found', () => {
		const { ImprovedTube, guide } = boot(2);
		ImprovedTube.channelCompactTheme();

		expect(handlerCounts(guide.sections)).toEqual([1, 1]);
	});

	test('attaches handlers to the headed sections only when one has no heading', () => {
		const { ImprovedTube, guide } = boot(3, { missingHeading: [1] });
		ImprovedTube.channelCompactTheme();

		expect(handlerCounts(guide.sections)).toEqual([1, 0, 1]);
	});

	test('a click on a section toggles that section alone and stores it under its own key', () => {
		const { ImprovedTube, guide, store } = boot(3, { localStorage: { 'ImprovedTube-compact-1': 'true' } });
		ImprovedTube.channelCompactTheme();

		expect(guide.sections.map((section) => section.items.style.display)).toEqual(['', 'none', '']);

		guide.sections[0].heading.click();

		expect(guide.sections.map((section) => section.items.style.display)).toEqual(['none', 'none', '']);
		expect(store['ImprovedTube-compact-0']).toBe('true');
		expect(store['ImprovedTube-compact-1']).toBe('true');
		expect(store['ImprovedTube-compact-2']).toBeUndefined();
	});

	test('turning the feature off does not throw when a section was never found', () => {
		const { ImprovedTube } = boot(3, { missingHeading: [2] });
		ImprovedTube.channelCompactTheme();

		ImprovedTube.storage.channel_compact_theme = false;

		expect(() => ImprovedTube.channelCompactTheme()).not.toThrow();
	});

	test('removing the listeners leaves the sections that exist visible again', () => {
		const { ImprovedTube, guide } = boot(2);
		ImprovedTube.channelCompactTheme();

		guide.sections[1].heading.click();
		expect(guide.sections[1].items.style.display).toBe('none');

		ImprovedTube.storage.channel_compact_theme = false;
		ImprovedTube.channelCompactTheme();

		expect(guide.sections.map((section) => section.items.style.display)).toEqual(['', '']);
		expect(handlerCounts(guide.sections)).toEqual([0, 0]);
	});
});
