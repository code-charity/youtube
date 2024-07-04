/*--------------------------------------------------------------
>>> PLAYLIST
--------------------------------------------------------------*/

extension.skeleton.header.sectionEnd.search.on.click = {
	component: 'text-field',
	variant: 'search',
	focus: true,
	storage: false,
	prepend: true,
	placeholder: 'search',
	lineNumbers: false,
	rows: 1,
	search: false,
	searchPosition: 0,
	on: {
		render: function () {
			this.focus();
			if (this.skeleton.search) {
				this.value = this.skeleton.search;
				this.dispatchEvent(new CustomEvent('input'));
			}
		},
		blur: function () {
			if (this.value.length === 0) {
				let search_results = document.querySelector('.search-results');

				if (search_results) {
					search_results.close();
				}

				this.remove();
			}
		},
		input: function (event) {
			let self = this,
				value = this.value.trim();

			this.skeleton.search = value;

			if (value.length > 0) {
				satus.search(value, extension.skeleton, function (results) {
					let search_results = document.querySelector('.search-results'),
						skeleton = {
							component: 'modal',
							class: 'search-results'
						};

					for (let key in results) {
						let result = results[key],
							parent = result,
							category,
							subcategory,
							text;

						while (parent.parentObject && !parent.parentObject.category) {

							parent = parent.parentObject;
						}

						if (parent.parentObject && parent.parentObject.label && parent.parentObject.label.text) {
							category = parent.parentObject.label.text;
						}

						parent = result;

						while (parent.parentObject && parent.parentObject.component !== 'button') {
							parent = parent.parentObject;
						}

						parent = parent.parentObject;

						if (parent) {
							if (parent.label) {
								subcategory = parent.label.text;
							} else {
								subcategory = parent.text;
							}

							if (category === subcategory) {
								text = satus.locale.get(category);
							} else {
								text = satus.locale.get(category) + ' > ' + satus.locale.get(subcategory);
							}

							skeleton[category + subcategory + '_label'] = {
								component: 'span',
								class: 'satus-section--label',
								text: text
							};

							if (!skeleton[category + subcategory]) {
								skeleton[category + subcategory] = {
									component: 'section',
									variant: 'card'
								};
							}

							skeleton[category + subcategory][key] = result;
						} else {
							skeleton[category + '_label'] = {
								component: 'span',
								class: 'satus-section--label',
								text: category
							};

							if (!skeleton[category]) {
								skeleton[category] = {
									component: 'section',
									variant: 'card'
								};
							}

							skeleton[category][key] = result;
						}
					}

					if (Object.keys(results).length === 0) {
						if (search_results) {
							search_results.remove();

							self.removeAttribute('results');
						}
					} else {
						if (search_results) {
							let surface = document.querySelector('.search-results .satus-modal__surface');

							satus.empty(surface);

							satus.render(skeleton, surface, undefined, true);
						} else {
							self.setAttribute('results', '');

							search_results = satus.render(skeleton, self.baseProvider);

							// we need global listener here
							function hidesearch (event) {
								// make sure to clean it after closing search results
								if (!document.body.contains(search_results)) {
									document.removeEventListener('click', hidesearch);
								}
								// hide search results when clicking on result that is a 'button' inside search results
								if (search_results.contains(event.target) && event.target.className.includes('satus-button')
									// dont close on modal popups
									&& !(event.target.skeleton?.on?.click?.component == "modal")
									// shortcut are also modal popups
									&& !(event.target.skeleton?.component == "shortcut")) {
									search_results.close();
									self.skeleton.close.rendered.click();
								} else if (event.target.closest('.satus-modal.satus-modal--vertical-menu') && event.target.closest('.satus-button')) {
									// hide search results when clicking on vertical-menu button
									search_results.close();
									self.skeleton.close.rendered.click();
								}
							}

							document.addEventListener('click', hidesearch);

							if (self.skeleton.searchPosition) {
								search_results.childNodes[1].scrollTop = self.skeleton.searchPosition;
							}

							document.querySelector('.search-results .satus-modal__scrim').addEventListener('click', function () {
								// this is someone clicking outside of Search results window
								let search_results = document.querySelector('.search-results');

								if (search_results) {
									self.skeleton.searchPosition = search_results.childNodes[1].scrollTop;
									search_results.close();
								}

								self.skeleton.close.rendered.click()
							});
						}
					}
				});
			} else {
				let search_results = document.querySelector('.search-results');

				if (search_results) {
					search_results.close();

					self.removeAttribute('results');
				}
			}
		}
	},

	close: {
		component: 'button',
		variant: 'icon',
		on: {
			click: function () {
				let search_results = document.querySelector('.search-results');

				if (search_results) {
					this.parentNode.skeleton.searchPosition = search_results.childNodes[1].scrollTop;
					search_results.close();
				}

				this.parentNode.remove();
			}
		},

		svg: {
			component: 'svg',
			attr: {
				'viewBox': '0 0 24 24',
				'stroke-width': '1.75',
				'stroke': 'none',
				'fill': 'currentColor'
			},

			path: {
				component: 'path',
				attr: {
					'd': 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
				}
			}
		}
	}
};
