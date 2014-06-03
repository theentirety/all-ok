/**
 * scripts/header.js
 */

'use strict';

function Projects(app) {
	var self = this;

	var projects = app.myViewModel.projects = {};

	projects.show = ko.observable(false);
	projects.times = ko.observableArray();
	projects.weeks = ko.observableArray([]);

	projects.today = moment(new Date()).startOf('isoweek');
	projects.numWeeks = 3;

	projects.getDateColumnPosition = function(date) {
		var index = _.indexOf(app.myViewModel.projects.weeks(), date);
		return index;
	}

	projects.getCompanyName = function(id) {
		if (app.myViewModel.people.allProjects().length > 0) {
			var project = _.find(app.myViewModel.people.allProjects(), function(project) {
				return project.id == id;
			});
			return project.attributes.company;
		} else {
			return null;
		}
	}

	projects.getProjectName = function(id) {
		if (app.myViewModel.people.allProjects().length > 0) {
			var project = _.find(app.myViewModel.people.allProjects(), function(project) {
				return project.id == id;
			});
			return project.attributes.name;
		} else {
			return null;
		}
	}

	projects.init = function() {
		projects.times([]);
		projects.show(true);

		var dates = [];
		for (var i = 0; i < projects.numWeeks; i++) {
			dates.push(moment(projects.today).add('days', (i * 7)).format('YYYY, M, D'));
		}

		projects.weeks(dates);

		Parse.Cloud.run('getTimesByProject', {
			dates: dates
		}, {
			success: function(times) {
				projects.times(times);
			},
			error: function(error) {
				console.log(error);
			}
		});
	}

	// subscribe to the auth event to init the peoples
	app.myViewModel.auth.currentUser.subscribe(function(user) {
		if (user) {
			projects.init();
		}
	});

	// if already logged in and refresh the page init the peoples
	if (app.myViewModel.auth.currentUser()) {
		projects.init();
	}

	return self;
}

module.exports = Projects;