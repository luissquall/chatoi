(function(window, document, undefined) {
	'use strict';

	var chatoi = window.chatoi,
		Chat = chatoi.Chat;

	var IndexApp = {
		load: function() {
			$(document).ready($.proxy(this.init, this));
		},

		init: function() {
			// Popovers
			$('#input-name').popover();

			// Events listeners
			$('#signin-btn').on('click', $.proxy(this._onSigninBtnClick, this));

			// Chat
			Chat.connect('http://localhost:3000/chat');
		},

		_onSigninBtnClick: function(e) {
			e.preventDefault();

			this.sendForm($('#signin-form')[0]);
		},

		sendForm: function(form) {
			var formData = new FormData(form);
			
			$.ajax(form.action, {
				type: form.method,
				contentType: false,
				data: formData,
				processData: false
			}).done(function(data, t) {
				window.location = '/';
			}).fail(function(jqXHR) {
				var data = jqXHR.responseJSON;

				$('#signin-status').removeClass()
					.addClass('alert alert-danger')
					.html(data.error.message);
			});
		}
	};

	IndexApp.load();

	window.chatoi = IndexApp;
}(window, window.document));