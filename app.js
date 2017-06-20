var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var expressSession = require('express-session');

require('dotenv').config()




// since host always come up with diffent names for the database name it is dynamically prefix
// default it to DB_
var prefix = process.env.DB_PREFIX || "DB_"
function getDBEnv(envName) {
	return process.env[prefix + envName];
}

var config = {
	db: {
		host: getDBEnv("HOST"),
		user: getDBEnv("USER"),
		password: getDBEnv("PASSWORD"),
		database: getDBEnv("DB"),
		connnectionLimit: getDBEnv("CONNECION_LIMIT") || 10,
	},
	port: process.env.HTTP_PORT || 3000,
	socketPort: process.env.SOCKET_PORT || 3100,
	googleOauth: {
		clientId: process.env.GOOGLEOAUTH_CLIENT_ID,
		clientSecret: process.env.GOOGLEOAUTH_CLIENT_SECRET
	},
	serverName: process.env.SERVERNAME,
	session: {
		secret: process.env.SESSION_SECRET
	},
	debug: true
}
// }
var mysql = require('mysql');




var mysqlPool = mysql.createPool(config.db);



var users = require('./modules/users.js')(mysqlPool, config);
var boards = require('./modules/Boards.js')(mysqlPool);
var categories = require('./modules/Categories.js')(mysqlPool);
var questions = require('./modules/Questions.js')(mysqlPool);
var fagskakManager = require('./modules/FagskakManager.js')(mysqlPool, questions);
// create a new lobby instance
var Lobbies = require('./modules/Lobbies');
var lobbies = new Lobbies();

/*---------------- SETUP SOCKET ----------------*/
sessionMiddleware = expressSession({
	secret: config.session.secret,
	saveUninitialized: false,
	resave: false
});

var app = express();

// var server = app.listen(config.socketPort);

// socket.use(function(socket, next) {
// 	// get user session 
// 	sessionMiddleware(socket.request, socket.request.res, next)
// });

// // make sure the user is logged in
// socket.use(users.requireSocketLogin);

// socket.sockets.on('connection', function(client) {
// 	// client.emit("log", {newsEvent:"GRAND NEWS"});

// 	client.on("log", function(log) {
// 		console.log("log (user: "+client.user.display_name+")", log)
// 	})
// });

/*---------------- SETUP ROUTES ----------------*/

var indexRoutes = require('./routes/index');
var usersRoutes = require('./routes/users')(users);
var lobbyRoutes = require('./routes/lobby')(users, lobbies, fagskakManager);
var lobbiesRoutes = require('./routes/lobbies')(users, lobbies, fagskakManager);
var authRoutes = require('./routes/auth')(users);
var questionRoutes = require('./routes/questions')(users, questions);
var fagskakRoutes = require('./routes/fagskak')(users, lobbies, fagskakManager);
var boardRoutes = require('./routes/board')(users, boards);
var categoriesRoutes = require('./routes/categories')(users, categories);











// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));




app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);


app.use('/', indexRoutes);
app.use('/users', usersRoutes);
app.use('/fagskak', fagskakRoutes);
app.use('/lobby', lobbyRoutes);
app.use('/lobbies', lobbiesRoutes)
app.use('/auth', authRoutes);
app.use('/questions', questionRoutes);
app.use('/boards', boardRoutes);
app.use('/categories', categoriesRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});


// øerror handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});


/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var http = require('http');

var server = http.createServer(app);


/*END OF HTTP SETUP */
/* START SOCKET SETUP */

var socket = require('socket.io')(server);

require("./sockets/lobbies.js")(users, socket, sessionMiddleware, lobbies);
require("./sockets/lobby.js")(users, socket, sessionMiddleware, lobbies);
require("./sockets/fagskak.js")(users, socket, sessionMiddleware, fagskakManager)

// module.exports = app;
module.exports = server;