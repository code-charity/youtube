const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadDubbingPolicy(context) {
	const source = fs.readFileSync(
		path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js'),
		'utf8'
	);
	const start = source.indexOf('ImprovedTube.getAudioTrackInfo = function (track) {');
	const end = source.indexOf('ImprovedTube.jumpToKeyScene = function () {', start);

	if (start < 0 || end < 0) {
		throw new Error('Dubbing policy source was not found');
	}

	vm.createContext(context);
	vm.runInContext(source.slice(start, end), context);
}

function audioTrack({id, languageCode, name, isAutoDubbed = false, isDefault = false}) {
	return {
		id,
		isAutoDubbed,
		getLanguageInfo() {
			return {id, languageCode, name, isDefault};
		}
	};
}

function createContext(tracks) {
	let selectedTrack = tracks[0];
	let setAudioTrackCalls = 0;
	const player = {
		getAudioTrack: () => selectedTrack,
		getAvailableAudioTracks: () => tracks,
		querySelector: () => null,
		setAudioTrack: track => {
			setAudioTrackCalls++;
			selectedTrack = track;
		}
	};
	const context = {
		Array,
		console,
		clearInterval: () => {},
		clearTimeout: () => {},
		document: {querySelector: () => null, querySelectorAll: () => []},
		ImprovedTube: {
			elements: {player},
			storage: {
				disable_auto_dubbing: true,
				player_default_dubbed_language: 'ru',
				preferred_dubbing_language: ''
			}
		},
		location: {href: 'https://www.youtube.com/watch?v=test-video'},
		MutationObserver: class {
			constructor(callback) {
				this.callback = callback;
			}

			disconnect() {
				this.disconnected = true;
			}

			observe(target, options) {
				this.target = target;
				this.options = options;
			}
		},
		setInterval: () => 1,
		setTimeout: callback => {
			callback();
			return 1;
		},
		Set,
		String,
		window: {
			cancelAnimationFrame: () => {},
			requestAnimationFrame: callback => {
				callback();
				return 1;
			}
		}
	};

	loadDubbingPolicy(context);
	return {context, player, selectedTrack: () => selectedTrack, setAudioTrackCalls: () => setAudioTrackCalls};
}

