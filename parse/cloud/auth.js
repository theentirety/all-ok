// saveUser updates the user profile
// required: displayName (string): the desired username
// required: email (string): the objectId of the user

Parse.Cloud.define('saveUser', function(request, response) {
	var currentUser = Parse.User.current();
	if (currentUser) {

		currentUser.set('displayName', request.params.displayName);
		currentUser.set('email', request.params.email);
		currentUser.save(null, {
			success: function(result) {
				response.success(result);
			},	
			error: function(error) {
				respon.error(error);
			}
		});

	} else {
		response.error('Not logged in.');
	}
});