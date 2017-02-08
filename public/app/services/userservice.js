angular.module('userService', [])
.factory('User', function($http) {
	var userFactory = {};

	// get a specifc user
	userFactory.get = function(id) {
		return $http.get('/api/users/' + id);
	};

	// get all users
	userFactory.all = function() {
		return $http.get('/api/users/');
	};

	// create a new user
	userFactory.create = function(userData) {
		return $http.post('/api/users/', userData);
	};

	// update a specific user
	userFactory.update = function(id, userData) {
		return $http.put('/api/users/' + id, userData);
	};

	// delete a specific user
	userFactory.delete = function(id) {
		return $http.delete('/api/users/' + id);
	};

	return userFactory;
});