/*--------------------------------------------------------------
>>> NIGHT MODE:
----------------------------------------------------------------
# Filters
	# Bluelight
	# Dim
# Schedule
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# FILTERS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# BLUELIGHT
--------------------------------------------------------------*/

extension.features.bluelight = function () {
	var value = extension.storage.get('bluelight');

	if (extension.features.schedule() === false) {
		return false;
	}

	if (!value) {
		value = 0;
	}

	if (typeof value !== 'number') {
		value = Number(value);
	}

	if (value !== 0) {
		if (!this.bluelight.bluelight || !this.bluelight.feColorMatrix) {
			var div = this.bluelight.bluelight || document.createElement('div'),
				svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
				filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter'),
				feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix'),
				matrix = feColorMatrix.values.baseVal;

			div.id = 'it-bluelight';

			svg.setAttributeNS(null, 'viewBox', '0 0 1 1');
			svg.setAttributeNS(null, 'version', '1.1');
			filter.setAttributeNS(null, 'id', 'it-bluelight-filter');
			feColorMatrix.setAttributeNS(null, 'type', 'matrix');

			for (var i = 0; i < 20; i++) {
				var number = svg.createSVGNumber();

				number.value = 0;

				matrix.appendItem(number);
			}

			matrix[0].value = 1;
			matrix[6].value = 1;
			matrix[12].value = 1 - parseFloat(value) / 100;
			matrix[18].value = 1;

			filter.appendChild(feColorMatrix);
			svg.appendChild(filter);
			div.appendChild(svg);
			document.documentElement.appendChild(div);

			this.bluelight.feColorMatrix = feColorMatrix;
			this.bluelight.bluelight = div;
		} else {
			this.bluelight.feColorMatrix.values.baseVal[12].value = 1 - parseFloat(value) / 100;
		}
	} else if (this.bluelight.bluelight) {
		this.bluelight.bluelight.remove();

		delete this.bluelight.bluelight;
		delete this.bluelight.feColorMatrix;
	}
};

/*--------------------------------------------------------------
# DIM
--------------------------------------------------------------*/

extension.features.dim = function () {
	var value = extension.storage.get('dim');
	if (extension.features.schedule() === false) { return false;}

	if (!value) { value = 0;}
	if (typeof value !== 'number') {value = Number(value);}
	if (value !== 0) {
		if (!this.dim.element) {
			var element = document.createElement('div');

			element.id = 'it-dim';
			element.style.opacity = parseInt(Number(value)) / 100 || 0;

			document.documentElement.appendChild(element);

			this.dim.element = element;
		} else {
			this.dim.element.style.opacity = parseInt(Number(value)) / 100 || 0;
		}
	} else if (this.dim.element) {
		this.dim.element.remove();

		delete this.dim.element;
	}
};

/*--------------------------------------------------------------
# SCHEDULE
--------------------------------------------------------------*/

extension.features.schedule = function () {
	var current = new Date().getHours(),
		from = Number((extension.storage.get('schedule_time_from') || '00:00').substr(0, 2)),
		to = Number((extension.storage.get('schedule_time_to') || '00:00').substr(0, 2));

	if (to < from && current > from && current < 24) {
		to += 24;
	} else if (to < from && current < to) {
		from = 0;
	}

	if (extension.storage.get('schedule') !== 'sunset_to_sunrise' || current >= from && current < to) {
		return true;
	}

	return false;
};