(function(window, document, undefined) {
	'use strict';

	var chatoi = window.chatoi;

	var IndexApp = {
		load: function() {
			$(document).ready($.proxy(this.init, this));
		},

		init: function() {
			$('#signin-btn').on('click', $.proxy(this._signinBtnClick, this));

			// Popovers
			$('#input-name').popover();
		},

		_signinBtnClick: function(e) {
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

				$('#app-alert').removeClass()
					.addClass('alert alert-danger')
					.html(data.error.message);
			});
		}
	};

	IndexApp.load();

	window.chatoi = IndexApp;
}(window, window.document));