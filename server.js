var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var path = require('path');
var config = require('./config');
/* 
the following 11 lines are to fix the 
https://github.com/Automattic/mongoose/issues/4950
issue about mpromise deprecation.
*/
mongoose.Promise = global.Promise;

try {
	exec();
} catch (error) {
	console.error(error);
}

function exec() {
	mongoose.connect(config.database);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET', 'POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
	next();
});

app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen(config.port);
console.log('Magic happens on port ' + config.port);