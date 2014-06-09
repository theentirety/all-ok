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

// getTimes retrieves the list of times for the corresponding date range for the currentUser (if passed in) or all projects in company
Parse.Cloud.define('getTimes', function(request, response) {
	var currentUser = Parse.User.current();
	var dates = request.params.dates;
	var userId = request.params.userId;
	if (currentUser) {
		var query = new Parse.Query('Times');

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
		}

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

// getTotalsAndRating retrieves totals, rating and notes for the current user for the passed in dates
Parse.Cloud.define('getTotalsAndRating', function(request, response) {
	var currentUser = Parse.User.current();
	if (currentUser) {
		var query = new Parse.Query('Times');
		query.containedIn('date', request.params.weeks);
		query.equalTo('user', {
			__type: 'Pointer',
			className: '_User',
			objectId: currentUser.id
		});
		query.find({
			success: function(weeks) {
				var totals = [];
				_.each(weeks, function(week) {
					var data = JSON.parse(week.attributes.data);
					var sum = 0;
					_.each(data.projects, function(project) {
						sum = sum + project.percentage;
					});
					var result = {
						week: data.date,
						total: sum > 0 ? sum : -1,
						rating: data.rating,
						notes: data.notes
					}
					totals.push(result);
				});

				response.success(_.sortBy(totals, function(entry) {
					return entry.week;
				}));
			},
			error: function(error) {
				response.error(error);
			}
		});
	} else {
		response.error('You must be logged.');
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

		var avatar = new Parse.File("avatar.png", { base64: request.params.avatar });
		avatar.save().then(function(image) {
			currentUser.set('avatar', image);
			currentUser.save();
		}).then(function() {
			response.success();
		}, function(error) {
			response.error(error);
		});
	}
});