describe('dubbing policy', () => {
	test('does not observe the auto-dub menu during initialization unless enabled', () => {
		const functionsSource = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/functions.js'),
			'utf8'
		);

		expect(functionsSource).toContain(
			'if (ImprovedTube.storage.hide_auto_dubbed_options === true) { ImprovedTube.observeAutoDubbedMenu(); }'
		);
		expect(functionsSource).not.toMatch(/^\s*ImprovedTube\.observeAutoDubbedMenu\(\);\s*$/m);
	});

	test('selects a human preferred-language dub and never its auto-dub counterpart', () => {
		const original = audioTrack({id: 'en', languageCode: 'en', name: 'English', isDefault: true});
		const humanRussian = audioTrack({id: 'ru.1', languageCode: 'ru', name: 'Russian'});
		const autoRussian = audioTrack({id: 'ru.2', languageCode: 'ru', name: 'Russian', isAutoDubbed: true});
		const {context, player, selectedTrack, setAudioTrackCalls} = createContext([original, humanRussian, autoRussian]);
		context.ImprovedTube.autoDubbedTrackLabels = {
			url: context.location.href,
			values: new Set(['russian']),
			manualValues: new Set(['russian'])
		};

		context.ImprovedTube.selectPermittedAudioTrack(player);
		context.ImprovedTube.selectPermittedAudioTrack(player);

		expect(selectedTrack()).toBe(humanRussian);
		expect(setAudioTrackCalls()).toBe(1);
		expect(context.ImprovedTube.audioTrackIsAutoDubbed(autoRussian)).toBe(true);
		expect(context.ImprovedTube.audioTrackIsAutoDubbed(humanRussian)).toBe(false);
	});

	test('does not pollingly switch tracks when the player cannot report the current track', () => {
		const original = audioTrack({id: 'en', languageCode: 'en', name: 'English', isDefault: true});
		const autoRussian = audioTrack({id: 'ru.2', languageCode: 'ru', name: 'Russian', isAutoDubbed: true});
		const {context, player, setAudioTrackCalls} = createContext([original, autoRussian]);

		delete player.getAudioTrack;
		expect(context.ImprovedTube.stopAutoDubbingGuard).toBeUndefined();
		expect(context.ImprovedTube.enforceAutoDubbingPolicy).toBeUndefined();
		context.ImprovedTube.disableAutoDubbing();
		expect(typeof context.ImprovedTube.stopAutoDubbingGuard).toBe('function');
		expect(typeof context.ImprovedTube.enforceAutoDubbingPolicy).toBe('function');
		context.ImprovedTube.autoDubbingGuard.enforce();
		context.ImprovedTube.autoDubbingGuard.enforce();

		expect(setAudioTrackCalls()).toBe(1);
		expect(context.ImprovedTube.autoDubbingGuard.interval).toBeNull();
	});

	test('stops the lazily defined guard when auto dubbing protection is disabled', () => {
		const original = audioTrack({id: 'en', languageCode: 'en', name: 'English', isDefault: true});
		const autoRussian = audioTrack({id: 'ru.2', languageCode: 'ru', name: 'Russian', isAutoDubbed: true});
		const {context, player} = createContext([autoRussian, original]);
		const listeners = {};
		const removedListeners = [];
		const video = {
			addEventListener: (type, listener) => {
				listeners[type] = listener;
			},
			removeEventListener: (type, listener) => {
				removedListeners.push([type, listener]);
			}
		};
		let clearedInterval;
		player.querySelector = () => video;
		context.clearInterval = interval => {
			clearedInterval = interval;
		};

		context.ImprovedTube.disableAutoDubbing();
		const guard = context.ImprovedTube.autoDubbingGuard;
		expect(listeners.loadedmetadata).toBe(guard.forceSelection);
		expect(listeners.playing).toBe(guard.enforce);
		context.ImprovedTube.storage.disable_auto_dubbing = false;
		context.ImprovedTube.stopAutoDubbingGuard();

		expect(clearedInterval).toBe(1);
		expect(removedListeners).toEqual([
			['loadedmetadata', guard.forceSelection],
			['playing', guard.enforce]
		]);
		expect(context.ImprovedTube.autoDubbingGuard).toBeNull();
	});

	test('keeps shared preferred-language selection available while the feature is disabled', () => {
		const original = audioTrack({id: 'en', languageCode: 'en', name: 'English', isDefault: true});
		const humanRussian = audioTrack({id: 'ru.1', languageCode: 'ru', name: 'Russian'});
		const {context, selectedTrack} = createContext([original, humanRussian]);
		context.ImprovedTube.storage.disable_auto_dubbing = false;
		context.ImprovedTube.storage.preferred_dubbing_language = 'ru';

		context.ImprovedTube.preferredDubbingLanguage();

		expect(selectedTrack()).toBe(humanRussian);
		expect(context.ImprovedTube.stopAutoDubbingGuard).toBeUndefined();
		expect(context.ImprovedTube.enforceAutoDubbingPolicy).toBeUndefined();
	});

	test('falls back to the original track when the preferred language exists only as auto-dub', () => {
		const original = audioTrack({id: 'en', languageCode: 'en', name: 'English', isDefault: true});
		const autoRussian = audioTrack({id: 'ru.2', languageCode: 'ru', name: 'Russian', isAutoDubbed: true});
		const {context, player, selectedTrack} = createContext([original, autoRussian]);

		context.ImprovedTube.selectPermittedAudioTrack(player);

		expect(selectedTrack()).toBe(original);
	});

	test('hides only the auto-dub menu section and keeps human dubs visible', () => {
		const {context} = createContext([]);
		const createStyle = () => {
			const values = {};
			const priorities = {};
			return {
				display: '',
				getPropertyPriority: property => priorities[property] || '',
				getPropertyValue: property => values[property] || '',
				removeProperty(property) {
					delete values[property];
					delete priorities[property];
					if (property === 'display') this.display = '';
					if (property === 'width') this.width = '';
				},
				setProperty(property, value, priority = '') {
					values[property] = value;
					priorities[property] = priority;
					if (property === 'display') this.display = value;
					if (property === 'width') this.width = value;
				}
			};
		};
		const menuItem = (textContent, isSectionHeader = false) => ({
			classList: {contains: value => isSectionHeader && value === 'ytp-menuitem-section-header'},
			dataset: {},
			style: createStyle(),
			textContent
		});
		const humanHeader = menuItem('Available audio tracks', true);
		const humanRussian = menuItem('Russian');
		const autoHeader = menuItem('Автоматическое дублирование', true);
		const autoRussian = menuItem('Russian');
		const items = [humanHeader, humanRussian, autoHeader, autoRussian];
		const popup = {
			getBoundingClientRect: () => ({bottom: 180, height: 180, left: 0, right: 220, top: 0, width: 220})
		};
		const panel = {
			closest: selector => selector === '.ytp-settings-menu' ? popup : null,
			dataset: {},
			getBoundingClientRect: () => ({bottom: 180, height: 180, left: 0, right: 220, top: 0, width: 220}),
			offsetWidth: 220,
			querySelectorAll: () => items,
			style: createStyle()
		};

		context.document.querySelectorAll = selector => selector === '.ytp-settings-menu .ytp-panel-menu' ? [panel] : [];
		context.ImprovedTube.storage.hide_auto_dubbed_options = true;
		context.ImprovedTube.hideAutoDubbedMenuItems();

		expect(context.ImprovedTube.isAutoDubbedMenuHeader(autoHeader)).toBe(true);
		expect(context.ImprovedTube.isAutoDubbedMenuHeader(humanHeader)).toBe(false);
		expect(humanHeader.style.display).toBe('');
		expect(humanRussian.style.display).toBe('');
		expect(autoHeader.style.display).toBe('none');
		expect(autoRussian.style.display).toBe('none');
		expect(autoHeader.style.getPropertyPriority('display')).toBe('important');
		expect(autoRussian.style.getPropertyPriority('display')).toBe('important');
		expect(context.ImprovedTube.autoDubbedTrackLabels.manualValues.has('russian')).toBe(true);
		expect(context.ImprovedTube.autoDubbedTrackLabels.values.has('russian')).toBe(true);
		// Never put fit-content on the inner menu: its footer can make the panel
		// wider than YouTube's normal audio-track menu.
		expect(panel.style.width).toBe(undefined);

		context.ImprovedTube.storage.hide_auto_dubbed_options = false;
		context.ImprovedTube.hideAutoDubbedMenuItems();
		expect(panel.style.width).toBe(undefined);
	});

	test('watches menu layout classes and styles for late first-open changes', () => {
		const {context} = createContext([]);
		const playerContainer = {};
		let hideCalls = 0;
		context.document.querySelector = selector => selector === '#movie_player' ? playerContainer : null;
		context.ImprovedTube.storage.hide_auto_dubbed_options = true;
		context.ImprovedTube.hideAutoDubbedMenuItems = () => {
			hideCalls++;
		};

		context.ImprovedTube.observeAutoDubbedMenu();
		const observer = context.ImprovedTube.autoDubbedMenuObserver;

		expect(observer.target).toBe(playerContainer);
		expect(observer.options).toEqual({
			attributeFilter: ['class', 'style'],
			attributes: true,
			childList: true,
			subtree: true
		});
		expect(hideCalls).toBe(1);

		observer.callback([{
			type: 'attributes',
			target: {classList: {contains: value => value === 'ytp-panel'}}
		}]);
		expect(hideCalls).toBe(2);

		observer.callback([{
			type: 'attributes',
			target: {classList: {contains: value => value === 'ytp-progress-bar'}}
		}]);
		expect(hideCalls).toBe(2);

		const reattachedPanel = {
			itAutoDubbedMenuLeaving: true,
			matches: selector => selector === '.ytp-panel-menu',
			nodeType: 1,
			querySelectorAll: () => []
		};
		observer.callback([{
			addedNodes: [reattachedPanel],
			removedNodes: [],
			type: 'childList'
		}]);
		expect(reattachedPanel.itAutoDubbedMenuLeaving).toBeUndefined();
		expect(hideCalls).toBe(3);

		const reparentedPanel = {
			itAutoDubbedMenuLeaving: true,
			matches: selector => selector === '.ytp-panel-menu',
			nodeType: 1,
			querySelectorAll: () => []
		};
		observer.callback([{
			addedNodes: [reparentedPanel],
			removedNodes: [reparentedPanel],
			type: 'childList'
		}]);
		expect(reparentedPanel.itAutoDubbedMenuLeaving).toBe(true);
		expect(hideCalls).toBe(4);
	});

	test('selects the active audio panel instead of the first settings panel', () => {
		const {context} = createContext([]);
		const menuItem = (textContent, isSectionHeader = false) => ({
			classList: {contains: value => isSectionHeader && value === 'ytp-menuitem-section-header'},
			textContent
		});
		const rootPanel = {
			querySelectorAll: () => [menuItem('Quality')]
		};
		const popup = {
			getBoundingClientRect: () => ({bottom: 200, height: 200, left: 0, right: 300, top: 0, width: 300})
		};
		let rootRect = {bottom: 200, height: 200, left: 0, right: 300, top: 0, width: 300};
		const rootLayoutPanel = {
			closest: selector => selector === '.ytp-settings-menu' ? popup : null,
			getBoundingClientRect: () => rootRect
		};
		rootPanel.closest = selector => {
			if (selector === '.ytp-panel') return rootLayoutPanel;
			if (selector === '.ytp-settings-menu') return popup;
			return null;
		};
		let audioRect = {bottom: 200, height: 200, left: 260, right: 560, top: 0, width: 300};
		let audioPanelIsOutgoing = false;
		const audioLayoutPanel = {
			classList: {contains: value => audioPanelIsOutgoing && value === 'ytp-panel-animate-back'},
			closest: selector => selector === '.ytp-settings-menu' ? popup : null,
			getBoundingClientRect: () => audioRect
		};
		const audioPanel = {
			closest: selector => {
				if (selector === '.ytp-panel') return audioLayoutPanel;
				if (selector === '.ytp-settings-menu') return popup;
				return null;
			},
			// The stale inner table can still overlap the popup; visibility must be
			// decided from the transformed outer panel instead.
			getBoundingClientRect: () => ({bottom: 400, height: 400, left: 0, right: 300, top: 0, width: 300}),
			querySelectorAll: () => [menuItem('Автоматическое дублирование', true), menuItem('Russian')]
		};
		context.document.querySelectorAll = () => [audioPanel, rootPanel];

		// The stale audio panel can still intersect the popup while the root panel
		// is already fully visible. Only the most visible panel may own the layout.
		expect(context.ImprovedTube.getAutoDubbedAudioMenuPanel()).toBeNull();
		rootRect = {bottom: 200, height: 200, left: -300, right: 0, top: 0, width: 300};
		audioRect = {bottom: 200, height: 200, left: 0, right: 300, top: 0, width: 300};
		expect(context.ImprovedTube.getAutoDubbedAudioMenuPanel()).toBe(audioPanel);
		audioPanel.itAutoDubbedMenuLeaving = true;
		expect(context.ImprovedTube.getAutoDubbedAudioMenuPanel()).toBeNull();
		delete audioPanel.itAutoDubbedMenuLeaving;
		audioPanelIsOutgoing = true;
		expect(context.ImprovedTube.getAutoDubbedAudioMenuPanel()).toBeNull();
	});

	test('releases the shared popup before YouTube handles audio-menu back navigation', () => {
		const {context} = createContext([]);
		const createStyle = () => {
			const values = {height: '190px'};
			const priorities = {height: 'important'};
			return {
				getPropertyPriority: property => priorities[property] || '',
				getPropertyValue: property => values[property] || '',
				removeProperty(property) {
					delete values[property];
					delete priorities[property];
				},
				setProperty(property, value, priority = '') {
					values[property] = value;
					priorities[property] = priority;
				}
			};
		};
		const savedLayout = JSON.stringify({height: {priority: '', value: '352px'}});
		const appliedLayout = JSON.stringify({height: {priority: 'important', value: '176px'}});
		const popup = {
			dataset: {
				itAutoDubbedMenuAppliedLayout: appliedLayout,
				itAutoDubbedMenuLayout: savedLayout
			},
			style: createStyle()
		};
		const menuPanel = {
			closest: selector => selector === '.ytp-settings-menu' ? popup : null,
			dataset: {
				itAutoDubbedMenuAppliedLayout: appliedLayout,
				itAutoDubbedMenuLayout: savedLayout
			},
			style: createStyle()
		};
		const panel = {
			closest: selector => selector === '.ytp-panel' ? menuPanel : null,
			dataset: {},
			itAutoDubbedMenuLayoutElements: [menuPanel, popup],
			style: createStyle()
		};
		const backControl = {closest: selector => selector === '.ytp-panel' ? menuPanel : null};
		context.ImprovedTube.autoDubbedMenuPanel = panel;
		context.ImprovedTube.cancelAutoDubbedMenuLayoutRefresh = () => {};

		context.ImprovedTube.restoreAutoDubbedMenuBeforeBack({
			target: {closest: () => backControl}
		});

		expect(menuPanel.style.getPropertyValue('height')).toBe('352px');
		expect(menuPanel.style.getPropertyPriority('height')).toBe('');
		expect(popup.style.getPropertyValue('height')).toBe('352px');
		expect(popup.style.getPropertyPriority('height')).toBe('');
		expect(panel.itAutoDubbedMenuLayoutElements).toBeUndefined();
		expect(panel.itAutoDubbedMenuLeaving).toBe(true);
		expect(context.ImprovedTube.autoDubbedMenuPanel).toBeNull();
	});

	test('releases the audio layout when focus moves to another settings panel', () => {
		const {context} = createContext([]);
		const audioLayoutPanel = {querySelector: () => null};
		const rootLayoutPanel = {querySelector: () => null};
		const panel = {closest: selector => selector === '.ytp-panel' ? audioLayoutPanel : null};
		let releasedPanel;
		context.ImprovedTube.autoDubbedMenuPanel = panel;
		context.ImprovedTube.releaseAutoDubbedMenuLayout = released => {
			releasedPanel = released;
		};

		context.ImprovedTube.restoreAutoDubbedMenuBeforePanelFocus({
			target: {closest: selector => selector === '.ytp-panel' ? rootLayoutPanel : null}
		});
		expect(releasedPanel).toBe(panel);

		const reusedMenu = {itAutoDubbedMenuLeaving: true};
		const reusedAudioLayoutPanel = {
			querySelector: selector => selector === '.ytp-panel-menu' ? reusedMenu : null
		};
		context.ImprovedTube.autoDubbedMenuPanel = null;
		context.ImprovedTube.restoreAutoDubbedMenuBeforePanelFocus({
			target: {closest: selector => selector === '.ytp-panel' ? reusedAudioLayoutPanel : null}
		});
		expect(reusedMenu.itAutoDubbedMenuLeaving).toBeUndefined();
	});

	test('uses the native size of a filtered panel copy instead of the first-open size', () => {
		const {context} = createContext([]);
		const createStyle = () => {
			const values = {};
			const priorities = {};
			return {
				getPropertyPriority: property => priorities[property] || '',
				getPropertyValue: property => values[property] || '',
				removeProperty(property) {
					delete values[property];
					delete priorities[property];
				},
				setProperty(property, value, priority = '') {
					values[property] = value;
					priorities[property] = priority;
				}
			};
		};

		const menuPanelStyle = createStyle();
		let menuPanelScrollTop = 120;
		let menuPanelIsOutgoing = false;
		const menuPanel = {
			addEventListener(type, listener, capture) {
				this.backListener = {capture, listener, type};
			},
			classList: {contains: value => menuPanelIsOutgoing && value === 'ytp-panel-animate-back'},
			dataset: {},
			getBoundingClientRect: () => ({bottom: 176, height: 176, left: 0, right: 228, top: 0, width: 228}),
			style: menuPanelStyle
		};
		Object.defineProperty(menuPanel, 'scrollTop', {
			get() {
				return menuPanelScrollTop;
			},
			set(value) {
				// Model overflow: clip: it is not a scroll container, so the stale
				// offset must be cleared before clip is applied.
				if (menuPanelStyle.getPropertyValue('overflow') !== 'clip') menuPanelScrollTop = value;
			}
		});
		const probeMenu = {style: createStyle()};
		const probePanel = {
			clientHeight: 176,
			scrollHeight: 176,
			style: createStyle(),
			getBoundingClientRect: () => ({height: 161, width: 213})
		};
		const probe = {
			dataset: {},
			style: createStyle(),
			matches: () => false,
			getBoundingClientRect: () => ({height: 176, width: 228}),
			querySelector: selector => selector === '.ytp-panel' ? probePanel : probeMenu,
			querySelectorAll: () => [],
			remove() {
				this.removed = true;
			}
		};
		const popup = {
			addEventListener(type, listener, capture) {
				this.focusListener = {capture, listener, type};
			},
			dataset: {},
			getBoundingClientRect: () => ({bottom: 176, height: 176, left: 0, right: 228, top: 0, width: 228}),
			scrollTop: 60,
			style: createStyle(),
			cloneNode: () => probe
		};
		const player = {
			appendChild: node => {
				player.appended = node;
			}
		};
		const panel = {
			dataset: {},
			scrollTop: 240,
			style: createStyle(),
			querySelector: selector => selector === '[data-it-auto-dubbed-hidden="true"]' ? {} : null,
			querySelectorAll: selector => selector === '.ytp-menuitem' ? [{
				classList: {contains: value => value === 'ytp-menuitem-section-header'},
				textContent: 'Automatic dubbing'
			}] : [],
			closest: selector => {
				if (selector === '.ytp-panel') return menuPanel;
				if (selector === '.html5-video-player, #movie_player') return player;
				return null;
			}
		};
		menuPanel.closest = selector => ['.ytp-popup', '.ytp-settings-menu'].includes(selector) ? popup : null;
		context.document.querySelectorAll = () => [panel];
		panel.style.setProperty('height', '352px');
		panel.style.setProperty('min-height', '352px');
		panel.style.setProperty('max-height', '352px');
		panel.style.setProperty('overflow', 'auto');
		panel.style.setProperty('overflow-x', 'auto');
		panel.style.setProperty('overflow-y', 'auto');

		context.ImprovedTube.applyFilteredAudioMenuLayout(panel);

		expect(player.appended).toBe(probe);
		expect(menuPanel.backListener).toEqual({
			capture: true,
			listener: context.ImprovedTube.restoreAutoDubbedMenuBeforeBack,
			type: 'click'
		});
		expect(popup.focusListener).toEqual({
			capture: true,
			listener: context.ImprovedTube.restoreAutoDubbedMenuBeforePanelFocus,
			type: 'focusin'
		});
		expect(probe.removed).toBe(true);
		expect(probe.style.getPropertyValue('right')).toBe('auto');
		expect(menuPanel.style.getPropertyValue('width')).toBe('228px');
		expect(menuPanel.style.getPropertyValue('min-width')).toBe('228px');
		expect(menuPanel.style.getPropertyValue('max-width')).toBe('228px');
		expect(menuPanel.style.getPropertyValue('height')).toBe('176px');
		expect(menuPanel.style.getPropertyValue('min-height')).toBe('176px');
		expect(menuPanel.style.getPropertyValue('max-height')).toBe('176px');
		expect(menuPanel.style.getPropertyPriority('width')).toBe('important');
		expect(menuPanel.style.getPropertyPriority('height')).toBe('important');
		expect(popup.style.getPropertyValue('width')).toBe('228px');
		expect(popup.style.getPropertyValue('min-width')).toBe('228px');
		expect(popup.style.getPropertyValue('max-width')).toBe('228px');
		expect(popup.style.getPropertyValue('height')).toBe('176px');
		expect(popup.style.getPropertyValue('min-height')).toBe('176px');
		expect(popup.style.getPropertyValue('max-height')).toBe('176px');
		expect(menuPanel.style.getPropertyValue('overflow')).toBe('clip');
		expect(menuPanel.style.getPropertyValue('overflow-x')).toBe('clip');
		expect(menuPanel.style.getPropertyValue('overflow-y')).toBe('clip');
		expect(menuPanel.style.getPropertyPriority('overflow-y')).toBe('important');
		expect(menuPanel.scrollTop).toBe(0);
		expect(panel.style.getPropertyValue('height')).toBe('auto');
		expect(panel.style.getPropertyValue('min-height')).toBe('0px');
		expect(panel.style.getPropertyValue('max-height')).toBe('none');
		expect(panel.style.getPropertyValue('overflow')).toBe('visible');
		expect(panel.style.getPropertyValue('overflow-y')).toBe('visible');

		const delayedCallbacks = [];
		context.setTimeout = callback => {
			delayedCallbacks.push(callback);
			return delayedCallbacks.length;
		};
		context.clearTimeout = () => {};
		context.ImprovedTube.storage.hide_auto_dubbed_options = true;
		context.ImprovedTube.autoDubbedMenuPanel = panel;
		context.ImprovedTube.refreshAutoDubbedMenuLayout(panel);
		expect(panel.scrollTop).toBe(0);
		expect(menuPanel.scrollTop).toBe(0);
		expect(popup.scrollTop).toBe(0);

		// YouTube can overwrite the first size and restore the obsolete scroll
		// offset after our first animation frame.
		menuPanel.style.setProperty('height', '352px');
		popup.style.setProperty('height', '352px');
		panel.scrollTop = 240;
		menuPanel.scrollTop = 120;
		popup.scrollTop = 60;
		delayedCallbacks.forEach(callback => callback());
		expect(menuPanel.style.getPropertyValue('height')).toBe('176px');
		expect(popup.style.getPropertyValue('height')).toBe('176px');
		expect(panel.scrollTop).toBe(0);
		expect(menuPanel.scrollTop).toBe(0);
		expect(popup.scrollTop).toBe(0);

		// When navigating back, keep dimensions that YouTube has already replaced
		// for the root settings menu while removing our remaining constraints.
		menuPanel.style.setProperty('width', '340px');
		menuPanel.style.setProperty('height', '244px');
		popup.style.setProperty('width', '340px');
		popup.style.setProperty('height', '244px');
		const connectedPanelClosest = panel.closest;
		const connectedMenuPanelClosest = menuPanel.closest;
		panel.closest = () => null;
		menuPanel.closest = () => null;
		context.ImprovedTube.restoreAutoDubbedMenuLayout(panel);
		expect(menuPanel.style.getPropertyValue('width')).toBe('340px');
		expect(menuPanel.style.getPropertyValue('min-width')).toBe('');
		expect(menuPanel.style.getPropertyValue('max-width')).toBe('');
		expect(menuPanel.style.getPropertyValue('height')).toBe('244px');
		expect(popup.style.getPropertyValue('width')).toBe('340px');
		expect(popup.style.getPropertyValue('min-width')).toBe('');
		expect(popup.style.getPropertyValue('max-width')).toBe('');
		expect(popup.style.getPropertyValue('height')).toBe('244px');
		expect(menuPanel.style.getPropertyValue('overflow')).toBe('');
		expect(menuPanel.style.getPropertyValue('overflow-x')).toBe('');
		expect(menuPanel.style.getPropertyValue('overflow-y')).toBe('');
		expect(panel.style.getPropertyValue('height')).toBe('352px');
		expect(panel.style.getPropertyValue('min-height')).toBe('352px');
		expect(panel.style.getPropertyValue('max-height')).toBe('352px');
		expect(panel.style.getPropertyValue('overflow')).toBe('auto');
		expect(panel.style.getPropertyValue('overflow-x')).toBe('auto');
		expect(panel.style.getPropertyValue('overflow-y')).toBe('auto');
		expect(panel.itAutoDubbedMenuLayoutElements).toBeUndefined();

		// Keep native scrolling when the remaining human-made track list is
		// genuinely taller than the available panel viewport.
		panel.closest = connectedPanelClosest;
		menuPanel.closest = connectedMenuPanelClosest;
		probePanel.scrollHeight = 320;
		context.ImprovedTube.applyFilteredAudioMenuLayout(panel);
		expect(menuPanel.style.getPropertyValue('overflow')).toBe('');
		expect(menuPanel.style.getPropertyValue('overflow-y')).toBe('');

		// A queued correction must not reclaim the shared popup once YouTube has
		// started animating the audio submenu out.
		menuPanelIsOutgoing = true;
		delayedCallbacks[0]();
		expect(menuPanel.style.getPropertyValue('width')).toBe('340px');
		expect(menuPanel.style.getPropertyValue('min-width')).toBe('');
		expect(popup.style.getPropertyValue('width')).toBe('340px');
		expect(popup.style.getPropertyValue('min-width')).toBe('');
	});
});
