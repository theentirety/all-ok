/**
 * scripts/people-details.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function PeopleDetails(app) {
	var self = this;

	var peopleDetails = app.myViewModel.peopleDetails = {};

	peopleDetails.person = ko.observable(null);
	peopleDetails.weeks = ko.observableArray([]);
	peopleDetails.totals = ko.observableArray([]);

	peopleDetails.getPerson = function(item) {
		peopleDetails.totals([]);
		for (var i = 0; i < app.myViewModel.people.numWeeks; i++) {
			var person = _.find(app.myViewModel.people.times()[i], function(obj) {
				return obj.attributes.user.id == item.attributes.user.id;
			});
			peopleDetails.totals.push(person);
		}

		peopleDetails.person(item);
	}

	peopleDetails.goBack = function() {
		app.goToView('people');
	}

	peopleDetails.getCompanyName = function(id) {
		var name = '';
		var project = _.find(app.myViewModel.selectProject.allProjects(), function(obj) {
			return obj.id == id;
		});

		if (typeof project === 'object') {
			name = project.attributes.company;
		}
		return name;
	}

	peopleDetails.getProjectName = function(id) {
		var name = '';
		var project = _.find(app.myViewModel.selectProject.allProjects(), function(obj) {
			return obj.id == id;
		});

		if (typeof project === 'object') {
			name = project.attributes.name;
		}
		return name;
	}

	return self;
}

module.exports = PeopleDetails;