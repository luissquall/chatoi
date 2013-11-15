var chatoi = {
	users: {
		chatoi: {username: 'chatoi'}
	}
}

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
exports.signout = function(req, res){
	var sess = req.session;
	if (sess.auth) {
		delete chatoi.users[sess.auth.username];
		sess.destroy()
	}

	res.redirect('/');
};

/**
 * Services
 */

exports.authentication = function(req, res){
	// Modules
	var fs = require('fs'),
		path = require('path'),
		crypto = require('crypto');

	var data = req.body,
		image = req.files.image && req.files.image.size  ? req.files.image : null,
		body = {};

	// Username format
	if (!(/^[a-zA-Z0-9_]{1,8}$/.test(data.username))) {
		return res.json(400, {error: {code: 404, message: 'Username format invalid.'}})
	}
	// Username availability
	if (chatoi.users[data.username]) {
		return res.json(400, {error: {code: 404, message: 'Username taken.'}})
	}

	// Authenticate
	body = {
		code: 200,
		data: {
			username: data.username,
			image: '/images/users/avatar.png'
		}
	};

	if (image && /^image\//.test(image.headers['content-type'])) {
		var id = crypto.randomBytes(20).toString('hex'),
			extname = path.extname(image.originalFilename),
			filename = id + extname;

		// Copy image
		fs.rename(image.path, __dirname + '/../public/images/users/' + filename, function(err) {
			if (err) {
				return res.json(500, {error: {code: 500, message: 'Error renaming uploaded file'}});
			}

			body.data.image = '/images/users/' + filename;
			chatoi.users[data.username] = body.data;
			req.session.auth = body.data;
			res.json(body);
		});
	} else {
		chatoi.users[data.username] = body.data;
		req.session.auth = body.data;
		res.json(body);
	}
};