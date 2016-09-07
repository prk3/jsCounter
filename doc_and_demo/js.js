$(document).ready(function() {
	var jsNeededConfig = [
		{
			animation: function(x, power) {
				return -1.6 * Math.pow(x, power) + 2.6 * x;
			}
		},
		{
			onStart: function(element) {
				//classic javascript styling
				element.style.color = '#ffbe00';
				element.style.fontWeight = 'bold';
			},

			onEnd: function(element) {
				//jQuery styling
				$(element).css({
					'text-shadow': '2px 2px 5px #ffbe00',
					'text-decoration': 'underline'
				});
			}
		}
	];

	$('.counter.initialize').jCounter({initializeOnly: true});

	$('.examples-button').on('click', function() {
		if ($(this).hasClass('clicked')) {
			$(this).removeClass('clicked');
		} else {
			$(this).addClass('clicked');
		}
	});

	$('.start-counter').on('click', function() {
		var counter = $(this).siblings('.counter');

		if (counter.hasClass('js-needed')) {
			counter.jCounter( jsNeededConfig[Number( counter.data('nr') )] );
		} else {
			counter.jCounter();
		}
	});
});