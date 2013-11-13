exports.index = function(req, res){
	res.render('index');
};

exports.about = function(req, res){
	res.render('about');
};

exports.contact = function(req, res){
	if (req.method == 'POST') {
		// Modules
		var nodemailer = require('nodemailer'),
			Handlebars = require('handlebars');

		var conf = require('../config/email.json'),
			transport = nodemailer.createTransport("SMTP", conf),
			htmlTemplate = Handlebars.compile("<h1>{{name}} wrote you:</h1><p>{{message}}</p>"),
			textTemplate = Handlebars.compile("{{name}} wrote you: {{message}}"),
			mailOptions;


		mailOptions = {
			from: "Luis <luissquall@gmail.com>",
			to: "luissquall@gmail.com",
			subject: "Chatoi Contact",
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