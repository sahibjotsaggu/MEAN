var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var port = process.env.PORT || 8080;
mongoose.Promise = global.Promise;
var User = require('./app/models/user');
var jwt = require('jsonwebtoken');
var secret = 'thisismysecretpasswordthatnooneshouldknow';

try {
	exec();
} catch (error) {
	console.error(error);
}

function exec() {
	var db_url = 'mongodb://localhost:27017/MEAN';
	mongoose.connect(db_url);
}

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

app.get('/', function(req, res) {
	res.send('Welcome to the home page!');
});

var apiRouter = express.Router();

apiRouter.post('/authenticate', function(req, res) {
	User.findOne({
		username: req.body.username
	}).select('name username password').exec(function(err, user) {
		if (err) {
			throw err;
		}
		if (!user) {
			res.json({
				success: false,
				message: 'Authentication failed. User not found.'
			});
		} else if (user) {
			var validPassword = user.comparePassword(req.body.password);
			if (!validPassword) {
				res.json({
					success: false,
					message: 'Authentication failed. Wrong password.'
				});
			} else {
				var token = jwt.sign({
					name: user.name,
					username: user.username
				}, secret, {
					expiresIn: '24h'
				});

				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}
		}
	});
});

// middleware to use for all requests
apiRouter.use(function(req, res, next) {
	// checking header or url params or post params for the token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	if (token) {
		jwt.verify(token, secret, function(err, decoded) {
			if (err) {
				return res.status(403).send({
					success: false,
					message: 'Failed to authenticate token.'
				});
			} else {
				// token authenticated
				req.decoded = decoded;
				next();
			}
		});
	} else {
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});
	}
});

apiRouter.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to the api!' });
});

// create a new user
// get all users
apiRouter.route('/users')
	.post(function(req, res) {
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
			res.json({ message: 'User created!' });
		});
	})
	.get(function(req, res) {
		User.find(function(err, users) {
			if (err) {
				res.send(err);
			}
			res.json(users);
		});
	});

// get a specific user with user_id
// update specific user information
// delete specific user
apiRouter.route('/users/:user_id')
	.get(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err) {
				res.send(err);
			}
			res.json(user);
		});
	})
	.put(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err) {
				res.send(err);
			}

			if (req.body.name) {
				user.name = req.body.name;
			}

			if (req.body.username) {
				user.username = req.body.username;
			}

			if (req.body.password) {
				user.password = req.body.password;
			}

			user.save(function(err) {
				if (err) {
					res.send(err);
				}
				res.json({ message: 'User updated!' });
			});
		});
	})
	.delete(function(req, res) {
		User.remove({
			_id: req.params.user_id
		}, function(err, user) {
			if (err) {
				return res.send(err);
			}
			res.json({ message: 'User deleted!' });
		});
	});


app.use('/api', apiRouter);

app.listen(port);
console.log('Magic happens on port ' + port);