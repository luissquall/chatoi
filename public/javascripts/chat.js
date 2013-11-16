(function(window, document, undefined) {
	'use strict';

	var Chat = {
		socket: null,

		connect: function(url) {
			var templateHTML = $('#message-template').html().replace(/\[\[/g, '{{').replace(/\]\]/g, '}}'),
				template = Handlebars.compile(templateHTML),
				socket = io.connect(url),
				self = this;

			// Fired upon connecting
			socket.on('connect', function() {
				// Change chat window state
				$('#chat-panel')
					.removeClass('panel-info')
					.addClass('panel-success')
					.find('.panel-heading .panel-title').html('Connected');
				// Input message
				$('#input-message')
					.attr('disabled', false)
					.on('keypress', $.proxy(self._onInputMessageKeypress, self));
			});

			// Failed authorization
			socket.on('connect_failed', function (reason) {
				// Change chat window state
				$('#chat-panel')
					.removeClass('panel-info')
					.addClass('panel-danger')
					.find('.panel-heading .panel-title').html('Unable to connect: ' + reason);
			});

			// Fired upon receiving a message
			socket.on('message', function (data) {
				$('#chat-window .message-created').each(function(index) {
					var ago = moment($(this).attr('datetime')).fromNow();
					$(this).html(ago);
				});

				data.ago = moment(data.created).fromNow();
				$('#chat-window')
					.append(template(data))
					.scrollTop($('#chat-window')[0].scrollHeight);
			});

			this.socket = socket;
			this.template = template;
		},

		_onInputMessageKeypress: function(e) {
			var $target = $(e.currentTarget);

			if (e.which == 13) {
				this.socket.emit('message', {
					content: $target.val()
				});
				$target.val('');
			}
		}
	};

	window.chatoi.Chat = Chat;
}(window, window.document));