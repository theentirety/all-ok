/**
 * scripts/save.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function Save(app) {
	var self = this;

	var save = app.myViewModel.save = {};

	save.show = ko.observable(false);
	save.success = ko.observable(false);
	save.error = ko.observable(false);
	save.saving = ko.observable(false);

	save.result = ko.observableArray();
	// save.done = ko.computed(function() {
	// 	var done = false;
	// 	for (var i = 0; i < save.result.length; i++) {
	// 		done = done || save.result[i];
	// 	}
	// 	return done;
	// });

	save.submit = function() {
		app.goToView('save');
		save.show(true);
		save.saving(true);
		var temp = {};
		var curWeek;
		// var numWeeks = app.myViewModel.rateWeek.weeks().length;

		var projects = [];
		_.each(app.myViewModel.selectProject.groups(), function(group) {
			_.each(group.attributes.projects(), function(project) {
				if (project.attributes.selected()) {
					var newProject = {
						id: project.id,
						percentage: project.attributes.percentage()
					}
					projects.push(newProject);
				}
			})
		});

		var date = moment(new Date()).startOf('isoweek').add('days', (app.myViewModel.selectProject.weekIndex() * 7)).format('YYYY, M, D');
		console.log(date)

		var data = {
			date: date,
			rating: app.myViewModel.notes.rating(),
			notes: app.myViewModel.notes.content(),
			projects: projects
		}

		Parse.Cloud.run('saveTime', {
			date: date,
			data: JSON.stringify(data)
		}, {
			success: function(data) {
				app.myViewModel.home.getTotalsAndRating();
				save.success(true);
			}, error: function(error) {
				console.log(error);
				save.error(true);
				save.reset();
			}
		});
	}

	save.tryAgain = function() {
		save.error(false);
		save.success(false);
		save.submit();
	}

	save.reset = function() {
		save.saving(false);
		save.show(false);
		save.error(false);
		save.success(false);
		app.goToView('home');
	}

	return self;
}

module.exports = Save;