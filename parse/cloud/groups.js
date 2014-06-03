Parse.Cloud.define('saveGroup', function(request, response) {
	var currentUser = Parse.User.current();
	if (currentUser) {

		var Group = Parse.Object.extend('Groups');
		var group = new Group();

		group.set('name', request.params.name);
		group.set('email', currentUser.attributes.email);
		group.set('user', {
			__type: 'Pointer',
			className: '_User',
			objectId: currentUser.id
		});

		group.save().then(function() {
			var query = new Parse.Query('Groups');

			query.equalTo('user', {
				__type: 'Pointer',
				className: '_User',
				objectId: currentUser.id
			});
			query.ascending('name');
			return query.find();
		}).then(function(groups) {
			response.success(groups);
		}, function(error) {
			response.error(error);
		});

	} else {
		response.error('Not logged in.');
	}
});

// returns all the groups for the user if passed in, otherwise all groups for the company of the current user
Parse.Cloud.define('getGroups', function(request, response) {
	var currentUser = Parse.User.current();
	if (currentUser) {
		userId = null;
		if (request.params.userId) {
			userId = request.params.userId;
		}
		var query = new Parse.Query('Groups');

		if (userId) {
			query.equalTo('user', {
				__type: 'Pointer',
				className: '_User',
				objectId: userId
			});
		} else {
			var email = currentUser.attributes.email;
			email = email.substring(email.lastIndexOf('@'));
			query.endsWith('email', email);
			query.include('user');
		}

		query.ascending('name');

		query.find({
			success: function(groups) {
				response.success(groups)
			}, 
			error: function(error) {
				response.error(error);
			}
		});

	} else {
		response.error('Not logged in.');
	}
});