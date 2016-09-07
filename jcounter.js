//jCounter v1.0
//license: MIT 1016, przemekkukulski

jCounter = function() {};

(function() {

	var globalSettings = {
		start: 0,
		end: 100,
		updatesPerSec: 18,
		duration: 2500,

		animation: 'linear',
		animationPower: 2,

		digitsOnRight: 0,
		digitsOnLeft: 0,
		leftFiller: '0',

		decimalSeparator: '.',
		groupSeparator: '&nbsp;',
		groupWidth: 3,
		separateFillers: true,
		showPlus: false,

		onStart: undefined,
		onEnd: undefined,

		initializeOnly: false
	};


	var animations = [];
	animations['linear'] = function(x) { return x; };
  	animations['ease-in'] = function(x, power) { return Math.pow(x, power) };
	animations['ease-out'] = function(x, power) { return 1 - Math.pow(1 - x, power) };
	animations['ease-in-out'] = function(x, power) { return x < 0.5 ? Math.pow(x * 2, power) / 2 : (2 - Math.pow(2 - x * 2, power)) / 2 };


	function updateCounter(counter) {
		var currentNumber = counter.settings.start + counter.settings.animation(counter.stepCounter / counter.steps, counter.settings.animationPower) * (counter.settings.end - counter.settings.start) + 0;

		var numAsStr = (currentNumber > 0 && counter.settings.showPlus ? '+' : '') + (currentNumber.toFixed(counter.settings.digitsOnRight));
		
		var integerPartLength = numAsStr.length - (counter.settings.digitsOnRight > 0 ? counter.settings.digitsOnRight + 1 : 0);
		
		if (counter.settings.leftFiller) {
			var digitsToFill = counter.settings.digitsOnLeft - integerPartLength;

			while (digitsToFill > 0) {
				numAsStr = 'f' + numAsStr;
				integerPartLength++;
				digitsToFill--;
			}
		}

		var html = '';
		var power = 0;

		for (var i = integerPartLength - 1; i >= 0; i--) {

			var char = numAsStr.charAt(i);

			if (char == '+' || char == '-') {
				html = '<span class="jc-s' + (char == '+' ? 'p' : 'm') + '">' + char + '</span>' + html;
				continue;
			}

			if (counter.settings.groupSeparator && power % counter.settings.groupWidth == 0 && power != 0) {
				if (char !== 'f' || counter.settings.separateFillers) {
					html = '<span class="jc-gs">' + counter.settings.groupSeparator + '</span>' + html;
				}
			}
			
			if (char == 'f') {
				html = '<span class="jc-lf">' + counter.settings.leftFiller + '</span>' + html;
			} else {
				html = '<span class="jc-pp' + power + '">' + char + '</span>' + html;
			}

			power++;
		}

		power = 1;

		if (counter.settings.digitsOnRight > 0) {
			html = html + '<span class="jc-ds">' + counter.settings.decimalSeparator + '</span>';

			for (var i = integerPartLength + 1; i < numAsStr.length; i++) {
				html = html + '<span class="jc-pm' + (power++) + '">' + numAsStr.charAt(i) + '</span>';
			}
		}

		counter.element.innerHTML = html;
		counter.stepCounter++;
	}


	function createCounter(element, settings) {

		var counter = {};
		counter.element = element;
		counter.settings = settings;

		if (counter.element.getAttribute('data-inprogress') !== 'true') {
			counter.element.setAttribute('data-inprogress', 'true');
		} else {
			return;
		}

		for (var index in counter.settings) { 
			if (counter.settings.hasOwnProperty(index)) {
		        if (counter.element.hasAttribute( 'data-' + index.toLowerCase() )) {
		        	var attr = counter.element.getAttribute( 'data-' + index.toLowerCase() );

	        		switch (typeof globalSettings[index]) {
	        			case 'number':
	        				attr = Number(attr);
	        				break;
	        			case 'string':
	        				attr = String(attr);
	        				break;
	        			case 'boolean':
	        				attr = (attr === 'true' ? true : (attr == 'false' ? false : counter.settings[index]));
	        		}

					counter.settings[index] = attr;
				}
			}
		}

		if (typeof counter.settings.animation !== 'function') {
			counter.settings.animation = animations[counter.settings.animation];

			if (typeof counter.settings.animation !== 'function') {
				counter.settings.animation = animations['linear'];
			}
		}

		if (counter.settings.digitsOnRight < 0) {
			counter.settings.digitsOnRight = 0;
		}

		if (counter.settings.groupWidth < 1) {
			counter.settings.groupWidth = 1;
		}

		counter.steps = Math.ceil(counter.settings.updatesPerSec * counter.settings.duration / 1000);
		counter.stepCounter = 0;

		updateCounter(counter);

		if (!counter.settings.initializeOnly) {

			if (typeof counter.settings.onStart == 'function') {
				counter.settings.onStart(counter.element);
			}

			counter.interval = setInterval(function() {
				updateCounter(counter);

				if (counter.stepCounter > counter.steps) {
					clearInterval(counter.interval);

					if (typeof counter.settings.onEnd == 'function') {
						counter.settings.onEnd(counter.element);
					}

					counter.element.setAttribute('data-inprogress', 'false');
				}
			}, counter.settings.duration / counter.steps);
		} else {
			counter.element.setAttribute('data-inprogress', 'false');
		}
	};

	function sumObjects() {
		var result = {};

		for (var i = 0; i < arguments.length; i++) {
			for (var index in arguments[i]) { 
			    if (arguments[i].hasOwnProperty(index)) {
			        result[index] = arguments[i][index];
			    }
			}
		}

		return result;
	}


	function jsCounterFunction(elements, jsSettings) {
		if (typeof elements != 'object' || typeof jsSettings != 'object') {
			return;
		}

		if (elements.length > 1) {
			var settings = sumObjects(globalSettings, jsSettings);

			for (var i = 0; i < elements.length && elements[i].innerHTML !== undefined; i++) {
				createCounter(elements[i], sumObjects(settings));
			}
		} else if (elements.innerHTML !== undefined) {
			createCounter(elements, sumObjects(globalSettings, jsSettings));
		}
	}
	

	if (window.jQuery !== undefined) {
		jQuery.fn.jCounter = function(jsSettings) {

			if (this.length > 1) {
				var settings = sumObjects(globalSettings, jsSettings);

				return this.each(function(index, value) {
					createCounter(jQuery(value)[0], sumObjects(settings));
				});
			}

			if (this.length == 1) {
				createCounter(jQuery(this)[0], sumObjects(globalSettings, jsSettings));
			}

			return this;
		}
	}

	jCounter = jsCounterFunction;
})();
