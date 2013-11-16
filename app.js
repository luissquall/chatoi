/**
 * Module dependencies.
 */
var express = require('express');
	http = require('http'),
	path = require('path'),
	hbs = require('hbs'),
	moment = require('moment'),
	routes = require('./routes');

const 	SECRET = 'secret monkey',
		KEY = 'chatoi.sid';

var app = express(),
	cookie = express.cookieParser(SECRET),
	store = new express.session.MemoryStore(),
	server,
	io,
	chat;

// Views
hbs.registerPartials(__dirname + '/views/partials');

// All environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.multipart());
app.use(express.methodOverride());
app.use(cookie);
app.use(express.session({secret: SECRET, key: KEY, store: store}));
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// Development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

// Routes

// All
app.all('*', routes.beforeFilter);

// Pages
app.get('/', routes.index);
app.get('/about', routes.about);
app.get('/contact', routes.contact);
app.post('/contact', routes.contact);
app.get('/signout', routes.signout);

// Services
app.post('/authentication.json', routes.authentication);


// Create servers
server = http.createServer(app);
// WebSockets server
io = require('socket.io').listen(server);
// HTTP server
server.listen(app.get('port'), '0.0.0.0', function(){
	console.log('Express server listening on port ' + app.get('port'));
});

// Chat channel
chat = io
	.of('/chat')
	.authorization(function(handshake, callback) {
		cookie(handshake, {}, function(err) {
			if (!err) {
				var sessionID = handshake.signedCookies[KEY];
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
	})
	.on('connection', function (socket) {
		var session = socket.handshake.session,
			auth = session.auth;

		socket.on('message', function(data) {
			data.user = auth;
			data.created = moment().format();
			chat.emit('message', data);
		});
	});