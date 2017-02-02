var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var port = process.env.PORT || 8080;
var User = require('./app/models/user');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET', 'POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
	next();
});

app.use(morgan('dev'));

mongoose.Promise = global.Promise;
var db_url = 'mongodb://localhost:27017/MEAN';
mongoose.connect(db_url);

app.get('/', function(req, res) {
	res.send('Welcome to the home page!');
});

var apiRouter = express.Router();

// middleware to use for all requests
apiRouter.use(function(req, res, next) {
	console.log('a user has came to the app.');

	// more middleware to be added
	
	next();
});

apiRouter.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to the api!' });
});

apiRouter.route('/users').post(function(req, res) {
	var user = new User();
	user.name = req.body.name;
	user.username = req.body.username;
	user.password = req.body.password;
	user.save(function(err) {
		if (err) {
			if (err.code == 11000) {
				return res.json({
					success: false,
					message: 'A user with that username already exists.'
				});
			} else {
				return res.send(err);
			}
		}
		res.json( { message: 'User created!'} );
	});
});

app.use('/api', apiRouter);

app.listen(port);
console.log('Magic happens on port ' + port);