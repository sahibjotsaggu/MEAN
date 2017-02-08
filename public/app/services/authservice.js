angular.module('authService', [])

/*
auth factory to login and get information
inject $http for communicating with the API
inject $q to return promise objects
inject AuthToken to manage tokens
*/

.factory('Auth', function($http, $q, AuthToken) {
	var authFactory = {};

	// login the user
	authFactory.login = function(username, password) {
		return $http.post('/api/authenticate', {
			username: username,
			password: password
		})
		.success(function(data) {
			AuthToken.setToken(data.token);
			return data;
		});
	};

	// logout the user
	authFactory.logout = function() {
		AuthToken.setToken();
	};

	// check if a user is logged in
	authFactory.isLoggedIn = function() {
		if (AuthToken.getToken()) {
			return true;
		} else {
			return false;
		}
	};

	// get the logged in user
	authFactory.getUser = function() {
		if (AuthToken.getToken()) {
			return $http.get('/api/me');
		} else {
			return $q.reject({ message: 'User has no token.' });
		}
	};

	return authFactory;
})

/* 
factory for handling tokens
inject $window to store the token client-side
*/

.factory('AuthToken', function($window) {
	var authTokenFactory = {};
	// get the token from the local storage
	authTokenFactory.getToken = function() {
		return $window.localStorage.getItem('token');
	};

	// set token to local storage
	authTokenFactory.setToken = function(token) {
		if (token) {
			$window.localStorage.setItem('token', token);
		} else {
			$window.localStorage.removeItem('token');
		}
	}
	return authTokenFactory;
})

// application configuration to integrate token into requests

.factory('AuthInterceptor', function($q, $location, AuthToken) {
	var interceptorFactory = {};

	// attach the token to all HTTP requests
	interceptorFactory.request = function(config) {
		var token = AuthToken.getToken();
		if (token) {
			config.headers['x-access-token'] = token;
		}
		return config;
	};

	// errors received from the API
	interceptorFactory.responseError = function(response) {
		// 403 forbidden response
		if (response.status = 403) {
			AuthToken.setToken();
			$location.path('/login');
		}

		// return the errors from the server as a promise
		return $q.reject(response);
	};

	return interceptorFactory;
});
