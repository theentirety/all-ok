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
		query.ascending('updatedAt');
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

// getTimesByProject retrieves the list of times for the corresponding date range organized by projects
Parse.Cloud.define('getTimesByProject', function(request, response) {
	var currentUser = Parse.User.current();
	var dates = request.params.dates;
	if (currentUser) {
		var query = new Parse.Query('Times');
		var email = currentUser.attributes.email;
		email = email.substring(email.lastIndexOf('@'));
		query.endsWith('email', email);
		query.include('user');
		query.ascending('updatedAt');
		query.containedIn('date', dates);
		query.find({
			success: function(times) {
				var projectTimes = [];
				_.each(times, function(time) {
					var data = JSON.parse(time.attributes.data);
					var date = data.date;
					var user = time.attributes.user;
					_.each(data.projects, function(project) {
						project.date = date;
						project.user = user;
						projectTimes.push(project);
					});
				});
				var grouped = _.groupBy(projectTimes, function(entry) {
					return entry.id;
				});

				projectTimes = [];
				_.each(grouped, function(projects) {
					var data = {};
					data.projectId = projects[0].id;

					var groupedByUser = _.groupBy(projects, function(entry) {
						return entry.user.id;
					});

					data.users = [];

					_.each(groupedByUser, function(user) {
						var userObj = {
							user: user[0].user,
							times: []
						};

						var sortedUserTimes = _.sortBy(user, function(userEntry) {
							return userEntry.date;
						});

						_.each(sortedUserTimes, function(userEntry) {
							var time = {
								date: userEntry.date,
								percentage: userEntry.percentage
							};
							userObj.times.push(time);
						});
						data.users.push(userObj);
					});

					projectTimes.push(data);
				})
				response.success(projectTimes);
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