var _ = require('underscore');

// getPeople retrieves the list of people from the database matching the email address of the user
Parse.Cloud.define('getPeople', function(request, response) {
	var currentUser = Parse.User.current();
	if (currentUser) {
		var query = new Parse.Query('_User');
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
		response.error('You must be logged in with admin permissions to add projects.');
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