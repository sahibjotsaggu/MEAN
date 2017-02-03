var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
const saltRounds = 10;

var UserSchema = new Schema({
	name: String,
	username: { 
		type: String, 
		required: true, 
		index: { 
			unique: true 
		} 
	},
	password: {
		type: String,
		required: true,
		select: false
	}
});

// hash the password before saving it
UserSchema.pre('save', function(next) {
	var user = this;
	if (!user.isModified('password')) {
		return next();
	}

	bcrypt.hash(user.password, saltRounds, function(err, hash) {
		if (err) {
			return next(err);
		}

		user.password = hash;
		next();
	});
});

// method for comparing user entered password with hashed password in the database
UserSchema.methods.comparePassword = function(password) {
	var user = this;
	bcrypt.compare(password, user.password, function(err, res) {
		if (err) {
			return err;
		}
		return res;
	});
};

module.exports = mongoose.model('User', UserSchema);