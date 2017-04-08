'use strict'

$(function() {
	var username = $('h2').text();

	var socket = io.connect();
	var notification = 0;

	$('#pay').click(function(e) {
		e.preventDefault();
		$('aside form').attr('data-mode', 'pay');
		$('li a').removeClass('selected').first().addClass('selected');
		$('input').val('');
		$('aside h1').html('<i class="fa fa-credit-card"></i><span>Pay Money</span>');
		$('aside').addClass('open');
	});

	$('#receive').click(function(e) {
		e.preventDefault();
		$('aside form').attr('data-mode', 'receive');
		$('li a').removeClass('selected').first().addClass('selected');
		$('input').val('');
		$('aside h1').html('<i class="fa fa-plus"></i><span>Receive Money</span>');
		$('aside').addClass('open');
	});

	$('#go').click(function(e) {
		e.preventDefault();
		socket.send('go');
	});

	$('#parking').click(function(e) {
		e.preventDefault();
		socket.send('parking');
	});

	$('#done').click(function(e) {
		e.preventDefault();
		$(this).parent().submit();
	});

	$('aside').click(function(e) {
		if(e.target == this) $(this).removeClass('open');
	});

	$('aside form').submit(function(e) {
		e.preventDefault();
		if ($('input').val()) {
			socket.emit($(this).attr('data-mode'), {
				player: $('li a.selected').attr('data-id'),
				value: parseInt($('input').val())
			});
			$('aside').removeClass('open');
		}
	})

	$('ul').on('click', 'li a', function(e) {
		e.preventDefault();
		if ($('aside form').attr('data-mode') == 'pay') {
			$('li a').removeClass('selected');
			$(this).addClass('selected');
		}
	});

	socket.on('balance', function(data) {
		$('h3').html('&pound;' + data.balance);

		if(data.message) {
			clearTimeout(notification);

			if($('#notification span').hasClass('show')) {
				$('#notification span').removeClass('show').one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
					$(this).html(data.message).addClass('show');
				});
			} else {
				$('#notification span').html(data.message).addClass('show');
			}

			notification = setTimeout(function() {
				$('#notification span').removeClass('show');
			}, 1500)
		}
	});

	socket.on('update', function(players) {
		$('li').slice(2).remove();

		players.forEach(function(player) {
			if(player.username != username) $('ul').append('<li><a data-id="' + player.id + '">' + player.username + '</a></li>');
		});
	});

	socket.on('connect', function() {
		socket.emit('register', username);
	});
});
