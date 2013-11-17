// WebSocket namespace
var nsp;
// Stores
var users,
	messages = [];


// Reserve some usernames
users = {
	chatoi: {username: 'chatoi'}
};

var Auth = {
	authorize: function (cookie, store, key) {
		return function(handshake, callback) {
			cookie(handshake, {}, function(err) {
				if (!err) {
					var sessionID = handshake.signedCookies[key];
					store.get(sessionID, function(err, session) {
						if (err || !session || !session.auth) {
							callback(null, false);
						} else {
							handshake.session = session;
							callback(null, true);
						}
					});
				} else {
					callback(null, false);
				}
			});
		};
	}
};

var Chat = {
	create: function(opts) {
		if (!nsp) {
			var io = require('socket.io').listen(opts.server),
				cookie = opts.cookie,
				store = opts.store,
				key = opts.key;

			nsp = io
				.of('/chat')
				.authorization(Auth.authorize(cookie, store, key))
				.on('connection', function (socket) {
					var session = socket.handshake.session,
						auth = session.auth;

					socket.on('message', function(data) {
						data.user = auth;
						data.created = moment().format();
						nsp.emit('message', data);
					});
				});

			this.opts = opts;
		}

		return nsp;
	},

	addUser: function(user) {
		users[user.username] = user;
	},

	removeUser: function(username) {
		delete users[user.username];
	},

	findUser: function(username) {
		return users[username];
	},

	addMessage: function() {
	},

	findMessagesSince: function(datetime) {
	}
};

module.exports = Chat;