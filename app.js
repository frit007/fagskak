var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var expressSession = require('express-session');

if(process.env) {

}
var status = require('dotenv').config()

if(status.error) {
	throw status.error
}

console.log(process.env);

// try{
// 	var config = require("./config.json");
// } catch(e){
var config = {
	// process.env
	db: {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE
	},
	port: process.env.HTTP_PORT | 3000,
	socketPort: process.env.SOCKET_PORT | 3100,
	googleOauth: {
		clientId: process.env.GOOGLEOAUTH_CLIENT_ID,
		clientSecret: process.env.GOOGLEOAUTH_CLIENT_SECRET
	},
	serverName: process.env.SERVERNAME,
	session: {
		secret: process.env.SESSION_SECRET
	}

}
// }
var mysql = require('mysql');

var connection = mysql.createConnection(config.db);

// connect to mysql
connection.connect();

var users = require('./modules/users.js')(connection, config);

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

var server = app.listen(config.socketPort);
var socket = require('socket.io')(server);

socket.use(function(socket, next) {
	// get user session 
	sessionMiddleware(socket.request, socket.request.res, next)
});

// make sure the user is logged in
socket.use(users.requireSocketLogin);

socket.sockets.on('connection', function(client) {
	// client.emit("log", {newsEvent:"GRAND NEWS"});

	client.on("log", function(log) {
		console.log("log (user: "+client.user.display_name+")", log)
	})
});
function goOn () {
	return "11";
}
socket.sockets.on('gamer', goOn);
socket.sockets.removeListener('gamer', goOn);

/*---------------- SETUP ROUTES ----------------*/

var indexRoutes = require('./routes/index');
var usersRoutes = require('./routes/users')(users);
var lobbyRoutes = require('./routes/lobby')(users, socket, sessionMiddleware, lobbies);
var lobbiesRoutes = require('./routes/lobbies')(users, socket, sessionMiddleware, lobbies);
var authRoutes = require('./routes/auth')(users);
var questionRoutes = require('./routes/questions')(users);
var fagskakRoutes = require('./routes/fagskak')(users);













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
app.use('/questions',questionRoutes);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});


// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});


module.exports = app;
