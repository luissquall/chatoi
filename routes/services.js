// Modules
var Chat = require('../lib/chat');

exports.authentication = function(req, res) {
	// Modules
	var fs = require('fs'),
		path = require('path'),
		crypto = require('crypto'),
		moment = require('moment');

	var data = req.body,
		image = req.files.image && req.files.image.size  ? req.files.image : null,
		body = {};

	// Username format
	if (!(/^[a-zA-Z0-9_]{1,8}$/.test(data.username))) {
		return res.json(400, {error: {code: 404, message: 'Username format invalid.'}})
	}
	// Username availability
	if (Chat.findUser(data.username)) {
		return res.json(400, {error: {code: 404, message: 'Username taken.'}})
	}

	// Authenticate
	body = {
		code: 200,
		data: {
			username: data.username,
			image: '/images/users/avatar.png',
			accessDate: moment().format('X')
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
			Chat.addUser(body.data);
			req.session.auth = body.data;
			res.json(body);
		});
	} else {
		Chat.addUser(body.data);
		req.session.auth = body.data;
		res.json(body);
	}
};