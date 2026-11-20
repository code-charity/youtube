/*--------------------------------------------------------------
>>> ACTIVE FEATURES
--------------------------------------------------------------*/

(function () {
	const references = ['parentObject', 'parentSkeleton', 'parentElement', 'rendered', 'baseProvider', 'layersProvider'];
	const metadata = references.concat(['value', 'options', 'storage', 'attr', 'properties', 'style', 'data', 'variant', 'onchange']);
	const controls = ['switch', 'select', 'slider', 'shortcut', 'color-picker', 'time', 'radio'];

	function copy (value) {
		if (Array.isArray(value)) return value.map(copy);
		if (!value || typeof value !== 'object' || satus.isElement(value)) return value;
		const result = {};
		for (const key of Object.keys(value)) {
			if (!references.includes(key)) result[key] = copy(value[key]);
		}
		return result;
	}

	function evaluate (value) {
		return typeof value === 'function' ? value() : value;
	}

	function equal (value, fallback) {
		if (value === fallback) return true;
		if (typeof value === 'number' && typeof fallback === 'string' && fallback.trim()) return value === Number(fallback);
		if (typeof fallback === 'number' && typeof value === 'string' && value.trim()) return Number(value) === fallback;
		if (!value || !fallback || typeof value !== 'object' || typeof fallback !== 'object') return false;
		if (Array.isArray(value) !== Array.isArray(fallback)) return false;
		const keys = Object.keys(value);
		return keys.length === Object.keys(fallback).length && keys.every(key => Object.prototype.hasOwnProperty.call(fallback, key) && equal(value[key], fallback[key]));
	}

	function binding (value) {
		value = value || {};
		return {
			keys: Object.keys(value.keys && typeof value.keys === 'object' ? value.keys : {}).sort(),
			alt: !!value.alt,
			ctrl: !!value.ctrl,
			shift: !!value.shift,
			wheel: Number(value.wheel) || 0,
			click: !!value.click,
			middle: !!value.middle,
			context: !!value.context,
			toggle: !!value.toggle
		};
	}

	function features () {
		const result = [];
		function visit (node, key, path, category, section, radioDefaults = new Map(), wrappedRadio = false) {
			if (!node || typeof node !== 'object' || Array.isArray(node) || satus.isElement(node)) return;
			if (node.category) category = { path, text: evaluate(node.label?.text || node.text) };
			if (node.component === 'button') section = { path, text: evaluate(node.label?.text || node.text) };
			const radio = node.component === 'radio' ? node : node.component === 'label' ? node.radio : null;
			if (category && !wrappedRadio && node.storage !== false && (controls.includes(node.component) || radio)) {
				const storage = radio ? radio.group : evaluate(node.storage || key);
				if (typeof storage === 'string' && storage) {
					const options = copy(evaluate(node.options));
					let fallback = evaluate(node.value);
					if (radio) fallback = radioDefaults.get(radio.group);
					else if (!satus.isset(fallback)) {
						if (node.component === 'select') fallback = options?.[0]?.value;
						else if (node.component === 'slider') fallback = 0;
						else if (node.component === 'time') fallback = '00:00';
						else if (node.component === 'color-picker') fallback = [0, 0, 0];
						else if (node.component === 'shortcut') fallback = {};
						else fallback = false;
					}
					result.push({ id: path, key, node, category, section: section || category, storage, fallback, options, radio, value: satus.storage.get(storage) });
				}
			}

			const children = Object.entries(node).filter(([name]) => !metadata.includes(name)).map(([name, child]) => {
				// Only section factories produce controls; event handlers must never run during discovery.
				const dynamic = node.component === 'section' && typeof child === 'function';
				return { name, child: dynamic ? child() : child, dynamic };
			});
			const defaults = new Map(radioDefaults);
			for (const { child, dynamic } of children) {
				const option = child?.component === 'radio' ? child : child?.component === 'label' ? child.radio : null;
				// Theme factories mark the current selection checked, not a different default.
				if (option && (!defaults.has(option.group) || (!dynamic && option.checked))) defaults.set(option.group, option.value);
			}
			for (const { name, child } of children) visit(child, name, path + '/' + name, category, section, defaults, child === radio && child !== node);
		}
		visit(extension.skeleton, '', '', null, null);
		const force = result.find(feature => feature.storage === 'player_forced_playback_speed' && feature.value === true);
		const speed = result.find(feature => feature.storage === 'player_playback_speed' && feature.section.path === force?.section.path);
		if (force && speed) {
			// An enabled force-speed control needs its value even when that value is the default 1x.
			speed.companion = true;
			result.splice(result.indexOf(speed), 1);
			result.splice(result.indexOf(force) + 1, 0, speed);
		}
		return result;
	}

	function customized (feature) {
		if (!satus.isset(feature.value)) return false;
		if (feature.radio) return String(feature.value) === String(feature.radio.value) && String(feature.value) !== String(feature.fallback);
		if (feature.node.component === 'select') return String(feature.value) !== String(feature.fallback);
		if (feature.node.component === 'shortcut') {
			const value = binding(feature.value);
			return !!(value.keys.length || value.wheel || value.click || value.middle || value.context) && !equal(value, binding(feature.fallback));
		}
		return !equal(feature.value, feature.fallback);
	}

	function render (component) {
		const rows = new Map(), groups = new Map(), modals = new Map();
		let timer, empty, pressed, disposed = false;
		component.renderChildren = false;

		function schedule () {
			if (disposed || timer !== undefined) return;
			timer = setTimeout(function () { timer = undefined; refresh(); }, 0);
		}

		function editing (element) {
			if (pressed && element.contains(pressed) || element.contains(document.activeElement)) return true;
			for (const modal of document.querySelectorAll('.satus-modal')) {
				const owner = modal.parent || modal.skeleton?.parentElement;
				if (owner && (owner === element || element.contains(owner))) {
					if (!modals.has(modal)) {
						const closed = function () { modals.delete(modal); schedule(); };
						modals.set(modal, closed);
						modal.addEventListener('close', closed, { once: true });
					}
					return true;
				}
			}
			return false;
		}

		function update (element, feature) {
			const control = feature.radio && feature.node.component !== 'radio' ? element.querySelector('.satus-radio') : element;
			if (!control) return;
			const value = satus.isset(feature.value) ? feature.value : feature.fallback;
			// The storage listener updated the cache before this accessor, so this does not write it back.
			if (control.storage) control.storage.value = feature.value;
			if (feature.radio) control.nativeControl.checked = String(value) === String(feature.radio.value);
			else if (feature.node.component === 'switch') control.dataset.value = value;
			else if (feature.node.component === 'slider') {
				control.input.value = value;
				control.textInput.value = control.input.value;
				control.track.style.width = 100 / (control.input.max - control.input.min) * (control.input.value - control.input.min) + '%';
			} else if (feature.node.component === 'select' || feature.node.component === 'time') {
				control.value = value;
				control.render();
			} else if (feature.node.component === 'shortcut') {
				control.data = copy(value);
				control.render(control.valueElement);
			} else if (feature.node.component === 'color-picker') control.color.value = value;
		}

		function refresh () {
			if (disposed) return;
			if (!component.isConnected) { cleanup(); return; }
			const wanted = new Set(), positions = new Map();
			const visible = features().filter(function (feature) {
				const row = rows.get(feature.id);
				feature.busy = !!row && editing(row.element);
				if (!customized(feature) && !feature.busy && !feature.companion) return false;
				wanted.add(feature.id);
				return true;
			});
			// Remove obsolete siblings before positioning rows so a focused control never has to move past them.
			for (const [id, row] of rows) {
				if (!wanted.has(id)) { row.element.remove(); rows.delete(id); }
			}
			for (const [id, group] of groups) {
				if (!group.children.length) { group.remove(); groups.delete(id); }
			}
			let groupPosition = 0;
			for (const feature of visible) {
				let row = rows.get(feature.id);
				const busy = feature.busy;
				const groupKey = feature.section.path;
				if (!groups.has(groupKey)) {
					const title = satus.locale.get(feature.category.text) + (feature.category.path === feature.section.path ? '' : ' > ' + satus.locale.get(feature.section.text));
					groups.set(groupKey, satus.render({ component: 'section', variant: 'card', title }, component));
				}
				const group = groups.get(groupKey);
				if (!positions.has(groupKey)) {
					if (component.children[groupPosition] !== group && !editing(group)) component.insertBefore(group, component.children[groupPosition] || null);
					groupPosition++;
					positions.set(groupKey, 0);
				}
				if (row && !busy && (row.storage !== feature.storage || !equal(row.options, feature.options))) {
					row.element.remove();
					rows.delete(feature.id);
					row = null;
				}
				if (!row) {
					const skeleton = copy(feature.node);
					if (!feature.radio) {
						skeleton.storage = feature.storage;
						skeleton.value = copy(feature.fallback);
						if (feature.options) skeleton.options = copy(feature.options);
					} else (skeleton.radio || skeleton).defaultValue = feature.fallback;
					row = { element: satus.render(skeleton, group, feature.key), value: copy(feature.value), storage: feature.storage, options: copy(feature.options) };
					if (!row.element.isConnected) continue;
					rows.set(feature.id, row);
				} else if (!busy) {
					if (feature.radio) (row.element.skeleton.radio || row.element.skeleton).defaultValue = feature.fallback;
					else row.element.skeleton.value = copy(feature.fallback);
					if (!equal(row.value, feature.value)) {
						update(row.element, feature);
						row.value = copy(feature.value);
					}
				}
				const position = positions.get(groupKey);
				if (!busy && group.children[position] !== row.element) group.insertBefore(row.element, group.children[position] || null);
				positions.set(groupKey, position + 1);
			}
			for (const [id, group] of groups) {
				if (!group.children.length) { group.remove(); groups.delete(id); }
			}
			if (!rows.size && !empty) empty = satus.render({ component: 'section', variant: 'card', message: { component: 'span', text: 'empty' } }, component);
			else if (rows.size && empty) { empty.remove(); empty = null; }
		}

		const unsubscribe = satus.storage.onchanged(schedule);
		const observer = new MutationObserver(function () { if (!component.isConnected) cleanup(); });
		observer.observe(document.documentElement, { childList: true, subtree: true });
		function changedLayer () {
			if (satus.last(component.layersProvider.path) !== component.skeleton) cleanup();
		}
		function pressedRow (event) {
			for (const row of rows.values()) if (row.element.contains(event.target)) pressed = row.element;
		}
		function released () {
			if (!pressed) return;
			pressed = null;
			schedule();
		}
		function cleanup () {
			if (disposed) return;
			disposed = true;
			clearTimeout(timer);
			unsubscribe();
			observer.disconnect();
			component.layersProvider?.removeEventListener('open', changedLayer);
			component.removeEventListener('focusout', schedule);
			component.removeEventListener('pointerdown', pressedRow, true);
			window.removeEventListener('pointerup', released, true);
			window.removeEventListener('pointercancel', released, true);
			window.removeEventListener('blur', released);
			for (const [modal, closed] of modals) modal.removeEventListener('close', closed);
			modals.clear();
			// A detached view must also release the keyboard listeners owned by its shortcut editor.
			for (const modal of document.querySelectorAll('.satus-modal')) {
				const owner = modal.parent || modal.skeleton?.parentElement;
				if (owner && [...rows.values()].some(row => row.element === owner || row.element.contains(owner)) && !modal.classList.contains('satus-modal--closing')) {
					modal.close();
				}
			}
		}
		component.layersProvider?.addEventListener('open', changedLayer);
		component.addEventListener('focusout', schedule);
		component.addEventListener('pointerdown', pressedRow, true);
		window.addEventListener('pointerup', released, true);
		window.addEventListener('pointercancel', released, true);
		window.addEventListener('blur', released);
		refresh();
	}

	extension.skeleton.header.sectionEnd.menu.on.click.activeFeatures = {
		component: 'button',
		on: {
			click: {
				component: 'div',
				on: {
					render: function () {
						render(this);
					}
				}
			}
		},

		svg: {
			component: 'svg',
			attr: {
				'viewBox': '0 0 24 24',
				'fill': 'none',
				'stroke-width': '1.75'
			},

			path1: {
				component: 'path',
				attr: {
					'd': 'M22 11.08V12a10 10 0 11-5.93-9.14'
				}
			},
			path2: {
				component: 'path',
				attr: {
					'd': 'M22 4L12 14.01l-3-3'
				}
			}
		},
		label: {
			component: 'span',
			text: 'activeFeatures'
		}
	};
})();
