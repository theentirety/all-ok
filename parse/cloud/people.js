var _ = require('underscore');

// getPeople retrieves the list of people from the database matching the email address of the user
Parse.Cloud.define('getPeople', function(request, response) {
	var currentUser = Parse.User.current();
	var dates = request.params.dates;
	if (currentUser) {
		var query = new Parse.Query('Users');
		var email = currentUser.attributes.email;
		email = email.substring(email.lastIndexOf('@'));
		query.endsWith('email', email);
		query.ascending('displayName');
		query.find({
			success: function(people) {
				response.success(people);
			},
			error: function(error) {
				response.error(error);
			}
		});
	} else {
		response.error('You must be logged in.');
	}
});

// getTimes retrieves the list of times for the corresponding date range
Parse.Cloud.define('getTimes', function(request, response) {
	var currentUser = Parse.User.current();
	var dates = request.params.dates;
	if (currentUser) {
		var query = new Parse.Query('Times');
		var email = currentUser.attributes.email;
		email = email.substring(email.lastIndexOf('@'));
		query.endsWith('email', email);
		query.include('user');
		query.containedIn('date', dates);
		query.find({
			success: function(times) {
				response.success(times);
			},
			error: function(error) {
				response.error(error);
			}
		});
	} else {
		response.error('You must be logged in.');
	}
});

// updateAvatar updates the user profile picture with a base64 image
Parse.Cloud.define('updateAvatar', function(request, response) {
	var currentUser = Parse.User.current();
	if (currentUser) {
		currentUser.set('avatar', request.params.avatar);
		currentUser.save(null, {
			success: function(user) {
				response.success(user);
			},
			error: function(error) {
				response.error(error);
			}
		});
	}
});