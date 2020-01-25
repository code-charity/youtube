/*-----------------------------------------------------------------------------
>>> «SEARCH» MODULE
-----------------------------------------------------------------------------*/

Satus.search = function(query, object, callback) {
	var _search = {
		interval: false,
		queue: [],
		results: {},
		query: query,
		object: object,
		callback: callback,
		action: function(object) {
			for (var key in object) {
				if (typeof object[key] === 'object') {
					if (key.indexOf(_search.query) !== -1) {
						_search.results[key] = object[key];

						_search.callback(_search.results);
					}

					_search.queue.push(object[key]);
				} else {
					if (key.indexOf(_search.query) !== -1) {
						_search.results[key] = object;

						_search.callback(_search.results);
					}
				}
			}
		},
		clear: function() {
			if (_search.interval !== false) {
				clearInterval(_search.interval);

				_search.interval = false;
				_search.queue = [];
				_search.results = {};
			}
		},
		search: function() {
			if (_search.interval !== false) {
				clearInterval(_search.interval);

				_search.interval = false;
				_search.queue = [];
				_search.results = {};
			}

			_search.action(_search.object);

			_search.interval = setInterval(function() {
				if (_search.queue.length > 0) {
					_search.action(_search.queue[0]);
					_search.queue.shift();
				} else {
					clearInterval(_search.interval);
				}
			});
		}
	};

	_search.search();

	return _search;
};
