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
				key = opts.key,
				self = this;

			nsp = io
				.of('/chat')
				.authorization(Auth.authorize(cookie, store, key))
				.on('connection', function (socket) {
					var session = socket.handshake.session,
						auth = session.auth;

					socket.on('message', function(data) {
						var message = {
							user: auth,
							content: data.content,
							created: moment().format()
						};

						self.addMessage(message);
						nsp.emit('message', message);
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
		delete users[username];
	},

	findUser: function(username) {
		return users[username];
	},

	addMessage: function(message) {
		message.createdTimestamp = moment(message.created).format('X');
		return messages.push(message);
	},

	findMessagesSince: function(datetime) {
		var from = -1,
			n = messages.length,
			results = [];

		for (var i = 0; i < n; i++) {
			if (messages[i].createdTimestamp >= datetime) {
				from = i;
				break;
			}
		}

		if (from > -1) {
			results = messages.slice(from);
		}

		return results;
	}
};

module.exports = Chat;