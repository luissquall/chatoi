// Modules
var Chat = require('../lib/chat');

/**
 * Callbacks
 */
exports.beforeFilter = function(req, res, next) {
	res.locals.auth = req.session.auth;
	next();
};

/**
 * Pages
 */
exports.index = function(req, res) {
	var moment = require('moment');

	var sess = req.session,
		messages;

	if (sess.auth) {
		messages = Chat.findMessagesSince(sess.auth.accessDate);
		for (var index = 0, length = messages.length; index < length; index++) {
			messages[index].ago = moment(messages[index].created).fromNow();
		}
	}

	res.render('index', {
		messages: messages
	});
};

exports.about = function(req, res) {
	res.render('about');
};

exports.contact = function(req, res) {
	if (req.method == 'POST') {
		// Modules
		var nodemailer = require('nodemailer'),
			Handlebars = require('handlebars');

		var conf = require('../config/email.json'),
			app = require('../config/app.json'),
			transport = nodemailer.createTransport("SMTP", conf),
			htmlTemplate = Handlebars.compile("<h1>{{name}} wrote you:</h1><p>{{message}}</p>"),
			textTemplate = Handlebars.compile("{{name}} wrote you: {{message}}"),
			mailOptions;


		mailOptions = {
			from: app.contact.from,
			to: app.contact.to,
			subject: app.contact.subject,
			replyTo: req.body.email,
			text: textTemplate(req.body),
			html: htmlTemplate(req.body)
		}

		// Send mail
		transport.sendMail(mailOptions, function(error, response) {
			res.render('contact', {
				alert: {
					message: error ? error : response.message,
					type: error ? 'danger' : 'success'
				}
			});
		});
	} else {
		res.render('contact');
	}
};
exports.signout = function(req, res) {
	var sess = req.session;
	if (sess.auth) {
		Chat.removeUser(sess.auth.username)
		sess.destroy()
	}

	res.redirect('/');
};